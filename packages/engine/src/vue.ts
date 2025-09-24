/**
 * @ldesign/engine/vue - Vue集成模块
 * 
 * 提供Vue相关的集成功能
 */

// Vue插件
export { createVueEnginePlugin as LDesignEnginePlugin } from './vue/plugin'

// Vue组合式函数 - 从统一入口导入
export {
  // 核心引擎
  useEngine,
  // 异步操作
  useAsyncOperation,
  useRetry,
  usePromiseManager,
  // 表单处理
  useForm,
  // 性能监控
  usePerformance,
  // 状态管理
  useState,
  // UI工具
  useDialog,
  useNotifications,
  // 工具函数
  useDebounce,
  useThrottle
} from './vue/composables'

// 指令系统
export { createDirectiveManager, commonDirectives } from './directives/directive-manager'

// Vue相关类型
export type {
  DirectiveManager,
  EngineDirective,
} from './types'
