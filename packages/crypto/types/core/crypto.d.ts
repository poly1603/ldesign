import { AESOptions, EncryptResult, RSAOptions, EncodingType, DecryptResult, HashOptions, HashAlgorithm, RSAKeyPair } from '@/types';

/**
 * 加密类
 */
declare class Encrypt {
    /**
     * AES 加密
     */
    aes(data: string, key: string, options?: AESOptions): EncryptResult;
    /**
     * AES-128 加密
     */
    aes128(data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult;
    /**
     * AES-192 加密
     */
    aes192(data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult;
    /**
     * AES-256 加密
     */
    aes256(data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult;
    /**
     * RSA 加密
     */
    rsa(data: string, publicKey: string, options?: RSAOptions): EncryptResult;
    /**
     * Base64 编码
     */
    base64(data: string): string;
    /**
     * URL 安全的 Base64 编码
     */
    base64Url(data: string): string;
    /**
     * Hex 编码
     */
    hex(data: string): string;
    /**
     * 通用编码
     */
    encode(data: string, encoding: EncodingType): string;
}
/**
 * 解密类
 */
declare class Decrypt {
    /**
     * AES 解密
     */
    aes(encryptedData: string | EncryptResult, key: string, options?: AESOptions): DecryptResult;
    /**
     * AES-128 解密
     */
    aes128(encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult;
    /**
     * AES-192 解密
     */
    aes192(encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult;
    /**
     * AES-256 解密
     */
    aes256(encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult;
    /**
     * RSA 解密
     */
    rsa(encryptedData: string | EncryptResult, privateKey: string, options?: RSAOptions): DecryptResult;
    /**
     * Base64 解码
     */
    base64(encodedData: string): string;
    /**
     * URL 安全的 Base64 解码
     */
    base64Url(encodedData: string): string;
    /**
     * Hex 解码
     */
    hex(encodedData: string): string;
    /**
     * 通用解码
     */
    decode(encodedData: string, encoding: EncodingType): string;
}
/**
 * 哈希类
 */
declare class Hash {
    /**
     * MD5 哈希
     */
    md5(data: string, options?: HashOptions): string;
    /**
     * SHA1 哈希
     */
    sha1(data: string, options?: HashOptions): string;
    /**
     * SHA224 哈希
     */
    sha224(data: string, options?: HashOptions): string;
    /**
     * SHA256 哈希
     */
    sha256(data: string, options?: HashOptions): string;
    /**
     * SHA384 哈希
     */
    sha384(data: string, options?: HashOptions): string;
    /**
     * SHA512 哈希
     */
    sha512(data: string, options?: HashOptions): string;
    /**
     * 通用哈希
     */
    hash(data: string, algorithm?: HashAlgorithm, options?: HashOptions): string;
    /**
     * 验证哈希
     */
    verify(data: string, expectedHash: string, algorithm?: HashAlgorithm, options?: HashOptions): boolean;
}
/**
 * HMAC 类
 */
declare class HMAC {
    /**
     * HMAC-MD5
     */
    md5(data: string, key: string, options?: HashOptions): string;
    /**
     * HMAC-SHA1
     */
    sha1(data: string, key: string, options?: HashOptions): string;
    /**
     * HMAC-SHA256
     */
    sha256(data: string, key: string, options?: HashOptions): string;
    /**
     * HMAC-SHA384
     */
    sha384(data: string, key: string, options?: HashOptions): string;
    /**
     * HMAC-SHA512
     */
    sha512(data: string, key: string, options?: HashOptions): string;
    /**
     * 通用 HMAC
     */
    hmac(data: string, key: string, algorithm?: HashAlgorithm, options?: HashOptions): string;
    /**
     * 验证 HMAC
     */
    verify(data: string, key: string, expectedHmac: string, algorithm?: HashAlgorithm, options?: HashOptions): boolean;
}
/**
 * 密钥生成类
 */
declare class KeyGenerator {
    /**
     * 生成 RSA 密钥对
     */
    generateRSAKeyPair(keySize?: number): RSAKeyPair;
    /**
     * 生成随机密钥
     */
    generateKey(length?: number): string;
    /**
     * 生成随机字节
     */
    generateRandomBytes(length: number): string;
    /**
     * 生成盐值
     */
    generateSalt(length?: number): string;
    /**
     * 生成初始化向量
     */
    generateIV(length?: number): string;
}
/**
 * 数字签名类
 */
declare class DigitalSignature {
    /**
     * RSA 签名
     */
    sign(data: string, privateKey: string, algorithm?: string): string;
    /**
     * RSA 验证签名
     */
    verify(data: string, signature: string, publicKey: string, algorithm?: string): boolean;
}

export { Decrypt, DigitalSignature, Encrypt, HMAC, Hash, KeyGenerator };
