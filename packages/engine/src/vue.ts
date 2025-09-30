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
  // 异步操作
  useAsyncOperation,
  // 工具函数
  useDebounce,
  // UI工具
  useDialog,
  // 核心引擎
  useEngine,
  // 表单处理
  useForm,
  useNotifications,
  // 性能监控
  usePerformance,
  usePromiseManager,
  useRetry,
  // 状态管理
  useState,
  useThrottle
} from './vue/composables'

// Vue插件
export { createVueEnginePlugin as LDesignEnginePlugin } from './vue/plugin'
