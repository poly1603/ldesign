import type { InlineConfig, ViteDevServer } from 'vite'
import type {
  BuildOptions,
  BuildResult,
  DevOptions,
  IViteLauncher,
  LauncherOptions,
  LogLevel,
  PreviewOptions,
  ProjectInfo,
  ProjectType,
  RunMode,
} from '@/types'
import path from 'node:path'
import process from 'node:process'
import { build, createServer, preview } from 'vite'
import { ERROR_CODES } from '@/types'
import { ConfigManager, ErrorHandler, PluginManager, ProjectDetector } from '../services'
import { ProjectGenerator, type ProjectGenerationOptions } from './ProjectGenerator'
import { BuildAnalyzer } from './BuildAnalyzer'
import { FileUtils, LoggerUtils } from '@/utils'

/**
 * Vite 前端项目启动器核心类
 * 提供项目创建、开发、构建和预览功能
 * 
 * @author Vite Launcher Team
 * @version 1.0.0
 */
export class ViteLauncher implements IViteLauncher {
  private errorHandler: ErrorHandler
  private projectDetector: ProjectDetector
  private configManager: ConfigManager
  private pluginManager: PluginManager
  private projectGenerator: ProjectGenerator
  private buildAnalyzer: BuildAnalyzer
  private currentServer?: ViteDevServer | null
  private config?: InlineConfig
  private projectType?: ProjectType
  private options: LauncherOptions
  private isDestroyed = false

  constructor(options: LauncherOptions = {}) {
    this.options = {
      logLevel: 'info',
      mode: 'development',
      autoDetect: true,
      ...options,
    }

    // 初始化服务模块
    this.errorHandler = new ErrorHandler()
    this.projectDetector = new ProjectDetector()
    this.configManager = new ConfigManager()
    this.pluginManager = new PluginManager()
    this.projectGenerator = new ProjectGenerator()
    this.buildAnalyzer = new BuildAnalyzer()

    this.log('ViteLauncher 初始化完成', 'info')
  }

  /**
   * 创建新项目
   * @param projectPath 项目路径
   * @param projectType 项目类型
   * @param options 创建选项
   */
  async create(
    projectPath: string,
    projectType: ProjectType,
    options: { template?: string, force?: boolean } = {},
  ): Promise<void> {
    this.checkDestroyed()

    try {
      this.log(`开始创建 ${projectType} 项目: ${projectPath}`, 'info')

      const generationOptions: ProjectGenerationOptions = {
        template: options.template,
        force: options.force,
        installDeps: true,
        projectName: path.basename(path.resolve(projectPath))
      }

      await this.projectGenerator.generateProject(projectPath, projectType, generationOptions)

      this.log(`项目创建完成: ${path.resolve(projectPath)}`, 'info')
      this.log('运行以下命令开始开发:', 'info')
      this.log(`  cd ${path.relative(process.cwd(), path.resolve(projectPath))}`, 'info')
      this.log('  npm run dev', 'info')
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'create project',
      )
      throw launcherError
    }
  }

  /**
   * 启动开发服务器
   * @param projectPath 项目路径
   * @param options 开发选项
   * @returns 开发服务器实例
   */
  async dev(
    projectPath: string = process.cwd(),
    options: DevOptions = {},
  ): Promise<ViteDevServer> {
    this.checkDestroyed()

    try {
      this.log('启动开发服务器...', 'info')

      const absolutePath = path.resolve(projectPath)

      // 检测项目类型
      const detection = await this.projectDetector.detectProjectType(absolutePath)
      if (detection.projectType === 'unknown') {
        this.log('检测到非 Vite 项目，将使用默认配置', 'warn')
      }

      // 生成 Vite 配置
      const viteConfig = await this.generateViteConfig(absolutePath, detection.projectType, 'development', options)

      // 创建开发服务器
      this.currentServer = await createServer(viteConfig)

      // 启动服务器
      await this.currentServer.listen()

      // Logger info available if needed
      const port = this.currentServer.config.server?.port || 5173
      const host = this.currentServer.config.server?.host || 'localhost'

      this.log(`开发服务器已启动:`, 'info')
      this.log(`  本地地址: http://${host}:${port}`, 'info')
      this.log(`  网络地址: http://localhost:${port}`, 'info')

      return this.currentServer
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'start dev server',
      )
      throw launcherError
    }
  }

  /**
   * 构建项目
   * @param projectPath 项目路径
   * @param options 构建选项
   * @returns 构建结果
   */
  async build(
    projectPath: string = process.cwd(),
    options: BuildOptions = {},
  ): Promise<BuildResult> {
    this.checkDestroyed()

    try {
      this.log('开始构建项目...', 'info')

      const absolutePath = path.resolve(projectPath)
      const startTime = Date.now()

      // 检测项目类型
      const detection = await this.projectDetector.detectProjectType(absolutePath)

      // 生成 Vite 配置
      const viteConfig = await this.generateViteConfig(absolutePath, detection.projectType, 'production', options)

      // 执行构建
      await build(viteConfig)

      const endTime = Date.now()
      const duration = endTime - startTime

      // 分析构建结果
      const outputDir = viteConfig.build?.outDir || 'dist'
      const outputPath = path.resolve(absolutePath, outputDir)
      
      let analysisResult
      let stats
      try {
        analysisResult = await this.buildAnalyzer.analyzeBuildOutput(outputPath, {
          detailed: true,
          generateReport: false
        })
        stats = analysisResult.stats
        
        // 输出分析结果
        this.log('构建分析结果:', 'info')
        console.log(this.buildAnalyzer.formatAnalysisResult(analysisResult))
      } catch (analysisError) {
        this.log(`构建分析失败: ${(analysisError as Error).message}`, 'warn')
        stats = { entryCount: 0, moduleCount: 0, assetCount: 0, chunkCount: 0 }
      }

      const result: BuildResult = {
        success: true,
        outputFiles: [outputPath],
        duration,
        size: analysisResult?.totalSize || 0,
        stats,
      }

      this.log(`构建完成! 耗时: ${duration}ms`, 'info')
      this.log(`输出目录: ${outputPath}`, 'info')

      return result
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'build project',
      )

      return {
        success: false,
        outputFiles: [],
        duration: 0,
        size: 0,
        errors: [launcherError?.message || '构建失败'],
        stats: { entryCount: 0, moduleCount: 0, assetCount: 0, chunkCount: 0 },
      }
    }
  }

  /**
   * 预览构建结果
   * @param projectPath 项目路径
   * @param options 预览选项
   * @returns 预览服务器实例
   */
  async preview(
    projectPath: string = process.cwd(),
    options: PreviewOptions = {},
  ): Promise<ViteDevServer> {
    this.checkDestroyed()

    try {
      this.log('启动预览服务器...', 'info')

      const absolutePath = path.resolve(projectPath)

      // 检查构建输出是否存在
      const outputDir = options.outDir || 'dist'
      const outputPath = path.resolve(absolutePath, outputDir)

      if (!(await FileUtils.exists(outputPath))) {
        throw ErrorHandler.createError(
          ERROR_CODES.BUILD_OUTPUT_NOT_FOUND,
          `构建输出目录不存在: ${outputPath}。请先运行构建命令。`,
        )
      }

      // 检测项目类型
      const detection = await this.projectDetector.detectProjectType(absolutePath)

      // 生成 Vite 配置
      const viteConfig = await this.generateViteConfig(absolutePath, detection.projectType, 'production', options)

      // 启动预览服务器
      const previewServer = await preview(viteConfig)

      const port = options.port || 4173
      const host = options.host || 'localhost'

      this.log(`预览服务器已启动:`, 'info')
      this.log(`  本地地址: http://${host}:${port}`, 'info')
      this.log(`  预览目录: ${outputPath}`, 'info')

      return previewServer as ViteDevServer
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'start preview server',
      )
      throw launcherError
    }
  }

  /**
   * 停止当前服务器
   */
  async stop(): Promise<void> {
    if (this.currentServer) {
      await this.currentServer.close()
      this.currentServer = null
      this.log('服务器已停止', 'info')
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): InlineConfig {
    return this.config || {}
  }

  /**
   * 获取项目类型信息
   */
  getProjectType(): ProjectType {
    return this.projectType || 'unknown'
  }

  /**
   * 更新配置
   */
  configure(config: Partial<InlineConfig>): void {
    this.config = this.configManager.mergeConfig(this.config || {}, config)
    this.log('配置已更新', 'info')
  }

  /**
   * 销毁实例
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed)
      return

    await this.stop()
    this.currentServer = null
    this.isDestroyed = true
    this.log('ViteLauncher 实例已销毁', 'info')
  }

  /**
   * 获取项目信息
   * @param projectPath 项目路径
   * @returns 项目信息
   */
  async getProjectInfo(projectPath: string = process.cwd()): Promise<ProjectInfo> {
    this.checkDestroyed()

    try {
      const absolutePath = path.resolve(projectPath)
      const detection = await this.projectDetector.detectProjectType(absolutePath)

      return {
        framework: detection.framework,
        typescript: detection.report.detectedFiles.some((file: string) => file.endsWith('.ts') || file.endsWith('.tsx')),
        dependencies: Object.keys(detection.report.dependencies || {}),
        confidence: detection.confidence,
      }
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'get project info',
      )
      throw launcherError
    }
  }

  /**
   * 生成 Vite 配置
   */
  private async generateViteConfig(
    projectPath: string,
    projectType: ProjectType,
    mode: RunMode,
    options: any = {},
  ): Promise<InlineConfig> {
    // 获取预设配置
    const presetConfig = await this.configManager.loadPreset(projectType)

    // 加载项目配置
    const projectConfig = await this.configManager.loadProjectConfig(projectPath)

    // 获取推荐插件
    const plugins = await this.pluginManager.createPluginsForProject(projectType)

    // 合并配置
    const baseConfig: InlineConfig = {
      root: projectPath,
      mode,
      logLevel: this.options.logLevel || 'info',
      plugins,
      ...presetConfig.config,
    }

    // 根据模式调整配置
    if (mode === 'development') {
      baseConfig.server = {
        port: options.port || 5173,
        host: options.host || 'localhost',
        open: options.open || false,
        ...baseConfig.server,
      }
    }
    else if (mode === 'production') {
      baseConfig.build = {
        outDir: options.outDir || 'dist',
        sourcemap: options.sourcemap || false,
        minify: options.minify !== false,
        ...baseConfig.build,
      }
    }

    // 合并项目配置
    const finalConfig = this.configManager.mergeConfig(baseConfig, projectConfig)

    return finalConfig
  }

  /**
   * 检查实例是否已销毁
   */
  private checkDestroyed(): void {
    if (this.isDestroyed) {
      throw new Error('ViteLauncher 实例已销毁，无法执行操作')
    }
  }

  /**
   * 记录日志
   */
  private log(message: string, level: LogLevel = 'info'): void {
    if (this.options.logLevel === 'silent')
      return

    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      silent: 3,
    }

    if (levels[level] <= levels[this.options.logLevel || 'info']) {
      switch (level) {
        case 'error':
          LoggerUtils.error(message, 'ViteLauncher')
          break
        case 'warn':
          LoggerUtils.warn(message, 'ViteLauncher')
          break
        case 'info':
        default:
          LoggerUtils.info(message, 'ViteLauncher')
          break
      }
    }
  }
}
