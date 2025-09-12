/**
 * 类型定义主入口文件
 * 导出所有类型定义
 */

// 地图相关类型
export type {
  MapConfig,
  MapStyle,
  MapViewState,
  MapSize,
  MapOperationOptions,
  ZoomOptions,
  PanOptions,
  FitOptions,
  CoordinateTransformResult,
  IMapInstance
} from './map';

// 图层相关类型
export type {
  BaseLayerConfig,
  TileLayerConfig,
  WMSLayerConfig,
  WMTSLayerConfig,
  VectorLayerConfig,
  HeatmapLayerConfig,
  ImageLayerConfig,
  LayerConfig,
  LayerState,
  LayerOperationOptions,
  ILayerManager
} from './layer';

export { LayerType } from './layer';

// 标记相关类型
export type {
  MarkerConfig,
  MarkerIcon,
  PopupConfig,
  InfoWindowConfig,
  MarkerClusterConfig,
  MarkerState,
  MarkerOperationOptions,
  MarkerEventData,
  IMarkerManager
} from './marker';

// 事件相关类型
export type {
  BaseEventData,
  MapClickEventData,
  MapMouseEventData,
  MapViewEventData,
  LayerEventData,
  MarkerEventData as MarkerEventDataType,
  DrawEventData,
  EditEventData,
  SelectEventData,
  EventData,
  EventListener,
  EventListenerOptions,
  IEventManager
} from './event';

export { MapEventType } from './event';

// 绘制工具相关类型
export type {
  DrawConfig,
  DrawStyle,
  DrawFeatureConfig,
  MeasurementResult,
  EditConfig,
  DrawState,
  DrawOperationOptions,
  IDrawingTools
} from './drawing';

export { DrawType, DrawMode } from './drawing';

// 控件相关类型
export type {
  ControlConfig,
  ZoomControlConfig,
  ScaleLineControlConfig,
  MousePositionControlConfig,
  OverviewMapControlConfig,
  FullScreenControlConfig,
  ControlState,
  ControlOperationOptions,
  IControlManager
} from './control';

export { ControlType } from './control';
export type { ControlPosition } from './control';

// 样式相关类型
export type {
  ColorConfig,
  FontConfig,
  SizeConfig,
  SpacingConfig,
  BorderRadiusConfig,
  ShadowConfig,
  ThemeConfig,
  StyleConfig,
  StyleOperationOptions,
  IStyleManager
} from './style';

export type { MapTheme as MapThemeName } from './style';

// 通用工具类型
export interface Point2D {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;
  height: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSLA extends HSL {
  a: number;
}

// 颜色类型联合
export type Color = string | RGB | RGBA | HSL | HSLA;

// 动画相关类型
export interface AnimationOptions {
  duration?: number;
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | ((t: number) => number);
  delay?: number;
  repeat?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// 缓存相关类型
export interface CacheOptions {
  enabled?: boolean;
  maxSize?: number;
  maxAge?: number;
  strategy?: 'lru' | 'fifo' | 'lfu';
}

// 性能监控类型
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
  loadTime: number;
  tileLoadTime: number;
  featureCount: number;
}

// 错误类型
export interface MapError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  stack?: string;
}

// 日志级别
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// 日志配置
export interface LogConfig {
  level: LogLevel;
  enabled: boolean;
  console: boolean;
  file?: string;
  maxSize?: number;
  maxFiles?: number;
}

// 插件接口
export interface IMapPlugin {
  name: string;
  version: string;
  install(map: IMapInstance): void;
  uninstall(map: IMapInstance): void;
}

// 中间件接口
export interface IMapMiddleware {
  name: string;
  before?(context: any): void;
  after?(context: any): void;
  error?(error: MapError, context: any): void;
}

// 配置验证结果
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// 地理编码结果
export interface GeocodingResult {
  address: string;
  coordinate: [number, number];
  confidence: number;
  type: 'exact' | 'approximate' | 'interpolated';
  components: {
    country?: string;
    region?: string;
    city?: string;
    district?: string;
    street?: string;
    number?: string;
    postalCode?: string;
  };
}

// 路径规划结果
export interface RoutingResult {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  instructions: Array<{
    text: string;
    distance: number;
    duration: number;
    coordinate: [number, number];
  }>;
  waypoints: [number, number][];
}

// 地理围栏
export interface Geofence {
  id: string;
  name: string;
  geometry: any; // GeoJSON geometry
  properties?: Record<string, any>;
  events?: {
    enter?: (data: any) => void;
    exit?: (data: any) => void;
    dwell?: (data: any) => void;
  };
}

// 热力图数据点
export interface HeatmapDataPoint {
  coordinate: [number, number];
  weight: number;
  properties?: Record<string, any>;
}

// 聚类数据
export interface ClusterData {
  coordinate: [number, number];
  count: number;
  features: any[];
  bounds: Bounds;
}

// 瓦片信息
export interface TileInfo {
  x: number;
  y: number;
  z: number;
  url: string;
  loaded: boolean;
  loading: boolean;
  error?: string;
}

// 地图主题
export interface MapTheme {
  name: string;
  colors: {
    primary: Color;
    secondary: Color;
    background: Color;
    text: Color;
    border: Color;
    accent: Color;
  };
  styles: {
    map: MapStyle;
    marker: DrawStyle;
    popup: any;
    control: any;
  };
}

// 测量相关类型
export type {
  MeasureResult,
  MeasureConfig,
  MeasureOptions,
  MeasureEventData,
  IMeasureTools
} from './measure';

export { MeasureType } from './measure';

// 坐标转换相关类型
export type {
  Coordinate,
  Extent,
  CoordinateTransformResult,
  ICoordinateUtils
} from './coordinate';

export { CoordinateSystem } from './coordinate';

// 绘制工具相关类型（更新）
export type {
  DrawingConfig,
  DrawingState,
  DrawingOptions,
  DrawingEventData,
  IDrawingTools
} from './drawing';

// 路径规划相关类型
export type {
  RoutingOptions,
  RouteInfo,
  RouteInstruction,
  NavigationState,
  RouteAnimationOptions,
  RouteEventData,
  IRoutingManager
} from './routing';

export { RoutingProfile, RoutingOptimization, InstructionType, RouteEventType } from './routing';

// 地理围栏相关类型
export type {
  GeofenceOptions,
  GeofenceInfo,
  GeofenceEventData,
  LocationTrackingState,
  GeofenceStatistics,
  IGeofenceManager
} from './geofence';

export { GeofenceGeometryType, GeofenceEventType } from './geofence';

// 热力图相关类型
export type {
  HeatmapOptions,
  HeatmapInfo,
  HeatmapDataPoint as HeatmapPoint,
  HeatmapStatistics,
  HeatmapHotspot,
  HeatmapEventData,
  IHeatmapManager
} from './heatmap';

export { HeatmapUpdateMode, HeatmapAnimationType, HeatmapEventType, HeatmapExportFormat } from './heatmap';

// 地址搜索相关类型
export type {
  SearchOptions,
  SearchResult,
  SearchSuggestion,
  SearchHistory,
  SearchStatistics,
  GeocodingOptions,
  ReverseGeocodingOptions,
  SearchEventData,
  ISearchManager
} from './search';

export { SearchType, SearchProvider, SearchResultType, SearchEventType } from './search';

// 导出所有类型的命名空间
export namespace LDesignMapTypes {
  export type Config = MapConfig;
  export type Instance = IMapInstance;
  export type Layer = LayerConfig;
  export type Marker = MarkerConfig;
  export type Event = EventData;
  export type Drawing = DrawConfig;
  export type Theme = MapTheme;
  export type Error = MapError;
  export type Plugin = IMapPlugin;
  export type Middleware = IMapMiddleware;
  export type Measure = MeasureResult;
  export type CoordinateTransform = CoordinateTransformResult;
  export type Routing = RouteInfo;
  export type Geofence = GeofenceInfo;
  export type Heatmap = HeatmapInfo;
  export type Search = SearchResult;
}
