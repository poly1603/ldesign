/**
 * 性能优化模块导出
 */

// 性能监控
export { PerformanceMonitor } from './PerformanceMonitor'
export type { 
  PerformanceMonitorConfig,
  PerformanceMetrics,
  PerformanceReport,
  PerformanceGrade
} from './PerformanceMonitor'

// 虚拟渲染
export { VirtualRenderer, BatchDOMUpdater } from './VirtualRenderer'
export type {
  ViewportInfo,
  RenderLevel,
  VirtualRenderConfig
} from './VirtualRenderer'

// 内存优化
export { 
  MemoryOptimizer,
  ObjectPool,
  EventDelegationManager,
  DataCompressor
} from './MemoryOptimizer'
export type {
  MemoryOptimizerConfig,
  MemoryUsageInfo,
  MemoryOptimizationStats
} from './MemoryOptimizer'

// 交互优化
export {
  InteractionOptimizer,
  AsyncRenderManager,
  SmartUpdateManager,
  DragOptimizer,
  ZoomOptimizer,
  debounce,
  throttle
} from './InteractionOptimizer'
export type {
  InteractionOptimizerConfig,
  InteractionStats,
  DragStats,
  ZoomStats
} from './InteractionOptimizer'

// 测试数据生成
export {
  TestDataGenerator,
  PerformanceBenchmark
} from './TestDataGenerator'
export type {
  TestDataConfig,
  TestScenario,
  BenchmarkResult
} from './TestDataGenerator'
