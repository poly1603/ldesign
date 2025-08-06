/**
 * 应用类型定义文件
 */

// === 重新导出LDesign包的类型 ===
export type { Engine, CreateEngineOptions } from '@ldesign/engine'
export type { Router, RouteConfig } from '@ldesign/router'
export type { I18nOptions } from '@ldesign/i18n'
export type { TemplateOptions } from '@ldesign/template'
export type { WatermarkOptions } from '@ldesign/watermark'
export type { DeviceInfo, DeviceType } from '@ldesign/device'
export type { HttpClientConfig, HttpResponse } from '@ldesign/http'

// === 应用特定类型 ===

/**
 * 用户信息
 */
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
  permissions: string[]
  createdAt: string
  updatedAt: string
}

/**
 * 认证状态
 */
export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  refreshToken: string | null
  loginTime: number | null
  expiresAt: number | null
}

/**
 * 全局状态
 */
export interface GlobalState {
  loading: boolean
  theme: 'light' | 'dark' | 'auto'
  locale: string
  sidebarCollapsed: boolean
  watermark: {
    enabled: boolean
    text: string
    fontSize: number
    fontColor: string
    fontFamily: string
    angle: number
    width: number
    height: number
    zIndex: number
    opacity: number
    showUserInfo: boolean
    showTimestamp: boolean
  }
}

/**
 * 模板状态
 */
export interface TemplateState {
  currentTemplate: string
  availableTemplates: string[]
  templateConfig: Record<string, any>
  isLoading: boolean
}

/**
 * 通知类型
 */
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  closable?: boolean
  actions?: NotificationAction[]
  createdAt: number
}

/**
 * 通知操作
 */
export interface NotificationAction {
  label: string
  action: () => void
  type?: 'primary' | 'secondary'
}

/**
 * 路由元信息
 */
export interface RouteMeta {
  title?: string
  icon?: string
  requiresAuth?: boolean
  roles?: string[]
  permissions?: string[]
  keepAlive?: boolean
  hidden?: boolean
  breadcrumb?: boolean
}

/**
 * 菜单项
 */
export interface MenuItem {
  id: string
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
  meta?: RouteMeta
}

/**
 * API响应
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T = any> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * 表单验证规则
 */
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
  message?: string
}

/**
 * 表单字段
 */
export interface FormField {
  name: string
  label: string
  type: 'text' | 'password' | 'email' | 'number' | 'select' | 'checkbox' | 'radio'
  value?: any
  placeholder?: string
  options?: { label: string; value: any }[]
  rules?: ValidationRule[]
  disabled?: boolean
  readonly?: boolean
}

/**
 * 应用事件
 */
export interface AppEvent {
  type: string
  payload?: any
  timestamp: number
  source?: string
}

/**
 * 错误信息
 */
export interface AppError {
  code: string
  message: string
  details?: any
  stack?: string
  timestamp: number
}

/**
 * 应用配置选项
 */
export interface AppOptions {
  appName?: string
  version?: string
  debug?: boolean
  locale?: string
  theme?: string
  watermark?: Partial<GlobalState['watermark']>
}
