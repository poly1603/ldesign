/**
 * Vue 模板系统集成模块
 *
 * 提供完整的 Vue 3 模板系统功能，包括：
 * - 模板组件自动注册
 * - 响应式模板管理
 * - 性能优化组件
 * - 向后兼容性支持
 */

// 自动注册所有模板到全局注册表
import './templateRegistry'

// ============ 模板组件导出 ============
// 导出预构建的登录模板组件（向后兼容）
export { default as ClassicLoginTemplate } from '../templates/login/desktop/classic/index'
export { default as DefaultLoginTemplate } from '../templates/login/desktop/default/index'
export { default as ModernLoginTemplate } from '../templates/login/desktop/modern/index'

// ============ 核心组件导出 ============
export { default as LazyTemplate } from './components/LazyTemplate'
export { default as PerformanceMonitor } from './components/PerformanceMonitor'
export { TemplateRenderer } from './components/TemplateRenderer'
export { default as TemplateSelector } from './components/TemplateSelector'

// ============ 向后兼容性支持 ============
// 保留旧版本的 useTemplate Hook（已废弃，建议使用新版本）
export { useTemplate as useTemplateLegacy } from './composables/useTemplate'
// ============ 组合式函数导出 ============
export {
  registerTemplate,
  templateConfigs,
  type TemplateInfo,
  useTemplate,
  useTemplateSwitch,
  type UseTemplateSwitchOptions,
  type UseTemplateSwitchReturn,
} from './composables/useTemplateSystem'

// 虚拟滚动组合式函数
export { useSimpleVirtualScroll, useVirtualScroll } from './composables/useVirtualScroll'

// ============ 指令导出 ============
export { registerTemplateDirective, templateDirective } from './directives/template'

// ============ 插件导出 ============
export { getGlobalTemplateManager, TemplatePlugin } from './plugins'

// 默认导出 Vue 插件
export { TemplatePlugin as default } from './plugins'

// ============ 类型定义导出 ============
export type {
  TemplateDirectiveBinding,
  TemplatePluginOptions,
  TemplateRendererProps,
  UseTemplateOptions,
  UseTemplateReturn,
} from './types'
