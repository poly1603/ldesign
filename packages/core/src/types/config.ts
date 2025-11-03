/**
 * 配置管理类型定义
 */

import type { DeepPartial } from './base'

/**
 * 配置管理器接口
 */
export interface ConfigManager {
  /** 获取配置 */
  get<T = any>(path: string, defaultValue?: T): T

  /** 设置配置 */
  set(path: string, value: any): void

  /** 检查配置是否存在 */
  has(path: string): boolean

  /** 删除配置 */
  delete(path: string): boolean

  /** 合并配置 */
  merge(config: Record<string, any>): void

  /** 获取所有配置 */
  getAll(): Record<string, any>

  /** 重置配置 */
  reset(): void

  /** 初始化和销毁 */
  init?(): Promise<void>
  destroy?(): Promise<void>
}

/**
 * 引擎配置
 */
export interface EngineConfig {
  /** 应用名称 */
  name?: string
  /** 应用版本 */
  version?: string
  /** 调试模式 */
  debug?: boolean
  /** 环境 */
  environment?: 'development' | 'production' | 'test'
  /** 自定义配置 */
  [key: string]: any
}

