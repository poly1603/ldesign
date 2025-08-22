import type { InlineConfig, ViteDevServer } from 'vite'
import type {
  BuildOptions,
  BuildResult,
  BuildStats,
  DevOptions,
  IViteLauncher,
  LauncherOptions,
  LogLevel,
  PreviewOptions,
  ProjectInfo,
  ProjectType,
  RunMode,
} from '@/types'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { build, createServer, preview } from 'vite'
import { ERROR_CODES } from '@/types'
import { ConfigManager, ErrorHandler, PluginManager, ProjectDetector } from '../services'
import { DEFAULT_CONFIG } from '@/constants'

/**
 * Vite 前端项目启动器核心类
 * 提供项目创建、开发、构建和预览功能
 */
export class ViteLauncher implements IViteLauncher {
  private errorHandler: ErrorHandler
  private projectDetector: ProjectDetector
  private configManager: ConfigManager
  private pluginManager: PluginManager
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

    this.errorHandler = new ErrorHandler()
    this.projectDetector = new ProjectDetector()
    this.configManager = new ConfigManager()
    this.pluginManager = new PluginManager()

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

      const absolutePath = path.resolve(projectPath)

      // 检查目录是否存在
      const exists = await this.checkDirectoryExists(absolutePath)
      if (exists && !options.force) {
        const files = await fs.readdir(absolutePath)
        if (files.length > 0) {
          throw ErrorHandler.createError(
            ERROR_CODES.INVALID_PROJECT_ROOT,
            `目录 ${absolutePath} 不为空。使用 force: true 选项覆盖。`,
          )
        }
      }

      // 创建目录
      await fs.mkdir(absolutePath, { recursive: true })

      // 生成项目文件
      await this.generateProjectFiles(absolutePath, projectType, options.template)

      // 安装依赖
      await this.installDependencies(absolutePath)

      this.log(`项目创建完成: ${absolutePath}`, 'info')
      this.log('运行以下命令开始开发:', 'info')
      this.log(`  cd ${path.relative(process.cwd(), absolutePath)}`, 'info')
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
      const detection = await this.projectDetector.detect(absolutePath)
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
      const stats = await this.analyzeBuildOutput(outputPath)

      const result: BuildResult = {
        success: true,
        outputFiles: [outputPath],
        duration,
        size: 0, // 可以后续计算总大小
        stats,
      }

      this.log(`构建完成! 耗时: ${duration}ms`, 'info')
      this.log(`输出目录: ${outputPath}`, 'info')
      this.log(`入口文件数: ${stats.entryCount}`, 'info')
      this.log(`模块数量: ${stats.moduleCount}`, 'info')
      this.log(`资源文件数: ${stats.assetCount}`, 'info')
      this.log(`代码块数: ${stats.chunkCount}`, 'info')

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

      const exists = await this.checkDirectoryExists(outputPath)
      if (!exists) {
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
    options: DevOptions | BuildOptions | PreviewOptions = {},
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
      const devOptions = options as DevOptions
      baseConfig.server = {
        port: devOptions.port || DEFAULT_CONFIG.DEV_PORT,
        host: devOptions.host || 'localhost',
        open: devOptions.open || false,
        ...baseConfig.server,
      }
    }
    else if (mode === 'production') {
      const buildOptions = options as BuildOptions
      baseConfig.build = {
        outDir: buildOptions.outDir || DEFAULT_CONFIG.OUTPUT_DIR,
        sourcemap: buildOptions.sourcemap || false,
        minify: buildOptions.minify !== false,
        ...baseConfig.build,
      }
    }

    // 合并项目配置
    const finalConfig = this.configManager.mergeConfig(baseConfig, projectConfig)

    return finalConfig
  }

  /**
   * 生成项目文件
   */
  private async generateProjectFiles(
    projectPath: string,
    projectType: ProjectType,
    _template?: string,
  ): Promise<void> {
    // 生成 package.json
    const packageJson = this.generatePackageJson(projectType)
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2),
    )

    // 生成 index.html
    const indexHtml = this.generateIndexHtml(projectType)
    await fs.writeFile(path.join(projectPath, 'index.html'), indexHtml)

    // 生成 Vite 配置文件
    const viteConfig = this.configManager.generateConfigFile(projectType, {
      typescript: projectType.includes('ts'),
      plugins: requiredPlugins.map(p => p.name),
    })
    await fs.writeFile(path.join(projectPath, 'vite.config.ts'), viteConfig)

    // 创建 src 目录和基础文件
    const srcDir = path.join(projectPath, 'src')
    await fs.mkdir(srcDir, { recursive: true })

    // 根据项目类型生成不同的入口文件
    await this.generateEntryFiles(srcDir, projectType)
  }

  /**
   * 生成 package.json
   */
  private generatePackageJson(projectType: ProjectType) {
    const basePackage = {
      name: 'vite-project',
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      devDependencies: {
        vite: '^5.0.0',
      } as Record<string, string>,
    }

    // 根据项目类型添加特定依赖
    const requiredPlugins = this.pluginManager.getRequiredPlugins(projectType)
    for (const plugin of requiredPlugins) {
      basePackage.devDependencies[plugin.name] = plugin.version
    }

    // 添加框架特定的依赖
    switch (projectType) {
      case 'vue3':
        Object.assign(basePackage, {
          dependencies: { vue: '^3.3.0' },
          devDependencies: { ...basePackage.devDependencies, '@vitejs/plugin-vue': '^5.0.0' },
        })
        break
      case 'vue2':
        Object.assign(basePackage, {
          dependencies: { vue: '^2.7.0' },
          devDependencies: { ...basePackage.devDependencies, '@vitejs/plugin-vue2': '^2.3.0' },
        })
        break
      case 'react':
        Object.assign(basePackage, {
          dependencies: { 'react': '^18.2.0', 'react-dom': '^18.2.0' },
          devDependencies: {
            ...basePackage.devDependencies,
            '@vitejs/plugin-react': '^4.0.0',
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
          },
        })
        break
      case 'vanilla-ts':
        Object.assign(basePackage, {
          devDependencies: { ...basePackage.devDependencies, typescript: '^5.0.0' },
        })
        break
    }

    return basePackage
  }

  /**
   * 生成 index.html
   */
  private generateIndexHtml(projectType: ProjectType): string {
    const title = `Vite + ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}`

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.${projectType.includes('ts') ? 'ts' : 'js'}"></script>
  </body>
</html>`
  }

  /**
   * 生成入口文件
   */
  private async generateEntryFiles(srcDir: string, projectType: ProjectType): Promise<void> {
    switch (projectType) {
      case 'vue3':
        await fs.writeFile(path.join(srcDir, 'main.js'), `import { createApp } from 'vue'\nimport App from './App.vue'\n\ncreateApp(App).mount('#app')`)
        await fs.writeFile(path.join(srcDir, 'App.vue'), `<template>\n  <div>\n    <h1>Hello Vue 3!</h1>\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'App'\n}\n</script>`)
        break
      case 'react':
        await fs.writeFile(path.join(srcDir, 'main.jsx'), `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.jsx'\n\nReactDOM.createRoot(document.getElementById('app')).render(<App />)`)
        await fs.writeFile(path.join(srcDir, 'App.jsx'), `function App() {\n  return <h1>Hello React!</h1>\n}\n\nexport default App`)
        break
      case 'vanilla':
        await fs.writeFile(path.join(srcDir, 'main.js'), `document.querySelector('#app').innerHTML = '<h1>Hello Vite!</h1>'`)
        break
      case 'vanilla-ts':
        await fs.writeFile(path.join(srcDir, 'main.ts'), `const app = document.querySelector<HTMLDivElement>('#app')!\napp.innerHTML = '<h1>Hello Vite + TypeScript!</h1>'`)
        break
    }
  }

  /**
   * 安装依赖
   */
  private async installDependencies(_projectPath: string): Promise<void> {
    this.log('安装依赖...', 'info')

    // 这里可以根据检测到的包管理器执行安装命令
    // 为了简化，这里只是记录日志
    this.log('请手动运行 npm install 安装依赖', 'info')
  }

  /**
   * 检查目录是否存在
   */
  private async checkDirectoryExists(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dirPath)
      return stat.isDirectory()
    }
    catch {
      return false
    }
  }

  /**
   * 分析构建输出
   */
  private async analyzeBuildOutput(outputPath: string): Promise<BuildStats> {
    const stats: BuildStats = {
      entryCount: 0,
      moduleCount: 0,
      assetCount: 0,
      chunkCount: 0,
    }

    try {
      const files = await fs.readdir(outputPath, { recursive: true })

      for (const file of files) {
        const filePath = path.join(outputPath, file.toString())
        const stat = await fs.stat(filePath)

        if (stat.isFile()) {
          const fileName = file.toString()
          const ext = path.extname(fileName).slice(1)

          // 统计不同类型的文件
          if (fileName.includes('index') && (ext === 'js' || ext === 'ts')) {
            stats.entryCount++
          }
          if (ext === 'js' || ext === 'ts' || ext === 'jsx' || ext === 'tsx') {
            stats.moduleCount++
          }
          if (ext === 'css' || ext === 'png' || ext === 'jpg' || ext === 'svg' || ext === 'ico') {
            stats.assetCount++
          }
          if (fileName.includes('chunk') || fileName.includes('vendor')) {
            stats.chunkCount++
          }
        }
      }
    }
    catch (error) {
      this.log(`分析构建输出失败: ${(error as Error).message}`, 'warn')
    }

    return stats
  }

  /**
   * 格式化字节数
   */
  // formatBytes method removed as it's not currently used

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
      console.log(`[ViteLauncher] ${message}`)
    }
  }
}

/**
 * 默认启动器实例
 */
export const viteLauncher = new ViteLauncher()
