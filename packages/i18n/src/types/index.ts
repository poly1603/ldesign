/**
 * @ldesign/i18n 类型定义
 *
 * 统一导出所有类型定义，提供完整的 TypeScript 支持
 *
 * @author LDesign Team
 * @version 2.0.0
 */

// ==================== 重新导出核心类型 ====================

// 从核心模块导出所有类型
export type {
  // 批量翻译
  BatchTranslationResult,
  CacheItem,
  CacheOptions,
  CacheStats,
  // 检测器相关
  Detector,
  EventEmitter,
  I18nEventArgsMap,

  // 事件系统
  I18nEventType,

  // 基础接口
  I18nInstance,
  I18nOptions,

  LanguageChangedEventArgs,

  LanguageInfo,
  LanguagePackage,
  LoadedEventArgs,
  // 加载器相关
  Loader,

  LoadErrorEventArgs,
  // 缓存相关
  LRUCache,
  // 工具类型
  NestedObject,
  OptimizationSuggestion,
  // 性能监控
  PerformanceMetrics,
  // 存储相关
  Storage,
  StorageType,

  TranslationFunction,
  TranslationMissingEventArgs,

  TranslationOptions,

  TranslationParams,
} from '../core/types'

// ==================== 重新导出 Vue 类型（占位） ====================
// 注意：如需导出 Vue 专属的增强类型，请从 './vue/types' 明确导出现有类型。当前不导出不存在的增强类型文件。

// ==================== 工具类型定义 ====================

/**
 * 深度只读类型
 *
 * 将对象的所有属性递归设置为只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 可选的深度部分类型
 *
 * 将对象的所有属性递归设置为可选
 */
export type DeepOptional<T> = {
  [P in keyof T]?: T[P] extends object ? DeepOptional<T[P]> : T[P]
}

/**
 * 非空类型
 *
 * 排除 null 和 undefined
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 函数参数类型提取
 *
 * 提取函数的参数类型
 */
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never

/**
 * 函数返回类型提取
 *
 * 提取函数的返回类型
 */
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any

/**
 * 构造函数参数类型提取
 *
 * 提取构造函数的参数类型
 */
export type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never

/**
 * 实例类型提取
 *
 * 提取构造函数的实例类型
 */
export type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any

// ==================== 条件类型工具 ====================

/**
 * 如果条件为真则返回类型 T，否则返回类型 F
 */
export type If<C extends boolean, T, F> = C extends true ? T : F

/**
 * 检查类型是否相等
 */
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false

/**
 * 检查类型是否为 any
 */
export type IsAny<T> = 0 extends (1 & T) ? true : false

/**
 * 检查类型是否为 never
 */
export type IsNever<T> = [T] extends [never] ? true : false

/**
 * 检查类型是否为 unknown
 */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false

// ==================== 字符串操作类型 ====================

/**
 * 首字母大写
 */
export type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S

/**
 * 首字母小写
 */
export type Uncapitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Lowercase<F>}${R}` : S

/**
 * 字符串替换
 */
export type Replace<S extends string, From extends string, To extends string> = S extends `${infer L}${From}${infer R}` ? `${L}${To}${R}` : S

/**
 * 字符串分割
 */
export type Split<S extends string, D extends string> = S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S]

// ==================== 数组操作类型 ====================

/**
 * 数组头部元素类型
 */
export type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never

/**
 * 数组尾部元素类型
 */
export type Tail<T extends readonly any[]> = T extends readonly [any, ...infer R] ? R : []

/**
 * 数组长度类型
 */
export type Length<T extends readonly any[]> = T['length']

/**
 * 数组反转类型
 */
export type Reverse<T extends readonly any[]> = T extends readonly [...infer Rest, infer Last] ? [Last, ...Reverse<Rest>] : []

// ==================== 对象操作类型 ====================

/**
 * 对象键类型
 */
export type Keys<T> = keyof T

/**
 * 对象值类型
 */
export type Values<T> = T[keyof T]

/**
 * 对象条目类型
 */
export type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T]

/**
 * 从对象中排除指定键
 */
export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

/**
 * 从对象中选择指定键
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

/**
 * 对象部分类型
 */
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

/**
 * 对象必需类型
 */
export type Required<T> = {
  [P in keyof T]-?: T[P]
}

/**
 * 对象只读类型
 */
export type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

/**
 * 记录类型
 */
export type Record<K extends keyof any, T> = {
  [P in K]: T
}

// ==================== 结束 ====================
