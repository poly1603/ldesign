/**
 * TypeScript 类型守卫和类型检查工具
 * 
 * 提供运行时类型检查和类型守卫函数
 */

import type {
  Primitive,
  JsonValue,
  JsonObject,
  AnyFunction,
  AsyncFunction,
  Constructor,
  Dictionary,
} from './common'

/**
 * 检查是否为原始类型
 */
export function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    typeof value === 'bigint'
  )
}

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
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * 检查是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 检查是否为 null
 */
export function isNull(value: unknown): value is null {
  return value === null
}

/**
 * 检查是否为 undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

/**
 * 检查是否为 null 或 undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

/**
 * 检查是否为 Symbol
 */
export function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol'
}

/**
 * 检查是否为 BigInt
 */
export function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint'
}

/**
 * 检查是否为对象
 */
export function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return value !== null && typeof value === 'object'
}

/**
 * 检查是否为纯对象
 */
export function isPlainObject(value: unknown): value is Dictionary {
  if (!isObject(value)) {
    return false
  }

  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}

/**
 * 检查是否为数组
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * 检查是否为空数组
 */
export function isEmptyArray(value: unknown): value is [] {
  return Array.isArray(value) && value.length === 0
}

/**
 * 检查是否为非空数组
 */
export function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0
}

/**
 * 检查是否为函数
 */
export function isFunction(value: unknown): value is AnyFunction {
  return typeof value === 'function'
}

/**
 * 检查是否为异步函数
 */
export function isAsyncFunction(value: unknown): value is AsyncFunction {
  return (
    typeof value === 'function' &&
    value.constructor.name === 'AsyncFunction'
  )
}

/**
 * 检查是否为 Promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return (
    value instanceof Promise ||
    (isObject(value) && isFunction((value as any).then))
  )
}

/**
 * 检查是否为 Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

/**
 * 检查是否为 RegExp
 */
export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp
}

/**
 * 检查是否为 Map
 */
export function isMap<K = unknown, V = unknown>(
  value: unknown
): value is Map<K, V> {
  return value instanceof Map
}

/**
 * 检查是否为 Set
 */
export function isSet<T = unknown>(value: unknown): value is Set<T> {
  return value instanceof Set
}

/**
 * 检查是否为 WeakMap
 */
export function isWeakMap(value: unknown): value is WeakMap<object, unknown> {
  return value instanceof WeakMap
}

/**
 * 检查是否为 WeakSet
 */
export function isWeakSet(value: unknown): value is WeakSet<object> {
  return value instanceof WeakSet
}

/**
 * 检查是否为 Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

/**
 * 检查是否为空对象
 */
export function isEmptyObject(value: unknown): value is Record<string, never> {
  return isPlainObject(value) && Object.keys(value).length === 0
}

/**
 * 检查是否为空值（null、undefined、空字符串、空数组、空对象）
 */
export function isEmpty(value: unknown): boolean {
  if (isNullish(value)) return true
  if (isString(value)) return value.length === 0
  if (isArray(value)) return value.length === 0
  if (isMap(value) || isSet(value)) return value.size === 0
  if (isPlainObject(value)) return Object.keys(value).length === 0
  return false
}

/**
 * 检查是否为有效的 JSON 值
 */
export function isJsonValue(value: unknown): value is JsonValue {
  if (isPrimitive(value)) {
    return value !== undefined && !Number.isNaN(value)
  }

  if (isArray(value)) {
    return value.every(isJsonValue)
  }

  if (isPlainObject(value)) {
    return Object.values(value).every(isJsonValue)
  }

  return false
}

/**
 * 检查是否为有效的 JSON 对象
 */
export function isJsonObject(value: unknown): value is JsonObject {
  return isPlainObject(value) && isJsonValue(value)
}

/**
 * 检查是否为可序列化的值
 */
export function isSerializable(value: unknown): boolean {
  if (isPrimitive(value)) {
    return value !== undefined && typeof value !== 'symbol'
  }

  if (isArray(value)) {
    return value.every(isSerializable)
  }

  if (isPlainObject(value)) {
    return Object.values(value).every(isSerializable)
  }

  // Date 和 RegExp 可以序列化
  if (isDate(value) || isRegExp(value)) {
    return true
  }

  return false
}

/**
 * 检查是否为可迭代对象
 */
export function isIterable<T = unknown>(
  value: unknown
): value is Iterable<T> {
  return (
    value !== null &&
    value !== undefined &&
    isFunction((value as any)[Symbol.iterator])
  )
}

/**
 * 检查是否为异步可迭代对象
 */
export function isAsyncIterable<T = unknown>(
  value: unknown
): value is AsyncIterable<T> {
  return (
    value !== null &&
    value !== undefined &&
    isFunction((value as any)[Symbol.asyncIterator])
  )
}

/**
 * 检查是否为构造函数
 */
export function isConstructor<T = object>(
  value: unknown
): value is Constructor<T> {
  return (
    isFunction(value) &&
    value.prototype &&
    value.prototype.constructor === value
  )
}

/**
 * 检查是否为类实例
 */
export function isInstance<T>(
  value: unknown,
  constructor: Constructor<T>
): value is T {
  return value instanceof constructor
}

/**
 * 检查是否为特定类型
 */
export function isType<T>(
  value: unknown,
  typeCheck: (val: unknown) => boolean
): value is T {
  return typeCheck(value)
}

/**
 * 检查对象是否包含指定属性
 */
export function hasProperty<K extends PropertyKey>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj
}

/**
 * 检查对象是否包含自有属性
 */
export function hasOwnProperty<K extends PropertyKey>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && Object.prototype.hasOwnProperty.call(obj, key)
}

/**
 * 断言值为指定类型
 */
export function assert<T>(
  condition: unknown,
  message?: string
): asserts condition is T {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

/**
 * 断言值非空
 */
export function assertNonNullable<T>(
  value: T,
  message?: string
): asserts value is NonNullable<T> {
  if (isNullish(value)) {
    throw new Error(message || 'Value is null or undefined')
  }
}

/**
 * 断言为字符串
 */
export function assertString(
  value: unknown,
  message?: string
): asserts value is string {
  if (!isString(value)) {
    throw new TypeError(message || 'Value is not a string')
  }
}

/**
 * 断言为数字
 */
export function assertNumber(
  value: unknown,
  message?: string
): asserts value is number {
  if (!isNumber(value)) {
    throw new TypeError(message || 'Value is not a number')
  }
}

/**
 * 断言为布尔值
 */
export function assertBoolean(
  value: unknown,
  message?: string
): asserts value is boolean {
  if (!isBoolean(value)) {
    throw new TypeError(message || 'Value is not a boolean')
  }
}

/**
 * 断言为对象
 */
export function assertObject<T extends Record<PropertyKey, unknown>>(
  value: unknown,
  message?: string
): asserts value is T {
  if (!isObject(value)) {
    throw new TypeError(message || 'Value is not an object')
  }
}

/**
 * 断言为数组
 */
export function assertArray<T>(
  value: unknown,
  message?: string
): asserts value is T[] {
  if (!isArray(value)) {
    throw new TypeError(message || 'Value is not an array')
  }
}

/**
 * 断言为函数
 */
export function assertFunction(
  value: unknown,
  message?: string
): asserts value is AnyFunction {
  if (!isFunction(value)) {
    throw new TypeError(message || 'Value is not a function')
  }
}

/**
 * 创建类型守卫
 */
export function createTypeGuard<T>(
  predicate: (value: unknown) => boolean
): (value: unknown) => value is T {
  return (value: unknown): value is T => predicate(value)
}

/**
 * 组合类型守卫（与逻辑）
 */
export function and<A, B>(
  guardA: (value: unknown) => value is A,
  guardB: (value: unknown) => value is B
): (value: unknown) => value is A & B {
  return (value: unknown): value is A & B => guardA(value) && guardB(value)
}

/**
 * 组合类型守卫（或逻辑）
 */
export function or<A, B>(
  guardA: (value: unknown) => value is A,
  guardB: (value: unknown) => value is B
): (value: unknown) => value is A | B {
  return (value: unknown): value is A | B => guardA(value) || guardB(value)
}

/**
 * 反转类型守卫
 */
export function not<T>(
  guard: (value: unknown) => value is T
): (value: unknown) => value is Exclude<unknown, T> {
  return (value: unknown): value is Exclude<unknown, T> => !guard(value)
}

/**
 * 数组元素类型守卫
 */
export function arrayOf<T>(
  guard: (value: unknown) => value is T
): (value: unknown) => value is T[] {
  return (value: unknown): value is T[] =>
    isArray(value) && value.every(guard)
}

/**
 * 对象属性类型守卫
 */
export function recordOf<K extends PropertyKey, V>(
  keyGuard: (value: unknown) => value is K,
  valueGuard: (value: unknown) => value is V
): (value: unknown) => value is Record<K, V> {
  return (value: unknown): value is Record<K, V> => {
    if (!isObject(value)) return false

    return Object.entries(value).every(
      ([key, val]) => keyGuard(key) && valueGuard(val)
    )
  }
}

/**
 * 可选类型守卫
 */
export function optional<T>(
  guard: (value: unknown) => value is T
): (value: unknown) => value is T | undefined {
  return (value: unknown): value is T | undefined =>
    value === undefined || guard(value)
}

/**
 * 可空类型守卫
 */
export function nullable<T>(
  guard: (value: unknown) => value is T
): (value: unknown) => value is T | null {
  return (value: unknown): value is T | null => value === null || guard(value)
}

/**
 * Maybe 类型守卫
 */
export function maybe<T>(
  guard: (value: unknown) => value is T
): (value: unknown) => value is T | null | undefined {
  return (value: unknown): value is T | null | undefined =>
    isNullish(value) || guard(value)
}

/**
 * 字面量类型守卫
 */
export function literal<T extends string | number | boolean>(
  value: T
): (val: unknown) => val is T {
  return (val: unknown): val is T => val === value
}

/**
 * 枚举类型守卫
 */
export function enumGuard<T extends Record<string, string | number>>(
  enumObj: T
): (value: unknown) => value is T[keyof T] {
  const values = Object.values(enumObj)
  return (value: unknown): value is T[keyof T] => values.includes(value as any)
}

/**
 * 元组类型守卫
 */
export function tuple<T extends unknown[]>(
  ...guards: { [K in keyof T]: (value: unknown) => value is T[K] }
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    if (!isArray(value) || value.length !== guards.length) {
      return false
    }

    return guards.every((guard, index) => guard(value[index]))
  }
}

/**
 * 联合类型守卫
 */
export function union<T extends unknown[]>(
  ...guards: { [K in keyof T]: (value: unknown) => value is T[K] }
): (value: unknown) => value is T[number] {
  return (value: unknown): value is T[number] =>
    guards.some((guard) => guard(value))
}

/**
 * 交叉类型守卫
 */
export function intersection<T extends unknown[]>(
  ...guards: { [K in keyof T]: (value: unknown) => value is T[K] }
): (value: unknown) => value is T[number] {
  return (value: unknown): value is T[number] =>
    guards.every((guard) => guard(value))
}
