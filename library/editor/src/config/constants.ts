/**
 * 全局常量配置
 * 集中管理所有魔法数字和配置项
 */

/**
 * 编辑器核心配置
 */
export const EDITOR_CONFIG = {
  /** 历史记录最大数量 */
  MAX_HISTORY_SIZE: 100,
  
  /** 自动保存延迟（毫秒） */
  AUTO_SAVE_DELAY: 3000,
  
  /** 防抖延迟（毫秒） */
  DEBOUNCE_DELAY: 300,
  
  /** 最小编辑器高度 */
  MIN_EDITOR_HEIGHT: 200,
  
  /** 默认占位符 */
  DEFAULT_PLACEHOLDER: '请输入内容...'
} as const

/**
 * 文件上传配置
 */
export const FILE_CONFIG = {
  /** 最大文件大小（10MB） */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  /** 支持的图片类型 */
  SUPPORTED_IMAGE_TYPES: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  
  /** 支持的视频类型 */
  SUPPORTED_VIDEO_TYPES: [
    'video/mp4',
    'video/webm',
    'video/ogg'
  ],
  
  /** 支持的音频类型 */
  SUPPORTED_AUDIO_TYPES: [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg'
  ]
} as const

/**
 * UI 层级配置
 */
export const UI_CONFIG = {
  /** 右键菜单层级 */
  CONTEXT_MENU_Z_INDEX: 9999,
  
  /** 对话框层级 */
  DIALOG_Z_INDEX: 10000,
  
  /** 提示层级 */
  TOOLTIP_Z_INDEX: 10001,
  
  /** 工具栏高度 */
  TOOLBAR_HEIGHT: 48,
  
  /** 动画持续时间（毫秒） */
  ANIMATION_DURATION: 200,
  
  /** 视口边距 */
  VIEWPORT_PADDING: 10
} as const

/**
 * 颜色相关配置
 */
export const COLOR_CONFIG = {
  /** 最近使用颜色的存储键 */
  RECENT_COLORS_KEY: 'ldesign-editor-recent-colors',
  
  /** 最多保存的最近使用颜色数量 */
  MAX_RECENT_COLORS: 10,
  
  /** 默认预设颜色 */
  DEFAULT_COLORS: [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#FFFF00', '#00FF00', '#00FFFF',
    '#0000FF', '#6600CC', '#CC00CC', '#FF0066'
  ]
} as const

/**
 * 表格相关配置
 */
export const TABLE_CONFIG = {
  /** 最大行数 */
  MAX_ROWS: 20,
  
  /** 最大列数 */
  MAX_COLS: 10,
  
  /** 默认行数 */
  DEFAULT_ROWS: 3,
  
  /** 默认列数 */
  DEFAULT_COLS: 3,
  
  /** 最小单元格宽度 */
  MIN_CELL_WIDTH: 50
} as const

/**
 * 快捷键配置
 */
export const KEYBOARD_SHORTCUTS = {
  BOLD: 'Mod+B',
  ITALIC: 'Mod+I',
  UNDERLINE: 'Mod+U',
  STRIKE: 'Mod+Shift+X',
  CODE: 'Mod+E',
  UNDO: 'Mod+Z',
  REDO: 'Mod+Shift+Z',
  FIND: 'Mod+F',
  SAVE: 'Mod+S',
  CLEAR_FORMAT: 'Mod+\\',
  LINK: 'Mod+K',
  HEADING_1: 'Mod+Alt+1',
  HEADING_2: 'Mod+Alt+2',
  HEADING_3: 'Mod+Alt+3',
  HEADING_4: 'Mod+Alt+4',
  HEADING_5: 'Mod+Alt+5',
  HEADING_6: 'Mod+Alt+6',
  ORDERED_LIST: 'Mod+Shift+7',
  BULLET_LIST: 'Mod+Shift+8',
  BLOCKQUOTE: 'Mod+Shift+9'
} as const

/**
 * 错误代码
 */
export const ERROR_CODES = {
  // 文件相关
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // URL 相关
  INVALID_URL: 'INVALID_URL',
  
  // 命令相关
  COMMAND_NOT_FOUND: 'COMMAND_NOT_FOUND',
  COMMAND_EXECUTION_FAILED: 'COMMAND_EXECUTION_FAILED',
  
  // 插件相关
  PLUGIN_LOAD_FAILED: 'PLUGIN_LOAD_FAILED',
  PLUGIN_INIT_FAILED: 'PLUGIN_INIT_FAILED',
  
  // 选区相关
  INVALID_SELECTION: 'INVALID_SELECTION',
  NO_SELECTION: 'NO_SELECTION',
  
  // 内容相关
  INVALID_CONTENT: 'INVALID_CONTENT',
  PARSE_ERROR: 'PARSE_ERROR',
  
  // AI 相关
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  AI_API_ERROR: 'AI_API_ERROR',
  AI_CONFIG_ERROR: 'AI_CONFIG_ERROR'
} as const

/**
 * 本地存储键
 */
export const STORAGE_KEYS = {
  RECENT_COLORS: 'ldesign-editor-recent-colors',
  AI_CONFIG: 'ldesign-editor-ai-config',
  EDITOR_SETTINGS: 'ldesign-editor-settings',
  TEMPLATES: 'ldesign-editor-templates'
} as const

/**
 * AI 配置
 */
export const AI_CONFIG = {
  /** 默认模型 */
  DEFAULT_MODEL: 'deepseek-chat',
  
  /** 默认温度 */
  DEFAULT_TEMPERATURE: 0.7,
  
  /** 最大 Token 数 */
  MAX_TOKENS: 2000,
  
  /** 请求超时（毫秒） */
  REQUEST_TIMEOUT: 30000
} as const

/**
 * 正则表达式
 */
export const REGEX = {
  /** URL 正则 */
  URL: /^https?:\/\/.+/,
  
  /** Email 正则 */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  /** HEX 颜色正则 */
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  
  /** RGB 颜色正则 */
  RGB_COLOR: /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
} as const













