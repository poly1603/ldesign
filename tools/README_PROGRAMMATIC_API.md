# 可编程 API 使用指南

本文档介绍如何使用 Server 和 Web 项目提供的可编程接口。

## 📦 项目结构

```
tools/
├── server/          # Express API 服务
│   ├── src/
│   │   ├── programmatic.ts   # 可编程接口
│   │   └── index.ts          # 主导出文件
│   └── package.json
├── web/             # Vue3 前端 UI
│   ├── src/
│   │   ├── programmatic.ts   # 可编程接口
│   │   └── index.ts          # 主导出文件
│   └── package.json
└── cli/             # CLI 工具
    └── src/
        └── commands/
            └── ui.ts         # UI 命令（使用可编程接口）
```

---

## 🚀 Server 项目

### NPM Scripts

```bash
# 开发模式（支持热重载）
pnpm dev              # 使用 tsx watch 启动，自动重启

# 构建
pnpm build            # 标准构建
pnpm build:prod       # 生产构建（带压缩）

# 启动
pnpm start            # 启动构建后的服务器
pnpm start:prod       # 生产模式启动
```

### 可编程接口

#### 1. 启动开发模式服务器

```typescript
import { startDevServer } from '@ldesign/server'

const server = await startDevServer({
  port: 3000,
  host: '127.0.0.1',
  corsOrigins: ['http://localhost:5173'],
  enableWebSocket: true,
  silent: false, // 是否静默模式
})

// 获取信息
console.log(`Server running at http://${server.getHost()}:${server.getPort()}`)

// 停止服务器
await server.stop()
```

#### 2. 启动生产模式服务器

```typescript
import { startProdServer } from '@ldesign/server'

const server = await startProdServer({
  port: 3000,
  host: '0.0.0.0',
  corsOrigins: ['*'],
  enableWebSocket: true,
})

// 停止服务器
await server.stop()
```

#### 3. 通用启动函数

```typescript
import { startServer } from '@ldesign/server'

// 根据环境变量或参数决定模式
const server = await startServer({
  mode: 'dev', // 'dev' | 'prod'
  port: 3000,
})
```

### 类型定义

```typescript
interface ServerOptions {
  port?: number
  host?: string
  corsOrigins?: string[]
  enableWebSocket?: boolean
  silent?: boolean
}

interface ServerInstance {
  app: App                          // Express App 实例
  stop: () => Promise<void>         // 停止服务器
  getHttpServer: () => HttpServer   // 获取 HTTP 服务器
  getPort: () => number             // 获取端口
  getHost: () => string             // 获取主机
}
```

---

## 🎨 Web 项目

### NPM Scripts

```bash
# 开发模式（支持热重载）
pnpm dev              # 启动 Vite 开发服务器

# 构建
pnpm build            # 标准构建
pnpm build:prod       # 生产构建（带类型检查）
pnpm build:lib        # 构建库文件（用于导出）

# 预览/启动
pnpm preview          # 预览构建结果
pnpm start            # 同 preview
pnpm start:prod       # 生产模式预览
```

### 可编程接口

#### 1. 启动开发模式前端

```typescript
import { startDevUI } from '@ldesign/web'

const ui = await startDevUI({
  port: 5173,
  host: '0.0.0.0',
  open: true,  // 是否自动打开浏览器
  silent: false,
  strictPort: false, // 端口被占用时是否报错
})

// 获取信息
console.log(`UI running at ${ui.getUrl()}`)

// 停止服务
await ui.stop()
```

#### 2. 启动生产模式前端

```typescript
import { startProdUI } from '@ldesign/web'

const ui = await startProdUI({
  port: 5173,
  host: '0.0.0.0',
  open: false,
})

// 停止服务
await ui.stop()
```

#### 3. 通用启动函数

```typescript
import { startUI } from '@ldesign/web'

// 根据环境变量或参数决定模式
const ui = await startUI({
  mode: 'dev', // 'dev' | 'prod'
  port: 5173,
})
```

### 类型定义

```typescript
interface WebUIOptions {
  port?: number
  host?: string
  open?: boolean
  silent?: boolean
  strictPort?: boolean
}

interface WebUIInstance {
  server: ViteDevServer | PreviewServer  // Vite 服务器实例
  stop: () => Promise<void>              // 停止服务
  getPort: () => number                  // 获取端口
  getHost: () => string                  // 获取主机
  getUrl: () => string                   // 获取完整 URL
}
```

---

## 🔧 CLI 集成示例

### 在 CLI 中使用

```typescript
// tools/cli/src/commands/ui.ts
import { startDevServer, startProdServer } from '@ldesign/server'
import { startDevUI, startProdUI } from '@ldesign/web'

export async function uiCommand(options: UIOptions) {
  const isDev = options.dev

  // 启动服务器
  const server = isDev 
    ? await startDevServer({ port: 3000 })
    : await startProdServer({ port: 3000 })

  // 启动前端
  const ui = isDev
    ? await startDevUI({ port: 5173 })
    : await startProdUI({ port: 5173 })

  // 清理
  process.on('SIGINT', async () => {
    await ui.stop()
    await server.stop()
  })
}
```

### CLI 命令使用

```bash
# 开发模式（热重载）
ldesign ui --dev

# 生产模式
ldesign ui

# 仅启动服务器
ldesign ui --server-only

# 仅启动前端
ldesign ui --web-only

# 自定义端口
ldesign ui --dev --server-port 4000 --web-port 8080

# 不自动打开浏览器
ldesign ui --dev --no-open

# 跳过构建步骤
ldesign ui --no-build
```

---

## 🎯 完整示例

### 示例 1: 同时启动开发服务

```typescript
import { startDevServer } from '@ldesign/server'
import { startDevUI } from '@ldesign/web'

async function startDevelopment() {
  // 启动后端
  const server = await startDevServer({
    port: 3000,
    host: '127.0.0.1',
  })

  // 启动前端
  const ui = await startDevUI({
    port: 5173,
    host: '0.0.0.0',
    open: true,
  })

  console.log('🎉 开发环境已启动！')
  console.log(`📍 前端: ${ui.getUrl()}`)
  console.log(`📍 后端: http://${server.getHost()}:${server.getPort()}`)

  // 优雅关闭
  const cleanup = async () => {
    await ui.stop()
    await server.stop()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

startDevelopment()
```

### 示例 2: 生产环境部署

```typescript
import { startProdServer } from '@ldesign/server'

async function deploy() {
  const server = await startProdServer({
    port: Number(process.env.PORT) || 3000,
    host: '0.0.0.0',
    corsOrigins: process.env.CORS_ORIGINS?.split(','),
  })

  console.log(`✅ 生产服务器已启动: http://${server.getHost()}:${server.getPort()}`)
}

deploy()
```

---

## 📝 注意事项

### 1. 开发模式 vs 生产模式

| 特性 | 开发模式 | 生产模式 |
|------|---------|---------|
| 热重载 | ✅ 支持 | ❌ 不支持 |
| 构建 | ❌ 不需要 | ✅ 需要先构建 |
| 性能 | 较慢 | 优化 |
| 日志 | 详细 | 简洁 |
| 错误提示 | 友好 | 简洁 |

### 2. 端口冲突处理

- **开发模式**: `strictPort: false` 会自动尝试下一个端口
- **生产模式**: `strictPort: true` 端口被占用时会报错

### 3. 清理资源

始终在进程退出时调用 `stop()` 方法清理资源：

```typescript
process.on('SIGINT', async () => {
  await server.stop()
  await ui.stop()
})
```

### 4. 构建顺序

生产模式启动前需要先构建：

```bash
# Server
cd tools/server
pnpm build

# Web
cd tools/web
pnpm build

# 然后启动
ldesign ui
```

---

## 🔍 故障排查

### 问题 1: 端口被占用

```bash
# 查找占用端口的进程
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# 杀死进程
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

### 问题 2: 模块未找到

确保已安装依赖：

```bash
# 在项目根目录
pnpm install

# 或在各个子项目
cd tools/server && pnpm install
cd tools/web && pnpm install
cd tools/cli && pnpm install
```

### 问题 3: 类型错误

重新构建类型定义：

```bash
cd tools/server
pnpm build

cd tools/web
pnpm build:lib
```

---

## 🎓 最佳实践

1. **开发阶段**: 使用 `--dev` 标志启用热重载
2. **测试阶段**: 先构建再启动，模拟生产环境
3. **生产部署**: 使用环境变量配置，不要硬编码
4. **错误处理**: 始终捕获异常并优雅关闭
5. **日志记录**: 生产环境使用 `silent: true` 减少日志

---

## 📚 相关文档

- [Server API 文档](./server/README.md)
- [Web UI 文档](./web/README.md)
- [CLI 使用指南](./cli/README.md)

