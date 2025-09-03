/**
 * @ldesign/i18n Engine 插件
 * 
 * 将 I18n 集成到 LDesign Engine 中的插件实现
 * 参考 template 和 router 的架构模式
 */

import type { I18nEnginePluginOptions, I18nPreset } from './types'
import { createI18n } from '../core/createI18n'
import { installComponents } from './components/index'
import { installDirectives } from './directives'
import { I18nInjectionKey, createVueI18n } from './plugin'

/**
 * Engine 插件接口（临时定义，避免循环依赖）
 */
interface EnginePlugin {
  name: string
  version: string
  dependencies?: string[]
  install: (context: any) => Promise<void>
  uninstall?: (context: any) => Promise<void>
  [key: string]: any
}

/**
 * 获取预设配置
 */
function getPresetConfig(preset: I18nPreset): Partial<I18nEnginePluginOptions> {
  const presets: Record<I18nPreset, Partial<I18nEnginePluginOptions>> = {
    spa: {
      storage: 'localStorage',
      autoDetect: true,
      cache: {
        enabled: true,
        maxSize: 1000,
        maxMemory: 50 * 1024 * 1024, // 50MB
        defaultTTL: 60 * 60 * 1000, // 1小时
        enableTTL: true,
        cleanupInterval: 5 * 60 * 1000, // 5分钟
        memoryPressureThreshold: 0.8
      },
      devtools: true,
      performance: true,
      errorHandling: {
        enableGlobalHandler: true,
        enableReporting: false
      }
    },
    mpa: {
      storage: 'sessionStorage',
      autoDetect: true,
      cache: {
        enabled: false,
        maxSize: 100,
        maxMemory: 10 * 1024 * 1024, // 10MB
        defaultTTL: 30 * 60 * 1000, // 30分钟
        enableTTL: false,
        cleanupInterval: 10 * 60 * 1000, // 10分钟
        memoryPressureThreshold: 0.9
      },
      devtools: false,
      performance: false,
      errorHandling: {
        enableGlobalHandler: false,
        enableReporting: false
      }
    },
    mobile: {
      storage: 'localStorage',
      autoDetect: true,
      cache: {
        enabled: true,
        maxSize: 500,
        maxMemory: 20 * 1024 * 1024, // 20MB
        defaultTTL: 2 * 60 * 60 * 1000, // 2小时
        enableTTL: true,
        cleanupInterval: 10 * 60 * 1000, // 10分钟
        memoryPressureThreshold: 0.7
      },
      devtools: false,
      performance: true,
      errorHandling: {
        enableGlobalHandler: true,
        enableReporting: true
      }
    },
    desktop: {
      storage: 'localStorage',
      autoDetect: true,
      cache: {
        enabled: true,
        maxSize: 2000,
        maxMemory: 100 * 1024 * 1024, // 100MB
        defaultTTL: 4 * 60 * 60 * 1000, // 4小时
        enableTTL: true,
        cleanupInterval: 5 * 60 * 1000, // 5分钟
        memoryPressureThreshold: 0.8
      },
      devtools: true,
      performance: true,
      errorHandling: {
        enableGlobalHandler: true,
        enableReporting: false
      }
    },
    admin: {
      storage: 'localStorage',
      autoDetect: false, // 管理后台通常有固定语言
      cache: {
        enabled: true,
        maxSize: 1500,
        maxMemory: 75 * 1024 * 1024, // 75MB
        defaultTTL: 8 * 60 * 60 * 1000, // 8小时
        enableTTL: true,
        cleanupInterval: 15 * 60 * 1000, // 15分钟
        memoryPressureThreshold: 0.8
      },
      devtools: true,
      performance: true,
      errorHandling: {
        enableGlobalHandler: true,
        enableReporting: true,
        reportEndpoint: '/api/errors'
      }
    },
    blog: {
      storage: 'localStorage',
      autoDetect: true,
      cache: {
        enabled: true,
        maxSize: 800,
        maxMemory: 30 * 1024 * 1024, // 30MB
        defaultTTL: 24 * 60 * 60 * 1000, // 24小时
        enableTTL: true,
        cleanupInterval: 30 * 60 * 1000, // 30分钟
        memoryPressureThreshold: 0.8
      },
      devtools: false,
      performance: true,
      errorHandling: {
        enableGlobalHandler: false,
        enableReporting: false
      }
    },
    ecommerce: {
      storage: 'localStorage',
      autoDetect: true,
      cache: {
        enabled: true,
        maxSize: 1200,
        maxMemory: 60 * 1024 * 1024, // 60MB
        defaultTTL: 6 * 60 * 60 * 1000, // 6小时
        enableTTL: true,
        cleanupInterval: 10 * 60 * 1000, // 10分钟
        memoryPressureThreshold: 0.8
      },
      devtools: false,
      performance: true,
      errorHandling: {
        enableGlobalHandler: true,
        enableReporting: true,
        reportEndpoint: '/api/i18n-errors'
      }
    }
  }

  return presets[preset] || {}
}

/**
 * 合并配置选项
 */
function mergeOptions(options: I18nEnginePluginOptions): I18nEnginePluginOptions {
  const { preset, ...userOptions } = options

  if (preset) {
    const presetConfig = getPresetConfig(preset)
    return {
      ...presetConfig,
      ...userOptions,
      // 深度合并缓存配置
      cache: {
        ...presetConfig.cache,
        ...userOptions.cache
      },
      // 深度合并错误处理配置
      errorHandling: {
        ...presetConfig.errorHandling,
        ...userOptions.errorHandling
      }
    }
  }

  return options
}

/**
 * 插件状态管理
 */
interface I18nPluginState {
  i18n: any | null
  installed: boolean
  options: I18nEnginePluginOptions | null
}

const pluginState: I18nPluginState = {
  i18n: null,
  installed: false,
  options: null
}

/**
 * 创建 I18n Engine 插件
 * 
 * @param options I18n 配置选项
 * @returns Engine 插件实例
 * 
 * @example
 * ```typescript
 * import { createI18nEnginePlugin } from '@ldesign/i18n'
 * 
 * // 使用预设配置
 * const i18nPlugin = createI18nEnginePlugin({
 *   preset: 'spa',
 *   locale: 'zh-CN',
 *   fallbackLocale: 'en',
 *   messages: {
 *     'zh-CN': { hello: '你好' },
 *     'en': { hello: 'Hello' }
 *   }
 * })
 * 
 * await engine.use(i18nPlugin)
 * ```
 */
export function createI18nEnginePlugin(options: I18nEnginePluginOptions): EnginePlugin {
  // 合并预设配置和用户配置
  const mergedOptions = mergeOptions(options)

  const {
    name = 'i18n',
    version = '2.0.0',
    locale,
    fallbackLocale,
    messages,
    storage,
    storageKey,
    autoDetect,
    preload,
    cache,
    onLanguageChanged,
    onLoadError,
    devtools,
    performance,
    errorHandling
  } = mergedOptions

  return {
    name,
    version,
    dependencies: [], // I18n 插件通常不依赖其他插件

    async install(context) {
      try {
        // 防止重复安装
        if (pluginState.installed) {
          console.warn('[I18nPlugin] Plugin is already installed')
          return
        }

        // 从上下文中获取引擎实例
        const engine = context.engine || context

        // 定义实际的安装逻辑
        const performInstall = async () => {
          // 获取 Vue 应用实例
          const vueApp = engine.getApp()
          if (!vueApp) {
            throw new Error(
              'Vue app not found. Make sure the engine has created a Vue app before installing i18n plugin.'
            )
          }

          // 记录插件安装开始
          engine.logger.info(`Installing ${name} plugin...`, {
            version,
            locale,
            fallbackLocale,
            messagesCount: messages ? Object.keys(messages).length : 0
          })

          // 创建 I18n 实例
          pluginState.i18n = createI18n({
            locale,
            fallbackLocale,
            messages,
            storage,
            storageKey,
            autoDetect,
            preload,
            cache,
            onLanguageChanged: (newLocale) => {
              // 更新引擎状态
              if (engine.state) {
                engine.state.set('i18n:currentLocale', newLocale)
              }

              // 触发引擎事件
              if (engine.events) {
                engine.events.emit('i18n:languageChanged', newLocale)
              }

              // 调用用户回调
              if (onLanguageChanged) {
                onLanguageChanged(newLocale)
              }
            },
            onLoadError: (error) => {
              engine.logger.error('I18n load error:', error)

              // 触发引擎事件
              if (engine.events) {
                engine.events.emit('i18n:loadError', error)
              }

              // 调用用户回调
              if (onLoadError) {
                onLoadError(error)
              }
            }
          })

          // 初始化 I18n
          await pluginState.i18n.init()

          // 创建 Vue I18n 适配器
          const vueI18n = createVueI18n({
            locale: mergedOptions.locale,
            fallbackLocale: mergedOptions.fallbackLocale,
            messages: mergedOptions.messages
          })

          // 提供 Vue I18n 实例到 Vue 应用
          vueApp.provide(I18nInjectionKey, vueI18n)

          // 设置全局属性
          if (vueApp.config && vueApp.config.globalProperties) {
            vueApp.config.globalProperties.$i18n = pluginState.i18n
            vueApp.config.globalProperties.$t = pluginState.i18n.t.bind(pluginState.i18n)
            vueApp.config.globalProperties.$te = pluginState.i18n.exists.bind(pluginState.i18n)
          }

          // 安装组件
          installComponents(vueApp)

          // 安装指令
          installDirectives(vueApp)

          // 将 I18n 注册到 engine 上
          const i18nAdapter = {
            install: (_engine: any) => {
              // 已经安装，无需重复安装
            },
            t: pluginState.i18n.t.bind(pluginState.i18n),
            exists: pluginState.i18n.exists.bind(pluginState.i18n),
            changeLanguage: pluginState.i18n.changeLanguage.bind(pluginState.i18n),
            getCurrentLanguage: pluginState.i18n.getCurrentLanguage.bind(pluginState.i18n),
            getAvailableLanguages: pluginState.i18n.getAvailableLanguages.bind(pluginState.i18n),
            setLocaleMessage: pluginState.i18n.setLocaleMessage?.bind(pluginState.i18n),
            getLocaleMessage: pluginState.i18n.getLocaleMessage?.bind(pluginState.i18n),
            getI18n: () => pluginState.i18n // 返回原始 I18n 实例
          }

          engine.i18n = i18nAdapter

          // 注册 I18n 状态到 engine 状态管理
          if (engine.state) {
            engine.state.set('i18n:currentLocale', pluginState.i18n.getCurrentLanguage())
            engine.state.set('i18n:availableLocales', pluginState.i18n.getAvailableLanguages())
            engine.state.set('i18n:fallbackLocale', fallbackLocale)
          }

          // 设置错误处理
          if (errorHandling?.enableGlobalHandler) {
            vueApp.config.errorHandler = (error: any, instance: any, info: any) => {
              engine.logger.error('I18n 相关错误:', error, info)

              if (errorHandling.enableReporting && errorHandling.reportEndpoint) {
                // 发送错误报告
                fetch(errorHandling.reportEndpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    error: error.message,
                    stack: error.stack,
                    info,
                    locale: pluginState.i18n.getCurrentLanguage(),
                    timestamp: new Date().toISOString()
                  })
                }).catch(reportError => {
                  engine.logger.error('Failed to report I18n error:', reportError)
                })
              }
            }
          }

          // 保存插件状态
          pluginState.options = mergedOptions
          pluginState.installed = true

          // 记录插件安装完成
          engine.logger.info(`${name} plugin installed successfully`, {
            currentLocale: pluginState.i18n.getCurrentLanguage(),
            availableLocales: pluginState.i18n.getAvailableLanguages()
          })

          // 触发插件安装完成事件
          if (engine.events) {
            engine.events.emit(`plugin:${name}:installed`, {
              i18n: pluginState.i18n,
              locale,
              fallbackLocale,
              availableLocales: pluginState.i18n.getAvailableLanguages()
            })
          }
        }

        // 检查 Vue 应用是否已经创建
        const vueApp = engine.getApp()
        if (vueApp) {
          // 如果 Vue 应用已经创建，立即安装
          await performInstall()
        } else {
          // 如果 Vue 应用还没创建，监听应用创建事件
          engine.events.once('app:created', async () => {
            try {
              await performInstall()
            } catch (error) {
              engine.logger.error(`Failed to install ${name} plugin after app creation:`, error)
            }
          })

          engine.logger.info(`${name} plugin registered, waiting for Vue app creation...`)
        }
      } catch (error) {
        // 安全地记录错误
        if (
          context.engine
          && context.engine.logger
          && typeof context.engine.logger.error === 'function'
        ) {
          context.engine.logger.error(`Failed to install ${name} plugin:`, error)
        } else {
          console.error(`Failed to install ${name} plugin:`, error)
        }
        throw error
      }
    },

    async uninstall(context) {
      try {
        // 从上下文中获取引擎实例
        const engine = context.engine || context

        engine.logger.info(`Uninstalling ${name} plugin...`)

        // 清理 I18n 引用
        if (engine.i18n) {
          engine.i18n = null
        }

        // 清理状态
        if (engine.state) {
          engine.state.delete('i18n:currentLocale')
          engine.state.delete('i18n:availableLocales')
          engine.state.delete('i18n:fallbackLocale')
        }

        // 重置插件状态
        pluginState.i18n = null
        pluginState.installed = false
        pluginState.options = null

        // 触发插件卸载事件
        if (engine.events) {
          engine.events.emit(`plugin:${name}:uninstalled`)
        }

        engine.logger.info(`${name} plugin uninstalled successfully`)
      } catch (error) {
        const engine = context.engine || context
        if (
          engine
          && engine.logger
          && typeof engine.logger.error === 'function'
        ) {
          engine.logger.error(`Failed to uninstall ${name} plugin:`, error)
        } else {
          console.error(`Failed to uninstall ${name} plugin:`, error)
        }
        throw error
      }
    }
  }
}

/**
 * 获取插件状态
 */
export function getI18nPluginState(): Readonly<I18nPluginState> {
  return pluginState
}

/**
 * 获取 I18n 实例
 */
export function getI18nInstance() {
  return pluginState.i18n
}

/**
 * 获取当前配置
 */
export function getI18nPluginOptions(): I18nEnginePluginOptions | null {
  return pluginState.options
}

// ==================== 便捷工厂函数 ====================

/**
 * 创建 SPA I18n 插件
 */
export function createSPAI18n(
  locale: string,
  messages: Record<string, Record<string, unknown>>,
  options?: Partial<I18nEnginePluginOptions>
) {
  return createI18nEnginePlugin({
    preset: 'spa',
    locale,
    messages,
    ...options
  })
}

/**
 * 创建移动端 I18n 插件
 */
export function createMobileI18n(
  locale: string,
  messages: Record<string, Record<string, unknown>>,
  options?: Partial<I18nEnginePluginOptions>
) {
  return createI18nEnginePlugin({
    preset: 'mobile',
    locale,
    messages,
    ...options
  })
}

/**
 * 创建桌面端 I18n 插件
 */
export function createDesktopI18n(
  locale: string,
  messages: Record<string, Record<string, unknown>>,
  options?: Partial<I18nEnginePluginOptions>
) {
  return createI18nEnginePlugin({
    preset: 'desktop',
    locale,
    messages,
    ...options
  })
}

/**
 * 创建管理后台 I18n 插件
 */
export function createAdminI18n(
  locale: string,
  messages: Record<string, Record<string, unknown>>,
  options?: Partial<I18nEnginePluginOptions>
) {
  return createI18nEnginePlugin({
    preset: 'admin',
    locale,
    messages,
    ...options
  })
}

/**
 * 创建博客 I18n 插件
 */
export function createBlogI18n(
  locale: string,
  messages: Record<string, Record<string, unknown>>,
  options?: Partial<I18nEnginePluginOptions>
) {
  return createI18nEnginePlugin({
    preset: 'blog',
    locale,
    messages,
    ...options
  })
}

/**
 * 创建电商 I18n 插件
 */
export function createEcommerceI18n(
  locale: string,
  messages: Record<string, Record<string, unknown>>,
  options?: Partial<I18nEnginePluginOptions>
) {
  return createI18nEnginePlugin({
    preset: 'ecommerce',
    locale,
    messages,
    ...options
  })
}

/**
 * 创建简单 I18n 插件（最小配置）
 */
export function createSimpleI18n(
  locale: string,
  messages: Record<string, Record<string, unknown>>,
  fallbackLocale = 'en'
) {
  return createI18nEnginePlugin({
    locale,
    fallbackLocale,
    messages,
    storage: 'memory',
    autoDetect: false,
    cache: {
      enabled: false,
      maxSize: 100,
      maxMemory: 5 * 1024 * 1024,
      defaultTTL: 30 * 60 * 1000,
      enableTTL: false,
      cleanupInterval: 60 * 1000,
      memoryPressureThreshold: 0.9
    },
    devtools: false,
    performance: false
  })
}

// ==================== 配置验证 ====================

/**
 * 验证 I18n 配置
 */
export function validateI18nConfig(options: I18nEnginePluginOptions): string[] {
  const errors: string[] = []

  if (!options.locale) {
    errors.push('locale 是必需的')
  }

  if (!options.messages || typeof options.messages !== 'object') {
    errors.push('messages 必须是一个对象')
  }

  if (options.messages && !options.messages[options.locale]) {
    errors.push(`messages 中缺少默认语言 "${options.locale}" 的翻译`)
  }

  if (options.fallbackLocale && options.messages && !options.messages[options.fallbackLocale]) {
    errors.push(`messages 中缺少降级语言 "${options.fallbackLocale}" 的翻译`)
  }

  if (options.storage && !['localStorage', 'sessionStorage', 'memory', 'none'].includes(options.storage)) {
    errors.push('storage 必须是 "localStorage", "sessionStorage", "memory" 或 "none" 之一')
  }

  if (options.preset && !['spa', 'mpa', 'mobile', 'desktop', 'admin', 'blog', 'ecommerce'].includes(options.preset)) {
    errors.push('preset 必须是有效的预设类型')
  }

  return errors
}

// ==================== 默认导出 ====================

export default {
  createI18nEnginePlugin,
  createSPAI18n,
  createMobileI18n,
  createDesktopI18n,
  createAdminI18n,
  createBlogI18n,
  createEcommerceI18n,
  createSimpleI18n,
  validateI18nConfig,
  getPresetConfig,
  mergeOptions,
  getI18nPluginState,
  getI18nInstance,
  getI18nPluginOptions
}

/**
 * I18n 插件工厂函数（向后兼容）
 */
export function i18nPlugin(options: I18nEnginePluginOptions): EnginePlugin {
  return createI18nEnginePlugin(options)
}
