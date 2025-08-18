/**
 * LDesign 完整应用演示入口文件
 *
 * 这个应用展示了 LDesign Engine 和 Router 的集成功能：
 * - LDesign Engine 插件化架构
 * - @ldesign/router 路由管理
 * - 状态管理集成
 * - 性能监控
 * - 错误处理
 */

import { createApp, presets } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createRouterEnginePlugin } from '@ldesign/router'
import { createPinia } from 'pinia'
import App from './App.vue'
import { routes } from './router/routes'

// 导入样式
import './assets/styles/main.less'

// 应用配置
const appConfig = {
  name: 'LDesign App Demo',
  version: '1.0.0',
  debug: import.meta.env.DEV,
}

// 创建并启动应用
async function createLDesignApp() {
  try {
    console.log('🚀 启动 LDesign Engine 应用...')

    // 创建 LDesign Engine 应用（这会同时创建 Engine 和 Vue 应用）
    const engine = createApp(App, {
      ...presets.development(),
      config: {
        debug: appConfig.debug,
        appName: appConfig.name,
        version: appConfig.version,
      },
    })

    // 获取 Vue 应用实例
    const vueApp = engine.getApp()
    if (!vueApp) {
      throw new Error('Failed to get Vue app from engine')
    }

    console.log('✅ Vue 应用实例已创建:', vueApp)

    // 集成 Pinia 状态管理
    const pinia = createPinia()
    vueApp.use(pinia)

    // 集成 I18n 插件
    console.log('🌍 开始安装 I18n 插件...')
    await engine.use(createI18nEnginePlugin())
    console.log('✅ I18n 插件安装完成')

    // 集成路由插件
    await engine.use(
      createRouterEnginePlugin({
        routes,
        mode: 'hash', // 使用 hash 模式，避免服务器配置问题
        base: '/',
        version: '1.0.0',
      })
    )

    // 全局错误处理
    vueApp.config.errorHandler = (err: any, vm: any, info: any) => {
      console.error('应用错误:', err)
      console.error('错误信息:', info)
      console.error('组件实例:', vm)
    }

    // 全局警告处理
    vueApp.config.warnHandler = (msg: any, vm: any, trace: any) => {
      console.warn('应用警告:', msg)
      console.warn('组件实例:', vm)
      console.warn('组件追踪:', trace)
    }

    // 性能监控
    if (import.meta.env.DEV) {
      vueApp.config.performance = true
    }

    // 挂载应用
    await engine.mount('#app')

    // 开发环境下的调试信息
    if (import.meta.env.DEV) {
      console.log('🎉 LDesign 应用已启动完成')
      console.log('📦 当前环境:', import.meta.env.MODE)
      console.log('� 引擎实例:', engine)
      console.log('📊 性能监控已启用')

      // 导出实例供调试使用
      ;(window as any).__LDESIGN_ENGINE__ = engine
      ;(window as any).__VUE_APP__ = vueApp

      // 测试 i18n 功能
      setTimeout(() => {
        console.log('🧪 测试 i18n 功能...')
        try {
          if (vueApp.config.globalProperties.$t) {
            console.log('✅ 全局 $t 函数可用')
            const testTranslation =
              vueApp.config.globalProperties.$t('common.hello')
            console.log('✅ 测试翻译结果:', testTranslation)
          } else {
            console.log('❌ 全局 $t 函数不可用')
          }
        } catch (error) {
          console.error('❌ i18n 测试失败:', error)
        }
      }, 1000)
    }

    return { engine, app: vueApp }
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    throw error
  }
}

// 启动应用
createLDesignApp().catch(error => {
  console.error('应用启动失败:', error)
})
