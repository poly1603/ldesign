// 核心功能导出
export * from './TemplateManager'
export { templateRegistry } from './template-registry'
export { templateLoader } from './template-loader'
export type { TemplateCache } from './cache'
export { detectDeviceType, watchDeviceChange, getDeviceInfo } from './device'

// 函数式 API (从 TemplateManager 导出)
export {
  registerTemplate,
  getTemplate,
  getTemplatesByDevice,
  getTemplatesByCategory,
  getAllTemplates,
  getDefaultTemplate,
  hasTemplate,
  getTemplateConfig,
  getTemplateComponent,
  clearTemplateRegistry,
  getTemplateStats,
} from './TemplateManager'
