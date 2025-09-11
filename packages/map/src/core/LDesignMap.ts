/**
 * @ldesign/map - 功能全面的地图插件
 *
 * 核心功能：
 * - 支持多种地图类型（2D、3D、行政区划、自定义区块）
 * - 框架兼容性（Vue 3、React、原生 JavaScript）
 * - 丰富的地图功能（标记点、路径规划、地理围栏、热力图等）
 * - 完整的TypeScript支持
 * - 遵循LDESIGN设计系统
 *
 * @example
 * ```typescript
 * import { LDesignMap } from '@ldesign/map'
 *
 * // 创建地图实例
 * const map = new LDesignMap({
 *   container: '#map',
 *   center: [116.404, 39.915], // 北京
 *   zoom: 10,
 *   accessToken: 'your-mapbox-token'
 * })
 *
 * // 初始化地图
 * await map.initialize()
 *
 * // 添加标记点
 * map.addMarker({
 *   lngLat: [116.404, 39.915],
 *   popup: { content: '北京' }
 * })
 *
 * // 路径规划
 * const route = await map.routing.calculateRoute({
 *   origin: [116.404, 39.915],
 *   destination: [121.473, 31.230]
 * })
 *
 * // 飞行到上海
 * await map.flyTo({
 *   center: [121.473, 31.230],
 *   zoom: 12,
 *   duration: 2000
 * })
 * ```
 */

import type {
  MapOptions,
  LngLat,
  LngLatBounds,
  FlyToOptions,
  FitBoundsOptions,
  MarkerOptions,
  LayerOptions,
  DataSource,
  IMapEngine,
  IRoutingModule,
  IGeofenceModule,
  IHeatmapModule,
  ISearchModule,
  IMeasurementModule,
  ILayerModule
} from '../types'
import { LeafletEngine } from './LeafletEngine'
import { MapboxEngine } from './MapboxEngine'

/**
 * LDesign地图主类
 * 提供统一的地图API接口，支持丰富的地图功能
 */
export class LDesignMap {
  private engine: IMapEngine
  private options: MapOptions
  private initialized = false

  // 功能模块（延迟加载）
  private _routing?: IRoutingModule
  private _geofence?: IGeofenceModule
  private _heatmap?: IHeatmapModule
  private _search?: ISearchModule
  private _measurement?: IMeasurementModule
  private _layers?: ILayerModule

  constructor(options: MapOptions) {
    this.options = {
      engine: 'mapbox',
      mapType: '2d',
      center: [116.404, 39.915], // 北京
      zoom: 10,
      style: 'streets',
      minZoom: 0,
      maxZoom: 24,
      bearing: 0,
      pitch: 0,
      showNavigation: true,
      showScale: true,
      showFullscreen: true,
      interactive: true,
      doubleClickZoom: true,
      scrollZoom: true,
      dragPan: true,
      dragRotate: true,
      keyboard: true,
      touchZoomRotate: true,
      ...options
    }

    // 创建地图引擎 - 默认使用Leaflet（免费，无需API密钥）
    this.engine = this.options.engine === 'mapbox' ? new MapboxEngine() : new LeafletEngine()
  }

  /**
   * 初始化地图
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new Error('Map is already initialized')
    }

    try {
      // 初始化地图引擎
      await this.engine.initialize(this.options)

      // 加载功能模块
      await this.loadModules()

      this.initialized = true
    } catch (error) {
      throw new Error(
        `Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * 销毁地图
   */
  destroy(): void {
    if (!this.initialized) return

    // 销毁功能模块
    this._routing?.destroy()
    this._geofence?.destroy()
    this._heatmap?.destroy()
    this._search?.destroy()
    this._measurement?.destroy()

    // 销毁地图引擎
    this.engine.destroy()
    this.initialized = false
  }

  /**
   * 检查地图是否已初始化
   */
  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('Map is not initialized')
    }
  }

  // ========== 基础地图操作 ==========

  /**
   * 设置地图中心点
   */
  setCenter(center: LngLat): void {
    this.checkInitialized()
    this.engine.setCenter(center)
  }

  /**
   * 获取地图中心点
   */
  getCenter(): LngLat {
    this.checkInitialized()
    return this.engine.getCenter()
  }

  /**
   * 设置地图缩放级别
   */
  setZoom(zoom: number): void {
    this.checkInitialized()
    this.engine.setZoom(zoom)
  }

  /**
   * 获取地图缩放级别
   */
  getZoom(): number {
    this.checkInitialized()
    return this.engine.getZoom()
  }

  /**
   * 设置地图方位角
   */
  setBearing(bearing: number): void {
    this.checkInitialized()
    this.engine.setBearing(bearing)
  }

  /**
   * 获取地图方位角
   */
  getBearing(): number {
    this.checkInitialized()
    return this.engine.getBearing()
  }

  /**
   * 设置地图倾斜角
   */
  setPitch(pitch: number): void {
    this.checkInitialized()
    this.engine.setPitch(pitch)
  }

  /**
   * 获取地图倾斜角
   */
  getPitch(): number {
    this.checkInitialized()
    return this.engine.getPitch()
  }

  /**
   * 飞行到指定位置
   */
  async flyTo(options: FlyToOptions): Promise<void> {
    this.checkInitialized()
    return this.engine.flyTo(options)
  }

  /**
   * 获取地图边界
   */
  getBounds(): LngLatBounds {
    this.checkInitialized()
    return this.engine.getBounds()
  }

  /**
   * 设置地图边界
   */
  fitBounds(bounds: LngLatBounds, options?: FitBoundsOptions): void {
    this.checkInitialized()
    this.engine.fitBounds(bounds, options)
  }

  // ========== 标记点管理 ==========

  /**
   * 添加标记点
   */
  addMarker(marker: MarkerOptions): string {
    this.checkInitialized()
    return this.engine.addMarker(marker)
  }

  /**
   * 移除标记点
   */
  removeMarker(id: string): void {
    this.checkInitialized()
    this.engine.removeMarker(id)
  }

  /**
   * 更新标记点
   */
  updateMarker(id: string, options: Partial<MarkerOptions>): void {
    this.checkInitialized()
    this.engine.updateMarker(id, options)
  }

  /**
   * 获取标记点
   */
  getMarker(id: string): MarkerOptions | undefined {
    this.checkInitialized()
    return this.engine.getMarker(id)
  }

  /**
   * 获取所有标记点
   */
  getMarkers(): MarkerOptions[] {
    this.checkInitialized()
    return this.engine.getMarkers()
  }

  // ========== 图层管理 ==========

  /**
   * 添加图层
   */
  addLayer(layer: LayerOptions): void {
    this.checkInitialized()
    this.engine.addLayer(layer)
  }

  /**
   * 移除图层
   */
  removeLayer(id: string): void {
    this.checkInitialized()
    this.engine.removeLayer(id)
  }

  /**
   * 更新图层
   */
  updateLayer(id: string, options: Partial<LayerOptions>): void {
    this.checkInitialized()
    this.engine.updateLayer(id, options)
  }

  /**
   * 显示/隐藏图层
   */
  toggleLayer(id: string, visible: boolean): void {
    this.checkInitialized()
    this.engine.toggleLayer(id, visible)
  }

  /**
   * 添加数据源
   */
  addSource(id: string, source: DataSource): void {
    this.checkInitialized()
    this.engine.addSource(id, source)
  }

  /**
   * 移除数据源
   */
  removeSource(id: string): void {
    this.checkInitialized()
    this.engine.removeSource(id)
  }

  // ========== 功能模块访问器 ==========

  /**
   * 获取路径规划模块
   */
  get routing(): IRoutingModule {
    if (!this._routing) {
      throw new Error('Routing module not initialized')
    }
    return this._routing
  }

  /**
   * 获取地理围栏模块
   */
  get geofence(): IGeofenceModule {
    if (!this._geofence) {
      throw new Error('Geofence module not initialized')
    }
    return this._geofence
  }

  /**
   * 获取热力图模块
   */
  get heatmap(): IHeatmapModule {
    if (!this._heatmap) {
      throw new Error('Heatmap module not initialized')
    }
    return this._heatmap
  }

  /**
   * 获取搜索模块
   */
  get search(): ISearchModule {
    if (!this._search) {
      throw new Error('Search module not initialized')
    }
    return this._search
  }

  /**
   * 获取测量模块
   */
  get measurement(): IMeasurementModule {
    if (!this._measurement) {
      throw new Error('Measurement module not initialized')
    }
    return this._measurement
  }

  /**
   * 获取图层管理模块
   */
  get layers(): ILayerModule {
    if (!this._layers) {
      throw new Error('Layer module not initialized')
    }
    return this._layers
  }

  // ========== 事件处理 ==========

  /**
   * 添加事件监听器
   */
  on(event: string, listener: EventListener): void {
    this.checkInitialized()
    this.engine.on(event, listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: EventListener): void {
    this.checkInitialized()
    this.engine.off(event, listener)
  }

  /**
   * 触发事件
   */
  emit(event: string, data?: any): void {
    this.checkInitialized()
    this.engine.emit(event, data)
  }

  // ========== 工具方法 ==========

  /**
   * 调整地图大小
   */
  resize(): void {
    this.checkInitialized()
    this.engine.resize()
  }

  /**
   * 获取地图容器
   */
  getContainer(): HTMLElement {
    this.checkInitialized()
    return this.engine.getContainer()
  }

  /**
   * 屏幕坐标转地理坐标
   */
  unproject(point: [number, number]): LngLat {
    this.checkInitialized()
    return this.engine.unproject(point)
  }

  /**
   * 地理坐标转屏幕坐标
   */
  project(lngLat: LngLat): [number, number] {
    this.checkInitialized()
    return this.engine.project(lngLat)
  }

  /**
   * 获取原始地图实例
   */
  getMapInstance(): any {
    this.checkInitialized()
    return this.engine.getMapInstance()
  }

  /**
   * 获取地图配置选项
   */
  getOptions(): MapOptions {
    return { ...this.options }
  }

  /**
   * 是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized
  }

  // ========== 私有方法 ==========

  /**
   * 延迟加载功能模块
   */
  private async loadModules(): Promise<void> {
    // 动态导入功能模块
    const [
      { RoutingModule },
      { GeofenceModule },
      { HeatmapModule },
      { SearchModule },
      { MeasurementModule },
      { LayerModule }
    ] = await Promise.all([
      import('../features/routing/RoutingModule'),
      import('../features/geofence/GeofenceModule'),
      import('../features/heatmap/HeatmapModule'),
      import('../features/search/SearchModule'),
      import('../features/measurement/MeasurementModule'),
      import('../features/layers/LayerModule')
    ])

    // 初始化功能模块
    this._routing = new RoutingModule()
    this._geofence = new GeofenceModule()
    this._heatmap = new HeatmapModule()
    this._search = new SearchModule()
    this._measurement = new MeasurementModule()
    this._layers = new LayerModule(this.engine)

    // 初始化模块
    await Promise.all([
      this._routing.initialize(this.engine),
      this._geofence.initialize(this.engine),
      this._heatmap.initialize(this.engine),
      this._search.initialize(this.engine),
      this._measurement.initialize(this.engine)
    ])
  }
}