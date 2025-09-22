/**
 * 组件导出文件
 *
 * 重构后的核心组件：
 * - TemplateSelector: 模板选择器组件
 * - TemplateRenderer: 模板渲染器组件
 * - TemplateTransition: 模板过渡动画组件
 * - VirtualScroll: 虚拟滚动组件
 * - TemplateConfigPanel: 模板配置面板组件
 */

export { default as TemplateRenderer } from './TemplateRenderer'
export { default as TemplateSelector } from './TemplateSelector'
export { TemplateTransition, TemplateContentWrapper } from './TemplateTransition'
export { VirtualScroll, type VirtualScrollItem, type VirtualScrollInstance } from './VirtualScroll'
export { default as TemplateConfigPanel } from './TemplateConfigPanel.vue'
