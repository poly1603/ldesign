# 🏁 快速开始

欢迎使用 LDesign Engine！这个指南将帮助你在5分钟内快速上手，体验引擎的强大功能。

## 📦 安装

### 环境要求

- **Node.js** >= 16.0.0
- **pnpm** >= 7.0.0 (推荐) 或 **npm** >= 8.0.0
- **Vue** >= 3.3.0
- **TypeScript** >= 4.9.0 (可选，但强烈推荐)

### 安装引擎

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/engine

# 使用 npm
npm install @ldesign/engine

# 使用 yarn
yarn add @ldesign/engine
```

## 🚀 第一个应用

### 方式一：基础使用（推荐）

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 创建引擎实例
const engine = createEngine({
  config: {
    debug: true,
    app: {
      name: 'My First App',
      version: '1.0.0'
    }
  }
})

// 创建 Vue 应用并安装引擎
const app = createApp(App)
engine.install(app)
app.mount('#app')

console.log('应用已创建并挂载！', engine.config.get('app.name'))
```

### 方式二：带插件和中间件

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 创建引擎实例，包含插件和中间件
const engine = createEngine({
  config: {
    debug: true,
    app: {
      name: 'My Advanced App',
      version: '1.0.0'
    }
  },
  plugins: [
    // 插件列表
  ],
  middleware: [
    // 中间件列表
  ]
})

// 创建 Vue 应用并安装引擎
const app = createApp(App)
engine.install(app)
app.mount('#app')

console.log('引擎创建成功！', engine.config.get('app.name'))
```

### 方式三：使用 Vue Composition API

```typescript
// composables/useEngine.ts
import { createEngine } from '@ldesign/engine'

// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { useEngine } from './composables/useEngine'

const engine = createEngine({
  config: {
    debug: true,
    app: {
      name: 'My Composable App',
      version: '1.0.0'
    }
  }
})

export function useEngine() {
  return engine
}

const engine = useEngine()
const app = createApp(App)

engine.install(app)
app.mount('#app')
```

### 🎯 使用场景对比

| 方式 | 使用场景 | 优势 | 适用项目 |
|-----|---------|------|---------|
| 基础使用 | 简单应用、快速原型 | 代码简洁 | 小型项目 |
| 带插件中间件 | 复杂应用、企业级项目 | 功能完整 | 中大型项目 |
| Composition API | 需要在多处使用引擎 | 复用性强 | 模块化项目 |

### 传统 API（完全控制）

如果你需要更多控制，也可以使用传统方式：

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 创建引擎实例
const engine = createEngine({
  config: {
    debug: true,
    appName: 'My First Engine App',
    version: '1.0.0',
  },
})

// 创建 Vue 应用
const app = createApp(App)

// 安装引擎
engine.install(app)

// 挂载应用
app.mount('#app')

// 导出引擎实例供其他模块使用
export { engine }
```

### 预设配置

Vue3 Engine 提供了几种预设配置，方便快速开始：

```typescript
import { createApp, createEngine, presets } from '@ldesign/engine'
import App from './App.vue'

// 使用简化API + 开发环境预设
const engine = createApp(App, {
  ...presets.development(),
  config: {
    appName: 'My App',
  },
})

// 使用简化API + 生产环境预设
const engine = createApp(App, {
  ...presets.production(),
  config: {
    appName: 'My App',
  },
})

// 传统API方式
const engine = createEngine(presets.development())
const engine = createEngine(presets.production())
const engine = createEngine(presets.minimal())
```

### 3. 在组件中使用引擎

```vue
<!-- App.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { engine } from './main'

// 获取应用配置
const appName = computed(() => engine.config.get('appName'))

// 获取用户状态
const user = computed(() => engine.state.get('user'))

// 显示通知
function showNotification() {
  engine.notifications.show({
    type: 'success',
    title: '操作成功',
    message: '这是一个成功通知！',
  })
}

// 记录日志
function logMessage() {
  engine.logger.info('用户点击了日志按钮', {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  })
}

// 更新状态
function updateState() {
  engine.state.set('user', {
    name: 'John Doe',
    email: 'john@example.com',
    loginTime: new Date().toISOString(),
  })
}

// 监听事件
onMounted(() => {
  // 监听用户登录事件
  engine.events.on('user:login', (userData) => {
    engine.logger.info('用户登录', userData)
    engine.notifications.show({
      type: 'info',
      title: '欢迎回来',
      message: `欢迎 ${userData.name}！`,
    })
  })

  // 监听状态变化
  engine.state.watch('user', (newUser, oldUser) => {
    if (newUser && !oldUser) {
      engine.events.emit('user:login', newUser)
    }
  })
})
</script>

<template>
  <div class="app">
    <h1>{{ appName }}</h1>
    <button @click="showNotification">
      显示通知
    </button>
    <button @click="logMessage">
      记录日志
    </button>
    <button @click="updateState">
      更新状态
    </button>
    <p>当前用户: {{ user?.name || '未登录' }}</p>
  </div>
</template>

<style scoped>
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

button {
  margin: 10px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>
```

## 核心概念

### 引擎实例

引擎实例是整个应用的核心，它管理着所有的功能模块：

```typescript
const engine = createEngine({
  config: {
    debug: true,
    appName: 'My App',
  },
  plugins: [
    /* 插件列表 */
  ],
  middleware: [
    /* 中间件列表 */
  ],
})

// 访问各个管理器
engine.config // 配置管理器
engine.plugins // 插件管理器
engine.middleware // 中间件管理器
engine.events // 事件管理器
engine.state // 状态管理器
engine.cache // 缓存管理器
engine.directives // 指令管理器
engine.errors // 错误管理器
engine.logger // 日志系统
engine.notifications // 通知管理器
engine.security // 安全管理器
engine.performance // 性能管理器
engine.environment // 环境管理器
engine.lifecycle // 生命周期管理器
```

### 配置系统

引擎支持响应式配置，配置变化会自动更新相关功能：

```typescript
// 设置配置
engine.config.set('theme', 'dark')
engine.config.set('language', 'zh-CN')

// 获取配置
const theme = engine.config.get('theme')

// 监听配置变化
engine.config.watch('theme', (newTheme) => {
  document.body.className = `theme-${newTheme}`
})
```

### 状态管理

内置的状态管理系统基于 Vue3 的响应式系统：

```typescript
// 设置状态
engine.state.set('user', { name: 'John', age: 30 })
engine.state.set('settings', { theme: 'dark', lang: 'en' })

// 获取状态
const user = engine.state.get('user')

// 监听状态变化
engine.state.watch('user', (newUser, oldUser) => {
  console.log('用户状态变化:', newUser)
})

// 在组件中使用
const user = computed(() => engine.state.get('user'))
```

### 事件系统

全局事件系统支持发布订阅模式，并提供命名空间、防抖节流等高级功能：

```typescript
// 基础事件监听
engine.events.on('data:loaded', (data) => {
  console.log('数据加载完成:', data)
})

// 发布事件
engine.events.emit('data:loaded', { items: [], total: 0 })

// 一次性监听
engine.events.once('app:ready', () => {
  console.log('应用准备就绪')
})

// 命名空间
const userEvents = engine.events.namespace('user')
userEvents.on('login', (user) => console.log('用户登录:', user))
userEvents.emit('login', { id: 1, name: 'John' })

// 防抖处理
const searchDebouncer = engine.events.debounce('search', 300)
searchDebouncer.emit('query text')

// 条件监听
engine.events.onWhen('order:paid', (data) => data.amount > 0, (data) => {
  console.log('有效付款:', data)
})
```

## 下一步

现在您已经创建了第一个 Vue3 Engine 应用！接下来可以：

- 📖 阅读 [基础概念](/guide/concepts) 了解更多核心概念
- 🔌 学习 [插件系统](/guide/plugins) 扩展应用功能
- ⚡ 探索 [中间件](/guide/middleware) 处理请求和响应
- 🎯 查看 [完整示例](/examples/full-app) 了解最佳实践

## 常见问题

### Q: 如何在现有 Vue3 项目中集成 Engine？

A: 只需要安装 `@ldesign/engine` 包，然后在 `main.ts` 中创建引擎实例并安装到 Vue 应用即可。Engine 不
会影响现有代码。

### Q: Engine 会增加多少包体积？

A: Engine 采用模块化设计，只有使用的功能才会被打包。基础功能约 20KB gzipped。

### Q: 是否支持 TypeScript？

A: 完全支持！Engine 使用 TypeScript 开发，提供完整的类型定义。

### Q: 如何调试 Engine 应用？

A: 开启 `debug: true` 配置，Engine 会输出详细的调试信息到控制台。
