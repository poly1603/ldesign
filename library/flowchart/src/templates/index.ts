/**
 * 模板系统导出
 */

export { TemplateManager } from './TemplateManager'
export { builtInTemplates, getBuiltInTemplatesByCategory, getBuiltInTemplate, getDefaultTemplate } from './builtInTemplates'

// 导出模板相关类型（从types/index.ts重新导出）
export type {
  FlowchartTemplate,
  TemplateMetadata,
  TemplateFilter,
  TemplateSortOptions,
  TemplateExportOptions,
  TemplateImportOptions,
  TemplateManagerConfig,
  TemplateManagerEvents,
  TemplateCategory
} from '../types'
