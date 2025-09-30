#!/usr/bin/env node

/**
 * 测试 FNM Node.js 版本安装进度
 * 
 * 验证：
 * 1. 安装命令能否正常启动
 * 2. 进度消息是否实时推送
 * 3. 安装日志是否完整显示
 * 4. 安装完成后进度是否到达100%
 */

const { spawn } = require('child_process')
const WebSocket = require('ws')
const http = require('http')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 配置
const SERVER_PORT = 3000
const WS_URL = `ws://localhost:${SERVER_PORT}`
const API_URL = `http://localhost:${SERVER_PORT}`
const TEST_VERSION = '16.20.2' // 测试版本

let serverProcess = null
let ws = null
let progressLogs = []
let installLogs = []

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 启动服务器
async function startServer() {
  log('\n🚀 启动 LDesign CLI 服务器...', 'cyan')
  
  return new Promise((resolve, reject) => {
    serverProcess = spawn('node', ['dist/commands/ui.js'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let output = ''
    
    serverProcess.stdout.on('data', (data) => {
      output += data.toString()
      const text = data.toString().trim()
      if (text) {
        log(`  [服务器] ${text}`, 'gray')
      }
      
      // 检测服务器启动成功
      if (output.includes('localhost:3000')) {
        resolve()
      }
    })

    serverProcess.stderr.on('data', (data) => {
      const text = data.toString().trim()
      if (text && !text.includes('ExperimentalWarning')) {
        log(`  [错误] ${text}`, 'red')
      }
    })

    serverProcess.on('error', (error) => {
      log(`❌ 服务器启动失败: ${error.message}`, 'red')
      reject(error)
    })

    // 超时检测
    setTimeout(() => {
      if (!output.includes('localhost:3000')) {
        reject(new Error('服务器启动超时'))
      }
    }, 10000)
  })
}

// 连接 WebSocket
async function connectWebSocket() {
  log('\n🔌 连接 WebSocket...', 'cyan')
  
  return new Promise((resolve, reject) => {
    ws = new WebSocket(WS_URL)

    ws.on('open', () => {
      log('✅ WebSocket 连接成功', 'green')
      resolve()
    })

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        handleWebSocketMessage(message)
      } catch (error) {
        log(`⚠️ 解析 WebSocket 消息失败: ${error.message}`, 'yellow')
      }
    })

    ws.on('error', (error) => {
      log(`❌ WebSocket 错误: ${error.message}`, 'red')
      reject(error)
    })

    ws.on('close', () => {
      log('🔌 WebSocket 连接已关闭', 'gray')
    })
  })
}

// 处理 WebSocket 消息
function handleWebSocketMessage(message) {
  const { type, data } = message

  switch (type) {
    case 'node-install-start':
      log(`\n📦 ${data.message}`, 'cyan')
      break

    case 'node-install-progress':
      const progressMsg = `  进度: ${data.progress}% | ${data.message}`
      log(progressMsg, 'blue')
      progressLogs.push({
        progress: data.progress,
        message: data.message,
        timestamp: Date.now()
      })
      break

    case 'node-install-log':
      log(`  [安装日志] ${data.message}`, 'gray')
      installLogs.push({
        message: data.message,
        timestamp: Date.now()
      })
      break

    case 'node-install-complete':
      if (data.success) {
        log(`\n✅ ${data.message}`, 'green')
      } else {
        log(`\n❌ ${data.message}`, 'red')
      }
      break

    case 'node-install-error':
      log(`\n❌ 安装错误: ${data.message}`, 'red')
      break

    default:
      // 忽略其他消息
      break
  }
}

// 调用安装 API
async function installNode(version) {
  log(`\n🔧 开始安装 Node.js ${version}...`, 'cyan')
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ version })
    
    const options = {
      hostname: 'localhost',
      port: SERVER_PORT,
      path: '/api/fnm/install-node',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          if (response.success) {
            resolve(response)
          } else {
            reject(new Error(response.message || '安装失败'))
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

// 获取已安装版本列表
async function getInstalledVersions() {
  return new Promise((resolve, reject) => {
    http.get(`${API_URL}/api/fnm/versions`, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          resolve(response)
        } catch (error) {
          reject(error)
        }
      })
    }).on('error', reject)
  })
}

// 分析测试结果
function analyzeResults() {
  log('\n\n' + '='.repeat(60), 'cyan')
  log('📊 测试结果分析', 'cyan')
  log('='.repeat(60), 'cyan')

  // 进度分析
  log('\n📈 进度消息统计:', 'yellow')
  log(`  总消息数: ${progressLogs.length}`, 'white')
  
  if (progressLogs.length > 0) {
    const firstProgress = progressLogs[0]
    const lastProgress = progressLogs[progressLogs.length - 1]
    
    log(`  起始进度: ${firstProgress.progress}%`, 'white')
    log(`  最终进度: ${lastProgress.progress}%`, 'white')
    
    const duration = lastProgress.timestamp - firstProgress.timestamp
    log(`  安装耗时: ${(duration / 1000).toFixed(2)} 秒`, 'white')
    
    // 检查进度是否到达100%
    if (lastProgress.progress === 100) {
      log('  ✅ 进度已到达100%', 'green')
    } else {
      log(`  ⚠️ 进度未到达100% (最高: ${lastProgress.progress}%)`, 'yellow')
    }
  }

  // 日志分析
  log('\n📝 安装日志统计:', 'yellow')
  log(`  日志条数: ${installLogs.length}`, 'white')
  
  if (installLogs.length > 0) {
    log('  日志示例 (前5条):', 'white')
    installLogs.slice(0, 5).forEach((log, index) => {
      console.log(`    ${index + 1}. ${log.message}`)
    })
  }

  // 显示所有进度更新
  if (progressLogs.length > 0) {
    log('\n📊 完整进度记录:', 'yellow')
    progressLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. [${log.progress}%] ${log.message}`)
    })
  }
}

// 清理资源
function cleanup() {
  log('\n🧹 清理资源...', 'cyan')
  
  if (ws) {
    ws.close()
  }
  
  if (serverProcess) {
    serverProcess.kill()
  }
}

// 主测试流程
async function main() {
  try {
    // 1. 启动服务器
    await startServer()
    await delay(2000) // 等待服务器完全启动

    // 2. 连接 WebSocket
    await connectWebSocket()
    await delay(1000)

    // 3. 开始安装
    const installPromise = installNode(TEST_VERSION)
    
    // 等待安装完成或超时（3分钟）
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('安装超时')), 180000)
    )
    
    await Promise.race([installPromise, timeoutPromise])
    
    // 4. 等待一段时间以收集所有 WebSocket 消息
    await delay(2000)

    // 5. 验证安装结果
    log('\n🔍 验证安装结果...', 'cyan')
    const versions = await getInstalledVersions()
    
    if (versions.success && versions.data.installed.includes(TEST_VERSION)) {
      log(`✅ Node.js ${TEST_VERSION} 已成功安装`, 'green')
    } else {
      log(`⚠️ 未在已安装列表中找到 ${TEST_VERSION}`, 'yellow')
      log(`已安装版本: ${JSON.stringify(versions.data.installed)}`, 'gray')
    }

    // 6. 分析结果
    analyzeResults()

    log('\n✅ 测试完成', 'green')
    
  } catch (error) {
    log(`\n❌ 测试失败: ${error.message}`, 'red')
    console.error(error)
  } finally {
    cleanup()
    process.exit(0)
  }
}

// 处理退出信号
process.on('SIGINT', () => {
  log('\n\n⚠️ 收到退出信号', 'yellow')
  cleanup()
  process.exit(0)
})

// 运行测试
main()