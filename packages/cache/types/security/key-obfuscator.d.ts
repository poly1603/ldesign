import type { ObfuscationConfig } from '../types';
/**
 * 键名混淆器
 */
export declare class KeyObfuscator {
    private config;
    private keyMap;
    private reverseKeyMap;
    constructor(config: ObfuscationConfig);
    /**
     * 检查混淆功能是否可用
     */
    isAvailable(): boolean;
    /**
     * 混淆键名
     */
    obfuscate(key: string): Promise<string>;
    /**
     * 反混淆键名
     */
    deobfuscate(obfuscatedKey: string): Promise<string>;
    /**
     * 哈希混淆
     */
    private hashObfuscate;
    /**
     * Base64 混淆
     */
    private base64Obfuscate;
    /**
     * 简单哈希算法（回退方案）
     */
    private simpleHash;
    /**
     * 清理缓存的映射关系
     */
    clearCache(): void;
    /**
     * 获取映射统计
     */
    getStats(): {
        totalMappings: number;
        cacheHitRate: number;
    };
    /**
     * 导出键映射（用于持久化）
     */
    exportKeyMappings(): Record<string, string>;
    /**
     * 导入键映射（用于恢复）
     */
    importKeyMappings(mappings: Record<string, string>): void;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<ObfuscationConfig>): void;
    /**
     * 获取配置
     */
    getConfig(): ObfuscationConfig;
}
//# sourceMappingURL=key-obfuscator.d.ts.map