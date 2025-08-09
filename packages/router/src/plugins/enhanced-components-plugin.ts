import type { App } from 'vue'
import type { ComponentEnhancementConfig } from '../components/types'
import { RouterLink } from '../components/RouterLink'
import { RouterView } from '../components/RouterView'

/**
 * 增强组件插件选项
 */
export interface EnhancedComponentsPluginOptions {
  /** 是否替换默认的 RouterLink */
  replaceRouterLink?: boolean
  /** 是否替换默认的 RouterView */
  replaceRouterView?: boolean
  /** 组件名称前缀 */
  prefix?: string
  /** 是否保留原始组件 */
  keepOriginal?: boolean
  /** 自定义组件映射 */
  componentMap?: {
    RouterLink?: any
    RouterView?: any
  }
  /** 增强配置 */
  enhancementConfig?: ComponentEnhancementConfig
}

/**
 * 增强组件插件
 * 用于自动替换 Vue Router 的默认组件为增强版本
 */
export class EnhancedComponentsPlugin {
  private options: Required<EnhancedComponentsPluginOptions>

  constructor(options: EnhancedComponentsPluginOptions = {}) {
    this.options = {
      replaceRouterLink: true,
      replaceRouterView: true,
      prefix: '',
      keepOriginal: false,
      componentMap: {},
      enhancementConfig: {},
      ...options,
    }
  }

  /**
   * 安装插件
   */
  install(app: App): void {
    const {
      replaceRouterLink,
      replaceRouterView,
      prefix,
      keepOriginal,
      componentMap,
      enhancementConfig,
    } = this.options

    // 提供增强配置
    if (enhancementConfig) {
      app.provide('routerEnhancementConfig', enhancementConfig)
    }

    // 保留原始组件
    if (keepOriginal) {
      const originalRouterLink = app.component('RouterLink')
      const originalRouterView = app.component('RouterView')

      if (originalRouterLink) {
        app.component(`${prefix}OriginalRouterLink`, originalRouterLink)
      }
      if (originalRouterView) {
        app.component(`${prefix}OriginalRouterView`, originalRouterView)
      }
    }

    // 注册增强组件
    if (replaceRouterLink) {
      const LinkComponent = componentMap.RouterLink || RouterLink
      app.component('RouterLink', LinkComponent)
      app.component(`${prefix}EnhancedRouterLink`, LinkComponent)
    }

    if (replaceRouterView) {
      const ViewComponent = componentMap.RouterView || RouterView
      app.component('RouterView', ViewComponent)
      app.component(`${prefix}EnhancedRouterView`, ViewComponent)
    }

    // 注册别名组件
    app.component(`${prefix}Link`, RouterLink)
    app.component(`${prefix}View`, RouterView)

    // console.log('Enhanced Router Components Plugin installed')
  }

  /**
   * 更新增强配置
   */
  updateConfig(config: Partial<ComponentEnhancementConfig>): void {
    Object.assign(this.options.enhancementConfig, config)
  }

  /**
   * 获取当前配置
   */
  getConfig(): ComponentEnhancementConfig {
    return { ...this.options.enhancementConfig }
  }
}

/**
 * 创建增强组件插件
 */
export function createEnhancedComponentsPlugin(
  options?: EnhancedComponentsPluginOptions
): EnhancedComponentsPlugin {
  return new EnhancedComponentsPlugin(options)
}

/**
 * 默认权限检查器
 */
export function createDefaultPermissionChecker(): (
  permission: string | string[]
) => boolean {
  return (permission: string | string[]) => {
    // 这里可以实现实际的权限检查逻辑
    // 例如检查用户角色、权限等
    // console.log('Checking permission:', permission)
    return true // 默认允许所有权限
  }
}

/**
 * 默认事件追踪器
 */
export function createDefaultEventTracker(): (
  event: string,
  data: Record<string, any>
) => void {
  return (event: string, data: Record<string, any>) => {
    // 这里可以集成实际的分析系统
    // 例如 Google Analytics, 百度统计等
    // console.log('Track event:', event, data)
  }
}

/**
 * 默认确认对话框
 */
export function createDefaultConfirmDialog(): (
  message: string,
  title?: string
) => Promise<boolean> {
  return async (message: string, title?: string) => {
    // 这里可以使用更美观的对话框组件
    // 例如 Element Plus, Ant Design Vue 等
    return window.confirm(title ? `${title}\n\n${message}` : message)
  }
}

/**
 * 默认布局解析器
 */
export function createDefaultLayoutResolver(): (layout: string) => any {
  return (layout: string) => {
    // 这里可以实现布局组件的动态加载
    // console.log('Resolving layout:', layout)
    return null
  }
}

/**
 * 创建完整的增强配置
 */
export function createEnhancementConfig(
  options: Partial<ComponentEnhancementConfig> = {}
): ComponentEnhancementConfig {
  return {
    permissionChecker: createDefaultPermissionChecker(),
    eventTracker: createDefaultEventTracker(),
    confirmDialog: createDefaultConfirmDialog(),
    layoutResolver: createDefaultLayoutResolver(),
    defaults: {
      link: {
        variant: 'default',
        size: 'medium',
        preload: 'none',
        preloadDelay: 200,
      },
      view: {
        transition: 'fade',
        transitionMode: 'out-in',
        keepAlive: false,
        trackPerformance: false,
        errorBoundary: true,
        scrollToTop: false,
      },
    },
    ...options,
  }
}

/**
 * 快速设置增强组件
 */
export function setupEnhancedComponents(
  app: App,
  options: EnhancedComponentsPluginOptions = {}
): EnhancedComponentsPlugin {
  const enhancementConfig = createEnhancementConfig(options.enhancementConfig)

  const plugin = createEnhancedComponentsPlugin({
    ...options,
    enhancementConfig,
  })

  app.use(plugin)

  return plugin
}

// 导出默认插件实例
export default EnhancedComponentsPlugin
