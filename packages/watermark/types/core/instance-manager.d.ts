import { InstanceManager as InstanceManager$1, WatermarkInstance, WatermarkInstanceState, InstanceQuery, InstanceStats, BatchOperationOptions } from '../types/instance.js';

/**
 * 实例管理器
 */

/**
 * 实例管理器
 * 负责水印实例的注册、查询、统计等管理功能
 */
declare class InstanceManager implements InstanceManager$1 {
    private instances;
    private instancesByContainer;
    private stats;
    /**
     * 注册实例
     */
    register(instance: WatermarkInstance): void;
    /**
     * 注销实例
     */
    unregister(instanceId: string): boolean;
    /**
     * 获取实例
     */
    get(instanceId: string): WatermarkInstance | undefined;
    /**
     * 获取所有实例
     */
    getAll(): WatermarkInstance[];
    /**
     * 根据容器获取实例
     */
    getByContainer(container: HTMLElement): WatermarkInstance[];
    /**
     * 根据状态获取实例
     */
    getByState(state: WatermarkInstanceState): WatermarkInstance[];
    /**
     * 查询实例
     */
    query(query: InstanceQuery): WatermarkInstance[];
    /**
     * 检查实例是否存在
     */
    has(instanceId: string): boolean;
    /**
     * 获取实例数量
     */
    size(): number;
    /**
     * 获取统计信息
     */
    getStats(): InstanceStats;
    /**
     * 批量操作
     */
    batchOperation<T>(instanceIds: string[], operation: (instance: WatermarkInstance) => Promise<T>, options?: BatchOperationOptions): Promise<Array<{
        instanceId: string;
        result?: T;
        error?: Error;
    }>>;
    /**
     * 清理已销毁的实例
     */
    cleanup(): number;
    /**
     * 获取容器的实例数量
     */
    getContainerInstanceCount(container: HTMLElement): number;
    /**
     * 检查容器是否有实例
     */
    hasContainerInstances(container: HTMLElement): boolean;
    /**
     * 获取所有容器
     */
    getAllContainers(): HTMLElement[];
    /**
     * 根据选择器查找实例
     */
    findBySelector(selector: string): WatermarkInstance[];
    /**
     * 获取实例的邻居实例（同容器）
     */
    getSiblings(instanceId: string): WatermarkInstance[];
    /**
     * 更新实例状态
     */
    updateInstanceState(instanceId: string, state: WatermarkInstanceState): boolean;
    /**
     * 获取最近创建的实例
     */
    getRecentlyCreated(count?: number): WatermarkInstance[];
    /**
     * 获取最近更新的实例
     */
    getRecentlyUpdated(count?: number): WatermarkInstance[];
    /**
     * 清空所有实例
     */
    clear(): void;
    /**
     * 导出实例数据
     */
    export(): Array<{
        id: string;
        state: WatermarkInstanceState;
        config: any;
        createdAt: number;
        updatedAt: number;
        visible: boolean;
        userData?: Record<string, any>;
    }>;
    private updateStats;
}

export { InstanceManager };
