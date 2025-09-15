# 介绍

@ldesign/websocket 是一个功能强大、类型安全的WebSocket客户端库，专为现代前端开发而设计。它提供了丰富的功能和优秀的开发体验，支持Vue、React、Angular等主流前端框架。

## 特性概览

### 🚀 框架无关
- 支持原生JavaScript/TypeScript
- 提供Vue 3 Composition API
- 提供React Hooks
- 提供Angular服务和RxJS集成
- 可在任何前端框架中使用

### 🔄 智能重连
- 多种重连策略：固定间隔、指数退避、线性增长
- 可配置最大重连次数和延迟时间
- 支持抖动算法避免雷群效应
- 网络状态感知，自动适应网络变化

### 💓 心跳检测
- 自动发送心跳消息保持连接活跃
- 可配置心跳间隔和超时时间
- 支持自定义心跳消息格式
- 心跳失败自动触发重连

### 📦 消息队列
- 离线消息缓存，连接恢复后自动发送
- 支持消息优先级和去重
- 可配置队列大小和消息过期时间
- 支持持久化存储（localStorage）

### 🔐 认证授权
- 内置Token认证支持
- 支持Basic认证
- 自动token刷新机制
- 可扩展的自定义认证策略

### 🏊 连接池管理
- 支持多个WebSocket连接
- 多种负载均衡策略：轮询、最少连接、随机、加权轮询
- 连接健康检查和故障转移
- 连接复用和资源优化

### 🎯 TypeScript支持
- 完整的类型定义
- 泛型支持，类型安全的事件系统
- 智能代码提示和错误检查
- 零配置开箱即用

### 🌐 Web Worker支持
- 支持在Worker线程中运行
- 避免阻塞主线程
- 主线程和Worker线程通信
- Worker池管理

### 📱 移动端优化
- 针对移动网络环境优化
- 支持网络状态变化检测
- 电池和性能友好的配置
- 完美支持移动端浏览器

## 设计理念

### 简单易用
我们相信好的工具应该简单易用。@ldesign/websocket 提供了直观的API设计，让你可以用最少的代码实现复杂的WebSocket功能。

```typescript
// 简单的连接和消息发送
const client = new WebSocketClient({ url: 'ws://localhost:8080' })
await client.connect()
await client.send('Hello World!')
```

### 类型安全
TypeScript的类型系统让代码更加健壮。我们提供了完整的类型定义，让你在开发过程中就能发现潜在的问题。

```typescript
// 类型安全的事件监听
interface MessageEvents {
  userMessage: [{ user: string; content: string }]
  systemNotice: [string]
}

const client = new WebSocketClient<MessageEvents>({ url: 'ws://localhost:8080' })

client.on('userMessage', (data) => {
  // data 的类型是 { user: string; content: string }
  console.log(`${data.user}: ${data.content}`)
})
```

### 高度可配置
不同的应用场景需要不同的配置。我们提供了丰富的配置选项和预设，让你可以根据需要进行定制。

```typescript
// 生产环境配置
const client = new WebSocketClient({
  url: 'ws://localhost:8080',
  reconnect: {
    enabled: true,
    strategy: 'exponential',
    maxAttempts: 10
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
```

### 性能优先
我们注重性能，从内存使用到消息处理都经过了优化。支持高并发消息处理，适合实时性要求高的应用。

## 适用场景

### 实时聊天应用
- 即时消息传递
- 在线状态显示
- 群组聊天
- 消息历史同步

### 实时数据展示
- 股票价格更新
- 系统监控面板
- 实时图表
- 传感器数据

### 协作应用
- 在线文档编辑
- 白板协作
- 代码协作
- 项目管理

### 游戏应用
- 实时对战
- 排行榜更新
- 游戏状态同步
- 聊天系统

### 物联网应用
- 设备状态监控
- 远程控制
- 数据采集
- 告警通知

## 浏览器支持

@ldesign/websocket 支持所有现代浏览器：

- Chrome 16+
- Firefox 11+
- Safari 7+
- Edge 12+
- iOS Safari 7+
- Android Browser 4.4+

## 下一步

- [快速开始](/guide/getting-started) - 5分钟快速上手
- [安装指南](/guide/installation) - 详细的安装说明
- [基础用法](/guide/basic-usage) - 学习基本使用方法
- [API参考](/api/) - 完整的API文档

## 获得帮助

如果你在使用过程中遇到问题，可以通过以下方式获得帮助：

- [GitHub Issues](https://github.com/ldesign/websocket/issues) - 报告bug或请求新功能
- [GitHub Discussions](https://github.com/ldesign/websocket/discussions) - 社区讨论
- [示例代码](/examples/) - 查看实际使用示例

## 贡献

我们欢迎社区贡献！如果你想为项目做出贡献，请查看我们的[贡献指南](https://github.com/ldesign/websocket/blob/main/CONTRIBUTING.md)。

## 许可证

@ldesign/websocket 使用 [MIT许可证](https://github.com/ldesign/websocket/blob/main/LICENSE)，你可以自由地使用、修改和分发。
