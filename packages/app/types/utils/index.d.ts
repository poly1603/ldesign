/**
 * 简化的工具函数集合
 */
/**
 * 格式化日期
 */
declare function formatDate(date: Date | string | number): string;
/**
 * 生成唯一ID
 */
declare function generateId(prefix?: string): string;

export { formatDate, generateId };
