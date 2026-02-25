/**
 * 重新生成 6 个新包的 core/src 和 vue/src 代码
 * 统一目录结构：types/, core/, engine/, [功能域]/
 * 添加 Engine 插件支持
 */
const fs = require('fs')
const path = require('path')
const base = path.join(__dirname, '..', 'packages')

function w(f, c) {
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, c.replace(/\r\n/g, '\n'), 'utf8')
  return f
}

function corePath(pkg, ...parts) { return path.join(base, pkg, 'packages/core/src', ...parts) }
function vuePath(pkg, ...parts) { return path.join(base, pkg, 'packages/vue/src', ...parts) }

// =====================================================================
// Engine Plugin 通用模板
// =====================================================================
function enginePlugin(name, version, stateSetup, uninstallCleanup) {
  return `/**
 * @ldesign/${name} Engine 插件
 *
 * 支持通过 engine.use() 方式接入 LDesign Engine 插件系统
 *
 * @example
 * \`\`\`typescript
 * import { create${capitalize(name)}EnginePlugin } from '@ldesign/${name}-core'
 *
 * await engine.use(create${capitalize(name)}EnginePlugin({
 *   // options
 * }))
 * \`\`\`
 */

import type { ${capitalize(name)}EnginePluginOptions } from './types'

/**
 * ${capitalize(name)} 插件的 StateKeys
 */
export const ${name}StateKeys = {
  ${stateSetup.stateKeys}
} as const

/**
 * ${capitalize(name)} 插件的 EventKeys
 */
export const ${name}EventKeys = {
  INSTALLED: '${name}:installed' as const,
  UNINSTALLED: '${name}:uninstalled' as const,
  ${stateSetup.eventKeys}
} as const

${stateSetup.importLine}

export function create${capitalize(name)}EnginePlugin(
  options: ${capitalize(name)}EnginePluginOptions = {},
) {
  return {
    name: '${name}',
    version: '${version}',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context

${stateSetup.installBody}

      // 发送安装事件
      engine.events?.emit(${name}EventKeys.INSTALLED, { name: '${name}' })

      if (engine.logger) {
        engine.logger.info(\`[${capitalize(name)} Plugin] installed successfully\`)
      }
    },

    async uninstall(context: any) {
      const engine = context.engine || context

${uninstallCleanup}

      engine.events?.emit(${name}EventKeys.UNINSTALLED, {})

      if (engine.logger) {
        engine.logger.info(\`[${capitalize(name)} Plugin] uninstalled\`)
      }
    },
  }
}
`
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

// =====================================================================
// 1. @ldesign/validate - Core
// =====================================================================
function genValidateCore() {
  const pkg = 'validate'

  // types/index.ts
  w(corePath(pkg, 'types/index.ts'), `/**
 * @ldesign/validate-core 类型定义
 */

/** 校验规则 */
export interface ValidationRule<T = any> {
  name: string
  message: string | ((field: string, value: T, param?: any) => string)
  validate?: (value: T, param?: any) => boolean
  validateAsync?: (value: T, param?: any) => Promise<boolean>
  param?: any
}

/** 字段校验配置 */
export interface FieldRules<T = any> {
  field: string
  label?: string
  rules: ValidationRule<T>[]
}

/** 校验结果 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/** 校验错误 */
export interface ValidationError {
  field: string
  rule: string
  message: string
}

/** Schema 字段定义 */
export interface SchemaField {
  label?: string
  required?: boolean | string
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url'
  min?: number
  max?: number
  pattern?: RegExp | string
  custom?: (value: any) => boolean | string | Promise<boolean | string>
  message?: string
}

export type SchemaDefinition = Record<string, SchemaField>

export interface ValidateOptions {
  firstError?: boolean
  skipEmpty?: boolean
}
`)

  // rules/built-in.ts
  w(corePath(pkg, 'rules/built-in.ts'), `import type { ValidationRule } from '../types'

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
`)

  // rules/custom.ts
  w(corePath(pkg, 'rules/custom.ts'), `import type { ValidationRule } from '../types'

/** 自定义同步校验 */
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

/** 异步校验（如远程唯一性检查） */
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
`)

  // rules/index.ts
  w(corePath(pkg, 'rules/index.ts'), `export { required, min, max, email, url, pattern } from './built-in'
export { custom, asyncRule } from './custom'
`)

  // core/validator.ts
  w(corePath(pkg, 'core/validator.ts'), `import type { ValidationRule, ValidationResult, ValidationError, FieldRules, ValidateOptions } from '../types'

/**
 * 校验器 - 执行字段级别的校验
 */
export class Validator {
  private fieldRulesMap = new Map<string, FieldRules>()

  addField(field: string, rules: ValidationRule[], label?: string): this {
    this.fieldRulesMap.set(field, { field, label: label || field, rules })
    return this
  }

  removeField(field: string): this {
    this.fieldRulesMap.delete(field)
    return this
  }

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
`)

  // core/schema.ts
  w(corePath(pkg, 'core/schema.ts'), `import type { SchemaDefinition, SchemaField, ValidationResult, ValidationError } from '../types'
import { Validator } from './validator'
import { required, min, max, email, url, pattern } from '../rules'

/**
 * Schema - 声明式校验模式
 */
export class Schema {
  private definition: SchemaDefinition

  constructor(definition: SchemaDefinition) {
    this.definition = definition
  }

  async validate(data: Record<string, any>): Promise<ValidationResult> {
    const validator = new Validator()
    for (const [field, schema] of Object.entries(this.definition)) {
      validator.addField(field, this.buildRules(schema), schema.label || field)
    }
    return validator.validate(data)
  }

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
      rules.push(required(typeof schema.required === 'string' ? schema.required : undefined))
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
        validateAsync: async (value) => {
          const result = await customFn(value)
          return typeof result === 'string' ? false : result
        },
      })
    }
    return rules
  }
}
`)

  // core/validation-engine.ts
  w(corePath(pkg, 'core/validation-engine.ts'), `import type { SchemaDefinition, ValidationResult } from '../types'
import { Schema } from './schema'
import { Validator } from './validator'

/**
 * ValidationEngine - 校验引擎（高级 API）
 * 提供全局规则注册、schema 缓存、校验中间件
 */
export class ValidationEngine {
  private schemas = new Map<string, Schema>()
  private middlewares: Array<(data: any, result: ValidationResult) => ValidationResult> = []

  registerSchema(name: string, definition: SchemaDefinition): this {
    this.schemas.set(name, new Schema(definition))
    return this
  }

  removeSchema(name: string): this {
    this.schemas.delete(name)
    return this
  }

  async validateBySchema(name: string, data: Record<string, any>): Promise<ValidationResult> {
    const schema = this.schemas.get(name)
    if (!schema) {
      return { valid: false, errors: [{ field: '', rule: 'schema', message: \`Schema "\${name}" 未注册\` }] }
    }
    return this.applyMiddlewares(data, await schema.validate(data))
  }

  async validate(definition: SchemaDefinition, data: Record<string, any>): Promise<ValidationResult> {
    const schema = new Schema(definition)
    return this.applyMiddlewares(data, await schema.validate(data))
  }

  createValidator(): Validator {
    return new Validator()
  }

  use(middleware: (data: any, result: ValidationResult) => ValidationResult): this {
    this.middlewares.push(middleware)
    return this
  }

  destroy(): void {
    this.schemas.clear()
    this.middlewares.length = 0
  }

  private applyMiddlewares(data: any, result: ValidationResult): ValidationResult {
    return this.middlewares.reduce((r, mw) => mw(data, r), result)
  }
}
`)

  // core/index.ts
  w(corePath(pkg, 'core/index.ts'), `export { Validator } from './validator'
export { Schema } from './schema'
export { ValidationEngine } from './validation-engine'
`)

  // engine/types.ts
  w(corePath(pkg, 'engine/types.ts'), `import type { SchemaDefinition } from '../types'

export interface ValidateEnginePluginOptions {
  /** 预注册的 Schema 定义 */
  schemas?: Record<string, SchemaDefinition>
  /** 插件依赖 */
  dependencies?: string[]
}
`)

  // engine/plugin.ts
  w(corePath(pkg, 'engine/plugin.ts'), `/**
 * @ldesign/validate Engine 插件
 */
import type { ValidateEnginePluginOptions } from './types'
import { ValidationEngine } from '../core/validation-engine'

export const validateStateKeys = {
  ENGINE: 'validate:engine' as const,
} as const

export const validateEventKeys = {
  INSTALLED: 'validate:installed' as const,
  UNINSTALLED: 'validate:uninstalled' as const,
  VALIDATED: 'validate:validated' as const,
} as const

export function createValidateEnginePlugin(options: ValidateEnginePluginOptions = {}) {
  let engine_instance: ValidationEngine | null = null

  return {
    name: 'validate',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context
      engine_instance = new ValidationEngine()

      // 预注册 schemas
      if (options.schemas) {
        for (const [name, def] of Object.entries(options.schemas)) {
          engine_instance.registerSchema(name, def)
        }
      }

      engine.state?.set(validateStateKeys.ENGINE, engine_instance)
      engine.events?.emit(validateEventKeys.INSTALLED, { name: 'validate' })
      engine.logger?.info('[Validate Plugin] installed successfully')
    },

    async uninstall(context: any) {
      const engine = context.engine || context
      engine_instance?.destroy()
      engine_instance = null
      engine.state?.delete(validateStateKeys.ENGINE)
      engine.events?.emit(validateEventKeys.UNINSTALLED, {})
      engine.logger?.info('[Validate Plugin] uninstalled')
    },
  }
}
`)

  // engine/index.ts
  w(corePath(pkg, 'engine/index.ts'), `export { createValidateEnginePlugin, validateStateKeys, validateEventKeys } from './plugin'
export type { ValidateEnginePluginOptions } from './types'
`)

  // main index.ts
  w(corePath(pkg, 'index.ts'), `// Types
export type * from './types'

// Rules
export { required, min, max, email, url, pattern } from './rules/built-in'
export { custom, asyncRule } from './rules/custom'

// Core
export { Validator } from './core/validator'
export { Schema } from './core/schema'
export { ValidationEngine } from './core/validation-engine'

// Engine Plugin
export { createValidateEnginePlugin, validateStateKeys, validateEventKeys } from './engine'
export type { ValidateEnginePluginOptions } from './engine'
`)
  console.log('✅ validate/core')
}

// =====================================================================
// 2. @ldesign/event - Core
// =====================================================================
function genEventCore() {
  const pkg = 'event'

  w(corePath(pkg, 'types/index.ts'), `export type EventHandler<T = any> = (payload: T) => void | Promise<void>
export type EventMap = Record<string, any>

export interface EventBusOptions {
  maxHistory?: number
  wildcard?: boolean
  separator?: string
}

export interface EventRecord<T = any> {
  event: string
  payload: T
  timestamp: number
}

export type Unsubscribe = () => void
`)

  w(corePath(pkg, 'core/event-bus.ts'), `import type { EventHandler, EventBusOptions, EventRecord, Unsubscribe } from '../types'

/**
 * 类型安全的事件总线
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

  on<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler as EventHandler)
    return () => this.off(event, handler)
  }

  once<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    if (!this.onceHandlers.has(event)) this.onceHandlers.set(event, new Set())
    this.onceHandlers.get(event)!.add(handler as EventHandler)
    return () => this.onceHandlers.get(event)?.delete(handler as EventHandler)
  }

  off<K extends keyof Events & string>(event: K, handler?: EventHandler<Events[K]>): void {
    if (!handler) {
      this.handlers.delete(event)
      this.onceHandlers.delete(event)
    } else {
      this.handlers.get(event)?.delete(handler as EventHandler)
      this.onceHandlers.get(event)?.delete(handler as EventHandler)
    }
  }

  async emit<K extends keyof Events & string>(event: K, payload?: Events[K]): Promise<void> {
    this.addHistory(event, payload)

    const handlers = this.handlers.get(event)
    if (handlers) for (const h of handlers) await h(payload)

    const onceSet = this.onceHandlers.get(event)
    if (onceSet) {
      for (const h of onceSet) await h(payload)
      this.onceHandlers.delete(event)
    }

    if (this.options.wildcard) {
      for (const [pat, hs] of this.handlers) {
        if (pat.includes('*') && this.matchWildcard(pat, event)) {
          for (const h of hs) await h(payload)
        }
      }
    }
  }

  getHistory(event?: string): EventRecord[] {
    return event ? this.history.filter(r => r.event === event) : [...this.history]
  }

  clearHistory(): void { this.history = [] }

  async replay(event?: string): Promise<void> {
    for (const r of (event ? this.getHistory(event) : this.history)) {
      await this.emit(r.event as any, r.payload)
    }
  }

  listenerCount(event: string): number {
    return (this.handlers.get(event)?.size ?? 0) + (this.onceHandlers.get(event)?.size ?? 0)
  }

  clear(): void { this.handlers.clear(); this.onceHandlers.clear() }
  destroy(): void { this.clear(); this.clearHistory() }

  private addHistory(event: string, payload: any): void {
    this.history.push({ event, payload, timestamp: Date.now() })
    if (this.history.length > this.options.maxHistory) this.history.shift()
  }

  private matchWildcard(pattern: string, event: string): boolean {
    const sep = this.options.separator
    const pp = pattern.split(sep), ep = event.split(sep)
    for (let i = 0; i < pp.length; i++) {
      if (pp[i] === '**') return true
      if (pp[i] === '*') { if (i === pp.length - 1 && i === ep.length - 1) return true; continue }
      if (pp[i] !== ep[i]) return false
    }
    return pp.length === ep.length
  }
}
`)

  w(corePath(pkg, 'core/index.ts'), `export { EventBus } from './event-bus'\n`)

  // engine
  w(corePath(pkg, 'engine/types.ts'), `import type { EventBusOptions } from '../types'

export interface EventEnginePluginOptions extends EventBusOptions {
  dependencies?: string[]
}
`)

  w(corePath(pkg, 'engine/plugin.ts'), `import type { EventEnginePluginOptions } from './types'
import { EventBus } from '../core/event-bus'

export const eventStateKeys = {
  BUS: 'event:bus' as const,
} as const

export const eventEventKeys = {
  INSTALLED: 'event:installed' as const,
  UNINSTALLED: 'event:uninstalled' as const,
} as const

export function createEventEnginePlugin(options: EventEnginePluginOptions = {}) {
  let bus: EventBus | null = null

  return {
    name: 'event',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context
      bus = new EventBus(options)
      engine.state?.set(eventStateKeys.BUS, bus)
      engine.events?.emit(eventEventKeys.INSTALLED, { name: 'event' })
      engine.logger?.info('[Event Plugin] installed')
    },

    async uninstall(context: any) {
      const engine = context.engine || context
      bus?.destroy()
      bus = null
      engine.state?.delete(eventStateKeys.BUS)
      engine.events?.emit(eventEventKeys.UNINSTALLED, {})
    },
  }
}
`)

  w(corePath(pkg, 'engine/index.ts'), `export { createEventEnginePlugin, eventStateKeys, eventEventKeys } from './plugin'
export type { EventEnginePluginOptions } from './types'
`)

  w(corePath(pkg, 'index.ts'), `export type * from './types'
export { EventBus } from './core/event-bus'
export { createEventEnginePlugin, eventStateKeys, eventEventKeys } from './engine'
export type { EventEnginePluginOptions } from './engine'
`)
  console.log('✅ event/core')
}

// =====================================================================
// 3. @ldesign/storage - Core
// =====================================================================
function genStorageCore() {
  const pkg = 'storage'

  w(corePath(pkg, 'types/index.ts'), `export interface StorageAdapter {
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
  prefix?: string
  defaultTTL?: number
  serializer?: SerializerOptions
  version?: number
}

export interface SerializerOptions {
  serialize: (value: any) => string
  deserialize: (raw: string) => any
}
`)

  // adapters
  w(corePath(pkg, 'adapters/local.ts'), `import type { StorageAdapter } from '../types'

export class LocalStorageAdapter implements StorageAdapter {
  get(key: string): string | null { return localStorage.getItem(key) }
  set(key: string, value: string): void { localStorage.setItem(key, value) }
  remove(key: string): void { localStorage.removeItem(key) }
  clear(): void { localStorage.clear() }
  keys(): string[] {
    const r: string[] = []
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k) r.push(k) }
    return r
  }
  has(key: string): boolean { return localStorage.getItem(key) !== null }
}
`)

  w(corePath(pkg, 'adapters/session.ts'), `import type { StorageAdapter } from '../types'

export class SessionStorageAdapter implements StorageAdapter {
  get(key: string): string | null { return sessionStorage.getItem(key) }
  set(key: string, value: string): void { sessionStorage.setItem(key, value) }
  remove(key: string): void { sessionStorage.removeItem(key) }
  clear(): void { sessionStorage.clear() }
  keys(): string[] {
    const r: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); if (k) r.push(k) }
    return r
  }
  has(key: string): boolean { return sessionStorage.getItem(key) !== null }
}
`)

  w(corePath(pkg, 'adapters/memory.ts'), `import type { StorageAdapter } from '../types'

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>()
  get(key: string): string | null { return this.store.get(key) ?? null }
  set(key: string, value: string): void { this.store.set(key, value) }
  remove(key: string): void { this.store.delete(key) }
  clear(): void { this.store.clear() }
  keys(): string[] { return Array.from(this.store.keys()) }
  has(key: string): boolean { return this.store.has(key) }
}
`)

  w(corePath(pkg, 'adapters/cookie.ts'), `import type { StorageAdapter } from '../types'

export class CookieStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    const m = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'))
    return m ? decodeURIComponent(m[2]) : null
  }
  set(key: string, value: string): void {
    document.cookie = key + '=' + encodeURIComponent(value) + '; path=/; SameSite=Lax'
  }
  remove(key: string): void {
    document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }
  clear(): void {
    document.cookie.split(';').forEach(c => {
      const n = c.split('=')[0].trim(); if (n) this.remove(n)
    })
  }
  keys(): string[] { return document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(Boolean) }
  has(key: string): boolean { return this.get(key) !== null }
}
`)

  w(corePath(pkg, 'adapters/index.ts'), `export { LocalStorageAdapter } from './local'
export { SessionStorageAdapter } from './session'
export { MemoryStorageAdapter } from './memory'
export { CookieStorageAdapter } from './cookie'
`)

  // core/manager.ts
  w(corePath(pkg, 'core/manager.ts'), `import type { StorageAdapter, StorageOptions, StorageItem } from '../types'
import { LocalStorageAdapter } from '../adapters/local'

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

  set<T>(key: string, value: T, ttl?: number): void {
    const item: StorageItem<T> = { value, createdAt: Date.now(), version: this.options.version }
    const expires = ttl ?? this.options.defaultTTL
    if (expires > 0) item.expires = Date.now() + expires
    this.adapter.set(this.prefixKey(key), this.options.serializer.serialize(item))
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    const raw = this.adapter.get(this.prefixKey(key))
    if (!raw) return defaultValue
    try {
      const item: StorageItem<T> = this.options.serializer.deserialize(raw)
      if (item.expires && Date.now() > item.expires) { this.remove(key); return defaultValue }
      if (item.version !== undefined && item.version !== this.options.version) { this.remove(key); return defaultValue }
      return item.value
    } catch { return defaultValue }
  }

  remove(key: string): void { this.adapter.remove(this.prefixKey(key)) }
  has(key: string): boolean { return this.get(key) !== undefined }

  clear(): void {
    const p = this.options.prefix + ':'
    this.adapter.keys().filter(k => k.startsWith(p)).forEach(k => this.adapter.remove(k))
  }

  keys(): string[] {
    const p = this.options.prefix + ':'
    return this.adapter.keys().filter(k => k.startsWith(p)).map(k => k.slice(p.length))
  }

  size(): number {
    let total = 0
    const p = this.options.prefix + ':'
    for (const key of this.adapter.keys()) {
      if (key.startsWith(p)) { const raw = this.adapter.get(key); if (raw) total += raw.length * 2 }
    }
    return total
  }

  destroy(): void { this.clear() }

  private prefixKey(key: string): string { return this.options.prefix + ':' + key }
}
`)

  w(corePath(pkg, 'core/index.ts'), `export { StorageManager } from './manager'\n`)

  // engine
  w(corePath(pkg, 'engine/types.ts'), `import type { StorageOptions } from '../types'

export interface StorageEnginePluginOptions extends StorageOptions {
  dependencies?: string[]
}
`)

  w(corePath(pkg, 'engine/plugin.ts'), `import type { StorageEnginePluginOptions } from './types'
import { StorageManager } from '../core/manager'

export const storageStateKeys = {
  MANAGER: 'storage:manager' as const,
} as const

export const storageEventKeys = {
  INSTALLED: 'storage:installed' as const,
  UNINSTALLED: 'storage:uninstalled' as const,
} as const

export function createStorageEnginePlugin(options: StorageEnginePluginOptions = {}) {
  let manager: StorageManager | null = null

  return {
    name: 'storage',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context
      manager = new StorageManager(undefined, options)
      engine.state?.set(storageStateKeys.MANAGER, manager)
      engine.events?.emit(storageEventKeys.INSTALLED, { name: 'storage' })
      engine.logger?.info('[Storage Plugin] installed')
    },

    async uninstall(context: any) {
      const engine = context.engine || context
      manager?.destroy()
      manager = null
      engine.state?.delete(storageStateKeys.MANAGER)
      engine.events?.emit(storageEventKeys.UNINSTALLED, {})
    },
  }
}
`)

  w(corePath(pkg, 'engine/index.ts'), `export { createStorageEnginePlugin, storageStateKeys, storageEventKeys } from './plugin'
export type { StorageEnginePluginOptions } from './types'
`)

  w(corePath(pkg, 'index.ts'), `export type * from './types'
export { StorageManager } from './core/manager'
export { LocalStorageAdapter } from './adapters/local'
export { SessionStorageAdapter } from './adapters/session'
export { MemoryStorageAdapter } from './adapters/memory'
export { CookieStorageAdapter } from './adapters/cookie'
export { createStorageEnginePlugin, storageStateKeys, storageEventKeys } from './engine'
export type { StorageEnginePluginOptions } from './engine'
`)
  console.log('✅ storage/core')
}

// =====================================================================
// 4. @ldesign/websocket - Core
// =====================================================================
function genWebSocketCore() {
  const pkg = 'websocket'

  w(corePath(pkg, 'types/index.ts'), `export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
export type MessageHandler<T = any> = (data: T, event: MessageEvent) => void

export interface WebSocketOptions {
  url: string
  protocols?: string | string[]
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  reconnectInterval?: number
  reconnectBackoff?: number
  heartbeatInterval?: number
  heartbeatMessage?: string | (() => string)
  heartbeatTimeout?: number
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
`)

  w(corePath(pkg, 'core/client.ts'), `import type { WebSocketOptions, WebSocketState, MessageHandler, ConnectionEvents } from '../types'

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

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return
    this.state = 'connecting'
    this.ws = new WebSocket(this.options.url, this.options.protocols)

    this.ws.onopen = (e) => {
      this.state = 'connected'; this.reconnectAttempts = 0
      this.flushQueue(); this.startHeartbeat(); this.events.onOpen?.(e)
    }
    this.ws.onclose = (e) => {
      this.state = 'disconnected'; this.stopHeartbeat(); this.events.onClose?.(e)
      if (this.options.autoReconnect && !e.wasClean) this.reconnect()
    }
    this.ws.onerror = (e) => { this.events.onError?.(e) }
    this.ws.onmessage = (e) => {
      this.resetHeartbeatTimeout(); this.events.onMessage?.(e)
      try {
        const parsed = this.options.serializer.decode(e.data)
        const type = parsed?.type || parsed?.event || '__raw__'
        const data = parsed?.data ?? parsed?.payload ?? parsed
        this.handlers.get(type)?.forEach(h => h(data, e))
        this.handlers.get('*')?.forEach(h => h({ type, data }, e))
      } catch { this.handlers.get('__raw__')?.forEach(h => h(e.data, e)) }
    }
  }

  disconnect(): void {
    this.options.autoReconnect = false
    this.stopHeartbeat()
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close(1000, 'Manual disconnect')
    this.state = 'disconnected'
  }

  send(type: string, data?: any): void {
    const msg = this.options.serializer.encode({ type, data })
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(msg)
    else this.messageQueue.push({ type, data })
  }

  sendRaw(data: string | ArrayBuffer | Blob): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(data)
  }

  on<T = any>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set())
    this.handlers.get(type)!.add(handler as MessageHandler)
    return () => this.handlers.get(type)?.delete(handler as MessageHandler)
  }

  off(type: string, handler?: MessageHandler): void {
    if (!handler) this.handlers.delete(type)
    else this.handlers.get(type)?.delete(handler)
  }

  destroy(): void { this.disconnect(); this.handlers.clear(); this.messageQueue = [] }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) { this.events.onReconnectFailed?.(); return }
    this.state = 'reconnecting'; this.reconnectAttempts++
    const delay = this.options.reconnectInterval * Math.pow(this.options.reconnectBackoff, this.reconnectAttempts - 1)
    this.events.onReconnect?.(this.reconnectAttempts)
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  private flushQueue(): void {
    while (this.messageQueue.length > 0) { const m = this.messageQueue.shift()!; this.send(m.type, m.data) }
  }

  private startHeartbeat(): void {
    if (this.options.heartbeatInterval <= 0) return
    this.heartbeatTimer = setInterval(() => {
      const msg = typeof this.options.heartbeatMessage === 'function' ? this.options.heartbeatMessage() : this.options.heartbeatMessage
      this.ws?.send(msg)
      this.heartbeatTimeoutTimer = setTimeout(() => this.ws?.close(4000, 'Heartbeat timeout'), this.options.heartbeatTimeout)
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
`)

  w(corePath(pkg, 'core/index.ts'), `export { WebSocketClient } from './client'\n`)

  w(corePath(pkg, 'engine/types.ts'), `import type { WebSocketOptions } from '../types'

export interface WebSocketEnginePluginOptions extends Partial<WebSocketOptions> {
  dependencies?: string[]
}
`)

  w(corePath(pkg, 'engine/plugin.ts'), `import type { WebSocketEnginePluginOptions } from './types'
import { WebSocketClient } from '../core/client'

export const wsStateKeys = {
  CLIENT: 'websocket:client' as const,
  STATE: 'websocket:state' as const,
} as const

export const wsEventKeys = {
  INSTALLED: 'websocket:installed' as const,
  UNINSTALLED: 'websocket:uninstalled' as const,
  CONNECTED: 'websocket:connected' as const,
  DISCONNECTED: 'websocket:disconnected' as const,
} as const

export function createWebSocketEnginePlugin(options: WebSocketEnginePluginOptions = {}) {
  let client: WebSocketClient | null = null

  return {
    name: 'websocket',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context
      if (options.url) {
        client = new WebSocketClient(options as any, {
          onOpen: () => engine.events?.emit(wsEventKeys.CONNECTED, {}),
          onClose: () => engine.events?.emit(wsEventKeys.DISCONNECTED, {}),
        })
        engine.state?.set(wsStateKeys.CLIENT, client)
      }
      engine.events?.emit(wsEventKeys.INSTALLED, { name: 'websocket' })
      engine.logger?.info('[WebSocket Plugin] installed')
    },

    async uninstall(context: any) {
      const engine = context.engine || context
      client?.destroy()
      client = null
      engine.state?.delete(wsStateKeys.CLIENT)
      engine.events?.emit(wsEventKeys.UNINSTALLED, {})
    },
  }
}
`)

  w(corePath(pkg, 'engine/index.ts'), `export { createWebSocketEnginePlugin, wsStateKeys, wsEventKeys } from './plugin'
export type { WebSocketEnginePluginOptions } from './types'
`)

  w(corePath(pkg, 'index.ts'), `export type * from './types'
export { WebSocketClient } from './core/client'
export { createWebSocketEnginePlugin, wsStateKeys, wsEventKeys } from './engine'
export type { WebSocketEnginePluginOptions } from './engine'
`)
  console.log('✅ websocket/core')
}

// =====================================================================
// 5. @ldesign/config - Core
// =====================================================================
function genConfigCore() {
  const pkg = 'config'

  w(corePath(pkg, 'types/index.ts'), `export interface ConfigOptions {
  initial?: Record<string, any>
  separator?: string
  remoteUrl?: string
  pollInterval?: number
  validator?: (config: Record<string, any>) => boolean | string
}

export type ConfigSource = 'initial' | 'set' | 'remote' | 'merge'

export interface ConfigChangeEvent {
  key: string
  oldValue: any
  newValue: any
  source: ConfigSource
}
`)

  w(corePath(pkg, 'core/manager.ts'), `import type { ConfigOptions, ConfigSource, ConfigChangeEvent } from '../types'

type ChangeHandler = (event: ConfigChangeEvent) => void

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

  get<T = any>(key: string, defaultValue?: T): T {
    const parts = key.split(this.options.separator)
    let current: any = this.config
    for (const p of parts) { if (current == null) return defaultValue as T; current = current[p] }
    return (current !== undefined ? current : defaultValue) as T
  }

  set(key: string, value: any, source: ConfigSource = 'set'): void {
    const oldValue = this.get(key)
    const parts = key.split(this.options.separator)
    let current: any = this.config
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') current[parts[i]] = {}
      current = current[parts[i]]
    }
    current[parts[parts.length - 1]] = value
    this.notify({ key, oldValue, newValue: value, source })
  }

  has(key: string): boolean { return this.get(key) !== undefined }

  merge(partial: Record<string, any>, source: ConfigSource = 'merge'): void {
    const old = this.deepClone(this.config)
    this.deepMerge(this.config, partial)
    this.notify({ key: '*', oldValue: old, newValue: this.config, source })
  }

  getAll(): Record<string, any> { return this.deepClone(this.config) }

  reset(): void {
    this.config = this.deepClone(this.options.initial)
    this.notify({ key: '*', oldValue: undefined, newValue: this.config, source: 'initial' })
  }

  onChange(handler: ChangeHandler): () => void {
    this.listeners.add(handler)
    return () => this.listeners.delete(handler)
  }

  async loadRemote(): Promise<void> {
    if (!this.options.remoteUrl) return
    const res = await fetch(this.options.remoteUrl)
    const data = await res.json()
    const v = this.options.validator(data)
    if (v === true) this.merge(data, 'remote')
    else throw new Error(typeof v === 'string' ? v : 'Remote config validation failed')
  }

  startPolling(): void {
    if (this.options.pollInterval <= 0 || !this.options.remoteUrl) return
    this.pollTimer = setInterval(() => this.loadRemote().catch(() => {}), this.options.pollInterval)
  }

  stopPolling(): void { if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null } }

  destroy(): void { this.stopPolling(); this.listeners.clear() }

  private notify(event: ConfigChangeEvent): void { this.listeners.forEach(h => h(event)) }
  private deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)) }
  private deepMerge(target: any, source: any): void {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {}
        this.deepMerge(target[key], source[key])
      } else target[key] = source[key]
    }
  }
}
`)

  w(corePath(pkg, 'core/index.ts'), `export { ConfigManager } from './manager'\n`)

  w(corePath(pkg, 'engine/types.ts'), `import type { ConfigOptions } from '../types'

export interface ConfigEnginePluginOptions extends ConfigOptions {
  dependencies?: string[]
}
`)

  w(corePath(pkg, 'engine/plugin.ts'), `import type { ConfigEnginePluginOptions } from './types'
import { ConfigManager } from '../core/manager'

export const configStateKeys = {
  MANAGER: 'config:manager' as const,
} as const

export const configEventKeys = {
  INSTALLED: 'config:installed' as const,
  UNINSTALLED: 'config:uninstalled' as const,
  CHANGED: 'config:changed' as const,
} as const

export function createConfigEnginePlugin(options: ConfigEnginePluginOptions = {}) {
  let manager: ConfigManager | null = null

  return {
    name: 'config',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context
      manager = new ConfigManager(options)
      manager.onChange((e) => engine.events?.emit(configEventKeys.CHANGED, e))
      engine.state?.set(configStateKeys.MANAGER, manager)
      engine.events?.emit(configEventKeys.INSTALLED, { name: 'config' })
      engine.logger?.info('[Config Plugin] installed')
    },

    async uninstall(context: any) {
      const engine = context.engine || context
      manager?.destroy()
      manager = null
      engine.state?.delete(configStateKeys.MANAGER)
      engine.events?.emit(configEventKeys.UNINSTALLED, {})
    },
  }
}
`)

  w(corePath(pkg, 'engine/index.ts'), `export { createConfigEnginePlugin, configStateKeys, configEventKeys } from './plugin'
export type { ConfigEnginePluginOptions } from './types'
`)

  w(corePath(pkg, 'index.ts'), `export type * from './types'
export { ConfigManager } from './core/manager'
export { createConfigEnginePlugin, configStateKeys, configEventKeys } from './engine'
export type { ConfigEnginePluginOptions } from './engine'
`)
  console.log('✅ config/core')
}

// =====================================================================
// 6. @ldesign/theme - Core
// =====================================================================
function genThemeCore() {
  const pkg = 'theme'

  w(corePath(pkg, 'types/index.ts'), `export type ThemeMode = 'light' | 'dark' | 'auto'

export interface ColorTokens {
  primary: string; primaryLight: string; primaryDark: string
  secondary: string; success: string; warning: string; error: string; info: string
  background: string; surface: string; text: string; textSecondary: string
  border: string; divider: string
}

export interface SizeTokens { xs: string; sm: string; md: string; lg: string; xl: string }
export interface SpacingTokens { xs: string; sm: string; md: string; lg: string; xl: string; '2xl': string }
export interface RadiusTokens { none: string; sm: string; md: string; lg: string; xl: string; full: string }
export interface ShadowTokens { none: string; sm: string; md: string; lg: string; xl: string }

export interface TypographyTokens {
  fontFamily: string; fontFamilyMono: string
  fontSizeXs: string; fontSizeSm: string; fontSizeMd: string
  fontSizeLg: string; fontSizeXl: string; fontSize2xl: string
  fontWeightNormal: string; fontWeightMedium: string; fontWeightBold: string
  lineHeightTight: string; lineHeightNormal: string; lineHeightRelaxed: string
}

export interface DesignTokens {
  colors: ColorTokens; sizes: SizeTokens; spacing: SpacingTokens
  radius: RadiusTokens; shadows: ShadowTokens; typography: TypographyTokens
}

export interface ThemeConfig { mode: ThemeMode; tokens: DesignTokens; darkTokens?: Partial<DesignTokens> }
export interface ThemePreset { name: string; light: DesignTokens; dark: Partial<DesignTokens> }
export interface ThemeChangeEvent { mode: ThemeMode; resolvedMode: 'light' | 'dark'; tokens: DesignTokens }
`)

  w(corePath(pkg, 'core/tokens.ts'), `import type { DesignTokens } from '../types'

export const defaultTokens: DesignTokens = {
  colors: {
    primary: '#1677ff', primaryLight: '#4096ff', primaryDark: '#0958d9',
    secondary: '#722ed1', success: '#52c41a', warning: '#faad14',
    error: '#ff4d4f', info: '#1677ff',
    background: '#ffffff', surface: '#fafafa',
    text: '#1f1f1f', textSecondary: '#8c8c8c',
    border: '#d9d9d9', divider: '#f0f0f0',
  },
  sizes: { xs: '24px', sm: '32px', md: '40px', lg: '48px', xl: '56px' },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px' },
  radius: { none: '0', sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
  shadows: {
    none: 'none', sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)', lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
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

export function createDesignTokens(overrides?: Partial<DesignTokens>): DesignTokens {
  if (!overrides) return { ...defaultTokens }
  return deepMerge({ ...defaultTokens }, overrides) as DesignTokens
}

function deepMerge(target: any, source: any): any {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else result[key] = source[key]
  }
  return result
}
`)

  w(corePath(pkg, 'core/css-vars.ts'), `import type { DesignTokens } from '../types'

export function generateCSSVariables(tokens: DesignTokens, prefix = 'ld'): Record<string, string> {
  const vars: Record<string, string> = {}
  function flatten(obj: any, path: string) {
    for (const [key, value] of Object.entries(obj)) {
      const varName = path ? \`--\${path}-\${camelToKebab(key)}\` : \`--\${prefix}-\${camelToKebab(key)}\`
      if (typeof value === 'object' && value !== null) {
        flatten(value, path ? \`\${path}-\${camelToKebab(key)}\` : \`\${prefix}-\${camelToKebab(key)}\`)
      } else vars[varName] = String(value)
    }
  }
  flatten(tokens, '')
  return vars
}

export function applyTheme(tokens: DesignTokens, target?: HTMLElement, prefix?: string): void {
  const el = target || document.documentElement
  const vars = generateCSSVariables(tokens, prefix)
  for (const [key, value] of Object.entries(vars)) el.style.setProperty(key, value)
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()
}
`)

  w(corePath(pkg, 'core/manager.ts'), `import type { ThemeConfig, ThemeMode, DesignTokens, ThemePreset, ThemeChangeEvent } from '../types'
import { defaultTokens, defaultDarkOverrides, createDesignTokens } from './tokens'
import { applyTheme } from './css-vars'

type ThemeChangeHandler = (event: ThemeChangeEvent) => void

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

  getMode(): ThemeMode { return this.config.mode }
  getResolvedMode(): 'light' | 'dark' { return this.resolvedMode }

  getTokens(): DesignTokens {
    if (this.resolvedMode === 'dark' && this.config.darkTokens) {
      return createDesignTokens({ ...this.config.tokens, ...this.config.darkTokens } as any)
    }
    return this.config.tokens
  }

  setMode(mode: ThemeMode): void { this.config.mode = mode; this.resolveMode(); this.notify() }
  setTokens(tokens: Partial<DesignTokens>): void {
    this.config.tokens = createDesignTokens({ ...this.config.tokens, ...tokens } as any)
    this.notify()
  }
  setPrimaryColor(color: string): void { this.config.tokens.colors.primary = color; this.notify() }

  registerPreset(preset: ThemePreset): void { this.presets.set(preset.name, preset) }
  applyPreset(name: string): void {
    const preset = this.presets.get(name)
    if (!preset) throw new Error(\`Theme preset "\${name}" not found\`)
    this.config.tokens = { ...preset.light }
    this.config.darkTokens = preset.dark
    this.notify()
  }

  apply(target?: HTMLElement): void {
    const tokens = this.getTokens()
    applyTheme(tokens, target)
    const el = target || document.documentElement
    el.setAttribute('data-theme', this.resolvedMode)
    el.classList.remove('light', 'dark')
    el.classList.add(this.resolvedMode)
  }

  onChange(handler: ThemeChangeHandler): () => void {
    this.listeners.add(handler)
    return () => this.listeners.delete(handler)
  }

  destroy(): void {
    this.listeners.clear()
    if (this.mediaQuery) this.mediaQuery.removeEventListener('change', this.handleMediaChange)
  }

  private resolveMode(): void {
    if (this.config.mode === 'auto') {
      if (typeof window !== 'undefined') {
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        this.resolvedMode = this.mediaQuery.matches ? 'dark' : 'light'
        this.mediaQuery.addEventListener('change', this.handleMediaChange)
      } else this.resolvedMode = 'light'
    } else this.resolvedMode = this.config.mode
  }

  private handleMediaChange = (e: MediaQueryListEvent): void => {
    this.resolvedMode = e.matches ? 'dark' : 'light'; this.notify()
  }

  private notify(): void {
    const event: ThemeChangeEvent = { mode: this.config.mode, resolvedMode: this.resolvedMode, tokens: this.getTokens() }
    this.listeners.forEach(h => h(event))
  }
}
`)

  w(corePath(pkg, 'core/index.ts'), `export { ThemeManager } from './manager'
export { createDesignTokens, defaultTokens, defaultDarkOverrides } from './tokens'
export { generateCSSVariables, applyTheme } from './css-vars'
`)

  // engine plugin
  w(corePath(pkg, 'engine/types.ts'), `import type { ThemeConfig } from '../types'

export interface ThemeEnginePluginOptions extends Partial<ThemeConfig> {
  autoApply?: boolean
  dependencies?: string[]
}
`)

  w(corePath(pkg, 'engine/plugin.ts'), `import type { ThemeEnginePluginOptions } from './types'
import { ThemeManager } from '../core/manager'

export const themeStateKeys = {
  MANAGER: 'theme:manager' as const,
  MODE: 'theme:mode' as const,
  TOKENS: 'theme:tokens' as const,
} as const

export const themeEventKeys = {
  INSTALLED: 'theme:installed' as const,
  UNINSTALLED: 'theme:uninstalled' as const,
  MODE_CHANGED: 'theme:modeChanged' as const,
  TOKENS_CHANGED: 'theme:tokensChanged' as const,
} as const

export function createThemeEnginePlugin(options: ThemeEnginePluginOptions = {}) {
  let manager: ThemeManager | null = null

  return {
    name: 'theme',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context
      manager = new ThemeManager(options)

      manager.onChange((event) => {
        engine.state?.set(themeStateKeys.MODE, event.resolvedMode)
        engine.state?.set(themeStateKeys.TOKENS, event.tokens)
        engine.events?.emit(themeEventKeys.MODE_CHANGED, { mode: event.mode, resolvedMode: event.resolvedMode })
        engine.events?.emit(themeEventKeys.TOKENS_CHANGED, { tokens: event.tokens })
      })

      engine.state?.set(themeStateKeys.MANAGER, manager)
      engine.state?.set(themeStateKeys.MODE, manager.getResolvedMode())
      engine.state?.set(themeStateKeys.TOKENS, manager.getTokens())

      if (options.autoApply !== false && typeof document !== 'undefined') {
        manager.apply()
      }

      engine.events?.emit(themeEventKeys.INSTALLED, { name: 'theme', mode: manager.getResolvedMode() })
      engine.logger?.info('[Theme Plugin] installed')
    },

    async uninstall(context: any) {
      const engine = context.engine || context
      manager?.destroy()
      manager = null
      engine.state?.delete(themeStateKeys.MANAGER)
      engine.state?.delete(themeStateKeys.MODE)
      engine.state?.delete(themeStateKeys.TOKENS)
      engine.events?.emit(themeEventKeys.UNINSTALLED, {})
    },
  }
}
`)

  w(corePath(pkg, 'engine/index.ts'), `export { createThemeEnginePlugin, themeStateKeys, themeEventKeys } from './plugin'
export type { ThemeEnginePluginOptions } from './types'
`)

  w(corePath(pkg, 'index.ts'), `export type * from './types'
export { ThemeManager } from './core/manager'
export { createDesignTokens, defaultTokens, defaultDarkOverrides } from './core/tokens'
export { generateCSSVariables, applyTheme } from './core/css-vars'
export { createThemeEnginePlugin, themeStateKeys, themeEventKeys } from './engine'
export type { ThemeEnginePluginOptions } from './engine'
`)
  console.log('✅ theme/core')
}

// =====================================================================
// Vue packages - add composables/index.ts + missing plugins
// =====================================================================
function genVuePackages() {
  const packages = {
    validate: {
      composables: `export { useValidation } from './useValidation'
export { useFormValidation } from './useFormValidation'
`,
    },
    event: {
      composables: `export { useEventBus } from './useEventBus'
`,
    },
    storage: {
      composables: `export { useStorage } from './useStorage'
export { useLocalStorage } from './useLocalStorage'
export { useSessionStorage } from './useSessionStorage'
`,
    },
    websocket: {
      composables: `export { useWebSocket } from './useWebSocket'
`,
    },
    config: {
      composables: `export { useConfig } from './useConfig'
`,
    },
    theme: {
      composables: `export { useTheme } from './useTheme'
export { useThemeMode } from './useThemeMode'
export { useDesignTokens } from './useDesignTokens'
`,
    },
  }

  // Write composables/index.ts for each
  for (const [pkg, data] of Object.entries(packages)) {
    w(vuePath(pkg, 'composables/index.ts'), data.composables)
  }

  // Regenerate vue index.ts files
  w(vuePath('validate', 'index.ts'), `export { useValidation } from './composables/useValidation'
export { useFormValidation } from './composables/useFormValidation'
export { createValidatePlugin } from './plugin'
export type { ValidatePluginOptions } from './plugin'
`)
  w(vuePath('event', 'index.ts'), `export { useEventBus } from './composables/useEventBus'
export { createEventPlugin } from './plugin'
`)
  w(vuePath('storage', 'index.ts'), `export { useStorage } from './composables/useStorage'
export { useLocalStorage } from './composables/useLocalStorage'
export { useSessionStorage } from './composables/useSessionStorage'
export { createStoragePlugin } from './plugin'
`)
  w(vuePath('websocket', 'index.ts'), `export { useWebSocket } from './composables/useWebSocket'
export { createWebSocketPlugin } from './plugin'
`)
  w(vuePath('config', 'index.ts'), `export { useConfig } from './composables/useConfig'
export { createConfigPlugin, useConfigManager } from './plugin'
`)
  w(vuePath('theme', 'index.ts'), `export { useTheme } from './composables/useTheme'
export { useThemeMode } from './composables/useThemeMode'
export { useDesignTokens } from './composables/useDesignTokens'
export { createThemePlugin, useThemeManager } from './plugin'
`)

  // websocket/vue - add missing plugin.ts
  w(vuePath('websocket', 'plugin.ts'), `import type { App } from 'vue'
import { WebSocketClient } from '@ldesign/websocket-core'
import type { WebSocketOptions } from '@ldesign/websocket-core'

export function createWebSocketPlugin(options?: WebSocketOptions) {
  const client = options ? new WebSocketClient(options) : null
  return {
    install(app: App) {
      if (client) {
        app.provide('ldesign-websocket', client)
        app.config.globalProperties.$ws = client
      }
    },
  }
}
`)

  // Regenerate the other vue plugin.ts files (same content, just path-corrected imports)
  w(vuePath('validate', 'plugin.ts'), `import type { App } from 'vue'
import { ValidationEngine } from '@ldesign/validate-core'

export interface ValidatePluginOptions {
  globalEngine?: boolean
}

export function createValidatePlugin(options?: ValidatePluginOptions) {
  const engine = new ValidationEngine()
  return {
    install(app: App) {
      if (options?.globalEngine !== false) {
        app.provide('ldesign-validate-engine', engine)
        app.config.globalProperties.$validate = engine
      }
    },
  }
}
`)

  w(vuePath('event', 'plugin.ts'), `import type { App } from 'vue'
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
`)

  w(vuePath('storage', 'plugin.ts'), `import type { App } from 'vue'
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
`)

  w(vuePath('config', 'plugin.ts'), `import type { App } from 'vue'
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
`)

  w(vuePath('theme', 'plugin.ts'), `import type { App } from 'vue'
import { inject } from 'vue'
import { ThemeManager } from '@ldesign/theme-core'
import type { ThemeConfig } from '@ldesign/theme-core'

export function createThemePlugin(config?: Partial<ThemeConfig>) {
  const manager = new ThemeManager(config)
  return {
    install(app: App) {
      app.provide('ldesign-theme', manager)
      app.config.globalProperties.$theme = manager
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
`)

  console.log('✅ all vue packages')
}

// =====================================================================
// Regenerate vue composables (they need updated imports)
// =====================================================================
function genVueComposables() {
  // validate
  w(vuePath('validate', 'composables/useValidation.ts'), `import { ref, reactive } from 'vue'
import { Schema } from '@ldesign/validate-core'
import type { SchemaDefinition } from '@ldesign/validate-core'

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
      isValid.value = Object.values(errors).every(e => e.length === 0)
    } finally { isValidating.value = false }
  }

  async function validateAll(data: Record<string, any>) {
    isValidating.value = true
    try {
      const result = await schema.validate(data)
      Object.keys(errors).forEach(k => { errors[k] = [] })
      for (const err of result.errors) {
        if (!errors[err.field]) errors[err.field] = []
        errors[err.field].push(err.message)
      }
      isValid.value = result.valid
      return result
    } finally { isValidating.value = false }
  }

  function clearErrors() { Object.keys(errors).forEach(k => { errors[k] = [] }); isValid.value = true }
  function getFieldError(field: string): string | undefined { return errors[field]?.[0] }

  return { errors, isValid, isValidating, validateField, validateAll, clearErrors, getFieldError }
}
`)

  w(vuePath('validate', 'composables/useFormValidation.ts'), `import { ref, watch, reactive, type Ref } from 'vue'
import { Schema } from '@ldesign/validate-core'
import type { SchemaDefinition } from '@ldesign/validate-core'

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

  const getData = () => ('value' in formData ? (formData as Ref<T>).value : formData) as Record<string, any>

  async function validate(): Promise<boolean> {
    isValidating.value = true
    try {
      const result = await schema.validate(getData())
      Object.keys(errors).forEach(k => { errors[k] = [] })
      for (const err of result.errors) {
        if (!errors[err.field]) errors[err.field] = []
        errors[err.field].push(err.message)
      }
      isValid.value = result.valid
      return result.valid
    } finally { isValidating.value = false }
  }

  async function validateField(field: string) {
    isValidating.value = true
    try {
      const fieldErrors = await schema.validateField(field, getData()[field])
      errors[field] = fieldErrors.map(e => e.message)
      isValid.value = Object.values(errors).every(e => e.length === 0)
    } finally { isValidating.value = false }
  }

  function reset() { Object.keys(errors).forEach(k => { errors[k] = [] }); isValid.value = true; isDirty.value = false }

  async function handleSubmit(onSuccess: (data: T) => void, onError?: (errors: Record<string, string[]>) => void) {
    const valid = await validate()
    if (valid) onSuccess(getData() as T)
    else onError?.(errors)
  }

  if (options?.immediate !== false) {
    watch(() => getData(), () => {
      isDirty.value = true
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => validate(), options?.debounce ?? 300)
    }, { deep: true })
  }

  return { errors, isValid, isValidating, isDirty, validate, validateField, reset, handleSubmit }
}
`)

  // event
  w(vuePath('event', 'composables/useEventBus.ts'), `import { onUnmounted, getCurrentInstance } from 'vue'
import { EventBus } from '@ldesign/event-core'
import type { EventHandler, Unsubscribe } from '@ldesign/event-core'

const globalBus = new EventBus({ maxHistory: 200 })

export function useEventBus<Events extends Record<string, any> = Record<string, any>>(bus?: EventBus<Events>) {
  const eventBus = (bus || globalBus) as EventBus<Events>
  const unsubscribes: Unsubscribe[] = []

  function on<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    const unsub = eventBus.on(event, handler); unsubscribes.push(unsub); return unsub
  }
  function once<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    const unsub = eventBus.once(event, handler); unsubscribes.push(unsub); return unsub
  }
  function emit<K extends keyof Events & string>(event: K, payload?: Events[K]) { return eventBus.emit(event, payload) }
  function off<K extends keyof Events & string>(event: K, handler?: EventHandler<Events[K]>) { eventBus.off(event, handler) }

  if (getCurrentInstance()) { onUnmounted(() => unsubscribes.forEach(u => u())) }

  return { on, once, emit, off, bus: eventBus }
}
`)

  // storage
  w(vuePath('storage', 'composables/useStorage.ts'), `import { ref, watch, type Ref } from 'vue'
import { StorageManager } from '@ldesign/storage-core'
import type { StorageAdapter } from '@ldesign/storage-core'

export function useStorage<T>(key: string, defaultValue: T, adapter?: StorageAdapter, options?: { prefix?: string; ttl?: number }): Ref<T> {
  const manager = new StorageManager(adapter, { prefix: options?.prefix ?? 'ld' })
  const data = ref(manager.get<T>(key, defaultValue) as T) as Ref<T>
  watch(data, (v) => { v == null ? manager.remove(key) : manager.set(key, v, options?.ttl) }, { deep: true })
  return data
}
`)

  w(vuePath('storage', 'composables/useLocalStorage.ts'), `import { type Ref } from 'vue'
import { LocalStorageAdapter } from '@ldesign/storage-core'
import { useStorage } from './useStorage'

export function useLocalStorage<T>(key: string, defaultValue: T, options?: { prefix?: string; ttl?: number }): Ref<T> {
  return useStorage(key, defaultValue, new LocalStorageAdapter(), options)
}
`)

  w(vuePath('storage', 'composables/useSessionStorage.ts'), `import { type Ref } from 'vue'
import { SessionStorageAdapter } from '@ldesign/storage-core'
import { useStorage } from './useStorage'

export function useSessionStorage<T>(key: string, defaultValue: T, options?: { prefix?: string; ttl?: number }): Ref<T> {
  return useStorage(key, defaultValue, new SessionStorageAdapter(), options)
}
`)

  // websocket
  w(vuePath('websocket', 'composables/useWebSocket.ts'), `import { ref, onUnmounted, type Ref } from 'vue'
import { WebSocketClient } from '@ldesign/websocket-core'
import type { WebSocketOptions, WebSocketState, MessageHandler } from '@ldesign/websocket-core'

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

  onUnmounted(() => client.destroy())

  return { state, lastMessage, connect, disconnect, send, sendRaw, on, client }
}
`)

  // config
  w(vuePath('config', 'composables/useConfig.ts'), `import { ref, onUnmounted, inject } from 'vue'
import { ConfigManager } from '@ldesign/config-core'

export function useConfig<T = any>(key: string, defaultValue?: T) {
  const manager = inject<ConfigManager>('ldesign-config') || new ConfigManager()
  const value = ref(manager.get<T>(key, defaultValue as T))

  const unsub = manager.onChange((event) => {
    if (event.key === key || event.key === '*') value.value = manager.get<T>(key, defaultValue as T)
  })

  onUnmounted(() => unsub())

  function set(newValue: T) { manager.set(key, newValue); value.value = newValue as any }

  return { value, set }
}
`)

  // theme
  w(vuePath('theme', 'composables/useTheme.ts'), `import { ref, computed, onUnmounted, inject, watchEffect } from 'vue'
import { ThemeManager } from '@ldesign/theme-core'
import type { ThemeMode, DesignTokens } from '@ldesign/theme-core'

export function useTheme(config?: { mode?: ThemeMode; autoApply?: boolean }) {
  const injected = inject<ThemeManager>('ldesign-theme', undefined)
  const manager = injected || new ThemeManager({ mode: config?.mode ?? 'light' })

  const mode = ref<ThemeMode>(manager.getMode())
  const resolvedMode = ref(manager.getResolvedMode())
  const tokens = ref(manager.getTokens())
  const isDark = computed(() => resolvedMode.value === 'dark')

  const unsub = manager.onChange((event) => {
    mode.value = event.mode; resolvedMode.value = event.resolvedMode; tokens.value = event.tokens
  })

  function setMode(m: ThemeMode) { manager.setMode(m) }
  function toggleMode() { setMode(resolvedMode.value === 'light' ? 'dark' : 'light') }
  function setPrimaryColor(color: string) { manager.setPrimaryColor(color) }
  function setTokens(partial: Partial<DesignTokens>) { manager.setTokens(partial) }

  if (config?.autoApply !== false) { watchEffect(() => manager.apply()) }
  onUnmounted(() => unsub())

  return { mode, resolvedMode, tokens, isDark, setMode, toggleMode, setPrimaryColor, setTokens, manager }
}
`)

  w(vuePath('theme', 'composables/useThemeMode.ts'), `import { ref, onMounted, onUnmounted } from 'vue'
import type { ThemeMode } from '@ldesign/theme-core'

export function useThemeMode(initialMode: ThemeMode = 'auto') {
  const mode = ref<ThemeMode>(initialMode)
  const resolvedMode = ref<'light' | 'dark'>('light')
  let mq: MediaQueryList | null = null

  function resolve() {
    resolvedMode.value = mode.value === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode.value
    document.documentElement.setAttribute('data-theme', resolvedMode.value)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolvedMode.value)
  }

  function setMode(m: ThemeMode) { mode.value = m; resolve() }
  function toggle() { setMode(resolvedMode.value === 'light' ? 'dark' : 'light') }

  onMounted(() => {
    resolve()
    if (mode.value === 'auto') { mq = window.matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener('change', resolve) }
  })
  onUnmounted(() => mq?.removeEventListener('change', resolve))

  return { mode, resolvedMode, setMode, toggle, isDark: () => resolvedMode.value === 'dark' }
}
`)

  w(vuePath('theme', 'composables/useDesignTokens.ts'), `import { inject, computed } from 'vue'
import { ThemeManager, defaultTokens } from '@ldesign/theme-core'
import type { DesignTokens } from '@ldesign/theme-core'

export function useDesignTokens() {
  const manager = inject<ThemeManager>('ldesign-theme', undefined)
  const tokens = computed<DesignTokens>(() => manager?.getTokens() ?? defaultTokens)
  const colors = computed(() => tokens.value.colors)
  const sizes = computed(() => tokens.value.sizes)
  const spacing = computed(() => tokens.value.spacing)
  const radius = computed(() => tokens.value.radius)
  const shadows = computed(() => tokens.value.shadows)
  const typography = computed(() => tokens.value.typography)

  return { tokens, colors, sizes, spacing, radius, shadows, typography }
}
`)

  console.log('✅ all vue composables')
}

// =====================================================================
// Run all
// =====================================================================
genValidateCore()
genEventCore()
genStorageCore()
genWebSocketCore()
genConfigCore()
genThemeCore()
genVuePackages()
genVueComposables()
console.log('\n🎉 All packages restructured!')
