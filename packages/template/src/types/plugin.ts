/**
 * 插件类型定义
 */

import type { TemplateManager } from '../runtime/manager'

/**
 * 插件接口
 */
export interface Plugin {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 安装插件 */
  install: (manager: TemplateManager) => void | Promise<void>
  /** 卸载插件 */
  uninstall?: () => void | Promise<void>
}

/**
 * 预加载插件配置
 */
export interface PreloadPluginConfig {
  /** 最大并发数 */
  maxConcurrent?: number
  /** 优先级列表 */
  priority?: string[]
  /** 延迟时间(ms) */
  delay?: number
  /** 最大重试次数 */
  maxRetries?: number
  /** 启用视口观察器 */
  enableIntersectionObserver?: boolean
}

/**
 * 动画插件配置
 */
export interface AnimationPluginConfig {
  /** 动画持续时间(ms) */
  duration?: number
  /** 缓动函数 */
  easing?: string
  /** 动画类型 */
  type?: 'fade' | 'slide' | 'scale' | 'flip'
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 日志插件配置
 */
export interface LoggerPluginConfig {
  /** 日志级别 */
  level?: 'debug' | 'info' | 'warn' | 'error'
  /** 日志前缀 */
  prefix?: string
  /** 是否启用颜色 */
  colors?: boolean
  /** 是否启用时间戳 */
  timestamp?: boolean
  /** 自定义日志处理器 */
  handler?: (level: string, message: string, ...args: any[]) => void
}

/**
 * DevTools插件配置
 */
export interface DevToolsPluginConfig {
  /** 是否启用 */
  enabled?: boolean
  /** DevTools标签名称 */
  label?: string
}
