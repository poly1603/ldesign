// 表单常量定义

/**
 * 表单字段类型
 */
export const FORM_FIELD_TYPES = {
  INPUT: 'FormInput',
  TEXTAREA: 'FormTextarea',
  SELECT: 'FormSelect',
  RADIO: 'FormRadio',
  CHECKBOX: 'FormCheckbox',
  SWITCH: 'FormSwitch',
  DATE: 'FormDate',
  TIME: 'FormTime',
  NUMBER: 'FormNumber',
  PASSWORD: 'FormPassword',
  EMAIL: 'FormEmail',
  URL: 'FormUrl',
  TEL: 'FormTel',
} as const

/**
 * 表单验证规则类型
 */
export const FORM_VALIDATION_RULES = {
  REQUIRED: 'required',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  MIN: 'min',
  MAX: 'max',
  PATTERN: 'pattern',
  EMAIL: 'email',
  URL: 'url',
  PHONE: 'phone',
  ID_CARD: 'idCard',
  CUSTOM: 'custom',
} as const

/**
 * 表单主题
 */
export const FORM_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  BLUE: 'blue',
  GREEN: 'green',
  PURPLE: 'purple',
  COMPACT: 'compact',
  COMFORTABLE: 'comfortable',
  ROUNDED: 'rounded',
  FLAT: 'flat',
} as const

/**
 * 表单布局模式
 */
export const FORM_LAYOUT_MODES = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  INLINE: 'inline',
} as const

/**
 * 表单尺寸
 */
export const FORM_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const
