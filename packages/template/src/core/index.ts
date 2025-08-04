// 核心功能导出
export * from './TemplateManager'
export { templateRegistry } from './template-registry'
export { templateLoader } from './template-loader'
export type { TemplateCache } from './cache'
export { detectDeviceType, watchDeviceChange, getDeviceInfo } from './device'
