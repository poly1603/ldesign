# 最佳实践指南

本指南提供了使用 LDesign Engine 开发高质量应用的最佳实践和建议，涵盖架构设计、性能优化、安全防护、测
试策略等各个方面。

## 🏗️ 架构设计

### 1. 模块化组织

```typescript
// 推荐的项目结构
src/
├── plugins/           # 自定义插件
│   ├── auth.ts
│   ├── api.ts
│   └── ui.ts
├── stores/           # 状态管理
│   ├── user.ts
│   ├── app.ts
│   └── index.ts
├── services/         # 业务服务
│   ├── api.ts
│   ├── cache.ts
│   └── logger.ts
├── components/       # 组件
├── views/           # 页面
└── main.ts          # 入口文件
```

### 2. 插件开发规范

```typescript
// ✅ 好的插件设计
export function createAuthPlugin(options: AuthOptions) {
  return {
    name: 'auth',
    version: '1.0.0',
    dependencies: ['logger'], // 明确依赖

    install(engine: Engine) {
      // 使用工厂函数，支持配置
      const auth = new AuthService(options)

      // 扩展引擎功能
      engine.extend('auth', auth)

      // 注册中间件
      engine.middleware.add('request', auth.middleware)

      // 监听相关事件
      engine.events.on('user:logout', () => {
        auth.clearTokens()
      })
    },

    uninstall(engine: Engine) {
      // 完整的清理逻辑
      engine.middleware.remove('request', auth.middleware)
      engine.events.off('user:logout')
    },
  }
}

// ❌ 避免的做法
export const badPlugin = {
  name: 'bad-plugin',
  install(engine) {
    // 直接修改全局对象
    window.myGlobalVar = 'bad'

    // 没有错误处理
    engine.someMethod()

    // 没有清理逻辑
  },
}
```

## 💾 状态管理

### 1. 状态结构设计

```typescript
// ✅ 推荐的状态结构
interface AppState {
  user: {
    profile: UserProfile | null
    permissions: string[]
    preferences: UserPreferences
  }
  app: {
    theme: 'light' | 'dark'
    language: string
    loading: boolean
    error: string | null
  }
  cache: {
    lastUpdated: number
    version: string
  }
}

// 使用命名空间组织状态
const userState = engine.state.namespace('user')
const appState = engine.state.namespace('app')

// ✅ 类型安全的状态操作
function setUserProfile(profile: UserProfile) {
  userState.set('profile', profile)
}

function getUserProfile(): UserProfile | null {
  return userState.get('profile')
}
```

### 2. 状态监听最佳实践

```typescript
// ✅ 在组件中正确使用状态监听
export default defineComponent({
  setup() {
    const state = useEngineState()
    const unwatchFns: (() => void)[] = []

    // 监听用户状态变化
    const unwatchUser = state.watch('user.profile', (newProfile, oldProfile) => {
      if (newProfile && !oldProfile) {
        // 用户登录
        handleUserLogin(newProfile)
      }
      else if (!newProfile && oldProfile) {
        // 用户登出
        handleUserLogout()
      }
    })

    unwatchFns.push(unwatchUser)

    // 组件卸载时清理监听器
    onUnmounted(() => {
      unwatchFns.forEach(fn => fn())
    })

    return {
      // ...
    }
  },
})
```

## 🧠 缓存策略

### 1. 缓存分层设计

```typescript
// ✅ 分层缓存策略
class CacheService {
  private apiCache = engine.cache.namespace('api')
  private pageCache = engine.cache.namespace('pages')
  private userCache = engine.cache.namespace('user')

  // API 数据缓存（短期）
  cacheApiData(key: string, data: any) {
    this.apiCache.set(key, data, 5 * 60 * 1000) // 5分钟
  }

  // 页面数据缓存（中期）
  cachePageData(key: string, data: any) {
    this.pageCache.set(key, data, 30 * 60 * 1000) // 30分钟
  }

  // 用户数据缓存（长期）
  cacheUserData(key: string, data: any) {
    this.userCache.set(key, data, 24 * 60 * 60 * 1000) // 24小时
  }
}
```

### 2. 缓存失效策略

```typescript
// ✅ 智能缓存失效
class SmartCache {
  private cache = engine.cache.namespace('smart')

  async getData(key: string, fetcher: () => Promise<any>) {
    // 尝试从缓存获取
    let data = this.cache.get(key)

    if (!data) {
      // 缓存未命中，获取数据
      data = await fetcher()
      this.cache.set(key, data, this.getTTL(key))
    }

    return data
  }

  // 根据数据类型动态设置 TTL
  private getTTL(key: string): number {
    if (key.startsWith('user:'))
      return 60 * 60 * 1000 // 1小时
    if (key.startsWith('config:'))
      return 24 * 60 * 60 * 1000 // 24小时
    return 5 * 60 * 1000 // 默认5分钟
  }

  // 批量失效相关缓存
  invalidatePattern(pattern: string) {
    const keys = this.cache.keys()
    keys.filter(key => key.includes(pattern)).forEach(key => this.cache.delete(key))
  }
}
```

## 📡 事件系统

### 1. 事件命名规范

```typescript
// ✅ 清晰的事件命名
const EventNames = {
  // 用户相关事件
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_PROFILE_UPDATED: 'user:profile:updated',

  // 应用相关事件
  APP_READY: 'app:ready',
  APP_ERROR: 'app:error',
  APP_THEME_CHANGED: 'app:theme:changed',

  // 数据相关事件
  DATA_LOADED: 'data:loaded',
  DATA_UPDATED: 'data:updated',
  DATA_DELETED: 'data:deleted',
} as const

// 使用类型安全的事件
engine.events.emit(EventNames.USER_LOGIN, userData)
```

### 2. 事件处理最佳实践

```typescript
// ✅ 结构化的事件处理
class EventHandler {
  private unsubscribeFns: (() => void)[] = []

  init() {
    // 注册事件监听器
    this.unsubscribeFns.push(
      engine.events.on(EventNames.USER_LOGIN, this.handleUserLogin.bind(this)),
      engine.events.on(EventNames.USER_LOGOUT, this.handleUserLogout.bind(this)),
      engine.events.on(EventNames.APP_ERROR, this.handleAppError.bind(this))
    )
  }

  private async handleUserLogin(user: User) {
    try {
      // 更新用户状态
      engine.state.set('user.profile', user)

      // 清理旧缓存
      engine.cache.namespace('user').clear()

      // 记录日志
      engine.logger.info('用户登录成功', { userId: user.id })

      // 显示欢迎通知
      engine.notifications.show({
        type: 'success',
        title: '登录成功',
        message: `欢迎回来，${user.name}！`,
      })
    }
    catch (error) {
      engine.errors.captureError(error, null, '用户登录处理失败')
    }
  }

  destroy() {
    // 清理所有事件监听器
    this.unsubscribeFns.forEach(fn => fn())
    this.unsubscribeFns = []
  }
}
```

## 🔒 安全最佳实践

### 1. 输入验证和清理

```typescript
// ✅ 完整的输入处理流程
class InputValidator {
  static validateAndSanitize(input: string, type: 'text' | 'html' | 'url'): string {
    // 1. 基础验证
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input')
    }

    // 2. 长度限制
    if (input.length > 10000) {
      throw new Error('Input too long')
    }

    // 3. 根据类型清理
    switch (type) {
      case 'text':
        return engine.security.sanitizeInput(input)
      case 'html':
        return engine.security.sanitizeHtml(input)
      case 'url':
        if (!engine.security.validateUrl(input)) {
          throw new Error('Invalid URL')
        }
        return input
      default:
        return engine.security.sanitizeInput(input)
    }
  }
}

// 使用示例
const userInput = InputValidator.validateAndSanitize(rawInput, 'text')
```

### 2. 权限控制

```typescript
// ✅ 基于角色的权限控制
class PermissionService {
  private permissions = new Set<string>()

  init(userPermissions: string[]) {
    this.permissions = new Set(userPermissions)
  }

  hasPermission(permission: string): boolean {
    return this.permissions.has(permission) || this.permissions.has('admin')
  }

  requirePermission(permission: string) {
    if (!this.hasPermission(permission)) {
      throw new Error(`Permission denied: ${permission}`)
    }
  }
}

// 在组件中使用
const permissionService = new PermissionService()

// 权限指令
engine.directives.register('permission', {
  mounted(el, binding) {
    if (!permissionService.hasPermission(binding.value)) {
      el.style.display = 'none'
    }
  },
})
```

## ⚡ 性能优化

### 1. 懒加载和代码分割

```typescript
// ✅ 插件懒加载
async function lazyLoadPlugin(name: string) {
  const plugin = await import(`./plugins/${name}`)
  engine.plugins.register(plugin.default)
  return plugin.default
}

// 条件加载插件
if (process.env.NODE_ENV === 'development') {
  await lazyLoadPlugin('dev-tools')
}

if (userHasPermission('admin')) {
  await lazyLoadPlugin('admin-panel')
}
```

### 2. 性能监控和优化

```typescript
// ✅ 性能监控服务
class PerformanceService {
  private thresholds = {
    apiCall: 1000, // API 调用 1秒
    pageLoad: 3000, // 页面加载 3秒
    componentRender: 100, // 组件渲染 100ms
  }

  init() {
    engine.performance.startMonitoring()

    // 监听性能违规
    engine.performance.onViolation((violation) => {
      engine.logger.warn('性能警告', violation)

      // 发送性能数据到监控服务
      this.sendPerformanceData(violation)
    })
  }

  // 包装 API 调用
  async wrapApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const eventId = engine.performance.startEvent('api-call', name)

    try {
      const result = await apiCall()
      engine.performance.endEvent(eventId, { success: true })
      return result
    }
    catch (error) {
      engine.performance.endEvent(eventId, { success: false, error: error.message })
      throw error
    }
  }

  private sendPerformanceData(data: any) {
    // 发送到性能监控服务
    fetch('/api/performance', {
      method: 'POST',
      body: JSON.stringify(data),
    }).catch((error) => {
      engine.logger.error('性能数据发送失败', error)
    })
  }
}
```

## 🚨 错误处理

### 1. 分层错误处理

```typescript
// ✅ 分层错误处理策略
class ErrorService {
  init() {
    // 全局错误处理
    engine.errors.onError(this.handleGlobalError.bind(this))

    // 网络错误处理
    this.setupNetworkErrorHandling()

    // 组件错误处理
    this.setupComponentErrorHandling()
  }

  private handleGlobalError(errorInfo: ErrorInfo) {
    // 1. 记录错误
    engine.logger.error('全局错误', errorInfo)

    // 2. 分类处理
    switch (errorInfo.category) {
      case 'network':
        this.handleNetworkError(errorInfo)
        break
      case 'component':
        this.handleComponentError(errorInfo)
        break
      case 'security':
        this.handleSecurityError(errorInfo)
        break
      default:
        this.handleUnknownError(errorInfo)
    }

    // 3. 用户通知
    this.notifyUser(errorInfo)

    // 4. 错误上报
    this.reportError(errorInfo)
  }

  private handleNetworkError(errorInfo: ErrorInfo) {
    // 网络错误重试逻辑
    if (errorInfo.retryCount < 3) {
      setTimeout(() => {
        // 重试请求
        this.retryRequest(errorInfo)
      }, 1000 * 2 ** errorInfo.retryCount)
    }
  }

  private notifyUser(errorInfo: ErrorInfo) {
    const userFriendlyMessage = this.getUserFriendlyMessage(errorInfo)

    engine.notifications.show({
      type: 'error',
      title: '操作失败',
      message: userFriendlyMessage,
      duration: 5000,
    })
  }
}
```

### 2. 错误边界组件

```vue
<!-- ErrorBoundary.vue -->
<script setup lang="ts">
import { useEngine } from '@ldesign/engine'
import { onErrorCaptured, ref } from 'vue'

const engine = useEngine()
const hasError = ref(false)
const errorMessage = ref('')
const lastError = ref<Error | null>(null)

onErrorCaptured((error, instance, info) => {
  hasError.value = true
  errorMessage.value = '组件渲染出现问题，请稍后重试'
  lastError.value = error

  // 记录错误
  engine.errors.captureError(error, instance, info)

  return false // 阻止错误继续传播
})

function retry() {
  hasError.value = false
  errorMessage.value = ''
  lastError.value = null
}

function reportError() {
  if (lastError.value) {
    // 发送错误报告
    engine.errors.reportError(lastError.value)

    engine.notifications.show({
      type: 'success',
      title: '感谢反馈',
      message: '错误报告已发送，我们会尽快处理',
    })
  }
}
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <h3>🚨 出现了一些问题</h3>
    <p>{{ errorMessage }}</p>
    <button @click="retry">
      重试
    </button>
    <button @click="reportError">
      报告问题
    </button>
  </div>
  <slot v-else />
</template>
```

## 📝 日志管理

### 1. 结构化日志

```typescript
// ✅ 结构化日志记录
class LoggerService {
  private context: Record<string, any> = {}

  setContext(key: string, value: any) {
    this.context[key] = value
  }

  logUserAction(action: string, details?: any) {
    engine.logger.info('用户操作', {
      action,
      userId: this.context.userId,
      timestamp: Date.now(),
      ...details,
    })
  }

  logApiCall(method: string, url: string, duration: number, success: boolean) {
    engine.logger.info('API调用', {
      method,
      url,
      duration,
      success,
      timestamp: Date.now(),
    })
  }

  logPerformance(metric: string, value: number, threshold?: number) {
    const level = threshold && value > threshold ? 'warn' : 'info'

    engine.logger[level]('性能指标', {
      metric,
      value,
      threshold,
      timestamp: Date.now(),
    })
  }
}
```

## 🧪 测试策略

### 1. 单元测试

```typescript
// ✅ 插件单元测试
describe('AuthPlugin', () => {
  let engine: Engine
  let authPlugin: Plugin

  beforeEach(() => {
    engine = createEngine({ debug: false })
    authPlugin = createAuthPlugin({ apiUrl: '/api/auth' })
  })

  it('should register auth plugin', () => {
    const success = engine.plugins.register(authPlugin)
    expect(success).toBe(true)
    expect(engine.plugins.isEnabled('auth')).toBe(true)
  })

  it('should handle login correctly', async () => {
    engine.plugins.register(authPlugin)

    const loginSpy = vi.spyOn(engine.events, 'emit')

    await engine.auth.login('user', 'password')

    expect(loginSpy).toHaveBeenCalledWith('user:login', expect.any(Object))
  })
})
```

### 2. 集成测试

```typescript
// ✅ 端到端测试
describe('Engine Integration', () => {
  it('should work with all plugins enabled', async () => {
    const engine = createEngine({
      plugins: {
        logger: true,
        cache: true,
        notifications: true,
      },
    })

    // 测试插件协作
    engine.logger.info('测试开始')
    engine.cache.set('test', 'value')
    engine.notifications.show({
      type: 'info',
      title: '测试',
      message: '集成测试',
    })

    expect(engine.cache.get('test')).toBe('value')
    expect(engine.logger.getLogs()).toHaveLength(1)
  })
})
```

## 📦 部署和发布

### 1. 生产环境配置

```typescript
// ✅ 生产环境优化
const engine = createEngine({
  debug: false, // 关闭调试模式

  logger: {
    level: 'warn', // 只记录警告和错误
    transports: [
      new RemoteTransport({ url: '/api/logs' }), // 远程日志收集
    ],
  },

  performance: {
    enabled: true,
    sampling: 0.1, // 10% 采样率
    autoReport: true,
  },

  cache: {
    maxSize: 1000,
    defaultTTL: 30 * 60 * 1000, // 30分钟
    strategy: 'lru',
  },
})
```

### 2. 监控和告警

```typescript
// ✅ 生产环境监控
class ProductionMonitor {
  init() {
    // 性能监控
    engine.performance.onViolation((violation) => {
      this.sendAlert('performance', violation)
    })

    // 错误监控
    engine.errors.onError((error) => {
      if (error.level === 'error') {
        this.sendAlert('error', error)
      }
    })

    // 定期健康检查
    setInterval(() => {
      this.healthCheck()
    }, 60000) // 每分钟检查一次
  }

  private async sendAlert(type: string, data: any) {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: Date.now() }),
      })
    }
    catch (error) {
      console.error('告警发送失败:', error)
    }
  }

  private healthCheck() {
    const stats = {
      cacheHitRate: engine.cache.getStats().hitRate,
      errorCount: engine.errors.getErrors().length,
      memoryUsage: performance.memory?.usedJSHeapSize || 0,
    }

    // 检查关键指标
    if (stats.cacheHitRate < 0.5) {
      this.sendAlert('cache_low_hit_rate', stats)
    }

    if (stats.errorCount > 100) {
      this.sendAlert('high_error_count', stats)
    }
  }
}
```

## 📋 总结

遵循这些最佳实践可以帮助你：

1. **提高代码质量** - 通过规范的架构和编码标准
2. **增强应用性能** - 通过合理的缓存和性能优化策略
3. **提升用户体验** - 通过完善的错误处理和通知机制
4. **简化维护工作** - 通过模块化设计和完整的测试覆盖
5. **保障应用安全** - 通过严格的输入验证和权限控制

记住，最佳实践是在实际项目中不断总结和完善的，根据你的具体需求进行调整和优化。
