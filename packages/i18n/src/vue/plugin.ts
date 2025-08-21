import type { App } from 'vue'

import type { I18nInstance, I18nOptions } from '../core/types'
import type {
  I18nDirectiveBinding,
  VueI18nOptions,
  VueI18nPlugin,
} from './types'

import { I18n } from '../core/i18n'
import { I18N_INJECTION_KEY } from './composables'
import { createModifiableVTDirective, vTHtml, vTAttr, vTPlural } from './directives'
import { createVueI18nPluginManager } from '../plugins/vue/plugin-manager'

/**
 * 默认插件选项
 */
const DEFAULT_PLUGIN_OPTIONS = {
  globalInjection: true,
  globalPropertyName: '$t',
  defaultLocale: 'en',
  fallbackLocale: 'en',
  storage: 'localStorage' as const,
  storageKey: 'i18n-locale',
  autoDetect: true,
  preload: [],
  cache: {
    enabled: true,
    maxSize: 1000,
  },
}

/**
 * 创建 Vue I18n 插件
 * @param i18nInstance I18n 实例，如果不提供则创建新实例
 * @returns Vue I18n 插件
 */
export function createI18n(i18nInstance?: I18nInstance): VueI18nPlugin {
  const global = i18nInstance || new I18n()
  const pluginManager = createVueI18nPluginManager()

  const plugin: VueI18nPlugin = {
    global,
    plugins: pluginManager,
    async install(app: App, options: Partial<VueI18nOptions> = {}) {
      const opts = { ...DEFAULT_PLUGIN_OPTIONS, ...options }

      // 确保 I18n 实例已初始化
      if (!global.isReady()) {
        await global.init()
      }

      // 设置插件管理器上下文
      pluginManager.setContext(app, global, opts)

      // 提供 I18n 实例给子组件
      app.provide(I18N_INJECTION_KEY, global)

      // 注入全局属性
      if (opts.globalInjection) {
        // 确保 t 方法存在
        if (typeof global.t === 'function') {
          // 注入翻译函数，确保正确绑定 this 上下文
          ; (app.config.globalProperties as any)[opts.globalPropertyName]
            = global.t.bind(global)
            ; (app.config.globalProperties as any).$i18n = global

          // 为了类型安全，也在 app.config.globalProperties 上设置
          Object.defineProperty(app.config.globalProperties, '$t', {
            get() {
              return global.t.bind(global)
            },
          })
        }
        else {
          console.error('I18n instance does not have a t method')
        }
      }

      // 注册增强的 v-t 指令系统
      // 主要的 v-t 指令（支持修饰符）
      const tDirective = createModifiableVTDirective(global)
      app.directive('t', tDirective)

      // 专用指令
      app.directive('t-html', vTHtml)
      app.directive('t-attr', vTAttr)
      app.directive('t-plural', vTPlural)

      // 监听语言变更，更新所有使用 v-t 指令的元素
      global.on('languageChanged', () => {
        // 触发 Vue 的响应式更新
        ; (app as any)._instance?.proxy?.$forceUpdate?.()
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
          global.init().catch((error) => {
            console.error('Failed to initialize I18n:', error)
          })
        }
      }
    },
  }

  return plugin
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
export function createI18nPlugin(defaultOptions: Partial<VueI18nOptions> = {}) {
  return (options: Partial<VueI18nOptions> = {}) => {
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

/**
 * 安装带有内置语言包的 I18n 插件
 * @param app Vue 应用实例
 * @param options I18n 配置选项
 * @returns Promise<I18nInstance> I18n 实例
 */
export async function installI18nPlugin(
  app: App,
  options?: I18nOptions & {
    globalInjection?: boolean
    globalPropertyName?: string
    createI18n?: (options?: I18nOptions) => Promise<I18nInstance>
  },
): Promise<I18nInstance> {
  // 提取 Vue 插件选项
  const {
    globalInjection = true,
    globalPropertyName = '$t',
    createI18n: customCreateI18n,
    ...i18nOptions
  } = options || {}

  console.warn('🔧 installI18nPlugin 选项:', {
    globalInjection,
    globalPropertyName,
    hasCustomCreateI18n: !!customCreateI18n,
    i18nOptions,
  })

  // 创建 I18n 实例 - 使用自定义创建函数或默认函数
  let i18nInstance: I18nInstance
  if (customCreateI18n) {
    console.warn('✨ 使用自定义 i18n 创建函数')
    i18nInstance = await customCreateI18n(i18nOptions)
  }
  else {
    console.warn('📦 使用默认 i18n 实例')
    // 创建默认的 i18n 实例
    i18nInstance = new I18n(i18nOptions)
    await i18nInstance.init()
  }

  // 创建 Vue 插件
  const plugin = createI18n(i18nInstance)

  // 安装插件，使用传入的选项
  app.use(plugin, {
    globalInjection,
    globalPropertyName,
  })

  console.warn('✅ i18n Vue 插件安装成功')
  return i18nInstance
}

// 导出类型
export type { I18nDirectiveBinding, VueI18nOptions, VueI18nPlugin }
