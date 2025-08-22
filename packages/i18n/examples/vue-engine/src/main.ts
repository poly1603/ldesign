/**
 * Vue Engine 示例主文件
 */

import { createEngine } from '@ldesign/engine'
import { i18nEnginePlugin } from '@ldesign/i18n'
import { I18N_INJECTION_KEY } from '@ldesign/i18n/vue'
import { createApp } from 'vue'
import App from './App.vue'

async function initApp() {
  try {
    console.log('🚀 Initializing Vue Engine example...')

    // 创建 Vue 应用
    const app = createApp(App)

    // 创建 Engine 实例
    const engine = createEngine({
      config: {
        app: {
          name: 'Vue Engine I18n Example',
          version: '1.0.0',
        },
        environment: 'development',
        debug: true,
      },
      enableAutoSave: true,
      autoSaveInterval: 10000,
    })

      // 设置Vue应用到Engine（用于插件集成）
      ; (engine as any).vue = { app }

    // 安装 i18n Engine 插件
    await engine.use(i18nEnginePlugin)

    // 将 engine 安装到 Vue 应用（这会自动提供engine实例给组件）
    engine.install(app)

    // 手动提供I18n实例给LanguageSwitcher组件使用
    const i18nInstance = (app.config.globalProperties as any).$i18n
    if (i18nInstance) {
      app.provide(I18N_INJECTION_KEY, i18nInstance)
      console.log('✅ I18n instance provided for LanguageSwitcher component')
    }

    // 挂载应用
    app.mount('#app')

    console.log('✅ Vue Engine example initialized successfully')

    // 导出到全局作用域，方便调试
    ; (window as any).engine = engine
    ; (window as any).app = app
  }
  catch (error) {
    console.error('❌ Failed to initialize Vue Engine example:', error)
  }
}

// 启动应用
initApp()
