/**
 * 增强类型定义
 * 🎯 提供更强的类型安全和泛型支持
 */

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends (...args: unknown[]) => unknown
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> { }

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}

/**
 * 深度部分类型
 */
export type DeepPartial<T> = T extends (infer R)[]
  ? DeepPartialArray<R>
  : T extends (...args: unknown[]) => unknown
  ? T
  : T extends object
  ? DeepPartialObject<T>
  : T | undefined

interface DeepPartialArray<T> extends Array<DeepPartial<T>> { }

type DeepPartialObject<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

/**
 * 深度必需类型
 */
export type DeepRequired<T> = T extends (infer R)[]
  ? DeepRequiredArray<R>
  : T extends (...args: unknown[]) => unknown
  ? T
  : T extends object
  ? DeepRequiredObject<T>
  : T

interface DeepRequiredArray<T> extends Array<DeepRequired<T>> { }

type DeepRequiredObject<T> = {
  [P in keyof T]-?: DeepRequired<T[P]>
}

/**
 * 递归可选类型
 */
export type RecursiveOptional<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
  ? RecursiveOptional<U>[]
  : T[P] extends object
  ? RecursiveOptional<T[P]>
  : T[P]
}

/**
 * 严格Omit类型
 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * 严格Extract类型
 */
export type StrictExtract<T, U extends T> = T extends U ? T : never

/**
 * 可为空类型
 */
export type Nullable<T> = T | null

/**
 * 可选的类型
 */
export type Optional<T> = T | undefined

/**
 * 可能类型（可为空或未定义）
 */
export type Maybe<T> = T | null | undefined

/**
 * 非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 值或函数类型
 */
export type ValueOrFactory<T> = T | (() => T)

/**
 * 值或Promise类型
 */
export type ValueOrPromise<T> = T | Promise<T>

/**
 * 异步函数类型
 */
export type AsyncFunction<T = unknown, R = unknown> = (...args: T[]) => Promise<R>

/**
 * 同步函数类型
 */
export type SyncFunction<T = unknown, R = unknown> = (...args: T[]) => R

/**
 * 任意函数类型
 */
export type AnyFunction<T = unknown, R = unknown> = (...args: T[]) => R | Promise<R>

/**
 * 构造函数类型
 */
export type Constructor<T = object> = new (...args: unknown[]) => T

/**
 * 抽象构造函数类型
 */
export type AbstractConstructor<T = object> = abstract new (...args: unknown[]) => T

/**
 * 键值对类型
 */
export interface KeyValuePair<K = string, V = unknown> {
  key: K
  value: V
}

/**
 * 记录类型（带泛型键）
 */
export type TypedRecord<K extends string | number | symbol, V> = {
  [P in K]: V
}

/**
 * 元组转联合类型
 */
export type TupleToUnion<T extends readonly any[]> = T[number]

/**
 * 联合转交叉类型
 */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

/**
 * 获取Promise类型
 */
export type PromiseType<T extends Promise<any>> = T extends Promise<infer U>
  ? U
  : never

/**
 * 获取数组元素类型
 */
export type ArrayElement<T extends readonly any[]> = T extends readonly (infer U)[]
  ? U
  : never

/**
 * 获取函数参数类型
 */
export type FunctionArgs<T extends (...args: unknown[]) => unknown> = T extends (...args: infer P) => unknown
  ? P
  : never

/**
 * 获取函数返回类型
 */
export type FunctionReturn<T extends (...args: unknown[]) => unknown> = T extends (...args: unknown[]) => infer R
  ? R
  : never

/**
 * 路径类型（用于对象路径访问）
 */
export type Path<T, K extends keyof T = keyof T> =
  K extends string | number
  ? T[K] extends Record<string, any>
  ? K | `${K}.${Path<T[K], keyof T[K]>}`
  : K
  : never

/**
 * 路径值类型
 */
export type PathValue<T, P extends Path<T>> =
  P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
  ? Rest extends Path<T[K]>
  ? PathValue<T[K], Rest>
  : never
  : never
  : P extends keyof T
  ? T[P]
  : never

/**
 * 类型守卫
 */
export type TypeGuard<T> = (value: unknown) => value is T

/**
 * 类型谓词
 */
export type TypePredicate<T> = (value: T) => boolean

/**
 * 比较函数
 */
export type CompareFn<T> = (a: T, b: T) => number

/**
 * 映射函数
 */
export type MapFn<T, R> = (value: T, index: number, array: T[]) => R

/**
 * 过滤函数
 */
export type FilterFn<T> = (value: T, index: number, array: T[]) => boolean

/**
 * 归约函数
 */
export type ReduceFn<T, R> = (
  accumulator: R,
  current: T,
  index: number,
  array: T[]
) => R

/**
 * 事件处理器
 */
export type EventHandler<T = Event> = (event: T) => void | Promise<void>

/**
 * 错误处理器
 */
export type ErrorHandler<T = Error> = (error: T) => void | Promise<void>

/**
 * 成功回调
 */
export type SuccessCallback<T = unknown> = (result: T) => void | Promise<void>

/**
 * 失败回调
 */
export type FailureCallback<T = Error> = (error: T) => void | Promise<void>

/**
 * 完成回调
 */
export type CompleteCallback = () => void | Promise<void>

/**
 * 取消令牌
 */
export interface CancelToken {
  readonly cancelled: boolean
  cancel: () => void
  throwIfCancelled: () => void
}

/**
 * 可取消的Promise
 */
export interface CancellablePromise<T> extends Promise<T> {
  cancel: () => void
}

/**
 * 延迟对象
 */
export interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

/**
 * 结果类型（成功或失败）
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

/**
 * Either类型（左值或右值）
 */
export type Either<L, R> =
  | { type: 'left'; value: L }
  | { type: 'right'; value: R }

/**
 * Option类型（有值或无值）
 */
export type Option<T> =
  | { type: 'some'; value: T }
  | { type: 'none' }

/**
 * 创建延迟对象
 */
export function createDeferred<T>(): Deferred<T> {
  let resolve: (value: T) => void
  let reject: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    promise,
    resolve: resolve!,
    reject: reject!
  }
}

/**
 * 创建取消令牌
 */
export function createCancelToken(): CancelToken {
  let cancelled = false

  return {
    get cancelled() {
      return cancelled
    },
    cancel() {
      cancelled = true
    },
    throwIfCancelled() {
      if (cancelled) {
        throw new Error('Operation cancelled')
      }
    }
  }
}

/**
 * 创建可取消的Promise
 */
export function createCancellablePromise<T>(
  executor: (
    resolve: (value: T) => void,
    reject: (reason?: unknown) => void,
    token: CancelToken
  ) => void
): CancellablePromise<T> {
  const token = createCancelToken()
  const deferred = createDeferred<T>()

  const promise = new Promise<T>((resolve, reject) => {
    executor(
      (value) => {
        if (!token.cancelled) {
          resolve(value)
          deferred.resolve(value)
        }
      },
      (reason) => {
        if (!token.cancelled) {
          reject(reason)
          deferred.reject(reason)
        }
      },
      token
    )
  }) as CancellablePromise<T>

  promise.cancel = () => {
    token.cancel()
    deferred.reject(new Error('Cancelled'))
  }

  return promise
}

/**
 * 类型断言函数
 */
export function assertType<T>(value: unknown, guard: TypeGuard<T>): asserts value is T {
  if (!guard(value)) {
    throw new TypeError('Type assertion failed')
  }
}

/**
 * 类型检查函数
 */
export function isType<T>(value: unknown, guard: TypeGuard<T>): value is T {
  return guard(value)
}

/**
 * 创建类型守卫
 */
export function createTypeGuard<T>(
  predicate: (value: unknown) => boolean
): TypeGuard<T> {
  return (value: unknown): value is T => predicate(value)
}

/**
 * 组合类型守卫（AND）
 */
export function andGuards<T, U>(
  guard1: TypeGuard<T>,
  guard2: TypeGuard<U>
): TypeGuard<T & U> {
  return (value: unknown): value is T & U => {
    return guard1(value) && guard2(value)
  }
}

/**
 * 组合类型守卫（OR）
 */
export function orGuards<T, U>(
  guard1: TypeGuard<T>,
  guard2: TypeGuard<U>
): TypeGuard<T | U> {
  return (value: unknown): value is T | U => {
    return guard1(value) || guard2(value)
  }
}

/**
 * 类型安全的对象键
 */
export function typedKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>
}

/**
 * 类型安全的对象值
 */
export function typedValues<T extends object>(obj: T): Array<T[keyof T]> {
  return Object.values(obj) as Array<T[keyof T]>
}

/**
 * 类型安全的对象条目
 */
export function typedEntries<T extends object>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
}

/**
 * 类型安全的fromEntries
 */
export function typedFromEntries<K extends string | number | symbol, V>(
  entries: Array<[K, V]>
): TypedRecord<K, V> {
  return Object.fromEntries(entries) as TypedRecord<K, V>
}
