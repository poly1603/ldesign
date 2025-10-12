/**
 * @ldesign/engine/vue - Vue集成模块
 *
 * 提供Vue相关的集成功能
 */

// 指令系统
export { commonDirectives, createDirectiveManager } from './directives/directive-manager'

// Vue相关类型
export type {
  DirectiveManager,
  EngineDirective,
} from './types'

// Vue组合式函数 - 从统一入口导入
export {
  // 核心引擎
  useEngine,
  useEngineAvailable,
  useEngineConfig,
  useEngineErrors,
  useEngineEvents,
  useEngineLogger,
  useEngineMiddleware,
  useEngineNotifications,
  useEnginePlugins,
  useEngineState
} from './vue/composables'

// Vue插件
export { createVueEnginePlugin as LDesignEnginePlugin } from './vue/plugin'
