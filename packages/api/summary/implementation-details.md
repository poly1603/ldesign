# @ldesign/api 实现细节

## 🔧 技术实现

### 开发环境

- **TypeScript**: 5.6.0
- **Node.js**: >= 16.0.0
- **构建工具**: Rollup
- **测试框架**: Vitest + Playwright
- **代码规范**: ESLint + Prettier
- **包管理器**: pnpm

### 项目结构

```
packages/api/
├── src/                          # 源代码
│   ├── core/                     # 核心模块
│   │   ├── api-engine.ts         # API 引擎实现
│   │   ├── plugin-manager.ts     # 插件管理器
│   │   ├── cache-manager.ts      # 缓存管理器
│   │   ├── debounce-manager.ts   # 防抖管理器
│   │   └── deduplication-manager.ts # 去重管理器
│   ├── plugins/                  # 内置插件
│   │   └── system-apis.ts        # 系统接口插件
│   ├── vue/                      # Vue 3 集成
│   │   ├── index.ts              # Vue 插件
│   │   └── composables.ts        # 组合式 API
│   ├── types/                    # 类型定义
│   │   └── index.ts              # 核心类型
│   ├── utils/                    # 工具函数
│   │   └── index.ts              # 通用工具
│   ├── index.ts                  # 主入口
│   └── vue.ts                    # Vue 专用入口
├── __tests__/                    # 测试文件
│   ├── api-engine.test.ts        # 引擎测试
│   ├── system-apis.test.ts       # 系统接口测试
│   ├── utils.test.ts             # 工具函数测试
│   └── vue.test.ts               # Vue 集成测试
├── docs/                         # 文档
│   ├── index.md                  # 文档首页
│   └── guide/                    # 使用指南
├── examples/                     # 示例代码
├── summary/                      # 项目总结
│   ├── project-overview.md       # 项目概览
│   ├── architecture-design.md    # 架构设计
│   └── implementation-details.md # 实现细节
├── package.json                  # 包配置
├── tsconfig.json                 # TypeScript 配置
├── rollup.config.js              # 构建配置
├── vitest.config.ts              # 测试配置
└── README.md                     # 项目说明
```

## 🏗️ 核心实现

### 1. ApiEngine 实现

```typescript
export class ApiEngineImpl implements ApiEngine {
  // 配置管理
  public readonly config: ApiEngineConfig

  // HTTP 客户端（依赖 @ldesign/http）
  private readonly httpClient: HttpClientImpl

  // 管理器组件
  private readonly pluginManager: PluginManager
  private readonly cacheManager: CacheManager
  private readonly debounceManager: DebounceManager
  private readonly deduplicationManager: DeduplicationManager

  // API 方法注册表
  private readonly apiMethods = new Map<string, ApiMethod>()

  // 生命周期状态
  private destroyed = false
}
```

#### 关键实现细节

1. **配置合并策略**

```typescript
constructor(config: ApiEngineConfig = {}) {
  this.config = {
    debug: false,
    cache: {
      enabled: true,
      ttl: 300000,
      maxSize: 100,
      storage: 'memory',
      prefix: 'api_cache_',
    },
    debounce: {
      enabled: true,
      delay: 300,
    },
    deduplication: {
      enabled: true,
    },
    ...config, // 用户配置覆盖默认配置
  }
}
```

2. **API 调用流程**

```typescript
async call<T = any, P = any>(name: string, params?: P): Promise<T> {
  // 1. 检查引擎状态
  this.checkDestroyed()

  // 2. 获取方法定义
  const method = this.apiMethods.get(name)
  if (!method) {
    throw new Error(`API method "${name}" not found`)
  }

  // 3. 生成请求配置
  const requestConfig = typeof method.config === 'function'
    ? method.config(params)
    : method.config

  // 4. 缓存检查
  if (method.cache?.enabled !== false && this.config.cache?.enabled) {
    const cacheKey = this.generateCacheKey(name, params)
    const cachedResult = await this.cacheManager.get<T>(cacheKey)
    if (cachedResult !== null) {
      return cachedResult
    }
  }

  // 5. 请求去重
  if (method.deduplication !== false && this.config.deduplication?.enabled) {
    const deduplicationKey = this.generateDeduplicationKey(name, params)
    return await this.deduplicationManager.execute<T>(
      deduplicationKey,
      () => this.executeRequest<T>(method, requestConfig, params)
    )
  }

  // 6. 防抖处理
  if (method.debounce?.enabled !== false && this.config.debounce?.enabled) {
    const debounceKey = this.generateDebounceKey(name, params)
    const delay = method.debounce?.delay ?? this.config.debounce?.delay ?? 300
    return await this.debounceManager.execute<T>(
      debounceKey,
      () => this.executeRequest<T>(method, requestConfig, params),
      delay
    )
  }

  // 7. 直接执行
  return await this.executeRequest<T>(method, requestConfig, params)
}
```

### 2. 缓存管理器实现

#### 多级缓存策略

```typescript
class CacheManager {
  private async getItem<T>(key: string): Promise<CacheItem<T> | null> {
    const fullKey = this.config.prefix + key

    switch (this.config.storage) {
      case 'memory':
        return this.memoryCache.get(fullKey) || null

      case 'localStorage':
        if (typeof localStorage === 'undefined') return null
        const localItem = localStorage.getItem(fullKey)
        return localItem ? JSON.parse(localItem) : null

      case 'sessionStorage':
        if (typeof sessionStorage === 'undefined') return null
        const sessionItem = sessionStorage.getItem(fullKey)
        return sessionItem ? JSON.parse(sessionItem) : null

      default:
        return null
    }
  }
}
```

#### 自动清理机制

```typescript
private startCleanupTimer(): void {
  // 每5分钟清理一次过期缓存
  setInterval(() => {
    this.cleanupExpiredItems()
  }, 5 * 60 * 1000)
}

private cleanupExpiredItems(): void {
  if (this.config.storage !== 'memory') return

  const now = Date.now()
  const expiredKeys: string[] = []

  this.memoryCache.forEach((item, key) => {
    if (now > item.expiresAt) {
      expiredKeys.push(key)
    }
  })

  expiredKeys.forEach(key => {
    this.memoryCache.delete(key)
  })
}
```

### 3. 防抖管理器实现

#### 防抖算法

```typescript
async execute<T = any>(
  key: string,
  task: () => Promise<T>,
  delay?: number
): Promise<T> {
  if (!this.config.enabled) {
    return await task()
  }

  const actualDelay = delay ?? this.config.delay

  return new Promise<T>((resolve, reject) => {
    // 取消之前的任务
    const existingTask = this.tasks.get(key)
    if (existingTask) {
      if (existingTask.timerId) {
        clearTimeout(existingTask.timerId)
      }
      existingTask.reject(new Error('Debounced: replaced by newer request'))
      this.stats.cancellations++
    }

    // 创建新任务
    const newTask: DebounceTask<T> = {
      task,
      delay: actualDelay,
      resolve,
      reject,
      createdAt: Date.now(),
    }

    // 设置定时器
    newTask.timerId = setTimeout(async () => {
      try {
        const result = await task()
        resolve(result)
        this.stats.executions++
        this.stats.totalDelay += actualDelay
      }
      catch (error) {
        reject(error)
      }
      finally {
        this.tasks.delete(key)
      }
    }, actualDelay)

    this.tasks.set(key, newTask)
  })
}
```

### 4. 请求去重管理器实现

#### 去重算法

```typescript
async execute<T = any>(
  key: string,
  task: () => Promise<T>
): Promise<T> {
  if (!this.config.enabled) {
    return await task()
  }

  // 检查是否有相同的任务正在执行
  const existingTask = this.runningTasks.get(key)
  if (existingTask) {
    // 增加引用计数
    existingTask.refCount++
    this.stats.duplications++
    this.stats.totalSaved++

    // 返回现有任务的结果
    return await existingTask.promise
  }

  // 创建新任务
  const promise = this.createTask(key, task)
  const newTask: DeduplicationTask<T> = {
    promise,
    createdAt: Date.now(),
    refCount: 1,
  }

  this.runningTasks.set(key, newTask)
  this.stats.executions++

  try {
    const result = await promise
    return result
  }
  finally {
    // 任务完成后清理
    this.runningTasks.delete(key)
  }
}
```

## 🔌 插件系统实现

### 插件管理器

```typescript
class PluginManager {
  async register(plugin: ApiPlugin): Promise<void> {
    // 1. 验证插件格式
    this.validatePlugin(plugin)

    // 2. 检查名称冲突
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`)
    }

    // 3. 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin "${plugin.name}" depends on "${dep}" which is not registered`)
        }
      }
    }

    try {
      // 4. 注册插件
      this.plugins.set(plugin.name, plugin)
      this.loadOrder.push(plugin.name)

      // 5. 安装插件
      await plugin.install(this.engine)

      // 6. 注册插件提供的 API 方法
      if (plugin.apis) {
        this.engine.registerBatch(plugin.apis)
      }

      this.log(`Plugin "${plugin.name}" registered successfully`)
    } catch (error) {
      // 注册失败时清理
      this.plugins.delete(plugin.name)
      const index = this.loadOrder.indexOf(plugin.name)
      if (index > -1) {
        this.loadOrder.splice(index, 1)
      }
      throw error
    }
  }
}
```

### 系统接口插件

```typescript
export function createSystemApiPlugin(config: SystemApiConfig = {}): ApiPlugin {
  const { basePath = '/api', enableCache = true, cacheTtl = 300000, endpoints = {} } = config

  const finalEndpoints = { ...DEFAULT_ENDPOINTS, ...endpoints }
  const buildUrl = (endpoint: string) => `${basePath}${endpoint}`
  const cacheConfig = enableCache ? { enabled: true, ttl: cacheTtl } : { enabled: false }

  // 通用响应转换函数
  const transformResponse = <T>(response: SystemApiResponse<T>): T => {
    if (response.code !== 200) {
      throw new Error(response.message || 'API request failed')
    }
    return response.data
  }

  const apis: Record<string, ApiMethod> = {
    getCaptcha: {
      name: 'getCaptcha',
      config: { method: 'GET', url: buildUrl(finalEndpoints.getCaptcha) },
      cache: { enabled: false },
      transform: transformResponse<CaptchaInfo>,
    },

    login: {
      name: 'login',
      config: (params: LoginParams) => ({
        method: 'POST',
        url: buildUrl(finalEndpoints.login),
        data: params,
      }),
      cache: { enabled: false },
      transform: transformResponse<LoginResponse>,
    },

    // ... 其他接口定义
  }

  return {
    name: 'system-apis',
    version: '1.0.0',
    apis,
    install: engine => {
      if (engine.config.debug) {
        console.log('[System APIs Plugin] Installed with endpoints:', finalEndpoints)
      }
    },
  }
}
```

## 🌟 Vue 3 集成实现

### Vue 插件

```typescript
export const apiVuePlugin = {
  install(app: App, options: ApiVuePluginOptions = {}) {
    const { globalPropertyName = '$api', injectionKey = API_ENGINE_KEY, ...engineConfig } = options

    // 创建 API 引擎实例
    const apiEngine = createApiEngine(engineConfig)

    // 提供依赖注入
    app.provide(injectionKey, apiEngine)

    // 添加全局属性
    app.config.globalProperties[globalPropertyName] = apiEngine

    // 在应用卸载时清理资源
    const originalUnmount = app.unmount
    app.unmount = function () {
      apiEngine.destroy()
      originalUnmount.call(this)
    }
  },
}
```

### 组合式 API

```typescript
export function useApiCall<T = any, P = any>(
  methodName: string,
  options: UseApiCallOptions = {}
): ApiCallState<T> {
  const { immediate = false, defaultParams, onSuccess, onError, onFinally } = options

  const apiEngine = useApi()

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const finished = ref(false)

  let cancelFlag = false

  const execute = async (params?: P): Promise<T> => {
    if (loading.value) {
      return data.value as T
    }

    loading.value = true
    error.value = null
    finished.value = false
    cancelFlag = false

    try {
      const result = await apiEngine.call<T, P>(methodName, params)

      if (cancelFlag) {
        throw new Error('Request cancelled')
      }

      data.value = result
      finished.value = true

      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (err) {
      if (cancelFlag) {
        return data.value as T
      }

      const apiError = err instanceof Error ? err : new Error(String(err))
      error.value = apiError
      finished.value = true

      if (onError) {
        onError(apiError)
      }

      throw apiError
    } finally {
      if (!cancelFlag) {
        loading.value = false

        if (onFinally) {
          onFinally()
        }
      }
    }
  }

  // 立即执行
  if (immediate) {
    execute(defaultParams)
  }

  // 组件卸载时取消请求
  onUnmounted(() => {
    cancelFlag = true
    loading.value = false
  })

  return {
    data,
    loading,
    error,
    finished,
    execute,
    reset: () => {
      data.value = null
      loading.value = false
      error.value = null
      finished.value = false
      cancelFlag = false
    },
    cancel: () => {
      cancelFlag = true
      loading.value = false
    },
  }
}
```

## 🧪 测试实现

### 测试策略

1. **单元测试**: 测试各个模块的核心功能
2. **集成测试**: 测试模块间的协作
3. **Vue 集成测试**: 测试 Vue 3 集成功能
4. **端到端测试**: 测试完整的使用场景

### 测试覆盖

- **ApiEngine**: 插件注册、方法调用、配置管理
- **PluginManager**: 插件生命周期、依赖检查
- **CacheManager**: 缓存存储、过期清理
- **DebounceManager**: 防抖逻辑、任务管理
- **DeduplicationManager**: 请求去重、引用计数
- **SystemApiPlugin**: 系统接口定义、响应转换
- **Vue Integration**: 插件安装、组合式 API
- **Utils**: 工具函数的各种边界情况

## 📦 构建配置

### Rollup 配置

```javascript
export default {
  input: {
    index: 'src/index.ts',
    vue: 'src/vue.ts',
  },

  output: [
    {
      dir: 'es',
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    {
      dir: 'lib',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    {
      file: 'dist/index.js',
      format: 'umd',
      name: 'LDesignApi',
    },
  ],

  external: ['vue', '@ldesign/http'],

  plugins: [typescript(), resolve(), commonjs(), terser()],
}
```

### TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "types",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "es", "lib", "types"]
}
```

## 🚀 性能优化

### 1. 包体积优化

- **Tree Shaking**: 支持按需导入
- **代码分割**: 核心功能和 Vue 集成分离
- **依赖外部化**: Vue 和 HTTP 客户端作为外部依赖

### 2. 运行时优化

- **对象池**: 复用频繁创建的对象
- **惰性初始化**: 按需初始化管理器
- **内存管理**: 定期清理过期数据

### 3. 缓存优化

- **智能缓存**: 根据接口特性自动选择缓存策略
- **压缩存储**: 大数据自动压缩存储
- **预加载**: 预测性地加载可能需要的数据

## 🔧 开发工具

### 调试支持

```typescript
private log(message: string, data?: any): void {
  if (this.config.debug) {
    console.log(`[API Engine] ${message}`, data || '')
  }
}
```

### 性能监控

```typescript
class PerformanceMonitor {
  recordApiCall(methodName: string, duration: number, cached: boolean) {
    if (this.config.debug) {
      console.log(`[Performance] ${methodName}: ${duration}ms ${cached ? '(cached)' : ''}`)
    }
  }
}
```

### 错误追踪

```typescript
class ErrorTracker {
  trackError(error: Error, context: any) {
    if (this.config.debug) {
      console.error('[API Error]', {
        message: error.message,
        stack: error.stack,
        context,
      })
    }
  }
}
```

这些实现细节确保了 @ldesign/api 具有高性能、高可靠性和良好的开发体验。
