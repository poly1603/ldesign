/**
 * Excel 预览编辑插件类型定义
 */

import type { WorkBook, WorkSheet } from 'xlsx';

/**
 * 单元格数据类型
 */
export interface CellData {
  /** 单元格值 */
  v?: string | number | boolean | Date;
  /** 单元格类型 (s: 字符串, n: 数字, b: 布尔, d: 日期, e: 错误, z: 空) */
  t?: 's' | 'n' | 'b' | 'd' | 'e' | 'z';
  /** 单元格公式 */
  f?: string;
  /** 单元格格式 */
  z?: string;
  /** 样式信息 */
  s?: CellStyle;
  /** 原始值 */
  w?: string;
  /** 合并单元格信息 */
  mc?: MergeCell;
}

/**
 * 单元格样式
 */
export interface CellStyle {
  /** 字体 */
  font?: {
    name?: string;
    size?: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    color?: string;
  };
  /** 填充色 */
  fill?: {
    type?: 'pattern' | 'gradient';
    fgColor?: string;
    bgColor?: string;
    pattern?: string;
  };
  /** 边框 */
  border?: {
    top?: BorderStyle;
    bottom?: BorderStyle;
    left?: BorderStyle;
    right?: BorderStyle;
  };
  /** 对齐 */
  alignment?: {
    horizontal?: 'left' | 'center' | 'right' | 'fill' | 'justify';
    vertical?: 'top' | 'middle' | 'bottom';
    wrapText?: boolean;
    textRotation?: number;
  };
  /** 数字格式 */
  numFmt?: string;
}

/**
 * 边框样式
 */
export interface BorderStyle {
  style?: 'thin' | 'medium' | 'thick' | 'dotted' | 'dashed' | 'double';
  color?: string;
}

/**
 * 合并单元格
 */
export interface MergeCell {
  r: number; // 行
  c: number; // 列
  rs: number; // 行跨度
  cs: number; // 列跨度
}

/**
 * 工作表数据
 */
export interface SheetData {
  /** 工作表名称 */
  name: string;
  /** 工作表索引 */
  index: number;
  /** 单元格数据 */
  data: CellData[][];
  /** 行配置 */
  rows?: RowConfig[];
  /** 列配置 */
  columns?: ColumnConfig[];
  /** 合并单元格区域 */
  merges?: MergeCell[];
  /** 冻结配置 */
  frozen?: FrozenConfig;
  /** 筛选配置 */
  filter?: FilterConfig;
  /** 数据验证 */
  dataValidation?: DataValidation[];
  /** 条件格式 */
  conditionalFormats?: ConditionalFormat[];
}

/**
 * 行配置
 */
export interface RowConfig {
  /** 行索引 */
  index: number;
  /** 行高 */
  height?: number;
  /** 是否隐藏 */
  hidden?: boolean;
}

/**
 * 列配置
 */
export interface ColumnConfig {
  /** 列索引 */
  index: number;
  /** 列宽 */
  width?: number;
  /** 是否隐藏 */
  hidden?: boolean;
}

/**
 * 冻结配置
 */
export interface FrozenConfig {
  /** 冻结类型 */
  type: 'row' | 'column' | 'both';
  /** 冻结行数 */
  row?: number;
  /** 冻结列数 */
  column?: number;
}

/**
 * 筛选配置
 */
export interface FilterConfig {
  /** 筛选范围 */
  range: string;
  /** 筛选条件 */
  filters?: {
    column: number;
    values: (string | number)[];
  }[];
}

/**
 * 数据验证
 */
export interface DataValidation {
  /** 验证范围 */
  range: string;
  /** 验证类型 */
  type: 'list' | 'number' | 'date' | 'textLength' | 'custom';
  /** 验证条件 */
  condition?: any;
  /** 提示信息 */
  prompt?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 条件格式
 */
export interface ConditionalFormat {
  /** 应用范围 */
  range: string;
  /** 规则类型 */
  type: 'cellValue' | 'expression' | 'colorScale' | 'dataBar' | 'iconSet';
  /** 格式规则 */
  rule: any;
  /** 应用样式 */
  style?: CellStyle;
}

/**
 * Excel 查看器配置选项
 */
export interface ExcelViewerOptions {
  /** 容器元素 */
  container: string | HTMLElement;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否显示公式栏 */
  showFormulaBar?: boolean;
  /** 是否显示表格标签 */
  showSheetTabs?: boolean;
  /** 是否允许编辑 */
  allowEdit?: boolean;
  /** 是否允许复制 */
  allowCopy?: boolean;
  /** 是否允许粘贴 */
  allowPaste?: boolean;
  /** 是否启用虚拟滚动（大文件模式） */
  enableVirtualScroll?: boolean;
  /** 虚拟滚动行数阈值 */
  virtualScrollThreshold?: number;
  /** 语言 */
  lang?: 'zh' | 'en';
  /** 主题 */
  theme?: 'light' | 'dark';
  /** 自定义样式 */
  customStyle?: string;
  /** 事件钩子 */
  hooks?: ExcelViewerHooks;
  /** 性能配置 */
  performance?: {
    useWebWorker?: boolean;
    chunkSize?: number;
    lazyLoad?: boolean;
  };
}

/**
 * 事件钩子
 */
export interface ExcelViewerHooks {
  /** 文件加载前 */
  beforeLoad?: (file: File | ArrayBuffer) => boolean | Promise<boolean>;
  /** 文件加载后 */
  afterLoad?: (data: SheetData[]) => void;
  /** 单元格变化前 */
  beforeCellChange?: (
    sheetIndex: number,
    row: number,
    col: number,
    oldValue: any,
    newValue: any
  ) => boolean | Promise<boolean>;
  /** 单元格变化后 */
  afterCellChange?: (
    sheetIndex: number,
    row: number,
    col: number,
    oldValue: any,
    newValue: any
  ) => void;
  /** 单元格点击 */
  onCellClick?: (sheetIndex: number, row: number, col: number, value: any) => void;
  /** 单元格双击 */
  onCellDoubleClick?: (sheetIndex: number, row: number, col: number, value: any) => void;
  /** 选择变化 */
  onSelectionChange?: (range: SelectionRange) => void;
  /** 错误处理 */
  onError?: (error: Error) => void;
}

/**
 * 选择范围
 */
export interface SelectionRange {
  /** 工作表索引 */
  sheetIndex: number;
  /** 起始行 */
  startRow: number;
  /** 起始列 */
  startCol: number;
  /** 结束行 */
  endRow: number;
  /** 结束列 */
  endCol: number;
}

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 导出格式 */
  format: 'xlsx' | 'csv' | 'html' | 'json';
  /** 导出文件名 */
  filename?: string;
  /** 是否包含样式 */
  includeStyles?: boolean;
  /** 是否包含公式 */
  includeFormulas?: boolean;
  /** 导出的工作表（不指定则导出全部） */
  sheets?: number[] | string[];
}

/**
 * 搜索选项
 */
export interface SearchOptions {
  /** 搜索关键词 */
  keyword: string;
  /** 是否区分大小写 */
  caseSensitive?: boolean;
  /** 是否全字匹配 */
  matchWholeWord?: boolean;
  /** 搜索范围 */
  scope?: 'current' | 'all';
  /** 是否搜索公式 */
  searchFormulas?: boolean;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 工作表索引 */
  sheetIndex: number;
  /** 工作表名称 */
  sheetName: string;
  /** 行号 */
  row: number;
  /** 列号 */
  col: number;
  /** 单元格值 */
  value: any;
  /** 匹配位置 */
  matchIndex: number;
}

/**
 * 事件类型
 */
export type EventType =
  | 'load'
  | 'loadError'
  | 'cellChange'
  | 'cellClick'
  | 'cellDoubleClick'
  | 'selectionChange'
  | 'sheetChange'
  | 'beforeEdit'
  | 'afterEdit'
  | 'export'
  | 'error'
  | 'destroy';

/**
 * 事件监听器
 */
export type EventListener = (...args: any[]) => void;

/**
 * Luckysheet 配置
 */
export interface LuckysheetConfig {
  container?: string;
  lang?: string;
  data?: any[];
  title?: string;
  userInfo?: string;
  myFolderUrl?: string;
  devicePixelRatio?: number;
  allowCopy?: boolean;
  allowEdit?: boolean;
  showToolbar?: boolean;
  showFormulaBar?: boolean;
  showsheetbar?: boolean;
  showstatisticBar?: boolean;
  sheetFormulaBar?: boolean;
  enableAddRow?: boolean;
  enableAddCol?: boolean;
  userMenuItem?: any[];
  hook?: any;
}


