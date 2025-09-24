/**
 * 工具类型定义
 * 包含 TypeScript 工具类型和辅助类型
 */

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
export type ExtractFunctionArgs<T> = T extends (...args: infer P) => any ? P : never

/**
 * 提取函数返回类型
 */
export type ExtractFunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never

/**
 * 提取 Promise 类型
 */
export type ExtractPromise<T> = T extends Promise<infer U> ? U : T

/**
 * 联合类型转交叉类型
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

/**
 * 获取对象的值类型
 */
export type ValueOf<T> = T[keyof T]

/**
 * 排除 null 和 undefined
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 条件类型 - 如果 T 是 U 的子类型则返回 X，否则返回 Y
 */
export type If<T extends boolean, X, Y> = T extends true ? X : Y

/**
 * 字符串字面量类型操作
 */
export type Uppercase<S extends string> = intrinsic
export type Lowercase<S extends string> = intrinsic
export type Capitalize<S extends string> = intrinsic
export type Uncapitalize<S extends string> = intrinsic

/**
 * 数组类型操作
 */
export type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never
export type Tail<T extends readonly any[]> = T extends readonly [any, ...infer R] ? R : never
export type Length<T extends readonly any[]> = T['length']

/**
 * 对象键类型操作
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? never : K
}[keyof T]

export type OptionalKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? K : never
}[keyof T]

/**
 * 函数重载类型
 */
export type Overload<T> = T extends {
  (...args: infer A1): infer R1
  (...args: infer A2): infer R2
  (...args: infer A3): infer R3
  (...args: infer A4): infer R4
}
  ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3, (...args: A4) => R4]
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
 * 品牌类型 - 用于创建名义类型
 */
export type Brand<T, B> = T & { __brand: B }

/**
 * 颜色相关的品牌类型
 */
export type HexColorBrand = Brand<string, 'HexColor'>
export type RgbColorBrand = Brand<string, 'RgbColor'>
export type HslColorBrand = Brand<string, 'HslColor'>

/**
 * 创建品牌类型的工厂函数类型
 */
export type BrandFactory<T, B> = (value: T) => Brand<T, B>

/**
 * 提取品牌类型的原始值
 */
export type UnBrand<T> = T extends Brand<infer U, any> ? U : T

/**
 * 类型守卫函数类型
 */
export type TypeGuard<T, U extends T = T> = (value: T) => value is U

/**
 * 断言函数类型
 */
export type AssertFunction<T> = (value: unknown) => asserts value is T

/**
 * 可序列化类型
 */
export type Serializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Serializable[]
  | { [key: string]: Serializable }

/**
 * JSON 兼容类型
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

/**
 * 函数式编程相关类型
 */
export type Predicate<T> = (value: T) => boolean
export type Mapper<T, U> = (value: T) => U
export type Reducer<T, U> = (accumulator: U, current: T) => U
export type Consumer<T> = (value: T) => void
export type Supplier<T> = () => T

/**
 * 异步相关类型
 */
export type AsyncPredicate<T> = (value: T) => Promise<boolean>
export type AsyncMapper<T, U> = (value: T) => Promise<U>
export type AsyncConsumer<T> = (value: T) => Promise<void>
export type AsyncSupplier<T> = () => Promise<T>

/**
 * 事件相关类型
 */
export type EventHandler<T = any> = (event: T) => void
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>

/**
 * 配置对象类型
 */
export type Config<T> = DeepPartial<T> & {
  [K in RequiredKeys<T>]: T[K]
}

/**
 * 工厂函数类型
 */
export type Factory<T, Args extends any[] = []> = (...args: Args) => T
export type AsyncFactory<T, Args extends any[] = []> = (...args: Args) => Promise<T>

/**
 * 单例类型
 */
export interface Singleton<T> {
  getInstance: () => T
}

/**
 * 构造函数类型
 */
export type Constructor<T = object, Args extends any[] = any[]> = new (...args: Args) => T
export type AbstractConstructor<T = object, Args extends any[] = any[]> = abstract new (
  ...args: Args
) => T

/**
 * Mixin 类型
 */
export type Mixin<T extends Constructor> = T & Constructor

/**
 * 装饰器类型
 */
export type ClassDecorator<T extends Constructor = Constructor> = (target: T) => T | void
export type PropertyDecorator = (target: any, propertyKey: string | symbol) => void
export type MethodDecorator<T = any> = (
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void
export type ParameterDecorator = (
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => void

/**
 * 元数据类型
 */
export interface Metadata<T = any> {
  [key: string]: T
}

/**
 * 版本类型
 */
export type Version = `${number}.${number}.${number}` | `${number}.${number}.${number}-${string}`

/**
 * 时间戳类型
 */
export type Timestamp = number
export type ISODateString = string

/**
 * URL 类型
 */
export type URLString = string
export type EmailString = string

/**
 * 颜色相关的工具类型
 */
export type ColorTuple = [number, number, number] | [number, number, number, number]
export type ColorMatrix = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
]

/**
 * 范围类型
 */
export type Range<T extends number = number> = [T, T]
export type ColorRange = Range<0 | 255>
export type PercentageRange = Range<0 | 100>
export type HueRange = Range<0 | 360>
export type AlphaRange = Range<0 | 1>

/**
 * 错误类型
 */
export type ErrorCode = string
export type ErrorMessage = string
export type ErrorDetails = Record<string, any>

/**
 * 结果类型
 */
export type Result<T, E = Error> = { success: true, data: T } | { success: false, error: E }

/**
 * 选项类型
 */
export type Option<T> = T | null | undefined
export type Some<T> = NonNullable<T>
export type None = null | undefined
