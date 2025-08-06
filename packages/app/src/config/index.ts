import type { AppConfig } from '../types'

/**
 * 应用配置
 */
export const appConfig: AppConfig = {
  name: 'LDesign App',
  version: '1.0.0',
  description: '基于LDesign引擎的Vue3应用示例，集成多模板登录系统和完整的企业级功能',
  author: 'LDesign Team',
  homepage: 'https://github.com/ldesign/app',
  repository: 'https://github.com/ldesign/app.git',
  license: 'MIT',
  
  // 环境配置
  debug: import.meta.env.DEV,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  cdnBaseUrl: import.meta.env.VITE_CDN_BASE_URL || '',
  
  // 功能开关
  features: {
    watermark: true,
    darkMode: true,
    i18n: true,
    analytics: false
  }
}

/**
 * 开发环境配置
 */
export const devConfig = {
  // 开发服务器配置
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  
  // 调试配置
  debug: {
    showPerformance: true,
    showRouteChanges: true,
    showStateChanges: true,
    showApiCalls: true
  },
  
  // 模拟数据配置
  mock: {
    enabled: true,
    delay: 500
  }
}

/**
 * 生产环境配置
 */
export const prodConfig = {
  // 性能配置
  performance: {
    enableGzip: true,
    enableBrotli: true,
    enableCaching: true,
    cacheMaxAge: 86400 // 24小时
  },
  
  // 安全配置
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true
  },
  
  // 监控配置
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    enableUserTracking: false
  }
}

/**
 * 主题配置
 */
export const themeConfig = {
  // 默认主题
  default: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    successColor: '#28a745',
    warningColor: '#ffc107',
    dangerColor: '#dc3545',
    infoColor: '#17a2b8',
    lightColor: '#f8f9fa',
    darkColor: '#343a40'
  },
  
  // 预设主题
  presets: [
    {
      name: 'blue',
      label: '经典蓝色',
      primaryColor: '#007bff'
    },
    {
      name: 'green',
      label: '清新绿色',
      primaryColor: '#28a745'
    },
    {
      name: 'purple',
      label: '优雅紫色',
      primaryColor: '#6f42c1'
    },
    {
      name: 'orange',
      label: '活力橙色',
      primaryColor: '#fd7e14'
    },
    {
      name: 'pink',
      label: '温馨粉色',
      primaryColor: '#e83e8c'
    }
  ]
}

/**
 * 国际化配置
 */
export const i18nConfig = {
  // 默认语言
  defaultLocale: 'zh-CN',
  
  // 回退语言
  fallbackLocale: 'en-US',
  
  // 支持的语言
  supportedLocales: [
    {
      code: 'zh-CN',
      name: '简体中文',
      flag: '🇨🇳'
    },
    {
      code: 'en-US',
      name: 'English',
      flag: '🇺🇸'
    }
  ],
  
  // 语言检测
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage']
  }
}

/**
 * 路由配置
 */
export const routerConfig = {
  // 路由模式
  mode: 'history',
  
  // 基础路径
  base: import.meta.env.BASE_URL || '/',
  
  // 滚动行为
  scrollBehavior: {
    smooth: true,
    offset: 0
  },
  
  // 路由守卫配置
  guards: {
    enableAuth: true,
    enablePermission: true,
    enableProgress: true
  }
}

/**
 * 水印配置
 */
export const watermarkConfig = {
  // 默认配置
  default: {
    text: 'LDesign',
    fontSize: 16,
    fontColor: 'rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
    angle: -20,
    width: 200,
    height: 150,
    zIndex: 1000,
    opacity: 0.1
  },
  
  // 是否启用
  enabled: true,
  
  // 是否显示用户信息
  showUserInfo: true,
  
  // 是否显示时间戳
  showTimestamp: true
}

/**
 * HTTP配置
 */
export const httpConfig = {
  // 基础URL
  baseURL: appConfig.apiBaseUrl,
  
  // 超时时间
  timeout: 10000,
  
  // 重试配置
  retry: {
    times: 3,
    delay: 1000
  },
  
  // 缓存配置
  cache: {
    enabled: true,
    maxAge: 300000 // 5分钟
  }
}

/**
 * 存储配置
 */
export const storageConfig = {
  // 存储前缀
  prefix: 'ldesign_',
  
  // 存储类型
  type: 'localStorage' as 'localStorage' | 'sessionStorage',
  
  // 加密存储
  encrypt: false,
  
  // 过期时间（毫秒）
  expire: 7 * 24 * 60 * 60 * 1000 // 7天
}

// 导出所有配置
export default {
  app: appConfig,
  dev: devConfig,
  prod: prodConfig,
  theme: themeConfig,
  i18n: i18nConfig,
  router: routerConfig,
  watermark: watermarkConfig,
  http: httpConfig,
  storage: storageConfig
}
