# API 参考

@ldesign/websocket 提供了丰富的API来满足各种WebSocket使用场景。本节包含了所有公开API的详细文档。

## 核心类

### [WebSocketClient](/api/websocket-client)
主要的WebSocket客户端类，提供连接管理、消息发送、事件监听等核心功能。

```typescript
import { WebSocketClient } from '@ldesign/websocket'

const client = new WebSocketClient({
  url: 'ws://localhost:8080'
})
```

### [ConnectionPool](/api/connection-pool)
连接池管理类，支持多个WebSocket连接的负载均衡和故障转移。

```typescript
import { ConnectionPool } from '@ldesign/websocket'

const pool = new ConnectionPool({
  maxConnections: 10,
  strategy: 'round-robin'
})
```

### [EventEmitter](/api/event-emitter)
事件发射器类，提供类型安全的事件监听和发射功能。

```typescript
import { EventEmitter } from '@ldesign/websocket'

const emitter = new EventEmitter<{
  message: [string]
  error: [Error]
}>()
```

## 工厂函数

### [客户端工厂](/api/client-factory)
提供便捷的客户端创建函数，支持不同的预配置场景。

```typescript
import { 
  createWebSocketClient,
  createReconnectingClient,
  createHeartbeatClient 
} from '@ldesign/websocket'
```

### [连接池工厂](/api/pool-factory)
提供连接池的创建和管理函数。

```typescript
import { 
  createConnectionPool,
  createLoadBalancedPool 
} from '@ldesign/websocket'
```

### [Worker工厂](/api/worker-factory)
提供Web Worker相关的创建和管理函数。

```typescript
import { 
  createWorkerClient,
  createWorkerPool 
} from '@ldesign/websocket/worker'
```

## 框架适配器

### [Vue适配器](/api/vue-adapter)
Vue 3 Composition API集成，提供响应式的WebSocket功能。

```typescript
import { useWebSocket } from '@ldesign/websocket/vue'
```

### [React适配器](/api/react-adapter)
React Hooks集成，提供状态管理和生命周期处理。

```typescript
import { useWebSocket } from '@ldesign/websocket/react'
```

### [Angular适配器](/api/angular-adapter)
Angular服务集成，提供RxJS Observable支持。

```typescript
import { WebSocketService } from '@ldesign/websocket/angular'
```

## 类型定义

### [配置类型](/api/config-types)
所有配置选项的TypeScript类型定义。

```typescript
import type { 
  WebSocketConfig,
  ReconnectConfig,
  HeartbeatConfig 
} from '@ldesign/websocket'
```

### [事件类型](/api/event-types)
事件系统相关的类型定义。

```typescript
import type { 
  WebSocketEvents,
  EventListener,
  EventFilter 
} from '@ldesign/websocket'
```

### [工具类型](/api/utility-types)
实用的TypeScript工具类型。

```typescript
import type { 
  ConnectionState,
  MessageType,
  AuthStrategy 
} from '@ldesign/websocket'
```

## 快速导航

### 按功能分类

**连接管理**
- [WebSocketClient.connect()](/api/websocket-client#connect)
- [WebSocketClient.disconnect()](/api/websocket-client#disconnect)
- [WebSocketClient.reconnect()](/api/websocket-client#reconnect)

**消息处理**
- [WebSocketClient.send()](/api/websocket-client#send)
- [WebSocketClient.on()](/api/websocket-client#on)
- [WebSocketClient.off()](/api/websocket-client#off)

**状态管理**
- [WebSocketClient.getState()](/api/websocket-client#getstate)
- [WebSocketClient.isConnected()](/api/websocket-client#isconnected)
- [WebSocketClient.getStats()](/api/websocket-client#getstats)

**连接池**
- [ConnectionPool.addConnection()](/api/connection-pool#addconnection)
- [ConnectionPool.getConnection()](/api/connection-pool#getconnection)
- [ConnectionPool.removeConnection()](/api/connection-pool#removeconnection)

### 按使用场景分类

**基础使用**
- [WebSocketClient](/api/websocket-client) - 基础客户端
- [createWebSocketClient](/api/client-factory#createwebsocketclient) - 快速创建

**高可用性**
- [ReconnectConfig](/api/config-types#reconnectconfig) - 重连配置
- [HeartbeatConfig](/api/config-types#heartbeatconfig) - 心跳配置
- [ConnectionPool](/api/connection-pool) - 连接池

**框架集成**
- [useWebSocket (Vue)](/api/vue-adapter#usewebsocket) - Vue集成
- [useWebSocket (React)](/api/react-adapter#usewebsocket) - React集成
- [WebSocketService](/api/angular-adapter#websocketservice) - Angular集成

**高级功能**
- [AuthConfig](/api/config-types#authconfig) - 认证配置
- [MessageQueue](/api/config-types#messagequeueconfig) - 消息队列
- [Worker支持](/api/worker-factory) - Web Worker

## 类型安全

所有API都提供完整的TypeScript类型支持：

```typescript
// 类型安全的事件定义
interface MyEvents {
  message: [{ id: string; content: string }]
  error: [Error]
  status: [ConnectionState]
}

// 类型安全的客户端
const client = new WebSocketClient<MyEvents>({
  url: 'ws://localhost:8080'
})

// 类型安全的事件监听
client.on('message', (data) => {
  // data 的类型是 { id: string; content: string }
  console.log(data.id, data.content)
})
```

## 错误处理

所有API都遵循一致的错误处理模式：

```typescript
try {
  await client.connect()
} catch (error) {
  if (error instanceof WebSocketError) {
    console.log('WebSocket错误:', error.code, error.message)
  } else {
    console.log('其他错误:', error)
  }
}
```

## 异步操作

大部分API都是异步的，返回Promise：

```typescript
// 连接操作
await client.connect()

// 发送消息
await client.send('Hello')

// 断开连接
await client.disconnect()
```

## 事件系统

所有事件相关的API都支持：

```typescript
// 基础事件监听
client.on('message', handler)

// 一次性事件监听
client.once('connected', handler)

// 事件过滤
client.on('message', handler, {
  filter: (data) => data.priority === 'high'
})

// 事件转换
client.on('message', handler, {
  transform: (data) => JSON.parse(data)
})

// 移除事件监听
client.off('message', handler)
```

## 配置系统

所有配置都支持：

```typescript
// 构造时配置
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  reconnect: { enabled: true },
  heartbeat: { enabled: true }
})

// 运行时更新配置
client.updateConfig({
  heartbeat: { interval: 60000 }
})
```

## 下一步

- 选择你需要的API文档进行详细阅读
- 查看[示例代码](/examples/)了解实际使用
- 参考[指南](/guide/)了解最佳实践

如果你找不到需要的API或有疑问，请在[GitHub Issues](https://github.com/ldesign/websocket/issues)中提问。
