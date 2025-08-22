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
// 导入内置语言包
import enLanguagePackage from '../../locales/en'
import jaLanguagePackage from '../../locales/ja'
import zhCNLanguagePackage from '../../locales/zh-CN'

/**
 * 创建 I18n 实例（内部使用）
 * @param options I18n 配置选项
 * @returns I18n 实例
 */
async function createI18nInstance(
  options?: I18nOptions,
): Promise<I18nInstance> {
  const i18n = new I18n(options)

  // 创建静态加载器
  const loader = new StaticLoader()

  // 注册内置语言包
  loader.registerPackage('en', enLanguagePackage)
  loader.registerPackage('zh-CN', zhCNLanguagePackage)
  loader.registerPackage('ja', jaLanguagePackage)

  // 设置加载器
  i18n.setLoader(loader)

  // 初始化
  await i18n.init()

  return i18n
}

/**
 * Engine 插件接口
 */
export interface EngineI18nPlugin {
  name: string
  version: string
  description: string

  // 插件生命周期
  install: (context: EnginePluginContext) => Promise<void> | void
  uninstall?: (context: EnginePluginContext) => Promise<void> | void

  // 配置
  config?: Record<string, any>

  // 依赖
  dependencies?: string[]
}

/**
 * Engine 插件上下文
 */
export interface EnginePluginContext {
  engine: any // Engine 实例
  config: Record<string, any>
  logger: any // Logger 实例
}

/**
 * I18n Engine 插件实现
 */
export const i18nEnginePlugin: EngineI18nPlugin = {
  name: 'i18n',
  version: '1.0.0',
  description: 'Internationalization plugin for LDesign Engine',

  config: {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    autoDetect: true,
    storage: 'localStorage',
    storageKey: 'i18n-locale',
    preload: ['en', 'zh-CN', 'ja'],
    cache: {
      enabled: true,
      maxSize: 1000,
    },
  },

  async install(context: EnginePluginContext) {
    const { engine, config, logger } = context

    try {
      logger?.info('[I18n Plugin] Installing i18n plugin...')

      // 创建 I18n 实例
      const i18nOptions: I18nOptions = {
        defaultLocale: config.defaultLocale || 'en',
        fallbackLocale: config.fallbackLocale || 'en',
        autoDetect: config.autoDetect !== false,
        storage: config.storage || 'localStorage',
        storageKey: config.storageKey || 'i18n-locale',
        cache: config.cache || { enabled: true, maxSize: 1000 },
      }

      const i18n = await createI18nInstance(i18nOptions)

      // 注册到 Engine
      engine.state.set('i18n', i18n)

      // 如果有 Vue 应用，安装 Vue 插件
      if (engine.vue && engine.vue.app) {
        const vuePlugin = await import('../../vue/plugin')
        await vuePlugin.installI18nPlugin(engine.vue.app, {
          globalInjection: true,
          globalPropertyName: '$t',
          createI18n: async () => i18n,
        })
        logger?.info('[I18n Plugin] Vue integration installed')
      }

      // 监听语言变化事件
      i18n.on('languageChanged', (...args: unknown[]) => {
        const locale = args[0] as string
        logger?.info(`[I18n Plugin] Language changed to: ${locale}`)
        engine.events?.emit('i18n:languageChanged', { locale })
      })

      logger?.info('[I18n Plugin] I18n plugin installed successfully')
    }
    catch (error) {
      logger?.error('[I18n Plugin] Failed to install i18n plugin:', error)
      throw error
    }
  },

  async uninstall(context: EnginePluginContext) {
    const { engine, logger } = context

    try {
      logger?.info('[I18n Plugin] Uninstalling i18n plugin...')

      // 获取 I18n 实例
      const i18n = engine.state.get('i18n')

      if (i18n) {
        // 清理事件监听器
        i18n.removeAllListeners()

        // 从 Engine 中移除
        engine.state.delete('i18n')
      }

      logger?.info('[I18n Plugin] I18n plugin uninstalled successfully')
    }
    catch (error) {
      logger?.error('[I18n Plugin] Failed to uninstall i18n plugin:', error)
      throw error
    }
  },
}

/**
 * 创建 I18n Engine 插件
 * @param config 插件配置
 * @returns Engine 插件
 */
export function createI18nEnginePlugin(config?: Record<string, any>): EngineI18nPlugin {
  return {
    ...i18nEnginePlugin,
    config: {
      ...i18nEnginePlugin.config,
      ...config,
    },
  }
}

// 导出便捷函数
export {
  createI18nInstance,
}

// 导出错误管理器
export { globalErrorManager }

/**
 * 默认导出
 */
export default i18nEnginePlugin
