/**
 * 开发环境增强插件
 * 
 * 提供更好的开发体验，包括自动重启、文件监听、错误恢复等
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin, ViteDevServer } from 'vite'
import { Logger } from '../utils/logger'
import path from 'node:path'
import { watch } from 'chokidar'

export interface DevEnhancementOptions {
  /** 是否启用自动重启 */
  enableAutoRestart?: boolean
  /** 是否启用智能错误恢复 */
  enableErrorRecovery?: boolean
  /** 是否启用文件变更通知 */
  enableChangeNotification?: boolean
  /** 是否启用性能监控 */
  enablePerformanceMonitor?: boolean
  /** 是否启用内存监控 */
  enableMemoryMonitor?: boolean
  /** 是否启用网络监控 */
  enableNetworkMonitor?: boolean
  /** 是否启用依赖热更新 */
  enableDependencyHMR?: boolean
  /** 监听的配置文件 */
  configFiles?: string[]
  /** 监听的环境文件 */
  envFiles?: string[]
  /** 重启延迟时间 (ms) */
  restartDelay?: number
  /** 内存警告阈值 (MB) */
  memoryWarningThreshold?: number
  /** 是否启用开发工具集成 */
  enableDevTools?: boolean
}

export interface PerformanceMetrics {
  /** 内存使用量 (MB) */
  memoryUsage: number
  /** CPU 使用率 (%) */
  cpuUsage: number
  /** 启动时间 (ms) */
  startupTime: number
  /** 热更新时间 (ms) */
  hmrTime: number
  /** 网络请求数量 */
  networkRequests: number
  /** 错误数量 */
  errorCount: number
}

export class DevEnhancementManager {
  private logger: Logger
  private options: Required<DevEnhancementOptions>
  private server?: ViteDevServer
  private configWatcher?: any
  private envWatcher?: any
  private metrics: PerformanceMetrics = {
    memoryUsage: 0,
    cpuUsage: 0,
    startupTime: 0,
    hmrTime: 0,
    networkRequests: 0,
    errorCount: 0
  }
  private startTime = Date.now()
  private restartTimeout?: NodeJS.Timeout

  constructor(options: DevEnhancementOptions = {}) {
    this.logger = new Logger('DevEnhancement')
    this.options = {
      enableAutoRestart: true,
      enableErrorRecovery: true,
      enableChangeNotification: true,
      enablePerformanceMonitor: true,
      enableMemoryMonitor: true,
      enableNetworkMonitor: true,
      enableDependencyHMR: false,
      configFiles: [
        'vite.config.ts',
        'vite.config.js',
        'launcher.config.ts',
        'launcher.config.js',
        '.ldesign/launcher.*.config.ts'
      ],
      envFiles: [
        '.env',
        '.env.local',
        '.env.development',
        '.env.production'
      ],
      restartDelay: 1000,
      memoryWarningThreshold: 512,
      enableDevTools: true,
      ...options
    }
  }

  /**
   * 初始化开发增强功能
   */
  async initialize(server: ViteDevServer): Promise<void> {
    this.server = server
    this.startTime = Date.now()

    try {
      // 设置配置文件监听
      if (this.options.enableAutoRestart) {
        await this.setupConfigWatcher()
      }

      // 设置环境文件监听
      await this.setupEnvWatcher()

      // 设置性能监控
      if (this.options.enablePerformanceMonitor) {
        this.setupPerformanceMonitor()
      }

      // 设置内存监控
      if (this.options.enableMemoryMonitor) {
        this.setupMemoryMonitor()
      }

      // 设置网络监控
      if (this.options.enableNetworkMonitor) {
        this.setupNetworkMonitor()
      }

      // 设置错误恢复
      if (this.options.enableErrorRecovery) {
        this.setupErrorRecovery()
      }

      // 设置开发工具
      if (this.options.enableDevTools) {
        this.setupDevTools()
      }

      // 记录启动时间
      this.metrics.startupTime = Date.now() - this.startTime

      this.logger.success('开发环境增强功能已启用', {
        startupTime: `${this.metrics.startupTime}ms`,
        features: this.getEnabledFeatures()
      })

    } catch (error) {
      this.logger.error('开发环境增强初始化失败', { error: (error as Error).message })
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.configWatcher) {
      await this.configWatcher.close()
    }
    if (this.envWatcher) {
      await this.envWatcher.close()
    }
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout)
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 设置配置文件监听
   */
  private async setupConfigWatcher(): Promise<void> {
    const configPaths = this.options.configFiles.map(file =>
      path.resolve(process.cwd(), file)
    )

    this.configWatcher = watch(configPaths, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    })

    this.configWatcher.on('change', (filePath: string) => {
      this.logger.info(`配置文件变更: ${path.relative(process.cwd(), filePath)}`)
      this.scheduleRestart('配置文件变更')
    })

    this.configWatcher.on('add', (filePath: string) => {
      this.logger.info(`新增配置文件: ${path.relative(process.cwd(), filePath)}`)
      this.scheduleRestart('新增配置文件')
    })

    this.logger.debug('配置文件监听已启用', { files: this.options.configFiles })
  }

  /**
   * 设置环境文件监听
   */
  private async setupEnvWatcher(): Promise<void> {
    const envPaths = this.options.envFiles.map(file =>
      path.resolve(process.cwd(), file)
    )

    this.envWatcher = watch(envPaths, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    })

    this.envWatcher.on('change', (filePath: string) => {
      if (this.options.enableChangeNotification) {
        this.logger.info(`环境文件变更: ${path.relative(process.cwd(), filePath)}`)
        this.showChangeNotification('环境变量已更新，建议重启服务器')
      }
    })

    this.logger.debug('环境文件监听已启用', { files: this.options.envFiles })
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitor(): void {
    // 监控 HMR 性能
    if (this.server) {
      const originalHmr = this.server.ws.send.bind(this.server.ws)
      this.server.ws.send = (payload: any) => {
        if (payload.type === 'update') {
          const hmrStart = Date.now()
          originalHmr(payload)
          this.metrics.hmrTime = Date.now() - hmrStart
        } else {
          originalHmr(payload)
        }
      }
    }

    // 定期收集性能数据
    setInterval(() => {
      this.collectPerformanceMetrics()
    }, 5000) // 每5秒收集一次
  }

  /**
   * 设置内存监控
   */
  private setupMemoryMonitor(): void {
    setInterval(() => {
      const memUsage = process.memoryUsage()
      const memoryMB = memUsage.heapUsed / 1024 / 1024
      this.metrics.memoryUsage = memoryMB

      if (memoryMB > this.options.memoryWarningThreshold) {
        this.logger.warn(`内存使用量较高: ${memoryMB.toFixed(2)}MB`, {
          threshold: this.options.memoryWarningThreshold,
          suggestion: '考虑重启开发服务器或检查内存泄漏'
        })
      }
    }, 10000) // 每10秒检查一次
  }

  /**
   * 设置网络监控
   */
  private setupNetworkMonitor(): void {
    if (!this.server) return

    // 监控网络请求
    this.server.middlewares.use((req, res, next) => {
      this.metrics.networkRequests++

      const start = Date.now()
      const originalEnd = res.end.bind(res)

      res.end = function (...args: any[]) {
        const duration = Date.now() - start
        if (duration > 1000) { // 超过1秒的请求
          console.log(`慢请求: ${req.url} (${duration}ms)`)
        }
        return originalEnd(...args)
      }

      next()
    })
  }

  /**
   * 设置错误恢复
   */
  private setupErrorRecovery(): void {
    // 监听未捕获的异常
    process.on('uncaughtException', (error) => {
      this.metrics.errorCount++
      this.logger.error('未捕获的异常', { error: error.message })
      this.attemptErrorRecovery(error)
    })

    // 监听未处理的 Promise 拒绝
    process.on('unhandledRejection', (reason) => {
      this.metrics.errorCount++
      this.logger.error('未处理的 Promise 拒绝', { reason })
      this.attemptErrorRecovery(new Error(String(reason)))
    })
  }

  /**
   * 设置开发工具
   */
  private setupDevTools(): void {
    if (!this.server) return

    // 添加开发工具中间件
    this.server.middlewares.use('/__dev-tools__', (req, res, next) => {
      if (req.url === '/metrics') {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(this.metrics, null, 2))
        return
      }

      if (req.url === '/restart') {
        this.scheduleRestart('手动重启')
        res.end('重启已安排')
        return
      }

      next()
    })

    this.logger.info('开发工具已启用', {
      metricsUrl: 'http://localhost:3000/__dev-tools__/metrics',
      restartUrl: 'http://localhost:3000/__dev-tools__/restart'
    })
  }

  /**
   * 安排重启
   */
  private scheduleRestart(reason: string): void {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout)
    }

    this.restartTimeout = setTimeout(() => {
      this.performRestart(reason)
    }, this.options.restartDelay)

    this.logger.info('Server will restart in ' + this.options.restartDelay + 'ms, reason: ' + reason)
  }

  /**
   * 执行重启
   */
  private async performRestart(reason: string): Promise<void> {
    try {
      this.logger.info('正在重启服务器...', { reason })

      if (this.server) {
        await this.server.close()
      }

      // 清理缓存
      this.clearRequireCache()

      // 重新启动
      process.exit(0) // 让进程管理器重启

    } catch (error) {
      this.logger.error('重启失败', { error: (error as Error).message })
    }
  }

  /**
   * 尝试错误恢复
   */
  private attemptErrorRecovery(error: Error): void {
    this.logger.info('尝试自动错误恢复...')

    // 清理缓存
    this.clearRequireCache()

    // 如果是内存相关错误，触发垃圾回收
    if (error.message.includes('memory') || error.message.includes('heap')) {
      if (global.gc) {
        global.gc()
        this.logger.info('已触发垃圾回收')
      }
    }

    // 如果错误持续，安排重启
    if (this.metrics.errorCount > 5) {
      this.scheduleRestart('错误过多，自动重启')
    }
  }

  /**
   * 清理 require 缓存
   */
  private clearRequireCache(): void {
    Object.keys(require.cache).forEach(key => {
      if (!key.includes('node_modules')) {
        delete require.cache[key]
      }
    })
  }

  /**
   * 收集性能指标
   */
  private collectPerformanceMetrics(): void {
    const memUsage = process.memoryUsage()
    this.metrics.memoryUsage = memUsage.heapUsed / 1024 / 1024

    // 获取 CPU 使用率（简化版本）
    try {
      const cpuUsage = process.cpuUsage()
      this.metrics.cpuUsage = (cpuUsage.user + cpuUsage.system) / 1000000 // 转换为秒
    } catch {
      // 忽略错误
    }
  }

  /**
   * 显示变更通知
   */
  private showChangeNotification(message: string): void {
    this.logger.info(message)
  }

  /**
   * 获取启用的功能列表
   */
  private getEnabledFeatures(): string[] {
    const features: string[] = []

    if (this.options.enableAutoRestart) features.push('自动重启')
    if (this.options.enableErrorRecovery) features.push('错误恢复')
    if (this.options.enableChangeNotification) features.push('变更通知')
    if (this.options.enablePerformanceMonitor) features.push('性能监控')
    if (this.options.enableMemoryMonitor) features.push('内存监控')
    if (this.options.enableNetworkMonitor) features.push('网络监控')
    if (this.options.enableDevTools) features.push('开发工具')

    return features
  }
}

/**
 * 创建开发环境增强插件
 */
export function createDevEnhancementPlugin(options: DevEnhancementOptions = {}): Plugin {
  const manager = new DevEnhancementManager(options)

  return {
    name: 'dev-enhancement',

    configureServer(server) {
      manager.initialize(server)

      // 在服务器关闭时清理
      server.httpServer?.on('close', () => {
        manager.cleanup()
      })
    },

    buildStart() {
      // 在构建开始时显示性能指标
      const metrics = manager.getMetrics()
      if (metrics.memoryUsage > 0) {
        console.log('Memory Usage: ' + metrics.memoryUsage + 'MB')
      }
    }
  }
}
