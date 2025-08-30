/**
 * Vue3插件定义
 * 
 * TemplatePlugin - Vue3模板管理插件
 */

import type { App } from 'vue'
import type { 
  TemplatePluginOptions, 
  TemplatePluginInstance 
} from './types/plugin'
import { TemplateScanner } from './scanner'
import { componentCache } from './utils/cache'

/**
 * 插件默认配置
 */
const DEFAULT_OPTIONS: Required<TemplatePluginOptions> = {
  templatesDir: 'src/templates',
  autoScan: true,
  cache: true,
  enableHMR: import.meta.env?.DEV ?? false,
  defaultDevice: 'desktop',
  enablePerformanceMonitor: false,
  preloadStrategy: {
    enabled: true,
    mode: 'lazy',
    limit: 5,
    priority: []
  }
}

/**
 * 全局插件状态
 */
interface PluginState {
  scanner: TemplateScanner | null
  options: Required<TemplatePluginOptions>
  installed: boolean
}

const pluginState: PluginState = {
  scanner: null,
  options: DEFAULT_OPTIONS,
  installed: false
}

/**
 * 插件安装函数
 */
function install(app: App, options: TemplatePluginOptions = {}): void {
  // 防止重复安装
  if (pluginState.installed) {
    console.warn('[TemplatePlugin] Plugin is already installed')
    return
  }

  // 合并配置
  pluginState.options = { ...DEFAULT_OPTIONS, ...options }

  // 创建扫描器
  pluginState.scanner = new TemplateScanner({
    templatesDir: pluginState.options.templatesDir,
    enableCache: pluginState.options.cache,
    enableHMR: pluginState.options.enableHMR
  }, {
    onScanComplete: (result) => {
      if (pluginState.options.enablePerformanceMonitor) {
        console.log('[TemplatePlugin] Scan completed:', result.stats)
      }
    },
    onScanError: (error) => {
      console.error('[TemplatePlugin] Scan error:', error)
    }
  })

  // 提供全局属性
  app.config.globalProperties.$templateScanner = pluginState.scanner
  app.config.globalProperties.$templateOptions = pluginState.options

  // 提供依赖注入
  app.provide('templateScanner', pluginState.scanner)
  app.provide('templateOptions', pluginState.options)

  // 自动扫描
  if (pluginState.options.autoScan) {
    pluginState.scanner.scan().catch(error => {
      console.error('[TemplatePlugin] Auto scan failed:', error)
    })
  }

  // 开发环境热更新
  if (pluginState.options.enableHMR && import.meta.hot) {
    setupHMR()
  }

  // 性能监控
  if (pluginState.options.enablePerformanceMonitor) {
    setupPerformanceMonitor()
  }

  pluginState.installed = true

  if (pluginState.options.enablePerformanceMonitor) {
    console.log('[TemplatePlugin] Plugin installed successfully')
  }
}

/**
 * 设置热更新
 */
function setupHMR(): void {
  if (!import.meta.hot) return

  // 监听模板文件变化
  import.meta.hot.on('template-config-updated', (data) => {
    console.log('[TemplatePlugin] Template config updated:', data)
    
    // 清除相关缓存
    if (pluginState.options.cache) {
      componentCache.clear()
    }
    
    // 重新扫描
    if (pluginState.scanner) {
      pluginState.scanner.scan().catch(error => {
        console.error('[TemplatePlugin] HMR scan failed:', error)
      })
    }
  })

  // 监听模板组件变化
  import.meta.hot.on('template-component-updated', (data) => {
    console.log('[TemplatePlugin] Template component updated:', data)
    
    // 清除特定组件缓存
    if (pluginState.options.cache && data.category && data.device && data.name) {
      componentCache.removeComponent(data.category, data.device, data.name)
    }
  })
}

/**
 * 设置性能监控
 */
function setupPerformanceMonitor(): void {
  // 定期输出缓存统计
  setInterval(() => {
    const stats = componentCache.getStats()
    if (stats.totalSize > 0) {
      console.log('[TemplatePlugin] Cache stats:', stats)
    }
  }, 30000) // 30秒

  // 监控内存使用
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
    setInterval(() => {
      // @ts-ignore
      const memory = window.performance.memory
      if (memory) {
        console.log('[TemplatePlugin] Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        })
      }
    }, 60000) // 60秒
  }
}

/**
 * 获取插件状态
 */
export function getPluginState(): Readonly<PluginState> {
  return pluginState
}

/**
 * 获取扫描器实例
 */
export function getScanner(): TemplateScanner | null {
  return pluginState.scanner
}

/**
 * 获取插件配置
 */
export function getPluginOptions(): Required<TemplatePluginOptions> {
  return pluginState.options
}

/**
 * 插件实例
 */
const TemplatePlugin: TemplatePluginInstance = {
  install,
  version: '1.0.0',
  name: 'TemplatePlugin'
}

// 默认导出插件
export default TemplatePlugin

// 具名导出
export { TemplatePlugin }

// 类型导出
export type { TemplatePluginOptions, TemplatePluginInstance }
