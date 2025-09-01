import { createAndMountApp } from '@ldesign/engine'
import { routerPlugin } from './router'
import App from './App.vue'

/**
 * 应用启动配置
 * 使用优化后的 LDesign Engine API 和 Router 集成
 */
export async function bootstrap() {
  // 创建路由器插件

  // 使用优化后的一步到位API创建并挂载应用
  const engine = createAndMountApp(App, '#app', {
    config: {
      debug: true,
      appName: 'LDesign Demo App',
      version: '1.0.0',
      features: {
        enableHotReload: true,
        enableDevTools: true,
        enablePerformanceMonitoring: true
      }
    },
    plugins: [routerPlugin],
    middleware: []
  })

  console.log('🚀 LDesign Demo App 启动完成')
  console.log('📍 使用优化后的 LDesign Engine + Router API')
  console.log('🔗 集成了完整的路由功能')
  console.log('✨ 应用已自动创建、配置并挂载到 #app')
  console.log('')
  console.log('🎯 路由功能特性：')
  console.log('   • Hash模式路由')
  console.log('   • 预加载和缓存')
  console.log('   • 页面切换动画')
  console.log('   • 性能监控')

  return engine
}