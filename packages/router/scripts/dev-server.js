#!/usr/bin/env node

/**
 * @ldesign/router 开发服务器
 * 
 * 提供热重载、实时测试、性能监控等开发功能
 */

const { createServer } = require('vite')
const { resolve } = require('path')
const { spawn } = require('child_process')
const chokidar = require('chokidar')

/**
 * 开发服务器配置
 */
const devConfig = {
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  build: {
    watch: true,
    sourcemap: true
  },
  test: {
    watch: true,
    coverage: true
  },
  performance: {
    monitor: true,
    threshold: 100
  }
}

/**
 * 开发服务器类
 */
class DevServer {
  constructor(config = {}) {
    this.config = { ...devConfig, ...config }
    this.viteServer = null
    this.testProcess = null
    this.buildProcess = null
    this.watchers = []
  }

  /**
   * 启动开发服务器
   */
  async start() {
    console.log('🚀 启动 LDesign Router 开发服务器...')

    try {
      // 启动 Vite 开发服务器
      await this.startViteServer()
      
      // 启动测试监听
      if (this.config.test.watch) {
        this.startTestWatcher()
      }

      // 启动构建监听
      if (this.config.build.watch) {
        this.startBuildWatcher()
      }

      // 启动文件监听
      this.startFileWatcher()

      console.log('✅ 开发服务器启动成功!')
      console.log(`📱 本地访问: http://${this.config.server.host}:${this.config.server.port}`)
      console.log('🔧 开发工具快捷键:')
      console.log('  - Ctrl+Shift+D: 切换调试面板')
      console.log('  - Ctrl+Shift+T: 运行测试')
      console.log('  - Ctrl+Shift+B: 重新构建')
      console.log('  - Ctrl+C: 停止服务器')

    } catch (error) {
      console.error('❌ 开发服务器启动失败:', error)
      process.exit(1)
    }
  }

  /**
   * 启动 Vite 服务器
   */
  async startViteServer() {
    const viteConfig = {
      root: resolve(__dirname, '../examples'),
      server: {
        port: this.config.server.port,
        host: this.config.server.host,
        open: this.config.server.open
      },
      resolve: {
        alias: {
          '@ldesign/router': resolve(__dirname, '../src')
        }
      },
      define: {
        __DEV__: true,
        __VERSION__: JSON.stringify(require('../package.json').version)
      }
    }

    this.viteServer = await createServer(viteConfig)
    await this.viteServer.listen()
  }

  /**
   * 启动测试监听
   */
  startTestWatcher() {
    console.log('🧪 启动测试监听...')
    
    this.testProcess = spawn('npm', ['run', 'test'], {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..')
    })

    this.testProcess.on('error', (error) => {
      console.error('❌ 测试进程错误:', error)
    })
  }

  /**
   * 启动构建监听
   */
  startBuildWatcher() {
    console.log('🔨 启动构建监听...')
    
    this.buildProcess = spawn('npm', ['run', 'build:watch'], {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..')
    })

    this.buildProcess.on('error', (error) => {
      console.error('❌ 构建进程错误:', error)
    })
  }

  /**
   * 启动文件监听
   */
  startFileWatcher() {
    const srcWatcher = chokidar.watch(resolve(__dirname, '../src'), {
      ignored: /node_modules/,
      persistent: true
    })

    srcWatcher.on('change', (path) => {
      console.log(`📝 文件变更: ${path}`)
      this.onFileChange(path)
    })

    const testWatcher = chokidar.watch(resolve(__dirname, '../__tests__'), {
      ignored: /node_modules/,
      persistent: true
    })

    testWatcher.on('change', (path) => {
      console.log(`🧪 测试文件变更: ${path}`)
      this.onTestFileChange(path)
    })

    this.watchers.push(srcWatcher, testWatcher)
  }

  /**
   * 文件变更处理
   */
  onFileChange(filePath) {
    // 检查文件类型
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      this.runTypeCheck()
    }

    if (filePath.includes('performance')) {
      this.runPerformanceCheck()
    }

    // 热重载通知
    if (this.viteServer) {
      this.viteServer.ws.send({
        type: 'full-reload'
      })
    }
  }

  /**
   * 测试文件变更处理
   */
  onTestFileChange(filePath) {
    console.log(`🔄 重新运行相关测试: ${filePath}`)
    
    // 运行特定测试文件
    const testFile = filePath.replace(resolve(__dirname, '../'), '')
    spawn('npm', ['run', 'test', testFile], {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..')
    })
  }

  /**
   * 运行类型检查
   */
  runTypeCheck() {
    console.log('🔍 运行类型检查...')
    
    const typeCheck = spawn('npm', ['run', 'type-check'], {
      stdio: 'pipe',
      cwd: resolve(__dirname, '..')
    })

    typeCheck.stdout.on('data', (data) => {
      const output = data.toString()
      if (output.includes('error')) {
        console.error('❌ 类型检查失败:', output)
      } else {
        console.log('✅ 类型检查通过')
      }
    })
  }

  /**
   * 运行性能检查
   */
  runPerformanceCheck() {
    if (!this.config.performance.monitor) return

    console.log('⚡ 运行性能检查...')
    
    const perfCheck = spawn('npm', ['run', 'benchmark'], {
      stdio: 'pipe',
      cwd: resolve(__dirname, '..')
    })

    perfCheck.stdout.on('data', (data) => {
      const output = data.toString()
      const match = output.match(/(\d+)ms/)
      
      if (match) {
        const time = parseInt(match[1])
        if (time > this.config.performance.threshold) {
          console.warn(`⚠️ 性能警告: 执行时间 ${time}ms 超过阈值 ${this.config.performance.threshold}ms`)
        } else {
          console.log(`✅ 性能检查通过: ${time}ms`)
        }
      }
    })
  }

  /**
   * 停止开发服务器
   */
  async stop() {
    console.log('🛑 停止开发服务器...')

    // 关闭 Vite 服务器
    if (this.viteServer) {
      await this.viteServer.close()
    }

    // 关闭测试进程
    if (this.testProcess) {
      this.testProcess.kill()
    }

    // 关闭构建进程
    if (this.buildProcess) {
      this.buildProcess.kill()
    }

    // 关闭文件监听
    this.watchers.forEach(watcher => watcher.close())

    console.log('✅ 开发服务器已停止')
  }
}

/**
 * 命令行接口
 */
function main() {
  const args = process.argv.slice(2)
  const config = {}

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    if (arg === '--port' && args[i + 1]) {
      config.server = { ...config.server, port: parseInt(args[i + 1]) }
      i++
    } else if (arg === '--host' && args[i + 1]) {
      config.server = { ...config.server, host: args[i + 1] }
      i++
    } else if (arg === '--no-open') {
      config.server = { ...config.server, open: false }
    } else if (arg === '--no-test') {
      config.test = { ...config.test, watch: false }
    } else if (arg === '--no-build') {
      config.build = { ...config.build, watch: false }
    }
  }

  const devServer = new DevServer(config)

  // 优雅关闭
  process.on('SIGINT', async () => {
    await devServer.stop()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await devServer.stop()
    process.exit(0)
  })

  // 启动服务器
  devServer.start().catch((error) => {
    console.error('❌ 启动失败:', error)
    process.exit(1)
  })
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = { DevServer }
