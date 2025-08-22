# 🚀 快速开始

欢迎来到 LDesign Engine 的世界！

## 📦 安装

```bash
npm install @ldesign/engine
```

## 🎯 基础使用

```typescript
import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import App from './App.vue'

// 创建引擎
const engine = createEngine({
  config: {
    debug: true,
    appName: 'My App',
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
