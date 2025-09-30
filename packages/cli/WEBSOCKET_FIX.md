# WebSocket 连接问题修复说明

## 问题描述

执行 `pnpm dev` 启动开发服务器后，打开前端项目时 WebSocket 无法连接。

## 问题原因

### 1. **Vite 代理配置缺失** (主要原因)
在 `vite.config.ts` 中，只配置了 `/api` 的 HTTP 代理，但没有配置 WebSocket 代理。

- **前端服务器**: Vite 运行在 `localhost:3001`
- **后端服务器**: Express + WebSocket 运行在 `localhost:3000`

由于前端尝试直接连接到 `localhost:3000` 的 WebSocket 服务，浏览器的同源策略可能阻止了跨端口的 WebSocket 连接。

### 2. **WebSocket 连接地址问题**
`useWebSocket.ts` 中的连接逻辑直接指向 `:3000` 端口，而不是通过 Vite 开发服务器的代理。

## 解决方案

### 步骤 1: 配置 Vite WebSocket 代理

在 `src/web/vite.config.ts` 中添加 WebSocket 代理配置：

```typescript
server: {
  port: 3001,
  host: '0.0.0.0',
  cors: true,
  proxy: {
    // HTTP API 代理
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false
    },
    // WebSocket 代理 (新增)
    '/ws': {
      target: 'ws://localhost:3000',
      ws: true,
      changeOrigin: true
    }
  }
}
```

**关键配置说明:**
- `target: 'ws://localhost:3000'`: 指向后端 WebSocket 服务器
- `ws: true`: 启用 WebSocket 代理
- `changeOrigin: true`: 修改请求头中的 origin 字段

### 步骤 2: 修改前端 WebSocket 连接逻辑

在 `src/web/src/composables/useWebSocket.ts` 中修改连接地址：

```typescript
if (isDev) {
  // 开发模式：通过 Vite 代理连接到后端 WebSocket 服务器
  // 使用 /ws 路径，Vite 会将其代理到 ws://localhost:3000
  const host = window.location.host // 使用当前 Vite 服务器的 host
  wsUrl = `${protocol}//${host}/ws`
  console.log('开发模式：通过 Vite 代理连接 WebSocket')
} else {
  // 生产模式：连接到当前主机
  wsUrl = `${protocol}//${window.location.host}`
}
```

**修改说明:**
- 开发模式下连接到 `ws://localhost:3001/ws`
- Vite 将 `/ws` 请求代理到 `ws://localhost:3000`
- 这样避免了浏览器的跨域安全策略限制

## 验证修复

### 1. 重启开发服务器

```bash
# 停止当前运行的服务器 (Ctrl+C)
# 然后重新启动
pnpm dev
```

### 2. 检查浏览器控制台

打开浏览器开发者工具，在控制台中查看：

✅ **成功标志:**
```
连接 WebSocket: ws://localhost:3001/ws
开发模式：通过 Vite 代理连接 WebSocket
WebSocket 连接已建立
```

❌ **失败标志:**
```
WebSocket 连接错误
连接失败，已达到最大重试次数
```

### 3. 检查页面右下角连接状态

页面右下角会显示连接状态指示器：
- **WS**: WebSocket 连接状态 (绿色 = 已连接)
- **API**: HTTP API 连接状态 (绿色 = 已连接)

## 技术细节

### 网络架构

```
浏览器 (localhost:3001)
    │
    ├─ HTTP API 请求: /api/* 
    │   └─> Vite Proxy ──> Express (localhost:3000)
    │
    └─ WebSocket 连接: /ws
        └─> Vite Proxy ──> WebSocket Server (localhost:3000)
```

### Vite 代理工作原理

1. 浏览器向 `localhost:3001/ws` 发起 WebSocket 连接请求
2. Vite 拦截该请求，识别出这是一个 WebSocket 升级请求
3. Vite 将请求代理到配置的 `target: ws://localhost:3000`
4. 建立从浏览器到后端的 WebSocket 连接管道
5. 后续的 WebSocket 消息通过该管道透明传输

### 为什么需要代理?

1. **同源策略**: 浏览器默认只允许同源 WebSocket 连接
2. **开发便利性**: 避免 CORS 配置复杂性
3. **生产环境一致性**: 生产环境中前后端通常在同一域名/端口

## 相关文件

- `src/web/vite.config.ts` - Vite 配置文件
- `src/web/src/composables/useWebSocket.ts` - WebSocket 组合式函数
- `src/server/websocket.ts` - 后端 WebSocket 服务
- `src/server/app.ts` - Express 服务器配置
- `src/server/dev.ts` - 开发模式启动脚本

## 常见问题

### Q: 为什么不直接连接到 localhost:3000?

A: 现代浏览器的安全策略会阻止跨端口的 WebSocket 连接。通过 Vite 代理可以：
- 避免 CORS 问题
- 保持与生产环境一致的连接方式
- 简化配置

### Q: 生产环境需要修改配置吗?

A: 不需要。生产环境中前后端通常运行在同一端口，WebSocket 连接逻辑会自动使用 `window.location.host`。

### Q: 如何调试 WebSocket 连接问题?

A: 
1. 打开浏览器开发者工具 -> Network 标签
2. 筛选 "WS" 类型的连接
3. 查看 WebSocket 连接的状态和消息
4. 检查控制台日志中的连接信息

## 总结

此次修复通过配置 Vite 的 WebSocket 代理，解决了开发环境下前端无法连接到后端 WebSocket 服务的问题。修改后：

- ✅ WebSocket 连接稳定
- ✅ 避免跨域问题
- ✅ 开发体验改善
- ✅ 与生产环境一致

---

**修复日期**: 2025-09-30  
**相关 Issue**: WebSocket 连接失败问题