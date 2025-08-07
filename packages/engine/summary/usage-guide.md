# 使用指南

## 快速开始

### 1. 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/engine

# 使用 npm
npm install @ldesign/engine

# 使用 yarn
yarn add @ldesign/engine
```

### 2. 基础设置

```typescript
// main.ts
import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import App from './App.vue'

// 创建引擎实例
const engine = createEngine({
  config: {
    appName: 'My Application',
    debug: true,
  },
})

// 创建 Vue 应用
const app = createApp(App)

// 使用引擎
app.use(engine)

// 挂载应用
app.mount('#app')
```

### 3. 在组件中使用

```vue
<template>
  <div>
    <h1>{{ appName }}</h1>
    <p>用户: {{ user?.name || '未登录' }}</p>
    <button @click="login">登录</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEngine } from '@ldesign/engine/vue'

const engine = useEngine()

const appName = computed(() => engine.config.appName)
const user = computed(() => engine.state.get('user.profile'))

const login = async () => {
  try {
    const userData = await loginUser()
    engine.state.set('user.profile', userData)
    engine.events.emit('user:login', userData)
    engine.notifications.success('登录成功')
  } catch (error) {
    engine.notifications.error('登录失败')
  }
}
</script>
```

## 核心功能使用

### 状态管理

```typescript
// 设置状态
engine.state.set('user.profile', {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
})

// 获取状态
const user = engine.state.get('user.profile')

// 监听状态变化
const unsubscribe = engine.state.subscribe('user.profile', (newValue, oldValue) => {
  console.log('用户信息更新:', newValue)
})

// 批量更新状态
engine.state.batch(() => {
  engine.state.set('user.profile.name', 'Jane Doe')
  engine.state.set('user.profile.email', 'jane@example.com')
  engine.state.set('user.lastLogin', Date.now())
})

// 状态持久化配置
const engine = createEngine({
  state: {
    persistence: {
      enabled: true,
      storage: 'localStorage',
      keys: ['user.profile', 'app.settings'],
    },
  },
})
```

### 事件系统

```typescript
// 监听事件
engine.events.on('user:login', userData => {
  console.log('用户登录:', userData)
})

// 一次性监听
engine.events.once('app:ready', () => {
  console.log('应用就绪')
})

// 优先级监听
engine.events.on('data:update', handler1, 10) // 高优先级
engine.events.on('data:update', handler2, 5) // 低优先级

// 命名空间监听
engine.events.on('user:*', (eventName, data) => {
  console.log('用户相关事件:', eventName, data)
})

// 触发事件
engine.events.emit('user:login', userData)
engine.events.emit('data:update', { id: 1, name: 'Updated' })

// 移除监听器
const unsubscribe = engine.events.on('test:event', handler)
unsubscribe() // 移除监听器
```

### 插件开发

```typescript
// 定义插件
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  dependencies: ['auth'], // 依赖其他插件

  install: engine => {
    // 插件安装逻辑
    engine.myFeature = {
      doSomething() {
        engine.logger.info('执行某个功能')
      },
    }

    // 监听事件
    engine.events.on('app:ready', () => {
      console.log('插件已就绪')
    })
  },

  uninstall: engine => {
    // 插件卸载逻辑
    delete engine.myFeature
  },
}

// 使用插件
engine.use(myPlugin)

// 动态加载插件
const loadPlugin = async () => {
  const { default: plugin } = await import('./plugins/dynamic-plugin')
  engine.use(plugin)
}
```

### 中间件开发

```typescript
// 定义中间件
const authMiddleware = {
  name: 'auth',
  priority: 100, // 高优先级，先执行

  handler: async (context, next) => {
    const { engine, phase, data } = context

    if (phase === 'beforeRoute') {
      // 路由前检查认证
      const isAuthenticated = engine.state.get('user.isAuthenticated')

      if (!isAuthenticated && data.requiresAuth) {
        engine.notifications.warning('请先登录')
        return // 不调用 next()，阻止继续执行
      }
    }

    // 继续执行下一个中间件
    await next()
  },
}

// 注册中间件
engine.middleware.use(authMiddleware)

// 执行中间件
await engine.middleware.execute('beforeRoute', {
  route: '/profile',
  requiresAuth: true,
})
```

### 缓存使用

```typescript
// 设置缓存
engine.cache.set('user:1', userData, 300000) // 5分钟过期

// 获取缓存
const cachedUser = engine.cache.get('user:1')

// 删除缓存
engine.cache.delete('user:1')

// 清空缓存
engine.cache.clear()

// 缓存命名空间
const apiCache = engine.cache.namespace('api')
apiCache.set('users', usersData)

// 缓存统计
const stats = engine.cache.getStats()
console.log('缓存统计:', stats)
```

### 日志记录

```typescript
// 不同级别的日志
engine.logger.debug('调试信息', { userId: 123 })
engine.logger.info('信息日志', { action: 'login' })
engine.logger.warn('警告信息', { message: 'API响应慢' })
engine.logger.error('错误信息', error)

// 结构化日志
engine.logger.info('用户操作', {
  userId: 123,
  action: 'update_profile',
  timestamp: Date.now(),
  metadata: { source: 'web' },
})

// 日志过滤
engine.logger.addFilter(entry => {
  // 过滤敏感信息
  if (entry.message.includes('password')) {
    entry.message = entry.message.replace(/password:\s*\S+/g, 'password: ***')
  }
  return entry
})
```

### 通知系统

```typescript
// 不同类型的通知
engine.notifications.success('操作成功')
engine.notifications.error('操作失败')
engine.notifications.warning('注意事项')
engine.notifications.info('提示信息')

// 自定义通知选项
engine.notifications.success('保存成功', {
  duration: 3000,
  showClose: true,
  position: 'top-right',
})

// 确认对话框
const confirmed = await engine.notifications.confirm('确定要删除这个项目吗？', '删除确认')

if (confirmed) {
  // 执行删除操作
}

// 输入对话框
const result = await engine.notifications.prompt('请输入新的名称', '重命名')

if (result.action === 'confirm') {
  console.log('新名称:', result.value)
}
```

### 安全防护

```typescript
// XSS 防护
const safeContent = engine.security.sanitize(userInput)
document.innerHTML = safeContent

// CSRF 防护
const csrfToken = engine.security.generateCSRFToken()
const isValid = engine.security.validateCSRF(token)

// URL 验证
const isSafeUrl = engine.security.validateURL(url)

// 输入验证
const isValidEmail = engine.security.validateInput(email, 'email')
const isValidPhone = engine.security.validateInput(phone, 'phone')

// 权限检查
const hasPermission = engine.security.checkPermission('user:edit')
```

### 性能监控

```typescript
// 性能标记
engine.performance.mark('operation-start')
await performOperation()
engine.performance.mark('operation-end')

// 性能测量
const duration = engine.performance.measure('operation', 'operation-start', 'operation-end')

console.log(`操作耗时: ${duration}ms`)

// 获取性能指标
const metrics = engine.performance.getMetrics()
console.log('性能指标:', metrics)

// 内存监控
const memoryInfo = engine.performance.getMemoryInfo()
console.log('内存使用:', memoryInfo)

// 性能预算
engine.performance.setBudget({
  fcp: 1500, // 首次内容绘制
  lcp: 2500, // 最大内容绘制
  fid: 100, // 首次输入延迟
})
```

### 错误处理

```typescript
// 捕获错误
engine.errors.capture(error, {
  context: 'user-action',
  userId: 123,
  action: 'update-profile',
})

// 错误分类处理
engine.events.on('error:network', error => {
  engine.notifications.error('网络连接失败')
})

engine.events.on('error:validation', error => {
  engine.notifications.warning(error.message)
})

// 全局错误处理
window.addEventListener('error', event => {
  engine.errors.capture(event.error, {
    type: 'global',
    filename: event.filename,
    lineno: event.lineno,
  })
})

// Promise 错误处理
window.addEventListener('unhandledrejection', event => {
  engine.errors.capture(new Error(event.reason), {
    type: 'promise',
  })
})
```

## 高级用法

### 自定义管理器

```typescript
// 定义自定义管理器
class CustomManager {
  constructor(private engine: Engine, private config: any) {
    this.initialize()
  }

  private initialize() {
    // 初始化逻辑
  }

  customMethod() {
    // 自定义方法
  }
}

// 注册自定义管理器
engine.registerManager('custom', CustomManager)

// 使用自定义管理器
engine.custom.customMethod()
```

### 插件通信

```typescript
// 插件 A
const pluginA = {
  name: 'plugin-a',
  install: engine => {
    engine.pluginA = {
      getData() {
        return { message: 'Hello from Plugin A' }
      },
    }

    // 发送插件就绪事件
    engine.events.emit('plugin-a:ready')
  },
}

// 插件 B
const pluginB = {
  name: 'plugin-b',
  dependencies: ['plugin-a'],
  install: engine => {
    // 等待插件 A 就绪
    engine.events.on('plugin-a:ready', () => {
      const data = engine.pluginA.getData()
      console.log('收到插件A的数据:', data)
    })
  },
}
```

### 状态模块化

```typescript
// 用户状态模块
const userStateModule = {
  state: {
    profile: null,
    preferences: {
      theme: 'light',
      language: 'zh-CN',
    },
  },

  mutations: {
    setProfile(state, profile) {
      state.profile = profile
    },

    updatePreferences(state, preferences) {
      Object.assign(state.preferences, preferences)
    },
  },

  actions: {
    async login(context, credentials) {
      const user = await api.login(credentials)
      context.commit('setProfile', user)
      return user
    },
  },
}

// 注册状态模块
engine.state.registerModule('user', userStateModule)

// 使用模块状态
engine.state.dispatch('user/login', credentials)
engine.state.commit('user/setProfile', userData)
```

### 自定义指令

```typescript
// 定义自定义指令
const customDirective = {
  name: 'custom',

  mounted(el, binding) {
    // 指令挂载时的逻辑
    el.addEventListener('click', binding.value)
  },

  updated(el, binding) {
    // 指令更新时的逻辑
  },

  unmounted(el, binding) {
    // 指令卸载时的逻辑
    el.removeEventListener('click', binding.value)
  },
}

// 注册指令
engine.directives.register('custom', customDirective)

// 在模板中使用
// <button v-custom="handleClick">点击</button>
```

## 最佳实践

### 1. 项目结构组织

```
src/
├── engine/
│   ├── index.ts          # 引擎配置
│   ├── plugins/          # 自定义插件
│   └── middleware/       # 自定义中间件
├── stores/               # 状态模块
├── services/             # 服务层
├── components/           # 组件
└── views/                # 页面
```

### 2. 插件开发规范

```typescript
// 好的插件设计
const goodPlugin = {
  name: 'good-plugin',
  version: '1.0.0',
  description: '插件描述',
  dependencies: ['required-plugin'],

  install: async engine => {
    // 1. 参数验证
    if (!engine.config.apiUrl) {
      throw new Error('API URL is required')
    }

    // 2. 功能注册
    engine.api = createApiClient(engine.config.apiUrl)

    // 3. 事件监听
    engine.events.on('app:ready', this.onAppReady)

    // 4. 错误处理
    try {
      await this.initialize()
    } catch (error) {
      engine.logger.error('插件初始化失败:', error)
      throw error
    }
  },

  uninstall: engine => {
    // 清理资源
    delete engine.api
    engine.events.off('app:ready', this.onAppReady)
  },
}
```

### 3. 错误处理策略

```typescript
// 分层错误处理
class ErrorHandler {
  static handle(error: Error, context: string) {
    // 1. 记录错误
    engine.logger.error(`${context} 错误:`, error)

    // 2. 用户提示
    if (error instanceof NetworkError) {
      engine.notifications.error('网络连接失败，请检查网络设置')
    } else if (error instanceof ValidationError) {
      engine.notifications.warning(error.message)
    } else {
      engine.notifications.error('操作失败，请稍后重试')
    }

    // 3. 错误上报
    engine.errors.capture(error, { context })
  }
}
```

### 4. 性能优化建议

```typescript
// 延迟加载
const lazyLoadPlugin = async () => {
  const { default: plugin } = await import('./heavy-plugin')
  engine.use(plugin)
}

// 缓存优化
const getCachedData = async (key: string) => {
  let data = engine.cache.get(key)

  if (!data) {
    data = await fetchData()
    engine.cache.set(key, data, 300000) // 5分钟缓存
  }

  return data
}

// 状态优化
const optimizedStateUpdate = () => {
  engine.state.batch(() => {
    // 批量更新，减少重渲染
    engine.state.set('user.name', 'John')
    engine.state.set('user.email', 'john@example.com')
    engine.state.set('user.lastLogin', Date.now())
  })
}
```

通过这些使用指南，开发者可以快速上手 LDesign Engine，并掌握各种功能的使用方法和最佳实践。
