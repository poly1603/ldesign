/**
 * 类型守卫工具集
 * 🛡️ 提供运行时类型检查和验证功能
 */

/**
 * 检查值是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 检查值是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * 检查值是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 检查值是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 检查值是否为数组
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * 检查值是否为函数
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

/**
 * 检查值是否为Promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'then' in value &&
    typeof (value as { then?: unknown }).then === 'function'
  )
}

/**
 * 检查值是否为null
 */
export function isNull(value: unknown): value is null {
  return value === null
}

/**
 * 检查值是否为undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

/**
 * 检查值是否为null或undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

/**
 * 检查值是否存在（非null且非undefined）
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * 检查值是否为空（null、undefined、空字符串、空数组、空对象）
 */
export function isEmpty(value: unknown): boolean {
  if (isNullOrUndefined(value)) {
    return true
  }

  if (isString(value)) {
    return value.trim().length === 0
  }

  if (isArray(value)) {
    return value.length === 0
  }

  if (isObject(value)) {
    return Object.keys(value).length === 0
  }

  return false
}

/**
 * 检查值是否为有效的日期对象
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

/**
 * 检查值是否为正则表达式
 */
export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp
}

/**
 * 检查值是否为Error对象
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

/**
 * 检查值是否为Map
 */
export function isMap<K = unknown, V = unknown>(value: unknown): value is Map<K, V> {
  return value instanceof Map
}

/**
 * 检查值是否为Set
 */
export function isSet<T = unknown>(value: unknown): value is Set<T> {
  return value instanceof Set
}

/**
 * 检查值是否为WeakMap
 */
export function isWeakMap(value: unknown): value is WeakMap<object, unknown> {
  return value instanceof WeakMap
}

/**
 * 检查值是否为WeakSet
 */
export function isWeakSet(value: unknown): value is WeakSet<object> {
  return value instanceof WeakSet
}

/**
 * 检查值是否为Symbol
 */
export function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol'
}

/**
 * 检查值是否为BigInt
 */
export function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint'
}

/**
 * 检查值是否为整数
 */
export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value)
}

/**
 * 检查值是否为正数
 */
export function isPositive(value: unknown): value is number {
  return isNumber(value) && value > 0
}

/**
 * 检查值是否为负数
 */
export function isNegative(value: unknown): value is number {
  return isNumber(value) && value < 0
}

/**
 * 检查值是否在指定范围内
 */
export function isInRange(value: unknown, min: number, max: number): value is number {
  return isNumber(value) && value >= min && value <= max
}

/**
 * 检查字符串是否匹配指定的正则表达式
 */
export function matches(value: string, pattern: RegExp): boolean {
  return pattern.test(value)
}

/**
 * 检查字符串是否为有效的电子邮件
 */
export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * 检查字符串是否为有效的URL
 */
export function isURL(value: unknown): value is string {
  if (!isString(value)) return false
  try {
    // eslint-disable-next-line no-new
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * 检查字符串是否为有效的JSON
 */
export function isJSON(value: unknown): value is string {
  if (!isString(value)) return false
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

/**
 * 检查值是否具有指定的键
 */
export function hasKey<K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> {
  return isObject(value) && key in value
}

/**
 * 检查值是否具有所有指定的键
 */
export function hasKeys<K extends string>(
  value: unknown,
  keys: K[]
): value is Record<K, unknown> {
  return isObject(value) && keys.every(key => key in value)
}

/**
 * 检查值是否为指定类型的实例
 */
export function isInstanceOf<T>(
  value: unknown,
  constructor: new (...args: unknown[]) => T
): value is T {
  return value instanceof constructor
}

/**
 * 验证器函数类型
 */
export type Validator<T> = (value: unknown) => value is T

/**
 * 创建自定义类型守卫
 */
export function createTypeGuard<T>(
  predicate: (value: unknown) => boolean
): Validator<T> {
  return ((value: unknown): value is T => predicate(value)) as Validator<T>
}

/**
 * 组合多个类型守卫（AND逻辑）
 */
export function and<T>(...guards: Validator<unknown>[]): Validator<T> {
  return createTypeGuard<T>((value) => guards.every(guard => guard(value)))
}

/**
 * 组合多个类型守卫（OR逻辑）
 */
export function or<T>(...guards: Validator<unknown>[]): Validator<T> {
  return createTypeGuard<T>((value) => guards.some(guard => guard(value)))
}

/**
 * 创建否定的类型守卫
 */
export function not<T>(guard: Validator<T>): Validator<unknown> {
  return createTypeGuard<unknown>((value) => !guard(value))
}

/**
 * 断言值符合指定类型
 * @throws {TypeError} 如果值不符合类型
 */
export function assert(
  condition: boolean,
  message = 'Assertion failed'
): asserts condition {
  if (!condition) {
    throw new TypeError(message)
  }
}

/**
 * 断言值为指定类型
 * @throws {TypeError} 如果值不符合类型
 */
export function assertType<T>(
  value: unknown,
  guard: Validator<T>,
  message?: string
): asserts value is T {
  assert(
    guard(value),
    message || `Value does not match expected type`
  )
}

/**
 * 安全地获取对象属性
 */
export function safeGet<T = unknown>(
  obj: unknown,
  key: string,
  defaultValue?: T
): T | undefined {
  if (!isObject(obj)) return defaultValue
  return (obj[key] as T) ?? defaultValue
}

/**
 * 安全地设置对象属性
 */
export function safeSet<T = unknown>(
  obj: unknown,
  key: string,
  value: T
): boolean {
  if (!isObject(obj)) return false
  obj[key] = value
  return true
}

/**
 * 类型守卫工具集合
 */
export const TypeGuards = {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isPromise,
  isNull,
  isUndefined,
  isNullOrUndefined,
  isDefined,
  isEmpty,
  isDate,
  isRegExp,
  isError,
  isMap,
  isSet,
  isWeakMap,
  isWeakSet,
  isSymbol,
  isBigInt,
  isInteger,
  isPositive,
  isNegative,
  isInRange,
  matches,
  isEmail,
  isURL,
  isJSON,
  hasKey,
  hasKeys,
  isInstanceOf,
  createTypeGuard,
  and,
  or,
  not,
  assert,
  assertType,
  safeGet,
  safeSet,
}
