/**
 * 命令运行器
 *
 * 负责执行具体的构建命令
 */

import type {
  AnalyzeCommand,
  AnalyzeResult,
  BuildCommand,
  BuildOptions,
  BuildResult,
  ConfigFile,
  DevCommand,
  InitCommand,
  InitResult,
  WatchResult,
} from './types'
import * as path from 'node:path'
import * as Builder from '@ldesign/builder'

/**
 * 命令运行器
 */
export class CommandRunner {
  private cwd: string
  private verbose: boolean

  constructor(cwd: string = process.cwd(), verbose: boolean = false) {
    this.cwd = cwd
    this.verbose = verbose
  }

  /**
   * 执行构建命令
   */
  async runBuild(
    config: ConfigFile | null,
    options: BuildCommand,
  ): Promise<BuildResult> {
    const buildOptions = this.mergeBuildOptions(config?.config || {}, options)

    if (this.verbose) {
      process.stdout.write(`🔧 构建配置: ${JSON.stringify(buildOptions, null, 2)}\n`)
    }

    if (options.watch) {
      process.stdout.write('👀 启动监听模式...\n')
      await (Builder as any).watch(buildOptions)

      // 监听模式不会返回，这里返回一个占位结果
      return {
        success: true,
        outputs: [],
        duration: 0,
      }
    }
    else {
      process.stdout.write('🚀 开始构建...\n')
      return await (Builder as any).build(buildOptions)
    }
  }

  /**
   * 执行开发命令
   */
  async runDev(
    config: ConfigFile | null,
    options: DevCommand,
  ): Promise<WatchResult> {
    const buildOptions = this.mergeBuildOptions(config?.config || {}, {
      mode: 'development',
      sourcemap: true,
      minify: false,
      clean: false,
    })

    // 添加监听选项
    const watchOptions = {
      ...buildOptions,
      buildOnStart: true,
      debounce: options.debounce || 100,
    }

    if (this.verbose) {
      process.stdout.write(`🔧 开发配置: ${JSON.stringify(watchOptions, null, 2)}\n`)
    }

    process.stdout.write('🚀 启动开发模式...\n')
    return await (Builder as any).watch(watchOptions)
  }

  /**
   * 执行分析命令
   */
  async runAnalyze(
    options: AnalyzeCommand,
  ): Promise<AnalyzeResult> {
    const analyzeOptions = {
      includePatterns: ['**/*.{ts,tsx,js,jsx,vue}'],
      ignorePatterns: ['node_modules/**', 'dist/**', 'build/**'],
      maxDepth: options.depth || 10,
    }

    if (this.verbose) {
      process.stdout.write(`🔧 分析配置: ${JSON.stringify(analyzeOptions, null, 2)}\n`)
    }

    process.stdout.write('📊 开始分析项目...\n')
    const result = await (Builder as any).analyze(this.cwd, analyzeOptions)

    // 如果需要生成报告
    if (options.report && options.output) {
      await this.generateAnalyzeReport(result, options.output)
    }

    return result
  }

  /**
   * 执行初始化命令
   */
  async runInit(options: InitCommand): Promise<InitResult> {
    const initOptions = {
      template: options.template || 'typescript',
      typescript: options.typescript ?? true,
      name: options.name || path.basename(this.cwd),
      output: options.output || this.cwd,
      overwrite: options.force || false,
    }

    if (this.verbose) {
      process.stdout.write(`🔧 初始化配置: ${JSON.stringify(initOptions, null, 2)}\n`)
    }

    process.stdout.write('🎯 初始化项目...\n')
    return await (Builder as any).init(initOptions)
  }

  /**
   * 合并构建选项
   */
  private mergeBuildOptions(
    baseConfig: Partial<BuildOptions>,
    overrides: BuildCommand | Partial<BuildOptions>,
  ): Partial<BuildOptions> {
    // 处理格式选项 - 将 string | string[] 转换为 string[]
    let formats = baseConfig.formats
    if ('formats' in overrides && overrides.formats) {
      if (Array.isArray(overrides.formats)) {
        formats = overrides.formats
      } else if (typeof overrides.formats === 'string') {
        formats = [overrides.formats]
      }
    }

    return {
      ...baseConfig,
      ...overrides,
      formats,
      // 确保输入路径是绝对路径
      input: this.resolveInput(('input' in overrides ? overrides.input : undefined) || baseConfig.input),
      // 确保输出路径是绝对路径
      outDir: overrides.outDir ? path.resolve(this.cwd, overrides.outDir) : baseConfig.outDir,
    }
  }

  /**
   * 解析输入路径
   */
  private resolveInput(input: any): any {
    if (typeof input === 'string') {
      return path.resolve(this.cwd, input)
    }
    else if (Array.isArray(input)) {
      return input.map(item =>
        typeof item === 'string' ? path.resolve(this.cwd, item) : item,
      )
    }
    else if (input && typeof input === 'object') {
      const resolved: Record<string, any> = {}
      for (const [key, value] of Object.entries(input)) {
        resolved[key] = typeof value === 'string' ? path.resolve(this.cwd, value) : value
      }
      return resolved
    }

    return input
  }

  /**
   * 生成分析报告
   */
  private async generateAnalyzeReport(
    result: AnalyzeResult,
    outputPath: string,
  ): Promise<void> {
    const fs = await import('node:fs/promises')

    const report = {
      timestamp: new Date().toISOString(),
      projectType: result.projectType,
      stats: result.stats,
      files: result.files.length,
      entryPoints: result.entryPoints,
      recommendations: result.recommendations,
      issues: result.issues,
    }

    const reportContent = JSON.stringify(report, null, 2)
    const resolvedPath = path.resolve(this.cwd, outputPath)

    await fs.writeFile(resolvedPath, reportContent, 'utf-8')
    process.stdout.write(`📄 分析报告已生成: ${resolvedPath}\n`)
  }
}
