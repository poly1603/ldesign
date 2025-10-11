# API 参考手册

`@ldesign/template` v2.0.0 完整 API 文档。

## 📑 目录

- [核心 API](#核心-api)
- [Composables](#composables)
- [类和服务](#类和服务)
- [类型定义](#类型定义)
- [工具函数](#工具函数)
- [插件配置](#插件配置)

---

## 核心 API

### TemplatePlugin

Vue 插件，用于全局安装 `@ldesign/template`。

#### 安装

```typescript path=null start=null
import { createApp } from 'vue'
import TemplatePlugin from '@ldesign/template'
import type { TemplateConfig } from '@ldesign/template'

const app = createApp(App)

const config: TemplateConfig = {
  device: {
    defaultDevice: 'mobile',
  },
  cache: {
    enabled: true,
  },
}

app.use(TemplatePlugin, config)
```

#### 参数

- `config` (可选): `TemplateConfig` - 插件配置对象

---

## Composables

### useTemplate

模板管理的核心 Composable。

#### 类型签名

```typescript path=null start=null
function useTemplate(): {
  loadTemplate: (name: string, device: DeviceType) => Promise<Component>
  currentTemplate: Ref<Component | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  clearTemplate: () => void
}
```

#### 返回值

- `loadTemplate(name, device)` - 加载指定模板
  - `name`: 模板名称
  - `device`: 设备类型 (`'mobile' | 'tablet' | 'desktop'`)
  - 返回: `Promise<Component>`

- `currentTemplate` - 当前加载的模板组件 (响应式)
- `isLoading` - 加载状态 (响应式)
- `error` - 错误信息 (响应式)
- `clearTemplate()` - 清除当前模板

#### 示例

```typescript path=null start=null
import { useTemplate } from '@ldesign/template'

const {
  loadTemplate,
  currentTemplate,
  isLoading,
  error,
} = useTemplate()

// 加载模板
await loadTemplate('login', 'mobile')

// 检查状态
if (isLoading.value) {
  console.log('加载中...')
}

if (error.value) {
  console.error('加载失败:', error.value)
}

// 渲染模板
<component :is="currentTemplate" />
```

---

### useDeviceDetection

设备检测 Composable。

#### 类型签名

```typescript path=null start=null
function useDeviceDetection(options?: DeviceDetectionOptions): {
  deviceType: Ref<DeviceType>
  setDeviceType: (type: DeviceType) => void
  isMobile: ComputedRef<boolean>
  isTablet: ComputedRef<boolean>
  isDesktop: ComputedRef<boolean>
  screenWidth: Ref<number>
  screenHeight: Ref<number>
}
```

#### 参数

- `options` (可选): `DeviceDetectionOptions`
  ```typescript path=null start=null
  interface DeviceDetectionOptions {
    breakpoints?: {
      mobile?: number
      tablet?: number
      desktop?: number
    }
    debounceDelay?: number
  }
  ```

#### 返回值

- `deviceType` - 当前设备类型 (响应式)
- `setDeviceType(type)` - 手动设置设备类型
- `isMobile` - 是否为移动设备 (计算属性)
- `isTablet` - 是否为平板设备 (计算属性)
- `isDesktop` - 是否为桌面设备 (计算属性)
- `screenWidth` - 屏幕宽度 (响应式)
- `screenHeight` - 屏幕高度 (响应式)

#### 示例

```typescript path=null start=null
import { useDeviceDetection } from '@ldesign/template'

const {
  deviceType,
  setDeviceType,
  isMobile,
  isTablet,
  isDesktop,
  screenWidth,
} = useDeviceDetection({
  breakpoints: {
    mobile: 768,
    tablet: 1024,
  },
  debounceDelay: 300,
})

// 检测当前设备
console.log('当前设备:', deviceType.value)
console.log('是否移动设备:', isMobile.value)
console.log('屏幕宽度:', screenWidth.value)

// 手动设置
setDeviceType('desktop')
```

---

### usePrerender

预渲染 Composable，支持 SSR 和 SSG。

#### 类型签名

```typescript path=null start=null
function usePrerender(options?: PrerenderOptions): {
  prerenderTemplate: (
    path: string,
    device: DeviceType,
    options?: PrerenderTaskOptions
  ) => Promise<PrerenderResult>
  
  isPrerending: Ref<boolean>
  progress: Ref<number>
  queueSize: Ref<number>
  
  clearCache: () => void
  getStats: () => PrerenderStats
}
```

#### 参数

- `options` (可选): `PrerenderOptions`
  ```typescript path=null start=null
  interface PrerenderOptions {
    mode?: 'ssr' | 'ssg' | 'hybrid'
    strategy?: 'eager' | 'lazy' | 'on-demand' | 'scheduled'
    cache?: boolean
    timeout?: number
    maxConcurrent?: number
    seo?: {
      enabled?: boolean
      generateMeta?: boolean
      generateStructuredData?: boolean
      defaultTitle?: string
      defaultDescription?: string
    }
  }
  ```

#### 返回值

- `prerenderTemplate(path, device, options)` - 预渲染模板
  - `path`: 模板路径
  - `device`: 设备类型
  - `options`: 任务选项
    ```typescript path=null start=null
    interface PrerenderTaskOptions {
      priority?: 'critical' | 'high' | 'medium' | 'low'
      cacheKey?: string
    }
    ```
  - 返回: `Promise<PrerenderResult>`

- `isPrerendering` - 是否正在预渲染 (响应式)
- `progress` - 预渲染进度 0-100 (响应式)
- `queueSize` - 队列大小 (响应式)
- `clearCache()` - 清除预渲染缓存
- `getStats()` - 获取统计信息

#### 示例

```typescript path=null start=null
import { usePrerender } from '@ldesign/template'

const {
  prerenderTemplate,
  isPrerendering,
  progress,
  queueSize,
} = usePrerender({
  mode: 'hybrid',
  cache: true,
  timeout: 10000,
  seo: {
    enabled: true,
    generateMeta: true,
  },
})

// 预渲染首页
const result = await prerenderTemplate('/home', 'mobile', {
  priority: 'critical',
})

console.log('SEO Meta:', result.seo?.meta)
console.log('Critical CSS:', result.criticalCSS)
console.log('预加载链接:', result.preloadLinks)

// 监控进度
watch(progress, (value) => {
  console.log(`预渲染进度: ${value}%`)
})
```

---

### useSSRPrerender

SSR 预设的 Composable。

#### 类型签名

```typescript path=null start=null
function useSSRPrerender(options?: Partial<PrerenderOptions>): ReturnType<typeof usePrerender>
```

#### 示例

```typescript path=null start=null
import { useSSRPrerender } from '@ldesign/template'

const { prerenderTemplate } = useSSRPrerender({
  timeout: 5000,
})

await prerenderTemplate('/about', 'mobile')
```

---

### useSSGPrerender

SSG 预设的 Composable。

#### 类型签名

```typescript path=null start=null
function useSSGPrerender(options?: Partial<PrerenderOptions>): ReturnType<typeof usePrerender>
```

#### 示例

```typescript path=null start=null
import { useSSGPrerender } from '@ldesign/template'

const { prerenderTemplate } = useSSGPrerender({
  cache: true,
})

await prerenderTemplate('/blog/post-1', 'desktop')
```

---

### useHotReload

热更新 Composable (仅开发环境)。

#### 类型签名

```typescript path=null start=null
function useHotReload(): {
  isEnabled: Ref<boolean>
  currentVersion: Ref<string>
  lastUpdate: Ref<Date | null>
  enable: () => void
  disable: () => void
  rollback: (version: string) => Promise<void>
  getHistory: () => HotReloadHistory[]
}
```

#### 返回值

- `isEnabled` - 是否启用热更新 (响应式)
- `currentVersion` - 当前版本 (响应式)
- `lastUpdate` - 最后更新时间 (响应式)
- `enable()` - 启用热更新
- `disable()` - 禁用热更新
- `rollback(version)` - 回滚到指定版本
- `getHistory()` - 获取更新历史

#### 示例

```typescript path=null start=null
import { useHotReload } from '@ldesign/template'

const {
  isEnabled,
  currentVersion,
  rollback,
  getHistory,
} = useHotReload()

// 查看历史
const history = getHistory()
console.log('更新历史:', history)

// 回滚到上一个版本
await rollback('1.0.5')
```

---

## 类和服务

### EnhancedCache

增强的缓存类，支持 LRU/LFU/FIFO 策略。

#### 构造函数

```typescript path=null start=null
class EnhancedCache {
  constructor(options?: CacheOptions)
}

interface CacheOptions {
  strategy?: 'lru' | 'lfu' | 'fifo'
  maxSize?: number
  ttl?: number
  weakCache?: {
    enabled?: boolean
    maxRefs?: number
  }
}
```

#### 方法

##### `get(key: string): T | undefined`

获取缓存项。

```typescript path=null start=null
const cache = new EnhancedCache()
const value = cache.get('my-key')
```

##### `set(key: string, value: T, ttl?: number): void`

设置缓存项。

```typescript path=null start=null
cache.set('my-key', { data: 'value' }, 3600)
```

##### `has(key: string): boolean`

检查缓存项是否存在。

```typescript path=null start=null
if (cache.has('my-key')) {
  console.log('缓存命中')
}
```

##### `delete(key: string): boolean`

删除缓存项。

```typescript path=null start=null
cache.delete('my-key')
```

##### `clear(): void`

清除所有缓存。

```typescript path=null start=null
cache.clear()
```

##### `getEnhancedStats(): CacheStats`

获取缓存统计。

```typescript path=null start=null
const stats = cache.getEnhancedStats()
console.log('命中率:', stats.hitRate)
console.log('缓存大小:', stats.size)
console.log('驱逐次数:', stats.evictionCount)
```

##### `warmup(keys: string[], loader: Function, options?: WarmupOptions): Promise<void>`

预热缓存。

```typescript path=null start=null
await cache.warmup(
  ['key1', 'key2', 'key3'],
  async (key) => {
    return await fetchData(key)
  },
  { type: 'immediate' }
)
```

##### `setWeak(ref: object, value: T, key: string): void`

设置 WeakMap 缓存。

```typescript path=null start=null
const component = { /* 组件对象 */ }
cache.setWeak(component, templateData, 'component-id')
```

##### `updateConfig(options: Partial<CacheOptions>): void`

更新缓存配置。

```typescript path=null start=null
cache.updateConfig({
  strategy: 'lfu',
  maxSize: 150,
})
```

---

### ErrorHandler

统一的错误处理类。

#### 构造函数

```typescript path=null start=null
class ErrorHandler {
  constructor(options?: ErrorHandlerOptions)
}

interface ErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  fallbackTemplate?: string
  logErrors?: boolean
  maxHistory?: number
}
```

#### 方法

##### `handle(error: Error, context?: Record<string, any>): void`

处理错误。

```typescript path=null start=null
const errorHandler = new ErrorHandler({
  maxRetries: 3,
  logErrors: true,
})

try {
  await loadTemplate('login', 'mobile')
} catch (error) {
  errorHandler.handle(error as Error, {
    component: 'LoginPage',
  })
}
```

##### `getRecentErrors(count?: number): ErrorRecord[]`

获取最近的错误。

```typescript path=null start=null
const recentErrors = errorHandler.getRecentErrors(10)
console.log('最近的错误:', recentErrors)
```

##### `getStats(): ErrorStats`

获取错误统计。

```typescript path=null start=null
const stats = errorHandler.getStats()
console.log('总错误数:', stats.totalErrors)
console.log('错误类型分布:', stats.errorTypes)
```

##### `clearHistory(): void`

清除错误历史。

```typescript path=null start=null
errorHandler.clearHistory()
```

##### `retry<T>(fn: () => Promise<T>, maxRetries?: number): Promise<T>`

自动重试函数。

```typescript path=null start=null
const result = await errorHandler.retry(
  async () => {
    return await loadTemplate('home', 'mobile')
  },
  3
)
```

---

### PrerenderEngine

预渲染引擎类。

#### 构造函数

```typescript path=null start=null
class PrerenderEngine {
  constructor(options?: PrerenderOptions)
}
```

#### 方法

##### `prerender(path: string, device: DeviceType, options?: PrerenderTaskOptions): Promise<PrerenderResult>`

执行预渲染。

```typescript path=null start=null
const engine = new PrerenderEngine({
  mode: 'ssr',
  cache: true,
})

const result = await engine.prerender('/home', 'mobile', {
  priority: 'high',
})
```

##### `getStats(): PrerenderStats`

获取预渲染统计。

```typescript path=null start=null
const stats = engine.getStats()
console.log('已渲染页面数:', stats.totalRendered)
console.log('缓存命中数:', stats.cacheHits)
```

##### `clearCache(): void`

清除预渲染缓存。

```typescript path=null start=null
engine.clearCache()
```

---

## 类型定义

### DeviceType

```typescript path=null start=null
type DeviceType = 'mobile' | 'tablet' | 'desktop'
```

### TemplateConfig

```typescript path=null start=null
interface TemplateConfig {
  device?: {
    defaultDevice?: DeviceType
    breakpoints?: {
      mobile?: number
      tablet?: number
      desktop?: number
    }
    debounceDelay?: number
  }
  cache?: {
    enabled?: boolean
    strategy?: 'lru' | 'lfu' | 'fifo'
    maxSize?: number
    ttl?: number
    weakCache?: {
      enabled?: boolean
      maxRefs?: number
    }
  }
  errorHandling?: {
    enabled?: boolean
    maxRetries?: number
    retryDelay?: number
    fallbackTemplate?: string
    logErrors?: boolean
    maxHistory?: number
  }
  performance?: {
    enableMetrics?: boolean
    metricsInterval?: number
    enableLazyLoad?: boolean
    prefetchOnIdle?: boolean
  }
  prerender?: PrerenderOptions
  security?: {
    enableCSP?: boolean
    sanitizeInput?: boolean
    validatePaths?: boolean
  }
  devtools?: {
    enabled?: boolean
    hotReload?: boolean
    debug?: boolean
  }
}
```

### PrerenderResult

```typescript path=null start=null
interface PrerenderResult {
  html: string
  component: Component | null
  criticalCSS: string
  preloadLinks: string
  seo?: {
    meta: string
    structuredData: string
  }
  timestamp: number
}
```

### CacheStats

```typescript path=null start=null
interface CacheStats {
  size: number
  maxSize: number
  hits: number
  misses: number
  hitRate: number
  evictionCount: number
  avgAccessTime: number
  memoryUsage: number
}
```

### ErrorStats

```typescript path=null start=null
interface ErrorStats {
  totalErrors: number
  errorTypes: Record<string, number>
  recentErrors: ErrorRecord[]
  avgResolutionTime: number
}
```

---

## 工具函数

### 类型守卫

#### `isString(value: unknown): value is string`

检查值是否为字符串。

```typescript path=null start=null
import { isString } from '@ldesign/template'

if (isString(data)) {
  console.log(data.toUpperCase())
}
```

#### `isObject(value: unknown): value is object`

检查值是否为对象。

```typescript path=null start=null
import { isObject } from '@ldesign/template'

if (isObject(data)) {
  console.log(Object.keys(data))
}
```

#### `isFunction(value: unknown): value is Function`

检查值是否为函数。

```typescript path=null start=null
import { isFunction } from '@ldesign/template'

if (isFunction(callback)) {
  callback()
}
```

#### `isPromise<T>(value: unknown): value is Promise<T>`

检查值是否为 Promise。

```typescript path=null start=null
import { isPromise } from '@ldesign/template'

if (isPromise(result)) {
  await result
}
```

### 安全工具

#### `sanitizeHTML(html: string): string`

清理 HTML，防止 XSS 攻击。

```typescript path=null start=null
import { sanitizeHTML } from '@ldesign/template'

const cleanHTML = sanitizeHTML(userInput)
```

#### `sanitizePath(path: string): string`

清理路径，防止路径遍历攻击。

```typescript path=null start=null
import { sanitizePath } from '@ldesign/template'

const safePath = sanitizePath(userPath)
```

#### `validateCSP(policy: string): boolean`

验证 CSP 策略。

```typescript path=null start=null
import { validateCSP } from '@ldesign/template'

const isValid = validateCSP("default-src 'self'")
```

#### `generateCSP(directives: Record<string, string[]>): string`

生成 CSP 策略字符串。

```typescript path=null start=null
import { generateCSP } from '@ldesign/template'

const csp = generateCSP({
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
})
```

### 性能工具

#### `measurePerformance<T>(name: string, fn: () => T): T`

测量函数性能。

```typescript path=null start=null
import { measurePerformance } from '@ldesign/template'

const result = await measurePerformance('loadTemplate', async () => {
  return await loadTemplate('home', 'mobile')
})

// 查看性能指标
const entries = performance.getEntriesByName('loadTemplate')
console.log('执行时间:', entries[0].duration, 'ms')
```

#### `debounce<T>(fn: Function, delay: number): Function`

防抖函数。

```typescript path=null start=null
import { debounce } from '@ldesign/template'

const debouncedFn = debounce(() => {
  console.log('执行')
}, 300)

window.addEventListener('resize', debouncedFn)
```

#### `throttle<T>(fn: Function, limit: number): Function`

节流函数。

```typescript path=null start=null
import { throttle } from '@ldesign/template'

const throttledFn = throttle(() => {
  console.log('执行')
}, 1000)

window.addEventListener('scroll', throttledFn)
```

### 设备检测工具

#### `detectDeviceFromUA(userAgent: string): DeviceType`

从 User-Agent 检测设备类型。

```typescript path=null start=null
import { detectDeviceFromUA } from '@ldesign/template'

const device = detectDeviceFromUA(navigator.userAgent)
console.log('设备类型:', device)
```

#### `detectDeviceFromWidth(width: number, breakpoints?: Breakpoints): DeviceType`

从屏幕宽度检测设备类型。

```typescript path=null start=null
import { detectDeviceFromWidth } from '@ldesign/template'

const device = detectDeviceFromWidth(window.innerWidth, {
  mobile: 768,
  tablet: 1024,
})
```

---

## 插件配置

### 默认配置

```typescript path=null start=null
const defaultConfig: TemplateConfig = {
  device: {
    defaultDevice: 'mobile',
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: Infinity,
    },
    debounceDelay: 300,
  },
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 100,
    ttl: 3600,
    weakCache: {
      enabled: false,
      maxRefs: 500,
    },
  },
  errorHandling: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
    fallbackTemplate: 'error',
    logErrors: false,
    maxHistory: 50,
  },
  performance: {
    enableMetrics: false,
    metricsInterval: 30000,
    enableLazyLoad: true,
    prefetchOnIdle: true,
  },
  prerender: {
    enabled: false,
    mode: 'ssr',
    strategy: 'lazy',
    cache: true,
    timeout: 10000,
    maxConcurrent: 3,
    seo: {
      enabled: true,
      generateMeta: true,
      generateStructuredData: false,
      defaultTitle: '',
      defaultDescription: '',
    },
  },
  security: {
    enableCSP: false,
    sanitizeInput: true,
    validatePaths: true,
  },
  devtools: {
    enabled: process.env.NODE_ENV === 'development',
    hotReload: true,
    debug: false,
  },
}
```

---

## 事件系统

### 缓存事件

`EnhancedCache` 支持事件监听：

```typescript path=null start=null
const cache = new EnhancedCache()

// 监听缓存命中
cache.on('hit', (key) => {
  console.log('缓存命中:', key)
})

// 监听缓存未命中
cache.on('miss', (key) => {
  console.log('缓存未命中:', key)
})

// 监听缓存驱逐
cache.on('evict', (key, value) => {
  console.log('缓存驱逐:', key)
})

// 监听内存警告
cache.on('memoryWarning', (usage) => {
  console.warn('内存使用过高:', usage)
})
```

---

## 迁移指南

### 从 v1.x 迁移到 v2.0

#### 1. 导入变更

```typescript path=null start=null
// v1.x
import { TemplateManager } from '@ldesign/template'

// v2.0
import { useTemplate } from '@ldesign/template'
```

#### 2. API 变更

```typescript path=null start=null
// v1.x
const manager = new TemplateManager()
await manager.load('home', 'mobile')

// v2.0
const { loadTemplate } = useTemplate()
await loadTemplate('home', 'mobile')
```

#### 3. 配置变更

```typescript path=null start=null
// v1.x
app.use(TemplatePlugin, {
  cacheSize: 100,
  deviceBreakpoint: 768,
})

// v2.0
app.use(TemplatePlugin, {
  cache: {
    maxSize: 100,
  },
  device: {
    breakpoints: {
      mobile: 768,
    },
  },
})
```

---

## 📚 相关资源

- [快速开始](./QUICK_START.md)
- [FAQ](./FAQ.md)
- [示例集合](./EXAMPLES.md)
- [优化指南](./OPTIMIZATION_GUIDE.md)

---

**最后更新**: 2025-10-10  
**版本**: v2.0.0
