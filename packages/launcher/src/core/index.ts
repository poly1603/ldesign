/**
 * 核心模块统一导出
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

export * from './ViteLauncher'
export * from './ConfigManager'
export * from './ConfigPresets'
export * from './CacheManager'
export * from './PluginManager'
export * from './PluginMarket'
export * from './SmartPluginManager'
export * from './DevExperience'
export * from './TestIntegration'
export * from './ProjectTemplates'
export * from './AliasManager'

// 分别导出以避免命名冲突
export {
  PerformanceMonitor,
  PerformanceReport,
  type PerformanceMetrics as PerformanceMonitorMetrics
} from './PerformanceMonitor'

export {
  PerformanceOptimizer,
  type PerformanceMetrics as PerformanceOptimizerMetrics
} from './PerformanceOptimizer'

// 移除默认导出，保持导出一致性
// export { ViteLauncher as default } from './ViteLauncher'
