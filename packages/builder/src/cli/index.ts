/**
 * CLI 主模块
 * 处理命令行参数解析和命令分发
 */

import type { CliOptions } from '../types'
import chalk from 'chalk'
import { Command } from 'commander'
import { loadUserConfig } from '../utils/config-loader'
import { Logger } from '../utils/logger'
import { AnalyzeCommand } from './commands/analyze'
import { BuildCommand } from './commands/build'
import { InitCommand } from './commands/init'
import { WatchCommand } from './commands/watch'

const logger = new Logger('CLI')

/**
 * 创建 CLI 程序
 */
function createProgram(): Command {
  const program = new Command()

  program
    .name('ldesign-builder')
    .description('智能前端库打包工具 - 基于 Rollup JavaScript API 的零配置多格式输出解决方案')
    .version(getVersion())
    .option('-c, --config <path>', '指定配置文件路径')
    .option('-v, --verbose', '启用详细日志输出')
    .option('--silent', '静默模式，只输出错误信息')

  // 构建命令
  program
    .command('build')
    .description('构建项目')
    .argument('[input]', '入口文件或目录')
    .option('-o, --outDir <dir>', '输出目录', 'dist')
    .option('-f, --format <formats>', '输出格式 (esm,cjs,iife,umd)', 'esm,cjs,iife,umd')
    .option('-m, --mode <mode>', '构建模式', 'production')
    .option('--dts', '生成 TypeScript 声明文件')
    .option('--no-dts', '不生成 TypeScript 声明文件')
    .option('--minify', '压缩输出代码')
    .option('--no-minify', '不压缩输出代码')
    .option('--sourcemap', '生成 source map')
    .option('--no-sourcemap', '不生成 source map')
    .option('--clean', '构建前清理输出目录')
    .option('--no-clean', '构建前不清理输出目录')
    .action(async (input: string, options: any) => {
      const buildCommand = new BuildCommand()
      const user = await loadUserConfig(process.cwd())
      await buildCommand.execute(input, { ...user, ...options })
    })

  // 监听模式
  program
    .command('watch')
    .description('监听文件变化并自动重新构建')
    .argument('[input]', '入口文件或目录')
    .option('-o, --outDir <dir>', '输出目录', 'dist')
    .option('-f, --format <formats>', '输出格式 (esm,cjs,iife,umd)', 'esm,cjs')
    .option('-m, --mode <mode>', '构建模式', 'development')
    .option('--dts', '生成 TypeScript 声明文件')
    .option('--no-dts', '不生成 TypeScript 声明文件')
    .action(async (input: string, options: any) => {
      const watchCommand = new WatchCommand()
      const user = await loadUserConfig(process.cwd())
      await watchCommand.execute(input, { ...user, ...options })
    })

  // 初始化命令
  program
    .command('init')
    .description('初始化项目配置')
    .option('-t, --template <template>', '项目模板 (vue,react,vanilla)', 'vanilla')
    .option('--typescript', '使用 TypeScript')
    .option('--no-typescript', '不使用 TypeScript')
    .action(async (options: any) => {
      const initCommand = new InitCommand()
      await initCommand.execute(options)
    })

  // 分析命令
  program
    .command('analyze')
    .description('分析项目结构和依赖关系')
    .argument('[input]', '分析目录', '.')
    .option('--json', '以 JSON 格式输出结果')
    .option('--output <file>', '将结果保存到文件')
    .action(async (input: string, options: any) => {
      const analyzeCommand = new AnalyzeCommand()
      await analyzeCommand.execute(input, options)
    })

  return program
}

/**
 * 获取版本号
 */
function getVersion(): string {
  try {
    const packageJson = require('../../package.json')
    return packageJson.version || '1.0.0'
  }
  catch {
    return '1.0.0'
  }
}

/**
 * 设置全局错误处理
 */
function setupErrorHandling(): void {
  // 处理未捕获的异常
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error)
    process.exit(1)
  })

  // 处理未处理的 Promise 拒绝
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
    process.exit(1)
  })

  // 处理 SIGINT 信号 (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n')
    logger.info('构建已取消')
    process.exit(0)
  })

  // 处理 SIGTERM 信号
  process.on('SIGTERM', () => {
    logger.info('收到终止信号，正在退出...')
    process.exit(0)
  })
}

/**
 * 显示欢迎信息
 */
function showWelcome(): void {
  const version = getVersion()
  console.log()
  console.log(chalk.cyan.bold('🚀 LDesign Builder'))
  console.log(chalk.gray(`   智能前端库打包工具 v${version}`))
  console.log(chalk.gray('   基于 Rollup JavaScript API 的零配置多格式输出解决方案'))
  console.log()
}

/**
 * 运行 CLI
 */
export async function runCli(): Promise<void> {
  try {
    // 设置错误处理
    setupErrorHandling()

    // 创建程序
    const program = createProgram()

    // 解析命令行参数
    const args = process.argv

    // 如果没有提供命令，显示帮助信息
    if (args.length <= 2) {
      showWelcome()
      program.help()
      return
    }

    // 如果是 --version 或 -V，显示版本信息
    if (args.includes('--version') || args.includes('-V')) {
      console.log(getVersion())
      return
    }

    // 如果是 --help 或 -h，显示帮助信息
    if (args.includes('--help') || args.includes('-h')) {
      showWelcome()
      program.help()
      return
    }

    // 解析并执行命令
    await program.parseAsync(args)
  }
  catch (error) {
    logger.error('CLI 执行失败:', error)
    process.exit(1)
  }
}

// 导出类型
export type { CliOptions }
