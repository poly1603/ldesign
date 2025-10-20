/**
 * Utils module exports
 */

export * from './bundle-optimization'

// Export from error-handler
export {
  assert,
  createErrorBoundary,
  ErrorHandler,
  ErrorSeverity,
  // Avoid conflict with helpers' warn
  warn as errorWarn,
  globalErrorHandler,
  I18nError,
  I18nErrorType,
  info,
  safeTranslate
} from './error-handler'

// Export from helpers
export {
  debounce,
  deepClone,
  deepMerge,
  error,
  escapeHtml,
  EventEmitter,
  flattenObject,
  formatLocale,
  generateCacheKey,
  getBrowserLanguage,
  getNestedValue,
  isFunction,
  isPlainObject,
  isPromise,
  isString,
  parseLocale,
  setNestedValue,
  throttle,
  unflattenObject,
  // Export warn and error from helpers
  warn
} from './helpers'

// Export from performance (optimized versions)
export {
  memoize,
  PerformanceMark,
  RAFScheduler
} from './performance'