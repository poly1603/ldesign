/**
 * I18n Engine 插件
 *
 * 提供与 @ldesign/engine 的集成支持，包括：
 * - 自动初始化和配置管理
 * - 生命周期钩子集成
 * - 事件系统集成
 * - 性能监控集成
 * - 错误处理集成
 */

import type { I18nInstance, I18nOptions } from '../../core/types'
import { globalErrorManager } from '../../core/errors'
import { I18n } from '../../core/i18n'
import { StaticLoader } from '../../core/loader'
import { I18N_INJECTION_KEY } from '../../vue/composables'
// 导入内置语言包
import enLanguagePackage from '../../locales/en'
import jaLanguagePackage from '../../locales/ja'
import zhCNLanguagePackage from '../../locales/zh-CN'

/**
 * 创建 I18n 实例
 * @param options I18n 配置选项
 * @param customTranslations 自定义翻译文件
 * @returns I18n 实例
 */
export async function createI18nInstance(
  options?: I18nOptions,
  customTranslations?: Record<string, any>,
): Promise<I18nInstance> {
  const loader = new StaticLoader()

  // 如果有自定义翻译文件，使用自定义的，否则使用内置的
  if (customTranslations) {
    Object.entries(customTranslations).forEach(([locale, translations]) => {
      // 将简单的翻译对象包装成LanguagePackage格式
      const languagePackage = {
        info: {
          name: locale,
          nativeName: locale,
          code: locale,
          region: locale.split('-')[1] || locale.toUpperCase(),
          direction: 'ltr' as const,
          dateFormat: 'YYYY-MM-DD',
        },
        translations,
      }
      loader.registerPackage(locale, languagePackage)
    })
  } else {
    loader.registerPackage('en', enLanguagePackage)
    loader.registerPackage('zh-CN', zhCNLanguagePackage)
    loader.registerPackage('ja', jaLanguagePackage)
  }

  const i18n = new I18n({ defaultLocale: 'en', ...options })
  i18n.setLoader(loader)

  await i18n.init()
  return i18n
}



/**
 * Engine 插件接口（与router插件保持一致）
 */
interface Plugin {
  name: string
  version: string
  dependencies?: string[]
  install: (context: any) => Promise<void>
  uninstall?: (context: any) => Promise<void>
}

/**
 * Engine 插件上下文
 */
export interface EnginePluginContext {
  engine: any // Engine 实例
  config?: Record<string, any>
  logger?: any // Logger 实例
  events?: any // Event Manager 实例
}

/**
 * I18n Engine 插件配置选项
 */
export interface I18nEnginePluginOptions {
  name?: string
  version?: string
  defaultLocale?: string
  fallbackLocale?: string
  autoDetect?: boolean
  storage?: 'localStorage' | 'sessionStorage' | 'none'
  storageKey?: string
  preload?: string[]
  cache?: {
    enabled?: boolean
    maxSize?: number
  }
  // 自定义翻译文件
  translations?: Record<string, any>
}

/**
 * 创建 I18n Engine 插件
 */
export function createI18nEnginePlugin(
  options: I18nEnginePluginOptions = {},
): Plugin {
  console.log('[I18n Plugin] createI18nEnginePlugin called with options:', options)

  const {
    name = 'i18n',
    version = '1.0.0',
    defaultLocale = 'en',
    fallbackLocale = 'en',
    autoDetect = true,
    storage = 'localStorage',
    storageKey = 'i18n-locale',
    preload = ['en', 'zh-CN', 'ja'],
    cache = { enabled: true, maxSize: 1000 },
    translations,
  } = options

  return {
    name,
    version,
    dependencies: [],

    async install(context) {
      try {
        console.log('[I18n Plugin] install method called with context:', context)

        // 从上下文中获取引擎实例
        const engine = context.engine || context
        console.log('[I18n Plugin] engine instance:', !!engine)

        // 定义实际的安装逻辑
        const performInstall = async () => {
          engine.logger.info(`[I18n Plugin] performInstall called`)

          // 获取 Vue 应用实例
          const vueApp = engine.getApp()
          if (!vueApp) {
            throw new Error(
              'Vue app not found. Make sure the engine has created a Vue app before installing i18n plugin.',
            )
          }

          engine.logger.info(`[I18n Plugin] Vue app found, proceeding with installation`)

          // 记录插件安装开始
          engine.logger.info(`Installing ${name} plugin...`, {
            version,
            defaultLocale,
            fallbackLocale,
          })

          // 创建 I18n 实例
          const i18nOptions: I18nOptions = {
            defaultLocale,
            fallbackLocale,
            autoDetect,
            storage,
            storageKey,
            cache: {
              enabled: cache.enabled ?? true,
              maxSize: cache.maxSize ?? 1000,
            },
          }

          const i18n = await createI18nInstance(i18nOptions, translations)

          // 注册到 Engine 状态管理
          if (engine.state) {
            engine.state.set('i18n:instance', i18n)
            engine.state.set('i18n:currentLocale', i18n.getCurrentLanguage())
            engine.state.set('i18n:availableLocales', preload)
          }

          // 创建 I18n 适配器
          const i18nAdapter = {
            install: (engine: any) => {
              // 在Engine的install阶段执行Vue集成
              const vueApp = engine.getApp()
              if (vueApp) {
                console.log('[I18n Plugin] Installing Vue integration via adapter.install')

                // 创建一个简单的响应式状态管理
                let forceUpdateCounter = 0
                const forceUpdateCallbacks: (() => void)[] = []

                // 创建响应式的$t函数
                const createReactiveT = () => {
                  return (key: string, params?: any) => {
                    // 访问forceUpdateCounter来建立响应式依赖
                    void forceUpdateCounter
                    return i18n.t(key, params)
                  }
                }

                // 创建响应式的i18n实例包装器
                const reactiveI18n = {
                  ...i18n,
                  getCurrentLanguage: () => i18n.getCurrentLanguage(),
                  changeLanguage: async (locale: string) => {
                    await i18n.changeLanguage(locale)
                    console.log('[I18n Plugin] Reactive language changed to:', locale)

                    // 触发所有组件重新渲染
                    forceUpdateCounter++
                    forceUpdateCallbacks.forEach(callback => {
                      try {
                        callback()
                      } catch (error) {
                        console.warn('[I18n Plugin] Force update callback error:', error)
                      }
                    })

                    // 通过Engine事件系统通知语言变化
                    engine.events.emit('i18n:language-changed', {
                      locale,
                      timestamp: Date.now()
                    })
                  }
                }

                // 提供i18n实例给Vue组件
                vueApp.provide(I18N_INJECTION_KEY, reactiveI18n)

                // 注册全局属性
                vueApp.config.globalProperties.$t = createReactiveT()
                vueApp.config.globalProperties.$i18n = reactiveI18n

                // 添加全局mixin来处理语言变化
                vueApp.mixin({
                  created() {
                    // 注册强制更新回调
                    const forceUpdate = () => {
                      this.$forceUpdate?.()
                    }
                    forceUpdateCallbacks.push(forceUpdate)

                    // 在组件销毁时清理回调
                    this.$once?.('hook:beforeDestroy', () => {
                      const index = forceUpdateCallbacks.indexOf(forceUpdate)
                      if (index > -1) {
                        forceUpdateCallbacks.splice(index, 1)
                      }
                    })
                  }
                })

                // 验证全局属性是否正确注册
                console.log('[I18n Plugin] Adapter Vue integration completed:', {
                  '$t': typeof vueApp.config.globalProperties.$t,
                  '$i18n': typeof vueApp.config.globalProperties.$i18n,
                  'reactive': true
                })

                engine.logger.info(`${name} plugin Vue integration installed via adapter`)
              }
            },
            t: i18n.t.bind(i18n),
            getCurrentLocale: () => i18n.getCurrentLanguage(),
            setLocale: (locale: string) => i18n.changeLanguage(locale),
            getAvailableLocales: () => preload,
            getInstance: () => i18n,
          }

          engine.i18n = i18nAdapter
          console.log('[I18n Plugin] i18nAdapter set to engine.i18n:', {
            'adapter': !!i18nAdapter,
            'adapter.install': typeof i18nAdapter.install,
            'engine.i18n': !!engine.i18n,
            'engine.i18n.install': typeof engine.i18n?.install
          })

          // 手动调用adapter.install，因为Engine的install方法已经执行过了
          if (typeof i18nAdapter.install === 'function') {
            console.log('[I18n Plugin] Manually calling adapter.install')
            i18nAdapter.install(engine)
          }

          // Vue集成现在通过adapter.install方法在Engine的install阶段执行
          // 这里只需要记录安装完成
          engine.logger.info(`${name} plugin Vue integration will be handled by adapter.install`)
          engine.logger.info(`${name} plugin provided i18n instance with key:`, I18N_INJECTION_KEY.toString())

          // 监听语言变化事件
          i18n.on('languageChanged', (...args: unknown[]) => {
            const locale = args[0] as string
            engine.logger.info(`Language changed to: ${locale}`)

            // 更新状态
            if (engine.state) {
              engine.state.set('i18n:currentLocale', locale)
            }

            // 触发事件
            if (engine.events) {
              engine.events.emit('i18n:languageChanged', { locale })
            }
          })

          engine.logger.info(`${name} plugin installed successfully`, {
            currentLocale: i18n.getCurrentLanguage(),
          })

          // 触发插件安装完成事件
          if (engine.events) {
            engine.events.emit(`plugin:${name}:installed`, {
              i18n,
              currentLocale: i18n.getCurrentLanguage(),
              availableLocales: preload,
            })
          }
        }

        // 检查Vue应用是否已经创建
        const vueApp = engine.getApp()
        engine.logger.info(`[I18n Plugin] Checking Vue app existence: ${!!vueApp}`)

        if (vueApp) {
          // 如果Vue应用已经创建，立即安装
          engine.logger.info(`[I18n Plugin] Vue app exists, installing immediately`)
          await performInstall()
        } else {
          // 如果Vue应用还没创建，监听应用创建事件
          engine.logger.info(`[I18n Plugin] Vue app not found, registering event listener`)
          engine.events.once('app:created', async () => {
            try {
              engine.logger.info(`[I18n Plugin] app:created event received, installing now`)
              await performInstall()
            } catch (error) {
              engine.logger.error(`Failed to install ${name} plugin after app creation:`, error)
            }
          })

          engine.logger.info(`${name} plugin registered, waiting for Vue app creation...`)
        }
      }
      catch (error) {
        // 安全地记录错误
        if (
          context.engine
          && context.engine.logger
          && typeof context.engine.logger.error === 'function'
        ) {
          context.engine.logger.error(
            `Failed to install ${name} plugin:`,
            error,
          )
        }
        else {
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
          engine.state.delete('i18n:instance')
          engine.state.delete('i18n:currentLocale')
          engine.state.delete('i18n:availableLocales')
        }

        // 获取 I18n 实例并清理
        const i18n = engine.state?.get('i18n:instance')
        if (i18n && typeof i18n.removeAllListeners === 'function') {
          i18n.removeAllListeners()
        }

        // 触发插件卸载事件
        if (engine.events) {
          engine.events.emit(`plugin:${name}:uninstalled`)
        }

        engine.logger.info(`${name} plugin uninstalled successfully`)
      }
      catch (error) {
        const engine = context.engine || context
        if (
          engine
          && engine.logger
          && typeof engine.logger.error === 'function'
        ) {
          engine.logger.error(`Failed to uninstall ${name} plugin:`, error)
        }
        else {
          console.error(`Failed to uninstall ${name} plugin:`, error)
        }
        throw error
      }
    },
  }
}

// createI18nInstance 已在上面导出

// 导出错误管理器
export { globalErrorManager }

// 向后兼容的导出
export const i18nEnginePlugin = createI18nEnginePlugin()

/**
 * 默认导出
 */
export default createI18nEnginePlugin
