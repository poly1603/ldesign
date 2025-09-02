import { createAndMountApp } from '@ldesign/engine'
import { createTemplateEnginePlugin } from '@ldesign/template'
import { routerPlugin } from './router'
import App from './App.vue'
import { templatePlugin } from './templates'

/**
 * 应用启动配置
 * 使用优化后的 LDesign Engine API，集成 Router 和 Template 系统
 */
export async function bootstrap() {
  // 创建模板引擎插件


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
    plugins: [routerPlugin, templatePlugin],
    middleware: []
  })

  console.log('🚀 LDesign Demo App 启动完成')
  console.log('📍 使用优化后的 LDesign Engine + Router + Template API')
  console.log('🔗 集成了完整的路由和模板渲染功能')
  console.log('✨ 应用已自动创建、配置并挂载到 #app')
  console.log('')
  console.log('🎯 集成功能特性：')
  console.log('   • Hash模式路由系统')
  console.log('   • 智能模板渲染引擎')
  console.log('   • 设备自适应模板')
  console.log('   • 模板预加载和缓存')
  console.log('   • 热更新和性能监控')

  return engine
}