# 📚 @ldesign/i18n API 参考

## 核心 API

### createI18n(options)

创建 I18n 实例。

```typescript
interface I18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, any>
  loader?: Loader
  cache?: CacheOptions
  performance?: PerformanceOptions
}

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': { hello: '你好' },
    'en': { hello: 'Hello' }
  }
})
```

### I18n 类方法

#### 基础翻译

```typescript
// 翻译文本
t(key: string, params?: TranslationParams): string

// 检查键是否存在
has(key: string, locale?: string): boolean

// 切换语言
setLocale(locale: string): Promise<void>
```

#### 批量翻译

```typescript
// 同步批量翻译
batchTranslate(keys: string[], params?: TranslationParams): BatchTranslationResult

// 异步批量翻译 (v2.0 新增)
tBatchAsync(keys: string[], params?: TranslationParams): Promise<Record<string, string>>
```

#### 性能优化 (v2.0 新增)

```typescript
// 预加载语言包
preloadLanguages(locales: string[], namespaces?: string[]): Promise<void[]>

// 智能预加载
smartPreload(): void

// 记录语言使用情况
recordLanguageUsage(locale: string, namespace?: string): void

// 获取预加载状态
getPreloadStatus(): PreloadStatus

// 获取批量处理统计
getBatchStats(): BatchStats

// 刷新批量队列
flushBatch(): Promise<BatchResult>
```

#### 性能监控

```typescript
// 获取性能报告
getPerformanceReport(): PerformanceReport

// 获取优化建议
getOptimizationSuggestions(): OptimizationSuggestion[]

// 重置性能统计
resetPerformanceStats(): void
```

#### 内存管理

```typescript
// 执行内存清理
performMemoryCleanup(force?: boolean): CleanupResult

// 清理所有资源
cleanupResources(): void
```

## 性能管理器 API

### BatchManager

```typescript
interface BatchConfig {
  batchSize: number
  batchDelay: number
  maxWaitTime: number
  enableSmartBatching: boolean
  enableParallel: boolean
  maxParallel: number
}

class BatchManager {
  constructor(config?: Partial<BatchConfig>)
  
  addRequest(key: string, params?: TranslationParams, priority?: number): Promise<string>
  flushBatch(): Promise<BatchResult>
  getStats(): BatchStats
  resetStats(): void
  getPendingCount(): number
  cleanup(): void
}
```

### PreloadManager

```typescript
interface PreloadConfig {
  enabled: boolean
  strategy: 'eager' | 'lazy' | 'smart'
  maxConcurrent: number
  enablePrediction: boolean
  predictionThreshold: number
}

class PreloadManager {
  constructor(loader: Loader, config?: Partial<PreloadConfig>)
  
  preloadCritical(locales: string[], namespaces?: string[]): Promise<void[]>
  smartPreload(): void
  recordUsage(locale: string, namespace?: string): void
  getPreloadStatus(): PreloadStatus
  cleanup(): void
}
```

### MemoryManager

```typescript
interface MemoryConfig {
  maxMemory: number
  pressureThreshold: number
  autoCleanup: boolean
  cleanupStrategy: 'lru' | 'ttl' | 'frequency' | 'hybrid'
  cleanupInterval: number
}

class MemoryManager {
  constructor(config?: Partial<MemoryConfig>)
  
  cleanup(force?: boolean): CleanupResult
  getMemoryReport(): MemoryReport
  checkMemoryPressure(): number
}
```

### EnhancedPerformanceManager

```typescript
interface PerformanceConfig {
  enabled: boolean
  sampleRate: number
  slowTranslationThreshold: number
  maxSlowTranslations: number
  maxFrequentKeys: number
}

class EnhancedPerformanceManager {
  constructor(config?: Partial<PerformanceConfig>)
  
  recordTranslation(key: string, startTime: number, endTime: number, fromCache: boolean, success: boolean, params?: any): void
  getDetailedReport(): DetailedPerformanceReport
  getOptimizationSuggestions(): OptimizationSuggestion[]
  reset(): void
}
```

## Vue 3 集成 API

### useI18n()

基础 Vue 3 组合式 API。

```typescript
function useI18n(): {
  t: (key: string, params?: any) => string
  locale: Ref<string>
  availableLocales: Ref<string[]>
  setLocale: (locale: string) => Promise<void>
}
```

### useI18nEnhanced()

增强的 Vue 3 组合式 API (v2.0 新增)。

```typescript
function useI18nEnhanced(): {
  // 基础功能
  t: (key: string, params?: any) => string
  locale: Ref<string>
  
  // 批量翻译
  tBatch: (keys: string[], params?: any) => Promise<Record<string, string>>
  
  // 预加载
  preload: (namespaces: string[]) => Promise<void>
  
  // 性能监控
  getPerformanceMetrics: () => PerformanceMetrics
  
  // 资源清理
  cleanup: () => void
}
```

### useI18nScope()

作用域翻译组合式 API。

```typescript
function useI18nScope(scope: string): {
  t: (key: string, params?: any) => string
  createSubScope: (subScope: string) => ReturnType<typeof useI18nScope>
}
```

### useI18nPerformance()

性能监控组合式 API。

```typescript
function useI18nPerformance(): {
  metrics: Ref<PerformanceMetrics>
  suggestions: Ref<OptimizationSuggestion[]>
  startProfiling: () => void
  stopProfiling: () => void
}
```

## 类型定义

### 核心类型

```typescript
interface TranslationParams {
  [key: string]: any
}

interface BatchTranslationResult {
  translations: Record<string, string>
  failedKeys: string[]
  successCount: number
  failureCount: number
}

interface BatchStats {
  totalRequests: number
  totalBatches: number
  averageBatchSize: number
  averageProcessingTime: number
  cacheHitRate: number
  errorRate: number
}
```

### 性能类型

```typescript
interface PerformanceReport {
  performance: DetailedPerformanceReport
  memory: MemoryReport
  cache: CacheStats
}

interface OptimizationSuggestion {
  type: 'cache' | 'memory' | 'batch' | 'preload'
  message: string
  priority: 'low' | 'medium' | 'high'
  impact: 'small' | 'medium' | 'large'
}

interface CleanupResult {
  itemsRemoved: number
  memoryFreed: number
  duration: number
}
```

### 预加载类型

```typescript
interface PreloadStatus {
  progress: number
  queue: string[]
  loaded: string[]
  failed: string[]
  isLoading: boolean
}
```

## 工具函数

### 缓存操作

```typescript
import { createTranslationCache, createPackageCache } from '@ldesign/i18n'

// 创建翻译缓存
const translationCache = createTranslationCache({
  maxSize: 1000,
  ttl: 300000 // 5分钟
})

// 创建语言包缓存
const packageCache = createPackageCache({
  maxSize: 50,
  ttl: 600000 // 10分钟
})
```

### 错误处理

```typescript
import { UnifiedErrorHandler } from '@ldesign/i18n'

const errorHandler = new UnifiedErrorHandler({
  strategy: 'FALLBACK',
  maxRetries: 3,
  retryDelay: 1000
})
```

### 验证工具

```typescript
import { ValidationUtils } from '@ldesign/i18n'

// 验证语言代码
ValidationUtils.isValidLocale('zh-CN') // true

// 验证翻译键
ValidationUtils.isValidTranslationKey('user.name') // true

// 验证参数
ValidationUtils.validateParams({ name: 'John', age: 25 }) // true
```

## 事件系统

### I18n 事件

```typescript
// 监听语言切换
i18n.on('localeChanged', (newLocale: string, oldLocale: string) => {
  console.log(`语言从 ${oldLocale} 切换到 ${newLocale}`)
})

// 监听翻译缺失
i18n.on('translationMissing', (key: string, locale: string) => {
  console.log(`缺失翻译: ${key} (${locale})`)
})

// 监听性能警告
i18n.on('performanceWarning', (warning: PerformanceWarning) => {
  console.log('性能警告:', warning.message)
})
```

## 插件系统

### 创建插件

```typescript
interface I18nPlugin {
  name: string
  install(i18n: I18n): void
  uninstall?(i18n: I18n): void
}

const myPlugin: I18nPlugin = {
  name: 'MyPlugin',
  install(i18n) {
    // 插件逻辑
  }
}

// 使用插件
i18n.use(myPlugin)
```
