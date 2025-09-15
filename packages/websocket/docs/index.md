---
layout: home

hero:
  name: "@ldesign/websocket"
  text: "功能强大的WebSocket客户端库"
  tagline: 类型安全、框架无关、开箱即用
  image:
    src: /logo.svg
    alt: LDesign WebSocket
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/websocket

features:
  - icon: 🚀
    title: 框架无关
    details: 支持Vue、React、Angular等任意前端框架，提供专门的适配器和Hooks
  - icon: 🔄
    title: 自动重连
    details: 内置智能重连机制，支持指数退避算法，确保连接稳定性
  - icon: 💓
    title: 心跳检测
    details: 自动维持连接活跃状态，可配置心跳间隔和超时时间
  - icon: 📦
    title: 消息队列
    details: 支持离线消息缓存和重发，确保消息不丢失
  - icon: 🔐
    title: 认证支持
    details: 内置Token、Basic等多种认证方式，支持自动token刷新
  - icon: 🏊
    title: 连接池
    details: 支持多连接管理和负载均衡，提供多种分发策略
  - icon: 🎯
    title: TypeScript
    details: 完整的类型定义，零配置开箱即用，提供优秀的开发体验
  - icon: 🌐
    title: Web Worker
    details: 支持在Worker线程中运行，避免阻塞主线程
  - icon: 📱
    title: 移动端友好
    details: 完美支持移动端浏览器，针对移动网络环境优化
---

## 快速体验

::: code-group

```typescript [基础使用]
import { WebSocketClient } from '@ldesign/websocket'

const client = new WebSocketClient({
  url: 'ws://localhost:8080'
})

client.on('connected', () => {
  console.log('连接成功')
})

client.on('message', (data) => {
  console.log('收到消息:', data)
})

await client.connect()
await client.send('Hello WebSocket!')
```

```vue [Vue 3]
<template>
  <div>
    <div>状态: {{ status }}</div>
    <div>消息: {{ lastMessage }}</div>
    <button @click="send('Hello!')">发送消息</button>
  </div>
</template>

<script setup>
import { useWebSocket } from '@ldesign/websocket/vue'

const { status, lastMessage, send } = useWebSocket(
  'ws://localhost:8080',
  { autoConnect: true }
)
</script>
```

```tsx [React]
import { useWebSocket } from '@ldesign/websocket/react'

function App() {
  const { status, lastMessage, send } = useWebSocket(
    'ws://localhost:8080',
    { autoConnect: true }
  )

  return (
    <div>
      <div>状态: {status}</div>
      <div>消息: {lastMessage}</div>
      <button onClick={() => send('Hello!')}>
        发送消息
      </button>
    </div>
  )
}
```

```typescript [Angular]
import { Component, inject } from '@angular/core'
import { WebSocketService } from '@ldesign/websocket/angular'

@Component({
  selector: 'app-websocket',
  template: `
    <div>状态: {{ status$ | async }}</div>
    <div>消息: {{ lastMessage$ | async }}</div>
    <button (click)="send('Hello!')">发送消息</button>
  `
})
export class WebSocketComponent {
  private wsService = inject(WebSocketService)
  
  status$ = this.wsService.status$
  lastMessage$ = this.wsService.lastMessage$

  constructor() {
    this.wsService.connect('ws://localhost:8080')
  }

  send(message: string) {
    this.wsService.send(message)
  }
}
```

:::

## 为什么选择 @ldesign/websocket？

### 🎯 类型安全
完整的TypeScript类型定义，提供优秀的开发体验和代码提示。

### 🔧 高度可配置
丰富的配置选项和预设，满足各种使用场景的需求。

### 🚀 性能优异
经过性能优化，支持高并发消息处理，内存使用合理。

### 📚 文档完善
详细的文档和示例，快速上手，轻松集成。

### 🧪 测试覆盖
90%+的测试覆盖率，确保代码质量和稳定性。

### 🌍 浏览器兼容
支持所有现代浏览器，包括移动端浏览器。

## 安装

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

## 核心特性

### 自动重连
```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  reconnect: {
    enabled: true,
    strategy: 'exponential',
    maxAttempts: 5,
    initialDelay: 1000
  }
})
```

### 心跳检测
```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  heartbeat: {
    enabled: true,
    interval: 30000,
    message: 'ping'
  }
})
```

### 消息队列
```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  messageQueue: {
    enabled: true,
    maxSize: 1000,
    persistent: true
  }
})
```

### 连接池
```typescript
import { ConnectionPool } from '@ldesign/websocket'

const pool = new ConnectionPool({
  maxConnections: 10,
  strategy: 'round-robin'
})

await pool.addConnection('ws://server1:8080')
await pool.addConnection('ws://server2:8080')
```

## 社区

- [GitHub Issues](https://github.com/ldesign/websocket/issues) - 报告问题和功能请求
- [GitHub Discussions](https://github.com/ldesign/websocket/discussions) - 社区讨论
- [更新日志](/changelog) - 查看最新更新

## 许可证

[MIT License](https://github.com/ldesign/websocket/blob/main/LICENSE)

---

<div style="text-align: center; margin-top: 2rem; color: #666;">
  Made with ❤️ by LDesign Team
</div>
