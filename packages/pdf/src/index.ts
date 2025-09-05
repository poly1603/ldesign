/**
 * @ldesign/pdf - PDF预览器库
 * 
 * 一个功能完整的PDF预览器库，支持多种框架集成
 * 提供PDF文档加载、页面渲染、缩放、旋转、搜索等功能
 */

import { PdfViewer } from './core/pdf-viewer'

// 核心类型导出
export type {
  PdfInput,
  RenderMode,
  ZoomMode,
  RotationAngle,
  PdfPageInfo,
  PdfDocumentInfo,
  RenderOptions,
  SearchOptions,
  SearchResult,
  ThumbnailOptions,
  PrintOptions,
  DownloadOptions,
  PdfViewerConfig,
  PdfViewerEvents,
  PdfViewerState,
  IPdfViewer,
  IPdfPageRenderer,
  IPdfDocumentManager,
} from './core/types'

// 核心类导出
export { PdfViewer } from './core/pdf-viewer'
export { PdfDocumentManager } from './core/document-manager'
export { PdfPageRenderer } from './core/page-renderer'
export { EventManager } from './core/event-manager'

// 工具函数导出
export {
  isValidPdfInput,
  isPdfFile,
  isPdfUrl,
  fileToArrayBuffer,
  arrayBufferToUint8Array,
  isPdfArrayBuffer,
  formatFileSize,
  getFileNameFromUrl,
  validateAndNormalizePdfInput,
  createDownloadUrl,
  revokeDownloadUrl,
  isBrowserSupportPdf,
  getBrowserInfo,
} from './utils/file-utils'

export {
  CacheManager,
  PdfPageCacheManager,
  RenderCacheManager,
  ThumbnailCacheManager,
} from './utils/cache-manager'

// 便捷创建函数
export function createPdfViewer(config: import('./core/types').PdfViewerConfig): import('./core/types').IPdfViewer {
  return new PdfViewer(config)
}

// 版本信息
export const version = '0.1.0'
