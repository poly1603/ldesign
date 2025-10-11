/**
 * 增强的类型定义
 * 提供更强的类型安全和类型推断
 * 
 * @module enhanced-types
 */

/**
 * 严格的非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 深度必需类型
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

/**
 * 提取函数参数类型
 */
export type Parameters<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never

/**
 * 提取函数返回类型
 */
export type ReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : any

/**
 * 提取Promise的值类型
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T

/**
 * 联合类型转交叉类型
 */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

/**
 * 提取对象的值类型
 */
export type ValueOf<T> = T[keyof T]

/**
 * 字符串字面量联合类型
 */
export type StringKeys<T> = Extract<keyof T, string>

/**
 * 数字字面量联合类型
 */
export type NumberKeys<T> = Extract<keyof T, number>

/**
 * 符号字面量联合类型
 */
export type SymbolKeys<T> = Extract<keyof T, symbol>

/**
 * 可选属性键
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

/**
 * 必需属性键
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

/**
 * 使特定键只读
 */
export type ReadonlyKeys<T, K extends keyof T> = Omit<T, K> & Readonly<Pick<T, K>>

/**
 * 使特定键可选
 */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 使特定键必需
 */
export type RequiredPick<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * 严格的Omit类型（排除不存在的键）
 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * 严格的Pick类型
 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>

/**
 * 可为空的类型
 */
export type Nullable<T> = T | null

/**
 * 可为undefined的类型
 */
export type Optional<T> = T | undefined

/**
 * 可为null或undefined的类型
 */
export type Maybe<T> = T | null | undefined

/**
 * 数组类型或单个元素
 */
export type ArrayOrSingle<T> = T | T[]

/**
 * 同步或异步类型
 */
export type MaybePromise<T> = T | Promise<T>

/**
 * 函数或值类型
 */
export type MaybeFunction<T, Args extends any[] = []> = T | ((...args: Args) => T)

/**
 * 构造函数类型
 */
export type Constructor<T = any, Args extends any[] = any[]> = new (
  ...args: Args
) => T

/**
 * 抽象构造函数类型
 */
export type AbstractConstructor<T = any> = abstract new (...args: any[]) => T

/**
 * 类类型（包括抽象类）
 */
export type Class<T = any> = Constructor<T> | AbstractConstructor<T>

/**
 * 元组转联合类型
 */
export type TupleToUnion<T extends readonly any[]> = T[number]

/**
 * 联合类型转元组
 */
export type UnionToTuple<T> = UnionToIntersection<
  T extends any ? (t: T) => T : never
> extends (_: any) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : []

/**
 * JSON兼容类型
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

/**
 * JSON对象类型
 */
export interface JSONObject {
  [key: string]: JSONValue
}

/**
 * JSON数组类型
 */
export type JSONArray = JSONValue[]

/**
 * 类型守卫函数
 */
export type TypeGuard<T> = (value: unknown) => value is T

/**
 * 类型断言函数
 */
export type TypeAssert<T> = (value: unknown) => asserts value is T

/**
 * 验证器函数
 */
export type Validator<T> = (value: T) => boolean | string | Promise<boolean | string>

/**
 * 转换器函数
 */
export type Transformer<From, To> = (value: From) => To

/**
 * 序列化器
 */
export interface Serializer<T> {
  serialize: (value: T) => string
  deserialize: (value: string) => T
}

/**
 * 比较器函数
 */
export type Comparator<T> = (a: T, b: T) => number

/**
 * 等于比较函数
 */
export type EqualsFunction<T> = (a: T, b: T) => boolean

/**
 * 克隆函数
 */
export type Cloner<T> = (value: T) => T

/**
 * 合并函数
 */
export type Merger<T> = (target: T, source: Partial<T>) => T

/**
 * 不可变操作结果
 */
export interface ImmutableResult<T> {
  value: T
  changed: boolean
}

/**
 * 错误或值
 */
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E }

/**
 * 创建成功结果
 */
export function success<T>(value: T): Result<T, never> {
  return { success: true, value }
}

/**
 * 创建失败结果
 */
export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error }
}

/**
 * 检查是否成功
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; value: T } {
  return result.success
}

/**
 * 检查是否失败
 */
export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success
}

/**
 * Option类型（可选值）
 */
export type Option<T> = Some<T> | None

/**
 * 有值
 */
export interface Some<T> {
  _tag: 'Some'
  value: T
}

/**
 * 无值
 */
export interface None {
  _tag: 'None'
}

/**
 * 创建Some
 */
export function some<T>(value: T): Some<T> {
  return { _tag: 'Some', value }
}

/**
 * 创建None
 */
export const none: None = { _tag: 'None' }

/**
 * 检查是否有值
 */
export function isSome<T>(option: Option<T>): option is Some<T> {
  return option._tag === 'Some'
}

/**
 * 检查是否无值
 */
export function isNone<T>(option: Option<T>): option is None {
  return option._tag === 'None'
}

/**
 * 从Option获取值
 */
export function getOrElse<T>(option: Option<T>, defaultValue: T): T {
  return isSome(option) ? option.value : defaultValue
}

/**
 * Either类型（两个可能值之一）
 */
export type Either<L, R> = Left<L> | Right<R>

/**
 * 左值（通常表示错误）
 */
export interface Left<L> {
  _tag: 'Left'
  left: L
}

/**
 * 右值（通常表示成功）
 */
export interface Right<R> {
  _tag: 'Right'
  right: R
}

/**
 * 创建Left
 */
export function left<L>(value: L): Left<L> {
  return { _tag: 'Left', left: value }
}

/**
 * 创建Right
 */
export function right<R>(value: R): Right<R> {
  return { _tag: 'Right', right: value }
}

/**
 * 检查是否是Left
 */
export function isLeft<L, R>(either: Either<L, R>): either is Left<L> {
  return either._tag === 'Left'
}

/**
 * 检查是否是Right
 */
export function isRight<L, R>(either: Either<L, R>): either is Right<R> {
  return either._tag === 'Right'
}

/**
 * 品牌类型（Branded Type）
 * 用于创建名义类型
 */
export type Brand<T, B> = T & { __brand: B }

/**
 * 创建品牌类型
 */
export function brand<T, B extends string>(value: T): Brand<T, B> {
  return value as Brand<T, B>
}

/**
 * 新类型（Newtype）
 * 用于创建不同的类型别名
 */
export type Newtype<T, Tag extends string> = T & { readonly __tag: Tag }

/**
 * 辨识联合类型（Discriminated Union）
 */
export interface TaggedType<Tag extends string> {
  readonly _tag: Tag
}

/**
 * 提取标签类型
 */
export type ExtractByTag<T extends TaggedType<any>, Tag extends T['_tag']> = Extract<
  T,
  TaggedType<Tag>
>

/**
 * 类型守卫构建器
 */
export function createTypeGuard<T>(
  check: (value: unknown) => boolean
): TypeGuard<T> {
  return (value: unknown): value is T => check(value)
}

/**
 * 断言构建器
 */
export function createAssertion<T>(
  check: (value: unknown) => boolean,
  message?: string
): TypeAssert<T> {
  return (value: unknown): asserts value is T => {
    if (!check(value)) {
      throw new TypeError(message ?? 'Type assertion failed')
    }
  }
}

/**
 * 不变量类型
 * 表示在运行时和编译时都不应改变的值
 */
export type Invariant<T> = DeepReadonly<T>

/**
 * 协变类型
 * T是协变的（可以是T的子类型）
 */
export type Covariant<T> = T

/**
 * 逆变类型
 * T是逆变的（可以是T的超类型）
 */
export type Contravariant<T> = (value: T) => void

/**
 * 双变类型
 * T既可以协变也可以逆变
 */
export type Bivariant<T> = {
  value: T
  setValue: (value: T) => void
}

/**
 * 条件类型辅助
 */
export type If<Condition extends boolean, Then, Else> = Condition extends true
  ? Then
  : Else

/**
 * 类型相等检查
 */
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false

/**
 * Not类型
 */
export type Not<T extends boolean> = T extends true ? false : true

/**
 * And类型
 */
export type And<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false

/**
 * Or类型
 */
export type Or<A extends boolean, B extends boolean> = A extends true
  ? true
  : B extends true
  ? true
  : false

/**
 * 类型工具集合
 */
export const TypeUtils = {
  success,
  failure,
  isSuccess,
  isFailure,
  some,
  none,
  isSome,
  isNone,
  getOrElse,
  left,
  right,
  isLeft,
  isRight,
  brand,
  createTypeGuard,
  createAssertion,
}

/**
 * 导出所有类型
 */
export type * from './enhanced-types'
