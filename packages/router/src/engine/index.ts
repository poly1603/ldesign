/**
 * @ldesign/router Engine 集成模块
 *
 * 提供Router Engine插件，用于Engine集成
 */

// ==================== Engine插件导出 ====================
export {
  createDefaultRouterEnginePlugin,
  createRouterEnginePlugin,
  routerPlugin,
} from './plugin'

export type { RouterEnginePluginOptions } from './plugin'
