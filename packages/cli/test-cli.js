#!/usr/bin/env node

/**
 * CLI 功能测试脚本
 * 测试 UI 命令、API 连接、WebSocket 连接
 */

import { spawn } from 'child_process'
import http from 'http'
import WebSocket from 'ws'
import { setTimeout } from 'timers/promises'

const TEST_PORT = 3100
const TEST_HOST = 'localhost'

console.log('🧪 开始测试 LDesign CLI...\n')

// 测试结果
const results = {
  cliStart: false,
  httpServer: false,
  apiHealth: false,
  fnmStatus: false,
  voltaStatus: false,
  websocket: false,
  wsMessages: []
}

// 启动 CLI UI 命令
console.log('1️⃣  启动 CLI UI 命令...')
const cliProcess = spawn('node', [
  './bin/cli.js',
  'ui',
  '--port', String(TEST_PORT),
  '--host', TEST_HOST,
  '--no-open',
  '--debug'
], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe']
})

let serverStarted = false

cliProcess.stdout.on('data', (data) => {
  const output = data.toString()
  console.log('   📤', output.trim())
  
  if (output.includes('已启动') || output.includes('started')) {
    serverStarted = true
    results.cliStart = true
  }
})

cliProcess.stderr.on('data', (data) => {
  console.log('   ⚠️ ', data.toString().trim())
})

cliProcess.on('error', (error) => {
  console.error('   ❌ CLI 启动失败:', error.message)
  process.exit(1)
})

// 等待服务器启动
console.log('   ⏳ 等待服务器启动...')
await setTimeout(3000)

if (!serverStarted) {
  console.log('   ⚠️  未检测到启动消息，继续测试...')
}

// 测试 HTTP 服务器
console.log('\n2️⃣  测试 HTTP 服务器连接...')
try {
  await new Promise((resolve, reject) => {
    const req = http.get(`http://${TEST_HOST}:${TEST_PORT}`, (res) => {
      console.log(`   ✅ HTTP 服务器响应: ${res.statusCode}`)
      results.httpServer = true
      resolve()
    })
    req.on('error', reject)
    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('连接超时'))
    })
  })
} catch (error) {
  console.log(`   ❌ HTTP 连接失败: ${error.message}`)
}

// 测试 API 端点
console.log('\n3️⃣  测试 API 端点...')

// 测试健康检查
try {
  const healthData = await fetch(`http://${TEST_HOST}:${TEST_PORT}/api/health`)
    .then(res => res.json())
  console.log('   ✅ /api/health:', JSON.stringify(healthData))
  results.apiHealth = healthData.success === true
} catch (error) {
  console.log(`   ❌ /api/health 失败: ${error.message}`)
}

// 测试 FNM 状态
try {
  const fnmData = await fetch(`http://${TEST_HOST}:${TEST_PORT}/api/fnm/status`)
    .then(res => res.json())
  console.log('   ✅ /api/fnm/status:', JSON.stringify(fnmData))
  results.fnmStatus = fnmData.success === true
} catch (error) {
  console.log(`   ❌ /api/fnm/status 失败: ${error.message}`)
}

// 测试 Volta 状态
try {
  const voltaData = await fetch(`http://${TEST_HOST}:${TEST_PORT}/api/volta/status`)
    .then(res => res.json())
  console.log('   ✅ /api/volta/status:', JSON.stringify(voltaData))
  results.voltaStatus = voltaData.success === true
} catch (error) {
  console.log(`   ❌ /api/volta/status 失败: ${error.message}`)
}

// 测试 WebSocket 连接
console.log('\n4️⃣  测试 WebSocket 连接...')
try {
  await new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${TEST_HOST}:${TEST_PORT}`)
    let connected = false
    
    const timeout = globalThis.setTimeout(() => {
      ws.close()
      if (!connected) {
        reject(new Error('WebSocket 连接超时'))
      }
    }, 5000)
    
    ws.on('open', () => {
      console.log('   ✅ WebSocket 连接已建立')
      connected = true
      results.websocket = true
    })
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        console.log('   📨 收到消息:', message.type)
        results.wsMessages.push(message)
        
        if (message.type === 'welcome') {
          console.log('   ✅ 收到欢迎消息')
          clearTimeout(timeout)
          ws.close()
          resolve()
        }
      } catch (error) {
        console.log('   ⚠️  消息解析失败:', error.message)
      }
    })
    
    ws.on('error', (error) => {
      console.log(`   ❌ WebSocket 错误: ${error.message}`)
      clearTimeout(timeout)
      reject(error)
    })
    
    ws.on('close', () => {
      console.log('   📡 WebSocket 连接已关闭')
      if (!connected) {
        reject(new Error('WebSocket 未能建立连接'))
      } else {
        resolve()
      }
    })
  })
} catch (error) {
  console.log(`   ❌ WebSocket 测试失败: ${error.message}`)
}

// 输出测试结果
console.log('\n\n📊 测试结果汇总:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`CLI 启动:         ${results.cliStart ? '✅ 通过' : '❌ 失败'}`)
console.log(`HTTP 服务器:      ${results.httpServer ? '✅ 通过' : '❌ 失败'}`)
console.log(`API 健康检查:     ${results.apiHealth ? '✅ 通过' : '❌ 失败'}`)
console.log(`FNM API:          ${results.fnmStatus ? '✅ 通过' : '❌ 失败'}`)
console.log(`Volta API:        ${results.voltaStatus ? '✅ 通过' : '❌ 失败'}`)
console.log(`WebSocket 连接:   ${results.websocket ? '✅ 通过' : '❌ 失败'}`)
console.log(`WebSocket 消息数: ${results.wsMessages.length}`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━')

// 计算通过率
const total = 6
const passed = [
  results.cliStart,
  results.httpServer,
  results.apiHealth,
  results.fnmStatus,
  results.voltaStatus,
  results.websocket
].filter(Boolean).length

const passRate = ((passed / total) * 100).toFixed(1)
console.log(`\n✨ 通过率: ${passed}/${total} (${passRate}%)\n`)

// 清理并退出
console.log('🧹 清理测试环境...')
cliProcess.kill('SIGTERM')

globalThis.setTimeout(() => {
  cliProcess.kill('SIGKILL')
  process.exit(passed === total ? 0 : 1)
}, 1000)
