/**
 * Vue 3 组件和功能导出
 * 
 * 提供专门用于 Vue 3 的模板渲染组件和相关功能
 */

// 导出 Vue 组件
export * from './components'

// 重新导出核心类型，方便 Vue 组件使用
export type {
  DeviceType,
  TemplateInfo,
  TemplateRendererProps,
  TemplateCategory,
  TemplateConfig,
  TemplateLoaderOptions,
  TemplateManagerOptions
} from '../types'

// 重新导出 composables，方便 Vue 组件使用
export {
  useTemplate,
  useDeviceDetection,
  useResponsiveTemplate
} from '../composables'

// 重新导出工具函数
export {
  validateTemplate,
  createTemplateCache,
  clearTemplateCache
} from '../utils'
