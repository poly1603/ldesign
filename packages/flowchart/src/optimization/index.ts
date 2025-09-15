/**
 * 优化模块导出
 * 
 * 统一导出所有优化相关的类、接口和工具函数
 */

// 核心管理器
export { PerformanceMonitor } from './PerformanceMonitor'
export { MemoryManager } from './MemoryManager'
export { UXEnhancer } from './UXEnhancer'
export { MobileAdapter } from './MobileAdapter'
export { AccessibilityManager } from './AccessibilityManager'
export { ErrorHandler } from './ErrorHandler'

// 类型定义
export type {
  // 性能监控相关
  IPerformanceMonitor,
  PerformanceMetrics,
  PerformanceMonitorConfig,
  PerformanceReport,
  
  // 内存管理相关
  IMemoryManager,
  MemoryUsage,
  MemoryLeakDetection,
  MemoryManagerConfig,
  
  // 用户体验相关
  IUXEnhancer,
  UXMetrics,
  UXEnhancerConfig,
  
  // 移动端适配相关
  IMobileAdapter,
  DeviceInfo,
  MobileAdapterConfig,
  
  // 无障碍相关
  IAccessibilityManager,
  AccessibilityConfig,
  AccessibilityAudit,
  
  // 错误处理相关
  IErrorHandler,
  ErrorInfo,
  ErrorHandlerConfig,
  ErrorType,
  
  // 插件配置
  OptimizationPluginConfig
} from './types'

// 工具函数
export const OptimizationUtils = {
  /**
   * 检测设备性能等级
   */
  detectPerformanceLevel(): 'low' | 'medium' | 'high' {
    const memory = (navigator as any).deviceMemory || 4
    const cores = navigator.hardwareConcurrency || 4
    const connection = (navigator as any).connection

    if (memory >= 8 && cores >= 8) {
      return 'high'
    } else if (memory >= 4 && cores >= 4) {
      return 'medium'
    } else {
      return 'low'
    }
  },

  /**
   * 检测网络状况
   */
  detectNetworkCondition(): 'fast' | 'slow' | 'offline' {
    if (!navigator.onLine) {
      return 'offline'
    }

    const connection = (navigator as any).connection
    if (connection) {
      const effectiveType = connection.effectiveType
      if (effectiveType === '4g' || effectiveType === '3g') {
        return 'fast'
      } else {
        return 'slow'
      }
    }

    return 'fast'
  },

  /**
   * 检测用户偏好
   */
  detectUserPreferences(): {
    reducedMotion: boolean
    highContrast: boolean
    darkMode: boolean
  } {
    return {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  },

  /**
   * 格式化字节大小
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * 格式化时间
   */
  formatTime(ms: number): string {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`
    } else {
      return `${(ms / 60000).toFixed(1)}m`
    }
  },

  /**
   * 计算颜色对比度
   */
  calculateColorContrast(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      // 简化的亮度计算
      const rgb = color.match(/\d+/g)
      if (!rgb) return 0
      
      const [r, g, b] = rgb.map(x => {
        const val = parseInt(x) / 255
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  },

  /**
   * 防抖函数
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  },

  /**
   * 节流函数
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        func.apply(null, args)
      }
    }
  },

  /**
   * 检查元素是否在视口中
   */
  isElementInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  },

  /**
   * 获取元素的计算样式
   */
  getComputedStyleValue(element: Element, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property)
  },

  /**
   * 检查浏览器支持
   */
  checkBrowserSupport(): {
    webgl: boolean
    webworker: boolean
    indexeddb: boolean
    websocket: boolean
    geolocation: boolean
    notification: boolean
    serviceWorker: boolean
  } {
    return {
      webgl: !!window.WebGLRenderingContext,
      webworker: !!window.Worker,
      indexeddb: !!window.indexedDB,
      websocket: !!window.WebSocket,
      geolocation: !!navigator.geolocation,
      notification: !!window.Notification,
      serviceWorker: 'serviceWorker' in navigator
    }
  },

  /**
   * 生成唯一ID
   */
  generateId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * 深度克隆对象
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as any
    }

    if (typeof obj === 'object') {
      const cloned = {} as any
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key])
        }
      }
      return cloned
    }

    return obj
  },

  /**
   * 合并配置对象
   */
  mergeConfig<T extends Record<string, any>>(defaults: T, overrides: Partial<T>): T {
    const result = this.deepClone(defaults)
    
    for (const key in overrides) {
      if (overrides.hasOwnProperty(key)) {
        const value = overrides[key]
        if (value !== undefined) {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            result[key] = this.mergeConfig(result[key] || {}, value)
          } else {
            result[key] = value
          }
        }
      }
    }
    
    return result
  },

  /**
   * 等待指定时间
   */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * 重试函数
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        if (attempt < maxAttempts) {
          await this.sleep(delay * attempt)
        }
      }
    }
    
    throw lastError!
  },

  /**
   * 创建可取消的Promise
   */
  createCancellablePromise<T>(
    executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void
  ): { promise: Promise<T>; cancel: () => void } {
    let cancelled = false
    
    const promise = new Promise<T>((resolve, reject) => {
      executor(
        (value) => {
          if (!cancelled) resolve(value)
        },
        (reason) => {
          if (!cancelled) reject(reason)
        }
      )
    })
    
    return {
      promise,
      cancel: () => {
        cancelled = true
      }
    }
  }
}

// 常量定义
export const OptimizationConstants = {
  // 性能阈值
  PERFORMANCE_THRESHOLDS: {
    MEMORY_WARNING: 70,
    MEMORY_CRITICAL: 85,
    FPS_WARNING: 45,
    FPS_CRITICAL: 30,
    LOAD_TIME_WARNING: 2000,
    LOAD_TIME_CRITICAL: 5000
  },

  // 设备断点
  DEVICE_BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
  },

  // 动画时长
  ANIMATION_DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },

  // 缓存配置
  CACHE_SETTINGS: {
    DEFAULT_TTL: 300000, // 5分钟
    MAX_SIZE: 100,
    CLEANUP_INTERVAL: 60000 // 1分钟
  },

  // 错误类型
  ERROR_TYPES: {
    JAVASCRIPT: 'javascript',
    NETWORK: 'network',
    VALIDATION: 'validation',
    PERMISSION: 'permission',
    RESOURCE: 'resource',
    TIMEOUT: 'timeout',
    MEMORY: 'memory',
    UNKNOWN: 'unknown'
  } as const,

  // 无障碍等级
  ACCESSIBILITY_LEVELS: {
    A: 'A',
    AA: 'AA',
    AAA: 'AAA'
  } as const,

  // 事件名称
  EVENTS: {
    PERFORMANCE_WARNING: 'performance:warning',
    MEMORY_WARNING: 'memory:warning',
    ERROR_OCCURRED: 'error:occurred',
    OPTIMIZATION_COMPLETED: 'optimization:completed',
    ACCESSIBILITY_VIOLATION: 'accessibility:violation'
  } as const
}

// 默认配置
export const DefaultOptimizationConfig: OptimizationPluginConfig = {
  enabled: true,
  performance: {
    enabled: true,
    autoOptimize: true,
    thresholds: {
      memory: OptimizationConstants.PERFORMANCE_THRESHOLDS.MEMORY_WARNING,
      fps: OptimizationConstants.PERFORMANCE_THRESHOLDS.FPS_WARNING,
      loadTime: OptimizationConstants.PERFORMANCE_THRESHOLDS.LOAD_TIME_WARNING
    }
  },
  memory: {
    enabled: true,
    autoCleanup: true,
    gcInterval: 30000,
    cache: {
      maxSize: OptimizationConstants.CACHE_SETTINGS.MAX_SIZE,
      ttl: OptimizationConstants.CACHE_SETTINGS.DEFAULT_TTL,
      strategy: 'lru'
    }
  },
  ux: {
    enabled: true,
    animations: {
      enabled: true,
      duration: OptimizationConstants.ANIMATION_DURATIONS.NORMAL,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      respectMotionPreference: true
    },
    loading: {
      showProgressBar: true,
      showSkeleton: true,
      lazyLoadThreshold: 100
    }
  },
  mobile: {
    enabled: true,
    breakpoints: {
      mobile: OptimizationConstants.DEVICE_BREAKPOINTS.MOBILE,
      tablet: OptimizationConstants.DEVICE_BREAKPOINTS.TABLET,
      desktop: OptimizationConstants.DEVICE_BREAKPOINTS.DESKTOP
    },
    layout: {
      responsive: true,
      scaleFactor: 1,
      minZoom: 0.5,
      maxZoom: 3
    }
  },
  accessibility: {
    enabled: true,
    keyboard: {
      enabled: true,
      focusVisible: true,
      trapFocus: false,
      skipLinks: true
    },
    screenReader: {
      enabled: true,
      announcements: true,
      liveRegions: true,
      descriptions: true
    }
  },
  errorHandling: {
    enabled: true,
    autoRecover: true,
    retry: {
      enabled: true,
      maxAttempts: 3,
      delay: 1000,
      backoff: 'exponential'
    },
    notification: {
      enabled: true,
      showDetails: false,
      allowDismiss: true,
      autoHide: true,
      duration: 5000
    }
  },
  ui: {
    showToolbar: true,
    showStatus: true,
    position: 'top-right'
  }
}

/**
 * 创建优化管理器实例
 */
export function createOptimizationManager(config: Partial<OptimizationPluginConfig> = {}) {
  const finalConfig = OptimizationUtils.mergeConfig(DefaultOptimizationConfig, config)
  
  return {
    performanceMonitor: finalConfig.performance.enabled ? new PerformanceMonitor(finalConfig.performance) : null,
    memoryManager: finalConfig.memory.enabled ? new MemoryManager(finalConfig.memory) : null,
    uxEnhancer: finalConfig.ux.enabled ? new UXEnhancer(finalConfig.ux) : null,
    mobileAdapter: finalConfig.mobile.enabled ? new MobileAdapter(finalConfig.mobile) : null,
    accessibilityManager: finalConfig.accessibility.enabled ? new AccessibilityManager(finalConfig.accessibility) : null,
    errorHandler: finalConfig.errorHandling.enabled ? new ErrorHandler(finalConfig.errorHandling) : null
  }
}

/**
 * 全局优化初始化函数
 */
export function initializeOptimization(config: Partial<OptimizationPluginConfig> = {}) {
  const managers = createOptimizationManager(config)
  
  // 启动各个管理器
  managers.performanceMonitor?.start()
  
  console.log('优化系统初始化完成')
  
  return managers
}
