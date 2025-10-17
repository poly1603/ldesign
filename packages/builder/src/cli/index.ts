#!/usr/bin/env node

/**
 * @ldesign/builder CLI 主入口
 * 
 * 提供命令行接口来使用 @ldesign/builder
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { Command } from 'commander'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { buildCommand } from './commands/build'
import { watchCommand } from './commands/watch'
import { initCommand } from './commands/init'
import { analyzeCommand } from './commands/analyze'
import { cleanCommand } from './commands/clean'
import { examplesCommand } from './commands/examples'
import { logger, setLogLevel } from '../utils/logger'
import { setupGlobalErrorHandling } from '../utils/error-handler'

// ES 模块中获取 __dirname，兼容 CJS
const getFilename = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    return fileURLToPath(import.meta.url)
  }
  // CJS 环境下的 fallback
  return typeof __filename !== 'undefined' ? __filename : ''
}

const getDirname = (filename: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    return dirname(filename)
  }
  // CJS 环境下的 fallback
  return typeof __dirname !== 'undefined' ? __dirname : ''
}

const __filename = getFilename()
const __dirname = getDirname(__filename)

// 设置全局错误处理
setupGlobalErrorHandling()

/**
 * 创建 CLI 程序
 */
function createCLI(): Command {
  const program = new Command()

  // 基本信息
  program
    .name('@ldesign/builder')
    .description('基于 rollup/rolldown 的通用库打包工具')
    .version(getVersion(), '-v, --version', '显示版本号')

  // 全局选项
  program
    .option('-c, --config <path>', '指定配置文件路径')
    .option('--bundler <bundler>', '指定打包核心 (rollup|rolldown)', 'rollup')
    .option('--mode <mode>', '指定构建模式 (development|production)', 'production')
    .option('--log-level <level>', '设置日志级别 (silent|error|warn|info|debug|verbose)', 'info')
    .option('--no-colors', '禁用颜色输出')
    .option('--silent', '静默模式')
    .option('--debug', '启用调试模式')

  // 注册命令
  program.addCommand(buildCommand)
  program.addCommand(watchCommand)
  program.addCommand(initCommand)
  program.addCommand(analyzeCommand)
  program.addCommand(cleanCommand)
  program.addCommand(examplesCommand)

  // 处理全局选项
  program.hook('preAction', (thisCommand) => {
    const options = thisCommand.opts()

    // 设置日志级别
    if (options.silent) {
      setLogLevel('silent')
    } else if (options.debug) {
      setLogLevel('debug')
    } else if (options.logLevel) {
      setLogLevel(options.logLevel)
    }

    // 设置颜色
    if (options.noColors) {
      process.env.NO_COLOR = '1'
    }
  })

  // 错误处理
  program.exitOverride((err) => {
    if (err.code === 'commander.help') {
      process.exit(0)
    }
    if (err.code === 'commander.version') {
      process.exit(0)
    }
    if (err.code === 'commander.helpDisplayed') {
      process.exit(0)
    }

    logger.error('命令执行失败:', err.message)
    process.exit(1)
  })

  return program
}

/**
 * 获取版本号
 */
function getVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '../../package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    return packageJson.version
  } catch {
    return '1.0.0'
  }
}

/**
 * 显示欢迎信息
 */
function showWelcome(): void {
  const version = getVersion()
  console.log(`\n@ldesign/builder v${version}\n`)
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    const program = createCLI()

    // 如果没有参数，显示帮助
    if (process.argv.length <= 2) {
      showWelcome()
      program.help()
      return
    }

    // 解析命令行参数
    await program.parseAsync(process.argv)

  } catch (error) {
    logger.error('CLI 启动失败:', error)
    process.exit(1)
  }
}

// 导出 CLI 类
export class BuilderCLI {
  static async createSimpleCLI() {
    return main()
  }
}

// 运行 CLI (ES 模块中检查是否为主模块)
if (typeof import.meta !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('未处理的错误:', error)
    process.exit(1)
  })
}

export { createCLI, main }
