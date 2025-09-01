/**
 * 事件管理器
 * 负责PDF预览器的事件处理和分发
 */
import type { PdfViewerEvents } from './types';
/**
 * 事件管理器实现
 */
export declare class EventManager {
    private listeners;
    /**
     * 添加事件监听器
     */
    on<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    /**
     * 移除事件监听器
     */
    off<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    /**
     * 添加一次性事件监听器
     */
    once<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    /**
     * 触发事件
     */
    emit<K extends keyof PdfViewerEvents>(event: K, data: Parameters<PdfViewerEvents[K]>[0]): void;
    /**
     * 移除所有事件监听器
     */
    removeAllListeners(event?: keyof PdfViewerEvents): void;
    /**
     * 获取事件监听器数量
     */
    listenerCount(event: keyof PdfViewerEvents): number;
    /**
     * 获取所有事件名称
     */
    eventNames(): Array<keyof PdfViewerEvents>;
    /**
     * 检查是否有监听器
     */
    hasListeners(event: keyof PdfViewerEvents): boolean;
    /**
     * 销毁事件管理器
     */
    destroy(): void;
}
//# sourceMappingURL=event-manager.d.ts.map