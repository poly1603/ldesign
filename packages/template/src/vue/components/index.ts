/**
 * Vue 组件模块
 *
 * 导出所有 Vue 组件
 */

import LazyTemplate from './LazyTemplate'
import PerformanceMonitor from './PerformanceMonitor'
import TemplateProvider from './TemplateProvider'
// ============ 组件 ============
import TemplateRenderer from './TemplateRenderer'
import TemplateSelector from './TemplateSelector'

// 重新导出
export { LazyTemplate, PerformanceMonitor, TemplateProvider, TemplateRenderer, TemplateSelector }

// ============ 默认导出 ============
export default {
  TemplateRenderer,
  TemplateSelector,
  TemplateProvider,
  LazyTemplate,
  PerformanceMonitor,
}
