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
  cachePlugin?: any
  colorPlugin: any
  sizePlugin: any
  templatePlugin: any
}

/**
 * 设置 Vue 应用
 */
export function setupVueApp(app: App, options: SetupOptions) {
  const { localeRef, i18nPlugin, cachePlugin, colorPlugin, sizePlugin, templatePlugin } = options

  // 提供全局响应式 locale（使用两个 key 以兼容不同的使用方式）
  app.provide('locale', localeRef)      // 标准 key
  app.provide('app-locale', localeRef)  // 备用 key，用于智能检测

  // 安装插件
  if (cachePlugin) {
    app.use(cachePlugin)
  }
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

  // 开发环境下暴露 app 实例到全局，用于调试
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    (window as any).__APP__ = app
  }
}

// 存储定时器和清理函数的 Map
const engineCleanupFns = new WeakMap<any, (() => void)[]>()

/**
 * 设置引擎就绪后的钩子
 */
export function setupEngineReady(engine: any, localeRef: Ref<string>, i18nPlugin: any, cachePlugin: any, colorPlugin: any, sizePlugin: any) {
  const cleanupFns: (() => void)[] = []

  // 同步到 engine.state (兼容旧代码)
  if (engine?.state) {
    engine.state.set('locale', localeRef.value)

    // 使用 { flush: 'post' } 减少渲染开销
    const stopWatch = watch(localeRef, (newLocale) => {
      engine.state.set('locale', newLocale)
    }, { flush: 'post' })

    cleanupFns.push(stopWatch)
  }

  // 语言切换时同步更新页面标题
  try {
    const api = engine?.api
    const router = engine?.router
    const i18n = api?.i18n
    if (i18n && router && typeof i18n.on === 'function') {
      // 使用防抖来避免频繁更新标题
      let titleUpdateTimer: number | null = null

      const handleLocaleChange = (newLocale: string) => {
        if (titleUpdateTimer !== null) {
          clearTimeout(titleUpdateTimer)
        }

        titleUpdateTimer = window.setTimeout(() => {
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
          titleUpdateTimer = null
        }, 100)
      }

      i18n.on('localeChanged', handleLocaleChange)

      // 添加清理函数
      cleanupFns.push(() => {
        if (titleUpdateTimer !== null) {
          clearTimeout(titleUpdateTimer)
          titleUpdateTimer = null
        }
        // 如果 i18n 有 off 方法，取消监听
        if (typeof i18n.off === 'function') {
          i18n.off('localeChanged', handleLocaleChange)
        }
      })
    }
  } catch (e) {
    console.warn('i18n title sync setup failed:', e)
  }

  // 保存清理函数到引擎上
  if (engine && cleanupFns.length > 0) {
    engineCleanupFns.set(engine, cleanupFns)

    // 如果引擎有 onBeforeUnmount 钩子，注册清理函数
    if (typeof engine.onBeforeUnmount === 'function') {
      engine.onBeforeUnmount(() => {
        cleanupEngineReady(engine)
      })
    }
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

/**
 * 清理引擎相关的资源
 */
export function cleanupEngineReady(engine: any) {
  const cleanupFns = engineCleanupFns.get(engine)
  if (cleanupFns) {
    cleanupFns.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.warn('Error during engine cleanup:', error)
      }
    })
    engineCleanupFns.delete(engine)
  }
}
