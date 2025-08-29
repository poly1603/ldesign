/**
 * 预览命令
 */

import chalk from 'chalk'
import { createLauncher } from '../../index'
import type { PreviewOptions } from '../../types'

export class PreviewCommand {
  async execute(root: string, options: any): Promise<void> {
    try {
      console.log(chalk.cyan('👀 启动预览服务器...'))
      console.log(chalk.gray(`   项目目录: ${root}`))
      
      const launcher = createLauncher({
        logLevel: options.verbose ? 'info' : options.silent ? 'error' : 'warn',
        mode: 'production'
      })

      const previewOptions: PreviewOptions = {
        port: parseInt(options.port) || 4173,
        host: options.host || 'localhost',
        open: options.open !== false
      }

      const server = await launcher.preview(root, previewOptions)
      
      console.log()
      console.log(chalk.green('✅ 预览服务器启动成功!'))
      console.log(chalk.blue(`📍 本地地址: http://${previewOptions.host}:${previewOptions.port}`))
      console.log(chalk.gray('   按 Ctrl+C 停止服务器'))
      console.log()

      // 保持进程运行
      process.stdin.resume()
    } catch (error) {
      console.error(chalk.red('❌ 启动预览服务器失败:'))
      console.error(chalk.red(`   ${error instanceof Error ? error.message : String(error)}`))
      process.exit(1)
    }
  }
}
