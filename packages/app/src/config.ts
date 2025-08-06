/**
 * 应用配置文件
 */

// === 应用基础配置 ===
export const APP_CONFIG = {
  name: 'LDesign App',
  version: '1.0.0',
  description: '基于LDesign引擎的Vue3应用示例',
  author: 'LDesign Team'
} as const

// === 开发配置 ===
export const DEV_CONFIG = {
  debug: import.meta.env.DEV,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
  enableDevtools: import.meta.env.DEV
} as const

// === 主题配置 ===
export const THEME_CONFIG = {
  defaultTheme: 'light',
  availableThemes: ['light', 'dark', 'auto'],
  primaryColor: '#667eea',
  secondaryColor: '#764ba2'
} as const

// === 国际化配置 ===
export const I18N_CONFIG = {
  defaultLocale: 'zh-CN',
  availableLocales: ['zh-CN', 'en-US'],
  fallbackLocale: 'zh-CN'
} as const

// === 路由配置 ===
export const ROUTER_CONFIG = {
  mode: 'history',
  base: import.meta.env.BASE_URL || '/',
  scrollBehavior: 'smooth'
} as const

// === 水印配置 ===
export const WATERMARK_CONFIG = {
  enabled: true,
  text: 'LDesign',
  fontSize: 16,
  fontColor: 'rgba(0, 0, 0, 0.1)',
  angle: -20,
  zIndex: 1000
} as const

// === 模板配置 ===
export const TEMPLATE_CONFIG = {
  defaultTemplate: 'modern',
  availableTemplates: ['classic', 'modern', 'minimal', 'creative'],
  enableCache: true,
  enablePreload: true
} as const

// === 存储配置 ===
export const STORAGE_CONFIG = {
  prefix: 'ldesign_app_',
  enablePersist: true,
  storageType: 'localStorage'
} as const

// === 网络配置 ===
export const HTTP_CONFIG = {
  timeout: 10000,
  retryCount: 3,
  retryDelay: 1000
} as const

// === 导出所有配置 ===
export const CONFIG = {
  app: APP_CONFIG,
  dev: DEV_CONFIG,
  theme: THEME_CONFIG,
  i18n: I18N_CONFIG,
  router: ROUTER_CONFIG,
  watermark: WATERMARK_CONFIG,
  template: TEMPLATE_CONFIG,
  storage: STORAGE_CONFIG,
  http: HTTP_CONFIG
} as const

// === 配置类型 ===
export type AppConfig = typeof CONFIG
