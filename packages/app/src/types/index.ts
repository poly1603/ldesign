// ============ 应用类型定义 ============

// 用户相关类型
export interface User {
  id?: string
  username?: string
  email?: string
  avatar?: string
  roles?: string[]
  permissions?: string[]
  profile?: UserProfile
}

export interface UserProfile {
  firstName?: string
  lastName?: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  socialLinks?: {
    github?: string
    twitter?: string
    linkedin?: string
  }
}

// 认证相关类型
export interface LoginCredentials {
  username: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
  expiresIn?: number
}

// 主题相关类型
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
  borderRadius: number
  fontFamily?: string
  fontSize?: number
}

// 水印相关类型
export interface WatermarkConfig {
  enabled: boolean
  text: string
  showUserInfo: boolean
  showTimestamp: boolean
  fontSize: number
  fontColor: string
  fontFamily: string
  angle: number
  width: number
  height: number
  zIndex: number
  opacity: number
}

// 设备相关类型
export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile'
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice?: boolean
  userAgent?: string
  screenWidth?: number
  screenHeight?: number
  pixelRatio?: number
}

// 语言相关类型
export interface LocaleConfig {
  current: string
  available: string[]
  fallback?: string
}

// 通知相关类型
export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  closable?: boolean
  showIcon?: boolean
}

// 路由相关类型
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  requiresWatermark?: boolean
  transition?: 'fade' | 'slide' | 'zoom'
  layout?: 'auth' | 'main' | 'error'
  roles?: string[]
  permissions?: string[]
  preload?: Function | Function[]
}

// API相关类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp?: number
}

export interface ApiError {
  code: number
  message: string
  details?: any
  timestamp?: number
}

// 分页相关类型
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

export interface PaginatedResponse<T = any> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 表单相关类型
export interface FormField {
  name: string
  label: string
  type: 'text' | 'password' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea'
  value?: any
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  options?: Array<{ label: string; value: any }>
  validation?: {
    rules: Array<{
      required?: boolean
      min?: number
      max?: number
      pattern?: RegExp
      message: string
    }>
  }
}

export interface FormConfig {
  fields: FormField[]
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelWidth?: string
  submitText?: string
  resetText?: string
}

// 模板相关类型
export interface TemplateConfig {
  id: string
  name: string
  title: string
  description: string
  category: string
  device: string
  preview?: string
  component?: any
}

// 应用配置类型
export interface AppConfig {
  name: string
  version: string
  description?: string
  author?: string
  homepage?: string
  repository?: string
  license?: string
  debug?: boolean
  apiBaseUrl?: string
  cdnBaseUrl?: string
  features?: {
    watermark?: boolean
    darkMode?: boolean
    i18n?: boolean
    analytics?: boolean
  }
}

// 全局状态类型
export interface GlobalState {
  initialized: boolean
  loading: boolean
  user: User
  theme: ThemeConfig
  locale: LocaleConfig
  watermark: WatermarkConfig
  device: DeviceInfo
}

// 事件相关类型
export interface AppEvent {
  type: string
  payload?: any
  timestamp?: number
  source?: string
}

// 插件相关类型
export interface PluginConfig {
  name: string
  version: string
  enabled: boolean
  options?: Record<string, any>
}

// 错误相关类型
export interface AppError extends Error {
  code?: string | number
  details?: any
  timestamp?: number
  stack?: string
}
