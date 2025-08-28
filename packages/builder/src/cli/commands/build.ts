/**
 * 构建命令处理器
 * 处理项目构建逻辑
 */

import type { BuildMode, BuildOptions, OutputFormat } from '../../types'
import path from 'node:path'
import chalk from 'chalk'
import ora from 'ora'

import { FileUtils } from '../../utils'
import { Logger } from '../../utils/logger'

const logger = new Logger('Build')

export class BuildCommand {
  /**
   * 执行构建命令
   */
  async execute(input: string, options: any): Promise<void> {
    const startTime = Date.now()
    const spinner = ora('正在准备构建...').start()

    try {
      // 解析构建选项
      const buildOptions = await this.parseBuildOptions(input, options)

      // 执行构建（使用智能化构建函数）
      spinner.text = '正在构建项目...'
      const { build } = await import('../..')

      // 在构建函数内部会进行智能增强配置，然后显示构建信息
      const result = await build(buildOptions)

      spinner.stop()

      if (result.success) {
        // 显示构建成功信息
        this.showBuildSuccess(result, Date.now() - startTime)
      }
      else {
        // 显示构建失败信息
        this.showBuildFailure(result)
        process.exit(1)
      }
    }
    catch (error) {
      spinner.stop()
      logger.error('构建失败:', error)
      process.exit(1)
    }
  }

  /**
   * 解析构建选项
   */
  private async parseBuildOptions(input: string, options: any): Promise<BuildOptions> {
    const root = process.cwd()

    // 如果配置文件中已经有完整的配置，直接使用
    if (options.input && typeof options.input === 'object') {
      return {
        root,
        ...options,
        outDir: options.outDir ? path.resolve(root, options.outDir) : path.resolve(root, 'dist'),
        dtsDir: options.dtsDir ? path.resolve(root, options.dtsDir) : path.resolve(root, 'types'),
      }
    }

    // 解析输入
    let inputPath: string | string[]
    if (input) {
      inputPath = path.resolve(root, input)
    }
    else if (options.input) {
      inputPath = options.input
    }
    else {
      // 自动检测入口文件
      inputPath = await this.detectEntryFiles(root)
    }

    // 解析输出格式（让智能配置处理默认值）
    const formats = options.formats || (options.format ? this.parseFormats(options.format) : undefined)

    // 解析构建模式
    const mode: BuildMode = options.mode === 'development' ? 'development' : 'production'

    return {
      root,
      input: inputPath,
      outDir: path.resolve(root, options.outDir || 'dist'),
      formats,
      mode,
      dts: options.dts !== false, // 默认生成类型声明
      dtsDir: path.resolve(root, options.dtsDir || 'types'),
      minify: options.minify !== false && mode === 'production', // 生产模式默认压缩
      sourcemap: options.sourcemap !== false, // 默认生成 sourcemap
      clean: options.clean !== false, // 默认清理输出目录
      verbose: options.verbose || false,
      external: options.external,
      globals: options.globals,
      name: options.name,
      lib: options.lib,
      plugins: options.plugins,
      rollupOptions: options.rollupOptions,
    }
  }

  /**
   * 自动检测入口文件
   */
  private async detectEntryFiles(root: string): Promise<string[]> {
    const possibleEntries = [
      'src/index.ts',
      'src/index.js',
      'src/main.ts',
      'src/main.js',
      'index.ts',
      'index.js',
      'main.ts',
      'main.js',
    ]

    const fs = await import('fs-extra')
    const entries: string[] = []

    for (const entry of possibleEntries) {
      const entryPath = path.resolve(root, entry)
      if (await fs.pathExists(entryPath)) {
        entries.push(entryPath)
        break // 只取第一个找到的入口文件
      }
    }

    if (entries.length === 0) {
      throw new Error('未找到入口文件，请指定入口文件或确保存在 src/index.ts 等常见入口文件')
    }

    return entries
  }

  /**
   * 解析输出格式
   */
  private parseFormats(formatStr: string): OutputFormat[] {
    const formats = formatStr.split(',').map(f => f.trim()) as OutputFormat[]
    const validFormats: OutputFormat[] = ['esm', 'cjs', 'iife', 'umd']

    for (const format of formats) {
      if (!validFormats.includes(format)) {
        throw new Error(`不支持的输出格式: ${format}，支持的格式: ${validFormats.join(', ')}`)
      }
    }

    return formats
  }



  /**
   * 显示构建成功信息
   */
  private showBuildSuccess(result: any, duration: number): void {
    console.log()
    console.log(chalk.green.bold('✅ 构建成功!'))
    console.log(chalk.gray('─'.repeat(50)))

    // 显示输出文件信息
    if (result.outputs && result.outputs.length > 0) {
      console.log(chalk.bold('输出文件:'))
      for (const output of result.outputs) {
        const size = FileUtils.formatSize(output.size)
        const gzipSize = output.gzipSize ? ` (gzip: ${FileUtils.formatSize(output.gzipSize)})` : ''
        const formatBadge = this.getFormatBadge(output.format)
        console.log(`  ${formatBadge} ${chalk.cyan(path.relative(process.cwd(), output.path))} ${chalk.gray(size + gzipSize)}`)
      }
    }

    // 显示构建统计
    if (result.stats) {
      console.log()
      console.log(chalk.bold('构建统计:'))
      console.log(`  ${chalk.bold('总文件数:')} ${chalk.yellow(result.stats.totalFiles)}`)
      console.log(`  ${chalk.bold('总大小:')} ${chalk.yellow(FileUtils.formatSize(result.stats.totalSize))}`)
      if (result.stats.totalGzipSize) {
        console.log(`  ${chalk.bold('压缩后大小:')} ${chalk.yellow(FileUtils.formatSize(result.stats.totalGzipSize))}`)
      }
    }

    console.log()
    console.log(`${chalk.bold('构建时间:')} ${chalk.green(this.formatDuration(duration))}`)
    console.log(chalk.gray('─'.repeat(50)))
    console.log()
  }

  /**
   * 显示构建失败信息
   */
  private showBuildFailure(result: any): void {
    console.log()
    console.log(chalk.red.bold('❌ 构建失败!'))
    console.log(chalk.gray('─'.repeat(50)))

    // 显示错误信息
    if (result.errors && result.errors.length > 0) {
      console.log(chalk.bold('错误信息:'))
      for (const error of result.errors) {
        console.log(chalk.red(`  ✗ ${error.message}`))
        if (error.file) {
          console.log(chalk.gray(`    文件: ${error.file}`))
        }
        if (error.line !== undefined) {
          console.log(chalk.gray(`    行号: ${error.line}`))
        }
      }
    }

    // 显示警告信息
    if (result.warnings && result.warnings.length > 0) {
      console.log()
      console.log(chalk.bold('警告信息:'))
      for (const warning of result.warnings) {
        console.log(chalk.yellow(`  ⚠ ${warning.message}`))
        if (warning.file) {
          console.log(chalk.gray(`    文件: ${warning.file}`))
        }
      }
    }

    console.log(chalk.gray('─'.repeat(50)))
    console.log()
  }

  /**
   * 获取格式标识
   */
  private getFormatBadge(format: OutputFormat): string {
    const badges = {
      esm: chalk.blue.bold('[ESM]'),
      cjs: chalk.green.bold('[CJS]'),
      iife: chalk.yellow.bold('[IIFE]'),
      umd: chalk.magenta.bold('[UMD]'),
    }
    return badges[format] || chalk.gray.bold(`[${format.toUpperCase()}]`)
  }

  /**
   * 格式化时间
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`
    }

    const seconds = ms / 1000
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }
}
