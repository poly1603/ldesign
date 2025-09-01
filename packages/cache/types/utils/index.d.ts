export { EventEmitter } from './event-emitter';
export * from './error-handler';
export * from './validator';
/**
 * 工具函数
 */
export declare function isValidInput(input: unknown): boolean;
/**
 * 检查是否为浏览器环境
 */
export declare function isBrowser(): boolean;
/**
 * 检查是否为 Node.js 环境
 */
export declare function isNode(): boolean;
/**
 * 安全的 JSON 解析
 */
export declare function safeJsonParse<T = any>(json: string, defaultValue: T): T;
/**
 * 安全的 JSON 序列化
 */
export declare function safeJsonStringify(value: any): string;
/**
 * 深度克隆对象
 */
export declare function deepClone<T>(obj: T): T;
/**
 * 防抖函数
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * 格式化字节大小
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * 生成唯一ID
 */
export declare function generateId(): string;
/**
 * 延迟执行
 */
export declare function delay(ms: number): Promise<void>;
//# sourceMappingURL=index.d.ts.map