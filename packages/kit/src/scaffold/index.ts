/**
 * 脚手架系统
 * 基于 CAC 的完整脚手架解决方案
 */

export * from './scaffold-manager'
export * from './template-manager'
export * from './plugin-manager'
export * from './environment-manager'
export * from './cli-builder'

// 重新导出主要类
export { ScaffoldManager } from './scaffold-manager'
export { TemplateManager } from './template-manager'
export { PluginManager } from './plugin-manager'
export { EnvironmentManager } from './environment-manager'
export { CliBuilder } from './cli-builder'
