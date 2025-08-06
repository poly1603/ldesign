import { HttpClient, InterceptorManager, RequestInterceptor, ResponseInterceptor, ErrorInterceptor, HttpClientConfig, HttpAdapter, RequestConfig, ResponseData, RetryConfig } from '@/types';

/**
 * HTTP 客户端实现
 */
declare class HttpClientImpl implements HttpClient {
    private config;
    private adapter;
    private retryManager;
    private cancelManager;
    private cacheManager;
    private concurrencyManager;
    private isDestroyed;
    interceptors: {
        request: InterceptorManager<RequestInterceptor>;
        response: InterceptorManager<ResponseInterceptor>;
        error: InterceptorManager<ErrorInterceptor>;
    };
    constructor(config?: HttpClientConfig, adapter?: HttpAdapter);
    /**
     * 发送请求（优化版）
     */
    request<T = any>(config: RequestConfig): Promise<ResponseData<T>>;
    /**
     * 执行单次请求
     */
    private executeRequest;
    /**
     * 执行实际的请求
     */
    private performRequest;
    /**
     * GET 请求
     */
    get<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>;
    /**
     * POST 请求
     */
    post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>;
    /**
     * PUT 请求
     */
    put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>;
    /**
     * DELETE 请求
     */
    delete<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>;
    /**
     * PATCH 请求
     */
    patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>;
    /**
     * HEAD 请求
     */
    head<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>;
    /**
     * OPTIONS 请求
     */
    options<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>;
    /**
     * 取消所有请求
     */
    cancelAll(reason?: string): void;
    /**
     * 获取活跃请求数量
     */
    getActiveRequestCount(): number;
    /**
     * 更新重试配置
     */
    updateRetryConfig(config: Partial<RetryConfig>): void;
    /**
     * 获取当前配置
     */
    getConfig(): HttpClientConfig;
    /**
     * 清空缓存
     */
    clearCache(): Promise<void>;
    /**
     * 获取并发状态
     */
    getConcurrencyStatus(): {
        activeCount: number;
        queuedCount: number;
        maxConcurrent: number;
        maxQueueSize: number;
    };
    /**
     * 取消队列中的所有请求
     */
    cancelQueue(reason?: string): void;
    /**
     * 处理请求拦截器
     */
    private processRequestInterceptors;
    /**
     * 处理响应拦截器
     */
    private processResponseInterceptors;
    /**
     * 处理错误拦截器
     */
    private processErrorInterceptors;
    /**
     * 优化的配置合并（避免不必要的深度合并）
     */
    private optimizedMergeConfig;
    /**
     * 销毁客户端，清理资源
     */
    destroy(): void;
    /**
     * 检查客户端是否已销毁
     */
    private checkDestroyed;
}

export { HttpClientImpl };
