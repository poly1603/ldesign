---
layout: home

hero:
  name: "Vue3 Engine"
  text: "强大的Vue3应用引擎"
  tagline: 通过统一API集成Vue3核心操作，提供插件化架构和完整开发工具链
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic

features:
  - title: 🚀 快速创建
    details: 通过 createEngine 方法，使用简单配置即可快速创建Vue3应用
  - title: 🔌 插件化架构
    details: 完整的插件系统，支持插件注册、生命周期管理和插件间通信
  - title: ⚡ 中间件支持
    details: 强大的中间件系统，支持请求拦截、响应处理和错误捕获
  - title: 📊 全局状态管理
    details: 基于Vue3响应式系统的全局状态管理，支持模块化状态
  - title: 🎯 事件管理
    details: 全局事件发布订阅系统，支持事件命名空间和优先级
  - title: 🛡️ 错误处理
    details: 全局错误捕获、处理和上报，支持错误分类和恢复策略
  - title: 📝 日志系统
    details: 美观的日志系统，支持多级别日志、格式化输出和日志持久化
  - title: 🔔 通知管理
    details: 全局通知系统，支持多种通知类型和自定义样式
  - title: 🎨 扩展接口
    details: 预留Router、State、i18n、Theme等功能模块接口，方便扩展
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
    appName: 'My Vue3 App'
  }
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
  }
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
  }
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

- **🎯 专注开发体验**：提供统一的API和最佳实践，让开发者专注于业务逻辑
- **🔧 开箱即用**：内置常用功能模块，无需重复造轮子
- **🚀 高性能**：基于Vue3响应式系统，性能优异
- **📦 模块化设计**：插件化架构，按需加载，减少包体积
- **🛡️ 类型安全**：完整的TypeScript支持，提供类型安全保障
- **📚 完善文档**：详细的文档和示例，快速上手

## 社区

- [GitHub](https://github.com/ldesign/engine)
- [Issues](https://github.com/ldesign/engine/issues)
- [Discussions](https://github.com/ldesign/engine/discussions)

## 许可证

[MIT](https://github.com/ldesign/engine/blob/main/LICENSE)