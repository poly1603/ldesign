/**
 * @word-viewer/lit
 * Lit Web Component 导出
 */

export { WordViewerElement } from './word-viewer';

// 重新导出核心类型
export type {
  ViewerOptions,
  DocumentSource,
  SearchResult,
  TextFormat,
  DocumentInfo,
  PageInfo,
  ExportOptions,
  EventType,
  EventCallback,
} from '@word-viewer/core';

// 重新导出核心类
export { WordViewer } from '@word-viewer/core';



