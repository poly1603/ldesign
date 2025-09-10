# 配置选项

LDesign Engine 提供了丰富的配置选项，让你可以根据项目需求定制引擎行为。

## 基础配置

### 引擎配置

```typescript
import { createEngine } from '@ldesign/engine'

const engine = createEngine({
  config: {
    // 应用基础信息
    app: {
      name: 'My Application',
      version: '1.0.0'
    },

    // 调试模式
    debug: process.env.NODE_ENV === 'development',

    // 日志级别
    logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'

    // 性能监控
    enablePerformanceMonitoring: true,

    // 错误报告
    enableErrorReporting: true,

    // 自动保存状态
    autoSaveState: true,

    // 状态保存间隔（毫秒）
    stateSaveInterval: 30000,
  },
})
```

### 完整配置接口

```typescript
interface EngineConfig {
  // 基础配置
  app?: {
    name?: string
    version?: string
  }
  debug?: boolean
  logLevel?: 'debug' | 'info' | 'warn' | 'error'

  // 功能开关
  enablePerformanceMonitoring?: boolean
  enableErrorReporting?: boolean
  enableStateValidation?: boolean
  enableEventDebugging?: boolean
  autoSaveState?: boolean

  // 性能配置
  maxEventListeners?: number
  maxStateHistorySize?: number
  stateSaveInterval?: number
  cacheCleanupInterval?: number

  // 安全配置
  enableXSSProtection?: boolean
  enableCSRFProtection?: boolean
  allowedOrigins?: string[]

  // 开发配置
  devtools?: boolean
  hotReload?: boolean
  mockData?: boolean

  // 自定义配置
  [key: string]: any
}
```

## 模块配置

### 插件系统配置

```typescript
const engine = createEngine({
  plugins: [
    // 插件列表
    myPlugin,
    anotherPlugin,
  ],

  pluginConfig: {
    // 插件加载超时时间
    loadTimeout: 10000,

    // 是否允许插件热重载
    hotReload: true,

    // 插件依赖检查
    checkDependencies: true,

    // 插件沙箱模式
    sandboxMode: false,
  },
})
```

### 中间件配置

```typescript
const engine = createEngine({
  middleware: [
    // 中间件列表
    loggingMiddleware,
    authMiddleware,
  ],

  middlewareConfig: {
    // 中间件执行超时时间
    timeout: 5000,

    // 错误处理策略
    errorHandling: 'continue', // 'continue' | 'stop' | 'retry'

    // 重试次数
    maxRetries: 3,

    // 重试延迟
    retryDelay: 1000,
  },
})
```

### 状态管理配置

```typescript
const engine = createEngine({
  state: {
    // 初始状态
    initialState: {
      user: null,
      theme: 'light',
      language: 'zh-CN',
    },

    // 持久化配置
    persistence: {
      enabled: true,
      storage: 'localStorage', // 'localStorage' | 'sessionStorage' | 'indexedDB'
      prefix: 'myapp:',
      keys: ['user', 'theme', 'language'], // 需要持久化的状态键
      encryption: false, // 是否加密存储
      compression: true, // 是否压缩存储
    },

    // 状态验证
    validation: {
      enabled: true,
      strict: false, // 严格模式
      schemas: {
        user: userSchema,
        theme: themeSchema,
      },
    },

    // 状态历史
    history: {
      enabled: true,
      maxSize: 50,
      excludeKeys: ['ui.temp'], // 不记录历史的状态键
    },
  },
})
```

### 事件系统配置

```typescript
const engine = createEngine({
  events: {
    // 最大监听器数量
    maxListeners: 100,

    // 事件队列大小
    queueSize: 1000,

    // 异步事件处理
    async: true,

    // 事件优先级支持
    enablePriority: true,

    // 事件命名空间
    namespaces: ['user', 'app', 'ui'],

    // 事件中间件
    middleware: [eventLoggingMiddleware, eventValidationMiddleware],

    // 调试配置
    debug: {
      enabled: process.env.NODE_ENV === 'development',
      logAll: false,
      logPatterns: ['user:*', 'error:*'],
    },
  },
})
```

### 缓存配置

```typescript
const engine = createEngine({
  cache: {
    // 缓存类型
    type: 'memory', // 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB'

    // 最大缓存大小
    maxSize: 1000,

    // 默认过期时间（毫秒）
    defaultTTL: 300000, // 5分钟

    // 淘汰策略
    evictionPolicy: 'lru', // 'lru' | 'lfu' | 'fifo' | 'random'

    // 序列化配置
    serialization: {
      serializer: 'json', // 'json' | 'msgpack' | 'custom'
      compression: true,
    },

    // 性能配置
    performance: {
      enableStats: true,
      cleanupInterval: 60000, // 清理间隔
      batchSize: 100, // 批量操作大小
    },
  },
})
```

### 安全配置

```typescript
const engine = createEngine({
  security: {
    // XSS防护
    xss: {
      enabled: true,
      allowedTags: ['div', 'span', 'p', 'a'],
      allowedAttributes: {
        a: ['href', 'title'],
        div: ['class', 'id'],
      },
      stripIgnoreTag: true,
    },

    // CSRF防护
    csrf: {
      enabled: true,
      tokenName: '_token',
      headerName: 'X-CSRF-Token',
      cookieName: 'csrf-token',
      sameSite: 'strict',
    },

    // 内容安全策略
    csp: {
      enabled: true,
      directives: {
        'default-src': ['\'self\''],
        'script-src': ['\'self\'', '\'unsafe-inline\''],
        'style-src': ['\'self\'', '\'unsafe-inline\''],
        'img-src': ['\'self\'', 'data:', 'https:'],
      },
      reportOnly: false,
      reportUri: '/api/csp-report',
    },

    // 点击劫持防护
    clickjacking: {
      enabled: true,
      policy: 'deny', // 'deny' | 'sameorigin' | 'allow-from'
    },

    // HTTPS配置
    https: {
      enabled: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    },
  },
})
```

### 性能监控配置

```typescript
const engine = createEngine({
  performance: {
    // 监控开关
    enabled: true,

    // 监控间隔
    interval: 1000,

    // 性能预算
    budget: {
      fcp: 1500, // 首次内容绘制
      lcp: 2500, // 最大内容绘制
      fid: 100, // 首次输入延迟
      cls: 0.1, // 累积布局偏移
      memory: 50, // 内存使用限制（MB）
    },

    // 自动优化
    autoOptimization: {
      enabled: true,
      memoryThreshold: 0.8,
      responseTimeThreshold: 1000,
    },

    // 报告配置
    reporting: {
      enabled: true,
      endpoint: '/api/performance',
      interval: 30000,
      batchSize: 10,
    },
  },
})
```

## 环境配置

### 开发环境

```typescript
const developmentConfig = {
  config: {
    debug: true,
    logLevel: 'debug',
    enablePerformanceMonitoring: true,
    devtools: true,
    hotReload: true,
  },

  events: {
    debug: {
      enabled: true,
      logAll: true,
    },
  },

  state: {
    history: {
      enabled: true,
      maxSize: 100,
    },
  },
}
```

### 生产环境

```typescript
const productionConfig = {
  config: {
    debug: false,
    logLevel: 'warn',
    enablePerformanceMonitoring: true,
    enableErrorReporting: true,
  },

  security: {
    xss: { enabled: true },
    csrf: { enabled: true },
    csp: { enabled: true },
  },

  performance: {
    enabled: true,
    autoOptimization: { enabled: true },
  },
}
```

### 测试环境

```typescript
const testConfig = {
  config: {
    debug: true,
    logLevel: 'error',
    mockData: true,
  },

  state: {
    persistence: { enabled: false },
  },

  cache: {
    type: 'memory',
    maxSize: 100,
  },
}
```

## 配置合并和继承

### 配置合并

```typescript
import { mergeConfig } from '@ldesign/engine'

const baseConfig = {
  config: { debug: false },
  cache: { maxSize: 1000 },
}

const envConfig = {
  config: { debug: true },
  state: { persistence: { enabled: true } },
}

// 深度合并配置
const finalConfig = mergeConfig(baseConfig, envConfig)
// 结果: { config: { debug: true }, cache: { maxSize: 1000 }, state: { persistence: { enabled: true } } }
```

### 配置继承

```typescript
class ConfigManager {
  private configs = new Map<string, any>()

  // 注册配置模板
  register(name: string, config: any) {
    this.configs.set(name, config)
  }

  // 继承配置
  extend(baseName: string, overrides: any) {
    const baseConfig = this.configs.get(baseName)
    if (!baseConfig) {
      throw new Error(`Base config "${baseName}" not found`)
    }

    return mergeConfig(baseConfig, overrides)
  }
}

const configManager = new ConfigManager()

// 注册基础配置
configManager.register('base', {
  config: { appName: 'My App' },
  cache: { maxSize: 1000 },
})

// 继承并扩展
const devConfig = configManager.extend('base', {
  config: { debug: true },
  events: { debug: { enabled: true } },
})
```

## 动态配置

### 运行时配置更新

```typescript
// 运行时更新配置
engine.updateConfig({
  logLevel: 'debug',
  enablePerformanceMonitoring: false,
})

// 监听配置变化
engine.events.on('config:updated', (changes) => {
  console.log('配置已更新:', changes)
})
```

### 远程配置

```typescript
// 从远程加载配置
async function loadRemoteConfig() {
  try {
    const response = await fetch('/api/config')
    const remoteConfig = await response.json()

    engine.updateConfig(remoteConfig)
    console.log('远程配置加载成功')
  }
  catch (error) {
    console.error('远程配置加载失败:', error)
  }
}

// 定期同步配置
setInterval(loadRemoteConfig, 300000) // 5分钟同步一次
```

## 配置验证

### 配置模式验证

```typescript
import Ajv from 'ajv'

const configSchema = {
  type: 'object',
  properties: {
    config: {
      type: 'object',
      properties: {
        appName: { type: 'string', minLength: 1 },
        debug: { type: 'boolean' },
        logLevel: { enum: ['debug', 'info', 'warn', 'error'] },
      },
    },
  },
}

const ajv = new Ajv()
const validate = ajv.compile(configSchema)

function validateConfig(config: any) {
  const valid = validate(config)
  if (!valid) {
    throw new Error(`配置验证失败: ${ajv.errorsText(validate.errors)}`)
  }
  return config
}

// 使用验证
const engine = createEngine(
  validateConfig({
    config: {
      appName: 'My App',
      debug: true,
      logLevel: 'info',
    },
  })
)
```

通过灵活的配置系统，你可以根据不同环境和需求定制引擎行为，实现最佳的开发和运行体验。
