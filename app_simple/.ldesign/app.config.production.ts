/**
 * 生产环境应用配置
 * Production Environment App Configuration
 */
export default {
  // 应用基础信息
  app: {
    name: 'LDesign App',
    version: '1.0.0',
    environment: 'production',
    debug: false, // 生产环境禁用调试
    title: 'LDesign App',
    description: 'LDesign 企业级应用框架'
  },

  // API 配置
  api: {
    baseURL: 'https://api.ldesign.com/api',
    timeout: 5000,
    retries: 2,
    enableMock: false, // 生产环境禁用 Mock
    enableCache: true, // 生产环境启用缓存
    enableLog: false // 生产环境禁用请求日志
  },

  // 功能开关
  features: {
    enableDevTools: false, // 生产环境禁用开发工具
    enableHotReload: false, // 生产环境禁用热重载
    enableSourceMap: false, // 生产环境禁用源码映射
    enableConsoleLog: false, // 生产环境禁用控制台日志
    enablePerformanceMonitor: true, // 生产环境启用性能监控
    enableErrorBoundary: true, // 生产环境启用错误边界
    enableTestMode: false // 生产环境禁用测试模式
  },

  // 主题配置
  theme: {
    mode: 'light', // 默认主题模式
    primaryColor: '#722ED1',
    enableDarkMode: true,
    enableCustomTheme: false // 生产环境禁用自定义主题
  },

  // 缓存配置
  cache: {
    enabled: true, // 生产环境启用缓存
    ttl: 1800, // 30分钟
    maxSize: 500,
    storage: 'localStorage'
  },

  // 日志配置
  logging: {
    level: 'error', // 生产环境只记录错误
    enableConsole: false,
    enableFile: false,
    enableRemote: true // 生产环境启用远程日志
  },

  // 安全配置
  security: {
    enableCSP: true, // 生产环境启用CSP
    enableCORS: true,
    allowedOrigins: ['https://ldesign.com', 'https://www.ldesign.com'],
    tokenExpiry: 7200 // 2小时
  },

  // 第三方服务配置
  services: {
    analytics: {
      enabled: true, // 生产环境启用分析
      trackingId: 'GA-XXXXXXXXX'
    },
    monitoring: {
      enabled: true, // 生产环境启用监控
      dsn: 'https://sentry.io/xxx'
    }
  }
}
