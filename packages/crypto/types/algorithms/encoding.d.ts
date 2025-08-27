import { IEncoder, EncodingType } from '../types/index.js';

/**
 * 编码器
 */
declare class Encoder implements IEncoder {
    /**
     * 编码字符串
     */
    encode(data: string, encoding: EncodingType): string;
    /**
     * 解码字符串
     */
    decode(encodedData: string, encoding: EncodingType): string;
    /**
     * Base64 编码
     */
    private encodeBase64;
    /**
     * Base64 解码
     */
    private decodeBase64;
    /**
     * Hex 编码
     */
    private encodeHex;
    /**
     * Hex 解码
     */
    private decodeHex;
    /**
     * URL 安全的 Base64 编码
     */
    encodeBase64Url(data: string): string;
    /**
     * URL 安全的 Base64 解码
     */
    decodeBase64Url(encodedData: string): string;
}
/**
 * 编码便捷函数
 */
declare const encoding: {
    /**
     * Base64 编码
     */
    base64: {
        encode: (data: string) => string;
        decode: (encodedData: string) => string;
        encodeUrl: (data: string) => string;
        decodeUrl: (encodedData: string) => string;
    };
    /**
     * Hex 编码
     */
    hex: {
        encode: (data: string) => string;
        decode: (encodedData: string) => string;
    };
    /**
     * 通用编码函数
     */
    encode: (data: string, encoding: EncodingType) => string;
    /**
     * 通用解码函数
     */
    decode: (encodedData: string, encoding: EncodingType) => string;
};
/**
 * 向后兼容的别名
 */
declare const base64: {
    encode: (data: string) => string;
    decode: (encodedData: string) => string;
    encodeUrl: (data: string) => string;
    decodeUrl: (encodedData: string) => string;
};
declare const hex: {
    encode: (data: string) => string;
    decode: (encodedData: string) => string;
};

export { Encoder, base64, encoding, hex };
