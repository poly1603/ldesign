# 中间件系统

@ldesign/store 提供了强大的中间件系统，允许您在 Store 操作的不同阶段插入自定义逻辑。

## 🎯 中间件概念

中间件是在 Store 操作执行前后运行的函数，可以用于：
- 日志记录
- 性能监控
- 权限验证
- 数据转换
- 错误处理

## 🔧 基本用法

### 创建中间件

```typescript
import { createMiddleware } from '@ldesign/store'

export const loggerMiddleware = createMiddleware({
  name: 'logger',
  
  before: (action, store, args) => {
    console.log(`[${store.name}] 执行动作: ${action.name}`, args)
  },
  
  after: (action, store, result) => {
    console.log(`[${store.name}] 动作完成: ${action.name}`, result)
  },
  
  error: (action, store, error) => {
    console.error(`[${store.name}] 动作错误: ${action.name}`, error)
  }
})
```

### 应用中间件

```typescript
import { BaseStore, Action } from '@ldesign/store'

export class UserStore extends BaseStore {
  static middlewares = [loggerMiddleware]

  @State
  user = null

  @Action
  async login(credentials) {
    // 中间件会自动在此方法执行前后运行
    this.user = await api.login(credentials)
    return this.user
  }
}
```

## 🛠️ 内置中间件

### 性能监控中间件

```typescript
import { performanceMiddleware } from '@ldesign/store/middlewares'

export const performanceMiddleware = createMiddleware({
  name: 'performance',
  
  before: (action, store) => {
    performance.mark(`${store.name}-${action.name}-start`)
  },
  
  after: (action, store) => {
    performance.mark(`${store.name}-${action.name}-end`)
    performance.measure(
      `${store.name}-${action.name}`,
      `${store.name}-${action.name}-start`,
      `${store.name}-${action.name}-end`
    )
    
    const measure = performance.getEntriesByName(`${store.name}-${action.name}`)[0]
    if (measure.duration > 100) {
      console.warn(`慢操作警告: ${store.name}.${action.name} 耗时 ${measure.duration.toFixed(2)}ms`)
    }
  }
})
```

### 权限验证中间件

```typescript
export const authMiddleware = createMiddleware({
  name: 'auth',
  
  before: (action, store, args) => {
    const requiredPermission = action.metadata?.permission
    if (requiredPermission) {
      const authStore = useAuthStore()
      if (!authStore.hasPermission(requiredPermission)) {
        throw new Error(`权限不足: 需要 ${requiredPermission} 权限`)
      }
    }
  }
})

// 使用权限装饰器
export class AdminStore extends BaseStore {
  static middlewares = [authMiddleware]

  @Action
  @RequirePermission('admin')
  async deleteUser(userId) {
    await api.deleteUser(userId)
  }
}
```

## 🚀 高级中间件

### 数据验证中间件

```typescript
export const validationMiddleware = createMiddleware({
  name: 'validation',
  
  before: (action, store, args) => {
    const schema = action.metadata?.schema
    if (schema) {
      const [data] = args
      const result = schema.safeParse(data)
      if (!result.success) {
        throw new Error(`数据验证失败: ${result.error.message}`)
      }
    }
  }
})

// 使用验证装饰器
import { z } from 'zod'

export class FormStore extends BaseStore {
  static middlewares = [validationMiddleware]

  @Action
  @Validate(z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }))
  async register(userData) {
    return await api.register(userData)
  }
}
```

### 缓存中间件

```typescript
export const cacheMiddleware = createMiddleware({
  name: 'cache',
  
  before: async (action, store, args) => {
    const cacheConfig = action.metadata?.cache
    if (cacheConfig) {
      const cacheKey = cacheConfig.key || `${store.name}-${action.name}-${JSON.stringify(args)}`
      const cached = await store.$cache.get(cacheKey)
      
      if (cached) {
        // 返回缓存结果，跳过实际执行
        return { skip: true, result: cached }
      }
    }
  },
  
  after: async (action, store, result, args) => {
    const cacheConfig = action.metadata?.cache
    if (cacheConfig && result !== undefined) {
      const cacheKey = cacheConfig.key || `${store.name}-${action.name}-${JSON.stringify(args)}`
      await store.$cache.set(cacheKey, result, cacheConfig.ttl)
    }
  }
})
```

## 🔄 异步中间件

### 异步操作中间件

```typescript
export const asyncMiddleware = createMiddleware({
  name: 'async',
  
  before: async (action, store, args) => {
    // 异步前置处理
    await store.setLoading(true)
    await store.clearErrors()
  },
  
  after: async (action, store, result) => {
    // 异步后置处理
    await store.setLoading(false)
    await store.recordSuccess(action.name)
  },
  
  error: async (action, store, error) => {
    // 异步错误处理
    await store.setLoading(false)
    await store.recordError(error)
  }
})
```

## 🎨 中间件组合

### 中间件链

```typescript
export class ComplexStore extends BaseStore {
  static middlewares = [
    authMiddleware,      // 1. 权限验证
    validationMiddleware, // 2. 数据验证
    cacheMiddleware,     // 3. 缓存检查
    performanceMiddleware, // 4. 性能监控
    loggerMiddleware     // 5. 日志记录
  ]

  @Action
  @RequirePermission('user')
  @Validate(userSchema)
  @Cache({ ttl: 300000 })
  async updateProfile(userData) {
    return await api.updateProfile(userData)
  }
}
```

### 条件中间件

```typescript
export const conditionalMiddleware = createMiddleware({
  name: 'conditional',
  
  condition: (action, store) => {
    // 只在开发环境或特定条件下运行
    return process.env.NODE_ENV === 'development' || store.debugMode
  },
  
  before: (action, store, args) => {
    console.log('调试信息:', { action: action.name, args })
  }
})
```

## 🛡️ 错误处理中间件

### 全局错误处理

```typescript
export const errorHandlingMiddleware = createMiddleware({
  name: 'errorHandling',
  
  error: async (action, store, error, args) => {
    // 记录错误
    console.error(`Store错误 [${store.name}.${action.name}]:`, error)
    
    // 发送错误报告
    if (process.env.NODE_ENV === 'production') {
      await errorReporting.captureException(error, {
        store: store.name,
        action: action.name,
        args
      })
    }
    
    // 显示用户友好的错误消息
    const notificationStore = useNotificationStore()
    notificationStore.showError(getErrorMessage(error))
    
    // 根据错误类型执行不同的恢复策略
    if (error.name === 'NetworkError') {
      await store.handleNetworkError()
    } else if (error.name === 'ValidationError') {
      await store.handleValidationError(error)
    }
  }
})
```

## 📊 监控和分析中间件

### 分析中间件

```typescript
export const analyticsMiddleware = createMiddleware({
  name: 'analytics',
  
  after: (action, store, result, args) => {
    // 发送分析事件
    analytics.track('store_action', {
      store: store.name,
      action: action.name,
      success: true,
      timestamp: Date.now()
    })
  },
  
  error: (action, store, error) => {
    analytics.track('store_error', {
      store: store.name,
      action: action.name,
      error: error.message,
      timestamp: Date.now()
    })
  }
})
```

## 🔧 自定义中间件开发

### 中间件接口

```typescript
interface Middleware {
  name: string
  condition?: (action: ActionInfo, store: BaseStore) => boolean
  before?: (action: ActionInfo, store: BaseStore, args: any[]) => any
  after?: (action: ActionInfo, store: BaseStore, result: any, args: any[]) => void
  error?: (action: ActionInfo, store: BaseStore, error: Error, args: any[]) => void
}
```

### 复杂中间件示例

```typescript
export const auditMiddleware = createMiddleware({
  name: 'audit',
  
  before: async (action, store, args) => {
    const auditLog = {
      id: generateId(),
      store: store.name,
      action: action.name,
      args: sanitizeArgs(args),
      user: getCurrentUser()?.id,
      timestamp: Date.now(),
      status: 'started'
    }
    
    await auditService.log(auditLog)
    
    // 将审计ID附加到上下文
    return { auditId: auditLog.id }
  },
  
  after: async (action, store, result, args, context) => {
    await auditService.updateLog(context.auditId, {
      status: 'completed',
      result: sanitizeResult(result),
      completedAt: Date.now()
    })
  },
  
  error: async (action, store, error, args, context) => {
    await auditService.updateLog(context.auditId, {
      status: 'failed',
      error: error.message,
      failedAt: Date.now()
    })
  }
})
```

## 🎯 最佳实践

### 1. 中间件顺序

```typescript
// ✅ 合理的中间件顺序
static middlewares = [
  authMiddleware,        // 首先验证权限
  validationMiddleware,  // 然后验证数据
  cacheMiddleware,       // 检查缓存
  performanceMiddleware, // 监控性能
  loggerMiddleware      // 最后记录日志
]
```

### 2. 性能考虑

```typescript
// ✅ 轻量级中间件
export const lightweightMiddleware = createMiddleware({
  name: 'lightweight',
  
  condition: (action) => action.metadata?.monitor, // 只在需要时运行
  
  before: (action, store, args) => {
    // 最小化处理逻辑
    if (process.env.NODE_ENV === 'development') {
      console.log(action.name)
    }
  }
})
```

### 3. 错误边界

```typescript
// ✅ 安全的中间件实现
export const safeMiddleware = createMiddleware({
  name: 'safe',
  
  before: (action, store, args) => {
    try {
      // 中间件逻辑
    } catch (error) {
      console.error('中间件错误:', error)
      // 不要阻止原始操作的执行
    }
  }
})
```

中间件系统为 @ldesign/store 提供了强大的扩展能力，让您可以在不修改核心逻辑的情况下添加横切关注点。合理使用中间件可以让您的应用更加健壮和可维护。
