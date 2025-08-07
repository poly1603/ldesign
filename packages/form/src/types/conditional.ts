// 条件渲染相关类型定义

import type { FormItemConfig } from './field'

/**
 * 条件渲染配置
 */
export interface ConditionalRenderConfig {
  /** 依赖的字段名 */
  dependsOn: string | string[]

  /** 条件判断函数 */
  condition: ConditionalFunction

  /** 动态配置函数 */
  render?: ConditionalRenderFunction

  /** 条件类型 */
  type?: ConditionalType

  /** 条件模式 */
  mode?: ConditionalMode

  /** 条件优先级 */
  priority?: number

  /** 是否缓存结果 */
  cache?: boolean

  /** 缓存时间（毫秒） */
  cacheTime?: number

  /** 条件描述 */
  description?: string
}

/**
 * 条件判断函数
 */
export type ConditionalFunction = (
  values: Record<string, any>,
  currentField?: FormItemConfig,
  allFields?: FormItemConfig[]
) => boolean

/**
 * 动态配置函数
 */
export type ConditionalRenderFunction = (
  values: Record<string, any>,
  currentField?: FormItemConfig,
  allFields?: FormItemConfig[]
) => Partial<FormItemConfig>

/**
 * 条件类型
 */
export type ConditionalType =
  | 'visibility' // 显示/隐藏
  | 'disabled' // 启用/禁用
  | 'readonly' // 只读/可编辑
  | 'required' // 必填/非必填
  | 'options' // 选项动态更新
  | 'props' // 属性动态更新
  | 'validation' // 验证规则动态更新
  | 'style' // 样式动态更新
  | 'custom' // 自定义

/**
 * 条件模式
 */
export type ConditionalMode =
  | 'immediate' // 立即执行
  | 'debounced' // 防抖执行
  | 'throttled' // 节流执行
  | 'lazy' // 懒执行

/**
 * 条件规则
 */
export interface ConditionalRule {
  /** 规则ID */
  id: string

  /** 目标字段 */
  target: string

  /** 条件配置 */
  condition: ConditionalRenderConfig

  /** 是否启用 */
  enabled?: boolean

  /** 规则描述 */
  description?: string

  /** 规则分组 */
  group?: string
}

/**
 * 条件执行结果
 */
export interface ConditionalResult {
  /** 是否满足条件 */
  matched: boolean

  /** 动态配置结果 */
  config?: Partial<FormItemConfig>

  /** 执行时间 */
  timestamp: number

  /** 执行耗时 */
  duration: number

  /** 错误信息 */
  error?: string

  /** 缓存键 */
  cacheKey?: string
}

/**
 * 条件上下文
 */
export interface ConditionalContext {
  /** 当前字段 */
  field: FormItemConfig

  /** 表单数据 */
  formData: Record<string, any>

  /** 所有字段 */
  allFields: FormItemConfig[]

  /** 依赖字段值 */
  dependentValues: Record<string, any>

  /** 上次执行结果 */
  lastResult?: ConditionalResult

  /** 执行次数 */
  executionCount: number
}

/**
 * 条件引擎接口
 */
export interface ConditionalEngine {
  /** 注册条件规则 */
  registerRule(rule: ConditionalRule): void

  /** 移除条件规则 */
  removeRule(id: string): void

  /** 获取条件规则 */
  getRule(id: string): ConditionalRule | undefined

  /** 获取所有规则 */
  getAllRules(): ConditionalRule[]

  /** 执行条件检查 */
  execute(context: ConditionalContext): ConditionalResult

  /** 批量执行条件检查 */
  executeBatch(contexts: ConditionalContext[]): ConditionalResult[]

  /** 清空缓存 */
  clearCache(): void

  /** 启用规则 */
  enableRule(id: string): void

  /** 禁用规则 */
  disableRule(id: string): void

  /** 销毁引擎 */
  destroy(): void
}

/**
 * 条件监听器
 */
export interface ConditionalWatcher {
  /** 监听字段变化 */
  watch(field: string, callback: ConditionalWatchCallback): void

  /** 取消监听 */
  unwatch(field: string, callback?: ConditionalWatchCallback): void

  /** 触发条件检查 */
  trigger(field: string, value: any): void

  /** 获取监听的字段 */
  getWatchedFields(): string[]

  /** 清空所有监听 */
  clear(): void
}

/**
 * 条件监听回调
 */
export type ConditionalWatchCallback = (
  field: string,
  newValue: any,
  oldValue: any,
  context: ConditionalContext
) => void

/**
 * 条件表达式
 */
export interface ConditionalExpression {
  /** 表达式字符串 */
  expression: string

  /** 表达式变量 */
  variables?: Record<string, any>

  /** 表达式函数 */
  functions?: Record<string, Function>

  /** 表达式上下文 */
  context?: Record<string, any>
}

/**
 * 条件表达式解析器
 */
export interface ConditionalExpressionParser {
  /** 解析表达式 */
  parse(expression: ConditionalExpression): ConditionalFunction

  /** 验证表达式 */
  validate(expression: ConditionalExpression): boolean

  /** 获取表达式依赖 */
  getDependencies(expression: ConditionalExpression): string[]

  /** 注册函数 */
  registerFunction(name: string, fn: Function): void

  /** 移除函数 */
  removeFunction(name: string): void
}

/**
 * 内置条件函数
 */
export interface BuiltinConditionalFunctions {
  /** 等于 */
  eq: (a: any, b: any) => boolean

  /** 不等于 */
  ne: (a: any, b: any) => boolean

  /** 大于 */
  gt: (a: number, b: number) => boolean

  /** 大于等于 */
  gte: (a: number, b: number) => boolean

  /** 小于 */
  lt: (a: number, b: number) => boolean

  /** 小于等于 */
  lte: (a: number, b: number) => boolean

  /** 包含 */
  includes: (arr: any[], item: any) => boolean

  /** 不包含 */
  excludes: (arr: any[], item: any) => boolean

  /** 为空 */
  isEmpty: (value: any) => boolean

  /** 不为空 */
  isNotEmpty: (value: any) => boolean

  /** 是数字 */
  isNumber: (value: any) => boolean

  /** 是字符串 */
  isString: (value: any) => boolean

  /** 是数组 */
  isArray: (value: any) => boolean

  /** 是对象 */
  isObject: (value: any) => boolean

  /** 正则匹配 */
  matches: (value: string, pattern: RegExp) => boolean

  /** 长度等于 */
  lengthEq: (value: string | any[], length: number) => boolean

  /** 长度大于 */
  lengthGt: (value: string | any[], length: number) => boolean

  /** 长度小于 */
  lengthLt: (value: string | any[], length: number) => boolean

  /** 在范围内 */
  inRange: (value: number, min: number, max: number) => boolean

  /** 不在范围内 */
  notInRange: (value: number, min: number, max: number) => boolean
}
