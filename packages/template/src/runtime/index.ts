/**
 * 运行时层统一导出
 * 
 * 整合核心层，提供高层API
 */

// 模板管理器
export { TemplateManager, createTemplateManager } from './manager'

// 生命周期管理
export { LifecycleManager, getLifecycle, resetLifecycle } from './lifecycle'

// 性能监控
export { PerformanceMonitor, getMonitor, resetMonitor } from './monitor'
