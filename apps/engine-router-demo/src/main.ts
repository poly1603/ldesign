/**
 * Engine Router Demo 应用入口
 *
 * 演示如何使用Engine与Router插件集成
 */

import { createEngine } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import App from './App.vue'
import { routes } from './router'
// 导入翻译文件
import zhCN from './locales/zh-CN'
import en from './locales/en'
import ja from './locales/ja'

async function main() {
  // 创建Engine实例
  const engine = createEngine({
    config: {
      debug: true,
    } as any,
  })

  // 创建Router插件
  const routerPlugin = createRouterEnginePlugin({
    routes,
    mode: 'history',
    base: '/',
    preset: 'spa', // 使用SPA预设配置
  })

  // 创建I18n插件
  const i18nPlugin = createI18nEnginePlugin({
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en',
    autoDetect: true,
    preload: ['zh-CN', 'en', 'ja'],
    // 自定义翻译文件
    translations: {
      'zh-CN': zhCN,
      'en': en,
      'ja': ja,
    },
  })

  // 安装插件到Engine（支持延迟安装）
  await engine.use(routerPlugin)
  await engine.use(i18nPlugin)

  // 创建Vue应用（会触发插件的实际安装）
  const app = engine.createApp(App)

  // 等待一个微任务，确保所有插件的Vue集成都完成
  await new Promise(resolve => setTimeout(resolve, 10))

  // 挂载应用
  app.mount('#app')

  console.log('应用启动成功 - 使用@ldesign/router和@ldesign/i18n Engine插件集成')
}

// 启动应用
main().catch(console.error)
