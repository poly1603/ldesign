import { createEngineApp } from '../../packages/engine/src'
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
 * 使用统一的 createEngineApp API
 */
export async function bootstrap() {
  // 使用新的统一API创建并挂载应用
  const engine = await createEngineApp({
    // 根组件和挂载点
    rootComponent: App,
    mountElement: '#app',
    
    // 基础配置
    config: {
      name: 'LDesign Demo',
      version: '1.0.0',
      debug: false, // 关闭调试模式减少控制台输出
      environment: 'development'
    },
    
    // 功能特性开关
    features: {
      enableHotReload: true,
      enableDevTools: false, // 关闭开发工具
      enablePerformanceMonitoring: false, // 关闭性能监控
      enableErrorReporting: true,
      enableSecurityProtection: false,
      enableCaching: true,
      enableNotifications: true
    },
    
    // 日志配置（使用优化的默认配置）
    logger: {
      enabled: true,
      level: 'warn', // 生产环境只显示警告和错误
      maxLogs: 50,
      showTimestamp: false,
      showContext: false
    },
    
    // 缓存配置（使用优化的默认配置）
    cache: {
      enabled: true,
      maxSize: 50,
      defaultTTL: 300000, // 5分钟
      cleanupInterval: 60000, // 1分钟
      enableMemoryLimit: true,
      memoryLimit: 5 // 5MB内存限制
    },
    
    // 性能监控配置（当前禁用）
    performance: {
      enabled: false,
      sampleRate: 0.1,
      monitorMemory: false,
      monitorNetwork: false,
      monitorComponents: false
    },
    
    // 插件列表
    plugins: [
      routerPlugin,
      templatePlugin,
      colorPlugin,
      i18nPlugin,
      sizePlugin,
      httpPlugin,
      storePlugin,
      cryptoPlugin,
      cachePlugin,
      apiPlugin,
      systemPlugin,
      customApiPlugin,
      devicePlugin
    ],
    
    // 中间件列表（当前为空）
    middleware: [],
    
    // 错误处理
    onError: (error, context) => {
      if (import.meta.env.DEV) {
        console.error(`[Bootstrap] Error in ${context}:`, error)
      }
    },
    
    // 引擎就绪回调
    onReady: (engine) => {
      if (import.meta.env.DEV) {
        console.log('🚀 Engine initialized successfully')
      }
    },
    
    // 应用挂载完成回调
    onMounted: (engine) => {
      if (import.meta.env.DEV) {
        console.log('✅ App mounted successfully')
      }
    }
  })

  return engine
}
