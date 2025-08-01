// Vue 相关类型定义
import type {
  DeviceType,
  TemplateDirectiveBinding,
  TemplateManagerConfig,
  TemplateMetadata,
  TemplateRenderOptions,
} from '../types'

export type {
  DeviceType,
  TemplateDirectiveBinding,
  TemplateManagerConfig,
  TemplateMetadata,
  TemplateRenderOptions,
}

// Vue 组件属性类型
export interface TemplateRendererProps {
  category: string
  device?: DeviceType
  template: string
  templateProps?: Record<string, any>
  cache?: boolean
  preload?: boolean
}

// Composable 选项类型
export interface UseTemplateOptions extends TemplateManagerConfig {
  autoScan?: boolean
  autoDetectDevice?: boolean
  initialTemplate?: {
    category: string
    device?: DeviceType
    template: string
  }
}

// Composable 返回类型
export interface UseTemplateReturn {
  currentTemplate: import('vue').Ref<import('vue').Component | null>
  loading: import('vue').Ref<boolean>
  error: import('vue').Ref<Error | null>
  render: (options: TemplateRenderOptions) => Promise<void>
  preload: (templates: Array<{ category: string, device?: DeviceType, template: string }>) => Promise<void>
  clearCache: (category?: string, device?: DeviceType, template?: string) => void
}

// 插件选项类型
export interface TemplatePluginOptions extends TemplateManagerConfig {
  componentPrefix?: string
  registerComponents?: boolean
  registerDirectives?: boolean
  provideGlobalProperties?: boolean
}
