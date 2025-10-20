/**
 * @ldesign/excel-viewer-react
 * Excel 预览编辑插件 React 组件
 */

export { ExcelViewer } from './ExcelViewer';
export { useExcelViewer } from './useExcelViewer';

export type { ExcelViewerProps, ExcelViewerRef } from './ExcelViewer';
export type { UseExcelViewerOptions, UseExcelViewerReturn } from './useExcelViewer';

// 导出核心类型
export type {
  ExcelViewerOptions,
  SheetData,
  CellData,
  ExportOptions,
  SearchOptions,
  SearchResult,
  SelectionRange,
} from '@ldesign/excel-viewer-core';


