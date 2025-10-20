/**
 * Utilities Module Export
 */

export {
  createErrorBoundary,
  defaultRecoveryStrategies,
  ErrorRecoveryManager,
  type ErrorRecoveryStrategy,
  globalErrorHandler,
  GlobalTemplateErrorHandler,
  TemplateError,
  TemplateErrorType
} from './errorHandler'

export {
  arrayToObject,
  debounce,
  deepClone,
  deepMerge,
  formatBytes,
  generateId,
  get,
  groupBy,
  isEmpty,
  isObject,
  omit,
  pick,
  retry,
  set,
  sleep,
  throttle,
  unset
} from './helpers'

export {
  type AnalyticsConfig,
  type AnalyticsReport,
  globalAnalytics,
  type InteractionEvent,
  type PerformanceMetrics,
  TemplateAnalytics,
  type TemplateUsage,
  useTemplateAnalytics,
  withPerformanceTracking
} from './templateAnalytics'

export {
  type EmitTypeDefinition,
  generateJSONSchema,
  generateTypeDeclarationFile,
  generateTypeGuard,
  generateTypeScriptInterface,
  inferTypeFromComponent,
  type PropTypeDefinition,
  type SlotTypeDefinition,
  type TemplateTypeDefinition,
  TemplateTypeGenerator,
  typeGenerator,
  type TypeGeneratorOptions,
  validateComponentProps
} from './typeGenerator'
