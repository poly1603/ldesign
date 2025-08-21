/**
 * Vue I18n 调试插件
 *
 * 提供调试功能的示例插件，展示统一插件架构的使用
 */

import type { VueI18nPluginContext, VueI18nPluginInterface } from '../../vue/types'

/**
 * 调试插件配置
 */
export interface DebugPluginConfig {
  /** 是否启用控制台日志 */
  enableConsoleLog?: boolean
  /** 是否启用性能监控 */
  enablePerformanceMonitor?: boolean
  /** 是否启用翻译键验证 */
  enableKeyValidation?: boolean
  /** 是否显示调试面板 */
  showDebugPanel?: boolean
  /** 日志级别 */
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

/**
 * 创建调试插件
 */
export function createDebugPlugin(config: DebugPluginConfig = {}): VueI18nPluginInterface {
  const defaultConfig: Required<DebugPluginConfig> = {
    enableConsoleLog: true,
    enablePerformanceMonitor: true,
    enableKeyValidation: true,
    showDebugPanel: false,
    logLevel: 'debug',
  }

  const finalConfig = { ...defaultConfig, ...config }
  let isInstalled = false
  let context: VueI18nPluginContext | null = null

  return {
    name: 'vue-i18n-debug',
    version: '1.0.0',
    description: 'Vue I18n debugging plugin',
    author: 'LDesign Team',
    config: finalConfig,

    async beforeInstall(ctx: VueI18nPluginContext) {
      if (finalConfig.enableConsoleLog) {
        console.log('[Vue I18n Debug] Installing debug plugin...')
      }
    },

    async install(ctx: VueI18nPluginContext) {
      context = ctx
      isInstalled = true

      // 添加调试方法到全局属性
      if (finalConfig.enableConsoleLog) {
        ctx.app.config.globalProperties.$i18nDebug = {
          logTranslation: (key: string, result: string, params?: any) => {
            if (finalConfig.logLevel === 'debug') {
              console.debug(`[I18n] ${key} -> ${result}`, params)
            }
          },
          validateKey: (key: string) => {
            if (finalConfig.enableKeyValidation) {
              const exists = ctx.i18n.exists(key)
              if (!exists) {
                console.warn(`[I18n] Translation key not found: ${key}`)
              }
              return exists
            }
            return true
          },
          getStats: () => {
            return {
              currentLocale: ctx.i18n.getCurrentLanguage(),
              availableLanguages: ctx.i18n.getAvailableLanguages(),
              loadedKeys: ctx.i18n.getKeys(),
            }
          },
        }
      }

      // 性能监控
      if (finalConfig.enablePerformanceMonitor) {
        const originalT = ctx.i18n.t.bind(ctx.i18n)
          ; (ctx.i18n as any).t = function (key: string, params?: any, options?: any) {
          const start = performance.now()
          const result = originalT(key, params, options)
          const end = performance.now()

          if (end - start > 10) { // 超过10ms的翻译记录警告
            console.warn(`[I18n Performance] Slow translation: ${key} took ${(end - start).toFixed(2)}ms`)
          }

          return result
        }
      }

      // 监听语言变化
      ctx.i18n.on('languageChanged', (...args: unknown[]) => {
        const newLocale = args[0] as string
        if (finalConfig.enableConsoleLog) {
          console.log(`[I18n Debug] Language changed to: ${newLocale}`)
        }
      })

      // 创建调试面板
      if (finalConfig.showDebugPanel) {
        createDebugPanel(ctx)
      }
    },

    async afterInstall(ctx: VueI18nPluginContext) {
      if (finalConfig.enableConsoleLog) {
        console.log('[Vue I18n Debug] Debug plugin installed successfully')
      }
    },

    async beforeUninstall(ctx: VueI18nPluginContext) {
      if (finalConfig.enableConsoleLog) {
        console.log('[Vue I18n Debug] Uninstalling debug plugin...')
      }
    },

    async uninstall(ctx: VueI18nPluginContext) {
      // 清理全局属性
      if (ctx.app.config.globalProperties.$i18nDebug) {
        delete ctx.app.config.globalProperties.$i18nDebug
      }

      // 移除调试面板
      removeDebugPanel()

      isInstalled = false
      context = null
    },

    async afterUninstall(ctx: VueI18nPluginContext) {
      if (finalConfig.enableConsoleLog) {
        console.log('[Vue I18n Debug] Debug plugin uninstalled successfully')
      }
    },
  }
}

/**
 * 创建调试面板
 */
function createDebugPanel(ctx: VueI18nPluginContext) {
  // 创建调试面板DOM
  const panel = document.createElement('div')
  panel.id = 'vue-i18n-debug-panel'
  panel.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 300px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 9999;
    font-family: monospace;
    font-size: 12px;
    max-height: 400px;
    overflow-y: auto;
  `

  const header = document.createElement('div')
  header.style.cssText = `
    background: #f5f5f5;
    padding: 8px;
    border-bottom: 1px solid #ccc;
    font-weight: bold;
  `
  header.textContent = 'Vue I18n Debug Panel'

  const content = document.createElement('div')
  content.style.cssText = 'padding: 8px;'

  panel.appendChild(header)
  panel.appendChild(content)
  document.body.appendChild(panel)

  // 更新面板内容
  function updatePanel() {
    const stats = {
      currentLocale: ctx.i18n.getCurrentLanguage(),
      availableLanguages: ctx.i18n.getAvailableLanguages().map(lang => lang.code),
      loadedKeys: ctx.i18n.getKeys().length,
    }

    content.innerHTML = `
      <div><strong>Current Locale:</strong> ${stats.currentLocale}</div>
      <div><strong>Available Languages:</strong> ${stats.availableLanguages.join(', ')}</div>
      <div><strong>Loaded Keys:</strong> ${stats.loadedKeys}</div>
      <div style="margin-top: 8px;">
        <button onclick="console.log(window.vueI18nDebugStats)" style="font-size: 10px;">
          Log Stats
        </button>
      </div>
    `
  }

  // 暴露统计信息到全局
  ; (window as any).vueI18nDebugStats = () => ({
    currentLocale: ctx.i18n.getCurrentLanguage(),
    availableLanguages: ctx.i18n.getAvailableLanguages(),
    loadedKeys: ctx.i18n.getKeys(),
  })

  // 初始更新
  updatePanel()

  // 监听语言变化更新面板
  ctx.i18n.on('languageChanged', updatePanel)

  // 添加关闭按钮
  const closeBtn = document.createElement('button')
  closeBtn.textContent = '×'
  closeBtn.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    border: none;
    background: none;
    font-size: 16px;
    cursor: pointer;
  `
  closeBtn.onclick = () => {
    panel.remove()
  }
  header.appendChild(closeBtn)
}

/**
 * 移除调试面板
 */
function removeDebugPanel() {
  const panel = document.getElementById('vue-i18n-debug-panel')
  if (panel) {
    panel.remove()
  }

  // 清理全局变量
  if ((window as any).vueI18nDebugStats) {
    delete (window as any).vueI18nDebugStats
  }
}

/**
 * 默认调试插件实例
 */
export const debugPlugin = createDebugPlugin()

/**
 * 开发环境调试插件（仅在开发环境启用）
 */
export const devDebugPlugin = createDebugPlugin({
  enableConsoleLog: process.env.NODE_ENV === 'development',
  enablePerformanceMonitor: process.env.NODE_ENV === 'development',
  enableKeyValidation: process.env.NODE_ENV === 'development',
  showDebugPanel: false,
  logLevel: 'debug',
})

/**
 * 生产环境调试插件（仅启用错误日志）
 */
export const prodDebugPlugin = createDebugPlugin({
  enableConsoleLog: false,
  enablePerformanceMonitor: false,
  enableKeyValidation: true,
  showDebugPanel: false,
  logLevel: 'error',
})
