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
import { PluginCommand } from './commands/plugin'
import { CacheCommand } from './commands/cache'
import { TestCommand } from './commands/test'
import { DashboardCommand } from './commands/dashboard'
import { AICommand } from './commands/ai'
import { MicroCommand } from './commands/micro'
import { DeployCommand } from './commands/deploy'
import { MonitorCommand } from './commands/monitor'
import { VisualCommand } from './commands/visual'
import { TeamCommand } from './commands/team'

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
    ['test', new TestCommand()],
    ['dashboard', new DashboardCommand()],
    ['ai', new AICommand()],
    ['config', new ConfigCommand()],
    ['plugin', new PluginCommand()],
    ['cache', new CacheCommand()],
    ['micro', new MicroCommand()],
    ['deploy', new DeployCommand()],
    ['monitor', new MonitorCommand()],
    ['visual', new VisualCommand()],
    ['team', new TeamCommand()],
    ['help', new HelpCommand()],
    ['version', new VersionCommand()]
  ])

  /**
   * 解析命令行参数（基础解析，不处理别名与类型转换）
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
        // 短选项（不支持打包为 -abc 的组合，保持简单）
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
   * 规范化选项：处理别名映射与类型转换
   */
  function normalizeOptions(raw: Record<string, any>, command: CliCommand): Record<string, any> {
    const normalized: Record<string, any> = {}

    // 构建别名映射
    const aliasToName = new Map<string, string>()
    const typeMap = new Map<string, 'string' | 'number' | 'boolean' | 'array'>()

    const addDefs = (defs: any[] | undefined) => {
      if (!defs) return
      for (const d of defs) {
        if (!d || typeof d !== 'object') continue
        if (d.alias) aliasToName.set(String(d.alias), d.name)
        typeMap.set(d.name, d.type)
      }
    }

    addDefs(mergedConfig.globalOptions)
    const cmdDef = commands.get(command) as { options?: any[] } | undefined
    if (cmdDef && Array.isArray(cmdDef.options)) addDefs(cmdDef.options)

    // 应用别名映射
    for (const [key, value] of Object.entries(raw)) {
      const target = aliasToName.get(key) || key
      normalized[target] = value
    }

    // 类型转换
    for (const [name, type] of typeMap.entries()) {
      if (normalized[name] === undefined) continue
      const val = normalized[name]
      switch (type) {
        case 'number':
          if (typeof val !== 'number') {
            const n = Number(val)
            if (!Number.isNaN(n)) normalized[name] = n
          }
          break
        case 'boolean':
          if (typeof val !== 'boolean') {
            const s = String(val).toLowerCase()
            if (['1', 'true', 'yes', 'y'].includes(s)) normalized[name] = true
            else if (['0', 'false', 'no', 'n'].includes(s)) normalized[name] = false
          }
          break
        case 'array':
          if (!Array.isArray(val)) {
            normalized[name] = String(val).split(',').map(s => s.trim()).filter(Boolean)
          }
          break
        // string: 无需处理
      }
    }

    return normalized
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
    // 全局抑制 Node.js CJS API deprecated 警告
    const originalEmitWarning = process.emitWarning
    process.emitWarning = (warning: any, ...args: any[]) => {
      // 过滤掉 CJS API deprecated 警告
      if (typeof warning === 'string' && (warning.includes('deprecated') || warning.includes('vite-cjs-node-api-deprecated'))) {
        return
      }
      if (typeof warning === 'object' && warning.message && (warning.message.includes('deprecated') || warning.message.includes('vite-cjs-node-api-deprecated'))) {
        return
      }
      return originalEmitWarning.call(process, warning, ...args)
    }

    try {
      // 解析参数（基础）
      const parsed = parseArgs(argv)
      // 选项规范化（别名映射 + 类型转换）
      const normalizedOptions = normalizeOptions(parsed.options, parsed.command)

      // 处理全局选项（支持 -h/-v 等别名）
      // 先处理版本，再处理帮助，避免仅传 --version 时落入 help 分支
      if (normalizedOptions.version || parsed.command === 'version') {
        const versionCommand = commands.get('version')!
        const context = createContext(CliCommand.VERSION, normalizedOptions, parsed.args)
        await versionCommand.handler(context)
        return
      }

      if (normalizedOptions.help || parsed.command === 'help') {
        const helpCommand = commands.get('help')!
        const context = createContext(CliCommand.HELP, normalizedOptions, parsed.args)
        await helpCommand.handler(context)
        return
      }

      // 设置日志级别
      if (normalizedOptions.silent) {
        logger.setLevel('silent')
      } else if (normalizedOptions.debug) {
        logger.setLevel('debug')
      }

      // 获取命令处理器
      const commandHandler = commands.get(parsed.command)
      if (!commandHandler) {
        logger.error(`未知命令: ${parsed.command}`)
        logger.info('使用 --help 查看可用命令')
        process.exit(1)
      }

      // 创建上下文（使用规范化后的选项）
      const context = createContext(parsed.command, normalizedOptions, parsed.args)

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
        options: normalizedOptions,
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

// 移除默认导出，保持导出一致性
// export default createCli
