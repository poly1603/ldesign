# TemplateManager

> 🎭 模板管理器 - 整个模板系统的核心大脑！

`TemplateManager` 是模板系统的核心类，负责模板的扫描、加载、渲染和管理。

## 🚀 基础用法

```typescript
import { TemplateManager } from '@ldesign/template'

const manager = new TemplateManager({
  enableCache: true,
  defaultDevice: 'desktop'
})
```

## 🔧 构造函数

### `new TemplateManager(config?)`

创建一个新的模板管理器实例。

**参数:**
- `config` (可选): `TemplateManagerConfig` - 配置选项

**示例:**
```typescript
const manager = new TemplateManager({
  enableCache: true,
  autoDetectDevice: true,
  defaultDevice: 'desktop',
  debug: false
})
```

## 📋 配置选项 (TemplateManagerConfig)

```typescript
interface TemplateManagerConfig {
  /** 是否启用缓存 */
  enableCache?: boolean

  /** 是否自动检测设备类型 */
  autoDetectDevice?: boolean

  /** 默认设备类型 */
  defaultDevice?: DeviceType

  /** 是否启用调试模式 */
  debug?: boolean

  /** 自定义模板路径 */
  templatePaths?: string[]

  /** 错误处理回调 */
  onError?: (error: Error) => void

  /** 模板加载完成回调 */
  onTemplateLoaded?: (metadata: TemplateMetadata) => void
}
```

## 🎯 核心方法

### `scanTemplates()`

扫描可用的模板。

**返回值:** `Promise<TemplateScanResult>`

**示例:**
```typescript
const result = await manager.scanTemplates()
console.log(`发现 ${result.count} 个模板`)
console.log('扫描耗时:', result.duration, 'ms')
console.log('扫描模式:', result.scanMode)
```

**返回结果:**
```typescript
interface TemplateScanResult {
  count: number // 模板数量
  templates: TemplateMetadata[] // 模板列表
  duration: number // 扫描耗时(ms)
  scannedDirectories: number // 扫描的目录数
  scanMode: 'import.meta.glob' | 'fallback' // 扫描模式
}
```

### `render(options)`

渲染指定的模板。

**参数:**
- `options`: `TemplateRenderOptions` - 渲染选项

**返回值:** `Promise<TemplateRenderResult>`

**示例:**
```typescript
// 基础渲染
const result = await manager.render({
  category: 'login',
  device: 'desktop',
  template: 'classic'
})

// 带回退的渲染
const result = await manager.render({
  category: 'login',
  device: 'mobile',
  template: 'modern',
  fallback: true // 如果模板不存在，使用回退模板
})

// 使用渲染结果
const { component, metadata, loadTime, fromCache } = result
```

**渲染选项:**
```typescript
interface TemplateRenderOptions {
  category: string // 模板分类
  device?: DeviceType // 设备类型 (可选，会自动检测)
  template: string // 模板名称
  fallback?: boolean // 是否启用回退 (默认: true)
  props?: Record<string, any> // 传递给模板的属性
}
```

**渲染结果:**
```typescript
interface TemplateRenderResult {
  component: any // Vue 组件
  metadata: TemplateMetadata // 模板元数据
  loadTime: number // 加载耗时(ms)
  fromCache: boolean // 是否来自缓存
}
```

### `switchTemplate(category, device, template)`

切换到指定模板。

**参数:**
- `category`: `string` - 模板分类
- `device`: `DeviceType` - 设备类型
- `template`: `string` - 模板名称

**返回值:** `Promise<void>`

**示例:**
```typescript
// 切换到现代登录模板
await manager.switchTemplate('login', 'desktop', 'modern')

// 切换到移动端仪表板
await manager.switchTemplate('dashboard', 'mobile', 'compact')
```

## 📊 查询方法

### `getTemplates(category?, device?)`

获取模板列表。

**参数:**
- `category` (可选): `string` - 按分类过滤
- `device` (可选): `DeviceType` - 按设备类型过滤

**返回值:** `TemplateMetadata[]`

**示例:**
```typescript
// 获取所有模板
const allTemplates = manager.getTemplates()

// 获取登录模板
const loginTemplates = manager.getTemplates('login')

// 获取桌面端模板
const desktopTemplates = manager.getTemplates(undefined, 'desktop')

// 获取移动端登录模板
const mobileLoginTemplates = manager.getTemplates('login', 'mobile')
```

### `hasTemplate(category, device, template)`

检查模板是否存在。

**参数:**
- `category`: `string` - 模板分类
- `device`: `DeviceType` - 设备类型
- `template`: `string` - 模板名称

**返回值:** `boolean`

**示例:**
```typescript
const exists = manager.hasTemplate('login', 'desktop', 'classic')
if (exists) {
  console.log('模板存在！')
}
else {
  console.log('模板不存在')
}
```

### `findTemplate(category, device, template)`

查找特定模板。

**参数:**
- `category`: `string` - 模板分类
- `device`: `DeviceType` - 设备类型
- `template`: `string` - 模板名称

**返回值:** `TemplateMetadata | null`

**示例:**
```typescript
const template = manager.findTemplate('login', 'desktop', 'classic')
if (template) {
  console.log('找到模板:', template.name)
  console.log('模板描述:', template.description)
}
else {
  console.log('模板未找到')
}
```

### `getCurrentTemplate()`

获取当前活动的模板。

**返回值:** `TemplateMetadata | null`

**示例:**
```typescript
const current = manager.getCurrentTemplate()
if (current) {
  console.log('当前模板:', current.name)
}
else {
  console.log('没有活动模板')
}
```

### `getCurrentDevice()`

获取当前设备类型。

**返回值:** `DeviceType`

**示例:**
```typescript
const device = manager.getCurrentDevice()
console.log('当前设备:', device) // 'desktop' | 'mobile' | 'tablet'
```

## 🗂️ 分类和设备

### `getAvailableCategories()`

获取可用的模板分类。

**返回值:** `string[]`

**示例:**
```typescript
const categories = manager.getAvailableCategories()
console.log('可用分类:', categories) // ['login', 'dashboard', 'profile']
```

### `getAvailableDevices(category?)`

获取可用的设备类型。

**参数:**
- `category` (可选): `string` - 按分类过滤

**返回值:** `DeviceType[]`

**示例:**
```typescript
// 获取所有设备类型
const allDevices = manager.getAvailableDevices()

// 获取登录模板支持的设备类型
const loginDevices = manager.getAvailableDevices('login')
```

## 💾 缓存管理

### `clearCache()`

清空所有缓存。

**示例:**
```typescript
manager.clearCache()
console.log('缓存已清空')
```

### `getCacheStats()`

获取缓存统计信息。

**返回值:**
```typescript
interface CacheStats {
  components: number // 组件缓存数量
  metadata: number // 元数据缓存数量
  unified: number // 统一缓存数量
}
```

**示例:**
```typescript
const stats = manager.getCacheStats()
console.log('缓存统计:', stats)
```

## ⚙️ 配置管理

### `getConfig()`

获取当前配置。

**返回值:** `TemplateManagerConfig`

**示例:**
```typescript
const config = manager.getConfig()
console.log('当前配置:', config)
```

### `updateConfig(newConfig)`

更新配置。

**参数:**
- `newConfig`: `Partial<TemplateManagerConfig>` - 新配置

**示例:**
```typescript
// 启用调试模式
manager.updateConfig({ debug: true })

// 切换默认设备
manager.updateConfig({ defaultDevice: 'mobile' })
```

## 🔄 刷新和销毁

### `refresh()`

刷新模板管理器。

**返回值:** `Promise<void>`

**示例:**
```typescript
await manager.refresh()
console.log('模板管理器已刷新')
```

### `destroy()`

销毁模板管理器，清理资源。

**示例:**
```typescript
manager.destroy()
console.log('模板管理器已销毁')
```

## 🎭 事件系统

模板管理器支持事件监听：

### `on(event, listener)`

监听事件。

**示例:**
```typescript
// 监听模板扫描开始
manager.on('template:scan:start', () => {
  console.log('🔍 开始扫描模板...')
})

// 监听模板扫描完成
manager.on('template:scan:complete', (result) => {
  console.log(`✅ 扫描完成，发现 ${result.count} 个模板`)
})

// 监听模板切换
manager.on('template:switch:complete', (data) => {
  console.log('🎭 模板切换完成:', data.template.name)
})

// 监听错误
manager.on('error', (error) => {
  console.error('❌ 发生错误:', error.message)
})
```

### `once(event, listener)`

监听事件一次。

**示例:**
```typescript
manager.once('template:scan:complete', (result) => {
  console.log('首次扫描完成')
})
```

### `off(event, listener)`

取消监听。

**示例:**
```typescript
const listener = () => console.log('模板已切换')
manager.on('template:switch:complete', listener)

// 稍后取消监听
manager.off('template:switch:complete', listener)
```

## 🎯 最佳实践

1. **启用缓存**: 在生产环境中启用缓存以提升性能
2. **自动设备检测**: 启用自动设备检测以提供最佳用户体验
3. **错误处理**: 设置错误处理回调以优雅处理异常
4. **资源清理**: 在组件销毁时调用 `destroy()` 方法

```typescript
const manager = new TemplateManager({
  enableCache: true,
  autoDetectDevice: true,
  onError: (error) => {
    // 发送错误到监控系统
    console.error('Template error:', error)
  }
})

// 在组件销毁时清理
onUnmounted(() => {
  manager.destroy()
})
```
