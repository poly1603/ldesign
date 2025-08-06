import { createEngine } from '@ldesign/engine'
import type { CreateEngineOptions } from '@ldesign/engine'
import type { Component } from 'vue'
import App from './App.vue'
import { setupRouter } from './router'
import { setupStore } from './stores'
import { setupI18n } from './i18n'
import { setupTemplate } from './templates'
import { createPinia } from 'pinia'

/**
 * 创建LDesign应用的工厂函数
 */
export async function createLDesignApp(
  rootComponent: Component = App,
  options: CreateEngineOptions = {}
) {
  // 创建引擎实例
  const engine = createEngine({
    config: {
      debug: import.meta.env.DEV,
      appName: 'LDesign App',
      version: '1.0.0',
      ...options.config
    },
    ...options
  })

  // 创建Vue应用
  const app = engine.createApp(rootComponent)

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

  return {
    engine,
    app,
    router,
    pinia,
    mount: (selector: string | Element) => app.mount(selector)
  }
}
