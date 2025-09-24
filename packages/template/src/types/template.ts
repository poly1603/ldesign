/**
 * 模板相关类型定义
 */

import type { Component, PropType } from 'vue'

/**
 * 导入Vue相关类型
 */
import type { Ref } from 'vue'

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

/**
 * 模板配置接口
 */
export interface TemplateConfig {
  /** 模板名称（必需） */
  name: string
  /** 用户友好的显示名称（必需） */
  displayName: string
  /** 模板描述（必需） */
  description: string
  /** 是否为默认模板（可选，默认false） */
  isDefault?: boolean
  /** 模板版本（必需） */
  version: string
  /** 作者信息（可选） */
  author?: string
  /** 模板标签，用于搜索和分类（可选） */
  tags?: string[]
  /** 预览图路径（可选） */
  preview?: string
  /** 支持的props定义（可选） */
  props?: Record<string, PropType<unknown> | { type: PropType<unknown>, default?: unknown, required?: boolean, validator?: (value: unknown) => boolean }>
  /** 支持的插槽列表（可选） */
  slots?: string[]
  /** 依赖的其他模板或组件（可选） */
  dependencies?: string[]
  /** 模板特性（可选，便于文档和展示） */
  features?: string[]
  /** 最低Vue版本要求（可选） */
  minVueVersion?: string
}

/**
 * 模板元数据
 */
export interface TemplateMetadata extends TemplateConfig {
  /** 模板唯一标识符 */
  id?: string
  /** 模板分类 */
  category: string
  /** 设备类型 */
  device: DeviceType
  /** 模板文件路径 */
  componentPath: string
  /** 组件加载器函数 */
  componentLoader?: () => Promise<Component>
  /** 样式文件路径 */
  stylePath?: string
  /** 配置文件路径 */
  configPath: string
  /** 最后修改时间 */
  lastModified?: number
  /** 是否为内置模板 */
  isBuiltIn?: boolean
}

/**
 * 模板索引映射
 */
export type TemplateIndex = Map<string, Map<DeviceType, Map<string, TemplateMetadata>>>

/**
 * 模板渲染器动画配置
 */
export interface TemplateRendererAnimationConfig {
  /** 模板选择器动画配置 */
  selector?: {
    type?: 'fade' | 'slide' | 'scale' | 'slide-fade' | 'scale-fade'
    duration?: number
    direction?: 'up' | 'down' | 'left' | 'right'
    easing?: string
    delay?: number
    enabled?: boolean
  }
  /** 模板切换动画配置 */
  templateSwitch?: {
    type?: 'fade' | 'slide' | 'scale' | 'slide-fade' | 'scale-fade'
    duration?: number
    direction?: 'up' | 'down' | 'left' | 'right'
    easing?: string
    delay?: number
    enabled?: boolean
  }
  /** 是否启用动画 */
  enabled?: boolean
  /** 全局动画时长倍数 */
  durationMultiplier?: number
  /** 是否尊重用户的减少动画偏好 */
  respectReducedMotion?: boolean
}

/**
 * 模板选择器样式配置
 */
export interface TemplateSelectorConfig {
  /** 选择器主题 */
  theme?: 'default' | 'modern' | 'minimal' | 'elegant'
  /** 选择器位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  /** 触发按钮样式 */
  triggerStyle?: 'button' | 'dropdown' | 'floating' | 'inline'
  /** 弹窗样式 */
  modalStyle?: 'overlay' | 'dropdown' | 'sidebar' | 'fullscreen'
  /** 动画类型 */
  animation?: 'fade' | 'slide' | 'scale' | 'bounce' | 'elastic'
  /** 自定义CSS类名 */
  customClass?: string
  /** 自定义样式 */
  customStyle?: Record<string, any>
  /** 是否显示搜索框 */
  showSearch?: boolean
  /** 是否显示标签筛选 */
  showTags?: boolean
  /** 是否显示排序选项 */
  showSort?: boolean
  /** 每行显示的模板数量 */
  itemsPerRow?: number
  /** 最大高度 */
  maxHeight?: string | number
  /** 最大宽度 */
  maxWidth?: string | number
}

/**
 * 模板渲染器Props
 */
export interface TemplateRendererProps {
  /** 模板分类（必需） */
  category: string
  /** 设备类型（可选，默认自动检测） */
  device?: DeviceType
  /** 模板名称（可选，默认使用该分类下的默认模板） */
  templateName?: string
  /** 是否响应式跟随设备（默认: true） */
  responsive?: boolean
  /** 是否显示模板选择器（默认: false） */
  showSelector?: boolean
  /** 加载失败时的备用模板名称（可选） */
  fallbackTemplate?: string
  /** 自定义加载组件（可选） */
  loadingComponent?: Component
  /** 自定义错误组件（可选） */
  errorComponent?: Component
  /** 传递给模板的属性（可选） */
  props?: Record<string, any>
  /** 动画配置（可选） */
  animationConfig?: TemplateRendererAnimationConfig
  /** 模板选择器样式配置（可选） */
  selectorConfig?: TemplateSelectorConfig
  /** 模板切换回调（可选） */
  /** 是否缓存模板选择（可选，默认 true） */
  cacheSelection?: boolean

  onTemplateChange?: (templateName: string) => void
  /** 加载错误回调（可选） */
  onLoadError?: (error: Error) => void
  /** 动画开始回调（可选） */
  onAnimationStart?: (type: string) => void
  /** 动画结束回调（可选） */
  onAnimationEnd?: (type: string) => void
}

/**
 * useTemplate Hook选项
 */
export interface UseTemplateOptions {
  /** 模板分类（可选，如果不提供则显示所有分类） */
  category?: string
  /** 设备类型 */
  device?: DeviceType
  /** 是否自动检测设备 */
  autoDetectDevice?: boolean
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 是否显示内置模板选择器 */
  showSelector?: boolean
  /** 模板选择器配置 */
  selectorConfig?: TemplateSelectorConfig
}

/**
 * useTemplate Hook返回值
 */
export interface UseTemplateReturn {
  /** 当前模板配置 */
  currentTemplate: Ref<TemplateMetadata | null>
  /** 当前模板组件 */
  currentComponent: Ref<Component | null>
  /** 可用模板列表 */
  availableTemplates: Ref<TemplateMetadata[]>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<string | null>
  /** 当前设备类型 */
  deviceType: Ref<DeviceType>
  /** 切换模板 */
  switchTemplate: (templateName: string) => Promise<void>
  /** 刷新模板列表 */
  refreshTemplates: () => Promise<void>
  /** 预加载模板 */
  preloadTemplate: (templateName: string) => Promise<void>
  /** 清除缓存 */
  clearCache: () => void
  /** 动画包装组件 */
  TemplateTransition: Component
  /** 是否显示选择器 */
  showSelector: Ref<boolean>
  /** 选择器配置 */
  selectorConfig: Ref<TemplateSelectorConfig>
  /** 打开选择器 */
  openSelector: () => void
  /** 关闭选择器 */
  closeSelector: () => void
}

/**
 * useSimpleTemplate Hook 选项
 */
export interface UseSimpleTemplateOptions {
  /** 模板分类（可选，默认 'login'） */
  category?: string
  /** 设备类型（可选，默认自动检测） */
  device?: DeviceType
  /** 是否显示模板选择器（可选，默认 false） */
  showSelector?: boolean
  /** 模板选择器配置（可选） */
  selectorConfig?: Partial<TemplateSelectorConfig>
  /** 传递给模板的属性（可选） */
  templateProps?: Record<string, any>
}

/**
 * useSimpleTemplate Hook 返回值
 */
export interface UseSimpleTemplateReturn {
  /** 可直接渲染的模板组件 */
  TemplateComponent: Component
  /** 是否显示选择器 */
  showSelector: Ref<boolean>
  /** 当前选中的模板名称 */
  selectedTemplate: Ref<string | undefined>
  /** 打开选择器 */
  openSelector: () => void
  /** 关闭选择器 */
  closeSelector: () => void
  /** 切换模板 */
  switchTemplate: (templateName: string) => void
}

/**
 * useTemplateList Hook 返回值
 */
export interface UseTemplateListReturn {
  /** 可用模板列表 */
  availableTemplates: Ref<TemplateMetadata[]>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<string | null>
  /** 当前设备类型 */
  deviceType: Ref<DeviceType>
  /** 刷新模板列表 */
  refresh: () => Promise<void>
}

/**
 * 模板选择器Props
 */
export interface TemplateSelectorProps {
  /** 当前分类 */
  category: string
  /** 当前设备类型 */
  device: DeviceType
  /** 当前选中的模板名称 */
  currentTemplate?: string
  /** 是否显示预览 */
  showPreview?: boolean
  /** 是否支持搜索 */
  searchable?: boolean
  /** 每页显示数量 */
  pageSize?: number
  /** 选择回调 */
  onSelect?: (templateName: string) => void
  /** 关闭回调 */
  onClose?: () => void
}

/**
 * 扩展的模板元数据
 */
export interface ExtendedTemplateMetadata extends TemplateMetadata {
  /** 模板状态 */
  status: 'active' | 'inactive' | 'deprecated'
  /** 优先级 */
  priority: number
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 使用统计 */
  usage: {
    count: number
    lastUsed: Date
    rating?: number
    ratingCount?: number
  }
  /** 兼容性信息 */
  compatibility: {
    browsers: string[]
    vue: string
    node?: string
  }
}

/**
 * 模板管理器配置
 */
export interface TemplateManagerConfig {
  /** 模板根目录 */
  templateRoot: string
  /** 是否启用缓存 */
  enableCache: boolean
  /** 缓存大小限制 */
  cacheSize: number
  /** 是否启用热更新 */
  enableHMR: boolean
  /** 设备检测配置 */
  deviceDetection: {
    breakpoints: {
      mobile: number
      tablet: number
      desktop: number
    }
  }
}

/**
 * 加载结果
 */
export interface LoadResult<T = Component> {
  /** 是否成功 */
  success: boolean
  /** 加载的数据 */
  data?: T
  /** 错误信息 */
  error?: Error
  /** 加载耗时 */
  duration: number
  /** 是否从缓存加载 */
  fromCache?: boolean
}

/**
 * 模板信息
 */
export interface TemplateInfo extends TemplateMetadata {
  /** 模板组件 */
  component?: Component
  /** 加载状态 */
  loaded: boolean
  /** 加载错误 */
  error?: Error
  /** 使用次数 */
  usageCount: number
  /** 最后使用时间 */
  lastUsed?: Date
}

/**
 * 模板事件类型
 */
export interface TemplateEvents {
  'template:load': TemplateInfo
  'template:error': { template: string; error: Error }
  'template:switch': { from: string; to: string }
  'device:change': DeviceType
  'cache:hit': string
  'cache:miss': string
  'cache:clear': { category?: string; device?: DeviceType }
}

/**
 * 事件监听器类型
 */
export type EventListener<T = any> = (data: T) => void

/**
 * 预加载策略
 */
export type PreloadStrategy = 'immediate' | 'idle' | 'interaction' | 'visible' | 'none'

/**
 * 文件变更事件
 */
export interface FileChangeEvent {
  /** 变更类型 */
  type: 'add' | 'change' | 'unlink'
  /** 文件路径 */
  path: string
  /** 文件名 */
  filename: string
  /** 时间戳 */
  timestamp: number
  /** 模板信息 */
  templateInfo?: {
    category: string
    device: DeviceType
    templateName: string
    fileType: 'component' | 'config' | 'style' | 'preview'
  }
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  templateRoot: 'src/templates',
  enableCache: true,
  cacheSize: 50,
  enableHMR: true,
  deviceDetection: {
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1920
    }
  }
}
