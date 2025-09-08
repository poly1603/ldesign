/**
 * Builder CLI 主类
 *
 * 提供完整的命令行界面
 */

import type {
  AnalyzeCommand,
  BuildCommand,
  BuilderCLIOptions,
  DevCommand,
  InitCommand,
} from './types'
import { cac } from 'cac'
import chalk from 'chalk'
import pkg from '../../package.json' assert { type: 'json' }
import { CommandRunner } from './command-runner'
import { ConfigLoader } from './config-loader'

/**
 * Builder CLI 类
 */
export class BuilderCLI {
  private cli: ReturnType<typeof cac>
  private configLoader: ConfigLoader
  private commandRunner: CommandRunner
  private options: BuilderCLIOptions

  constructor(options: BuilderCLIOptions = {}) {
    this.options = {
      cwd: process.cwd(),
      verbose: false,
      silent: false,
      ...options,
    }

    this.cli = cac('ldesign')
    this.configLoader = new ConfigLoader(this.options.cwd!)
    this.commandRunner = new CommandRunner(this.options.cwd!, this.options.verbose!)

    this.setupCommands()
    this.setupGlobalOptions()
  }

  /**
   * 设置命令
   */
  private setupCommands(): void {
    // Build 命令
    this.cli
      .command('build [input]', '构建项目')
      .option('--mode <mode>', '构建模式 (development|production)', {
        default: 'production',
      })
      .option('--watch', '监听模式')
      .option('--clean', '清理输出目录', { default: true })
      .option('--sourcemap', '生成 sourcemap')
      .option('--minify', '压缩代码')
      .option('--out-dir <dir>', '输出目录')
      .option('--formats <formats>', '输出格式 (逗号分隔)')
      .option('--dts', '生成类型声明文件')
      .action(async (input: string, options: BuildCommand) => {
        await this.handleBuild(input, options)
      })

    // Dev 命令
    this.cli
      .command('dev [input]', '开发模式')
      .option('--port <port>', '端口号', { default: 3000 })
      .option('--host <host>', '主机地址', { default: 'localhost' })
      .option('--open', '自动打开浏览器')
      .option('--debounce <ms>', '防抖延迟', { default: 100 })
      .action(async (input: string, options: DevCommand) => {
        await this.handleDev(input, options)
      })

    // Analyze 命令
    this.cli
      .command('analyze [dir]', '分析项目')
      .option('--depth <depth>', '分析深度', { default: 10 })
      .option('--dependencies', '包含依赖分析')
      .option('--report', '生成报告')
      .option('--output <file>', '报告输出路径')
      .action(async (dir: string, options: AnalyzeCommand) => {
        await this.handleAnalyze(dir, options)
      })

    // Init 命令
    this.cli
      .command('init [name]', '初始化项目')
      .option('--template <template>', '项目模板 (vanilla|vue|react|typescript|library)')
      .option('--typescript', '使用 TypeScript', { default: true })
      .option('--output <dir>', '输出目录')
      .option('--force', '覆盖已存在的文件')
      .action(async (name: string, options: InitCommand) => {
        await this.handleInit(name, options)
      })
  }

  /**
   * 设置全局选项
   */
  private setupGlobalOptions(): void {
    this.cli
      .option('--config <file>', '配置文件路径')
      .option('--verbose', '显示详细日志')
      .option('--silent', '静默模式')
      .help()
      .version((pkg as any).version)
  }

  /**
   * 处理 Build 命令
   */
  private async handleBuild(input: string, options: BuildCommand): Promise<void> {
    try {
      const config = await this.loadConfig()

      // 如果提供了 input 参数，覆盖配置中的 input
      if (input) {
        if (config) {
          config.config.input = input
        }
      }

      // 处理格式选项
      if (options.formats) {
        const formats = typeof options.formats === 'string'
          ? (options.formats as string).split(',').map((f: string) => f.trim())
          : options.formats
        options.formats = formats as any
      }

      const result = await this.commandRunner.runBuild(config, options)

      if (result.success) {
        process.stdout.write(`${chalk.green('✅ 构建成功!')}\n`)
        if (result.outputs.length > 0) {
          process.stdout.write('\n📦 输出文件:\n')
          result.outputs.forEach((output: any) => {
            process.stdout.write(`  ${chalk.cyan(output.fileName)} (${output.size} bytes)\n`)
          })
        }
        process.stdout.write(`\n⏱️  构建耗时: ${result.duration}ms\n`)
      }
      else {
        console.error(chalk.red('❌ 构建失败!'))
        if (result.errors) {
          result.errors.forEach((error: any) => {
            console.error(chalk.red(`  ${error.message}`))
          })
        }
        process.exit(1)
      }
    }
    catch (error) {
      console.error(chalk.red('❌ 构建过程中发生错误:'), error)
      process.exit(1)
    }
  }

  /**
   * 处理 Dev 命令
   */
  private async handleDev(input: string, options: DevCommand): Promise<void> {
    try {
      const config = await this.loadConfig()

      if (input && config) {
        config.config.input = input
      }

      process.stdout.write(`${chalk.blue('🚀 启动开发服务器...')}\n`)
      await this.commandRunner.runDev(config, options)
    }
    catch (error) {
      console.error(chalk.red('❌ 开发服务器启动失败:'), error)
      process.exit(1)
    }
  }

  /**
   * 处理 Analyze 命令
   */
  private async handleAnalyze(dir: string, options: AnalyzeCommand): Promise<void> {
    try {
      if (dir) {
        this.commandRunner = new CommandRunner(dir, this.options.verbose!)
      }

      const result = await this.commandRunner.runAnalyze(options)

      process.stdout.write(`${chalk.green('✅ 项目分析完成!')}\n`)
      process.stdout.write(`\n📊 项目类型: ${chalk.cyan(result.projectType)}\n`)
      process.stdout.write(`📁 文件数量: ${chalk.cyan(result.files.length)}\n`)
      process.stdout.write(`🎯 入口文件: ${chalk.cyan(result.entryPoints.join(', '))}\n`)

      if (result.recommendations.length > 0) {
        process.stdout.write('\n💡 建议:\n')
        result.recommendations.forEach((rec: any) => {
          process.stdout.write(`  ${chalk.yellow('•')} ${rec}\n`)
        })
      }

      if (result.issues.length > 0) {
        process.stdout.write('\n⚠️  问题:\n')
        result.issues.forEach((issue: any) => {
          process.stdout.write(`  ${chalk.red('•')} ${issue}\n`)
        })
      }
    }
    catch (error) {
      console.error(chalk.red('❌ 项目分析失败:'), error)
      process.exit(1)
    }
  }

  /**
   * 处理 Init 命令
   */
  private async handleInit(name: string, options: InitCommand): Promise<void> {
    try {
      if (name) {
        options.name = name
      }

      const result = await this.commandRunner.runInit(options)

      if (result.success) {
        process.stdout.write(`${chalk.green('✅ 项目初始化成功!')}\n`)
        process.stdout.write(`📁 项目路径: ${chalk.cyan(result.path)}\n`)

        if (result.files.length > 0) {
          process.stdout.write('\n📄 创建的文件:\n')
          result.files.forEach((file: any) => {
            process.stdout.write(`  ${chalk.cyan(file)}\n`)
          })
        }
      }
      else {
        console.error(chalk.red('❌ 项目初始化失败!'))
        process.exit(1)
      }
    }
    catch (error) {
      console.error(chalk.red('❌ 项目初始化过程中发生错误:'), error)
      process.exit(1)
    }
  }

  /**
   * 加载配置文件
   */
  private async loadConfig() {
    try {
      if (this.options.config) {
        return await this.configLoader.loadConfigFile(this.options.config)
      }
      else {
        return await this.configLoader.discoverConfig()
      }
    }
    catch (error) {
      if (this.options.verbose) {
        console.warn(chalk.yellow('⚠️  配置文件加载失败:'), error)
      }
      return null
    }
  }

  /**
   * 运行 CLI
   */
  async run(argv?: string[]): Promise<void> {
    try {
      this.cli.parse(argv)
    }
    catch (error) {
      console.error(chalk.red('❌ CLI 运行失败:'), error)
      process.exit(1)
    }
  }
}
