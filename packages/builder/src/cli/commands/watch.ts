/**
 * 监听命令处理器
 * 处理文件监听和自动重新构建
 */

import type { BuildMode, BuildOptions, OutputFormat } from '../../types'
import path from 'node:path'
import chalk from 'chalk'
import ora from 'ora'
import { PluginConfigurator } from '../../core/plugin-configurator'
import { ProjectScanner } from '../../core/project-scanner'
import { RollupBuilder } from '../../core/rollup-builder'
import { Logger } from '../../utils/logger'

const logger = new Logger('Watch')

export class WatchCommand {
  private isWatching = false
  private builder?: RollupBuilder
  private scanner?: ProjectScanner

  /**
   * 执行监听命令
   */
  async execute(input: string, options: any): Promise<void> {
    const spinner = ora('正在启动监听模式...').start()

    try {
      // 解析构建选项
      const buildOptions = await this.parseBuildOptions(input, options)

      // 显示监听信息
      this.showWatchInfo(buildOptions)

      // 初始化扫描器和构建器
      this.scanner = new ProjectScanner()
      this.builder = new RollupBuilder()

      // 执行初始构建
      spinner.text = '正在执行初始构建...'
      await this.performBuild(buildOptions)

      spinner.stop()

      // 启动文件监听
      await this.startWatching(buildOptions)
    }
    catch (error) {
      spinner.stop()
      logger.error('监听模式启动失败:', error)
      process.exit(1)
    }
  }

  /**
   * 解析构建选项
   */
  private async parseBuildOptions(input: string, options: any): Promise<BuildOptions> {
    const root = process.cwd()

    // 解析输入
    let inputPath: string | string[]
    if (input) {
      inputPath = path.resolve(root, input)
    }
    else {
      // 自动检测入口文件
      inputPath = await this.detectEntryFiles(root)
    }

    // 解析输出格式（监听模式默认只生成 ESM 和 CJS）
    const formats = this.parseFormats(options.format || 'esm,cjs')

    // 监听模式默认为开发模式
    const mode: BuildMode = options.mode === 'production' ? 'production' : 'development'

    return {
      root,
      input: inputPath,
      outDir: path.resolve(root, options.outDir || 'dist'),
      formats,
      mode,
      dts: options.dts === true, // 监听模式默认不生成类型声明
      dtsDir: path.resolve(root, options.dtsDir || 'types'),
      minify: false,
      sourcemap: true,
      clean: false,
      verbose: options.verbose || false,
      watch: true,
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
    ]

    const fs = await import('fs-extra')
    const entries: string[] = []

    for (const entry of possibleEntries) {
      const entryPath = path.resolve(root, entry)
      if (await fs.pathExists(entryPath)) {
        entries.push(entryPath)
        break
      }
    }

    if (entries.length === 0) {
      throw new Error('未找到入口文件，请指定入口文件')
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
        throw new Error(`不支持的输出格式: ${format}`)
      }
    }

    return formats
  }

  /**
   * 显示监听信息
   */
  private showWatchInfo(options: BuildOptions): void {
    console.log()
    console.log(chalk.cyan.bold('👀 启动监听模式'))
    console.log(chalk.gray('─'.repeat(50)))
    console.log(`${chalk.bold('项目根目录:')} ${chalk.cyan(process.cwd())}`)
    console.log(`${chalk.bold('输出目录:')} ${chalk.cyan(options.outDir || 'dist')}`)
    console.log(`${chalk.bold('输出格式:')} ${chalk.yellow(options.formats?.join(', '))}`)
    console.log(chalk.gray('─'.repeat(50)))
    console.log(chalk.gray('提示: 按 Ctrl+C 退出监听模式'))
    console.log()
  }

  /**
   * 执行构建
   */
  private async performBuild(options: BuildOptions): Promise<void> {
    try {
      const startTime = Date.now()

      // 扫描项目
      const scanResult = await this.scanner!.scan(process.cwd())

      // 配置插件
      const configurator = new PluginConfigurator()
      const plugins = await configurator.configure(scanResult, options)

      // 执行构建
      const result = await this.builder!.build(scanResult, { plugins }, options)

      const duration = Date.now() - startTime

      if (result.success) {
        console.log(chalk.green(`✅ 构建完成 (${duration}ms)`))

        // 显示输出文件
        if (result.outputs && result.outputs.length > 0) {
          for (const output of result.outputs) {
            const relativePath = path.relative(process.cwd(), output.path)
            console.log(`   ${this.getFormatBadge(output.format)} ${chalk.cyan(relativePath)}`)
          }
        }
      }
      else {
        console.log(chalk.red('❌ 构建失败'))

        // 显示错误信息
        if (result.errors && result.errors.length > 0) {
          for (const error of result.errors) {
            console.log(chalk.red(`   ✗ ${error.message}`))
          }
        }
      }

      console.log()
    }
    catch (error) {
      console.log(chalk.red('❌ 构建失败:'), error)
      console.log()
    }
  }

  /**
   * 启动文件监听
   */
  private async startWatching(options: BuildOptions): Promise<void> {
    const chokidar = await import('chokidar')

    // 监听源文件目录
    const root = process.cwd()
    const watchPaths = [
      path.join(root, 'src/**/*'),
      path.join(root, '*.ts'),
      path.join(root, '*.js'),
    ]

    const watcher = chokidar.watch(watchPaths, {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/types/**',
        '**/.git/**',
        '**/.*',
      ],
      ignoreInitial: true,
      persistent: true,
    })

    this.isWatching = true

    console.log(chalk.blue('🔍 正在监听文件变化...'))
    console.log()

    // 防抖处理
    let buildTimeout: NodeJS.Timeout | null = null

    const triggerBuild = (eventType: string, filePath: string) => {
      if (buildTimeout) {
        clearTimeout(buildTimeout)
      }

      buildTimeout = setTimeout(async () => {
        const relativePath = path.relative(process.cwd(), filePath)
        console.log(chalk.gray(`📝 ${eventType}: ${relativePath}`))
        await this.performBuild(options)
      }, 100) // 100ms 防抖
    }

    watcher
      .on('add', filePath => triggerBuild('新增', filePath))
      .on('change', filePath => triggerBuild('修改', filePath))
      .on('unlink', filePath => triggerBuild('删除', filePath))
      .on('error', (error) => {
        logger.error('文件监听错误:', error)
      })

    // 处理退出信号
    process.on('SIGINT', () => {
      console.log('\n')
      console.log(chalk.yellow('正在停止监听...'))
      watcher.close()
      this.isWatching = false
      process.exit(0)
    })

    // 保持进程运行
    return new Promise(() => {}) // 永不 resolve
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
}
