/**
 * 工具函数导出
 *
 * 导出所有工具函数和辅助方法
 */
/**
 * 格式化日期
 */
declare const formatDate: (
  date: Date | string | number,
  format?: string
) => string
/**
 * 防抖函数
 */
declare const debounce: <T extends (...args: any[]) => any>(
  func: T,
  wait: number
) => (...args: Parameters<T>) => void
/**
 * 节流函数
 */
declare const throttle: <T extends (...args: any[]) => any>(
  func: T,
  limit: number
) => (...args: Parameters<T>) => void
/**
 * 深拷贝
 */
declare const deepClone: <T>(obj: T) => T
/**
 * 生成唯一ID
 */
declare const generateId: (prefix?: string) => string
/**
 * 检查是否为空值
 */
declare const isEmpty: (value: any) => boolean

export { debounce, deepClone, formatDate, generateId, isEmpty, throttle }
