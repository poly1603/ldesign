/**
 * 性能相关类型定义
 */

/**
 * 性能指标数据
 */
export interface PerformanceMetrics {
  /** FCP - 首次内容绘制 */
  fcp?: number
  /** LCP - 最大内容绘制 */
  lcp?: number
  /** FID - 首次输入延迟 */
  fid?: number
  /** CLS - 累积布局偏移 */
  cls?: number
  /** TTFB - 首字节时间 */
  ttfb?: number
  /** 自定义指标 */
  [key: string]: number | undefined
}

/**
 * 性能采样配置
 */
export interface PerformanceSamplingConfig {
  /** 采样率 (0-1) */
  rate?: number
  /** 最大样本数 */
  maxSamples?: number
  /** 采样间隔（毫秒） */
  interval?: number
}

/**
 * 性能报告选项
 */
export interface PerformanceReportOptions {
  /** 是否包含详细信息 */
  detailed?: boolean
  /** 时间范围 */
  timeRange?: {
    start: number
    end: number
  }
  /** 过滤器 */
  filter?: (metric: PerformanceMetrics) => boolean
}

/**
 * 性能优化建议
 */
export interface PerformanceSuggestion {
  /** 建议类型 */
  type: 'critical' | 'warning' | 'info'
  /** 建议标题 */
  title: string
  /** 建议描述 */
  description: string
  /** 影响程度 (1-10) */
  impact: number
  /** 实施难度 (1-10) */
  difficulty: number
}
