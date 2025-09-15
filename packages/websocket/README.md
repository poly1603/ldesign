# @ldesign/websocket

一个功能强大、类型安全的WebSocket客户端库，支持Vue、React、Angular等前端框架。

## ✨ 特性

- 🚀 **框架无关** - 支持Vue、React、Angular等任意前端框架
- 🔄 **自动重连** - 支持指数退避算法的智能重连机制
- 💓 **心跳检测** - 自动维持连接活跃状态
- 📦 **消息队列** - 支持离线消息缓存和重发
- 🔐 **认证支持** - 内置Token、Basic等多种认证方式
- 🏊 **连接池** - 支持多连接管理和负载均衡
- 🎯 **TypeScript** - 完整的类型定义，零配置开箱即用
- 🌐 **Web Worker** - 支持在Worker线程中运行
- 📱 **移动端友好** - 完美支持移动端浏览器
- 🔧 **高度可配置** - 丰富的配置选项和预设

## 📦 安装

```bash
# npm
npm install @ldesign/websocket

# yarn
yarn add @ldesign/websocket

# pnpm
pnpm add @ldesign/websocket
```

## 🚀 快速开始

### 基础使用

```typescript
import { WebSocketClient } from '@ldesign/websocket'

// 创建WebSocket客户端
const client = new WebSocketClient({
  url: 'ws://localhost:8080'
})

// 监听连接事件
client.on('connected', () => {
  console.log('WebSocket连接成功')
})

// 监听消息
client.on('message', (data) => {
  console.log('收到消息:', data)
})

// 连接到服务器
await client.connect()

// 发送消息
await client.send('Hello WebSocket!')
```

### Vue 3 集成

```vue
<template>
  <div>
    <div>状态: {{ status }}</div>
    <div>消息: {{ lastMessage }}</div>
    <button @click="sendMessage">发送消息</button>
  </div>
</template>

<script setup>
import { useWebSocket } from '@ldesign/websocket/vue'

const { status, lastMessage, send } = useWebSocket('ws://localhost:8080', {
  autoConnect: true,
  heartbeat: { enabled: true }
})

const sendMessage = () => {
  send('Hello from Vue!')
}
</script>
```

### React 集成

```tsx
import React from 'react'
import { useWebSocket } from '@ldesign/websocket/react'

function App() {
  const { status, lastMessage, send } = useWebSocket('ws://localhost:8080', {
    autoConnect: true,
    heartbeat: { enabled: true }
  })

  const sendMessage = () => {
    send('Hello from React!')
  }

  return (
    <div>
      <div>状态: {status}</div>
      <div>消息: {lastMessage}</div>
      <button onClick={sendMessage}>发送消息</button>
    </div>
  )
}
```

### Angular 集成

```typescript
import { Component, inject } from '@angular/core'
import { WebSocketService } from '@ldesign/websocket/angular'

@Component({
  selector: 'app-websocket',
  template: `
    <div>状态: {{ status$ | async }}</div>
    <div>消息: {{ lastMessage$ | async }}</div>
    <button (click)="sendMessage()">发送消息</button>
  `
})
export class WebSocketComponent {
  private wsService = inject(WebSocketService)
  
  status$ = this.wsService.status$
  lastMessage$ = this.wsService.lastMessage$

  constructor() {
    this.wsService.connect('ws://localhost:8080', {
      autoConnect: true,
      heartbeat: { enabled: true }
    })
  }

  sendMessage() {
    this.wsService.send('Hello from Angular!')
  }
}
```

## 🔧 配置选项

### 基础配置

```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  protocols: ['chat', 'superchat'],
  connectionTimeout: 10000,
  autoConnect: true,
  debug: true,
  logLevel: 'info'
})
```

### 重连配置

```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  reconnect: {
    enabled: true,
    strategy: 'exponential', // 'fixed' | 'exponential' | 'linear'
    initialDelay: 1000,
    maxDelay: 30000,
    maxAttempts: 5,
    backoffMultiplier: 2,
    jitter: 1000
  }
})
```

### 心跳配置

```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  heartbeat: {
    enabled: true,
    interval: 30000,
    timeout: 5000,
    message: 'ping',
    messageType: 'text', // 'text' | 'binary'
    maxFailures: 3
  }
})
```

### 认证配置

```typescript
// Token认证
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  auth: {
    type: 'token',
    token: 'your-jwt-token',
    autoRefresh: true,
    refreshUrl: '/api/refresh-token'
  }
})

// Basic认证
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  auth: {
    type: 'basic',
    username: 'user',
    password: 'pass'
  }
})
```

### 消息队列配置

```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  messageQueue: {
    enabled: true,
    maxSize: 1000,
    persistent: true,
    storageKey: 'websocket_queue',
    messageExpiry: 300000, // 5分钟
    deduplication: true
  }
})
```

## 🏊 连接池使用

```typescript
import { ConnectionPool } from '@ldesign/websocket'

// 创建连接池
const pool = new ConnectionPool({
  maxConnections: 10,
  strategy: 'round-robin', // 'round-robin' | 'least-connections' | 'random'
  healthCheck: {
    enabled: true,
    interval: 30000,
    timeout: 5000
  }
})

// 添加连接
await pool.addConnection('ws://server1:8080')
await pool.addConnection('ws://server2:8080')

// 获取连接
const connection = pool.getConnection()
await connection.send('Hello Pool!')
```

## 🌐 Web Worker 支持

```typescript
import { createWorkerClient } from '@ldesign/websocket/worker'

// 在主线程中创建Worker客户端
const workerClient = await createWorkerClient('ws://localhost:8080', {
  workerScript: '/websocket-worker.js'
})

// 使用方式与普通客户端相同
workerClient.on('message', (data) => {
  console.log('来自Worker的消息:', data)
})

await workerClient.send('Hello from Worker!')
```

## 📊 事件系统

```typescript
// 基础事件监听
client.on('connected', () => console.log('已连接'))
client.on('disconnected', () => console.log('已断开'))
client.on('message', (data) => console.log('消息:', data))
client.on('error', (error) => console.log('错误:', error))

// 一次性事件监听
client.once('connected', () => console.log('首次连接'))

// 事件过滤
client.on('message', (data) => {
  console.log('重要消息:', data)
}, {
  filter: (data) => data.priority === 'high'
})

// 事件转换
client.on('message', (transformedData) => {
  console.log('转换后的消息:', transformedData)
}, {
  transform: (data) => JSON.parse(data)
})

// 移除事件监听
const listener = (data) => console.log(data)
client.on('message', listener)
client.off('message', listener)
```

## 🎯 TypeScript 支持

```typescript
// 定义消息类型
interface ChatMessage {
  id: string
  user: string
  content: string
  timestamp: number
}

// 类型安全的客户端
const client = new WebSocketClient<{
  message: [ChatMessage]
  userJoined: [string]
  userLeft: [string]
}>({
  url: 'ws://localhost:8080'
})

// 类型安全的事件监听
client.on('message', (message: ChatMessage) => {
  console.log(`${message.user}: ${message.content}`)
})

client.on('userJoined', (username: string) => {
  console.log(`${username} 加入了聊天`)
})
```

## 🔧 工厂函数

```typescript
import { 
  createWebSocketClient,
  createReconnectingClient,
  createHeartbeatClient,
  createAuthenticatedClient,
  createPooledClient
} from '@ldesign/websocket'

// 创建基础客户端
const basicClient = createWebSocketClient('ws://localhost:8080')

// 创建自动重连客户端
const reconnectingClient = createReconnectingClient('ws://localhost:8080', {
  maxAttempts: 10,
  initialDelay: 2000
})

// 创建带心跳的客户端
const heartbeatClient = createHeartbeatClient('ws://localhost:8080', {
  interval: 15000
})

// 创建认证客户端
const authClient = createAuthenticatedClient('ws://localhost:8080', {
  token: 'your-token'
})

// 创建连接池客户端
const poolClient = createPooledClient([
  'ws://server1:8080',
  'ws://server2:8080'
], {
  strategy: 'least-connections'
})
```

## 📱 移动端优化

```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  // 移动端优化配置
  reconnect: {
    enabled: true,
    strategy: 'exponential',
    maxAttempts: 10 // 移动端网络不稳定，增加重试次数
  },
  heartbeat: {
    enabled: true,
    interval: 45000 // 移动端适当延长心跳间隔
  },
  messageQueue: {
    enabled: true,
    persistent: true // 启用持久化队列
  }
})

// 监听网络状态变化
client.on('networkChange', (online) => {
  if (online) {
    console.log('网络已恢复，尝试重连')
  } else {
    console.log('网络已断开')
  }
})
```

## 🔍 调试和日志

```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  debug: true,
  logLevel: 'debug' // 'error' | 'warn' | 'info' | 'debug'
})

// 自定义日志处理
client.on('log', ({ level, message, data }) => {
  console.log(`[${level.toUpperCase()}] ${message}`, data)
})
```

## 📈 性能监控

```typescript
// 获取连接统计信息
const stats = client.getStats()
console.log('连接统计:', {
  连接时长: stats.connectionDuration,
  发送消息数: stats.messagesSent,
  接收消息数: stats.messagesReceived,
  重连次数: stats.reconnectCount,
  错误次数: stats.errorCount
})

// 监听性能指标
client.on('metrics', (metrics) => {
  console.log('性能指标:', metrics)
})
```

## 🛠️ 高级用法

### 自定义协议处理

```typescript
class CustomProtocolClient extends WebSocketClient {
  protected processIncomingMessage(data: any) {
    // 自定义消息处理逻辑
    if (typeof data === 'string' && data.startsWith('CUSTOM:')) {
      return JSON.parse(data.substring(7))
    }
    return super.processIncomingMessage(data)
  }

  protected processOutgoingMessage(data: any) {
    // 自定义消息发送逻辑
    if (typeof data === 'object') {
      return 'CUSTOM:' + JSON.stringify(data)
    }
    return super.processOutgoingMessage(data)
  }
}
```

### 中间件系统

```typescript
// 添加消息中间件
client.addMiddleware('message', async (data, next) => {
  console.log('消息中间件 - 接收:', data)
  const result = await next(data)
  console.log('消息中间件 - 处理后:', result)
  return result
})

// 添加发送中间件
client.addMiddleware('send', async (data, next) => {
  console.log('发送中间件 - 发送前:', data)
  const result = await next(data)
  console.log('发送中间件 - 发送后:', result)
  return result
})
```

## 🧪 测试支持

```typescript
import { createMockWebSocketClient } from '@ldesign/websocket/testing'

// 创建模拟客户端用于测试
const mockClient = createMockWebSocketClient()

// 模拟连接成功
mockClient.mockConnect()

// 模拟接收消息
mockClient.mockReceiveMessage('test message')

// 验证发送的消息
expect(mockClient.getSentMessages()).toContain('hello')
```

## 📚 API 文档

详细的API文档请访问：[API Documentation](./docs/api.md)

## 🤝 贡献指南

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详细信息。

## 🔗 相关链接

- [GitHub仓库](https://github.com/ldesign/websocket)
- [问题反馈](https://github.com/ldesign/websocket/issues)
- [更新日志](./CHANGELOG.md)
- [在线演示](https://ldesign.github.io/websocket)

## 💡 常见问题

### Q: 如何处理连接断开？
A: 库内置了自动重连机制，你也可以监听 `disconnected` 事件进行自定义处理。

### Q: 支持哪些浏览器？
A: 支持所有现代浏览器，包括Chrome、Firefox、Safari、Edge等。

### Q: 如何在生产环境中使用？
A: 建议启用心跳检测、自动重连和消息队列功能，确保连接稳定性。

### Q: 性能如何？
A: 库经过性能优化，支持高并发消息处理，具体性能数据请查看基准测试报告。
