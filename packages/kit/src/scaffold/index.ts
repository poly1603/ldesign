/**
 * 脚手架系统
 * 基于 CAC 的完整脚手架解决方案
 */

export * from './cli-builder'
export { CliBuilder } from './cli-builder'
export * from './environment-manager'
export { EnvironmentManager } from './environment-manager'
export * from './plugin-manager'

export { PluginManager } from './plugin-manager'
export * from './scaffold-manager'
// 重新导出主要类
export { ScaffoldManager } from './scaffold-manager'
export * from './template-manager'
export { TemplateManager } from './template-manager'
