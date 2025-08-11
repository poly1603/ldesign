import type { Component, DefineComponent } from 'vue'

// ============ 基础类型定义 ============

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet'

/**
 * 响应式断点配置
 */
export interface ResponsiveBreakpoints {
  /** 超小屏幕断点 */
  xs: number
  /** 小屏幕断点 */
  sm: number
  /** 中等屏幕断点 */
  md: number
  /** 大屏幕断点 */
  lg: number
  /** 超大屏幕断点 */
  xl: number
  /** 超超大屏幕断点 */
  xxl: number
}

/**
 * 设备检测配置
 */
export interface DeviceDetectionConfig {
  /** 移动设备断点 */
  mobileBreakpoint: number
  /** 平板设备断点 */
  tabletBreakpoint: number
  /** 桌面设备断点 */
  desktopBreakpoint: number
}

// ============ 模板相关类型 ============

/**
 * 模板配置接口
 */
export interface TemplateConfig {
  /** 模板唯一标识 */
  id?: string
  /** 模板名称 */
  name: string
  /** 显示标题 */
  title?: string
  /** 模板描述 */
  description: string
  /** 模板分类 */
  category?: string
  /** 设备类型 */
  device?: DeviceType
  /** 设备类型（别名） */
  deviceType?: DeviceType
  /** 模板变体 */
  variant?: string
  /** 版本号 */
  version?: string
  /** 作者 */
  author?: string
  /** 预览图路径或预览配置 */
  preview?:
    | string
    | {
        thumbnail?: string
        description?: string
      }
  /** 标签 */
  tags?: string[]
  /** 功能特性 */
  features?: string[]
  /** 模板属性配置 */
  props?: Record<string, unknown>
  /** 断点配置 */
  breakpoints?: {
    minWidth?: number | null
    maxWidth?: number | null
  }
  /** 是否响应式 */
  responsive?: boolean
  /** 是否为默认模板 */
  isDefault?: boolean
  /** 最小宽度 */
  minWidth?: number
  /** 最大宽度 */
  maxWidth?: number
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
  /** 嵌套配置 */
  config?: Record<string, any>
  /** 依赖信息 */
  dependencies?: Record<string, string>
}

/**
 * 模板元数据
 */
export interface TemplateMetadata {
  /** 模板分类 */
  category: string
  /** 设备类型 */
  device: DeviceType
  /** 模板名称 */
  template: string
  /** 模板配置 */
  config: TemplateConfig
  /** 模板组件路径 */
  componentPath: string
  /** 样式文件路径 */
  stylePath?: string
}

/**
 * 模板信息（用于注册表）
 */
export interface TemplateInfo {
  id: string
  name: string
  category: string
  device: DeviceType
  variant: string
  isDefault: boolean
  config: TemplateConfig
  component: unknown
}

/**
 * 模板组件
 */
export interface TemplateComponent {
  /** Vue 组件 */
  component: Component | DefineComponent
  /** 模板元数据 */
  metadata: TemplateMetadata
  /** 是否已加载 */
  loaded: boolean
  /** 加载时间 */
  loadedAt?: number
}

/**
 * 模板渲染选项
 */
export interface TemplateRenderOptions {
  /** 模板分类 */
  category: string
  /** 设备类型 */
  device?: DeviceType
  /** 模板名称 */
  template: string
  /** 传递给模板的属性 */
  props?: Record<string, any>
  /** 是否启用缓存 */
  cache?: boolean
  /** 加载超时时间（毫秒） */
  timeout?: number
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
}

/**
 * 模板管理器配置
 */
export interface TemplateManagerConfig {
  /** 模板根目录 */
  templateRoot?: string
  /** 设备检测配置 */
  deviceDetection?: DeviceDetectionConfig
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存大小限制 */
  cacheLimit?: number
  /** 是否启用预加载 */
  enablePreload?: boolean
  /** 预加载模板列表 */
  preloadTemplates?: string[]
  /** 默认设备类型 */
  defaultDevice?: DeviceType
}

/**
 * 模板切换事件
 */
export interface TemplateChangeEvent {
  /** 之前的模板 */
  from?: TemplateMetadata
  /** 当前模板 */
  to: TemplateMetadata
  /** 切换时间 */
  timestamp: number
}

/**
 * 模板加载状态
 */
export enum TemplateLoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}

/**
 * 模板加载结果
 */
export interface TemplateLoadResult {
  /** 加载状态 */
  state: TemplateLoadingState
  /** 模板组件 */
  component?: TemplateComponent
  /** 错误信息 */
  error?: Error
  /** 加载耗时 */
  duration?: number
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
  /** 扫描的路径 */
  scannedPaths: string[]
}

/**
 * 响应式断点配置
 */
export interface ResponsiveBreakpoints {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

/**
 * 模板渲染器属性
 */
export interface TemplateRendererProps {
  /** 模板分类 */
  category: string
  /** 设备类型 */
  device?: DeviceType
  /** 模板名称 */
  template: string
  /** 传递给模板的属性 */
  templateProps?: Record<string, any>
  /** 是否启用缓存 */
  cache?: boolean
  /** 加载组件 */
  loading?: Component
  /** 错误组件 */
  error?: Component
  /** 空状态组件 */
  empty?: Component
}

/**
 * 模板指令绑定值
 */
export interface TemplateDirectiveBinding {
  /** 模板分类 */
  category: string
  /** 设备类型 */
  device?: DeviceType
  /** 模板名称 */
  template: string
  /** 传递给模板的属性 */
  props?: Record<string, any>
}

/**
 * 模板管理器事件类型
 */
export interface TemplateManagerEvents {
  'template:change': TemplateChangeEvent
  'template:load': TemplateLoadResult
  'template:error': Error
  'device:change': DeviceType
}

/**
 * 模板 Composable 选项
 */
export interface UseTemplateOptions extends TemplateManagerConfig {
  /** 是否自动扫描模板 */
  autoScan?: boolean
  /** 是否自动检测设备变化 */
  autoDetectDevice?: boolean
  /** 初始模板配置 */
  initialTemplate?: {
    category: string
    device?: DeviceType
    template: string
  }
}

/**
 * 模板 Composable 返回值
 */
export interface UseTemplateReturn {
  /** 模板管理器实例 */
  manager: any
  /** 当前模板 */
  currentTemplate: any
  /** 当前设备类型 */
  currentDevice: any
  /** 加载状态 */
  loading: any
  /** 错误信息 */
  error: any
  /** 可用模板列表 */
  availableTemplates: any
  /** 可用分类列表 */
  availableCategories: any
  /** 可用设备类型列表 */
  availableDevices: any

  // 方法
  /** 扫描模板 */
  scanTemplates: () => Promise<void>
  /** 渲染模板 */
  render: (options: TemplateRenderOptions) => Promise<any>
  /** 切换模板 */
  switchTemplate: (
    category: string,
    device: DeviceType,
    template: string
  ) => Promise<void>
  /** 获取模板列表 */
  getTemplates: (
    category?: string,
    device?: DeviceType
  ) => Promise<TemplateMetadata[]>
  /** 检查模板是否存在 */
  hasTemplate: (
    category: string,
    device: DeviceType,
    template: string
  ) => Promise<boolean>
  /** 清空缓存 */
  clearCache: () => void
  /** 刷新模板列表 */
  refresh: () => Promise<void>
}

/**
 * 插件选项
 */
export interface TemplatePluginOptions extends TemplateManagerConfig {
  /** 组件名称前缀 */
  componentPrefix?: string
  /** 是否注册全局组件 */
  registerComponents?: boolean
  /** 是否注册指令 */
  registerDirectives?: boolean
  /** 是否提供全局属性 */
  provideGlobalProperties?: boolean
}
