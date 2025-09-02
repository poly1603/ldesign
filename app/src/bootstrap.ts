import { createAndMountApp } from '@ldesign/engine'
import { routerPlugin } from './router'
import App from './App.vue'
import { templatePlugin } from './templates'
import { colorPlugin } from './color'

/**
 * 应用启动配置
 * 使用优化后的 LDesign Engine API，集成 Router、Template、Color 和 I18n 系统
 */
export async function bootstrap() {

  // 使用优化后的一步到位API创建并挂载应用
  const engine = createAndMountApp(App, '#app', {
    config: {
      debug: true,
      appName: 'LDesign Demo App',
      version: '1.0.0',
      features: {
        enableHotReload: true,
        enableDevTools: true,
        enablePerformanceMonitoring: true,
        enableErrorReporting: true,
        enableSecurityProtection: false,
        enableCaching: true,
        enableNotifications: true
      }
    },
    plugins: [routerPlugin, templatePlugin, colorPlugin],
    middleware: []
  })

  return engine
}