/**
 * 核心类型定义
 * 
 * 定义系统的基础类型，包括设备类型、缓存策略等
 */

import type { Component } from 'vue'

/**
 * 设备类型
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * 缓存策略
 */
export type CacheStrategy = 'lru' | 'lfu' | 'fifo' | 'none'

/**
 * 日志级别
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * 加载状态
 */
export interface LoadState {
  loading: boolean
  error: Error | null
  loaded: boolean
}

/**
 * 设备断点配置
 */
export interface DeviceBreakpoints {
  mobile: number
  tablet: number
  desktop: number
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  enabled: boolean
  strategy: CacheStrategy
  maxSize: number
  ttl?: number
}

/**
 * 设备检测配置
 */
export interface DeviceConfig {
  breakpoints: DeviceBreakpoints
  defaultDevice?: DeviceType
  enableResponsive?: boolean
  customDetector?: (width: number, height: number) => DeviceType
}

/**
 * 日志配置
 */
export interface LoggerConfig {
  level: LogLevel
  prefix?: string
  enabled?: boolean
}

/**
 * 模板元数据
 */
export interface TemplateMetadata {
  /** 模板名称 */
  name: string
  /** 显示名称 */
  displayName: string
  /** 描述 */
  description: string
  /** 版本 */
  version: string
  /** 作者 */
  author?: string
  /** 标签 */
  tags?: string[]
  /** 分类 */
  category: string
  /** 设备类型 */
  device: DeviceType
  /** 是否为默认模板 */
  isDefault?: boolean
  /** 预览图 */
  preview?: string
  /** 最后修改时间 */
  lastModified?: number
  /** 模板分组 */
  group?: string
}

/**
 * 模板ID（格式：category:device:name）
 */
export type TemplateId = string

/**
 * 模板注册信息
 */
export interface TemplateRegistration {
  id: TemplateId
  metadata: TemplateMetadata
  component?: Component
  loader?: () => Promise<{ default: Component }>
}

/**
 * 模板加载结果
 */
export interface TemplateLoadResult {
  id: TemplateId
  component: Component
  metadata: TemplateMetadata
  cached: boolean
  loadTime: number
}

/**
 * 模板查询选项
 */
export interface TemplateQueryOptions {
  category?: string
  device?: DeviceType
  name?: string
  tags?: string[]
  group?: string
  isDefault?: boolean
  sort?: 'name' | 'lastModified' | 'version'
  order?: 'asc' | 'desc'
}

/**
 * 模板切换选项
 */
export interface TemplateSwitchOptions {
  animation?: boolean
  duration?: number
  onBeforeSwitch?: () => void | Promise<void>
  onAfterSwitch?: () => void | Promise<void>
}

/**
 * 模板过滤器
 */
export type TemplateFilter = (registration: TemplateRegistration) => boolean

/**
 * 生命周期钩子
 */
export interface LifecycleHooks {
  onBeforeLoad?: (id: TemplateId) => void | Promise<void>
  onAfterLoad?: (id: TemplateId, component: Component) => void | Promise<void>
  onError?: (id: TemplateId, error: Error) => void | Promise<void>
  onBeforeSwitch?: (from: TemplateId | null, to: TemplateId) => void | Promise<void>
  onAfterSwitch?: (from: TemplateId | null, to: TemplateId) => void | Promise<void>
  onCacheEvict?: (id: TemplateId) => void | Promise<void>
}

/**
 * 系统配置
 */
export interface SystemConfig {
  /** 缓存配置 */
  cache?: Partial<CacheConfig>
  /** 设备配置 */
  device?: Partial<DeviceConfig>
  /** 日志配置 */
  logger?: Partial<LoggerConfig>
  /** 生命周期钩子 */
  hooks?: LifecycleHooks
  /** 是否启用调试 */
  debug?: boolean
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 模板加载次数 */
  loadCount: number
  /** 平均加载时间 */
  avgLoadTime: number
  /** 最小加载时间 */
  minLoadTime: number
  /** 最大加载时间 */
  maxLoadTime: number
  /** 缓存命中率 */
  cacheHitRate: number
  /** 错误次数 */
  errorCount: number
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  size: number
  maxSize: number
  hitCount: number
  missCount: number
  evictCount: number
  hitRate: number
}

/**
 * 事件类型
 */
export type EventType =
  | 'template:registered'
  | 'template:unregistered'
  | 'template:loading'
  | 'template:loaded'
  | 'template:error'
  | 'template:switched'
  | 'cache:hit'
  | 'cache:miss'
  | 'cache:evict'
  | 'device:changed'

/**
 * 事件监听器
 */
export type EventListener<T = any> = (data: T) => void | Promise<void>

/**
 * 事件取消函数
 */
export type UnsubscribeFn = () => void
