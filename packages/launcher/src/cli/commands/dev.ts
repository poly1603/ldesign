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
      logger.info('正在启动开发服务器...')

      // 创建 ViteLauncher 实例
      const launcher = new ViteLauncher({
        cwd: context.cwd,
        config: {
          configFile: context.configFile,
          mode: context.options.mode || 'development',
          clearScreen: context.options.clearScreen,
          server: {
            host: context.options.host || DEFAULT_HOST,
            port: context.options.port || DEFAULT_PORT,
            open: context.options.open || false,
            cors: context.options.cors !== false,
            strictPort: context.options.strictPort || false,
            ...(context.options.https && { https: true })
          } as any,
          optimizeDeps: {
            force: context.options.force || false
          },
          launcher: {
            logLevel: context.options.debug ? 'debug' : 'info',
            mode: context.options.mode || 'development',
            debug: context.options.debug || false
          }
        }
      })

      // 仅保留错误监听，避免递归日志
      launcher.onError((error) => {
        logger.error('开发服务器错误', { error: error.message })
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
        logger.error('开发服务器错误', { error: error.message })
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
          logger.error('停止开发服务器失败', { error: (error as Error).message })
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
          logger.error('停止开发服务器失败', { error: (error as Error).message })
          process.exit(1)
        }
      })

      // 启动开发服务器
      await launcher.startDev()

      // 启动成功后，输出美化的地址信息与二维码
      const serverInfo = launcher.getServerInfo()
      if (serverInfo) {
        const localUrl = serverInfo.url || ''
        const hasNetwork = serverInfo.host === '0.0.0.0' && !!serverInfo.url
        const networkUrl = hasNetwork ? localUrl.replace('0.0.0.0', getLocalIP()) : null

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
          const mod: any = await import('qrcode-terminal')
          const qrt = mod?.default || mod
          let qrOutput = ''
          qrt.generate(qrTarget, { small: true }, (q: string) => {
            qrOutput = q
          })

          if (qrOutput) {
            logger.info(pc.dim('二维码（扫码在手机上打开）：'))
            console.log('\n' + qrOutput + '\n')
          }
        } catch {
          logger.info(
            pc.dim(
              '提示: 安装 qrcode-terminal 可显示访问地址二维码（在 packages/launcher 执行：pnpm add qrcode-terminal -D）'
            )
          )
        }
      }

      // 保持进程运行
      await new Promise(() => { }) // 永远等待，直到收到退出信号

    } catch (error) {
      logger.error('启动开发服务器失败', { error: (error as Error).message })

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

/**
 * 获取本地 IP 地址
 * 
 * @returns 本地 IP 地址
 */
function getLocalIP(): string {
  const interfaces = networkInterfaces()

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if ((iface as any).family === 'IPv4' && !(iface as any).internal) {
        return (iface as any).address as string
      }
    }
  }

  return 'localhost'
}
