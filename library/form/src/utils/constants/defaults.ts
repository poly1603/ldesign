/**
 * @ldesign/form - Default Configuration Constants
 * 默认配置常量
 */

import type {
  FormConfig,
  LayoutConfig,
  ExpandConfig,
  ButtonConfig
} from '../types'

/**
 * 默认布局配置
 */
export const DEFAULT_LAYOUT_CONFIG: Required<LayoutConfig> = {
  spanWidth: 200,
  maxSpan: 4,
  minSpan: 1,
  space: 16,
  gap: 8,
  labelAlign: 'right',
  labelWidth: 'auto',
  responsive: true,
  breakpoints: {
    xs: 1,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 4
  }
}

/**
 * 默认展开收起配置
 */
export const DEFAULT_EXPAND_CONFIG: Required<ExpandConfig> = {
  previewRows: 1,
  expandMode: 'visible',
  defaultExpanded: false,
  expandText: '展开',
  collapseText: '收起'
}

/**
 * 默认按钮配置
 */
export const DEFAULT_BUTTON_CONFIG: Required<ButtonConfig> = {
  buttonPosition: 'inline',
  buttonAlign: 'right',
  buttonSpan: 1,
  showSubmit: true,
  submitText: '查询',
  showReset: true,
  resetText: '重置',
  showExpand: true
}

/**
 * 默认表单配置
 */
export const DEFAULT_FORM_CONFIG: Required<
  Omit<FormConfig, 'fields' | 'initialValues'>
> = {
  layout: DEFAULT_LAYOUT_CONFIG,
  expand: DEFAULT_EXPAND_CONFIG,
  button: DEFAULT_BUTTON_CONFIG,
  validateOnChange: true,
  validateOnBlur: true,
  validateOnSubmit: true,
  disabled: false,
  readonly: false
}

/**
 * 最小字段宽度（px）
 */
export const MIN_FIELD_WIDTH = 150

/**
 * 最大字段宽度（px）
 */
export const MAX_FIELD_WIDTH = 600

/**
 * 默认防抖延迟（ms）
 */
export const DEFAULT_DEBOUNCE_DELAY = 300

/**
 * 默认验证防抖延迟（ms）
 */
export const DEFAULT_VALIDATION_DEBOUNCE = 200

/**
 * 默认布局计算防抖延迟（ms）
 */
export const DEFAULT_LAYOUT_DEBOUNCE = 100

/**
 * 事件监听器最大数量
 */
export const MAX_LISTENERS = 100

/**
 * 缓存最大条目数
 */
export const MAX_CACHE_SIZE = 100




