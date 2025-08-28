/**
 * 事件发射器
 */
export declare class EventEmitter<T = any> {
    private listeners;
    /**
     * 添加事件监听器
     */
    on(event: string, listener: (event: T) => void): void;
    /**
     * 移除事件监听器
     */
    off(event: string, listener: (event: T) => void): void;
    /**
     * 添加一次性事件监听器
     */
    once(event: string, listener: (event: T) => void): void;
    /**
     * 触发事件
     */
    emit(event: string, data: T): void;
    /**
     * 移除所有监听器
     */
    removeAllListeners(event?: string): void;
    /**
     * 获取事件监听器数量
     */
    listenerCount(event: string): number;
    /**
     * 获取所有事件名称
     */
    eventNames(): string[];
    /**
     * 检查是否有监听器
     */
    hasListeners(event?: string): boolean;
}
//# sourceMappingURL=event-emitter.d.ts.map