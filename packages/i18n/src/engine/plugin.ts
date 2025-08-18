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

import type { I18nInstance, I18nOptions } from '../core/types'
import { globalErrorManager } from '../core/errors'
import { I18n } from '../core/i18n'
import { StaticLoader } from '../core/loader'
// 导入内置语言包
import enLanguagePackage from '../locales/en'

import jaLanguagePackage from '../locales/ja'
import zhCNLanguagePackage from '../locales/zh-CN'
import { installI18nPlugin } from '../vue/plugin'

/**
 * 创建带有内置语言包的 I18n 实例
 * @param options I18n 配置选项
 * @returns I18n 实例
 */
async function createI18nWithBuiltinLocales(
  options?: I18nOptions
): Promise<I18nInstance> {
  const loader = new StaticLoader()
  loader.registerPackages({
    en: enLanguagePackage,
    'zh-CN': zhCNLanguagePackage,
    ja: jaLanguagePackage,
  })

  const i18n = new I18n(options)
  i18n.setLoader(loader)

  await i18n.init()
  return i18n
}

// 临时插件接口定义，避免循环依赖
interface Plugin {
  name: string
  version: string
  description?: string
  author?: string
  dependencies?: string[]
  install: (context: any) => Promise<void>
  uninstall?: (context: any) => Promise<void>
  beforeInstall?: (context: any) => Promise<void>
  afterInstall?: (context: any) => Promise<void>
  beforeUninstall?: (context: any) => Promise<void>
  afterUninstall?: (context: any) => Promise<void>
  [key: string]: any
}

/**
 * i18n Engine 插件选项
 */
export interface I18nEnginePluginOptions extends I18nOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 是否启用全局注入 */
  globalInjection?: boolean
  /** 全局属性名称 */
  globalPropertyName?: string
  /** 自定义 i18n 创建函数 */
  createI18n?: (options?: I18nOptions) => Promise<I18nInstance>
  /** 是否使用内置语言包 */
  useBuiltinLocales?: boolean
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
  /** 是否启用错误报告 */
  enableErrorReporting?: boolean
  /** 是否启用热重载 */
  enableHotReload?: boolean
  /** 预加载语言列表 */
  preloadLanguages?: string[]
  /** 是否自动初始化 */
  autoInit?: boolean
}

/**
 * 创建 i18n Engine 插件（内部实现）
 *
 * 将 i18n Vue 插件包装为标准的 Engine 插件，提供统一的插件管理体验
 *
 * @param options i18n 配置选项
 * @returns Engine 插件实例
 * @internal
 */
function createI18nEnginePluginInternal(
  options: I18nEnginePluginOptions = {}
): Plugin {
  const {
    name = 'i18n',
    version = '1.0.0',
    globalInjection = true,
    globalPropertyName = '$t',
    createI18n: customCreateI18n,
    useBuiltinLocales = true,
    ...i18nOptions
  } = options

  return {
    name,
    version,
    dependencies: [], // i18n 插件通常不依赖其他插件

    async install(context) {
      try {
        // 从 context 中获取 engine
        const { engine } = context

        // 调试信息
        console.log('🔍 I18n 插件安装开始')
        console.log('🔍 Context 对象:', context)
        console.log('🔍 Engine 对象:', engine)
        console.log('🔍 Engine 类型:', typeof engine)
        console.log('🔍 getApp 方法存在:', typeof engine.getApp === 'function')

        // 获取 Vue 应用实例
        let vueApp

        // 尝试不同的方式获取 Vue 应用
        if (typeof engine.getApp === 'function') {
          console.log('🔍 使用 engine.getApp() 获取 Vue 应用')
          vueApp = engine.getApp()
          console.log('🔍 getApp() 返回值:', vueApp)
        } else if (engine._app) {
          console.log('🔍 使用 engine._app 获取 Vue 应用')
          vueApp = engine._app
        } else if (engine.app) {
          console.log('🔍 使用 engine.app 获取 Vue 应用')
          vueApp = engine.app
        }

        if (!vueApp) {
          throw new Error(
            'Vue app not found. Make sure the engine has created a Vue app before installing i18n plugin.'
          )
        }

        // 记录插件安装开始
        engine.logger.info(`Installing ${name} plugin...`, {
          version,
          options: i18nOptions,
        })

        // 确定使用的 i18n 创建函数
        const i18nCreateFunction =
          customCreateI18n ||
          (useBuiltinLocales ? createI18nWithBuiltinLocales : undefined)

        // 安装 i18n Vue 插件
        const i18nInstance = await installI18nPlugin(vueApp, {
          ...i18nOptions,
          globalInjection,
          globalPropertyName,
          createI18n: i18nCreateFunction,
        } as any)

        // 将 i18n 实例注册到引擎中，便于其他插件访问
        if (engine.i18n) {
          // 如果引擎支持 i18n 适配器，设置适配器
          engine.i18n.setInstance(i18nInstance)
        } else {
          // 否则直接挂载到引擎上
          ;(engine as any).i18nInstance = i18nInstance
        }

        // 注册到引擎配置
        if (engine.config) {
          engine.config.set('i18n.instance', i18nInstance)
          engine.config.set('i18n.options', options)
        }

        // 监听语言变更事件，与引擎事件系统集成
        i18nInstance.on('languageChanged', ((...args: any[]) => {
          const [newLanguage, oldLanguage] = args
          engine.events.emit('i18n:languageChanged', {
            newLanguage,
            oldLanguage,
            timestamp: Date.now(),
          })
        }) as any)

        // 注册全局状态
        engine.state.set(
          'i18n:currentLanguage',
          i18nInstance.getCurrentLanguage()
        )
        engine.state.set(
          'i18n:availableLanguages',
          i18nInstance.getAvailableLanguages()
        )

        // 监听语言变更，更新全局状态
        i18nInstance.on('languageChanged', ((...args: any[]) => {
          const [newLanguage] = args
          engine.state.set('i18n:currentLanguage', newLanguage)
        }) as any)

        // 记录插件安装成功
        engine.logger.info(`${name} plugin installed successfully`, {
          currentLanguage: i18nInstance.getCurrentLanguage(),
          availableLanguages: i18nInstance.getAvailableLanguages(),
        })

        // 启用性能监控
        if (
          options.enablePerformanceMonitoring &&
          i18nInstance.getPerformanceMetrics
        ) {
          setInterval(() => {
            const metrics = i18nInstance.getPerformanceMetrics!()
            engine.events.emit('i18n:performanceReport', {
              metrics,
              timestamp: Date.now(),
            })

            // 性能警告
            if (metrics.averageTranslationTime > 10) {
              engine.logger.warn(
                'I18n performance warning: slow translation detected',
                metrics
              )
            }
          }, 30000) // 每30秒报告一次
        }

        // 启用错误报告
        if (options.enableErrorReporting) {
          setInterval(() => {
            const errorStats = globalErrorManager.getErrorStats()
            if (Object.keys(errorStats).length > 0) {
              engine.events.emit('i18n:errorReport', {
                errorStats,
                timestamp: Date.now(),
              })
            }
          }, 60000) // 每分钟报告一次
        }

        // 预加载语言
        if (options.preloadLanguages && options.preloadLanguages.length > 0) {
          // 使用单个预加载方法
          for (const locale of options.preloadLanguages) {
            try {
              await i18nInstance.preloadLanguage(locale)
            } catch (error) {
              engine.logger.warn(`Failed to preload language: ${locale}`, error)
            }
          }
          engine.logger.info(
            `Preloaded languages: ${options.preloadLanguages.join(', ')}`
          )
        }

        // 触发插件安装完成事件
        engine.events.emit('plugin:i18n:installed', {
          instance: i18nInstance,
          options: i18nOptions,
        })
      } catch (error) {
        // 记录安装失败
        context.logger.error(`Failed to install ${name} plugin`, error)

        // 触发插件安装失败事件
        context.events.emit('plugin:i18n:installFailed', {
          error,
          options: i18nOptions,
        })

        throw error
      }
    },

    async uninstall(engine) {
      try {
        engine.logger.info(`Uninstalling ${name} plugin...`)

        // 清理全局状态
        engine.state.delete('i18n:currentLanguage')
        engine.state.delete('i18n:availableLanguages')

        // 清理引擎上的 i18n 实例
        if (engine.i18n) {
          engine.i18n.setInstance(null)
        } else {
          delete (engine as any).i18nInstance
        }

        // 触发插件卸载完成事件
        engine.events.emit('plugin:i18n:uninstalled', {
          timestamp: Date.now(),
        })

        engine.logger.info(`${name} plugin uninstalled successfully`)
      } catch (error) {
        engine.logger.error(`Failed to uninstall ${name} plugin`, error)
        throw error
      }
    },
  }
}

/**
 * 创建增强的 I18n Engine 插件
 *
 * 提供更多高级功能的插件创建函数
 */
export function createEnhancedI18nPlugin(
  options: I18nEnginePluginOptions = {}
): Plugin {
  return createI18nEnginePluginInternal({
    enablePerformanceMonitoring: true,
    enableErrorReporting: true,
    enableHotReload: process.env.NODE_ENV === 'development',
    autoInit: true,
    ...options,
  })
}

/**
 * 创建默认 i18n Engine 插件
 *
 * 使用默认配置创建的 i18n 插件，内置中文、英文、日文语言包，可以直接使用
 *
 * @deprecated 请使用 createI18nEnginePlugin() 代替
 * @example
 * ```typescript
 * import { createI18nEnginePlugin } from '@ldesign/i18n'
 *
 * // 使用默认配置
 * await engine.use(createI18nEnginePlugin())
 *
 * // 或者自定义配置
 * await engine.use(createI18nEnginePlugin({
 *   defaultLanguage: 'en',
 *   fallbackLanguage: 'zh-CN'
 * }))
 * ```
 */
export function createDefaultI18nEnginePlugin() {
  return createI18nEnginePluginInternal({
    defaultLanguage: 'zh-CN',
    fallbackLanguage: 'en',
    globalInjection: true,
    globalPropertyName: '$t',
    enablePerformanceMonitoring: true,
    enableErrorReporting: true,
    useBuiltinLocales: true,
  } as any)
}

/**
 * 创建 i18n Engine 插件（带默认配置）
 *
 * 使用默认配置创建的 i18n 插件，内置中文、英文、日文语言包，可以直接使用
 * 这是 createDefaultI18nEnginePlugin 的新名称
 *
 * @example
 * ```typescript
 * import { createI18nEnginePlugin } from '@ldesign/i18n'
 *
 * // 使用默认配置
 * await engine.use(createI18nEnginePlugin())
 *
 * // 或者自定义配置
 * await engine.use(createI18nEnginePlugin({
 *   defaultLanguage: 'en',
 *   fallbackLanguage: 'zh-CN'
 * }))
 * ```
 */
export function createI18nEnginePlugin(options: I18nEnginePluginOptions = {}) {
  // 如果没有提供任何选项，使用默认配置
  const defaultOptions = {
    defaultLanguage: 'zh-CN',
    fallbackLanguage: 'en',
    globalInjection: true,
    globalPropertyName: '$t',
    enablePerformanceMonitoring: true,
    enableErrorReporting: true,
    useBuiltinLocales: true,
  }

  const finalOptions =
    Object.keys(options).length === 0 ? defaultOptions : options

  return createI18nEnginePluginInternal(finalOptions)
}

/**
 * 增强的 i18n Engine 插件实例
 *
 * 包含所有高级功能和内置语言包的 i18n 插件
 */
export const enhancedI18nEnginePlugin = createEnhancedI18nPlugin({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en',
  globalInjection: true,
  globalPropertyName: '$t',
  useBuiltinLocales: true,
} as any)
