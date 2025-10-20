/**
 * @word-viewer/react
 * React 组件封装
 */

import WordViewerComponent from './WordViewer';
export type { WordViewerProps, WordViewerRef } from './WordViewer';

export { WordViewerComponent };
export default WordViewerComponent;

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



