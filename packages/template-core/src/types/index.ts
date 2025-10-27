/**
 * @ldesign/template-core 核心类型定义
 * 
 * @description
 * 框架无关的类型定义，可被 Vue 和 React 包共享使用
 */

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet'

/**
 * 模板分类
 */
export type TemplateCategory = 'login' | 'dashboard' | 'profile' | 'settings' | 'form' | 'list' | string

/**
 * 模板元数据
 */
export interface TemplateMetadata {
  /** 模板名称（唯一标识） */
  name: string
  /** 显示名称 */
  displayName: string
  /** 模板描述 */
  description?: string
  /** 模板分类 */
  category: TemplateCategory
  /** 设备类型 */
  device: DeviceType
  /** 版本号 */
  version?: string
  /** 作者 */
  author?: string
  /** 标签 */
  tags?: string[]
  /** 是否为默认模板 */
  isDefault?: boolean
  /** 预览图 */
  preview?: string
  /** 最后修改时间 */
  lastModified?: number
  /** 文件路径 */
  path?: string
  /** 大小（字节） */
  size?: number
  /** 依赖项 */
  dependencies?: string[]
  /** 是否支持SSR */
  ssr?: boolean
  /** 是否支持响应式 */
  responsive?: boolean
  /** 最低支持版本 */
  minVersion?: string
}

/**
 * 模板配置
 */
export interface TemplateConfig {
  /** 元数据 */
  metadata: TemplateMetadata
  /** 自定义属性 */
  props?: Record<string, any>
  /** 插槽定义 */
  slots?: string[]
  /** 事件定义 */
  emits?: string[]
  /** 样式变量 */
  cssVars?: Record<string, string>
  /** 布局配置 */
  layout?: LayoutConfig
  /** 主题配置 */
  theme?: ThemeConfig
  /** 性能配置 */
  performance?: PerformanceConfig
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  /** 布局类型 */
  type?: 'fixed' | 'fluid' | 'responsive'
  /** 最大宽度 */
  maxWidth?: number | string
  /** 最小宽度 */
  minWidth?: number | string
  /** 内边距 */
  padding?: number | string
  /** 网格配置 */
  grid?: GridConfig
}

/**
 * 网格配置
 */
export interface GridConfig {
  /** 列数 */
  columns?: number
  /** 间隙 */
  gap?: number | string
  /** 行高 */
  rowHeight?: number | string
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题名称 */
  name?: string
  /** 颜色模式 */
  mode?: 'light' | 'dark' | 'auto'
  /** 主色调 */
  primaryColor?: string
  /** 自定义颜色 */
  colors?: Record<string, string>
  /** 字体配置 */
  fonts?: FontConfig
  /** 动画配置 */
  animations?: AnimationConfig
}

/**
 * 字体配置
 */
export interface FontConfig {
  /** 字体族 */
  family?: string
  /** 基础字号 */
  baseSize?: number | string
  /** 行高 */
  lineHeight?: number
  /** 字重 */
  weights?: Record<string, number>
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  /** 是否启用动画 */
  enabled?: boolean
  /** 动画时长（毫秒） */
  duration?: number
  /** 缓动函数 */
  easing?: string
  /** 延迟（毫秒） */
  delay?: number
}

/**
 * 性能配置
 */
export interface PerformanceConfig {
  /** 是否启用懒加载 */
  lazyLoad?: boolean
  /** 预加载策略 */
  preload?: PreloadStrategy
  /** 缓存策略 */
  cache?: CacheStrategy
  /** 优先级 */
  priority?: 'high' | 'normal' | 'low'
  /** 超时时间（毫秒） */
  timeout?: number
  /** 重试次数 */
  retryCount?: number
}

/**
 * 预加载策略
 */
export type PreloadStrategy = 'eager' | 'lazy' | 'none' | 'viewport' | 'interaction'

/**
 * 缓存策略
 */
export type CacheStrategy = 'memory' | 'persistent' | 'session' | 'none' | 'hybrid'

/**
 * 模板过滤条件
 */
export interface TemplateFilter {
  /** 分类过滤 */
  category?: TemplateCategory | TemplateCategory[]
  /** 设备类型过滤 */
  device?: DeviceType | DeviceType[]
  /** 名称过滤 */
  name?: string | RegExp
  /** 标签过滤 */
  tags?: string[]
  /** 作者过滤 */
  author?: string
  /** 是否只要默认模板 */
  defaultOnly?: boolean
  /** 是否支持SSR */
  ssr?: boolean
  /** 是否响应式 */
  responsive?: boolean
  /** 版本范围 */
  version?: string
  /** 搜索关键词 */
  search?: string
}

/**
 * 模板加载选项
 */
export interface TemplateLoadOptions {
  /** 是否使用缓存 */
  cache?: boolean
  /** 是否强制刷新 */
  forceRefresh?: boolean
  /** 超时时间 */
  timeout?: number
  /** 重试次数 */
  retryCount?: number
  /** 加载回调 */
  onProgress?: (progress: number) => void
  /** 错误处理 */
  onError?: (error: Error) => void
  /** 是否预加载依赖 */
  preloadDependencies?: boolean
  /** 是否并行加载 */
  parallel?: boolean
}

/**
 * 模板管理器选项
 */
export interface TemplateManagerOptions {
  /** 扫描路径 */
  scanPaths?: string[]
  /** 是否自动扫描 */
  autoScan?: boolean
  /** 缓存配置 */
  cache?: CacheConfig
  /** 性能配置 */
  performance?: PerformanceConfig
  /** 调试模式 */
  debug?: boolean
  /** 严格模式 */
  strict?: boolean
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean
  /** 缓存策略 */
  strategy?: CacheStrategy
  /** 最大缓存数 */
  maxSize?: number
  /** 缓存过期时间（毫秒） */
  ttl?: number
  /** 是否压缩缓存 */
  compress?: boolean
  /** 持久化配置 */
  persistent?: PersistentConfig
}

/**
 * 持久化配置
 */
export interface PersistentConfig {
  /** 存储键名 */
  key?: string
  /** 存储版本 */
  version?: number
  /** 是否加密 */
  encrypt?: boolean
  /** 压缩算法 */
  compression?: 'gzip' | 'brotli' | 'none'
}

/**
 * 模板扫描结果
 */
export interface TemplateScanResult {
  /** 找到的模板数量 */
  count: number
  /** 模板元数据列表 */
  templates: TemplateMetadata[]
  /** 按分类分组 */
  byCategory: Record<TemplateCategory, TemplateMetadata[]>
  /** 按设备分组 */
  byDevice: Record<DeviceType, TemplateMetadata[]>
  /** 扫描耗时（毫秒） */
  scanTime: number
  /** 扫描错误 */
  errors?: ScanError[]
}

/**
 * 扫描错误
 */
export interface ScanError {
  /** 文件路径 */
  path: string
  /** 错误信息 */
  message: string
  /** 错误代码 */
  code?: string
  /** 错误堆栈 */
  stack?: string
}

/**
 * 模板注册项
 */
export interface TemplateRegistryItem {
  /** 模板元数据 */
  metadata: TemplateMetadata
  /** 加载函数 */
  loader: () => Promise<any>
  /** 是否已加载 */
  loaded?: boolean
  /** 加载的组件 */
  component?: any
  /** 加载时间 */
  loadedAt?: number
  /** 使用次数 */
  useCount?: number
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 加载时间（毫秒） */
  loadTime?: number
  /** 渲染时间（毫秒） */
  renderTime?: number
  /** 内存使用（字节） */
  memoryUsage?: number
  /** 缓存命中率 */
  cacheHitRate?: number
  /** 错误率 */
  errorRate?: number
  /** 平均响应时间 */
  avgResponseTime?: number
}

/**
 * 版本信息
 */
export interface VersionInfo {
  /** 版本号 */
  version: string
  /** 发布日期 */
  releaseDate?: string
  /** 变更日志 */
  changelog?: string[]
  /** 是否为预发布版本 */
  prerelease?: boolean
  /** 标签 */
  tags?: string[]
}

/**
 * A/B 测试配置
 */
export interface ABTestConfig {
  /** 测试ID */
  id: string
  /** 测试名称 */
  name: string
  /** 变体列表 */
  variants: ABTestVariant[]
  /** 流量分配 */
  traffic?: number[]
  /** 是否启用 */
  enabled?: boolean
  /** 开始时间 */
  startTime?: Date
  /** 结束时间 */
  endTime?: Date
  /** 目标指标 */
  metrics?: string[]
}

/**
 * A/B 测试变体
 */
export interface ABTestVariant {
  /** 变体ID */
  id: string
  /** 变体名称 */
  name: string
  /** 模板名称 */
  template: string
  /** 流量权重 */
  weight?: number
  /** 是否为控制组 */
  isControl?: boolean
  /** 配置覆盖 */
  overrides?: Record<string, any>
}

/**
 * 错误类型
 */
export type ErrorType = 
  | 'LOAD_ERROR'
  | 'PARSE_ERROR'
  | 'RENDER_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'VALIDATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'VERSION_ERROR'
  | 'DEPENDENCY_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * 模板错误
 */
export class TemplateError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'TemplateError'
  }
}

/**
 * 生命周期钩子
 */
export interface LifecycleHooks {
  /** 加载前 */
  beforeLoad?: () => void | Promise<void>
  /** 加载后 */
  afterLoad?: () => void | Promise<void>
  /** 渲染前 */
  beforeRender?: () => void | Promise<void>
  /** 渲染后 */
  afterRender?: () => void | Promise<void>
  /** 更新前 */
  beforeUpdate?: () => void | Promise<void>
  /** 更新后 */
  afterUpdate?: () => void | Promise<void>
  /** 卸载前 */
  beforeUnmount?: () => void | Promise<void>
  /** 卸载后 */
  afterUnmount?: () => void | Promise<void>
  /** 错误处理 */
  onError?: (error: Error) => void | Promise<void>
}

export default {}
