/**
 * 工具函数
 */
/**
 * 检查输入是否有效
 */
declare function isValidInput(input: unknown): boolean
/**
 * 深度合并对象
 */
declare function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T
/**
 * 检查是否为对象
 */
declare function isObject(item: unknown): item is Record<string, unknown>
/**
 * 生成唯一 ID
 */
declare function generateId(prefix?: string): string
/**
 * 防抖函数
 */
declare function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void
/**
 * 节流函数
 */
declare function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void
/**
 * 重试函数
 */
declare function retry<T>(
  fn: () => Promise<T>,
  maxAttempts?: number,
  delay?: number
): Promise<T>
/**
 * 睡眠函数
 */
declare function sleep(ms: number): Promise<void>
/**
 * 格式化错误信息
 */
declare function formatError(error: unknown): string
/**
 * 检查是否为空值
 */
declare function isEmpty(value: unknown): boolean
/**
 * 安全的 JSON 解析
 */
declare function safeJsonParse<T = unknown>(str: string, defaultValue: T): T
/**
 * 安全的 JSON 字符串化
 */
declare function safeJsonStringify(obj: unknown, defaultValue?: string): string
/**
 * 获取嵌套对象属性值
 */
declare function get(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: unknown
): unknown
/**
 * 设置嵌套对象属性值
 */
declare function set(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void

export {
  debounce,
  deepMerge,
  formatError,
  generateId,
  get,
  isEmpty,
  isObject,
  isValidInput,
  retry,
  safeJsonParse,
  safeJsonStringify,
  set,
  sleep,
  throttle,
}
