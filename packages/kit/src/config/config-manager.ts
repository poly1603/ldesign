/**
 * 配置管理器
 * 提供配置加载、合并、验证、监听等核心功能
 */

import type { ConfigOptions, ConfigSchema, ConfigValue } from '../types'
import { EventEmitter } from 'node:events'
import { ObjectUtils } from '../utils'
import { ConfigLoader } from './config-loader'
import { ConfigValidator } from './config-validator'
import { ConfigWatcher } from './config-watcher'
import { EnvConfig } from './env-config'
import { SchemaValidator } from './schema-validator'

/**
 * 配置管理器类
 */
export class ConfigManager extends EventEmitter {
  private config: Record<string, unknown> = {}
  private schema?: ConfigSchema
  private options: Required<ConfigOptions>
  private loader: ConfigLoader
  private validator: ConfigValidator
  private watcher?: ConfigWatcher
  private envConfig: EnvConfig
  private schemaValidator: SchemaValidator
  private frozen = false

  constructor(options: ConfigOptions = {}) {
    super()

    this.options = {
      cwd: options.cwd ?? process.cwd(),
      configFile: options.configFile ?? 'config.json',
      schema: options.schema,
      defaults: options.defaults ?? {},
      env: options.env ?? true,
      envPrefix: options.envPrefix ?? 'APP',
      configDir: options.configDir ?? process.cwd(),
      envSeparator: options.envSeparator ?? '_',
      watch: options.watch ?? true,
      strict: options.strict ?? true,
      allowUnknown: options.allowUnknown ?? true,
      caseSensitive: options.caseSensitive ?? true,
      freezeConfig: options.freezeConfig ?? true,
      validateOnLoad: options.validateOnLoad ?? true,
      mergeArrays: options.mergeArrays ?? true,
    }

    this.loader = new ConfigLoader({
      configDir: this.options.configDir,
      caseSensitive: this.options.caseSensitive,
    })

    this.validator = new ConfigValidator({
      strict: this.options.strict,
      allowUnknown: this.options.allowUnknown,
    })

    this.envConfig = new EnvConfig({
      prefix: this.options.envPrefix,
      separator: this.options.envSeparator,
      caseSensitive: this.options.caseSensitive,
    })

    this.schemaValidator = new SchemaValidator()

    // 设置监听器
    this.setupEventListeners()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.loader.on('loaded', (data) => {
      this.emit('configLoaded', data)
    })

    this.loader.on('error', (error) => {
      this.emit('loadError', error)
    })

    this.validator.on('validated', (config) => {
      this.emit('configValidated', config)
    })

    this.validator.on('error', (error) => {
      this.emit('validationError', error)
    })
  }

  /**
   * 加载配置
   */
  async load(configFile?: string): Promise<void> {
    const file = configFile || this.options.configFile

    try {
      // 加载文件配置
      const fileConfig = await this.loader.load(file)

      // 加载环境变量配置
      const envConfig = this.envConfig.load()

      // 合并配置
      this.config = this.mergeConfigs(fileConfig, envConfig)

      // 验证配置
      if (this.options.validateOnLoad && this.schema) {
        await this.validate()
      }

      // 冻结配置
      if (this.options.freezeConfig) {
        this.freeze()
      }

      // 启动监听
      if (this.options.watch) {
        await this.startWatching(file)
      }

      this.emit('loaded', this.config)
    }
    catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 合并配置
   */
  private mergeConfigs(...configs: Record<string, unknown>[]): Record<string, unknown> {
    return configs.reduce<Record<string, unknown>>((merged, config) => {
      return ObjectUtils.deepMerge(merged, config, {
        mergeArrays: this.options.mergeArrays,
      }) as Record<string, unknown>
    }, {})
  }

  /**
   * 设置配置模式
   */
  setSchema(schema: ConfigSchema): void {
    this.schema = schema
    this.schemaValidator.setSchema(schema)
    this.emit('schemaSet', schema)
  }

  /**
   * 获取配置模式
   */
  getSchema(): ConfigSchema | undefined {
    return this.schema
  }

  /**
   * 验证配置
   */
  async validate(): Promise<boolean> {
    if (!this.schema) {
      throw new Error('No schema defined for validation')
    }

    try {
      const isValid = await this.schemaValidator.validate(this.config)

      if (!isValid) {
        const errors = this.schemaValidator.getErrors()
        this.emit('validationError', errors)
        return false
      }

      this.emit('validated', this.config)
      return true
    }
    catch (error) {
      this.emit('validationError', error)
      throw error
    }
  }

  /**
   * 获取配置值
   */
  get<T = unknown>(key: string, defaultValue?: T): T {
    return ObjectUtils.get(this.config, key, defaultValue as unknown as T) as T
  }

  /**
   * 设置配置值
   */
  set(key: string, value: ConfigValue): void {
    if (this.frozen) {
      throw new Error('Configuration is frozen and cannot be modified')
    }

    const oldValue = this.get(key)
    ObjectUtils.set(this.config, key, value)

    this.emit('changed', { key, oldValue, newValue: value })
    this.emit(`changed:${key}`, { oldValue, newValue: value })
  }

  /**
   * 检查配置键是否存在
   */
  has(key: string): boolean {
    return ObjectUtils.has(this.config, key)
  }

  /**
   * 删除配置键
   */
  delete(key: string): boolean {
    if (this.frozen) {
      throw new Error('Configuration is frozen and cannot be modified')
    }

    if (!this.has(key)) {
      return false
    }

    const oldValue = this.get(key)
    ObjectUtils.unset(this.config, key)

    this.emit('deleted', { key, oldValue })
    this.emit(`deleted:${key}`, { oldValue })

    return true
  }

  /**
   * 获取所有配置
   */
  getAll(): Record<string, unknown> {
    return ObjectUtils.deepClone(this.config) as Record<string, unknown>
  }

  /**
   * 设置多个配置
   */
  setAll(config: Record<string, unknown>): void {
    if (this.frozen) {
      throw new Error('Configuration is frozen and cannot be modified')
    }

    const oldConfig = this.getAll()
    this.config = this.mergeConfigs(this.config, config)

    this.emit('bulkChanged', { oldConfig, newConfig: this.getAll() })
  }

  /**
   * 重置配置
   */
  reset(): void {
    if (this.frozen) {
      throw new Error('Configuration is frozen and cannot be modified')
    }

    const oldConfig = this.getAll()
    this.config = {}

    this.emit('reset', { oldConfig })
  }

  /**
   * 冻结配置
   */
  freeze(): void {
    this.frozen = true
    Object.freeze(this.config)
    this.emit('frozen')
  }

  /**
   * 解冻配置
   */
  unfreeze(): void {
    this.frozen = false
    this.emit('unfrozen')
  }

  /**
   * 检查配置是否被冻结
   */
  isFrozen(): boolean {
    return this.frozen
  }

  /**
   * 开始监听配置文件变化
   */
  private async startWatching(configFile: string): Promise<void> {
    if (this.watcher) {
      await this.watcher.stop()
    }

    this.watcher = new ConfigWatcher({
      configFile,
      configDir: this.options.configDir,
    })

    this.watcher.on('changed', async () => {
      try {
        await this.reload()
      }
      catch (error) {
        this.emit('reloadError', error)
      }
    })

    await this.watcher.start()
  }

  /**
   * 重新加载配置
   */
  async reload(): Promise<void> {
    const oldConfig = this.getAll()

    try {
      await this.load()
      this.emit('reloaded', { oldConfig, newConfig: this.getAll() })
    }
    catch (error) {
      this.emit('reloadError', error)
      throw error
    }
  }

  /**
   * 保存配置到文件
   */
  async save(configFile?: string): Promise<void> {
    const file = configFile || this.options.configFile

    try {
      await this.loader.save(file, this.config)
      this.emit('saved', { file, config: this.config })
    }
    catch (error) {
      this.emit('saveError', error)
      throw error
    }
  }

  /**
   * 导出配置
   */
  export(format: 'json' | 'yaml' | 'toml' = 'json'): string {
    return this.loader.export(this.config, format)
  }

  /**
   * 从字符串导入配置
   */
  import(data: string, format: 'json' | 'yaml' | 'toml' = 'json'): void {
    if (this.frozen) {
      throw new Error('Configuration is frozen and cannot be modified')
    }

    const importedConfig = this.loader.import(data, format)
    this.setAll(importedConfig)
  }

  /**
   * 获取配置统计信息
   */
  getStats(): ConfigStats {
    const flatConfig = ObjectUtils.flatten(this.config)
    const keys = Object.keys(flatConfig)

    return {
      totalKeys: keys.length,
      frozenState: this.frozen,
      hasSchema: !!this.schema,
      watchEnabled: !!this.watcher,
      configSize: JSON.stringify(this.config).length,
      lastModified: new Date(),
    }
  }

  /**
   * 销毁配置管理器
   */
  async destroy(): Promise<void> {
    if (this.watcher) {
      await this.watcher.stop()
      this.watcher = undefined
    }

    this.config = {}
    this.schema = undefined
    this.removeAllListeners()

    this.emit('destroyed')
  }

  /**
   * 创建配置管理器实例
   */
  static create(options?: ConfigOptions): ConfigManager {
    return new ConfigManager(options)
  }

  /**
   * 从文件创建配置管理器
   */
  static async fromFile(configFile: string, options?: ConfigOptions): Promise<ConfigManager> {
    const manager = new ConfigManager({ ...options, configFile })
    await manager.load()
    return manager
  }
}

/**
 * 配置统计信息
 */
export interface ConfigStats {
  totalKeys: number
  frozenState: boolean
  hasSchema: boolean
  watchEnabled: boolean
  configSize: number
  lastModified: Date
}
