/**
 * 通用 TypeScript 类型定义
 * 
 * 提供严格的类型约束，消除 any 类型使用
 */

/**
 * 基础类型
 */
export type Primitive = string | number | boolean | null | undefined | symbol | bigint

/**
 * 可序列化的值类型
 * Using interface to avoid circular reference error
 */
export interface Serializable {
  [key: string]: Primitive | Serializable | Serializable[]
}

/**
 * Alternative serializable type that includes primitives
 */
export type SerializableValue = Primitive | Serializable | SerializableValue[]

/**
 * JSON 值类型
 */
export type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JsonObject 
  | JsonArray

export interface JsonObject {
  [key: string]: JsonValue
}

export type JsonArray = JsonValue[]

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P]
}

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[P]>
    : T[P]
}

/**
 * 深度必填类型
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? T[P] extends Array<infer U>
      ? Array<DeepRequired<U>>
      : DeepRequired<T[P]>
    : T[P]
}

/**
 * 提取 Promise 返回类型
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T

/**
 * 提取函数参数类型
 */
export type Parameters<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never

/**
 * 提取函数返回类型
 */
export type ReturnType<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: unknown[]
) => infer R
  ? R
  : never

/**
 * 联合类型转交叉类型
 */
export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

/**
 * 排除 null 和 undefined
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 提取对象中的可选属性
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? K : never
}[keyof T]

/**
 * 提取对象中的必填属性
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K
}[keyof T]

/**
 * 只读数组类型
 * Note: Renamed to avoid conflict with TypeScript's built-in ReadonlyArray
 */
export type ImmutableArray<T> = Readonly<T[]>

/**
 * 只读记录类型
 */
export type ReadonlyRecord<K extends string | number | symbol, V> = Readonly<
  Record<K, V>
>

/**
 * 字符串字面量联合
 */
export type StringLiteral<T extends string> = T | (string & {})

/**
 * 数字字面量联合
 */
export type NumberLiteral<T extends number> = T | (number & {})

/**
 * 构造函数类型
 */
export type Constructor<T = object> = new (...args: unknown[]) => T

/**
 * 抽象构造函数类型
 */
export type AbstractConstructor<T = object> = abstract new (
  ...args: unknown[]
) => T

/**
 * 类类型
 */
export type Class<T = object> = Constructor<T> | AbstractConstructor<T>

/**
 * 通用函数类型
 */
export type AnyFunction = (...args: unknown[]) => unknown

/**
 * 异步函数类型
 */
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>

/**
 * 回调函数类型
 */
export type Callback<T = void> = (error: Error | null, result?: T) => void

/**
 * 事件处理器类型
 */
export type EventHandler<T = Event> = (event: T) => void | Promise<void>

/**
 * 可空类型
 */
export type Nullable<T> = T | null

/**
 * 可选类型
 */
export type Optional<T> = T | undefined

/**
 * 可空或可选类型
 */
export type Maybe<T> = T | null | undefined

/**
 * 替换类型
 */
export type Replace<T, K extends keyof T, V> = Omit<T, K> & Record<K, V>

/**
 * 合并类型
 */
export type Merge<A, B> = Omit<A, keyof B> & B

/**
 * 递归合并类型
 */
export type DeepMerge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? K extends keyof A
      ? A[K] extends object
        ? B[K] extends object
          ? DeepMerge<A[K], B[K]>
          : B[K]
        : B[K]
      : B[K]
    : K extends keyof A
    ? A[K]
    : never
}

/**
 * 值类型提取
 */
export type ValueOf<T> = T[keyof T]

/**
 * 数组元素类型提取
 */
export type ArrayElement<T> = T extends ReadonlyArray<infer U> ? U : never

/**
 * 元组转联合类型
 */
export type TupleToUnion<T extends readonly unknown[]> = T[number]

/**
 * 路径类型（用于深层属性访问）
 */
export type Path<T, D extends number = 5> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | `${K}.${Path<T[K], Prev[D]>}`
        : never
    }[keyof T]
  : never

type Prev = [never, 0, 1, 2, 3, 4, 5, ...0[]]

/**
 * 路径值类型
 */
export type PathValue<
  T,
  P extends Path<T>
> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never

/**
 * 严格的对象类型
 */
export type StrictObject<T extends Record<string, unknown>> = T

/**
 * 字典类型
 */
export type Dictionary<T = unknown> = Record<string, T>

/**
 * 数值字典类型
 */
export type NumericDictionary<T = unknown> = Record<number, T>

/**
 * 可迭代类型
 */
export type Iterable<T> = Readonly<{
  [Symbol.iterator](): Iterator<T>
}>

/**
 * 异步可迭代类型
 */
export type AsyncIterable<T> = Readonly<{
  [Symbol.asyncIterator](): AsyncIterator<T>
}>

/**
 * 品牌类型（用于创建名义类型）
 */
export type Brand<T, B extends string> = T & { __brand: B }

/**
 * 严格品牌类型
 */
export type StrictBrand<T, B extends symbol> = T & { readonly [K in B]: never }

/**
 * 不变类型
 */
export type Immutable<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<Immutable<U>>
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<Immutable<K>, Immutable<V>>
  : T extends Set<infer M>
  ? ReadonlySet<Immutable<M>>
  : DeepReadonly<T>

/**
 * 条件类型辅助
 */
export type If<C extends boolean, T, F> = C extends true ? T : F

/**
 * 相等类型判断
 */
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false

/**
 * 类型断言
 */
export type Assert<T extends true> = T

/**
 * 提取公共属性
 */
export type CommonKeys<T, U> = keyof T & keyof U

/**
 * 提取差异属性
 */
export type DiffKeys<T, U> = Exclude<keyof T, keyof U> | Exclude<keyof U, keyof T>

/**
 * 严格提取
 */
export type StrictExtract<T, U extends T> = T extends U ? T : never

/**
 * 严格排除
 */
export type StrictExclude<T, U extends T> = T extends U ? never : T

/**
 * 只写类型
 */
export type Writable<T> = {
  -readonly [P in keyof T]: T[P]
}

/**
 * 深度只写类型
 */
export type DeepWritable<T> = {
  -readonly [P in keyof T]: T[P] extends object
    ? DeepWritable<T[P]>
    : T[P]
}

/**
 * 函数重载类型
 */
export type Overload<T> = T extends {
  (...args: infer A1): infer R1
  (...args: infer A2): infer R2
  (...args: infer A3): infer R3
  (...args: infer A4): infer R4
}
  ? [
      (...args: A1) => R1,
      (...args: A2) => R2,
      (...args: A3) => R3,
      (...args: A4) => R4
    ]
  : T extends {
      (...args: infer A1): infer R1
      (...args: infer A2): infer R2
      (...args: infer A3): infer R3
    }
  ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3]
  : T extends {
      (...args: infer A1): infer R1
      (...args: infer A2): infer R2
    }
  ? [(...args: A1) => R1, (...args: A2) => R2]
  : T extends (...args: infer A) => infer R
  ? [(...args: A) => R]
  : never

/**
 * 标称类型生成器
 */
export type Nominal<T, Name extends string> = T & {
  readonly __nominal: Name
}

/**
 * 字符串模板类型
 */
export type Template<T extends string> = `${T}`

/**
 * 大写首字母
 */
export type Capitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${R}`
  : S

/**
 * 小写首字母
 */
export type Uncapitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Lowercase<F>}${R}`
  : S

/**
 * 驼峰转下划线
 */
export type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnake<U>}`
  : S

/**
 * 下划线转驼峰
 */
export type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S

/**
 * 类型保护函数
 */
export type TypeGuard<T, U extends T = T> = (value: T) => value is U

/**
 * 断言函数
 */
export type AssertFunction<T> = (value: unknown) => asserts value is T

/**
 * 枚举值类型
 */
export type EnumValue<T extends Record<string, string | number>> = T[keyof T]

/**
 * 枚举键类型
 */
export type EnumKey<T extends Record<string, string | number>> = keyof T

/**
 * 严格枚举类型
 */
export type StrictEnum<T extends Record<string, string | number>> = {
  readonly [K in keyof T]: T[K]
}
