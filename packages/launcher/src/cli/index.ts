/**
 * CLI 工具主入口
 * 
 * 基于 @ldesign/kit 包的 CLI 工具实现命令行接口
 * 支持开发服务器、构建、预览等核心功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../utils/logger'
import type { CliConfig, CliContext } from '../types'
import { CliCommand } from '../types'
import { DevCommand } from './commands/dev'
import { BuildCommand } from './commands/build'
import { PreviewCommand } from './commands/preview'
import { ConfigCommand } from './commands/config'
import { HelpCommand } from './commands/help'
import { VersionCommand } from './commands/version'

/**
 * 创建 CLI 应用
 * 
 * @param config - CLI 配置
 * @returns CLI 应用实例
 */
export function createCli(config?: Partial<CliConfig>) {
  // 根据环境变量和参数决定日志级别和模式
  const isDebug = process.argv.includes('--debug') || process.argv.includes('-d')
  const isSilent = process.argv.includes('--silent') || process.argv.includes('-s')

  const logger = new Logger('CLI', {
    level: isSilent ? 'silent' : (isDebug ? 'debug' : 'info'),
    colors: true,
    compact: !isDebug // 非 debug 模式使用简洁输出
  })

  const defaultConfig: CliConfig = {
    name: '@ldesign/launcher',
    version: '1.0.0',
    description: '基于 Vite JavaScript API 的前端项目启动器',
    commands: [],
    globalOptions: [
      {
        name: 'config',
        alias: 'c',
        description: '指定配置文件路径',
        type: 'string'
      },
      {
        name: 'mode',
        alias: 'm',
        description: '指定运行模式 (development, production, test)',
        type: 'string',
        choices: ['development', 'production', 'test']
      },
      {
        name: 'debug',
        alias: 'd',
        description: '启用调试模式',
        type: 'boolean',
        default: false
      },
      {
        name: 'silent',
        alias: 's',
        description: '静默模式',
        type: 'boolean',
        default: false
      },
      {
        name: 'help',
        alias: 'h',
        description: '显示帮助信息',
        type: 'boolean',
        default: false
      },
      {
        name: 'version',
        alias: 'v',
        description: '显示版本信息',
        type: 'boolean',
        default: false
      }
    ],
    help: {
      showExamples: true,
      showAliases: true,
      showDefaults: true,
      maxWidth: 80
    },
    theme: {
      primary: '#722ED1',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      info: '#1890ff',
      debug: '#722ED1',
      enableColors: true,
      enableIcons: true
    }
  }

  const mergedConfig = { ...defaultConfig, ...config }

  // 注册命令
  const commands = new Map<string, any>([
    ['dev', new DevCommand()],
    ['build', new BuildCommand()],
    ['preview', new PreviewCommand()],
    ['config', new ConfigCommand()],
    ['help', new HelpCommand()],
    ['version', new VersionCommand()]
  ])

  /**
   * 解析命令行参数
   * 
   * @param args - 命令行参数
   * @returns 解析结果
   */
  function parseArgs(args: string[]) {
    const result = {
      command: 'help' as CliCommand,
      options: {} as Record<string, any>,
      args: [] as string[]
    }

    let i = 0
    while (i < args.length) {
      const arg = args[i]

      if (arg.startsWith('--')) {
        // 长选项
        const [key, value] = arg.slice(2).split('=')
        if (value !== undefined) {
          result.options[key] = value
        } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          result.options[key] = args[++i]
        } else {
          result.options[key] = true
        }
      } else if (arg.startsWith('-')) {
        // 短选项
        const key = arg.slice(1)
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          result.options[key] = args[++i]
        } else {
          result.options[key] = true
        }
      } else if (!result.command || result.command === 'help') {
        // 命令
        if (commands.has(arg)) {
          result.command = arg as CliCommand
        } else {
          result.args.push(arg)
        }
      } else {
        // 参数
        result.args.push(arg)
      }

      i++
    }

    return result
  }

  /**
   * 创建 CLI 上下文
   * 
   * @param command - 命令
   * @param options - 选项
   * @param args - 参数
   * @returns CLI 上下文
   */
  function createContext(
    command: CliCommand,
    options: Record<string, any>,
    args: string[]
  ): CliContext {
    return {
      command,
      options,
      args,
      cwd: process.cwd(),
      configFile: options.config,
      interactive: process.stdin.isTTY,
      terminal: {
        width: process.stdout.columns || 80,
        height: process.stdout.rows || 24,
        supportsColor: process.stdout.hasColors?.() || false,
        isTTY: process.stdout.isTTY,
        type: process.env.TERM,
        supportsUnicode: process.env.LANG?.includes('UTF-8') || false
      },
      environment: {
        nodeVersion: process.version,
        npmVersion: process.env.npm_version,
        pnpmVersion: process.env.PNPM_VERSION,
        yarnVersion: process.env.YARN_VERSION,
        os: process.platform,
        arch: process.arch,
        memory: process.memoryUsage().heapTotal,
        env: process.env as Record<string, string>
      }
    }
  }

  /**
   * 运行 CLI
   * 
   * @param argv - 命令行参数
   */
  async function run(argv: string[] = process.argv.slice(2)) {
    try {
      // 解析参数
      const parsed = parseArgs(argv)

      // 处理全局选项
      if (parsed.options.help || parsed.command === 'help') {
        const helpCommand = commands.get('help')!
        const context = createContext(CliCommand.HELP, parsed.options, parsed.args)
        await helpCommand.handler(context)
        return
      }

      if (parsed.options.version || parsed.command === 'version') {
        const versionCommand = commands.get('version')!
        const context = createContext(CliCommand.VERSION, parsed.options, parsed.args)
        await versionCommand.handler(context)
        return
      }

      // 设置日志级别
      if (parsed.options.silent) {
        logger.setLevel('silent')
      } else if (parsed.options.debug) {
        logger.setLevel('debug')
      }

      // 获取命令处理器
      const commandHandler = commands.get(parsed.command)
      if (!commandHandler) {
        logger.error(`未知命令: ${parsed.command}`)
        logger.info('使用 --help 查看可用命令')
        process.exit(1)
      }

      // 创建上下文
      const context = createContext(parsed.command, parsed.options, parsed.args)

      // 验证命令
      if (commandHandler.validate) {
        const validation = commandHandler.validate(context)
        if (validation !== true) {
          logger.error(typeof validation === 'string' ? validation : '命令验证失败')
          process.exit(1)
        }
      }

      // 执行命令
      logger.debug('执行命令', {
        command: parsed.command,
        options: parsed.options,
        args: parsed.args
      })

      await commandHandler.handler(context)

    } catch (error) {
      logger.error('CLI 执行失败', { error: (error as Error).message })

      if (logger.getLevel() === 'debug') {
        console.error((error as Error).stack)
      }

      process.exit(1)
    }
  }

  /**
   * 显示帮助信息
   * 
   * @param commandName - 命令名称（可选）
   */
  function showHelp(commandName?: string) {
    const helpCommand = commands.get('help')!
    const context = createContext(CliCommand.HELP, {}, commandName ? [commandName] : [])
    helpCommand.handler(context)
  }

  /**
   * 显示版本信息
   */
  function showVersion() {
    const versionCommand = commands.get('version')!
    const context = createContext(CliCommand.VERSION, {}, [])
    versionCommand.handler(context)
  }

  return {
    run,
    showHelp,
    showVersion,
    config: mergedConfig,
    commands,
    logger
  }
}

// 默认导出
export default createCli
