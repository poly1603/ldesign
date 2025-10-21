/**
 * 预发布环境应用配置
 * Staging Environment App Configuration
 */
export default {
  // 应用基础信息
  app: {
    name: 'LDesign App',
    version: '1.0.0',
    environment: 'staging',
    debug: true, // 预发布环境启用调试
    title: 'LDesign App - 预发布环境',
    description: 'LDesign 应用预发布环境'
  },

  // API 配置
  api: {
    baseURL: 'https://staging-api.ldesign.com/api',
    timeout: 8000,
    retries: 3,
    enableMock: false, // 预发布环境禁用 Mock
    enableCache: true, // 预发布环境启用缓存
    enableLog: true // 预发布环境启用请求日志
  },

  // 功能开关
  features: {
    enableDevTools: true, // 预发布环境启用开发工具
    enableHotReload: false, // 预发布环境禁用热重载
    enableSourceMap: true, // 预发布环境启用源码映射
    enableConsoleLog: true, // 预发布环境启用控制台日志
    enablePerformanceMonitor: true, // 预发布环境启用性能监控
    enableErrorBoundary: true, // 预发布环境启用错误边界
    enableTestMode: false // 预发布环境禁用测试模式
  },

  // 主题配置
  theme: {
    mode: 'light', // 默认主题模式
    primaryColor: '#722ED1',
    enableDarkMode: true,
    enableCustomTheme: true // 预发布环境启用自定义主题
  },

  // 缓存配置
  cache: {
    enabled: true, // 预发布环境启用缓存
    ttl: 900, // 15分钟
    maxSize: 200,
    storage: 'sessionStorage'
  },

  // 日志配置
  logging: {
    level: 'info', // 预发布环境记录信息级别日志
    enableConsole: true,
    enableFile: false,
    enableRemote: true // 预发布环境启用远程日志
  },

  // 安全配置
  security: {
    enableCSP: true, // 预发布环境启用CSP
    enableCORS: true,
    allowedOrigins: ['https://staging.ldesign.com'],
    tokenExpiry: 3600 // 1小时
  },

  // 第三方服务配置
  services: {
    analytics: {
      enabled: true, // 预发布环境启用分析
      trackingId: 'GA-STAGING-XXX'
    },
    monitoring: {
      enabled: true, // 预发布环境启用监控
      dsn: 'https://sentry.io/staging-xxx'
    }
  }
}
