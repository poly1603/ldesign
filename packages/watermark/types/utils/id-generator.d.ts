/**
 * ID生成器工具
 */
/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
declare function generateId(prefix?: string): string;
/**
 * 生成UUID v4
 * @returns UUID字符串
 */
declare function generateUUID(): string;
/**
 * 生成短ID
 * @param length 长度
 * @returns 短ID
 */
declare function generateShortId(length?: number): string;
/**
 * 生成数字ID
 * @param length 长度
 * @returns 数字ID
 */
declare function generateNumericId(length?: number): string;
/**
 * 生成带时间戳的ID
 * @param prefix 前缀
 * @returns 带时间戳的ID
 */
declare function generateTimestampId(prefix?: string): string;

export { generateId, generateNumericId, generateShortId, generateTimestampId, generateUUID };
