/**
 * Engine Router Demo 应用入口
 *
 * 演示如何使用Engine与Router插件集成
 */

import { createEngine } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createColorEnginePlugin } from '@ldesign/color'
import { createSizeEnginePlugin } from '@ldesign/size'
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

  // 创建Color插件
  const colorPlugin = createColorEnginePlugin({
    defaultTheme: 'default',
    fallbackTheme: 'default',
    autoDetect: true,
    storage: 'localStorage',
    storageKey: 'theme-preference',
    // 自定义主题配置（可选）
    customThemes: [
      {
        name: 'custom-blue',
        displayName: '自定义蓝色',
        description: '演示自定义主题配置',
        light: {
          primary: '#1890ff',
          success: '#52c41a',
          warning: '#faad14',
          danger: '#ff4d4f',
        },
        dark: {
          primary: '#177ddc',
          success: '#49aa19',
          warning: '#d48806',
          danger: '#d9363e',
        },
      },
    ],
  })

  // 创建Size插件
  const sizePlugin = createSizeEnginePlugin({
    defaultMode: 'medium',
    autoInject: true,
    enableStorage: true,
    storageType: 'localStorage',
    enableTransition: true,
    transitionDuration: '0.3s',
    onSizeChanged: (mode) => {
      console.log('尺寸模式已切换到:', mode)
    },
  })

  // 安装插件到Engine（支持延迟安装）
  await engine.use(routerPlugin)
  await engine.use(i18nPlugin)
  await engine.use(colorPlugin)
  await engine.use(sizePlugin)

  // 创建Vue应用（会触发插件的实际安装）
  const app = engine.createApp(App)

  // 等待一个微任务，确保所有插件的Vue集成都完成
  await new Promise(resolve => setTimeout(resolve, 10))

  // 挂载应用
  app.mount('#app')

  console.log('应用启动成功 - 使用@ldesign/router、@ldesign/i18n和@ldesign/color Engine插件集成')
}

// 启动应用
main().catch(console.error)
