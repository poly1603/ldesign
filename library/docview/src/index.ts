// 核心类和接口
export { DocumentViewer } from './core/document-viewer'
export { WordViewer } from './core/word-viewer'
export { ExcelViewer } from './core/excel-viewer'
export { PowerPointViewer } from './core/powerpoint-viewer'

// 类型定义
export type {
  DocumentType,
  DocumentViewerOptions,
  DocumentInfo,
  DocumentContent,
  IDocumentViewer,
  ToolbarConfig,
  ToolbarItem,
  ThemeConfig,
  CallbackConfig
} from './types'

export {
  DocumentViewerError,
  ErrorCode
} from './types'

// 工具函数
export {
  detectDocumentType,
  getContainer,
  readFileAsArrayBuffer,
  readFileAsText,
  fetchFile,
  createDownloadLink,
  formatFileSize,
  debounce,
  throttle
} from './utils'

// 默认导出主类
export default DocumentViewer
