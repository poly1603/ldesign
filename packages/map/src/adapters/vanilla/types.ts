/**
 * 原生JavaScript适配器类型定义
 */

import type { LDesignMap } from '../../core/LDesignMap'
import type { MapOptions, MarkerOptions, LngLat } from '../../types'

/**
 * 原生JavaScript地图配置选项
 */
export interface VanillaMapOptions extends MapOptions {
  /** 是否自动初始化 */
  autoInit?: boolean
  /** 是否显示加载状态 */
  showLoading?: boolean
  /** 是否显示错误状态 */
  showError?: boolean
  /** 自定义加载内容 */
  loadingContent?: string | HTMLElement
  /** 自定义错误内容 */
  errorContent?: string | HTMLElement | ((error: Error, retry: () => void) => HTMLElement)
}

/**
 * 原生JavaScript地图实例
 */
export interface VanillaMapInstance {
  /** 地图实例 */
  map: LDesignMap | null
  /** 容器元素 */
  container: HTMLElement
  /** 是否已初始化 */
  isInitialized: boolean
  /** 是否正在加载 */
  isLoading: boolean
  /** 错误信息 */
  error: Error | null
  
  // 方法
  /** 初始化地图 */
  initialize: () => Promise<void>
  /** 销毁地图 */
  destroy: () => void
  /** 显示加载状态 */
  showLoadingState: () => void
  /** 隐藏加载状态 */
  hideLoadingState: () => void
  /** 显示错误状态 */
  showErrorState: (error: Error) => void
  /** 隐藏错误状态 */
  hideErrorState: () => void
  /** 重试初始化 */
  retry: () => Promise<void>
  
  // 事件方法
  /** 添加事件监听器 */
  on: (event: string, listener: EventListener) => void
  /** 移除事件监听器 */
  off: (event: string, listener: EventListener) => void
  /** 触发事件 */
  emit: (event: string, data?: any) => void
}
