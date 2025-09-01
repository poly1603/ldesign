import type { SecurityConfig } from '../types';
/**
 * 安全管理器
 */
export declare class SecurityManager {
    private encryption;
    private obfuscation;
    private config;
    constructor(config?: Partial<SecurityConfig>);
    /**
     * 加密数据
     */
    encrypt(data: string): Promise<string>;
    /**
     * 解密数据
     */
    decrypt(data: string): Promise<string>;
    /**
     * 混淆键名
     */
    obfuscateKey(key: string): Promise<string>;
    /**
     * 反混淆键名
     */
    deobfuscateKey(key: string): Promise<string>;
    /**
     * 检查数据是否需要加密
     */
    shouldEncrypt(data: any, options?: {
        encrypt?: boolean;
    }): boolean;
    /**
     * 检查键名是否需要混淆
     */
    shouldObfuscateKey(options?: {
        obfuscateKey?: boolean;
    }): boolean;
    /**
     * 生成安全的随机键
     */
    generateSecureKey(length?: number): string;
    /**
     * 验证数据完整性
     *
     * 通过比较原始数据和存储数据来验证数据完整性
     * 如果启用了加密，会先解密存储数据再进行比较
     *
     * @param originalData - 原始数据
     * @param storedData - 存储的数据（可能已加密）
     * @returns 数据完整性验证结果
     *
     * @example
     * ```typescript
     * const isValid = await securityManager.verifyIntegrity('original', 'stored')
     * console.log(isValid) // true 或 false
     * ```
     */
    verifyIntegrity(originalData: string, storedData: string): Promise<boolean>;
    /**
     * 获取安全配置
     */
    getConfig(): SecurityConfig;
    /**
     * 更新安全配置
     */
    updateConfig(config: Partial<SecurityConfig>): void;
    /**
     * 检查安全功能是否可用
     */
    isSecurityAvailable(): {
        encryption: boolean;
        obfuscation: boolean;
        webCrypto: boolean;
    };
}
//# sourceMappingURL=security-manager.d.ts.map