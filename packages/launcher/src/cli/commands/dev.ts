/**
 * Dev 命令实现
 * 
 * 启动开发服务器命令
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../../utils/logger'
import { ViteLauncher } from '../../core/ViteLauncher'
import type { CliCommandDefinition, CliContext } from '../../types'
import { DEFAULT_PORT, DEFAULT_HOST } from '../../constants'
import pc from 'picocolors'
import { networkInterfaces } from 'node:os'
import { getPreferredLocalIP } from '../../utils/network.js'

/**
 * Dev 命令类
 */
export class DevCommand implements CliCommandDefinition {
  name = 'dev'
  aliases = ['serve', 'start']
  description = '启动开发服务器'
  usage = 'launcher dev [options]'

  options = [
    {
      name: 'port',
      alias: 'p',
      description: '指定端口号',
      type: 'number' as const,
      default: DEFAULT_PORT
    },
    {
      name: 'host',
      alias: 'H',
      description: '指定主机地址',
      type: 'string' as const,
      default: DEFAULT_HOST
    },
    {
      name: 'open',
      alias: 'o',
      description: '自动打开浏览器',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'https',
      description: '启用 HTTPS',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'force',
      alias: 'f',
      description: '强制重新构建依赖',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'cors',
      description: '启用 CORS',
      type: 'boolean' as const,
      default: true
    },
    {
      name: 'strictPort',
      description: '严格端口模式（端口被占用时不自动尝试下一个端口）',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'clearScreen',
      description: '启动时清屏',
      type: 'boolean' as const,
      default: true
    },
    {
      name: 'environment',
      alias: 'e',
      description: '指定环境名称（development, production, test, staging, preview）',
      type: 'string' as const
    }
  ]

  examples = [
    {
      description: '启动开发服务器',
      command: 'launcher dev'
    },
    {
      description: '在指定端口启动',
      command: 'launcher dev --port 8080'
    },
    {
      description: '允许外部访问',
      command: 'launcher dev --host 0.0.0.0'
    },
    {
      description: '启动后自动打开浏览器',
      command: 'launcher dev --open'
    },
    {
      description: '启用 HTTPS',
      command: 'launcher dev --https'
    },
    {
      description: '强制重新构建依赖',
      command: 'launcher dev --force'
    },
    {
      description: '使用开发环境配置',
      command: 'launcher dev --environment development'
    },
    {
      description: '使用生产环境配置',
      command: 'launcher dev --environment production'
    }
  ]

  /**
   * 验证命令参数
   *
   * @param context - CLI 上下文
   * @returns 验证结果
   */
  validate(context: CliContext): boolean | string {
    const { options } = context

    // 验证端口号
    if (options.port) {
      const port = Number(options.port)
      if (isNaN(port) || port < 1 || port > 65535) {
        return '端口号必须是 1-65535 之间的数字'
      }
    }

    // 验证主机地址
    if (options.host && typeof options.host !== 'string') {
      return '主机地址必须是字符串'
    }

    // 验证环境名称
    if (options.environment) {
      const validEnvironments = ['development', 'production', 'test', 'staging', 'preview']
      if (!validEnvironments.includes(options.environment)) {
        return `环境名称必须是以下之一: ${validEnvironments.join(', ')}`
      }
    }

    return true
  }

  /**
   * 执行命令
   *
   * @param context - CLI 上下文
   */
  async handler(context: CliContext): Promise<void> {
    const logger = new Logger('dev', {
      level: context.options.silent ? 'silent' : (context.options.debug ? 'debug' : 'info'),
      colors: context.terminal.supportsColor,
      compact: !context.options.debug // 非 debug 模式使用简洁输出
    })

    try {
      // 确定环境和模式
      const environment = context.options.environment || context.options.mode || 'development'
      const mode = context.options.mode || (environment === 'production' ? 'production' : 'development')

      // 显示环境标识 - 确保在最开始就显示
      const envLabel = environment === 'production' ? '🔴 PRODUCTION' :
        environment === 'staging' ? '🟡 STAGING' :
          environment === 'test' ? '🔵 TEST' : '🟢 DEVELOPMENT'

      // 立即输出环境标识，不依赖logger
      if (!context.options.silent) {
        console.log(`\n🚀 ${pc.cyan('LDesign Launcher')} - ${envLabel}`)
        console.log(`📁 ${pc.gray('工作目录:')} ${context.cwd}`)
        console.log(`⚙️  ${pc.gray('模式:')} ${mode}`)
        console.log('')
      }

      logger.info('正在启动开发服务器...')

      // 先创建基础的 ViteLauncher 实例，只传入必要的配置
      const launcherConfig: any = {
        launcher: {
          logLevel: context.options.silent ? 'silent' : (context.options.debug ? 'debug' : 'info'),
          mode: mode,
          debug: context.options.debug || false
        }
      }

      // 只有当明确指定了配置文件时才设置 configFile
      if (context.configFile) {
        launcherConfig.launcher.configFile = context.configFile
      }

      // 只在debug模式下输出详细信息
      if (context.options.debug) {
        logger.debug('创建 ViteLauncher 实例', {
          cwd: context.cwd,
          environment: environment,
          config: launcherConfig
        })
      }

      const launcher = new ViteLauncher({
        cwd: context.cwd,
        config: launcherConfig,
        environment: environment
      })

      // 构建命令行参数覆盖配置
      const cliOverrides: any = {
        mode: mode,
        clearScreen: context.options.clearScreen
      }

      // 只有当命令行明确指定了参数时才覆盖配置文件中的值
      if (context.options.host !== undefined) {
        cliOverrides.server = cliOverrides.server || {}
        cliOverrides.server.host = context.options.host
      }
      if (context.options.port !== undefined) {
        cliOverrides.server = cliOverrides.server || {}
        cliOverrides.server.port = context.options.port
      }
      if (context.options.open !== undefined) {
        cliOverrides.server = cliOverrides.server || {}
        cliOverrides.server.open = context.options.open
      }
      if (context.options.cors !== undefined) {
        cliOverrides.server = cliOverrides.server || {}
        cliOverrides.server.cors = context.options.cors
      }
      if (context.options.strictPort !== undefined) {
        cliOverrides.server = cliOverrides.server || {}
        cliOverrides.server.strictPort = context.options.strictPort
      }
      if (context.options.https !== undefined) {
        cliOverrides.server = cliOverrides.server || {}
        cliOverrides.server.https = context.options.https
      }
      if (context.options.force !== undefined) {
        cliOverrides.optimizeDeps = cliOverrides.optimizeDeps || {}
        cliOverrides.optimizeDeps.force = context.options.force
      }

      // 启动开发服务器，传入命令行覆盖配置
      await launcher.startDev(cliOverrides)

      // 仅保留错误监听，避免递归日志
      launcher.onError((error) => {
        logger.error('开发服务器错误: ' + error.message)
      })

      function renderServerBanner(
        title: string,
        items: Array<{ label: string; value: string }>
      ): string[] {
        const leftPad = '  '
        const labelPad = 4
        const rows = [
          `${pc.green('✔')} ${pc.bold(title)}`,
          ...items.map(({ label, value }) => {
            const l = (label + ':').padEnd(labelPad, ' ')
            return `${pc.dim('•')} ${pc.bold(l)} ${pc.cyan(value)}`
          }),
          `${pc.dim('•')} 提示: 按 ${pc.yellow('Ctrl+C')} 停止服务器`
        ]

        // 根据内容计算盒宽度
        const contentWidth = rows.reduce((m, s) => Math.max(m, stripAnsi(s).length), 0)
        const width = Math.min(Math.max(contentWidth + 4, 38), 80)
        const top = pc.dim('┌' + '─'.repeat(width - 2) + '┐')
        const bottom = pc.dim('└' + '─'.repeat(width - 2) + '┘')

        const padded = rows.map(r => {
          const visible = stripAnsi(r)
          const space = width - 2 - visible.length
          return pc.dim('│') + leftPad + r + ' '.repeat(Math.max(0, space - leftPad.length)) + pc.dim('│')
        })

        return [top, ...padded, bottom]
      }

      // 去除 ANSI 颜色后的长度计算辅助
      function stripAnsi(str: string) {
        // eslint-disable-next-line no-control-regex
        const ansiRegex = /[\u001B\u009B][[\]()#;?]*(?:((?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g
        return str.replace(ansiRegex, '')
      }

      launcher.onError((error) => {
        logger.error('开发服务器错误: ' + error.message)
      })

      // 处理进程退出
      process.on('SIGINT', async () => {
        logger.info('正在停止开发服务器...')
        try {
          await launcher.stopDev()
          await launcher.destroy()
          logger.success('开发服务器已停止')
          process.exit(0)
        } catch (error) {
          logger.error('停止开发服务器失败: ' + (error as Error).message)
          process.exit(1)
        }
      })

      process.on('SIGTERM', async () => {
        logger.info('收到终止信号，正在停止开发服务器...')
        try {
          await launcher.stopDev()
          await launcher.destroy()
          process.exit(0)
        } catch (error) {
          logger.error('停止开发服务器失败: ' + (error as Error).message)
          process.exit(1)
        }
      })

      // 开发服务器已在上面启动，这里不需要再次调用

      // 启动成功后，输出美化的地址信息与二维码
      const serverInfo = launcher.getServerInfo()
      if (serverInfo) {
        const localUrl = serverInfo.url || ''
        const localIP = getPreferredLocalIP()

        // 构建网络 URL：总是尝试生成网络地址
        let networkUrl: string | null = null

        // 如果 localUrl 包含 0.0.0.0，直接替换
        if (localUrl.includes('0.0.0.0')) {
          networkUrl = localUrl.replace('0.0.0.0', localIP)
        } else {
          // 否则，从 localUrl 中提取协议和端口，构建网络 URL
          try {
            const url = new URL(localUrl)
            // 如果是 localhost 或 127.0.0.1，替换为实际 IP
            if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
              networkUrl = `${url.protocol}//${localIP}:${url.port}${url.pathname}`
            } else {
              // 如果已经是 IP 地址，直接使用
              networkUrl = localUrl
            }
          } catch {
            // 如果解析失败，手动构建
            const protocol = serverInfo.https ? 'https' : 'http'
            networkUrl = `${protocol}://${localIP}:${serverInfo.port}/`
          }
        }

        const title = '开发服务器已启动'
        const entries: Array<{ label: string; value: string }> = [
          { label: '本地', value: localUrl }
        ]
        if (networkUrl) entries.push({ label: '网络', value: networkUrl })

        const boxLines = renderServerBanner(title, entries)
        for (const line of boxLines) logger.info(line)

        const qrTarget = (networkUrl || localUrl)
        try {
          if (!qrTarget) throw new Error('empty-url')

          // 优先尝试使用 'qrcode' 的终端输出
          let printed = false
          try {
            const qrlib: any = await import('qrcode')
            const qrcode = qrlib?.default || qrlib

            // 使用toString方法生成终端二维码
            const terminalQR = await qrcode.toString(qrTarget, {
              type: 'terminal',
              small: true
            })

            if (terminalQR && typeof terminalQR === 'string') {
              logger.info(pc.dim('二维码（扫码在手机上打开）：'))
              console.log()
              console.log(terminalQR)
              console.log()
              printed = true
            }
          } catch (e1) {
            logger.debug('尝试使用 qrcode 生成终端二维码失败: ' + (e1 as Error).message)
          }

          // 回退到 qrcode-terminal（如已安装）
          if (!printed) {
            try {
              const mod: any = await import('qrcode-terminal')
              const qrt = mod?.default || mod
              let qrOutput = ''
              qrt.generate(qrTarget, { small: true }, (q: string) => {
                qrOutput = q
              })
              if (qrOutput) {
                logger.info(pc.dim('二维码（扫码在手机上打开）：'))

                // 简化处理qrcode-terminal的输出
                const lines = qrOutput.split('\n').filter(line => line.trim())
                if (lines.length > 0) {
                  // 确保所有行长度一致
                  const maxWidth = Math.max(...lines.map(line => line.length))
                  const normalizedLines = lines.map(line => {
                    const padding = ' '.repeat(Math.max(0, maxWidth - line.length))
                    return line + padding
                  })

                  // 创建简洁的边框效果
                  const borderWidth = maxWidth + 4
                  const topBorder = '┌' + '─'.repeat(borderWidth - 2) + '┐'
                  const bottomBorder = '└' + '─'.repeat(borderWidth - 2) + '┘'
                  const emptyLine = '│' + ' '.repeat(borderWidth - 2) + '│'

                  const borderedQR = [
                    '',
                    topBorder,
                    emptyLine,
                    ...normalizedLines.map(line => '│ ' + line + ' │'),
                    emptyLine,
                    bottomBorder,
                    ''
                  ].join('\n')

                  console.log(borderedQR)
                  printed = true
                }
              }
            } catch (e2) {
              logger.debug('尝试使用 qrcode-terminal 生成终端二维码失败: ' + (e2 as Error).message)
            }
          }
        } catch (e) {
          logger.debug('二维码生成失败: ' + (e as Error).message)
        }
      }

      // 保持进程运行
      await new Promise(() => { }) // 永远等待，直到收到退出信号

    } catch (error) {
      logger.error('启动开发服务器失败: ' + (error as Error).message)

      if (context.options.debug) {
        console.error((error as Error).stack)
      }

      // 提供一些常见错误的解决建议
      const errorMessage = (error as Error).message.toLowerCase()

      if (errorMessage.includes('eaddrinuse') || errorMessage.includes('port')) {
        logger.info('端口可能被占用，请尝试：')
        logger.info('1. 使用不同的端口: launcher dev --port 8080')
        logger.info('2. 检查是否有其他服务占用该端口')
        logger.info('3. 使用 --strictPort 选项禁用自动端口选择')
      }

      if (errorMessage.includes('config') || errorMessage.includes('file not found')) {
        logger.info('配置文件问题，请检查：')
        logger.info('1. 配置文件是否存在')
        logger.info('2. 配置文件格式是否正确')
        logger.info('3. 使用 --config 指定配置文件路径')
      }

      process.exit(1)
    }
  }
}


