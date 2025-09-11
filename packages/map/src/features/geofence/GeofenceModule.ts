/**
 * 地理围栏模块
 * 提供地理围栏创建、管理和事件监听功能
 */

import type {
  IGeofenceModule,
  IMapEngine,
  GeofenceOptions,
  GeofenceEvent,
  LngLat
} from '../../types'

/**
 * 地理围栏模块实现
 */
export class GeofenceModule implements IGeofenceModule {
  readonly name = 'geofence'

  private mapEngine: IMapEngine | null = null
  private initialized = false
  private geofences = new Map<string, GeofenceOptions>()
  private eventCallbacks: Array<(event: GeofenceEvent) => void> = []
  private sourceId = 'ldesign-geofence-source'
  private layerId = 'ldesign-geofence-layer'
  private strokeLayerId = 'ldesign-geofence-stroke-layer'
  private labelLayerId = 'ldesign-geofence-label-layer'
  private trackedPoints = new Map<string, { point: LngLat; insideGeofences: Set<string> }>()
  private monitoringInterval: number | null = null

  /**
   * 初始化模块
   */
  async initialize(mapEngine: IMapEngine): Promise<void> {
    this.mapEngine = mapEngine

    // 添加地理围栏数据源
    this.mapEngine.addSource(this.sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    // 添加地理围栏填充图层
    this.mapEngine.addLayer({
      id: this.layerId,
      type: 'fill',
      source: this.sourceId,
      paint: {
        'fill-color': ['get', 'fillColor'],
        'fill-opacity': ['get', 'fillOpacity']
      }
    })

    // 添加地理围栏边框图层
    this.mapEngine.addLayer({
      id: this.strokeLayerId,
      type: 'line',
      source: this.sourceId,
      paint: {
        'line-color': ['get', 'strokeColor'],
        'line-width': ['get', 'strokeWidth'],
        'line-opacity': 0.8
      }
    })

    // 添加地理围栏标签图层
    this.mapEngine.addLayer({
      id: this.labelLayerId,
      type: 'symbol',
      source: this.sourceId,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Regular'],
        'text-size': 14,
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#333333',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    })

    // 添加边框图层
    this.mapEngine.addLayer({
      id: `${this.layerId}-stroke`,
      type: 'line',
      source: this.sourceId,
      paint: {
        'line-color': ['get', 'strokeColor'],
        'line-width': ['get', 'strokeWidth'],
        'line-opacity': ['get', 'strokeOpacity']
      }
    })

    this.initialized = true
  }

  /**
   * 销毁模块
   */
  destroy(): void {
    if (this.mapEngine && this.initialized) {
      this.mapEngine.removeLayer(`${this.layerId}-stroke`)
      this.mapEngine.removeLayer(this.layerId)
      this.mapEngine.removeSource(this.sourceId)
    }

    this.geofences.clear()
    this.eventCallbacks = []
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
   * 添加围栏
   */
  addGeofence(geofence: GeofenceOptions): void {
    if (!this.initialized || !this.mapEngine) {
      throw new Error('Geofence module not initialized')
    }

    // 设置默认样式
    const defaultStyle = {
      fillColor: 'var(--ldesign-brand-color)',
      fillOpacity: 0.2,
      strokeColor: 'var(--ldesign-brand-color)',
      strokeWidth: 2,
      strokeOpacity: 0.8
    }

    const finalGeofence: GeofenceOptions = {
      ...geofence,
      style: { ...defaultStyle, ...geofence.style }
    }

    this.geofences.set(geofence.id, finalGeofence)
    this.updateGeofenceLayer()
  }

  /**
   * 移除围栏
   */
  removeGeofence(id: string): void {
    this.geofences.delete(id)
    this.updateGeofenceLayer()
  }

  /**
   * 更新围栏
   */
  updateGeofence(id: string, options: Partial<GeofenceOptions>): void {
    const existing = this.geofences.get(id)
    if (existing) {
      const updated = {
        ...existing,
        ...options,
        style: { ...existing.style, ...options.style }
      }
      this.geofences.set(id, updated)
      this.updateGeofenceLayer()
    }
  }

  /**
   * 检查点是否在围栏内
   */
  isPointInGeofence(lngLat: LngLat, geofenceId: string): boolean {
    const geofence = this.geofences.get(geofenceId)
    if (!geofence) return false

    return this.pointInPolygon(lngLat, geofence.geometry)
  }

  /**
   * 获取围栏
   */
  getGeofence(id: string): GeofenceOptions | undefined {
    return this.geofences.get(id)
  }

  /**
   * 获取所有围栏
   */
  getGeofences(): GeofenceOptions[] {
    return Array.from(this.geofences.values())
  }

  /**
   * 监听围栏事件
   */
  onGeofenceEvent(callback: (event: GeofenceEvent) => void): void {
    this.eventCallbacks.push(callback)
  }

  /**
   * 检查点是否进入或离开围栏
   */
  checkGeofenceEvents(lngLat: LngLat, previousLngLat?: LngLat): void {
    if (!previousLngLat) return

    this.geofences.forEach((geofence) => {
      const wasInside = this.pointInPolygon(previousLngLat, geofence.geometry)
      const isInside = this.pointInPolygon(lngLat, geofence.geometry)

      if (!wasInside && isInside) {
        // 进入围栏
        this.triggerEvent({
          type: 'enter',
          geofence,
          lngLat,
          timestamp: Date.now()
        })
      } else if (wasInside && !isInside) {
        // 离开围栏
        this.triggerEvent({
          type: 'exit',
          geofence,
          lngLat,
          timestamp: Date.now()
        })
      }
    })
  }

  /**
   * 开始跟踪点位
   */
  startTracking(pointId: string, initialPoint: LngLat): void {
    this.trackedPoints.set(pointId, {
      point: initialPoint,
      insideGeofences: new Set()
    })

    // 检查初始位置
    this.geofences.forEach((geofence) => {
      if (this.pointInPolygon(initialPoint, geofence.geometry)) {
        this.trackedPoints.get(pointId)!.insideGeofences.add(geofence.id!)
      }
    })
  }

  /**
   * 停止跟踪点位
   */
  stopTracking(pointId: string): void {
    this.trackedPoints.delete(pointId)
  }

  /**
   * 更新跟踪点位置
   */
  updateTrackedPoint(pointId: string, newPoint: LngLat): void {
    const tracked = this.trackedPoints.get(pointId)
    if (!tracked) return

    const previousPoint = tracked.point
    tracked.point = newPoint

    // 检查围栏事件
    this.geofences.forEach((geofence) => {
      const geofenceId = geofence.id!
      const wasInside = tracked.insideGeofences.has(geofenceId)
      const isInside = this.pointInPolygon(newPoint, geofence.geometry)

      if (!wasInside && isInside) {
        // 进入围栏
        tracked.insideGeofences.add(geofenceId)
        this.triggerEvent({
          type: 'enter',
          geofence,
          lngLat: newPoint,
          timestamp: Date.now(),
          pointId
        })
      } else if (wasInside && !isInside) {
        // 离开围栏
        tracked.insideGeofences.delete(geofenceId)
        this.triggerEvent({
          type: 'exit',
          geofence,
          lngLat: newPoint,
          timestamp: Date.now(),
          pointId
        })
      }
    })
  }

  /**
   * 开始自动监控
   */
  startMonitoring(interval: number = 1000): void {
    if (this.monitoringInterval) {
      this.stopMonitoring()
    }

    this.monitoringInterval = window.setInterval(() => {
      // 这里可以集成GPS或其他位置服务
      // 目前只是一个框架
      this.mapEngine?.emit('geofence:monitoring', {
        trackedPoints: Array.from(this.trackedPoints.entries()).map(([id, data]) => ({
          id,
          point: data.point,
          insideGeofences: Array.from(data.insideGeofences)
        }))
      })
    }, interval)
  }

  /**
   * 停止自动监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  /**
   * 获取点位当前所在的围栏
   */
  getGeofencesContainingPoint(point: LngLat): GeofenceOptions[] {
    return Array.from(this.geofences.values()).filter(geofence =>
      this.pointInPolygon(point, geofence.geometry)
    )
  }

  /**
   * 获取围栏统计信息
   */
  getGeofenceStats(): {
    total: number
    active: number
    trackedPoints: number
    totalEvents: number
  } {
    return {
      total: this.geofences.size,
      active: Array.from(this.geofences.values()).filter(g => g.active !== false).length,
      trackedPoints: this.trackedPoints.size,
      totalEvents: this.eventCallbacks.length
    }
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(callback: (event: GeofenceEvent) => void): void {
    const index = this.eventCallbacks.indexOf(callback)
    if (index > -1) {
      this.eventCallbacks.splice(index, 1)
    }
  }

  /**
   * 清除所有事件监听器
   */
  clearEventListeners(): void {
    this.eventCallbacks = []
  }

  /**
   * 更新地理围栏图层
   */
  private updateGeofenceLayer(): void {
    if (!this.mapEngine) return

    const features = Array.from(this.geofences.values()).map(geofence => ({
      type: 'Feature' as const,
      properties: {
        id: geofence.id,
        name: geofence.name,
        description: geofence.description,
        fillColor: geofence.style?.fillColor || 'var(--ldesign-brand-color)',
        fillOpacity: geofence.style?.fillOpacity || 0.2,
        strokeColor: geofence.style?.strokeColor || 'var(--ldesign-brand-color)',
        strokeWidth: geofence.style?.strokeWidth || 2,
        strokeOpacity: geofence.style?.strokeOpacity || 0.8,
        ...geofence.data
      },
      geometry: geofence.geometry
    }))

    this.mapEngine.addSource(this.sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    })
  }

  /**
   * 触发围栏事件
   */
  private triggerEvent(event: GeofenceEvent): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in geofence event callback:', error)
      }
    })
  }

  /**
   * 判断点是否在多边形内（射线法）
   */
  private pointInPolygon(point: LngLat, polygon: GeoJSON.Polygon | GeoJSON.MultiPolygon): boolean {
    if (polygon.type === 'MultiPolygon') {
      return polygon.coordinates.some(coords =>
        this.pointInPolygonCoords(point, coords)
      )
    } else {
      return this.pointInPolygonCoords(point, polygon.coordinates)
    }
  }

  /**
   * 判断点是否在多边形坐标内
   */
  private pointInPolygonCoords(point: LngLat, coords: number[][][]): boolean {
    // 只检查外环（第一个环）
    const ring = coords[0]
    let inside = false

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1]
      const xj = ring[j][0], yj = ring[j][1]

      if (((yi > point[1]) !== (yj > point[1])) &&
        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }

    return inside
  }
}
