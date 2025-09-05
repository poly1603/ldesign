# 最佳实践指南

本指南提供了使用 @ldesign/kit 的最佳实践建议，帮助您构建高质量、可维护的应用程序。

## 总体原则

### 1. 模块化设计

**原则**: 保持模块间的低耦合和高内聚

```typescript
// ✅ 好的做法 - 模块化设计
class UserService {
  constructor(
    private cache: CacheManager,
    private validator: Validator,
    private logger: Logger
  ) {}

  async createUser(userData: CreateUserRequest): Promise<User> {
    // 验证输入
    const validation = await this.validator.validate(userData)
    if (!validation.valid) {
      throw new ValidationError(validation.errors)
    }

    // 业务逻辑
    const user = await this.processUserCreation(userData)

    // 缓存结果
    await this.cache.set(`user:${user.id}`, user, 3600)

    this.logger.info(`用户创建成功: ${user.id}`)
    return user
  }
}

// ❌ 避免的做法 - 紧耦合
class UserService {
  async createUser(userData: any) {
    // 直接使用具体实现，难以测试和扩展
    const cache = new MemoryCache()
    const validator = new FormValidator()
    // ...
  }
}
```

### 2. 错误处理策略

**原则**: 统一的错误处理和用户友好的错误消息

```typescript
// ✅ 好的做法 - 统一错误处理
class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'ApplicationError'
  }
}

class ErrorHandler {
  static handle(error: Error): never {
    if (error instanceof ApplicationError) {
      console.error(`[${error.code}] ${error.message}`, error.details)
    } else {
      console.error('未知错误:', error.message)
    }

    process.exit(1)
  }
}

// 使用示例
try {
  await userService.createUser(userData)
} catch (error) {
  ErrorHandler.handle(error)
}
```

### 3. 配置管理

**原则**: 集中化配置管理，支持环境变量覆盖

```typescript
// ✅ 好的做法 - 配置管理
interface AppConfig {
  database: {
    host: string
    port: number
    name: string
  }
  cache: {
    ttl: number
    maxSize: number
  }
  logging: {
    level: string
    format: string
  }
}

class ConfigManager {
  private static instance: ConfigManager
  private config: AppConfig

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  async load(): Promise<AppConfig> {
    // 加载基础配置
    const baseConfig = await this.loadFromFile('./config/default.json')

    // 环境特定配置
    const envConfig = await this.loadFromFile(`./config/${process.env.NODE_ENV}.json`)

    // 环境变量覆盖
    const envOverrides = this.loadFromEnv()

    this.config = ObjectUtils.deepMerge(baseConfig, envConfig, envOverrides)
    return this.config
  }

  get<T>(path: string): T {
    return ObjectUtils.get(this.config, path)
  }
}
```

## 模块特定最佳实践

### Cache 缓存

**1. 缓存键命名规范**

```typescript
// ✅ 好的做法 - 有意义的键名
const cacheKeys = {
  user: (id: string) => `user:profile:${id}`,
  userPosts: (userId: string, page: number) => `user:${userId}:posts:page:${page}`,
  apiResponse: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
}

// ❌ 避免的做法 - 无意义的键名
cache.set('u123', userData)
cache.set('data', someData)
```

**2. 缓存失效策略**

```typescript
// ✅ 好的做法 - 主动失效
class UserService {
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.repository.update(id, updates)

    // 清理相关缓存
    await this.cache.delete(`user:profile:${id}`)
    await this.cache.delete(`user:${id}:posts:*`) // 支持模式匹配

    return user
  }
}
```

**3. 缓存穿透保护**

```typescript
// ✅ 好的做法 - 使用 getOrSet 防止缓存穿透
async getUserProfile(id: string): Promise<User | null> {
  return this.cache.getOrSet(`user:profile:${id}`, async () => {
    const user = await this.repository.findById(id)
    return user || null // 缓存 null 值防止重复查询
  }, 3600)
}
```

### Validation 验证

**1. 验证规则组合**

```typescript
// ✅ 好的做法 - 可复用的验证规则
class UserValidationRules {
  static email() {
    return [
      ValidationRules.required('邮箱不能为空'),
      ValidationRules.email('邮箱格式不正确'),
      ValidationRules.custom(async email => {
        const exists = await UserService.emailExists(email)
        return exists ? '邮箱已被注册' : true
      }),
    ]
  }

  static password() {
    return [
      ValidationRules.required('密码不能为空'),
      ValidationRules.minLength(8, '密码至少8位'),
      ValidationRules.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
    ]
  }
}

// 使用
const validator = Validator.create()
validator.addRule('email', ...UserValidationRules.email())
validator.addRule('password', ...UserValidationRules.password())
```

**2. 分层验证**

```typescript
// ✅ 好的做法 - 分层验证
class UserController {
  async createUser(req: Request, res: Response) {
    // 1. 基础格式验证
    const basicValidation = await this.basicValidator.validate(req.body)
    if (!basicValidation.valid) {
      return res.status(400).json({ errors: basicValidation.errors })
    }

    // 2. 业务规则验证
    const businessValidation = await this.businessValidator.validate(req.body)
    if (!businessValidation.valid) {
      return res.status(422).json({ errors: businessValidation.errors })
    }

    // 3. 执行业务逻辑
    const user = await this.userService.createUser(req.body)
    res.status(201).json(user)
  }
}
```

### FileSystem 文件系统

**1. 原子操作**

```typescript
// ✅ 好的做法 - 原子写入
async function saveConfigSafely(config: any, path: string) {
  const tempPath = `${path}.tmp`
  const backupPath = `${path}.backup`

  try {
    // 备份原文件
    if (await FileSystem.exists(path)) {
      await FileSystem.copy(path, backupPath)
    }

    // 写入临时文件
    await FileSystem.writeFile(tempPath, JSON.stringify(config, null, 2))

    // 原子替换
    await FileSystem.move(tempPath, path)

    // 清理备份
    if (await FileSystem.exists(backupPath)) {
      await FileSystem.remove(backupPath)
    }
  } catch (error) {
    // 恢复备份
    if (await FileSystem.exists(backupPath)) {
      await FileSystem.move(backupPath, path)
    }
    throw error
  }
}
```

**2. 资源清理**

```typescript
// ✅ 好的做法 - 确保资源清理
class FileProcessor {
  private watchers = new Set<FileWatcher>()

  async processFiles(directory: string) {
    const watcher = FileWatcher.create(directory)
    this.watchers.add(watcher)

    try {
      watcher.on('change', this.handleFileChange.bind(this))
      // 处理逻辑...
    } finally {
      await this.cleanup()
    }
  }

  async cleanup() {
    for (const watcher of this.watchers) {
      await watcher.close()
    }
    this.watchers.clear()
  }
}
```

### Performance 性能

**1. 性能监控集成**

```typescript
// ✅ 好的做法 - 集成性能监控
class APIService {
  private monitor = PerformanceMonitor.create()

  async fetchData(endpoint: string): Promise<any> {
    return this.monitor.time(`api.${endpoint}`, async () => {
      const response = await fetch(endpoint)

      // 记录响应时间指标
      this.monitor.recordMetric('api.response_time', response.time, {
        endpoint,
        status: response.status.toString(),
      })

      return response.json()
    })
  }
}
```

**2. 内存泄漏预防**

```typescript
// ✅ 好的做法 - 预防内存泄漏
class EventProcessor {
  private listeners = new Map<string, Function[]>()
  private timers = new Set<NodeJS.Timeout>()

  addListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  scheduleTask(callback: Function, delay: number) {
    const timer = setTimeout(() => {
      this.timers.delete(timer)
      callback()
    }, delay)
    this.timers.add(timer)
  }

  cleanup() {
    // 清理事件监听器
    this.listeners.clear()

    // 清理定时器
    for (const timer of this.timers) {
      clearTimeout(timer)
    }
    this.timers.clear()
  }
}
```

## 架构模式

### 1. 依赖注入

```typescript
// ✅ 好的做法 - 依赖注入容器
class DIContainer {
  private services = new Map<string, any>()
  private factories = new Map<string, () => any>()

  register<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory)
  }

  get<T>(name: string): T {
    if (!this.services.has(name)) {
      const factory = this.factories.get(name)
      if (!factory) {
        throw new Error(`服务 ${name} 未注册`)
      }
      this.services.set(name, factory())
    }
    return this.services.get(name)
  }
}

// 注册服务
const container = new DIContainer()
container.register('cache', () => CacheManager.create())
container.register('validator', () => Validator.create())
container.register(
  'userService',
  () => new UserService(container.get('cache'), container.get('validator'))
)
```

### 2. 中间件模式

```typescript
// ✅ 好的做法 - 中间件链
type Middleware<T> = (context: T, next: () => Promise<void>) => Promise<void>

class MiddlewareChain<T> {
  private middlewares: Middleware<T>[] = []

  use(middleware: Middleware<T>): void {
    this.middlewares.push(middleware)
  }

  async execute(context: T): Promise<void> {
    let index = 0

    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++]
        await middleware(context, next)
      }
    }

    await next()
  }
}

// 使用示例
const chain = new MiddlewareChain<RequestContext>()
chain.use(authMiddleware)
chain.use(validationMiddleware)
chain.use(loggingMiddleware)
```

## 测试策略

### 1. 单元测试

```typescript
// ✅ 好的做法 - 可测试的代码
describe('UserService', () => {
  let userService: UserService
  let mockCache: jest.Mocked<CacheManager>
  let mockValidator: jest.Mocked<Validator>

  beforeEach(() => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    } as any

    mockValidator = {
      validate: jest.fn(),
    } as any

    userService = new UserService(mockCache, mockValidator)
  })

  it('应该创建用户并缓存结果', async () => {
    // Arrange
    const userData = { email: 'test@example.com', name: 'Test User' }
    mockValidator.validate.mockResolvedValue({ valid: true, errors: [] })

    // Act
    const user = await userService.createUser(userData)

    // Assert
    expect(mockValidator.validate).toHaveBeenCalledWith(userData)
    expect(mockCache.set).toHaveBeenCalledWith(`user:${user.id}`, user, 3600)
  })
})
```

### 2. 集成测试

```typescript
// ✅ 好的做法 - 集成测试
describe('API Integration', () => {
  let app: Application
  let testCache: CacheManager

  beforeAll(async () => {
    // 使用测试配置
    process.env.NODE_ENV = 'test'

    testCache = CacheManager.create({ type: 'memory' })
    app = createApp({ cache: testCache })
  })

  afterAll(async () => {
    await testCache.clear()
  })

  it('应该创建用户并返回正确响应', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        name: 'Test User',
      })
      .expect(201)

    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: 'test@example.com',
      name: 'Test User',
    })
  })
})
```

## 部署和运维

### 1. 健康检查

```typescript
// ✅ 好的做法 - 健康检查端点
class HealthChecker {
  private checks = new Map<string, () => Promise<boolean>>()

  addCheck(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check)
  }

  async checkHealth(): Promise<HealthStatus> {
    const results = new Map<string, boolean>()
    let allHealthy = true

    for (const [name, check] of this.checks) {
      try {
        const result = await check()
        results.set(name, result)
        if (!result) allHealthy = false
      } catch (error) {
        results.set(name, false)
        allHealthy = false
      }
    }

    return {
      healthy: allHealthy,
      checks: Object.fromEntries(results),
      timestamp: new Date().toISOString(),
    }
  }
}

// 注册检查
const healthChecker = new HealthChecker()
healthChecker.addCheck('database', async () => {
  try {
    await database.ping()
    return true
  } catch {
    return false
  }
})
```

### 2. 优雅关闭

```typescript
// ✅ 好的做法 - 优雅关闭
class Application {
  private server?: Server
  private cleanup: (() => Promise<void>)[] = []

  addCleanupTask(task: () => Promise<void>): void {
    this.cleanup.push(task)
  }

  async start(): Promise<void> {
    this.server = app.listen(port)

    // 注册信号处理
    process.on('SIGTERM', this.gracefulShutdown.bind(this))
    process.on('SIGINT', this.gracefulShutdown.bind(this))
  }

  private async gracefulShutdown(): Promise<void> {
    console.log('开始优雅关闭...')

    // 停止接受新连接
    if (this.server) {
      this.server.close()
    }

    // 执行清理任务
    for (const task of this.cleanup) {
      try {
        await task()
      } catch (error) {
        console.error('清理任务失败:', error)
      }
    }

    console.log('应用已安全关闭')
    process.exit(0)
  }
}
```

## 总结

遵循这些最佳实践可以帮助您：

1. **提高代码质量**: 通过模块化设计和统一的错误处理
2. **增强可维护性**: 通过清晰的架构和完善的测试
3. **优化性能**: 通过合理的缓存策略和性能监控
4. **确保可靠性**: 通过健康检查和优雅关闭机制

记住，最佳实践是指导原则，应该根据具体项目需求进行调整和优化。
