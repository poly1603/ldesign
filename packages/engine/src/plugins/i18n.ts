import type { App } from 'vue'
import type { I18nAdapter } from '../types/base'
import type { Engine } from '../types/engine'
import type { Plugin, PluginContext } from '../types/plugin'
import { ref } from 'vue'

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

    async install(context: PluginContext<Engine>) {
      const { engine } = context
      const app = (engine as any).app as App
      
      // 如果提供了适配器，设置它
      if (options.adapter && (engine as any).setI18n) {
        (engine as any).setI18n(options.adapter);
        (engine as any).logger?.info('I18n adapter installed')
      }

      // 设置全局响应式语言状态
      const defaultLocale = options.defaultLocale || 'en'
      if ((engine as any).state) {
        (engine as any).state.set('i18n.locale', defaultLocale);
        (engine as any).state.set('i18n.fallbackLocale', defaultLocale)
      }
      
      // 创建响应式语言引用
      const currentLocale = ref(defaultLocale)
      
      // 监听 engine state 的语言变化
      let unwatch = () => {}
      if ((engine as any).state?.watch) {
        unwatch = (engine as any).state.watch('i18n.locale', async (newLocale: string, oldLocale: string) => {
          if (newLocale && newLocale !== oldLocale) {
            currentLocale.value = newLocale
            
            // 调用语言变更钩子
            if (options.onLocaleChange) {
              try {
                await options.onLocaleChange(newLocale, oldLocale)
              } catch (error) {
                (engine as any).logger?.error('Error in locale change hook', { error })
              }
            }
            
            // 触发语言变更事件
            if ((engine as any).events?.emit) {
              (engine as any).events.emit('i18n:locale-changed', { 
                newLocale, 
                oldLocale,
                timestamp: Date.now() 
              })
            }
          }
        })
      }
      
      // 提供全局方法来改变语言
      const setLocale = (locale: string) => {
        if ((engine as any).state) {
          (engine as any).state.set('i18n.locale', locale)
        }
        if ((engine as any).i18n?.setLocale) {
          (engine as any).i18n.setLocale(locale)
        }
      }
      
      // 提供全局方法来获取当前语言
      const getLocale = (): string => {
        const localeValue = (engine as any).state?.get('i18n.locale')
        return typeof localeValue === 'string' ? localeValue : defaultLocale
      }
      
      // 将方法注入到 Vue 应用中
      app.provide('engine-i18n', (engine as any).i18n)
      app.provide('engine-locale', currentLocale)
      app.provide('setEngineLocale', setLocale)
      app.provide('getEngineLocale', getLocale)
      
      // 全局属性
      app.config.globalProperties.$engineLocale = currentLocale
      app.config.globalProperties.$setEngineLocale = setLocale
      app.config.globalProperties.$getEngineLocale = getLocale

      ;(engine as any).logger?.debug('I18n engine plugin installed with reactive locale support')
      
      // 清理函数 - use onUnmount instead
      if (app.unmount) {
        const originalUnmount = app.unmount
        app.unmount = function() {
          unwatch()
          originalUnmount.call(this)
        }
      }
    },
  }
}