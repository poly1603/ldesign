/**
 * Vue 3 适配器 - 完整的Vue集成解决方案
 *
 * 提供：
 * - 组合式API (Composables)
 * - Vue插件 (Plugin)
 * - Vue组件 (Components)
 * - 指令 (Directives)
 * - 类型定义
 */

export * from './components'
export { default as ColorPicker } from './components/ColorPicker'
export { default as ThemeProvider } from './components/ThemeProvider'
export { default as ThemeToggle } from './components/ThemeToggle'
// 导出所有Vue相关功能
export * from './composables'

export * from './directives'
export * from './plugin'
// 便捷的默认导出
export { default as ThemePlugin } from './plugin'
export * from './types'
