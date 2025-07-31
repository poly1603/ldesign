# 工具函数 API

LDesign Template 提供了一系列工具函数，用于设备检测、缓存管理等功能。

## 设备检测

### `detectDevice()`

检测当前设备类型。

**返回值:** `DeviceType`

**示例:**
```typescript
import { detectDevice } from '@ldesign/template'

const currentDevice = detectDevice()
console.log('当前设备:', currentDevice) // 'desktop' | 'tablet' | 'mobile'
```

### `detectDeviceByViewport(width?, height?)`

根据视口尺寸检测设备类型。

**参数:**
- `width` (可选): `number` - 视口宽度，默认为 `window.innerWidth`
- `height` (可选): `number` - 视口高度，默认为 `window.innerHeight`

**返回值:** `DeviceType`

**示例:**
```typescript
import { detectDeviceByViewport } from '@ldesign/template'

// 使用当前视口尺寸
const device1 = detectDeviceByViewport()

// 使用指定尺寸
const device2 = detectDeviceByViewport(768, 1024)
console.log('768x1024 设备类型:', device2) // 'tablet'
```

### `detectDeviceByUserAgent(userAgent?)`

根据 User Agent 检测设备类型。

**参数:**
- `userAgent` (可选): `string` - User Agent 字符串，默认为 `navigator.userAgent`

**返回值:** `DeviceType`

**示例:**
```typescript
import { detectDeviceByUserAgent } from '@ldesign/template'

// 使用当前 User Agent
const device1 = detectDeviceByUserAgent()

// 使用指定 User Agent
const device2 = detectDeviceByUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
console.log('iPhone 设备类型:', device2) // 'mobile'
```

### `createDeviceWatcher(callback, options?)`

创建设备变化监听器。

**参数:**
- `callback`: `(newDevice: DeviceType, oldDevice: DeviceType) => void` - 设备变化回调
- `options` (可选): `DeviceWatcherOptions` - 监听选项

**返回值:** `() => void` - 清理函数

**示例:**
```typescript
import { createDeviceWatcher } from '@ldesign/template'

const cleanup = createDeviceWatcher((newDevice, oldDevice) => {
  console.log(`设备从 ${oldDevice} 切换到 ${newDevice}`)
  
  // 可以在这里触发模板重新加载
  templateManager.setDevice(newDevice)
})

// 在组件卸载时清理
onUnmounted(() => {
  cleanup()
})
```

#### `DeviceWatcherOptions`

```typescript
interface DeviceWatcherOptions {
  debounce?: number // 防抖延迟，默认 300ms
  immediate?: boolean // 是否立即执行回调，默认 false
  breakpoints?: DeviceBreakpoints // 自定义断点
}

interface DeviceBreakpoints {
  mobile: number // 移动端最大宽度，默认 767
  tablet: number // 平板端最大宽度，默认 1023
}
```

**高级示例:**
```typescript
const cleanup = createDeviceWatcher(
  (newDevice, oldDevice) => {
    console.log('设备变化:', { newDevice, oldDevice })
  },
  {
    debounce: 500,
    immediate: true,
    breakpoints: {
      mobile: 600,
      tablet: 900
    }
  }
)
```

## 缓存管理

### `TemplateCache`

模板缓存类，提供 LRU 缓存功能。

**构造函数:**
```typescript
new TemplateCache(maxSize?: number, ttl?: number)
```

**参数:**
- `maxSize` (可选): `number` - 最大缓存数量，默认 50
- `ttl` (可选): `number` - 缓存过期时间（毫秒），默认无过期

**示例:**
```typescript
import { TemplateCache } from '@ldesign/template'

// 创建缓存实例
const cache = new TemplateCache(100, 10 * 60 * 1000) // 100个项目，10分钟过期

// 设置缓存
cache.setComponent('auth', 'desktop', 'login', LoginComponent)

// 获取缓存
const component = cache.getComponent('auth', 'desktop', 'login')

// 检查是否存在
const exists = cache.hasComponent('auth', 'desktop', 'login')

// 清空缓存
cache.clear()

// 获取统计信息
const stats = cache.getStats()
console.log('缓存统计:', stats)
```

#### 方法

##### `setComponent(category, device, template, component)`
设置组件缓存。

##### `getComponent(category, device, template)`
获取组件缓存。

##### `hasComponent(category, device, template)`
检查组件是否存在于缓存中。

##### `removeComponent(category, device, template)`
移除指定组件缓存。

##### `clear()`
清空所有缓存。

##### `getStats()`
获取缓存统计信息。

**返回值:**
```typescript
interface CacheStats {
  hits: number
  misses: number
  size: number
  maxSize: number
}
```

### `LRUCache`

通用 LRU 缓存类。

**构造函数:**
```typescript
new LRUCache<K, V>(maxSize?: number, ttl?: number)
```

**示例:**
```typescript
import { LRUCache } from '@ldesign/template'

// 创建 LRU 缓存
const cache = new LRUCache<string, any>(50)

// 设置值
cache.set('key1', { data: 'value1' })

// 获取值
const value = cache.get('key1')

// 检查是否存在
const exists = cache.has('key1')

// 删除
cache.delete('key1')

// 清空
cache.clear()

// 获取统计
const stats = cache.getStats()
```

## 类型工具

### `isDeviceType(value)`

检查值是否为有效的设备类型。

**参数:**
- `value`: `any` - 要检查的值

**返回值:** `boolean`

**示例:**
```typescript
import { isDeviceType } from '@ldesign/template'

console.log(isDeviceType('desktop')) // true
console.log(isDeviceType('mobile')) // true
console.log(isDeviceType('invalid')) // false
```

### `normalizeDeviceType(value)`

标准化设备类型值。

**参数:**
- `value`: `string` - 设备类型字符串

**返回值:** `DeviceType | null`

**示例:**
```typescript
import { normalizeDeviceType } from '@ldesign/template'

console.log(normalizeDeviceType('DESKTOP')) // 'desktop'
console.log(normalizeDeviceType('Mobile')) // 'mobile'
console.log(normalizeDeviceType('invalid')) // null
```

## 路径工具

### `parseTemplatePath(path)`

解析模板路径。

**参数:**
- `path`: `string` - 模板路径，格式为 `category/device/template` 或 `category/template`

**返回值:** `TemplatePathInfo | null`

**示例:**
```typescript
import { parseTemplatePath } from '@ldesign/template'

const info1 = parseTemplatePath('auth/desktop/login')
console.log(info1) // { category: 'auth', device: 'desktop', template: 'login' }

const info2 = parseTemplatePath('auth/login')
console.log(info2) // { category: 'auth', device: null, template: 'login' }

const info3 = parseTemplatePath('invalid')
console.log(info3) // null
```

### `buildTemplatePath(category, device, template)`

构建模板路径。

**参数:**
- `category`: `string` - 模板分类
- `device`: `DeviceType | null` - 设备类型
- `template`: `string` - 模板名称

**返回值:** `string`

**示例:**
```typescript
import { buildTemplatePath } from '@ldesign/template'

const path1 = buildTemplatePath('auth', 'desktop', 'login')
console.log(path1) // 'auth/desktop/login'

const path2 = buildTemplatePath('auth', null, 'login')
console.log(path2) // 'auth/login'
```

## 验证工具

### `validateTemplateConfig(config)`

验证模板配置。

**参数:**
- `config`: `TemplateConfig` - 模板配置对象

**返回值:** `ValidationResult`

**示例:**
```typescript
import { validateTemplateConfig } from '@ldesign/template'

const config = {
  name: 'login',
  title: '登录页',
  category: 'auth',
  device: 'desktop',
  version: '1.0.0'
}

const result = validateTemplateConfig(config)
if (result.valid) {
  console.log('配置有效')
}
else {
  console.error('配置错误:', result.errors)
}
```

#### `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}
```

### `validateTemplateProps(props, schema)`

验证模板属性。

**参数:**
- `props`: `Record<string, any>` - 属性对象
- `schema`: `PropSchema` - 属性模式

**返回值:** `ValidationResult`

**示例:**
```typescript
import { validateTemplateProps } from '@ldesign/template'

const props = {
  title: 'Hello',
  count: 42
}

const schema = {
  title: { type: 'string', required: true },
  count: { type: 'number', required: false }
}

const result = validateTemplateProps(props, schema)
```

## 调试工具

### `enableDebugMode(enabled?)`

启用或禁用调试模式。

**参数:**
- `enabled` (可选): `boolean` - 是否启用，默认 `true`

**示例:**
```typescript
import { enableDebugMode } from '@ldesign/template'

// 启用调试模式
enableDebugMode(true)

// 禁用调试模式
enableDebugMode(false)
```

### `getDebugInfo()`

获取调试信息。

**返回值:** `DebugInfo`

**示例:**
```typescript
import { getDebugInfo } from '@ldesign/template'

const debugInfo = getDebugInfo()
console.log('调试信息:', debugInfo)
```

#### `DebugInfo`

```typescript
interface DebugInfo {
  version: string
  templateCount: number
  cacheStats: CacheStats
  currentDevice: DeviceType
  registeredCategories: string[]
}
```

## 完整示例

```typescript
import {
  TemplateCache,
  createDeviceWatcher,
  detectDevice,
  enableDebugMode,
  parseTemplatePath,
  validateTemplateConfig
} from '@ldesign/template'

// 启用调试模式
enableDebugMode(process.env.NODE_ENV === 'development')

// 检测当前设备
const currentDevice = detectDevice()
console.log('当前设备:', currentDevice)

// 创建设备监听器
const deviceCleanup = createDeviceWatcher((newDevice, oldDevice) => {
  console.log(`设备从 ${oldDevice} 切换到 ${newDevice}`)
})

// 创建缓存实例
const cache = new TemplateCache(100, 10 * 60 * 1000)

// 解析模板路径
const pathInfo = parseTemplatePath('auth/desktop/login')
if (pathInfo) {
  console.log('解析结果:', pathInfo)
}

// 验证配置
const config = {
  name: 'login',
  title: '登录页',
  category: 'auth',
  device: 'desktop',
  version: '1.0.0'
}

const validation = validateTemplateConfig(config)
if (!validation.valid) {
  console.error('配置错误:', validation.errors)
}

// 清理资源
onUnmounted(() => {
  deviceCleanup()
})
```

## 最佳实践

1. **设备检测**: 优先使用视口检测，User Agent 作为备用
2. **缓存管理**: 根据应用需求合理设置缓存大小和过期时间
3. **资源清理**: 及时清理设备监听器等资源
4. **错误处理**: 使用验证工具确保数据有效性
5. **调试支持**: 在开发环境启用调试模式
