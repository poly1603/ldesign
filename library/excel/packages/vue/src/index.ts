/**
 * @ldesign/excel-viewer-vue
 * Excel 预览编辑插件 Vue 3 组件
 */

import ExcelViewer from './ExcelViewer.vue';
import type { App } from 'vue';

// 导出组件
export { ExcelViewer };

// 导出类型
export type {
  ExcelViewerOptions,
  SheetData,
  CellData,
  ExportOptions,
  SearchOptions,
  SearchResult,
  SelectionRange,
} from '@ldesign/excel-viewer-core';

// Vue 插件安装函数
export function install(app: App): void {
  app.component('ExcelViewer', ExcelViewer);
}

// 默认导出
export default {
  install,
  ExcelViewer,
};


