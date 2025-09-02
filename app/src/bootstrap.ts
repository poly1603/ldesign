import { createAndMountApp } from '@ldesign/engine'
import { createTemplateEnginePlugin } from '@ldesign/template'
import { routerPlugin } from './router'
import App from './App.vue'
import { templatePlugin } from './templates'
import { createI18nPlugin, languageManager } from './i18n'

/**
 * 应用启动配置
 * 使用优化后的 LDesign Engine API，集成 Router、Template 和 I18n 系统
 */
export async function bootstrap() {
  // 初始化语言管理器
  languageManager.init()

  // 创建国际化插件
  const i18nPlugin = createI18nPlugin()

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
    plugins: [routerPlugin, templatePlugin, i18nPlugin],
    middleware: []
  })

  console.log('🚀 LDesign Demo App 启动完成')
  console.log('📍 使用优化后的 LDesign Engine + Router + Template + I18n API')
  console.log('🔗 集成了完整的路由、模板渲染和国际化功能')
  console.log('✨ 应用已自动创建、配置并挂载到 #app')
  console.log('')
  console.log('🎯 集成功能特性：')
  console.log('   • Hash模式路由系统')
  console.log('   • 智能模板渲染引擎')
  console.log('   • 多语言国际化支持')
  console.log('   • 设备自适应模板')
  console.log('   • 模板预加载和缓存')
  console.log('   • 语言自动检测和切换')
  console.log('   • 热更新和性能监控')
  console.log('')
  console.log('🌐 国际化功能：')
  console.log(`   • 当前语言: ${languageManager.getLocale()}`)
  console.log(`   • 支持语言: ${languageManager.getSupportedLocales().map(l => l.name).join(', ')}`)
  console.log('   • 语言持久化存储')
  console.log('   • 浏览器语言自动检测')

  return engine
}