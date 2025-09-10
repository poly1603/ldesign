# @ldesign/device API 文档

## 目录

- [核心模块](#核心模块)
  - [DeviceDetector](#devicedetector)
  - [EventEmitter](#eventemitter)
  - [ModuleLoader](#moduleloader)
- [功能模块](#功能模块)
  - [MediaModule](#mediamodule)
  - [BatteryModule](#batterymodule)
  - [NetworkModule](#networkmodule)
  - [GeolocationModule](#geolocationmodule)
- [性能优化工具](#性能优化工具)
  - [debounce](#debounce)
  - [throttle](#throttle)
  - [MemoryCache](#memorycache)
  - [memoize](#memoize)
  - [LazyLoader](#lazyloader)
  - [BatchExecutor](#batchexecutor)
- [Vue 集成](#vue-集成)
  - [useDevice](#usedevice)
  - [useMedia](#usemedia)
  - [指令](#指令)

## 核心模块

### DeviceDetector

设备检测器核心类，提供设备信息检测和事件监听功能。

#### 构造函数

```typescript
new DeviceDetector(options?: DeviceDetectorOptions)
```

**参数：**
- `options` - 可选配置对象
  - `enableResize` (boolean) - 是否启用窗口大小变化监听，默认 `true`
  - `enableOrientation` (boolean) - 是否启用方向变化监听，默认 `true`
  - `breakpoints` (object) - 断点配置
    - `mobile` (number) - 移动设备断点，默认 768
    - `tablet` (number) - 平板设备断点，默认 1024
  - `debounceDelay` (number) - 防抖延迟，默认 100ms
  - `modules` (string[]) - 要加载的模块列表

#### 方法

##### getDeviceInfo()
获取完整的设备信息。

```typescript
getDeviceInfo(): DeviceInfo
```

**返回值：**
```typescript
interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile'
  orientation: 'portrait' | 'landscape'
  width: number
  height: number
  pixelRatio: number
  isTouchDevice: boolean
  userAgent: string
  os: {
    name: string
    version: string
    platform?: string
  }
  browser: {
    name: string
    version: string
    engine?: string
  }
  screen: {
    width: number
    height: number
    pixelRatio: number
    availWidth: number
    availHeight: number
  }
  features: {
    touch: boolean
    webgl?: boolean
    camera?: boolean
    microphone?: boolean
    bluetooth?: boolean
  }
}
```

##### loadModule(name)
动态加载功能模块。

```typescript
async loadModule<T extends DeviceModule>(name: string): Promise<T>
```

##### on(event, listener)
添加事件监听器。

```typescript
on(event: string, listener: EventListener): void
```

**事件类型：**
- `deviceChange` - 设备信息变化
- `orientationChange` - 方向变化
- `resize` - 窗口大小变化

## 功能模块

### MediaModule

媒体设备检测模块，提供摄像头、麦克风等设备的检测和权限管理。

#### 方法

##### init()
初始化模块。

```typescript
async init(): Promise<void>
```

##### getData()
获取媒体设备信息。

```typescript
getData(): MediaDeviceInfo
```

**返回值：**
```typescript
interface MediaDeviceInfo {
  supported: boolean
  hasCamera: boolean
  hasMicrophone: boolean
  hasSpeaker: boolean
  cameras: MediaDeviceItem[]
  microphones: MediaDeviceItem[]
  speakers: MediaDeviceItem[]
  cameraPermission: PermissionState | 'unknown'
  microphonePermission: PermissionState | 'unknown'
}
```

##### requestCameraPermission()
请求摄像头权限。

```typescript
async requestCameraPermission(): Promise<boolean>
```

##### requestMicrophonePermission()
请求麦克风权限。

```typescript
async requestMicrophonePermission(): Promise<boolean>
```

##### testCamera(constraints?)
测试摄像头是否可用。

```typescript
async testCamera(constraints?: MediaTrackConstraints): Promise<boolean>
```

##### testMicrophone(constraints?)
测试麦克风是否可用。

```typescript
async testMicrophone(constraints?: MediaTrackConstraints): Promise<boolean>
```

##### getMediaStream(constraints?)
获取媒体流。

```typescript
async getMediaStream(constraints?: MediaStreamConstraints): Promise<MediaStream | null>
```

##### getDisplayMedia(constraints?)
获取屏幕共享流。

```typescript
async getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream | null>
```

#### 事件

- `deviceChange` - 设备列表变化
- `permissionChange` - 权限状态变化

## 性能优化工具

### debounce

防抖函数，延迟执行直到停止触发一段时间后。

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void
```

**参数：**
- `func` - 要防抖的函数
- `wait` - 延迟时间（毫秒）
- `immediate` - 是否立即执行

**示例：**
```typescript
const debouncedResize = debounce(handleResize, 300)
window.addEventListener('resize', debouncedResize)

// 取消防抖
debouncedResize.cancel()
```

### throttle

节流函数，限制函数执行频率。

```typescript
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): (...args: Parameters<T>) => void
```

**参数：**
- `func` - 要节流的函数
- `wait` - 间隔时间（毫秒）
- `options` - 配置选项
  - `leading` - 是否在开始时执行
  - `trailing` - 是否在结束时执行

**示例：**
```typescript
const throttledScroll = throttle(handleScroll, 100)
window.addEventListener('scroll', throttledScroll)

// 取消节流
throttledScroll.cancel()
```

### MemoryCache

内存缓存类，支持 TTL 和 LRU 淘汰策略。

```typescript
class MemoryCache<T = any> {
  constructor(options?: {
    maxSize?: number
    defaultTTL?: number
  })
}
```

#### 方法

##### get(key)
获取缓存值。

```typescript
get(key: string): T | undefined
```

##### set(key, value, ttl?)
设置缓存值。

```typescript
set(key: string, value: T, ttl?: number): void
```

##### has(key)
检查是否存在缓存。

```typescript
has(key: string): boolean
```

##### delete(key)
删除缓存项。

```typescript
delete(key: string): boolean
```

##### clear()
清空所有缓存。

```typescript
clear(): void
```

##### prune()
清理过期缓存。

```typescript
prune(): void
```

**示例：**
```typescript
const cache = new MemoryCache({
  maxSize: 100,
  defaultTTL: 60000 // 1分钟
})

cache.set('user', userData, 30000) // 30秒过期
const user = cache.get('user')

if (cache.has('user')) {
  // 缓存存在
}

cache.delete('user')
cache.clear()
```

### memoize

函数记忆化，自动缓存函数执行结果。

```typescript
function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    maxSize?: number
    ttl?: number
    getKey?: (...args: Parameters<T>) => string
  }
): T
```

**示例：**
```typescript
const expensiveCalculation = (n: number) => {
  console.log('Calculating...')
  return n * n
}

const memoizedCalc = memoize(expensiveCalculation, {
  ttl: 5000 // 5秒缓存
})

memoizedCalc(5) // 输出: Calculating... 返回: 25
memoizedCalc(5) // 直接返回: 25（从缓存）
```

### LazyLoader

懒加载管理器，支持资源的按需加载和预加载。

```typescript
class LazyLoader<T = any> {
  register(name: string, loader: () => Promise<T>): void
  load(name: string): Promise<T>
  preload(names: string[]): Promise<void>
  isLoaded(name: string): boolean
  isLoading(name: string): boolean
  clear(name?: string): void
}
```

**示例：**
```typescript
const loader = new LazyLoader()

// 注册加载器
loader.register('heavyModule', async () => {
  const module = await import('./heavy-module.js')
  return module.default
})

// 按需加载
const module = await loader.load('heavyModule')

// 预加载多个资源
await loader.preload(['module1', 'module2', 'module3'])

// 检查状态
if (loader.isLoaded('heavyModule')) {
  // 模块已加载
}
```

### BatchExecutor

批处理执行器，将多个调用合并为批量执行。

```typescript
class BatchExecutor<T, R> {
  constructor(
    executor: (batch: T[]) => Promise<R[]> | R[],
    options?: {
      maxBatchSize?: number
      maxWaitTime?: number
    }
  )
  
  add(item: T): Promise<R>
  forceFlush(): Promise<void>
}
```

**示例：**
```typescript
// 创建批处理 API 调用
const batchApi = new BatchExecutor(
  async (ids: string[]) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
    return response.json()
  },
  {
    maxBatchSize: 10,
    maxWaitTime: 100
  }
)

// 多个调用会被合并
const user1 = await batchApi.add('user1')
const user2 = await batchApi.add('user2')
const user3 = await batchApi.add('user3')
// 这三个请求会被合并为一个批量请求
```

## Vue 集成

### useDevice

Vue 3 Composition API，提供响应式的设备信息。

```typescript
function useDevice(options?: DeviceDetectorOptions): UseDeviceReturn
```

**返回值：**
```typescript
interface UseDeviceReturn {
  deviceType: Readonly<Ref<DeviceType>>
  orientation: Readonly<Ref<Orientation>>
  deviceInfo: Readonly<Ref<DeviceInfo>>
  isMobile: Readonly<Ref<boolean>>
  isTablet: Readonly<Ref<boolean>>
  isDesktop: Readonly<Ref<boolean>>
  isTouchDevice: Readonly<Ref<boolean>>
  refresh: () => void
}
```

**示例：**
```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

const {
  deviceType,
  orientation,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  refresh
} = useDevice()
</script>

<template>
  <div>
    <p>设备类型: {{ deviceType }}</p>
    <p>屏幕方向: {{ orientation }}</p>
    <div v-if="isMobile">移动端布局</div>
    <div v-else-if="isTablet">平板布局</div>
    <div v-else>桌面布局</div>
    <button @click="refresh">刷新</button>
  </div>
</template>
```

### useMedia

Vue 3 Composition API，提供媒体设备管理功能。

```typescript
function useMedia(): UseMediaReturn
```

**返回值：**
```typescript
interface UseMediaReturn {
  mediaInfo: Readonly<Ref<MediaDeviceInfo>>
  hasCamera: Readonly<Ref<boolean>>
  hasMicrophone: Readonly<Ref<boolean>>
  requestCameraPermission: () => Promise<boolean>
  requestMicrophonePermission: () => Promise<boolean>
  testCamera: () => Promise<boolean>
  testMicrophone: () => Promise<boolean>
}
```

### 指令

#### v-device

根据设备类型显示/隐藏元素。

```vue
<template>
  <!-- 仅在移动设备上显示 -->
  <div v-device="'mobile'">移动端内容</div>
  
  <!-- 在移动和平板设备上显示 -->
  <div v-device="['mobile', 'tablet']">响应式内容</div>
  
  <!-- 反向匹配：在非移动设备上显示 -->
  <div v-device="{ type: 'mobile', inverse: true }">桌面端内容</div>
</template>
```

#### v-orientation

根据屏幕方向显示/隐藏元素。

```vue
<template>
  <!-- 仅在竖屏时显示 -->
  <div v-orientation="'portrait'">竖屏内容</div>
  
  <!-- 仅在横屏时显示 -->
  <div v-orientation="'landscape'">横屏内容</div>
</template>
```

## 性能最佳实践

### 1. 使用防抖和节流

对于频繁触发的事件（如 resize、scroll），使用防抖或节流来优化性能：

```typescript
import { debounce, throttle } from '@ldesign/device/utils/performance'

// 窗口大小调整使用防抖
const handleResize = debounce(() => {
  // 处理逻辑
}, 300)

// 滚动事件使用节流
const handleScroll = throttle(() => {
  // 处理逻辑
}, 100)
```

### 2. 合理使用缓存

对于计算密集型操作，使用 memoize 或 MemoryCache：

```typescript
import { memoize, MemoryCache } from '@ldesign/device/utils/performance'

// 缓存复杂计算结果
const calculate = memoize(complexCalculation, {
  ttl: 60000, // 1分钟缓存
  maxSize: 100
})

// 缓存 API 响应
const apiCache = new MemoryCache({
  defaultTTL: 300000 // 5分钟
})

async function fetchUserData(userId: string) {
  if (apiCache.has(userId)) {
    return apiCache.get(userId)
  }
  
  const data = await api.getUser(userId)
  apiCache.set(userId, data)
  return data
}
```

### 3. 模块懒加载

只在需要时加载模块，减少初始化时间：

```typescript
const detector = new DeviceDetector()

// 仅在需要时加载地理位置模块
if (userNeedsLocation) {
  const geoModule = await detector.loadModule('geolocation')
  const position = await geoModule.getCurrentPosition()
}
```

### 4. 批处理请求

将多个请求合并为批量请求，减少网络开销：

```typescript
import { BatchExecutor } from '@ldesign/device/utils/performance'

const batchFetcher = new BatchExecutor(
  async (items) => {
    // 批量处理
    return await processBatch(items)
  },
  {
    maxBatchSize: 20,
    maxWaitTime: 50
  }
)
```

## 浏览器兼容性

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 基础设备检测 | ✅ 60+ | ✅ 55+ | ✅ 12+ | ✅ 79+ |
| 媒体设备 API | ✅ 53+ | ✅ 36+ | ✅ 11+ | ✅ 79+ |
| 电池 API | ✅ 38+ | ✅ 43+ | ❌ | ✅ 79+ |
| 地理位置 API | ✅ 5+ | ✅ 3.5+ | ✅ 5+ | ✅ 12+ |
| WebGL | ✅ 9+ | ✅ 4+ | ✅ 5.1+ | ✅ 12+ |

## 更新日志

### v0.2.0 (2024-01)
- ✨ 新增 MediaModule 媒体设备检测
- ✨ 新增性能优化工具集
- ✨ 新增 WebGL 检测
- 🐛 修复类型定义问题
- 📝 完善 API 文档

### v0.1.0 (2023-12)
- 🎉 首次发布
- ✨ 基础设备检测功能
- ✨ Vue 3 集成支持
