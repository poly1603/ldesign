/**
 * 插件相关类型定义
 */

import type { App } from 'vue'
import type { DeviceType } from './template'

/**
 * 插件配置选项
 */
export interface TemplatePluginOptions {
  /** 自定义模板目录路径（默认: 'src/templates'） */
  templatesDir?: string
  /** 是否自动扫描（默认: true） */
  autoScan?: boolean
  /** 是否启用缓存（默认: true） */
  cache?: boolean
  /** 是否启用热更新（默认: 开发环境为true，生产环境为false） */
  enableHMR?: boolean
  /** 默认设备类型（默认: 'desktop'） */
  defaultDevice?: DeviceType
  /** 是否启用性能监控（默认: false） */
  enablePerformanceMonitor?: boolean
  /** 预加载策略配置 */
  preloadStrategy?: PreloadStrategy
}

/**
 * 预加载策略
 */
export interface PreloadStrategy {
  /** 是否启用预加载 */
  enabled?: boolean
  /** 预加载模式 */
  mode?: 'eager' | 'lazy' | 'intersection'
  /** 预加载数量限制 */
  limit?: number
  /** 预加载优先级模板列表 */
  priority?: string[]
}

/**
 * 插件安装函数类型
 */
export interface TemplatePluginInstall {
  (app: App, options?: TemplatePluginOptions): void
}

/**
 * 插件实例接口
 */
export interface TemplatePluginInstance {
  /** 安装函数 */
  install: TemplatePluginInstall
  /** 插件版本 */
  version: string
  /** 插件名称 */
  name: string
}
