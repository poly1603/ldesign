/**
 * App Configuration Types
 * 
 * 应用配置的完整类型定义
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * API 配置
 */
export interface ApiConfig {
  /** API 基础 URL */
  baseUrl: string
  /** 请求超时时间（毫秒） */
  timeout?: number
  /** 是否启用重试 */
  retry?: boolean
  /** 重试次数 */
  retryCount?: number
  /** 请求头 */
  headers?: Record<string, string>
  /** 是否启用缓存 */
  cache?: boolean
  /** 缓存时间（毫秒） */
  cacheTime?: number
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主色调 */
  primaryColor: string
  /** 次要颜色 */
  secondaryColor?: string
  /** 成功颜色 */
  successColor?: string
  /** 警告颜色 */
  warningColor?: string
  /** 错误颜色 */
  errorColor?: string
  /** 信息颜色 */
  infoColor?: string
  /** 边框圆角 */
  borderRadius?: string
  /** 字体大小 */
  fontSize?: string
  /** 字体家族 */
  fontFamily?: string
  /** 是否启用暗色模式 */
  darkMode?: boolean
  /** 自定义 CSS 变量 */
  cssVariables?: Record<string, string>
}

/**
 * 功能特性配置
 */
export interface FeaturesConfig {
  /** 是否启用开发工具 */
  devTools?: boolean
  /** 是否启用 Mock 数据 */
  mock?: boolean
  /** 是否启用热更新 */
  hotReload?: boolean
  /** 是否启用错误边界 */
  errorBoundary?: boolean
  /** 是否启用性能监控 */
  performance?: boolean
  /** 是否启用分析工具 */
  analytics?: boolean
  /** 是否启用 PWA */
  pwa?: boolean
  /** 是否启用离线模式 */
  offline?: boolean
}

/**
 * 国际化配置
 */
export interface I18nConfig {
  /** 默认语言 */
  defaultLocale?: string
  /** 支持的语言列表 */
  locales?: string[]
  /** 是否启用自动检测 */
  autoDetect?: boolean
  /** 回退语言 */
  fallbackLocale?: string
  /** 语言包加载策略 */
  loadStrategy?: 'lazy' | 'eager'
}

/**
 * 路由配置
 */
export interface RouterConfig {
  /** 路由模式 */
  mode?: 'hash' | 'history'
  /** 基础路径 */
  base?: string
  /** 是否启用严格模式 */
  strict?: boolean
  /** 是否启用敏感模式 */
  sensitive?: boolean
  /** 滚动行为 */
  scrollBehavior?: 'auto' | 'smooth' | 'instant'
}

/**
 * 构建配置
 */
export interface BuildConfig {
  /** 输出目录 */
  outDir?: string
  /** 是否启用压缩 */
  minify?: boolean
  /** 是否生成 source map */
  sourcemap?: boolean
  /** 是否启用代码分割 */
  codeSplitting?: boolean
  /** 是否启用 Tree Shaking */
  treeShaking?: boolean
  /** 是否启用 Bundle 分析 */
  bundleAnalyzer?: boolean
}

/**
 * 安全配置
 */
export interface SecurityConfig {
  /** 内容安全策略 */
  csp?: string
  /** 是否启用 HTTPS */
  https?: boolean
  /** 是否启用 CORS */
  cors?: boolean
  /** 允许的域名列表 */
  allowedOrigins?: string[]
  /** 是否启用 XSS 保护 */
  xssProtection?: boolean
}

/**
 * 日志配置
 */
export interface LogConfig {
  /** 日志级别 */
  level?: 'debug' | 'info' | 'warn' | 'error'
  /** 是否启用控制台输出 */
  console?: boolean
  /** 是否启用文件输出 */
  file?: boolean
  /** 日志文件路径 */
  filePath?: string
  /** 是否启用远程日志 */
  remote?: boolean
  /** 远程日志服务 URL */
  remoteUrl?: string
}

/**
 * 应用配置接口
 */
export interface AppConfig {
  /** 应用名称 */
  appName: string
  /** 应用版本 */
  version: string
  /** 应用描述 */
  description?: string
  /** 应用作者 */
  author?: string
  /** 应用许可证 */
  license?: string
  /** 应用主页 */
  homepage?: string
  /** 应用仓库 */
  repository?: string
  /** 应用关键词 */
  keywords?: string[]
  
  /** API 配置 */
  api?: ApiConfig
  /** 主题配置 */
  theme?: ThemeConfig
  /** 功能特性配置 */
  features?: FeaturesConfig
  /** 国际化配置 */
  i18n?: I18nConfig
  /** 路由配置 */
  router?: RouterConfig
  /** 构建配置 */
  build?: BuildConfig
  /** 安全配置 */
  security?: SecurityConfig
  /** 日志配置 */
  log?: LogConfig
  
  /** 自定义配置 */
  [key: string]: any
}

/**
 * 配置函数类型
 */
export type ConfigFunction = () => AppConfig | Promise<AppConfig>

/**
 * 配置输入类型
 */
export type ConfigInput = AppConfig | ConfigFunction

/**
 * 导出所有类型
 */
export type {
  AppConfig as default
}
