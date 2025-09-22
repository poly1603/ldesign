/**
 * Vue专用类型定义
 */

import type { Ref, ComputedRef } from 'vue'
import type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeError,
  PerformanceMetric,
  CacheStats,
  QRCodeFormat,
} from '../types'

/**
 * Vue QRCode组件Props类型
 */
export interface QRCodeProps {
  /** QR码数据内容 */
  data?: string
  /** QR码文本内容（data的别名） */
  text?: string
  /** QR码尺寸 */
  size?: number
  /** 输出格式 */
  format?: QRCodeFormat
  /** 错误纠正级别 */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  /** 边距 */
  margin?: number
  /** 前景色 */
  color?: string
  /** 背景色 */
  backgroundColor?: string
  /** Logo配置 */
  logo?: {
    src: string
    size?: number
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
  }
  /** 样式配置 */
  style?: {
    cornerRadius?: number
    dotStyle?: 'square' | 'circle' | 'rounded'
    gradient?: {
      type: 'linear' | 'radial'
      colors: string[]
      direction?: number
    }
  }
  /** 是否启用缓存 */
  cache?: boolean
  /** 是否启用性能监控 */
  performance?: boolean
  /** 自定义CSS类名 */
  className?: string
  /** 自定义样式 */
  containerStyle?: Record<string, any>
  /** 是否显示下载按钮 */
  showDownload?: boolean
  /** 下载文件名 */
  downloadFilename?: string
}

/**
 * Vue QRCode组件事件类型
 */
export interface QRCodeEmits {
  /** QR码生成成功事件 */
  generated: [result: QRCodeResult]
  /** QR码生成失败事件 */
  error: [error: QRCodeError]
  /** 下载事件 */
  download: [filename: string, format: QRCodeFormat]
  /** 加载状态变化事件 */
  'loading-change': [loading: boolean]
}

/**
 * useQRCode Hook返回类型
 */
export interface UseQRCodeReturn {
  // 状态
  /** QR码生成结果 */
  result: Ref<QRCodeResult | null>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<QRCodeError | null>
  /** QR码选项 */
  options: Ref<QRCodeOptions>

  // 计算属性
  /** 是否已准备就绪 */
  isReady: ComputedRef<boolean>
  /** 数据URL */
  dataURL: ComputedRef<string | null>
  /** 输出格式 */
  format: ComputedRef<QRCodeFormat>
  /** DOM元素 */
  element: ComputedRef<HTMLElement | null>

  // 方法
  /** 生成QR码 */
  generate: (data?: string, options?: Partial<QRCodeOptions>) => Promise<QRCodeResult>
  /** 更新选项 */
  updateOptions: (newOptions: Partial<QRCodeOptions>) => void
  /** 重新生成 */
  regenerate: () => Promise<QRCodeResult>
  /** 下载QR码 */
  download: (filename?: string, format?: QRCodeFormat) => Promise<void>
  /** 清除缓存 */
  clearCache: () => void
  /** 获取性能指标 */
  getMetrics: () => PerformanceMetric[]
  /** 清除性能指标 */
  clearMetrics: () => void
  /** 获取缓存统计 */
  getCacheStats: () => CacheStats
  /** 重置状态 */
  reset: () => void
  /** 销毁实例 */
  destroy: () => void

  // 别名属性（向后兼容）
  /** 加载状态别名 */
  isLoading: Ref<boolean>
  /** 生成器实例（内部使用） */
  generator: any
}

/**
 * useQRCode Hook选项类型
 */
export interface UseQRCodeOptions extends Partial<QRCodeOptions> {
  /** 是否自动生成 */
  autoGenerate?: boolean
  /** 是否在组件卸载时自动销毁 */
  autoDestroy?: boolean
}

/**
 * Vue QRCode组件实例类型
 */
export interface QRCodeInstance {
  /** 重新生成QR码 */
  regenerate: () => Promise<QRCodeResult>
  /** 下载QR码 */
  download: (filename?: string, format?: QRCodeFormat) => Promise<void>
  /** 获取性能指标 */
  getMetrics: () => PerformanceMetric[]
  /** 获取缓存统计 */
  getCacheStats: () => CacheStats
  /** 清除缓存 */
  clearCache: () => void
  /** 重置状态 */
  reset: () => void
}

/**
 * Vue插件选项类型
 */
export interface QRCodePluginOptions {
  /** 全局默认选项 */
  defaultOptions?: Partial<QRCodeOptions>
  /** 组件名称 */
  componentName?: string
  /** 是否注册全局组件 */
  registerGlobally?: boolean
}
