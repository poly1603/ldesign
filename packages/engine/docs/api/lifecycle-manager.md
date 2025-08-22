# 生命周期管理器 (LifecycleManager)

生命周期管理器提供完整的应用生命周期钩子系统，支持异步执行、优先级控制和错误处理。

## 概述

LifecycleManager 是 LDesign Engine 的核心管理器之一，它提供：

- 🔄 **完整生命周期** - 覆盖应用从初始化到销毁的所有阶段
- ⚡ **异步支持** - 支持异步钩子函数和并发执行
- 📊 **优先级控制** - 精确控制钩子执行顺序
- 🛡️ **错误处理** - 完善的错误捕获和恢复机制
- 📈 **性能监控** - 监控钩子执行性能和统计信息

## 基础用法

### 注册生命周期钩子

```typescript
import { createEngine } from '@ldesign/engine'

const engine = createEngine()

// 注册初始化钩子
engine.lifecycle.on('afterInit', async (context) => {
  console.log('引擎初始化完成')
  // 执行初始化后的操作
  await initializePlugins()
})

// 注册挂载钩子
engine.lifecycle.on('beforeMount', (context) => {
  console.log('准备挂载应用')
  // 挂载前的准备工作
  prepareApplication()
})

// 注册销毁钩子
engine.lifecycle.on('beforeDestroy', async (context) => {
  console.log('准备销毁应用')
  // 清理资源
  await cleanupResources()
})
```

### 优先级控制

```typescript
// 高优先级钩子（先执行）
engine.lifecycle.on('init', () => {
  console.log('高优先级初始化')
}, 10)

// 中等优先级钩子
engine.lifecycle.on('init', () => {
  console.log('中等优先级初始化')
}, 5)

// 低优先级钩子（后执行）
engine.lifecycle.on('init', () => {
  console.log('低优先级初始化')
}, 1)

// 执行结果：
// 高优先级初始化
// 中等优先级初始化
// 低优先级初始化
```

### 一次性钩子

```typescript
// 只执行一次的钩子
engine.lifecycle.once('firstMount', (context) => {
  console.log('首次挂载，只执行一次')
  // 首次挂载的特殊处理
  setupFirstTimeUser()
})
```

## API 参考

### 接口定义

```typescript
interface LifecycleManager<T = any> {
  // 钩子注册
  on: (phase: string, hook: LifecycleHook<T>, priority?: number) => string
  once: (phase: string, hook: LifecycleHook<T>, priority?: number) => string
  off: (hookId: string) => boolean
  offAll: (phase?: string) => number

  // 钩子查询
  getHooks: (phase: string) => any[]
  getAllHooks: () => any[]
  hasHooks: (phase: string) => boolean
  getHookCount: (phase?: string) => number

  // 生命周期执行
  execute: (phase: string, engine: T, data?: any) => Promise<any>
  executeSync: (phase: string, engine: T, data?: any) => any

  // 生命周期状态
  getCurrentPhase: () => string | undefined
  getLastEvent: () => any | undefined
  getHistory: () => any[]
  isPhaseExecuted: (phase: string) => boolean

  // 错误处理
  onError: (callback: (error: Error, context: any) => void) => () => void

  // 统计信息
  getStats: () => any
  clear: () => void
  reset: () => void
}
```

### 类型定义

```typescript
// 生命周期阶段
type LifecyclePhase =
  | 'beforeInit' | 'init' | 'afterInit'
  | 'beforeMount' | 'mount' | 'afterMount'
  | 'beforeUnmount' | 'unmount' | 'afterUnmount'
  | 'beforeDestroy' | 'destroy' | 'afterDestroy'
  | 'error' | 'custom'

// 生命周期上下文
interface LifecycleContext<T = any> {
  readonly phase: LifecyclePhase
  readonly timestamp: number
  readonly engine: T
  readonly data?: any
  readonly error?: Error
}

// 生命周期钩子
type LifecycleHook<T = any> = (context: LifecycleContext<T>) => void | Promise<void>

// 钩子信息
interface HookInfo {
  id: string
  phase: string
  priority: number
  once: boolean
  executed: boolean
  executionTime?: number
  error?: Error
}
```

## 生命周期阶段

### 初始化阶段

```typescript
// 初始化前
engine.lifecycle.on('beforeInit', (context) => {
  console.log('准备初始化引擎')
  // 初始化前的准备工作
})

// 初始化中
engine.lifecycle.on('init', (context) => {
  console.log('正在初始化引擎')
  // 核心初始化逻辑
})

// 初始化后
engine.lifecycle.on('afterInit', (context) => {
  console.log('引擎初始化完成')
  // 初始化后的处理
})
```

### 挂载阶段

```typescript
// 挂载前
engine.lifecycle.on('beforeMount', (context) => {
  console.log('准备挂载应用')
  // 挂载前的准备
})

// 挂载中
engine.lifecycle.on('mount', (context) => {
  console.log('正在挂载应用')
  // 挂载逻辑
})

// 挂载后
engine.lifecycle.on('afterMount', (context) => {
  console.log('应用挂载完成')
  // 挂载后的处理
})
```

### 卸载阶段

```typescript
// 卸载前
engine.lifecycle.on('beforeUnmount', (context) => {
  console.log('准备卸载应用')
  // 卸载前的清理
})

// 卸载中
engine.lifecycle.on('unmount', (context) => {
  console.log('正在卸载应用')
  // 卸载逻辑
})

// 卸载后
engine.lifecycle.on('afterUnmount', (context) => {
  console.log('应用卸载完成')
  // 卸载后的处理
})
```

### 销毁阶段

```typescript
// 销毁前
engine.lifecycle.on('beforeDestroy', (context) => {
  console.log('准备销毁引擎')
  // 销毁前的清理
})

// 销毁中
engine.lifecycle.on('destroy', (context) => {
  console.log('正在销毁引擎')
  // 销毁逻辑
})

// 销毁后
engine.lifecycle.on('afterDestroy', (context) => {
  console.log('引擎销毁完成')
  // 销毁后的处理
})
```

## 高级功能

### 异步钩子

```typescript
// 异步钩子
engine.lifecycle.on('init', async (context) => {
  console.log('开始异步初始化')

  // 异步操作
  await loadConfiguration()
  await connectToDatabase()
  await initializeServices()

  console.log('异步初始化完成')
})

// 并发执行多个异步钩子
engine.lifecycle.on('init', async () => {
  await Promise.all([
    loadUserData(),
    loadApplicationData(),
    loadSystemData()
  ])
})
```

### 条件钩子

```typescript
// 根据条件执行钩子
engine.lifecycle.on('mount', (context) => {
  const { engine } = context

  if (engine.config.get('debug')) {
    // 调试模式下的特殊处理
    enableDebugMode()
  }

  if (engine.environment.getDevice().isMobile) {
    // 移动端特殊处理
    enableMobileOptimizations()
  }
})
```

### 钩子链

```typescript
// 创建钩子链
engine.lifecycle.on('init', async (context) => {
  // 第一步：加载配置
  const config = await loadConfig()
  context.data = { ...context.data, config }
})

engine.lifecycle.on('init', async (context) => {
  // 第二步：使用配置初始化服务
  const { config } = context.data
  const services = await initServices(config)
  context.data = { ...context.data, services }
}, 5) // 较低优先级，确保在配置加载后执行
```

### 错误处理

```typescript
// 全局错误处理
engine.lifecycle.onError((error, context) => {
  console.error(`生命周期错误 [${context.phase}]:`, error)

  // 错误恢复策略
  if (context.phase === 'init') {
    // 初始化错误，尝试重新初始化
    setTimeout(() => {
      engine.lifecycle.execute('init', context.engine)
    }, 1000)
  }
})

// 钩子内错误处理
engine.lifecycle.on('mount', async (context) => {
  try {
    await riskyOperation()
  }
  catch (error) {
    console.error('挂载过程中发生错误:', error)
    // 降级处理
    await fallbackOperation()
  }
})
```

### 性能监控

```typescript
// 监控钩子执行性能
engine.lifecycle.on('init', async (context) => {
  const startTime = Date.now()

  await heavyInitialization()

  const duration = Date.now() - startTime
  console.log(`重型初始化耗时: ${duration}ms`)

  if (duration > 1000) {
    console.warn('初始化耗时过长，考虑优化')
  }
})

// 获取性能统计
const stats = engine.lifecycle.getStats()
console.log('生命周期统计:', {
  totalHooks: stats.totalHooks,
  executedHooks: stats.executedHooks,
  averageExecutionTime: stats.averageExecutionTime,
  slowestHook: stats.slowestHook
})
```

## 装饰器支持

```typescript
import { LifecycleHook } from '@ldesign/engine'

class MyService {
  @LifecycleHook('afterInit', 10)
  async initialize() {
    console.log('服务初始化')
    await this.loadData()
  }

  @LifecycleHook('beforeDestroy', 5)
  async cleanup() {
    console.log('服务清理')
    await this.saveData()
  }

  private async loadData() {
    // 加载数据
  }

  private async saveData() {
    // 保存数据
  }
}
```

## 最佳实践

### 1. 合理使用优先级

```typescript
// 基础设施 - 最高优先级
engine.lifecycle.on('init', initializeLogger, 100)
engine.lifecycle.on('init', initializeConfig, 90)

// 核心服务 - 高优先级
engine.lifecycle.on('init', initializeDatabase, 80)
engine.lifecycle.on('init', initializeAuth, 70)

// 业务逻辑 - 中等优先级
engine.lifecycle.on('init', initializeUserService, 50)
engine.lifecycle.on('init', initializeOrderService, 40)

// UI 组件 - 低优先级
engine.lifecycle.on('init', initializeComponents, 20)
engine.lifecycle.on('init', initializeTheme, 10)
```

### 2. 错误隔离

```typescript
// 将可能失败的操作隔离
engine.lifecycle.on('init', async (context) => {
  // 关键初始化，必须成功
  await initializeCoreServices()
})

engine.lifecycle.on('init', async (context) => {
  try {
    // 可选初始化，失败不影响核心功能
    await initializeOptionalFeatures()
  }
  catch (error) {
    console.warn('可选功能初始化失败:', error)
    // 不抛出错误，避免影响其他钩子
  }
}, 5)
```

### 3. 资源清理

```typescript
// 确保资源正确清理
engine.lifecycle.on('beforeDestroy', async (context) => {
  // 清理定时器
  clearAllTimers()

  // 关闭连接
  await closeConnections()

  // 清理缓存
  clearCaches()

  // 移除事件监听器
  removeEventListeners()
})
```

### 4. 状态管理

```typescript
// 跟踪生命周期状态
let isInitialized = false
let isMounted = false

engine.lifecycle.on('afterInit', () => {
  isInitialized = true
})

engine.lifecycle.on('afterMount', () => {
  isMounted = true
})

engine.lifecycle.on('beforeDestroy', () => {
  isInitialized = false
  isMounted = false
})

// 在其他地方检查状态
function doSomething() {
  if (!isInitialized) {
    throw new Error('引擎尚未初始化')
  }

  if (!isMounted) {
    throw new Error('应用尚未挂载')
  }

  // 执行操作
}
```

## 常见问题

### Q: 如何确保钩子执行顺序？

使用优先级参数控制执行顺序，数值越大优先级越高。

### Q: 异步钩子会阻塞后续钩子吗？

是的，异步钩子会等待完成后再执行下一个钩子。如需并发执行，请在钩子内部使用 Promise.all。

### Q: 如何处理钩子执行失败？

使用 onError 方法注册全局错误处理器，或在钩子内部使用 try-catch 处理特定错误。

## 相关链接

- [插件管理器](./plugin-manager.md)
- [事件管理器](./event-manager.md)
- [错误管理器](./error-manager.md)
- [生命周期指南](../guide/lifecycle.md)
