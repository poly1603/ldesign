# 中间件系统

中间件系统允许你在引擎的各个生命周期阶段插入自定义逻辑，实现横切关注点的处理。

## 基本概念

中间件是一个函数，它接收上下文对象和下一个中间件的调用函数：

```typescript
interface Middleware {
  name: string
  priority?: number
  handler: (context: MiddlewareContext, next: MiddlewareNext) => Promise<void>
}

type MiddlewareNext = () => Promise<void>

interface MiddlewareContext {
  engine: Engine
  phase: 'beforeMount' | 'afterMount' | 'beforeUnmount' | 'afterUnmount'
  data?: any
  error?: Error
}
```

## 创建中间件

### 基本中间件

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 创建一个简单的中间件
const loggingMiddleware = {
  name: 'logging',
  priority: 10,
  handler: async (context, next) => {
    console.log(`[${context.phase}] 开始执行`)
    const startTime = Date.now()

    // 调用下一个中间件
    await next()

    const endTime = Date.now()
    console.log(`[${context.phase}] 执行完成，耗时: ${endTime - startTime}ms`)
  }
}

// 使用中间件
const engine = createEngine({
  middleware: [loggingMiddleware],
  config: {
    debug: true
  }
})

const app = createApp(App)
engine.install(app)
```

### 条件中间件

```typescript
const conditionalMiddleware = {
  name: 'conditional',
  priority: 20,
  handler: async (context, next) => {
    // 只在开发环境执行
    if (context.engine.config.get('debug')) {
      console.log('开发环境中间件执行')

      // 添加开发工具
      if (typeof window !== 'undefined') {
        ;(window as any).__ENGINE_DEBUG__ = context.engine
      }
    }

    await next()
  }
}
```

### 错误处理中间件

```typescript
const errorHandlingMiddleware = {
  name: 'error-handler',
  priority: 1, // 高优先级，最先执行
  handler: async (context, next) => {
    try {
      await next()
    }
    catch (error) {
      // 记录错误
      context.engine.logger.error('中间件执行错误:', error)

      // 发送错误事件
      context.engine.events.emit('middleware:error', {
        phase: context.phase,
        error,
        middleware: 'error-handler',
      })

      // 可以选择重新抛出错误或进行错误恢复
      if (context.phase === 'beforeMount') {
        // 在挂载前的错误可能需要阻止应用启动
        throw error
      }
      // 其他阶段的错误可以静默处理
    }
  }
}
```

## 中间件执行阶段

### beforeMount - 挂载前

在应用挂载到 DOM 之前执行：

```typescript
const initMiddleware = creators.middleware('init', async (context, next) => {
  if (context.phase === 'beforeMount') {
    // 初始化全局状态
    context.engine.state.set('appStartTime', Date.now())

    // 加载用户配置
    const userConfig = await loadUserConfig()
    context.engine.state.set('userConfig', userConfig)

    // 初始化第三方服务
    await initAnalytics()
  }

  await next()
})
```

### afterMount - 挂载后

在应用成功挂载到 DOM 之后执行：

```typescript
const postMountMiddleware = creators.middleware('post-mount', async (context, next) => {
  await next()

  if (context.phase === 'afterMount') {
    // 发送应用启动事件
    context.engine.events.emit('app:mounted')

    // 启动后台任务
    startBackgroundTasks()

    // 显示启动完成通知
    context.engine.notifications.success('应用启动成功')
  }
})
```

### beforeUnmount - 卸载前

在应用卸载之前执行：

```typescript
const cleanupMiddleware = creators.middleware('cleanup', async (context, next) => {
  if (context.phase === 'beforeUnmount') {
    // 保存用户数据
    await saveUserData(context.engine.state.getAll())

    // 清理定时器
    clearAllTimers()

    // 断开WebSocket连接
    disconnectWebSocket()
  }

  await next()
})
```

### afterUnmount - 卸载后

在应用卸载之后执行：

```typescript
const finalCleanupMiddleware = creators.middleware('final-cleanup', async (context, next) => {
  await next()

  if (context.phase === 'afterUnmount') {
    // 最终清理
    context.engine.logger.info('应用已完全卸载')

    // 清理全局变量
    if (typeof window !== 'undefined') {
      delete (window as any).__ENGINE_DEBUG__
    }
  }
})
```

## 内置中间件

引擎提供了一些常用的内置中间件：

### commonMiddleware

```typescript
import { commonMiddleware, createApp } from '@ldesign/engine'

const engine = createApp(App, {
  middleware: [
    commonMiddleware.logging, // 日志记录
    commonMiddleware.performance, // 性能监控
    commonMiddleware.errorHandler, // 错误处理
    commonMiddleware.stateSync, // 状态同步
  ],
})
```

### 自定义内置中间件组合

```typescript
import { presets } from '@ldesign/engine'

// 开发环境预设包含调试中间件
const engine = createApp(App, {
  ...presets.development(), // 包含开发环境中间件
  middleware: [
    // 额外的自定义中间件
    myCustomMiddleware,
  ],
})
```

## 中间件管理

### 动态添加中间件

```typescript
// 在运行时添加中间件
const dynamicMiddleware = creators.middleware('dynamic', async (context, next) => {
  console.log('动态添加的中间件')
  await next()
})

engine.middleware.add(dynamicMiddleware)
```

### 移除中间件

```typescript
// 移除指定中间件
engine.middleware.remove('dynamic')

// 清空所有中间件
engine.middleware.clear()
```

### 获取中间件信息

```typescript
// 检查中间件是否存在
if (engine.middleware.has('logging')) {
  console.log('日志中间件已注册')
}

// 获取所有中间件
const allMiddleware = engine.middleware.getAll()
console.log(
  '已注册的中间件:',
  allMiddleware.map(m => m.name)
)
```

## 中间件最佳实践

### 1. 中间件顺序

中间件的执行顺序很重要，通常遵循以下原则：

```typescript
const engine = createApp(App, {
  middleware: [
    errorHandlingMiddleware, // 1. 错误处理（最外层）
    loggingMiddleware, // 2. 日志记录
    authMiddleware, // 3. 身份验证
    permissionMiddleware, // 4. 权限检查
    businessLogicMiddleware, // 5. 业务逻辑（最内层）
  ],
})
```

### 2. 异步处理

```typescript
const asyncMiddleware = creators.middleware('async', async (context, next) => {
  // 并行执行多个异步操作
  const [userData, appConfig] = await Promise.all([fetchUserData(), fetchAppConfig()])

  context.engine.state.set('userData', userData)
  context.engine.state.set('appConfig', appConfig)

  await next()
})
```

### 3. 条件执行

```typescript
const conditionalMiddleware = creators.middleware('conditional', async (context, next) => {
  // 根据环境或配置决定是否执行
  const shouldExecute = context.engine.config.enableFeature

  if (shouldExecute) {
    // 执行特定逻辑
    await setupFeature(context.engine)
  }

  await next()
})
```

### 4. 数据传递

```typescript
const dataMiddleware = creators.middleware('data', async (context, next) => {
  // 在上下文中添加数据
  context.data = {
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  }

  await next()
})

const consumerMiddleware = creators.middleware('consumer', async (context, next) => {
  // 使用前面中间件添加的数据
  if (context.data) {
    console.log('请求时间:', context.data.timestamp)
    console.log('用户代理:', context.data.userAgent)
  }

  await next()
})
```

## 中间件调试

### 调试模式

```typescript
const debugMiddleware = creators.middleware('debug', async (context, next) => {
  if (context.engine.config.debug) {
    console.group(`🔧 中间件: ${context.phase}`)
    console.log('上下文:', context)
    console.time('执行时间')
  }

  await next()

  if (context.engine.config.debug) {
    console.timeEnd('执行时间')
    console.groupEnd()
  }
})
```

### 性能监控

```typescript
const performanceMiddleware = creators.middleware('performance', async (context, next) => {
  const startTime = performance.now()

  await next()

  const endTime = performance.now()
  const duration = endTime - startTime

  // 记录性能数据
  context.engine.events.emit('middleware:performance', {
    phase: context.phase,
    duration,
    timestamp: Date.now(),
  })

  // 如果执行时间过长，发出警告
  if (duration > 100) {
    context.engine.logger.warn(`中间件执行时间过长: ${duration.toFixed(2)}ms`)
  }
})
```

## 中间件优先级

中间件支持优先级设置，数字越小优先级越高：

```typescript
const highPriorityMiddleware = {
  name: 'high-priority',
  priority: 1, // 高优先级
  handler: async (context, next) => {
    console.log('高优先级中间件执行')
    await next()
  },
}

const lowPriorityMiddleware = {
  name: 'low-priority',
  priority: 100, // 低优先级
  handler: async (context, next) => {
    console.log('低优先级中间件执行')
    await next()
  },
}

// 注册中间件
engine.middleware.use(lowPriorityMiddleware)
engine.middleware.use(highPriorityMiddleware)

// 执行顺序：high-priority -> low-priority
```

## 中间件类型

### 1. 全局中间件

```typescript
// 在所有阶段都执行的中间件
const globalMiddleware = {
  name: 'global',
  handler: async (context, next) => {
    console.log(`全局中间件在 ${context.phase} 阶段执行`)
    await next()
  },
}
```

### 2. 阶段特定中间件

```typescript
// 只在特定阶段执行的中间件
const mountOnlyMiddleware = {
  name: 'mount-only',
  handler: async (context, next) => {
    if (context.phase === 'beforeMount' || context.phase === 'afterMount') {
      console.log('挂载阶段中间件执行')
      // 执行挂载相关逻辑
    }
    await next()
  },
}
```

### 3. 条件中间件

```typescript
// 基于条件执行的中间件
const conditionalMiddleware = {
  name: 'conditional',
  handler: async (context, next) => {
    const shouldExecute = context.engine.config.enableFeature && context.phase === 'beforeMount'

    if (shouldExecute) {
      await setupConditionalFeature()
    }

    await next()
  },
}
```

## 中间件上下文扩展

### 扩展上下文数据

```typescript
// 扩展中间件上下文
interface ExtendedContext extends MiddlewareContext {
  user?: User
  permissions?: string[]
  startTime?: number
}

const contextExtenderMiddleware = {
  name: 'context-extender',
  handler: async (context: ExtendedContext, next) => {
    // 添加用户信息
    context.user = await getCurrentUser()
    context.permissions = await getUserPermissions(context.user?.id)
    context.startTime = Date.now()

    await next()
  },
}
```

### 上下文数据传递

```typescript
const dataProviderMiddleware = {
  name: 'data-provider',
  handler: async (context, next) => {
    // 提供数据给后续中间件
    context.data = {
      ...context.data,
      apiConfig: await loadApiConfig(),
      theme: await loadThemeConfig(),
      locale: await detectUserLocale(),
    }

    await next()
  },
}

const dataConsumerMiddleware = {
  name: 'data-consumer',
  handler: async (context, next) => {
    // 使用前面中间件提供的数据
    const { apiConfig, theme, locale } = context.data || {}

    if (apiConfig) {
      engine.state.set('api', apiConfig)
    }

    if (theme) {
      engine.state.set('theme', theme)
    }

    if (locale) {
      engine.state.set('locale', locale)
    }

    await next()
  },
}
```

## 中间件组合模式

### 中间件工厂

```typescript
// 创建可配置的中间件工厂
function createCacheMiddleware(options: CacheOptions) {
  return {
    name: 'cache',
    handler: async (context, next) => {
      const cacheKey = `${context.phase}-${options.key}`

      // 检查缓存
      const cached = engine.cache.get(cacheKey)
      if (cached && options.useCache) {
        context.data = cached
        return
      }

      await next()

      // 缓存结果
      if (options.useCache && context.data) {
        engine.cache.set(cacheKey, context.data, options.ttl)
      }
    },
  }
}

// 使用中间件工厂
const cacheMiddleware = createCacheMiddleware({
  key: 'app-data',
  useCache: true,
  ttl: 300000, // 5分钟
})
```

### 中间件组合器

```typescript
// 组合多个中间件
function composeMiddleware(...middlewares: Middleware[]) {
  return {
    name: 'composed',
    handler: async (context, next) => {
      let index = 0

      async function dispatch(): Promise<void> {
        if (index >= middlewares.length) {
          return next()
        }

        const middleware = middlewares[index++]
        await middleware.handler(context, dispatch)
      }

      await dispatch()
    },
  }
}

// 使用组合中间件
const composedMiddleware = composeMiddleware(
  authMiddleware,
  permissionMiddleware,
  loggingMiddleware
)
```

## 中间件错误处理

### 错误边界中间件

```typescript
const errorBoundaryMiddleware = {
  name: 'error-boundary',
  priority: 1, // 最高优先级
  handler: async (context, next) => {
    try {
      await next()
    }
    catch (error) {
      // 记录错误详情
      const errorInfo = {
        phase: context.phase,
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        context: {
          user: context.data?.user?.id,
          url: window.location.href,
        },
      }

      // 发送到错误管理器
      context.engine.errors.captureError(error, errorInfo)

      // 发送错误事件
      context.engine.events.emit('middleware:error', errorInfo)

      // 根据阶段决定错误处理策略
      if (context.phase === 'beforeMount') {
        // 挂载前错误，显示错误页面
        showErrorPage(error)
        throw error // 阻止应用启动
      }
      else {
        // 运行时错误，显示通知
        context.engine.notifications.error(`操作失败: ${error.message}`)
        // 不重新抛出，允许应用继续运行
      }
    }
  },
}
```

### 重试中间件

```typescript
function createRetryMiddleware(maxRetries = 3, delay = 1000) {
  return {
    name: 'retry',
    handler: async (context, next) => {
      let attempts = 0

      while (attempts < maxRetries) {
        try {
          await next()
          return // 成功执行，退出重试循环
        }
        catch (error) {
          attempts++

          if (attempts >= maxRetries) {
            // 达到最大重试次数，抛出错误
            context.engine.logger.error(`中间件执行失败，已重试 ${maxRetries} 次`, error)
            throw error
          }

          // 等待后重试
          context.engine.logger.warn(
            `中间件执行失败，${delay}ms 后重试 (${attempts}/${maxRetries})`
          )
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },
  }
}
```

## 中间件性能优化

### 异步并行执行

```typescript
const parallelMiddleware = {
  name: 'parallel',
  handler: async (context, next) => {
    // 并行执行多个异步任务
    const tasks = [
      loadUserPreferences(),
      loadApplicationSettings(),
      initializeAnalytics(),
      setupErrorReporting(),
    ]

    const results = await Promise.allSettled(tasks)

    // 处理结果
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        context.engine.logger.warn(`并行任务 ${index} 执行失败:`, result.reason)
      }
    })

    await next()
  },
}
```

### 懒加载中间件

```typescript
const lazyMiddleware = {
  name: 'lazy',
  handler: async (context, next) => {
    // 只在需要时加载重型依赖
    if (context.phase === 'beforeMount' && context.engine.config.enableHeavyFeature) {
      const { heavyModule } = await import('./heavy-module')
      await heavyModule.initialize(context.engine)
    }

    await next()
  },
}
```

### 缓存中间件结果

```typescript
const memoizedMiddleware = {
  name: 'memoized',
  handler: async (context, next) => {
    const cacheKey = `middleware-result-${context.phase}`

    // 检查缓存
    const cachedResult = context.engine.cache.get(cacheKey)
    if (cachedResult) {
      context.data = cachedResult
      return
    }

    // 执行中间件逻辑
    await next()

    // 缓存结果
    if (context.data) {
      context.engine.cache.set(cacheKey, context.data, 60000) // 1分钟缓存
    }
  },
}
```

## 中间件测试

### 单元测试

```typescript
import { createEngine } from '@ldesign/engine'
import { describe, expect, it, vi } from 'vitest'

describe('中间件测试', () => {
  it('应该正确执行中间件', async () => {
    const mockHandler = vi.fn()
    const testMiddleware = {
      name: 'test',
      handler: mockHandler,
    }

    const engine = createEngine()
    engine.middleware.use(testMiddleware)

    // 模拟中间件执行
    await engine.middleware.execute({
      engine,
      phase: 'beforeMount',
    })

    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        engine,
        phase: 'beforeMount',
      }),
      expect.any(Function)
    )
  })

  it('应该按优先级顺序执行中间件', async () => {
    const executionOrder: string[] = []

    const middleware1 = {
      name: 'middleware1',
      priority: 2,
      handler: async (context, next) => {
        executionOrder.push('middleware1')
        await next()
      },
    }

    const middleware2 = {
      name: 'middleware2',
      priority: 1,
      handler: async (context, next) => {
        executionOrder.push('middleware2')
        await next()
      },
    }

    const engine = createEngine()
    engine.middleware.use(middleware1)
    engine.middleware.use(middleware2)

    await engine.middleware.execute({
      engine,
      phase: 'beforeMount',
    })

    expect(executionOrder).toEqual(['middleware2', 'middleware1'])
  })
})
```

### 集成测试

```typescript
describe('中间件集成测试', () => {
  it('应该正确处理中间件错误', async () => {
    const errorMiddleware = {
      name: 'error',
      handler: async (context, next) => {
        throw new Error('测试错误')
      },
    }

    const errorHandler = vi.fn()
    const engine = createEngine()

    engine.events.on('middleware:error', errorHandler)
    engine.middleware.use(errorBoundaryMiddleware)
    engine.middleware.use(errorMiddleware)

    await expect(
      engine.middleware.execute({
        engine,
        phase: 'beforeMount',
      })
    ).rejects.toThrow('测试错误')

    expect(errorHandler).toHaveBeenCalled()
  })
})
```

## 中间件最佳实践总结

### 1. 设计原则

- **单一职责**: 每个中间件只负责一个特定功能
- **无副作用**: 避免修改全局状态，使用引擎提供的 API
- **可测试性**: 编写可测试的中间件，避免硬编码依赖
- **错误处理**: 妥善处理异常，不要让错误传播到引擎核心

### 2. 性能考虑

- **异步优化**: 合理使用并行执行和懒加载
- **缓存策略**: 缓存昂贵的计算结果
- **内存管理**: 及时清理不需要的资源
- **执行时间**: 监控中间件执行时间，避免阻塞

### 3. 开发建议

- **命名规范**: 使用描述性的中间件名称
- **文档注释**: 为复杂中间件添加详细注释
- **版本兼容**: 考虑向后兼容性
- **调试支持**: 提供调试模式和日志输出

通过中间件系统，你可以在不修改核心代码的情况下，灵活地扩展引擎功能，实现横切关注点的统一处理。
