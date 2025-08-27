/**
 * TypeScript 类型工具集
 * 提供高级类型操作和类型安全的工具函数
 */

import type { HttpError, HttpMethod } from './index'

/**
 * 字面量类型：HTTP 状态码分类
 */
export type SuccessStatusCode = 200 | 201 | 202 | 204
export type RedirectStatusCode = 300 | 301 | 302 | 303 | 304 | 307 | 308
export type ClientErrorStatusCode = 400 | 401 | 403 | 404 | 405 | 409 | 422 | 429
export type ServerErrorStatusCode = 500 | 501 | 502 | 503 | 504 | 505

/**
 * 联合类型：所有状态码
 */
export type AllStatusCode = SuccessStatusCode | RedirectStatusCode | ClientErrorStatusCode | ServerErrorStatusCode

/**
 * 映射类型：状态码到消息的映射
 */
export type StatusCodeMessages = {
  [K in AllStatusCode]: string
}

/**
 * 条件类型：根据 HTTP 方法确定是否允许请求体
 */
export type AllowsRequestBody<T extends HttpMethod> =
  T extends 'GET' | 'HEAD' | 'DELETE' ? false : true

/**
 * 条件类型：根据是否允许请求体确定数据类型
 */
export type RequestBodyType<T extends HttpMethod, TData = any> =
  AllowsRequestBody<T> extends true ? TData : never

/**
 * 模板字面量类型：URL 路径参数提取
 */
export type ExtractPathParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractPathParams<Rest>
    : T extends `${infer _Start}:${infer Param}`
      ? Param
      : never

/**
 * 模板字面量类型：构建带参数的 URL
 */
export type BuildUrlWithParams<
  TPath extends string,
  TParams extends Record<string, string | number>,
> = TPath extends `${infer Start}:${infer Param}/${infer Rest}`
  ? Param extends keyof TParams
    ? `${Start}${TParams[Param]}/${BuildUrlWithParams<Rest, TParams>}`
    : never
  : TPath extends `${infer Start}:${infer Param}`
    ? Param extends keyof TParams
      ? `${Start}${TParams[Param]}`
      : never
    : TPath

/**
 * 递归类型：深度合并两个对象类型
 */
export type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? K extends keyof T
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : U[K]
    : K extends keyof T
      ? T[K]
      : never
}

/**
 * 工具类型：提取对象中的函数类型
 */
export type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]

/**
 * 工具类型：提取对象中的非函数类型
 */
export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K
}[keyof T]

/**
 * 工具类型：只保留函数属性
 */
export type FunctionsOnly<T> = Pick<T, FunctionKeys<T>>

/**
 * 工具类型：只保留非函数属性
 */
export type PropertiesOnly<T> = Pick<T, NonFunctionKeys<T>>

/**
 * 条件类型：检查类型是否为 Promise
 */
export type IsPromise<T> = T extends Promise<any> ? true : false

/**
 * 条件类型：提取 Promise 的值类型
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

/**
 * 工具类型：创建严格的枚举类型
 */
export type StrictEnum<T extends Record<string, string | number>> = T[keyof T]

/**
 * 工具类型：创建只读的元组类型
 */
export type ReadonlyTuple<T extends readonly any[]> = readonly [...T]

/**
 * 工具类型：数组转联合类型
 */
export type ArrayToUnion<T extends readonly any[]> = T[number]

/**
 * 工具类型：联合类型转交叉类型
 */
export type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

/**
 * 高级类型：分布式条件类型示例
 */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

/**
 * 类型断言函数：确保值是指定类型
 */
export function assertType<T>(value: unknown, predicate: (value: unknown) => value is T): asserts value is T {
  if (!predicate(value)) {
    throw new TypeError('Type assertion failed')
  }
}

/**
 * 类型守卫：检查值是否为非空
 */
export function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * 类型守卫：检查值是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 类型守卫：检查值是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * 类型守卫：检查值是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 类型守卫：检查值是否为数组
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * 类型守卫：检查值是否为函数
 */
export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function'
}

/**
 * 类型安全的对象键遍历
 */
export function typedKeys<T extends Record<string, any>>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>
}

/**
 * 类型安全的对象值遍历
 */
export function typedValues<T extends Record<string, any>>(obj: T): Array<T[keyof T]> {
  return Object.values(obj)
}

/**
 * 类型安全的对象条目遍历
 */
export function typedEntries<T extends Record<string, any>>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
}

/**
 * 创建类型安全的枚举
 */
export function createEnum<T extends Record<string, string | number>>(obj: T): Readonly<T> {
  return Object.freeze(obj)
}

/**
 * 类型安全的数组过滤
 */
export function typedFilter<T, U extends T>(
  array: T[],
  predicate: (value: T) => value is U,
): U[] {
  return array.filter(predicate)
}

/**
 * 类型安全的对象合并
 */
export function typedMerge<T extends Record<string, any>, U extends Record<string, any>>(
  target: T,
  source: U,
): T & U {
  return { ...target, ...source }
}

/**
 * 深度克隆（类型安全）
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 类型安全的 JSON 解析
 */
export function safeJsonParse<T = unknown>(json: string): T | null {
  try {
    return JSON.parse(json) as T
  }
  catch {
    return null
  }
}

/**
 * 类型安全的属性访问
 */
export function safeGet<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  return obj?.[key]
}

/**
 * 类型安全的嵌套属性访问
 */
export function safeGetNested<T>(obj: T, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj as any)
}

/**
 * 创建类型化的错误
 */
export function createTypedError<T extends string>(
  type: T,
  message: string,
  cause?: Error,
): HttpError & { type: T } {
  const error = new Error(message) as HttpError & { type: T }
  error.type = type
  error.cause = cause
  return error
}

/**
 * 类型化的 Promise 包装器
 */
export function wrapPromise<T>(promise: Promise<T>): {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: any) => void
} {
  let resolve!: (value: T) => void
  let reject!: (reason?: any) => void

  const wrappedPromise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  promise.then(resolve, reject)

  return {
    promise: wrappedPromise,
    resolve,
    reject,
  }
}
