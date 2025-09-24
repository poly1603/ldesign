/**
 * 工厂函数相关类型定义
 */

import type { TemplateSystemConfig } from './config'
import type { ScannerOptions, ScannerCallbacks } from '../scanner/types'

/**
 * 模板扫描器工厂配置
 */
export interface TemplateScannerFactoryConfig {
  /** 系统配置 */
  config: TemplateSystemConfig
  /** 回调函数 */
  callbacks?: ScannerCallbacks
}

/**
 * 简单扫描器工厂配置
 */
export interface SimpleTemplateScannerFactoryConfig {
  /** 模板目录 */
  templatesDir: string
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 是否启用热更新 */
  enableHMR?: boolean
}

/**
 * 缓存配置工厂参数
 */
export interface CacheConfigFactoryParams {
  /** 是否启用缓存 */
  enabled?: boolean
  /** 缓存策略 */
  strategy?: 'lru' | 'fifo'
  /** 最大缓存大小 */
  maxSize?: number
  /** 缓存过期时间 */
  ttl?: number
  /** 检查周期 */
  checkPeriod?: number
}

/**
 * 设备配置工厂参数
 */
export interface DeviceConfigFactoryParams {
  /** 移动端断点 */
  mobile?: number
  /** 平板端断点 */
  tablet?: number
  /** 桌面端断点 */
  desktop?: number
}

/**
 * 工厂函数返回类型
 */
export interface FactoryReturnTypes {
  /** 缓存配置 */
  CacheConfig: {
    enabled: boolean
    strategy: 'lru' | 'fifo'
    maxSize: number
    ttl: number
    checkPeriod: number
  }
  
  /** 设备配置 */
  DeviceConfig: {
    breakpoints: {
      mobile: number
      tablet: number
      desktop: number
    }
  }
}

/**
 * 工厂函数类型映射
 */
export interface FactoryFunctions {
  /** 创建模板扫描器 */
  createTemplateScanner: (config: TemplateSystemConfig, callbacks?: ScannerCallbacks) => any
  
  /** 创建简单模板扫描器 */
  createSimpleTemplateScanner: (
    templatesDir: string,
    enableCache?: boolean,
    enableHMR?: boolean
  ) => any
  
  /** 创建缓存配置 */
  createCacheConfig: (
    enabled?: boolean,
    strategy?: 'lru' | 'fifo',
    maxSize?: number,
    ttl?: number,
    checkPeriod?: number
  ) => FactoryReturnTypes['CacheConfig']
  
  /** 创建设备配置 */
  createDeviceConfig: (
    mobile?: number,
    tablet?: number,
    desktop?: number
  ) => FactoryReturnTypes['DeviceConfig']
}
