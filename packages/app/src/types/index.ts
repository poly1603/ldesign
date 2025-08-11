/**
 * 类型定义导出
 *
 * 导出所有类型定义和接口
 */

import type { EngineImpl } from '@ldesign/engine'
import type { Router } from '@ldesign/router'

/**
 * 应用配置接口
 */
export interface AppConfig {
  /** 应用名称 */
  name: string
  /** 应用版本 */
  version: string
  /** 是否开启调试模式 */
  debug: boolean
  /** API 基础地址 */
  apiBaseUrl?: string
  /** 主题配置 */
  theme?: ThemeConfig
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主色调 */
  primaryColor?: string
  /** 辅助色 */
  secondaryColor?: string
  /** 暗色模式 */
  darkMode?: boolean
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  /** 用户ID */
  id: string | number
  /** 用户名 */
  username: string
  /** 邮箱 */
  email?: string
  /** 头像 */
  avatar?: string
  /** 角色 */
  roles?: string[]
  /** 权限 */
  permissions?: string[]
}

/**
 * 登录表单接口
 */
export interface LoginForm {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 记住我 */
  remember?: boolean
}

/**
 * API 响应接口
 */
export interface ApiResponse<T = any> {
  /** 状态码 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
  /** 是否成功 */
  success: boolean
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  /** 当前页码 */
  page: number
  /** 每页大小 */
  pageSize: number
  /** 总数 */
  total?: number
}

/**
 * 分页响应接口
 */
export interface PaginationResponse<T = any> {
  /** 数据列表 */
  list: T[]
  /** 分页信息 */
  pagination: PaginationParams
}

/**
 * 应用实例接口
 */
export interface AppInstance {
  /** Engine 实例 */
  engine: EngineImpl
  /** Router 实例 */
  router: Router
  /** 应用配置 */
  config: AppConfig
}

/**
 * 组件 Props 基础接口
 */
export interface BaseComponentProps {
  /** CSS 类名 */
  class?: string
  /** 内联样式 */
  style?: Record<string, any>
}

/**
 * 事件处理器类型
 */
export type EventHandler<T = Event> = (event: T) => void

/**
 * 异步事件处理器类型
 */
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>

/**
 * 可选的异步函数类型
 */
export type MaybeAsync<T> = T | Promise<T>
