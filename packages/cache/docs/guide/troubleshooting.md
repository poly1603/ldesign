# 排障指南

常见问题与解决方案。

- localStorage 在隐私/无痕模式不可用：请捕获异常并回退到 memory 或 indexedDB。
- IndexedDB 初始化失败：检查权限、数据库版本冲突，或降级至 localStorage。
- 解密失败：确认加密密钥一致，或关闭加密重新入库。
- 循环引用：序列化时会自动简化，建议清理对象中的非必要引用。
- 过短 TTL 导致频繁 Miss：将 TTL 调整至 >= 1000ms。

# 故障排除

## 🔍 常见问题

### 1. 缓存数据丢失

**问题描述：** 设置的缓存数据无法获取或突然丢失

**可能原因：**

- 存储配额超限
- 浏览器清理了存储数据
- TTL 过期
- 存储引擎不可用

**解决方案：**

```typescript
// 检查存储引擎可用性
const isAvailable = await cache.isEngineAvailable('localStorage')
if (!isAvailable) {
  console.error('localStorage 不可用')
}

// 检查存储配额
const stats = await cache.getEngineStats('localStorage')
console.log('存储使用情况:', `${stats.usagePercentage}%`)

// 设置备用引擎
const cache = createCache({
  defaultEngine: 'localStorage',
  fallbackEngine: 'memory', // 备用引擎
})

// 监听存储错误
cache.on('error', (event) => {
  if (event.type === 'quota-exceeded') {
    console.warn('存储配额超限，切换到备用引擎')
  }
})
```

### 2. 性能问题

**问题描述：** 缓存操作响应缓慢

**可能原因：**

- 数据量过大
- 序列化/反序列化耗时
- 存储引擎性能瓶颈
- 并发操作过多

**解决方案：**

```typescript
// 启用性能监控
const cache = createCache({
  debug: true,
  performance: {
    monitoring: true,
    slowOperationThreshold: 100, // 100ms 阈值
  },
})

// 优化大数据处理
class PerformanceOptimizedCache {
  private cache: CacheManager

  async setLargeData(key: string, data: any) {
    const size = JSON.stringify(data).length

    if (size > 100 * 1024) {
      // 100KB
      // 大数据使用 IndexedDB
      await this.cache.set(key, data, { engine: 'indexedDB' })
    }
    else {
      // 小数据使用 localStorage
      await this.cache.set(key, data, { engine: 'localStorage' })
    }
  }
}

// 使用批量操作
const batchData = new Map()
batchData.set('key1', 'value1')
batchData.set('key2', 'value2')

await cache.setBatch(batchData) // 比逐个设置快
```

### 3. TypeScript 类型错误

**问题描述：** TypeScript 编译错误或类型不匹配

**解决方案：**

```typescript
// 确保正确的类型导入
import type { CacheManager, CacheOptions } from '@ldesign/cache'

// 使用泛型指定类型
interface UserData {
  id: number
  name: string
  email: string
}

const userData = await cache.get<UserData>('user-data')

// 类型断言（谨慎使用）
const config = (await cache.get('config')) as AppConfig

// 类型守卫
function isUserData(value: any): value is UserData {
  return value && typeof value.id === 'number' && typeof value.name === 'string'
}

const data = await cache.get('user-data')
if (isUserData(data)) {
  // 现在 data 是 UserData 类型
  console.log(data.name)
}
```

### 4. Vue 集成问题

**问题描述：** Vue 组件中缓存不响应或更新异常

**解决方案：**

```vue
<script setup>
import { useCache } from '@ldesign/cache/vue'
import { watch, nextTick } from 'vue'

// 确保正确的响应式设置
const { value: userData, set } = useCache('user-data', {
  defaultValue: {},
  autoSave: true,
})

// 深度监听对象变化
watch(
  userData,
  async newValue => {
    // 确保在下一个 tick 中更新
    await nextTick()
    console.log('用户数据已更新:', newValue)
  },
  { deep: true }
)

// 手动触发响应式更新
const updateUser = async (updates: any) => {
  // 使用 Object.assign 确保响应式
  Object.assign(userData.value, updates)

  // 或者重新设置整个对象
  await set({ ...userData.value, ...updates })
}
</script>
```

## 🚨 错误处理

### 1. 存储配额错误

```typescript
// 处理存储配额超限
cache.on('error', async (event) => {
  if (event.error.name === 'QuotaExceededError') {
    console.warn('存储配额超限，开始清理...')

    // 清理过期数据
    await cache.cleanup()

    // 清理最久未使用的数据
    const stats = await cache.getEngineStats(event.engine)
    if (stats.usagePercentage > 90) {
      await cache.clearLRU(0.3) // 清理30%的数据
    }

    // 重试操作
    try {
      await cache.set(event.key, event.value, { engine: 'memory' })
    }
    catch (retryError) {
      console.error('重试失败:', retryError)
    }
  }
})
```

### 2. 序列化错误

```typescript
// 处理序列化错误
class SafeSerializationCache {
  private cache: CacheManager

  async set(key: string, value: any, options?: any) {
    try {
      await this.cache.set(key, value, options)
    }
    catch (error) {
      if (error.message.includes('circular')) {
        console.warn('检测到循环引用，使用安全序列化')

        // 移除循环引用
        const safeValue = this.removeCircularReferences(value)
        await this.cache.set(key, safeValue, options)
      }
      else {
        throw error
      }
    }
  }

  private removeCircularReferences(obj: any, seen = new WeakSet()): any {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (seen.has(obj)) {
      return '[Circular Reference]'
    }

    seen.add(obj)

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeCircularReferences(item, seen))
    }

    const result = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.removeCircularReferences(value, seen)
    }

    return result
  }
}
```

### 3. 异步操作错误

```typescript
// 处理异步操作错误
class RobustAsyncCache {
  private cache: CacheManager
  private retryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
  }

  async setWithRetry(key: string, value: any, options?: any) {
    let lastError: Error

    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        await this.cache.set(key, value, options)
        return // 成功，退出重试循环
      }
      catch (error) {
        lastError = error

        if (attempt < this.retryConfig.maxRetries - 1) {
          // 等待后重试
          const delay
            = this.retryConfig.retryDelay * this.retryConfig.backoffMultiplier ** attempt
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw new Error(`缓存设置失败，已重试 ${this.retryConfig.maxRetries} 次: ${lastError.message}`)
  }
}
```

## 🔧 调试工具

### 1. 调试模式

```typescript
// 启用详细调试
const cache = createCache({
  debug: true,
  debugLevel: 'verbose', // 'error' | 'warn' | 'info' | 'verbose'
  debugOutput: (level, message, data) => {
    console.log(`[Cache ${level.toUpperCase()}] ${message}`, data)
  },
})

// 自定义调试器
class CacheDebugger {
  private cache: CacheManager

  constructor(cache: CacheManager) {
    this.cache = cache
    this.setupDebugListeners()
  }

  private setupDebugListeners() {
    // 监听所有事件
    this.cache.on('*', (event) => {
      this.logEvent(event)
    })
  }

  private logEvent(event: any) {
    const timestamp = new Date().toISOString()
    console.group(`[${timestamp}] Cache Event: ${event.type}`)
    console.log('Key:', event.key)
    console.log('Engine:', event.engine)
    console.log('Duration:', `${event.duration}ms`)
    console.log('Data:', event.data)
    console.groupEnd()
  }

  // 导出调试信息
  async exportDebugInfo() {
    const stats = await this.cache.getStats()
    const config = this.cache.getConfig()
    const engines = await this.getEngineStatus()

    const debugInfo = {
      timestamp: new Date().toISOString(),
      stats,
      config,
      engines,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    // 下载调试信息
    this.downloadJSON(debugInfo, 'cache-debug-info.json')

    return debugInfo
  }

  private downloadJSON(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
```

### 2. 性能分析

```typescript
// 性能分析工具
class PerformanceAnalyzer {
  private cache: CacheManager
  private performanceData: Array<{
    operation: string
    key: string
    engine: string
    duration: number
    timestamp: number
  }> = []

  constructor(cache: CacheManager) {
    this.cache = cache
    this.wrapCacheOperations()
  }

  private wrapCacheOperations() {
    const originalSet = this.cache.set.bind(this.cache)
    this.cache.set = async (key: string, value: any, options?: any) => {
      const start = performance.now()

      try {
        const result = await originalSet(key, value, options)
        const duration = performance.now() - start

        this.recordPerformance('set', key, options?.engine || 'auto', duration)

        return result
      }
      catch (error) {
        const duration = performance.now() - start
        this.recordPerformance('set-error', key, options?.engine || 'auto', duration)
        throw error
      }
    }
  }

  private recordPerformance(operation: string, key: string, engine: string, duration: number) {
    this.performanceData.push({
      operation,
      key,
      engine,
      duration,
      timestamp: Date.now(),
    })

    // 保持最近1000条记录
    if (this.performanceData.length > 1000) {
      this.performanceData.shift()
    }
  }

  generatePerformanceReport() {
    const report = {
      summary: this.calculateSummary(),
      slowOperations: this.findSlowOperations(),
      enginePerformance: this.analyzeEnginePerformance(),
      recommendations: this.generateRecommendations(),
    }

    console.table(report.summary)
    return report
  }

  private calculateSummary() {
    const operations = this.performanceData.reduce((acc, item) => {
      if (!acc[item.operation]) {
        acc[item.operation] = { count: 0, totalTime: 0 }
      }
      acc[item.operation].count++
      acc[item.operation].totalTime += item.duration
      return acc
    }, {})

    const summary = {}
    for (const [op, data] of Object.entries(operations)) {
      summary[op] = {
        count: data.count,
        avgTime: data.totalTime / data.count,
        totalTime: data.totalTime,
      }
    }

    return summary
  }
}
```

## 🔧 配置问题

### Windows 终端显示“终止批处理操作吗 (Y/N)?”

在 Windows PowerShell/CMD 环境下，某些终端会在长输出或工具结束时给出交互式提示“终止批处理操作吗 (Y/N)?”。这通常不是测试失败引起的，而是终端/批处理行为所致。

解决建议：

- 使用本地 Vitest 配置并指定安静 reporter 运行（本包已内置）：
  - pnpm test:run（等价于 vitest run -c vitest.local.config.ts --reporter=basic --silent）
- 明确关闭 watch/交互：
  - vitest run -c vitest.local.config.ts --reporter=basic --silent
- 在 CI 环境下使用 vitest.config.ci.ts，不会出现该提示。

如果只是看到该提示但测试用例均通过，可以忽略这一交互提示。若你希望严格保证 0 退出码，可在外层脚本中根据输出和 $LASTEXITCODE 定制退出逻辑，或使用 Node 包装器脚本执行 Vitest 并归一化退出码。

### 1. 引擎配置错误

```typescript
// ✅ 推荐：验证配置
class ConfigValidator {
  static validateConfig(config: CacheOptions): string[] {
    const errors: string[] = []

    // 检查引擎配置
    if (config.engines) {
      for (const [engine, engineConfig] of Object.entries(config.engines)) {
        if (engine === 'memory' && engineConfig.maxSize > 100 * 1024 * 1024) {
          errors.push('Memory 引擎最大大小不应超过 100MB')
        }

        if (engine === 'cookie' && !engineConfig.domain && window.location.protocol === 'https:') {
          errors.push('HTTPS 环境下建议设置 Cookie 域名')
        }
      }
    }

    // 检查安全配置
    if (config.security?.encryption?.enabled && !config.security.encryption.secretKey) {
      errors.push('启用加密时必须提供密钥')
    }

    return errors
  }
}

// 使用配置验证
const config = {
  defaultEngine: 'localStorage',
  security: {
    encryption: { enabled: true },
  },
}

const errors = ConfigValidator.validateConfig(config)
if (errors.length > 0) {
  console.error('配置错误:', errors)
}
```

### 2. 环境兼容性问题

```typescript
// ✅ 推荐：环境检测和适配
class EnvironmentAdapter {
  static createCompatibleCache(): CacheManager {
    const capabilities = this.detectCapabilities()

    const config: CacheOptions = {
      engines: {},
    }

    // 根据环境能力配置引擎
    if (capabilities.localStorage) {
      config.engines.localStorage = { enabled: true }
    }

    if (capabilities.sessionStorage) {
      config.engines.sessionStorage = { enabled: true }
    }

    if (capabilities.indexedDB) {
      config.engines.indexedDB = { enabled: true }
    }

    if (capabilities.cookie) {
      config.engines.cookie = { enabled: true }
    }

    // 内存引擎总是可用
    config.engines.memory = { enabled: true }

    // 设置默认引擎
    config.defaultEngine = this.selectBestEngine(capabilities)

    return createCache(config)
  }

  private static detectCapabilities() {
    return {
      localStorage: this.testLocalStorage(),
      sessionStorage: this.testSessionStorage(),
      indexedDB: this.testIndexedDB(),
      cookie: this.testCookie(),
    }
  }

  private static testLocalStorage(): boolean {
    try {
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    }
    catch {
      return false
    }
  }

  private static testIndexedDB(): boolean {
    return 'indexedDB' in window && indexedDB !== null
  }
}
```

## 🔒 安全问题

### 1. 加密失败

**问题描述：** 数据加密或解密失败

**解决方案：**

```typescript
// 安全的加密处理
class SecureErrorHandling {
  private cache: CacheManager

  constructor() {
    this.cache = createCache({
      security: {
        encryption: {
          enabled: true,
          onEncryptionError: this.handleEncryptionError.bind(this),
        },
      },
    })
  }

  private async handleEncryptionError(error: Error, key: string, data: any) {
    console.error('加密失败:', error.message)

    // 降级到无加密存储
    try {
      await this.cache.set(key, data, { encrypt: false })
      console.warn('已降级到无加密存储')
    }
    catch (fallbackError) {
      console.error('降级存储也失败:', fallbackError)
      throw fallbackError
    }
  }

  async safeGet(key: string) {
    try {
      return await this.cache.get(key)
    }
    catch (error) {
      if (error.message.includes('decryption')) {
        console.warn('解密失败，尝试清除损坏的数据')
        await this.cache.remove(key)
        return null
      }
      throw error
    }
  }
}
```

### 2. 密钥管理问题

```typescript
// 密钥轮换和恢复
class KeyManagement {
  private cache: CacheManager
  private keyHistory: string[] = []

  async rotateKey(newKey: string) {
    const oldKey = this.getCurrentKey()
    this.keyHistory.push(oldKey)

    try {
      // 使用新密钥重新加密所有数据
      await this.reencryptAllData(oldKey, newKey)
      this.setCurrentKey(newKey)
    }
    catch (error) {
      console.error('密钥轮换失败:', error)
      // 回滚到旧密钥
      this.setCurrentKey(oldKey)
      throw error
    }
  }

  async recoverWithOldKey(key: string) {
    // 尝试使用历史密钥解密
    for (const oldKey of this.keyHistory.reverse()) {
      try {
        const tempCache = createCache({
          security: {
            encryption: {
              enabled: true,
              secretKey: oldKey,
            },
          },
        })

        const data = await tempCache.get(key)
        if (data !== null) {
          // 使用当前密钥重新加密
          await this.cache.set(key, data)
          return data
        }
      }
      catch {
        // 继续尝试下一个密钥
      }
    }

    throw new Error('无法使用任何历史密钥解密数据')
  }
}
```

## 🔍 诊断工具

### 1. 健康检查

```typescript
// 缓存健康检查
class CacheHealthChecker {
  private cache: CacheManager

  async performHealthCheck(): Promise<HealthReport> {
    const report: HealthReport = {
      overall: 'healthy',
      engines: {},
      issues: [],
      recommendations: [],
    }

    // 检查各个引擎
    const engines = ['memory', 'localStorage', 'sessionStorage', 'indexedDB', 'cookie']

    for (const engine of engines) {
      try {
        const isAvailable = await this.cache.isEngineAvailable(engine)
        const stats = isAvailable ? await this.cache.getEngineStats(engine) : null

        report.engines[engine] = {
          available: isAvailable,
          healthy: isAvailable && (stats?.usagePercentage || 0) < 90,
          stats,
        }

        if (!isAvailable) {
          report.issues.push(`${engine} 引擎不可用`)
        }
        else if (stats && stats.usagePercentage > 90) {
          report.issues.push(`${engine} 使用率过高: ${stats.usagePercentage}%`)
          report.recommendations.push(`清理 ${engine} 中的过期数据`)
        }
      }
      catch (error) {
        report.engines[engine] = {
          available: false,
          healthy: false,
          error: error.message,
        }
        report.issues.push(`${engine} 检查失败: ${error.message}`)
      }
    }

    // 确定整体健康状态
    const unhealthyEngines = Object.values(report.engines).filter(e => !e.healthy).length
    if (unhealthyEngines > 0) {
      report.overall = unhealthyEngines > 2 ? 'critical' : 'warning'
    }

    return report
  }
}

interface HealthReport {
  overall: 'healthy' | 'warning' | 'critical'
  engines: Record<
    string,
    {
      available: boolean
      healthy: boolean
      stats?: any
      error?: string
    }
  >
  issues: string[]
  recommendations: string[]
}
```

### 2. 自动修复

```typescript
// 自动修复工具
class AutoRepair {
  private cache: CacheManager

  async performAutoRepair(): Promise<RepairReport> {
    const report: RepairReport = {
      repaired: [],
      failed: [],
    }

    try {
      // 清理过期数据
      await this.cache.cleanup()
      report.repaired.push('清理过期数据')
    }
    catch (error) {
      report.failed.push(`清理过期数据失败: ${error.message}`)
    }

    try {
      // 修复损坏的索引
      await this.repairIndexes()
      report.repaired.push('修复索引')
    }
    catch (error) {
      report.failed.push(`修复索引失败: ${error.message}`)
    }

    try {
      // 压缩存储空间
      await this.compactStorage()
      report.repaired.push('压缩存储空间')
    }
    catch (error) {
      report.failed.push(`压缩存储失败: ${error.message}`)
    }

    return report
  }

  private async repairIndexes() {
    // 重建 IndexedDB 索引
    const indexedDBEngine = await this.cache.getEngine('indexedDB')
    if (indexedDBEngine) {
      await indexedDBEngine.rebuildIndexes()
    }
  }

  private async compactStorage() {
    // 压缩各个存储引擎
    const engines = ['localStorage', 'sessionStorage', 'indexedDB']

    for (const engine of engines) {
      const engineInstance = await this.cache.getEngine(engine)
      if (engineInstance && typeof engineInstance.compact === 'function') {
        await engineInstance.compact()
      }
    }
  }
}
```

## 📋 故障排除清单

### 快速诊断步骤

1. **检查基础功能**

   ```typescript
   // 测试基础读写
   await cache.set('test', 'value')
   const value = await cache.get('test')
   console.log('基础功能:', value === 'value' ? '正常' : '异常')
   ```

2. **检查引擎可用性**

   ```typescript
   const engines = ['memory', 'localStorage', 'sessionStorage', 'indexedDB']
   for (const engine of engines) {
     const available = await cache.isEngineAvailable(engine)
     console.log(`${engine}:`, available ? '可用' : '不可用')
   }
   ```

3. **检查存储使用情况**

   ```typescript
   const stats = await cache.getStats()
   console.log('存储统计:', stats)
   ```

4. **检查错误日志**

   ```typescript
   cache.on('error', (event) => {
     console.error('缓存错误:', event)
   })
   ```

5. **执行健康检查**
   ```typescript
   const healthChecker = new CacheHealthChecker(cache)
   const report = await healthChecker.performHealthCheck()
   console.log('健康报告:', report)
   ```

### 常见错误代码

| 错误代码              | 描述           | 解决方案           |
| --------------------- | -------------- | ------------------ |
| `QUOTA_EXCEEDED`      | 存储配额超限   | 清理数据或切换引擎 |
| `ENGINE_UNAVAILABLE`  | 存储引擎不可用 | 使用备用引擎       |
| `SERIALIZATION_ERROR` | 序列化失败     | 检查数据结构       |
| `ENCRYPTION_ERROR`    | 加密失败       | 检查密钥配置       |
| `TIMEOUT_ERROR`       | 操作超时       | 增加超时时间       |

## 🆘 紧急恢复

### 数据恢复

```typescript
// 紧急数据恢复
class EmergencyRecovery {
  private cache: CacheManager

  async recoverAllData(): Promise<any> {
    const recoveredData = {}
    const engines = ['localStorage', 'sessionStorage', 'indexedDB', 'memory']

    for (const engine of engines) {
      try {
        const keys = await this.cache.keys(engine)

        for (const key of keys) {
          if (!recoveredData[key]) {
            const value = await this.cache.get(key, { engine })
            if (value !== null) {
              recoveredData[key] = {
                value,
                engine,
                timestamp: Date.now(),
              }
            }
          }
        }
      }
      catch (error) {
        console.error(`从 ${engine} 恢复数据失败:`, error)
      }
    }

    return recoveredData
  }

  async exportRecoveredData(data: any) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cache-recovery-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}
```

## 📞 获取帮助

### 1. 启用详细日志

```typescript
const cache = createCache({
  debug: true,
  debugLevel: 'verbose',
  debugOutput: (level, message, data) => {
    // 发送到日志服务
    sendToLogService({
      level,
      message,
      data,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    })
  },
})
```

### 2. 生成问题报告

```typescript
// 生成详细的问题报告
async function generateIssueReport() {
  const cache = getCacheInstance()

  const report = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    config: cache.getConfig(),
    stats: await cache.getStats(),
    healthCheck: await new CacheHealthChecker(cache).performHealthCheck(),
    recentErrors: getRecentErrors(),
    performanceData: getPerformanceData(),
  }

  // 下载报告
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cache-issue-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  return report
}
```

## 🔗 相关资源

- [GitHub Issues](https://github.com/ldesign/cache/issues) - 报告问题
- [讨论区](https://github.com/ldesign/cache/discussions) - 社区讨论
- [性能优化](./performance.md) - 性能优化指南
- [最佳实践](./best-practices.md) - 最佳实践指南
