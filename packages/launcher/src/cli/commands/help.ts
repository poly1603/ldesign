/**
 * Help 命令实现
 * 
 * 显示帮助信息命令
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../../utils/logger'
import type { CliCommandDefinition, CliContext } from '../../types'
import { CLI_HELP_MESSAGES } from '../../constants'

/**
 * Help 命令类
 */
export class HelpCommand implements CliCommandDefinition {
  name = 'help'
  aliases = ['h']
  description = '显示帮助信息'
  usage = 'launcher help [command]'

  options = [
    {
      name: 'all',
      alias: 'a',
      description: '显示所有命令的详细帮助',
      type: 'boolean' as const,
      default: false
    }
  ]

  examples = [
    {
      description: '显示主帮助信息',
      command: 'launcher help'
    },
    {
      description: '显示特定命令的帮助',
      command: 'launcher help dev'
    },
    {
      description: '显示所有命令的详细帮助',
      command: 'launcher help --all'
    }
  ]

  /**
   * 执行命令
   * 
   * @param context - CLI 上下文
   */
  async handler(context: CliContext): Promise<void> {
    const logger = new Logger('help', {
      level: 'info',
      colors: context.terminal.supportsColor
    })

    const commandName = context.args[0]

    if (commandName) {
      // 显示特定命令的帮助
      this.showCommandHelp(commandName, logger)
    } else if (context.options.all) {
      // 显示所有命令的详细帮助
      this.showAllCommandsHelp(logger)
    } else {
      // 显示主帮助信息
      this.showMainHelp(logger)
    }
  }

  /**
   * 显示主帮助信息
   */
  private showMainHelp(logger: Logger): void {
    const lines = CLI_HELP_MESSAGES.MAIN_HELP.trim().split('\n')

    for (const line of lines) {
      if (line.startsWith('使用方法:')) {
        logger.info(this.colorize(line, 'cyan'))
      } else if (line.startsWith('命令:') || line.startsWith('选项:') || line.startsWith('示例:')) {
        logger.info(this.colorize(line, 'yellow'))
      } else if (line.trim().startsWith('launcher ')) {
        logger.info(`  ${this.colorize(line.trim(), 'green')}`)
      } else if (line.includes('--')) {
        // 选项行
        const parts = line.split(/\s{2,}/)
        if (parts.length >= 2) {
          const option = parts[0].trim()
          const description = parts[1].trim()
          logger.info(`  ${this.colorize(option, 'cyan')}  ${description}`)
        } else {
          logger.info(line)
        }
      } else if (line.trim().length > 0) {
        logger.info(line)
      } else {
        console.log() // 空行
      }
    }

    logger.info('')
    logger.info('获取更多帮助:')
    logger.info(`  ${this.colorize('launcher help <command>', 'green')}  显示特定命令的帮助`)
    logger.info(`  ${this.colorize('launcher help --all', 'green')}     显示所有命令的详细帮助`)
  }

  /**
   * 显示特定命令的帮助
   */
  private showCommandHelp(commandName: string, logger: Logger): void {
    const helpMessages: Record<string, string> = {
      dev: CLI_HELP_MESSAGES.DEV_HELP,
      build: CLI_HELP_MESSAGES.BUILD_HELP,
      preview: CLI_HELP_MESSAGES.PREVIEW_HELP,
      config: CLI_HELP_MESSAGES.CONFIG_HELP,
      ai: CLI_HELP_MESSAGES.AI_HELP,
      test: CLI_HELP_MESSAGES.TEST_HELP,
      dashboard: CLI_HELP_MESSAGES.DASHBOARD_HELP,
      plugin: CLI_HELP_MESSAGES.PLUGIN_HELP,
      cache: CLI_HELP_MESSAGES.CACHE_HELP
    }

    const helpMessage = helpMessages[commandName]

    if (!helpMessage) {
      logger.error(`未知命令: ${commandName}`)
      logger.info('可用命令: dev, build, preview, test, dashboard, ai, config, plugin, cache, help, version')
      return
    }

    const lines = helpMessage.trim().split('\n')

    for (const line of lines) {
      if (line.startsWith('使用方法:')) {
        logger.info(this.colorize(line, 'cyan'))
      } else if (line.startsWith('选项:') || line.startsWith('示例:')) {
        logger.info(this.colorize(line, 'yellow'))
      } else if (line.trim().startsWith('launcher ')) {
        logger.info(`  ${this.colorize(line.trim(), 'green')}`)
      } else if (line.includes('--')) {
        // 选项行
        const parts = line.split(/\s{2,}/)
        if (parts.length >= 2) {
          const option = parts[0].trim()
          const description = parts[1].trim()
          logger.info(`  ${this.colorize(option, 'cyan')}  ${description}`)
        } else {
          logger.info(line)
        }
      } else if (line.trim().length > 0) {
        logger.info(line)
      } else {
        console.log() // 空行
      }
    }
  }

  /**
   * 显示所有命令的详细帮助
   */
  private showAllCommandsHelp(logger: Logger): void {
    const commands = ['dev', 'build', 'preview', 'test', 'dashboard', 'ai', 'config', 'plugin', 'cache']

    logger.info(this.colorize('='.repeat(60), 'cyan'))
    logger.info(this.colorize('                @ldesign/launcher 详细帮助', 'cyan'))
    logger.info(this.colorize('='.repeat(60), 'cyan'))
    logger.info('')

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]

      logger.info(this.colorize(`${command.toUpperCase()} 命令`, 'yellow'))
      logger.info(this.colorize('-'.repeat(20), 'gray'))

      this.showCommandHelp(command, logger)

      if (i < commands.length - 1) {
        logger.info('')
        logger.info(this.colorize('-'.repeat(60), 'gray'))
        logger.info('')
      }
    }

    logger.info('')
    logger.info(this.colorize('更多信息:', 'yellow'))
    logger.info('  文档: https://github.com/ldesign/launcher')
    logger.info('  问题反馈: https://github.com/ldesign/launcher/issues')
  }

  /**
   * 为文本添加颜色
   */
  private colorize(text: string, color: string): string {
    // 简单的颜色映射
    const colors: Record<string, string> = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      gray: '\x1b[90m',
      reset: '\x1b[0m'
    }

    const colorCode = colors[color] || colors.white
    const resetCode = colors.reset

    return `${colorCode}${text}${resetCode}`
  }
}
