import type { EncryptionConfig } from '../types';
/**
 * AES 加密实现
 */
export declare class AESCrypto {
    private config;
    private cryptoKey;
    constructor(config: EncryptionConfig);
    /**
     * 检查加密功能是否可用
     */
    isAvailable(): boolean;
    /**
     * 初始化加密密钥
     */
    private initializeKey;
    /**
     * 加密数据
     */
    encrypt(data: string): Promise<string>;
    /**
     * 解密数据
     */
    decrypt(data: string): Promise<string>;
    /**
     * AES-GCM 加密
     */
    private encryptAES;
    /**
     * AES-GCM 解密
     *
     * @param data - 需要解密的Base64编码数据
     * @returns 解密后的原始字符串
     * @throws {Error} 当数据格式无效或解密失败时抛出错误
     */
    private decryptAES;
    /**
     * Base64 编码 - 使用更安全的方法
     */
    private encodeBase64;
    /**
     * Base64 解码 - 使用更安全的方法
     */
    private decodeBase64;
    /**
     * ArrayBuffer 转 Base64
     */
    private arrayBufferToBase64;
    /**
     * Base64 转 ArrayBuffer
     */
    private base64ToArrayBuffer;
    /**
     * 更新加密配置
     */
    updateConfig(config: Partial<EncryptionConfig>): void;
    /**
     * 获取加密配置
     */
    getConfig(): EncryptionConfig;
}
//# sourceMappingURL=aes-crypto.d.ts.map