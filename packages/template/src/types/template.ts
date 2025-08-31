/**
 * 模板相关类型定义
 */

import type { Component, PropType } from 'vue'

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
  props?: Record<string, PropType<any> | any>
  /** 支持的插槽列表（可选） */
  slots?: string[]
  /** 依赖的其他模板或组件（可选） */
  dependencies?: string[]
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
  componentLoader?: () => Promise<any>
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
  /** 模板切换回调（可选） */
  onTemplateChange?: (templateName: string) => void
  /** 加载错误回调（可选） */
  onLoadError?: (error: Error) => void
}

/**
 * useTemplate Hook选项
 */
export interface UseTemplateOptions {
  /** 模板分类 */
  category: string
  /** 设备类型 */
  device?: DeviceType
  /** 是否自动检测设备 */
  autoDetectDevice?: boolean
  /** 是否启用缓存 */
  enableCache?: boolean
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
 * 导入Ref类型
 */
import type { Ref } from 'vue'
