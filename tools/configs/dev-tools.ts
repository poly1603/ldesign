/**
 * 开发工具配置
 * 提供更好的开发体验和调试功能
 */

import type { UserConfig } from 'vite'
import { resolve } from 'node:path'

export interface DevToolsOptions {
  /** 是否启用热重载 */
  hmr?: boolean
  /** 是否启用源码映射 */
  sourcemap?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
  /** 错误覆盖层 */
  errorOverlay?: boolean
  /** 自动打开浏览器 */
  open?: boolean
  /** 开发服务器端口 */
  port?: number
}

/**
 * 创建开发工具配置
 */
export function createDevToolsConfig(
  options: DevToolsOptions = {},
): UserConfig {
  const {
    hmr = true,
    sourcemap = true,
    debug = true,
    errorOverlay = true,
    open = false,
    port = 3000,
  } = options

  return {
    define: {
      __DEV__: JSON.stringify(true),
      __DEBUG__: JSON.stringify(debug),
    },

    server: {
      port,
      open,
      hmr: hmr
        ? {
            overlay: errorOverlay,
          }
        : false,
      cors: true,
      // 更好的错误处理
      middlewareMode: false,
    },

    build: {
      sourcemap,
      // 开发环境不压缩，便于调试
      minify: false,
      rollupOptions: {
        output: {
          // 保持可读的文件名
          entryFileNames: '[name].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: '[name]-[hash].[ext]',
        },
      },
    },

    optimizeDeps: {
      // 强制预构建依赖
      force: true,
      include: [
        'vue',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vue/reactivity',
        '@vue/shared',
      ],
    },

    css: {
      devSourcemap: sourcemap,
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          // 全局变量
          globalVars: {
            'primary-color': '#1890ff',
            'success-color': '#52c41a',
            'warning-color': '#faad14',
            'error-color': '#f5222d',
          },
        },
      },
    },

    esbuild: {
      // 保留调试信息
      keepNames: true,
      // 更好的错误信息
      format: 'esm',
      target: 'es2020',
    },
  }
}

/**
 * 创建包开发配置
 */
export function createPackageDevConfig(
  packageName: string,
  options: DevToolsOptions = {},
): UserConfig {
  const baseConfig = createDevToolsConfig(options)

  return {
    ...baseConfig,

    resolve: {
      alias: {
        [`@ldesign/${packageName}`]: resolve(process.cwd(), 'src'),
        '@': resolve(process.cwd(), 'src'),
      },
    },

    plugins: [
      // 添加包特定的插件
    ],
  }
}

/**
 * 开发环境错误处理
 */
export function setupDevErrorHandling() {
  if (typeof window !== 'undefined') {
    // 全局错误处理
    window.addEventListener('error', (event) => {
      console.group('🚨 JavaScript Error')
      console.error('Message:', event.message)
      console.error('Source:', event.filename)
      console.error('Line:', event.lineno)
      console.error('Column:', event.colno)
      console.error('Error:', event.error)
      console.groupEnd()
    })

    // Promise 错误处理
    window.addEventListener('unhandledrejection', (event) => {
      console.group('🚨 Unhandled Promise Rejection')
      console.error('Reason:', event.reason)
      console.error('Promise:', event.promise)
      console.groupEnd()
    })

    // Vue 错误处理
    if (window.Vue) {
      window.Vue.config.errorHandler = (
        err: Error,
        instance: any,
        info: string,
      ) => {
        console.group('🚨 Vue Error')
        console.error('Error:', err)
        console.error('Instance:', instance)
        console.error('Info:', info)
        console.groupEnd()
      }
    }
  }
}

/**
 * 开发环境性能监控
 */
export function setupDevPerformanceMonitoring() {
  if (typeof window !== 'undefined' && window.performance) {
    // 监控页面加载性能
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing
        const loadTime = perfData.loadEventEnd - perfData.navigationStart

        console.group('📊 Performance Metrics')
        console.log('Page Load Time:', `${loadTime}ms`)
        console.log(
          'DOM Ready Time:',
          `${perfData.domContentLoadedEventEnd - perfData.navigationStart}ms`,
        )
        console.log(
          'First Paint:',
          `${perfData.responseStart - perfData.navigationStart}ms`,
        )
        console.groupEnd()
      }, 0)
    })

    // 监控资源加载
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) {
          // 超过1秒的资源
          console.warn(
            `⚠️ Slow Resource: ${entry.name} (${entry.duration.toFixed(2)}ms)`,
          )
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
  }
}

/**
 * 开发环境调试工具
 */
export function setupDevDebugTools() {
  if (typeof window !== 'undefined') {
    // 添加全局调试对象
    ;(window as any).__LDESIGN_DEBUG__ = {
      // 包信息
      packages: {},

      // 性能监控
      performance: {
        mark: (name: string) => performance.mark(name),
        measure: (name: string, start: string, end?: string) => {
          performance.measure(name, start, end)
          const measure = performance.getEntriesByName(name, 'measure')[0]
          console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`)
        },
      },

      // 组件调试
      component: {
        inspect: (component: any) => {
          console.group('🔍 Component Inspector')
          console.log('Component:', component)
          console.log('Props:', component.$props)
          console.log('Data:', component.$data)
          console.log('Computed:', component.$computed)
          console.groupEnd()
        },
      },

      // 状态调试
      state: {
        log: (state: any, label = 'State') => {
          console.group(`📦 ${label}`)
          console.log(JSON.stringify(state, null, 2))
          console.groupEnd()
        },
      },
    }

    console.log(
      '🛠️ LDesign Debug Tools loaded. Access via window.__LDESIGN_DEBUG__',
    )
  }
}
