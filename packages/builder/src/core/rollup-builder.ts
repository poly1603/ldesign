/**
 * Rollup构建器
 * 执行多格式打包
 */

import { rollup, watch, type RollupOptions, type OutputOptions, type RollupBuild, type RollupWatcher } from 'rollup'
import { resolve, dirname, basename, extname } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { Logger } from '../utils/logger'
import type {
  BuildOptions,
  BuildResult,
  OutputFormat,
  ProjectScanResult,
  PluginConfiguration,
  OutputFile,
  BuildError,
  BuildWarning,
  BuildStats
} from '../types'

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
    buildOptions: BuildOptions
  ): Promise<BuildResult> {
    logger.info('开始构建项目...')
    
    const startTime = Date.now()
    const errors: BuildError[] = []
    const warnings: BuildWarning[] = []
    const outputFiles: OutputFile[] = []
    
    try {
      // 生成 Rollup 配置
      const rollupOptions = this.generateRollupOptions(
        scanResult,
        pluginConfig,
        buildOptions
      )
      
      // 创建输出目录
      this.ensureOutputDir(buildOptions.outDir || 'dist')
      
      // 执行构建
      this.currentBuild = await rollup(rollupOptions)
      
      // 生成输出文件
      const outputs = this.generateOutputOptions(scanResult, buildOptions)
      
      for (const output of outputs) {
        logger.info(`生成 ${output.format} 格式文件...`)
        
        const { output: generatedFiles } = await this.currentBuild.write(output)
        
        // 收集输出文件信息
        for (const file of generatedFiles) {
          if (file.type === 'chunk') {
            outputFiles.push({
              path: file.fileName,
              format: output.format as OutputFormat,
              size: file.code.length,
              gzipSize: this.calculateGzipSize(file.code),
              isEntry: file.isEntry
            })
          } else if (file.type === 'asset') {
            outputFiles.push({
              path: file.fileName,
              format: output.format as OutputFormat,
              size: typeof file.source === 'string' ? file.source.length : file.source.byteLength,
              gzipSize: this.calculateGzipSize(typeof file.source === 'string' ? file.source : file.source.toString()),
              isEntry: false
            })
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
        umd: { fileCount: 0, totalSize: 0, totalGzipSize: 0 }
      }
      
      // 统计各格式的文件信息
      outputFiles.forEach(file => {
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
        formatStats
      }
      
      logger.info(`构建完成，耗时 ${buildTime}ms`)
      
      return {
        success: true,
        duration: buildTime,
        outputs: outputFiles,
        errors,
        warnings,
        stats
      }
      
    } catch (error) {
      const buildError: BuildError = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        file: undefined,
        line: undefined,
        column: undefined
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
            umd: { fileCount: 0, totalSize: 0, totalGzipSize: 0 }
          }
        }
      }
    } finally {
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
    onRebuild?: (result: BuildResult) => void
  ): Promise<void> {
    logger.info('启动监听模式...')
    
    try {
      // 生成 Rollup 配置
      const rollupOptions = this.generateRollupOptions(
        scanResult,
        pluginConfig,
        buildOptions
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
          ...buildOptions.watchOptions
        }
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
                    umd: { fileCount: 0, totalSize: 0, totalGzipSize: 0 }
                  }
                }
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
                  stack: event.error.stack,
                  file: event.error.loc?.file,
                  line: event.error.loc?.line,
                  column: event.error.loc?.column
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
                    umd: { fileCount: 0, totalSize: 0, totalGzipSize: 0 }
                  }
                }
              }
              onRebuild(result)
            }
            break
        }
      })
      
    } catch (error) {
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
    buildOptions: BuildOptions
  ): RollupOptions {
    const input = this.resolveInput(scanResult, buildOptions)
    
    const rollupOptions: RollupOptions = {
      input,
      plugins: pluginConfig.plugins,
      external: this.resolveExternal(scanResult, buildOptions),
      onwarn: (warning) => {
        logger.warn(`Rollup警告: ${warning.message}`)
      },
      ...pluginConfig.rollupOptions,
      ...buildOptions.rollupOptions
    }
    
    return rollupOptions
  }

  /**
   * 解析输入文件
   */
  private resolveInput(
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions
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
    buildOptions: BuildOptions
  ): string[] {
    const external: string[] = []
    
    // 添加用户指定的外部依赖
    if (buildOptions.external) {
      external.push(...buildOptions.external)
    }
    
    // 添加 peerDependencies
    if (scanResult.packageInfo?.peerDependencies) {
      external.push(...Object.keys(scanResult.packageInfo.peerDependencies))
    }
    
    // 如果是库模式，添加所有依赖
    if (buildOptions.lib) {
      if (scanResult.packageInfo?.dependencies) {
        external.push(...Object.keys(scanResult.packageInfo.dependencies))
      }
    }
    
    return [...new Set(external)] // 去重
  }

  /**
   * 生成输出配置
   */
  private generateOutputOptions(
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions
  ): OutputOptions[] {
    const outputs: OutputOptions[] = []
    const outDir = buildOptions.outDir || 'dist'
    const formats = buildOptions.formats || ['es', 'cjs']
    
    for (const format of formats) {
      const output: OutputOptions = {
        dir: outDir,
        format,
        sourcemap: buildOptions.sourcemap !== false,
        ...this.getFormatSpecificOptions(format, scanResult, buildOptions)
      }
      
      outputs.push(output)
    }
    
    return outputs
  }

  /**
   * 获取格式特定的配置
   */
  private getFormatSpecificOptions(
    format: OutputFormat,
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions
  ): Partial<OutputOptions> {
    const options: Partial<OutputOptions> = {}
    
    switch (format) {
      case 'es':
      case 'esm':
        options.entryFileNames = '[name].esm.js'
        options.chunkFileNames = '[name]-[hash].esm.js'
        break
        
      case 'cjs':
      case 'commonjs':
        options.entryFileNames = '[name].cjs.js'
        options.chunkFileNames = '[name]-[hash].cjs.js'
        options.exports = 'auto'
        break
        
      case 'umd':
        options.entryFileNames = '[name].umd.js'
        options.name = buildOptions.name || scanResult.packageInfo?.name || 'MyLibrary'
        options.globals = buildOptions.globals || {}
        break
        
      case 'iife':
        options.entryFileNames = '[name].iife.js'
        options.name = buildOptions.name || scanResult.packageInfo?.name || 'MyLibrary'
        options.globals = buildOptions.globals || {}
        break
        
      case 'amd':
        options.entryFileNames = '[name].amd.js'
        options.amd = {
          id: buildOptions.name || scanResult.packageInfo?.name
        }
        break
        
      case 'system':
        options.entryFileNames = '[name].system.js'
        break
    }
    
    return options
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
  private calculateGzipSize(content: string | Buffer): number {
    try {
      const { gzipSync } = require('zlib')
      const buffer = typeof content === 'string' ? Buffer.from(content) : content
      return gzipSync(buffer).length
    } catch (error) {
      logger.warn('无法计算 Gzip 大小:', error)
      return 0
    }
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
}