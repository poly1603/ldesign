/**
 * 应用入口
 * 渐进式迁移版本 - 支持新旧两种启动方式
 */

// 全局拦截Vue警告，保持控制台完全干净
if (typeof window !== 'undefined') {
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    // 过滤掉Vue的inject警告
    const message = args[0]
    if (typeof message === 'string' && message.includes('[Vue warn]')) {
      return
    }
    originalWarn.apply(console, args)
  }
}

import { auth } from './composables/useAuth'

// 使用环境变量控制启动方式
const USE_NEW_LAUNCHER = false // 暂时禁用新启动器，等所有文件准备好后再启用

async function startWithNewLauncher() {
  const { launchApp } = await import('./core/app-launcher')
  const { setupPlugins } = await import('./plugins')
  const { setupRouter } = await import('./router/setup')
  const App = (await import('./App.vue')).default

  const { app, engine } = await launchApp({
    rootComponent: App,
    mountElement: '#app',
    plugins: setupPlugins(),
    afterCreate: async (app) => {
      await setupRouter(app)
      if (import.meta.env.DEV) {
        (window as any).__APP__ = app
          (window as any).__ENGINE__ = engine
      }
    },
    onError: (error) => {
      console.error('应用错误:', error)
    }
  })
}

async function startWithOldBootstrap() {
  const { bootstrap } = await import('./bootstrap')
  const { showErrorPage } = await import('./bootstrap/error-handler')

  try {
    await bootstrap()
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    showErrorPage(error as Error)
  }
}

// 主启动函数
async function main() {
  try {
    // 初始化认证
    auth.initAuth()

    // 根据配置选择启动方式
    if (USE_NEW_LAUNCHER) {
      await startWithNewLauncher()
    } else {
      await startWithOldBootstrap()
    }
  } catch (error) {
    console.error('❌ 启动失败:', error)
  }
}

// 启动
main()
