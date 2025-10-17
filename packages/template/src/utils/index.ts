/**
 * Utilities Module Export
 */

export {
  TemplateError,
  TemplateErrorType,
  ErrorRecoveryManager,
  GlobalTemplateErrorHandler,
  createErrorBoundary,
  defaultRecoveryStrategies,
  globalErrorHandler,
  type ErrorRecoveryStrategy
} from './errorHandler'

export {
  TemplateTypeGenerator,
  typeGenerator,
  inferTypeFromComponent,
  generateTypeScriptInterface,
  generateTypeDeclarationFile,
  validateComponentProps,
  generateTypeGuard,
  generateJSONSchema,
  type TemplateTypeDefinition,
  type PropTypeDefinition,
  type EmitTypeDefinition,
  type SlotTypeDefinition,
  type TypeGeneratorOptions
} from './typeGenerator'

export {
  TemplateAnalytics,
  globalAnalytics,
  useTemplateAnalytics,
  withPerformanceTracking,
  type TemplateUsage,
  type PerformanceMetrics,
  type InteractionEvent,
  type AnalyticsReport,
  type AnalyticsConfig
} from './templateAnalytics'

export {
  deepClone,
  deepMerge,
  isObject,
  isEmpty,
  debounce,
  throttle,
  generateId,
  formatBytes,
  sleep,
  retry,
  get,
  set,
  unset,
  pick,
  omit,
  arrayToObject,
  groupBy
} from './helpers'
