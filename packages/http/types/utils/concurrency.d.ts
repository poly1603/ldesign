import { ConcurrencyConfig, ResponseData, RequestConfig } from '@/types';

/**
 * 并发控制管理器
 */
declare class ConcurrencyManager {
    private config;
    private activeRequests;
    private requestQueue;
    private requestCounter;
    constructor(config?: ConcurrencyConfig);
    /**
     * 执行请求（带并发控制）
     */
    execute<T = any>(requestFn: () => Promise<ResponseData<T>>, config: RequestConfig): Promise<ResponseData<T>>;
    /**
     * 执行任务
     */
    private executeTask;
    /**
     * 处理队列中的下一个任务
     */
    private processQueue;
    /**
     * 取消所有排队的请求
     */
    cancelQueue(reason?: string): void;
    /**
     * 获取状态信息
     */
    getStatus(): {
        activeCount: number;
        queuedCount: number;
        maxConcurrent: number;
        maxQueueSize: number;
    };
    /**
     * 更新配置
     */
    updateConfig(config: Partial<ConcurrencyConfig>): void;
    /**
     * 获取当前配置
     */
    getConfig(): Required<ConcurrencyConfig>;
    /**
     * 生成任务 ID
     */
    private generateTaskId;
}
/**
 * 请求去重管理器
 */
declare class DeduplicationManager {
    private pendingRequests;
    /**
     * 执行请求（带去重）
     */
    execute<T = any>(key: string, requestFn: () => Promise<ResponseData<T>>): Promise<ResponseData<T>>;
    /**
     * 取消指定请求
     */
    cancel(key: string): void;
    /**
     * 取消所有请求
     */
    cancelAll(): void;
    /**
     * 获取待处理请求数量
     */
    getPendingCount(): number;
    /**
     * 获取所有待处理请求的键
     */
    getPendingKeys(): string[];
}
/**
 * 速率限制管理器
 */
declare class RateLimitManager {
    private requests;
    private maxRequests;
    private timeWindow;
    constructor(maxRequests?: number, timeWindow?: number);
    /**
     * 检查是否可以发送请求
     */
    canMakeRequest(): boolean;
    /**
     * 记录请求
     */
    recordRequest(): void;
    /**
     * 获取下次可以请求的时间
     */
    getNextAvailableTime(): number;
    /**
     * 等待直到可以发送请求
     */
    waitForAvailability(): Promise<void>;
    /**
     * 重置计数器
     */
    reset(): void;
    /**
     * 获取当前状态
     */
    getStatus(): {
        currentRequests: number;
        maxRequests: number;
        timeWindow: number;
        nextAvailableTime: number;
    };
}
/**
 * 创建并发管理器
 */
declare function createConcurrencyManager(config?: ConcurrencyConfig): ConcurrencyManager;
/**
 * 创建去重管理器
 */
declare function createDeduplicationManager(): DeduplicationManager;
/**
 * 创建速率限制管理器
 */
declare function createRateLimitManager(maxRequests?: number, timeWindow?: number): RateLimitManager;

export { ConcurrencyManager, DeduplicationManager, RateLimitManager, createConcurrencyManager, createDeduplicationManager, createRateLimitManager };
