/**
 * 多环境配置加载器
 * 根据环境动态加载对应的配置文件
 */

// 获取当前环境
const getEnvironment = (): string => {
  // 优先使用 Vite 的环境变量
  if (import.meta.env.MODE) {
    return import.meta.env.MODE
  }
  
  // 其次使用 NODE_ENV
  if (import.meta.env.VITE_NODE_ENV) {
    return import.meta.env.VITE_NODE_ENV
  }
  
  // 最后使用默认值
  return 'development'
}

// 动态加载配置
export const loadEnvConfig = async () => {
  const environment = getEnvironment()
  
  try {
    // 动态导入对应环境的配置文件
    const configModule = await import(`../../.ldesign/app.config.${environment}.ts`)
    const config = configModule.default
    
    // 添加运行时信息
    config.runtime = {
      environment,
      loadTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      viteMode: import.meta.env.MODE,
      viteDev: import.meta.env.DEV,
      viteProd: import.meta.env.PROD
    }
    
    // 在开发环境输出配置信息
    if (environment === 'development' || import.meta.env.DEV) {
      console.log('📋 当前环境配置:', config)
    }
    
    return config
  } catch (error) {
    console.error(`❌ 加载配置文件失败 (${environment}):`, error)
    
    // 回退到默认配置
    const defaultConfig = {
      app: {
        name: 'LDesign App',
        version: '1.0.0',
        environment: 'unknown',
        debug: false,
        title: 'LDesign App',
        description: 'LDesign 应用'
      },
      api: {
        baseURL: '/api',
        timeout: 5000,
        retries: 2,
        enableMock: false,
        enableCache: false,
        enableLog: false
      },
      features: {
        enableDevTools: false,
        enableHotReload: false,
        enableSourceMap: false,
        enableConsoleLog: false,
        enablePerformanceMonitor: false,
        enableErrorBoundary: true,
        enableTestMode: false
      },
      theme: {
        mode: 'light',
        primaryColor: '#722ED1',
        enableDarkMode: false,
        enableCustomTheme: false
      },
      cache: {
        enabled: false,
        ttl: 300,
        maxSize: 100,
        storage: 'memory'
      },
      logging: {
        level: 'error',
        enableConsole: false,
        enableFile: false,
        enableRemote: false
      },
      security: {
        enableCSP: false,
        enableCORS: true,
        allowedOrigins: [],
        tokenExpiry: 3600
      },
      services: {
        analytics: {
          enabled: false,
          trackingId: ''
        },
        monitoring: {
          enabled: false,
          dsn: ''
        }
      },
      runtime: {
        environment: 'unknown',
        loadTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        viteMode: import.meta.env.MODE,
        viteDev: import.meta.env.DEV,
        viteProd: import.meta.env.PROD
      }
    }
    
    return defaultConfig
  }
}

// 全局配置实例
let globalEnvConfig: any = null

// 获取全局配置
export const getEnvConfig = () => {
  if (!globalEnvConfig) {
    throw new Error('环境配置尚未加载，请先调用 loadEnvConfig()')
  }
  return globalEnvConfig
}

// 设置全局配置
export const setEnvConfig = (config: any) => {
  globalEnvConfig = config
  
  // 将配置挂载到全局对象，便于调试
  if (typeof window !== 'undefined') {
    (window as any).__LDESIGN_ENV_CONFIG__ = config
  }
}

// 初始化环境配置
export const initEnvConfig = async () => {
  const config = await loadEnvConfig()
  setEnvConfig(config)
  return config
}

// 获取当前环境名称
export const getCurrentEnvironment = () => {
  return getEnvironment()
}
