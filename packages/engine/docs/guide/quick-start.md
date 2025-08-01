# 快速开始

本指南将帮助你在几分钟内开始使用Vue3 Engine。

## 安装

### 使用 npm

```bash
npm install @ldesign/engine
```

### 使用 yarn

```bash
yarn add @ldesign/engine
```

### 使用 pnpm

```bash
pnpm add @ldesign/engine
```

## 创建你的第一个应用

### 1. 基础设置

创建一个新的Vue项目或在现有项目中使用引擎：

```typescript
import { createApp } from '@ldesign/engine'
// main.ts
import App from './App.vue'

// 创建引擎应用
const engine = createApp(App)

// 挂载到DOM
engine.mount('#app')

// 导出引擎实例供其他模块使用
export { engine }
```

### 2. 使用预设配置

引擎提供了几种预设配置，适用于不同的开发场景：

```typescript
import { createApp, presets } from '@ldesign/engine'
// main.ts
import App from './App.vue'

// 开发环境预设（包含调试工具、详细日志等）
const engine = createApp(App, presets.development())

// 生产环境预设（优化性能、精简日志等）
// const engine = createApp(App, presets.production())

// 最小化预设（只包含核心功能）
// const engine = createApp(App, presets.minimal())

engine.mount('#app')
```

### 3. 自定义配置

你也可以完全自定义引擎配置：

```typescript
import { createApp } from '@ldesign/engine'
// main.ts
import App from './App.vue'

const engine = createApp(App, {
  config: {
    appName: '我的应用',
    version: '1.0.0',
    debug: true
  },
  logger: {
    level: 'info',
    format: 'pretty'
  },
  state: {
    persist: true,
    storage: 'localStorage'
  },
  notifications: {
    position: 'top-right',
    duration: 3000
  }
})

engine.mount('#app')
```

## 基本功能使用

### 状态管理

引擎内置了强大的状态管理系统：

```vue
<!-- UserProfile.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { engine } from '../main'

// 响应式状态
const user = computed(() => engine.state.get('user'))

// 登录
function login() {
  engine.state.set('user', {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com'
  })

  // 显示成功通知
  engine.notifications.success('登录成功！')
}

// 退出登录
function logout() {
  engine.state.delete('user')
  engine.notifications.info('已退出登录')
}
</script>

<template>
  <div>
    <h2>用户信息</h2>
    <div v-if="user">
      <p>姓名: {{ user.name }}</p>
      <p>邮箱: {{ user.email }}</p>
      <button @click="logout">
        退出登录
      </button>
    </div>
    <div v-else>
      <button @click="login">
        登录
      </button>
    </div>
  </div>
</template>
```

### 事件系统

使用事件系统进行组件间通信：

```typescript
// services/auth.ts
import { engine } from '../main'

// 监听登录事件
engine.events.on('user:login', (user) => {
  console.log('用户登录:', user)
  // 执行登录后的逻辑
})

// 监听退出事件
engine.events.on('user:logout', () => {
  console.log('用户退出')
  // 清理用户数据
})

// 登录函数
export async function login(credentials) {
  try {
    // 执行登录逻辑
    const user = await authenticateUser(credentials)

    // 更新状态
    engine.state.set('user', user)

    // 发送登录事件
    engine.events.emit('user:login', user)

    return user
  }
  catch (error) {
    engine.logger.error('登录失败', error)
    engine.notifications.error('登录失败，请检查用户名和密码')
    throw error
  }
}
```

### 日志记录

使用内置的日志系统记录应用运行信息：

```typescript
// utils/api.ts
import { engine } from '../main'

export async function fetchUserData(userId: string) {
  // 记录开始
  engine.logger.info('开始获取用户数据', { userId })

  try {
    const response = await fetch(`/api/users/${userId}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    // 记录成功
    engine.logger.info('用户数据获取成功', {
      userId,
      dataSize: JSON.stringify(data).length
    })

    return data
  }
  catch (error) {
    // 记录错误
    engine.logger.error('用户数据获取失败', {
      userId,
      error: error.message
    })

    throw error
  }
}
```

## 添加插件

### 使用内置插件

```typescript
import { createApp, plugins } from '@ldesign/engine'
// main.ts
import App from './App.vue'

const engine = createApp(App, {
  plugins: [
    // 路由插件
    plugins.router({
      routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
      ]
    }),

    // HTTP客户端插件
    plugins.http({
      baseURL: '/api',
      timeout: 5000
    })
  ]
})

engine.mount('#app')
```

### 创建自定义插件

```typescript
// plugins/counter.ts
import { creators } from '@ldesign/engine'

export const counterPlugin = creators.plugin('counter', (engine) => {
  // 初始化状态
  engine.state.set('counter', { value: 0 })

  // 提供方法
  engine.counter = {
    increment: () => {
      const current = engine.state.get('counter.value')
      engine.state.set('counter.value', current + 1)
      engine.events.emit('counter:increment', current + 1)
    },

    decrement: () => {
      const current = engine.state.get('counter.value')
      engine.state.set('counter.value', current - 1)
      engine.events.emit('counter:decrement', current - 1)
    },

    reset: () => {
      engine.state.set('counter.value', 0)
      engine.events.emit('counter:reset')
    }
  }

  engine.logger.info('计数器插件已安装')
})

// 使用插件
const engine = createApp(App, {
  plugins: [counterPlugin]
})
```

## 添加中间件

中间件可以在应用生命周期的不同阶段执行逻辑：

```typescript
// middleware/performance.ts
import { creators } from '@ldesign/engine'

export const performanceMiddleware = creators.middleware('performance', async (context, next) => {
  const startTime = performance.now()

  // 执行下一个中间件
  await next()

  const endTime = performance.now()
  const duration = endTime - startTime

  // 记录性能数据
  context.engine.logger.info('阶段执行时间', {
    phase: context.phase,
    duration: `${duration.toFixed(2)}ms`
  })

  // 性能警告
  if (duration > 100) {
    context.engine.notifications.warning(
      `${context.phase}阶段执行时间较长: ${duration.toFixed(2)}ms`
    )
  }
})

// 使用中间件
const engine = createApp(App, {
  middleware: [performanceMiddleware]
})
```

## 环境配置

### 开发环境

```typescript
import { createApp, presets } from '@ldesign/engine'
// main.ts
import App from './App.vue'

const engine = createApp(App, {
  ...presets.development(),
  config: {
    appName: '我的应用',
    debug: true
  }
})

engine.mount('#app')
```

### 生产环境

```typescript
import { createApp, presets } from '@ldesign/engine'
// main.ts
import App from './App.vue'

const engine = createApp(App, {
  ...presets.production(),
  config: {
    appName: '我的应用',
    version: process.env.VUE_APP_VERSION
  }
})

engine.mount('#app')
```

## 调试和开发工具

### 启用调试模式

```typescript
const engine = createApp(App, {
  config: {
    debug: true
  },
  logger: {
    level: 'debug'
  }
})
```

### 使用浏览器开发工具

在开发模式下，引擎会自动在浏览器控制台中暴露调试接口：

```javascript
// 在浏览器控制台中

// 查看当前状态
console.log(window.__ENGINE__.state.getAll())

// 查看事件监听器
console.log(window.__ENGINE__.events.eventNames())

// 查看已安装的插件
console.log(window.__ENGINE__.getInstalledPlugins())

// 查看中间件
console.log(window.__ENGINE__.getInstalledMiddleware())
```

## 常见问题

### Q: 如何在组件中访问引擎实例？

A: 有几种方式：

1. 导入引擎实例：

```typescript
import { engine } from '../main'
```

2. 使用组合式API：

```typescript
import { inject } from 'vue'
const engine = inject('engine')
```

3. 使用全局属性：

```typescript
// 在组件中
this.$engine
```

### Q: 如何处理异步插件？

A: 使用异步插件安装：

```typescript
const asyncPlugin = creators.plugin('async', async (engine) => {
  // 异步初始化
  const config = await fetchConfig()
  engine.state.set('config', config)
})

const engine = createApp(App, {
  plugins: [asyncPlugin]
})

// 等待所有插件安装完成
await engine.mount('#app')
```

### Q: 如何在插件中访问其他插件？

A: 使用插件依赖：

```typescript
const dependentPlugin = creators.plugin('dependent', (engine) => {
  // 检查依赖
  if (!engine.hasPlugin('auth')) {
    throw new Error('dependent插件需要auth插件')
  }

  // 使用其他插件的功能
  const authPlugin = engine.getPlugin('auth')
}, {
  dependencies: ['auth']
})
```

## 下一步

现在你已经了解了Vue3 Engine的基本用法，可以继续学习：

- [插件系统](./plugins.md) - 深入了解插件开发
- [中间件系统](./middleware.md) - 学习中间件的高级用法
- [状态管理](./state.md) - 掌握状态管理的最佳实践
- [事件系统](./events.md) - 了解事件系统的高级特性
- [示例](../examples/basic.md) - 查看更多实际应用示例

如果遇到问题，请查看[API文档](../api/engine.md)或提交Issue。
