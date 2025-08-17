# 故障排除

本指南帮助你诊断和解决使用 LDesign Engine 时可能遇到的常见问题。

## 常见问题

### 引擎初始化问题

#### 问题：引擎创建失败

```
Error: Failed to create engine instance
```

**可能原因：**

- Vue 版本不兼容
- 缺少必要的依赖
- 配置参数错误

**解决方案：**

```typescript
// 1. 检查 Vue 版本
console.log('Vue version:', Vue.version) // 需要 >= 3.3.0

// 2. 检查引擎配置
const engine = createEngine({
  config: {
    debug: true, // 启用调试模式查看详细错误
  },
})

// 3. 捕获初始化错误
try {
  const engine = createEngine(config)
}
catch (error) {
  console.error('引擎初始化失败:', error)
  // 检查错误详情
}
```

#### 问题：插件加载失败

```
Error: Plugin "my-plugin" failed to load
```

**解决方案：**

```typescript
// 1. 检查插件格式
const plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  install: (engine) => {
    // 插件安装逻辑
  },
}

// 2. 检查插件依赖
const plugin = {
  name: 'dependent-plugin',
  dependencies: ['base-plugin'], // 确保依赖插件已注册
  install: (engine) => {
    if (!engine.plugins.isRegistered('base-plugin')) {
      throw new Error('Required plugin "base-plugin" not found')
    }
  },
}

// 3. 异步插件错误处理
const asyncPlugin = {
  name: 'async-plugin',
  install: async (engine) => {
    try {
      await someAsyncOperation()
    }
    catch (error) {
      engine.logger.error('Async plugin failed:', error)
      throw error
    }
  },
}
```

### 状态管理问题

#### 问题：状态更新不生效

```typescript
engine.state.set('user', userData)
const user = engine.state.get('user') // undefined
```

**可能原因：**

- 状态键名错误
- 状态被锁定
- 中间件拦截

**解决方案：**

```typescript
// 1. 检查状态键名
console.log('所有状态键:', engine.state.keys())

// 2. 检查状态是否被锁定
if (engine.state.isLocked?.('user')) {
  console.log('状态被锁定')
}

// 3. 监听状态变化调试
engine.state.subscribe('*', (key, newValue, oldValue) => {
  console.log(`状态变化: ${key}`, { oldValue, newValue })
})

// 4. 检查状态验证
try {
  engine.state.set('user', userData)
}
catch (error) {
  console.error('状态验证失败:', error)
}
```

#### 问题：状态持久化失败

```
Warning: Failed to persist state to localStorage
```

**解决方案：**

```typescript
// 1. 检查存储空间
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
}
catch (error) {
  console.error('localStorage 不可用:', error)
}

// 2. 检查存储配置
const engine = createEngine({
  state: {
    persistence: {
      enabled: true,
      storage: 'localStorage',
      prefix: 'myapp:',
      keys: ['user', 'settings'], // 确保键名正确
    },
  },
})

// 3. 监听持久化错误
engine.events.on('state:persistence:error', (error) => {
  console.error('状态持久化失败:', error)
})
```

### 事件系统问题

#### 问题：事件监听器不触发

```typescript
engine.events.on('user:login', handler)
engine.events.emit('user:login', userData) // handler 不执行
```

**解决方案：**

```typescript
// 1. 检查事件名称
console.log('已注册的事件:', engine.events.getEventNames?.())

// 2. 检查监听器注册
const listeners = engine.events.getListeners?.('user:login')
console.log('监听器数量:', listeners?.length)

// 3. 启用事件调试
engine.events.on('*', (eventName, data) => {
  console.log(`事件触发: ${eventName}`, data)
})

// 4. 检查事件处理器错误
engine.events.on('user:login', (data) => {
  try {
    // 事件处理逻辑
  }
  catch (error) {
    console.error('事件处理器错误:', error)
  }
})
```

#### 问题：事件内存泄漏

```
Warning: Possible EventEmitter memory leak detected
```

**解决方案：**

```typescript
// 1. 及时清理事件监听器
class MyComponent {
  private unsubscribers: Array<() => void> = []

  constructor() {
    // 保存取消订阅函数
    this.unsubscribers.push(engine.events.on('user:login', this.handleLogin))
  }

  destroy() {
    // 清理所有监听器
    this.unsubscribers.forEach(unsub => unsub())
    this.unsubscribers = []
  }
}

// 2. 使用一次性监听器
engine.events.once('app:ready', () => {
  // 只执行一次的逻辑
})

// 3. 检查监听器数量
setInterval(() => {
  const count = engine.events.listenerCount?.('user:login')
  if (count > 10) {
    console.warn('监听器数量过多:', count)
  }
}, 10000)
```

### 性能问题

#### 问题：应用启动缓慢

**诊断步骤：**

```typescript
// 1. 启用性能监控
const engine = createEngine({
  config: { debug: true },
  performance: { enabled: true },
})

// 2. 监控启动时间
console.time('engine-startup')
const engine = createEngine(config)
console.timeEnd('engine-startup')

// 3. 分析插件加载时间
engine.events.on('plugin:registered', ({ name, duration }) => {
  console.log(`插件 ${name} 加载耗时: ${duration}ms`)
})
```

**优化方案：**

```typescript
// 1. 延迟加载非关键插件
const engine = createEngine({
  plugins: [
    criticalPlugin, // 关键插件立即加载
    // 非关键插件延迟加载
  ],
})

// 延迟加载
setTimeout(() => {
  engine.use(nonCriticalPlugin)
}, 1000)

// 2. 使用异步插件
const asyncPlugin = {
  name: 'async-plugin',
  install: async (engine) => {
    // 异步初始化，不阻塞启动
    setTimeout(async () => {
      await heavyInitialization()
    }, 0)
  },
}
```

#### 问题：内存使用过高

**诊断步骤：**

```typescript
// 1. 监控内存使用
setInterval(() => {
  const memory = performance.memory
  console.log('内存使用:', {
    used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
    total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
  })
}, 5000)

// 2. 检查缓存大小
const cacheStats = engine.cache.getStats()
console.log('缓存统计:', cacheStats)

// 3. 检查状态大小
const stateSize = JSON.stringify(engine.state.getAll()).length
console.log('状态大小:', `${Math.round(stateSize / 1024)}KB`)
```

**优化方案：**

```typescript
// 1. 配置缓存限制
const engine = createEngine({
  cache: {
    maxSize: 1000,
    evictionPolicy: 'lru',
  },
})

// 2. 清理不需要的状态
engine.state.remove('temporaryData')

// 3. 使用状态分片
const userShard = engine.state.createShard('users')
userShard.set('user:1', userData)
```

### 网络和 API 问题

#### 问题：API 请求失败

```typescript
// 诊断网络问题
engine.events.on('api:error', (error) => {
  console.error('API错误:', error)

  // 检查网络状态
  if (!navigator.onLine) {
    engine.notifications.error('网络连接已断开')
    return
  }

  // 检查错误类型
  if (error.status === 401) {
    // 认证失败，重新登录
    redirectToLogin()
  }
  else if (error.status >= 500) {
    // 服务器错误，显示友好提示
    engine.notifications.error('服务器暂时不可用，请稍后重试')
  }
})
```

#### 问题：跨域请求被阻止

```typescript
// 配置CORS
const engine = createEngine({
  security: {
    allowedOrigins: ['https://api.example.com', 'https://cdn.example.com'],
  },
})

// 或在服务器端配置CORS头
// Access-Control-Allow-Origin: https://your-domain.com
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE
// Access-Control-Allow-Headers: Content-Type, Authorization
```

## 调试工具

### 开发者工具

```typescript
// 启用开发者工具
const engine = createEngine({
  config: {
    debug: true,
    devtools: true,
  },
})

// 全局暴露引擎实例
if (typeof window !== 'undefined') {
  window.__ENGINE__ = engine
}

// 在浏览器控制台中使用
// __ENGINE__.state.getAll()
// __ENGINE__.events.getEventNames()
// __ENGINE__.plugins.getAll()
```

### 日志调试

```typescript
// 配置详细日志
const engine = createEngine({
  config: {
    logLevel: 'debug',
  },

  logger: {
    transports: [
      {
        type: 'console',
        level: 'debug',
        format: 'detailed',
      },
      {
        type: 'file',
        level: 'error',
        filename: 'error.log',
      },
    ],
  },
})

// 自定义日志过滤
engine.logger.addFilter((entry) => {
  // 过滤敏感信息
  if (entry.message.includes('password')) {
    entry.message = entry.message.replace(/password:\s*\S+/g, 'password: ***')
  }
  return entry
})
```

### 性能分析

```typescript
// 启用性能分析
engine.performance.startProfiling()

// 执行需要分析的操作
await someOperation()

// 获取分析结果
const profile = engine.performance.stopProfiling()
console.log('性能分析结果:', profile)

// 导出分析数据
const profileData = engine.performance.exportProfile()
// 可以导入到 Chrome DevTools 进行详细分析
```

## 错误报告

### 自动错误报告

```typescript
// 配置错误报告
const engine = createEngine({
  config: {
    enableErrorReporting: true,
  },

  errorReporting: {
    endpoint: '/api/errors',
    apiKey: 'your-api-key',

    // 错误过滤
    filter: (error) => {
      // 不报告开发环境错误
      return process.env.NODE_ENV === 'production'
    },

    // 添加上下文信息
    context: () => ({
      userId: engine.state.get('user.id'),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }),
  },
})
```

### 手动错误报告

```typescript
// 手动报告错误
try {
  riskyOperation()
}
catch (error) {
  engine.errors.report(error, {
    context: 'user-action',
    severity: 'high',
    tags: ['payment', 'critical'],
  })
}
```

## 获取帮助

### 社区支持

- [GitHub Issues](https://github.com/ldesign/engine/issues) - 报告 bug 和功能请求
- [GitHub Discussions](https://github.com/ldesign/engine/discussions) - 社区讨论
- [Stack Overflow](https://stackoverflow.com/questions/tagged/ldesign-engine) - 技术问题

### 调试检查清单

在寻求帮助之前，请检查以下项目：

1. **版本兼容性**

   - [ ] Vue 版本 >= 3.3.0
   - [ ] Node.js 版本 >= 16
   - [ ] 浏览器支持情况

2. **配置检查**

   - [ ] 引擎配置正确
   - [ ] 插件配置正确
   - [ ] 环境变量设置

3. **错误信息**

   - [ ] 完整的错误堆栈
   - [ ] 浏览器控制台错误
   - [ ] 网络请求错误

4. **重现步骤**

   - [ ] 最小重现示例
   - [ ] 操作步骤清晰
   - [ ] 预期行为描述

5. **环境信息**
   - [ ] 操作系统版本
   - [ ] 浏览器版本
   - [ ] 引擎版本
   - [ ] 相关依赖版本

通过系统的故障排除，大多数问题都可以快速解决。如果问题仍然存在，请提供详细的错误信息和重现步骤，以便
获得更好的帮助。
