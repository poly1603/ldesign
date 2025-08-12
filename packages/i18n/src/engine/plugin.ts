// 临时使用 any 类型，避免循环依赖
type Plugin = {
  name: string
  version: string
  dependencies?: string[]
  install(engine: any): Promise<void>
  uninstall?(engine: any): Promise<void>
  [key: string]: any
}
import type { I18nOptions } from '../core/types'
import { installI18nPlugin } from '../vue/plugin'

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
}

/**
 * 创建 i18n Engine 插件
 *
 * 将 i18n Vue 插件包装为标准的 Engine 插件，提供统一的插件管理体验
 *
 * @param options i18n 配置选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createI18nEnginePlugin } from '@ldesign/i18n'
 *
 * const i18nPlugin = createI18nEnginePlugin({
 *   defaultLanguage: 'zh-CN',
 *   fallbackLanguage: 'en',
 *   globalInjection: true
 * })
 *
 * await engine.use(i18nPlugin)
 * ```
 */
export function createI18nEnginePlugin(
  options: I18nEnginePluginOptions = {}
): Plugin {
  const {
    name = 'i18n',
    version = '1.0.0',
    globalInjection = true,
    globalPropertyName = '$t',
    ...i18nOptions
  } = options

  return {
    name,
    version,
    dependencies: [], // i18n 插件通常不依赖其他插件

    async install(engine) {
      try {
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
          options: i18nOptions,
        })

        // 安装 i18n Vue 插件
        const i18nInstance = await installI18nPlugin(vueApp, {
          ...i18nOptions,
          globalInjection,
          globalPropertyName,
        } as any)

        // 将 i18n 实例注册到引擎中，便于其他插件访问
        if (engine.i18n) {
          // 如果引擎支持 i18n 适配器，设置适配器
          engine.i18n.setInstance(i18nInstance)
        } else {
          // 否则直接挂载到引擎上
          ;(engine as any).i18nInstance = i18nInstance
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

        // 触发插件安装完成事件
        engine.events.emit('plugin:i18n:installed', {
          instance: i18nInstance,
          options: i18nOptions,
        })
      } catch (error) {
        // 记录安装失败
        engine.logger.error(`Failed to install ${name} plugin`, error)

        // 触发插件安装失败事件
        engine.events.emit('plugin:i18n:installFailed', {
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
 * 默认 i18n Engine 插件实例
 *
 * 使用默认配置创建的 i18n 插件，可以直接使用
 *
 * @example
 * ```typescript
 * import { defaultI18nEnginePlugin } from '@ldesign/i18n'
 *
 * await engine.use(defaultI18nEnginePlugin)
 * ```
 */
export const defaultI18nEnginePlugin = createI18nEnginePlugin({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en',
  globalInjection: true,
  globalPropertyName: '$t',
} as any)
