import { IdleProcessor } from '../core/types.js';

/**
 * 闲时处理器 - 使用 requestIdleCallback 在浏览器空闲时执行任务
 */

/**
 * 任务接口
 */
interface IdleTask {
    /** 任务 ID */
    id: string;
    /** 任务函数 */
    task: () => void | Promise<void>;
    /** 优先级（数字越小优先级越高） */
    priority: number;
    /** 创建时间 */
    createdAt: number;
}
/**
 * 闲时处理器选项
 */
interface IdleProcessorOptions {
    /** 单次处理的最大时间（毫秒） */
    maxProcessingTime?: number;
    /** 任务队列最大长度 */
    maxQueueSize?: number;
    /** 是否自动启动 */
    autoStart?: boolean;
    /** 错误处理回调 */
    onError?: (error: Error, task: IdleTask) => void;
}
/**
 * 闲时处理器实现
 */
declare class IdleProcessorImpl implements IdleProcessor {
    private options;
    private taskQueue;
    private isRunning;
    private isProcessing;
    private taskIdCounter;
    private requestId;
    constructor(options?: IdleProcessorOptions);
    /**
     * 添加闲时任务
     */
    addTask(task: () => void | Promise<void>, priority?: number): void;
    /**
     * 开始处理
     */
    start(): void;
    /**
     * 停止处理
     */
    stop(): void;
    /**
     * 清空任务队列
     */
    clear(): void;
    /**
     * 获取队列状态
     */
    getQueueStatus(): {
        length: number;
        isRunning: boolean;
        isProcessing: boolean;
    };
    /**
     * 按优先级插入任务
     */
    private insertTaskByPriority;
    /**
     * 调度处理
     */
    private scheduleProcessing;
    /**
     * 在空闲时间处理任务
     */
    private processTasksInIdle;
    /**
     * 更新选项
     */
    updateOptions(options: Partial<IdleProcessorOptions>): void;
    /**
     * 获取当前选项
     */
    getOptions(): Required<IdleProcessorOptions>;
}
/**
 * 创建闲时处理器实例
 */
declare function createIdleProcessor(options?: IdleProcessorOptions): IdleProcessor;
/**
 * 全局默认闲时处理器实例
 */
declare const defaultIdleProcessor: IdleProcessorImpl;
/**
 * 便捷函数：添加闲时任务到默认处理器
 */
declare function addIdleTask(task: () => void | Promise<void>, priority?: number): void;
/**
 * 便捷函数：批量添加闲时任务
 */
declare function addIdleTasks(tasks: Array<{
    task: () => void | Promise<void>;
    priority?: number;
}>): void;
/**
 * 便捷函数：创建延迟执行的闲时任务
 */
declare function createDelayedIdleTask(task: () => void | Promise<void>, delay: number, priority?: number): void;
/**
 * 便捷函数：创建条件执行的闲时任务
 */
declare function createConditionalIdleTask(condition: () => boolean, task: () => void | Promise<void>, priority?: number): void;
/**
 * 检查浏览器是否支持 requestIdleCallback
 */
declare function supportsIdleCallback(): boolean;
/**
 * 获取默认处理器状态
 */
declare function getDefaultProcessorStatus(): {
    length: number;
    isRunning: boolean;
    isProcessing: boolean;
    supportsIdleCallback: boolean;
};

export { IdleProcessorImpl, addIdleTask, addIdleTasks, createConditionalIdleTask, createDelayedIdleTask, createIdleProcessor, defaultIdleProcessor, getDefaultProcessorStatus, supportsIdleCallback };
export type { IdleProcessorOptions };
