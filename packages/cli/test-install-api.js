/**
 * 测试 Node 版本安装 API
 */

import fetch from 'node-fetch'
import WebSocket from 'ws'

const API_BASE = 'http://localhost:3100'
const WS_URL = 'ws://localhost:3100'

async function testInstall() {
  console.log('🔌 连接 WebSocket...')
  
  const ws = new WebSocket(WS_URL)
  
  ws.on('open', async () => {
    console.log('✅ WebSocket 已连接\n')
    
    // 监听所有消息
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        console.log(`📨 [${message.type}]:`, message.data)
      } catch (e) {
        console.log('📨 Raw message:', data.toString())
      }
    })
    
    // 发送安装请求
    console.log('📤 发送安装请求: Node.js 18.19.0\n')
    
    try {
      const response = await fetch(`${API_BASE}/api/fnm/install-node`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ version: '18.19.0' })
      })
      
      const result = await response.json()
      console.log('\n📥 HTTP 响应:', result)
      
      if (result.success) {
        console.log('\n✅ 安装成功！')
      } else {
        console.log('\n❌ 安装失败:', result.message)
      }
    } catch (error) {
      console.error('\n❌ 请求失败:', error.message)
    }
    
    // 等待一会儿再关闭
    setTimeout(() => {
      ws.close()
      process.exit(0)
    }, 3000)
  })
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket 错误:', error.message)
  })
  
  ws.on('close', () => {
    console.log('\n🔌 WebSocket 已断开')
  })
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/api/health`)
    if (response.ok) {
      console.log('✅ 服务器正在运行\n')
      return true
    }
  } catch (e) {
    console.error('❌ 服务器未运行，请先启动: ldesign ui')
    return false
  }
  return false
}

async function main() {
  console.log('🧪 测试 Node 版本安装 API\n')
  console.log('=' .repeat(50) + '\n')
  
  if (await checkServer()) {
    await testInstall()
  } else {
    process.exit(1)
  }
}

main()