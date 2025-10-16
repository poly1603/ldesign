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
  /** 支持的插槽定义 */
  slots?: {
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
