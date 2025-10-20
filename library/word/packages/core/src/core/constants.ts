/**
 * 常量配置
 */

// 默认配置
export const DEFAULT_OPTIONS = {
  readOnly: false,
  showToolbar: true,
  initialZoom: 1.0,
  theme: 'light' as const,
  renderEngine: 'auto' as const,
  editable: false,
  showPageNumbers: true,
  enableSearch: true,
  language: 'zh-CN' as const,
  debug: false,
};

// 支持的文件类型
export const SUPPORTED_FILE_TYPES = {
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC: 'application/msword',
};

// 支持的文件扩展名
export const SUPPORTED_EXTENSIONS = ['.docx', '.doc'];

// 缩放范围
export const ZOOM_RANGE = {
  MIN: 0.5,
  MAX: 3.0,
  STEP: 0.1,
};

// 事件名称
export const EVENTS = {
  LOADED: 'loaded',
  ERROR: 'error',
  PROGRESS: 'progress',
  CHANGED: 'changed',
  ZOOM: 'zoom',
  PAGE_CHANGE: 'page-change',
  EDIT_START: 'edit-start',
  EDIT_END: 'edit-end',
} as const;

// 错误代码
export const ERROR_CODES = {
  INVALID_FILE: 'INVALID_FILE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  LOAD_FAILED: 'LOAD_FAILED',
  PARSE_FAILED: 'PARSE_FAILED',
  RENDER_FAILED: 'RENDER_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// CSS 类名前缀
export const CLASS_PREFIX = 'word-viewer';

// 默认工具栏项
export const DEFAULT_TOOLBAR_ITEMS = [
  'bold',
  'italic',
  'underline',
  'separator',
  'fontSize',
  'fontFamily',
  'separator',
  'alignment',
  'separator',
  'search',
  'zoom',
  'separator',
  'print',
  'download',
] as const;


