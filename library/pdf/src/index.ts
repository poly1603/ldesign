/**
 * @ldesign/pdf-reader 主入口文件
 * 导出所有公共API和类型定义
 */

// 样式（确保示例与使用方直接引用源码时也能加载样式）
import './styles/index.less'

// 导入并导出核心类（需要在作用域中使用 PDFReader）
import { PDFReader } from './core/PDFReader'
export { PDFReader } from './core/PDFReader'
export { EventEmitter } from './core/EventEmitter'

// 导出类型定义
export type {
  PDFReaderOptions,
  PDFReaderEvents,
  PDFReaderState,
  PDFDocumentInfo,
  PDFPageInfo,
  PDFPageRenderOptions,
  PDFSearchOptions,
  PDFSearchResult,
  PDFPageCache,
  ToolbarButton,
  PDFReadingMode
} from './types'

// 导出工具函数
export {
  getElement,
  createElement,
  debounce,
  throttle,
  formatFileSize,
  isValidPageNumber,
  clamp,
  generateId,
  isBrowserSupported,
  getDevicePixelRatio,
  calculateFitScale,
  deepMerge
} from './utils'

// 版本信息
export const VERSION = '1.0.0'

// 默认配置
export const DEFAULT_CONFIG = {
  initialPage: 1,
  initialScale: 1.0,
  showToolbar: true,
  showThumbnails: true,
  enableSearch: true,
  enableAnnotations: true,
  readingMode: 'single' as const,
  theme: 'auto' as const,
  workerSrc: 'pdfjs-dist/build/pdf.worker.min.js'
}

/**
 * 创建PDF阅读器实例的便捷函数
 * @param options - 配置选项
 * @returns PDF阅读器实例
 */
export function createPDFReader(options: PDFReaderOptions): PDFReader {
  return new PDFReader(options)
}

/**
 * 检查浏览器兼容性
 * @returns 兼容性检查结果
 */
export function checkCompatibility(): {
  supported: boolean
  missing: string[]
} {
  const missing: string[] = []
  
  if (!window.ArrayBuffer) missing.push('ArrayBuffer')
  if (!window.Uint8Array) missing.push('Uint8Array')
  if (!window.Promise) missing.push('Promise')
  if (!window.Worker) missing.push('Worker')
  if (!document.createElement('canvas').getContext('2d')) missing.push('Canvas 2D Context')
  
  return {
    supported: missing.length === 0,
    missing
  }
}

// 默认导出（确保作用域内有 PDFReader 引用，或直接重导出默认）
export { PDFReader as default } from './core/PDFReader'
