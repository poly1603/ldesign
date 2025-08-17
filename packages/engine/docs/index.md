---
layout: home

hero:
  name: 'LDesign Engine'
  text: '强大的Vue3应用引擎'
  tagline: 提供插件化架构和完整的开发工具链，让Vue3应用开发更简单、更高效
  image:
    src: /logo.svg
    alt: LDesign Engine
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: API 文档
      link: /api/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/engine

features:
  - title: 🔌 插件化架构
    details: 模块化的插件系统，支持插件注册、依赖管理、生命周期管理和热重载，让功能扩展变得简单
  - title: ⚡ 中间件系统
    details: 强大的中间件管道，支持请求/响应处理、权限验证、日志记录等横切关注点的统一处理
  - title: 📡 事件系统
    details: 基于发布订阅模式的事件系统，支持优先级、命名空间、一次性监听等高级功能
  - title: 💾 状态管理
    details: 响应式状态管理，支持模块化、持久化、历史记录、计算属性和状态事务
  - title: 🛡️ 安全管理
    details: 内置多层安全防护，包括XSS防护、CSRF防护、内容安全策略和输入验证
  - title: ⚡ 性能监控
    details: 实时性能监控和分析，提供性能预算、自动优化建议和详细的性能报告
  - title: 💾 缓存管理
    details: 智能缓存系统，支持LRU、LFU、FIFO等多种策略，提供缓存预热和穿透保护
  - title: 🎯 指令系统
    details: 丰富的自定义Vue指令，包括防抖、节流、权限控制、懒加载等常用功能
  - title: 📝 日志系统
    details: 结构化日志记录，支持多级别、格式化输出、传输器和日志过滤
  - title: 🔔 通知管理
    details: 全局通知系统，支持多种通知类型、自动关闭、位置配置和自定义样式
  - title: ❌ 错误处理
    details: 全面的错误捕获和处理机制，支持错误分类、恢复策略和智能上报
  - title: 🔧 开发工具
    details: 完整的开发体验，包括调试工具、热重载、TypeScript支持和丰富的开发者工具
---

## 快速开始

### 安装

```bash
npm install @ldesign/engine
# 或
pnpm add @ldesign/engine
# 或
yarn add @ldesign/engine
```

### 基础使用

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 创建引擎实例
const engine = createEngine({
  config: {
    debug: true,
    appName: 'My Vue3 App',
  },
})

// 创建Vue应用
const app = createApp(App)

// 安装引擎
engine.install(app)

// 挂载应用
app.mount('#app')
```

### 使用预设配置

```typescript
import { createEngine, presets } from '@ldesign/engine'

// 使用开发环境预设
const engine = createEngine(presets.development())

// 使用生产环境预设
const engine = createEngine(presets.production())
```

## 核心特性

### 插件系统

```typescript
// 创建插件
const myPlugin = {
  name: 'my-plugin',
  install: (engine) => {
    // 插件逻辑
    engine.logger.info('Plugin installed')
  },
}

// 注册插件
engine.use(myPlugin)
```

### 中间件

```typescript
// 创建中间件
const loggerMiddleware = {
  name: 'logger',
  handler: async (context, next) => {
    console.log('Request started')
    await next()
    console.log('Request completed')
  },
}

// 注册中间件
engine.middleware.use(loggerMiddleware)
```

### 全局状态

```typescript
// 设置全局状态
engine.state.set('user', { name: 'John', age: 30 })

// 获取全局状态
const user = engine.state.get('user')

// 监听状态变化
engine.state.watch('user', (newValue, oldValue) => {
  console.log('User changed:', newValue)
})
```

### 事件管理

```typescript
// 监听事件
engine.events.on('user:login', (user) => {
  console.log('User logged in:', user)
})

// 发布事件
engine.events.emit('user:login', { name: 'John' })
```

## 为什么选择 Vue3 Engine？

- **🎯 专注开发体验**：提供统一的 API 和最佳实践，让开发者专注于业务逻辑
- **🔧 开箱即用**：内置常用功能模块，无需重复造轮子
- **🚀 高性能**：基于 Vue3 响应式系统，性能优异
- **📦 模块化设计**：插件化架构，按需加载，减少包体积
- **🛡️ 类型安全**：完整的 TypeScript 支持，提供类型安全保障
- **📚 完善文档**：详细的文档和示例，快速上手

## 社区

- [GitHub](https://github.com/ldesign/engine)
- [Issues](https://github.com/ldesign/engine/issues)
- [Discussions](https://github.com/ldesign/engine/discussions)

## 许可证

[MIT](https://github.com/ldesign/engine/blob/main/LICENSE)
