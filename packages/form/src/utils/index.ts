/**
 * 工具函数入口文件
 * 
 * 统一导出所有工具函数，方便外部使用
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

// 辅助工具函数
export {
  deepClone,
  deepMerge,
  getValue,
  setValue,
  deleteValue,
  isEmpty,
  isNotEmpty,
  isObject,
  isFunction,
  isString,
  isNumber,
  isBoolean,
  isArray,
  isDate,
  isRegExp,
  isPromise,
  debounce,
  throttle,
  generateId,
  formatTemplate,
  toArray,
  unique,
  groupBy,
  delay,
  retry,
  safeJsonParse,
  safeJsonStringify,
} from './helpers'

// 验证工具函数
export {
  getValidator,
  registerValidator,
  unregisterValidator,
  hasValidator,
  getValidatorNames,
  executeValidationRule,
  executeValidationRules,
  createValidationRule,
  required,
  pattern,
  min,
  max,
  length,
  email,
  url,
  custom,
} from './validation'

// 布局工具函数
export {
  DEFAULT_BREAKPOINTS,
  DEFAULT_LAYOUT_CONFIG,
  getCurrentBreakpoint,
  calculateResponsiveColumns,
  calculateFieldSpan,
  calculateFieldOffset,
  groupFieldsByRows,
  calculateLabelWidth,
  calculateOptimalLabelWidth,
  normalizeLabelWidth,
  calculateFieldStyles,
  calculateFormStyles,
  generateGridClasses,
  isFieldVisibleAtBreakpoint,
  sortFieldsByOrder,
} from './layout'
