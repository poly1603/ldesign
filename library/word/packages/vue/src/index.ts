/**
 * @word-viewer/vue
 * Vue 3 组件封装
 */

import WordViewerComponent from './WordViewer.vue';

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



