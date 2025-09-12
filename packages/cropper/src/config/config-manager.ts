/**
 * @file 配置管理器
 * @description 统一管理裁剪器的所有配置选项
 */

import { EventEmitter } from '@/core/event-emitter'
import type { CropperOptions, ThemeConfig, I18nConfig } from '@/types'

/**
 * 配置变更事件数据
 */
export interface ConfigChangeEvent {
  /** 变更的配置键 */
  key: string
  /** 旧值 */
  oldValue: any
  /** 新值 */
  newValue: any
  /** 变更时间戳 */
  timestamp: number
}

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
}

/**
 * 配置管理器类
 * 负责配置的存储、验证、变更通知等
 */
export class ConfigManager extends EventEmitter {
  /** 当前配置 */
  private config: CropperOptions

  /** 默认配置 */
  private defaultConfig: CropperOptions

  /** 配置验证规则 */
  private validationRules: Map<string, (value: any) => ConfigValidationResult>

  /** 配置变更历史 */
  private changeHistory: ConfigChangeEvent[] = []

  /** 最大历史记录数 */
  private maxHistorySize = 100

  /**
   * 构造函数
   * @param initialConfig 初始配置
   */
  constructor(initialConfig: Partial<CropperOptions> = {}) {
    super()

    // 设置默认配置
    this.defaultConfig = this.getDefaultConfig()
    
    // 合并初始配置
    this.config = { ...this.defaultConfig, ...initialConfig }
    
    // 初始化验证规则
    this.validationRules = new Map()
    this.setupValidationRules()
    
    // 验证初始配置
    this.validateConfig()
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): CropperOptions {
    return {
      // 基础配置
      aspectRatio: null,
      minWidth: 0,
      minHeight: 0,
      maxWidth: Infinity,
      maxHeight: Infinity,
      initialCropArea: null,
      cropShape: 'rectangle',
      
      // 交互配置
      enableResize: true,
      enableMove: true,
      enableRotate: true,
      enableFlip: true,
      
      // 显示配置
      showGrid: true,
      showCenterLines: false,
      gridLines: 2,
      
      // 输出配置
      quality: 0.92,
      format: 'image/png',
      backgroundColor: 'transparent',
      smoothing: true,
      pixelRatio: window.devicePixelRatio || 1,
      
      // 主题配置
      theme: {
        mode: 'light',
        primaryColor: '#722ED1',
        borderColor: '#d9d9d9',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        customCSS: {}
      },
      
      // 国际化配置
      i18n: {
        locale: 'zh-CN',
        messages: {},
        fallbackLocale: 'en-US'
      },
      
      // 工具栏配置
      toolbar: {
        enabled: true,
        position: 'top',
        tools: ['zoom-in', 'zoom-out', 'rotate-left', 'rotate-right', 'flip-horizontal', 'flip-vertical', 'reset'],
        buttonSize: 'medium',
        showLabels: false
      }
    }
  }

  /**
   * 设置验证规则
   */
  private setupValidationRules(): void {
    // 宽高比验证
    this.validationRules.set('aspectRatio', (value) => {
      const errors: string[] = []
      const warnings: string[] = []
      
      if (value !== null && (typeof value !== 'number' || value <= 0)) {
        errors.push('aspectRatio must be a positive number or null')
      }
      
      return { valid: errors.length === 0, errors, warnings }
    })

    // 尺寸验证
    this.validationRules.set('minWidth', (value) => {
      const errors: string[] = []
      const warnings: string[] = []
      
      if (typeof value !== 'number' || value < 0) {
        errors.push('minWidth must be a non-negative number')
      }
      
      return { valid: errors.length === 0, errors, warnings }
    })

    this.validationRules.set('minHeight', (value) => {
      const errors: string[] = []
      const warnings: string[] = []
      
      if (typeof value !== 'number' || value < 0) {
        errors.push('minHeight must be a non-negative number')
      }
      
      return { valid: errors.length === 0, errors, warnings }
    })

    // 质量验证
    this.validationRules.set('quality', (value) => {
      const errors: string[] = []
      const warnings: string[] = []
      
      if (typeof value !== 'number' || value < 0 || value > 1) {
        errors.push('quality must be a number between 0 and 1')
      }
      
      if (value < 0.5) {
        warnings.push('quality below 0.5 may result in poor image quality')
      }
      
      return { valid: errors.length === 0, errors, warnings }
    })

    // 像素比验证
    this.validationRules.set('pixelRatio', (value) => {
      const errors: string[] = []
      const warnings: string[] = []
      
      if (typeof value !== 'number' || value <= 0) {
        errors.push('pixelRatio must be a positive number')
      }
      
      if (value > 3) {
        warnings.push('pixelRatio above 3 may impact performance')
      }
      
      return { valid: errors.length === 0, errors, warnings }
    })
  }

  /**
   * 获取配置值
   * @param key 配置键，支持点号分隔的嵌套键
   */
  get<T = any>(key: string): T {
    return this.getNestedValue(this.config, key)
  }

  /**
   * 设置配置值
   * @param key 配置键，支持点号分隔的嵌套键
   * @param value 配置值
   */
  set(key: string, value: any): void {
    const oldValue = this.get(key)
    
    // 验证新值
    const validation = this.validateValue(key, value)
    if (!validation.valid) {
      throw new Error(`Invalid config value for ${key}: ${validation.errors.join(', ')}`)
    }
    
    // 设置新值
    this.setNestedValue(this.config, key, value)
    
    // 记录变更
    const changeEvent: ConfigChangeEvent = {
      key,
      oldValue,
      newValue: value,
      timestamp: Date.now()
    }
    
    this.addToHistory(changeEvent)
    
    // 触发变更事件
    this.emit('configChange', changeEvent)
    this.emit(`configChange:${key}`, changeEvent)
    
    // 输出警告
    if (validation.warnings.length > 0) {
      console.warn(`Config warnings for ${key}:`, validation.warnings)
    }
  }

  /**
   * 批量设置配置
   * @param config 配置对象
   */
  setMultiple(config: Partial<CropperOptions>): void {
    const changes: ConfigChangeEvent[] = []
    
    // 收集所有变更
    for (const [key, value] of Object.entries(config)) {
      const oldValue = this.get(key)
      if (oldValue !== value) {
        changes.push({
          key,
          oldValue,
          newValue: value,
          timestamp: Date.now()
        })
      }
    }
    
    // 验证所有变更
    for (const change of changes) {
      const validation = this.validateValue(change.key, change.newValue)
      if (!validation.valid) {
        throw new Error(`Invalid config value for ${change.key}: ${validation.errors.join(', ')}`)
      }
    }
    
    // 应用所有变更
    for (const change of changes) {
      this.setNestedValue(this.config, change.key, change.newValue)
      this.addToHistory(change)
    }
    
    // 触发批量变更事件
    this.emit('configBatchChange', changes)
    
    // 触发单个变更事件
    for (const change of changes) {
      this.emit('configChange', change)
      this.emit(`configChange:${change.key}`, change)
    }
  }

  /**
   * 重置配置到默认值
   * @param keys 要重置的配置键，如果不提供则重置所有配置
   */
  reset(keys?: string[]): void {
    if (keys) {
      const resetConfig: Partial<CropperOptions> = {}
      for (const key of keys) {
        resetConfig[key as keyof CropperOptions] = this.getNestedValue(this.defaultConfig, key)
      }
      this.setMultiple(resetConfig)
    } else {
      this.config = { ...this.defaultConfig }
      this.emit('configReset')
    }
  }

  /**
   * 获取完整配置
   */
  getAll(): CropperOptions {
    return { ...this.config }
  }

  /**
   * 验证配置
   */
  validateConfig(): ConfigValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    for (const [key, rule] of this.validationRules.entries()) {
      const value = this.get(key)
      const result = rule(value)
      
      errors.push(...result.errors)
      warnings.push(...result.warnings)
    }
    
    return { valid: errors.length === 0, errors, warnings }
  }

  /**
   * 验证单个值
   */
  private validateValue(key: string, value: any): ConfigValidationResult {
    const rule = this.validationRules.get(key)
    if (rule) {
      return rule(value)
    }
    
    return { valid: true, errors: [], warnings: [] }
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, key: string): any {
    const keys = key.split('.')
    let current = obj
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return undefined
      }
    }
    
    return current
  }

  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: any, key: string, value: any): void {
    const keys = key.split('.')
    const lastKey = keys.pop()!
    let current = obj
    
    for (const k of keys) {
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {}
      }
      current = current[k]
    }
    
    current[lastKey] = value
  }

  /**
   * 添加到变更历史
   */
  private addToHistory(change: ConfigChangeEvent): void {
    this.changeHistory.push(change)
    
    // 限制历史记录数量
    if (this.changeHistory.length > this.maxHistorySize) {
      this.changeHistory.shift()
    }
  }

  /**
   * 获取变更历史
   */
  getChangeHistory(): ConfigChangeEvent[] {
    return [...this.changeHistory]
  }

  /**
   * 清空变更历史
   */
  clearHistory(): void {
    this.changeHistory = []
  }

  /**
   * 销毁配置管理器
   */
  destroy(): void {
    this.removeAllListeners()
    this.changeHistory = []
    this.validationRules.clear()
  }
}
