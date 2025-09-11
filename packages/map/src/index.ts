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
 * const map = new LDesignMap({
 *   container: '#map',
 *   center: [116.404, 39.915],
 *   zoom: 10,
 *   accessToken: 'your-mapbox-token'
 * })
 *
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
 * ```
 */

// 导出主要类
export { LDesignMap } from './core/LDesignMap'
export { MapboxEngine } from './core/MapboxEngine'

// 导出功能模块
export { RoutingModule } from './features/routing/RoutingModule'
export { GeofenceModule } from './features/geofence/GeofenceModule'
export { HeatmapModule } from './features/heatmap/HeatmapModule'
export { SearchModule } from './features/search/SearchModule'
export { MeasurementModule } from './features/measurement/MeasurementModule'
export { LayerModule } from './features/layers/LayerModule'
export { ThreeDModule } from './features/3d/ThreeDModule'
export { AdministrativeModule } from './features/administrative/AdministrativeModule'

// 导出框架适配器
export * as Vue from './adapters/vue'
export * as React from './adapters/react'
export * as Vanilla from './adapters/vanilla'

// 导出类型定义
export type {
  // 基础类型
  LngLat,
  LngLatBounds,
  MapEngineType,
  MapType,
  MapStyle,
  MapOptions,
  AnimationOptions,
  FlyToOptions,
  FitBoundsOptions,

  // 标记点和弹窗
  MarkerOptions,
  PopupOptions,

  // 图层和数据源
  LayerOptions,
  DataSource,

  // 路径规划
  RoutingOptions,
  RouteResult,
  RouteStep,

  // 地理围栏
  GeofenceOptions,
  GeofenceEvent,

  // 热力图
  HeatmapOptions,

  // 搜索
  SearchOptions,
  SearchResult,
  GeocodingOptions,

  // 测量
  MeasurementOptions,
  MeasurementResult,

  // 接口类型
  IMapEngine,
  IFeatureModule,
  IRoutingModule,
  IGeofenceModule,
  IHeatmapModule,
  ISearchModule,
  IMeasurementModule,

  // 错误类型
  MapError
} from './types'

// 导入样式
import './styles/index.less'

// 默认导出
export default LDesignMap

/**
 * 创建地图实例的便捷函数
 *
 * @param options 地图配置选项
 * @returns 地图实例
 *
 * @example
 * ```typescript
 * import { createMap } from '@ldesign/map'
 *
 * const map = await createMap({
 *   container: '#map',
 *   center: [116.404, 39.915],
 *   zoom: 10,
 *   accessToken: 'your-mapbox-token'
 * })
 * ```
 */
export async function createMap(options: MapOptions): Promise<LDesignMap> {
  const map = new LDesignMap(options)
  await map.initialize()
  return map
}

/**
 * 版本信息
 */
export const version = '1.0.0'

/**
 * 支持的地图引擎列表
 */
export const supportedEngines: MapEngineType[] = ['mapbox']

/**
 * 支持的地图类型列表
 */
export const supportedMapTypes: MapType[] = ['2d', '3d', 'administrative', 'custom']

/**
 * 默认配置选项
 */
export const defaultOptions: Partial<MapOptions> = {
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
  touchZoomRotate: true
}

/**
 * 常用城市坐标
 */
export const cities = {
  beijing: [116.404, 39.915] as LngLat,
  shanghai: [121.473, 31.230] as LngLat,
  guangzhou: [113.264, 23.129] as LngLat,
  shenzhen: [114.057, 22.543] as LngLat,
  hangzhou: [120.153, 30.287] as LngLat,
  nanjing: [118.796, 32.060] as LngLat,
  wuhan: [114.305, 30.593] as LngLat,
  chengdu: [104.066, 30.572] as LngLat,
  xian: [108.940, 34.341] as LngLat,
  chongqing: [106.551, 29.563] as LngLat
}

/**
 * 预设地图样式
 */
export const presetStyles = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  hybrid: 'mapbox://styles/mapbox/satellite-streets-v12',
  terrain: 'mapbox://styles/mapbox/outdoors-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11'
}

// 类型导入（用于重新导出）
import type {
  LngLat,
  MapEngineType,
  MapType,
  MapOptions
} from './types'
