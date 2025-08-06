# @ldesign/engine 🚀

一个现代化、功能丰富的 Vue 3 应用程序引擎，为企业级应用提供完整的基础设施支持。

## ✨ 特性亮点

### 🏗️ 核心架构
- 🔌 **插件系统** - 模块化架构，支持动态加载和热插拔
- ⚡ **中间件系统** - 灵活的管道处理机制，支持请求/响应拦截
- 📡 **事件系统** - 强大的发布订阅模式，支持异步事件处理
- 💾 **状态管理** - 响应式状态管理，支持持久化和时间旅行
- 📝 **日志系统** - 多级别日志记录，支持多种输出格式和存储方式
- 🔔 **通知系统** - 全局通知管理，支持多种通知类型和自定义样式

### 🛡️ 安全与性能
- 🔒 **安全管理** - 完整的安全防护体系，包括 XSS 防护、输入清理、URL 验证
- ⚡ **性能监控** - 实时性能监控和优化建议，包括内存使用、响应时间等指标
- 💾 **缓存管理** - 智能缓存系统，支持多种缓存策略和自动过期管理
- 🎯 **指令系统** - 丰富的自定义指令，扩展 Vue 的指令功能
- 🚨 **错误处理** - 全面的错误捕获和处理机制，包括错误恢复和智能上报

### 🎨 开发体验
- 📚 **完整文档** - 详细的 API 文档和使用指南
- 🧪 **示例项目** - 丰富的演示页面，展示所有功能特性
- 🔧 **TypeScript** - 完整的类型支持，提供优秀的开发体验
- 🧪 **测试覆盖** - 全面的单元测试和集成测试
- 📦 **模块化设计** - 可按需引入，支持 Tree Shaking

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/engine

# 使用 npm
npm install @ldesign/engine

# 使用 yarn
yarn add @ldesign/engine
```

### 基础使用

```typescript
import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import App from './App.vue'

// 创建 Vue 应用
const app = createApp(App)

// 创建引擎实例
const engine = createEngine({
  // 插件配置
  plugins: {
    // 启用内置插件
    logger: true,
    notifications: true,
    cache: true,
  },
  
  // 安全配置
  security: {
    sanitizeInput: true,
    validateUrls: true,
  },
  
  // 性能配置
  performance: {
    enabled: true,
    autoOptimization: true,
  }
})

// 安装引擎
app.use(engine)

// 挂载应用
app.mount('#app')
```

### 在组件中使用

```vue
<template>
  <div class="my-component">
    <h1>{{ title }}</h1>
    <button @click="handleClick">点击我</button>
    
    <!-- 使用内置指令 -->
    <input v-debounce="handleInput" placeholder="防抖输入" />
    <div v-loading="isLoading">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import type { Engine } from '@ldesign/engine'

// 注入引擎实例
const engine = inject<Engine>('engine')!

const title = ref('Hello Engine!')
const isLoading = ref(false)

// 使用日志系统
function handleClick() {
  engine.logger.info('按钮被点击了')
  
  // 显示通知
  engine.notifications.show({
    type: 'success',
    title: '操作成功',
    message: '按钮点击事件已处理',
    duration: 3000
  })
  
  // 触发自定义事件
  engine.events.emit('button:clicked', { timestamp: Date.now() })
}

// 使用防抖处理
function handleInput(value: string) {
  engine.logger.debug('输入内容:', value)
  
  // 使用缓存
  engine.cache.set('user-input', value, 60000) // 缓存1分钟
}

// 监听事件
engine.events.on('button:clicked', (data) => {
  console.log('收到按钮点击事件:', data)
})
</script>
```

## 📚 核心功能

### 🔌 插件系统

```typescript
// 创建自定义插件
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  install(engine) {
    // 插件安装逻辑
    engine.logger.info('我的插件已安装')
  },
  
  uninstall(engine) {
    // 插件卸载逻辑
    engine.logger.info('我的插件已卸载')
  }
}

// 注册插件
engine.plugins.register(myPlugin)

// 启用插件
engine.plugins.enable('my-plugin')
```

### 📡 事件系统

```typescript
// 监听事件
engine.events.on('user:login', (user) => {
  console.log('用户登录:', user)
})

// 触发事件
engine.events.emit('user:login', { id: 1, name: 'Alice' })

// 一次性监听
engine.events.once('app:ready', () => {
  console.log('应用已准备就绪')
})

// 移除监听器
const unsubscribe = engine.events.on('data:update', handler)
unsubscribe() // 移除监听
```

### 💾 状态管理

```typescript
// 设置状态
engine.state.set('user.profile', {
  name: 'Alice',
  email: 'alice@example.com'
})

// 获取状态
const profile = engine.state.get('user.profile')

// 监听状态变化
engine.state.watch('user.profile', (newValue, oldValue) => {
  console.log('用户资料已更新:', newValue)
})

// 批量更新
engine.state.batch(() => {
  engine.state.set('user.name', 'Bob')
  engine.state.set('user.age', 30)
})
```

### 🔒 安全管理

```typescript
// 输入清理
const cleanInput = engine.security.sanitizeInput('<script>alert("xss")</script>Hello')
// 结果: 'Hello'

// HTML 清理
const cleanHtml = engine.security.sanitizeHtml('<div>Safe</div><script>alert("xss")</script>')
// 结果: '<div>Safe</div>'

// URL 验证
const isValidUrl = engine.security.validateUrl('https://example.com')
// 结果: true

const isMaliciousUrl = engine.security.validateUrl('javascript:alert("xss")')
// 结果: false
```

### ⚡ 性能监控

```typescript
// 开始性能监控
engine.performance.startMonitoring()

// 添加性能标记
engine.performance.mark('operation-start')
await someAsyncOperation()
engine.performance.mark('operation-end')

// 测量性能
engine.performance.measure('operation-duration', 'operation-start', 'operation-end')

// 获取性能数据
const metrics = engine.performance.getMetrics()
console.log('性能指标:', metrics)
```

## 🎯 高级功能

### 缓存管理

```typescript
// 基础缓存
engine.cache.set('user:123', userData, 3600000) // 缓存1小时
const user = engine.cache.get('user:123')

// 命名空间缓存
const userCache = engine.cache.namespace('users')
userCache.set('123', userData)

// 缓存策略
engine.cache.setStrategy('api-data', {
  maxSize: 1000,
  defaultTTL: 300000,
  evictionPolicy: 'lru'
})
```

### 指令系统

```vue
<template>
  <!-- 防抖点击 -->
  <button v-click.debounce="handleClick">防抖点击</button>
  
  <!-- 工具提示 -->
  <span v-tooltip="'这是提示信息'">悬停查看</span>
  
  <!-- 加载状态 -->
  <div v-loading="isLoading">内容区域</div>
  
  <!-- 拖拽功能 -->
  <div v-drag="handleDrag">拖拽我</div>
</template>
```

### 错误处理

```typescript
// 全局错误处理
engine.errors.onError((error, context) => {
  console.error('捕获到错误:', error)
  
  // 错误上报
  engine.errors.reportError(error, context)
})

// 错误恢复策略
engine.errors.setRecoveryStrategy('NetworkError', async (error, context) => {
  if (context.retryCount < 3) {
    return { retry: true }
  }
  return { retry: false, fallback: () => showOfflineMessage() }
})
```

## 📖 文档与示例

### 📚 完整文档
- [快速开始](./docs/guide/quick-start.md)
- [核心概念](./docs/guide/getting-started.md)
- [API 参考](./docs/api/)
- [最佳实践](./docs/examples/)

### 🧪 在线演示
运行示例项目查看所有功能的实际效果：

```bash
cd packages/engine/example
pnpm install
pnpm run dev
```

访问 `http://localhost:5173` 查看演示页面，包括：
- 🏠 **主页** - 功能概览和快速导航
- 🔌 **插件系统演示** - 插件的注册、启用、禁用
- 📡 **事件系统演示** - 事件的发布、订阅、管理
- 💾 **状态管理演示** - 状态的设置、获取、监听
- ⚡ **中间件演示** - 中间件的注册和执行
- 📝 **日志系统演示** - 不同级别的日志记录
- 🔔 **通知系统演示** - 各种类型的通知展示
- 🔒 **安全管理演示** - 输入清理和安全验证
- ⚡ **性能监控演示** - 实时性能数据展示
- 💾 **缓存管理演示** - 缓存的设置、获取、管理
- 🎯 **指令系统演示** - 自定义指令的使用
- 🚨 **错误处理演示** - 错误捕获和处理机制

## 🛠️ 开发指南

### 环境要求
- Node.js >= 16
- pnpm >= 7
- Vue >= 3.3

### 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式 (监听文件变化)
pnpm run dev

# 构建生产版本
pnpm run build

# 运行测试
pnpm run test

# 测试覆盖率
pnpm run test:coverage

# 代码检查
pnpm run lint

# 代码格式化
pnpm run format

# 文档开发服务器
pnpm run docs:dev

# 构建文档
pnpm run docs:build

# 示例项目开发
cd example && pnpm run dev
```

## 📄 许可证

本项目采用 [MIT](./LICENSE) 许可证。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

<div align="center">
  <p>如果这个项目对你有帮助，请给我们一个 ⭐️</p>
  <p>Made with ❤️ by LDesign Team</p>
</div>
