/**
 * 几何图形和地理数据类型定义
 * 支持GeoJSON标准和自定义几何类型
 */

// 基础坐标类型
export type Position = [number, number] | [number, number, number] // [lng, lat] 或 [lng, lat, elevation]
export type BBox = [number, number, number, number] // [west, south, east, north]

// GeoJSON几何类型
export interface Point {
  type: 'Point'
  coordinates: Position
}

export interface MultiPoint {
  type: 'MultiPoint'
  coordinates: Position[]
}

export interface LineString {
  type: 'LineString'
  coordinates: Position[]
}

export interface MultiLineString {
  type: 'MultiLineString'
  coordinates: Position[][]
}

export interface Polygon {
  type: 'Polygon'
  coordinates: Position[][]
}

export interface MultiPolygon {
  type: 'MultiPolygon'
  coordinates: Position[][][]
}

export interface GeometryCollection {
  type: 'GeometryCollection'
  geometries: Geometry[]
}

// 几何类型联合
export type Geometry = 
  | Point 
  | MultiPoint 
  | LineString 
  | MultiLineString 
  | Polygon 
  | MultiPolygon 
  | GeometryCollection

// GeoJSON特征
export interface Feature<G extends Geometry = Geometry, P = any> {
  type: 'Feature'
  geometry: G
  properties: P
  id?: string | number
}

// GeoJSON特征集合
export interface FeatureCollection<G extends Geometry = Geometry, P = any> {
  type: 'FeatureCollection'
  features: Feature<G, P>[]
  bbox?: BBox
}

// GeoJSON对象类型
export type GeoJSON = Geometry | Feature | FeatureCollection

// 样式相关类型
export interface StyleOptions {
  /** 填充颜色 */
  fillColor?: string
  /** 填充透明度 */
  fillOpacity?: number
  /** 边框颜色 */
  strokeColor?: string
  /** 边框宽度 */
  strokeWidth?: number
  /** 边框透明度 */
  strokeOpacity?: number
  /** 边框样式 */
  strokeDashArray?: number[]
  /** 点的半径 */
  radius?: number
  /** 点的图标 */
  icon?: string
  /** 图标大小 */
  iconSize?: [number, number]
  /** 图标锚点 */
  iconAnchor?: [number, number]
  /** 文本标签 */
  label?: string
  /** 文本颜色 */
  labelColor?: string
  /** 文本大小 */
  labelSize?: number
  /** 文本偏移 */
  labelOffset?: [number, number]
}

// 图层数据源类型
export interface DataSource {
  /** 数据源类型 */
  type: 'geojson' | 'vector' | 'raster' | 'image' | 'video'
  /** 数据URL或数据对象 */
  data?: string | GeoJSON
  /** 瓦片URL模板 */
  tiles?: string[]
  /** 瓦片大小 */
  tileSize?: number
  /** 最小缩放级别 */
  minzoom?: number
  /** 最大缩放级别 */
  maxzoom?: number
  /** 数据边界 */
  bounds?: BBox
  /** 数据属性 */
  attribution?: string
}

// 图层配置
export interface LayerOptions {
  /** 图层ID */
  id: string
  /** 图层类型 */
  type: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap' | 'fill-extrusion' | 'raster' | 'background'
  /** 数据源 */
  source: string | DataSource
  /** 源图层（用于矢量瓦片） */
  'source-layer'?: string
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
  /** 图层可见性 */
  visibility?: 'visible' | 'none'
}

// 标记点配置
export interface MarkerOptions {
  /** 标记位置 */
  lngLat: Position
  /** 标记元素 */
  element?: HTMLElement
  /** 标记偏移 */
  offset?: [number, number]
  /** 标记锚点 */
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** 标记颜色 */
  color?: string
  /** 标记大小 */
  scale?: number
  /** 是否可拖拽 */
  draggable?: boolean
  /** 旋转角度 */
  rotation?: number
  /** 透明度 */
  opacity?: number
  /** 点击事件 */
  onClick?: (marker: any) => void
  /** 拖拽事件 */
  onDrag?: (marker: any) => void
}

// 弹窗配置
export interface PopupOptions {
  /** 弹窗位置 */
  lngLat?: Position
  /** 弹窗内容 */
  content: string | HTMLElement
  /** 弹窗偏移 */
  offset?: [number, number]
  /** 弹窗锚点 */
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** 最大宽度 */
  maxWidth?: string
  /** 是否显示关闭按钮 */
  closeButton?: boolean
  /** 点击地图是否关闭 */
  closeOnClick?: boolean
  /** 按ESC是否关闭 */
  closeOnEscape?: boolean
  /** CSS类名 */
  className?: string
}

// 控件配置
export interface ControlOptions {
  /** 控件位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** 控件元素 */
  element?: HTMLElement
  /** 控件类名 */
  className?: string
}

// 导航控件配置
export interface NavigationControlOptions extends ControlOptions {
  /** 是否显示缩放按钮 */
  showZoom?: boolean
  /** 是否显示指南针 */
  showCompass?: boolean
  /** 是否可视化倾斜和方位角 */
  visualizePitch?: boolean
}

// 比例尺控件配置
export interface ScaleControlOptions extends ControlOptions {
  /** 最大宽度 */
  maxWidth?: number
  /** 单位 */
  unit?: 'imperial' | 'metric' | 'nautical'
}

// 全屏控件配置
export interface FullscreenControlOptions extends ControlOptions {
  /** 全屏容器 */
  container?: HTMLElement
}
