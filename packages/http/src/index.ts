// 核心类型导出
export type * from './types'

// 核心类导出
export { HttpClientImpl as HttpClient } from './client'

// 适配器导出
export {
  BaseAdapter,
  FetchAdapter,
  AxiosAdapter,
  AlovaAdapter,
  AdapterFactory,
  createAdapter,
  isAdapterAvailable,
} from './adapters'

// 拦截器导出
export {
  InterceptorManagerImpl as InterceptorManager,
  requestLoggerInterceptor,
  responseLoggerInterceptor,
  errorLoggerInterceptor,
  createAuthInterceptor,
  createBaseURLInterceptor,
  requestIdInterceptor,
  timestampInterceptor,
  contentTypeInterceptor,
  createResponseTimeInterceptor,
  statusCodeInterceptor,
  createDataTransformInterceptor,
  createRetryInterceptor,
} from './interceptors'

// 工具函数导出
export {
  mergeConfig,
  buildQueryString,
  buildURL,
  isAbsoluteURL,
  combineURLs,
  createHttpError,
  delay,
  generateId,
  deepClone,
  isFormData,
  isBlob,
  isArrayBuffer,
  isURLSearchParams,
} from './utils'

// 错误处理导出
export {
  ErrorHandler,
  RetryManager,
  TimeoutManager,
  ErrorType,
} from './utils/error'

// 取消功能导出
export {
  CancelManager,
  CancelTokenSource,
  globalCancelManager,
  createCancelTokenSource,
  isCancelError,
  createTimeoutCancelToken,
} from './utils/cancel'

// 缓存功能导出
export {
  CacheManager,
  MemoryCacheStorage,
  LocalStorageCacheStorage,
  createCacheManager,
  createMemoryStorage,
  createLocalStorage,
} from './utils/cache'

// 并发控制导出
export {
  ConcurrencyManager,
  DeduplicationManager,
  RateLimitManager,
  createConcurrencyManager,
  createDeduplicationManager,
  createRateLimitManager,
} from './utils/concurrency'

// 便利函数
import { HttpClientImpl } from './client'
import { createAdapter } from './adapters'
import type { HttpClientConfig } from './types'

/**
 * 创建 HTTP 客户端实例
 */
export function createHttpClient(config: HttpClientConfig = {}): HttpClientImpl {
  const adapter = createAdapter(config.adapter)
  return new HttpClientImpl(config, adapter)
}

/**
 * 创建默认的 HTTP 客户端实例
 */
export const http = createHttpClient()

// 默认导出
export default {
  createHttpClient,
  http,
  HttpClient: HttpClientImpl,
  createAdapter,
  AdapterFactory: AdapterFactory,
}
