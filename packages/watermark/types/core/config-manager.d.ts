import { WatermarkConfig } from '../types/config.js';

/**
 * 配置管理器
 */

/**
 * 配置管理器
 * 负责配置的验证、合并、默认值处理等
 */
declare class ConfigManager {
    private defaultConfig;
    constructor();
    /**
     * 验证配置
     */
    validate(config: WatermarkConfig): Promise<WatermarkConfig>;
    /**
     * 合并配置
     */
    merge(baseConfig: WatermarkConfig, updateConfig: Partial<WatermarkConfig>): Promise<WatermarkConfig>;
    /**
     * 检查是否有渲染相关的变更
     */
    hasRenderingChanges(oldConfig: WatermarkConfig, newConfig: WatermarkConfig): boolean;
    /**
     * 检查是否有动画相关的变更
     */
    hasAnimationChanges(oldConfig: WatermarkConfig, newConfig: WatermarkConfig): boolean;
    /**
     * 检查是否有安全相关的变更
     */
    hasSecurityChanges(oldConfig: WatermarkConfig, newConfig: WatermarkConfig): boolean;
    /**
     * 检查是否有响应式相关的变更
     */
    hasResponsiveChanges(oldConfig: WatermarkConfig, newConfig: WatermarkConfig): boolean;
    /**
     * 获取默认配置
     */
    getDefaultConfig(): WatermarkConfig;
    /**
     * 设置默认配置
     */
    setDefaultConfig(config: Partial<WatermarkConfig>): void;
    private validateImageConfig;
    private validateImageSrc;
    private validateStyleConfig;
    private validateLayoutConfig;
    private validateSecurityConfig;
    private validateAnimationConfig;
    private validateResponsiveConfig;
    private isValidColor;
    private hasContentChanges;
    private hasStyleChanges;
    private hasLayoutChanges;
    private mergeWithDefaults;
    private deepMerge;
    private deepEqual;
    private isObject;
}

export { ConfigManager };
