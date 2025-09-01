/**
 * 插件相关类型定义
 */

import type { App } from 'vue'
import type { TemplateSystemConfig } from './config'

/**
 * 插件配置选项（向后兼容的接口）
 *
 * 这个接口保持向后兼容性，同时支持新的配置系统
 * 旧的配置选项会被自动转换为新的配置格式
 */
export interface TemplatePluginOptions extends Partial<TemplateSystemConfig> {
  /** @deprecated 使用 cache.enabled 替代 */
  cache?: boolean
  /** @deprecated 使用 preloadStrategy.priority 替代 */
  preloadTemplates?: string[]
  /** @deprecated 使用 cache.maxSize 替代 */
  cacheLimit?: number
  /** @deprecated 使用 deviceDetection.breakpoints.mobile 替代 */
  mobileBreakpoint?: number
  /** @deprecated 使用 deviceDetection.breakpoints.tablet 替代 */
  tabletBreakpoint?: number
  /** @deprecated 使用 deviceDetection.breakpoints.desktop 替代 */
  desktopBreakpoint?: number
  /** @deprecated 使用 preloadStrategy 替代 */
  preloadStrategy?: PreloadStrategy
}

/**
 * 预加载策略（向后兼容）
 * @deprecated 使用 PreloadStrategyConfig 替代
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
