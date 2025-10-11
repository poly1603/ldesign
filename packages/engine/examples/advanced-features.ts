/**
 * LDesign Engine 高级功能示例
 * 展示HMR、插件市场和性能仪表板的使用
 */

import { createEngine } from '@ldesign/engine'
import { createHMRManager } from '@ldesign/engine/hmr'
import { createPluginMarketplace } from '@ldesign/engine/plugins'
import { createPerformanceDashboard } from '@ldesign/engine/performance'

// 创建引擎实例
const engine = createEngine({
  debug: true,
  config: {
    app: {
      name: 'Advanced LDesign App',
      version: '1.0.0'
    },
    features: {
      hmr: true,
      marketplace: true,
      dashboard: true
    }
  }
})

// ========================================
// 1. 热模块替换(HMR)配置
// ========================================

const hmrManager = createHMRManager(engine, {
  enabled: true,
  host: 'localhost',
  port: 3000,
  autoReconnect: true,
  preserveState: true,
  updateStrategy: 'patch'
})

// 监听HMR事件
engine.events.on('hmr:connected', ({ url }) => {
  console.log(`✅ HMR connected to ${url}`)
})

engine.events.on('hmr:updated', ({ modules }) => {
  console.log(`🔄 Hot updated ${modules.length} modules`)
})

// 注册HMR模块更新处理
hmrManager.on('modified', (event) => {
  event.modules.forEach(module => {
    console.log(`Module ${module.id} updated at ${new Date(module.timestamp).toLocaleTimeString()}`)
  })
})

// ========================================
// 2. 插件市场系统
// ========================================

const marketplace = createPluginMarketplace(engine, {
  apiUrl: 'https://api.ldesign.io/plugins',
  cache: true,
  autoUpdate: true,
  securityCheck: true
})

// 搜索插件
async function searchPlugins() {
  const results = await marketplace.search({
    query: 'vue',
    category: 'ui',
    sort: 'downloads',
    order: 'desc',
    pageSize: 10
  })
  
  console.log(`Found ${results.length} plugins:`)
  results.forEach(plugin => {
    console.log(`- ${plugin.name} v${plugin.version} (${plugin.downloads} downloads)`)
  })
}

// 安装插件
async function installPlugin(pluginId: string) {
  try {
    await marketplace.install(pluginId)
    console.log(`✅ Plugin ${pluginId} installed successfully`)
  } catch (error) {
    console.error(`❌ Failed to install plugin ${pluginId}:`, error)
  }
}

// 检查插件更新
async function checkUpdates() {
  const updates = await marketplace.checkUpdates()
  if (updates.length > 0) {
    console.log(`📦 ${updates.length} plugin updates available:`)
    updates.forEach(plugin => {
      console.log(`- ${plugin.name}: ${plugin.installedVersion} → ${plugin.latestVersion}`)
    })
  } else {
    console.log('✅ All plugins are up to date')
  }
}

// 获取推荐插件
async function getFeaturedPlugins() {
  const featured = await marketplace.getFeatured()
  console.log('⭐ Featured plugins:')
  featured.forEach(plugin => {
    console.log(`- ${plugin.name} (⭐ ${plugin.rating}/5)`)
  })
}

// ========================================
// 3. 性能分析仪表板
// ========================================

const dashboard = createPerformanceDashboard(
  engine, 
  engine.performance,
  {
    enabled: true,
    position: 'bottom-right',
    collapsed: false,
    showFPS: true,
    showMemory: true,
    showNetwork: true,
    showComponents: true,
    updateInterval: 100,
    theme: 'auto',
    draggable: true,
    resizable: true,
    customStyles: `
      #ldesign-performance-dashboard {
        backdrop-filter: blur(10px);
      }
    `
  }
)

// 快捷键控制仪表板
document.addEventListener('keydown', (e) => {
  // Ctrl+Shift+D 切换仪表板显示
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    dashboard.toggle()
  }
  
  // Ctrl+Shift+H 隐藏仪表板
  if (e.ctrlKey && e.shiftKey && e.key === 'H') {
    dashboard.hide()
  }
  
  // Ctrl+Shift+S 显示仪表板
  if (e.ctrlKey && e.shiftKey && e.key === 'S') {
    dashboard.show()
  }
})

// ========================================
// 4. 集成使用示例
// ========================================

// Vue应用集成
import { createApp } from 'vue'
import App from './App.vue'

async function initializeApp() {
  // 初始化引擎
  await engine.init()
  
  // 创建Vue应用
  const app = createApp(App)
  
  // 安装引擎到Vue
  engine.install(app)
  
  // 开发环境特性
  if (process.env.NODE_ENV === 'development') {
    // 启用HMR
    if (import.meta.hot) {
      import.meta.hot.accept('./App.vue', (newModule) => {
        hmrManager.updateModule('App.vue', newModule)
      })
    }
    
    // 显示性能仪表板
    dashboard.show()
    
    // 自动检查插件更新
    checkUpdates()
  }
  
  // 挂载应用
  app.mount('#app')
  
  return app
}

// ========================================
// 5. 高级配置示例
// ========================================

// 自定义插件开发
const myCustomPlugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  
  async install(engine) {
    // 注册中间件
    engine.middleware.use(async (ctx, next) => {
      console.time('request-time')
      await next()
      console.timeEnd('request-time')
    })
    
    // 添加全局方法
    engine.addGlobalMethod = function(name: string, fn: Function) {
      engine.config.set(`methods.${name}`, fn)
    }
    
    // 监听引擎事件
    engine.events.on('engine:mounted', () => {
      console.log('Plugin: Engine mounted')
    })
    
    // 添加自定义指令
    engine.directives.register('highlight', {
      mounted(el, binding) {
        el.style.backgroundColor = binding.value || 'yellow'
      }
    })
    
    console.log('✅ Custom plugin installed')
  },
  
  async uninstall(engine) {
    // 清理资源
    engine.events.off('engine:mounted')
    engine.directives.unregister('highlight')
    console.log('Custom plugin uninstalled')
  }
}

// 注册自定义插件
engine.use(myCustomPlugin)

// ========================================
// 6. 性能优化示例
// ========================================

// 批处理优化
import { BatchProcessor } from '@ldesign/engine/utils'

const batchProcessor = new BatchProcessor({
  batchSize: 100,
  interval: 1000,
  maxWaitTime: 5000,
  processor: async (items) => {
    // 批量处理数据
    console.log(`Processing ${items.length} items in batch`)
    await processDataBatch(items)
  }
})

// 添加数据到批处理队列
function addDataForProcessing(data: any) {
  batchProcessor.add(data)
}

// 缓存优化
const cacheManager = engine.cache

// 预加载关键数据
cacheManager.preload(
  ['user-profile', 'app-config', 'theme-settings'],
  async (key) => {
    const response = await fetch(`/api/${key}`)
    return response.json()
  },
  { ttl: 3600000, priority: 'high' }
)

// 缓存预热
cacheManager.warmup([
  { 
    key: 'translations', 
    loader: () => import('./i18n/translations.json'),
    ttl: 86400000 // 24小时
  },
  {
    key: 'components',
    loader: async () => {
      const modules = import.meta.glob('./components/*.vue')
      return Object.keys(modules)
    },
    ttl: 3600000 // 1小时
  }
])

// ========================================
// 7. 错误处理和恢复
// ========================================

// 全局错误处理
engine.errors.onError((error) => {
  console.error('Global error:', error)
  
  // 显示错误通知
  engine.notifications.show({
    type: 'error',
    title: 'Error Occurred',
    message: error.message,
    duration: 5000
  })
  
  // 开发环境显示详细错误
  if (process.env.NODE_ENV === 'development') {
    // HMR错误覆盖层会自动显示
  }
})

// 错误恢复策略
engine.errors.setRecoveryStrategy({
  maxRetries: 3,
  retryDelay: 1000,
  fallback: () => {
    // 降级处理
    console.log('Falling back to safe mode')
    engine.config.set('safeMode', true)
  }
})

// ========================================
// 8. 性能监控和分析
// ========================================

// 监控关键指标
engine.performance.observe('app-startup', {
  entryTypes: ['measure', 'navigation']
})

// 自定义性能标记
performance.mark('app-start')

// 执行初始化
initializeApp().then(() => {
  performance.mark('app-ready')
  performance.measure('app-startup', 'app-start', 'app-ready')
  
  const measure = performance.getEntriesByName('app-startup')[0]
  console.log(`App startup time: ${measure.duration.toFixed(2)}ms`)
})

// 监控内存使用
if ('memory' in performance) {
  setInterval(() => {
    const memory = (performance as any).memory
    const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
    const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
    
    if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
      console.warn(`⚠️ High memory usage: ${usedMB}MB / ${limitMB}MB`)
    }
  }, 10000)
}

// ========================================
// 9. 导出配置
// ========================================

export {
  engine,
  hmrManager,
  marketplace,
  dashboard,
  initializeApp
}

// ========================================
// 10. 清理函数
// ========================================

// 应用卸载时清理资源
export async function cleanup() {
  // 销毁仪表板
  dashboard.destroy()
  
  // 断开HMR连接
  hmrManager.destroy()
  
  // 清理市场缓存
  marketplace.clearCache()
  marketplace.destroy()
  
  // 销毁引擎
  await engine.destroy()
  
  console.log('✅ All resources cleaned up')
}

// 监听页面卸载
window.addEventListener('beforeunload', cleanup)

// ========================================
// 使用说明
// ========================================

/**
 * 快捷键：
 * - Ctrl+Shift+P: 切换性能仪表板
 * - Ctrl+Shift+D: 切换仪表板显示
 * - Ctrl+Shift+H: 隐藏仪表板
 * - Ctrl+Shift+S: 显示仪表板
 * 
 * 命令：
 * - searchPlugins(): 搜索插件
 * - installPlugin(id): 安装插件
 * - checkUpdates(): 检查更新
 * - getFeaturedPlugins(): 获取推荐插件
 * 
 * 环境变量：
 * - NODE_ENV: development/production
 * - VITE_HMR_HOST: HMR服务器地址
 * - VITE_HMR_PORT: HMR服务器端口
 */

// 辅助函数（示例实现）
async function processDataBatch(items: any[]) {
  // 批量处理逻辑
  return Promise.resolve(items)
}