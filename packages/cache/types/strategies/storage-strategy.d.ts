import type { SetOptions, StorageStrategyConfig, StorageStrategyResult } from '../types';
/**
 * 智能存储策略
 *
 * 优化版本，包含缓存和性能改进
 */
export declare class StorageStrategy {
    private config;
    private readonly strategyCache;
    private readonly maxCacheSize;
    private cacheHits;
    private cacheMisses;
    private readonly engineWeights;
    constructor(config?: Partial<StorageStrategyConfig>);
    /**
     * 预计算引擎优先级权重
     *
     * 性能优化：避免每次计算时重复计算权重
     */
    private precomputeEngineWeights;
    /**
     * 生成缓存键
     *
     * 基于数据特征生成缓存键，用于策略结果缓存
     */
    private generateCacheKey;
    /**
     * 选择最适合的存储引擎
     *
     * 优化版本：包含结果缓存和快速路径
     */
    selectEngine(key: string, value: any, options?: SetOptions): Promise<StorageStrategyResult>;
    /**
     * 快速计算数据大小
     *
     * 性能优化：根据数据类型使用不同的计算策略
     */
    private fastCalculateDataSize;
    /**
     * 估算对象大小
     *
     * 性能优化：避免完整序列化，使用启发式方法
     */
    private estimateObjectSize;
    /**
     * 快速路径检查
     *
     * 性能优化：处理常见情况，避免复杂计算
     */
    private tryQuickPath;
    /**
     * 缓存策略结果
     *
     * 性能优化：LRU缓存管理
     */
    private cacheResult;
    /**
     * 获取缓存统计信息
     *
     * 用于性能监控
     */
    getCacheStats(): {
        hits: number;
        misses: number;
        hitRate: number;
        cacheSize: number;
    };
    /**
     * 基于数据大小选择引擎
     */
    private selectBySize;
    /**
     * 基于TTL选择引擎
     */
    private selectByTTL;
    /**
     * 基于数据类型选择引擎
     */
    private selectByDataType;
    /**
     * 完整策略计算
     *
     * 当快速路径无法处理时使用的完整计算逻辑
     */
    private calculateFullStrategy;
    /**
     * 计算各引擎得分
     *
     * 性能优化：使用预计算的权重
     */
    private calculateEngineScores;
    /**
     * 应用特殊规则
     */
    private applySpecialRules;
    /**
     * 获取最佳引擎
     */
    private getBestEngine;
    /**
     * 生成选择原因
     */
    private generateReason;
    /**
     * 获取数据类型
     */
    private getDataType;
    /**
     * 计算数据大小
     */
    private calculateDataSize;
    /**
     * 更新策略配置
     */
    updateConfig(config: Partial<StorageStrategyConfig>): void;
    /**
     * 获取当前配置
     */
    getConfig(): StorageStrategyConfig;
}
//# sourceMappingURL=storage-strategy.d.ts.map