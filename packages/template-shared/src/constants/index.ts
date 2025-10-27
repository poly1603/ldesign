/**
 * 共享常量定义
 * 跨框架共享的常量
 */

/**
 * 设备类型常量
 */
export const DEVICE_TYPES = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
} as const

/**
 * 设备断点
 */
export const DEVICE_BREAKPOINTS = {
  MOBILE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024,
} as const

/**
 * 模板分类常量
 */
export const TEMPLATE_CATEGORIES = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  FORM: 'form',
  LIST: 'list',
} as const

/**
 * 模板事件
 */
export const TEMPLATE_EVENTS = {
  // 生命周期事件
  BEFORE_LOAD: 'template:before-load',
  AFTER_LOAD: 'template:after-load',
  BEFORE_RENDER: 'template:before-render',
  AFTER_RENDER: 'template:after-render',
  BEFORE_UPDATE: 'template:before-update',
  AFTER_UPDATE: 'template:after-update',
  BEFORE_UNMOUNT: 'template:before-unmount',
  AFTER_UNMOUNT: 'template:after-unmount',

  // 数据事件
  DATA_CHANGE: 'template:data-change',
  PROPS_CHANGE: 'template:props-change',
  STATE_CHANGE: 'template:state-change',

  // 交互事件
  CLICK: 'template:click',
  SUBMIT: 'template:submit',
  CANCEL: 'template:cancel',
  RESET: 'template:reset',

  // 错误事件
  ERROR: 'template:error',
  WARNING: 'template:warning',

  // 性能事件
  PERFORMANCE_METRIC: 'template:performance-metric',
  MEMORY_WARNING: 'template:memory-warning',
} as const

/**
 * 主题预设
 */
export const PRESET_THEMES = {
  LIGHT: {
    name: 'light',
    mode: 'light' as const,
    primaryColor: '#1890ff',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderColor: '#e8e8e8',
  },
  DARK: {
    name: 'dark',
    mode: 'dark' as const,
    primaryColor: '#40a9ff',
    backgroundColor: '#1f1f1f',
    textColor: '#ffffff',
    borderColor: '#434343',
  },
  AUTO: {
    name: 'auto',
    mode: 'auto' as const,
    primaryColor: '#1890ff',
    backgroundColor: 'var(--bg-color)',
    textColor: 'var(--text-color)',
    borderColor: 'var(--border-color)',
  },
} as const

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  // 缓存配置
  CACHE_TTL: 5 * 60 * 1000, // 5分钟
  CACHE_MAX_SIZE: 1000,
  CACHE_MAX_MEMORY: 100 * 1024 * 1024, // 100MB

  // 性能配置
  LOAD_TIMEOUT: 30000, // 30秒
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1秒

  // 动画配置
  ANIMATION_DURATION: 300, // 300ms
  ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // 分页配置
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

/**
 * 错误代码
 */
export const ERROR_CODES = {
  // 加载错误
  LOAD_ERROR: 'E001',
  LOAD_TIMEOUT: 'E002',
  LOAD_NETWORK: 'E003',

  // 解析错误
  PARSE_ERROR: 'E101',
  PARSE_INVALID: 'E102',

  // 渲染错误
  RENDER_ERROR: 'E201',
  RENDER_COMPONENT: 'E202',

  // 验证错误
  VALIDATION_ERROR: 'E301',
  VALIDATION_REQUIRED: 'E302',
  VALIDATION_TYPE: 'E303',

  // 权限错误
  PERMISSION_ERROR: 'E401',
  PERMISSION_DENIED: 'E402',

  // 版本错误
  VERSION_ERROR: 'E501',
  VERSION_MISMATCH: 'E502',

  // 依赖错误
  DEPENDENCY_ERROR: 'E601',
  DEPENDENCY_MISSING: 'E602',

  // 未知错误
  UNKNOWN_ERROR: 'E999',
} as const

/**
 * HTTP 状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

/**
 * 键盘按键码
 */
export const KEY_CODES = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
} as const

/**
 * 正则表达式
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  VERSION: /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const

export default {}
