# API 参考

欢迎来到 `@ldesign/template` 的 API 参考文档。这里提供了完整的 API 接口说明和使用示例。

## 核心 API

### 模板管理器
- [TemplateManager](./template-manager.md) - 核心模板管理器，负责模板的扫描、加载和缓存

### Vue 集成
- [Vue 集成](./vue-integration.md) - Vue3 组件、组合式 API 和指令

## 快速导航

### 🏗️ 核心类

| 类名 | 描述 | 文档链接 |
|------|------|----------|
| `TemplateManager` | 模板管理器主类 | [查看详情](./template-manager.md#templatemanager) |
| `TemplateScanner` | 模板扫描器 | [查看详情](./template-manager.md#templatescanner) |
| `TemplateLoader` | 模板加载器 | [查看详情](./template-manager.md#templateloader) |
| `DeviceAdapter` | 设备适配器 | [查看详情](./template-manager.md#deviceadapter) |

### 🎯 Vue 组件

| 组件名 | 描述 | 文档链接 |
|--------|------|----------|
| `TemplateRenderer` | 模板渲染组件 | [查看详情](./vue-integration.md#templaterenderer) |
| `TemplateSelector` | 模板选择器组件 | [查看详情](./vue-integration.md#templateselector) |

### 🔧 组合式 API

| API 名称 | 描述 | 文档链接 |
|----------|------|----------|
| `useTemplate` | 模板管理 Hook | [查看详情](./vue-integration.md#usetemplate) |
| `useTemplateScanner` | 模板扫描 Hook | [查看详情](./vue-integration.md#usetemplatescanner) |
| `useTemplateCache` | 缓存管理 Hook | [查看详情](./vue-integration.md#usetemplatecache) |

### 📋 指令

| 指令名 | 描述 | 文档链接 |
|--------|------|----------|
| `v-template` | 模板渲染指令 | [查看详情](./vue-integration.md#v-template) |
| `v-template-lazy` | 懒加载指令 | [查看详情](./vue-integration.md#v-template-lazy) |
| `v-template-preload` | 预加载指令 | [查看详情](./vue-integration.md#v-template-preload) |

## 类型定义

### 基础类型

```typescript
// 设备类型
type DeviceType = 'desktop' | 'tablet' | 'mobile'

// 模板信息
interface TemplateInfo {
  category: string
  deviceType: DeviceType
  path: string
  metadata?: Record<string, any>
}

// 配置选项
interface TemplateConfig {
  scanner?: ScannerConfig
  loader?: LoaderConfig
  cache?: CacheConfig
  performance?: PerformanceConfig
}
```

### 扫描器配置

```typescript
interface ScannerConfig {
  scanPaths: string[]
  enableCache: boolean
  watchMode: boolean
  excludePatterns?: string[]
  includePatterns?: string[]
}
```

### 加载器配置

```typescript
interface LoaderConfig {
  enableCache: boolean
  maxCacheSize: number
  preloadStrategy: 'none' | 'critical' | 'all'
  timeout: number
}
```

### 缓存配置

```typescript
interface CacheConfig {
  enabled: boolean
  strategy: 'lru' | 'fifo' | 'lfu'
  maxSize: number
  ttl: number
}
```

## 事件系统

### 模板管理器事件

```typescript
// 模板加载事件
manager.on('template:loaded', (data: TemplateLoadedEvent) => {
  console.log('模板加载完成:', data)
})

// 模板错误事件
manager.on('template:error', (error: TemplateErrorEvent) => {
  console.error('模板加载失败:', error)
})

// 设备变化事件
manager.on('device:changed', (data: DeviceChangedEvent) => {
  console.log('设备类型变化:', data)
})

// 性能警告事件
manager.on('performance:warning', (data: PerformanceWarningEvent) => {
  console.warn('性能警告:', data)
})
```

### Vue 组件事件

```typescript
// TemplateRenderer 组件事件
interface TemplateRendererEvents {
  'template-loaded': (component: any) => void
  'template-error': (error: Error) => void
  'template-changed': (template: string) => void
  'device-changed': (deviceType: DeviceType) => void
}
```

## 错误处理

### 错误类型

```typescript
// 模板加载错误
class TemplateLoadError extends Error {
  constructor(
    message: string,
    public template: string,
    public deviceType: DeviceType,
    public cause?: Error
  ) {
    super(message)
    this.name = 'TemplateLoadError'
  }
}

// 扫描错误
class TemplateScanError extends Error {
  constructor(
    message: string,
    public path: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'TemplateScanError'
  }
}

// 设备检测错误
class DeviceDetectionError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'DeviceDetectionError'
  }
}
```

### 错误处理最佳实践

```typescript
// 1. 使用 try-catch 处理同步错误
try {
  const template = await manager.loadTemplate('login', 'desktop')
}
catch (error) {
  if (error instanceof TemplateLoadError) {
    // 处理模板加载错误
    console.error('模板加载失败:', error.template, error.deviceType)
  }
}

// 2. 使用事件监听处理异步错误
manager.on('template:error', (error) => {
  // 全局错误处理
  console.error('模板系统错误:', error)
})

// 3. 设置错误回退
const config = {
  loader: {
    fallbackStrategy: 'graceful', // 优雅降级
    fallbackTemplate: 'default' // 默认模板
  }
}
```

## 性能优化

### 预加载策略

```typescript
// 关键模板预加载
await manager.preloadTemplates([
  { category: 'login', deviceType: 'desktop' },
  { category: 'dashboard', deviceType: 'desktop' }
])

// 智能预加载
const config = {
  loader: {
    preloadStrategy: 'critical',
    preloadRules: [
      { pattern: 'login/*', priority: 'high' },
      { pattern: 'dashboard/*', priority: 'medium' }
    ]
  }
}
```

### 缓存优化

```typescript
// LRU 缓存配置
const config = {
  cache: {
    strategy: 'lru',
    maxSize: 50,
    ttl: 30 * 60 * 1000 // 30分钟
  }
}

// 缓存统计
const stats = manager.getCacheStats()
console.log('缓存命中率:', stats.hitRate)
console.log('内存使用:', stats.memoryUsage)
```

## 调试和监控

### 开发模式

```typescript
// 启用调试模式
const manager = new TemplateManager({
  debug: true,
  performance: {
    enabled: true,
    sampleRate: 1.0 // 100% 采样
  }
})

// 性能报告
const report = manager.getPerformanceReport()
console.log('性能报告:', report)
```

### 生产监控

```typescript
// 生产环境监控
const config = {
  performance: {
    enabled: true,
    sampleRate: 0.1, // 10% 采样
    reportInterval: 60000 // 1分钟报告一次
  }
}

// 监控事件
manager.on('performance:report', (report) => {
  // 发送到监控系统
  analytics.track('template_performance', report)
})
```

## 下一步

- 查看 [模板管理器详细文档](./template-manager.md)
- 了解 [Vue 集成使用方法](./vue-integration.md)
- 参考 [使用示例](/examples/basic.md)
- 阅读 [最佳实践指南](/guide/best-practices.md)
