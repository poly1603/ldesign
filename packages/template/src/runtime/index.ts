/**
 * 运行时层统一导出
 *
 * 整合核心层，提供高层API
 */

// 生命周期管理
export { getLifecycle, LifecycleManager, resetLifecycle } from './lifecycle'

// 模板管理器
export { createTemplateManager, TemplateManager } from './manager'

// 性能监控
export { getMonitor, PerformanceMonitor, resetMonitor } from './monitor'
