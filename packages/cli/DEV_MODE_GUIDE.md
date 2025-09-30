# Dev 模式使用指南

## 🚀 启动 Dev 模式

```bash
cd packages/cli
pnpm dev
```

## 📡 服务端口说明

Dev 模式会同时启动两个服务器：

### 1. **Vite 开发服务器** (前端)
- **端口**: 3002 (如果3001被占用)
- **地址**: http://localhost:3002
- **功能**: 
  - 提供前端页面
  - 支持热模块替换(HMR)
  - 自动刷新浏览器
  - 代理API请求到后端

### 2. **Express 服务器** (后端)
- **端口**: 3000
- **地址**: http://localhost:3000
- **功能**:
  - 提供 REST API
  - WebSocket 服务
  - 静态文件服务(仅用于生产模式)

## ✅ 正确的访问方式

### Dev 模式
**访问**: http://localhost:3002

这样可以享受：
- ✅ 前端热更新
- ✅ WebSocket 正常连接
- ✅ API 请求正常
- ✅ 实时代码修改

### Build 模式
**访问**: http://localhost:3000

```bash
cd packages/cli
pnpm build
node ./bin/cli.js ui
```

## 🔧 WebSocket 连接说明

### Dev 模式
- 前端在 3002 端口
- WebSocket 连接到 3000 端口
- 使用 `import.meta.env.DEV` 判断环境
- 自动连接到 `ws://localhost:3000`

### Build 模式
- 前端和后端都在 3000 端口
- WebSocket 连接到当前主机
- 使用 `ws://${window.location.host}`

## 📝 代码实现

### WebSocket 客户端 (useWebSocket.ts)
```typescript
const isDev = import.meta.env.DEV
let wsUrl: string

if (isDev) {
  // 开发模式：连接到后端服务器的 3000 端口
  const host = window.location.hostname
  wsUrl = `${protocol}//${host}:3000`
} else {
  // 生产模式：连接到当前主机
  wsUrl = `${protocol}//${window.location.host}`
}
```

### Vite 代理配置 (vite.config.ts)
```typescript
server: {
  port: 3001,
  host: '0.0.0.0',
  cors: true,
  proxy: {
    // 代理 API 请求到后端服务器
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

## 🎯 常见问题

### Q1: 为什么访问 3000 端口看到的是旧页面？
**A**: 在 dev 模式下，3000 端口的 Express 服务器会提供 `src/web/dist` 目录的构建文件（如果存在）。这些是旧的构建文件，不会实时更新。

**解决方案**: 访问 3002 端口（Vite 开发服务器）

### Q2: WebSocket 连接失败怎么办？
**A**: 确保：
1. 访问的是 3002 端口（Vite 开发服务器）
2. 后端服务器在 3000 端口正常运行
3. 没有防火墙阻止连接

### Q3: 修改代码后没有自动刷新？
**A**: 
- **前端代码**: 确保访问 3002 端口，Vite 会自动刷新
- **后端代码**: tsx watch 会自动重启服务器

### Q4: 端口被占用怎么办？
**A**: 
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000

# 终止进程
taskkill /F /PID <进程ID>
```

## 🔄 开发流程

### 1. 启动开发服务器
```bash
pnpm dev
```

### 2. 打开浏览器
访问: http://localhost:3002

### 3. 开始开发
- 修改前端代码 → 浏览器自动刷新
- 修改后端代码 → 服务器自动重启

### 4. 测试功能
- 检查 WebSocket 连接状态
- 测试 API 请求
- 验证功能正常

## 📊 性能对比

| 模式 | 启动时间 | 热更新 | 适用场景 |
|------|----------|--------|----------|
| Dev | ~3秒 | ✅ 是 | 开发调试 |
| Build | ~10秒 | ❌ 否 | 生产部署 |

## 🎨 最佳实践

1. **开发时使用 Dev 模式**
   - 快速迭代
   - 实时反馈
   - 提高效率

2. **测试时使用 Build 模式**
   - 验证构建结果
   - 测试生产环境
   - 确保功能正常

3. **部署时使用 Build 模式**
   - 优化性能
   - 减小体积
   - 提高加载速度

## 🚨 注意事项

1. **不要在 dev 模式下访问 3000 端口**
   - 会看到旧的构建文件
   - 没有热更新
   - WebSocket 可能连接失败

2. **确保端口没有被占用**
   - 3000 端口：后端服务器
   - 3002 端口：Vite 开发服务器

3. **修改配置后需要重启**
   - 修改 vite.config.ts
   - 修改 package.json
   - 修改环境变量

## ✨ 总结

- ✅ Dev 模式访问 **3002 端口**
- ✅ Build 模式访问 **3000 端口**
- ✅ WebSocket 在两种模式下都能正常工作
- ✅ 前端热更新只在 Dev 模式下可用
- ✅ 后端自动重启在 Dev 模式下可用

---

**记住**: Dev 模式 = 3002 端口 = 热更新 = 高效开发 🚀

