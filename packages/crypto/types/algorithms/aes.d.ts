import { IEncryptor, AESOptions, EncryptResult, DecryptResult } from '@/types';

/**
 * AES 加密器
 */
declare class AESEncryptor implements IEncryptor {
    private readonly defaultOptions;
    /**
     * AES 加密
     */
    encrypt(data: string, key: string, options?: AESOptions): EncryptResult;
    /**
     * AES 解密
     */
    decrypt(encryptedData: string | EncryptResult, key: string, options?: AESOptions): DecryptResult;
    /**
     * 准备密钥
     */
    private prepareKey;
    /**
     * 获取加密模式
     */
    private getMode;
}
/**
 * AES 加密便捷函数
 */
declare const aes: {
    /**
     * AES 加密
     */
    encrypt: (data: string, key: string, options?: AESOptions) => EncryptResult;
    /**
     * AES 解密
     */
    decrypt: (encryptedData: string | EncryptResult, key: string, options?: AESOptions) => DecryptResult;
    /**
     * AES-128 加密
     */
    encrypt128: (data: string, key: string, options?: Omit<AESOptions, "keySize">) => EncryptResult;
    /**
     * AES-192 加密
     */
    encrypt192: (data: string, key: string, options?: Omit<AESOptions, "keySize">) => EncryptResult;
    /**
     * AES-256 加密
     */
    encrypt256: (data: string, key: string, options?: Omit<AESOptions, "keySize">) => EncryptResult;
    /**
     * AES-128 解密
     */
    decrypt128: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, "keySize">) => DecryptResult;
    /**
     * AES-192 解密
     */
    decrypt192: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, "keySize">) => DecryptResult;
    /**
     * AES-256 解密
     */
    decrypt256: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, "keySize">) => DecryptResult;
};

export { AESEncryptor, aes };
