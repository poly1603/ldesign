/**
 * 搜索模块
 * 提供地址搜索和地理编码功能
 */

import type {
  ISearchModule,
  IMapEngine,
  SearchOptions,
  SearchResult,
  GeocodingOptions,
  LngLat
} from '../../types'

/**
 * 搜索模块实现
 */
export class SearchModule implements ISearchModule {
  readonly name = 'search'

  private mapEngine: IMapEngine | null = null
  private initialized = false
  private searchHistory: SearchResult[] = []
  private searchCache = new Map<string, { results: SearchResult[]; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5分钟缓存
  private abortController: AbortController | null = null

  /**
   * 初始化模块
   */
  async initialize(mapEngine: IMapEngine): Promise<void> {
    this.mapEngine = mapEngine
    this.initialized = true
  }

  /**
   * 销毁模块
   */
  destroy(): void {
    // 取消正在进行的请求
    if (this.abortController) {
      this.abortController.abort()
    }

    // 清理缓存和历史
    this.searchCache.clear()
    this.searchHistory = []

    this.mapEngine = null
    this.initialized = false
  }

  /**
   * 是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 搜索地点
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    if (!this.initialized) {
      throw new Error('Search module not initialized')
    }

    try {
      const accessToken = this.getAccessToken()
      const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(options.query) + '.json'

      const params = new URLSearchParams({
        access_token: accessToken,
        limit: (options.limit || 5).toString(),
        language: options.language || 'zh'
      })

      // 添加可选参数
      if (options.types && options.types.length > 0) {
        params.append('types', options.types.join(','))
      }

      if (options.proximity) {
        params.append('proximity', options.proximity.join(','))
      }

      if (options.bbox) {
        const bbox = [...options.bbox[0], ...options.bbox[1]]
        params.append('bbox', bbox.join(','))
      }

      if (options.country && options.country.length > 0) {
        params.append('country', options.country.join(','))
      }

      const response = await fetch(`${url}?${params}`)

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`)
      }

      const data = await response.json()

      return data.features.map((feature: any) => ({
        id: feature.id,
        place_name: feature.place_name,
        place_type: feature.place_type,
        center: feature.center,
        geometry: feature.geometry,
        context: feature.context || [],
        relevance: feature.relevance,
        properties: feature.properties || {}
      }))

    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 地理编码
   */
  async geocode(options: GeocodingOptions): Promise<SearchResult[]> {
    if (!options.address) {
      throw new Error('Address is required for geocoding')
    }

    return this.search({
      query: options.address,
      language: options.language,
      country: options.country,
      types: options.types,
      limit: 1
    })
  }

  /**
   * 反向地理编码
   */
  async reverseGeocode(lngLat: LngLat, options?: Partial<GeocodingOptions>): Promise<SearchResult[]> {
    if (!this.initialized) {
      throw new Error('Search module not initialized')
    }

    try {
      const accessToken = this.getAccessToken()
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat[0]},${lngLat[1]}.json`

      const params = new URLSearchParams({
        access_token: accessToken,
        limit: '1',
        language: options?.language || 'zh'
      })

      if (options?.types && options.types.length > 0) {
        params.append('types', options.types.join(','))
      }

      if (options?.country && options.country.length > 0) {
        params.append('country', options.country.join(','))
      }

      const response = await fetch(`${url}?${params}`)

      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`)
      }

      const data = await response.json()

      return data.features.map((feature: any) => ({
        id: feature.id,
        place_name: feature.place_name,
        place_type: feature.place_type,
        center: feature.center,
        geometry: feature.geometry,
        context: feature.context || [],
        relevance: feature.relevance,
        properties: feature.properties || {}
      }))

    } catch (error) {
      throw new Error(`Reverse geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 搜索建议（自动补全）
   */
  async suggest(query: string, options?: Partial<SearchOptions>): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
      return []
    }

    return this.search({
      query,
      limit: 5,
      ...options
    })
  }

  /**
   * 搜索附近的地点
   */
  async searchNearby(center: LngLat, options?: Partial<SearchOptions & { radius?: number }>): Promise<SearchResult[]> {
    const radius = options?.radius || 1000 // 默认1公里

    // 计算边界框
    const lat = center[1]
    const lng = center[0]
    const latOffset = radius / 111320 // 1度纬度约等于111320米
    const lngOffset = radius / (111320 * Math.cos(lat * Math.PI / 180))

    const bbox: [LngLat, LngLat] = [
      [lng - lngOffset, lat - latOffset],
      [lng + lngOffset, lat + latOffset]
    ]

    return this.search({
      query: options?.query || '',
      proximity: center,
      bbox,
      types: options?.types,
      language: options?.language,
      country: options?.country,
      limit: options?.limit || 10
    })
  }

  /**
   * 获取搜索建议
   */
  async getSuggestions(query: string, options?: Partial<SearchOptions>): Promise<SearchResult[]> {
    if (query.length < 2) {
      return []
    }

    // 检查缓存
    const cacheKey = `suggestions:${query}:${JSON.stringify(options)}`
    const cached = this.searchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.results
    }

    try {
      // 取消之前的请求
      if (this.abortController) {
        this.abortController.abort()
      }
      this.abortController = new AbortController()

      const results = await this.search({
        query,
        autocomplete: true,
        limit: 5,
        ...options
      })

      // 缓存结果
      this.searchCache.set(cacheKey, {
        results,
        timestamp: Date.now()
      })

      return results
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return []
      }
      throw error
    }
  }

  /**
   * 批量地理编码
   */
  async batchGeocode(addresses: string[], options?: Partial<GeocodingOptions>): Promise<SearchResult[][]> {
    const results: SearchResult[][] = []

    // 分批处理，避免API限制
    const batchSize = 5
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      const batchPromises = batch.map(address =>
        this.geocode(address, options).catch(() => [])
      )

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // 添加延迟避免API限制
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return results
  }

  /**
   * 批量反向地理编码
   */
  async batchReverseGeocode(coordinates: LngLat[], options?: Partial<GeocodingOptions>): Promise<SearchResult[][]> {
    const results: SearchResult[][] = []

    // 分批处理
    const batchSize = 5
    for (let i = 0; i < coordinates.length; i += batchSize) {
      const batch = coordinates.slice(i, i + batchSize)
      const batchPromises = batch.map(coord =>
        this.reverseGeocode(coord, options).catch(() => [])
      )

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // 添加延迟
      if (i + batchSize < coordinates.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return results
  }

  /**
   * 获取搜索历史
   */
  getSearchHistory(): SearchResult[] {
    return [...this.searchHistory]
  }

  /**
   * 清除搜索历史
   */
  clearSearchHistory(): void {
    this.searchHistory = []
  }

  /**
   * 清除搜索缓存
   */
  clearSearchCache(): void {
    this.searchCache.clear()
  }

  /**
   * 取消当前搜索
   */
  cancelCurrentSearch(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  /**
   * 获取搜索统计信息
   */
  getSearchStats(): {
    historyCount: number
    cacheSize: number
    cacheHitRate: number
  } {
    return {
      historyCount: this.searchHistory.length,
      cacheSize: this.searchCache.size,
      cacheHitRate: 0 // 简化实现，实际应该跟踪缓存命中率
    }
  }

  /**
   * 添加到搜索历史
   */
  private addToHistory(result: SearchResult): void {
    // 避免重复
    const existingIndex = this.searchHistory.findIndex(
      item => item.place_name === result.place_name
    )

    if (existingIndex > -1) {
      this.searchHistory.splice(existingIndex, 1)
    }

    // 添加到开头
    this.searchHistory.unshift(result)

    // 限制历史记录数量
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(0, 50)
    }
  }

  /**
   * 获取访问令牌
   */
  private getAccessToken(): string {
    // 从地图实例获取访问令牌
    const mapInstance = this.mapEngine?.getMapInstance()
    if (mapInstance && mapInstance.accessToken) {
      return mapInstance.accessToken
    }

    // 从全局变量获取
    if ((window as any).mapboxgl?.accessToken) {
      return (window as any).mapboxgl.accessToken
    }

    throw new Error('Mapbox access token not found')
  }
}
