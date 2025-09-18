/**
 * @ldesign/builder - 工具函数统一导出
 * 
 * 提供所有工具函数的统一导出
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

// 配置相关工具
export * from './config'

// 通用工具函数 (复用 launcher 的实现)
export * from './file-system'
export * from './path-utils'
export * from './logger'
export * from './error-handler'

// 其他工具函数
export * from './format-utils'
export * from './banner-generator'
export * from './minify-processor'
export * from './package-updater'

// 高级功能模块 - 使用命名导出避免类型冲突
export {
  CodeQualityAnalyzer,
  type QualityAnalysisResult,
  type QualityIssue,
  type QualityMetrics
} from './code-quality-analyzer'

export {
  MemoryMonitor,
  debounce,
  throttle,
  formatBytes,
  formatDuration
} from './performance-utils'

export {
  DependencyAnalyzer,
  type DependencyAnalysisResult,
  type DependencyInfo as UtilsDependencyInfo,
  type CircularDependency,
  type VulnerabilityInfo
} from './dependency-analyzer'

export {
  BuildPerformanceAnalyzer,
  type BuildPerformanceAnalysis,
  type PerformanceBottleneck,
  type PhasePerformance,
  type PerformanceMetrics as UtilsPerformanceMetrics
} from './build-performance-analyzer'

export {
  CodeSplittingOptimizer,
  type SplittingAnalysisResult,
  type ModuleInfo as UtilsModuleInfo,
  type ChunkInfo as UtilsChunkInfo,
  type SplittingStrategy
} from './code-splitting-optimizer'

export {
  BuildCacheManager,
  type CacheEntry,
  type CacheStats as UtilsCacheStats,
  type CacheConfig as UtilsCacheConfig,
  type CacheOperationResult
} from './build-cache-manager'

// 基础工具模块
export * from './glob'
export * from './factory'
export * from './cache'

// 自动配置增强器
export {
  AutoConfigEnhancer,
  createAutoConfigEnhancer
} from './auto-config-enhancer'

// 注意：detection.ts, performance.ts, validation.ts 暂时为空，不导出
