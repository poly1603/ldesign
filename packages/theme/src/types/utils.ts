/**
 * @ldesign/theme - 工具类型定义
 *
 * 提供常用的 TypeScript 工具类型
 */

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 必需键类型
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

/**
 * 可选键类型
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

/**
 * 美化类型显示
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * 联合类型转交集类型
 */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

/**
 * 提取函数参数类型
 */
export type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never

/**
 * 提取函数返回类型
 */
export type ReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any

/**
 * 提取 Promise 类型
 */
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T

/**
 * 非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 排除类型
 */
export type Exclude<T, U> = T extends U ? never : T

/**
 * 提取类型
 */
export type Extract<T, U> = T extends U ? T : never

/**
 * 选择类型
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

/**
 * 忽略类型
 */
export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

/**
 * 记录类型
 */
export type Record<K extends keyof any, T> = {
  [P in K]: T
}

/**
 * 只读类型
 */
export type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

/**
 * 可变类型
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

/**
 * 部分类型
 */
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

/**
 * 必需类型
 */
export type Required<T> = {
  [P in keyof T]-?: T[P]
}

/**
 * 键值对类型
 */
export type KeyValuePair<K extends string | number | symbol, V> = {
  [P in K]: V
}

/**
 * 字符串字面量类型
 */
export type StringLiteral<T extends string> = T

/**
 * 数字字面量类型
 */
export type NumberLiteral<T extends number> = T

/**
 * 布尔字面量类型
 */
export type BooleanLiteral<T extends boolean> = T

/**
 * 数组元素类型
 */
export type ArrayElement<T extends readonly unknown[]> =
  T extends readonly (infer E)[] ? E : never

/**
 * 对象值类型
 */
export type ObjectValues<T> = T[keyof T]

/**
 * 对象键类型
 */
export type ObjectKeys<T> = keyof T

/**
 * 函数类型
 */
export type Func<TArgs extends any[] = any[], TReturn = any> = (
  ...args: TArgs
) => TReturn

/**
 * 异步函数类型
 */
export type AsyncFunc<TArgs extends any[] = any[], TReturn = any> = (
  ...args: TArgs
) => Promise<TReturn>

/**
 * 事件处理器类型
 */
export type EventHandler<T = any> = (event: T) => void

/**
 * 可空类型
 */
export type Nullable<T> = T | null

/**
 * 可未定义类型
 */
export type Maybe<T> = T | undefined

/**
 * 可空或未定义类型
 */
export type Optional<T> = T | null | undefined

/**
 * 类构造器类型
 */
export type Constructor<T = {}> = new (...args: any[]) => T

/**
 * 抽象类构造器类型
 */
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T

/**
 * 混入类型
 */
export type Mixin<T extends Constructor> = T & Constructor

/**
 * 类实例类型
 */
export type InstanceType<T extends Constructor> = T extends Constructor<infer U>
  ? U
  : never

/**
 * 条件类型
 */
export type If<C extends boolean, T, F> = C extends true ? T : F

/**
 * 相等类型
 */
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false

/**
 * 包含类型
 */
export type Includes<T extends readonly any[], U> = T extends readonly [
  infer H,
  ...infer R
]
  ? Equals<H, U> extends true
    ? true
    : Includes<R, U>
  : false

/**
 * 长度类型
 */
export type Length<T extends readonly any[]> = T['length']

/**
 * 头部类型
 */
export type Head<T extends readonly any[]> = T extends readonly [
  infer H,
  ...any[]
]
  ? H
  : never

/**
 * 尾部类型
 */
export type Tail<T extends readonly any[]> = T extends readonly [
  any,
  ...infer R
]
  ? R
  : []

/**
 * 最后一个类型
 */
export type Last<T extends readonly any[]> = T extends readonly [
  ...any[],
  infer L
]
  ? L
  : never

/**
 * 反转类型
 */
export type Reverse<T extends readonly any[]> = T extends readonly [
  ...infer R,
  infer L
]
  ? [L, ...Reverse<R>]
  : []

/**
 * 连接类型
 */
export type Concat<T extends readonly any[], U extends readonly any[]> = [
  ...T,
  ...U
]

/**
 * 扁平化类型
 */
export type Flatten<T extends readonly any[]> = T extends readonly [
  infer H,
  ...infer R
]
  ? H extends readonly any[]
    ? [...Flatten<H>, ...Flatten<R>]
    : [H, ...Flatten<R>]
  : []

/**
 * 字符串模板类型
 */
export type Template<T extends string> = T

/**
 * 大写类型
 */
export type Uppercase<S extends string> = Intrinsic.Uppercase<S>

/**
 * 小写类型
 */
export type Lowercase<S extends string> = Intrinsic.Lowercase<S>

/**
 * 首字母大写类型
 */
export type Capitalize<S extends string> = Intrinsic.Capitalize<S>

/**
 * 首字母小写类型
 */
export type Uncapitalize<S extends string> = Intrinsic.Uncapitalize<S>

/**
 * 内置类型命名空间
 */
declare namespace Intrinsic {
  type Uppercase<S extends string> = string
  type Lowercase<S extends string> = string
  type Capitalize<S extends string> = string
  type Uncapitalize<S extends string> = string
}
