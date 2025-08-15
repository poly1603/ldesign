/**
 * Engine 集成模块
 *
 * 提供 @ldesign/engine 的插件支持
 */

// ============ 插件支持 ============
export { createTemplateEnginePlugin, createDefaultTemplateEnginePlugin } from './plugin'

// ============ 类型定义 ============
export type { TemplateEnginePluginConfig, EnginePlugin } from './plugin'
