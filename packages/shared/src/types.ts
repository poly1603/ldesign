/**
 * 共享类型定义
 */

import type { Ref, App } from 'vue'

/**
 * 插件配置基础接口
 */
export interface PluginOptions<T = any> {
  /**
   * 语言设置
   * 支持字符串或响应式引用
   */
  locale?: string | Ref<string>
  
  /**
   * 插件特定配置
   */
  config?: T
  
  /**
   * 是否持久化
   */
  persist?: boolean
  
  /**
   * 存储键前缀
   */
  storageKey?: string
}

/**
 * 插件基础接口
 */
export interface Plugin<T = any> {
  /**
   * 插件名称
   */
  name: string
  
  /**
   * 插件版本
   */
  version?: string
  
  /**
   * Vue 插件安装方法
   */
  install(app: App): void
  
  /**
   * 销毁方法
   */
  destroy?(): void
  
  /**
   * 插件选项
   */
  options?: PluginOptions<T>
}

/**
 * 可本地化的插件
 */
export interface LocalizablePlugin extends Plugin {
  /**
   * 当前语言
   */
  locale: Ref<string>
  
  /**
   * 设置语言
   */
  setLocale(locale: string): void
}

/**
 * 主题化插件
 */
export interface ThemeablePlugin extends Plugin {
  /**
   * 当前主题
   */
  theme: Ref<string>
  
  /**
   * 设置主题
   */
  setTheme(theme: string): void
}

/**
 * 存储适配器接口
 */
export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

/**
 * 事件发射器接口
 */
export interface EventEmitter<T = any> {
  on(event: string, handler: (data: T) => void): void
  off(event: string, handler: (data: T) => void): void
  emit(event: string, data: T): void
  once(event: string, handler: (data: T) => void): void
}

/**
 * 钩子函数
 */
export interface Hooks {
  /**
   * 变更前钩子
   * 返回 false 可取消变更
   */
  beforeChange?<T>(newValue: T, oldValue: T): boolean | Promise<boolean>
  
  /**
   * 变更后钩子
   */
  afterChange?<T>(newValue: T): void | Promise<void>
  
  /**
   * 错误处理钩子
   */
  onError?(error: Error): void
}

/**
 * 判断是否为 Ref 类型
 */
export function isRef<T = any>(value: any): value is Ref<T> {
  return value && typeof value === 'object' && 'value' in value && '_rawValue' in value
}

/**
 * 判断是否为 Promise
 */
export function isPromise<T = any>(value: any): value is Promise<T> {
  return value && typeof value.then === 'function'
}

/**
 * 安全地获取 Ref 的值
 */
export function unref<T>(value: T | Ref<T>): T {
  return isRef(value) ? value.value : value
}