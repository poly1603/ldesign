import { RequestInterceptor, ResponseInterceptor, HttpError, ErrorInterceptor } from '@/types';

/**
 * 请求日志拦截器
 */
declare const requestLoggerInterceptor: RequestInterceptor;
/**
 * 响应日志拦截器
 */
declare const responseLoggerInterceptor: ResponseInterceptor;
/**
 * 错误日志拦截器
 */
declare const errorLoggerInterceptor: ErrorInterceptor;
/**
 * 认证拦截器工厂
 */
declare function createAuthInterceptor(getToken: () => string | null): RequestInterceptor;
/**
 * 基础 URL 拦截器工厂
 */
declare function createBaseURLInterceptor(baseURL: string): RequestInterceptor;
/**
 * 请求 ID 拦截器
 */
declare const requestIdInterceptor: RequestInterceptor;
/**
 * 时间戳拦截器
 */
declare const timestampInterceptor: RequestInterceptor;
/**
 * 内容类型拦截器
 */
declare const contentTypeInterceptor: RequestInterceptor;
/**
 * 响应时间拦截器
 */
declare function createResponseTimeInterceptor(): {
    request: RequestInterceptor;
    response: ResponseInterceptor;
};
/**
 * 状态码处理拦截器
 */
declare const statusCodeInterceptor: ResponseInterceptor;
/**
 * 数据转换拦截器工厂
 */
declare function createDataTransformInterceptor<T, R>(transform: (data: T) => R): ResponseInterceptor<R>;
/**
 * 重试拦截器工厂
 */
declare function createRetryInterceptor(maxRetries?: number, retryDelay?: number, retryCondition?: (error: HttpError) => boolean): ErrorInterceptor;

export { contentTypeInterceptor, createAuthInterceptor, createBaseURLInterceptor, createDataTransformInterceptor, createResponseTimeInterceptor, createRetryInterceptor, errorLoggerInterceptor, requestIdInterceptor, requestLoggerInterceptor, responseLoggerInterceptor, statusCodeInterceptor, timestampInterceptor };
