import { createEngine } from '@ldesign/engine'
import { createPinia } from 'pinia'
import App from './App.vue'
import { setupRouter } from './router'
import { setupStore } from './stores'
import { setupI18n } from './i18n'
import { setupTemplate } from './templates'
import './styles/index.less'

async function bootstrap() {
  try {
    // 创建引擎实例
    const engine = createEngine({
      config: {
        debug: import.meta.env.DEV,
        appName: 'LDesign App',
        version: '1.0.0'
      }
    })

    // 创建Vue应用
    const app = engine.createApp(App)

    // 创建Pinia实例
    const pinia = createPinia()
    app.use(pinia)

    // 设置路由
    const router = await setupRouter(engine, app)

    // 设置状态管理
    await setupStore(engine, app, pinia)

    // 设置国际化
    await setupI18n(engine, app)

    // 设置模板系统
    await setupTemplate(engine, app)

    // 挂载应用
    app.mount('#app')

    // 开发环境下暴露到全局
    if (import.meta.env.DEV) {
      window.__LDESIGN_ENGINE__ = engine
      window.__LDESIGN_ROUTER__ = router
      console.log('🚀 LDesign App started successfully!')
      console.log('Engine:', engine)
      console.log('Router:', router)
    }
  } catch (error) {
    console.error('❌ Failed to start LDesign App:', error)
  }
}

// 启动应用
bootstrap()
