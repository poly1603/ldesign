/**
 * 开发环境应用配置
 * Development Environment App Configuration
 */
export default {
  // 应用基础信息
  app: {
    name: 'LDesign App - 配置变更检测成功1333！',
    version: '2.0.0',
    environment: 'development',
    debug: true, // 开发环境启用调试
    title: 'LDesign App - 开发环境',
    description: 'LDesign 应用开发环境'
  },

  // API 配置
  api: {
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    retries: 3,
    enableMock: true, // 开发环境启用 Mock
    enableCache: false, // 开发环境禁用缓存
    enableLog: true // 开发环境启用请求日志
  },

  // 功能开关
  features: {
    enableDevTools: true, // 开发工具
    enableHotReload: true, // 热重载
    enableSourceMap: true, // 源码映射
    enableConsoleLog: true, // 控制台日志
    enablePerformanceMonitor: true, // 性能监控
    enableErrorBoundary: true, // 错误边界
    enableTestMode: false // 测试模式
  },

  // 主题配置
  theme: {
    mode: 'light', // 默认主题模式
    primaryColor: '#722ED1',
    enableDarkMode: true,
    enableCustomTheme: true
  },

  // 缓存配置
  cache: {
    enabled: false, // 开发环境禁用缓存
    ttl: 300, // 5分钟
    maxSize: 100,
    storage: 'memory'
  },

  // 日志配置
  logging: {
    level: 'debug', // 开发环境详细日志
    enableConsole: true,
    enableFile: false,
    enableRemote: false
  },

  // 安全配置
  security: {
    enableCSP: false, // 开发环境禁用CSP
    enableCORS: true,
    allowedOrigins: ['http://localhost:3010', 'http://127.0.0.1:3010'],
    tokenExpiry: 3600 // 1小时
  },

  // 第三方服务配置
  services: {
    analytics: {
      enabled: false, // 开发环境禁用分析
      trackingId: ''
    },
    monitoring: {
      enabled: false, // 开发环境禁用监控
      dsn: ''
    }
  }
}
