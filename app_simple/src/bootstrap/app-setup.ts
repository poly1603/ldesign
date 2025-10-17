/**
 * 应用设置模块
 * 负责配置 Vue 应用实例
 */

import { watch } from 'vue'
import type { App } from 'vue'
import type { Ref } from 'vue'

interface SetupOptions {
  localeRef: Ref<string>
  i18nPlugin: any
  colorPlugin: any
  sizePlugin: any
  templatePlugin: any
}

/**
 * 设置 Vue 应用
 */
export function setupVueApp(app: App, options: SetupOptions) {
  const { localeRef, i18nPlugin, colorPlugin, sizePlugin, templatePlugin } = options

  // 提供全局响应式 locale（使用两个 key 以兼容不同的使用方式）
  app.provide('locale', localeRef)      // 标准 key
  app.provide('app-locale', localeRef)  // 备用 key，用于智能检测

  // 安装插件
  app.use(templatePlugin)
  app.use(colorPlugin)
  app.use(sizePlugin)

  // 手动安装 i18n Vue 插件
  if (i18nPlugin.setupVueApp) {
    i18nPlugin.setupVueApp(app)
  }

  // 设置全局语言切换方法
  app.config.globalProperties.$getLocale = () => localeRef.value
  app.config.globalProperties.$setLocale = (locale: string) => {
    if (i18nPlugin.api?.changeLocale) {
      i18nPlugin.api.changeLocale(locale)
    }
  }
}

/**
 * 设置引擎就绪后的钩子
 */
export function setupEngineReady(engine: any, localeRef: Ref<string>, i18nPlugin: any, colorPlugin: any, sizePlugin: any) {

  // 同步到 engine.state (兼容旧代码)
  if (engine?.state) {
    engine.state.set('locale', localeRef.value)

    watch(localeRef, (newLocale) => {
      engine.state.set('locale', newLocale)
    })
  }

  // 语言切换时同步更新页面标题
  try {
    const api = engine?.api
    const router = engine?.router
    const i18n = api?.i18n
    if (i18n && router && typeof i18n.on === 'function') {
      i18n.on('localeChanged', (newLocale: string) => {
        try {
          const current = typeof router.getCurrentRoute === 'function' ? router.getCurrentRoute().value : null
          const titleKey = current?.meta?.titleKey
          const t = typeof api?.t === 'function' ? api.t.bind(api) : ((k: string) => k)
          if (titleKey) {
            document.title = `${t(titleKey)} - ${t('app.name')}`
          } else {
            document.title = t('app.name')
          }
        } catch (e) {
          console.warn('Failed to update title on locale change:', e)
        }
      })
    }
  } catch (e) {
    console.warn('i18n title sync setup failed:', e)
  }

  // 开发环境暴露调试工具（简化版）
  if (import.meta.env.DEV) {
    try {
      if (typeof window !== 'undefined') {
        (window as any).__ENGINE__ = engine
          (window as any).__LOCALE__ = localeRef
      }
    } catch (error) {
      // 静默忽略
    }
  }
}
