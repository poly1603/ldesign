import { RequestConfig, HttpError, ResponseData, RetryConfig } from '../types/index.js';

/**
 * 错误类型枚举
 */
declare enum ErrorType {
    NETWORK = "NETWORK_ERROR",
    TIMEOUT = "TIMEOUT_ERROR",
    CANCEL = "CANCEL_ERROR",
    HTTP = "HTTP_ERROR",
    PARSE = "PARSE_ERROR",
    UNKNOWN = "UNKNOWN_ERROR"
}
/**
 * 错误处理器类
 */
declare class ErrorHandler {
    /**
     * 创建网络错误
     */
    static createNetworkError(config: RequestConfig, originalError?: any): HttpError;
    /**
     * 创建超时错误
     */
    static createTimeoutError(config: RequestConfig, timeout: number): HttpError;
    /**
     * 创建取消错误
     */
    static createCancelError(config: RequestConfig): HttpError;
    /**
     * 创建 HTTP 错误
     */
    static createHttpError(status: number, statusText: string, config: RequestConfig, response?: ResponseData): HttpError;
    /**
     * 创建解析错误
     */
    static createParseError(config: RequestConfig, originalError?: any): HttpError;
    /**
     * 判断错误是否可重试
     */
    static isRetryableError(error: HttpError): boolean;
    /**
     * 获取错误的用户友好消息
     */
    static getUserFriendlyMessage(error: HttpError): string;
}
/**
 * 重试管理器
 */
declare class RetryManager {
    private config;
    constructor(config?: RetryConfig);
    /**
     * 执行带重试的请求
     */
    executeWithRetry<T>(requestFn: () => Promise<T>, requestConfig?: RequestConfig): Promise<T>;
    /**
     * 默认重试延迟函数（指数退避）
     */
    private defaultRetryDelayFunction;
    /**
     * 更新重试配置
     */
    updateConfig(config: Partial<RetryConfig>): void;
    /**
     * 获取当前配置
     */
    getConfig(): Required<RetryConfig>;
}
/**
 * 超时管理器
 */
declare class TimeoutManager {
    private timeouts;
    /**
     * 创建超时控制器
     */
    createTimeoutController(timeout: number, requestId?: string): {
        signal: AbortSignal;
        cleanup: () => void;
    };
    /**
     * 清理所有超时
     */
    clearAll(): void;
    /**
     * 生成唯一 ID
     */
    private generateId;
}

export { ErrorHandler, ErrorType, RetryManager, TimeoutManager };
