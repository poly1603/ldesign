import CryptoJS from 'crypto-js';
import { EncodingType } from '../types/index.js';

/**
 * 字符串转换工具
 */
declare class StringUtils {
    /**
     * 字符串转 WordArray
     */
    static stringToWordArray(str: string): CryptoJS.lib.WordArray;
    /**
     * WordArray 转字符串
     */
    static wordArrayToString(wordArray: CryptoJS.lib.WordArray): string;
    /**
     * 字符串转 Base64
     */
    static stringToBase64(str: string): string;
    /**
     * Base64 转字符串
     */
    static base64ToString(base64: string): string;
    /**
     * 字符串转 Hex
     */
    static stringToHex(str: string): string;
    /**
     * Hex 转字符串
     */
    static hexToString(hex: string): string;
    /**
     * 根据编码类型转换字符串
     */
    static encodeString(str: string, encoding: EncodingType): string;
    /**
     * 根据编码类型解码字符串
     */
    static decodeString(encodedStr: string, encoding: EncodingType): string;
}
/**
 * 随机数生成工具
 */
declare class RandomUtils {
    /**
     * 生成随机字节
     */
    static generateRandomBytes(length: number): CryptoJS.lib.WordArray;
    /**
     * 生成随机字符串
     */
    static generateRandomString(length: number, encoding?: EncodingType): string;
    /**
     * 生成盐值
     */
    static generateSalt(length?: number): string;
    /**
     * 生成初始化向量 (IV)
     */
    static generateIV(length?: number): string;
    /**
     * 生成随机密钥
     */
    static generateKey(length?: number): string;
}
/**
 * 验证工具
 */
declare class ValidationUtils {
    /**
     * 验证字符串是否为空
     */
    static isEmpty(str: string | null | undefined): boolean;
    /**
     * 验证是否为有效的 Base64 字符串
     */
    static isValidBase64(str: string): boolean;
    /**
     * 验证是否为有效的 Hex 字符串
     */
    static isValidHex(str: string): boolean;
    /**
     * 验证密钥长度
     */
    static validateKeyLength(key: string, expectedLength: number): boolean;
    /**
     * 验证 AES 密钥长度
     */
    static validateAESKeyLength(key: string, keySize: number): boolean;
}
/**
 * 错误处理工具
 */
declare class ErrorUtils {
    /**
     * 创建加密错误
     */
    static createEncryptionError(message: string, algorithm?: string): Error;
    /**
     * 创建解密错误
     */
    static createDecryptionError(message: string, algorithm?: string): Error;
    /**
     * 创建哈希错误
     */
    static createHashError(message: string, algorithm?: string): Error;
    /**
     * 创建验证错误
     */
    static createValidationError(message: string): Error;
}
/**
 * 常量定义
 */
declare const CONSTANTS: {
    readonly AES: {
        readonly KEY_SIZES: readonly [128, 192, 256];
        readonly MODES: readonly ["CBC", "ECB", "CFB", "OFB", "CTR", "GCM"];
        readonly DEFAULT_MODE: "CBC";
        readonly DEFAULT_KEY_SIZE: 256;
        readonly IV_LENGTH: 16;
    };
    readonly RSA: {
        readonly KEY_SIZES: readonly [1024, 2048, 3072, 4096];
        readonly DEFAULT_KEY_SIZE: 2048;
    };
    readonly HASH: {
        readonly ALGORITHMS: readonly ["MD5", "SHA1", "SHA224", "SHA256", "SHA384", "SHA512"];
    };
    readonly HMAC: {
        readonly ALGORITHMS: readonly ["HMAC-MD5", "HMAC-SHA1", "HMAC-SHA256", "HMAC-SHA384", "HMAC-SHA512"];
    };
    readonly ENCODING: {
        readonly TYPES: readonly ["base64", "hex", "utf8"];
        readonly DEFAULT: "hex";
    };
};

export { CONSTANTS, ErrorUtils, RandomUtils, StringUtils, ValidationUtils };
