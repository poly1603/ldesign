/**
 * @ldesign/excel-viewer-core
 * Excel 预览编辑插件核心库
 */

export { ExcelViewer } from './viewer';
export { ExcelParser } from './parser';
export { ExcelRenderer } from './renderer';
export { ExcelExporter } from './exporter';

export type {
  // 核心类型
  CellData,
  CellStyle,
  BorderStyle,
  MergeCell,
  SheetData,
  RowConfig,
  ColumnConfig,
  FrozenConfig,
  FilterConfig,
  DataValidation,
  ConditionalFormat,
  
  // 配置选项
  ExcelViewerOptions,
  ExcelViewerHooks,
  LuckysheetConfig,
  
  // 功能类型
  SelectionRange,
  ExportOptions,
  SearchOptions,
  SearchResult,
  
  // 事件类型
  EventType,
  EventListener,
} from './types';

// 默认导出
import { ExcelViewer as DefaultExport } from './viewer';
export default DefaultExport;

