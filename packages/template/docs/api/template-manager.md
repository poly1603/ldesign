# TemplateManager API

TemplateManager 是 LDesign Template 系统的核心类，负责模板的管理、加载、缓存和渲染。现在包含了智能预加载、性能监控等高级功能。

## 构造函数

### `new TemplateManager(config?)`

创建一个新的模板管理器实例。

**参数:**

- `config` (可选): `TemplateManagerConfig` - 配置选项

**示例:**

```typescript
import { TemplateManager } from '@ldesign/template'

const manager = new TemplateManager({
  defaultDevice: 'desktop',
  autoScan: true,
  autoDetectDevice: true,
  cacheEnabled: true,
  cacheSize: 100,
  cacheTTL: 10 * 60 * 1000,
})
```

## 配置选项

### `TemplateManagerConfig`

```typescript
interface TemplateManagerConfig {
  defaultDevice?: DeviceType // 默认设备类型
  autoScan?: boolean // 是否自动扫描模板
  autoDetectDevice?: boolean // 是否自动检测设备
  cacheEnabled?: boolean // 是否启用缓存
  cacheSize?: number // 缓存大小
  cacheTTL?: number // 缓存过期时间(ms)
  preloadEnabled?: boolean // 是否启用预加载
  scanPaths?: string[] // 扫描路径
  deviceBreakpoints?: DeviceBreakpoints // 设备断点
}
```

## 模板操作方法

### `scanTemplates()`

扫描并注册模板。

**返回值:** `Promise<TemplateScanResult>`

**示例:**

```typescript
const result = await manager.scanTemplates()
console.log('扫描结果:', result)
```

### `loadTemplate(category, device, template)`

加载指定的模板组件。

**参数:**

- `category`: `string` - 模板分类
- `device`: `DeviceType` - 设备类型
- `template`: `string` - 模板名称

**返回值:** `Promise<TemplateComponent>`

**示例:**

```typescript
const component = await manager.loadTemplate('auth', 'desktop', 'login')
```

### `hasTemplate(category, device, template)`

检查指定模板是否存在。

**参数:**

- `category`: `string` - 模板分类
- `device`: `DeviceType` - 设备类型
- `template`: `string` - 模板名称

**返回值:** `Promise<boolean>`

**示例:**

```typescript
const exists = await manager.hasTemplate('auth', 'desktop', 'login')
if (exists) {
  // 模板存在，可以安全加载
}
```

### `render(options)`

渲染指定的模板。

**参数:**

- `options`: `TemplateRenderOptions` - 渲染选项

**返回值:** `Promise<TemplateLoadResult>`

**示例:**

```typescript
const result = await manager.render({
  category: 'auth',
  device: 'desktop',
  template: 'login',
  props: {
    title: '用户登录',
    onLogin: handleLogin,
  },
})
```

### `getTemplates(filter?)`

获取模板列表。

**参数:**

- `filter` (可选): `TemplateFilter` - 过滤条件

**返回值:** `Promise<TemplateMetadata[]>`

**示例:**

```typescript
// 获取所有模板
const allTemplates = await manager.getTemplates()

// 获取指定分类的模板
const authTemplates = await manager.getTemplates({
  category: 'auth',
})

// 获取指定设备的模板
const mobileTemplates = await manager.getTemplates({
  device: 'mobile',
})
```

## 缓存管理方法

### `clearCache(category?, device?, template?)`

清空缓存。

**参数:**

- `category` (可选): `string` - 模板分类
- `device` (可选): `DeviceType` - 设备类型
- `template` (可选): `string` - 模板名称

**示例:**

```typescript
// 清空所有缓存
manager.clearCache()

// 清空指定分类的缓存
manager.clearCache('auth')

// 清空指定模板的缓存
manager.clearCache('auth', 'desktop', 'login')
```

### `preload(templates)`

预加载模板。

**参数:**

- `templates`: `TemplateIdentifier[]` - 要预加载的模板列表

**返回值:** `Promise<void>`

**示例:**

```typescript
await manager.preload([
  { category: 'auth', device: 'desktop', template: 'login' },
  { category: 'dashboard', device: 'desktop', template: 'admin' },
])
```

### `getCacheStats()`

获取缓存统计信息。

**返回值:** `CacheStats`

**示例:**

```typescript
const stats = manager.getCacheStats()
console.log('缓存统计:', {
  hits: stats.hits,
  misses: stats.misses,
  size: stats.size,
  hitRate: stats.hits / (stats.hits + stats.misses),
})
```

## 设备管理方法

### `getCurrentDevice()`

获取当前设备类型。

**返回值:** `DeviceType`

**示例:**

```typescript
const device = manager.getCurrentDevice()
console.log('当前设备:', device)
```

### `setDevice(device)`

设置当前设备类型。

**参数:**

- `device`: `DeviceType` - 设备类型

**示例:**

```typescript
manager.setDevice('mobile')
```

### `detectDevice()`

检测当前设备类型。

**返回值:** `DeviceType`

**示例:**

```typescript
const detectedDevice = manager.detectDevice()
console.log('检测到的设备:', detectedDevice)
```

## 事件方法

### `on(event, listener)`

监听事件。

**参数:**

- `event`: `string` - 事件名称
- `listener`: `Function` - 事件监听器

**示例:**

```typescript
// 监听模板加载事件
manager.on('template:load', event => {
  console.log('模板加载成功:', event.template)
})

// 监听模板错误事件
manager.on('template:error', event => {
  console.error('模板加载失败:', event.error)
})

// 监听设备变化事件
manager.on('device:change', event => {
  console.log('设备变化:', event.oldDevice, '->', event.newDevice)
})
```

### `off(event, listener?)`

移除事件监听器。

**参数:**

- `event`: `string` - 事件名称
- `listener` (可选): `Function` - 要移除的监听器

**示例:**

```typescript
// 移除指定监听器
manager.off('template:load', myListener)

// 移除所有监听器
manager.off('template:load')
```

### `emit(event, data)`

触发事件。

**参数:**

- `event`: `string` - 事件名称
- `data`: `any` - 事件数据

**示例:**

```typescript
manager.emit('custom:event', { message: 'Hello' })
```

## 高级方法

### `registerTemplate(metadata)`

手动注册模板。

**参数:**

- `metadata`: `TemplateMetadata` - 模板元数据

**示例:**

```typescript
manager.registerTemplate({
  category: 'custom',
  device: 'desktop',
  template: 'special',
  component: SpecialComponent,
  config: specialConfig,
})
```

### `unregisterTemplate(category, device, template)`

注销模板。

**参数:**

- `category`: `string` - 模板分类
- `device`: `DeviceType` - 设备类型
- `template`: `string` - 模板名称

**示例:**

```typescript
manager.unregisterTemplate('custom', 'desktop', 'special')
```

### `setLoader(loader)`

设置自定义加载器。

**参数:**

- `loader`: `TemplateLoader` - 模板加载器函数

**示例:**

```typescript
manager.setLoader(async (category, device, template) => {
  // 自定义加载逻辑
  const component = await import(
    `./templates/${category}/${device}/${template}/index.vue`
  )
  return component.default
})
```

### `setErrorHandler(handler)`

设置错误处理器。

**参数:**

- `handler`: `ErrorHandler` - 错误处理器

**示例:**

```typescript
manager.setErrorHandler({
  onLoadError: async (error, category, device, template) => {
    console.error('加载错误:', error)
    // 返回备用组件
    return FallbackComponent
  },
  onValidationError: (error, config) => {
    console.error('验证错误:', error)
  },
})
```

## 类型定义

### `TemplateRenderOptions`

```typescript
interface TemplateRenderOptions {
  category: string
  device?: DeviceType
  template: string
  props?: Record<string, any>
  slots?: Record<string, any>
}
```

### `TemplateLoadResult`

```typescript
interface TemplateLoadResult {
  component: TemplateComponent
  metadata: TemplateMetadata
  fromCache: boolean
  loadTime: number
}
```

### `TemplateScanResult`

```typescript
interface TemplateScanResult {
  total: number
  success: number
  failed: number
  templates: TemplateMetadata[]
  errors: Error[]
}
```

### `TemplateFilter`

```typescript
interface TemplateFilter {
  category?: string
  device?: DeviceType
  template?: string
  tags?: string[]
  version?: string
  author?: string
}
```

### `CacheStats`

```typescript
interface CacheStats {
  hits: number
  misses: number
  size: number
  maxSize: number
  memoryUsage: number
}
```

## 事件类型

### 模板事件

- `template:load` - 模板加载成功
- `template:error` - 模板加载失败
- `template:register` - 模板注册
- `template:unregister` - 模板注销

### 设备事件

- `device:change` - 设备类型变化
- `device:detect` - 设备检测完成

### 缓存事件

- `cache:hit` - 缓存命中
- `cache:miss` - 缓存未命中
- `cache:clear` - 缓存清空

## 错误类型

### `TemplateNotFoundError`

模板未找到错误。

```typescript
class TemplateNotFoundError extends Error {
  category: string
  device: DeviceType
  template: string
}
```

### `TemplateLoadError`

模板加载错误。

```typescript
class TemplateLoadError extends Error {
  category: string
  device: DeviceType
  template: string
  cause?: Error
}
```

### `ConfigurationError`

配置错误。

```typescript
class ConfigurationError extends Error {
  field: string
  value: any
}
```

## 🆕 性能优化方法

### `preloadTemplate(category, device, template)`

预加载指定模板。

**参数:**

- `category`: `string` - 模板分类
- `device`: `DeviceType` - 设备类型
- `template`: `string` - 模板名称

**返回值:** `Promise<void>`

**示例:**

```typescript
// 预加载登录模板
await manager.preloadTemplate('login', 'desktop', 'default')
```

### `preloadCommonTemplates()`

批量预加载常用模板。

**返回值:** `Promise<void>`

**示例:**

```typescript
// 预加载常用模板
await manager.preloadCommonTemplates()
```

### `getPerformanceMetrics()`

获取性能指标。

**返回值:** `PerformanceMetrics`

**示例:**

```typescript
const metrics = manager.getPerformanceMetrics()
console.log('性能指标:', {
  cacheHitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses),
  averageLoadTime: metrics.averageLoadTime,
  preloadQueueSize: metrics.preloadQueueSize,
})
```

## 最佳实践

1. **错误处理**: 始终为模板加载设置错误处理器
2. **缓存管理**: 合理配置缓存大小和过期时间
3. **性能监控**: 监听加载事件，跟踪性能指标
4. **内存管理**: 定期清理不需要的缓存
5. **事件监听**: 及时移除不需要的事件监听器
6. **🆕 智能预加载**: 根据用户行为预加载可能需要的模板
7. **🆕 性能监控**: 使用 `getPerformanceMetrics()` 监控系统性能
