# 可编程 API 实施总结

## 📋 实施概览

本次实施为 Server、Web 和 CLI 三个项目添加了完整的可编程接口，使得可以通过函数调用的方式启动服务，而不是依赖 npm scripts 或命令行工具。

---

## ✅ 已完成的工作

### 1. Server 项目 (`tools/server/`)

#### 新增文件
- ✅ `src/programmatic.ts` - 可编程接口实现

#### 修改文件
- ✅ `src/index.ts` - 导出可编程接口
- ✅ `package.json` - 添加新的 npm scripts
- ✅ `tsup.config.ts` - 启用类型定义生成

#### 新增功能
```typescript
// 开发模式
startDevServer(options?: ServerOptions): Promise<ServerInstance>

// 生产模式
startProdServer(options?: ServerOptions): Promise<ServerInstance>

// 通用启动
startServer(options?: ServerOptions & { mode?: 'dev' | 'prod' }): Promise<ServerInstance>
```

#### NPM Scripts
```json
{
  "dev": "tsx watch src/index.ts",           // 开发模式（热重载）
  "dev:build": "tsup --watch",               // 开发构建（监听）
  "build": "tsup",                           // 标准构建
  "build:prod": "tsup --minify",             // 生产构建
  "start": "node dist/index.js",             // 启动
  "start:prod": "NODE_ENV=production node dist/index.js"  // 生产启动
}
```

---

### 2. Web 项目 (`tools/web/`)

#### 新增文件
- ✅ `src/programmatic.ts` - 可编程接口实现
- ✅ `tsup.config.ts` - 库构建配置

#### 修改文件
- ✅ `src/index.ts` - 导出可编程接口
- ✅ `package.json` - 添加新的 npm scripts 和导出配置

#### 新增功能
```typescript
// 开发模式
startDevUI(options?: WebUIOptions): Promise<WebUIInstance>

// 生产模式
startProdUI(options?: WebUIOptions): Promise<WebUIInstance>

// 通用启动
startUI(options?: WebUIOptions & { mode?: 'dev' | 'prod' }): Promise<WebUIInstance>
```

#### NPM Scripts
```json
{
  "dev": "vite",                             // 开发模式（热重载）
  "build": "vite build",                     // 标准构建
  "build:lib": "tsup",                       // 库构建
  "build:prod": "vue-tsc --noEmit && vite build",  // 生产构建
  "preview": "vite preview",                 // 预览
  "start": "vite preview",                   // 启动
  "start:prod": "vite preview --port 5173 --host 0.0.0.0"  // 生产启动
}
```

---

### 3. CLI 项目 (`tools/cli/`)

#### 修改文件
- ✅ `src/commands/ui.ts` - 重写为使用可编程接口

#### 改进点
- ✅ 从使用 `execa` 调用 pnpm 命令改为直接调用函数
- ✅ 更好的错误处理和资源清理
- ✅ 更清晰的日志输出
- ✅ 支持开发/生产模式切换

#### 使用方式
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
```

---

### 4. 文档和测试

#### 新增文档
- ✅ `tools/README_PROGRAMMATIC_API.md` - 完整的使用指南
- ✅ `tools/IMPLEMENTATION_SUMMARY.md` - 本文档

#### 测试脚本
- ✅ `tools/test-programmatic-api.ts` - 快速测试脚本

---

## 🎯 核心特性

### 1. 开发模式 (Dev Mode)

**Server:**
- 使用 `tsx watch` 实现热重载
- 详细的日志输出
- 开发友好的错误提示
- CORS 配置宽松

**Web:**
- Vite HMR 热模块替换
- 实时编译
- 代理配置到后端 API
- 自动打开浏览器

### 2. 生产模式 (Prod Mode)

**Server:**
- 使用构建后的代码
- 优化的性能配置
- 简洁的日志输出
- 严格的 CORS 配置

**Web:**
- 预览构建后的静态文件
- 优化的资源加载
- 生产环境配置

### 3. 可编程接口

**统一的接口设计:**
```typescript
interface ServerOptions {
  port?: number
  host?: string
  corsOrigins?: string[]
  enableWebSocket?: boolean
  silent?: boolean
}

interface ServerInstance {
  app: App
  stop: () => Promise<void>
  getHttpServer: () => HttpServer
  getPort: () => number
  getHost: () => string
}
```

**优势:**
- ✅ 类型安全
- ✅ 易于测试
- ✅ 灵活配置
- ✅ 优雅关闭
- ✅ 可组合使用

---

## 📊 对比：改进前后

### 改进前 (使用 execa)

```typescript
// CLI 中启动服务
const serverProc = execa('pnpm', ['-C', SERVER_PATH, 'dev'], { 
  cwd: SERVER_PATH, 
  shell: true 
})

// 问题:
// ❌ 无法直接访问服务器实例
// ❌ 难以获取运行时信息
// ❌ 进程管理复杂
// ❌ 错误处理困难
// ❌ 无类型安全
```

### 改进后 (使用可编程接口)

```typescript
// CLI 中启动服务
const server = await startDevServer({
  port: 3000,
  host: '127.0.0.1',
})

// 优势:
// ✅ 直接访问服务器实例
// ✅ 轻松获取运行时信息
// ✅ 简单的资源管理
// ✅ 清晰的错误处理
// ✅ 完整的类型支持
```

---

## 🚀 使用示例

### 示例 1: 在 CLI 中使用

```typescript
import { startDevServer } from '@ldesign/server'
import { startDevUI } from '@ldesign/web'

export async function uiCommand(options: UIOptions) {
  // 启动后端
  const server = await startDevServer({ port: 3000 })
  
  // 启动前端
  const ui = await startDevUI({ port: 5173, open: true })
  
  // 清理
  process.on('SIGINT', async () => {
    await ui.stop()
    await server.stop()
  })
}
```

### 示例 2: 在测试中使用

```typescript
import { startDevServer } from '@ldesign/server'

describe('API Tests', () => {
  let server: ServerInstance
  
  beforeAll(async () => {
    server = await startDevServer({ 
      port: 0, // 随机端口
      silent: true 
    })
  })
  
  afterAll(async () => {
    await server.stop()
  })
  
  it('should respond to health check', async () => {
    const res = await fetch(`http://localhost:${server.getPort()}/api/health`)
    expect(res.ok).toBe(true)
  })
})
```

### 示例 3: 在自定义脚本中使用

```typescript
import { startProdServer } from '@ldesign/server'

async function deploy() {
  const server = await startProdServer({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
  })
  
  console.log(`Server running at http://${server.getHost()}:${server.getPort()}`)
}

deploy()
```

---

## 🔧 下一步操作

### 1. 安装依赖

```bash
# 在项目根目录
pnpm install

# 或分别安装
cd tools/server && pnpm install
cd tools/web && pnpm install
cd tools/cli && pnpm install
```

### 2. 构建项目

```bash
# Server
cd tools/server
pnpm build

# Web (库构建)
cd tools/web
pnpm build:lib

# CLI
cd tools/cli
pnpm build
```

### 3. 测试

#### 方式 1: 使用测试脚本

```bash
# 开发模式
pnpm tsx tools/test-programmatic-api.ts dev

# 生产模式
pnpm tsx tools/test-programmatic-api.ts prod
```

#### 方式 2: 使用 CLI

```bash
# 开发模式
ldesign ui --dev

# 生产模式
ldesign ui
```

---

## ⚠️ 注意事项

### 1. 构建顺序

生产模式需要先构建：

```bash
# 1. 构建 Server
cd tools/server && pnpm build

# 2. 构建 Web
cd tools/web && pnpm build

# 3. 启动
ldesign ui
```

### 2. 端口配置

- **Server 默认端口**: 3000
- **Web 默认端口**: 5173
- 可通过选项或环境变量自定义

### 3. 热重载

- **开发模式**: 自动支持热重载
- **生产模式**: 不支持热重载，需要重新构建

### 4. 资源清理

始终在进程退出时调用 `stop()` 方法：

```typescript
process.on('SIGINT', async () => {
  await server.stop()
  await ui.stop()
})
```

---

## 📚 相关文档

- [可编程 API 使用指南](./README_PROGRAMMATIC_API.md)
- [Server 项目文档](./server/README.md)
- [Web 项目文档](./web/README.md)
- [CLI 项目文档](./cli/README.md)

---

## 🎉 总结

本次实施成功地为三个项目添加了完整的可编程接口，实现了：

✅ **更好的开发体验** - 热重载、类型安全、清晰的错误提示
✅ **更灵活的集成** - 可在 CLI、测试、脚本中轻松使用
✅ **更简单的维护** - 统一的接口设计，易于理解和扩展
✅ **更强的可测试性** - 可编程接口便于编写单元测试和集成测试

现在你可以：
1. 在 CLI 中直接调用函数启动服务
2. 在测试中轻松启动和停止服务
3. 在自定义脚本中灵活使用
4. 享受完整的 TypeScript 类型支持

