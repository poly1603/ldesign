/**
 * 工具函数集合
 */
/**
 * 格式化日期
 * @param date 日期对象、字符串或时间戳
 * @param format 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
declare function formatDate(
  date: Date | string | number,
  format?: string
): string
/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID字符串
 */
declare function generateId(prefix?: string): string
/**
 * 检查值是否为空
 * @param value 要检查的值
 * @returns 是否为空
 */
declare function isEmpty(value: any): boolean
/**
 * 深度克隆对象
 * @param obj 要克隆的对象
 * @returns 克隆后的对象
 */
declare function deepClone<T>(obj: T): T
/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
declare function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void
/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
declare function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void

export { debounce, deepClone, formatDate, generateId, isEmpty, throttle }
