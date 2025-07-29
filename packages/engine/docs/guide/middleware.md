# 中间件系统

中间件系统允许你在引擎的各个生命周期阶段插入自定义逻辑，实现横切关注点的处理。

## 基本概念

中间件是一个函数，它接收上下文对象和下一个中间件的调用函数：

```typescript
type Middleware = (context: MiddlewareContext, next: () => Promise<void>) => Promise<void>

interface MiddlewareContext {
  engine: Engine
  phase: 'beforeMount' | 'afterMount' | 'beforeUnmount' | 'afterUnmount'
  data?: any
}
```

## 创建中间件

### 基本中间件

```typescript
import { createApp, creators } from '@ldesign/engine'
import App from './App.vue'

// 创建一个简单的中间件
const loggingMiddleware = creators.middleware('logging', async (context, next) => {
  console.log(`[${context.phase}] 开始执行`)
  const startTime = Date.now()
  
  // 调用下一个中间件
  await next()
  
  const endTime = Date.now()
  console.log(`[${context.phase}] 执行完成，耗时: ${endTime - startTime}ms`)
})

// 使用中间件
const engine = createApp(App, {
  middleware: [loggingMiddleware]
})
```

### 条件中间件

```typescript
const conditionalMiddleware = creators.middleware('conditional', async (context, next) => {
  // 只在开发环境执行
  if (context.engine.config.debug) {
    console.log('开发环境中间件执行')
    
    // 添加开发工具
    if (typeof window !== 'undefined') {
      (window as any).__ENGINE_DEBUG__ = context.engine
    }
  }
  
  await next()
})
```

### 错误处理中间件

```typescript
const errorHandlingMiddleware = creators.middleware('error-handler', async (context, next) => {
  try {
    await next()
  } catch (error) {
    // 记录错误
    context.engine.logger.error('中间件执行错误:', error)
    
    // 发送错误事件
    context.engine.events.emit('middleware:error', {
      phase: context.phase,
      error,
      middleware: 'error-handler'
    })
    
    // 可以选择重新抛出错误或进行错误恢复
    if (context.phase === 'beforeMount') {
      // 在挂载前的错误可能需要阻止应用启动
      throw error
    }
    // 其他阶段的错误可以静默处理
  }
})
```

## 中间件执行阶段

### beforeMount - 挂载前

在应用挂载到DOM之前执行：

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

在应用成功挂载到DOM之后执行：

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
import { createApp, commonMiddleware } from '@ldesign/engine'

const engine = createApp(App, {
  middleware: [
    commonMiddleware.logging,      // 日志记录
    commonMiddleware.performance,  // 性能监控
    commonMiddleware.errorHandler, // 错误处理
    commonMiddleware.stateSync     // 状态同步
  ]
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
    myCustomMiddleware
  ]
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
console.log('已注册的中间件:', allMiddleware.map(m => m.name))
```

## 中间件最佳实践

### 1. 中间件顺序

中间件的执行顺序很重要，通常遵循以下原则：

```typescript
const engine = createApp(App, {
  middleware: [
    errorHandlingMiddleware,  // 1. 错误处理（最外层）
    loggingMiddleware,        // 2. 日志记录
    authMiddleware,           // 3. 身份验证
    permissionMiddleware,     // 4. 权限检查
    businessLogicMiddleware   // 5. 业务逻辑（最内层）
  ]
})
```

### 2. 异步处理

```typescript
const asyncMiddleware = creators.middleware('async', async (context, next) => {
  // 并行执行多个异步操作
  const [userData, appConfig] = await Promise.all([
    fetchUserData(),
    fetchAppConfig()
  ])
  
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
    userAgent: navigator.userAgent
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
    timestamp: Date.now()
  })
  
  // 如果执行时间过长，发出警告
  if (duration > 100) {
    context.engine.logger.warn(`中间件执行时间过长: ${duration.toFixed(2)}ms`)
  }
})
```

通过中间件系统，你可以在不修改核心代码的情况下，灵活地扩展引擎功能，实现横切关注点的统一处理。