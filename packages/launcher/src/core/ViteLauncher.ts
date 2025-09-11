/**
 * ViteLauncher 核心类
 * 
 * 封装 Vite JavaScript API，提供统一的开发服务器、构建和预览功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events'
import type {
  ViteDevServer,
  PreviewServer,
  Plugin
} from 'vite'

import type { RollupOutput, RollupWatcher } from 'rollup'

// 导入内部工具
import { Logger } from '../utils/logger'
import { ErrorHandler } from '../utils/error-handler'
import { FileSystem } from '../utils/file-system'
import { PathUtils } from '../utils/path-utils'
import { ConfigManager } from './ConfigManager'
import { SmartPluginManager } from './SmartPluginManager'

// 导入类型定义
import type {
  IViteLauncher,
  ViteLauncherConfig,
  LauncherHooks,
  LauncherEventData,
  LauncherOptions,
  LauncherStats,
  PerformanceMetrics,
  ServerInfo
} from '../types'
import { LauncherStatus, LauncherEvent, ServerType } from '../types'

// 导入常量
import {
  DEFAULT_VITE_LAUNCHER_CONFIG,
  DEFAULT_PORT,
  DEFAULT_HOST,
  DEFAULT_LOG_LEVEL
} from '../constants'

/**
 * ViteLauncher 核心类
 * 
 * 提供完整的 Vite 项目启动、构建和预览功能
 * 支持插件系统、配置管理、生命周期钩子等高级特性
 */
export class ViteLauncher extends EventEmitter implements IViteLauncher {
  /** 当前状态 */
  private status: LauncherStatus = LauncherStatus.IDLE

  /** 当前配置 */
  private config: ViteLauncherConfig

  /** 开发服务器实例 */
  private devServer: ViteDevServer | null = null

  /** 预览服务器实例 */
  private previewServer: PreviewServer | null = null

  /** 构建监听器实例 */
  private buildWatcher: RollupWatcher | null = null

  /** 日志记录器 */
  private logger: Logger

  /** 错误处理器 */
  private errorHandler: ErrorHandler

  /** 配置管理器 */
  private configManager: ConfigManager

  /** 插件列表 */
  private plugins: Plugin[] = []

  /** 统计信息 */
  private stats: LauncherStats = {
    startCount: 0,
    buildCount: 0,
    errorCount: 0,
    totalRuntime: 0,
    averageStartTime: 0,
    averageBuildTime: 0,
    lastActivity: Date.now()
  }

  /** 性能监控数据 */
  private performanceMetrics: PerformanceMetrics = {
    memory: { used: 0, total: 0, percentage: 0 },
    cpu: { usage: 0, loadAverage: [] },
    startupTime: 0,
    buildTime: 0,
    hmrTime: 0,
    fileChangeResponseTime: 0
  }

  /** 启动时间 */
  private startTime: number = 0

  /** 工作目录 */
  private cwd: string

  /** 智能插件管理器 */
  private smartPluginManager: SmartPluginManager

  /**
   * 构造函数
   * 
   * @param options - 启动器选项
   */
  constructor(options: LauncherOptions = {}) {
    super()

    // 设置工作目录
    this.cwd = options.cwd || process.cwd()

    // 初始化配置
    this.config = this.mergeConfig(DEFAULT_VITE_LAUNCHER_CONFIG, options.config || {})

    // 初始化日志记录器
    const isDebug = process.env.NODE_ENV === 'development' ||
      process.argv.includes('--debug') ||
      process.argv.includes('-d')

    this.logger = new Logger('ViteLauncher', {
      level: this.config.launcher?.logLevel || DEFAULT_LOG_LEVEL,
      colors: true,
      timestamp: isDebug, // 只在 debug 模式显示时间戳
      compact: !isDebug   // 非 debug 模式使用简洁输出
    })

    // 初始化错误处理器
    this.errorHandler = new ErrorHandler({
      logger: this.logger,
      exitOnError: false
    })

    // 初始化配置管理器
    const configLogger = new Logger('ConfigManager', {
      level: this.logger.getLevel(),
      colors: true,
      timestamp: isDebug,
      compact: !isDebug
    })
    this.configManager = new ConfigManager({
      configFile: this.config.launcher?.configFile,
      watch: this.config.launcher?.autoRestart || false,
      logger: configLogger
    })

    // 初始化智能插件管理器
    const smartLogger = new Logger('SmartPluginManager', {
      level: this.logger.getLevel(),
      colors: true,
      timestamp: isDebug,
      compact: !isDebug
    })
    this.smartPluginManager = new SmartPluginManager(this.cwd, smartLogger)

    // 设置事件监听器
    this.setupEventListeners(options.listeners)

    // 默认监听 error 事件，避免未监听时抛出异常
    // 注意：不要在此处再次调用 handleError，否则会与 handleError 内部的 emit('error') 形成递归
    this.on('error', (err: any) => {
      try {
        // 如果是内部 emit 传递的事件负载
        if (err && typeof err === 'object' && 'error' in err) {
          const e = (err as any).error as any
          const ctx = (err as any).context || '运行时错误'
          const real = e instanceof Error ? e : new Error(String(e))
          this.logger.error(ctx, { error: real.message, stack: real.stack })
          return
        }
        // 其他未知来源错误：仅记录，避免递归
        const real = err instanceof Error ? err : new Error(String(err))
        this.logger.error('运行时错误', { error: real.message, stack: real.stack })
      } catch {}
    })

    // 设置错误处理
    this.setupErrorHandling()

    this.logger.debug('ViteLauncher 基础初始化完成')
  }

  /**
   * 异步初始化方法
   * 加载配置文件并完成完整初始化
   */
  async initialize(): Promise<void> {
    try {
      // 优先使用显式指定的配置文件，其次自动查找
      const specified = this.config.launcher?.configFile
      if (specified) {
        // 加载并合并用户配置到当前配置（修复：之前未合并导致用户 plugins 等失效）
        const loaded = await this.configManager.loadConfig(specified)
        if (loaded && typeof loaded === 'object') {
          this.config = this.mergeConfig(this.config, loaded)
        }
      } else {
        // autoLoadConfig 内部已合并到 this.config
        await this.autoLoadConfig()
      }

      this.logger.info('ViteLauncher 初始化完成')
    } catch (error) {
      this.logger.warn('配置文件加载失败，使用默认配置', { error: (error as Error).message })
    }
  }

  /**
   * 启动开发服务器
   * 
   * @param config - 可选的配置覆盖
   * @returns 开发服务器实例
   */
  async startDev(config?: ViteLauncherConfig): Promise<ViteDevServer> {
    try {
      // 确保已初始化（加载配置文件）
      await this.initialize()

      this.setStatus(LauncherStatus.STARTING)
      this.startTime = Date.now()

      // 合并配置
      let mergedConfig = config ? this.mergeConfig(this.config, config) : this.config

      // 添加智能检测的插件
      mergedConfig = await this.enhanceConfigWithSmartPlugins(mergedConfig)

      // 执行启动前钩子
      await this.executeHook('beforeStart')

      this.logger.info('正在启动开发服务器...', {
        host: mergedConfig.server?.host || DEFAULT_HOST,
        port: mergedConfig.server?.port || DEFAULT_PORT
      })

      // 动态导入 Vite
      const { createServer } = await import('vite')

      // 创建开发服务器
      this.devServer = await createServer(mergedConfig)

      // 启动服务器
      await this.devServer.listen()

      // 更新统计信息
      this.updateStats('start')

      // 设置状态
      this.setStatus(LauncherStatus.RUNNING)

      // 执行启动后钩子
      await this.executeHook('afterStart')

      // 触发服务器就绪事件
      this.emit(LauncherEvent.SERVER_READY, {
        server: this.devServer,
        url: this.getServerUrl(this.devServer),
        timestamp: Date.now()
      } as LauncherEventData[LauncherEvent.SERVER_READY])

      this.logger.success('开发服务器启动成功', {
        url: this.getServerUrl(this.devServer),
        duration: Date.now() - this.startTime
      })

      return this.devServer

    } catch (error) {
      this.handleError(error as Error, '开发服务器启动失败')
      throw error
    }
  }

  /**
   * 停止开发服务器
   */
  async stopDev(): Promise<void> {
    try {
      if (!this.devServer) {
        this.logger.warn('开发服务器未运行')
        return
      }

      this.setStatus(LauncherStatus.STOPPING)

      this.logger.info('正在停止开发服务器...')

      // 执行关闭前钩子
      await this.executeHook('beforeClose')

      // 关闭服务器
      await this.devServer.close()
      this.devServer = null

      // 设置状态
      this.setStatus(LauncherStatus.STOPPED)

      // 执行关闭后钩子
      await this.executeHook('afterClose')

      this.logger.success('开发服务器已停止')

    } catch (error) {
      this.handleError(error as Error, '停止开发服务器失败')
      throw error
    }
  }

  /**
   * 重启开发服务器
   */
  async restartDev(): Promise<void> {
    try {
      this.logger.info('正在重启开发服务器...')

      // 保存当前配置
      const currentConfig = { ...this.config }

      // 停止服务器
      await this.stopDev()

      // 重新启动
      await this.startDev(currentConfig)

      this.logger.success('开发服务器重启完成')

    } catch (error) {
      this.handleError(error as Error, '重启开发服务器失败')
      throw error
    }
  }

  /**
   * 执行生产构建
   * 
   * @param config - 可选的配置覆盖
   * @returns 构建结果
   */
  async build(config?: ViteLauncherConfig): Promise<RollupOutput> {
    try {
      // 确保已初始化（加载配置文件）
      await this.initialize()

      this.setStatus(LauncherStatus.BUILDING)
      const buildStartTime = Date.now()

      // 合并配置
      let mergedConfig = config ? this.mergeConfig(this.config, config) : this.config

      // 添加智能检测的插件
      mergedConfig = await this.enhanceConfigWithSmartPlugins(mergedConfig)

      // 执行构建前钩子
      await this.executeHook('beforeBuild')

      // 调试：输出最终插件列表
      try {
        const names = (mergedConfig.plugins || [])
          .map((p: any) => (p && typeof p === 'object' && 'name' in p) ? (p as any).name : String(p))
        this.logger.info('已加载插件', { count: names.length, plugins: names })
      } catch {}

      this.logger.info('正在执行生产构建...')

      // 触发构建开始事件
      this.emit(LauncherEvent.BUILD_START, {
        config: mergedConfig,
        timestamp: Date.now()
      } as LauncherEventData[LauncherEvent.BUILD_START])

      // 动态导入 Vite
      const { build } = await import('vite')

      // 执行构建
      const result = await build(mergedConfig) as RollupOutput

      // 更新统计信息
      this.updateStats('build', Date.now() - buildStartTime)

      // 设置状态
      this.setStatus(LauncherStatus.IDLE)

      // 执行构建后钩子
      await this.executeHook('afterBuild')

      // 触发构建完成事件
      this.emit(LauncherEvent.BUILD_END, {
        result,
        duration: Date.now() - buildStartTime,
        timestamp: Date.now()
      } as LauncherEventData[LauncherEvent.BUILD_END])

      this.logger.success('生产构建完成', {
        duration: Date.now() - buildStartTime,
        count: Array.isArray(result.output) ? result.output.length : 0
      })

      return result

    } catch (error) {
      this.handleError(error as Error, '生产构建失败')
      throw error
    }
  }

  /**
   * 启动监听模式构建
   * 
   * @param config - 可选的配置覆盖
   * @returns 构建监听器
   */
  async buildWatch(config?: ViteLauncherConfig): Promise<RollupWatcher> {
    try {
      // 合并配置，启用监听模式
      const mergedConfig = config ? this.mergeConfig(this.config, config) : this.config
      if (mergedConfig.build) {
        mergedConfig.build.watch = {}
      }

      this.logger.info('正在启动监听模式构建...')

      // 动态导入 Vite
      const { build } = await import('vite')

      // 执行监听构建
      this.buildWatcher = await build(mergedConfig) as RollupWatcher

      this.logger.success('监听模式构建已启动')

      return this.buildWatcher

    } catch (error) {
      this.handleError(error as Error, '启动监听模式构建失败')
      throw error
    }
  }

  /**
   * 启动预览服务器
   *
   * @param config - 可选的配置覆盖
   * @returns 预览服务器实例
   */
  async preview(config?: ViteLauncherConfig): Promise<PreviewServer> {
    try {
      // 确保已初始化（加载配置文件）
      await this.initialize()

      this.setStatus(LauncherStatus.PREVIEWING)

      // 合并配置
      const mergedConfig = config ? this.mergeConfig(this.config, config) : this.config

      // 执行预览前钩子
      await this.executeHook('beforePreview')

      this.logger.info('正在启动预览服务器...', {
        host: mergedConfig.preview?.host || DEFAULT_HOST,
        port: mergedConfig.preview?.port || 4173
      })

      // 动态导入 Vite
      const { preview } = await import('vite')

      // 创建预览服务器
      this.previewServer = await preview(mergedConfig)

      // 执行预览后钩子
      await this.executeHook('afterPreview')

      this.logger.success('预览服务器启动成功', {
        url: this.getPreviewServerUrl(this.previewServer)
      })

      return this.previewServer

    } catch (error) {
      this.handleError(error as Error, '预览服务器启动失败')
      throw error
    }
  }

  /**
   * 合并配置
   *
   * @param base - 基础配置
   * @param override - 覆盖配置
   * @returns 合并后的配置
   */
  mergeConfig(base: ViteLauncherConfig, override: ViteLauncherConfig): ViteLauncherConfig {
    // 检查参数有效性
    if (!base) base = {}
    if (!override) return base

    // 简单的深度合并实现
    const deepMerge = (target: any, source: any): any => {
      if (!target) target = {}
      if (!source) return target

      const result = { ...target }

      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = deepMerge(target[key] || {}, source[key])
        } else {
          result[key] = source[key]
        }
      }

      return result
    }

    return deepMerge(base, override)
  }

  /**
   * 验证配置
   *
   * @param config - 要验证的配置
   * @returns 验证结果
   */
  validateConfig(config: ViteLauncherConfig): import('../types').ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 验证基本配置
      if (config.server?.port && (config.server.port < 1 || config.server.port > 65535)) {
        errors.push('服务器端口号必须在 1-65535 范围内')
      }

      if (config.preview?.port && (config.preview.port < 1 || config.preview.port > 65535)) {
        errors.push('预览服务器端口号必须在 1-65535 范围内')
      }

      // 验证构建配置
      if (config.build?.outDir && !PathUtils.isAbsolute(config.build.outDir)) {
        // 相对路径是允许的，但给出警告
        warnings.push('建议使用绝对路径作为输出目录')
      }

      // 验证 launcher 特有配置
      if (config.launcher?.logLevel && !['silent', 'error', 'warn', 'info', 'debug'].includes(config.launcher.logLevel)) {
        errors.push('日志级别必须是 silent、error、warn、info 或 debug 之一')
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      }

    } catch (error) {
      return {
        valid: false,
        errors: [`配置验证过程中发生错误: ${(error as Error).message}`],
        warnings
      }
    }
  }

  /**
   * 加载配置文件
   *
   * @param configPath - 配置文件路径
   * @returns 加载的配置
   */
  async loadConfig(configPath?: string): Promise<ViteLauncherConfig> {
    try {
      if (configPath) {
        // 加载指定的配置文件
        const configExists = await FileSystem.exists(configPath)
        if (!configExists) {
          throw new Error(`配置文件不存在: ${configPath}`)
        }

        this.logger.info('正在加载配置文件', { path: configPath })

        // 使用配置管理器加载
        const loadedConfig = await this.configManager.loadConfig(configPath)

        // 合并到当前配置
        this.config = this.mergeConfig(this.config, loadedConfig)

        // 验证配置
        const validation = this.validateConfig(this.config)
        if (!validation.valid) {
          this.logger.warn('配置验证失败', { errors: validation.errors })
        }

        if (validation.warnings.length > 0) {
          this.logger.warn('配置警告', { warnings: validation.warnings })
        }

        this.logger.success('配置文件加载成功', { path: configPath })

        return this.config
      } else {
        // 自动查找配置文件
        return await this.autoLoadConfig()
      }

    } catch (error) {
      this.handleError(error as Error, '加载配置文件失败')
      throw error
    }
  }

  /**
   * 添加插件
   *
   * @param plugin - 要添加的插件
   */
  addPlugin(plugin: Plugin): void {
    try {
      // 检查插件是否已存在
      const existingIndex = this.plugins.findIndex(p => p.name === plugin.name)

      if (existingIndex >= 0) {
        this.logger.warn('插件已存在，将被替换', { name: plugin.name })
        this.plugins[existingIndex] = plugin
      } else {
        this.plugins.push(plugin)
        this.logger.info('插件已添加', { name: plugin.name })
      }

      // 更新配置中的插件列表
      if (!this.config.plugins) {
        this.config.plugins = []
      }

      // 确保插件在配置中
      const configPluginIndex = this.config.plugins.findIndex(p =>
        p && typeof p === 'object' && 'name' in p && p.name === plugin.name
      )
      if (configPluginIndex >= 0) {
        this.config.plugins[configPluginIndex] = plugin
      } else {
        this.config.plugins.push(plugin)
      }

    } catch (error) {
      this.handleError(error as Error, '添加插件失败')
    }
  }

  /**
   * 移除插件
   *
   * @param pluginName - 要移除的插件名称
   */
  removePlugin(pluginName: string): void {
    try {
      const index = this.plugins.findIndex(p => p.name === pluginName)

      if (index >= 0) {
        this.plugins.splice(index, 1)
        this.logger.info('插件已移除', { name: pluginName })

        // 从配置中移除
        if (this.config.plugins) {
          const configIndex = this.config.plugins.findIndex(p =>
            p && typeof p === 'object' && 'name' in p && p.name === pluginName
          )
          if (configIndex >= 0) {
            this.config.plugins.splice(configIndex, 1)
          }
        }
      } else {
        this.logger.warn('插件不存在', { name: pluginName })
      }

    } catch (error) {
      this.handleError(error as Error, '移除插件失败')
    }
  }

  /**
   * 获取插件列表
   *
   * @returns 插件列表
   */
  getPlugins(): Plugin[] {
    return [...this.plugins]
  }

  /**
   * 注册生命周期钩子 - 就绪回调
   *
   * @param callback - 回调函数
   */
  onReady(callback: () => void): void {
    this.on('ready', callback)
  }

  /**
   * 注册生命周期钩子 - 错误回调
   *
   * @param callback - 错误处理回调
   */
  onError(callback: (error: Error) => void): void {
    this.on('error', callback)
  }

  /**
   * 注册生命周期钩子 - 关闭回调
   *
   * @param callback - 关闭回调
   */
  onClose(callback: () => void): void {
    this.on('close', callback)
  }

  /**
   * 获取当前状态
   *
   * @returns 当前状态
   */
  getStatus(): LauncherStatus {
    return this.status
  }

  /**
   * 检查是否正在运行
   *
   * @returns 是否正在运行
   */
  isRunning(): boolean {
    return this.status === LauncherStatus.RUNNING ||
      this.status === LauncherStatus.BUILDING ||
      this.status === LauncherStatus.PREVIEWING
  }

  /**
   * 获取当前配置
   *
   * @returns 当前配置
   */
  getConfig(): ViteLauncherConfig {
    return { ...this.config }
  }

  /**
   * 获取统计信息
   *
   * @returns 统计信息
   */
  getStats(): LauncherStats {
    return { ...this.stats }
  }

  /**
   * 获取性能指标
   *
   * @returns 性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  /**
   * 获取服务器信息
   *
   * @returns 服务器信息
   */
  getServerInfo(): ServerInfo | null {
    if (!this.devServer) {
      return null
    }

    return {
      type: ServerType.DEV,
      status: this.status as any, // 临时类型转换
      instance: this.devServer,
      config: {
        type: ServerType.DEV,
        host: typeof this.config.server?.host === 'string' ? this.config.server.host : DEFAULT_HOST,
        port: this.config.server?.port || DEFAULT_PORT,
        https: typeof this.config.server?.https === 'boolean' ? this.config.server.https : false
      },
      url: this.getServerUrl(this.devServer),
      host: typeof this.config.server?.host === 'string' ? this.config.server.host : DEFAULT_HOST,
      port: this.config.server?.port || DEFAULT_PORT,
      https: typeof this.config.server?.https === 'boolean' ? this.config.server.https : false,
      startTime: this.startTime
    }
  }

  /**
   * 设置状态
   *
   * @param newStatus - 新状态
   */
  private setStatus(newStatus: LauncherStatus): void {
    const oldStatus = this.status
    this.status = newStatus

    // 更新最后活动时间
    this.stats.lastActivity = Date.now()

    // 触发状态变更事件
    this.emit(LauncherEvent.STATUS_CHANGE, {
      from: oldStatus,
      to: newStatus,
      timestamp: Date.now()
    } as LauncherEventData[LauncherEvent.STATUS_CHANGE])

    this.logger.debug('状态变更', { from: oldStatus, to: newStatus })
  }

  /**
   * 执行生命周期钩子
   *
   * @param hookName - 钩子名称
   */
  private async executeHook(hookName: keyof LauncherHooks): Promise<void> {
    try {
      const hook = this.config.launcher?.hooks?.[hookName]
      if (hook && typeof hook === 'function') {
        await Promise.resolve((hook as () => void | Promise<void>)())
        this.logger.debug('生命周期钩子执行完成', { hook: hookName })
      }
    } catch (error) {
      this.logger.error('生命周期钩子执行失败', {
        hook: hookName,
        error: (error as Error).message
      })
      // 钩子执行失败不应该阻止主流程
    }
  }

  /**
   * 处理错误
   *
   * @param error - 错误对象
   * @param context - 错误上下文
   */
  private handleError(error: Error, context: string): void {
    // 更新错误统计
    this.stats.errorCount++

    // 设置错误状态
    this.setStatus(LauncherStatus.ERROR)

    // 记录错误日志
    this.logger.error(context, {
      error: error.message,
      stack: error.stack
    })

    // 使用错误处理器处理
    this.errorHandler.handle(error, { operation: context })

    // 触发错误事件
    this.emit(LauncherEvent.ERROR, {
      error,
      context,
      timestamp: Date.now()
    } as LauncherEventData[LauncherEvent.ERROR])

    // 执行错误钩子
    this.executeHook('onError')
  }

  /**
   * 更新统计信息
   *
   * @param operation - 操作类型
   * @param duration - 持续时间（可选）
   */
  private updateStats(operation: 'start' | 'build', duration?: number): void {
    switch (operation) {
      case 'start':
        this.stats.startCount++
        if (duration) {
          this.stats.averageStartTime =
            (this.stats.averageStartTime * (this.stats.startCount - 1) + duration) / this.stats.startCount
        }
        break

      case 'build':
        this.stats.buildCount++
        if (duration) {
          this.stats.averageBuildTime =
            (this.stats.averageBuildTime * (this.stats.buildCount - 1) + duration) / this.stats.buildCount
        }
        break
    }

    this.stats.lastActivity = Date.now()
  }

  /**
   * 设置事件监听器
   *
   * @param listeners - 事件监听器映射
   */
  private setupEventListeners(listeners?: Partial<{
    [K in LauncherEvent]: (data: LauncherEventData[K]) => void
  }>): void {
    if (!listeners) return

    // 注册所有提供的监听器
    Object.entries(listeners).forEach(([event, listener]) => {
      if (listener) {
        this.on(event, listener)
      }
    })
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    // 测试环境下避免重复注册全局监听器导致的内存告警
    if (process.env.NODE_ENV === 'test') return

    // 监听未捕获的异常
    process.on('uncaughtException', (error) => {
      this.handleError(error, '未捕获的异常')
    })

    // 监听未处理的 Promise 拒绝
    process.on('unhandledRejection', (reason) => {
      const error = reason instanceof Error ? reason : new Error(String(reason))
      this.handleError(error, '未处理的 Promise 拒绝')
    })
  }

  /**
   * 自动加载配置文件
   *
   * @returns 加载的配置
   */
  private async autoLoadConfig(): Promise<ViteLauncherConfig> {
    const { DEFAULT_CONFIG_FILES } = await import('../constants')

    for (const configFile of DEFAULT_CONFIG_FILES) {
      const configPath = PathUtils.resolve(this.cwd, configFile)

      if (await FileSystem.exists(configPath)) {
        this.logger.info('找到配置文件', { path: configPath })

        // 直接加载配置文件，避免递归调用
        const loadedConfig = await this.configManager.loadConfig(configPath)

        // 合并到当前配置
        this.config = this.mergeConfig(this.config, loadedConfig)

        this.logger.success('配置文件加载成功', { path: configPath })
        return this.config
      }
    }

    this.logger.info('未找到配置文件，使用默认配置')
    return this.config
  }

  /**
   * 获取服务器 URL
   *
   * @param server - 服务器实例
   * @returns 服务器 URL
   */
  private getServerUrl(server: ViteDevServer): string {
    try {
      if (server.resolvedUrls?.local?.[0]) {
        return server.resolvedUrls.local[0]
      }

      // 回退到手动构建 URL
      const host = this.config.server?.host || DEFAULT_HOST
      const port = this.config.server?.port || DEFAULT_PORT
      const protocol = this.config.server?.https ? 'https' : 'http'

      return `${protocol}://${host}:${port}`
    } catch (error) {
      this.logger.warn('获取服务器 URL 失败', { error: (error as Error).message })
      return 'http://localhost:3000'
    }
  }

  /**
   * 获取预览服务器 URL
   *
   * @param server - 预览服务器实例
   * @returns 预览服务器 URL
   */
  private getPreviewServerUrl(server: PreviewServer): string {
    try {
      if (server.resolvedUrls?.local?.[0]) {
        return server.resolvedUrls.local[0]
      }

      // 回退到手动构建 URL
      const host = this.config.preview?.host || DEFAULT_HOST
      const port = this.config.preview?.port || 4173
      const protocol = this.config.preview?.https ? 'https' : 'http'

      return `${protocol}://${host}:${port}`
    } catch (error) {
      this.logger.warn('获取预览服务器 URL 失败', { error: (error as Error).message })
      return 'http://localhost:4173'
    }
  }

  /**
   * 销毁实例
   * 清理资源和事件监听器
   */
  async destroy(): Promise<void> {
    try {
      this.logger.info('正在销毁 ViteLauncher 实例...')

      // 停止所有服务
      if (this.devServer) {
        await this.stopDev()
      }

      if (this.buildWatcher) {
        this.buildWatcher.close()
        this.buildWatcher = null
      }

      if (this.previewServer) {
        await this.previewServer.close()
        this.previewServer = null
      }

      // 移除所有事件监听器
      this.removeAllListeners()

      // 清理配置管理器
      if (this.configManager) {
        this.configManager.removeAllListeners()
      }

      this.setStatus(LauncherStatus.STOPPED)

      this.logger.success('ViteLauncher 实例已销毁')

    } catch (error) {
      this.handleError(error as Error, '销毁实例失败')
      throw error
    }
  }

  /**
   * 使用智能插件增强配置
   *
   * @param config - 原始配置
   * @returns 增强后的配置
   */
  private async enhanceConfigWithSmartPlugins(config: ViteLauncherConfig): Promise<ViteLauncherConfig> {
    try {
      // 获取智能检测的插件
      const smartPlugins = await this.smartPluginManager.getRecommendedPlugins()

      if (smartPlugins.length > 0) {
        // 合并用户配置的插件和智能检测的插件（按名称去重，避免重复注册）
        const userPluginsRaw = config.plugins || []

        // 将可能的嵌套数组拍平
        const flatten = (arr: any[]): any[] => arr.flat ? arr.flat(Infinity) : ([] as any[]).concat(...arr)
        const userPlugins = Array.isArray(userPluginsRaw) ? flatten(userPluginsRaw) : [userPluginsRaw]
        const smartFlat = Array.isArray(smartPlugins) ? flatten(smartPlugins) : [smartPlugins]

        const exists = new Set<string>(
          userPlugins
            .filter((p: any) => p && typeof p === 'object' && 'name' in p)
            .map((p: any) => p.name as string)
        )

        const merged: any[] = [...userPlugins]
        for (const p of smartFlat) {
          const name = p && typeof p === 'object' && 'name' in p ? (p as any).name as string : undefined
          if (!name || !exists.has(name)) {
            merged.unshift(p) // 智能插件优先，但不覆盖用户已显式配置的插件
            if (name) exists.add(name)
          }
        }

        this.logger.debug('智能插件增强完成', {
          smartPlugins: smartFlat.length,
          userPlugins: userPlugins.length,
          total: merged.length
        })

        return {
          ...config,
          plugins: merged
        }
      }

      return config
    } catch (error) {
      this.logger.warn('智能插件增强失败', { error: (error as Error).message })
      return config
    }
  }
}
