/**
 * 性能模块的主导出文件
 * 统一的性能管理系统
 */

export * from './performance-dashboard'

export {
  createUnifiedPerformanceManager as createPerformanceManager, // 向后兼容
  createUnifiedPerformanceManager,
  type PerformanceConfig,
  type PerformanceIssue,
  UnifiedPerformanceManager as PerformanceManager, // 向后兼容
  type PerformanceMark,
  type PerformanceMeasure,
  type PerformanceMetrics,
  type PerformanceReport,
  UnifiedPerformanceManager
} from './unified-performance'
