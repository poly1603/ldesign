/**
 * Vue 3 适配器类型定义
 */

import type { Ref } from 'vue'
import type { LDesignMap } from '../../core/LDesignMap'
import type { MapOptions, MarkerOptions, LngLat } from '../../types'

/**
 * Vue地图配置选项
 */
export interface VueMapOptions extends MapOptions {
  /** 是否自动初始化 */
  autoInit?: boolean
  /** 是否响应式更新 */
  reactive?: boolean
}

/**
 * Vue地图实例
 */
export interface VueMapInstance {
  /** 地图实例 */
  map: Ref<LDesignMap | null>
  /** 是否已初始化 */
  isInitialized: Ref<boolean>
  /** 是否正在加载 */
  isLoading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 地图中心点 */
  center: Ref<LngLat>
  /** 缩放级别 */
  zoom: Ref<number>
  /** 方位角 */
  bearing: Ref<number>
  /** 倾斜角 */
  pitch: Ref<number>
  /** 标记点列表 */
  markers: Ref<MarkerOptions[]>
  
  // 方法
  /** 初始化地图 */
  initialize: () => Promise<void>
  /** 销毁地图 */
  destroy: () => void
  /** 飞行到指定位置 */
  flyTo: (options: { center?: LngLat; zoom?: number; bearing?: number; pitch?: number; duration?: number }) => Promise<void>
  /** 添加标记点 */
  addMarker: (marker: MarkerOptions) => string
  /** 移除标记点 */
  removeMarker: (id: string) => void
  /** 清除所有标记点 */
  clearMarkers: () => void
}

/**
 * Vue地图事件
 */
export interface VueMapEvents {
  /** 地图加载完成 */
  onLoad?: () => void
  /** 地图点击 */
  onClick?: (event: { lngLat: LngLat; point: [number, number] }) => void
  /** 地图移动 */
  onMove?: () => void
  /** 地图缩放 */
  onZoom?: () => void
  /** 标记点点击 */
  onMarkerClick?: (marker: MarkerOptions) => void
  /** 错误处理 */
  onError?: (error: Error) => void
}
