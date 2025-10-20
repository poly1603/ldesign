/**
 * 实用类型定义
 * 提供高级类型工具，增强类型推断和类型安全
 */

/**
 * 深度只读类型
 * 递归地将对象的所有属性设置为只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends (...args: any[]) => any
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P]
}

/**
 * 深度部分类型
 * 递归地将对象的所有属性设置为可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends (...args: any[]) => any
      ? T[P]
      : DeepPartial<T[P]>
    : T[P]
}

/**
 * 深度必需类型
 * 递归地将对象的所有属性设置为必需
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? T[P] extends (...args: any[]) => any
      ? T[P]
      : DeepRequired<T[P]>
    : T[P]
}

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
 * 非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 提取 Promise 的返回类型
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T

/**
 * 函数参数类型
 */
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never

/**
 * 函数返回类型
 */
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any

/**
 * 构造函数参数类型
 */
export type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never

/**
 * 实例类型
 */
export type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any

/**
 * 联合类型转交叉类型
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

/**
 * 提取对象值的类型
 */
export type ValueOf<T> = T[keyof T]

/**
 * 提取对象键的类型（字符串形式）
 */
export type KeyOf<T> = Extract<keyof T, string>

/**
 * 必需的键
 */
export type RequiredKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

/**
 * 可选的键
 */
export type OptionalKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

/**
 * 提取指定类型的键
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

/**
 * 提取函数类型的键
 */
export type FunctionKeys<T> = KeysOfType<T, (...args: any[]) => any>

/**
 * 提取非函数类型的键
 */
export type NonFunctionKeys<T> = Exclude<keyof T, FunctionKeys<T>>

/**
 * 可变类型（移除 readonly）
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

/**
 * 深度可变类型
 */
export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object
    ? T[P] extends (...args: any[]) => any
      ? T[P]
      : DeepMutable<T[P]>
    : T[P]
}

/**
 * 排除类型
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * 提取类型
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

/**
 * 记录类型
 */
export type Record<K extends keyof any, T> = {
  [P in K]: T
}

/**
 * 条件类型
 */
export type If<C extends boolean, T, F> = C extends true ? T : F

/**
 * 相等类型检查
 */
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

/**
 * 对象路径类型
 * 提取对象的所有可能路径
 */
export type PathsOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? T[K] extends object
          ? T[K] extends any[]
            ? `${Prefix}${K}` | PathsOf<T[K], `${Prefix}${K}.`>
            : `${Prefix}${K}` | PathsOf<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : never
    }[keyof T]
  : never

/**
 * 根据路径获取类型
 */
export type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PathValue<T[K], R>
    : never
  : never

/**
 * 合并类型
 */
export type Merge<T, U> = Omit<T, Extract<keyof T, keyof U>> & U

/**
 * 深度合并类型
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
 * 扁平化类型
 */
export type Flatten<T> = T extends any[] ? T[number] : T

/**
 * 数组元素类型
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/**
 * 元组转联合
 */
export type TupleToUnion<T extends any[]> = T[number]

/**
 * 联合转元组
 */
export type UnionToTuple<T> = UnionToIntersection<T extends any ? (t: T) => T : never> extends (_: any) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : []

/**
 * 字符串字面量类型
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never

/**
 * 数字字面量类型
 */
export type NumberLiteral<T> = T extends number ? (number extends T ? never : T) : never

/**
 * 布尔字面量类型
 */
export type BooleanLiteral<T> = T extends boolean ? (boolean extends T ? never : T) : never

/**
 * 原始类型
 */
export type Primitive = string | number | boolean | null | undefined | symbol | bigint

/**
 * 非原始类型
 */
export type NonPrimitive = object

/**
 * 类类型
 */
export type Class<T = any> = new (...args: any[]) => T

/**
 * 抽象类类型
 */
export type AbstractClass<T = any> = abstract new (...args: any[]) => T

/**
 * 函数类型
 */
export type AnyFunction = (...args: any[]) => any

/**
 * 异步函数类型
 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>

/**
 * 对象类型
 */
export type AnyObject = Record<string, any>

/**
 * 空对象类型
 */
export type EmptyObject = Record<string, never>

/**
 * JSON 值类型
 */
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray

/**
 * JSON 对象类型
 */
export interface JSONObject {
  [key: string]: JSONValue
}

/**
 * JSON 数组类型
 */
export interface JSONArray extends Array<JSONValue> {}

/**
 * 可序列化类型
 */
export type Serializable = JSONValue

/**
 * 严格的 Omit（确保键存在）
 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * 严格的 Pick（确保键存在）
 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>

/**
 * 部分化指定键
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 必需化指定键
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * 只读化指定键
 */
export type ReadonlyBy<T, K extends keyof T> = Omit<T, K> & Readonly<Pick<T, K>>

/**
 * 可写化指定键
 */
export type WritableBy<T, K extends keyof T> = Omit<T, K> & Mutable<Pick<T, K>>

/**
 * 可为空的指定键
 */
export type NullableBy<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null
}

/**
 * 可选的指定键
 */
export type OptionalBy<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P]
}

/**
 * 覆盖类型
 */
export type Override<T, U> = Omit<T, Extract<keyof T, keyof U>> & U

/**
 * 重命名键
 */
export type RenameKey<T, K extends keyof T, N extends string> = Omit<T, K> & Record<N, T[K]>

/**
 * 修改键类型
 */
export type ModifyKeyType<T, K extends keyof T, V> = Omit<T, K> & Record<K, V>

/**
 * 提取 Promise 类型
 */
export type PromiseType<T> = T extends Promise<infer U> ? U : T

/**
 * 提取数组类型
 */
export type ArrayType<T> = T extends (infer U)[] ? U : T

/**
 * 提取函数参数
 */
export type FunctionArgs<T> = T extends (...args: infer A) => any ? A : never

/**
 * 提取函数返回值
 */
export type FunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never

/**
 * 只读数组类型
 */
export type ReadonlyArray<T> = readonly T[]

/**
 * 只读元组类型
 */
export type ReadonlyTuple<T extends any[]> = readonly [...T]

/**
 * 可变数组类型
 */
export type MutableArray<T extends readonly any[]> = T extends readonly (infer U)[] ? U[] : never

/**
 * 获取第一个元素类型
 */
export type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never

/**
 * 获取剩余元素类型
 */
export type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never

/**
 * 获取最后一个元素类型
 */
export type Last<T extends any[]> = T extends [...any[], infer L] ? L : never

/**
 * 联合类型大小
 */
export type UnionSize<T, U = T> = [T] extends [never] ? 0 : T extends U ? 1 | UnionSize<Exclude<U, T>> : never

/**
 * 是否为联合类型
 */
export type IsUnion<T, U = T> = [T] extends [never]
  ? false
  : T extends U
  ? [U] extends [T]
    ? false
    : true
  : false
