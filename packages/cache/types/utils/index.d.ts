export { EventEmitter } from './event-emitter.js';

/**
 * 工具函数
 */
declare function isValidInput(input: unknown): boolean;
/**
 * 检查是否为浏览器环境
 */
declare function isBrowser(): boolean;
/**
 * 检查是否为 Node.js 环境
 */
declare function isNode(): boolean;
/**
 * 安全的 JSON 解析
 */
declare function safeJsonParse<T = any>(json: string, defaultValue: T): T;
/**
 * 安全的 JSON 序列化
 */
declare function safeJsonStringify(value: any): string;
/**
 * 深度克隆对象
 */
declare function deepClone<T>(obj: T): T;
/**
 * 防抖函数
 */
declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * 格式化字节大小
 */
declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * 生成唯一ID
 */
declare function generateId(): string;
/**
 * 延迟执行
 */
declare function delay(ms: number): Promise<void>;

export { debounce, deepClone, delay, formatBytes, generateId, isBrowser, isNode, isValidInput, safeJsonParse, safeJsonStringify, throttle };
