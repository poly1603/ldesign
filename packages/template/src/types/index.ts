/**
 * @ldesign/template 核心类型定义
 * 高性能动态模板管理系统的完整类型系统
 */

// Vue 类型定义（条件导入）
export type VueComponent = any
export type VueApp = any

// ==================== 基础类型 ====================

/**
 * 设备类型枚举
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet'

/**
 * 模板状态枚举
 */
export type TemplateStatus = 'pending' | 'loading' | 'loaded' | 'error' | 'cached'

/**
 * 缓存策略枚举
 */
export type CacheStrategy = 'lru' | 'fifo' | 'ttl' | 'memory'

/**
 * 预加载策略枚举
 */
export type PreloadStrategy = 'critical' | 'idle' | 'all' | 'none'

// ==================== 模板相关类型 ====================

/**
 * 模板配置接口
 */
export interface TemplateConfig {
  /** 模板唯一标识 */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description?: string
  /** 模板版本 */
  version?: string
  /** 作者信息 */
  author?: string
  /** 模板分类 */
  category: string
  /** 设备类型 */
  device: DeviceType
  /** 模板变体 */
  variant: string
  /** 是否为默认模板 */
  isDefault?: boolean
  /** 功能特性列表 */
  features?: string[]
  /** 预览图片URL */
  preview?: string
  /** 标签列表 */
  tags?: string[]
  /** 模板属性定义 */
  props?: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    default?: any
    description?: string
    required?: boolean
    options?: any[]
  }>
  /** 依赖关系 */
  dependencies?: string[]
  /** 兼容性信息 */
  compatibility?: {
    vue?: string
    node?: string
    browsers?: string[]
    typescript?: string
  }
  /** 显示名称 */
  displayName?: string
  /** 自定义配置选项 */
  customization?: {
    colors?: boolean
    layout?: boolean
    animations?: boolean
    background?: boolean
    [key: string]: any
  }
  /** 断点配置 */
  breakpoints?: {
    minWidth?: number | null
    maxWidth?: number | null
    [key: string]: number | null | undefined
  }
  /** 自定义配置参数 */
  config?: Record<string, any>
  /** 优先级 */
  priority?: number
  /** 是否启用 */
  enabled?: boolean
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/**
 * 模板元数据接口
 */
export interface TemplateMetadata {
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description?: string
  /** 模板版本 */
  version?: string
  /** 作者信息 */
  author?: string
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
  /** 标签列表 */
  tags?: string[]
  /** 依赖关系 */
  dependencies?: string[]
  /** 兼容性信息 */
  compatibility?: {
    vue?: string
    node?: string
    browsers?: string[]
  }
  /** 自定义配置参数 */
  config?: Record<string, any>
}

/**
 * 模板文件信息接口
 */
export interface TemplateFileInfo {
  /** 文件路径 */
  path: string
  /** 文件类型 */
  type: 'template' | 'config' | 'asset'
  /** 文件大小（字节） */
  size?: number
  /** 最后修改时间 */
  lastModified?: number
  /** 文件内容（仅用于配置文件） */
  content?: any
}

/**
 * 模板信息接口
 */
export interface TemplateInfo {
  /** 模板名称 */
  name: string
  /** 模板分类（目录名） */
  category: string
  /** 设备类型 */
  deviceType: DeviceType
  /** 模板变体 */
  variant?: string
  /** 模板文件信息 */
  templateFile: TemplateFileInfo
  /** 配置文件信息 */
  configFile?: TemplateFileInfo
  /** 静态资源文件 */
  assets?: TemplateFileInfo[]
  /** 模板元数据 */
  metadata: TemplateMetadata
  /** 模板状态 */
  status: TemplateStatus
  /** 加载时间戳 */
  loadedAt?: number
  /** 错误信息 */
  error?: Error
}

/**
 * 模板注册表项接口
 */
export interface TemplateRegistryItem {
  name: string
  displayName?: string
  description?: string
  version?: string
  tags?: string[]
  thumbnail?: string
  path: string
  category: string
  deviceType: DeviceType
  variant?: string
  isDefault?: boolean
  component?: any
  metadata?: Record<string, any>
  /** 是否为外部模板 */
  isExternal?: boolean
  /** 外部模板引用 */
  externalTemplate?: ExternalTemplate
}

/**
 * 外部模板定义接口
 */
export interface ExternalTemplate {
  /** 模板配置 */
  config: TemplateConfig
  /** 模板组件 */
  component: VueComponent
  /** 样式文件路径（可选） */
  styles?: string
  /** 静态资源（可选） */
  assets?: Record<string, string>
}

/**
 * 模板扩展选项接口
 */
export interface TemplateExtensionOptions {
  /** 外部模板列表 */
  externalTemplates?: ExternalTemplate[]
  /** 是否覆盖默认模板 */
  overrideDefaults?: boolean
  /** 是否合并同名模板 */
  mergeConflicts?: boolean
  /** 模板优先级策略 */
  priorityStrategy?: 'external' | 'default' | 'version'
}

/**
 * 模板索引接口
 */
export interface TemplateIndex {
  /** 索引版本 */
  version: string
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
  /** 扫描路径 */
  scanPaths: string[]
  /** 模板总数 */
  totalCount: number
  /** 按分类分组的模板 */
  categories: Record<string, Record<DeviceType, TemplateInfo>>
  /** 扁平化的模板列表 */
  templates: TemplateInfo[]
  /** 扫描统计信息 */
  stats: {
    /** 扫描耗时（毫秒） */
    scanDuration: number
    /** 文件总数 */
    totalFiles: number
    /** 模板文件数 */
    templateFiles: number
    /** 配置文件数 */
    configFiles: number
    /** 资源文件数 */
    assetFiles: number
    /** 错误数量 */
    errors: number
  }
}

// ==================== 扫描器相关类型 ====================

/**
 * 扫描器配置接口
 */
export interface ScannerConfig {
  /** 扫描路径列表 */
  scanPaths: string | string[]
  /** 是否递归扫描 */
  recursive?: boolean
  /** 包含的文件模式 */
  include?: string[]
  /** 排除的文件模式 */
  exclude?: string[]
  /** 最大扫描深度 */
  maxDepth?: number
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存TTL（毫秒） */
  cacheTTL?: number
  /** 是否监听文件变化 */
  watchFiles?: boolean
  /** 并发扫描数量 */
  concurrency?: number
}

/**
 * 扫描结果接口
 */
export interface ScanResult {
  /** 扫描成功 */
  success: boolean
  /** 模板索引 */
  index: TemplateIndex
  /** 扫描耗时（毫秒） */
  duration: number
  /** 错误列表 */
  errors: Error[]
  /** 警告列表 */
  warnings: string[]
}

// ==================== 加载器相关类型 ====================

/**
 * 加载器配置接口
 */
export interface LoaderConfig {
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存策略 */
  cacheStrategy?: CacheStrategy
  /** 缓存大小限制 */
  maxCacheSize?: number
  /** 缓存TTL（毫秒） */
  cacheTTL?: number
  /** 预加载策略 */
  preloadStrategy?: PreloadStrategy
  /** 关键模板列表 */
  criticalTemplates?: string[]
  /** 加载超时时间（毫秒） */
  loadTimeout?: number
  /** 重试次数 */
  retryCount?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
}

/**
 * 加载结果接口
 */
export interface LoadResult<T = VueComponent> {
  /** 加载成功 */
  success: boolean
  /** 加载的组件 */
  component?: T
  /** 模板信息 */
  templateInfo: TemplateInfo
  /** 加载耗时（毫秒） */
  duration: number
  /** 是否来自缓存 */
  fromCache: boolean
  /** 错误信息 */
  error?: Error
}

// ==================== 设备适配器相关类型 ====================

/**
 * 设备适配器配置接口
 */
export interface DeviceAdapterConfig {
  /** 默认设备类型 */
  defaultDeviceType?: DeviceType
  /** 设备类型回退策略 */
  fallbackStrategy?: Record<DeviceType, DeviceType[]>
  /** 是否启用自动检测 */
  autoDetect?: boolean
  /** 设备变化监听 */
  watchDeviceChange?: boolean
  /** 设备断点配置 */
  breakpoints?: Record<string, number>
  /** 防抖延迟时间 */
  debounceDelay?: number
}

// ==================== 缓存相关类型 ====================

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean
  /** 缓存策略 */
  strategy?: CacheStrategy
  /** 最大缓存大小 */
  maxSize?: number
  /** 缓存TTL（毫秒） */
  ttl?: number
  /** 是否持久化 */
  persistent?: boolean
  /** 存储键前缀 */
  keyPrefix?: string
}

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  /** 缓存键 */
  key: string
  /** 缓存值 */
  value: T
  /** 创建时间 */
  createdAt: number
  /** 访问时间 */
  accessedAt: number
  /** 访问次数 */
  accessCount: number
  /** 过期时间 */
  expiresAt?: number
  /** 数据大小（字节） */
  size?: number
}

// ==================== 管理器相关类型 ====================

/**
 * 模板管理器配置接口
 */
export interface TemplateManagerConfig {
  /** 扫描器配置 */
  scanner?: ScannerConfig
  /** 加载器配置 */
  loader?: LoaderConfig
  /** 设备适配器配置 */
  deviceAdapter?: DeviceAdapterConfig
  /** 缓存配置 */
  cache?: CacheConfig
  /** 是否启用调试模式 */
  debug?: boolean
  /** 性能监控配置 */
  performance?: {
    enabled?: boolean
    sampleRate?: number
    reportInterval?: number
  }
}

// ==================== 事件相关类型 ====================

/**
 * 事件类型枚举
 */
export type EventType =
  | 'template:scan:start'
  | 'template:scan:progress'
  | 'template:scan:complete'
  | 'template:scan:error'
  | 'template:load:start'
  | 'template:load:progress'
  | 'template:load:complete'
  | 'template:load:error'
  | 'template:cache:hit'
  | 'template:cache:miss'
  | 'template:cache:evict'
  | 'device:change'
  | 'device:orientation:change'
  | 'device:detected'
  | 'cache:hit'
  | 'cache:miss'
  | 'cache:set'
  | 'cache:delete'
  | 'cache:clear'
  | 'cache:error'
  | 'cache:warmup'
  | 'performance:report'

/**
 * 事件数据接口
 */
export interface EventData {
  /** 事件类型 */
  type: EventType
  /** 事件时间戳 */
  timestamp: number
  /** 事件数据 */
  data?: any
  /** 错误信息 */
  error?: Error
  /** 设备变化相关 */
  oldDeviceType?: DeviceType
  newDeviceType?: DeviceType
  deviceInfo?: any
  /** 缓存相关 */
  key?: string
  size?: number
  operation?: string
  /** 模板相关 */
  template?: any
  orientation?: string
}

/**
 * 事件监听器类型
 */
export type EventListener = (data: EventData) => void

// ==================== Vue 集成相关类型 ====================

/**
 * Vue 组件属性接口
 */
export interface TemplateRendererProps {
  /** 模板标识符（分类名称） */
  template: string
  /** 强制指定设备类型 */
  deviceType?: DeviceType
  /** 自定义扫描路径 */
  scanPaths?: string | string[]
  /** 传递给模板的属性 */
  templateProps?: Record<string, any>
  /** 缓存配置 */
  cacheConfig?: CacheConfig
  /** 加载配置 */
  loadingConfig?: {
    showLoading?: boolean
    loadingComponent?: VueComponent
    errorComponent?: VueComponent
    loadingText?: string
    errorText?: string
  }
}

/**
 * Vue 插件配置接口
 */
export interface PluginConfig extends TemplateManagerConfig {
  /** 全局组件名称 */
  componentName?: string
  /** 是否注册全局组件 */
  registerGlobalComponent?: boolean
  /** 是否注册指令 */
  registerDirectives?: boolean
  /** 是否提供全局属性 */
  provideGlobalProperties?: boolean
}

/**
 * Vue 插件安装选项
 */
export interface PluginInstallOptions {
  /** Vue 应用实例 */
  app: VueApp
  /** 插件配置 */
  options?: PluginConfig
}

// ==================== 工具类型 ====================

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 可选属性类型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 必需属性类型
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/**
 * 函数类型提取
 */
export type ExtractFunction<T> = T extends (...args: any[]) => any ? T : never

/**
 * Promise 类型提取
 */
export type ExtractPromise<T> = T extends Promise<infer U> ? U : T
