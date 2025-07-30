import { RequestConfig, HttpError } from '../types/index.js';

/**
 * 合并配置对象
 */
declare function mergeConfig(defaultConfig: RequestConfig, customConfig?: RequestConfig): RequestConfig;
/**
 * 构建查询字符串
 */
declare function buildQueryString(params: Record<string, any>): string;
/**
 * 构建完整的 URL
 */
declare function buildURL(url: string, baseURL?: string, params?: Record<string, any>): string;
/**
 * 判断是否为绝对 URL
 */
declare function isAbsoluteURL(url: string): boolean;
/**
 * 合并 URL
 */
declare function combineURLs(baseURL: string, relativeURL: string): string;
/**
 * 创建 HTTP 错误
 */
declare function createHttpError(message: string, config?: RequestConfig, code?: string, response?: any): HttpError;
/**
 * 延迟函数
 */
declare function delay(ms: number): Promise<void>;
/**
 * 生成唯一 ID
 */
declare function generateId(): string;
/**
 * 深拷贝对象
 */
declare function deepClone<T>(obj: T): T;
/**
 * 判断是否为 FormData
 */
declare function isFormData(data: any): data is FormData;
/**
 * 判断是否为 Blob
 */
declare function isBlob(data: any): data is Blob;
/**
 * 判断是否为 ArrayBuffer
 */
declare function isArrayBuffer(data: any): data is ArrayBuffer;
/**
 * 判断是否为 URLSearchParams
 */
declare function isURLSearchParams(data: any): data is URLSearchParams;

export { buildQueryString, buildURL, combineURLs, createHttpError, deepClone, delay, generateId, isAbsoluteURL, isArrayBuffer, isBlob, isFormData, isURLSearchParams, mergeConfig };
