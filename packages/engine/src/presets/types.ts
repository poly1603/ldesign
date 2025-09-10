/**
 * 预设配置类型定义
 */

/**
 * 预设配置的基础模板
 * 🏗️ 减少重复代码，提供统一的配置结构
 */
export interface PresetTemplate {
  /** 应用基础信息 */
  app: {
    name: string
    version: string
    description: string
    author: string
  }
  /** 环境类型 */
  environment: 'development' | 'production' | 'test'
  /** 是否启用调试 */
  debug: boolean
  /** 功能开关 */
  features: {
    enableHotReload: boolean
    enableDevTools: boolean
    enablePerformanceMonitoring: boolean
    enableErrorReporting: boolean
    enableSecurityProtection: boolean
    enableCaching: boolean
    enableNotifications: boolean
  }
  /** 日志配置 */
  logger: {
    level: 'debug' | 'info' | 'warn' | 'error'
    maxLogs: number
    enableConsole: boolean
    enableStorage: boolean
    storageKey: string
    transports: string[]
  }
  /** 性能配置 */
  performance: {
    enabled: boolean
    sampleRate: number
    maxEntries: number
    thresholds: {
      responseTime: { good: number; poor: number }
      fps: { good: number; poor: number }
      memory: { warning: number; critical: number }
    }
  }
  /** 通知配置 */
  notifications: {
    enabled: boolean
    maxNotifications: number
    defaultDuration: number
    defaultPosition:
      | 'top-center'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-center'
      | 'bottom-right'
    defaultTheme: 'auto' | 'light' | 'dark'
  }
}
