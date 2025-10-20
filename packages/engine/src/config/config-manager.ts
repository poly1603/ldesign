import type {
  ConfigManager,
  ConfigSchema,
  ConfigSnapshot,
  ConfigWatcher,
  Logger,
  UnwatchFunction,
  ValidationResult,
} from '../types'
import type { ConfigLoader, ConfigObject } from './loaders'
import { getNestedValue, isObject, setNestedValue } from '../utils'

/**
 * 配置管理器实现
 *
 * 提供完整的配置管理功能，包括：
 * - 配置加载和保存
 * - 配置验证
 * - 配置监听
 * - 快照和回滚
 * - 环境检测
 */
export class ConfigManagerImpl implements ConfigManager {
  private config: Record<string, unknown> = {}
  private schema?: ConfigSchema
  private watchers = new Map<string, ConfigWatcher[]>()
  private snapshots: ConfigSnapshot[] = []
  private environment: 'development' | 'production' | 'test' = 'development'
  private autoSaveInterval?: number
  private maxSnapshots = 5 // 从10减少到5，降低内存占用
  private logger?: Logger
  private loaders: ConfigLoader[] = []
  private loadWatchers: Array<() => void> = []

  // 内存优化：限制数量
  private readonly MAX_WATCHERS_PER_PATH = 50
  private readonly MAX_LOADERS = 20

  constructor(initialConfig: Record<string, unknown> = {}, logger?: Logger) {
    this.config = { ...initialConfig }
    this.logger = logger
    this.environment = this.detectEnvironment()

    // 创建初始快照
    this.createSnapshot()

    this.logger?.info('ConfigManager initialized', {
      environment: this.environment,
      keys: Object.keys(this.config).length,
    })
  }

  /**
   * 添加配置加载器 - 优化版：限制加载器数量
   *
   * @param loader 配置加载器实例
   * @returns this 支持链式调用
   */
  addLoader(loader: ConfigLoader): this {
    if (this.loaders.length >= this.MAX_LOADERS) {
      this.logger?.warn(`Maximum config loaders limit (${this.MAX_LOADERS}) reached, removing oldest`)
      this.loaders.shift()
    }
    this.loaders.push(loader)
    return this
  }

  /**
   * 从所有加载器加载配置
   *
   * 按顺序加载所有配置源，后面的配置会覆盖前面的
   */
  async loadFromLoaders(): Promise<void> {
    for (const loader of this.loaders) {
      try {
        const loadedConfig = await loader.load()
        this.merge(loadedConfig as Partial<Record<string, unknown>>)

        // 如果加载器支持监听，启用热重载
        if (loader.watch) {
          const unwatcher = loader.watch((newConfig: ConfigObject) => {
            this.merge(newConfig as Partial<Record<string, unknown>>)
            this.logger?.info('Configuration hot-reloaded')
          })
          if (unwatcher) {
            this.loadWatchers.push(unwatcher)
          }
        }
      }
      catch (error) {
        this.logger?.error('Failed to load config from loader', error)
      }
    }
  }

  /**
   * 销毁配置管理器 - 增强版
   *
   * 清理所有监听器和定时器
   */
  destroy(): void {
    // 清理加载器监听器
    this.loadWatchers.forEach(unwatch => unwatch())
    this.loadWatchers.length = 0 // 更高效的数组清空

    // 清理自动保存定时器
    if (this.autoSaveInterval) {
      window.clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = undefined
    }

    // 清理所有watchers
    this.watchers.clear()

    // 清理快照
    this.snapshots.length = 0

    // 清理加载器
    this.loaders.length = 0

    // 清理配置
    this.config = {}

    // 清理 schema
    this.schema = undefined

    this.logger?.info('ConfigManager destroyed')
    this.logger = undefined
  }

  // 基础操作
  get<T = unknown>(path: string, defaultValue?: T): T {
    const value = getNestedValue(this.config, path) as T
    return value !== undefined ? value : (defaultValue as T)
  }

  set(path: string, value: unknown): void {
    const oldValue = this.get(path)

    // 验证新值
    if (this.schema) {
      const validation = this.validatePath(path, value)
      if (!validation.valid) {
        throw new Error(
          `Configuration validation failed for "${path}": ${validation.errors.join(', ')}`
        )
      }
    }

    setNestedValue(this.config, path, value)

    // 触发监听器
    this.triggerWatchers(path, value, oldValue)

    this.logger?.debug('Configuration updated', { path, value, oldValue })
  }

  has(path: string): boolean {
    return getNestedValue(this.config, path) !== undefined
  }

  remove(path: string): void {
    const oldValue = this.get(path)
    this.deleteNestedValue(this.config, path)
    this.triggerWatchers(path, undefined, oldValue)

    this.logger?.debug('Configuration removed', { path, oldValue })
  }

  clear(): void {
    const oldConfig = { ...this.config }
    this.config = {}

    // 触发所有监听器
    for (const path of Object.keys(oldConfig)) {
      this.triggerWatchers(path, undefined, oldConfig[path])
    }

    this.logger?.info('Configuration cleared')
  }

  // 配置合并
  merge(newConfig: Partial<Record<string, unknown>>): void {
    const oldConfig = { ...this.config }
    this.deepMerge(this.config, newConfig)

    // 触发变更的路径监听器
    this.triggerMergeWatchers(oldConfig, this.config)

    this.logger?.info('Configuration merged', {
      newKeys: Object.keys(newConfig).length,
    })
  }

  reset(path?: string): void {
    if (path) {
      // 重置特定路径到默认值
      if (this.schema) {
        const defaultValue = this.getDefaultValue(path)
        if (defaultValue !== undefined) {
          this.set(path, defaultValue)
        } else {
          this.remove(path)
        }
      } else {
        this.remove(path)
      }
    } else {
      // 重置整个配置
      this.clear()
      if (this.schema) {
        this.config = this.getDefaultConfig()
      }
    }

    this.logger?.info('Configuration reset', { path })
  }

  // 环境管理
  setEnvironment(env: 'development' | 'production' | 'test'): void {
    const oldEnv = this.environment
    this.environment = env

    this.logger?.info('Environment changed', { from: oldEnv, to: env })
  }

  getEnvironment(): string {
    return this.environment
  }

  // 配置验证
  validate(schema?: ConfigSchema): ValidationResult {
    const targetSchema = schema || this.schema
    if (!targetSchema) {
      return { valid: true, errors: [], warnings: [] }
    }

    return this.validateConfig(this.config, targetSchema)
  }

  setSchema(schema: ConfigSchema): void {
    this.schema = schema

    // 验证当前配置
    const validation = this.validate()
    if (!validation.valid) {
      this.logger?.warn(
        'Current configuration is invalid after schema update',
        {
          errors: validation.errors,
          warnings: validation.warnings,
        }
      )
    }

    this.logger?.info('Configuration schema updated')
  }

  getSchema(): ConfigSchema | undefined {
    return this.schema
  }

  // 配置监听
  watch(path: string, callback: ConfigWatcher): UnwatchFunction {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, [])
    }

    const watchers = this.watchers.get(path)
    watchers?.push(callback)

    return () => {
      this.unwatch(path, callback)
    }
  }

  unwatch(path: string, callback?: ConfigWatcher): void {
    const callbacks = this.watchers.get(path)
    if (!callbacks) return

    if (callback) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }

      if (callbacks.length === 0) {
        this.watchers.delete(path)
      }
    } else {
      this.watchers.delete(path)
    }
  }

  // 事件监听（兼容方法）
  on(event: string, callback: (...args: unknown[]) => void): () => void {
    // 使用 watch 方法实现事件监听
    return this.watch(event, callback as ConfigWatcher)
  }

  // 持久化
  async save(): Promise<void> {
    try {
      const data = JSON.stringify({
        config: this.config,
        environment: this.environment,
        timestamp: Date.now(),
      })

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('engine-config', data)
      }

      this.logger?.debug('Configuration saved to storage')
    } catch (error) {
      this.logger?.error('Failed to save configuration', error)
      throw error
    }
  }

  async load(): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') {
        return
      }

      const data = localStorage.getItem('engine-config')
      if (!data) {
        return
      }

      const parsed = JSON.parse(data)
      this.config = parsed.config || {}
      this.environment = parsed.environment || this.environment

      this.logger?.debug('Configuration loaded from storage')
    } catch (error) {
      this.logger?.error('Failed to load configuration', error)
      throw error
    }
  }

  enableAutoSave(interval = 30000): void {
    this.disableAutoSave()

    this.autoSaveInterval = window.setInterval(() => {
      this.save().catch(error => {
        this.logger?.error('Auto-save failed', error)
      })
    }, interval)

    this.logger?.info('Auto-save enabled', { interval })
  }

  disableAutoSave(): void {
    if (this.autoSaveInterval) {
      window.clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = undefined
      this.logger?.info('Auto-save disabled')
    }
  }

  // 配置快照
  createSnapshot(): ConfigSnapshot {
    const snapshot: ConfigSnapshot = {
      timestamp: Date.now(),
      config: JSON.parse(JSON.stringify(this.config)),
      environment: this.environment,
      version: '1.0.0', // 可以从package.json获取
    }

    this.snapshots.unshift(snapshot)

    // 限制快照数量
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(0, this.maxSnapshots)
    }

    this.logger?.debug('Configuration snapshot created')
    return snapshot
  }

  restoreSnapshot(snapshot: ConfigSnapshot): void {
    const oldConfig = { ...this.config }
    this.config = JSON.parse(JSON.stringify(snapshot.config))
    this.environment = snapshot.environment

    // 触发所有监听器
    this.triggerMergeWatchers(oldConfig, this.config)

    this.logger?.info('Configuration restored from snapshot', {
      timestamp: snapshot.timestamp,
    })
  }

  getSnapshots(): ConfigSnapshot[] {
    return [...this.snapshots]
  }

  // 配置统计
  getStats(): {
    totalKeys: number
    watchers: number
    snapshots: number
    lastModified: number
    memoryUsage: string
  } {
    const totalWatchers = Array.from(this.watchers.values()).reduce(
      (sum, array) => sum + array.length,
      0
    )

    const memoryUsage = JSON.stringify(this.config).length
    const lastSnapshot = this.snapshots[0]

    return {
      totalKeys: this.getAllKeys().length,
      watchers: totalWatchers,
      snapshots: this.snapshots.length,
      lastModified: lastSnapshot?.timestamp || 0,
      memoryUsage: `${(memoryUsage / 1024).toFixed(2)} KB`,
    }
  }

  // 配置导入导出
  export(format: 'json' | 'yaml' = 'json'): string {
    const data = {
      config: this.config,
      environment: this.environment,
      timestamp: Date.now(),
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else {
      // 简单的YAML导出（实际项目中可以使用yaml库）
      return this.toYAML(data)
    }
  }

  import(data: string, format: 'json' | 'yaml' = 'json'): void {
    try {
      let parsed: Record<string, unknown>

      if (format === 'json') {
        parsed = JSON.parse(data)
      } else {
        // 简单的YAML解析（实际项目中可以使用yaml库）
        parsed = this.fromYAML(data)
      }

      if (parsed.config) {
        this.merge(parsed.config)
      }

      if (parsed.environment && typeof parsed.environment === 'string') {
        this.setEnvironment(parsed.environment as 'development' | 'production' | 'test')
      }

      this.logger?.info('Configuration imported', { format })
    } catch (error) {
      this.logger?.error('Failed to import configuration', error)
      throw error
    }
  }

  // 命名空间
  namespace(name: string): ConfigManager {
    return new NamespacedConfigManager(this, name)
  }

  // 私有方法
  private detectEnvironment(): 'development' | 'production' | 'test' {
    // Check if running in test environment
    if (
      typeof globalThis !== 'undefined' &&
      (globalThis as Record<string, unknown>).__vitest__ !== undefined
    ) {
      return 'test'
    }

    // Check if in production mode (commonly set by build tools)
    if (typeof window !== 'undefined') {
      // @ts-expect-error - may be set by build tools
      if (window.__ENV__ === 'production') {
        return 'production'
      }
    }

    return 'development'
  }

  private triggerWatchers(path: string, newValue: unknown, oldValue: unknown): void {
    const callbacks = this.watchers.get(path)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, path)
        } catch (error) {
          this.logger?.error('Error in config watcher callback', {
            path,
            error,
          })
        }
      })
    }

    // 触发父路径监听器
    const pathParts = path.split('.')
    for (let i = pathParts.length - 1; i > 0; i--) {
      const parentPath = pathParts.slice(0, i).join('.')
      const parentCallbacks = this.watchers.get(parentPath)
      if (parentCallbacks) {
        const parentNewValue = this.get(parentPath)
        const parentOldValue = this.get(parentPath) // 这里需要优化，应该保存旧值
        parentCallbacks.forEach(callback => {
          try {
            callback(parentNewValue, parentOldValue, parentPath)
          } catch (error) {
            this.logger?.error('Error in parent config watcher callback', {
              path: parentPath,
              error,
            })
          }
        })
      }
    }
  }

  private triggerMergeWatchers(
    oldConfig: Record<string, unknown>,
    newConfig: Record<string, unknown>
  ): void {
    const allKeys = new Set([
      ...this.getAllKeysFromObject(oldConfig),
      ...this.getAllKeysFromObject(newConfig),
    ])

    for (const key of allKeys) {
      const oldValue = getNestedValue(oldConfig, key)
      const newValue = getNestedValue(newConfig, key)

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        this.triggerWatchers(key, newValue, oldValue)
      }
    }
  }

  private deleteNestedValue(obj: Record<string, unknown>, path: string): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || !isObject(current[key])) {
        return // 路径不存在
      }
      current = current[key] as Record<string, unknown>
    }

    delete current[keys[keys.length - 1]]
  }

  private deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
    for (const key in source) {
      if (source[key] && isObject(source[key])) {
        if (!target[key] || !isObject(target[key])) {
          target[key] = {}
        }
        this.deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        )
      } else {
        target[key] = source[key]
      }
    }
  }

  private validateConfig(
    config: Record<string, unknown>,
    schema: ConfigSchema,
    basePath = ''
  ): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    for (const [key, schemaItem] of Object.entries(schema)) {
      const fullPath = basePath ? `${basePath}.${key}` : key
      const value = getNestedValue(config, fullPath)

      // 检查必需字段
      if (schemaItem.required && value === undefined) {
        errors.push(`Required field "${fullPath}" is missing`)
        continue
      }

      // 如果值不存在且不是必需的，跳过验证
      if (value === undefined) {
        continue
      }

      // 类型验证
      if (!this.validateType(value, schemaItem.type)) {
        errors.push(
          `Field "${fullPath}" has invalid type. Expected ${schemaItem.type}, got ${typeof value}`
        )
        continue
      }

      // 自定义验证器
      if (schemaItem.validator && !schemaItem.validator(value)) {
        errors.push(`Field "${fullPath}" failed custom validation`)
        continue
      }

      // 递归验证子对象
      if (
        schemaItem.type === 'object' &&
        schemaItem.children &&
        isObject(value)
      ) {
        const childResult = this.validateConfig(
          config,
          schemaItem.children,
          fullPath
        )
        errors.push(...childResult.errors)
        warnings.push(...childResult.warnings)
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  private validatePath(path: string, value: unknown): ValidationResult {
    if (!this.schema) {
      return { valid: true, errors: [], warnings: [] }
    }

    const pathParts = path.split('.')
    let currentSchema = this.schema

    for (const part of pathParts) {
      if (!currentSchema[part]) {
        return { valid: true, errors: [], warnings: [] } // 路径不在schema中，允许
      }

      const schemaItem = currentSchema[part]

      // 如果是最后一个部分，验证值
      if (part === pathParts[pathParts.length - 1]) {
        if (!this.validateType(value, schemaItem.type)) {
          return {
            valid: false,
            errors: [
              `Invalid type. Expected ${schemaItem.type}, got ${typeof value}`,
            ],
            warnings: [],
          }
        }

        if (schemaItem.validator && !schemaItem.validator(value)) {
          return {
            valid: false,
            errors: ['Failed custom validation'],
            warnings: [],
          }
        }

        return { valid: true, errors: [], warnings: [] }
      }

      // 继续到下一级
      if (schemaItem.children) {
        currentSchema = schemaItem.children
      } else {
        return { valid: true, errors: [], warnings: [] }
      }
    }

    return { valid: true, errors: [], warnings: [] }
  }

  private validateType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !Number.isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'object':
        return isObject(value)
      case 'array':
        return Array.isArray(value)
      default:
        return true
    }
  }

  private getDefaultValue(path: string): unknown {
    if (!this.schema) return undefined

    const pathParts = path.split('.')
    let currentSchema = this.schema

    for (const part of pathParts) {
      if (!currentSchema[part]) {
        return undefined
      }

      const schemaItem = currentSchema[part]

      if (part === pathParts[pathParts.length - 1]) {
        return schemaItem.default
      }

      if (schemaItem.children) {
        currentSchema = schemaItem.children
      } else {
        return undefined
      }
    }

    return undefined
  }

  private getDefaultConfig(): Record<string, unknown> {
    if (!this.schema) return {}

    const config: Record<string, unknown> = {}
    this.buildDefaultConfig(config, this.schema)
    return config
  }

  private buildDefaultConfig(
    config: Record<string, unknown>,
    schema: ConfigSchema,
    basePath = ''
  ): void {
    for (const [key, schemaItem] of Object.entries(schema)) {
      const fullPath = basePath ? `${basePath}.${key}` : key

      if (schemaItem.default !== undefined) {
        setNestedValue(config, fullPath, schemaItem.default)
      }

      if (schemaItem.children) {
        this.buildDefaultConfig(config, schemaItem.children, fullPath)
      }
    }
  }

  private getAllKeys(): string[] {
    return this.getAllKeysFromObject(this.config)
  }

  private getAllKeysFromObject(obj: Record<string, unknown>, prefix = ''): string[] {
    const keys: string[] = []

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.push(fullKey)

      if (isObject(obj[key])) {
        keys.push(...this.getAllKeysFromObject(obj[key] as Record<string, unknown>, fullKey))
      }
    }

    return keys
  }

  private toYAML(obj: Record<string, unknown> | Array<unknown>, indent = 0): string {
    const spaces = '  '.repeat(indent)
    let result = ''

    for (const [key, value] of Object.entries(obj)) {
      if (isObject(value)) {
        result += `${spaces}${key}:\n${this.toYAML(value as Record<string, unknown>, indent + 1)}`
      } else if (Array.isArray(value)) {
        result += `${spaces}${key}:\n`
        value.forEach(item => {
          result += `${spaces}  - ${item}\n`
        })
      } else {
        result += `${spaces}${key}: ${value}\n`
      }
    }

    return result
  }

  private fromYAML(yamlString: string): Record<string, unknown> {
    // 简单的YAML解析实现（实际项目中应使用专业的YAML库）
    const lines = yamlString.split('\n').filter(line => line.trim())
    const result: Record<string, unknown> = {}

    // 这里只是一个简单的实现，实际应该使用js-yaml等库
    lines.forEach(line => {
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) return

      const beforeColon = line.slice(0, colonIndex)
      const afterColon = line.slice(colonIndex + 1)
      const key = beforeColon.trim()
      const value = afterColon.trim()

      if (key && value !== undefined) {
        try {
          result[key] = JSON.parse(value)
        } catch {
          result[key] = value
        }
      }
    })

    return result
  }
}

// 命名空间配置管理器
export class NamespacedConfigManager implements ConfigManager {
  constructor(
    private parent: ConfigManager,
    private namespaceName: string
  ) { }

  private getKey(key: string): string {
    return `${this.namespaceName}.${key}`
  }

  // 基础操作
  get<T = unknown>(key: string, defaultValue?: T): T {
    return this.parent.get(this.getKey(key), defaultValue) as T
  }

  set(key: string, value: unknown): void {
    this.parent.set(this.getKey(key), value)
  }

  has(key: string): boolean {
    return this.parent.has(this.getKey(key))
  }

  remove(key: string): void {
    this.parent.remove(this.getKey(key))
  }

  clear(): void {
    // 只清理当前命名空间的配置
    this.parent.remove(this.namespaceName)
  }

  // 配置合并
  merge(config: Partial<Record<string, unknown>>): void {
    const namespacedConfig: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(config)) {
      namespacedConfig[this.getKey(key)] = value
    }
    this.parent.merge(namespacedConfig)
  }

  reset(path?: string): void {
    if (path) {
      this.parent.reset(this.getKey(path))
    } else {
      this.clear()
    }
  }

  // 环境管理
  setEnvironment(env: 'development' | 'production' | 'test'): void {
    this.parent.setEnvironment(env)
  }

  getEnvironment(): string {
    return this.parent.getEnvironment()
  }

  // 配置验证
  validate(schema?: ConfigSchema): ValidationResult {
    return this.parent.validate(schema)
  }

  setSchema(schema: ConfigSchema): void {
    this.parent.setSchema(schema)
  }

  getSchema(): ConfigSchema | undefined {
    return this.parent.getSchema()
  }

  // 配置监听
  watch(key: string, callback: ConfigWatcher): UnwatchFunction {
    return this.parent.watch(this.getKey(key), callback)
  }

  unwatch(key: string, callback?: ConfigWatcher): void {
    this.parent.unwatch(this.getKey(key), callback)
  }

  // 事件监听（兼容方法）
  on(event: string, callback: (...args: unknown[]) => void): () => void {
    return this.parent.on(this.getKey(event), callback)
  }

  // 持久化
  async save(): Promise<void> {
    return this.parent.save()
  }

  async load(): Promise<void> {
    return this.parent.load()
  }

  enableAutoSave(interval?: number): void {
    this.parent.enableAutoSave(interval)
  }

  disableAutoSave(): void {
    this.parent.disableAutoSave()
  }

  // 配置快照
  createSnapshot(): ConfigSnapshot {
    return this.parent.createSnapshot()
  }

  restoreSnapshot(snapshot: ConfigSnapshot): void {
    this.parent.restoreSnapshot(snapshot)
  }

  getSnapshots(): ConfigSnapshot[] {
    return this.parent.getSnapshots()
  }

  // 配置统计
  getStats(): {
    totalKeys: number
    watchers: number
    snapshots: number
    lastModified: number
    memoryUsage: string
  } {
    return this.parent.getStats()
  }

  // 配置导入导出
  export(format?: 'json' | 'yaml'): string {
    return this.parent.export(format)
  }

  import(data: string, format?: 'json' | 'yaml'): void {
    this.parent.import(data, format)
  }

  // 命名空间
  namespace(name: string): ConfigManager {
    return this.parent.namespace(`${this.namespaceName}.${name}`)
  }
}

// 工厂函数
export function createConfigManager(
  initialConfig?: Record<string, unknown>,
  logger?: Logger
): ConfigManager {
  return new ConfigManagerImpl(initialConfig, logger)
}

// 默认配置Schema
export const defaultConfigSchema: ConfigSchema = {
  app: {
    type: 'object',
    required: true,
    default: {
      name: 'Vue Engine App',
      version: '1.0.0',
    },
    children: {
      name: {
        type: 'string',
        required: true,
        default: 'Vue Engine App',
        description: '应用名称',
      },
      version: {
        type: 'string',
        required: true,
        default: '1.0.0',
        description: '应用版本',
      },
      description: {
        type: 'string',
        description: '应用描述',
      },
      author: {
        type: 'string',
        description: '应用作者',
      },
      homepage: {
        type: 'string',
        description: '应用主页',
      },
    },
  },
  environment: {
    type: 'string',
    required: true,
    default: 'development',
    validator: (value: unknown) =>
      typeof value === 'string' && ['development', 'production', 'test'].includes(value),
    description: '运行环境',
  },
  debug: {
    type: 'boolean',
    required: true,
    default: true,
    description: '是否启用调试模式',
  },
  features: {
    type: 'object',
    required: true,
    default: {
      enableHotReload: true,
      enableDevTools: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      enableSecurityProtection: true,
      enableCaching: true,
      enableNotifications: true,
    },
    children: {
      enableHotReload: {
        type: 'boolean',
        default: true,
        description: '是否启用热重载',
      },
      enableDevTools: {
        type: 'boolean',
        default: true,
        description: '是否启用开发工具',
      },
      enablePerformanceMonitoring: {
        type: 'boolean',
        default: true,
        description: '是否启用性能监控',
      },
      enableErrorReporting: {
        type: 'boolean',
        default: true,
        description: '是否启用错误报告',
      },
      enableSecurityProtection: {
        type: 'boolean',
        default: true,
        description: '是否启用安全防护',
      },
      enableCaching: {
        type: 'boolean',
        default: true,
        description: '是否启用缓存',
      },
      enableNotifications: {
        type: 'boolean',
        default: true,
        description: '是否启用通知',
      },
    },
  },
}
