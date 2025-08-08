import { createApp, presets } from '@ldesign/engine'
import { createRouterAdapter } from './router'
import App from './App'

// 创建 Vue 应用
async function bootstrap() {
  try {
    console.log('🚀 开始启动 LDesign Engine 应用...')

    // 创建路由适配器
    console.log('📍 创建路由适配器...')
    const routerAdapter = createRouterAdapter()

    // 使用 Engine 的 createApp 快速创建应用
    console.log('⚙️ 创建 Engine 应用...')
    const engine = createApp(App, {
      ...presets.development(),
      config: {
        debug: true,
        appName: 'LDesign Engine + Router Demo',
        version: '0.1.0',
      },
      router: routerAdapter,
    })

    console.log('✅ Engine 应用创建成功:', engine)

    // 挂载应用
    console.log('🎯 挂载应用到 DOM...')
    engine.mount('#app')

    console.log('🎉 LDesign Engine Demo 启动成功!')

    // 显示启动成功通知
    engine.notifications.show({
      type: 'success',
      title: '应用启动成功',
      message: 'LDesign Engine 与 Router 集成完成！',
      duration: 4000,
    })

    // 记录启动信息
    engine.logger.info('🚀 LDesign Engine + Router Demo 启动成功!')
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
  }
}

// 启动应用
bootstrap()
