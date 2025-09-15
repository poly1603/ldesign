# 快速开始

本指南将帮助你在5分钟内快速上手 @ldesign/websocket。

## 安装

首先安装 @ldesign/websocket：

::: code-group

```bash [npm]
npm install @ldesign/websocket
```

```bash [yarn]
yarn add @ldesign/websocket
```

```bash [pnpm]
pnpm add @ldesign/websocket
```

:::

## 基础使用

### 创建客户端

```typescript
import { WebSocketClient } from '@ldesign/websocket'

const client = new WebSocketClient({
  url: 'ws://localhost:8080'
})
```

### 监听事件

```typescript
// 连接成功
client.on('connected', () => {
  console.log('WebSocket连接成功')
})

// 连接断开
client.on('disconnected', () => {
  console.log('WebSocket连接断开')
})

// 接收消息
client.on('message', (data) => {
  console.log('收到消息:', data)
})

// 连接错误
client.on('error', (error) => {
  console.error('连接错误:', error)
})
```

### 连接和发送消息

```typescript
// 连接到服务器
await client.connect()

// 发送消息
await client.send('Hello WebSocket!')

// 发送JSON数据
await client.send({ type: 'chat', message: 'Hello World!' })
```

## 框架集成

### Vue 3

使用 Vue 3 Composition API：

```vue
<template>
  <div>
    <div>连接状态: {{ status }}</div>
    <div>最新消息: {{ lastMessage }}</div>
    <input v-model="message" @keyup.enter="sendMessage" />
    <button @click="sendMessage">发送</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWebSocket } from '@ldesign/websocket/vue'

const message = ref('')

const { status, lastMessage, send } = useWebSocket('ws://localhost:8080', {
  autoConnect: true,
  heartbeat: { enabled: true }
})

const sendMessage = () => {
  if (message.value.trim()) {
    send(message.value)
    message.value = ''
  }
}
</script>
```

### React

使用 React Hooks：

```tsx
import React, { useState } from 'react'
import { useWebSocket } from '@ldesign/websocket/react'

function ChatApp() {
  const [message, setMessage] = useState('')
  
  const { status, lastMessage, send } = useWebSocket('ws://localhost:8080', {
    autoConnect: true,
    heartbeat: { enabled: true }
  })

  const sendMessage = () => {
    if (message.trim()) {
      send(message)
      setMessage('')
    }
  }

  return (
    <div>
      <div>连接状态: {status}</div>
      <div>最新消息: {lastMessage}</div>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>发送</button>
    </div>
  )
}
```

### Angular

使用 Angular 服务：

```typescript
// websocket.component.ts
import { Component, inject } from '@angular/core'
import { WebSocketService } from '@ldesign/websocket/angular'

@Component({
  selector: 'app-websocket',
  template: `
    <div>
      <div>连接状态: {{ status$ | async }}</div>
      <div>最新消息: {{ lastMessage$ | async }}</div>
      <input [(ngModel)]="message" (keyup.enter)="sendMessage()" />
      <button (click)="sendMessage()">发送</button>
    </div>
  `
})
export class WebSocketComponent {
  private wsService = inject(WebSocketService)
  
  status$ = this.wsService.status$
  lastMessage$ = this.wsService.lastMessage$
  message = ''

  constructor() {
    this.wsService.connect('ws://localhost:8080', {
      autoConnect: true,
      heartbeat: { enabled: true }
    })
  }

  sendMessage() {
    if (this.message.trim()) {
      this.wsService.send(this.message)
      this.message = ''
    }
  }
}
```

## 高级配置

### 自动重连

```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  reconnect: {
    enabled: true,
    strategy: 'exponential', // 指数退避
    initialDelay: 1000,      // 初始延迟1秒
    maxDelay: 30000,         // 最大延迟30秒
    maxAttempts: 5,          // 最多重试5次
    backoffMultiplier: 2     // 退避倍数
  }
})
```

### 心跳检测

```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  heartbeat: {
    enabled: true,
    interval: 30000,    // 30秒发送一次心跳
    timeout: 5000,      // 5秒超时
    message: 'ping',    // 心跳消息
    maxFailures: 3      // 最多失败3次
  }
})
```

### 消息队列

```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  messageQueue: {
    enabled: true,
    maxSize: 1000,              // 队列最大大小
    persistent: true,           // 持久化到localStorage
    storageKey: 'ws_queue',     // 存储键名
    messageExpiry: 300000,      // 消息5分钟过期
    deduplication: true         // 消息去重
  }
})
```

### 认证

```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  auth: {
    type: 'token',
    token: 'your-jwt-token',
    autoRefresh: true,
    refreshUrl: '/api/refresh-token'
  }
})
```

## 类型安全

使用 TypeScript 获得更好的开发体验：

```typescript
// 定义消息类型
interface ChatEvents {
  message: [{ user: string; content: string; timestamp: number }]
  userJoined: [{ user: string }]
  userLeft: [{ user: string }]
  typing: [{ user: string; isTyping: boolean }]
}

// 创建类型安全的客户端
const client = new WebSocketClient<ChatEvents>({
  url: 'ws://localhost:8080'
})

// 类型安全的事件监听
client.on('message', (data) => {
  // data 的类型是 { user: string; content: string; timestamp: number }
  console.log(`${data.user}: ${data.content}`)
})

client.on('userJoined', (data) => {
  // data 的类型是 { user: string }
  console.log(`${data.user} 加入了聊天`)
})
```

## 错误处理

```typescript
client.on('error', (error) => {
  console.error('WebSocket错误:', error)
  
  // 根据错误类型进行处理
  switch (error.type) {
    case 'connection':
      console.log('连接错误，请检查网络')
      break
    case 'authentication':
      console.log('认证失败，请重新登录')
      break
    case 'timeout':
      console.log('连接超时')
      break
    default:
      console.log('未知错误')
  }
})

// 监听重连事件
client.on('reconnecting', (attempt) => {
  console.log(`正在进行第 ${attempt} 次重连...`)
})

client.on('reconnected', () => {
  console.log('重连成功')
})

client.on('reconnectFailed', () => {
  console.log('重连失败，请手动刷新页面')
})
```

## 完整示例

这是一个完整的聊天应用示例：

```typescript
import { WebSocketClient } from '@ldesign/websocket'

interface ChatMessage {
  id: string
  user: string
  content: string
  timestamp: number
}

interface ChatEvents {
  message: [ChatMessage]
  userJoined: [{ user: string }]
  userLeft: [{ user: string }]
}

class ChatApp {
  private client: WebSocketClient<ChatEvents>
  private messages: ChatMessage[] = []

  constructor(private username: string) {
    this.client = new WebSocketClient<ChatEvents>({
      url: 'ws://localhost:8080',
      reconnect: {
        enabled: true,
        strategy: 'exponential',
        maxAttempts: 5
      },
      heartbeat: {
        enabled: true,
        interval: 30000
      },
      messageQueue: {
        enabled: true,
        persistent: true
      }
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.client.on('connected', () => {
      console.log('连接成功')
      this.client.send({
        type: 'join',
        user: this.username
      })
    })

    this.client.on('message', (message) => {
      this.messages.push(message)
      this.renderMessages()
    })

    this.client.on('userJoined', ({ user }) => {
      console.log(`${user} 加入了聊天`)
    })

    this.client.on('error', (error) => {
      console.error('连接错误:', error)
    })
  }

  async connect() {
    await this.client.connect()
  }

  async sendMessage(content: string) {
    const message: ChatMessage = {
      id: Date.now().toString(),
      user: this.username,
      content,
      timestamp: Date.now()
    }

    await this.client.send(message)
  }

  private renderMessages() {
    // 渲染消息到UI
    console.log('Messages:', this.messages)
  }

  disconnect() {
    this.client.disconnect()
  }
}

// 使用示例
const chat = new ChatApp('Alice')
await chat.connect()
await chat.sendMessage('Hello everyone!')
```

## 下一步

现在你已经掌握了基础用法，可以继续学习：

- [配置选项](/guide/configuration) - 了解所有配置选项
- [事件系统](/guide/events) - 深入了解事件系统
- [框架集成](/guide/vue-integration) - 学习框架特定的用法
- [API参考](/api/) - 查看完整的API文档
- [示例代码](/examples/) - 查看更多实际示例

如果遇到问题，请查看[常见问题](/guide/faq)或在[GitHub Issues](https://github.com/ldesign/websocket/issues)中提问。
