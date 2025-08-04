import { EventManager as EventManager$1, EventConfig, WatermarkEvent, WatermarkEventType, EventListener, EventFilter, EventMiddleware, EventStats } from '../types/events.js';

/**
 * 事件管理器
 */

/**
 * 事件管理器
 * 负责事件的注册、触发、过滤和统计
 */
declare class EventManager implements EventManager$1 {
    private listeners;
    private filters;
    private middlewares;
    private config;
    private stats;
    private eventHistory;
    private processingTimes;
    private initialized;
    constructor(config?: Partial<EventConfig>);
    /**
     * 初始化事件管理器
     */
    init(): Promise<void>;
    /**
     * 添加事件监听器
     */
    on<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): string;
    /**
     * 移除事件监听器
     */
    off<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): boolean;
    /**
     * 移除指定类型的所有监听器
     */
    removeAllListeners(type?: WatermarkEventType): void;
    /**
     * 触发事件
     */
    emit<T extends WatermarkEvent>(event: T): Promise<void>;
    /**
     * 添加事件过滤器
     */
    addFilter(name: string, filter: EventFilter): void;
    /**
     * 移除事件过滤器
     */
    removeFilter(name: string): boolean;
    /**
     * 添加中间件
     */
    addMiddleware(middleware: EventMiddleware): void;
    /**
     * 移除中间件
     */
    removeMiddleware(middleware: EventMiddleware): boolean;
    /**
     * 获取统计信息
     */
    getStats(): EventStats;
    /**
     * 获取事件历史
     */
    getHistory(limit?: number): WatermarkEvent[];
    /**
     * 清空事件历史
     */
    clearHistory(): void;
    /**
     * 获取指定类型的监听器数量
     */
    getListenerCount(type: WatermarkEventType): number;
    /**
     * 检查是否有指定类型的监听器
     */
    hasListeners(type: WatermarkEventType): boolean;
    /**
     * 获取所有事件类型
     */
    getEventTypes(): WatermarkEventType[];
    /**
     * 等待指定事件
     */
    waitFor<T extends WatermarkEvent>(type: WatermarkEventType, timeout?: number, filter?: (event: T) => boolean): Promise<T>;
    /**
     * 批量触发事件
     */
    emitBatch(events: WatermarkEvent[]): Promise<void>;
    /**
     * 销毁事件管理器
     */
    dispose(): Promise<void>;
    private shouldProcessEvent;
    private executeListener;
    private updateEventStats;
    private updateStats;
    private addToHistory;
    private createLoggingMiddleware;
    private createErrorHandlingMiddleware;
    private createPerformanceMiddleware;
}

export { EventManager };
