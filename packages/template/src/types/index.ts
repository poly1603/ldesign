/**
 * 模板管理器核心类型定义
 */

import type { Component, VNode, Ref } from 'vue'

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

/**
 * 模板状态
 */
export type TemplateStatus = 'discovered' | 'loading' | 'loaded' | 'error' | 'cached'

/**
 * 缓存策略
 */
export type CacheStrategy = 'lru' | 'fifo' | 'memory' | 'none'

/**
 * 模板配置接口
 */
export interface TemplateConfig {
  /** 模板ID */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description: string
  /** 版本号 */
  version: string
  /** 作者 */
  author: string
  /** 模板分类 */
  category: string
  /** 设备类型 */
  device: DeviceType
  /** 模板变体名称 */
  variant: string
  /** 是否为默认模板 */
  isDefault?: boolean
  /** 功能特性 */
  features?: string[]
  /** 缩略图 */
  thumbnail?: string
  /** 模板属性配置 */
  props?: Record<string, PropConfig>
  /** 依赖项 */
  dependencies?: string[]
}

/**
 * 属性配置
 */
export interface PropConfig {
  /** 属性类型 */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  /** 默认值 */
  default?: any
  /** 属性描述 */
  description?: string
  /** 是否必需 */
  required?: boolean
  /** 验证规则 */
  validator?: (value: any) => boolean
}

/**
 * 模板信息接口
 */
export interface TemplateInfo {
  /** 唯一标识符 */
  id: string
  /** 模板名称 */
  name: string
  /** 显示名称 */
  displayName: string
  /** 模板描述 */
  description: string
  /** 模板分类 */
  category: string
  /** 设备类型 */
  deviceType: DeviceType
  /** 版本号 */
  version: string
  /** 作者 */
  author: string
  /** 标签 */
  tags: string[]
  /** 模板路径 */
  path: string
  /** 组件文件路径 */
  componentPath?: string
  /** Vue组件实例 */
  component: Component | null
  /** 缩略图URL */
  thumbnail: string
  /** 模板状态 */
  status: TemplateStatus
  /** 依赖项 */
  dependencies: string[]
  /** 属性配置 */
  props: Record<string, PropConfig>
  /** 是否为默认模板 */
  isDefault: boolean
  /** 功能特性 */
  features: string[]
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 加载错误信息 */
  error?: Error
}

/**
 * 设备检测配置
 */
export interface DeviceDetectionConfig {
  /** 移动端断点 */
  mobileBreakpoint: number
  /** 平板端断点 */
  tabletBreakpoint: number
  /** 桌面端断点 */
  desktopBreakpoint: number
  /** 自定义检测函数 */
  customDetector?: () => DeviceType
  /** 是否启用自动检测 */
  autoDetect: boolean
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled: boolean
  /** 缓存策略 */
  strategy: CacheStrategy
  /** 最大缓存数量 */
  maxSize: number
  /** 缓存过期时间（毫秒） */
  ttl: number
}

/**
 * 模板管理器配置
 */
export interface TemplateManagerConfig {
  /** 模板根目录，支持多个目录 */
  templateRoot: string | string[]
  /** 设备检测配置 */
  deviceDetection: DeviceDetectionConfig
  /** 缓存配置 */
  cache: CacheConfig
  /** 是否启用预加载 */
  enablePreload: boolean
  /** 预加载模板列表 */
  preloadTemplates: string[]
  /** 默认设备类型 */
  defaultDevice: DeviceType
  /** 是否启用调试模式 */
  debug: boolean
  /** 扫描器配置 */
  scanner?: {
    /** 支持的文件扩展名 */
    extensions?: string[]
    /** 最大扫描深度 */
    maxDepth?: number
  }
}

/**
 * 模板加载结果
 */
export interface LoadResult {
  /** 模板信息 */
  template: TemplateInfo
  /** Vue组件实例 */
  component: Component
  /** 渲染的VNode */
  vnode?: VNode
  /** 加载耗时 */
  loadTime: number
  /** 是否来自缓存 */
  fromCache: boolean
}

/**
 * 模板选择器选项
 */
export interface TemplateSelectorOptions {
  /** 当前分类 */
  category: string
  /** 当前设备类型 */
  deviceType?: DeviceType
  /** 是否显示预览 */
  showPreview?: boolean
  /** 是否显示搜索 */
  showSearch?: boolean
  /** 布局模式 */
  layout?: 'grid' | 'list'
  /** 每行显示数量（网格模式） */
  columns?: number
  /** 是否显示标签 */
  showTags?: boolean
  /** 过滤函数 */
  filter?: (template: TemplateInfo) => boolean
}

/**
 * 模板渲染器属性
 */
export interface TemplateRendererProps {
  /** 模板分类 */
  category: string
  /** 设备类型（可选，自动检测） */
  deviceType?: DeviceType
  /** 指定模板名称（可选） */
  template?: string
  /** 传递给模板的属性 */
  props?: Record<string, any>
  /** 是否显示内置选择器 */
  showSelector?: boolean
  /** 选择器配置 */
  selectorOptions?: TemplateSelectorOptions
  /** 加载状态插槽 */
  loading?: boolean
  /** 错误处理 */
  onError?: (error: Error) => void
  /** 模板切换回调 */
  onTemplateChange?: (template: TemplateInfo) => void
}

/**
 * 事件监听器
 */
export type EventListener = (...args: any[]) => void

/**
 * 模板事件类型
 */
export interface TemplateEvents {
  /** 模板加载开始 */
  'template:loading': (templateId: string) => void
  /** 模板加载完成 */
  'template:loaded': (template: TemplateInfo) => void
  /** 模板加载失败 */
  'template:error': (templateId: string, error: Error) => void
  /** 模板切换 */
  'template:switch': (from: TemplateInfo | null, to: TemplateInfo) => void
  /** 设备类型变化 */
  'device:change': (from: DeviceType, to: DeviceType) => void
  /** 缓存清理 */
  'cache:clear': (category?: string, deviceType?: DeviceType) => void
}

/**
 * Vue插件配置
 */
export interface TemplatePluginOptions extends Partial<TemplateManagerConfig> {
  /** 组件前缀 */
  componentPrefix?: string
  /** 是否注册全局组件 */
  registerComponents?: boolean
  /** 是否注册指令 */
  registerDirectives?: boolean
  /** 是否提供全局属性 */
  provideGlobalProperties?: boolean
}

/**
 * 模板提供者配置
 */
export interface TemplateProviderConfig extends TemplateManagerConfig {
  /** 主题配置 */
  theme?: {
    /** 主色调 */
    primaryColor?: string
    /** 暗色模式 */
    darkMode?: boolean
    /** 自定义CSS变量 */
    cssVars?: Record<string, string>
  }
  /** 权限配置 */
  permissions?: {
    /** 允许的分类 */
    allowedCategories?: string[]
    /** 允许的设备类型 */
    allowedDevices?: DeviceType[]
    /** 权限检查函数 */
    checkPermission?: (category: string, deviceType: DeviceType, template: string) => boolean
  }
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: TemplateManagerConfig = {
  templateRoot: [
    // 内置模板目录（相对于包根目录）
    '@ldesign/template/templates',
    // 用户自定义模板目录
    'src/templates'
  ],
  deviceDetection: {
    mobileBreakpoint: 768,
    tabletBreakpoint: 992,
    desktopBreakpoint: 1200,
    autoDetect: true,
  },
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 50,
    ttl: 30 * 60 * 1000, // 30分钟
  },
  enablePreload: false,
  preloadTemplates: [],
  defaultDevice: 'desktop',
  debug: false,
  scanner: {
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js'],
    maxDepth: 3,
  },
}
