/**
 * 测试环境应用配置
 * Test Environment App Configuration
 */
export default {
  // 应用基础信息
  app: {
    name: 'LDesign App',
    version: '1.0.0',
    environment: 'test',
    debug: true, // 测试环境启用调试
    title: 'LDesign App - 测试环境',
    description: 'LDesign 应用测试环境'
  },

  // API 配置
  api: {
    baseURL: 'https://test-api.ldesign.com/api',
    timeout: 15000, // 测试环境更长超时
    retries: 5, // 测试环境更多重试
    enableMock: true, // 测试环境启用 Mock
    enableCache: false, // 测试环境禁用缓存
    enableLog: true // 测试环境启用请求日志
  },

  // 功能开关
  features: {
    enableDevTools: true, // 测试环境启用开发工具
    enableHotReload: false, // 测试环境禁用热重载
    enableSourceMap: true, // 测试环境启用源码映射
    enableConsoleLog: true, // 测试环境启用控制台日志
    enablePerformanceMonitor: true, // 测试环境启用性能监控
    enableErrorBoundary: true, // 测试环境启用错误边界
    enableTestMode: true // 测试环境启用测试模式
  },

  // 主题配置
  theme: {
    mode: 'light', // 默认主题模式
    primaryColor: '#722ED1',
    enableDarkMode: true,
    enableCustomTheme: true // 测试环境启用自定义主题
  },

  // 缓存配置
  cache: {
    enabled: false, // 测试环境禁用缓存
    ttl: 60, // 1分钟
    maxSize: 50,
    storage: 'memory'
  },

  // 日志配置
  logging: {
    level: 'debug', // 测试环境详细日志
    enableConsole: true,
    enableFile: true, // 测试环境启用文件日志
    enableRemote: false // 测试环境禁用远程日志
  },

  // 安全配置
  security: {
    enableCSP: false, // 测试环境禁用CSP
    enableCORS: true,
    allowedOrigins: ['https://test.ldesign.com', 'http://localhost:3013'],
    tokenExpiry: 1800 // 30分钟
  },

  // 第三方服务配置
  services: {
    analytics: {
      enabled: false, // 测试环境禁用分析
      trackingId: ''
    },
    monitoring: {
      enabled: true, // 测试环境启用监控
      dsn: 'https://sentry.io/test-xxx'
    }
  }
}
