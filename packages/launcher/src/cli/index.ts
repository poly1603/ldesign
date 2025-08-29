/**
 * CLI 主模块
 * 处理命令行参数解析和命令分发
 */

import chalk from 'chalk'
import { Command } from 'commander'
import { DevCommand } from './commands/dev'
import { BuildCommand } from './commands/build'
import { PreviewCommand } from './commands/preview'
import { CreateCommand } from './commands/create'
import { DetectCommand } from './commands/detect'

/**
 * 创建 CLI 程序
 */
function createProgram(): Command {
  const program = new Command()

  program
    .name('ldesign-launcher')
    .description('前端项目启动器 - 基于 Vite 的零配置多框架开发工具')
    .version(getVersion())
    .option('-c, --config <path>', '指定配置文件路径')
    .option('-v, --verbose', '启用详细日志输出')
    .option('--silent', '静默模式，只输出错误信息')

  // 开发服务器命令
  program
    .command('dev')
    .description('启动开发服务器')
    .argument('[root]', '项目根目录', '.')
    .option('-p, --port <port>', '端口号', '3000')
    .option('--host <host>', '主机地址', 'localhost')
    .option('--open', '自动打开浏览器')
    .option('--no-open', '不自动打开浏览器')
    .action(async (root: string, options: any) => {
      const devCommand = new DevCommand()
      await devCommand.execute(root, options)
    })

  // 构建命令
  program
    .command('build')
    .description('构建项目')
    .argument('[root]', '项目根目录', '.')
    .option('-o, --outDir <dir>', '输出目录', 'dist')
    .option('-m, --mode <mode>', '构建模式', 'production')
    .option('--minify', '压缩输出代码')
    .option('--no-minify', '不压缩输出代码')
    .option('--sourcemap', '生成 source map')
    .option('--no-sourcemap', '不生成 source map')
    .action(async (root: string, options: any) => {
      const buildCommand = new BuildCommand()
      await buildCommand.execute(root, options)
    })

  // 预览命令
  program
    .command('preview')
    .description('预览构建结果')
    .argument('[root]', '项目根目录', '.')
    .option('-p, --port <port>', '端口号', '4173')
    .option('--host <host>', '主机地址', 'localhost')
    .option('--open', '自动打开浏览器')
    .option('--no-open', '不自动打开浏览器')
    .action(async (root: string, options: any) => {
      const previewCommand = new PreviewCommand()
      await previewCommand.execute(root, options)
    })

  // 创建项目命令
  program
    .command('create')
    .description('创建新项目')
    .argument('<name>', '项目名称')
    .option('-t, --type <type>', '项目类型 (vue2,vue3,react,lit,html,vanilla,vanilla-ts)', 'vue3')
    .option('-d, --dir <dir>', '项目目录')
    .action(async (name: string, options: any) => {
      const createCommand = new CreateCommand()
      await createCommand.execute(name, options)
    })

  // 检测项目命令
  program
    .command('detect')
    .description('检测项目类型')
    .argument('[root]', '项目根目录', '.')
    .option('--json', '以 JSON 格式输出结果')
    .action(async (root: string, options: any) => {
      const detectCommand = new DetectCommand()
      await detectCommand.execute(root, options)
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
    console.error('❌ Uncaught Exception:', error)
    process.exit(1)
  })

  // 处理未处理的 Promise 拒绝
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
    process.exit(1)
  })

  // 处理 SIGINT 信号 (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n')
    console.log('🛑 服务已停止')
    process.exit(0)
  })

  // 处理 SIGTERM 信号
  process.on('SIGTERM', () => {
    console.log('🛑 收到终止信号，正在退出...')
    process.exit(0)
  })
}

/**
 * 显示欢迎信息
 */
function showWelcome(): void {
  const version = getVersion()
  console.log()
  console.log(chalk.cyan.bold('🚀 LDesign Launcher'))
  console.log(chalk.gray(`   前端项目启动器 v${version}`))
  console.log(chalk.gray('   基于 Vite 的零配置多框架开发工具'))
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
    console.error('❌ CLI 执行失败:', error)
    process.exit(1)
  }
}
