/**
 * 开发服务器命令
 */

import chalk from 'chalk'
import { createLauncher } from '../../index'
import type { DevOptions } from '../../types'

export class DevCommand {
  async execute(root: string, options: any): Promise<void> {
    try {
      console.log(chalk.cyan('🚀 启动开发服务器...'))
      console.log(chalk.gray(`   项目目录: ${root}`))

      const launcher = createLauncher({
        logLevel: options.verbose ? 'info' : options.silent ? 'error' : 'warn',
        mode: 'development'
      })

      const devOptions: DevOptions = {
        port: parseInt(options.port) || 3000,
        host: options.host || 'localhost',
        open: options.open !== false
      }

      const server = await launcher.dev(root, devOptions)

      // 获取实际使用的端口和主机
      const actualPort = server.config.server?.port || 5173
      const actualHost = server.config.server?.host || 'localhost'

      console.log()
      console.log(chalk.green('✅ 开发服务器启动成功!'))
      console.log(chalk.blue(`📍 本地地址: http://${actualHost}:${actualPort}`))
      console.log(chalk.gray('   按 Ctrl+C 停止服务器'))
      console.log()

      // 保持进程运行
      process.stdin.resume()
    } catch (error) {
      console.error(chalk.red('❌ 启动开发服务器失败:'))
      console.error(chalk.red(`   ${error instanceof Error ? error.message : String(error)}`))
      process.exit(1)
    }
  }
}
