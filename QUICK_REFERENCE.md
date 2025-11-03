# LDesign 应用引擎快速参考

## 📚 目录

- [架构概览](#架构概览)
- [核心概念](#核心概念)
- [快速开始](#快速开始)
- [常用命令](#常用命令)
- [API 参考](#api-参考)

## 🏗️ 架构概览

```
@ldesign/engine-core          # 框架无关的核心引擎
    ├── plugin                 # 插件系统
    ├── middleware             # 中间件系统
    ├── lifecycle              # 生命周期管理
    ├── events                 # 事件系统
    └── di                     # 依赖注入

@ldesign/engine-{framework}   # 框架适配器
    ├── adapter                # 框架适配层
    ├── composables/hooks      # 框架特定工具
    └── directives/decorators  # 框架特定指令
```

## 🎯 核心概念

### 1. 框架无关核心 (`@ldesign/engine-core`)

所有与框架无关的代码都在这里：
- 插件系统
- 中间件
- 生命周期
- 事件总线
- 依赖注入
- 配置管理

### 2. 框架适配器

每个框架都有自己的适配器包：
- `@ldesign/engine-vue` - Vue3
- `@ldesign/engine-react` - React
- `@ldesign/engine-angular` - Angular
- `@ldesign/engine-svelte` - Svelte
- `@ldesign/engine-solid` - Solid
- `@ldesign/engine-lit` - Lit
- `@ldesign/engine-preact` - Preact
- `@ldesign/engine-qwik` - Qwik

### 3. 统一的 API

所有框架适配器提供相同的 API：
- `createEngineApp(options)` - 创建应用
- `app.use(plugin)` - 注册插件
- `app.middleware(fn)` - 注册中间件
- `app.provide(key, value)` - 提供依赖
- `app.inject(key)` - 注入依赖

## 🚀 快速开始

### Vue 应用

```typescript
// main.ts
import { createApp } from 'vue'
import { createEngineApp } from '@ldesign/engine-vue'
import App from './App.vue'

const engine = createEngineApp({
  plugins: [
    // 你的插件
  ],
  middleware: [
    // 你的中间件
  ]
})

const app = createApp(App)
engine.mount(app)
app.mount('#app')
```

### React 应用

```typescript
// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createEngineApp } from '@ldesign/engine-react'
import App from './App'

const engine = createEngineApp({
  plugins: [
    // 你的插件
  ]
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
```

### Angular 应用

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser'
import { createEngineApp } from '@ldesign/engine-angular'
import { AppComponent } from './app/app.component'

const engine = createEngineApp({
  plugins: [
    // 你的插件
  ]
})

bootstrapApplication(AppComponent, {
  providers: [
    // Engine providers
  ]
})
```

## 📦 开发包 (Packages)

### 创建新包

```bash
# 进入 packages 目录
cd packages/your-package

# 复制配置模板
cp ../../.templates/builder.config.template.ts ./builder.config.ts
```

### Package.json 配置

```json
{
  "name": "@ldesign/your-package",
  "scripts": {
    "build": "ldesign-builder build -f esm,cjs,umd,dts",
    "dev": "ldesign-builder build -f esm,cjs,umd,dts --watch"
  },
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.cjs"
    }
  },
  "devDependencies": {
    "@ldesign/builder": "workspace:*"
  }
}
```

### 构建命令

```bash
# 开发模式（监听文件变化）
pnpm dev

# 生产构建
pnpm build

# 清理输出
pnpm clean
```

## 🌟 开发示例 (Examples)

### 创建新示例

```bash
# 进入 examples 目录
cd examples/your-framework

# 复制配置模板
cp ../../.templates/launcher.config.template.ts ./launcher.config.ts
```

### Launcher.config.ts 配置

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  framework: 'vue', // 或 'react', 'angular' 等
  entry: 'src/main.ts',
  server: {
    port: 3000,
    open: true
  }
})
```

### Package.json 配置

```json
{
  "name": "@ldesign/example-vue",
  "scripts": {
    "dev": "launcher dev",
    "build": "launcher build",
    "preview": "launcher preview"
  },
  "dependencies": {
    "@ldesign/launcher": "workspace:*",
    "@ldesign/engine-vue": "workspace:*"
  }
}
```

### 运行命令

```bash
# 开发模式
pnpm dev

# 生产构建
pnpm build

# 预览构建结果
pnpm preview
```

## 🛠️ 常用命令

### 全局命令

```bash
# 安装所有依赖
pnpm install

# 构建所有包
pnpm build

# 清理所有构建产物
pnpm clean
```

### Package 命令

```bash
# 构建特定包
pnpm --filter @ldesign/your-package build

# 开发模式
pnpm --filter @ldesign/your-package dev

# 构建所有 packages
pnpm --filter "./packages/*" build
```

### Example 命令

```bash
# 运行特定示例
pnpm --filter @ldesign/example-vue dev

# 构建特定示例
pnpm --filter @ldesign/example-vue build

# 运行所有示例（不推荐，端口冲突）
# pnpm --filter "./examples/*" dev
```

## 📖 API 参考

### createEngineApp

创建应用引擎实例：

```typescript
import { createEngineApp } from '@ldesign/engine-vue'

const engine = createEngineApp({
  // 插件列表
  plugins: [
    myPlugin,
    anotherPlugin
  ],
  
  // 中间件列表
  middleware: [
    loggingMiddleware,
    authMiddleware
  ],
  
  // 全局配置
  config: {
    apiBase: 'https://api.example.com',
    debug: true
  }
})
```

### 插件 API

```typescript
import type { Plugin } from '@ldesign/engine-core'

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  install(app, options) {
    // 插件初始化逻辑
    app.provide('myService', new MyService())
  },
  
  onInit() {
    // 应用初始化时执行
  },
  
  onMount() {
    // 应用挂载时执行
  },
  
  onUnmount() {
    // 应用卸载时执行
  }
}
```

### 中间件 API

```typescript
import type { Middleware } from '@ldesign/engine-core'

const loggingMiddleware: Middleware = async (ctx, next) => {
  console.log('Before:', ctx.action)
  await next()
  console.log('After:', ctx.action)
}
```

### 依赖注入

```typescript
// 提供依赖
app.provide('userService', new UserService())

// 注入依赖（在插件或组件中）
const userService = app.inject('userService')
```

### 生命周期钩子

```typescript
engine.onInit(() => {
  console.log('应用初始化')
})

engine.onMount(() => {
  console.log('应用已挂载')
})

engine.onUnmount(() => {
  console.log('应用已卸载')
})
```

## 🔍 调试技巧

### 开启调试模式

```typescript
const engine = createEngineApp({
  config: {
    debug: true,
    logLevel: 'debug'
  }
})
```

### 使用 DevTools

```typescript
import { devtools } from '@ldesign/engine-core/devtools'

const engine = createEngineApp({
  plugins: [
    devtools({
      enabled: true
    })
  ]
})
```

## 📋 检查清单

开发前确认：
- [ ] 已安装 Node.js >= 18
- [ ] 已安装 pnpm >= 8
- [ ] 已运行 `pnpm install`

发布前确认：
- [ ] 所有测试通过
- [ ] 代码已 lint
- [ ] 文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号已更新

## 🔗 相关文档

- [完整架构文档](./ARCHITECTURE.md)
- [标准化指南](./STANDARDIZATION_GUIDE.md)
- [Builder 文档](./tools/builder/README.md)
- [Launcher 文档](./tools/launcher/README.md)
- [贡献指南](./CONTRIBUTING.md)

## ❓ 常见问题

### Q: 为什么有独立的 engine-core？
A: 为了代码复用和框架无关性。核心功能一次实现，所有框架共享。

### Q: 可以只使用某个框架适配器吗？
A: 可以，但需要安装 `@ldesign/engine-core` 作为依赖。

### Q: 如何在多个框架间迁移？
A: 业务逻辑放在 `@ldesign/engine-core` 层，只需切换框架适配器即可。

### Q: Builder 和 Launcher 有什么区别？
A: Builder 用于构建库（packages），Launcher 用于开发应用（examples）。

### Q: 是否支持 Vue 2？
A: 支持，使用 `@ldesign/engine-vue2` 适配器。
