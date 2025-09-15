/**
 * 优化模块类型定义
 * 
 * 定义性能监控、内存管理、用户体验改进、移动端适配、无障碍功能等相关类型
 */

import { EventEmitter } from 'events'

// ==================== 性能监控相关类型 ====================

/**
 * 性能指标类型
 */
export interface PerformanceMetrics {
  /** 内存使用情况 */
  memory: {
    used: number
    total: number
    percentage: number
  }
  /** CPU使用情况 */
  cpu: {
    usage: number
    cores: number
  }
  /** 渲染性能 */
  rendering: {
    fps: number
    frameTime: number
    droppedFrames: number
  }
  /** 网络性能 */
  network: {
    latency: number
    bandwidth: number
    requests: number
  }
  /** 用户交互性能 */
  interaction: {
    inputDelay: number
    responseTime: number
    scrollPerformance: number
  }
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
  /** 是否启用监控 */
  enabled: boolean
  /** 采样间隔（毫秒） */
  sampleInterval: number
  /** 最大历史记录数 */
  maxHistorySize: number
  /** 性能阈值 */
  thresholds: {
    memory: number
    cpu: number
    fps: number
    responseTime: number
  }
  /** 是否启用自动优化 */
  autoOptimize: boolean
  /** 报告配置 */
  reporting: {
    enabled: boolean
    interval: number
    endpoint?: string
  }
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  id: string
  timestamp: number
  duration: number
  metrics: PerformanceMetrics
  issues: PerformanceIssue[]
  recommendations: string[]
  score: number
}

/**
 * 性能问题
 */
export interface PerformanceIssue {
  type: 'memory' | 'cpu' | 'rendering' | 'network' | 'interaction'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  impact: string
  solution: string
  timestamp: number
}

// ==================== 内存管理相关类型 ====================

/**
 * 内存使用信息
 */
export interface MemoryUsage {
  /** 已使用内存（字节） */
  used: number
  /** 总内存（字节） */
  total: number
  /** 使用百分比 */
  percentage: number
  /** 堆内存信息 */
  heap: {
    used: number
    total: number
    limit: number
  }
  /** 对象计数 */
  objects: {
    nodes: number
    edges: number
    listeners: number
    timers: number
  }
}

/**
 * 内存泄漏检测结果
 */
export interface MemoryLeakDetection {
  /** 是否检测到泄漏 */
  hasLeak: boolean
  /** 泄漏类型 */
  leakTypes: Array<{
    type: 'dom' | 'event' | 'timer' | 'closure' | 'cache'
    count: number
    description: string
    severity: 'low' | 'medium' | 'high'
  }>
  /** 建议操作 */
  recommendations: string[]
  /** 检测时间 */
  timestamp: number
}

/**
 * 内存管理配置
 */
export interface MemoryManagerConfig {
  /** 是否启用内存管理 */
  enabled: boolean
  /** 内存阈值（百分比） */
  memoryThreshold: number
  /** 垃圾回收间隔（毫秒） */
  gcInterval: number
  /** 是否启用自动清理 */
  autoCleanup: boolean
  /** 缓存配置 */
  cache: {
    maxSize: number
    ttl: number
    strategy: 'lru' | 'lfu' | 'fifo'
  }
  /** 泄漏检测配置 */
  leakDetection: {
    enabled: boolean
    interval: number
    threshold: number
  }
}

// ==================== 用户体验相关类型 ====================

/**
 * 用户体验指标
 */
export interface UXMetrics {
  /** 加载时间 */
  loadTime: number
  /** 首次内容绘制时间 */
  firstContentfulPaint: number
  /** 最大内容绘制时间 */
  largestContentfulPaint: number
  /** 首次输入延迟 */
  firstInputDelay: number
  /** 累积布局偏移 */
  cumulativeLayoutShift: number
  /** 用户满意度评分 */
  userSatisfactionScore: number
}

/**
 * 用户体验改进配置
 */
export interface UXEnhancerConfig {
  /** 是否启用UX改进 */
  enabled: boolean
  /** 动画配置 */
  animations: {
    enabled: boolean
    duration: number
    easing: string
    respectMotionPreference: boolean
  }
  /** 加载优化 */
  loading: {
    showProgressBar: boolean
    showSkeleton: boolean
    lazyLoadThreshold: number
  }
  /** 交互优化 */
  interaction: {
    debounceDelay: number
    throttleDelay: number
    hapticFeedback: boolean
  }
  /** 视觉优化 */
  visual: {
    smoothScrolling: boolean
    highDPI: boolean
    colorScheme: 'auto' | 'light' | 'dark'
  }
}

// ==================== 移动端适配相关类型 ====================

/**
 * 设备信息
 */
export interface DeviceInfo {
  /** 设备类型 */
  type: 'desktop' | 'tablet' | 'mobile'
  /** 屏幕尺寸 */
  screen: {
    width: number
    height: number
    ratio: number
    orientation: 'portrait' | 'landscape'
  }
  /** 触摸支持 */
  touch: {
    supported: boolean
    maxPoints: number
    pressure: boolean
  }
  /** 网络信息 */
  network: {
    type: string
    effectiveType: string
    downlink: number
    rtt: number
  }
  /** 性能信息 */
  performance: {
    memory: number
    cores: number
    gpu: string
  }
}

/**
 * 移动端适配配置
 */
export interface MobileAdapterConfig {
  /** 是否启用移动端适配 */
  enabled: boolean
  /** 断点配置 */
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
  /** 触摸配置 */
  touch: {
    tapDelay: number
    longPressDelay: number
    swipeThreshold: number
    pinchThreshold: number
  }
  /** 布局配置 */
  layout: {
    responsive: boolean
    scaleFactor: number
    minZoom: number
    maxZoom: number
  }
  /** 性能配置 */
  performance: {
    reducedMotion: boolean
    lowPowerMode: boolean
    dataSaver: boolean
  }
}

// ==================== 无障碍功能相关类型 ====================

/**
 * 无障碍配置
 */
export interface AccessibilityConfig {
  /** 是否启用无障碍功能 */
  enabled: boolean
  /** 键盘导航 */
  keyboard: {
    enabled: boolean
    focusVisible: boolean
    trapFocus: boolean
    skipLinks: boolean
  }
  /** 屏幕阅读器 */
  screenReader: {
    enabled: boolean
    announcements: boolean
    liveRegions: boolean
    descriptions: boolean
  }
  /** 视觉辅助 */
  visual: {
    highContrast: boolean
    largeText: boolean
    reducedMotion: boolean
    colorBlindness: boolean
  }
  /** 语音控制 */
  voice: {
    enabled: boolean
    commands: string[]
    sensitivity: number
  }
}

/**
 * 无障碍检查结果
 */
export interface AccessibilityAudit {
  /** 检查时间 */
  timestamp: number
  /** 总体评分 */
  score: number
  /** 问题列表 */
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    rule: string
    description: string
    element?: string
    impact: 'minor' | 'moderate' | 'serious' | 'critical'
    solution: string
  }>
  /** 建议改进 */
  recommendations: string[]
  /** 合规性状态 */
  compliance: {
    wcag2AA: boolean
    wcag2AAA: boolean
    section508: boolean
  }
}

// ==================== 错误处理相关类型 ====================

/**
 * 错误类型
 */
export type ErrorType = 
  | 'javascript'
  | 'network'
  | 'validation'
  | 'permission'
  | 'resource'
  | 'timeout'
  | 'memory'
  | 'unknown'

/**
 * 错误信息
 */
export interface ErrorInfo {
  id: string
  type: ErrorType
  message: string
  stack?: string
  timestamp: number
  url?: string
  line?: number
  column?: number
  userAgent: string
  userId?: string
  sessionId: string
  context: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  recovered: boolean
}

/**
 * 错误处理配置
 */
export interface ErrorHandlerConfig {
  /** 是否启用错误处理 */
  enabled: boolean
  /** 是否自动恢复 */
  autoRecover: boolean
  /** 重试配置 */
  retry: {
    enabled: boolean
    maxAttempts: number
    delay: number
    backoff: 'linear' | 'exponential'
  }
  /** 报告配置 */
  reporting: {
    enabled: boolean
    endpoint?: string
    includeStack: boolean
    includeContext: boolean
  }
  /** 用户通知 */
  notification: {
    enabled: boolean
    showDetails: boolean
    allowDismiss: boolean
    autoHide: boolean
    duration: number
  }
}

// ==================== 优化管理器接口 ====================

/**
 * 性能监控器接口
 */
export interface IPerformanceMonitor extends EventEmitter {
  start(): void
  stop(): void
  getMetrics(): PerformanceMetrics
  generateReport(): PerformanceReport
  isRunning(): boolean
}

/**
 * 内存管理器接口
 */
export interface IMemoryManager extends EventEmitter {
  getUsage(): MemoryUsage
  cleanup(): Promise<void>
  detectLeaks(): Promise<MemoryLeakDetection>
  optimize(): Promise<void>
}

/**
 * 用户体验增强器接口
 */
export interface IUXEnhancer extends EventEmitter {
  getMetrics(): UXMetrics
  optimize(): Promise<void>
  applyTheme(theme: 'light' | 'dark' | 'auto'): void
  enableAnimations(enabled: boolean): void
}

/**
 * 移动端适配器接口
 */
export interface IMobileAdapter extends EventEmitter {
  getDeviceInfo(): DeviceInfo
  adapt(): void
  handleOrientationChange(): void
  optimizeForDevice(): void
}

/**
 * 无障碍管理器接口
 */
export interface IAccessibilityManager extends EventEmitter {
  audit(): Promise<AccessibilityAudit>
  enableKeyboardNavigation(): void
  enableScreenReader(): void
  applyHighContrast(enabled: boolean): void
}

/**
 * 错误处理器接口
 */
export interface IErrorHandler extends EventEmitter {
  handleError(error: Error, context?: Record<string, any>): void
  recover(errorId: string): Promise<boolean>
  getErrorHistory(): ErrorInfo[]
  clearErrors(): void
}

// ==================== 优化插件配置 ====================

/**
 * 优化插件配置
 */
export interface OptimizationPluginConfig {
  /** 性能监控配置 */
  performance?: PerformanceMonitorConfig
  /** 内存管理配置 */
  memory?: MemoryManagerConfig
  /** 用户体验配置 */
  ux?: UXEnhancerConfig
  /** 移动端适配配置 */
  mobile?: MobileAdapterConfig
  /** 无障碍配置 */
  accessibility?: AccessibilityConfig
  /** 错误处理配置 */
  errorHandling?: ErrorHandlerConfig
  /** 是否显示优化面板 */
  showOptimizationPanel?: boolean
  /** 面板位置 */
  panelPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** 是否启用调试模式 */
  debugMode?: boolean
}

// ==================== 事件类型 ====================

/**
 * 优化事件数据
 */
export interface OptimizationEventData {
  type: string
  timestamp: number
  data: any
  source: string
}

/**
 * 优化事件监听器
 */
export type OptimizationEventListener = (data: OptimizationEventData) => void

// ==================== 导出所有类型 ====================

export type {
  // 性能监控
  PerformanceMetrics,
  PerformanceMonitorConfig,
  PerformanceReport,
  PerformanceIssue,
  
  // 内存管理
  MemoryUsage,
  MemoryLeakDetection,
  MemoryManagerConfig,
  
  // 用户体验
  UXMetrics,
  UXEnhancerConfig,
  
  // 移动端适配
  DeviceInfo,
  MobileAdapterConfig,
  
  // 无障碍功能
  AccessibilityConfig,
  AccessibilityAudit,
  
  // 错误处理
  ErrorType,
  ErrorInfo,
  ErrorHandlerConfig,
  
  // 接口
  IPerformanceMonitor,
  IMemoryManager,
  IUXEnhancer,
  IMobileAdapter,
  IAccessibilityManager,
  IErrorHandler,
  
  // 插件配置
  OptimizationPluginConfig,
  
  // 事件
  OptimizationEventData,
  OptimizationEventListener
}
