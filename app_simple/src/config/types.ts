/**
 * 配置类型定义
 */

/**
 * 应用基础配置
 */
export interface AppConfig {
  name: string
  version: string
  description: string
  author: string
  debug: boolean
  environment: 'development' | 'production' | 'test'
  
  api: {
    baseUrl: string
    timeout: number
    retries: number
    headers: Record<string, string>
  }
  
  storage: {
    prefix: string
    expire: number
    encrypt: boolean
  }
}

/**
 * 引擎配置
 */
export interface EngineConfig {
  name: string
  version: string
  debug: boolean
  environment: string
  
  features: {
    hotReload: boolean
    devTools: boolean
    performanceMonitoring: boolean
    errorReporting: boolean
    securityProtection: boolean
    caching: boolean
    notifications: boolean
    analytics: boolean
  }
  
  plugins: {
    autoLoad: boolean
    lazyLoad: boolean
    preload: string[]
  }
  
  performance: {
    enabled: boolean
    sampleRate: number
    slowThreshold: number
    memoryWarningThreshold: number
  }
  
  logger: {
    enabled: boolean
    level: 'debug' | 'info' | 'warn' | 'error'
    maxLogs: number
    persistLogs: boolean
    remoteLogging: boolean
  }
}

/**
 * 国际化配置
 */
export interface I18nConfig {
  defaultLocale: string
  fallbackLocale: string
  supportedLocales: string[]
  messages: Record<string, any>
  dateTimeFormats?: Record<string, any>
  numberFormats?: Record<string, any>
  lazy: boolean
  preload: string[]
}

/**
 * 路由配置
 */
export interface RouterConfig {
  mode: 'hash' | 'history' | 'memory'
  base: string
  strict: boolean
  sensitive: boolean
  
  guards: {
    beforeEach: boolean
    afterEach: boolean
    onError: boolean
  }
  
  transitions: {
    enabled: boolean
    default: string
    duration: number
  }
  
  scrollBehavior: {
    smooth: boolean
    offset: { x: number; y: number }
  }
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
  colors: Record<string, string>
  transitions: boolean
  customProperties: Record<string, any>
}

/**
 * 尺寸配置
 */
export interface SizeConfig {
  default: 'small' | 'medium' | 'large'
  sizes: {
    small: number
    medium: number
    large: number
  }
  responsive: boolean
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
}

/**
 * 模板配置
 */
export interface TemplateConfig {
  type: string
  device: 'desktop' | 'mobile' | 'tablet' | 'auto'
  layout: string
  customTemplates: Record<string, any>
  preload: boolean
  cache: boolean
}

/**
 * 统一配置接口
 */
export interface UnifiedConfig {
  app: AppConfig
  engine: EngineConfig
  i18n: I18nConfig
  router: RouterConfig
  theme: ThemeConfig
  size: SizeConfig
  template: TemplateConfig
}

/**
 * 配置验证器接口
 */
export interface ConfigValidator<T = any> {
  validate(config: T): boolean
  errors: string[]
}

/**
 * 配置加载器接口
 */
export interface ConfigLoader {
  load(): Promise<Partial<UnifiedConfig>>
  loadSync(): Partial<UnifiedConfig>
}

/**
 * 环境变量映射
 */
export interface EnvConfig {
  VITE_API_BASE_URL?: string
  VITE_APP_NAME?: string
  VITE_APP_VERSION?: string
  VITE_DEFAULT_LOCALE?: string
  VITE_THEME_MODE?: 'light' | 'dark' | 'auto'
  [key: string]: any
}