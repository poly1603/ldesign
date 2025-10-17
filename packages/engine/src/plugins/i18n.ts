import type { App, Ref } from 'vue'
import type { Plugin } from '../types/plugin'
import type { I18nAdapter } from '../types/base'
import type { Engine } from '../types/engine'
import { ref, watch } from 'vue'

export interface I18nEnginePluginOptions {
  adapter?: I18nAdapter
  defaultLocale?: string
  onLocaleChange?: (newLocale: string, oldLocale: string) => void | Promise<void>
}

/**
 * @deprecated Use `createI18nEnginePlugin` from '@ldesign/i18n' instead for full i18n functionality
 * 
 * This is a simplified i18n adapter integration for engine.
 * For complete internationalization support, use @ldesign/i18n package:
 * 
 * @example
 * ```typescript
 * import { createI18nEnginePlugin } from '@ldesign/i18n'
 * 
 * const i18nPlugin = createI18nEnginePlugin({
 *   locale: 'zh-CN',
 *   messages: { ... }
 * })
 * ```
 * 
 * @see https://github.com/ldesign/ldesign/tree/main/packages/i18n
 */
export function createI18nEnginePlugin(options: I18nEnginePluginOptions = {}): Plugin {
  return {
    name: 'i18n-engine-plugin',
    version: '1.0.0',

    async install(engine: Engine, app: App) {
      // 如果提供了适配器，设置它
      if (options.adapter) {
        engine.setI18n(options.adapter)
        engine.logger.info('I18n adapter installed')
      }

      // 设置全局响应式语言状态
      const defaultLocale = options.defaultLocale || 'en'
      engine.state.set('i18n.locale', defaultLocale)
      engine.state.set('i18n.fallbackLocale', defaultLocale)
      
      // 创建响应式语言引用
      const currentLocale = ref(defaultLocale)
      
      // 监听 engine state 的语言变化
      const unwatch = engine.state.watch('i18n.locale', async (newLocale: string, oldLocale: string) => {
        if (newLocale && newLocale !== oldLocale) {
          currentLocale.value = newLocale
          
          // 调用语言变更钩子
          if (options.onLocaleChange) {
            try {
              await options.onLocaleChange(newLocale, oldLocale)
            } catch (error) {
              engine.logger.error('Error in locale change hook', { error })
            }
          }
          
          // 触发语言变更事件
          engine.events.emit('i18n:locale-changed', { 
            newLocale, 
            oldLocale,
            timestamp: Date.now() 
          })
        }
      })
      
      // 提供全局方法来改变语言
      const setLocale = (locale: string) => {
        engine.state.set('i18n.locale', locale)
        if (engine.i18n?.setLocale) {
          engine.i18n.setLocale(locale)
        }
      }
      
      // 提供全局方法来获取当前语言
      const getLocale = (): string => {
        return engine.state.get('i18n.locale') || defaultLocale
      }
      
      // 将方法注入到 Vue 应用中
      app.provide('engine-i18n', engine.i18n)
      app.provide('engine-locale', currentLocale)
      app.provide('setEngineLocale', setLocale)
      app.provide('getEngineLocale', getLocale)
      
      // 全局属性
      app.config.globalProperties.$engineLocale = currentLocale
      app.config.globalProperties.$setEngineLocale = setLocale
      app.config.globalProperties.$getEngineLocale = getLocale

      engine.logger.debug('I18n engine plugin installed with reactive locale support')
      
      // 清理函数
      app.onUnmounted = () => {
        unwatch()
      }
    },
  }
}