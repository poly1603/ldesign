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

    // 检查现有组件
    const existingRouterLink = app.component('RouterLink')
    const existingRouterView = app.component('RouterView')

    // 保留原始组件
    if (keepOriginal) {
      if (existingRouterLink) {
        app.component(`${prefix}OriginalRouterLink`, existingRouterLink)
      }
      if (existingRouterView) {
        app.component(`${prefix}OriginalRouterView`, existingRouterView)
      }
    }

    // 注册增强组件 - 避免覆盖已存在的组件
    if (replaceRouterLink) {
      const LinkComponent = componentMap.RouterLink || RouterLink

      // 只有在组件不存在时才注册，避免覆盖 Vue Router 的默认组件
      if (!existingRouterLink) {
        app.component('RouterLink', LinkComponent)
      } else {
        // 如果组件已存在，记录调试信息但不覆盖
        if (
          typeof process !== 'undefined' &&
          process.env?.NODE_ENV === 'development'
        ) {
          console.debug(
            '[Enhanced Components Plugin] RouterLink already exists, using enhanced version as alias'
          )
        }
      }

      // 始终注册增强版本的别名
      app.component(`${prefix}EnhancedRouterLink`, LinkComponent)
    }

    if (replaceRouterView) {
      const ViewComponent = componentMap.RouterView || RouterView

      // 只有在组件不存在时才注册，避免覆盖 Vue Router 的默认组件
      if (!existingRouterView) {
        app.component('RouterView', ViewComponent)
      } else {
        // 如果组件已存在，记录调试信息但不覆盖
        if (
          typeof process !== 'undefined' &&
          process.env?.NODE_ENV === 'development'
        ) {
          console.debug(
            '[Enhanced Components Plugin] RouterView already exists, using enhanced version as alias'
          )
        }
      }

      // 始终注册增强版本的别名
      app.component(`${prefix}EnhancedRouterView`, ViewComponent)
    }

    // 注册别名组件（使用不同的名称避免冲突）
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
  return (_permission: string | string[]) => {
    // 这里可以实现实际的权限检查逻辑
    // 例如检查用户角色、权限等
    // console.log('Checking permission:', _permission)
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
  return (_event: string, _data: Record<string, any>) => {
    // 这里可以集成实际的分析系统
    // 例如 Google Analytics, 百度统计等
    // console.log('Track event:', _event, _data)
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
    // eslint-disable-next-line no-alert
    return window.confirm(title ? `${title}\n\n${message}` : message)
  }
}

/**
 * 默认布局解析器
 */
export function createDefaultLayoutResolver(): (layout: string) => any {
  return (_layout: string) => {
    // 这里可以实现布局组件的动态加载
    // console.log('Resolving layout:', _layout)
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
