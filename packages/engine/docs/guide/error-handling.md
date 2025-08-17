# 错误处理

Vue3 Engine 提供了完整的错误处理机制，包括全局错误捕获、错误分类、错误恢复和错误上报等功能。

## 基础用法

### 全局错误处理

```typescript
// 监听全局错误
engine.errors.onError((error, context) => {
  console.error('捕获到错误:', error)
  console.log('错误上下文:', context)
})

// 手动报告错误
try {
  // 可能出错的代码
  riskyOperation()
}
catch (error) {
  engine.errors.reportError(error, {
    component: 'UserProfile',
    action: 'updateProfile',
  })
}
```

### 错误分类

```typescript
// 按类型处理错误
engine.errors.onError((error, context) => {
  switch (error.name) {
    case 'ValidationError':
      // 处理验证错误
      handleValidationError(error)
      break

    case 'NetworkError':
      // 处理网络错误
      handleNetworkError(error)
      break

    case 'AuthenticationError':
      // 处理认证错误
      handleAuthError(error)
      break

    default:
      // 处理其他错误
      handleGenericError(error)
  }
})
```

### 错误恢复

```typescript
// 自动错误恢复
engine.errors.setRecoveryStrategy('NetworkError', async (error, context) => {
  // 网络错误恢复策略
  if (context.retryCount < 3) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { retry: true }
  }

  return {
    retry: false,
    fallback: () => showOfflineMessage(),
  }
})

// 组件级错误恢复
engine.errors.setRecoveryStrategy('ComponentError', (error, context) => {
  return {
    retry: false,
    fallback: () => renderErrorBoundary(error, context),
  }
})
```

## 高级功能

### 错误边界

```typescript
// 创建错误边界组件
const ErrorBoundary = defineComponent({
  name: 'ErrorBoundary',

  setup(props, { slots }) {
    const hasError = ref(false)
    const error = ref(null)

    // 捕获子组件错误
    onErrorCaptured((err, instance, info) => {
      hasError.value = true
      error.value = err

      // 报告错误
      engine.errors.reportError(err, {
        component: instance?.type?.name,
        errorInfo: info,
      })

      // 阻止错误继续传播
      return false
    })

    return () => {
      if (hasError.value) {
        return h('div', { class: 'error-boundary' }, [
          h('h3', '出现了错误'),
          h('p', error.value?.message),
          h(
            'button',
            {
              onClick: () => {
                hasError.value = false
                error.value = null
              },
            },
            '重试'
          ),
        ])
      }

      return slots.default?.()
    }
  },
})
```

### 错误上报

```typescript
// 配置错误上报
engine.errors.configureReporting({
  // 上报端点
  endpoint: 'https://api.example.com/errors',

  // 上报频率限制
  rateLimit: {
    maxErrors: 10,
    timeWindow: 60000, // 1分钟
  },

  // 错误过滤
  filter: (error, context) => {
    // 过滤掉开发环境错误
    if (process.env.NODE_ENV === 'development') {
      return false
    }

    // 过滤掉特定错误
    if (error.message.includes('Script error')) {
      return false
    }

    return true
  },

  // 错误增强
  enhance: (error, context) => {
    return {
      ...context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
      userId: engine.auth.getCurrentUser()?.id,
    }
  },
})
```

### 错误监控

```typescript
// 错误统计
class ErrorMonitor {
  private errorCounts = new Map()
  private errorHistory: any[] = []

  constructor() {
    engine.errors.onError((error, context) => {
      this.recordError(error, context)
    })
  }

  private recordError(error: Error, context: any) {
    const errorKey = `${error.name}:${error.message}`

    // 统计错误次数
    const count = this.errorCounts.get(errorKey) || 0
    this.errorCounts.set(errorKey, count + 1)

    // 记录错误历史
    this.errorHistory.push({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: Date.now(),
    })

    // 保持历史记录在合理范围内
    if (this.errorHistory.length > 1000) {
      this.errorHistory = this.errorHistory.slice(-500)
    }

    // 检查错误频率
    this.checkErrorFrequency(errorKey, count + 1)
  }

  private checkErrorFrequency(errorKey: string, count: number) {
    // 如果同一错误在短时间内频繁出现，发出警告
    if (count > 5) {
      engine.events.emit('error:high-frequency', {
        errorKey,
        count,
        recentErrors: this.getRecentErrors(errorKey),
      })
    }
  }

  getErrorStats() {
    return {
      totalErrors: this.errorHistory.length,
      uniqueErrors: this.errorCounts.size,
      topErrors: Array.from(this.errorCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      recentErrors: this.errorHistory.slice(-10),
    }
  }
}
```

## 错误类型

### 自定义错误类

```typescript
// 业务错误基类
class BusinessError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message)
    this.name = 'BusinessError'
  }
}

// 验证错误
class ValidationError extends BusinessError {
  constructor(field: string, message: string, value?: any) {
    super(`验证失败: ${field} - ${message}`, 'VALIDATION_ERROR', {
      field,
      value,
    })
    this.name = 'ValidationError'
  }
}

// 网络错误
class NetworkError extends Error {
  constructor(message: string, public status?: number, public response?: any) {
    super(message)
    this.name = 'NetworkError'
  }
}

// 权限错误
class PermissionError extends Error {
  constructor(action: string, resource?: string) {
    super(`权限不足: 无法执行 ${action}${resource ? ` on ${resource}` : ''}`)
    this.name = 'PermissionError'
  }
}
```

### 错误处理器

```typescript
// 注册错误处理器
engine.errors.addHandler('ValidationError', (error: ValidationError, context) => {
  // 显示验证错误提示
  engine.notifications.show({
    type: 'error',
    title: '输入错误',
    message: error.message,
    duration: 5000,
  })

  // 高亮错误字段
  if (error.details?.field) {
    highlightErrorField(error.details.field)
  }
})

engine.errors.addHandler('NetworkError', (error: NetworkError, context) => {
  if (error.status === 401) {
    // 处理认证失败
    engine.auth.logout()
    engine.router.push('/login')
  }
  else if (error.status >= 500) {
    // 服务器错误
    engine.notifications.show({
      type: 'error',
      title: '服务器错误',
      message: '服务暂时不可用，请稍后重试',
      duration: 5000,
    })
  }
})

engine.errors.addHandler('PermissionError', (error: PermissionError, context) => {
  engine.notifications.show({
    type: 'warning',
    title: '权限不足',
    message: error.message,
    duration: 3000,
  })
})
```

## 配置选项

### 错误处理配置

```typescript
const engine = createEngine({
  errorHandling: {
    // 启用全局错误捕获
    global: true,

    // 错误上报配置
    reporting: {
      enabled: true,
      endpoint: 'https://api.example.com/errors',
      apiKey: 'your-api-key',

      // 批量上报
      batch: {
        size: 10,
        timeout: 5000,
      },
    },

    // 错误恢复配置
    recovery: {
      // 自动重试
      autoRetry: true,
      maxRetries: 3,
      retryDelay: 1000,

      // 降级策略
      fallback: true,
    },

    // 错误过滤
    filters: [
      // 过滤脚本错误
      error => !error.message.includes('Script error'),

      // 过滤网络错误
      error => error.name !== 'NetworkError' || error.status !== 0,
    ],

    // 开发模式配置
    development: {
      // 显示详细错误信息
      verbose: true,

      // 在控制台显示错误
      console: true,

      // 显示错误覆盖层
      overlay: true,
    },
  },
})
```

## 最佳实践

### 1. 错误边界策略

```typescript
// 在关键组件周围使用错误边界
const App = defineComponent({
  setup() {
    return () =>
      h(
        ErrorBoundary,
        {},
        {
          default: () => [
            h(Header),
            h(
              ErrorBoundary,
              {},
              {
                default: () => h(MainContent),
              }
            ),
            h(Footer),
          ],
        }
      )
  },
})
```

### 2. 渐进式错误处理

```typescript
// 从具体到通用的错误处理
class ErrorHandler {
  handle(error: Error, context: any) {
    // 1. 尝试具体的错误处理
    if (this.handleSpecificError(error, context)) {
      return
    }

    // 2. 尝试按类型处理
    if (this.handleByType(error, context)) {
      return
    }

    // 3. 通用错误处理
    this.handleGenericError(error, context)
  }

  private handleSpecificError(error: Error, context: any): boolean {
    // 处理特定的已知错误
    const handlers = {
      'User not found': () => this.redirectToLogin(),
      'Network timeout': () => this.showRetryDialog(),
      'Invalid token': () => this.refreshToken(),
    }

    const handler = handlers[error.message]
    if (handler) {
      handler()
      return true
    }

    return false
  }
}
```

### 3. 错误上下文收集

```typescript
// 收集丰富的错误上下文
function collectErrorContext(error: Error, additionalContext?: any) {
  return {
    // 错误信息
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },

    // 用户信息
    user: {
      id: engine.auth.getCurrentUser()?.id,
      role: engine.auth.getCurrentUser()?.role,
    },

    // 环境信息
    environment: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    },

    // 应用状态
    application: {
      version: engine.config.version,
      route: engine.router.currentRoute.value.path,
      state: engine.state.getSnapshot(),
    },

    // 性能信息
    performance: {
      memory: (performance as any).memory?.usedJSHeapSize,
      timing: performance.now(),
    },

    // 额外上下文
    ...additionalContext,
  }
}
```

### 4. 错误预防

```typescript
// 输入验证
function validateInput(data: any, schema: any) {
  try {
    return schema.parse(data)
  }
  catch (error) {
    throw new ValidationError('输入验证失败', 'INVALID_INPUT', {
      errors: error.errors,
      input: data,
    })
  }
}

// 安全的异步操作
async function safeAsyncOperation<T>(operation: () => Promise<T>, fallback?: T): Promise<T> {
  try {
    return await operation()
  }
  catch (error) {
    engine.errors.reportError(error)

    if (fallback !== undefined) {
      return fallback
    }

    throw error
  }
}

// 防御性编程
function safeAccess(obj: any, path: string, defaultValue?: any) {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue
  }
  catch (error) {
    engine.logger.warn(`安全访问失败: ${path}`, error)
    return defaultValue
  }
}
```

## 错误调试

### 错误调试工具

```typescript
// 错误调试器
class ErrorDebugger {
  private errorBreakpoints = new Set<string>()

  // 设置错误断点
  setBreakpoint(errorType: string) {
    this.errorBreakpoints.add(errorType)
  }

  // 移除错误断点
  removeBreakpoint(errorType: string) {
    this.errorBreakpoints.delete(errorType)
  }

  // 检查是否应该断点
  shouldBreak(error: Error): boolean {
    return this.errorBreakpoints.has(error.name) || this.errorBreakpoints.has(error.message)
  }
}

// 在错误处理中使用调试器
engine.errors.onError((error, context) => {
  if (errorDebugger.shouldBreak(error)) {
    debugger // 触发断点
  }

  // 继续正常的错误处理
  handleError(error, context)
})
```

### 错误重现

```typescript
// 错误重现工具
class ErrorReproducer {
  private actions: any[] = []

  // 记录用户操作
  recordAction(action: any) {
    this.actions.push({
      ...action,
      timestamp: Date.now(),
    })

    // 只保留最近的操作
    if (this.actions.length > 100) {
      this.actions = this.actions.slice(-50)
    }
  }

  // 获取错误前的操作序列
  getActionsBeforeError(errorTime: number, windowMs = 30000) {
    return this.actions.filter(
      action => action.timestamp >= errorTime - windowMs && action.timestamp <= errorTime
    )
  }

  // 导出重现步骤
  exportReproductionSteps(error: Error, context: any) {
    const actions = this.getActionsBeforeError(Date.now())

    return {
      error: {
        name: error.name,
        message: error.message,
      },
      context,
      reproductionSteps: actions,
      environment: collectErrorContext(error),
    }
  }
}
```

## 与其他系统集成

### 与日志系统集成

```typescript
// 错误日志记录
engine.errors.onError((error, context) => {
  engine.logger.error('应用错误', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    timestamp: new Date().toISOString(),
  })
})
```

### 与通知系统集成

```typescript
// 错误通知
engine.errors.onError((error, context) => {
  // 根据错误严重程度显示不同类型的通知
  const severity = getErrorSeverity(error)

  if (severity === 'critical') {
    engine.notifications.show({
      type: 'error',
      title: '严重错误',
      message: '应用遇到严重问题，请刷新页面',
      duration: 0, // 不自动消失
      actions: [
        {
          text: '刷新页面',
          action: () => window.location.reload(),
        },
      ],
    })
  }
  else if (severity === 'warning') {
    engine.notifications.show({
      type: 'warning',
      title: '操作失败',
      message: error.message,
      duration: 5000,
    })
  }
})
```
