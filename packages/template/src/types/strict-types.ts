/**
 * 严格类型定义
 * 提供更严格的类型约束，避免使用any类型
 */

import type { Component, PropType, VNode } from 'vue'
import type { DeviceType } from './template'

/**
 * 严格的属性类型定义
 */
export interface StrictPropDefinition<T = unknown> {
  type: PropType<T>
  default?: T | (() => T)
  required?: boolean
  validator?: (value: T) => boolean
}

/**
 * 严格的组件属性映射
 */
export type StrictPropsMap = Record<string, StrictPropDefinition | PropType<unknown>>

/**
 * 严格的事件处理器类型
 */
export interface StrictEventHandler<T = unknown> {
  (event: T): void | Promise<void>
}

/**
 * 严格的事件映射
 */
export type StrictEventsMap = Record<string, StrictEventHandler>

/**
 * 严格的插槽定义
 */
export interface StrictSlotDefinition {
  name: string
  props?: Record<string, unknown>
  description?: string
  required?: boolean
}

/**
 * 严格的组件定义
 */
export interface StrictComponentDefinition {
  name: string
  props?: StrictPropsMap
  emits?: string[] | StrictEventsMap
  slots?: StrictSlotDefinition[]
  setup?: (props: Record<string, unknown>, context: {
    attrs: Record<string, unknown>
    slots: Record<string, (...args: unknown[]) => VNode[]>
    emit: (event: string, ...args: unknown[]) => void
    expose: (exposed: Record<string, unknown>) => void
  }) => Record<string, unknown> | (() => VNode)
}

/**
 * 严格的模板配置类型
 */
export interface StrictTemplateConfig {
  name: string
  displayName: string
  description: string
  version: string
  author?: string
  isDefault?: boolean
  tags?: string[]
  preview?: string
  props?: StrictPropsMap
  slots?: StrictSlotDefinition[]
  dependencies?: string[]
  minVueVersion?: string
  category?: string
  device?: DeviceType
}

/**
 * 严格的模板元数据类型
 */
export interface StrictTemplateMetadata extends StrictTemplateConfig {
  id: string
  category: string
  device: DeviceType
  componentPath: string
  componentLoader: () => Promise<Component>
  stylePath?: string
  configPath: string
  lastModified: number
  isBuiltIn: boolean
}

/**
 * 严格的扫描结果类型
 */
export interface StrictScanResult {
  templates: Map<string, Map<DeviceType, Map<string, StrictTemplateMetadata>>>
  stats: {
    totalTemplates: number
    byCategory: Record<string, number>
    byDevice: Record<DeviceType, number>
    scanTime: number
    lastScanTime: number
  }
  errors: Array<{
    type: 'config' | 'component' | 'style' | 'scan'
    message: string
    path: string
    details?: Record<string, unknown>
  }>
}

/**
 * 严格的缓存项类型
 */
export interface StrictCacheItem<T = unknown> {
  key: string
  value: T
  timestamp: number
  ttl?: number
  size?: number
  metadata?: Record<string, unknown>
}

/**
 * 严格的缓存统计类型
 */
export interface StrictCacheStats {
  totalSize: number
  itemCount: number
  hitRate: number
  missRate: number
  evictionCount: number
  lastAccess: number
  memoryUsage: number
}

/**
 * 严格的文件监听事件类型
 */
export interface StrictFileWatchEvent {
  type: 'added' | 'changed' | 'removed'
  path: string
  filename: string
  timestamp: number
  size?: number
  metadata?: {
    category?: string
    device?: DeviceType
    templateName?: string
    fileType?: 'config' | 'component' | 'style' | 'preview'
  }
}

/**
 * 严格的热更新事件类型
 */
export interface StrictHotReloadEvent {
  type: 'template-added' | 'template-updated' | 'template-removed' | 'config-updated' | 'style-updated' | 'component-updated'
  template: {
    category: string
    device: DeviceType
    name: string
  }
  filePath: string
  timestamp: number
  data?: Record<string, unknown>
}

/**
 * 严格的配置验证结果类型
 */
export interface StrictConfigValidationResult {
  valid: boolean
  errors: Array<{
    field: string
    message: string
    value?: unknown
    expected?: string
  }>
  warnings: Array<{
    field: string
    message: string
    suggestion?: string
  }>
  fixedConfig?: Record<string, unknown>
}

/**
 * 严格的性能指标类型
 */
export interface StrictPerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  bundleSize: number
  cacheHitRate: number
  errorRate: number
  timestamp: number
}

/**
 * 严格的错误类型
 */
export interface StrictError {
  code: string
  message: string
  stack?: string
  context?: Record<string, unknown>
  timestamp: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * 严格的日志条目类型
 */
export interface StrictLogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: number
  category?: string
  data?: Record<string, unknown>
  error?: StrictError
}

/**
 * 严格的API响应类型
 */
export interface StrictApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: StrictError
  metadata?: {
    timestamp: number
    requestId?: string
    version?: string
  }
}

/**
 * 严格的分页结果类型
 */
export interface StrictPaginatedResult<T = unknown> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * 严格的搜索结果类型
 */
export interface StrictSearchResult<T = unknown> {
  items: T[]
  total: number
  query: string
  filters?: Record<string, unknown>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  executionTime: number
}

/**
 * 类型守卫函数
 */
export function isStrictTemplateConfig(value: unknown): value is StrictTemplateConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as StrictTemplateConfig).name === 'string' &&
    typeof (value as StrictTemplateConfig).displayName === 'string' &&
    typeof (value as StrictTemplateConfig).description === 'string' &&
    typeof (value as StrictTemplateConfig).version === 'string'
  )
}

export function isStrictTemplateMetadata(value: unknown): value is StrictTemplateMetadata {
  return (
    isStrictTemplateConfig(value) &&
    typeof (value as StrictTemplateMetadata).id === 'string' &&
    typeof (value as StrictTemplateMetadata).category === 'string' &&
    typeof (value as StrictTemplateMetadata).device === 'string' &&
    typeof (value as StrictTemplateMetadata).componentPath === 'string' &&
    typeof (value as StrictTemplateMetadata).componentLoader === 'function' &&
    typeof (value as StrictTemplateMetadata).configPath === 'string' &&
    typeof (value as StrictTemplateMetadata).lastModified === 'number' &&
    typeof (value as StrictTemplateMetadata).isBuiltIn === 'boolean'
  )
}

export function isStrictError(value: unknown): value is StrictError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as StrictError).code === 'string' &&
    typeof (value as StrictError).message === 'string' &&
    typeof (value as StrictError).timestamp === 'number' &&
    ['low', 'medium', 'high', 'critical'].includes((value as StrictError).severity)
  )
}

/**
 * 类型断言函数
 */
export function assertStrictTemplateConfig(value: unknown): asserts value is StrictTemplateConfig {
  if (!isStrictTemplateConfig(value)) {
    throw new Error('Invalid template config')
  }
}

export function assertStrictTemplateMetadata(value: unknown): asserts value is StrictTemplateMetadata {
  if (!isStrictTemplateMetadata(value)) {
    throw new Error('Invalid template metadata')
  }
}

/**
 * 类型转换函数
 */
export function toStrictTemplateConfig(value: unknown): StrictTemplateConfig {
  assertStrictTemplateConfig(value)
  return value
}

export function toStrictTemplateMetadata(value: unknown): StrictTemplateMetadata {
  assertStrictTemplateMetadata(value)
  return value
}
