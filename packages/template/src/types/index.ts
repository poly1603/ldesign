/**
 * LDesign Template System - 类型定义
 *
 * 重构版本 - 使用现有子包，专注于模板特有功能
 */

import type { Component } from 'vue'

// ============ 基础类型（临时，稍后使用外部包） ============

/**
 * 设备类型 - 将来使用 @ldesign/device
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet'

/**
 * 模板配置
 */
export interface TemplateConfig {
  /** 模板唯一标识 */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description?: string
  /** 模板版本 */
  version: string
  /** 作者 */
  author?: string
  /** 标签 */
  tags?: string[]
  /** 是否为默认模板 */
  isDefault?: boolean
  /** 预览图 */
  preview?: string
  /** 自定义属性 */
  [key: string]: unknown
}

/**
 * 模板元数据
 */
export interface TemplateMetadata {
  /** 分类 */
  category: string
  /** 设备类型 */
  device: DeviceType
  /** 模板名称 */
  template: string
  /** 配置信息 */
  config: TemplateConfig
  /** 组件路径 */
  componentPath: string
  /** 样式路径 */
  stylePath?: string
}

/**
 * 模板扫描结果
 */
export interface TemplateScanResult {
  /** 扫描到的模板数量 */
  count: number
  /** 模板列表 */
  templates: TemplateMetadata[]
  /** 扫描耗时（毫秒） */
  duration: number
  /** 扫描的目录数量 */
  scannedDirectories: number
  /** 成功的扫描模式 */
  scanMode:
    | 'parent'
    | 'current'
    | 'fallback'
    | 'Built模式 (相对路径)'
    | 'Source模式 (相对路径)'
    | '深层相对路径'
    | string
  /** 调试信息 */
  debug: {
    scannedPaths: string[]
    foundConfigs: number
    foundComponents: number
  }
}

/**
 * 模板路径信息
 */
export interface TemplatePathInfo {
  category: string
  device: DeviceType
  template: string
  fullPath: string
  isValid: boolean
}

// ============ 管理器相关类型 ============

/**
 * 存储配置选项
 */
export interface TemplateStorageOptions {
  /** 存储键名 */
  key?: string
  /** 存储类型 */
  storage?: 'localStorage' | 'sessionStorage' | 'memory'
  /** 自定义序列化函数 */
  serialize?: (data: any) => string
  /** 自定义反序列化函数 */
  deserialize?: (data: string) => any
}

/**
 * 模板管理器配置
 */
export interface TemplateManagerConfig {
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存过期时间（毫秒） */
  cacheExpiration?: number
  /** 是否自动检测设备 */
  autoDetectDevice?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
  /** 持久化存储配置 */
  storage?: TemplateStorageOptions
}

/**
 * 模板渲染选项
 */
export interface TemplateRenderOptions {
  /** 分类 */
  category: string
  /** 设备类型（可选，自动检测） */
  device?: DeviceType
  /** 模板名称 */
  template: string
  /** 传递给模板的属性 */
  props?: Record<string, unknown>
  /** 是否使用缓存 */
  cache?: boolean
}

/**
 * 模板加载结果
 */
export interface TemplateLoadResult {
  /** 模板组件 */
  component: Component
  /** 模板元数据 */
  metadata: TemplateMetadata
  /** 是否来自缓存 */
  fromCache: boolean
  /** 加载耗时 */
  loadTime: number
}

// ============ Vue 集成类型 ============

/**
 * TemplateRenderer 组件属性
 */
export interface TemplateRendererProps {
  /** 分类 */
  category: string
  /** 设备类型 */
  device?: DeviceType
  /** 模板名称 */
  template: string
  /** 传递给模板的属性 */
  templateProps?: Record<string, unknown>
  /** 是否使用缓存 */
  cache?: boolean
  /** 是否预加载 */
  preload?: boolean
  /** 加载状态插槽 */
  loading?: boolean
  /** 错误状态插槽 */
  error?: boolean
}

/**
 * useTemplate 组合式函数选项
 */
export interface UseTemplateOptions extends TemplateManagerConfig {
  /** 是否自动扫描模板 */
  autoScan?: boolean
  /** 模板分类 */
  category?: string
  /** 设备类型 */
  deviceType?: DeviceType
  /** 初始模板 */
  initialTemplate?: {
    category: string
    device?: DeviceType
    template: string
  }
}

// ============ 模板选择器类型 ============

/**
 * 模板选择器组件属性
 */
export interface TemplateSelectorProps {
  /** 模板分类 */
  category: string
  /** 设备类型 */
  device?: DeviceType
  /** 当前选中的模板 */
  currentTemplate?: string
  /** 是否显示预览 */
  showPreview?: boolean
  /** 是否显示搜索 */
  showSearch?: boolean
  /** 布局模式 */
  layout?: 'grid' | 'list'
  /** 每行显示的模板数量（网格模式） */
  columns?: number
  /** 是否显示模板信息 */
  showInfo?: boolean
  /** 模板变化回调 */
  onTemplateChange?: (template: string) => void
  /** 模板预览回调 */
  onTemplatePreview?: (template: string) => void
}

/**
 * 模板选择器组合式函数返回值
 */
export interface UseTemplateSelectorReturn {
  // 状态
  /** 可用模板列表 */
  availableTemplates: any // import('vue').ComputedRef<TemplateMetadata[]>
  /** 过滤后的模板列表 */
  filteredTemplates: any // import('vue').ComputedRef<TemplateMetadata[]>
  /** 搜索查询 */
  searchQuery: any // import('vue').Ref<string>
  /** 选中的模板 */
  selectedTemplate: any // import('vue').Ref<string | null>
  /** 加载状态 */
  loading: any // import('vue').Ref<boolean>
  /** 错误信息 */
  error: any // import('vue').Ref<Error | null>

  // 方法
  /** 选择模板 */
  selectTemplate: (template: string) => void
  /** 预览模板 */
  previewTemplate: (template: string) => void
  /** 搜索模板 */
  searchTemplates: (query: string) => void
  /** 刷新模板列表 */
  refreshTemplates: () => Promise<void>
  /** 重置选择器 */
  reset: () => void
}

/**
 * useTemplate 返回值
 */
export interface UseTemplateReturn {
  // 状态
  /** 当前设备类型 */
  currentDevice: any // import('vue').Ref<DeviceType>
  /** 当前模板 */
  currentTemplate: any // import('vue').Ref<TemplateMetadata | null>
  /** 加载状态 */
  loading: any // import('vue').Ref<boolean>
  /** 错误信息 */
  error: any // import('vue').Ref<Error | null>
  /** 可用模板列表 */
  availableTemplates: any // import('vue').ComputedRef<TemplateMetadata[]>
  /** 可用分类列表 */
  availableCategories: any // import('vue').ComputedRef<string[]>
  /** 可用设备类型列表 */
  availableDevices: any // import('vue').ComputedRef<DeviceType[]>

  // 方法
  /** 扫描模板 */
  scanTemplates: () => Promise<TemplateScanResult>
  /** 渲染模板 */
  render: (options: TemplateRenderOptions) => Promise<TemplateLoadResult>
  /** 切换模板 */
  switchTemplate: (category: string, device: DeviceType, template: string) => Promise<void>
  /** 获取模板列表 */
  getTemplates: (category?: string, device?: DeviceType) => TemplateMetadata[]
  /** 检查模板是否存在 */
  hasTemplate: (category: string, device: DeviceType, template: string) => boolean
  /** 清空缓存 */
  clearCache: () => void
  /** 刷新模板列表 */
  refresh: () => Promise<void>
}

/**
 * Vue 插件选项
 */
export interface TemplatePluginOptions extends TemplateManagerConfig {
  /** 组件前缀 */
  componentPrefix?: string
  /** 是否注册全局组件 */
  registerComponents?: boolean
  /** 是否注册指令 */
  registerDirectives?: boolean
  /** 是否注册全局属性 */
  registerGlobalProperties?: boolean
  /** 默认设备类型 */
  defaultDevice?: DeviceType
  /** 全局属性名称 */
  globalPropertyName?: string
}

// ============ 事件类型 ============

/**
 * 模板变化事件
 */
export interface TemplateChangeEvent {
  /** 事件类型 */
  type: 'template:change' | 'device:change' | 'scan:complete'
  /** 新模板 */
  newTemplate?: TemplateMetadata
  /** 旧模板 */
  oldTemplate?: TemplateMetadata
  /** 新设备类型 */
  newDevice?: DeviceType
  /** 旧设备类型 */
  oldDevice?: DeviceType
  /** 扫描结果 */
  scanResult?: TemplateScanResult
  /** 时间戳 */
  timestamp: number
}

// 设备变化回调将使用 @ldesign/device 包提供

/**
 * 模板变化回调
 */
export type TemplateChangeCallback = (event: TemplateChangeEvent) => void

/**
 * TemplateRenderer 组件属性
 */
export interface TemplateRendererProps {
  /** 分类 */
  category: string
  /** 设备类型 */
  device?: DeviceType
  /** 模板名称 */
  template: string
  /** 传递给模板的属性 */
  templateProps?: Record<string, unknown>
  /** 是否使用缓存 */
  cache?: boolean
  /** 是否预加载 */
  preload?: boolean
  /** 是否显示加载状态 */
  loading?: boolean
  /** 是否显示错误状态 */
  error?: boolean
}

// ============ 缓存类型（使用外部包） ============
// 缓存相关类型将使用 @ldesign/cache 包提供

// ============ 类型已在定义时导出 ============
