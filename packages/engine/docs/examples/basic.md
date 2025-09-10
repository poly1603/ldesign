# 基础示例

本文档展示了 Vue3 Engine 的基本用法和常见场景。

## 快速开始

### 1. 最简单的应用

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 创建引擎和 Vue 应用
const engine = createEngine({
  config: {
    debug: true
  }
})

const app = createApp(App)
engine.install(app)
app.mount('#app')
```

### 2. 使用预设配置

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 使用开发环境配置
const engine = createEngine({
  config: {
    debug: true,
    logLevel: 'debug',
    enablePerformanceMonitoring: true,
    enableErrorReporting: true
  }
})

const app = createApp(App)
engine.install(app)
app.mount('#app')
```

### 3. 自定义配置

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 自定义配置
const engine = createEngine({
  config: {
    app: {
      name: '我的应用',
      version: '1.0.0'
    },
    debug: true,
    logLevel: 'info',
    enablePerformanceMonitoring: true
  }
})

const app = createApp(App)
engine.install(app)
app.mount('#app')
```

## 状态管理示例

### 1. 基本状态操作

```typescript
// store/user.ts
import { engine } from '../main'

// 设置用户状态
engine.state.set('user', {
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
})

// 获取用户状态
const user = engine.state.get('user')
console.log(user) // { id: 1, name: '张三', email: 'zhangsan@example.com' }

// 获取嵌套属性
const userName = engine.state.get('user.name')
console.log(userName) // '张三'

// 检查状态是否存在
const user = engine.state.get('user')
if (user !== undefined) {
  console.log('用户已登录')
}

// 删除状态
engine.state.remove('user')
```

### 2. 响应式状态

```vue
<!-- UserProfile.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { engine } from '../main'

// 响应式状态
const user = computed(() => engine.state.get('user'))
const loginCount = computed(() => engine.state.get('user.loginCount', 0))

// 登录
function login() {
  engine.state.set('user', {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    loginCount: 1,
  })
}

// 更新信息
function updateProfile() {
  const currentUser = engine.state.get('user')
  engine.state.set('user', {
    ...currentUser,
    name: '李四',
    loginCount: currentUser.loginCount + 1,
  })
}
</script>

<template>
  <div class="user-profile">
    <h2>用户信息</h2>
    <div v-if="user">
      <p>姓名: {{ user.name }}</p>
      <p>邮箱: {{ user.email }}</p>
      <p>登录次数: {{ loginCount }}</p>
      <button @click="updateProfile">
        更新信息
      </button>
    </div>
    <div v-else>
      <p>请先登录</p>
      <button @click="login">
        登录
      </button>
    </div>
  </div>
</template>
```

### 3. 状态监听

```typescript
// composables/useAuth.ts
import { onMounted, onUnmounted, ref } from 'vue'
import { engine } from '../main'

export function useAuth() {
  const isLoggedIn = ref(false)
  const user = ref(null)

  // 监听用户状态变化
  const unwatch = engine.state.watch('user', (newUser, oldUser) => {
    isLoggedIn.value = !!newUser
    user.value = newUser

    console.log('用户状态变化:', { newUser, oldUser })
  })

  // 组件卸载时取消监听
  onUnmounted(() => {
    unwatch()
  })

  return {
    isLoggedIn,
    user,
  }
}
```

## 事件系统示例

### 1. 基本事件操作

```typescript
// services/notification.ts
import { engine } from '../main'

// 监听事件
engine.events.on('user:login', (user) => {
  console.log('用户登录:', user)
  engine.notifications.success(`欢迎回来，${user.name}！`)
})

engine.events.on('user:logout', () => {
  console.log('用户退出')
  engine.notifications.info('您已安全退出')
})

// 发送事件
export function login(user) {
  engine.state.set('user', user)
  engine.events.emit('user:login', user)
}

export function logout() {
  engine.state.delete('user')
  engine.events.emit('user:logout')
}
```

### 2. 一次性事件监听

```typescript
// 只监听一次
engine.events.once('app:ready', () => {
  console.log('应用已准备就绪')
  // 执行初始化逻辑
})

// 发送应用就绪事件
engine.events.emit('app:ready')
```

### 3. 事件命名空间

```typescript
// 使用命名空间组织事件
engine.events.on('user:profile:update', (profile) => {
  console.log('用户资料更新:', profile)
})

engine.events.on('user:settings:change', (settings) => {
  console.log('用户设置变更:', settings)
})

engine.events.on('system:error', (error) => {
  console.error('系统错误:', error)
  engine.notifications.error('系统出现错误，请稍后重试')
})
```

## 日志系统示例

### 1. 基本日志记录

```typescript
// services/api.ts
import { engine } from '../main'

export async function fetchUserData(userId: string) {
  // 记录开始
  engine.logger.info('开始获取用户数据', { userId })

  try {
    const response = await fetch(`/api/users/${userId}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const userData = await response.json()

    // 记录成功
    engine.logger.info('用户数据获取成功', {
      userId,
      dataSize: JSON.stringify(userData).length,
    })

    return userData
  }
  catch (error) {
    // 记录错误
    engine.logger.error('用户数据获取失败', {
      userId,
      error: error.message,
    })

    throw error
  }
}
```

### 2. 不同日志级别

```typescript
// utils/logger.ts
import { engine } from '../main'

// 调试信息
engine.logger.debug('调试信息', { component: 'UserList', action: 'render' })

// 一般信息
engine.logger.info('用户操作', { action: 'click', target: 'login-button' })

// 警告信息
engine.logger.warn('性能警告', { loadTime: 2000, threshold: 1000 })

// 错误信息
engine.logger.error('操作失败', { error: 'Network timeout' })
```

### 3. 带上下文的日志

```typescript
// composables/useLogger.ts
import { engine } from '../main'

export function useLogger(component: string) {
  // 创建带上下文的日志器
  const logger = engine.logger.child({ component })

  return {
    debug: (message: string, data?: any) => logger.debug(message, data),
    info: (message: string, data?: any) => logger.info(message, data),
    warn: (message: string, data?: any) => logger.warn(message, data),
    error: (message: string, data?: any) => logger.error(message, data),
  }
}

// 在组件中使用
// UserList.vue
const logger = useLogger('UserList')

async function loadUsers() {
  logger.info('开始加载用户列表')
  // ...
}
```

## 通知系统示例

### 1. 基本通知

```typescript
// utils/notifications.ts
import { engine } from '../main'

// 成功通知
engine.notifications.success('操作成功！')

// 信息通知
engine.notifications.info('这是一条信息')

// 警告通知
engine.notifications.warning('请注意！')

// 错误通知
engine.notifications.error('操作失败！')
```

### 2. 带选项的通知

```typescript
// 自定义持续时间
engine.notifications.success('保存成功', {
  duration: 5000, // 5秒后自动关闭
})

// 持久通知（不自动关闭）
engine.notifications.warning('网络连接不稳定', {
  persistent: true,
})

// 带操作按钮的通知
engine.notifications.info('发现新版本', {
  actions: [
    {
      label: '立即更新',
      action: () => {
        console.log('开始更新')
        // 执行更新逻辑
      },
    },
    {
      label: '稍后提醒',
      action: () => {
        console.log('稍后提醒')
      },
    },
  ],
})
```

### 3. 通知分组

```typescript
// 创建通知组
const uploadGroup = engine.notifications.group('upload')

// 在组中显示通知
uploadGroup.info('开始上传文件')
uploadGroup.success('文件上传完成')

// 清除组中的所有通知
uploadGroup.clear()
```

## 简单插件示例

### 1. 计数器插件

```typescript
// plugins/counter.ts
import { creators } from '@ldesign/engine'

// 使用插件
import { createApp } from '@ldesign/engine'
import { counterPlugin } from './plugins/counter'

export const counterPlugin = creators.plugin('counter', (engine) => {
  // 初始化计数器状态
  engine.state.set('counter', { value: 0 })

  // 增加计数
  const increment = () => {
    const current = engine.state.get('counter.value')
    engine.state.set('counter.value', current + 1)
    engine.events.emit('counter:increment', current + 1)
  }

  // 减少计数
  const decrement = () => {
    const current = engine.state.get('counter.value')
    engine.state.set('counter.value', current - 1)
    engine.events.emit('counter:decrement', current - 1)
  }

  // 重置计数
  const reset = () => {
    engine.state.set('counter.value', 0)
    engine.events.emit('counter:reset')
  }

  // 暴露计数器API
  engine.counter = {
    increment,
    decrement,
    reset,
    getValue: () => engine.state.get('counter.value'),
  }

  engine.logger.info('计数器插件已安装')
})

const engine = createApp(App, {
  plugins: [counterPlugin],
})
```

### 2. 在组件中使用插件

```vue
<!-- Counter.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { engine } from '../main'

// 响应式计数值
const count = computed(() => engine.state.get('counter.value'))

// 使用插件提供的方法
const increment = () => engine.counter.increment()
const decrement = () => engine.counter.decrement()
const reset = () => engine.counter.reset()

// 监听计数变化
engine.events.on('counter:increment', (value) => {
  if (value % 10 === 0) {
    engine.notifications.success(`计数达到 ${value}！`)
  }
})
</script>

<template>
  <div class="counter">
    <h2>计数器: {{ count }}</h2>
    <div class="buttons">
      <button @click="decrement">
        -
      </button>
      <button @click="reset">
        重置
      </button>
      <button @click="increment">
        +
      </button>
    </div>
  </div>
</template>

<style scoped>
.counter {
  text-align: center;
  padding: 20px;
}

.buttons {
  margin-top: 20px;
}

.buttons button {
  margin: 0 10px;
  padding: 10px 20px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.buttons button:hover {
  background: #f5f5f5;
}
</style>
```

## 简单中间件示例

### 1. 性能监控中间件

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
    duration: `${duration.toFixed(2)}ms`,
  })
})
```

### 2. 使用中间件

```typescript
// main.ts
import { createApp } from '@ldesign/engine'
import { performanceMiddleware } from './middleware/performance'

const engine = createApp(App, {
  middleware: [performanceMiddleware],
})
```

这些基础示例展示了 Vue3 Engine 的核心功能使用方法，帮助你快速上手并构建自己的应用。
