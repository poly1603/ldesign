/**
 * @ldesign/template Engine 集成模块
 *
 * 提供Template Engine插件，用于Engine集成
 */

// ==================== Engine插件导出 ====================
export {
  createDefaultTemplateEnginePlugin,
  createTemplateEnginePlugin,
} from './plugin'

export type { TemplateEnginePluginOptions } from './plugin'

// ==================== 默认导出 ====================
export { createTemplateEnginePlugin as default } from './plugin'
