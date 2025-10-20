/**
 * Word Viewer 核心类型定义
 */

// 事件类型
export type EventType =
  | 'loaded'
  | 'error'
  | 'progress'
  | 'changed'
  | 'zoom'
  | 'page-change'
  | 'edit-start'
  | 'edit-end';

// 事件回调函数
export type EventCallback = (...args: any[]) => void;

// 文档来源类型
export type DocumentSource = File | Blob | ArrayBuffer | string;

// 查看器选项
export interface ViewerOptions {
  // 容器元素
  container?: HTMLElement;
  // 是否只读模式
  readOnly?: boolean;
  // 是否显示工具栏
  showToolbar?: boolean;
  // 初始缩放级别（0.5 - 3.0）
  initialZoom?: number;
  // 主题
  theme?: 'light' | 'dark' | 'auto';
  // 渲染引擎
  renderEngine?: 'docx-preview' | 'mammoth' | 'auto';
  // 是否启用编辑功能
  editable?: boolean;
  // 自定义样式
  customStyles?: string;
  // 是否显示页码
  showPageNumbers?: boolean;
  // 是否启用搜索
  enableSearch?: boolean;
  // 语言
  language?: 'zh-CN' | 'en-US';
  // 调试模式
  debug?: boolean;
}

// 文本格式
export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

// 搜索结果
export interface SearchResult {
  pageNumber: number;
  position: number;
  text: string;
  context: string;
}

// 文档信息
export interface DocumentInfo {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  description?: string;
  created?: Date;
  modified?: Date;
  pageCount?: number;
  wordCount?: number;
}

// 页面信息
export interface PageInfo {
  current: number;
  total: number;
}

// 导出选项
export interface ExportOptions {
  format: 'pdf' | 'html' | 'docx' | 'txt';
  includeImages?: boolean;
  includeStyles?: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// 插入图片选项
export interface InsertImageOptions {
  width?: number;
  height?: number;
  alignment?: 'left' | 'center' | 'right';
  wrapText?: boolean;
}

// 工具栏配置
export interface ToolbarConfig {
  items?: ToolbarItem[];
  customActions?: CustomAction[];
}

// 工具栏项
export type ToolbarItem =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'fontSize'
  | 'fontFamily'
  | 'color'
  | 'backgroundColor'
  | 'alignment'
  | 'insertImage'
  | 'insertTable'
  | 'search'
  | 'zoom'
  | 'print'
  | 'download'
  | 'separator';

// 自定义操作
export interface CustomAction {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
}

// 加载进度
export interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// 错误信息
export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
}

// 编辑状态
export interface EditState {
  isEditing: boolean;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

// 选择范围
export interface SelectionRange {
  start: number;
  end: number;
  text: string;
}



