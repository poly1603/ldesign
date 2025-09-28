/**
 * 简化的性能类型定义
 * 移除了复杂的监控和统计功能
 */

export interface SimplePerformanceMetrics {
  /** 组件加载次数 */
  loadCount: number
  /** 平均加载时间 */
  avgLoadTime: number
  /** 缓存命中率 */
  cacheHitRate: number
}

export interface SimplePerformanceConfig {
  /** 是否启用性能监控 */
  enabled: boolean
  /** 监控间隔（毫秒） */
  interval: number
}