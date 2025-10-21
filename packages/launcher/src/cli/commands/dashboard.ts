/**
 * 监控面板命令
 * 
 * 启动性能监控面板
 */

import { Logger } from '../../utils/logger'
import { createDashboardServer } from '../../dashboard/server'
import type { DashboardServer } from '../../dashboard/server'
import chalk from 'chalk'

export interface DashboardCommandOptions {
  /** 服务端口 */
  port?: number
  /** 主机地址 */
  host?: string
  /** 自动打开浏览器 */
  open?: boolean
  /** 启用认证 */
  auth?: boolean
  /** 认证令牌 */
  token?: string
}

/**
 * 监控面板命令类
 */
export class DashboardCommand {
  name = 'dashboard'
  description = '启动性能监控面板'
  alias = 'dash'

  options = [
    {
      name: 'port',
      alias: 'p',
      description: '服务端口',
      type: 'number' as const,
      default: 9527
    },
    {
      name: 'host',
      alias: 'h',
      description: '主机地址',
      type: 'string' as const,
      default: 'localhost'
    },
    {
      name: 'open',
      alias: 'o',
      description: '自动打开浏览器',
      type: 'boolean' as const,
      default: true
    },
    {
      name: 'auth',
      description: '启用认证',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'token',
      alias: 't',
      description: '认证令牌',
      type: 'string' as const
    }
  ]

  examples = [
    {
      command: 'launcher dashboard',
      description: '启动监控面板（默认端口 9527）'
    },
    {
      command: 'launcher dashboard --port 8080',
      description: '指定端口启动'
    },
    {
      command: 'launcher dashboard --auth --token mytoken',
      description: '启用认证保护'
    }
  ]

  private logger: Logger
  private server?: DashboardServer

  constructor() {
    this.logger = new Logger('DashboardCommand')
  }

  /**
   * 执行命令
   */
  async execute(options: DashboardCommandOptions): Promise<void> {
    try {
      // 生成认证令牌
      let authToken = options.token
      if (options.auth && !authToken) {
        authToken = this.generateToken()
        this.logger.info(`生成认证令牌: ${chalk.yellow(authToken)}`)
      }

      // 创建服务器
      this.server = createDashboardServer({
        port: options.port,
        host: options.host,
        enableAuth: options.auth || false,
        authToken: authToken || ''
      })

      // 监听服务器事件
      this.setupEventListeners()

      // 启动服务器
      await this.server.start()

      const url = `http://${options.host || 'localhost'}:${options.port || 9527}`

      console.log('\n🎯 Dashboard 服务已启动')
      console.log('═'.repeat(50))

      console.log(`\n  访问地址: ${chalk.cyan(url)}`)

      if (options.auth) {
        console.log(`  认证令牌: ${chalk.yellow(authToken)}`)
        console.log('\n  请在 HTTP 请求头中添加: Authorization: Bearer <token>')
      }

      console.log('\n  按 Ctrl+C 停止服务')


      // 打开浏览器
      if (options.open) {
        await this.openBrowser(url)
      }

      // 保持进程运行
      process.stdin.resume()

      // 处理退出信号
      process.on('SIGINT', async () => {
        await this.cleanup()
        process.exit(0)
      })

      process.on('SIGTERM', async () => {
        await this.cleanup()
        process.exit(0)
      })

    } catch (error) {
      this.logger.error('启动监控面板失败:', error)
      process.exit(1)
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.server) return

    // 可以在这里添加更多事件监听
    this.server.on('error', (error) => {
      this.logger.error('服务器错误:', error)
    })
  }

  /**
   * 生成随机令牌
   */
  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }

  /**
   * 打开浏览器
   */
  private async openBrowser(url: string): Promise<void> {
    try {
      const { exec } = await import('child_process')

      const command = process.platform === 'win32' ? `start ${url}` :
        process.platform === 'darwin' ? `open ${url}` :
          `xdg-open ${url}`

      exec(command, (error) => {
        if (error) {
          this.logger.debug('无法自动打开浏览器')
        }
      })
    } catch (error) {
      this.logger.debug('无法打开浏览器')
    }
  }

  /**
   * 清理资源
   */
  private async cleanup(): Promise<void> {
    this.logger.info('正在关闭监控面板...')

    if (this.server) {
      await this.server.stop()
    }

    this.logger.info('监控面板已关闭')
  }
}
