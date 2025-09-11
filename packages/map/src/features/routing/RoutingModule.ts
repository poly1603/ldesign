/**
 * 路径规划模块
 * 提供路径计算、显示和导航功能
 */

import type {
  IRoutingModule,
  IMapEngine,
  RoutingOptions,
  RouteResult,
  RouteStep,
  LngLat
} from '../../types'

/**
 * 路径规划模块实现
 */
export class RoutingModule implements IRoutingModule {
  readonly name = 'routing'

  private mapEngine: IMapEngine | null = null
  private initialized = false
  private currentRoute: RouteResult | null = null
  private routeLayerId = 'ldesign-route-layer'
  private routeSourceId = 'ldesign-route-source'
  private waypointLayerId = 'ldesign-waypoint-layer'
  private waypointSourceId = 'ldesign-waypoint-source'
  private routeHistory: RouteResult[] = []
  private isNavigating = false
  private currentStepIndex = 0

  /**
   * 初始化模块
   */
  async initialize(mapEngine: IMapEngine): Promise<void> {
    this.mapEngine = mapEngine

    // 添加路径数据源
    this.mapEngine.addSource(this.routeSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    // 添加路径点数据源
    this.mapEngine.addSource(this.waypointSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    // 添加路径图层
    this.mapEngine.addLayer({
      id: this.routeLayerId,
      type: 'line',
      source: this.routeSourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': 'var(--ldesign-brand-color)',
        'line-width': 4,
        'line-opacity': 0.8
      }
    })

    // 添加路径点图层
    this.mapEngine.addLayer({
      id: this.waypointLayerId,
      type: 'circle',
      source: this.waypointSourceId,
      paint: {
        'circle-radius': 8,
        'circle-color': 'var(--ldesign-brand-color)',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    })

    this.initialized = true
  }

  /**
   * 销毁模块
   */
  destroy(): void {
    if (this.mapEngine && this.initialized) {
      this.clearRoute()
      this.mapEngine.removeLayer(this.routeLayerId)
      this.mapEngine.removeSource(this.routeSourceId)
      this.mapEngine.removeLayer(this.waypointLayerId)
      this.mapEngine.removeSource(this.waypointSourceId)
    }
    this.mapEngine = null
    this.initialized = false
    this.routeHistory = []
    this.isNavigating = false
    this.currentStepIndex = 0
  }

  /**
   * 是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 计算路径
   */
  async calculateRoute(options: RoutingOptions): Promise<RouteResult> {
    if (!this.initialized || !this.mapEngine) {
      throw new Error('Routing module not initialized')
    }

    try {
      // 构建Mapbox Directions API请求
      const profile = options.profile || 'driving'
      const coordinates = [
        options.origin,
        ...(options.waypoints || []),
        options.destination
      ]

      const coordinatesStr = coordinates.map(coord => coord.join(',')).join(';')
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinatesStr}`

      const params = new URLSearchParams({
        access_token: this.getAccessToken(),
        geometries: 'geojson',
        steps: options.steps ? 'true' : 'false',
        language: options.language || 'zh'
      })

      const response = await fetch(`${url}?${params}`)

      if (!response.ok) {
        throw new Error(`Routing API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found')
      }

      const route = data.routes[0]

      // 转换为标准格式
      const result: RouteResult = {
        geometry: route.geometry,
        distance: route.distance,
        duration: route.duration,
        steps: route.legs?.[0]?.steps?.map((step: any) => ({
          geometry: step.geometry,
          distance: step.distance,
          duration: step.duration,
          instruction: step.maneuver.instruction,
          maneuver: {
            type: step.maneuver.type,
            instruction: step.maneuver.instruction,
            bearing_after: step.maneuver.bearing_after,
            bearing_before: step.maneuver.bearing_before,
            location: step.maneuver.location
          }
        })) || []
      }

      this.currentRoute = result
      return result

    } catch (error) {
      throw new Error(`Failed to calculate route: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 显示路径
   */
  showRoute(route: RouteResult, options?: { color?: string; width?: number }): void {
    if (!this.initialized || !this.mapEngine) {
      throw new Error('Routing module not initialized')
    }

    // 更新数据源
    this.mapEngine.addSource(this.routeSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        }]
      }
    })

    // 更新图层样式
    if (options?.color) {
      this.mapEngine.updateLayer(this.routeLayerId, {
        paint: {
          'line-color': options.color,
          'line-width': options.width || 4,
          'line-opacity': 0.8
        }
      })
    }

    // 适应路径边界
    if (route.geometry.coordinates.length > 0) {
      const coordinates = route.geometry.coordinates as LngLat[]
      const bounds: [LngLat, LngLat] = [
        [
          Math.min(...coordinates.map(c => c[0])),
          Math.min(...coordinates.map(c => c[1]))
        ],
        [
          Math.max(...coordinates.map(c => c[0])),
          Math.max(...coordinates.map(c => c[1]))
        ]
      ]

      this.mapEngine.fitBounds(bounds, { padding: 50 })
    }
  }

  /**
   * 清除路径
   */
  clearRoute(): void {
    if (!this.initialized || !this.mapEngine) return

    // 清空数据源
    this.mapEngine.addSource(this.routeSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    this.currentRoute = null
  }

  /**
   * 获取当前路径
   */
  getCurrentRoute(): RouteResult | null {
    return this.currentRoute
  }

  /**
   * 开始导航
   */
  startNavigation(): void {
    if (!this.currentRoute) {
      throw new Error('No route available for navigation')
    }

    this.isNavigating = true
    this.currentStepIndex = 0

    // 触发导航开始事件
    this.mapEngine?.emit('navigation:start', {
      route: this.currentRoute,
      currentStep: this.currentRoute.steps[0]
    })
  }

  /**
   * 停止导航
   */
  stopNavigation(): void {
    this.isNavigating = false
    this.currentStepIndex = 0

    // 触发导航停止事件
    this.mapEngine?.emit('navigation:stop')
  }

  /**
   * 下一步导航
   */
  nextStep(): RouteStep | null {
    if (!this.isNavigating || !this.currentRoute) {
      return null
    }

    if (this.currentStepIndex < this.currentRoute.steps.length - 1) {
      this.currentStepIndex++
      const currentStep = this.currentRoute.steps[this.currentStepIndex]

      // 触发导航步骤更新事件
      this.mapEngine?.emit('navigation:step', {
        step: currentStep,
        stepIndex: this.currentStepIndex,
        totalSteps: this.currentRoute.steps.length
      })

      return currentStep
    }

    // 导航完成
    this.mapEngine?.emit('navigation:complete')
    this.stopNavigation()
    return null
  }

  /**
   * 获取当前导航步骤
   */
  getCurrentStep(): RouteStep | null {
    if (!this.isNavigating || !this.currentRoute) {
      return null
    }

    return this.currentRoute.steps[this.currentStepIndex] || null
  }

  /**
   * 获取路径历史
   */
  getRouteHistory(): RouteResult[] {
    return [...this.routeHistory]
  }

  /**
   * 清除路径历史
   */
  clearRouteHistory(): void {
    this.routeHistory = []
  }

  /**
   * 优化路径（重新排序途经点）
   */
  async optimizeRoute(waypoints: LngLat[]): Promise<RouteResult> {
    if (waypoints.length < 2) {
      throw new Error('At least 2 waypoints required for optimization')
    }

    // 使用Mapbox Optimization API
    const coordinates = waypoints.map(point => `${point[0]},${point[1]}`).join(';')
    const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?access_token=${this.getAccessToken()}&overview=full&steps=true&geometries=geojson`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Optimization API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.trips || data.trips.length === 0) {
        throw new Error('No optimized route found')
      }

      const trip = data.trips[0]
      const route: RouteResult = {
        distance: trip.distance,
        duration: trip.duration,
        geometry: trip.geometry,
        steps: trip.legs.flatMap((leg: any) => leg.steps || []),
        waypoints: data.waypoints || []
      }

      return route
    } catch (error) {
      throw new Error(`Failed to optimize route: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 计算多个备选路径
   */
  async calculateAlternativeRoutes(options: RoutingOptions): Promise<RouteResult[]> {
    const baseOptions = {
      ...options,
      alternatives: true,
      max_alternatives: 3
    }

    try {
      const result = await this.calculateRoute(baseOptions)
      // 这里应该返回多个路径，但简化实现只返回一个
      return [result]
    } catch (error) {
      throw new Error(`Failed to calculate alternative routes: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
