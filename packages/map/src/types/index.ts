/**
 * @ldesign/map 核心类型定义
 * 功能全面的地图插件类型系统
 */

// 基础地理坐标类型
export type LngLat = [number, number] // [经度, 纬度]
export type LngLatBounds = [LngLat, LngLat] // [西南角, 东北角]

// 地图引擎类型
export type MapEngineType = 'mapbox' | 'leaflet'

// 地图类型
export type MapType =
  | '2d'               // 2D平面地图
  | '3d'               // 3D立体地图
  | 'administrative'   // 行政区划地图
  | 'custom'           // 自定义区块地图

// 地图样式类型
export type MapStyle =
  | 'streets'           // 街道地图
  | 'satellite'         // 卫星地图
  | 'hybrid'           // 混合地图
  | 'terrain'          // 地形地图
  | 'dark'             // 暗色主题
  | 'light'            // 亮色主题
  | string             // 自定义样式URL

// 地图配置选项
export interface MapOptions {
  /** 地图容器元素或选择器 */
  container: string | HTMLElement
  /** 地图引擎类型 */
  engine?: MapEngineType
  /** 地图类型 */
  mapType?: MapType
  /** 地图中心点坐标 */
  center?: LngLat
  /** 地图缩放级别 */
  zoom?: number
  /** 地图样式 */
  style?: MapStyle
  /** 最小缩放级别 */
  minZoom?: number
  /** 最大缩放级别 */
  maxZoom?: number
  /** 地图方位角 */
  bearing?: number
  /** 地图倾斜角 */
  pitch?: number
  /** Mapbox访问令牌 */
  accessToken?: string
  /** 是否显示导航控件 */
  showNavigation?: boolean
  /** 是否显示比例尺 */
  showScale?: boolean
  /** 是否显示全屏按钮 */
  showFullscreen?: boolean
  /** 是否启用交互 */
  interactive?: boolean
  /** 是否启用双击缩放 */
  doubleClickZoom?: boolean
  /** 是否启用滚轮缩放 */
  scrollZoom?: boolean
  /** 是否启用拖拽平移 */
  dragPan?: boolean
  /** 是否启用拖拽旋转 */
  dragRotate?: boolean
  /** 是否启用键盘导航 */
  keyboard?: boolean
  /** 是否启用触摸缩放旋转 */
  touchZoomRotate?: boolean
}

// 动画配置
export interface AnimationOptions {
  /** 动画持续时间（毫秒） */
  duration?: number
  /** 动画缓动函数 */
  easing?: string
  /** 动画完成回调 */
  onComplete?: () => void
}

// 飞行动画配置
export interface FlyToOptions extends AnimationOptions {
  /** 目标中心点 */
  center?: LngLat
  /** 目标缩放级别 */
  zoom?: number
  /** 目标方位角 */
  bearing?: number
  /** 目标倾斜角 */
  pitch?: number
}

// 事件类型
export interface MapEvent {
  /** 事件类型 */
  type: string
  /** 地理坐标 */
  lngLat?: LngLat
  /** 屏幕坐标 */
  point?: [number, number]
  /** 原始事件对象 */
  originalEvent?: Event
}

// 事件监听器类型
export type EventListener = (event: MapEvent) => void

// 效果基础配置
export interface EffectOptions {
  /** 效果唯一标识 */
  id?: string
  /** 是否可见 */
  visible?: boolean
  /** 透明度 */
  opacity?: number
  /** z-index层级 */
  zIndex?: number
}

// 粒子效果配置
export interface ParticleEffectOptions extends EffectOptions {
  /** 粒子类型 */
  type: 'rain' | 'snow' | 'meteor' | 'custom'
  /** 粒子数量 */
  count?: number
  /** 粒子大小 */
  size?: number
  /** 粒子颜色 */
  color?: string
  /** 粒子速度 */
  speed?: number
  /** 粒子强度 */
  intensity?: number
  /** 自定义粒子图片 */
  image?: string
}

// 热力图配置
export interface HeatmapOptions {
  /** 热力图唯一标识 */
  id?: string
  /** 热力图数据 */
  data: Array<{
    lng: number
    lat: number
    value: number
    weight?: number
  }>
  /** 热力图半径 */
  radius?: number
  /** 颜色渐变 */
  gradient?: Record<number, string>
  /** 最大强度 */
  maxIntensity?: number
  /** 模糊程度 */
  blur?: number
  /** 透明度 */
  opacity?: number
  /** 是否可见 */
  visible?: boolean
}

// 地址搜索配置
export interface SearchOptions {
  /** 搜索查询 */
  query: string
  /** 搜索类型 */
  types?: string[]
  /** 搜索范围中心点 */
  proximity?: LngLat
  /** 搜索范围边界 */
  bbox?: LngLatBounds
  /** 国家代码限制 */
  country?: string[]
  /** 语言 */
  language?: string
  /** 最大结果数量 */
  limit?: number
}

// 搜索结果
export interface SearchResult {
  /** 结果唯一标识 */
  id: string
  /** 地点名称 */
  place_name: string
  /** 地点类型 */
  place_type: string[]
  /** 坐标 */
  center: LngLat
  /** 几何信息 */
  geometry: GeoJSON.Point
  /** 地址组件 */
  context: Array<{
    id: string
    text: string
    short_code?: string
  }>
  /** 相关性评分 */
  relevance: number
  /** 属性信息 */
  properties: Record<string, any>
}

// 地理编码配置
export interface GeocodingOptions {
  /** 地址字符串 */
  address?: string
  /** 坐标 */
  lngLat?: LngLat
  /** 语言 */
  language?: string
  /** 国家代码限制 */
  country?: string[]
  /** 地点类型 */
  types?: string[]
}

// 测距配置
export interface MeasurementOptions {
  /** 测量类型 */
  type: 'distance' | 'area'
  /** 测量点坐标 */
  coordinates: LngLat[]
  /** 单位 */
  unit?: 'meters' | 'kilometers' | 'feet' | 'miles' | 'square-meters' | 'square-kilometers' | 'acres' | 'hectares'
  /** 样式配置 */
  style?: {
    lineColor?: string
    lineWidth?: number
    fillColor?: string
    fillOpacity?: number
    pointColor?: string
    pointRadius?: number
  }
}

// 测量结果
export interface MeasurementResult {
  /** 测量类型 */
  type: 'distance' | 'area'
  /** 测量值 */
  value: number
  /** 单位 */
  unit: string
  /** 格式化的显示文本 */
  displayText: string
  /** 测量几何信息 */
  geometry: GeoJSON.LineString | GeoJSON.Polygon
}

// 3D建筑效果配置
export interface Building3DEffectOptions extends EffectOptions {
  /** 建筑高度数据源 */
  heightProperty?: string
  /** 建筑颜色 */
  color?: string
  /** 建筑材质 */
  material?: 'basic' | 'phong' | 'lambert'
  /** 光照强度 */
  lightIntensity?: number
  /** 阴影效果 */
  shadows?: boolean
}

// 标记点配置
export interface MarkerOptions {
  /** 标记点唯一标识 */
  id?: string
  /** 标记点坐标 */
  lngLat: LngLat
  /** 标记点元素或HTML字符串 */
  element?: HTMLElement | string
  /** 标记点图标 */
  icon?: {
    /** 图标URL */
    url: string
    /** 图标大小 */
    size?: [number, number]
    /** 图标锚点 */
    anchor?: [number, number]
  }
  /** 标记点颜色 */
  color?: string
  /** 标记点大小 */
  size?: 'small' | 'medium' | 'large' | number
  /** 是否可拖拽 */
  draggable?: boolean
  /** 弹窗内容 */
  popup?: PopupOptions
  /** 自定义数据 */
  data?: any
}

// 弹窗配置
export interface PopupOptions {
  /** 弹窗内容 */
  content: string | HTMLElement
  /** 弹窗最大宽度 */
  maxWidth?: number
  /** 弹窗偏移量 */
  offset?: [number, number]
  /** 是否显示关闭按钮 */
  closeButton?: boolean
  /** 点击地图是否关闭弹窗 */
  closeOnClick?: boolean
  /** 弹窗类名 */
  className?: string
}

// 图层配置
export interface LayerOptions {
  /** 图层唯一标识 */
  id: string
  /** 图层类型 */
  type: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap' | 'fill-extrusion' | 'raster' | 'background'
  /** 数据源 */
  source: string | DataSource
  /** 图层样式 */
  paint?: Record<string, any>
  /** 图层布局 */
  layout?: Record<string, any>
  /** 过滤条件 */
  filter?: any[]
  /** 最小缩放级别 */
  minzoom?: number
  /** 最大缩放级别 */
  maxzoom?: number
  /** 是否可见 */
  visible?: boolean
}

// 数据源配置
export interface DataSource {
  /** 数据源类型 */
  type: 'geojson' | 'vector' | 'raster' | 'image' | 'video'
  /** 数据URL或数据对象 */
  data?: string | GeoJSON.FeatureCollection
  /** 瓦片URL模板 */
  tiles?: string[]
  /** 数据源URL */
  url?: string
  /** 其他配置 */
  [key: string]: any
}

// 路径规划配置
export interface RoutingOptions {
  /** 起点坐标 */
  origin: LngLat
  /** 终点坐标 */
  destination: LngLat
  /** 途经点坐标 */
  waypoints?: LngLat[]
  /** 路径类型 */
  profile?: 'driving' | 'walking' | 'cycling' | 'driving-traffic'
  /** 是否返回步骤 */
  steps?: boolean
  /** 是否返回几何信息 */
  geometry?: boolean
  /** 语言 */
  language?: string
}

// 路径结果
export interface RouteResult {
  /** 路径几何信息 */
  geometry: GeoJSON.LineString
  /** 总距离（米） */
  distance: number
  /** 总时间（秒） */
  duration: number
  /** 路径步骤 */
  steps?: RouteStep[]
}

// 路径步骤
export interface RouteStep {
  /** 步骤几何信息 */
  geometry: GeoJSON.LineString
  /** 距离（米） */
  distance: number
  /** 时间（秒） */
  duration: number
  /** 指令 */
  instruction: string
  /** 方向 */
  maneuver: {
    type: string
    instruction: string
    bearing_after: number
    bearing_before: number
    location: LngLat
  }
}

// 地理围栏配置
export interface GeofenceOptions {
  /** 围栏唯一标识 */
  id: string
  /** 围栏几何形状 */
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
  /** 围栏名称 */
  name?: string
  /** 围栏描述 */
  description?: string
  /** 围栏样式 */
  style?: {
    fillColor?: string
    fillOpacity?: number
    strokeColor?: string
    strokeWidth?: number
    strokeOpacity?: number
  }
  /** 自定义数据 */
  data?: any
}

// 地理围栏事件
export interface GeofenceEvent {
  /** 事件类型 */
  type: 'enter' | 'exit'
  /** 围栏信息 */
  geofence: GeofenceOptions
  /** 触发点坐标 */
  lngLat: LngLat
  /** 时间戳 */
  timestamp: number
}

// 地图引擎抽象接口
export interface IMapEngine {
  /** 初始化地图 */
  initialize(options: MapOptions): Promise<void>

  /** 销毁地图 */
  destroy(): void

  /** 设置中心点 */
  setCenter(center: LngLat): void

  /** 获取中心点 */
  getCenter(): LngLat

  /** 设置缩放级别 */
  setZoom(zoom: number): void

  /** 获取缩放级别 */
  getZoom(): number

  /** 设置方位角 */
  setBearing(bearing: number): void

  /** 获取方位角 */
  getBearing(): number

  /** 设置倾斜角 */
  setPitch(pitch: number): void

  /** 获取倾斜角 */
  getPitch(): number

  /** 飞行到指定位置 */
  flyTo(options: FlyToOptions): Promise<void>

  /** 添加标记点 */
  addMarker(marker: MarkerOptions): string

  /** 移除标记点 */
  removeMarker(id: string): void

  /** 更新标记点 */
  updateMarker(id: string, options: Partial<MarkerOptions>): void

  /** 获取标记点 */
  getMarker(id: string): MarkerOptions | undefined

  /** 获取所有标记点 */
  getMarkers(): MarkerOptions[]

  /** 添加图层 */
  addLayer(layer: LayerOptions): void

  /** 移除图层 */
  removeLayer(id: string): void

  /** 更新图层 */
  updateLayer(id: string, options: Partial<LayerOptions>): void

  /** 显示/隐藏图层 */
  toggleLayer(id: string, visible: boolean): void

  /** 添加数据源 */
  addSource(id: string, source: DataSource): void

  /** 移除数据源 */
  removeSource(id: string): void

  /** 添加事件监听器 */
  on(event: string, listener: EventListener): void

  /** 移除事件监听器 */
  off(event: string, listener: EventListener): void

  /** 触发事件 */
  emit(event: string, data?: any): void

  /** 调整地图大小 */
  resize(): void

  /** 获取地图容器 */
  getContainer(): HTMLElement

  /** 获取地图边界 */
  getBounds(): LngLatBounds

  /** 设置地图边界 */
  fitBounds(bounds: LngLatBounds, options?: FitBoundsOptions): void

  /** 屏幕坐标转地理坐标 */
  unproject(point: [number, number]): LngLat

  /** 地理坐标转屏幕坐标 */
  project(lngLat: LngLat): [number, number]

  /** 获取原始地图实例 */
  getMapInstance(): any
}

// 适合边界选项
export interface FitBoundsOptions {
  /** 内边距 */
  padding?: number | {
    top: number
    bottom: number
    left: number
    right: number
  }
  /** 最大缩放级别 */
  maxZoom?: number
  /** 动画持续时间 */
  duration?: number
}

// 功能模块接口
export interface IFeatureModule {
  /** 模块名称 */
  readonly name: string

  /** 初始化模块 */
  initialize(mapEngine: IMapEngine): Promise<void>

  /** 销毁模块 */
  destroy(): void

  /** 是否已初始化 */
  isInitialized(): boolean
}

// 路径规划模块接口
export interface IRoutingModule extends IFeatureModule {
  /** 计算路径 */
  calculateRoute(options: RoutingOptions): Promise<RouteResult>

  /** 显示路径 */
  showRoute(route: RouteResult, options?: { color?: string; width?: number }): void

  /** 清除路径 */
  clearRoute(): void

  /** 获取当前路径 */
  getCurrentRoute(): RouteResult | null
}

// 地理围栏模块接口
export interface IGeofenceModule extends IFeatureModule {
  /** 添加围栏 */
  addGeofence(geofence: GeofenceOptions): void

  /** 移除围栏 */
  removeGeofence(id: string): void

  /** 更新围栏 */
  updateGeofence(id: string, options: Partial<GeofenceOptions>): void

  /** 检查点是否在围栏内 */
  isPointInGeofence(lngLat: LngLat, geofenceId: string): boolean

  /** 获取围栏 */
  getGeofence(id: string): GeofenceOptions | undefined

  /** 获取所有围栏 */
  getGeofences(): GeofenceOptions[]

  /** 监听围栏事件 */
  onGeofenceEvent(callback: (event: GeofenceEvent) => void): void
}

// 热力图模块接口
export interface IHeatmapModule extends IFeatureModule {
  /** 添加热力图 */
  addHeatmap(heatmap: HeatmapOptions): void

  /** 移除热力图 */
  removeHeatmap(id: string): void

  /** 更新热力图数据 */
  updateHeatmapData(id: string, data: HeatmapOptions['data']): void

  /** 设置热力图可见性 */
  setHeatmapVisibility(id: string, visible: boolean): void

  /** 获取热力图 */
  getHeatmap(id: string): HeatmapOptions | undefined
}

// 搜索模块接口
export interface ISearchModule extends IFeatureModule {
  /** 搜索地点 */
  search(options: SearchOptions): Promise<SearchResult[]>

  /** 地理编码 */
  geocode(options: GeocodingOptions): Promise<SearchResult[]>

  /** 反向地理编码 */
  reverseGeocode(lngLat: LngLat, options?: Partial<GeocodingOptions>): Promise<SearchResult[]>
}

// 测量模块接口
export interface IMeasurementModule extends IFeatureModule {
  /** 开始测距 */
  startDistanceMeasurement(): void

  /** 开始测面积 */
  startAreaMeasurement(): void

  /** 结束测量 */
  finishMeasurement(): MeasurementResult | null

  /** 取消测量 */
  cancelMeasurement(): void

  /** 清除所有测量 */
  clearMeasurements(): void

  /** 获取测量结果 */
  getMeasurements(): MeasurementResult[]

  /** 是否正在测量 */
  isMeasuring(): boolean
}

// 错误类型
export class MapError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'MapError'
  }
}

// 图层管理模块接口
export interface ILayerModule extends IFeatureModule {
  /** 添加图层 */
  addLayer(options: LayerOptions): Promise<string>
  /** 移除图层 */
  removeLayer(layerId: string): Promise<void>
  /** 切换图层可见性 */
  toggleLayer(layerId: string): Promise<boolean>
  /** 设置图层可见性 */
  setLayerVisibility(layerId: string, visible: boolean): Promise<void>
  /** 更新图层样式 */
  updateLayerStyle(layerId: string, style: LayerStyle): Promise<void>
  /** 更新图层数据 */
  updateLayerData(layerId: string, data: LayerData): Promise<void>
  /** 设置图层顺序 */
  setLayerOrder(layerId: string, beforeLayerId?: string): Promise<void>
  /** 获取图层信息 */
  getLayer(layerId: string): LayerOptions | null
  /** 获取所有图层 */
  getAllLayers(): LayerOptions[]
  /** 获取图层可见性 */
  getLayerVisibility(layerId: string): boolean
  /** 检查图层是否存在 */
  hasLayer(layerId: string): boolean
  /** 清除所有图层 */
  clearAllLayers(): Promise<void>
  /** 批量添加图层 */
  addLayers(layersOptions: LayerOptions[]): Promise<string[]>
  /** 批量移除图层 */
  removeLayers(layerIds: string[]): Promise<void>
  /** 获取图层统计信息 */
  getLayerStats(): {
    total: number
    visible: number
    hidden: number
    types: Record<string, number>
  }
}

// 图层相关类型定义
export interface LayerOptions {
  /** 图层ID */
  id?: string
  /** 图层类型 */
  type: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap' | 'fill-extrusion' | 'raster' | 'hillshade' | 'background'
  /** 数据源 */
  source?: string | LayerSource
  /** 源图层（用于矢量瓦片） */
  'source-layer'?: string
  /** 图层样式 */
  paint?: LayerStyle
  /** 图层布局 */
  layout?: LayerLayout
  /** 过滤器 */
  filter?: any[]
  /** 最小缩放级别 */
  minzoom?: number
  /** 最大缩放级别 */
  maxzoom?: number
  /** 图层元数据 */
  metadata?: Record<string, any>
}

export interface LayerSource {
  /** 数据源类型 */
  type: 'geojson' | 'vector' | 'raster' | 'raster-dem' | 'image' | 'video' | 'canvas'
  /** 数据URL或数据对象 */
  data?: string | GeoJSON.FeatureCollection | GeoJSON.Feature
  /** 瓦片URL模板 */
  tiles?: string[]
  /** 瓦片大小 */
  tileSize?: number
  /** 最小缩放级别 */
  minzoom?: number
  /** 最大缩放级别 */
  maxzoom?: number
  /** 边界框 */
  bounds?: [number, number, number, number]
  /** 其他属性 */
  [key: string]: any
}

export interface LayerStyle {
  /** 填充颜色 */
  'fill-color'?: string | any[]
  /** 填充透明度 */
  'fill-opacity'?: number | any[]
  /** 线条颜色 */
  'line-color'?: string | any[]
  /** 线条宽度 */
  'line-width'?: number | any[]
  /** 线条透明度 */
  'line-opacity'?: number | any[]
  /** 圆形颜色 */
  'circle-color'?: string | any[]
  /** 圆形半径 */
  'circle-radius'?: number | any[]
  /** 圆形透明度 */
  'circle-opacity'?: number | any[]
  /** 热力图权重 */
  'heatmap-weight'?: number | any[]
  /** 热力图强度 */
  'heatmap-intensity'?: number | any[]
  /** 热力图颜色 */
  'heatmap-color'?: string | any[]
  /** 其他样式属性 */
  [key: string]: any
}

export interface LayerLayout {
  /** 可见性 */
  visibility?: 'visible' | 'none'
  /** 符号放置 */
  'symbol-placement'?: 'point' | 'line' | 'line-center'
  /** 文本字段 */
  'text-field'?: string | any[]
  /** 文本字体 */
  'text-font'?: string[]
  /** 文本大小 */
  'text-size'?: number | any[]
  /** 图标图像 */
  'icon-image'?: string | any[]
  /** 图标大小 */
  'icon-size'?: number | any[]
  /** 其他布局属性 */
  [key: string]: any
}

export type LayerData = GeoJSON.FeatureCollection | GeoJSON.Feature | string

// 导出所有类型
export * from './events'
export * from './geometry'
