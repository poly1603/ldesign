/**
 * Vue3插件定义
 *
 * TemplatePlugin - Vue3模板管理插件
 */

import type { App } from 'vue'
import type { TemplateSystemConfig } from './types/config'
import type { TemplatePluginOptions } from './types/plugin'
import { getConfigManager, TemplateConfigManager } from './config/config-manager'
import { TemplateScanner } from './scanner'
import { componentCache } from './utils/cache'
import { getHotReloadManager, type HotReloadManager } from './utils/hot-reload-manager'

/**
 * 转换旧版插件选项为新配置格式
 */
function convertLegacyOptions(options: TemplatePluginOptions): Partial<TemplateSystemConfig> {
  const config: Partial<TemplateSystemConfig> = {}

  // 基础配置转换
  if (options.templatesDir !== undefined)
    config.templatesDir = options.templatesDir
  if (options.autoScan !== undefined)
    config.autoScan = options.autoScan
  if (options.enableHMR !== undefined)
    config.enableHMR = options.enableHMR
  if (options.defaultDevice !== undefined)
    config.defaultDevice = options.defaultDevice
  if (options.enablePerformanceMonitor !== undefined)
    config.enablePerformanceMonitor = options.enablePerformanceMonitor

  // 缓存配置转换（向后兼容）
  if (options.cache !== undefined) {
    if (typeof options.cache === 'boolean') {
      config.cache = { ...(config.cache as any), enabled: options.cache } as any
    }
    else if (typeof options.cache === 'object') {
      config.cache = { ...(config.cache as any), ...options.cache } as any
    }
  }
  if (options.cacheLimit !== undefined) {
    const enabled = (config.cache as any)?.enabled ?? true
    config.cache = { ...(config.cache as any), enabled, maxSize: options.cacheLimit } as any
  }

  // 设备检测配置转换（向后兼容）
  if (options.mobileBreakpoint !== undefined || options.tabletBreakpoint !== undefined || options.desktopBreakpoint !== undefined) {
    config.deviceDetection = {
      ...(config.deviceDetection as any),
      breakpoints: {
        mobile: options.mobileBreakpoint ?? (config.deviceDetection as any)?.breakpoints?.mobile ?? 768,
        tablet: options.tabletBreakpoint ?? (config.deviceDetection as any)?.breakpoints?.tablet ?? 992,
        desktop: options.desktopBreakpoint ?? (config.deviceDetection as any)?.breakpoints?.desktop ?? 1200,
      },
      debounceDelay: (config.deviceDetection as any)?.debounceDelay ?? 300,
      enableResize: (config.deviceDetection as any)?.enableResize ?? true,
      enableOrientation: (config.deviceDetection as any)?.enableOrientation ?? true,
    } as any
  }

  // 预加载配置转换
  if (options.preloadStrategy !== undefined) {
    const legacy = options.preloadStrategy
    config.preloadStrategy = {
      enabled: legacy.enabled ?? true,
      mode: (legacy.mode as any) ?? 'lazy',
      limit: legacy.limit ?? 5,
      priority: legacy.priority ?? [],
      intersection: (config.preloadStrategy as any)?.intersection ?? { rootMargin: '50px', threshold: 0.1 },
      delay: (config.preloadStrategy as any)?.delay ?? 1000,
    } as any
  }
  if (options.preloadTemplates !== undefined) {
    config.preloadStrategy = {
      ...(config.preloadStrategy as any),
      enabled: (config.preloadStrategy as any)?.enabled ?? true,
      mode: (config.preloadStrategy as any)?.mode ?? 'lazy',
      limit: (config.preloadStrategy as any)?.limit ?? 5,
      intersection: (config.preloadStrategy as any)?.intersection ?? { rootMargin: '50px', threshold: 0.1 },
      delay: (config.preloadStrategy as any)?.delay ?? 1000,
      priority: options.preloadTemplates,
    } as any
  }

  // 直接复制新格式的配置
  const newConfigKeys: (keyof TemplateSystemConfig)[] = [
    'scanner',
    'cache',
    'deviceDetection',
    'preloadStrategy',
    'loader',
    'fileNaming',
    'performance',
    'errorHandling',
    'devtools',
  ]

  newConfigKeys.forEach((key) => {
    if (options[key] !== undefined) {
      config[key] = options[key] as any
    }
  })

  return config
}

/**
 * 全局插件状态
 */
interface PluginState {
  scanner: TemplateScanner | null
  configManager: TemplateConfigManager | null
  hotReloadManager: HotReloadManager | null
  installed: boolean
}

const pluginState: PluginState = {
  scanner: null,
  configManager: null,
  hotReloadManager: null,
  installed: false,
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

  // 转换并合并配置
  const convertedConfig = convertLegacyOptions(options)
  console.log('[TemplatePlugin] Converting config:', convertedConfig)

  let config: any
  try {
    // 直接创建配置管理器实例，避免可能的模块加载问题
    console.log('[TemplatePlugin] Creating TemplateConfigManager directly...')
    pluginState.configManager = new TemplateConfigManager(convertedConfig)
    console.log('[TemplatePlugin] Config manager created:', pluginState.configManager)

    if (!pluginState.configManager) {
      throw new Error('Config manager is null')
    }

    config = pluginState.configManager.getConfig()
    console.log('[TemplatePlugin] Config loaded:', config)
  }
  catch (error) {
    console.error('[TemplatePlugin] Error creating config manager:', error)
    throw error
  }

  // 创建热更新管理器
  if (config.enableHMR) {
    pluginState.hotReloadManager = getHotReloadManager({
      enabled: config.enableHMR,
      debug: config.devtools.enableLogger,
      updateDelay: 100,
      autoRefresh: false,
      preserveState: true,
    })

    // 设置热更新监听器
    pluginState.hotReloadManager.addListener((event) => {
      if (config.devtools.enableLogger) {
        console.log('[TemplatePlugin] Hot reload event:', event)
      }

      // 触发扫描器重新扫描
      if (pluginState.scanner) {
        pluginState.scanner.scan().catch((error) => {
          console.error('[TemplatePlugin] Hot reload scan failed:', error)
        })
      }
    })
  }

  // 创建扫描器
  pluginState.scanner = new TemplateScanner({
    templatesDir: config.templatesDir,
    enableCache: config.scanner.enableCache,
    enableHMR: config.enableHMR,
    maxDepth: config.scanner.maxDepth,
    includeExtensions: config.scanner.includeExtensions,
    excludePatterns: config.scanner.excludePatterns,
    watchMode: config.scanner.watchMode,
    debounceDelay: config.scanner.debounceDelay,
    batchSize: config.scanner.batchSize,
  }, {
    onScanComplete: (result) => {
      if (config.enablePerformanceMonitor || config.devtools.enableLogger) {
        console.info('[TemplatePlugin] Scan completed:', result.stats)
      }
    },
    onScanError: (error) => {
      console.error('[TemplatePlugin] Scan error:', error)
      if (config.errorHandling.enableReporting) {
        // 这里可以添加错误报告逻辑
      }
    },
  })

  // 提供全局属性（安全检查）
  if (app && app.config && app.config.globalProperties) {
    app.config.globalProperties.$templateScanner = pluginState.scanner
    app.config.globalProperties.$templateConfig = pluginState.configManager
    app.config.globalProperties.$templateSystemConfig = config
    app.config.globalProperties.$templateHotReload = pluginState.hotReloadManager
  }

  // 提供依赖注入（安全检查）
  if (app && typeof app.provide === 'function') {
    app.provide('templateScanner', pluginState.scanner)
    app.provide('templateConfig', pluginState.configManager)
    app.provide('templateSystemConfig', config)
    app.provide('templateHotReload', pluginState.hotReloadManager)
  }

  // 自动扫描
  if (config.autoScan) {
    pluginState.scanner.scan().catch((error) => {
      console.error('[TemplatePlugin] Auto scan failed:', error)
      if (config.errorHandling.enableReporting) {
        // 这里可以添加错误报告逻辑
      }
    })
  }

  // 启动文件监听（如果启用了监听模式）
  if (config.scanner.watchMode && pluginState.scanner) {
    pluginState.scanner.startWatching().catch((error) => {
      console.error('[TemplatePlugin] Start watching failed:', error)
    })
  }

  // 开发环境热更新
  if (config.enableHMR && import.meta.hot) {
    setupHMR(config)
  }

  // 性能监控
  if (config.enablePerformanceMonitor) {
    setupPerformanceMonitor(config)
  }

  // 设置错误处理
  if (config.errorHandling.enableGlobalHandler) {
    app.config.errorHandler = (error, instance, info) => {
      console.error('模板系统错误:', error, info)
      if (config.errorHandling.enableReporting) {
        // 这里可以添加错误报告逻辑
      }
    }
  }

  pluginState.installed = true

  if (config.enablePerformanceMonitor || config.devtools.enableLogger) {
    console.info('[TemplatePlugin] Plugin installed successfully')
    if (config.debug) {
      console.info('配置信息:', config)
    }
  }
}

/**
 * 设置热更新
 */
function setupHMR(config: TemplateSystemConfig): void {
  if (!import.meta.hot || !pluginState.hotReloadManager)
    return

  // 监听模板文件变化
  import.meta.hot.on('template-config-updated', (data) => {
    if (config.devtools.enableLogger) {
      console.log('[TemplatePlugin] Template config updated:', data)
    }

    // 清除相关缓存
    if (config.cache.enabled) {
      componentCache.clear()
    }

    // 触发热更新事件
    pluginState.hotReloadManager?.triggerUpdate({
      type: 'config-updated',
      template: {
        category: data.category,
        device: data.device,
        name: data.templateName,
      },
      filePath: data.filePath,
      timestamp: Date.now(),
      data,
    })
  })

  // 监听模板组件变化
  import.meta.hot.on('template-component-updated', (data) => {
    if (config.devtools.enableLogger) {
      console.log('[TemplatePlugin] Template component updated:', data)
    }

    // 清除特定组件缓存
    if (config.cache.enabled && data.category && data.device && data.name) {
      componentCache.removeComponent(data.category, data.device, data.name)
    }

    // 触发热更新事件
    pluginState.hotReloadManager?.triggerUpdate({
      type: 'component-updated',
      template: {
        category: data.category,
        device: data.device,
        name: data.templateName,
      },
      filePath: data.filePath,
      timestamp: Date.now(),
      data,
    })
  })

  // 监听样式文件变化
  import.meta.hot.on('template-style-updated', (data) => {
    if (config.devtools.enableLogger) {
      console.log('[TemplatePlugin] Template style updated:', data)
    }

    // 触发热更新事件
    pluginState.hotReloadManager?.triggerUpdate({
      type: 'style-updated',
      template: {
        category: data.category,
        device: data.device,
        name: data.templateName,
      },
      filePath: data.filePath,
      timestamp: Date.now(),
      data,
    })
  })

  // 监听配置文件变化
  import.meta.hot.on('template-system-config-updated', (newConfig) => {
    if (config.devtools.enableLogger) {
      console.log('[TemplatePlugin] System config updated')
    }

    // 更新配置管理器
    if (pluginState.configManager) {
      pluginState.configManager.updateConfig(newConfig)
    }
  })

  // 监听模板文件添加/删除
  import.meta.hot.on('template-file-changed', (data) => {
    if (config.devtools.enableLogger) {
      console.log('[TemplatePlugin] Template file changed:', data)
    }

    const eventType = data.changeType === 'added'
      ? 'template-added'
      : data.changeType === 'removed' ? 'template-removed' : 'template-updated'

    // 触发热更新事件
    pluginState.hotReloadManager?.triggerUpdate({
      type: eventType,
      template: {
        category: data.category,
        device: data.device,
        name: data.templateName,
      },
      filePath: data.filePath,
      timestamp: Date.now(),
      data,
    })
  })
}

/**
 * 设置性能监控
 */
function setupPerformanceMonitor(config: TemplateSystemConfig): void {
  if (!config.performance.enableMetrics)
    return

  // 定期输出缓存统计
  setInterval(() => {
    const stats = componentCache.getStats()
    if (stats.totalSize > 0 && config.devtools.enableLogger) {
      console.info('[TemplatePlugin] Cache stats:', stats)
    }
  }, config.performance.metricsInterval)

  // 监控内存使用
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
    setInterval(() => {
      // @ts-ignore
      const memory = window.performance.memory
      if (memory && config.devtools.enableLogger) {
        console.info('[TemplatePlugin] Memory usage:', {
          used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
        })
      }
    }, config.performance.metricsInterval * 2) // 内存监控频率较低
  }

  // 监控扫描器性能
  if (pluginState.scanner && config.devtools.enableTimeline) {
    // 这里可以添加更详细的性能监控逻辑
    console.info('[TemplatePlugin] Performance monitoring enabled')
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
 * 获取插件的配置管理器
 */
export function getPluginConfigManager(): TemplateConfigManager | null {
  return pluginState.configManager
}

/**
 * 获取当前配置
 */
export function getPluginOptions(): TemplateSystemConfig | null {
  return pluginState.configManager?.getConfig() || null
}

/**
 * 插件实例
 */
const TemplatePlugin = {
  install,
  version: '1.0.0',
  name: 'TemplatePlugin',
}

// 默认导出插件
export default TemplatePlugin

// 具名导出
export { TemplatePlugin }

/**
 * 创建模板引擎插件
 *
 * 为Engine系统创建模板插件实例
 *
 * @param options 插件配置选项
 * @returns Engine插件实例
 */
export function createTemplateEnginePlugin(options: TemplatePluginOptions = {}) {
  return {
    name: 'template',
    version: '1.0.0',
    async install(context: any) {
      const { engine } = context

      try {
        // 定义实际的安装逻辑
        const performInstall = async () => {
          engine.logger?.info(`[Template Plugin] performInstall called`)

          // 获取 Vue 应用实例
          const vueApp = engine.getApp()
          if (!vueApp) {
            throw new Error(
              'Vue app not found. Make sure the engine has created a Vue app before installing template plugin.',
            )
          }

          engine.logger?.info(`[Template Plugin] Vue app found, proceeding with installation`)

          // 记录插件安装开始
          engine.logger?.info(`Installing template plugin...`, {
            version: '1.0.0',
            options,
          })

          // 安装Vue插件
          if (vueApp && typeof vueApp.use === 'function') {
            vueApp.use(TemplatePlugin, options)
          }
          else {
            // 直接调用插件的install方法
            TemplatePlugin.install(vueApp, options)
          }

          engine.logger?.info(`Template plugin installed successfully`)
        }

        // 检查 Vue 应用是否已经创建
        const vueApp = engine.getApp()
        if (vueApp) {
          engine.logger?.info(`[Template Plugin] Vue app found, installing immediately`)
          await performInstall()
        } else {
          engine.logger?.info(`[Template Plugin] Vue app not found, registering event listener`)
          // 如果 Vue 应用还没有创建，监听 app:created 事件
          engine.events?.once('app:created', async () => {
            engine.logger?.info(`[Template Plugin] app:created event received, installing now`)
            await performInstall()
          })
        }

        engine.logger?.info(`Template plugin registered, waiting for Vue app creation...`)
      } catch (error) {
        console.error(`[Template Plugin] Installation failed:`, error)
        throw error
      }
    },
  }
}

// 类型导出
export type { TemplatePluginOptions }
export type { ConfigManager, TemplateSystemConfig } from './types/config'
