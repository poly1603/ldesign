import { createAndMountApp } from '../../packages/engine/src'
import { routerPlugin } from './router'
import App from './App.vue'
import { templatePlugin } from './templates'
import { colorPlugin } from './color'
import { i18nPlugin } from './i18n'
import { sizePlugin } from './size'
import { httpPlugin } from './http' // 重新启用HTTP插件
import { storePlugin } from './store' // 添加Store插件
import { cryptoPlugin } from './crypto' // 添加Crypto插件
import { cachePlugin } from './cache' // 添加Cache插件
import { apiPlugin, systemPlugin, customApiPlugin } from './api' // 添加API插件
import { devicePlugin } from './device' // 添加Device插件

// 导入模态框修复样式
import './styles/modal-fix.css'

/**
 * 应用启动配置
 * 使用优化后的 LDesign Engine API，集成 Router、Template、Color、I18n、Store、Crypto、Cache、API 和 Device 系统
 */
export async function bootstrap() {

  // 使用优化后的一步到位API创建并挂载应用
  const engine = createAndMountApp(App, '#app', {
    config: {
      debug: false, // 关闭调试模式减少控制台输出
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
    plugins: [routerPlugin, templatePlugin, colorPlugin, i18nPlugin, sizePlugin, httpPlugin, storePlugin, cryptoPlugin, cachePlugin, apiPlugin, systemPlugin, customApiPlugin, devicePlugin], // 添加所有插件
    middleware: []
  })

  return engine
}