/**
 * Vue Composables 模块
 *
 * 导出所有 Vue 组合式函数
 */

// ============ Composables ============
export { useTemplate } from './useTemplate'
export { useTemplateSelector } from './useTemplateSelector'
export { useTemplateProvider } from './useTemplateProvider'
export { useDynamicVirtualScroll, useSimpleVirtualScroll, useVirtualScroll } from './useVirtualScroll'

// ============ 导入组合式函数 ============
import { useTemplate } from './useTemplate'
import { useTemplateSelector } from './useTemplateSelector'
import { useTemplateProvider } from './useTemplateProvider'
import { useDynamicVirtualScroll, useSimpleVirtualScroll, useVirtualScroll } from './useVirtualScroll'

// ============ 默认导出 ============
export default {
  useTemplate,
  useTemplateSelector,
  useTemplateProvider,
  useVirtualScroll,
  useSimpleVirtualScroll,
  useDynamicVirtualScroll,
}
