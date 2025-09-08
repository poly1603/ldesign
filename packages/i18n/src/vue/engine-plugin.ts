/**
 * @ldesign/i18n Engine 插件
 * 
 * 将 I18n 集成到 LDesign Engine 中的插件实现
 * 参考 template 和 router 的架构模式
 */

import { computed, reactive } from 'vue'
import type { I18nEnginePluginOptions, I18nPreset } from './types'
import { createI18n } from '../core/createI18n'
import { installComponents } from './components/index'
import { installDirectives } from './directives'
import { I18nInjectionKey } from './plugin'

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
        ...(presetConfig.cache as any),
        ...(userOptions.cache as any)
      } as Required<I18nEnginePluginOptions['cache']>,
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
 * Vue 响应式状态
 * 用于确保语言切换时 Vue 组件能够正确响应
 */
const reactiveState = reactive({
  currentLocale: 'zh-CN',
  availableLocales: [] as string[]
})

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
    errorHandling,
    // 新增：功能与语言过滤配置
    features = { components: true, directives: true },
    enabledLanguages,
    disabledLanguages
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
              // 更新 Vue 响应式状态 - 这是关键！
              reactiveState.currentLocale = newLocale

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
            onLoadError: (_locale, err) => {
              engine.logger.error('I18n load error:', err)

              // 触发引擎事件
              if (engine.events) {
                engine.events.emit('i18n:loadError', err)
              }

              // 调用用户回调
              if (onLoadError) {
                onLoadError(err as Error)
              }
            }
          })

          // 初始化 I18n
          await pluginState.i18n.init()

          // 初始化响应式状态
          reactiveState.currentLocale = pluginState.i18n?.currentLocale || mergedOptions.locale

          // 统一获取并过滤语言代码
          const rawLanguages = pluginState.i18n?.getAvailableLanguages() || []
          let codes = rawLanguages.map((lang: any) => (typeof lang === 'string' ? lang : lang.code)).filter(Boolean)

          // 合并 messages 中的显式语言键，确保 UI 可以展示所有定义的语言
          const messageKeys = messages ? Object.keys(messages as Record<string, unknown>) : []
          codes = Array.from(new Set<string>([...codes, ...messageKeys]))

          if (Array.isArray(enabledLanguages) && enabledLanguages.length) {
            codes = codes.filter(code => enabledLanguages.includes(code))
          }
          if (Array.isArray(disabledLanguages) && disabledLanguages.length) {
            codes = codes.filter(code => !disabledLanguages.includes(code))
          }

          if (codes.length > 0) {
            reactiveState.availableLocales = codes
          } else {
            reactiveState.availableLocales = [mergedOptions.locale, mergedOptions.fallbackLocale].filter(Boolean) as string[]
          }

          // 直接提供已初始化的 I18n 实例到 Vue 应用
          // 创建一个简单的 Vue I18n 适配器
          const vueI18n = {
            locale: computed(() => reactiveState.currentLocale), // 现在依赖响应式状态
            availableLocales: computed(() => reactiveState.availableLocales), // 现在依赖响应式状态
            t: (key: string, params?: Record<string, unknown>) => {
              return pluginState.i18n?.t(key, params) || key
            },
            changeLanguage: async (locale: string) => {
              if (pluginState.i18n) {
                await pluginState.i18n.changeLanguage(locale)
              }
            },
            hasKey: (key: string) => {
              return pluginState.i18n?.hasKey(key) || false
            },
            getAvailableLanguages: () => {
              const raw = pluginState.i18n?.getAvailableLanguages() || []
              let codes = raw.map((lang: any) => (typeof lang === 'string' ? lang : lang.code)).filter(Boolean)

              // 合并 messages 的语言键，避免未预加载导致的丢失
              const messageKeys = messages ? Object.keys(messages as Record<string, unknown>) : []
              codes = Array.from(new Set<string>([...codes, ...messageKeys]))

              if (Array.isArray(enabledLanguages) && enabledLanguages.length) {
                codes = codes.filter(code => enabledLanguages.includes(code))
              }
              if (Array.isArray(disabledLanguages) && disabledLanguages.length) {
                codes = codes.filter(code => !disabledLanguages.includes(code))
              }
              return codes.length ? codes : [mergedOptions.locale, mergedOptions.fallbackLocale]
            },
            getCurrentLocale: () => {
              return pluginState.i18n?.currentLocale || mergedOptions.locale
            },
            getCurrentLanguage: () => {
              return pluginState.i18n?.getCurrentLanguage() || mergedOptions.locale
            },
            // 添加其他可能需要的方法
            global: {
              locale: computed(() => reactiveState.currentLocale), // 现在依赖响应式状态
              t: (key: string, params?: Record<string, unknown>) => {
                return pluginState.i18n?.t(key, params) || key
              }
            }
          }

          // 提供 Vue I18n 实例到 Vue 应用
          vueApp.provide(I18nInjectionKey, vueI18n)

          // 设置全局属性
          if (vueApp.config && vueApp.config.globalProperties) {
            vueApp.config.globalProperties.$i18n = vueI18n
            vueApp.config.globalProperties.$t = vueI18n.t
            vueApp.config.globalProperties.$te = vueI18n.hasKey
          }

          // 安装组件/指令可按需启用
          if (!features || features.components !== false) {
            installComponents(vueApp)
          }

          if (!features || features.directives !== false) {
            installDirectives(vueApp)
          }

          // 将 I18n 注册到 engine 上
          const i18nAdapter = {
            install: (_engine: any) => {
              // 已经安装，无需重复安装
            },
            t: pluginState.i18n.t.bind(pluginState.i18n),
            exists: pluginState.i18n.exists.bind(pluginState.i18n),
            changeLanguage: pluginState.i18n.changeLanguage.bind(pluginState.i18n),
            getCurrentLanguage: pluginState.i18n.getCurrentLanguage.bind(pluginState.i18n),
            getAvailableLanguages: () => {
              // 返回语言代码数组，而不是 LanguageInfo 对象数组
              const languages = pluginState.i18n.getAvailableLanguages()
              if (Array.isArray(languages) && languages.length > 0) {
                return languages.map(lang =>
                  typeof lang === 'string' ? lang : lang.code
                )
              }
              // 如果没有可用语言，返回默认语言
              return [mergedOptions.locale, mergedOptions.fallbackLocale]
            },
            setLocaleMessage: pluginState.i18n.setLocaleMessage?.bind(pluginState.i18n),
            getLocaleMessage: pluginState.i18n.getLocaleMessage?.bind(pluginState.i18n),
            getI18n: () => pluginState.i18n // 返回原始 I18n 实例
          }

          engine.i18n = i18nAdapter

          // 注册 I18n 状态到 engine 状态管理
          if (engine.state) {
            engine.state.set('i18n:currentLocale', pluginState.i18n.getCurrentLanguage())
            // 使用适配器的方法获取语言代码数组
            engine.state.set('i18n:availableLocales', i18nAdapter.getAvailableLanguages())
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
