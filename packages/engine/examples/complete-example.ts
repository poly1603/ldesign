/**
 * @ldesign/engine 完整使用示例
 * 展示引擎的所有核心功能
 */

import type { Plugin } from '@ldesign/engine'
import { createEngineApp } from '@ldesign/engine'
import { defineComponent, h } from 'vue'

// ==================== 1. 定义插件 ====================
const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  install(engine) {
    // 在引擎中注册功能
    engine.logger.info('MyPlugin installed')
    
    // 添加全局方法
    engine.config.set('myPlugin.enabled', true)
    
    // 监听事件
    engine.events.on('app:mounted', () => {
      console.log('App mounted, plugin is active')
    })
  },
  
  uninstall(engine) {
    engine.config.delete('myPlugin.enabled')
    engine.logger.info('MyPlugin uninstalled')
  }
}

// ==================== 2. 定义中间件 ====================
const authMiddleware = {
  name: 'auth',
  async execute(ctx: any, next: any) {
    // 检查认证状态
    const token = ctx.request.headers?.authorization
    
    if (!token) {
      ctx.response.status = 401
      ctx.response.body = { error: 'Unauthorized' }
      return
    }
    
    // 继续执行
    await next()
  }
}

const loggingMiddleware = {
  name: 'logging',
  async execute(ctx: any, next: any) {
    const start = Date.now()
    
    await next()
    
    const duration = Date.now() - start
    console.log(`[${ctx.request.method}] ${ctx.request.url} - ${duration}ms`)
  }
}

// ==================== 3. 创建根组件 ====================
const App = defineComponent({
  name: 'App',
  setup() {
    // 使用组合式 API
    const { 
      useEngine, 
      useNotification, 
      useLogger,
      useCache,
      usePerformance,
      useConfig,
      useErrorHandler
    } = await import('@ldesign/engine')
    
    const engine = useEngine()
    const notification = useNotification()
    const logger = useLogger('App')
    const cache = useCache('user-data')
    const performance = usePerformance()
    const config = useConfig('app.theme', 'light')
    const errorHandler = useErrorHandler()
    
    // 使用功能
    const showNotification = () => {
      notification.success('操作成功！')
    }
    
    const logMessage = () => {
      logger.info('用户点击了按钮')
    }
    
    const saveToCache = () => {
      cache.set({ name: 'John', age: 30 }, 60000) // 缓存1分钟
    }
    
    const measurePerformance = async () => {
      await performance.measure('button-click', async () => {
        // 模拟耗时操作
        await new Promise(resolve => setTimeout(resolve, 100))
      })
    }
    
    const handleError = async () => {
      const [result, error] = await errorHandler.capture(
        () => {
          throw new Error('Something went wrong!')
        },
        'button-click'
      )
      
      if (error) {
        notification.error(error.message)
      }
    }
    
    return () => h('div', [
      h('h1', 'LDesign Engine Example'),
      h('button', { onClick: showNotification }, '显示通知'),
      h('button', { onClick: logMessage }, '记录日志'),
      h('button', { onClick: saveToCache }, '保存到缓存'),
      h('button', { onClick: measurePerformance }, '性能测试'),
      h('button', { onClick: handleError }, '错误处理'),
      h('div', `当前主题: ${config.value}`),
      h('div', `性能监控: ${performance.isMonitoring ? '开启' : '关闭'}`),
    ])
  }
})

// ==================== 4. 创建并配置引擎应用 ====================
async function main() {
  const engine = await createEngineApp({
    // 根组件和挂载点
    rootComponent: App,
    mountElement: '#app',
    
    // 基础配置
    config: {
      name: 'My Awesome App',
      version: '2.0.0',
      debug: true,
      description: '使用 LDesign Engine 构建的应用',
      environment: 'development',
      
      // 自定义配置
      api: {
        baseUrl: 'https://api.example.com',
        timeout: 5000,
      },
      
      theme: 'light',
      language: 'zh-CN',
    },
    
    // 功能开关
    features: {
      enableHotReload: true,
      enableDevTools: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      enableSecurityProtection: true,
      enableCaching: true,
      enableNotifications: true,
    },
    
    // 日志配置
    logger: {
      enabled: true,
      level: 'debug',
      maxLogs: 500,
      showTimestamp: true,
      showContext: true,
      prefix: '[MyApp]',
    },
    
    // 缓存配置
    cache: {
      enabled: true,
      maxSize: 200,
      defaultTTL: 600000, // 10分钟
      cleanupInterval: 60000, // 1分钟清理一次
      enableMemoryLimit: true,
      memoryLimit: 50, // 50MB
    },
    
    // 性能监控配置
    performance: {
      enabled: true,
      sampleRate: 0.8,
      monitorMemory: true,
      monitorNetwork: true,
      monitorComponents: true,
      reportInterval: 10000, // 10秒报告一次
      
      // 性能预算
      budget: {
        bundleSize: { limit: 500, unit: 'KB' },
        loadTime: { limit: 3000, unit: 'ms' },
        firstContentfulPaint: { limit: 1500, unit: 'ms' },
        timeToInteractive: { limit: 4000, unit: 'ms' },
        memoryUsage: { limit: 100, unit: 'MB' },
        domNodes: { limit: 1500, unit: 'nodes' },
      },
      
      // 预算超出时的处理
      onBudgetExceeded(metric) {
        console.warn(`性能预算超标: ${metric.name}`)
        
        // 可以发送到监控服务
        if (metric.name === 'memoryUsage') {
          // 触发内存清理
          engine.cache.clear()
        }
      },
    },
    
    // 快捷键配置
    shortcuts: {
      keys: {
        'ctrl+s': () => {
          console.log('保存快捷键触发')
          engine.events.emit('app:save')
        },
        'ctrl+z': () => {
          console.log('撤销快捷键触发')
          engine.events.emit('app:undo')
        },
        'ctrl+shift+d': [
          () => {
            engine.config.set('debug', !engine.config.get('debug'))
            console.log('切换调试模式')
          },
          { preventDefault: true }
        ],
      },
      
      scopes: {
        editor: {
          'ctrl+b': () => console.log('编辑器加粗'),
          'ctrl+i': () => console.log('编辑器斜体'),
        },
        dialog: {
          'escape': () => console.log('关闭对话框'),
          'enter': () => console.log('确认对话框'),
        },
      },
      
      conflictMode: 'warn',
      enabled: true,
    },
    
    // 插件
    plugins: [
      myPlugin,
      // 可以添加更多插件
    ],
    
    // 中间件
    middleware: [
      loggingMiddleware,
      authMiddleware,
      // 可以添加更多中间件
    ],
    
    // Vue应用配置
    setupApp(app) {
      // 配置Vue应用
      app.config.performance = true
      app.config.errorHandler = (err, instance, info) => {
        console.error('Vue Error:', err, info)
      }
      
      // 注册全局组件
      // app.component('MyComponent', MyComponent)
      
      // 注册全局指令
      // app.directive('focus', focusDirective)
    },
    
    // 生命周期回调
    async onReady(engine) {
      console.log('引擎已就绪')
      
      // 初始化应用状态
      engine.state.set('user', null)
      engine.state.set('theme', 'light')
      
      // 注册事件监听
      engine.events.on('user:login', (user) => {
        engine.state.set('user', user)
        engine.logger.info('用户登录:', user.name)
      })
      
      engine.events.on('theme:change', (theme) => {
        engine.state.set('theme', theme)
        document.documentElement.setAttribute('data-theme', theme)
      })
      
      // 加载初始数据
      try {
        // const data = await fetchInitialData()
        // engine.cache.set('initial-data', data)
      } catch (error) {
        engine.errors.handle(error as Error, 'initial-data-loading')
      }
    },
    
    async onMounted(engine) {
      console.log('应用已挂载')
      
      // 启动性能监控
      engine.performance.startMonitoring()
      
      // 显示欢迎通知
      engine.notifications.show({
        type: 'success',
        title: '欢迎',
        message: '应用已成功启动！',
        duration: 3000,
      })
      
      // 记录启动日志
      engine.logger.info('应用启动完成', {
        version: engine.config.get('version'),
        environment: engine.config.get('environment'),
      })
    },
    
    // 错误处理
    onError(error, context) {
      console.error(`错误发生在 ${context}:`, error)
      
      // 发送错误报告
      // sendErrorReport(error, context)
      
      // 显示用户友好的错误提示
      if (context === 'plugin installation') {
        engine.notifications.show({
          type: 'error',
          title: '插件加载失败',
          message: '某个插件无法正常加载，请检查配置',
          duration: 5000,
        })
      }
    },
  })
  
  // ==================== 5. 使用引擎 API ====================
  
  // 订阅状态变化
  engine.state.subscribe('user', (newUser, oldUser) => {
    console.log('用户状态变化:', oldUser, '->', newUser)
  })
  
  // 使用缓存
  engine.cache.set('app-config', { theme: 'dark' }, 3600000) // 1小时
  const config = engine.cache.get('app-config')
  
  // 发送事件
  engine.events.emit('app:ready')
  
  // 使用中间件处理请求
  const response = await engine.middleware.execute({
    request: {
      method: 'GET',
      url: '/api/users',
      headers: { authorization: 'Bearer token123' }
    }
  })
  
  // 记录性能指标
  engine.performance.mark('interaction-start')
  // ... 执行操作
  engine.performance.mark('interaction-end')
  engine.performance.measure('user-interaction', 'interaction-start', 'interaction-end')
  
  // 使用日志
  engine.logger.debug('调试信息')
  engine.logger.info('一般信息')
  engine.logger.warn('警告信息')
  engine.logger.error('错误信息')
  
  // 返回引擎实例供外部使用
  return engine
}

// 启动应用
main().catch(console.error)

// 导出供其他模块使用
export { main }