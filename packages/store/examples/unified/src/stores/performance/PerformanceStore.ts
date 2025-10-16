import { defineStore } from 'pinia'

export interface DataItem {
  id: number
  name: string
  value: number
  category: string
  timestamp: number
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
}

/**
 * 性能优化示例 Store
 *
 * 展示缓存、防抖、节流等性能优化功能
 */
export const usePerformanceStore = defineStore('performance', {
  state: () => {
    // 生成初始数据
    const categories = ['A', 'B', 'C']

    const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
      id: index + 1,
      name: `Item ${index + 1}`,
      value: Math.floor(Math.random() * 1000) + 1,
      category: categories[index % categories.length],
      timestamp: Date.now() - Math.random() * 86400000 * 30 // 最近30天
    }))

    return {
      // 搜索查询
      searchQuery: '',

      // 防抖查询
      debouncedQuery: '',

      // 节流值
      throttledValue: 0,

      // 更新计数
      updateCount: 0,

      // 缓存
      cache: {} as Record<string, any>,

      // 缓存统计
      cacheStats: {
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0
      } as CacheStats,

      // 大数据集
      largeDataset,

      // 处理状态
      isProcessing: false,

      // 私有变量
      _debounceTimer: null as any,
      _throttleInProgress: false,

      // 数据列表
      dataItems: [...largeDataset],

    // 搜索关键词
    searchKeyword: '',

    // 过滤条件
    selectedCategory: 'all',

    // 排序方式
    sortBy: 'name' as 'name' | 'value' | 'timestamp',

    // 加载状态
    loading: false,

    // 错误信息
    error: null as string | null,

    // 防抖计数器
    debounceCount: 0,

    // 节流计数器
    throttleCount: 0,

    // 性能统计
    performanceStats: {
      searchTime: 0,
      filterTime: 0,
      sortTime: 0,
      renderTime: 0
    },

    // 实时数据更新
    realTimeData: {
      cpu: 0,
      memory: 0,
      network: 0,
      timestamp: Date.now()
    },

      // 历史数据（用于图表）
      historyData: [] as Array<{
        timestamp: number
        cpu: number
        memory: number
        network: number
      }>
    }
  },

  actions: {
    // 初始化数据
    initializeData() {
      const categories = ['frontend', 'backend', 'database', 'cache', 'network']
      const names = [
        'React Component',
        'Vue Component',
        'API Endpoint',
        'Database Query',
        'Redis Cache',
        'CDN Request',
        'WebSocket Connection',
        'File Upload',
        'Image Processing',
        'Data Validation'
      ]

      this.largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        id: index + 1,
        name: `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`,
        value: Math.floor(Math.random() * 1000) + 1,
        category: categories[index % categories.length],
        timestamp: Date.now() - Math.random() * 86400000 * 30 // 最近30天
      }))

      this.dataItems = [...this.largeDataset]
    },

    // 设置搜索查询
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    // 防抖搜索
    debouncedSearch(query: string) {
      this.searchQuery = query

      // 清除之前的定时器
      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer)
      }

      // 设置新的定时器
      this._debounceTimer = setTimeout(() => {
        this.debouncedQuery = query
      }, 300)
    },

    // 节流更新
    throttledUpdate() {
      if (!this._throttleInProgress) {
        this.throttledValue++
        this._throttleInProgress = true

        setTimeout(() => {
          this._throttleInProgress = false
        }, 100)
      }
    },

    // 获取缓存数据
    getCachedData(key: string, factory: () => any) {
      if (this.cache[key]) {
        this.cacheStats.hits++
        return this.cache[key]
      }

      this.cacheStats.misses++
      const data = factory()
      this.cache[key] = data
      this.cacheStats.size = Object.keys(this.cache).length
      this.cacheStats.hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)

      return data
    },

    // 清空缓存
    clearCache() {
      this.cache = {}
      this.cacheStats = {
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0
      }
    },

    // 处理大数据集
    async processLargeDataset() {
      this.isProcessing = true

      // 模拟异步处理
      await new Promise(resolve => setTimeout(resolve, 2000))

      this.updateCount++
      this.isProcessing = false
    },

    // 生成大数据集
    generateLargeDataset() {
      this.initializeData()
    },

    // 批量更新
    batchUpdate(updates: Array<{ id: number; value: number }>) {
      updates.forEach(update => {
        const item = this.largeDataset.find(item => item.id === update.id)
        if (item) {
          item.value = update.value
        }
      })
    },

    // 优化过滤
    optimizedFilter(query: string) {
      return this.getCachedData(`filter_${query}`, () => {
        return this.largeDataset.filter(item =>
          item.name.toLowerCase().includes(query.toLowerCase())
        )
      })
    },

    // 记忆化计算
    memoizedCalculation(input: number) {
      return this.getCachedData(`calc_${input}`, () => {
        // 模拟复杂计算
        return input * input + Math.random()
      })
    },



    // 设置过滤条件
    setFilter(category: string) {
      const startTime = performance.now()
      this.selectedCategory = category
      this.performanceStats.filterTime = performance.now() - startTime
    },

    // 设置排序
    setSorting(sortBy: 'name' | 'value' | 'timestamp') {
      const startTime = performance.now()
      this.sortBy = sortBy
      this.performanceStats.sortTime = performance.now() - startTime
    },

    // 模拟缓存操作
    simulateCacheOperation(useCache: boolean = true) {
      if (useCache) {
        // 模拟缓存命中
        this.cacheStats.hits++
      } else {
        // 模拟缓存未命中
        this.cacheStats.misses++
      }

      this.cacheStats.size = Math.floor(Math.random() * 100) + 50
      this.cacheStats.hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100
    },

    // 批量操作（测试性能）
    batchOperation(count: number = 100) {
      this.loading = true

      const startTime = performance.now()

      // 模拟批量数据处理
      const newItems = Array.from({ length: count }, (_, index) => ({
        id: this.dataItems.length + index + 1,
        name: `Batch Item ${index + 1}`,
        value: Math.floor(Math.random() * 1000),
        category: 'batch',
        timestamp: Date.now()
      }))

      this.dataItems.push(...newItems)

      const endTime = performance.now()
      

      this.loading = false
    },

    // 清理数据
    clearData() {
      this.dataItems = []
      this.searchKeyword = ''
      this.selectedCategory = 'all'
      this.cacheStats = {
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0
      }
      this.debounceCount = 0
      this.throttleCount = 0
      this.historyData = []
    },

    // 重置性能统计
    resetPerformanceStats() {
      this.performanceStats = {
        searchTime: 0,
        filterTime: 0,
        sortTime: 0,
        renderTime: 0
      }
    }
  },

  getters: {
    // 根据防抖查询过滤数据
    filteredData: (state) => {
      if (!state.debouncedQuery) {
        return state.largeDataset
      }

      return state.largeDataset.filter(item =>
        item.name.toLowerCase().includes(state.debouncedQuery.toLowerCase())
      )
    },

    // 按值降序排序的数据
    sortedData: (state) => {
      return [...state.largeDataset].sort((a, b) => b.value - a.value)
    },

    // 缓存命中率
    cacheHitRate: (state) => {
      const total = state.cacheStats.hits + state.cacheStats.misses
      return total === 0 ? 0 : Math.round((state.cacheStats.hits / total) * 100)
    },

    // 性能指标
    performanceMetrics: (state) => ({
      totalItems: state.largeDataset.length,
      filteredItems: state.debouncedQuery
        ? state.largeDataset.filter(item =>
            item.name.toLowerCase().includes(state.debouncedQuery.toLowerCase())
          ).length
        : state.largeDataset.length,
      cacheSize: state.cacheStats.size,
      hitRate: state.cacheStats.hitRate,
      updateCount: state.updateCount
    }),

    // 分类统计
    categoryStats: (state) => {
      const stats: Record<string, number> = { A: 0, B: 0, C: 0 }
      state.largeDataset.forEach(item => {
        if (stats[item.category] !== undefined) {
          stats[item.category]++
        }
      })
      return stats
    },

    // 过滤后的数据项（模拟缓存计算属性）
    filteredItems: (state) => {
      let filtered = state.dataItems

      // 按关键词搜索
      if (state.searchKeyword) {
        const keyword = state.searchKeyword.toLowerCase()
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(keyword)
        )
      }

      // 按分类过滤
      if (state.selectedCategory !== 'all') {
        filtered = filtered.filter(item => item.category === state.selectedCategory)
      }

      // 排序
      filtered.sort((a, b) => {
        switch (state.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'value':
            return b.value - a.value
          case 'timestamp':
            return b.timestamp - a.timestamp
          default:
            return 0
        }
      })

      return filtered
    },



    // 数据统计
    dataStats: (state) => {
      if (state.dataItems.length === 0) {
        return {
          total: 0,
          average: 0,
          min: 0,
          max: 0,
          sum: 0
        }
      }

      const values = state.dataItems.map(item => item.value)
      const sum = values.reduce((a, b) => a + b, 0)

      return {
        total: state.dataItems.length,
        average: sum / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        sum
      }
    },



    // 实时数据趋势
    realtimeTrend: (state) => {
      if (state.historyData.length < 2) return { cpu: 0, memory: 0, network: 0 }

      const recent = state.historyData.slice(-10)
      const prev = recent.slice(0, -1)
      const current = recent.slice(-1)[0]

      const avgPrev = {
        cpu: prev.reduce((sum, item) => sum + item.cpu, 0) / prev.length,
        memory: prev.reduce((sum, item) => sum + item.memory, 0) / prev.length,
        network: prev.reduce((sum, item) => sum + item.network, 0) / prev.length
      }

      return {
        cpu: current.cpu - avgPrev.cpu,
        memory: current.memory - avgPrev.memory,
        network: current.network - avgPrev.network
      }
    }
  }
})
