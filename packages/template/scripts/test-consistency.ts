#!/usr/bin/env node

import { spawn, ChildProcess } from 'child_process'
import { resolve } from 'path'
import { existsSync } from 'fs'

/**
 * 一键测试脚本 - 测试 src 和 es 打包产物的功能一致性
 */

interface TestConfig {
  name: string
  cwd: string
  command: string
  args: string[]
  port: number
  env?: Record<string, string>
}

const TEST_CONFIGS: TestConfig[] = [
  {
    name: 'src-test',
    cwd: resolve(__dirname, '../test-apps/src-test'),
    command: 'pnpm',
    args: ['dev'],
    port: 3001,
  },
  {
    name: 'es-test',
    cwd: resolve(__dirname, '../test-apps/es-test'),
    command: 'pnpm',
    args: ['dev'],
    port: 3002,
  },
]

class TestRunner {
  private processes: Map<string, ChildProcess> = new Map()
  private isShuttingDown = false

  constructor() {
    // 处理进程退出
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())
    process.on('exit', () => this.shutdown())
  }

  /**
   * 检查端口是否可用
   */
  private async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const net = require('net')
      const server = net.createServer()
      
      server.listen(port, () => {
        server.once('close', () => resolve(true))
        server.close()
      })
      
      server.on('error', () => resolve(false))
    })
  }

  /**
   * 等待端口可用
   */
  private async waitForPort(port: number, timeout = 30000): Promise<boolean> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      const available = await this.isPortAvailable(port)
      if (!available) {
        return true // 端口被占用，说明服务已启动
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    return false
  }

  /**
   * 安装依赖
   */
  private async installDependencies(config: TestConfig): Promise<void> {
    console.log(`📦 Installing dependencies for ${config.name}...`)
    
    if (!existsSync(resolve(config.cwd, 'package.json'))) {
      throw new Error(`package.json not found in ${config.cwd}`)
    }

    return new Promise((resolve, reject) => {
      const install = spawn('pnpm', ['install'], {
        cwd: config.cwd,
        stdio: 'inherit',
        shell: true,
      })

      install.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Dependencies installed for ${config.name}`)
          resolve()
        } else {
          reject(new Error(`Failed to install dependencies for ${config.name}`))
        }
      })

      install.on('error', reject)
    })
  }

  /**
   * 启动测试服务器
   */
  private async startServer(config: TestConfig): Promise<void> {
    console.log(`🚀 Starting ${config.name} server on port ${config.port}...`)

    // 检查端口是否已被占用
    const portAvailable = await this.isPortAvailable(config.port)
    if (!portAvailable) {
      console.log(`⚠️  Port ${config.port} is already in use, skipping ${config.name}`)
      return
    }

    return new Promise((resolve, reject) => {
      const process = spawn(config.command, config.args, {
        cwd: config.cwd,
        stdio: 'pipe',
        shell: true,
        env: {
          ...process.env,
          ...config.env,
        },
      })

      this.processes.set(config.name, process)

      let output = ''
      
      process.stdout?.on('data', (data) => {
        const text = data.toString()
        output += text
        
        // 检查服务是否启动成功
        if (text.includes('Local:') || text.includes(`localhost:${config.port}`)) {
          console.log(`✅ ${config.name} server started successfully`)
          resolve()
        }
      })

      process.stderr?.on('data', (data) => {
        console.error(`${config.name} stderr:`, data.toString())
      })

      process.on('error', (error) => {
        console.error(`Failed to start ${config.name}:`, error)
        reject(error)
      })

      process.on('close', (code) => {
        if (code !== 0 && !this.isShuttingDown) {
          console.error(`${config.name} exited with code ${code}`)
          reject(new Error(`${config.name} exited with code ${code}`))
        }
      })

      // 超时检查
      setTimeout(() => {
        if (!output.includes('Local:') && !output.includes(`localhost:${config.port}`)) {
          reject(new Error(`${config.name} failed to start within timeout`))
        }
      }, 30000)
    })
  }

  /**
   * 运行 Playwright 测试
   */
  private async runPlaywrightTests(): Promise<void> {
    console.log('🧪 Running Playwright tests...')

    return new Promise((resolve, reject) => {
      const test = spawn('pnpm', ['test:e2e'], {
        cwd: resolve(__dirname, '..'),
        stdio: 'inherit',
        shell: true,
      })

      test.on('close', (code) => {
        if (code === 0) {
          console.log('✅ All tests passed!')
          resolve()
        } else {
          reject(new Error(`Tests failed with code ${code}`))
        }
      })

      test.on('error', reject)
    })
  }

  /**
   * 关闭所有进程
   */
  private shutdown(): void {
    if (this.isShuttingDown) return
    this.isShuttingDown = true

    console.log('\n🛑 Shutting down test servers...')

    for (const [name, process] of this.processes) {
      console.log(`Stopping ${name}...`)
      process.kill('SIGTERM')
    }

    setTimeout(() => {
      for (const [name, process] of this.processes) {
        if (!process.killed) {
          console.log(`Force killing ${name}...`)
          process.kill('SIGKILL')
        }
      }
    }, 5000)
  }

  /**
   * 运行完整测试流程
   */
  async run(): Promise<void> {
    try {
      console.log('🎯 Starting Template Package Consistency Test\n')

      // 1. 构建项目
      console.log('🔨 Building template package...')
      await new Promise<void>((resolve, reject) => {
        const build = spawn('pnpm', ['run', 'build'], {
          cwd: resolve(__dirname, '..'),
          stdio: 'inherit',
          shell: true,
        })

        build.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Build completed successfully\n')
            resolve()
          } else {
            reject(new Error(`Build failed with code ${code}`))
          }
        })

        build.on('error', reject)
      })

      // 2. 安装测试应用依赖
      for (const config of TEST_CONFIGS) {
        await this.installDependencies(config)
      }

      console.log('')

      // 3. 启动测试服务器
      const serverPromises = TEST_CONFIGS.map(config => this.startServer(config))
      await Promise.all(serverPromises)

      console.log('')

      // 4. 等待服务器完全启动
      console.log('⏳ Waiting for servers to be ready...')
      for (const config of TEST_CONFIGS) {
        const ready = await this.waitForPort(config.port)
        if (!ready) {
          throw new Error(`Server on port ${config.port} failed to start`)
        }
      }

      console.log('✅ All servers are ready\n')

      // 5. 运行测试
      await this.runPlaywrightTests()

      console.log('\n🎉 All tests completed successfully!')

    } catch (error) {
      console.error('\n❌ Test failed:', error)
      process.exit(1)
    } finally {
      this.shutdown()
    }
  }
}

// 运行测试
if (require.main === module) {
  const runner = new TestRunner()
  runner.run().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { TestRunner }
