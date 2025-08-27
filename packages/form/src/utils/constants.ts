/**
 * 常量定义
 */

// 版本信息
export const VERSION = '1.0.0'

// 事件类型常量
export const EVENT_TYPES = {
  // 表单事件
  FORM_MOUNTED: 'form:mounted',
  FORM_UNMOUNTED: 'form:unmounted',
  FORM_UPDATED: 'form:updated',
  FORM_RESET: 'form:reset',
  FORM_SUBMIT: 'form:submit',
  FORM_VALIDATE: 'form:validate',
  
  // 字段事件
  FIELD_CHANGE: 'field:change',
  FIELD_FOCUS: 'field:focus',
  FIELD_BLUR: 'field:blur',
  FIELD_UPDATED: 'field:updated',
  FIELD_MOUNTED: 'field:mounted',
  FIELD_UNMOUNTED: 'field:unmounted',
  
  // 验证事件
  VALIDATION_START: 'validation:start',
  VALIDATION_COMPLETE: 'validation:complete',
  VALIDATION_ERROR: 'validation:error',
  
  // 布局事件
  LAYOUT_UPDATED: 'layout:updated',
  LAYOUT_RESPONSIVE: 'layout:responsive',
  LAYOUT_RECALCULATED: 'layout:recalculated',
  
  // 条件渲染事件
  CONDITION_FIELD_UPDATE: 'condition:field-update',
  CONDITION_ASYNC_UPDATE: 'condition:async-update'
} as const

// 字段类型常量
export const FIELD_TYPES = {
  INPUT: 'input',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  SWITCH: 'switch',
  DATE_PICKER: 'date-picker',
  TIME_PICKER: 'time-picker',
  UPLOAD: 'upload',
  GROUP: 'group',
  ACTIONS: 'actions'
} as const

// 组件映射
export const COMPONENT_MAP = {
  [FIELD_TYPES.INPUT]: 'FormInput',
  [FIELD_TYPES.TEXTAREA]: 'FormTextarea',
  [FIELD_TYPES.SELECT]: 'FormSelect',
  [FIELD_TYPES.RADIO]: 'FormRadio',
  [FIELD_TYPES.CHECKBOX]: 'FormCheckbox',
  [FIELD_TYPES.SWITCH]: 'FormSwitch',
  [FIELD_TYPES.DATE_PICKER]: 'FormDatePicker',
  [FIELD_TYPES.TIME_PICKER]: 'FormTimePicker',
  [FIELD_TYPES.UPLOAD]: 'FormUpload'
} as const

// 验证规则类型
export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  MIN: 'min',
  MAX: 'max',
  PATTERN: 'pattern',
  EMAIL: 'email',
  PHONE: 'phone',
  ID_CARD: 'idCard',
  URL: 'url',
  NUMBER: 'number',
  INTEGER: 'integer',
  CUSTOM: 'custom'
} as const

// 布局类型
export const LAYOUT_TYPES = {
  GRID: 'grid',
  FLEX: 'flex',
  INLINE: 'inline'
} as const

// 断点类型
export const BREAKPOINT_TYPES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
} as const

// 尺寸类型
export const SIZE_TYPES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const

// 模式类型
export const MODE_TYPES = {
  EDIT: 'edit',
  VIEW: 'view',
  DISABLED: 'disabled'
} as const

// 主题类型
export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const

// 按钮类型
export const BUTTON_TYPES = {
  SUBMIT: 'submit',
  RESET: 'reset',
  BUTTON: 'button',
  CANCEL: 'cancel',
  SAVE: 'save',
  EXPAND: 'expand',
  CUSTOM: 'custom'
} as const

// 按钮变体
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info',
  LIGHT: 'light',
  DARK: 'dark',
  LINK: 'link',
  DEFAULT: 'default'
} as const

// 默认配置
export const DEFAULT_FORM_CONFIG = {
  mode: MODE_TYPES.EDIT,
  size: SIZE_TYPES.MEDIUM,
  theme: THEME_TYPES.LIGHT,
  layout: {
    type: LAYOUT_TYPES.GRID,
    columns: 3,
    gap: 16
  },
  validation: {
    enabled: true,
    trigger: 'change',
    showStatus: true,
    showMessage: true
  }
} as const

export const DEFAULT_FIELD_CONFIG = {
  size: SIZE_TYPES.MEDIUM,
  validateOnChange: true,
  validateOnBlur: true,
  showLabel: true,
  showHelp: false
} as const

export const DEFAULT_LAYOUT_CONFIG = {
  responsive: {
    enabled: true,
    breakpoints: {
      [BREAKPOINT_TYPES.XS]: { value: 0, name: 'xs', columns: 1 },
      [BREAKPOINT_TYPES.SM]: { value: 576, name: 'sm', columns: 2 },
      [BREAKPOINT_TYPES.MD]: { value: 768, name: 'md', columns: 3 },
      [BREAKPOINT_TYPES.LG]: { value: 992, name: 'lg', columns: 4 },
      [BREAKPOINT_TYPES.XL]: { value: 1200, name: 'xl', columns: 5 }
    },
    defaultBreakpoint: BREAKPOINT_TYPES.MD
  },
  calculation: {
    autoCalculate: true,
    minColumnWidth: 300,
    maxColumns: 6,
    minColumns: 1
  }
} as const

export const DEFAULT_VALIDATION_CONFIG = {
  enabled: true,
  trigger: 'change',
  stopOnFirstError: false,
  timeout: 5000,
  cache: {
    enabled: true,
    ttl: 300000,
    maxSize: 100
  }
} as const

// CSS类名前缀
export const CSS_PREFIX = 'l-form'

// CSS变量名
export const CSS_VARIABLES = {
  PRIMARY_COLOR: '--primary-color',
  SUCCESS_COLOR: '--success-color',
  WARNING_COLOR: '--warning-color',
  ERROR_COLOR: '--error-color',
  INFO_COLOR: '--info-color',
  TEXT_COLOR_PRIMARY: '--text-color-primary',
  TEXT_COLOR_SECONDARY: '--text-color-secondary',
  TEXT_COLOR_TERTIARY: '--text-color-tertiary',
  TEXT_COLOR_DISABLED: '--text-color-disabled',
  TEXT_COLOR_PLACEHOLDER: '--text-color-placeholder',
  BACKGROUND_COLOR: '--background-color',
  BACKGROUND_COLOR_LIGHT: '--background-color-light',
  BACKGROUND_COLOR_DARK: '--background-color-dark',
  BACKGROUND_COLOR_DISABLED: '--background-color-disabled',
  BACKGROUND_COLOR_READONLY: '--background-color-readonly',
  BORDER_COLOR: '--border-color',
  BORDER_COLOR_LIGHT: '--border-color-light',
  BORDER_COLOR_DARK: '--border-color-dark'
} as const

// 错误消息
export const ERROR_MESSAGES = {
  FIELD_NOT_FOUND: '字段未找到',
  INVALID_FIELD_TYPE: '无效的字段类型',
  INVALID_VALIDATION_RULE: '无效的验证规则',
  VALIDATION_FAILED: '验证失败',
  FORM_NOT_MOUNTED: '表单未挂载',
  ENGINE_NOT_INITIALIZED: '引擎未初始化',
  INVALID_CONFIG: '无效的配置',
  ASYNC_OPERATION_FAILED: '异步操作失败'
} as const

// 调试信息
export const DEBUG_MESSAGES = {
  FORM_MOUNTED: '表单已挂载',
  FORM_UNMOUNTED: '表单已卸载',
  FIELD_REGISTERED: '字段已注册',
  FIELD_UNREGISTERED: '字段已注销',
  VALIDATION_STARTED: '验证开始',
  VALIDATION_COMPLETED: '验证完成',
  LAYOUT_CALCULATED: '布局已计算',
  CONDITION_EVALUATED: '条件已评估'
} as const

// 性能配置
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_INTERVAL: 100,
  CACHE_TTL: 300000,
  CACHE_SIZE: 100,
  VALIDATION_TIMEOUT: 5000,
  LAYOUT_RECALC_DELAY: 100
} as const
