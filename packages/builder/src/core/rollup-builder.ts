/**
 * Rollup构建器
 * 执行多格式打包
 */

import type {
  BuildError,
  BuildOptions,
  BuildResult,
  BuildStats,
  BuildWarning,
  OutputFile,
  OutputFormat,
  PluginConfiguration,
  ProjectScanResult,
} from '../types'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import { type OutputOptions, rollup, type RollupBuild, type RollupOptions, type RollupWatcher, watch } from 'rollup'
import { Logger } from '../utils/logger'

const logger = new Logger('RollupBuilder')

export class RollupBuilder {
  private currentBuild: RollupBuild | null = null
  private currentWatcher: RollupWatcher | null = null

  /**
   * 构建项目
   */
  async build(
    scanResult: ProjectScanResult,
    pluginConfig: PluginConfiguration,
    buildOptions: BuildOptions,
  ): Promise<BuildResult> {
    logger.info('开始构建项目...')

    const startTime = Date.now()
    const errors: BuildError[] = []
    const warnings: BuildWarning[] = []
    const outputFiles: OutputFile[] = []

    try {
      // 清理输出目录
      if (buildOptions.clean !== false) {
        await this.cleanOutputDirs(buildOptions)
      }

      // 生成 Rollup 配置
      const rollupOptions = this.generateRollupOptions(
        scanResult,
        pluginConfig,
        buildOptions,
      )

      // 创建输出目录
      this.ensureOutputDir(buildOptions.outDir || 'dist')

      // 分离不同格式的构建
      const formats = (buildOptions.formats || ['esm', 'cjs']) as OutputFormat[]
      const moduleFormats = formats.filter(f => f === 'esm' || f === 'cjs')
      const bundleFormats = formats.filter(f => f === 'umd' || f === 'iife')
      const baseOutDir = buildOptions.outDir || 'dist'

      // 构建模块化格式（支持代码分割）
      if (moduleFormats.length > 0) {
        this.currentBuild = await rollup(rollupOptions)

        // 只为模块化格式生成输出配置
        for (const format of moduleFormats) {
          const formatDir = this.getFormatOutputDir(format, baseOutDir)
          const formatSpecificOptions = this.getFormatSpecificOptions(format, scanResult, buildOptions)
          const rollupFormat = this.mapToRollupFormat(format)
          const output: OutputOptions = {
            dir: formatDir,
            format: rollupFormat,
            sourcemap: buildOptions.sourcemap !== false,
            preserveModules: true,
            preserveModulesRoot: 'src',
            ...formatSpecificOptions,
          }

          logger.info(`生成 ${output.format} 格式文件...`)
          const { output: generatedFiles } = await this.currentBuild.write(output)

          // 收集输出文件信息
          for (const file of generatedFiles) {
            if (file.type === 'chunk') {
              outputFiles.push({
                path: resolve(formatDir, file.fileName),
                format: output.format as OutputFormat,
                size: file.code.length,
                gzipSize: this.calculateGzipSize(file.code),
                isEntry: file.isEntry,
              })
            }
            else if (file.type === 'asset') {
              outputFiles.push({
                path: resolve(formatDir, file.fileName),
                format: output.format as OutputFormat,
                size: typeof file.source === 'string' ? file.source.length : file.source.byteLength,
                gzipSize: this.calculateGzipSize(typeof file.source === 'string' ? file.source : file.source.toString()),
                isEntry: false,
              })
            }
          }
        }

        await this.currentBuild.close()
      }

      // 构建打包格式（不支持代码分割）
      if (bundleFormats.length > 0) {
        const bundleRollupOptions = this.generateBundleRollupOptions(scanResult, pluginConfig, buildOptions)
        this.currentBuild = await rollup(bundleRollupOptions)

        // 只为打包格式生成输出配置
        for (const format of bundleFormats) {
          const formatDir = this.getFormatOutputDir(format, baseOutDir)
          const formatSpecificOptions = this.getFormatSpecificOptions(format, scanResult, buildOptions)
          const rollupFormat = this.mapToRollupFormat(format)
          const output: OutputOptions = {
            dir: formatDir,
            format: rollupFormat,
            sourcemap: buildOptions.sourcemap !== false,
            preserveModules: false,
            ...formatSpecificOptions,
          }

          logger.info(`生成 ${output.format} 格式文件...`)
          const { output: generatedFiles } = await this.currentBuild.write(output)

          // 收集输出文件信息
          for (const file of generatedFiles) {
            if (file.type === 'chunk') {
              outputFiles.push({
                path: resolve(formatDir, file.fileName),
                format: output.format as OutputFormat,
                size: file.code.length,
                gzipSize: this.calculateGzipSize(file.code),
                isEntry: file.isEntry,
              })
            }
            else if (file.type === 'asset') {
              outputFiles.push({
                path: resolve(formatDir, file.fileName),
                format: output.format as OutputFormat,
                size: typeof file.source === 'string' ? file.source.length : file.source.byteLength,
                gzipSize: this.calculateGzipSize(typeof file.source === 'string' ? file.source : file.source.toString()),
                isEntry: false,
              })
            }
          }
        }
      }

      const endTime = Date.now()
      const buildTime = endTime - startTime

      const totalSize = outputFiles.reduce((sum, file) => sum + file.size, 0)
      const totalGzipSize = outputFiles.reduce((sum, file) => sum + (file.gzipSize || 0), 0)

      const formatStats: Record<OutputFormat, any> = {
        esm: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
        cjs: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
        iife: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
        umd: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
      }

      // 统计各格式的文件信息
      outputFiles.forEach((file) => {
        if (formatStats[file.format]) {
          formatStats[file.format].fileCount++
          formatStats[file.format].totalSize += file.size
          formatStats[file.format].totalGzipSize += file.gzipSize || 0
        }
      })

      const stats: BuildStats = {
        totalFiles: outputFiles.length,
        totalSize,
        totalGzipSize,
        formatStats,
      }

      logger.info(`构建完成，耗时 ${buildTime}ms`)

      return {
        success: true,
        duration: buildTime,
        outputs: outputFiles,
        errors,
        warnings,
        stats,
      }
    }
    catch (error) {
      const buildError: BuildError = {
        message: error instanceof Error ? error.message : String(error),
      }

      if (error instanceof Error) {
        if (error.stack)
          buildError.stack = error.stack
        if ('file' in error && error.file)
          buildError.file = String(error.file)
        if ('line' in error && error.line)
          buildError.line = Number(error.line)
        if ('column' in error && error.column)
          buildError.column = Number(error.column)
      }

      errors.push(buildError)
      logger.error('构建失败:', error)

      return {
        success: false,
        duration: Date.now() - startTime,
        outputs: outputFiles,
        errors,
        warnings,
        stats: {
          totalFiles: 0,
          totalSize: 0,
          totalGzipSize: 0,
          formatStats: {
            esm: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
            cjs: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
            iife: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
            umd: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
          },
        },
      }
    }
    finally {
      // 清理资源
      if (this.currentBuild) {
        await this.currentBuild.close()
        this.currentBuild = null
      }
    }
  }

  /**
   * 监听模式构建
   */
  async watch(
    scanResult: ProjectScanResult,
    pluginConfig: PluginConfiguration,
    buildOptions: BuildOptions,
    onRebuild?: (result: BuildResult) => void,
  ): Promise<void> {
    logger.info('启动监听模式...')

    try {
      // 生成 Rollup 配置
      const rollupOptions = this.generateRollupOptions(
        scanResult,
        pluginConfig,
        buildOptions,
      )

      // 生成输出配置
      const outputs = this.generateOutputOptions(scanResult, buildOptions)

      // 创建监听器
      this.currentWatcher = watch({
        ...rollupOptions,
        output: outputs,
        watch: {
          include: 'src/**',
          exclude: 'node_modules/**',
          ...buildOptions.watchOptions,
        },
      })

      // 监听事件
      this.currentWatcher.on('event', async (event) => {
        switch (event.code) {
          case 'START':
            logger.info('检测到文件变化，开始重新构建...')
            break

          case 'BUNDLE_START':
            logger.info('开始打包...')
            break

          case 'BUNDLE_END':
            logger.info('打包完成')
            if (onRebuild) {
              // 这里可以构造一个简化的 BuildResult
              const result: BuildResult = {
                success: true,
                duration: event.duration || 0,
                outputs: [],
                errors: [],
                warnings: [],
                stats: {
                  totalFiles: 0,
                  totalSize: 0,
                  totalGzipSize: 0,
                  formatStats: {
                    esm: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
                    cjs: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
                    iife: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
                    umd: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
                  },
                },
              }
              onRebuild(result)
            }
            break

          case 'END':
            logger.info('监听构建完成')
            break

          case 'ERROR':
            logger.error('构建错误:', event.error)
            if (onRebuild) {
              const result: BuildResult = {
                success: false,
                duration: 0,
                outputs: [],
                errors: [{
                  message: event.error.message,
                  ...(event.error.stack && { stack: event.error.stack }),
                  ...(event.error.loc?.file && { file: event.error.loc.file }),
                  ...(event.error.loc?.line && { line: event.error.loc.line }),
                  ...(event.error.loc?.column && { column: event.error.loc.column }),
                }],
                warnings: [],
                stats: {
                  totalFiles: 0,
                  totalSize: 0,
                  totalGzipSize: 0,
                  formatStats: {
                    esm: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
                    cjs: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
                    iife: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
                    umd: { fileCount: 0, totalSize: 0, totalGzipSize: 0 },
                  },
                },
              }
              onRebuild(result)
            }
            break
        }
      })
    }
    catch (error) {
      logger.error('启动监听模式失败:', error)
      throw error
    }
  }

  /**
   * 停止监听
   */
  async stopWatch(): Promise<void> {
    if (this.currentWatcher) {
      logger.info('停止监听模式...')
      await this.currentWatcher.close()
      this.currentWatcher = null
    }
  }

  /**
   * 生成 Rollup 配置
   */
  private generateRollupOptions(
    scanResult: ProjectScanResult,
    pluginConfig: PluginConfiguration,
    buildOptions: BuildOptions,
  ): RollupOptions {
    const input = this.resolveInput(scanResult, buildOptions)

    const external = this.resolveExternal(scanResult, buildOptions)
    const rollupOptions: RollupOptions = {
      input,
      plugins: pluginConfig.plugins,
      ...(external && { external }),
      onwarn: (warning) => {
        logger.warn(`Rollup警告: ${warning.message}`)
      },
      ...pluginConfig.rollupOptions,
      ...buildOptions.rollupOptions,
    }

    return rollupOptions
  }

  /**
   * 解析输入文件
   */
  private resolveInput(
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions,
  ): string | string[] | Record<string, string> {
    // 如果用户指定了输入文件
    if (buildOptions.input) {
      return buildOptions.input
    }

    // 如果只有一个入口点
    if (scanResult.entryPoints.length === 1) {
      return scanResult.entryPoints[0]
    }

    // 多个入口点，生成对象形式
    const input: Record<string, string> = {}

    for (const entryPoint of scanResult.entryPoints) {
      const name = basename(entryPoint, extname(entryPoint))
      input[name] = entryPoint
    }

    return input
  }

  /**
   * 解析外部依赖
   */
  private resolveExternal(
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions,
  ): RollupOptions['external'] {
    // 如果用户提供了函数，优先使用函数
    if (typeof buildOptions.external === 'function') {
      return buildOptions.external
    }

    const externalList: string[] = []

    if (Array.isArray(buildOptions.external)) {
      externalList.push(...buildOptions.external)
    }

    // 添加 peerDependencies
    if (scanResult.packageInfo?.peerDependencies) {
      externalList.push(...Object.keys(scanResult.packageInfo.peerDependencies))
    }

    // 如果是库模式，添加所有依赖
    if (buildOptions.lib && scanResult.packageInfo?.dependencies) {
      externalList.push(...Object.keys(scanResult.packageInfo.dependencies))
    }

    return [...new Set(externalList)]
  }

  /**
   * 生成输出配置
   */
  private generateOutputOptions(
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions,
  ): OutputOptions[] {
    const outputs: OutputOptions[] = []
    const baseOutDir = buildOptions.outDir || 'dist'
    const formats = (buildOptions.formats || ['esm', 'cjs']) as OutputFormat[]

    // 分离模块化格式和打包格式
    const moduleFormats = formats.filter(f => f === 'esm' || f === 'cjs')
    const bundleFormats = formats.filter(f => f === 'umd' || f === 'iife')

    // 处理模块化格式（支持代码分割）
    for (const format of moduleFormats) {
      const formatDir = this.getFormatOutputDir(format, baseOutDir)
      const formatSpecificOptions = this.getFormatSpecificOptions(format, scanResult, buildOptions)
      const rollupFormat = this.mapToRollupFormat(format)
      const output: OutputOptions = {
        dir: formatDir,
        format: rollupFormat,
        sourcemap: buildOptions.sourcemap !== false,
        preserveModules: true,
        preserveModulesRoot: 'src',
        ...formatSpecificOptions,
      }

      outputs.push(output)
    }

    // 处理打包格式（不支持代码分割）
    for (const format of bundleFormats) {
      const formatDir = this.getFormatOutputDir(format, baseOutDir)
      const formatSpecificOptions = this.getFormatSpecificOptions(format, scanResult, buildOptions)
      const rollupFormat = this.mapToRollupFormat(format)
      const output: OutputOptions = {
        dir: formatDir,
        format: rollupFormat,
        sourcemap: buildOptions.sourcemap !== false,
        preserveModules: false,
        ...formatSpecificOptions,
      }

      outputs.push(output)
    }

    return outputs
  }

  /**
   * 获取格式输出目录
   */
  private getFormatOutputDir(format: OutputFormat, baseOutDir: string): string {
    // 获取项目根目录（baseOutDir 的父目录）
    const projectRoot = resolve(baseOutDir, '..')

    switch (format) {
      case 'esm':
        return resolve(projectRoot, 'esm')
      case 'cjs':
        return resolve(projectRoot, 'cjs')
      case 'umd':
        // UMD 文件直接输出到 dist 根目录
        return baseOutDir
      case 'iife':
        return resolve(baseOutDir, 'iife')
      default:
        return baseOutDir
    }
  }

  /**
   * 获取格式特定的配置
   */
  private getFormatSpecificOptions(
    format: OutputFormat,
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions,
  ): Partial<OutputOptions> {
    const options: Partial<OutputOptions> = {}

    switch (format) {
      case 'esm':
        // ESM 格式特定配置
        break

      case 'cjs':
        options.exports = 'auto'
        break

      case 'umd':
        // UMD 格式不保持模块结构，使用单文件输出
        options.entryFileNames = '[name].umd.js'
        options.name = buildOptions.name || scanResult.packageInfo?.name || 'MyLibrary'
        options.globals = buildOptions.globals || {}
        break

      case 'iife':
        // IIFE 格式不保持模块结构，使用单文件输出
        options.entryFileNames = '[name].iife.js'
        options.name = buildOptions.name || scanResult.packageInfo?.name || 'MyLibrary'
        options.globals = buildOptions.globals || {}
        break
    }

    return options
  }

  /**
   * 将内部格式映射到 Rollup 的格式
   */
  private mapToRollupFormat(format: OutputFormat): NonNullable<OutputOptions['format']> {
    if (format === 'esm')
      return 'es'
    return format as NonNullable<OutputOptions['format']>
  }

  /**
   * 确保输出目录存在
   */
  private ensureOutputDir(outDir: string): void {
    const resolvedDir = resolve(outDir)
    if (!existsSync(resolvedDir)) {
      mkdirSync(resolvedDir, { recursive: true })
      logger.info(`创建输出目录: ${resolvedDir}`)
    }
  }

  /**
   * 计算 Gzip 大小
   */
  private calculateGzipSize(_content: string | Buffer): number {
    // 暂时禁用 gzip 计算以避免打包问题
    return 0
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.currentBuild) {
      await this.currentBuild.close()
      this.currentBuild = null
    }

    if (this.currentWatcher) {
      await this.currentWatcher.close()
      this.currentWatcher = null
    }
  }

  /**
   * 获取构建统计信息
   */
  getStats(): BuildStats | null {
    // 这里可以返回最后一次构建的统计信息
    // 实际实现中可能需要保存状态
    return null
  }

  /**
   * 是否正在构建
   */
  isBuilding(): boolean {
    return this.currentBuild !== null
  }

  /**
   * 是否正在监听
   */
  isWatching(): boolean {
    return this.currentWatcher !== null
  }

  /**
   * 生成打包格式的 Rollup 配置（不支持代码分割）
   */
  private generateBundleRollupOptions(
    scanResult: ProjectScanResult,
    pluginConfig: PluginConfiguration,
    buildOptions: BuildOptions,
  ): RollupOptions {
    // 为打包格式使用单一入口
    let input: string
    if (typeof buildOptions.input === 'string') {
      input = buildOptions.input
    } else if (buildOptions.input && typeof buildOptions.input === 'object' && !Array.isArray(buildOptions.input)) {
      input = buildOptions.input['index'] || 'src/index.ts'
    } else {
      input = 'src/index.ts'
    }

    const external = this.resolveExternal(scanResult, buildOptions)

    const config: RollupOptions = {
      input,
      plugins: pluginConfig.plugins,
      onwarn: (warning, warn) => {
        // 过滤一些常见的警告
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          logger.warn(`Rollup警告: ${warning.message}`)
          return
        }
        warn(warning)
      },
      ...buildOptions.rollupOptions,
    }

    if (external) {
      config.external = external
    }

    return config
  }

  /**
   * 清理输出目录
   */
  private async cleanOutputDirs(buildOptions: BuildOptions): Promise<void> {
    const projectRoot = resolve(buildOptions.root || process.cwd())
    const formats = (buildOptions.formats || ['esm', 'cjs']) as OutputFormat[]

    logger.info('清理输出目录...')

    for (const format of formats) {
      let outputDir: string

      switch (format) {
        case 'esm':
          outputDir = resolve(projectRoot, 'esm')
          break
        case 'cjs':
          outputDir = resolve(projectRoot, 'cjs')
          break
        case 'umd':
        case 'iife':
          outputDir = resolve(projectRoot, buildOptions.outDir || 'dist')
          break
        default:
          continue
      }

      if (existsSync(outputDir)) {
        try {
          rmSync(outputDir, { recursive: true, force: true })
          logger.info(`已清理: ${outputDir}`)
        } catch (error) {
          logger.warn(`清理目录失败: ${outputDir}`, error)
        }
      }
    }

    // 清理 types 目录
    if (buildOptions.dts) {
      const typesDir = resolve(projectRoot, 'types')
      if (existsSync(typesDir)) {
        try {
          rmSync(typesDir, { recursive: true, force: true })
          logger.info(`已清理: ${typesDir}`)
        } catch (error) {
          logger.warn(`清理类型目录失败: ${typesDir}`, error)
        }
      }
    }
  }
}
