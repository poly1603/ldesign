/**
 * @ldesign/template 核心类型定义
 */

import type { Component } from 'vue'

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet'

/**
 * 模板分类
 */
export type TemplateCategory = 'login' | 'dashboard' | 'profile' | 'settings' | string

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
}

/**
 * 模板配置（config.ts 中导出的格式）
 */
export interface TemplateConfig extends Omit<TemplateMetadata, 'category' | 'device'> {
  /** 支持的插槽定义 - 可以是数组或对象形式 */
  slots?: Array<{
    /** 插槽名称 */
    name: string
    /** 插槽描述 */
    description?: string
    /** 插槽示例 */
    example?: string
    /** 插槽接受的props */
    props?: string[] | Record<string, any>
    /** 是否必需 */
    required?: boolean
  }> | {
    [key: string]: {
      /** 插槽名称 */
      name: string
      /** 插槽描述 */
      description?: string
      /** 插槽示例 */
      example?: string
      /** 插槽接受的props */
      props?: Record<string, any>
      /** 是否必需 */
      required?: boolean
    }
  }
  /** 额外的配置项 */
  [key: string]: any
}

/**
 * 模板接口
 */
export interface Template {
  /** 模板ID */
  id: string
  /** 模板名称 */
  name: string
  /** 模板分类 */
  category?: string
  /** 模板组件 */
  component?: Component | any
  /** 模板内容 */
  content?: string
  /** 模板元数据 */
  metadata?: TemplateMetadata
  /** 模板配置 */
  config?: TemplateConfig
  /** 创建时间 */
  createdAt?: number
  /** 更新时间 */
  updatedAt?: number
}

/**
 * 模板组件
 */
export interface TemplateComponent {
  /** Vue 组件 */
  component: Component
  /** 模板元数据 */
  metadata: TemplateMetadata
  /** 模板路径 */
  path: string
}

/**
 * 模板注册表项
 */
export interface TemplateRegistryItem {
  /** 模板元数据 */
  metadata: TemplateMetadata
  /** 组件加载器（懒加载） */
  loader: () => Promise<Component>
  /** 配置文件路径 */
  configPath: string
  /** 组件文件路径 */
  componentPath: string
}

/**
 * 模板过滤选项
 */
export interface TemplateFilter {
  /** 模板分类 */
  category?: TemplateCategory | TemplateCategory[]
  /** 设备类型 */
  device?: DeviceType | DeviceType[]
  /** 模板名称 */
  name?: string | string[]
  /** 标签 */
  tags?: string | string[]
  /** 是否只返回默认模板 */
  defaultOnly?: boolean
}

/**
 * 模板插槽定义
 */
export interface TemplateSlot {
  /** 插槽名称 */
  name: string
  /** 插槽描述 */
  description?: string
  /** 插槽默认内容 */
  default?: Component | string
  /** 插槽props定义 */
  props?: Record<string, any>
  /** 是否必需 */
  required?: boolean
}

/**
 * 模板插槽配置
 */
export interface TemplateSlots {
  [key: string]: Component | string | TemplateSlot
}

/**
 * 模板加载选项
 */
export interface TemplateLoadOptions {
  /** 是否预加载 */
  preload?: boolean
  /** 加载超时时间（毫秒） */
  timeout?: number
  /** 错误处理 */
  onError?: (error: Error) => void
  /** 加载成功回调 */
  onLoad?: (component: Component) => void
  /** 插槽内容 */
  slots?: TemplateSlots
}

/**
 * 模板扫描结果
 */
export interface TemplateScanResult {
  /** 扫描到的模板数量 */
  total: number
  /** 按分类统计 */
  byCategory: Record<TemplateCategory, number>
  /** 按设备统计 */
  byDevice: Record<DeviceType, number>
  /** 扫描时间（毫秒） */
  scanTime: number
  /** 所有模板的元数据列表 */
  templates: TemplateMetadata[]
}

/**
 * 模板扫描选项
 */
export interface TemplateScanOptions {
  /** 扫描模式 */
  pattern?: string
  /** 基础路径 */
  basePath?: string
}

/**
 * 模板加载器选项
 */
export interface TemplateLoaderOptions {
  /** 是否启用缓存 */
  cache?: boolean
  /** 缓存过期时间（毫秒） */
  cacheTtl?: number
  /** 缓存最大数量 */
  cacheMaxSize?: number
  /** 是否启用性能监控 */
  performance?: boolean
}

/**
 * 模板管理器配置选项
 */
export interface TemplateManagerOptions {
  /** 扫描选项 */
  scanOptions?: TemplateScanOptions
  /** 加载器选项 */
  loaderOptions?: TemplateLoaderOptions
  /** 默认策略 */
  defaultStrategy?: 'lazy' | 'eager' | 'smart'
  /** 是否预加载 */
  preload?: boolean
  /** 预加载策略 */
  preloadStrategy?: 'lazy' | 'eager' | 'smart'
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  timestamp: number
  duration: number
  templates: Array<{
    id: string
    name?: string
    renderTime: number
    updateTime?: number
    memoryUsage?: number
    domNodes?: number
    componentCount?: number
  }>
  summary?: {
    totalRenderTime: number
    averageRenderTime: number
    slowestTemplate: string
    fastestTemplate: string
    totalMemoryUsage?: number
    totalDomNodes?: number
  }
}

/**
 * 模板事件
 */
export interface TemplateEvents {
  onLoad?: (template: Template) => void
  onError?: (error: Error) => void
  onUpdate?: (template: Template) => void
  onRemove?: (id: string) => void
  onChange?: (template: Template) => void
  onStateChange?: (state: any) => void
  onRender?: () => void
  onUnmount?: () => void
}

/**
 * 模板属性
 */
export interface TemplateProps {
  id: string
  name?: string
  category?: string
  data?: Record<string, any>
  config?: TemplateConfig
  events?: TemplateEvents
  className?: string
  style?: Record<string, any>
  slots?: TemplateSlots
}
