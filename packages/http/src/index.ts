// 适配器导出
import type { HttpClientConfig } from './types'
import { createAdapter } from './adapters'
// 便利函数
import { HttpClientImpl } from './client'

export {
  AdapterFactory,
  AlovaAdapter,
  AxiosAdapter,
  BaseAdapter,
  createAdapter,
  FetchAdapter,
  isAdapterAvailable,
} from './adapters'

// 核心类导出
export { HttpClientImpl as HttpClient } from './client'

// Engine 插件导出
export {
  createHttpEnginePlugin,
  defaultHttpEnginePlugin,
  httpPlugin,
} from './engine'

// Engine 插件类型导出
export type { HttpEnginePluginOptions } from './engine'

// 拦截器导出
export {
  contentTypeInterceptor,
  createAuthInterceptor,
  createBaseURLInterceptor,
  createDataTransformInterceptor,
  createResponseTimeInterceptor,
  createRetryInterceptor,
  errorLoggerInterceptor,
  InterceptorManagerImpl as InterceptorManager,
  requestIdInterceptor,
  requestLoggerInterceptor,
  responseLoggerInterceptor,
  statusCodeInterceptor,
  timestampInterceptor,
} from './interceptors'

// 核心类型导出
export type * from './types'

// 类型工具导出
export {
  assertType,
  createEnum,
  createTypedError,
  deepClone,
  isArray,
  isFunction,
  isNonNull,
  isNumber,
  isObject,
  isString,
  safeGet,
  safeGetNested,
  safeJsonParse,
  typedEntries,
  typedFilter,
  typedKeys,
  typedMerge,
  typedValues,
  wrapPromise,
} from './types/utils'

// 导出类型工具类型
export type {
  AllowsRequestBody,
  AllStatusCode,
  ArrayToUnion,
  BuildUrlWithParams,
  ClientErrorStatusCode,
  DeepMerge,
  DistributiveOmit,
  ExtractPathParams,
  FunctionKeys,
  FunctionsOnly,
  IsPromise,
  NonFunctionKeys,
  PropertiesOnly,
  ReadonlyTuple,
  RequestBodyType,
  ServerErrorStatusCode,
  StatusCodeMessages,
  StrictEnum,
  SuccessStatusCode,
  UnionToIntersection,
  UnwrapPromise,
} from './types/utils'

// 工具函数导出
export {
  buildQueryString,
  buildURL,
  combineURLs,
  createHttpError,
  delay,
  generateId,
  isAbsoluteURL,
  isArrayBuffer,
  isBlob,
  isFormData,
  isURLSearchParams,
  mergeConfig,
} from './utils'

// 缓存功能导出
export {
  AdvancedCacheManager,
  CacheManager,
  createAdvancedCacheManager,
  createCacheManager,
  createLocalStorage,
  createMemoryStorage,
  LocalStorageCacheStorage,
  MemoryCacheStorage,
} from './utils/cache'

// 导出缓存相关类型
export type {
  AdvancedCacheConfig,
  CacheItemMetadata,
  CacheStats,
  EnhancedCacheItem,
} from './utils/cache'

// 取消功能导出
export {
  CancelManager,
  CancelTokenSource,
  createCancelTokenSource,
  createTimeoutCancelToken,
  globalCancelManager,
  isCancelError,
} from './utils/cancel'

// 并发控制导出
export {
  ConcurrencyManager,
  createConcurrencyManager,
  createDeduplicationKeyGenerator,
  createDeduplicationManager,
  createRateLimitManager,
  DeduplicationKeyGenerator,
  DeduplicationManager,
  RateLimitManager,
} from './utils/concurrency'

// 导出去重相关类型
export type {
  DeduplicationKeyConfig,
} from './utils/concurrency'

export {
  createDownloadChunks,
  createRangeHeader,
  DownloadProgressCalculator,
  formatDownloadSpeed,
  formatTimeRemaining,
  getFilenameFromResponse,
  getFilenameFromURL,
  getMimeTypeFromFilename,
  isPreviewableFile,
  mergeDownloadChunks,
  parseContentRange,
  saveFileToLocal,
  supportsRangeRequests,
} from './utils/download'

// 错误处理导出
export {
  builtinRecoveryStrategies,
  ErrorAnalyzer,
  ErrorHandler,
  ErrorType,
  RetryManager,
  TimeoutManager,
} from './utils/error'

// 性能监控导出
export {
  createRequestMonitor,
  defaultMonitor,
  RequestMonitor,
} from './utils/monitor'

export type {
  MonitorConfig,
  PerformanceMetrics,
  PerformanceStats,
} from './utils/monitor'

// 优先级队列导出
export {
  createPriorityQueue,
  determinePriority,
  Priority,
  PriorityQueue,
} from './utils/priority'

export type {
  PriorityItem,
  PriorityQueueConfig,
  PriorityQueueStats,
} from './utils/priority'

// 连接池导出
export {
  createRequestPool,
  defaultPool,
  RequestPool,
} from './utils/pool'

export type {
  ConnectionInfo,
  PoolConfig,
  PoolStats,
} from './utils/pool'

// 导出错误处理相关类型
export type {
  ErrorRecoveryStrategy,
  ErrorStats,
} from './utils/error'

// 文件上传下载导出
export {
  createFileChunks,
  createFilePreviewURL,
  createUploadFormData,
  FileValidationError,
  formatFileSize,
  generateFileHash,
  getFileExtension,
  isAudioFile,
  isDocumentFile,
  isImageFile,
  isVideoFile,
  ProgressCalculator,
  revokeFilePreviewURL,
  validateFile,
} from './utils/upload'

// Vue 相关导出
export * from './vue'

/**
 * 创建 HTTP 客户端实例
 */
export function createHttpClient(
  config: HttpClientConfig = {},
): HttpClientImpl {
  const adapter = createAdapter(config.adapter)
  return new HttpClientImpl(config, adapter)
}

/**
 * 创建默认的 HTTP 客户端实例
 */
export const http = createHttpClient()

// 默认导出（为了兼容性保留，但推荐使用命名导出）
export default createHttpClient
