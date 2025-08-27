/**
 * @ldesign/form 类型定义入口文件
 * 
 * 这个文件导出所有的类型定义，为整个表单系统提供完整的TypeScript类型支持
 */

// 导出通用类型
export * from './common'

// 导出字段相关类型
export * from './field'

// 导出布局相关类型
export * from './layout'

// 导出验证相关类型
export * from './validation'

// 导出事件相关类型
export * from './events'

// 导出表单相关类型
export * from './form'

// 导出插件相关类型
export * from './plugins'

// 重新导出一些常用的类型别名，方便使用
export type {
  // 表单核心类型
  FormConfig,
  FormInstance,
  FormState,
  UseFormReturn,
  
  // 字段类型
  FormFieldConfig,
  FormFieldItem,
  FormGroupConfig,
  FormActionConfig,
  
  // 布局类型
  LayoutConfig,
  LayoutEngine,
  LayoutResult,
  
  // 验证类型
  ValidationRule,
  ValidationResult,
  FormValidationResult,
  ValidationEngine,
  
  // 事件类型
  EventType,
  EventData,
  EventListener,
  EventBus,
  
  // 插件类型
  Plugin,
  PluginManager,
  PluginContext,
  
  // 通用类型
  AnyObject,
  ConditionalFunction,
  DynamicPropsFunction,
  ResponsiveValue,
  OptionItem,
  OptionsLoader
} from './form'

// 导出类型工具函数
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export type IsEqual<T, U> = 
  (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2) ? true : false

export type If<C extends boolean, T, F> = C extends true ? T : F

export type Not<C extends boolean> = C extends true ? false : true

export type And<A extends boolean, B extends boolean> = A extends true ? B : false

export type Or<A extends boolean, B extends boolean> = A extends true ? true : B

// 字符串工具类型
export type Capitalize<S extends string> = S extends `${infer F}${infer R}` 
  ? `${Uppercase<F>}${R}` 
  : S

export type Uncapitalize<S extends string> = S extends `${infer F}${infer R}` 
  ? `${Lowercase<F>}${R}` 
  : S

export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
  : S

export type KebabCase<S extends string> = S extends `${infer C}${infer T}`
  ? `${C extends Uppercase<C> ? `-${Lowercase<C>}` : C}${KebabCase<T>}`
  : S

// 对象工具类型
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>

export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

export type Immutable<T> = {
  readonly [P in keyof T]: T[P]
}

// 数组工具类型
export type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never

export type Tail<T extends readonly any[]> = T extends readonly [any, ...infer T] ? T : []

export type Last<T extends readonly any[]> = T extends readonly [...any[], infer L] ? L : never

export type Length<T extends readonly any[]> = T['length']

export type Reverse<T extends readonly any[]> = T extends readonly [...infer Rest, infer Last]
  ? [Last, ...Reverse<Rest>]
  : []

export type Flatten<T extends readonly any[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends readonly any[]
    ? [...Flatten<First>, ...Flatten<Rest>]
    : [First, ...Flatten<Rest>]
  : []

// 函数工具类型
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never

export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any

export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any

export type Curry<P extends readonly any[], R> = P extends readonly [infer H, ...infer T]
  ? (arg: H) => Curry<T, R>
  : R

// 路径工具类型
export type PathKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? T[K] extends object
          ? `${K}` | `${K}.${PathKeys<T[K]>}`
          : `${K}`
        : never
    }[keyof T]
  : never

export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never

export type SetPath<T, P extends string, V> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? {
        [Key in keyof T]: Key extends K ? SetPath<T[Key], Rest, V> : T[Key]
      }
    : T
  : P extends keyof T
  ? {
      [Key in keyof T]: Key extends P ? V : T[Key]
    }
  : T

// 条件类型工具
export type NonNullable<T> = T extends null | undefined ? never : T

export type NonEmptyArray<T> = [T, ...T[]]

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

export type ExactlyOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, never>>
}[keyof T]

export type MaybePromise<T> = T | Promise<T>

export type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T

// 品牌类型（用于创建名义类型）
export type Brand<T, B> = T & { __brand: B }

export type Nominal<T, N extends string> = T & { __nominal: N }

// 版本信息
export const VERSION = '1.0.0'

// 构建信息
export const BUILD_INFO = {
  version: VERSION,
  buildTime: new Date().toISOString(),
  gitCommit: process.env.GIT_COMMIT || 'unknown',
  gitBranch: process.env.GIT_BRANCH || 'unknown',
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || 'development'
} as const

// 类型检查工具
export const isFormConfig = (value: any): value is FormConfig => {
  return value && typeof value === 'object' && Array.isArray(value.fields)
}

export const isFormFieldConfig = (value: any): value is FormFieldConfig => {
  return value && typeof value === 'object' && typeof value.name === 'string'
}

export const isFormGroupConfig = (value: any): value is FormGroupConfig => {
  return value && typeof value === 'object' && value.type === 'group'
}

export const isFormActionConfig = (value: any): value is FormActionConfig => {
  return value && typeof value === 'object' && value.type === 'actions'
}

// 默认配置
export const DEFAULT_FORM_CONFIG: Partial<FormConfig> = {
  layout: {
    type: 'grid',
    responsive: {
      enabled: true,
      breakpoints: {
        xs: { value: 0, name: 'xs', columns: 1 },
        sm: { value: 576, name: 'sm', columns: 2 },
        md: { value: 768, name: 'md', columns: 3 },
        lg: { value: 992, name: 'lg', columns: 4 },
        xl: { value: 1200, name: 'xl', columns: 5 }
      }
    },
    calculation: {
      autoCalculate: true,
      minColumnWidth: 300,
      maxColumns: 6,
      minColumns: 1,
      defaultColumns: 3
    },
    section: {
      defaultRows: 1,
      expandMode: 'dropdown'
    }
  },
  validation: {
    enabled: true,
    trigger: 'change',
    showStatus: true,
    showMessage: true
  },
  theme: {
    type: 'light',
    name: 'default'
  },
  performance: {
    debounce: {
      validation: 300,
      onChange: 100,
      autoSave: 1000
    },
    cache: {
      enabled: true,
      maxSize: 100,
      ttl: 300000 // 5分钟
    }
  }
} as const

// 导出默认配置的类型
export type DefaultFormConfig = typeof DEFAULT_FORM_CONFIG
