/**
 * @ldesign/form - Type Checking Utilities
 * 类型检查工具函数
 */

/**
 * 检查是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 检查是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 检查是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 检查是否为函数
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

/**
 * 检查是否为对象（排除 null）
 */
export function isObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 检查是否为纯对象
 */
export function isPlainObject(value: unknown): value is Record<string, any> {
  if (!isObject(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}

/**
 * 检查是否为数组
 */
export function isArray(value: unknown): value is any[] {
  return Array.isArray(value)
}

/**
 * 检查是否为 null 或 undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

/**
 * 检查是否为空值（null、undefined、空字符串、空数组、空对象）
 */
export function isEmpty(value: unknown): boolean {
  if (isNullOrUndefined(value)) return true
  if (isString(value)) return value.trim().length === 0
  if (isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}

/**
 * 检查是否为 Promise
 */
export function isPromise<T = any>(value: unknown): value is Promise<T> {
  return (
    !!value &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as any).then === 'function'
  )
}

/**
 * 检查是否为正则表达式
 */
export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp
}

/**
 * 检查是否为日期对象
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

/**
 * 获取值的类型字符串
 */
export function getType(value: unknown): string {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}




