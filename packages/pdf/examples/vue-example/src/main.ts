import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// 创建Vue应用实例
const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue应用错误:', err)
  console.error('组件实例:', instance)
  console.error('错误信息:', info)

  // 可以在这里添加错误上报逻辑
  // 例如发送到错误监控服务
}

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue应用警告:', msg)
  console.warn('组件实例:', instance)
  console.warn('组件追踪:', trace)
}

// 性能监控
app.config.performance = true

// 挂载应用
app.mount('#app')

// 热模块替换支持
if (import.meta.hot) {
  import.meta.hot.accept()
}

// 开发环境调试信息
if (import.meta.env.DEV) {
  console.log('🚀 Vue PDF Viewer Example 开发模式启动')
  console.log('📦 Vue版本:', app.version)
  console.log('🔧 开发工具已启用')

  // 添加全局调试方法
  ;(window as any).__VUE_APP__ = app
}

// 生产环境优化
if (import.meta.env.PROD) {
  console.log('✨ Vue PDF Viewer Example 生产模式运行')

  // 移除开发时的调试信息
  console.log = () => {}
  console.warn = () => {}
  console.info = () => {}
}

// 浏览器兼容性检查
function checkBrowserCompatibility() {
  const features = {
    'ES6 Modules': 'noModule' in HTMLScriptElement.prototype,
    'Fetch API': 'fetch' in window,
    'Promise': 'Promise' in window,
    'Proxy': 'Proxy' in window,
    'WeakMap': 'WeakMap' in window,
    'File API': 'File' in window && 'FileReader' in window,
    'Canvas': 'HTMLCanvasElement' in window,
    'Web Workers': 'Worker' in window,
  }

  const unsupported = Object.entries(features)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature)

  if (unsupported.length > 0) {
    console.warn('⚠️ 浏览器兼容性警告: 以下功能不受支持:', unsupported)

    // 显示兼容性警告
    const warningDiv = document.createElement('div')
    warningDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff9800;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
      ">
        ⚠️ 您的浏览器可能不完全支持此应用的所有功能。建议使用最新版本的 Chrome、Firefox、Safari 或 Edge。
        <button onclick="this.parentElement.remove()" style="
          margin-left: 12px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        ">关闭</button>
      </div>
    `
    document.body.appendChild(warningDiv)

    // 5秒后自动关闭
    setTimeout(() => {
      if (warningDiv.parentElement) {
        warningDiv.remove()
      }
    }, 5000)
  }
  else {
    console.log('✅ 浏览器兼容性检查通过')
  }
}

// 性能监控
function performanceObserver() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()

      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          console.log('📊 页面加载性能:', {
            DNS查询: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            TCP连接: navEntry.connectEnd - navEntry.connectStart,
            请求响应: navEntry.responseEnd - navEntry.requestStart,
            DOM解析: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            页面加载: navEntry.loadEventEnd - navEntry.loadEventStart,
            总时间: navEntry.loadEventEnd - navEntry.navigationStart,
          })
        }

        if (entry.entryType === 'paint') {
          console.log(`🎨 ${entry.name}:`, `${entry.startTime.toFixed(2)}ms`)
        }

        if (entry.entryType === 'largest-contentful-paint') {
          console.log('🖼️ 最大内容绘制 (LCP):', `${entry.startTime.toFixed(2)}ms`)
        }
      })
    })

    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
  }
}

// 内存监控
function memoryMonitor() {
  if ('memory' in performance) {
    const memory = (performance as any).memory

    const logMemoryUsage = () => {
      console.log('💾 内存使用情况:', {
        已使用: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        总分配: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        限制: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      })
    }

    // 初始记录
    logMemoryUsage()

    // 每30秒记录一次
    setInterval(logMemoryUsage, 30000)
  }
}

// 错误监控
function errorMonitor() {
  // 全局JavaScript错误
  window.addEventListener('error', (event) => {
    console.error('🚨 全局JavaScript错误:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    })
  })

  // Promise拒绝错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 未处理的Promise拒绝:', event.reason)
  })

  // 资源加载错误
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      console.error('🚨 资源加载错误:', {
        element: event.target,
        source: (event.target as any)?.src || (event.target as any)?.href,
      })
    }
  }, true)
}

// 网络状态监控
function networkMonitor() {
  if ('navigator' in window && 'onLine' in navigator) {
    const updateNetworkStatus = () => {
      const status = navigator.onLine ? '在线' : '离线'
      console.log(`🌐 网络状态: ${status}`)

      // 可以在这里添加网络状态变化的处理逻辑
      document.body.classList.toggle('offline', !navigator.onLine)
    }

    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    // 初始状态
    updateNetworkStatus()
  }

  // 网络信息API（实验性）
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    console.log('📡 网络连接信息:', {
      连接类型: connection.effectiveType,
      下行速度: connection.downlink,
      RTT: connection.rtt,
      数据节省: connection.saveData,
    })
  }
}

// 初始化监控
if (import.meta.env.DEV) {
  checkBrowserCompatibility()
  performanceObserver()
  memoryMonitor()
  errorMonitor()
  networkMonitor()
}

// 导出应用实例供测试使用
export default app
