# 🚀 快速开始

欢迎来到 LDesign Engine 的世界！

## 📦 安装

```bash
# 推荐使用 pnpm
pnpm add @ldesign/engine

# 或使用 npm
npm install @ldesign/engine

# 或使用 yarn
yarn add @ldesign/engine
```

## 🎯 基础使用

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 创建引擎
const engine = createEngine({
  config: {
    debug: true,
    app: {
      name: 'My App',
      version: '1.0.0'
    }
  },
})

// 创建应用
const app = createApp(App)

// 安装引擎
engine.install(app)

// 挂载
app.mount('#app')
```

## 🎪 核心功能

### 状态管理
```typescript
// 设置状态
engine.state.set('user', { name: 'John' })

// 获取状态
const user = engine.state.get('user')

// 监听变化
engine.state.watch('user', (newVal) => {
  console.log('用户变化:', newVal)
})
```

### 事件系统
```typescript
// 监听事件
engine.events.on('user:login', (user) => {
  console.log('用户登录:', user)
})

// 触发事件
engine.events.emit('user:login', { name: 'John' })

// 命名空间事件
const userEvents = engine.events.namespace('user')
userEvents.on('logout', () => console.log('用户登出'))

// 防抖事件
const searchDebouncer = engine.events.debounce('search', 300)
searchDebouncer.emit('search query')
```

### 缓存系统
```typescript
// 基础缓存
engine.cache.set('user:123', userData, 60000) // 缓存1分钟

// 获取缓存
const user = engine.cache.get('user:123')

// 预热缓存
await engine.cache.warmup([
  { key: 'config', loader: () => fetchConfig() }
])
```

### 通知系统
```typescript
engine.notifications.show({
  type: 'success',
  title: '成功！',
  message: '操作完成'
})
```

## 🎉 开始你的旅程！

现在你已经掌握了基础，开始探索更多功能吧！
