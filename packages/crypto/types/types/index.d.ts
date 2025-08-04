/**
 * 加密算法类型
 */
type EncryptionAlgorithm = 'AES' | 'RSA';
/**
 * AES 加密模式
 */
type AESMode = 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR' | 'GCM';
/**
 * AES 密钥长度
 */
type AESKeySize = 128 | 192 | 256;
/**
 * 哈希算法类型
 */
type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA224' | 'SHA256' | 'SHA384' | 'SHA512';
/**
 * HMAC 算法类型
 */
type HMACAlgorithm = 'HMAC-MD5' | 'HMAC-SHA1' | 'HMAC-SHA256' | 'HMAC-SHA384' | 'HMAC-SHA512';
/**
 * 编码类型
 */
type EncodingType = 'base64' | 'hex' | 'utf8';
/**
 * RSA 密钥格式
 */
type RSAKeyFormat = 'pkcs1' | 'pkcs8' | 'spki';
/**
 * RSA 密钥对
 */
interface RSAKeyPair {
    publicKey: string;
    privateKey: string;
}
/**
 * AES 加密选项
 */
interface AESOptions {
    mode?: AESMode;
    keySize?: AESKeySize;
    iv?: string;
    padding?: string;
}
/**
 * RSA 加密选项
 */
interface RSAOptions {
    keyFormat?: RSAKeyFormat;
    keySize?: number;
    padding?: string;
}
/**
 * 哈希选项
 */
interface HashOptions {
    encoding?: EncodingType;
}
/**
 * HMAC 选项
 */
interface HMACOptions {
    encoding?: EncodingType;
}
/**
 * 加密结果
 */
interface EncryptResult {
    data: string;
    algorithm: string;
    iv?: string;
    salt?: string;
}
/**
 * 解密结果
 */
interface DecryptResult {
    data: string;
    success: boolean;
    error?: string;
}
/**
 * 哈希结果
 */
interface HashResult {
    hash: string;
    algorithm: string;
    encoding: EncodingType;
}
/**
 * 密钥生成选项
 */
interface KeyGenerationOptions {
    algorithm: EncryptionAlgorithm;
    keySize?: number;
    format?: string;
}
/**
 * 加密器接口
 */
interface IEncryptor {
    encrypt: (data: string, key: string, options?: any) => EncryptResult;
    decrypt: (encryptedData: string | EncryptResult, key: string, options?: any) => DecryptResult;
}
/**
 * 哈希器接口
 */
interface IHasher {
    hash: (data: string, algorithm?: HashAlgorithm, options?: HashOptions) => HashResult;
    verify: (data: string, expectedHash: string, algorithm?: HashAlgorithm, options?: HashOptions) => boolean;
}
/**
 * HMAC 接口
 */
interface IHMACer {
    hmac: (data: string, key: string, algorithm: HMACAlgorithm, options?: HMACOptions) => HashResult;
    verify: (data: string, key: string, hmac: string, algorithm: HMACAlgorithm, options?: HMACOptions) => boolean;
}
/**
 * 编码器接口
 */
interface IEncoder {
    encode: (data: string, encoding: EncodingType) => string;
    decode: (encodedData: string, encoding: EncodingType) => string;
}
/**
 * 密钥生成器接口
 */
interface IKeyGenerator {
    generateKey: (options: KeyGenerationOptions) => string | RSAKeyPair;
    generateRandomBytes: (length: number) => string;
    generateSalt: (length?: number) => string;
    generateIV: (length?: number) => string;
}

export type { AESKeySize, AESMode, AESOptions, DecryptResult, EncodingType, EncryptResult, EncryptionAlgorithm, HMACAlgorithm, HMACOptions, HashAlgorithm, HashOptions, HashResult, IEncoder, IEncryptor, IHMACer, IHasher, IKeyGenerator, KeyGenerationOptions, RSAKeyFormat, RSAKeyPair, RSAOptions };
