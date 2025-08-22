# 日志系统

引擎提供了功能强大的日志系统，支持多级别日志、自定义格式化器和多种输出方式。

## 基本概念

日志系统提供了标准的日志级别和灵活的配置选项：

```typescript
interface Logger {
  debug: (message: string, ...args: any[]) => void
  info: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  error: (message: string, ...args: any[]) => void
  log: (level: LogLevel, message: string, ...args: any[]) => void
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
```

## 基本用法

### 基础日志记录

```typescript
import { createApp } from '@ldesign/engine'
import App from './App.vue'

const engine = createApp(App)

// 不同级别的日志
engine.logger.debug('调试信息', { userId: 123 })
engine.logger.info('应用启动成功')
engine.logger.warn('这是一个警告', { reason: 'deprecated API' })
engine.logger.error('发生错误', new Error('Something went wrong'))

// 使用通用log方法
engine.logger.log('info', '通用日志方法', { data: 'example' })
```

### 结构化日志

```typescript
// 记录用户操作
engine.logger.info('用户操作', {
  action: 'login',
  userId: 123,
  timestamp: Date.now(),
  ip: '192.168.1.1',
  userAgent: navigator.userAgent,
})

// 记录API调用
engine.logger.debug('API调用', {
  method: 'POST',
  url: '/api/users',
  duration: 150,
  status: 200,
  requestId: 'req-123',
})

// 记录性能数据
engine.logger.info('性能指标', {
  metric: 'page_load_time',
  value: 1200,
  page: '/dashboard',
  timestamp: Date.now(),
})
```

## 日志配置

### 日志级别配置

```typescript
const engine = createApp(App, {
  logger: {
    level: 'info', // 只输出info及以上级别的日志
    // 开发环境显示所有日志
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  },
})
```

### 自定义日志格式

```typescript
// 创建自定义格式化器
const customFormatter = {
  format: (level: LogLevel, message: string, args: any[], timestamp: Date) => {
    const time = timestamp.toISOString()
    const levelUpper = level.toUpperCase().padEnd(5)
    const argsStr = args.length > 0 ? ` ${JSON.stringify(args)}` : ''

    return `[${time}] ${levelUpper} ${message}${argsStr}`
  },
}

const engine = createApp(App, {
  logger: {
    formatter: customFormatter,
  },
})
```

### 多输出目标

```typescript
// 控制台输出
const consoleTransport = {
  name: 'console',
  log: (formattedMessage: string, level: LogLevel) => {
    const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
    console[method](formattedMessage)
  },
}

// 远程日志服务
const remoteTransport = {
  name: 'remote',
  log: async (formattedMessage: string, level: LogLevel, args: any[]) => {
    if (level === 'error' || level === 'warn') {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message: formattedMessage,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: location.href,
        }),
      })
    }
  },
}

// 本地存储
const localStorageTransport = {
  name: 'localStorage',
  log: (formattedMessage: string, level: LogLevel) => {
    const logs = JSON.parse(localStorage.getItem('app_logs') || '[]')
    logs.push({
      message: formattedMessage,
      level,
      timestamp: Date.now(),
    })

    // 限制日志数量
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000)
    }

    localStorage.setItem('app_logs', JSON.stringify(logs))
  },
}

const engine = createApp(App, {
  logger: {
    transports: [consoleTransport, remoteTransport, localStorageTransport],
  },
})
```

## 上下文日志

### 创建带上下文的日志器

```typescript
// 为特定模块创建日志器
function createModuleLogger(moduleName: string) {
  return {
    debug: (message: string, ...args: any[]) => {
      engine.logger.debug(`[${moduleName}] ${message}`, ...args)
    },
    info: (message: string, ...args: any[]) => {
      engine.logger.info(`[${moduleName}] ${message}`, ...args)
    },
    warn: (message: string, ...args: any[]) => {
      engine.logger.warn(`[${moduleName}] ${message}`, ...args)
    },
    error: (message: string, ...args: any[]) => {
      engine.logger.error(`[${moduleName}] ${message}`, ...args)
    },
  }
}

// 使用模块日志器
const userLogger = createModuleLogger('UserModule')
const apiLogger = createModuleLogger('ApiModule')

userLogger.info('用户登录成功', { userId: 123 })
apiLogger.error('API调用失败', { endpoint: '/api/data', error: 'timeout' })
```

### 请求追踪

```typescript
// 创建请求追踪日志器
function createRequestLogger(requestId: string) {
  const context = { requestId, timestamp: Date.now() }

  return {
    debug: (message: string, ...args: any[]) => {
      engine.logger.debug(message, { ...context, ...args })
    },
    info: (message: string, ...args: any[]) => {
      engine.logger.info(message, { ...context, ...args })
    },
    warn: (message: string, ...args: any[]) => {
      engine.logger.warn(message, { ...context, ...args })
    },
    error: (message: string, ...args: any[]) => {
      engine.logger.error(message, { ...context, ...args })
    },
  }
}

// 在API调用中使用
async function fetchUserData(userId: number) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const logger = createRequestLogger(requestId)

  logger.info('开始获取用户数据', { userId })

  try {
    const response = await fetch(`/api/users/${userId}`)
    const userData = await response.json()

    logger.info('用户数据获取成功', { userId, dataSize: JSON.stringify(userData).length })
    return userData
  }
  catch (error) {
    logger.error('用户数据获取失败', { userId, error: error.message })
    throw error
  }
}
```

## 性能日志

### 性能监控

```typescript
// 性能计时器
class PerformanceLogger {
  private timers = new Map<string, number>()

  start(name: string) {
    this.timers.set(name, performance.now())
    engine.logger.debug(`⏱️ 开始计时: ${name}`)
  }

  end(name: string, additionalData?: any) {
    const startTime = this.timers.get(name)
    if (startTime) {
      const duration = performance.now() - startTime
      this.timers.delete(name)

      engine.logger.info(`⏱️ 计时结束: ${name}`, {
        duration: `${duration.toFixed(2)}ms`,
        ...additionalData,
      })

      return duration
    }
    return 0
  }

  measure<T>(name: string, fn: () => T): T
  measure<T>(name: string, fn: () => Promise<T>): Promise<T>
  measure<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
    this.start(name)

    try {
      const result = fn()

      if (result instanceof Promise) {
        return result.finally(() => this.end(name))
      }
      else {
        this.end(name)
        return result
      }
    }
    catch (error) {
      this.end(name, { error: error.message })
      throw error
    }
  }
}

const perfLogger = new PerformanceLogger()

// 使用性能日志
async function loadData() {
  return await perfLogger.measure('loadData', async () => {
    const response = await fetch('/api/data')
    return await response.json()
  })
}
```

### 资源使用监控

```typescript
// 内存使用监控
function logMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    engine.logger.info('内存使用情况', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
    })
  }
}

// 定期记录内存使用
setInterval(logMemoryUsage, 30000)
```

## 错误日志

### 全局错误捕获

```typescript
// 捕获未处理的错误
window.addEventListener('error', (event) => {
  engine.logger.error('全局错误', {
    message: event.error?.message || event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: Date.now(),
  })
})

// 捕获未处理的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
  engine.logger.error('未处理的Promise拒绝', {
    reason: event.reason,
    promise: event.promise,
    timestamp: Date.now(),
  })
})
```

### 错误边界日志

```typescript
// Vue错误处理
const engine = createApp(App, {
  config: {
    errorHandler: (error, instance, info) => {
      engine.logger.error('Vue组件错误', {
        error: error.message,
        stack: error.stack,
        componentName: instance?.$options.name || 'Unknown',
        errorInfo: info,
        timestamp: Date.now(),
      })
    },
  },
})
```

## 日志分析

### 日志聚合

```typescript
// 日志统计
class LogAnalyzer {
  private stats = {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
  }

  private errorPatterns = new Map<string, number>()

  constructor() {
    // 监听所有日志
    engine.events.on('logger:log', ({ level, message, args }) => {
      this.stats[level]++

      if (level === 'error') {
        this.analyzeError(message, args)
      }
    })
  }

  private analyzeError(message: string, args: any[]) {
    // 提取错误模式
    const pattern = message.replace(/\d+/g, 'N').replace(/[a-f0-9-]{36}/g, 'UUID')
    const count = this.errorPatterns.get(pattern) || 0
    this.errorPatterns.set(pattern, count + 1)
  }

  getStats() {
    return {
      ...this.stats,
      total: Object.values(this.stats).reduce((a, b) => a + b, 0),
      errorPatterns: Array.from(this.errorPatterns.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
    }
  }

  reset() {
    Object.keys(this.stats).forEach((key) => {
      this.stats[key as LogLevel] = 0
    })
    this.errorPatterns.clear()
  }
}

const logAnalyzer = new LogAnalyzer()

// 定期输出统计信息
setInterval(() => {
  const stats = logAnalyzer.getStats()
  if (stats.total > 0) {
    engine.logger.info('日志统计', stats)
  }
}, 60000)
```

## 日志最佳实践

### 1. 日志级别使用

```typescript
// ✅ 正确的日志级别使用
engine.logger.debug('详细的调试信息', { variable: value }) // 开发调试
engine.logger.info('用户登录成功', { userId: 123 }) // 重要业务事件
engine.logger.warn('API响应缓慢', { duration: 5000 }) // 潜在问题
engine.logger.error('数据库连接失败', error) // 错误和异常

// ❌ 错误的日志级别使用
engine.logger.error('用户点击按钮') // 普通操作不应该用error
engine.logger.debug('系统启动') // 重要事件应该用info
```

### 2. 结构化日志

```typescript
// ✅ 结构化的日志数据
engine.logger.info('API调用', {
  method: 'POST',
  endpoint: '/api/users',
  duration: 150,
  status: 200,
  userId: 123,
})

// ❌ 非结构化的日志
engine.logger.info(`API调用 POST /api/users 耗时150ms 状态200 用户123`)
```

### 3. 敏感信息处理

```typescript
// 创建安全的日志记录器
function createSafeLogger() {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth']

  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null)
      return obj

    const sanitized = { ...obj }
    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '***'
      }
      else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitize(sanitized[key])
      }
    }
    return sanitized
  }

  return {
    debug: (message: string, ...args: any[]) => {
      engine.logger.debug(message, ...args.map(sanitize))
    },
    info: (message: string, ...args: any[]) => {
      engine.logger.info(message, ...args.map(sanitize))
    },
    warn: (message: string, ...args: any[]) => {
      engine.logger.warn(message, ...args.map(sanitize))
    },
    error: (message: string, ...args: any[]) => {
      engine.logger.error(message, ...args.map(sanitize))
    },
  }
}

const safeLogger = createSafeLogger()

// 安全记录包含敏感信息的数据
safeLogger.info('用户登录', {
  username: 'john',
  password: 'secret123', // 会被替换为 '***'
  token: 'abc123', // 会被替换为 '***'
})
```

### 4. 日志采样

```typescript
// 高频日志采样
class SamplingLogger {
  private counters = new Map<string, number>()

  sample(key: string, rate: number, logFn: () => void) {
    const count = this.counters.get(key) || 0
    this.counters.set(key, count + 1)

    if (count % rate === 0) {
      logFn()
    }
  }
}

const samplingLogger = new SamplingLogger()

// 每100次只记录一次
samplingLogger.sample('api-call', 100, () => {
  engine.logger.debug('API调用', { endpoint: '/api/data' })
})
```

通过日志系统，你可以有效地监控应用运行状态，快速定位问题，并收集有价值的运行数据。
