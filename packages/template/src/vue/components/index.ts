/**
 * Vue 组件模块
 *
 * 导出所有 Vue 组件
 */

// ============ 组件 ============
import TemplateRenderer from './TemplateRenderer'
import LazyTemplate from './LazyTemplate'
import PerformanceMonitor from './PerformanceMonitor'

// 重新导出
export { TemplateRenderer, LazyTemplate, PerformanceMonitor }

// ============ 默认导出 ============
export default {
  TemplateRenderer,
  LazyTemplate,
  PerformanceMonitor,
}
