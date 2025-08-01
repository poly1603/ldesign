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

// 工具函数导出
export {
  buildQueryString,
  buildURL,
  combineURLs,
  createHttpError,
  deepClone,
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
  CacheManager,
  createCacheManager,
  createLocalStorage,
  createMemoryStorage,
  LocalStorageCacheStorage,
  MemoryCacheStorage,
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
  createDeduplicationManager,
  createRateLimitManager,
  DeduplicationManager,
  RateLimitManager,
} from './utils/concurrency'

// 错误处理导出
export {
  ErrorHandler,
  ErrorType,
  RetryManager,
  TimeoutManager,
} from './utils/error'

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
  AdapterFactory,
}
