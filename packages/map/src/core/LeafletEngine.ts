/**
 * Leaflet 地图引擎实现
 * 基于Leaflet提供轻量级的地图渲染
 */

import { MapEngine } from './MapEngine'
import type {
  MapOptions,
  LngLat,
  FlyToOptions,
  DataSource,
  LayerOptions,
  MarkerOptions,
  PopupOptions,
  ControlOptions,
  MapStyle
} from '../types'
import { isValidCoordinate, isValidZoom } from '../utils'

// Leaflet类型声明
declare global {
  interface Window {
    L: any
  }
}

/**
 * Leaflet 引擎实现
 * 提供轻量级的地图渲染，无需API密钥
 */
export class LeafletEngine extends MapEngine {
  /** Leaflet地图实例 */
  private map: any = null

  /** 标记点集合 */
  private markers = new Map<string, any>()

  /** 弹窗集合 */
  private popups = new Map<string, any>()

  /** 图层集合 */
  private layers = new Map<string, any>()

  /** 当前瓦片图层 */
  private tileLayer: any = null

  constructor() {
    // 使用默认选项初始化，实际选项在initialize时传入
    super({} as MapOptions)
  }

  /**
   * 初始化Leaflet地图
   */
  async initialize(options: MapOptions): Promise<void> {
    if (this.initialized) return

    try {
      // 检查Leaflet是否已加载
      if (typeof window === 'undefined' || !window.L) {
        throw new Error('Leaflet库未加载，请确保已引入Leaflet')
      }

      const L = window.L

      // 获取容器
      const container = typeof options.container === 'string'
        ? document.querySelector(options.container)
        : options.container

      if (!container) {
        throw new Error('地图容器未找到')
      }

      // 创建Leaflet地图
      const center = options.center || [116.404, 39.915]
      const zoom = options.zoom || 10

      this.map = L.map(container).setView([center[1], center[0]], zoom)

      // 添加默认瓦片图层
      this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map)

      // 绑定事件
      this.setupEventListeners()

      this.initialized = true
      this.emit('ready')

    } catch (error) {
      throw new Error(`Leaflet地图初始化失败: ${error.message}`)
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.map) return

    this.map.on('moveend', () => {
      this.emit('moveend', this.getCenter())
    })

    this.map.on('zoomend', () => {
      this.emit('zoomend', this.getZoom())
    })

    this.map.on('click', (e: any) => {
      this.emit('click', { lng: e.latlng.lng, lat: e.latlng.lat })
    })

    this.map.on('load', () => {
      this.emit('load')
    })
  }

  /**
   * 设置地图中心点
   */
  setCenter(center: LngLat): void {
    if (!this.map) throw new Error('地图未初始化')
    if (!isValidCoordinate(center)) throw new Error('无效的坐标')

    this.map.setView([center[1], center[0]], this.map.getZoom())
  }

  /**
   * 获取地图中心点
   */
  getCenter(): { lng: number; lat: number } {
    if (!this.map) throw new Error('地图未初始化')

    const center = this.map.getCenter()
    return { lng: center.lng, lat: center.lat }
  }

  /**
   * 设置缩放级别
   */
  setZoom(zoom: number): void {
    if (!this.map) throw new Error('地图未初始化')
    if (!isValidZoom(zoom)) throw new Error('无效的缩放级别')

    this.map.setZoom(zoom)
  }

  /**
   * 获取缩放级别
   */
  getZoom(): number {
    if (!this.map) throw new Error('地图未初始化')
    return this.map.getZoom()
  }

  /**
   * 飞行到指定位置
   */
  flyTo(center: LngLat, zoom?: number, options?: FlyToOptions): void {
    if (!this.map) throw new Error('地图未初始化')
    if (!isValidCoordinate(center)) throw new Error('无效的坐标')

    const targetZoom = zoom !== undefined ? zoom : this.getZoom()

    this.map.setView([center[1], center[0]], targetZoom, {
      animate: true,
      duration: options?.duration || 2,
      ...options
    })
  }

  /**
   * 添加标记点
   */
  addMarker(marker: MarkerOptions): string {
    if (!this.map) throw new Error('地图未初始化')
    if (!marker.lngLat || !isValidCoordinate(marker.lngLat)) throw new Error('无效的坐标')

    const L = window.L
    const markerId = marker.id || `marker_${Date.now()}_${Math.random()}`

    const leafletMarker = L.marker([marker.lngLat[1], marker.lngLat[0]], {
      title: marker.title || '标记点'
    }).addTo(this.map)

    if (marker.popup) {
      leafletMarker.bindPopup(marker.popup.content || '')
    }

    this.markers.set(markerId, leafletMarker)
    return markerId
  }

  /**
   * 移除标记点
   */
  removeMarker(markerId: string): void {
    const marker = this.markers.get(markerId)
    if (marker && this.map) {
      this.map.removeLayer(marker)
      this.markers.delete(markerId)
    }
  }

  /**
   * 更新标记点
   */
  updateMarker(id: string, options: Partial<MarkerOptions>): void {
    const marker = this.markers.get(id)
    if (!marker) return

    if (options.lngLat) {
      marker.setLatLng([options.lngLat[1], options.lngLat[0]])
    }

    if (options.popup) {
      marker.bindPopup(options.popup.content || '')
    }
  }

  /**
   * 获取标记点
   */
  getMarker(id: string): MarkerOptions | undefined {
    const marker = this.markers.get(id)
    if (!marker) return undefined

    const latLng = marker.getLatLng()
    return {
      id,
      lngLat: [latLng.lng, latLng.lat],
      title: marker.options.title
    }
  }

  /**
   * 获取所有标记点
   */
  getMarkers(): MarkerOptions[] {
    const markers: MarkerOptions[] = []
    this.markers.forEach((marker, id) => {
      const latLng = marker.getLatLng()
      markers.push({
        id,
        lngLat: [latLng.lng, latLng.lat],
        title: marker.options.title
      })
    })
    return markers
  }

  /**
   * 清除所有标记点
   */
  clearMarkers(): void {
    this.markers.forEach(marker => {
      if (this.map) {
        this.map.removeLayer(marker)
      }
    })
    this.markers.clear()
  }

  /**
   * 添加弹窗
   */
  addPopup(position: LngLat, content: string, options: PopupOptions = {}): string {
    if (!this.map) throw new Error('地图未初始化')
    if (!isValidCoordinate(position)) throw new Error('无效的坐标')

    const L = window.L
    const popupId = `popup_${Date.now()}_${Math.random()}`

    const popup = L.popup(options)
      .setLatLng([position[1], position[0]])
      .setContent(content)
      .openOn(this.map)

    this.popups.set(popupId, popup)
    return popupId
  }

  /**
   * 移除弹窗
   */
  removePopup(popupId: string): void {
    const popup = this.popups.get(popupId)
    if (popup && this.map) {
      this.map.closePopup(popup)
      this.popups.delete(popupId)
    }
  }

  /**
   * 清除所有弹窗
   */
  clearPopups(): void {
    this.popups.forEach(popup => {
      if (this.map) {
        this.map.closePopup(popup)
      }
    })
    this.popups.clear()
  }

  /**
   * 添加数据源（Leaflet中通过GeoJSON实现）
   */
  addSource(sourceId: string, source: DataSource): void {
    if (!this.map) throw new Error('地图未初始化')

    const L = window.L

    if (source.type === 'geojson' && source.data) {
      const layer = L.geoJSON(source.data)
      this.layers.set(sourceId, layer)
    }
  }

  /**
   * 移除数据源
   */
  removeSource(sourceId: string): void {
    const layer = this.layers.get(sourceId)
    if (layer && this.map) {
      this.map.removeLayer(layer)
      this.layers.delete(sourceId)
    }
  }

  /**
   * 添加图层
   */
  addLayer(layer: LayerOptions): void {
    if (!this.map) throw new Error('地图未初始化')

    // Leaflet的图层添加相对简单，这里提供基础实现
    console.log(`添加图层: ${layer.id}`, layer)
  }

  /**
   * 移除图层
   */
  removeLayer(layerId: string): void {
    const layer = this.layers.get(layerId)
    if (layer && this.map) {
      this.map.removeLayer(layer)
      this.layers.delete(layerId)
    }
  }

  /**
   * 更新图层
   */
  updateLayer(id: string, options: Partial<LayerOptions>): void {
    // Leaflet的图层更新实现
    console.log(`更新图层: ${id}`, options)
  }

  /**
   * 显示/隐藏图层
   */
  toggleLayer(id: string, visible: boolean): void {
    const layer = this.layers.get(id)
    if (layer && this.map) {
      if (visible) {
        this.map.addLayer(layer)
      } else {
        this.map.removeLayer(layer)
      }
    }
  }

  /**
   * 设置地图样式（切换瓦片图层）
   */
  setStyle(style: MapStyle): void {
    if (!this.map) throw new Error('地图未初始化')

    // 移除当前瓦片图层
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer)
    }

    const L = window.L
    let tileUrl = ''
    let attribution = ''

    // 根据样式选择瓦片源
    switch (style) {
      case 'streets':
      default:
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution = '© OpenStreetMap contributors'
        break
      case 'satellite':
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        attribution = '© Esri'
        break
      case 'terrain':
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        attribution = '© OpenTopoMap contributors'
        break
    }

    // 添加新的瓦片图层
    this.tileLayer = L.tileLayer(tileUrl, { attribution }).addTo(this.map)
  }

  /**
   * 获取地图边界
   */
  getBounds(): [[number, number], [number, number]] {
    if (!this.map) throw new Error('地图未初始化')

    const bounds = this.map.getBounds()
    return [
      [bounds.getSouth(), bounds.getWest()],
      [bounds.getNorth(), bounds.getEast()]
    ]
  }

  /**
   * 设置地图边界
   */
  fitBounds(bounds: LngLatBounds, options?: any): void {
    if (!this.map) throw new Error('地图未初始化')

    this.map.fitBounds([
      [bounds[0][1], bounds[0][0]], // [lat, lng]
      [bounds[1][1], bounds[1][0]]  // [lat, lng]
    ])
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: EventListener): void {
    if (!this.map) throw new Error('地图未初始化')
    this.map.on(event, listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: EventListener): void {
    if (!this.map) throw new Error('地图未初始化')
    this.map.off(event, listener)
  }

  /**
   * 触发事件
   */
  emit(event: string, data?: any): void {
    if (!this.map) throw new Error('地图未初始化')
    this.map.fire(event, data)
  }

  /**
   * 调整地图大小
   */
  resize(): void {
    if (!this.map) throw new Error('地图未初始化')
    this.map.invalidateSize()
  }

  /**
   * 获取地图容器
   */
  getContainer(): HTMLElement {
    if (!this.map) throw new Error('地图未初始化')
    return this.map.getContainer()
  }

  /**
   * 屏幕坐标转地理坐标
   */
  unproject(point: [number, number]): LngLat {
    if (!this.map) throw new Error('地图未初始化')
    const latlng = this.map.containerPointToLatLng(point)
    return [latlng.lng, latlng.lat]
  }

  /**
   * 地理坐标转屏幕坐标
   */
  project(lngLat: LngLat): [number, number] {
    if (!this.map) throw new Error('地图未初始化')
    const point = this.map.latLngToContainerPoint([lngLat[1], lngLat[0]])
    return [point.x, point.y]
  }

  /**
   * 获取原始地图实例
   */
  getMapInstance(): any {
    return this.map
  }

  /**
   * 销毁地图
   */
  destroy(): void {
    if (this.map) {
      this.clearMarkers()
      this.clearPopups()
      this.layers.forEach(layer => this.map.removeLayer(layer))
      this.layers.clear()

      this.map.remove()
      this.map = null
    }

    this.initialized = false
    this.clearEventListeners()
  }
}
