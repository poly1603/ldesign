/**
 * Version 命令实现
 * 
 * 显示版本信息命令
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../../utils/logger'
import { FileSystem } from '../../utils/file-system'
import { PathUtils } from '../../utils/path-utils'
import type { CliCommandDefinition, CliContext } from '../../types'
import os from 'node:os'

/**
 * Version 命令类
 */
export class VersionCommand implements CliCommandDefinition {
  name = 'version'
  aliases = ['v']
  description = '显示版本信息'
  usage = 'launcher version [options]'

  options = [
    {
      name: 'json',
      alias: 'j',
      description: '以 JSON 格式输出版本信息',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'verbose',
      alias: 'V',
      description: '显示详细的版本信息',
      type: 'boolean' as const,
      default: false
    }
  ]

  examples = [
    {
      description: '显示版本号',
      command: 'launcher version'
    },
    {
      description: '显示详细版本信息',
      command: 'launcher version --verbose'
    },
    {
      description: '以 JSON 格式输出版本信息',
      command: 'launcher version --json'
    }
  ]

  /**
   * 执行命令
   * 
   * @param context - CLI 上下文
   */
  async handler(context: CliContext): Promise<void> {
    const logger = new Logger('version', {
      level: 'info',
      colors: context.terminal.supportsColor && !context.options.json
    })

    try {
      const versionInfo = await this.getVersionInfo(context.cwd)

      if (context.options.json) {
        console.log(JSON.stringify(versionInfo, null, 2))
      } else if (context.options.verbose) {
        this.showVerboseVersion(versionInfo, logger)
      } else {
        this.showSimpleVersion(versionInfo, logger)
      }

    } catch (error) {
      logger.error('获取版本信息失败', { error: (error as Error).message })
      process.exit(1)
    }
  }

  /**
   * 获取版本信息
   */
  private async getVersionInfo(cwd: string): Promise<any> {
    const versionInfo: any = {
      launcher: '1.0.0',
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }

    try {
      // 尝试读取 package.json 获取准确的版本信息
      const packageJsonPath = PathUtils.join(__dirname, '../../../package.json')
      if (await FileSystem.exists(packageJsonPath)) {
        const packageJson = JSON.parse(await FileSystem.readFile(packageJsonPath, { encoding: 'utf-8' }))
        versionInfo.launcher = packageJson.version || '1.0.0'
      }
    } catch (error) {
      // 忽略错误，使用默认版本
    }

    try {
      // 获取 Vite 版本
      const vitePackagePath = PathUtils.join(cwd, 'node_modules/vite/package.json')
      if (await FileSystem.exists(vitePackagePath)) {
        const vitePackage = JSON.parse(await FileSystem.readFile(vitePackagePath, { encoding: 'utf-8' }))
        versionInfo.vite = vitePackage.version
      }
    } catch (error) {
      // Vite 可能未安装
    }

    try {
      // 获取包管理器版本
      if (process.env.npm_version) {
        versionInfo.npm = process.env.npm_version
      }

      if (process.env.PNPM_VERSION) {
        versionInfo.pnpm = process.env.PNPM_VERSION
      }

      if (process.env.YARN_VERSION) {
        versionInfo.yarn = process.env.YARN_VERSION
      }
    } catch (error) {
      // 忽略错误
    }

    try {
      // 获取系统信息
      versionInfo.system = {
        platform: process.platform,
        arch: process.arch,
        release: os.release(),
        cpus: os.cpus().length,
        memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB'
      }
    } catch (error) {
      // 忽略错误
    }

    return versionInfo
  }

  /**
   * 显示简单版本信息
   */
  private showSimpleVersion(versionInfo: any, logger: Logger): void {
    logger.info(`@ldesign/launcher v${versionInfo.launcher}`)

    if (versionInfo.vite) {
      logger.info(`vite v${versionInfo.vite}`)
    }

    logger.info(`node ${versionInfo.node}`)
  }

  /**
   * 显示详细版本信息
   */
  private showVerboseVersion(versionInfo: any, logger: Logger): void {
    logger.info(this.colorize('='.repeat(50), 'cyan'))
    logger.info(this.colorize('           @ldesign/launcher 版本信息', 'cyan'))
    logger.info(this.colorize('='.repeat(50), 'cyan'))
    logger.info('')

    // 核心版本
    logger.info(this.colorize('核心版本:', 'yellow'))
    logger.info(`  launcher: ${this.colorize('v' + versionInfo.launcher, 'green')}`)

    if (versionInfo.vite) {
      logger.info(`  vite:     ${this.colorize('v' + versionInfo.vite, 'green')}`)
    }

    logger.info(`  node:     ${this.colorize(versionInfo.node, 'green')}`)
    logger.info('')

    // 包管理器
    logger.info(this.colorize('包管理器:', 'yellow'))

    if (versionInfo.npm) {
      logger.info(`  npm:      ${this.colorize('v' + versionInfo.npm, 'green')}`)
    }

    if (versionInfo.pnpm) {
      logger.info(`  pnpm:     ${this.colorize('v' + versionInfo.pnpm, 'green')}`)
    }

    if (versionInfo.yarn) {
      logger.info(`  yarn:     ${this.colorize('v' + versionInfo.yarn, 'green')}`)
    }

    if (!versionInfo.npm && !versionInfo.pnpm && !versionInfo.yarn) {
      logger.info(`  ${this.colorize('未检测到包管理器', 'gray')}`)
    }

    logger.info('')

    // 系统信息
    if (versionInfo.system) {
      logger.info(this.colorize('系统信息:', 'yellow'))
      logger.info(`  平台:     ${this.colorize(versionInfo.system.platform, 'green')}`)
      logger.info(`  架构:     ${this.colorize(versionInfo.system.arch, 'green')}`)
      logger.info(`  版本:     ${this.colorize(versionInfo.system.release, 'green')}`)
      logger.info(`  CPU:      ${this.colorize(versionInfo.system.cpus + ' 核', 'green')}`)
      logger.info(`  内存:     ${this.colorize(versionInfo.system.memory, 'green')}`)
      logger.info('')
    }

    // 环境信息
    logger.info(this.colorize('环境信息:', 'yellow'))
    logger.info(`  工作目录: ${this.colorize(process.cwd(), 'green')}`)
    logger.info(`  用户目录: ${this.colorize(os.homedir(), 'green')}`)

    if (process.env.NODE_ENV) {
      logger.info(`  NODE_ENV: ${this.colorize(process.env.NODE_ENV, 'green')}`)
    }

    logger.info('')

    // 链接信息
    logger.info(this.colorize('更多信息:', 'yellow'))
    logger.info(`  文档:     ${this.colorize('https://github.com/ldesign/launcher', 'blue')}`)
    logger.info(`  问题反馈: ${this.colorize('https://github.com/ldesign/launcher/issues', 'blue')}`)
    logger.info(`  更新日志: ${this.colorize('https://github.com/ldesign/launcher/releases', 'blue')}`)
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
