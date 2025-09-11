/**
 * React 适配器类型定义
 */

import type { ReactNode } from 'react'
import type { LDesignMap } from '../../core/LDesignMap'
import type { MapOptions, MarkerOptions, LngLat } from '../../types'

/**
 * React地图配置选项
 */
export interface ReactMapOptions extends MapOptions {
  /** 是否自动初始化 */
  autoInit?: boolean
}

/**
 * React地图实例
 */
export interface ReactMapInstance {
  /** 地图实例 */
  map: LDesignMap | null
  /** 是否已初始化 */
  isInitialized: boolean
  /** 是否正在加载 */
  isLoading: boolean
  /** 错误信息 */
  error: Error | null
  /** 地图中心点 */
  center: LngLat
  /** 缩放级别 */
  zoom: number
  /** 方位角 */
  bearing: number
  /** 倾斜角 */
  pitch: number
  /** 标记点列表 */
  markers: MarkerOptions[]
  
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
  /** 设置中心点 */
  setCenter: (center: LngLat) => void
  /** 设置缩放级别 */
  setZoom: (zoom: number) => void
  /** 设置方位角 */
  setBearing: (bearing: number) => void
  /** 设置倾斜角 */
  setPitch: (pitch: number) => void
}

/**
 * React地图组件属性
 */
export interface ReactMapProps {
  /** 地图配置选项 */
  options: ReactMapOptions
  /** 标记点列表 */
  markers?: MarkerOptions[]
  /** 是否显示默认控件 */
  showDefaultControls?: boolean
  /** 是否显示地图信息 */
  showMapInfo?: boolean
  /** 地图高度 */
  height?: string | number
  /** 地图宽度 */
  width?: string | number
  /** CSS类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  
  // 事件处理器
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
  /** 地图状态更新 */
  onUpdate?: (state: { center: LngLat; zoom: number; bearing: number; pitch: number }) => void
  
  // 插槽内容
  /** 加载状态内容 */
  loadingContent?: ReactNode
  /** 错误状态内容 */
  errorContent?: (error: Error, retry: () => void) => ReactNode
  /** 控件内容 */
  controlsContent?: (mapInstance: ReactMapInstance) => ReactNode
  /** 信息内容 */
  infoContent?: (state: { center: LngLat; zoom: number; bearing: number; pitch: number }) => ReactNode
}
