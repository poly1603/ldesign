/**
 * 应用配置
 */

export const APP_NAME = 'LDesign Router Demo'
export const APP_VERSION = '1.0.0'

/**
 * 应用基础配置
 */
export const appConfig = {
  name: APP_NAME,
  version: APP_VERSION,
  description: 'LDesign Router 示例应用',
  author: 'LDesign Team',

  // 开发配置
  debug: import.meta.env.DEV,
  environment: import.meta.env.MODE,

  // API 配置
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000,
    retries: 3
  },

  // 存储配置
  storage: {
    prefix: 'ldesign_',
    expire: 7 * 24 * 60 * 60 * 1000 // 7天
  },

  // 主题配置
  theme: {
    primaryColor: '#667eea',
    mode: 'light' // light | dark
  }
}

/**
 * 引擎配置
 */
export const engineConfig = {
  name: `${APP_NAME} Engine`,
  version: APP_VERSION,
  debug: appConfig.debug,
  environment: appConfig.environment,

  // 功能特性
  features: {
    enableHotReload: true,
    enableDevTools: true,
    enablePerformanceMonitoring: false,
    enableErrorReporting: true,
    enableSecurityProtection: false,
    enableCaching: true,
    enableNotifications: false
  },

  // 日志配置
  logger: {
    enabled: false, // 禁用所有日志，保持控制台完全干净
    level: 'error',
    maxLogs: 0,
    showTimestamp: false,
    showContext: false
  },

  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 50,
    defaultTTL: 5 * 60 * 1000 // 5分钟
  },

  // 性能监控
  performance: {
    enabled: !appConfig.debug,
    sampleRate: 0.1,
    slowThreshold: 1000
  }
}