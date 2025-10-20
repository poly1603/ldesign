/**
 * 插件基类
 * 提供通用的插件功能，减少重复代码
 */

import type { Editor } from '../Editor'
import { EventEmitter } from '../EventEmitter'

/**
 * 插件基础配置
 */
export interface BasePluginConfig {
  enabled?: boolean
  toolbar?: {
    visible?: boolean
    position?: 'left' | 'right' | 'center'
    order?: number
  }
  [key: string]: any
}

/**
 * 插件基类
 */
export abstract class BasePlugin<T extends BasePluginConfig = BasePluginConfig> extends EventEmitter {
  public name: string
  public config: T
  protected editor?: Editor
  protected initialized: boolean = false
  
  constructor(name: string, config: T) {
    super()
    this.name = name
    this.config = { ...this.getDefaultConfig(), ...config } as T
  }
  
  /**
   * 获取默认配置
   */
  protected abstract getDefaultConfig(): Partial<T>
  
  /**
   * 初始化插件
   */
  async init(editor: Editor): Promise<void> {
    if (this.initialized) {
      console.warn(`Plugin "${this.name}" is already initialized`)
      return
    }
    
    this.editor = editor
    
    try {
      await this.onInit()
      this.initialized = true
      this.emit('plugin:initialized', { name: this.name })
    } catch (error) {
      console.error(`Failed to initialize plugin "${this.name}":`, error)
      throw error
    }
  }
  
  /**
   * 插件初始化逻辑（子类实现）
   */
  protected abstract onInit(): Promise<void> | void
  
  /**
   * 销毁插件
   */
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return
    }
    
    try {
      await this.onDestroy()
      this.initialized = false
      this.removeAllListeners()
      this.emit('plugin:destroyed', { name: this.name })
    } catch (error) {
      console.error(`Failed to destroy plugin "${this.name}":`, error)
      throw error
    }
  }
  
  /**
   * 插件销毁逻辑（子类实现）
   */
  protected abstract onDestroy(): Promise<void> | void
  
  /**
   * 更新配置
   */
  updateConfig(config: Partial<T>): void {
    this.config = { ...this.config, ...config }
    this.onConfigUpdate(config)
    this.emit('plugin:config-updated', { name: this.name, config })
  }
  
  /**
   * 配置更新回调（子类可选实现）
   */
  protected onConfigUpdate(config: Partial<T>): void {
    // 子类可选择实现
  }
  
  /**
   * 启用插件
   */
  enable(): void {
    if (!this.config.enabled) {
      this.config.enabled = true
      this.onEnable()
      this.emit('plugin:enabled', { name: this.name })
    }
  }
  
  /**
   * 禁用插件
   */
  disable(): void {
    if (this.config.enabled) {
      this.config.enabled = false
      this.onDisable()
      this.emit('plugin:disabled', { name: this.name })
    }
  }
  
  /**
   * 启用回调（子类可选实现）
   */
  protected onEnable(): void {
    // 子类可选择实现
  }
  
  /**
   * 禁用回调（子类可选实现）
   */
  protected onDisable(): void {
    // 子类可选择实现
  }
  
  /**
   * 检查插件是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized
  }
  
  /**
   * 检查插件是否已启用
   */
  isEnabled(): boolean {
    return this.config.enabled !== false
  }
  
  /**
   * 获取编辑器实例
   */
  protected getEditor(): Editor {
    if (!this.editor) {
      throw new Error('Editor instance is not available')
    }
    return this.editor
  }
}






