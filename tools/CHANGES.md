# 📝 变更清单

本文档列出了为实现可编程 API 所做的所有变更。

---

## 📦 新增文件

### Server 项目 (`tools/server/`)

1. **`src/programmatic.ts`** - 可编程接口实现
   - `startDevServer()` - 启动开发模式服务器
   - `startProdServer()` - 启动生产模式服务器
   - `startServer()` - 通用启动函数
   - 类型定义: `ServerOptions`, `ServerInstance`

### Web 项目 (`tools/web/`)

1. **`src/programmatic.ts`** - 可编程接口实现
   - `startDevUI()` - 启动开发模式前端
   - `startProdUI()` - 启动生产模式前端
   - `startUI()` - 通用启动函数
   - 类型定义: `WebUIOptions`, `WebUIInstance`

2. **`tsup.config.ts`** - 库构建配置
   - 用于构建可导入的库文件

### 文档和测试

1. **`README_PROGRAMMATIC_API.md`** - 完整的使用指南
2. **`IMPLEMENTATION_SUMMARY.md`** - 实施总结
3. **`QUICK_START.md`** - 快速开始指南
4. **`CHANGES.md`** - 本文档
5. **`test-programmatic-api.ts`** - 测试脚本

---

## 🔧 修改文件

### Server 项目 (`tools/server/`)

#### `package.json`

**修改前:**
```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "start": "node dist/index.js",
    "seed": "tsx scripts/seed.ts",
    "clean": "rimraf dist",
    "test": "vitest"
  }
}
```

**修改后:**
```json
{
  "scripts": {
    "build": "tsup",
    "build:prod": "tsup --minify",
    "dev": "tsx watch src/index.ts",
    "dev:build": "tsup --watch",
    "start": "node dist/index.js",
    "start:prod": "NODE_ENV=production node dist/index.js",
    "seed": "tsx scripts/seed.ts",
    "clean": "rimraf dist",
    "test": "vitest"
  }
}
```

**变更说明:**
- ✅ 添加 `dev` - 使用 tsx watch 实现热重载
- ✅ 添加 `dev:build` - 开发构建（监听模式）
- ✅ 添加 `build:prod` - 生产构建（带压缩）
- ✅ 添加 `start:prod` - 生产模式启动

#### `tsup.config.ts`

**修改前:**
```typescript
export default defineConfig({
  // ...
  dts: false,
  // ...
})
```

**修改后:**
```typescript
export default defineConfig({
  // ...
  dts: true, // 生成类型定义文件
  // ...
})
```

**变更说明:**
- ✅ 启用类型定义生成，支持 TypeScript 导入

#### `src/index.ts`

**修改前:**
```typescript
export { app }
export * from './types'
```

**修改后:**
```typescript
// 导出应用实例（用于直接运行）
export { app }

// 导出类型
export * from './types'

// 导出可编程接口（用于 CLI 等工具调用）
export { startDevServer, startProdServer, startServer } from './programmatic'
export type { ServerOptions, ServerInstance } from './programmatic'

// 导出 App 类（用于高级自定义）
export { App } from './app'
export type { AppConfig } from './app'
```

**变更说明:**
- ✅ 导出可编程接口函数
- ✅ 导出相关类型定义
- ✅ 导出 App 类供高级使用

---

### Web 项目 (`tools/web/`)

#### `package.json`

**修改前:**
```json
{
  "name": "@ldesign/web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "LDesign Web 管理界面 - Vue3 + Vite + Naive UI",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:check": "vue-tsc --noEmit && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.4",
    "@vue/tsconfig": "^0.5.0",
    "typescript": "^5.3.0",
    "vite": "^5.4.21",
    "vue-tsc": "^1.8.27"
  }
}
```

**修改后:**
```json
{
  "name": "@ldesign/web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "LDesign Web 管理界面 - Vue3 + Vite + Naive UI",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:lib": "tsup",
    "build:check": "vue-tsc --noEmit && vite build",
    "build:prod": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "start": "vite preview",
    "start:prod": "vite preview --port 5173 --host 0.0.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.4",
    "@vue/tsconfig": "^0.5.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.4.21",
    "vue-tsc": "^1.8.27"
  }
}
```

**变更说明:**
- ✅ 添加 `main` 和 `types` 字段
- ✅ 添加 `exports` 配置
- ✅ 添加 `build:lib` - 库构建
- ✅ 添加 `build:prod` - 生产构建
- ✅ 添加 `start` 和 `start:prod` - 启动脚本
- ✅ 添加 `tsup` 依赖

#### `src/index.ts`

**修改前:**
```typescript
/**
 * Web UI 管理界面
 */

export {}
```

**修改后:**
```typescript
/**
 * Web UI 管理界面
 * 
 * 提供可编程调用的接口，用于在 CLI 或其他工具中启动前端服务
 */

// 导出可编程接口
export { startDevUI, startProdUI, startUI } from './programmatic'
export type { WebUIOptions, WebUIInstance } from './programmatic'
```

**变更说明:**
- ✅ 导出可编程接口函数
- ✅ 导出相关类型定义

---

### CLI 项目 (`tools/cli/`)

#### `src/commands/ui.ts`

**主要变更:**

1. **导入变更**

**修改前:**
```typescript
import { execa } from 'execa'
import waitOn from 'wait-on'
```

**修改后:**
```typescript
import { startDevServer, startProdServer, type ServerInstance } from '@ldesign/server'
import { startDevUI, startProdUI, type WebUIInstance } from '@ldesign/web'
```

2. **实现变更**

**修改前:**
```typescript
// 使用 execa 调用 pnpm 命令
const serverProc = execa('pnpm', serverCmd, { cwd: SERVER_PATH, shell: true })
const webProc = execa('pnpm', ['-C', WEB_PATH, 'dev'], { cwd: WEB_PATH, shell: true })
```

**修改后:**
```typescript
// 直接调用可编程接口
const serverInstance = await startDevServer({ port: serverPort, host })
const webInstance = await startDevUI({ port: webPort, host })
```

**变更说明:**
- ✅ 从使用 `execa` 改为直接调用函数
- ✅ 更好的类型安全
- ✅ 更简单的资源管理
- ✅ 更清晰的错误处理

---

## 📊 功能对比

### 启动方式对比

#### 改进前

```bash
# 只能通过 npm scripts
cd tools/server
pnpm dev

cd tools/web
pnpm dev
```

#### 改进后

```bash
# 方式 1: npm scripts（仍然支持）
cd tools/server
pnpm dev

# 方式 2: CLI 命令
ldesign ui --dev

# 方式 3: 可编程接口
import { startDevServer } from '@ldesign/server'
const server = await startDevServer()
```

### 集成方式对比

#### 改进前

```typescript
// CLI 中只能通过 execa 调用
const proc = execa('pnpm', ['dev'], { cwd: SERVER_PATH })
// ❌ 无法访问服务器实例
// ❌ 难以获取运行时信息
```

#### 改进后

```typescript
// CLI 中直接调用函数
const server = await startDevServer({ port: 3000 })
// ✅ 可以访问服务器实例
// ✅ 轻松获取运行时信息
console.log(`Server: http://${server.getHost()}:${server.getPort()}`)
```

---

## ✅ 新增功能

### 1. 热重载支持

- **Server**: 使用 `tsx watch` 实现源码热重载
- **Web**: 使用 Vite HMR 实现模块热替换

### 2. 模式切换

- **开发模式**: `--dev` 标志，支持热重载
- **生产模式**: 默认模式，使用构建后的代码

### 3. 可编程接口

- **类型安全**: 完整的 TypeScript 类型定义
- **灵活配置**: 支持自定义端口、主机等
- **优雅关闭**: 提供 `stop()` 方法清理资源

### 4. 更好的日志

- **开发模式**: 详细的日志输出
- **生产模式**: 简洁的日志输出
- **静默模式**: 支持 `silent` 选项

---

## 🎯 使用场景

### 场景 1: 日常开发

```bash
# 一键启动开发环境（支持热重载）
ldesign ui --dev
```

### 场景 2: 生产部署

```bash
# 构建并启动生产服务
pnpm build
ldesign ui
```

### 场景 3: 自动化测试

```typescript
// 在测试中启动服务
const server = await startDevServer({ port: 0, silent: true })
// 运行测试...
await server.stop()
```

### 场景 4: 自定义脚本

```typescript
// 自定义部署脚本
import { startProdServer } from '@ldesign/server'

const server = await startProdServer({
  port: process.env.PORT,
  host: '0.0.0.0',
})
```

---

## 📚 相关文档

- [快速开始](./QUICK_START.md)
- [可编程 API 使用指南](./README_PROGRAMMATIC_API.md)
- [实施总结](./IMPLEMENTATION_SUMMARY.md)

---

## 🎉 总结

本次变更实现了：

✅ **3 个新文件** - 可编程接口实现
✅ **5 个文档** - 完整的使用指南
✅ **1 个测试脚本** - 快速验证
✅ **6 个文件修改** - 配置和导出
✅ **完整的类型支持** - TypeScript 类型定义
✅ **向后兼容** - 原有的 npm scripts 仍然可用

现在你可以通过多种方式启动和集成服务，享受更好的开发体验！🚀

