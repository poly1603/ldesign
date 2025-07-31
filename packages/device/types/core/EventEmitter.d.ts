import type { EventListener } from '../types';
/**
 * 简单的事件发射器实现
 */
export declare class EventEmitter<T extends Record<string, any> = Record<string, any>> {
    private events;
    /**
     * 添加事件监听器
     */
    on<K extends keyof T>(event: K, listener: EventListener<T[K]>): this;
    /**
     * 添加一次性事件监听器
     */
    once<K extends keyof T>(event: K, listener: EventListener<T[K]>): this;
    /**
     * 移除事件监听器
     */
    off<K extends keyof T>(event: K, listener?: EventListener<T[K]>): this;
    /**
     * 触发事件
     */
    emit<K extends keyof T>(event: K, data: T[K]): this;
    /**
     * 获取事件的监听器数量
     */
    listenerCount<K extends keyof T>(event: K): number;
    /**
     * 获取所有事件名称
     */
    eventNames(): Array<keyof T>;
    /**
     * 移除所有事件监听器
     */
    removeAllListeners<K extends keyof T>(event?: K): this;
    /**
     * 获取指定事件的所有监听器
     */
    listeners<K extends keyof T>(event: K): EventListener<T[K]>[];
    /**
     * 检查是否有指定事件的监听器
     */
    hasListeners<K extends keyof T>(event: K): boolean;
}
//# sourceMappingURL=EventEmitter.d.ts.map