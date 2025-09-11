/**
 * Mapbox GL JS 地图引擎实现
 * 基于Mapbox GL JS提供高性能的WebGL地图渲染
 */

import mapboxgl from 'mapbox-gl'
import type {
  MapOptions,
  LngLat,
  LngLatBounds,
  FlyToOptions,
  FitBoundsOptions,
  MarkerOptions,
  LayerOptions,
  DataSource,
  IMapEngine
} from '../types'

/**
 * Mapbox GL JS 引擎实现
 * 提供基于WebGL的高性能地图渲染
 */
export class MapboxEngine implements IMapEngine {
  /** Mapbox地图实例 */
  private map: mapboxgl.Map | null = null

  /** 标记点集合 */
  private markers = new Map<string, mapboxgl.Marker>()

  /** 弹窗集合 */
  private popups = new Map<string, mapboxgl.Popup>()

  /** 是否已初始化 */
  private initialized = false

  /**
   * 初始化Mapbox地图
   */
  async initialize(options: MapOptions): Promise<void> {
    if (this.initialized) return

    try {
      // 设置访问令牌
      if (options.accessToken && options.accessToken !== 'DEMO_TOKEN_PLEASE_REPLACE') {
        mapboxgl.accessToken = options.accessToken
      } else {
        throw new Error(
          'Mapbox访问令牌无效或未设置。请到 https://account.mapbox.com/access-tokens/ 获取您的访问令牌，' +
          '然后在 .env.local 文件中设置 VITE_MAPBOX_ACCESS_TOKEN=your_token_here'
        )
      }

      // 获取容器元素
      const container = typeof options.container === 'string'
        ? document.querySelector(options.container) as HTMLElement
        : options.container

      if (!container) {
        throw new Error('Map container not found')
      }

      // 创建地图实例
      this.map = new mapboxgl.Map({
        container,
        style: this.getMapboxStyle(options.style || 'streets'),
        center: options.center || [116.404, 39.915],
        zoom: options.zoom || 10,
        minZoom: options.minZoom || 0,
        maxZoom: options.maxZoom || 24,
        bearing: options.bearing || 0,
        pitch: options.pitch || 0,
        interactive: options.interactive !== false,
        doubleClickZoom: options.doubleClickZoom !== false,
        scrollZoom: options.scrollZoom !== false,
        dragPan: options.dragPan !== false,
        dragRotate: options.dragRotate !== false,
        keyboard: options.keyboard !== false,
        touchZoomRotate: options.touchZoomRotate !== false
      })

      // 等待地图加载完成
      await new Promise<void>((resolve, reject) => {
        this.map!.on('load', () => resolve())
        this.map!.on('error', (e) => reject(e.error))
      })

      // 添加控件
      this.addControls(options)

      this.initialized = true
    } catch (error) {
      throw new Error(`Failed to initialize Mapbox: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 销毁地图
   */
  destroy(): void {
    if (this.map) {
      // 清理标记点
      this.markers.forEach(marker => marker.remove())
      this.markers.clear()

      // 清理弹窗
      this.popups.forEach(popup => popup.remove())
      this.popups.clear()

      // 销毁地图实例
      this.map.remove()
      this.map = null
    }
    this.initialized = false
  }

  /**
   * 检查是否已初始化
   */
  private checkInitialized(): void {
    if (!this.initialized || !this.map) {
      throw new Error('Map engine is not initialized')
    }
  }

  // ========== 基础地图操作 ==========

  /**
   * 设置地图中心点
   */
  setCenter(center: LngLat): void {
    this.checkInitialized()
    this.map!.setCenter(center)
  }

  /**
   * 获取地图中心点
   */
  getCenter(): LngLat {
    this.checkInitialized()
    const center = this.map!.getCenter()
    return [center.lng, center.lat]
  }

  /**
   * 设置地图缩放级别
   */
  setZoom(zoom: number): void {
    this.checkInitialized()
    this.map!.setZoom(zoom)
  }

  /**
   * 获取地图缩放级别
   */
  getZoom(): number {
    this.checkInitialized()
    return this.map!.getZoom()
  }

  /**
   * 设置地图方位角
   */
  setBearing(bearing: number): void {
    this.checkInitialized()
    this.map!.setBearing(bearing)
  }

  /**
   * 获取地图方位角
   */
  getBearing(): number {
    this.checkInitialized()
    return this.map!.getBearing()
  }

  /**
   * 设置地图倾斜角
   */
  setPitch(pitch: number): void {
    this.checkInitialized()
    this.map!.setPitch(pitch)
  }

  /**
   * 获取地图倾斜角
   */
  getPitch(): number {
    this.checkInitialized()
    return this.map!.getPitch()
  }

  /**
   * 飞行到指定位置
   */
  async flyTo(options: FlyToOptions): Promise<void> {
    this.checkInitialized()

    return new Promise<void>((resolve) => {
      const flyOptions: mapboxgl.FlyToOptions = {
        center: options.center,
        zoom: options.zoom,
        bearing: options.bearing,
        pitch: options.pitch,
        duration: options.duration,
        essential: true
      }

      this.map!.flyTo(flyOptions)

      if (options.duration && options.duration > 0) {
        setTimeout(() => resolve(), options.duration)
      } else {
        resolve()
      }
    })
  }

  /**
   * 获取地图边界
   */
  getBounds(): LngLatBounds {
    this.checkInitialized()
    const bounds = this.map!.getBounds()
    return [
      [bounds.getWest(), bounds.getSouth()],
      [bounds.getEast(), bounds.getNorth()]
    ]
  }

  /**
   * 设置地图边界
   */
  fitBounds(bounds: LngLatBounds, options?: FitBoundsOptions): void {
    this.checkInitialized()

    const mapboxBounds = new mapboxgl.LngLatBounds(bounds[0], bounds[1])
    const fitOptions: mapboxgl.FitBoundsOptions = {
      padding: options?.padding || 20,
      maxZoom: options?.maxZoom,
      duration: options?.duration || 1000
    }

    this.map!.fitBounds(mapboxBounds, fitOptions)
  }

  // ========== 标记点管理 ==========

  /**
   * 添加标记点
   */
  addMarker(marker: MarkerOptions): string {
    this.checkInitialized()

    const id = marker.id || this.generateId('marker')

    // 创建标记点元素
    let element: HTMLElement | undefined
    if (marker.element) {
      element = typeof marker.element === 'string'
        ? this.createMarkerElement(marker.element)
        : marker.element
    } else if (marker.icon) {
      element = this.createIconElement(marker.icon)
    }

    // 创建Mapbox标记点
    const mapboxMarker = new mapboxgl.Marker({
      element,
      color: marker.color,
      draggable: marker.draggable || false
    })
      .setLngLat(marker.lngLat)
      .addTo(this.map!)

    // 添加弹窗
    if (marker.popup) {
      const popup = new mapboxgl.Popup({
        offset: marker.popup.offset || [0, -30],
        closeButton: marker.popup.closeButton !== false,
        closeOnClick: marker.popup.closeOnClick !== false,
        maxWidth: marker.popup.maxWidth || '240px',
        className: marker.popup.className
      })
        .setHTML(typeof marker.popup.content === 'string' ? marker.popup.content : marker.popup.content.outerHTML)

      mapboxMarker.setPopup(popup)
    }

    // 存储标记点
    this.markers.set(id, mapboxMarker)

    return id
  }

  /**
   * 移除标记点
   */
  removeMarker(id: string): void {
    const marker = this.markers.get(id)
    if (marker) {
      marker.remove()
      this.markers.delete(id)
    }
  }

  /**
   * 更新标记点
   */
  updateMarker(id: string, options: Partial<MarkerOptions>): void {
    const marker = this.markers.get(id)
    if (!marker) return

    if (options.lngLat) {
      marker.setLngLat(options.lngLat)
    }

    if (options.draggable !== undefined) {
      marker.setDraggable(options.draggable)
    }
  }

  /**
   * 获取标记点
   */
  getMarker(id: string): MarkerOptions | undefined {
    const marker = this.markers.get(id)
    if (!marker) return undefined

    const lngLat = marker.getLngLat()
    return {
      id,
      lngLat: [lngLat.lng, lngLat.lat],
      draggable: marker.isDraggable()
    }
  }

  /**
   * 获取所有标记点
   */
  getMarkers(): MarkerOptions[] {
    const markers: MarkerOptions[] = []
    this.markers.forEach((marker, id) => {
      const lngLat = marker.getLngLat()
      markers.push({
        id,
        lngLat: [lngLat.lng, lngLat.lat],
        draggable: marker.isDraggable()
      })
    })
    return markers
  }

  // ========== 图层管理 ==========

  /**
   * 添加图层
   */
  addLayer(layer: LayerOptions): void {
    this.checkInitialized()

    const mapboxLayer: mapboxgl.AnyLayer = {
      id: layer.id,
      type: layer.type as any,
      source: layer.source as any,
      paint: layer.paint,
      layout: layer.layout,
      filter: layer.filter,
      minzoom: layer.minzoom,
      maxzoom: layer.maxzoom
    }

    this.map!.addLayer(mapboxLayer)

    if (layer.visible === false) {
      this.toggleLayer(layer.id, false)
    }
  }

  /**
   * 移除图层
   */
  removeLayer(id: string): void {
    this.checkInitialized()
    if (this.map!.getLayer(id)) {
      this.map!.removeLayer(id)
    }
  }

  /**
   * 更新图层
   */
  updateLayer(id: string, options: Partial<LayerOptions>): void {
    this.checkInitialized()

    if (options.paint) {
      Object.entries(options.paint).forEach(([property, value]) => {
        this.map!.setPaintProperty(id, property, value)
      })
    }

    if (options.layout) {
      Object.entries(options.layout).forEach(([property, value]) => {
        this.map!.setLayoutProperty(id, property, value)
      })
    }

    if (options.filter) {
      this.map!.setFilter(id, options.filter)
    }

    if (options.visible !== undefined) {
      this.toggleLayer(id, options.visible)
    }
  }

  /**
   * 显示/隐藏图层
   */
  toggleLayer(id: string, visible: boolean): void {
    this.checkInitialized()
    const visibility = visible ? 'visible' : 'none'
    this.map!.setLayoutProperty(id, 'visibility', visibility)
  }

  /**
   * 设置图层可见性
   */
  setLayerVisibility(id: string, visible: boolean): void {
    this.toggleLayer(id, visible)
  }

  /**
   * 更新图层样式
   */
  updateLayerStyle(id: string, style: any): void {
    this.checkInitialized()
    Object.entries(style).forEach(([property, value]) => {
      this.map!.setPaintProperty(id, property, value)
    })
  }

  /**
   * 移动图层顺序
   */
  moveLayer(id: string, beforeId?: string): void {
    this.checkInitialized()
    this.map!.moveLayer(id, beforeId)
  }

  /**
   * 检查数据源是否存在
   */
  hasSource(id: string): boolean {
    this.checkInitialized()
    return !!this.map!.getSource(id)
  }

  /**
   * 更新数据源
   */
  updateSource(id: string, data: any): void {
    this.checkInitialized()
    const source = this.map!.getSource(id) as mapboxgl.GeoJSONSource
    if (source && source.setData) {
      source.setData(data)
    }
  }

  // ========== 数据源管理 ==========

  /**
   * 添加数据源
   */
  addSource(id: string, source: DataSource): void {
    this.checkInitialized()
    this.map!.addSource(id, source as any)
  }

  /**
   * 移除数据源
   */
  removeSource(id: string): void {
    this.checkInitialized()
    if (this.map!.getSource(id)) {
      this.map!.removeSource(id)
    }
  }

  // ========== 事件处理 ==========

  /**
   * 添加事件监听器
   */
  on(event: string, listener: EventListener): void {
    this.checkInitialized()
    this.map!.on(event as any, listener as any)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: EventListener): void {
    this.checkInitialized()
    this.map!.off(event as any, listener as any)
  }

  /**
   * 触发事件
   */
  emit(event: string, data?: any): void {
    this.checkInitialized()
    this.map!.fire(event as any, data)
  }

  // ========== 工具方法 ==========

  /**
   * 调整地图大小
   */
  resize(): void {
    this.checkInitialized()
    this.map!.resize()
  }

  /**
   * 获取地图容器
   */
  getContainer(): HTMLElement {
    this.checkInitialized()
    return this.map!.getContainer()
  }

  /**
   * 屏幕坐标转地理坐标
   */
  unproject(point: [number, number]): LngLat {
    this.checkInitialized()
    const lngLat = this.map!.unproject(point)
    return [lngLat.lng, lngLat.lat]
  }

  /**
   * 地理坐标转屏幕坐标
   */
  project(lngLat: LngLat): [number, number] {
    this.checkInitialized()
    const point = this.map!.project(lngLat)
    return [point.x, point.y]
  }

  /**
   * 获取原始地图实例
   */
  getMapInstance(): any {
    this.checkInitialized()
    return this.map
  }

  // ========== 私有方法 ==========

  /**
   * 获取Mapbox样式URL
   */
  private getMapboxStyle(style: string): string {
    const styleMap: Record<string, string> = {
      'streets': 'mapbox://styles/mapbox/streets-v11',
      'satellite': 'mapbox://styles/mapbox/satellite-v9',
      'hybrid': 'mapbox://styles/mapbox/satellite-streets-v11',
      'terrain': 'mapbox://styles/mapbox/outdoors-v11',
      'dark': 'mapbox://styles/mapbox/dark-v10',
      'light': 'mapbox://styles/mapbox/light-v10'
    }

    return styleMap[style] || style
  }

  /**
   * 添加控件
   */
  private addControls(options: MapOptions): void {
    if (options.showNavigation) {
      this.map!.addControl(new mapboxgl.NavigationControl(), 'top-right')
    }

    if (options.showScale) {
      this.map!.addControl(new mapboxgl.ScaleControl(), 'bottom-left')
    }

    if (options.showFullscreen) {
      this.map!.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 创建标记点元素
   */
  private createMarkerElement(html: string): HTMLElement {
    const element = document.createElement('div')
    element.innerHTML = html
    element.className = 'ldesign-map-marker'
    return element
  }

  /**
   * 创建图标元素
   */
  private createIconElement(icon: { url: string; size?: [number, number]; anchor?: [number, number] }): HTMLElement {
    const element = document.createElement('div')
    element.className = 'ldesign-map-marker-icon'

    const img = document.createElement('img')
    img.src = icon.url
    img.alt = 'marker'

    if (icon.size) {
      img.style.width = `${icon.size[0]}px`
      img.style.height = `${icon.size[1]}px`
    }

    if (icon.anchor) {
      element.style.transform = `translate(-${icon.anchor[0]}px, -${icon.anchor[1]}px)`
    }

    element.appendChild(img)
    return element
  }
}