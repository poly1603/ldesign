import { HttpClientConfig } from './types/index.js';
export { ApiEndpoint, CacheConfig, CacheStorage, ConcurrencyConfig, ContentType, ErrorInterceptor, ExtendedRequestConfig, HttpAdapter, HttpError, HttpMethod, HttpStatusCode, RequestConfig, RequestInterceptor, RequestPriority, ResponseData, ResponseInterceptor, RetryConfig, TypedHttpClient, TypedRequestConfig, TypedResponseData } from './types/index.js';
import { createAdapter, AdapterFactory } from './adapters/index.js';
export { isAdapterAvailable } from './adapters/index.js';
import { HttpClientImpl } from './client.js';
export { contentTypeInterceptor, createAuthInterceptor, createBaseURLInterceptor, createDataTransformInterceptor, createResponseTimeInterceptor, createRetryInterceptor, errorLoggerInterceptor, requestIdInterceptor, requestLoggerInterceptor, responseLoggerInterceptor, statusCodeInterceptor, timestampInterceptor } from './interceptors/common.js';
export { InterceptorManagerImpl as InterceptorManager } from './interceptors/manager.js';
export { buildQueryString, buildURL, combineURLs, createHttpError, deepClone, delay, generateId, isAbsoluteURL, isArrayBuffer, isBlob, isFormData, isURLSearchParams, mergeConfig } from './utils/index.js';
export { CacheManager, LocalStorageCacheStorage, MemoryCacheStorage, createCacheManager, createLocalStorage, createMemoryStorage } from './utils/cache.js';
export { CancelManager, CancelTokenSource, createCancelTokenSource, createTimeoutCancelToken, globalCancelManager, isCancelError } from './utils/cancel.js';
export { ConcurrencyManager, DeduplicationManager, RateLimitManager, createConcurrencyManager, createDeduplicationManager, createRateLimitManager } from './utils/concurrency.js';
export { ErrorHandler, ErrorType, RetryManager, TimeoutManager } from './utils/error.js';
export { AlovaAdapter } from './adapters/alova.js';
export { AxiosAdapter } from './adapters/axios.js';
export { BaseAdapter } from './adapters/base.js';
export { FetchAdapter } from './adapters/fetch.js';

/**
 * 创建 HTTP 客户端实例
 */
declare function createHttpClient(config?: HttpClientConfig): HttpClientImpl;
/**
 * 创建默认的 HTTP 客户端实例
 */
declare const http: HttpClientImpl;
declare const _default: {
    createHttpClient: typeof createHttpClient;
    http: HttpClientImpl;
    HttpClient: typeof HttpClientImpl;
    createAdapter: typeof createAdapter;
    AdapterFactory: typeof AdapterFactory;
};

export { AdapterFactory, HttpClientImpl as HttpClient, HttpClientConfig, createAdapter, createHttpClient, _default as default, http };
