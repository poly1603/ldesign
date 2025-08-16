#!/usr/bin/env tsx

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 开发环境切换工具
 *
 * 提供便捷的方式在不同开发模式之间切换
 */

interface DevEnvironment {
  name: string
  description: string
  port: number
  config: string
  mode: 'built' | 'source'
  command: string[]
}

const environments: DevEnvironment[] = [
  {
    name: 'built',
    description: '构建产物模式 - 使用已构建的 @ldesign/* 包',
    port: 3001,
    config: 'vite.config.built.ts',
    mode: 'built',
    command: ['pnpm', 'run', 'dev:built'],
  },
  {
    name: 'source',
    description: '源码模式 - 直接引用源码目录，支持热更新',
    port: 3002,
    config: 'vite.config.source.ts',
    mode: 'source',
    command: ['pnpm', 'run', 'dev:source'],
  },
]

class DevEnvironmentSwitcher {
  private currentEnv: string | null = null

  constructor() {
    this.detectCurrentEnv()
  }

  /**
   * 检测当前环境
   */
  private detectCurrentEnv(): void {
    try {
      const packageJson = JSON.parse(
        readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
      )

      // 检查是否有环境标记
      this.currentEnv = process.env.VITE_DEV_MODE || 'built'
    } catch (error) {
      console.warn('无法检测当前环境:', error)
    }
  }

  /**
   * 显示所有可用环境
   */
  showEnvironments(): void {
    console.log('🔧 可用的开发环境:')
    console.log('='.repeat(60))

    environments.forEach((env, index) => {
      const current = this.currentEnv === env.name ? ' (当前)' : ''
      const status = this.currentEnv === env.name ? '🟢' : '⚪'

      console.log(`${status} ${index + 1}. ${env.name}${current}`)
      console.log(`   📝 ${env.description}`)
      console.log(`   🌐 端口: ${env.port}`)
      console.log(`   ⚙️  配置: ${env.config}`)
      console.log(`   🚀 命令: ${env.command.join(' ')}`)
      console.log('')
    })

    console.log('💡 提示:')
    console.log('   • 构建模式：更接近生产环境，启动速度快')
    console.log('   • 源码模式：支持热更新，便于调试开发')
    console.log('   • 对比模式：同时启动两种模式进行对比测试')
    console.log('')
  }

  /**
   * 启动指定环境
   */
  async startEnvironment(envName: string): Promise<void> {
    const env = environments.find(e => e.name === envName)

    if (!env) {
      console.error(`❌ 未找到环境: ${envName}`)
      console.log('可用环境:', environments.map(e => e.name).join(', '))
      return
    }

    console.log(`🚀 启动 ${env.name} 环境...`)
    console.log(`📝 ${env.description}`)
    console.log(`🌐 端口: ${env.port}`)
    console.log(`⚙️  配置: ${env.config}`)
    console.log('='.repeat(60))

    // 设置环境变量
    process.env.VITE_DEV_MODE = env.mode

    // 启动开发服务器
    const child = spawn(env.command[0], env.command.slice(1), {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
      env: {
        ...process.env,
        VITE_DEV_MODE: env.mode,
      },
    })

    child.on('error', error => {
      console.error(`❌ 启动失败:`, error)
    })

    child.on('close', code => {
      if (code !== 0) {
        console.error(`❌ 进程退出，代码: ${code}`)
      }
    })

    // 处理进程信号
    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止开发服务器...')
      child.kill('SIGINT')
    })

    process.on('SIGTERM', () => {
      console.log('\n🛑 正在停止开发服务器...')
      child.kill('SIGTERM')
    })
  }

  /**
   * 同时启动多个环境进行对比
   */
  async startComparison(): Promise<void> {
    console.log('🔄 启动环境对比模式...')
    console.log('将同时启动构建模式和源码模式进行对比')
    console.log('='.repeat(60))

    const child = spawn('pnpm', ['run', 'dev:compare'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
    })

    child.on('error', error => {
      console.error(`❌ 启动失败:`, error)
    })

    child.on('close', code => {
      if (code !== 0) {
        console.error(`❌ 进程退出，代码: ${code}`)
      }
    })

    // 处理进程信号
    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止所有开发服务器...')
      child.kill('SIGINT')
    })

    process.on('SIGTERM', () => {
      console.log('\n🛑 正在停止所有开发服务器...')
      child.kill('SIGTERM')
    })
  }

  /**
   * 交互式选择环境
   */
  async interactiveSelect(): Promise<void> {
    console.log('🎯 请选择要启动的开发环境:')
    console.log('='.repeat(60))

    environments.forEach((env, index) => {
      const current = this.currentEnv === env.name ? ' (当前)' : ''
      const status = this.currentEnv === env.name ? '🟢' : '⚪'

      console.log(`${status} ${index + 1}. ${env.name}${current}`)
      console.log(`   📝 ${env.description}`)
      console.log(`   🌐 端口: ${env.port}`)
      console.log('')
    })

    console.log('🔄 3. compare')
    console.log('   📝 对比模式 - 同时启动两种环境进行对比')
    console.log('   🌐 端口: 3001 + 3002')
    console.log('')

    console.log('请输入选项 (1-3) 或按 Ctrl+C 退出:')

    // 简单的输入处理（在实际项目中可以使用 inquirer 等库）
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    return new Promise(resolve => {
      process.stdin.on('data', async key => {
        const input = key.toString().trim()

        if (input === '1') {
          console.log('\n🚀 启动构建模式...')
          await this.startEnvironment('built')
          resolve()
        } else if (input === '2') {
          console.log('\n🚀 启动源码模式...')
          await this.startEnvironment('source')
          resolve()
        } else if (input === '3') {
          console.log('\n🚀 启动对比模式...')
          await this.startComparison()
          resolve()
        } else if (input === '\u0003') {
          // Ctrl+C
          console.log('\n👋 已取消')
          process.exit(0)
        } else {
          console.log(`❌ 无效选项: ${input}，请输入 1-3`)
        }
      })
    })
  }

  /**
   * 显示帮助信息
   */
  showHelp(): void {
    console.log(`
🔧 开发环境切换工具

用法:
  tsx scripts/dev-env-switcher.ts [命令] [选项]

命令:
  (无参数)            启动交互式选择界面
  list                显示所有可用环境
  start <env>         启动指定环境
  compare             同时启动多个环境进行对比
  select              启动交互式选择界面
  help                显示此帮助信息

环境:
  built               构建产物模式 (端口 3001)
  source              源码模式 (端口 3002)

示例:
  tsx scripts/dev-env-switcher.ts           # 交互式选择
  tsx scripts/dev-env-switcher.ts list      # 显示环境列表
  tsx scripts/dev-env-switcher.ts start built
  tsx scripts/dev-env-switcher.ts start source
  tsx scripts/dev-env-switcher.ts compare
  tsx scripts/dev-env-switcher.ts select    # 交互式选择

快捷命令:
  pnpm run env              # 交互式选择
  pnpm run env:list         # 显示环境列表
  pnpm run dev:built        # 启动构建模式
  pnpm run dev:source       # 启动源码模式
  pnpm run dev:compare      # 同时启动两种模式
`)
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  const switcher = new DevEnvironmentSwitcher()

  switch (command) {
    case 'list':
    case 'ls':
      switcher.showEnvironments()
      break

    case 'start':
      const envName = args[1]
      if (!envName) {
        console.error('❌ 请指定环境名称')
        switcher.showEnvironments()
        return
      }
      await switcher.startEnvironment(envName)
      break

    case 'compare':
    case 'comp':
      await switcher.startComparison()
      break

    case 'select':
    case 'choose':
    case 'interactive':
    case 'i':
      await switcher.interactiveSelect()
      break

    case 'help':
    case '--help':
    case '-h':
      switcher.showHelp()
      break

    default:
      // 如果没有参数，启动交互式选择
      if (args.length === 0) {
        await switcher.interactiveSelect()
      } else {
        switcher.showHelp()
      }
      break
  }
}

// 运行
main().catch(console.error)
