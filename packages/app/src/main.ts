import { createApp, presets } from '@ldesign/engine'
import { routerPlugin } from '@ldesign/router'
import App from './App.tsx'
import { routes } from './router/routes.ts'

// 创建 Vue 应用
async function bootstrap() {
  try {
    // eslint-disable-next-line no-console
    console.log('🚀 开始启动 LDesign Engine 应用...')

    // 检查依赖是否正确加载
    // eslint-disable-next-line no-console
    console.log('📦 检查依赖:', {
      createApp: typeof createApp,
      presets: typeof presets,
      routerPlugin: typeof routerPlugin,
      App: typeof App,
      routes: Array.isArray(routes) ? `${routes.length} routes` : typeof routes,
    })

    // 使用 Engine 的 createApp 快速创建应用
    // eslint-disable-next-line no-console
    console.log('⚙️ 创建 Engine 应用...')
    const engine = createApp(App, {
      ...presets.development(),
      config: {
        debug: true,
        appName: 'LDesign Engine + Router Demo',
        version: '0.1.0',
      },
    })

    // eslint-disable-next-line no-console
    console.log('✅ Engine 创建成功:', engine)
    // eslint-disable-next-line no-console
    console.log('Engine 属性:', Object.keys(engine))
    // eslint-disable-next-line no-console
    console.log('Engine.getApp():', engine.getApp())
    // eslint-disable-next-line no-console
    console.log('Engine.getApp() 类型:', typeof engine.getApp())

    if (!engine || typeof engine.use !== 'function') {
      throw new Error('Engine 对象无效或缺少 use 方法')
    }

    // 保存engine引用到局部变量
    const engineRef = engine
    // eslint-disable-next-line no-console
    console.log('📍 准备安装路由插件...')

    // 安装路由插件
    // eslint-disable-next-line no-console
    console.log('📍 安装路由插件...')
    // eslint-disable-next-line no-console
    console.log('路由配置:', routes)

    await engineRef.use(
      routerPlugin({
        routes,
        mode: 'hash',
        base: '/',

        // 启用增强组件
        enhancedComponents: {
          enabled: true,
          options: {
            replaceRouterLink: true,
            replaceRouterView: true,
            keepOriginal: false,
            enhancementConfig: {
              // 自定义权限检查器
              permissionChecker: permission => {
                // 模拟权限检查
                const userPermissions = [
                  'products.view',
                  'admin',
                  'settings',
                  'authenticated',
                ]

                if (Array.isArray(permission)) {
                  return permission.some(p => userPermissions.includes(p))
                }

                return userPermissions.includes(permission)
              },

              // 自定义事件追踪器
              eventTracker: (event, data) => {
                // eslint-disable-next-line no-console
                console.log('📊 事件追踪:', event, data)
              },

              // 自定义确认对话框
              confirmDialog: async (message, title = '确认') => {
                return window.confirm(
                  title ? `${title}\n\n${message}` : message
                )
              },
            },
          },
        },
      })
    )

    // eslint-disable-next-line no-console
    console.log('✅ 路由插件安装成功')

    // 挂载应用
    // eslint-disable-next-line no-console
    console.log('🎯 挂载应用到 DOM...')

    // 确保DOM元素存在
    const appElement = document.querySelector('#app')
    if (!appElement) {
      throw new Error('找不到 #app 元素')
    }

    // 获取Vue应用实例并注入Engine
    const vueApp = engine.getApp()
    if (vueApp) {
      vueApp.config.globalProperties.$engine = engine
      // eslint-disable-next-line no-console
      console.log('✅ Engine 实例已注入到 Vue 应用')
    }

    const mountedApp = await engine.mount('#app')

    // eslint-disable-next-line no-console
    console.log('✅ 应用挂载成功:', mountedApp)
    // eslint-disable-next-line no-console
    console.log('🎉 LDesign Engine Demo 启动成功!')

    // 显示启动成功通知
    try {
      engine.notifications?.show({
        type: 'success',
        title: '应用启动成功',
        message: 'LDesign Engine 与 Router 集成完成！',
        duration: 4000,
      })
    } catch (notificationError) {
      // eslint-disable-next-line no-console
      console.warn('通知显示失败:', notificationError)
    }

    // 记录启动信息
    try {
      engine.logger?.info('🚀 LDesign Engine + Router Demo 启动成功!')
    } catch (logError) {
      // eslint-disable-next-line no-console
      console.warn('日志记录失败:', logError)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 应用启动失败:', error)
    // eslint-disable-next-line no-console
    console.error(
      '错误堆栈:',
      error instanceof Error ? error.stack : 'No stack trace'
    )

    // 在页面上显示错误信息
    const appElement = document.querySelector('#app')
    if (appElement) {
      appElement.innerHTML = `
        <div style="padding: 2rem; color: red; font-family: monospace;">
          <h2>❌ 应用启动失败</h2>
          <p><strong>错误信息:</strong> ${
            error instanceof Error ? error.message : String(error)
          }</p>
          <details>
            <summary>详细信息</summary>
            <pre>${
              error instanceof Error ? error.stack : 'No stack trace'
            }</pre>
          </details>
        </div>
      `
    }
  }
}

// 全局错误处理
window.addEventListener('error', event => {
  // eslint-disable-next-line no-console
  console.error('全局错误:', event.error)
})

window.addEventListener('unhandledrejection', event => {
  // eslint-disable-next-line no-console
  console.error('未处理的Promise拒绝:', event.reason)
})

// 启动应用
// eslint-disable-next-line no-console
console.log('🔄 开始执行bootstrap函数...')

bootstrap()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('✅ bootstrap函数执行完成')
  })
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error('❌ bootstrap函数执行失败:', error)
  })
