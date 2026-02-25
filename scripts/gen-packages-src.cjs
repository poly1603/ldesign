const fs = require('fs')
const path = require('path')
const base = path.join(__dirname, '..', 'packages')

function w(f, c) {
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, c, 'utf8')
}

// =====================================================================
// 1. @ldesign/validate
// =====================================================================
const validateCore = {
  'src/index.ts': `export { Validator } from './validator'
export { Schema } from './schema'
export { ValidationEngine } from './engine'
export * from './rules'
export * from './types'
`,
  'src/types.ts': `/**
 * 校验规则定义
 */
export interface ValidationRule<T = any> {
  /** 规则名称 */
  name: string
  /** 错误消息（支持模板变量 {field}, {value}, {param}） */
  message: string | ((field: string, value: T, param?: any) => string)
  /** 同步校验函数 */
  validate?: (value: T, param?: any) => boolean
  /** 异步校验函数 */
  validateAsync?: (value: T, param?: any) => Promise<boolean>
  /** 规则参数 */
  param?: any
}

/**
 * 字段校验配置
 */
export interface FieldRules<T = any> {
  /** 字段名 */
  field: string
  /** 字段显示标签 */
  label?: string
  /** 规则列表 */
  rules: ValidationRule<T>[]
}

/**
 * 校验结果
 */
export interface ValidationResult {
  /** 是否校验通过 */
  valid: boolean
  /** 错误列表 */
  errors: ValidationError[]
}

/**
 * 校验错误
 */
export interface ValidationError {
  /** 字段名 */
  field: string
  /** 规则名 */
  rule: string
  /** 错误消息 */
  message: string
}

/**
 * Schema 字段定义
 */
export interface SchemaField {
  /** 字段显示标签 */
  label?: string
  /** 是否必填 */
  required?: boolean | string
  /** 类型校验 */
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url'
  /** 最小长度/最小值 */
  min?: number
  /** 最大长度/最大值 */
  max?: number
  /** 正则匹配 */
  pattern?: RegExp | string
  /** 自定义校验函数 */
  custom?: (value: any) => boolean | string | Promise<boolean | string>
  /** 自定义错误消息覆盖 */
  message?: string
}

export type SchemaDefinition = Record<string, SchemaField>

export interface ValidateOptions {
  /** 是否在第一个错误时停止 */
  firstError?: boolean
  /** 是否跳过空值（非 required 字段） */
  skipEmpty?: boolean
}
`,
  'src/rules.ts': `import type { ValidationRule } from './types'

/**
 * 必填校验
 */
export function required(message?: string): ValidationRule {
  return {
    name: 'required',
    message: message || '{field}不能为空',
    validate: (value: any) => {
      if (value === null || value === undefined) return false
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      return true
    },
  }
}

/**
 * 最小长度/最小值
 */
export function min(limit: number, message?: string): ValidationRule {
  return {
    name: 'min',
    message: message || '{field}不能小于{param}',
    param: limit,
    validate: (value: any, param: number) => {
      if (typeof value === 'string') return value.length >= param
      if (typeof value === 'number') return value >= param
      if (Array.isArray(value)) return value.length >= param
      return true
    },
  }
}

/**
 * 最大长度/最大值
 */
export function max(limit: number, message?: string): ValidationRule {
  return {
    name: 'max',
    message: message || '{field}不能大于{param}',
    param: limit,
    validate: (value: any, param: number) => {
      if (typeof value === 'string') return value.length <= param
      if (typeof value === 'number') return value <= param
      if (Array.isArray(value)) return value.length <= param
      return true
    },
  }
}

/**
 * 邮箱校验
 */
export function email(message?: string): ValidationRule {
  return {
    name: 'email',
    message: message || '{field}格式不正确',
    validate: (value: any) => {
      if (!value) return true
      return /^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$/.test(String(value))
    },
  }
}

/**
 * URL 校验
 */
export function url(message?: string): ValidationRule {
  return {
    name: 'url',
    message: message || '{field}不是有效的 URL',
    validate: (value: any) => {
      if (!value) return true
      try { new URL(String(value)); return true } catch { return false }
    },
  }
}

/**
 * 正则校验
 */
export function pattern(regex: RegExp, message?: string): ValidationRule {
  return {
    name: 'pattern',
    message: message || '{field}格式不正确',
    param: regex,
    validate: (value: any, param: RegExp) => {
      if (!value) return true
      return param.test(String(value))
    },
  }
}

/**
 * 自定义同步校验
 */
export function custom(
  fn: (value: any) => boolean | string,
  message?: string,
): ValidationRule {
  return {
    name: 'custom',
    message: message || '{field}校验失败',
    validate: (value: any) => {
      const result = fn(value)
      return typeof result === 'string' ? false : result
    },
  }
}

/**
 * 异步校验（如远程唯一性检查）
 */
export function asyncRule(
  fn: (value: any) => Promise<boolean | string>,
  message?: string,
): ValidationRule {
  return {
    name: 'async',
    message: message || '{field}校验失败',
    validateAsync: async (value: any) => {
      const result = await fn(value)
      return typeof result === 'string' ? false : result
    },
  }
}
`,
  'src/validator.ts': `import type { ValidationRule, ValidationResult, ValidationError, FieldRules, ValidateOptions } from './types'

/**
 * 校验器 - 执行字段级别的校验
 */
export class Validator {
  private fieldRulesMap = new Map<string, FieldRules>()

  /**
   * 添加字段校验规则
   */
  addField(field: string, rules: ValidationRule[], label?: string): this {
    this.fieldRulesMap.set(field, { field, label: label || field, rules })
    return this
  }

  /**
   * 移除字段校验规则
   */
  removeField(field: string): this {
    this.fieldRulesMap.delete(field)
    return this
  }

  /**
   * 校验单个字段
   */
  async validateField(field: string, value: any): Promise<ValidationError[]> {
    const fieldRules = this.fieldRulesMap.get(field)
    if (!fieldRules) return []

    const errors: ValidationError[] = []
    for (const rule of fieldRules.rules) {
      const valid = rule.validateAsync
        ? await rule.validateAsync(value, rule.param)
        : rule.validate?.(value, rule.param) ?? true

      if (!valid) {
        errors.push({
          field,
          rule: rule.name,
          message: this.formatMessage(rule.message, fieldRules.label || field, value, rule.param),
        })
      }
    }
    return errors
  }

  /**
   * 校验所有字段
   */
  async validate(data: Record<string, any>, options?: ValidateOptions): Promise<ValidationResult> {
    const errors: ValidationError[] = []

    for (const [field, fieldRules] of this.fieldRulesMap) {
      const value = data[field]

      if (options?.skipEmpty && (value === undefined || value === null || value === '')) {
        const hasRequired = fieldRules.rules.some(r => r.name === 'required')
        if (!hasRequired) continue
      }

      const fieldErrors = await this.validateField(field, value)
      errors.push(...fieldErrors)

      if (options?.firstError && errors.length > 0) {
        return { valid: false, errors }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * 清空所有规则
   */
  clear(): void {
    this.fieldRulesMap.clear()
  }

  private formatMessage(
    message: string | ((field: string, value: any, param?: any) => string),
    field: string, value: any, param?: any,
  ): string {
    if (typeof message === 'function') return message(field, value, param)
    return message
      .replace(/\\{field\\}/g, field)
      .replace(/\\{value\\}/g, String(value ?? ''))
      .replace(/\\{param\\}/g, String(param ?? ''))
  }
}
`,
  'src/schema.ts': `import type { SchemaDefinition, SchemaField, ValidationResult, ValidationError } from './types'
import { Validator } from './validator'
import { required, min, max, email, url, pattern } from './rules'

/**
 * Schema - 声明式校验模式
 *
 * @example
 * const schema = new Schema({
 *   username: { required: true, min: 3, max: 20 },
 *   email: { required: true, type: 'email' },
 *   age: { type: 'number', min: 18 },
 * })
 * const result = await schema.validate({ username: 'test', email: 'a@b.com', age: 20 })
 */
export class Schema {
  private definition: SchemaDefinition

  constructor(definition: SchemaDefinition) {
    this.definition = definition
  }

  /**
   * 根据 Schema 定义进行校验
   */
  async validate(data: Record<string, any>): Promise<ValidationResult> {
    const validator = new Validator()

    for (const [field, schema] of Object.entries(this.definition)) {
      const rules = this.buildRules(schema)
      validator.addField(field, rules, schema.label || field)
    }

    return validator.validate(data)
  }

  /**
   * 校验单个字段
   */
  async validateField(field: string, value: any): Promise<ValidationError[]> {
    const schema = this.definition[field]
    if (!schema) return []

    const validator = new Validator()
    validator.addField(field, this.buildRules(schema), schema.label || field)
    return validator.validateField(field, value)
  }

  private buildRules(schema: SchemaField) {
    const rules = []

    if (schema.required) {
      const msg = typeof schema.required === 'string' ? schema.required : undefined
      rules.push(required(msg))
    }

    if (schema.type === 'email') rules.push(email(schema.message))
    if (schema.type === 'url') rules.push(url(schema.message))

    if (schema.min !== undefined) rules.push(min(schema.min, schema.message))
    if (schema.max !== undefined) rules.push(max(schema.max, schema.message))

    if (schema.pattern) {
      const regex = typeof schema.pattern === 'string' ? new RegExp(schema.pattern) : schema.pattern
      rules.push(pattern(regex, schema.message))
    }

    if (schema.custom) {
      const customFn = schema.custom
      rules.push({
        name: 'custom',
        message: schema.message || '{field}校验失败',
        validateAsync: async (value: any) => {
          const result = await customFn(value)
          return typeof result === 'string' ? false : result
        },
      })
    }

    return rules
  }
}
`,
  'src/engine.ts': `import type { SchemaDefinition, ValidationResult, ValidateOptions } from './types'
import { Schema } from './schema'
import { Validator } from './validator'

/**
 * ValidationEngine - 校验引擎（高级 API）
 *
 * 提供全局规则注册、schema 缓存、校验中间件等功能
 */
export class ValidationEngine {
  private schemas = new Map<string, Schema>()
  private middlewares: Array<(data: any, result: ValidationResult) => ValidationResult> = []

  /**
   * 注册一个命名 Schema
   */
  registerSchema(name: string, definition: SchemaDefinition): this {
    this.schemas.set(name, new Schema(definition))
    return this
  }

  /**
   * 移除注册的 Schema
   */
  removeSchema(name: string): this {
    this.schemas.delete(name)
    return this
  }

  /**
   * 使用已注册的 Schema 进行校验
   */
  async validateBySchema(name: string, data: Record<string, any>): Promise<ValidationResult> {
    const schema = this.schemas.get(name)
    if (!schema) {
      return { valid: false, errors: [{ field: '', rule: 'schema', message: \`Schema "\${name}" 未注册\` }] }
    }
    let result = await schema.validate(data)
    for (const mw of this.middlewares) {
      result = mw(data, result)
    }
    return result
  }

  /**
   * 直接使用 Schema 定义进行校验
   */
  async validate(definition: SchemaDefinition, data: Record<string, any>): Promise<ValidationResult> {
    const schema = new Schema(definition)
    let result = await schema.validate(data)
    for (const mw of this.middlewares) {
      result = mw(data, result)
    }
    return result
  }

  /**
   * 创建一个 Validator 实例
   */
  createValidator(): Validator {
    return new Validator()
  }

  /**
   * 添加校验中间件
   */
  use(middleware: (data: any, result: ValidationResult) => ValidationResult): this {
    this.middlewares.push(middleware)
    return this
  }
}
`,
}

// validate vue
const validateVue = {
  'src/index.ts': `export { useValidation } from './composables/useValidation'
export { useFormValidation } from './composables/useFormValidation'
export { createValidatePlugin } from './plugin'
export type { ValidatePluginOptions } from './plugin'
`,
  'src/composables/useValidation.ts': `import { ref, reactive } from 'vue'
import { Schema } from '@ldesign/validate-core'
import type { SchemaDefinition, ValidationError } from '@ldesign/validate-core'

/**
 * 单字段校验 composable
 */
export function useValidation(definition: SchemaDefinition) {
  const schema = new Schema(definition)
  const errors = reactive<Record<string, string[]>>({})
  const isValid = ref(true)
  const isValidating = ref(false)

  async function validateField(field: string, value: any) {
    isValidating.value = true
    try {
      const fieldErrors = await schema.validateField(field, value)
      errors[field] = fieldErrors.map(e => e.message)
      updateValid()
    } finally {
      isValidating.value = false
    }
  }

  async function validateAll(data: Record<string, any>) {
    isValidating.value = true
    try {
      const result = await schema.validate(data)
      // 清空旧错误
      Object.keys(errors).forEach(k => { errors[k] = [] })
      // 填入新错误
      for (const err of result.errors) {
        if (!errors[err.field]) errors[err.field] = []
        errors[err.field].push(err.message)
      }
      isValid.value = result.valid
      return result
    } finally {
      isValidating.value = false
    }
  }

  function clearErrors() {
    Object.keys(errors).forEach(k => { errors[k] = [] })
    isValid.value = true
  }

  function getFieldError(field: string): string | undefined {
    return errors[field]?.[0]
  }

  function updateValid() {
    isValid.value = Object.values(errors).every(e => e.length === 0)
  }

  return { errors, isValid, isValidating, validateField, validateAll, clearErrors, getFieldError }
}
`,
  'src/composables/useFormValidation.ts': `import { ref, watch, reactive, type Ref } from 'vue'
import { Schema } from '@ldesign/validate-core'
import type { SchemaDefinition } from '@ldesign/validate-core'

/**
 * 表单校验 composable - 自动绑定响应式表单数据
 */
export function useFormValidation<T extends Record<string, any>>(
  formData: Ref<T> | T,
  definition: SchemaDefinition,
  options?: { immediate?: boolean; debounce?: number },
) {
  const schema = new Schema(definition)
  const errors = reactive<Record<string, string[]>>({})
  const isValid = ref(true)
  const isValidating = ref(false)
  const isDirty = ref(false)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function validate(): Promise<boolean> {
    isValidating.value = true
    try {
      const data = 'value' in formData ? (formData as Ref<T>).value : formData
      const result = await schema.validate(data as Record<string, any>)
      Object.keys(errors).forEach(k => { errors[k] = [] })
      for (const err of result.errors) {
        if (!errors[err.field]) errors[err.field] = []
        errors[err.field].push(err.message)
      }
      isValid.value = result.valid
      return result.valid
    } finally {
      isValidating.value = false
    }
  }

  async function validateField(field: string) {
    isValidating.value = true
    try {
      const data = 'value' in formData ? (formData as Ref<T>).value : formData
      const fieldErrors = await schema.validateField(field, (data as any)[field])
      errors[field] = fieldErrors.map(e => e.message)
      isValid.value = Object.values(errors).every(e => e.length === 0)
    } finally {
      isValidating.value = false
    }
  }

  function reset() {
    Object.keys(errors).forEach(k => { errors[k] = [] })
    isValid.value = true
    isDirty.value = false
  }

  async function handleSubmit(onSuccess: (data: T) => void, onError?: (errors: Record<string, string[]>) => void) {
    const valid = await validate()
    const data = 'value' in formData ? (formData as Ref<T>).value : formData
    if (valid) {
      onSuccess(data as T)
    } else {
      onError?.(errors)
    }
  }

  // Auto-validate on change
  if (options?.immediate !== false) {
    watch(
      () => 'value' in formData ? (formData as Ref<T>).value : formData,
      () => {
        isDirty.value = true
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => validate(), options?.debounce ?? 300)
      },
      { deep: true },
    )
  }

  return { errors, isValid, isValidating, isDirty, validate, validateField, reset, handleSubmit }
}
`,
  'src/plugin.ts': `import type { App } from 'vue'
import { ValidationEngine } from '@ldesign/validate-core'

export interface ValidatePluginOptions {
  globalEngine?: boolean
}

const engine = new ValidationEngine()

export function createValidatePlugin(options?: ValidatePluginOptions) {
  return {
    install(app: App) {
      if (options?.globalEngine !== false) {
        app.provide('ldesign-validate-engine', engine)
        app.config.globalProperties.$validate = engine
      }
    },
  }
}
`,
}

// =====================================================================
// 2. @ldesign/event
// =====================================================================
const eventCore = {
  'src/index.ts': `export { EventBus } from './event-bus'
export type {
  EventHandler,
  EventMap,
  EventBusOptions,
  EventRecord,
  Unsubscribe,
} from './types'
`,
  'src/types.ts': `export type EventHandler<T = any> = (payload: T) => void | Promise<void>

export type EventMap = Record<string, any>

export interface EventBusOptions {
  /** 最大历史记录数 */
  maxHistory?: number
  /** 是否启用通配符 */
  wildcard?: boolean
  /** 命名空间分隔符 */
  separator?: string
}

export interface EventRecord<T = any> {
  event: string
  payload: T
  timestamp: number
}

export type Unsubscribe = () => void
`,
  'src/event-bus.ts': `import type { EventHandler, EventBusOptions, EventRecord, Unsubscribe } from './types'

/**
 * 类型安全的事件总线
 *
 * @example
 * type Events = { 'user:login': { id: string }; 'user:logout': void }
 * const bus = new EventBus<Events>()
 * bus.on('user:login', (payload) => console.log(payload.id))
 * bus.emit('user:login', { id: '123' })
 */
export class EventBus<Events extends Record<string, any> = Record<string, any>> {
  private handlers = new Map<string, Set<EventHandler>>()
  private onceHandlers = new Map<string, Set<EventHandler>>()
  private history: EventRecord[] = []
  private options: Required<EventBusOptions>

  constructor(options?: EventBusOptions) {
    this.options = {
      maxHistory: options?.maxHistory ?? 100,
      wildcard: options?.wildcard ?? true,
      separator: options?.separator ?? ':',
    }
  }

  /**
   * 订阅事件
   */
  on<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler as EventHandler)
    return () => this.off(event, handler)
  }

  /**
   * 订阅事件（只触发一次）
   */
  once<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    if (!this.onceHandlers.has(event)) {
      this.onceHandlers.set(event, new Set())
    }
    this.onceHandlers.get(event)!.add(handler as EventHandler)
    return () => this.onceHandlers.get(event)?.delete(handler as EventHandler)
  }

  /**
   * 取消订阅
   */
  off<K extends keyof Events & string>(event: K, handler?: EventHandler<Events[K]>): void {
    if (!handler) {
      this.handlers.delete(event)
      this.onceHandlers.delete(event)
    } else {
      this.handlers.get(event)?.delete(handler as EventHandler)
      this.onceHandlers.get(event)?.delete(handler as EventHandler)
    }
  }

  /**
   * 触发事件
   */
  async emit<K extends keyof Events & string>(event: K, payload?: Events[K]): Promise<void> {
    // 记录历史
    this.addHistory(event, payload)

    // 精确匹配
    const handlers = this.handlers.get(event)
    if (handlers) {
      for (const handler of handlers) {
        await handler(payload)
      }
    }

    // once 处理
    const onceSet = this.onceHandlers.get(event)
    if (onceSet) {
      for (const handler of onceSet) {
        await handler(payload)
      }
      this.onceHandlers.delete(event)
    }

    // 通配符匹配
    if (this.options.wildcard) {
      for (const [pattern, patternHandlers] of this.handlers) {
        if (pattern.includes('*') && this.matchWildcard(pattern, event)) {
          for (const handler of patternHandlers) {
            await handler(payload)
          }
        }
      }
    }
  }

  /**
   * 获取事件历史
   */
  getHistory(event?: string): EventRecord[] {
    if (!event) return [...this.history]
    return this.history.filter(r => r.event === event)
  }

  /**
   * 清除历史
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * 重放历史事件
   */
  async replay(event?: string): Promise<void> {
    const records = event ? this.getHistory(event) : this.history
    for (const record of records) {
      await this.emit(record.event as any, record.payload)
    }
  }

  /**
   * 获取事件订阅数
   */
  listenerCount(event: string): number {
    return (this.handlers.get(event)?.size ?? 0) + (this.onceHandlers.get(event)?.size ?? 0)
  }

  /**
   * 清除所有订阅
   */
  clear(): void {
    this.handlers.clear()
    this.onceHandlers.clear()
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.clear()
    this.clearHistory()
  }

  private addHistory(event: string, payload: any): void {
    this.history.push({ event, payload, timestamp: Date.now() })
    if (this.history.length > this.options.maxHistory) {
      this.history.shift()
    }
  }

  private matchWildcard(pattern: string, event: string): boolean {
    const sep = this.options.separator
    const patternParts = pattern.split(sep)
    const eventParts = event.split(sep)

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '**') return true
      if (patternParts[i] === '*') {
        if (i === patternParts.length - 1 && i === eventParts.length - 1) return true
        continue
      }
      if (patternParts[i] !== eventParts[i]) return false
    }

    return patternParts.length === eventParts.length
  }
}
`,
}

const eventVue = {
  'src/index.ts': `export { useEventBus } from './composables/useEventBus'
export { createEventPlugin } from './plugin'
`,
  'src/composables/useEventBus.ts': `import { onUnmounted, getCurrentInstance } from 'vue'
import { EventBus } from '@ldesign/event-core'
import type { EventHandler, Unsubscribe } from '@ldesign/event-core'

// 全局单例
const globalBus = new EventBus({ maxHistory: 200 })

/**
 * Vue 3 事件总线 composable
 *
 * @example
 * const { on, emit } = useEventBus<{ 'user:login': { name: string } }>()
 * on('user:login', (data) => console.log(data.name))
 * emit('user:login', { name: 'test' })
 */
export function useEventBus<Events extends Record<string, any> = Record<string, any>>(
  bus?: EventBus<Events>,
) {
  const eventBus = (bus || globalBus) as EventBus<Events>
  const unsubscribes: Unsubscribe[] = []

  function on<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    const unsub = eventBus.on(event, handler)
    unsubscribes.push(unsub)
    return unsub
  }

  function once<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    const unsub = eventBus.once(event, handler)
    unsubscribes.push(unsub)
    return unsub
  }

  function emit<K extends keyof Events & string>(event: K, payload?: Events[K]): Promise<void> {
    return eventBus.emit(event, payload)
  }

  function off<K extends keyof Events & string>(event: K, handler?: EventHandler<Events[K]>): void {
    eventBus.off(event, handler)
  }

  // 组件卸载时自动取消订阅
  if (getCurrentInstance()) {
    onUnmounted(() => {
      unsubscribes.forEach(unsub => unsub())
    })
  }

  return { on, once, emit, off, bus: eventBus }
}
`,
  'src/plugin.ts': `import type { App } from 'vue'
import { EventBus } from '@ldesign/event-core'

export function createEventPlugin(bus?: EventBus) {
  const eventBus = bus || new EventBus()
  return {
    install(app: App) {
      app.provide('ldesign-event-bus', eventBus)
      app.config.globalProperties.$eventBus = eventBus
    },
  }
}
`,
}

// =====================================================================
// 3. @ldesign/storage
// =====================================================================
const storageCore = {
  'src/index.ts': `export { StorageManager } from './manager'
export { LocalStorageAdapter } from './adapters/local'
export { SessionStorageAdapter } from './adapters/session'
export { MemoryStorageAdapter } from './adapters/memory'
export { CookieStorageAdapter } from './adapters/cookie'
export type { StorageAdapter, StorageOptions, StorageItem, SerializerOptions } from './types'
`,
  'src/types.ts': `export interface StorageAdapter {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
  clear(): void
  keys(): string[]
  has(key: string): boolean
}

export interface StorageItem<T = any> {
  value: T
  expires?: number
  createdAt: number
  version?: number
}

export interface StorageOptions {
  /** 存储前缀 */
  prefix?: string
  /** 默认过期时间 (ms) */
  defaultTTL?: number
  /** 序列化器 */
  serializer?: SerializerOptions
  /** 数据版本号 */
  version?: number
}

export interface SerializerOptions {
  serialize: (value: any) => string
  deserialize: (raw: string) => any
}
`,
  'src/adapters/local.ts': `import type { StorageAdapter } from '../types'

export class LocalStorageAdapter implements StorageAdapter {
  get(key: string): string | null { return localStorage.getItem(key) }
  set(key: string, value: string): void { localStorage.setItem(key, value) }
  remove(key: string): void { localStorage.removeItem(key) }
  clear(): void { localStorage.clear() }
  keys(): string[] {
    const result: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) result.push(key)
    }
    return result
  }
  has(key: string): boolean { return localStorage.getItem(key) !== null }
}
`,
  'src/adapters/session.ts': `import type { StorageAdapter } from '../types'

export class SessionStorageAdapter implements StorageAdapter {
  get(key: string): string | null { return sessionStorage.getItem(key) }
  set(key: string, value: string): void { sessionStorage.setItem(key, value) }
  remove(key: string): void { sessionStorage.removeItem(key) }
  clear(): void { sessionStorage.clear() }
  keys(): string[] {
    const result: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key) result.push(key)
    }
    return result
  }
  has(key: string): boolean { return sessionStorage.getItem(key) !== null }
}
`,
  'src/adapters/memory.ts': `import type { StorageAdapter } from '../types'

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>()

  get(key: string): string | null { return this.store.get(key) ?? null }
  set(key: string, value: string): void { this.store.set(key, value) }
  remove(key: string): void { this.store.delete(key) }
  clear(): void { this.store.clear() }
  keys(): string[] { return Array.from(this.store.keys()) }
  has(key: string): boolean { return this.store.has(key) }
}
`,
  'src/adapters/cookie.ts': `import type { StorageAdapter } from '../types'

export class CookieStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
  }
  set(key: string, value: string): void {
    document.cookie = key + '=' + encodeURIComponent(value) + '; path=/; SameSite=Lax'
  }
  remove(key: string): void {
    document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }
  clear(): void {
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim()
      if (name) this.remove(name)
    })
  }
  keys(): string[] {
    return document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(Boolean)
  }
  has(key: string): boolean { return this.get(key) !== null }
}
`,
  'src/manager.ts': `import type { StorageAdapter, StorageOptions, StorageItem } from './types'
import { LocalStorageAdapter } from './adapters/local'

/**
 * 统一存储管理器
 *
 * @example
 * const storage = new StorageManager({ prefix: 'app', defaultTTL: 3600000 })
 * storage.set('user', { name: 'test' })
 * const user = storage.get<{ name: string }>('user')
 */
export class StorageManager {
  private adapter: StorageAdapter
  private options: Required<StorageOptions>

  constructor(adapter?: StorageAdapter, options?: StorageOptions) {
    this.adapter = adapter || new LocalStorageAdapter()
    this.options = {
      prefix: options?.prefix ?? 'ld',
      defaultTTL: options?.defaultTTL ?? 0,
      serializer: options?.serializer ?? { serialize: JSON.stringify, deserialize: JSON.parse },
      version: options?.version ?? 1,
    }
  }

  /**
   * 存储数据
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const item: StorageItem<T> = {
      value,
      createdAt: Date.now(),
      version: this.options.version,
    }
    const expires = ttl ?? this.options.defaultTTL
    if (expires > 0) item.expires = Date.now() + expires
    this.adapter.set(this.prefixKey(key), this.options.serializer.serialize(item))
  }

  /**
   * 获取数据
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    const raw = this.adapter.get(this.prefixKey(key))
    if (!raw) return defaultValue
    try {
      const item: StorageItem<T> = this.options.serializer.deserialize(raw)
      // 过期检查
      if (item.expires && Date.now() > item.expires) {
        this.remove(key)
        return defaultValue
      }
      // 版本检查
      if (item.version !== undefined && item.version !== this.options.version) {
        this.remove(key)
        return defaultValue
      }
      return item.value
    } catch {
      return defaultValue
    }
  }

  /**
   * 删除数据
   */
  remove(key: string): void {
    this.adapter.remove(this.prefixKey(key))
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  /**
   * 清除所有带前缀的数据
   */
  clear(): void {
    const prefix = this.options.prefix + ':'
    this.adapter.keys()
      .filter(k => k.startsWith(prefix))
      .forEach(k => this.adapter.remove(k))
  }

  /**
   * 获取所有带前缀的键
   */
  keys(): string[] {
    const prefix = this.options.prefix + ':'
    return this.adapter.keys()
      .filter(k => k.startsWith(prefix))
      .map(k => k.slice(prefix.length))
  }

  /**
   * 获取存储大小（字节）
   */
  size(): number {
    let total = 0
    const prefix = this.options.prefix + ':'
    for (const key of this.adapter.keys()) {
      if (key.startsWith(prefix)) {
        const raw = this.adapter.get(key)
        if (raw) total += raw.length * 2 // UTF-16 估算
      }
    }
    return total
  }

  private prefixKey(key: string): string {
    return this.options.prefix + ':' + key
  }
}
`,
}

const storageVue = {
  'src/index.ts': `export { useStorage } from './composables/useStorage'
export { useLocalStorage } from './composables/useLocalStorage'
export { useSessionStorage } from './composables/useSessionStorage'
export { createStoragePlugin } from './plugin'
`,
  'src/composables/useStorage.ts': `import { ref, watch, type Ref } from 'vue'
import { StorageManager } from '@ldesign/storage-core'
import type { StorageAdapter } from '@ldesign/storage-core'

/**
 * 响应式存储 composable
 */
export function useStorage<T>(
  key: string,
  defaultValue: T,
  adapter?: StorageAdapter,
  options?: { prefix?: string; ttl?: number },
): Ref<T> {
  const manager = new StorageManager(adapter, { prefix: options?.prefix ?? 'ld' })
  const data = ref(manager.get<T>(key, defaultValue) as T) as Ref<T>

  watch(data, (newVal) => {
    if (newVal === null || newVal === undefined) {
      manager.remove(key)
    } else {
      manager.set(key, newVal, options?.ttl)
    }
  }, { deep: true })

  return data
}
`,
  'src/composables/useLocalStorage.ts': `import { type Ref } from 'vue'
import { LocalStorageAdapter } from '@ldesign/storage-core'
import { useStorage } from './useStorage'

export function useLocalStorage<T>(key: string, defaultValue: T, options?: { prefix?: string; ttl?: number }): Ref<T> {
  return useStorage(key, defaultValue, new LocalStorageAdapter(), options)
}
`,
  'src/composables/useSessionStorage.ts': `import { type Ref } from 'vue'
import { SessionStorageAdapter } from '@ldesign/storage-core'
import { useStorage } from './useStorage'

export function useSessionStorage<T>(key: string, defaultValue: T, options?: { prefix?: string; ttl?: number }): Ref<T> {
  return useStorage(key, defaultValue, new SessionStorageAdapter(), options)
}
`,
  'src/plugin.ts': `import type { App } from 'vue'
import { StorageManager } from '@ldesign/storage-core'

export function createStoragePlugin(options?: { prefix?: string }) {
  const manager = new StorageManager(undefined, { prefix: options?.prefix ?? 'ld' })
  return {
    install(app: App) {
      app.provide('ldesign-storage', manager)
      app.config.globalProperties.$storage = manager
    },
  }
}
`,
}

// =====================================================================
// 4. @ldesign/websocket
// =====================================================================
const websocketCore = {
  'src/index.ts': `export { WebSocketClient } from './client'
export type {
  WebSocketOptions,
  WebSocketState,
  MessageHandler,
  ConnectionEvents,
} from './types'
`,
  'src/types.ts': `export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

export type MessageHandler<T = any> = (data: T, event: MessageEvent) => void

export interface WebSocketOptions {
  /** WebSocket URL */
  url: string
  /** 协议 */
  protocols?: string | string[]
  /** 自动重连 */
  autoReconnect?: boolean
  /** 最大重连次数 */
  maxReconnectAttempts?: number
  /** 重连间隔 (ms) */
  reconnectInterval?: number
  /** 重连间隔递增因子 */
  reconnectBackoff?: number
  /** 心跳间隔 (ms)，0 表示禁用 */
  heartbeatInterval?: number
  /** 心跳消息 */
  heartbeatMessage?: string | (() => string)
  /** 心跳超时 (ms) */
  heartbeatTimeout?: number
  /** 消息序列化器 */
  serializer?: { encode: (data: any) => string; decode: (raw: string) => any }
}

export interface ConnectionEvents {
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
  onReconnect?: (attempt: number) => void
  onReconnectFailed?: () => void
}
`,
  'src/client.ts': `import type { WebSocketOptions, WebSocketState, MessageHandler, ConnectionEvents } from './types'

/**
 * WebSocket 客户端
 *
 * @example
 * const ws = new WebSocketClient({
 *   url: 'ws://localhost:8080',
 *   autoReconnect: true,
 *   heartbeatInterval: 30000,
 * })
 * ws.on('chat:message', (data) => console.log(data))
 * ws.connect()
 * ws.send('chat:message', { text: 'hello' })
 */
export class WebSocketClient {
  private ws: WebSocket | null = null
  private options: Required<WebSocketOptions>
  private events: ConnectionEvents = {}
  private handlers = new Map<string, Set<MessageHandler>>()
  private messageQueue: Array<{ type: string; data: any }> = []
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null

  state: WebSocketState = 'disconnected'

  constructor(options: WebSocketOptions, events?: ConnectionEvents) {
    this.options = {
      url: options.url,
      protocols: options.protocols ?? [],
      autoReconnect: options.autoReconnect ?? true,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
      reconnectInterval: options.reconnectInterval ?? 1000,
      reconnectBackoff: options.reconnectBackoff ?? 1.5,
      heartbeatInterval: options.heartbeatInterval ?? 0,
      heartbeatMessage: options.heartbeatMessage ?? 'ping',
      heartbeatTimeout: options.heartbeatTimeout ?? 10000,
      serializer: options.serializer ?? { encode: JSON.stringify, decode: JSON.parse },
    }
    if (events) this.events = events
  }

  /**
   * 建立连接
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return
    this.state = 'connecting'

    this.ws = new WebSocket(this.options.url, this.options.protocols)

    this.ws.onopen = (e) => {
      this.state = 'connected'
      this.reconnectAttempts = 0
      this.flushQueue()
      this.startHeartbeat()
      this.events.onOpen?.(e)
    }

    this.ws.onclose = (e) => {
      this.state = 'disconnected'
      this.stopHeartbeat()
      this.events.onClose?.(e)
      if (this.options.autoReconnect && !e.wasClean) this.reconnect()
    }

    this.ws.onerror = (e) => {
      this.events.onError?.(e)
    }

    this.ws.onmessage = (e) => {
      this.resetHeartbeatTimeout()
      this.events.onMessage?.(e)
      try {
        const parsed = this.options.serializer.decode(e.data)
        const type = parsed?.type || parsed?.event || '__raw__'
        const data = parsed?.data ?? parsed?.payload ?? parsed
        this.handlers.get(type)?.forEach(h => h(data, e))
        this.handlers.get('*')?.forEach(h => h({ type, data }, e))
      } catch {
        this.handlers.get('__raw__')?.forEach(h => h(e.data, e))
      }
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.options.autoReconnect = false
    this.stopHeartbeat()
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close(1000, 'Manual disconnect')
    this.state = 'disconnected'
  }

  /**
   * 发送消息
   */
  send(type: string, data?: any): void {
    const message = this.options.serializer.encode({ type, data })
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    } else {
      this.messageQueue.push({ type, data })
    }
  }

  /**
   * 发送原始消息
   */
  sendRaw(data: string | ArrayBuffer | Blob): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    }
  }

  /**
   * 监听消息类型
   */
  on<T = any>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set())
    this.handlers.get(type)!.add(handler as MessageHandler)
    return () => this.handlers.get(type)?.delete(handler as MessageHandler)
  }

  /**
   * 取消监听
   */
  off(type: string, handler?: MessageHandler): void {
    if (!handler) { this.handlers.delete(type) } else { this.handlers.get(type)?.delete(handler) }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.disconnect()
    this.handlers.clear()
    this.messageQueue = []
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.events.onReconnectFailed?.()
      return
    }
    this.state = 'reconnecting'
    this.reconnectAttempts++
    const delay = this.options.reconnectInterval * Math.pow(this.options.reconnectBackoff, this.reconnectAttempts - 1)
    this.events.onReconnect?.(this.reconnectAttempts)
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  private flushQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!
      this.send(msg.type, msg.data)
    }
  }

  private startHeartbeat(): void {
    if (this.options.heartbeatInterval <= 0) return
    this.heartbeatTimer = setInterval(() => {
      const msg = typeof this.options.heartbeatMessage === 'function'
        ? this.options.heartbeatMessage()
        : this.options.heartbeatMessage
      this.ws?.send(msg)
      this.heartbeatTimeoutTimer = setTimeout(() => {
        this.ws?.close(4000, 'Heartbeat timeout')
      }, this.options.heartbeatTimeout)
    }, this.options.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null }
    if (this.heartbeatTimeoutTimer) { clearTimeout(this.heartbeatTimeoutTimer); this.heartbeatTimeoutTimer = null }
  }

  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) { clearTimeout(this.heartbeatTimeoutTimer); this.heartbeatTimeoutTimer = null }
  }
}
`,
}

const websocketVue = {
  'src/index.ts': `export { useWebSocket } from './composables/useWebSocket'
`,
  'src/composables/useWebSocket.ts': `import { ref, onUnmounted, type Ref } from 'vue'
import { WebSocketClient } from '@ldesign/websocket-core'
import type { WebSocketOptions, WebSocketState, MessageHandler } from '@ldesign/websocket-core'

/**
 * WebSocket composable
 */
export function useWebSocket(options: WebSocketOptions) {
  const state: Ref<WebSocketState> = ref('disconnected')
  const lastMessage: Ref<any> = ref(null)

  const client = new WebSocketClient(options, {
    onOpen: () => { state.value = 'connected' },
    onClose: () => { state.value = 'disconnected' },
    onMessage: (e) => { lastMessage.value = e.data },
    onReconnect: () => { state.value = 'reconnecting' },
  })

  function connect() { client.connect() }
  function disconnect() { client.disconnect() }
  function send(type: string, data?: any) { client.send(type, data) }
  function sendRaw(data: string | ArrayBuffer | Blob) { client.sendRaw(data) }
  function on<T = any>(type: string, handler: MessageHandler<T>) { return client.on(type, handler) }

  onUnmounted(() => { client.destroy() })

  return { state, lastMessage, connect, disconnect, send, sendRaw, on, client }
}
`,
}

// =====================================================================
// 5. @ldesign/config
// =====================================================================
const configCore = {
  'src/index.ts': `export { ConfigManager } from './manager'
export type { ConfigOptions, ConfigSource, ConfigChangeEvent } from './types'
`,
  'src/types.ts': `export interface ConfigOptions {
  /** 初始配置 */
  initial?: Record<string, any>
  /** 命名空间分隔符 */
  separator?: string
  /** 远程配置 URL */
  remoteUrl?: string
  /** 轮询间隔 (ms)，0 禁用 */
  pollInterval?: number
  /** 配置校验器 */
  validator?: (config: Record<string, any>) => boolean | string
}

export type ConfigSource = 'initial' | 'set' | 'remote' | 'merge'

export interface ConfigChangeEvent {
  key: string
  oldValue: any
  newValue: any
  source: ConfigSource
}
`,
  'src/manager.ts': `import type { ConfigOptions, ConfigSource, ConfigChangeEvent } from './types'

type ChangeHandler = (event: ConfigChangeEvent) => void

/**
 * 配置管理器
 *
 * @example
 * const config = new ConfigManager({ initial: { app: { title: 'My App' } } })
 * config.get('app.title') // 'My App'
 * config.set('app.title', 'New Title')
 * config.onChange((e) => console.log(e.key, e.newValue))
 */
export class ConfigManager {
  private config: Record<string, any> = {}
  private options: Required<ConfigOptions>
  private listeners: Set<ChangeHandler> = new Set()
  private pollTimer: ReturnType<typeof setInterval> | null = null

  constructor(options?: ConfigOptions) {
    this.options = {
      initial: options?.initial ?? {},
      separator: options?.separator ?? '.',
      remoteUrl: options?.remoteUrl ?? '',
      pollInterval: options?.pollInterval ?? 0,
      validator: options?.validator ?? (() => true),
    }
    this.config = this.deepClone(this.options.initial)
  }

  /**
   * 获取配置值（支持点号路径）
   */
  get<T = any>(key: string, defaultValue?: T): T {
    const parts = key.split(this.options.separator)
    let current: any = this.config
    for (const part of parts) {
      if (current === undefined || current === null) return defaultValue as T
      current = current[part]
    }
    return (current !== undefined ? current : defaultValue) as T
  }

  /**
   * 设置配置值
   */
  set(key: string, value: any, source: ConfigSource = 'set'): void {
    const oldValue = this.get(key)
    const parts = key.split(this.options.separator)
    let current: any = this.config
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {}
      }
      current = current[parts[i]]
    }
    current[parts[parts.length - 1]] = value
    this.notify({ key, oldValue, newValue: value, source })
  }

  /**
   * 检查配置是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  /**
   * 深度合并配置
   */
  merge(partial: Record<string, any>, source: ConfigSource = 'merge'): void {
    const old = this.deepClone(this.config)
    this.deepMerge(this.config, partial)
    this.notify({ key: '*', oldValue: old, newValue: this.config, source })
  }

  /**
   * 获取整个配置快照
   */
  getAll(): Record<string, any> {
    return this.deepClone(this.config)
  }

  /**
   * 重置为初始配置
   */
  reset(): void {
    this.config = this.deepClone(this.options.initial)
    this.notify({ key: '*', oldValue: undefined, newValue: this.config, source: 'initial' })
  }

  /**
   * 监听配置变更
   */
  onChange(handler: ChangeHandler): () => void {
    this.listeners.add(handler)
    return () => this.listeners.delete(handler)
  }

  /**
   * 从远程加载配置
   */
  async loadRemote(): Promise<void> {
    if (!this.options.remoteUrl) return
    const response = await fetch(this.options.remoteUrl)
    const remoteConfig = await response.json()
    const validation = this.options.validator(remoteConfig)
    if (validation === true) {
      this.merge(remoteConfig, 'remote')
    } else {
      throw new Error(typeof validation === 'string' ? validation : 'Remote config validation failed')
    }
  }

  /**
   * 启动远程配置轮询
   */
  startPolling(): void {
    if (this.options.pollInterval <= 0 || !this.options.remoteUrl) return
    this.pollTimer = setInterval(() => this.loadRemote().catch(() => {}), this.options.pollInterval)
  }

  /**
   * 停止轮询
   */
  stopPolling(): void {
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopPolling()
    this.listeners.clear()
  }

  private notify(event: ConfigChangeEvent): void {
    this.listeners.forEach(h => h(event))
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }

  private deepMerge(target: any, source: any): void {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {}
        this.deepMerge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  }
}
`,
}

const configVue = {
  'src/index.ts': `export { useConfig } from './composables/useConfig'
export { createConfigPlugin, useConfigManager } from './plugin'
`,
  'src/composables/useConfig.ts': `import { ref, onUnmounted, inject } from 'vue'
import { ConfigManager } from '@ldesign/config-core'

/**
 * 配置 composable
 */
export function useConfig<T = any>(key: string, defaultValue?: T) {
  const manager = inject<ConfigManager>('ldesign-config') || new ConfigManager()
  const value = ref(manager.get<T>(key, defaultValue as T))

  const unsub = manager.onChange((event) => {
    if (event.key === key || event.key === '*') {
      value.value = manager.get<T>(key, defaultValue as T)
    }
  })

  onUnmounted(() => unsub())

  function set(newValue: T) {
    manager.set(key, newValue)
    value.value = newValue as any
  }

  return { value, set }
}
`,
  'src/plugin.ts': `import type { App } from 'vue'
import { inject } from 'vue'
import { ConfigManager } from '@ldesign/config-core'
import type { ConfigOptions } from '@ldesign/config-core'

export function createConfigPlugin(options?: ConfigOptions) {
  const manager = new ConfigManager(options)
  return {
    install(app: App) {
      app.provide('ldesign-config', manager)
      app.config.globalProperties.$config = manager
    },
    manager,
  }
}

export function useConfigManager(): ConfigManager {
  const manager = inject<ConfigManager>('ldesign-config')
  if (!manager) throw new Error('ConfigManager not provided. Use createConfigPlugin().')
  return manager
}
`,
}

// =====================================================================
// 6. @ldesign/theme (integrates color & size concepts)
// =====================================================================
const themeCore = {
  'src/index.ts': `export { ThemeManager } from './manager'
export { createDesignTokens, defaultTokens } from './tokens'
export { generateCSSVariables, applyTheme } from './css-vars'
export type {
  ThemeConfig,
  ThemeMode,
  DesignTokens,
  ColorTokens,
  SizeTokens,
  SpacingTokens,
  RadiusTokens,
  ShadowTokens,
  TypographyTokens,
  ThemePreset,
  ThemeChangeEvent,
} from './types'
`,
  'src/types.ts': `export type ThemeMode = 'light' | 'dark' | 'auto'

export interface ColorTokens {
  primary: string
  primaryLight: string
  primaryDark: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  divider: string
}

export interface SizeTokens {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
}

export interface SpacingTokens {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export interface RadiusTokens {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

export interface ShadowTokens {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
}

export interface TypographyTokens {
  fontFamily: string
  fontFamilyMono: string
  fontSizeXs: string
  fontSizeSm: string
  fontSizeMd: string
  fontSizeLg: string
  fontSizeXl: string
  fontSize2xl: string
  fontWeightNormal: string
  fontWeightMedium: string
  fontWeightBold: string
  lineHeightTight: string
  lineHeightNormal: string
  lineHeightRelaxed: string
}

export interface DesignTokens {
  colors: ColorTokens
  sizes: SizeTokens
  spacing: SpacingTokens
  radius: RadiusTokens
  shadows: ShadowTokens
  typography: TypographyTokens
}

export interface ThemeConfig {
  mode: ThemeMode
  tokens: DesignTokens
  darkTokens?: Partial<DesignTokens>
}

export interface ThemePreset {
  name: string
  light: DesignTokens
  dark: Partial<DesignTokens>
}

export interface ThemeChangeEvent {
  mode: ThemeMode
  resolvedMode: 'light' | 'dark'
  tokens: DesignTokens
}
`,
  'src/tokens.ts': `import type { DesignTokens } from './types'

export const defaultTokens: DesignTokens = {
  colors: {
    primary: '#1677ff',
    primaryLight: '#4096ff',
    primaryDark: '#0958d9',
    secondary: '#722ed1',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1677ff',
    background: '#ffffff',
    surface: '#fafafa',
    text: '#1f1f1f',
    textSecondary: '#8c8c8c',
    border: '#d9d9d9',
    divider: '#f0f0f0',
  },
  sizes: { xs: '24px', sm: '32px', md: '40px', lg: '48px', xl: '56px' },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px' },
  radius: { none: '0', sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontFamilyMono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    fontSizeXs: '12px', fontSizeSm: '14px', fontSizeMd: '16px',
    fontSizeLg: '18px', fontSizeXl: '20px', fontSize2xl: '24px',
    fontWeightNormal: '400', fontWeightMedium: '500', fontWeightBold: '600',
    lineHeightTight: '1.25', lineHeightNormal: '1.5', lineHeightRelaxed: '1.75',
  },
}

export const defaultDarkOverrides: Partial<DesignTokens> = {
  colors: {
    primary: '#4096ff', primaryLight: '#69b1ff', primaryDark: '#1677ff',
    secondary: '#9254de', success: '#73d13d', warning: '#ffc53d',
    error: '#ff7875', info: '#4096ff',
    background: '#141414', surface: '#1f1f1f',
    text: '#ffffffd9', textSecondary: '#ffffff73',
    border: '#424242', divider: '#303030',
  },
}

/**
 * 创建设计令牌，可深度合并自定义值
 */
export function createDesignTokens(overrides?: Partial<DesignTokens>): DesignTokens {
  if (!overrides) return { ...defaultTokens }
  return deepMerge({ ...defaultTokens }, overrides) as DesignTokens
}

function deepMerge(target: any, source: any): any {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}
`,
  'src/css-vars.ts': `import type { DesignTokens } from './types'

/**
 * 将 DesignTokens 转换为 CSS 变量映射
 */
export function generateCSSVariables(tokens: DesignTokens, prefix = 'ld'): Record<string, string> {
  const vars: Record<string, string> = {}

  function flatten(obj: any, path: string) {
    for (const [key, value] of Object.entries(obj)) {
      const varName = path ? \`--\${path}-\${camelToKebab(key)}\` : \`--\${prefix}-\${camelToKebab(key)}\`
      if (typeof value === 'object' && value !== null) {
        flatten(value, path ? \`\${path}-\${camelToKebab(key)}\` : \`\${prefix}-\${camelToKebab(key)}\`)
      } else {
        vars[varName] = String(value)
      }
    }
  }

  flatten(tokens, '')
  return vars
}

/**
 * 将 CSS 变量应用到 DOM 元素
 */
export function applyTheme(tokens: DesignTokens, target?: HTMLElement, prefix?: string): void {
  const el = target || document.documentElement
  const vars = generateCSSVariables(tokens, prefix)
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value)
  }
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()
}
`,
  'src/manager.ts': `import type { ThemeConfig, ThemeMode, DesignTokens, ThemePreset, ThemeChangeEvent } from './types'
import { defaultTokens, defaultDarkOverrides, createDesignTokens } from './tokens'
import { applyTheme } from './css-vars'

type ThemeChangeHandler = (event: ThemeChangeEvent) => void

/**
 * 主题管理器 - 统一管理颜色、尺寸、暗黑模式等
 *
 * @example
 * const theme = new ThemeManager({ mode: 'auto' })
 * theme.apply() // 应用到 document.documentElement
 * theme.setMode('dark')
 * theme.onChange((e) => console.log(e.resolvedMode))
 */
export class ThemeManager {
  private config: ThemeConfig
  private resolvedMode: 'light' | 'dark' = 'light'
  private mediaQuery: MediaQueryList | null = null
  private listeners: Set<ThemeChangeHandler> = new Set()
  private presets = new Map<string, ThemePreset>()

  constructor(config?: Partial<ThemeConfig>) {
    this.config = {
      mode: config?.mode ?? 'light',
      tokens: config?.tokens ?? { ...defaultTokens },
      darkTokens: config?.darkTokens ?? defaultDarkOverrides,
    }
    this.resolveMode()
  }

  /**
   * 获取当前模式
   */
  getMode(): ThemeMode { return this.config.mode }

  /**
   * 获取解析后的模式（auto 会解析为 light/dark）
   */
  getResolvedMode(): 'light' | 'dark' { return this.resolvedMode }

  /**
   * 获取当前生效的 tokens
   */
  getTokens(): DesignTokens {
    if (this.resolvedMode === 'dark' && this.config.darkTokens) {
      return createDesignTokens({ ...this.config.tokens, ...this.config.darkTokens } as any)
    }
    return this.config.tokens
  }

  /**
   * 设置主题模式
   */
  setMode(mode: ThemeMode): void {
    this.config.mode = mode
    this.resolveMode()
    this.notify()
  }

  /**
   * 更新 tokens
   */
  setTokens(tokens: Partial<DesignTokens>): void {
    this.config.tokens = createDesignTokens({ ...this.config.tokens, ...tokens } as any)
    this.notify()
  }

  /**
   * 设置主色
   */
  setPrimaryColor(color: string): void {
    this.config.tokens.colors.primary = color
    this.notify()
  }

  /**
   * 注册主题预设
   */
  registerPreset(preset: ThemePreset): void {
    this.presets.set(preset.name, preset)
  }

  /**
   * 应用预设
   */
  applyPreset(name: string): void {
    const preset = this.presets.get(name)
    if (!preset) throw new Error(\`Theme preset "\${name}" not found\`)
    this.config.tokens = { ...preset.light }
    this.config.darkTokens = preset.dark
    this.notify()
  }

  /**
   * 将主题应用到 DOM
   */
  apply(target?: HTMLElement): void {
    const tokens = this.getTokens()
    applyTheme(tokens, target)
    const el = target || document.documentElement
    el.setAttribute('data-theme', this.resolvedMode)
    el.classList.remove('light', 'dark')
    el.classList.add(this.resolvedMode)
  }

  /**
   * 监听主题变更
   */
  onChange(handler: ThemeChangeHandler): () => void {
    this.listeners.add(handler)
    return () => this.listeners.delete(handler)
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.listeners.clear()
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleMediaChange)
    }
  }

  private resolveMode(): void {
    if (this.config.mode === 'auto') {
      if (typeof window !== 'undefined') {
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        this.resolvedMode = this.mediaQuery.matches ? 'dark' : 'light'
        this.mediaQuery.addEventListener('change', this.handleMediaChange)
      } else {
        this.resolvedMode = 'light'
      }
    } else {
      this.resolvedMode = this.config.mode
    }
  }

  private handleMediaChange = (e: MediaQueryListEvent): void => {
    this.resolvedMode = e.matches ? 'dark' : 'light'
    this.notify()
  }

  private notify(): void {
    const event: ThemeChangeEvent = {
      mode: this.config.mode,
      resolvedMode: this.resolvedMode,
      tokens: this.getTokens(),
    }
    this.listeners.forEach(h => h(event))
  }
}
`,
}

const themeVue = {
  'src/index.ts': `export { useTheme } from './composables/useTheme'
export { useThemeMode } from './composables/useThemeMode'
export { useDesignTokens } from './composables/useDesignTokens'
export { createThemePlugin, useThemeManager } from './plugin'
`,
  'src/composables/useTheme.ts': `import { ref, computed, onUnmounted, inject, watchEffect } from 'vue'
import { ThemeManager } from '@ldesign/theme-core'
import type { ThemeMode, DesignTokens } from '@ldesign/theme-core'

/**
 * 主题 composable - 响应式主题管理
 */
export function useTheme(config?: { mode?: ThemeMode; autoApply?: boolean }) {
  const injected = inject<ThemeManager>('ldesign-theme', undefined)
  const manager = injected || new ThemeManager({ mode: config?.mode ?? 'light' })

  const mode = ref<ThemeMode>(manager.getMode())
  const resolvedMode = ref(manager.getResolvedMode())
  const tokens = ref(manager.getTokens())
  const isDark = computed(() => resolvedMode.value === 'dark')

  const unsub = manager.onChange((event) => {
    mode.value = event.mode
    resolvedMode.value = event.resolvedMode
    tokens.value = event.tokens
  })

  function setMode(newMode: ThemeMode) {
    manager.setMode(newMode)
  }

  function toggleMode() {
    setMode(resolvedMode.value === 'light' ? 'dark' : 'light')
  }

  function setPrimaryColor(color: string) {
    manager.setPrimaryColor(color)
  }

  function setTokens(partial: Partial<DesignTokens>) {
    manager.setTokens(partial)
  }

  // 自动应用到 DOM
  if (config?.autoApply !== false) {
    watchEffect(() => { manager.apply() })
  }

  onUnmounted(() => unsub())

  return { mode, resolvedMode, tokens, isDark, setMode, toggleMode, setPrimaryColor, setTokens, manager }
}
`,
  'src/composables/useThemeMode.ts': `import { ref, onMounted, onUnmounted } from 'vue'
import type { ThemeMode } from '@ldesign/theme-core'

/**
 * 轻量级主题模式 composable（不需要完整 ThemeManager）
 */
export function useThemeMode(initialMode: ThemeMode = 'auto') {
  const mode = ref<ThemeMode>(initialMode)
  const resolvedMode = ref<'light' | 'dark'>('light')
  let mediaQuery: MediaQueryList | null = null

  function resolve() {
    if (mode.value === 'auto') {
      resolvedMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      resolvedMode.value = mode.value
    }
    document.documentElement.setAttribute('data-theme', resolvedMode.value)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolvedMode.value)
  }

  function setMode(newMode: ThemeMode) {
    mode.value = newMode
    resolve()
  }

  function toggle() {
    setMode(resolvedMode.value === 'light' ? 'dark' : 'light')
  }

  onMounted(() => {
    resolve()
    if (mode.value === 'auto') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', resolve)
    }
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', resolve)
  })

  return { mode, resolvedMode, setMode, toggle, isDark: () => resolvedMode.value === 'dark' }
}
`,
  'src/composables/useDesignTokens.ts': `import { inject, computed } from 'vue'
import { ThemeManager, defaultTokens } from '@ldesign/theme-core'
import type { DesignTokens } from '@ldesign/theme-core'

/**
 * 获取当前设计令牌
 */
export function useDesignTokens() {
  const manager = inject<ThemeManager>('ldesign-theme', undefined)

  const tokens = computed<DesignTokens>(() => {
    return manager?.getTokens() ?? defaultTokens
  })

  const colors = computed(() => tokens.value.colors)
  const sizes = computed(() => tokens.value.sizes)
  const spacing = computed(() => tokens.value.spacing)
  const radius = computed(() => tokens.value.radius)
  const shadows = computed(() => tokens.value.shadows)
  const typography = computed(() => tokens.value.typography)

  return { tokens, colors, sizes, spacing, radius, shadows, typography }
}
`,
  'src/plugin.ts': `import type { App } from 'vue'
import { inject } from 'vue'
import { ThemeManager } from '@ldesign/theme-core'
import type { ThemeConfig } from '@ldesign/theme-core'

export function createThemePlugin(config?: Partial<ThemeConfig>) {
  const manager = new ThemeManager(config)
  return {
    install(app: App) {
      app.provide('ldesign-theme', manager)
      app.config.globalProperties.$theme = manager
      // 安装时自动应用
      if (typeof document !== 'undefined') manager.apply()
    },
    manager,
  }
}

export function useThemeManager(): ThemeManager {
  const manager = inject<ThemeManager>('ldesign-theme')
  if (!manager) throw new Error('ThemeManager not provided. Use createThemePlugin().')
  return manager
}
`,
}

// =====================================================================
// Playground App.vue files
// =====================================================================
const playgrounds = {
  validate: `<script setup lang="ts">
import { ref } from 'vue'
import { useFormValidation } from '@ldesign/validate-vue'

const form = ref({
  username: '',
  email: '',
  age: '',
})

const { errors, isValid, isValidating, validate, reset, handleSubmit } = useFormValidation(
  form,
  {
    username: { label: '用户名', required: true, min: 3, max: 20 },
    email: { label: '邮箱', required: true, type: 'email' },
    age: { label: '年龄', type: 'number', min: 18, max: 120 },
  },
  { immediate: false },
)

function onSubmit() {
  handleSubmit(
    (data) => alert('提交成功: ' + JSON.stringify(data)),
    (errs) => console.log('校验失败', errs),
  )
}
</script>

<template>
  <div style="max-width: 480px; margin: 40px auto; font-family: sans-serif;">
    <h1>@ldesign/validate Playground</h1>

    <div style="margin-bottom: 16px;">
      <label>用户名</label>
      <input v-model="form.username" placeholder="3-20 个字符" style="display:block;width:100%;padding:8px;margin-top:4px;" />
      <span v-if="errors.username?.length" style="color:red;font-size:12px;">{{ errors.username[0] }}</span>
    </div>

    <div style="margin-bottom: 16px;">
      <label>邮箱</label>
      <input v-model="form.email" placeholder="your@email.com" style="display:block;width:100%;padding:8px;margin-top:4px;" />
      <span v-if="errors.email?.length" style="color:red;font-size:12px;">{{ errors.email[0] }}</span>
    </div>

    <div style="margin-bottom: 16px;">
      <label>年龄</label>
      <input v-model="form.age" type="number" placeholder=">=18" style="display:block;width:100%;padding:8px;margin-top:4px;" />
      <span v-if="errors.age?.length" style="color:red;font-size:12px;">{{ errors.age[0] }}</span>
    </div>

    <button @click="onSubmit" :disabled="isValidating" style="padding:8px 24px;margin-right:8px;">提交</button>
    <button @click="reset" style="padding:8px 24px;">重置</button>

    <p style="margin-top:16px;color:#888;">
      状态: {{ isValid ? '✅ 有效' : '❌ 无效' }} {{ isValidating ? '(校验中...)' : '' }}
    </p>
  </div>
</template>
`,
  event: `<script setup lang="ts">
import { ref } from 'vue'
import { useEventBus } from '@ldesign/event-vue'

type Events = {
  'message:send': { text: string; time: string }
  'counter:increment': number
}

const { on, emit } = useEventBus<Events>()

const messages = ref<Array<{ text: string; time: string }>>([])
const counter = ref(0)
const input = ref('')

on('message:send', (data) => {
  messages.value.push(data)
})

on('counter:increment', (val) => {
  counter.value += val
})

function sendMessage() {
  if (!input.value.trim()) return
  emit('message:send', { text: input.value, time: new Date().toLocaleTimeString() })
  input.value = ''
}
</script>

<template>
  <div style="max-width: 600px; margin: 40px auto; font-family: sans-serif;">
    <h1>@ldesign/event Playground</h1>

    <section style="margin-bottom: 24px;">
      <h2>消息事件</h2>
      <div style="display:flex;gap:8px;">
        <input v-model="input" @keyup.enter="sendMessage" placeholder="输入消息..." style="flex:1;padding:8px;" />
        <button @click="sendMessage" style="padding:8px 16px;">发送</button>
      </div>
      <ul style="margin-top:12px;">
        <li v-for="(msg, i) in messages" :key="i">[{{ msg.time }}] {{ msg.text }}</li>
      </ul>
    </section>

    <section>
      <h2>计数器事件</h2>
      <p>当前值: <strong>{{ counter }}</strong></p>
      <button @click="emit('counter:increment', 1)" style="padding:8px 16px;margin-right:8px;">+1</button>
      <button @click="emit('counter:increment', 5)" style="padding:8px 16px;margin-right:8px;">+5</button>
      <button @click="emit('counter:increment', -1)" style="padding:8px 16px;">-1</button>
    </section>
  </div>
</template>
`,
  storage: `<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLocalStorage, useSessionStorage } from '@ldesign/storage-vue'

const username = useLocalStorage('demo-username', '')
const theme = useLocalStorage('demo-theme', 'light')
const sessionCount = useSessionStorage('demo-count', 0)

function increment() { sessionCount.value++ }
function toggleTheme() { theme.value = theme.value === 'light' ? 'dark' : 'light' }
function clearAll() { username.value = ''; theme.value = 'light'; sessionCount.value = 0 }
</script>

<template>
  <div style="max-width: 480px; margin: 40px auto; font-family: sans-serif;">
    <h1>@ldesign/storage Playground</h1>

    <section style="margin-bottom: 24px;">
      <h2>LocalStorage (持久)</h2>
      <div style="margin-bottom: 12px;">
        <label>用户名: </label>
        <input v-model="username" placeholder="输入用户名" style="padding:8px;" />
        <span style="margin-left:8px;color:#888;">刷新页面后仍保留</span>
      </div>
      <div>
        <label>主题: {{ theme }} </label>
        <button @click="toggleTheme" style="padding:4px 12px;margin-left:8px;">切换</button>
      </div>
    </section>

    <section style="margin-bottom: 24px;">
      <h2>SessionStorage (会话)</h2>
      <p>访问次数: <strong>{{ sessionCount }}</strong></p>
      <button @click="increment" style="padding:8px 16px;">+1</button>
      <span style="margin-left:8px;color:#888;">关闭标签页后重置</span>
    </section>

    <button @click="clearAll" style="padding:8px 16px;">清除全部</button>
  </div>
</template>
`,
  websocket: `<script setup lang="ts">
import { ref } from 'vue'
import { useWebSocket } from '@ldesign/websocket-vue'

const url = ref('wss://echo.websocket.org')
const input = ref('')
const logs = ref<string[]>([])

const { state, connect, disconnect, send, on } = useWebSocket({
  url: url.value,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectInterval: 2000,
})

on('__raw__', (data: any) => {
  logs.value.push('[收到] ' + String(data))
})

function sendMessage() {
  if (!input.value.trim()) return
  logs.value.push('[发送] ' + input.value)
  send('message', { text: input.value })
  input.value = ''
}
</script>

<template>
  <div style="max-width: 600px; margin: 40px auto; font-family: sans-serif;">
    <h1>@ldesign/websocket Playground</h1>

    <div style="margin-bottom: 16px;">
      <span :style="{ color: state === 'connected' ? 'green' : state === 'reconnecting' ? 'orange' : 'red' }">
        ● {{ state }}
      </span>
      <button @click="connect" style="margin-left:12px;padding:4px 12px;">连接</button>
      <button @click="disconnect" style="margin-left:4px;padding:4px 12px;">断开</button>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:16px;">
      <input v-model="input" @keyup.enter="sendMessage" placeholder="发送消息..." style="flex:1;padding:8px;" />
      <button @click="sendMessage" style="padding:8px 16px;" :disabled="state !== 'connected'">发送</button>
    </div>

    <div style="border:1px solid #ddd;padding:12px;max-height:300px;overflow-y:auto;font-family:monospace;font-size:13px;">
      <div v-for="(log, i) in logs" :key="i">{{ log }}</div>
      <div v-if="!logs.length" style="color:#999;">暂无消息</div>
    </div>
  </div>
</template>
`,
  config: `<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ConfigManager } from '@ldesign/config-core'
import { useConfig } from '@ldesign/config-vue'

const manager = new ConfigManager({
  initial: {
    app: { title: 'LDesign Demo', version: '1.0.0', debug: false },
    api: { baseUrl: 'https://api.example.com', timeout: 5000 },
    ui: { theme: 'light', language: 'zh-CN' },
  },
})

// 手动注入（playground 中无 plugin）
import { provide } from 'vue'
provide('ldesign-config', manager)

const configSnapshot = ref(JSON.stringify(manager.getAll(), null, 2))
const editKey = ref('app.title')
const editValue = ref('')

manager.onChange(() => {
  configSnapshot.value = JSON.stringify(manager.getAll(), null, 2)
})

function updateConfig() {
  let val: any = editValue.value
  try { val = JSON.parse(val) } catch {}
  manager.set(editKey.value, val)
  editValue.value = ''
}
</script>

<template>
  <div style="max-width: 600px; margin: 40px auto; font-family: sans-serif;">
    <h1>@ldesign/config Playground</h1>

    <section style="margin-bottom: 24px;">
      <h2>修改配置</h2>
      <div style="display:flex;gap:8px;margin-bottom:8px;">
        <input v-model="editKey" placeholder="键名 (如 app.title)" style="flex:1;padding:8px;" />
        <input v-model="editValue" placeholder="新值" style="flex:1;padding:8px;" />
        <button @click="updateConfig" style="padding:8px 16px;">设置</button>
      </div>
      <button @click="manager.reset()" style="padding:4px 12px;">重置</button>
    </section>

    <section>
      <h2>当前配置</h2>
      <pre style="background:#f5f5f5;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;">{{ configSnapshot }}</pre>
    </section>
  </div>
</template>
`,
  theme: `<script setup lang="ts">
import { provide } from 'vue'
import { ThemeManager } from '@ldesign/theme-core'
import { useTheme } from '@ldesign/theme-vue'

const manager = new ThemeManager({ mode: 'light' })
provide('ldesign-theme', manager)

const { mode, resolvedMode, isDark, tokens, setMode, toggleMode, setPrimaryColor } = useTheme({ autoApply: true })

const colors = ['#1677ff', '#722ed1', '#13c2c2', '#52c41a', '#fa541c', '#eb2f96']
</script>

<template>
  <div style="max-width: 600px; margin: 40px auto; font-family: sans-serif; transition: all 0.3s;"
       :style="{ background: tokens.colors.background, color: tokens.colors.text }">
    <h1>@ldesign/theme Playground</h1>

    <section style="margin-bottom: 24px;">
      <h2>主题模式</h2>
      <p>当前: <strong>{{ mode }}</strong> (解析为: {{ resolvedMode }}) {{ isDark ? '🌙' : '☀️' }}</p>
      <button @click="setMode('light')" style="padding:8px 16px;margin-right:8px;">Light</button>
      <button @click="setMode('dark')" style="padding:8px 16px;margin-right:8px;">Dark</button>
      <button @click="setMode('auto')" style="padding:8px 16px;margin-right:8px;">Auto</button>
      <button @click="toggleMode" style="padding:8px 16px;">Toggle</button>
    </section>

    <section style="margin-bottom: 24px;">
      <h2>主色调</h2>
      <div style="display:flex;gap:8px;">
        <button v-for="c in colors" :key="c" @click="setPrimaryColor(c)"
          :style="{ width:'36px',height:'36px',borderRadius:'50%',background:c,border: tokens.colors.primary === c ? '3px solid #333' : '2px solid #ddd',cursor:'pointer' }" />
      </div>
      <p style="margin-top:8px;">Primary: <code>{{ tokens.colors.primary }}</code></p>
    </section>

    <section style="margin-bottom: 24px;">
      <h2>设计令牌预览</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <div v-for="(val, key) in tokens.colors" :key="key"
          :style="{ width:'60px',height:'40px',background:val,borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color: key.includes('background') || key.includes('surface') || key.includes('divider') ? '#333' : '#fff' }">
          {{ key }}
        </div>
      </div>
    </section>

    <section>
      <h2>间距 &amp; 圆角</h2>
      <div style="display:flex;gap:12px;align-items:flex-end;">
        <div v-for="(val, key) in tokens.spacing" :key="key"
          :style="{ width:val,height:val,background:tokens.colors.primary,borderRadius:tokens.radius.md }">
        </div>
      </div>
      <p style="font-size:12px;color:#999;margin-top:8px;">尺寸: xs → 2xl</p>
    </section>
  </div>
</template>
`,
}

// =====================================================================
// Write all files
// =====================================================================
function writePackageSrc(pkgName, coreFiles, vueFiles, playgroundApp) {
  const d = path.join(base, pkgName)

  // Core src
  for (const [file, content] of Object.entries(coreFiles)) {
    w(path.join(d, 'packages/core', file), content)
  }

  // Vue src
  for (const [file, content] of Object.entries(vueFiles)) {
    w(path.join(d, 'packages/vue', file), content)
  }

  // Playground App.vue
  w(path.join(d, 'playground/src/App.vue'), playgroundApp)

  console.log(`✅ ${pkgName}`)
}

writePackageSrc('validate', validateCore, validateVue, playgrounds.validate)
writePackageSrc('event', eventCore, eventVue, playgrounds.event)
writePackageSrc('storage', storageCore, storageVue, playgrounds.storage)
writePackageSrc('websocket', websocketCore, websocketVue, playgrounds.websocket)
writePackageSrc('config', configCore, configVue, playgrounds.config)
writePackageSrc('theme', themeCore, themeVue, playgrounds.theme)

console.log('\n🎉 All source files generated!')
