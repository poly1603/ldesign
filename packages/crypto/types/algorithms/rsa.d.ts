import { RSAKeyPair, RSAOptions, EncryptResult, DecryptResult, IEncryptor } from '../types/index.js';

/**
 * RSA 加密器
 */
declare class RSAEncryptor implements IEncryptor {
    private readonly defaultOptions;
    private keyPairCache;
    private publicKeyCache;
    private privateKeyCache;
    private maxKeyCacheSize;
    /**
     * 生成 RSA 密钥对
     */
    generateKeyPair(keySize?: number): RSAKeyPair;
    /**
     * RSA 公钥加密
     */
    encrypt(data: string, publicKey: string, options?: RSAOptions): EncryptResult;
    /**
     * RSA 私钥解密
     */
    decrypt(encryptedData: string | EncryptResult, privateKey: string, options?: RSAOptions): DecryptResult;
    /**
     * RSA 签名
     */
    sign(data: string, privateKey: string, algorithm?: string): string;
    /**
     * RSA 验证签名
     */
    verify(data: string, signature: string, publicKey: string, algorithm?: string): boolean;
    /**
     * 解析公钥
     */
    private parsePublicKey;
    /**
     * 解析私钥
     */
    private parsePrivateKey;
    /**
     * 获取填充方案
     */
    private getPaddingScheme;
    /**
     * 缓存公钥
     */
    private cachePublicKey;
    /**
     * 缓存私钥
     */
    private cachePrivateKey;
    /**
     * 获取缓存的公钥或解析新的公钥
     */
    private getPublicKey;
    /**
     * 获取缓存的私钥或解析新的私钥
     */
    private getPrivateKey;
    /**
     * 清除密钥缓存
     */
    clearKeyCache(): void;
}
/**
 * RSA 加密便捷函数
 */
declare const rsa: {
    /**
     * 生成 RSA 密钥对
     */
    generateKeyPair: (keySize?: number) => RSAKeyPair;
    /**
     * RSA 公钥加密
     */
    encrypt: (data: string, publicKey: string, options?: RSAOptions) => EncryptResult;
    /**
     * RSA 私钥解密
     */
    decrypt: (encryptedData: string | EncryptResult, privateKey: string, options?: RSAOptions) => DecryptResult;
    /**
     * RSA 签名
     */
    sign: (data: string, privateKey: string, algorithm?: string) => string;
    /**
     * RSA 验证签名
     */
    verify: (data: string, signature: string, publicKey: string, algorithm?: string) => boolean;
};

export { RSAEncryptor, rsa };
