/**
 * 配置管理器基类
 * @module ConfigManager
 * @description 提供配置管理的基础功能，支持配置合并、验证、转换等操作
 */

import { deepMerge, cloneDeep } from '../utils'
import type { BaseBuilderConfig } from '../types'

/**
 * 配置验证规则
 */
export interface ConfigValidationRule {
  field: string
  validator: (value: any) => boolean | string
  message?: string
}

/**
 * 配置转换器
 */
export interface ConfigTransformer {
  field: string
  transformer: (value: any, config: any) => any
}

/**
 * 配置管理器选项
 */
export interface ConfigManagerOptions {
  defaults?: Record<string, any>
  validationRules?: ConfigValidationRule[]
  transformers?: ConfigTransformer[]
  required?: string[]
}

/**
 * 配置管理器基类
 * @class ConfigManager
 * @template T 配置类型
 */
export class ConfigManager<T extends BaseBuilderConfig = BaseBuilderConfig> {
  /**
   * 当前配置
   */
  protected config: T

  /**
   * 默认配置
   */
  protected defaults: Partial<T>

  /**
   * 验证规则
   */
  protected validationRules: ConfigValidationRule[]

  /**
   * 转换器
   */
  protected transformers: ConfigTransformer[]

  /**
   * 必需字段
   */
  protected requiredFields: string[]

  /**
   * 配置历史
   */
  protected configHistory: T[] = []

  /**
   * 最大历史记录数
   */
  protected maxHistorySize = 10

  constructor(config: T, options: ConfigManagerOptions = {}) {
    this.defaults = (options.defaults || {}) as Partial<T>
    this.validationRules = options.validationRules || []
    this.transformers = options.transformers || []
    this.requiredFields = options.required || []
    
    // 初始化配置
    this.config = this.normalizeConfig(config)
    this.saveToHistory()
  }

  /**
   * 标准化配置
   */
  protected normalizeConfig(config: Partial<T>): T {
    // 合并默认配置
    let normalized = deepMerge(this.defaults, config) as T
    
    // 应用转换器
    normalized = this.applyTransformers(normalized)
    
    // 验证配置
    this.validateConfig(normalized)
    
    return normalized
  }

  /**
   * 应用转换器
   */
  protected applyTransformers(config: T): T {
    let transformed = cloneDeep(config)
    
    for (const transformer of this.transformers) {
      const value = this.getFieldValue(transformed, transformer.field)
      if (value !== undefined) {
        this.setFieldValue(
          transformed,
          transformer.field,
          transformer.transformer(value, transformed)
        )
      }
    }
    
    return transformed
  }

  /**
   * 验证配置
   */
  protected validateConfig(config: T): void {
    // 检查必需字段
    for (const field of this.requiredFields) {
      const value = this.getFieldValue(config, field)
      if (value === undefined || value === null) {
        throw new Error(`配置字段 "${field}" 是必需的`)
      }
    }
    
    // 执行验证规则
    for (const rule of this.validationRules) {
      const value = this.getFieldValue(config, rule.field)
      if (value !== undefined) {
        const result = rule.validator(value)
        if (result !== true) {
          const message = typeof result === 'string' 
            ? result 
            : rule.message || `配置字段 "${rule.field}" 验证失败`
          throw new Error(message)
        }
      }
    }
  }

  /**
   * 获取字段值
   */
  protected getFieldValue(obj: any, field: string): any {
    const keys = field.split('.')
    let value = obj
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key]
      } else {
        return undefined
      }
    }
    
    return value
  }

  /**
   * 设置字段值
   */
  protected setFieldValue(obj: any, field: string, value: any): void {
    const keys = field.split('.')
    const lastKey = keys.pop()!
    
    let target = obj
    for (const key of keys) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {}
      }
      target = target[key]
    }
    
    target[lastKey] = value
  }

  /**
   * 获取当前配置
   */
  getConfig(): T {
    return cloneDeep(this.config)
  }

  /**
   * 获取配置字段
   */
  get<K extends keyof T>(field: K): T[K]
  get(field: string): any
  get(field: string | keyof T): any {
    if (typeof field === 'string' && field.includes('.')) {
      return this.getFieldValue(this.config, field)
    }
    return this.config[field as keyof T]
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<T>): void {
    this.saveToHistory()
    this.config = this.normalizeConfig({ ...this.config, ...config })
  }

  /**
   * 更新配置字段
   */
  set<K extends keyof T>(field: K, value: T[K]): void
  set(field: string, value: any): void
  set(field: string | keyof T, value: any): void {
    this.saveToHistory()
    
    if (typeof field === 'string' && field.includes('.')) {
      const config = cloneDeep(this.config)
      this.setFieldValue(config, field, value)
      this.config = this.normalizeConfig(config)
    } else {
      this.config = this.normalizeConfig({
        ...this.config,
        [field]: value
      })
    }
  }

  /**
   * 合并配置
   */
  merge(config: Partial<T>): void {
    this.saveToHistory()
    this.config = this.normalizeConfig(deepMerge(this.config, config) as T)
  }

  /**
   * 重置配置
   */
  reset(): void {
    this.saveToHistory()
    this.config = this.normalizeConfig(this.defaults)
  }

  /**
   * 保存到历史
   */
  protected saveToHistory(): void {
    this.configHistory.push(cloneDeep(this.config))
    
    // 限制历史记录大小
    if (this.configHistory.length > this.maxHistorySize) {
      this.configHistory.shift()
    }
  }

  /**
   * 撤销配置更改
   */
  undo(): boolean {
    if (this.configHistory.length > 1) {
      this.configHistory.pop() // 移除当前配置
      const previousConfig = this.configHistory[this.configHistory.length - 1]
      this.config = cloneDeep(previousConfig)
      return true
    }
    return false
  }

  /**
   * 导出配置
   */
  export(): string {
    return JSON.stringify(this.config, null, 2)
  }

  /**
   * 导入配置
   */
  import(configString: string): void {
    try {
      const config = JSON.parse(configString)
      this.setConfig(config)
    } catch (error) {
      throw new Error(`无法解析配置: ${error}`)
    }
  }

  /**
   * 添加验证规则
   */
  addValidationRule(rule: ConfigValidationRule): void {
    this.validationRules.push(rule)
    // 重新验证当前配置
    this.validateConfig(this.config)
  }

  /**
   * 添加转换器
   */
  addTransformer(transformer: ConfigTransformer): void {
    this.transformers.push(transformer)
    // 重新应用转换器
    this.config = this.applyTransformers(this.config)
  }

  /**
   * 获取配置架构
   */
  getSchema(): Record<string, any> {
    return {
      defaults: this.defaults,
      required: this.requiredFields,
      validationRules: this.validationRules.map(rule => ({
        field: rule.field,
        message: rule.message
      }))
    }
  }

  /**
   * 比较配置
   */
  diff(other: Partial<T>): Record<string, { old: any; new: any }> {
    const differences: Record<string, { old: any; new: any }> = {}
    
    const checkDiff = (obj1: any, obj2: any, path = '') => {
      for (const key in obj2) {
        const currentPath = path ? `${path}.${key}` : key
        const value1 = obj1?.[key]
        const value2 = obj2[key]
        
        if (typeof value2 === 'object' && value2 !== null && !Array.isArray(value2)) {
          checkDiff(value1, value2, currentPath)
        } else if (value1 !== value2) {
          differences[currentPath] = {
            old: value1,
            new: value2
          }
        }
      }
    }
    
    checkDiff(this.config, other)
    return differences
  }

  /**
   * 克隆配置管理器
   */
  clone(): ConfigManager<T> {
    return new ConfigManager(this.config, {
      defaults: this.defaults,
      validationRules: [...this.validationRules],
      transformers: [...this.transformers],
      required: [...this.requiredFields]
    })
  }
}
