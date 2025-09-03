import { createAndMountApp } from '@ldesign/engine'
import { routerPlugin } from './router'
import App from './App.vue'
import { templatePlugin } from './templates'
import { colorPlugin } from './color'
import { i18nPlugin } from './i18n'
import { sizePlugin } from './size'
import { httpPlugin } from './http' // 重新启用HTTP插件
import { storePlugin } from './store' // 添加Store插件

/**
 * 应用启动配置
 * 使用优化后的 LDesign Engine API，集成 Router、Template、Color、I18n 和 Store 系统
 */
export async function bootstrap() {

  // 使用优化后的一步到位API创建并挂载应用
  const engine = createAndMountApp(App, '#app', {
    config: {
      debug: false, // 关闭调试模式减少控制台输出
      appName: 'LDesign Demo App',
      version: '1.0.0',
      features: {
        enableHotReload: true,
        enableDevTools: false, // 关闭开发工具
        enablePerformanceMonitoring: false, // 关闭性能监控
        enableErrorReporting: true,
        enableSecurityProtection: false,
        enableCaching: true,
        enableNotifications: true
      }
    },
    plugins: [routerPlugin, templatePlugin, colorPlugin, i18nPlugin, sizePlugin, httpPlugin, storePlugin], // 添加storePlugin
    middleware: []
  })

  return engine
}