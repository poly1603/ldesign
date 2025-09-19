#!/usr/bin/env node

/**
 * @ldesign/config-editor CLI 工具
 * 
 * 提供命令行界面用于启动可视化配置编辑器
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Command } from 'commander'
import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'

// 获取当前文件的目录路径（ESM 兼容）
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const program = new Command()

// 程序基本信息
program
  .name('config-editor')
  .description('LDesign 可视化配置编辑器')
  .version('1.0.0')

// ui start 命令
program
  .command('start')
  .alias('ui')
  .description('启动可视化配置编辑器界面')
  .option('-p, --port <port>', '服务器端口', '3002')
  .option('-h, --host <host>', '服务器主机', 'localhost')
  .option('--client-port <port>', '客户端端口', '3001')
  .option('--no-open', '不自动打开浏览器')
  .option('--cwd <path>', '工作目录', process.cwd())
  .action(async (options) => {
    console.log('🚀 启动配置编辑器...')
    console.log(`📍 工作目录: ${options.cwd}`)
    console.log(`🌐 服务地址: http://${options.host}:${options.port}`)

    try {
      // 启动后端服务器
      const serverPath = join(__dirname, 'server', 'start.js')
      if (existsSync(serverPath)) {
        const serverProcess = spawn('node', [serverPath], {
          stdio: 'inherit',
          env: {
            ...process.env,
            PORT: options.port,
            HOST: options.host,
            CWD: options.cwd,
            NO_OPEN: options.open ? 'false' : 'true'
          }
        })

        serverProcess.on('error', (error) => {
          console.error('❌ 服务启动失败:', error)
          process.exit(1)
        })

        console.log('✅ 配置编辑器已启动')
        console.log(`🔗 访问地址: http://${options.host}:${options.port}`)

        // 监听进程退出
        process.on('SIGINT', () => {
          console.log('\n正在关闭服务器...')
          serverProcess.kill('SIGINT')
          process.exit(0)
        })

      } else {
        console.error('❌ 找不到服务器文件，请先构建项目')
        console.log('💡 提示: 运行 pnpm run build 构建项目')
        process.exit(1)
      }

    } catch (error) {
      console.error('❌ 启动失败:', error)
      process.exit(1)
    }
  })

// dev 命令（开发模式）
program
  .command('dev')
  .description('开发模式启动（热重载）')
  .option('-p, --port <port>', '服务器端口', '3002')
  .option('-h, --host <host>', '服务器主机', 'localhost')
  .option('--client-port <port>', '客户端端口', '3001')
  .option('--cwd <path>', '工作目录', process.cwd())
  .action(async (options) => {
    console.log('🚀 开发模式启动中...')

    // 在开发模式下，我们需要同时启动前端和后端
    // 这里可以集成 concurrently 或类似工具
    console.log('💡 请使用 pnpm run dev 启动开发模式')
  })

// 解析命令行参数
program.parse()

// 如果没有提供命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
