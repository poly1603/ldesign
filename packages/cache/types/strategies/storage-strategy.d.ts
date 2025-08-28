import type { SetOptions, StorageStrategyConfig, StorageStrategyResult } from '../types';
/**
 * 智能存储策略
 */
export declare class StorageStrategy {
    private config;
    constructor(config?: Partial<StorageStrategyConfig>);
    /**
     * 选择最适合的存储引擎
     */
    selectEngine(key: string, value: any, options?: SetOptions): Promise<StorageStrategyResult>;
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
     * 计算各引擎得分
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