import { IEncryptor, RSAKeyPair, RSAOptions, EncryptResult, DecryptResult } from '@/types';

/**
 * RSA 加密器
 */
declare class RSAEncryptor implements IEncryptor {
    private readonly defaultOptions;
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
