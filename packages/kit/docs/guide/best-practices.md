# 最佳实践

本指南提供了使用 @ldesign/kit 的最佳实践和推荐模式。

## 项目结构

### 推荐的项目结构

```
my-project/
├── src/
│   ├── config/
│   │   ├── base.json5
│   │   ├── development.json5
│   │   └── production.json5
│   ├── utils/
│   │   └── index.ts
│   ├── services/
│   │   └── api.ts
│   └── index.ts
├── assets/
│   └── icons/
│       ├── home.svg
│       └── user.svg
├── dist/
│   └── fonts/
└── docs/
```

### 模块导入策略

```typescript
// ✅ 推荐：按需导入
import { StringUtils, FileSystem } from '@ldesign/kit'

// ✅ 推荐：从子模块导入
import { ConfigManager } from '@ldesign/kit/config'
import { SvgToIconFont } from '@ldesign/kit/iconfont'

// ❌ 不推荐：导入整个库
import * as Kit from '@ldesign/kit'
```

## 配置管理

### 配置文件组织

```typescript
// config/base.json5
{
  app: {
    name: "My Application",
    version: "1.0.0"
  },
  database: {
    host: "localhost",
    port: 5432
  }
}

// config/development.json5
{
  database: {
    name: "myapp_dev",
    debug: true
  },
  logging: {
    level: "debug"
  }
}

// config/production.json5
{
  database: {
    name: "myapp_prod",
    ssl: true
  },
  logging: {
    level: "error"
  }
}
```

### 配置加载模式

```typescript
import { ConfigManager, ConfigCache, ConfigHotReload } from '@ldesign/kit/config'

class AppConfig {
  private static instance: AppConfig
  private configManager: ConfigManager
  private cache: ConfigCache
  private hotReload: ConfigHotReload

  private constructor() {
    this.cache = new ConfigCache({
      maxSize: 1000,
      ttl: 300000, // 5 minutes
    })

    this.configManager = new ConfigManager({
      configFile: `${process.env.NODE_ENV || 'development'}.json5`,
      configDir: './config',
      envPrefix: 'MYAPP',
    })

    this.hotReload = new ConfigHotReload(this.cache, this.configManager.loader)
  }

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig()
    }
    return AppConfig.instance
  }

  async initialize(): Promise<void> {
    await this.configManager.load()
    await this.hotReload.enable(this.configManager.options.configFile!)
  }

  get<T>(key: string, defaultValue?: T): T {
    return this.cache.get(key) ?? defaultValue
  }
}

// 使用
const config = AppConfig.getInstance()
await config.initialize()

const dbHost = config.get('database.host', 'localhost')
```

## 错误处理

### 统一错误处理

```typescript
import { KitError, FileSystemError, NetworkError } from '@ldesign/kit'

class ErrorHandler {
  static handle(error: Error): void {
    if (error instanceof FileSystemError) {
      console.error(`文件系统错误: ${error.message}`, {
        path: error.path,
        code: error.code,
      })
    } else if (error instanceof NetworkError) {
      console.error(`网络错误: ${error.message}`, {
        url: error.url,
        code: error.code,
      })
    } else if (error instanceof KitError) {
      console.error(`Kit 错误: ${error.message}`, {
        code: error.code,
        cause: error.cause,
      })
    } else {
      console.error('未知错误:', error.message)
    }
  }
}

// 使用
try {
  await FileSystem.readFile('./config.json')
} catch (error) {
  ErrorHandler.handle(error as Error)
}
```

### 重试机制

```typescript
import { AsyncUtils } from '@ldesign/kit/utils'

// 带重试的操作
async function reliableOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  return AsyncUtils.retry(operation, {
    maxAttempts: maxRetries,
    delay: 1000,
    backoff: true,
    onRetry: (error, attempt) => {
      console.log(`操作失败，第 ${attempt} 次重试:`, error.message)
    },
  })
}

// 使用
const result = await reliableOperation(async () => {
  return HttpUtils.get('https://api.example.com/data')
})
```

## 性能优化

### 缓存策略

```typescript
import { CacheManager } from '@ldesign/kit'

class DataService {
  private cache = CacheManager.create({
    defaultTTL: 300000, // 5 minutes
    maxSize: 1000,
  })

  async getUserData(userId: string): Promise<UserData> {
    const cacheKey = `user:${userId}`

    // 尝试从缓存获取
    let userData = await this.cache.get(cacheKey)

    if (!userData) {
      // 缓存未命中，从数据库获取
      userData = await this.fetchUserFromDatabase(userId)

      // 存入缓存
      await this.cache.set(cacheKey, userData)
    }

    return userData
  }

  private async fetchUserFromDatabase(userId: string): Promise<UserData> {
    // 数据库查询逻辑
    return {} as UserData
  }
}
```

### 批量操作

```typescript
import { FileUtils, HttpUtils } from '@ldesign/kit/utils'

// 批量文件处理
async function processFiles(filePaths: string[]): Promise<void> {
  // 使用 Promise.all 并发处理
  const results = await Promise.all(
    filePaths.map(async filePath => {
      try {
        return await FileUtils.getFileInfo(filePath)
      } catch (error) {
        console.error(`处理文件失败: ${filePath}`, error)
        return null
      }
    })
  )

  const validResults = results.filter(Boolean)
  console.log(`成功处理 ${validResults.length}/${filePaths.length} 个文件`)
}

// 批量 HTTP 请求
async function fetchMultipleUrls(urls: string[]): Promise<void> {
  const requests = urls.map(url => ({ url }))
  const results = await HttpUtils.batchRequest(requests, 5) // 并发数为 5

  results.forEach((result, index) => {
    if (result instanceof Error) {
      console.error(`请求失败: ${urls[index]}`, result.message)
    } else {
      console.log(`请求成功: ${urls[index]}`, result.status)
    }
  })
}
```

## 类型安全

### 类型定义

```typescript
// types/config.ts
export interface AppConfig {
  app: {
    name: string
    version: string
    debug?: boolean
  }
  database: {
    host: string
    port: number
    name: string
    ssl?: boolean
  }
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
  }
}

// 使用泛型确保类型安全
class TypedConfigManager<T = any> {
  async get<K extends keyof T>(key: K): Promise<T[K]> {
    // 实现
    return {} as T[K]
  }
}

const configManager = new TypedConfigManager<AppConfig>()
const dbHost = await configManager.get('database') // 类型为 AppConfig['database']
```

### 验证和类型守卫

```typescript
import { ValidationUtils } from '@ldesign/kit/utils'

// 类型守卫
function isValidConfig(config: any): config is AppConfig {
  return (
    config &&
    typeof config.app?.name === 'string' &&
    typeof config.database?.host === 'string' &&
    typeof config.database?.port === 'number'
  )
}

// 运行时验证
function validateConfig(config: unknown): AppConfig {
  if (!isValidConfig(config)) {
    throw new Error('Invalid configuration')
  }
  return config
}
```

## 测试策略

### 单元测试

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FileSystem, CacheManager } from '@ldesign/kit'

describe('FileSystem', () => {
  const testDir = './test-temp'

  beforeEach(async () => {
    await FileSystem.ensureDir(testDir)
  })

  afterEach(async () => {
    await FileSystem.remove(testDir)
  })

  it('should create and read file', async () => {
    const filePath = `${testDir}/test.txt`
    const content = 'Hello, World!'

    await FileSystem.writeFile(filePath, content)
    const readContent = await FileSystem.readFile(filePath, 'utf8')

    expect(readContent).toBe(content)
  })
})
```

### 集成测试

```typescript
describe('Configuration Integration', () => {
  it('should load and hot reload configuration', async () => {
    const configManager = new ConfigManager({
      configFile: 'test-config.json5',
      configDir: './test-config',
    })

    await configManager.load()

    const initialValue = configManager.get('test.value')
    expect(initialValue).toBe('initial')

    // 模拟配置文件变更
    await FileSystem.writeFile(
      './test-config/test-config.json5',
      JSON.stringify({ test: { value: 'updated' } })
    )

    // 等待热重载
    await new Promise(resolve => setTimeout(resolve, 1000))

    const updatedValue = configManager.get('test.value')
    expect(updatedValue).toBe('updated')
  })
})
```

## 部署和生产

### 环境配置

```typescript
// 生产环境配置
const productionConfig = {
  // 禁用调试功能
  debug: false,

  // 优化缓存设置
  cache: {
    ttl: 3600000, // 1 hour
    maxSize: 10000,
  },

  // 启用压缩
  compression: true,

  // 配置日志级别
  logging: {
    level: 'error',
  },
}
```

### 监控和日志

```typescript
import { SystemUtils, Logger } from '@ldesign/kit'

class HealthMonitor {
  private logger = Logger.create('HealthMonitor')

  async checkHealth(): Promise<HealthStatus> {
    const systemInfo = SystemUtils.getSystemInfo()
    const memoryUsage = SystemUtils.getMemoryUsage()
    const cpuUsage = await SystemUtils.getCpuUsage()

    const status: HealthStatus = {
      timestamp: new Date(),
      memory: memoryUsage.system.percentage,
      cpu: cpuUsage,
      uptime: systemInfo.uptime,
      healthy: memoryUsage.system.percentage < 80 && cpuUsage < 80,
    }

    if (!status.healthy) {
      this.logger.warn('系统资源使用率过高', status)
    }

    return status
  }
}

interface HealthStatus {
  timestamp: Date
  memory: number
  cpu: number
  uptime: number
  healthy: boolean
}
```

## 安全考虑

### 输入验证

```typescript
import { ValidationUtils } from '@ldesign/kit/utils'

function sanitizeInput(input: string): string {
  return ValidationUtils.escape(input)
    .replace(/[<>]/g, '') // 移除 HTML 标签
    .trim()
}

function validateEmail(email: string): boolean {
  return ValidationUtils.isEmail(email)
}
```

### 文件路径安全

```typescript
import { PathUtils } from '@ldesign/kit/utils'

function safeFilePath(userPath: string, baseDir: string): string {
  const normalizedPath = PathUtils.normalize(userPath)
  const resolvedPath = PathUtils.resolve(baseDir, normalizedPath)

  // 确保路径在基础目录内
  if (!resolvedPath.startsWith(PathUtils.resolve(baseDir))) {
    throw new Error('Invalid file path')
  }

  return resolvedPath
}
```
