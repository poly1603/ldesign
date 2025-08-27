# 错误处理

@ldesign/store 提供了完善的错误处理机制，帮助您构建健壮的应用程序。

## 🎯 错误处理策略

### 错误分类

```typescript
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM'
}

export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}
```

### 错误处理 Store

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

export interface ErrorInfo {
  id: string
  type: ErrorType
  message: string
  code?: string
  details?: any
  timestamp: number
  resolved: boolean
  stack?: string
}

export class ErrorStore extends BaseStore {
  @State
  errors: ErrorInfo[] = []

  @State
  globalError: ErrorInfo | null = null

  @State
  errorCounts = new Map<ErrorType, number>()

  @Getter
  get unresolvedErrors() {
    return this.errors.filter(error => !error.resolved)
  }

  @Getter
  get errorsByType() {
    return (type: ErrorType) => {
      return this.errors.filter(error => error.type === type)
    }
  }

  @Getter
  get hasErrors() {
    return this.unresolvedErrors.length > 0
  }

  @Getter
  get criticalErrors() {
    return this.errors.filter(error => 
      error.type === ErrorType.SYSTEM && !error.resolved
    )
  }

  @Action
  addError(error: Error | AppError, context?: any) {
    const errorInfo: ErrorInfo = {
      id: Date.now().toString(),
      type: error instanceof AppError ? error.type : ErrorType.SYSTEM,
      message: error.message,
      code: error instanceof AppError ? error.code : undefined,
      details: error instanceof AppError ? error.details : context,
      timestamp: Date.now(),
      resolved: false,
      stack: error.stack
    }

    this.errors.push(errorInfo)
    
    // 更新错误计数
    const count = this.errorCounts.get(errorInfo.type) || 0
    this.errorCounts.set(errorInfo.type, count + 1)

    // 设置全局错误（用于显示）
    if (this.shouldShowGlobally(errorInfo)) {
      this.globalError = errorInfo
    }

    // 发送错误报告
    this.reportError(errorInfo)
  }

  @Action
  resolveError(errorId: string) {
    const error = this.errors.find(e => e.id === errorId)
    if (error) {
      error.resolved = true
      
      // 清除全局错误
      if (this.globalError?.id === errorId) {
        this.globalError = null
      }
    }
  }

  @Action
  clearErrors(type?: ErrorType) {
    if (type) {
      this.errors = this.errors.filter(error => error.type !== type)
    } else {
      this.errors = []
      this.globalError = null
    }
  }

  @Action
  private shouldShowGlobally(error: ErrorInfo): boolean {
    // 系统错误和权限错误需要全局显示
    return error.type === ErrorType.SYSTEM || 
           error.type === ErrorType.PERMISSION
  }

  @Action
  private async reportError(error: ErrorInfo) {
    try {
      // 只在生产环境报告错误
      if (process.env.NODE_ENV === 'production') {
        await api.reportError({
          ...error,
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: this.getCurrentUserId()
        })
      }
    } catch (reportError) {
      console.error('错误报告失败:', reportError)
    }
  }

  @Action
  private getCurrentUserId(): string | undefined {
    // 获取当前用户ID的逻辑
    const authStore = useAuthStore()
    return authStore.user?.id
  }
}
```

## 🛡️ 错误处理装饰器

### 基础错误处理装饰器

```typescript
export function HandleError(
  errorType: ErrorType = ErrorType.SYSTEM,
  options?: {
    silent?: boolean
    retry?: number
    fallback?: any
  }
) {
  return createDecorator({
    name: 'handleError',
    error: async (target, propertyKey, descriptor, error, args) => {
      const errorStore = useErrorStore()
      
      // 创建应用错误
      const appError = error instanceof AppError 
        ? error 
        : new AppError(error.message, errorType)

      // 添加到错误存储
      errorStore.addError(appError, {
        method: propertyKey,
        args,
        target: target.constructor.name
      })

      // 重试逻辑
      if (options?.retry && options.retry > 0) {
        try {
          return await this.retryOperation(descriptor.value, args, options.retry)
        } catch (retryError) {
          // 重试失败，使用回退值
          if (options?.fallback !== undefined) {
            return options.fallback
          }
          throw retryError
        }
      }

      // 静默处理
      if (options?.silent) {
        return options?.fallback
      }

      throw appError
    }
  })
}

export function RetryOnError(maxRetries: number = 3, delay: number = 1000) {
  return createDecorator({
    name: 'retryOnError',
    error: async (target, propertyKey, descriptor, error, args) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // 等待延迟
          if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, delay * attempt))
          }
          
          // 重试操作
          return await descriptor.value.apply(target, args)
        } catch (retryError) {
          if (attempt === maxRetries) {
            throw retryError
          }
          
          console.warn(`操作失败，第 ${attempt} 次重试...`, retryError)
        }
      }
    }
  })
}
```

### 网络错误处理

```typescript
export class ApiStore extends BaseStore {
  @State
  networkStatus = 'online'

  @State
  requestQueue: Array<() => Promise<any>> = []

  @Action
  @HandleError(ErrorType.NETWORK)
  @RetryOnError(3, 2000)
  async fetchData(url: string) {
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new AppError(
          `HTTP ${response.status}: ${response.statusText}`,
          ErrorType.NETWORK,
          response.status.toString()
        )
      }
      
      return await response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // 网络连接错误
        this.networkStatus = 'offline'
        throw new AppError('网络连接失败', ErrorType.NETWORK, 'NETWORK_ERROR')
      }
      throw error
    }
  }

  @Action
  @HandleError(ErrorType.NETWORK, { silent: true, fallback: [] })
  async fetchOptionalData(url: string) {
    return await this.fetchData(url)
  }

  @Action
  async queueRequest(requestFn: () => Promise<any>) {
    if (this.networkStatus === 'offline') {
      this.requestQueue.push(requestFn)
      return null
    }
    
    return await requestFn()
  }

  @Action
  async processQueuedRequests() {
    if (this.networkStatus === 'online' && this.requestQueue.length > 0) {
      const requests = [...this.requestQueue]
      this.requestQueue = []
      
      for (const request of requests) {
        try {
          await request()
        } catch (error) {
          console.error('队列请求失败:', error)
        }
      }
    }
  }
}
```

## 🔄 全局错误处理中间件

### 错误拦截中间件

```typescript
export const errorHandlingMiddleware = createMiddleware({
  name: 'errorHandling',
  error: async (action, store, error, args) => {
    const errorStore = useErrorStore()
    
    // 记录错误详情
    console.error(`Store错误 [${store.constructor.name}.${action.name}]:`, error)
    
    // 创建错误信息
    let appError: AppError
    
    if (error instanceof AppError) {
      appError = error
    } else if (error.name === 'ValidationError') {
      appError = new AppError(error.message, ErrorType.VALIDATION)
    } else if (error.message.includes('权限')) {
      appError = new AppError(error.message, ErrorType.PERMISSION)
    } else if (error.message.includes('网络') || error.name === 'TypeError') {
      appError = new AppError(error.message, ErrorType.NETWORK)
    } else {
      appError = new AppError(error.message, ErrorType.SYSTEM)
    }
    
    // 添加上下文信息
    appError.details = {
      store: store.constructor.name,
      action: action.name,
      args,
      timestamp: Date.now()
    }
    
    // 添加到错误存储
    errorStore.addError(appError)
    
    // 根据错误类型执行不同的处理策略
    await this.handleErrorByType(appError, store)
  },

  async handleErrorByType(error: AppError, store: any) {
    switch (error.type) {
      case ErrorType.NETWORK:
        await this.handleNetworkError(error, store)
        break
      case ErrorType.VALIDATION:
        await this.handleValidationError(error, store)
        break
      case ErrorType.PERMISSION:
        await this.handlePermissionError(error, store)
        break
      case ErrorType.BUSINESS:
        await this.handleBusinessError(error, store)
        break
      case ErrorType.SYSTEM:
        await this.handleSystemError(error, store)
        break
    }
  },

  async handleNetworkError(error: AppError, store: any) {
    // 网络错误处理
    const notificationStore = useNotificationStore()
    notificationStore.showError('网络连接异常，请检查网络设置')
    
    // 如果是API Store，标记为离线状态
    if (store instanceof ApiStore) {
      store.networkStatus = 'offline'
    }
  },

  async handleValidationError(error: AppError, store: any) {
    // 验证错误处理
    const notificationStore = useNotificationStore()
    notificationStore.showWarning(error.message)
  },

  async handlePermissionError(error: AppError, store: any) {
    // 权限错误处理
    const notificationStore = useNotificationStore()
    notificationStore.showError('权限不足，请联系管理员')
    
    // 可能需要重新登录
    const authStore = useAuthStore()
    if (error.code === 'TOKEN_EXPIRED') {
      await authStore.refreshToken()
    }
  },

  async handleBusinessError(error: AppError, store: any) {
    // 业务错误处理
    const notificationStore = useNotificationStore()
    notificationStore.showWarning(error.message)
  },

  async handleSystemError(error: AppError, store: any) {
    // 系统错误处理
    const notificationStore = useNotificationStore()
    notificationStore.showError('系统异常，请稍后重试')
    
    // 发送错误报告
    if (process.env.NODE_ENV === 'production') {
      await this.sendErrorReport(error)
    }
  }
})
```

## 🎨 Vue 错误处理集成

### 全局错误处理器

```typescript
// main.ts
import { createApp } from 'vue'
import { useErrorStore } from '@/stores/ErrorStore'

const app = createApp(App)

// Vue 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  const errorStore = useErrorStore()
  
  errorStore.addError(
    new AppError(error.message, ErrorType.SYSTEM),
    {
      component: instance?.$options.name || 'Unknown',
      errorInfo: info,
      stack: error.stack
    }
  )
}

// 未捕获的 Promise 错误
window.addEventListener('unhandledrejection', event => {
  const errorStore = useErrorStore()
  
  errorStore.addError(
    new AppError(
      event.reason?.message || 'Unhandled Promise Rejection',
      ErrorType.SYSTEM
    ),
    {
      type: 'unhandledrejection',
      reason: event.reason
    }
  )
})
```

### 错误边界组件

```vue
<template>
  <div>
    <div v-if="hasError" class="error-boundary">
      <h3>出现了错误</h3>
      <p>{{ errorMessage }}</p>
      <button @click="retry">重试</button>
      <button @click="reportError">报告错误</button>
    </div>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useErrorStore } from '@/stores/ErrorStore'

const errorStore = useErrorStore()

const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref(null)

onErrorCaptured((error, instance, info) => {
  hasError.value = true
  errorMessage.value = error.message
  errorDetails.value = { error, instance, info }
  
  errorStore.addError(
    new AppError(error.message, ErrorType.SYSTEM),
    { component: instance?.$options.name, info }
  )
  
  return false // 阻止错误继续传播
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = null
}

const reportError = () => {
  if (errorDetails.value) {
    errorStore.reportError(errorDetails.value.error)
  }
}
</script>
```

## 📊 错误监控和分析

### 错误统计 Store

```typescript
export class ErrorAnalyticsStore extends BaseStore {
  @State
  errorStats = {
    total: 0,
    byType: new Map<ErrorType, number>(),
    byHour: new Map<number, number>(),
    topErrors: new Map<string, number>()
  }

  @Action
  recordError(error: ErrorInfo) {
    this.errorStats.total++
    
    // 按类型统计
    const typeCount = this.errorStats.byType.get(error.type) || 0
    this.errorStats.byType.set(error.type, typeCount + 1)
    
    // 按小时统计
    const hour = new Date(error.timestamp).getHours()
    const hourCount = this.errorStats.byHour.get(hour) || 0
    this.errorStats.byHour.set(hour, hourCount + 1)
    
    // 错误消息统计
    const messageCount = this.errorStats.topErrors.get(error.message) || 0
    this.errorStats.topErrors.set(error.message, messageCount + 1)
  }

  @Getter
  get errorTrends() {
    return {
      mostCommonType: this.getMostCommonType(),
      peakHour: this.getPeakErrorHour(),
      topErrorMessage: this.getTopErrorMessage()
    }
  }

  private getMostCommonType(): ErrorType | null {
    let maxCount = 0
    let mostCommonType: ErrorType | null = null
    
    for (const [type, count] of this.errorStats.byType) {
      if (count > maxCount) {
        maxCount = count
        mostCommonType = type
      }
    }
    
    return mostCommonType
  }

  private getPeakErrorHour(): number | null {
    let maxCount = 0
    let peakHour: number | null = null
    
    for (const [hour, count] of this.errorStats.byHour) {
      if (count > maxCount) {
        maxCount = count
        peakHour = hour
      }
    }
    
    return peakHour
  }

  private getTopErrorMessage(): string | null {
    let maxCount = 0
    let topMessage: string | null = null
    
    for (const [message, count] of this.errorStats.topErrors) {
      if (count > maxCount) {
        maxCount = count
        topMessage = message
      }
    }
    
    return topMessage
  }
}
```

## 🧪 错误处理测试

### 错误场景测试

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createTestStore } from '@ldesign/store/testing'
import { ErrorStore, AppError, ErrorType } from '@/stores/ErrorStore'

describe('ErrorStore', () => {
  let errorStore: ErrorStore

  beforeEach(() => {
    errorStore = createTestStore(ErrorStore)
  })

  it('应该正确添加和分类错误', () => {
    const networkError = new AppError('网络连接失败', ErrorType.NETWORK)
    const validationError = new AppError('数据验证失败', ErrorType.VALIDATION)
    
    errorStore.addError(networkError)
    errorStore.addError(validationError)
    
    expect(errorStore.errors).toHaveLength(2)
    expect(errorStore.errorsByType(ErrorType.NETWORK)).toHaveLength(1)
    expect(errorStore.errorsByType(ErrorType.VALIDATION)).toHaveLength(1)
  })

  it('应该正确解决错误', () => {
    const error = new AppError('测试错误', ErrorType.SYSTEM)
    errorStore.addError(error)
    
    const errorId = errorStore.errors[0].id
    errorStore.resolveError(errorId)
    
    expect(errorStore.unresolvedErrors).toHaveLength(0)
  })
})
```

## 🎯 最佳实践

### 1. 错误分类

```typescript
// ✅ 明确的错误分类
throw new AppError('用户名不能为空', ErrorType.VALIDATION, 'REQUIRED_FIELD')

// ❌ 模糊的错误信息
throw new Error('错误')
```

### 2. 错误恢复

```typescript
// ✅ 提供错误恢复机制
@HandleError(ErrorType.NETWORK, { 
  retry: 3, 
  fallback: [] 
})
async fetchData() {
  return await api.getData()
}
```

### 3. 用户友好的错误消息

```typescript
// ✅ 用户友好的错误消息
const userFriendlyMessages = {
  'NETWORK_ERROR': '网络连接异常，请检查网络设置',
  'VALIDATION_ERROR': '输入的信息有误，请检查后重试',
  'PERMISSION_ERROR': '权限不足，请联系管理员'
}
```

完善的错误处理机制是构建健壮应用的关键，@ldesign/store 提供了全面的错误处理解决方案。
