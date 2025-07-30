import type { App } from 'vue'
import { I18n } from '@/core/i18n'
import { I18N_INJECTION_KEY } from './composables'
import type { VueI18nOptions, VueI18nPlugin, I18nDirectiveBinding } from './types'
import type { I18nInstance } from '@/core/types'

/**
 * 默认插件选项
 */
const DEFAULT_PLUGIN_OPTIONS: Required<Omit<VueI18nOptions, keyof I18nInstance>> = {
  globalInjection: true,
  globalPropertyName: '$t'
}

/**
 * 创建 Vue I18n 插件
 * @param i18nInstance I18n 实例，如果不提供则创建新实例
 * @returns Vue I18n 插件
 */
export function createI18n(i18nInstance?: I18nInstance): VueI18nPlugin {
  const global = i18nInstance || new I18n()

  const plugin: VueI18nPlugin = {
    global,
    install(app: App, options: VueI18nOptions = {}) {
      const opts = { ...DEFAULT_PLUGIN_OPTIONS, ...options }

      // 提供 I18n 实例给子组件
      app.provide(I18N_INJECTION_KEY, global)

      // 注入全局属性
      if (opts.globalInjection) {
        // 注入翻译函数
        app.config.globalProperties[opts.globalPropertyName] = global.t
        app.config.globalProperties.$i18n = global

        // 为了类型安全，也在 app.config.globalProperties 上设置
        Object.defineProperty(app.config.globalProperties, '$t', {
          get() {
            return global.t
          }
        })
      }

      // 注册 v-t 指令
      app.directive('t', {
        // 元素挂载时
        mounted(el, binding) {
          updateElementText(el, binding, global)
        },
        // 绑定值更新时
        updated(el, binding) {
          updateElementText(el, binding, global)
        }
      })

      // 监听语言变更，更新所有使用 v-t 指令的元素
      global.on('languageChanged', () => {
        // 触发 Vue 的响应式更新
        app._instance?.proxy?.$forceUpdate?.()
      })

      // 如果提供了初始化选项，初始化 I18n
      if (Object.keys(options).length > 0) {
        // 过滤出 I18n 相关的选项
        const i18nOptions = { ...options }
        delete i18nOptions.globalInjection
        delete i18nOptions.globalPropertyName

        if (Object.keys(i18nOptions).length > 0) {
          // 更新 I18n 配置
          Object.assign(global, i18nOptions)
          
          // 如果还没有初始化，则初始化
          global.init().catch(error => {
            console.error('Failed to initialize I18n:', error)
          })
        }
      }
    }
  }

  return plugin
}

/**
 * 更新元素文本内容
 * @param el DOM 元素
 * @param binding 指令绑定
 * @param i18n I18n 实例
 */
function updateElementText(
  el: HTMLElement,
  binding: { value: I18nDirectiveBinding },
  i18n: I18nInstance
) {
  try {
    let key: string
    let params: any = {}
    let options: any = {}

    if (typeof binding.value === 'string') {
      key = binding.value
    } else if (binding.value && typeof binding.value === 'object') {
      key = binding.value.key
      params = binding.value.params || {}
      options = binding.value.options || {}
    } else {
      console.warn('v-t directive expects a string or object value')
      return
    }

    const translatedText = i18n.t(key, params, options)
    
    // 更新元素文本内容
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      ;(el as HTMLInputElement).placeholder = translatedText
    } else {
      el.textContent = translatedText
    }
  } catch (error) {
    console.error('Error in v-t directive:', error)
  }
}

/**
 * 创建带有预配置的 Vue I18n 插件
 * @param options I18n 配置选项
 * @returns Vue I18n 插件
 */
export function createI18nWithOptions(options: VueI18nOptions): VueI18nPlugin {
  const i18n = new I18n(options)
  return createI18n(i18n)
}

/**
 * 默认的 Vue I18n 插件实例
 */
export const vueI18n = createI18n()

/**
 * 安装 Vue I18n 插件的便捷方法
 * @param app Vue 应用实例
 * @param options 插件选项
 */
export function installI18n(app: App, options?: VueI18nOptions) {
  const plugin = options ? createI18nWithOptions(options) : vueI18n
  app.use(plugin, options)
  return plugin
}

/**
 * Vue I18n 插件工厂函数
 * @param defaultOptions 默认选项
 * @returns 插件创建函数
 */
export function createI18nPlugin(defaultOptions: VueI18nOptions = {}) {
  return (options: VueI18nOptions = {}) => {
    const mergedOptions = { ...defaultOptions, ...options }
    return createI18nWithOptions(mergedOptions)
  }
}

/**
 * 获取全局 I18n 实例
 * @returns 全局 I18n 实例
 */
export function getGlobalI18n(): I18nInstance {
  return vueI18n.global
}

// 导出类型
export type { VueI18nOptions, VueI18nPlugin, I18nDirectiveBinding }
