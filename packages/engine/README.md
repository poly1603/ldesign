# @ldesign/engine

一个强大的 Vue3 应用引擎，提供插件系统、中间件支持和全局管理功能。

## 特性

- 🚀 **快速创建** - 通过 `createEngine` 方法快速创建 Vue3 应用
- 🔌 **插件系统** - 完整的插件化架构，支持插件生命周期管理
- 🛠️ **中间件支持** - 灵活的中间件系统，支持请求拦截和响应处理
- 🌐 **全局管理** - 全局状态、事件、指令、错误管理
- 📝 **美观日志** - 多级别日志系统，支持格式化输出
- 🔔 **通知系统** - 全局通知管理，支持多种通知类型
- ⚡ **响应式配置** - 基于 Vue3 响应式的配置系统
- 🔗 **扩展接口** - 预留 Router、State、i18n、Theme 等模块接口

## 安装

```bash
npm install @ldesign/engine
# 或
pnpm add @ldesign/engine
# 或
yarn add @ldesign/engine
```

## 快速开始

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 创建引擎实例
const engine = createEngine({
  // 全局配置
  config: {
    appName: 'My App',
    version: '1.0.0'
  },
  // 插件配置
  plugins: [
    // 注册插件
  ],
  // 中间件配置
  middleware: [
    // 注册中间件
  ]
})

// 创建 Vue 应用
const app = createApp(App)

// 安装引擎
engine.install(app)

// 挂载应用
app.mount('#app')
```

## 核心概念

### 引擎 (Engine)

引擎是整个系统的核心，负责管理所有模块和提供统一的 API。

### 插件系统 (Plugin System)

支持插件的注册、卸载和生命周期管理，提供插件间通信机制。

### 中间件 (Middleware)

提供请求拦截、响应处理和错误捕获功能。

### 全局管理 (Global Management)

- **状态管理**: 基于 Vue3 响应式系统的全局状态管理
- **事件管理**: 全局事件发布订阅系统
- **指令管理**: 自定义指令的注册和管理
- **错误管理**: 全局错误捕获和处理

## API 文档

详细的 API 文档请查看 [文档站点](./docs)。

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 代码检查
pnpm lint
```

## 许可证

MIT