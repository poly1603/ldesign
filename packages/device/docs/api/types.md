# 类型定义

本文档包含 `@ldesign/device` 包中所有公共类型定义。

## 基础类型

### `DeviceType`

设备类型枚举。

```typescript
type DeviceType = 'desktop' | 'tablet' | 'mobile'
```

- `'desktop'`: 桌面设备
- `'tablet'`: 平板设备
- `'mobile'`: 移动设备

### `Orientation`

屏幕方向枚举。

```typescript
type Orientation = 'portrait' | 'landscape'
```

- `'portrait'`: 竖屏（纵向）
- `'landscape'`: 横屏（横向）

### `NetworkType`

网络连接类型。

```typescript
type NetworkType =
  | 'wifi'        // WiFi连接
  | 'cellular'    // 蜂窝网络（2G/3G/4G/5G）
  | 'ethernet'    // 以太网
  | 'bluetooth'   // 蓝牙
  | 'unknown'     // 未知
```

### `NetworkStatus`

网络连接状态。

```typescript
type NetworkStatus = 'online' | 'offline'
```

- `'online'`: 在线
- `'offline'`: 离线

### `OrientationLockType`

屏幕方向锁定类型。

```typescript
type OrientationLockType =
  | 'any'                  // 任意方向
  | 'natural'              // 自然方向
  | 'landscape'            // 横屏
  | 'portrait'             // 竖屏
  | 'portrait-primary'     // 竖屏主方向
  | 'portrait-secondary'   // 竖屏副方向
  | 'landscape-primary'    // 横屏主方向
  | 'landscape-secondary'  // 横屏副方向
```

### `EventListener`

事件监听器类型。

```typescript
type EventListener<T = unknown> = (data: T) => void
```

## 配置选项

### `DeviceDetectorOptions`

设备检测器配置选项。

```typescript
interface DeviceDetectorOptions {
  /** 是否启用窗口缩放监听 */
  enableResize?: boolean

  /** 是否启用设备方向监听 */
  enableOrientation?: boolean

  /** 自定义断点配置 */
  breakpoints?: {
    mobile: number   // 移动设备断点（默认768px）
    tablet: number   // 平板设备断点（默认1024px）
  }

  /** 防抖延迟时间（毫秒） */
  debounceDelay?: number

  /** 要加载的模块列表 */
  modules?: string[]
}
```

**示例**:

```typescript
const options: DeviceDetectorOptions = {
  enableResize: true,
  enableOrientation: true,
  breakpoints: {
    mobile: 768,
    tablet: 1024
  },
  debounceDelay: 200,
  modules: ['network', 'battery', 'geolocation']
}
```

## 设备信息

### `DeviceInfo`

设备信息接口。

```typescript
interface DeviceInfo {
  /** 设备类型 */
  type: DeviceType

  /** 屏幕方向 */
  orientation: Orientation

  /** 屏幕宽度 */
  width: number

  /** 屏幕高度 */
  height: number

  /** 设备像素比 */
  pixelRatio: number

  /** 是否为触摸设备 */
  isTouchDevice: boolean

  /** 用户代理字符串 */
  userAgent: string

  /** 操作系统信息 */
  os: {
    name: string       // 操作系统名称
    version: string    // 版本号
    platform?: string  // 平台
  }

  /** 浏览器信息 */
  browser: {
    name: string       // 浏览器名称
    version: string    // 版本号
    engine?: string    // 渲染引擎
  }

  /** 屏幕信息 */
  screen: {
    width: number         // 屏幕宽度
    height: number        // 屏幕高度
    pixelRatio: number    // 像素比
    availWidth: number    // 可用宽度
    availHeight: number   // 可用高度
  }

  /** 设备特性 */
  features: {
    touch: boolean           // 是否支持触摸
    webgl?: boolean          // 是否支持WebGL
    camera?: boolean         // 是否有摄像头
    microphone?: boolean     // 是否有麦克风
    bluetooth?: boolean      // 是否支持蓝牙
  }
}
```

**示例**:

```typescript
const deviceInfo: DeviceInfo = {
  type: 'mobile',
  orientation: 'portrait',
  width: 375,
  height: 812,
  pixelRatio: 3,
  isTouchDevice: true,
  userAgent: 'Mozilla/5.0...',
  os: {
    name: 'iOS',
    version: '15.0',
    platform: 'iPhone'
  },
  browser: {
    name: 'Safari',
    version: '15.0',
    engine: 'WebKit'
  },
  screen: {
    width: 375,
    height: 812,
    pixelRatio: 3,
    availWidth: 375,
    availHeight: 812
  },
  features: {
    touch: true,
    webgl: true,
    camera: true,
    microphone: true
  }
}
```

## 网络信息

### `NetworkInfo`

网络信息接口。

```typescript
interface NetworkInfo {
  /** 网络状态 */
  status: NetworkStatus

  /** 连接类型 */
  type: NetworkType

  /** 下载速度（Mbps） */
  downlink?: number

  /** 往返时间（毫秒） */
  rtt?: number

  /** 是否为计量连接 */
  saveData?: boolean

  /** 是否在线（兼容性属性） */
  online?: boolean

  /** 有效连接类型（兼容性属性） */
  effectiveType?: string

  /** 是否支持网络连接API */
  supported?: boolean
}
```

**示例**:

```typescript
const networkInfo: NetworkInfo = {
  status: 'online',
  type: 'wifi',
  downlink: 10,
  rtt: 50,
  saveData: false,
  online: true,
  effectiveType: '4g',
  supported: true
}
```

## 电池信息

### `BatteryInfo`

电池信息接口。

```typescript
interface BatteryInfo {
  /** 电池电量（0-1） */
  level: number

  /** 是否正在充电 */
  charging: boolean

  /** 充电时间（秒），如果未知则为 Infinity */
  chargingTime: number

  /** 放电时间（秒），如果未知则为 Infinity */
  dischargingTime: number
}
```

**示例**:

```typescript
const batteryInfo: BatteryInfo = {
  level: 0.75,              // 75%
  charging: false,
  chargingTime: Infinity,
  dischargingTime: 7200     // 2小时
}
```

## 地理位置信息

### `GeolocationInfo`

地理位置信息接口。

```typescript
interface GeolocationInfo {
  /** 纬度 */
  latitude: number

  /** 经度 */
  longitude: number

  /** 精度（米） */
  accuracy: number

  /** 海拔（米），如果不可用则为 null */
  altitude: number | null

  /** 海拔精度（米），如果不可用则为 null */
  altitudeAccuracy: number | null

  /** 方向（度，0-360），如果不可用则为 null */
  heading: number | null

  /** 速度（米/秒），如果不可用则为 null */
  speed: number | null

  /** 时间戳（毫秒） */
  timestamp?: number
}
```

**示例**:

```typescript
const geolocationInfo: GeolocationInfo = {
  latitude: 39.9042,
  longitude: 116.4074,
  accuracy: 20,
  altitude: 50,
  altitudeAccuracy: 10,
  heading: 90,
  speed: 1.5,
  timestamp: 1634567890000
}
```

## 事件类型

### `DeviceDetectorEvents`

设备检测器事件映射。

```typescript
interface DeviceDetectorEvents extends Record<string, unknown> {
  /** 设备信息变化 */
  deviceChange: DeviceInfo

  /** 屏幕方向变化 */
  orientationChange: Orientation

  /** 窗口大小变化 */
  resize: { width: number; height: number }

  /** 网络状态变化 */
  networkChange: NetworkInfo

  /** 电池状态变化 */
  batteryChange: BatteryInfo

  /** 地理位置变化 */
  positionChange: GeolocationInfo

  /** 检测错误事件 */
  error: {
    message: string
    count: number
    lastError: unknown
  }
}
```

**使用示例**:

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector()

// 监听设备变化
detector.on('deviceChange', (info: DeviceInfo) => {
  console.log('设备类型:', info.type)
})

// 监听方向变化
detector.on('orientationChange', (orientation: Orientation) => {
  console.log('屏幕方向:', orientation)
})

// 监听网络变化
detector.on('networkChange', (info: NetworkInfo) => {
  console.log('网络状态:', info.status)
})

// 监听电池变化
detector.on('batteryChange', (info: BatteryInfo) => {
  console.log('电池电量:', info.level)
})

// 监听位置变化
detector.on('positionChange', (info: GeolocationInfo) => {
  console.log('位置:', info.latitude, info.longitude)
})
```

## 模块接口

### `DeviceModule`

设备模块基础接口。

```typescript
interface DeviceModule {
  /** 模块名称 */
  name: string

  /** 初始化模块 */
  init: () => Promise<void> | void

  /** 销毁模块 */
  destroy: () => Promise<void> | void

  /** 获取模块数据 */
  getData: () => unknown
}
```

### `NetworkModule`

网络模块接口。

```typescript
interface NetworkModule extends DeviceModule {
  /** 获取网络信息 */
  getData: () => NetworkInfo

  /** 检查是否在线 */
  isOnline: () => boolean

  /** 获取连接类型 */
  getConnectionType: () => string
}
```

### `BatteryModule`

电池模块接口。

```typescript
interface BatteryModule extends DeviceModule {
  /** 获取电池信息 */
  getData: () => BatteryInfo

  /** 获取电池电量（0-1） */
  getLevel: () => number

  /** 检查是否正在充电 */
  isCharging: () => boolean

  /** 获取电池状态 */
  getBatteryStatus: () => string
}
```

### `GeolocationModule`

地理位置模块接口。

```typescript
interface GeolocationModule extends DeviceModule {
  /** 获取地理位置信息 */
  getData: () => GeolocationInfo | null

  /** 检查是否支持地理位置API */
  isSupported: () => boolean

  /** 获取当前位置 */
  getCurrentPosition: (options?: PositionOptions) => Promise<GeolocationInfo>

  /** 开始监听位置变化 */
  startWatching: (callback?: (position: GeolocationInfo) => void) => void

  /** 停止监听位置变化 */
  stopWatching: () => void
}
```

### `ModuleLoader`

模块加载器接口。

```typescript
interface ModuleLoader {
  /** 加载模块 */
  load: <T = unknown>(name: string) => Promise<T>

  /** 卸载模块 */
  unload: (name: string) => Promise<void>

  /** 检查模块是否已加载 */
  isLoaded: (name: string) => boolean

  /** 获取已加载的模块名称 */
  getLoadedModules?: () => string[]
}
```

## Vue 集成类型

### `UseDeviceReturn`

Vue3 composable 返回类型。

```typescript
interface UseDeviceReturn {
  /** 设备类型 */
  deviceType: Readonly<Ref<DeviceType>>

  /** 屏幕方向 */
  orientation: Readonly<Ref<Orientation>>

  /** 设备信息 */
  deviceInfo: Readonly<Ref<DeviceInfo>>

  /** 是否为移动设备 */
  isMobile: Readonly<Ref<boolean>>

  /** 是否为平板设备 */
  isTablet: Readonly<Ref<boolean>>

  /** 是否为桌面设备 */
  isDesktop: Readonly<Ref<boolean>>

  /** 是否为触摸设备 */
  isTouchDevice: Readonly<Ref<boolean>>

  /** 刷新设备信息 */
  refresh: () => void
}
```

**使用示例**:

```typescript
import { useDevice } from '@ldesign/device'

const {
  deviceType,
  orientation,
  deviceInfo,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  refresh
} = useDevice()

console.log('设备类型:', deviceType.value)
console.log('是否为移动设备:', isMobile.value)
```

### `DeviceDirectiveValue`

Vue3 指令绑定值类型。

```typescript
type DeviceDirectiveValue =
  | DeviceType
  | DeviceType[]
  | {
      type: DeviceType | DeviceType[]
      inverse?: boolean
    }
```

**使用示例**:

```vue
<template>
  <!-- 仅在移动设备显示 -->
  <div v-device="'mobile'">移动端内容</div>

  <!-- 在移动设备和平板显示 -->
  <div v-device="['mobile', 'tablet']">移动端和平板内容</div>

  <!-- 反向匹配：仅在非移动设备显示 -->
  <div v-device="{ type: 'mobile', inverse: true }">桌面端内容</div>
</template>
```

### `DevicePluginOptions`

Vue3 插件选项。

```typescript
interface DevicePluginOptions extends DeviceDetectorOptions {
  /** 全局属性名称，默认 '$device' */
  globalPropertyName?: string
}
```

**使用示例**:

```typescript
import { createApp } from 'vue'
import { DevicePlugin } from '@ldesign/device'
import App from './App.vue'

const app = createApp(App)

app.use(DevicePlugin, {
  globalPropertyName: '$device',
  enableResize: true,
  enableOrientation: true,
  modules: ['network', 'battery']
})

app.mount('#app')
```

## 浏览器全局扩展

### Navigator 扩展

```typescript
declare global {
  interface Navigator {
    getBattery?: () => Promise<{
      level: number
      charging: boolean
      chargingTime: number
      dischargingTime: number
      addEventListener: (type: string, listener: EventListener) => void
      removeEventListener: (type: string, listener: EventListener) => void
    }>
  }
}
```

### Vue 组件属性扩展

```typescript
declare module 'vue' {
  interface ComponentCustomProperties {
    $device: DeviceDetector
  }
}
```

## 类型导入

### 导入所有类型

```typescript
import type {
  // 基础类型
  DeviceType,
  Orientation,
  NetworkType,
  NetworkStatus,
  OrientationLockType,
  EventListener,

  // 配置选项
  DeviceDetectorOptions,

  // 信息接口
  DeviceInfo,
  NetworkInfo,
  BatteryInfo,
  GeolocationInfo,

  // 事件类型
  DeviceDetectorEvents,

  // 模块接口
  DeviceModule,
  NetworkModule,
  BatteryModule,
  GeolocationModule,
  ModuleLoader,

  // Vue 集成
  UseDeviceReturn,
  DeviceDirectiveValue,
  DevicePluginOptions,

  // Vue Ref
  Ref
} from '@ldesign/device'
```

### 按需导入

```typescript
import type { DeviceInfo, NetworkInfo } from '@ldesign/device'

function handleDevice(info: DeviceInfo) {
  console.log(info.type)
}

function handleNetwork(info: NetworkInfo) {
  console.log(info.status)
}
```

## TypeScript 配置建议

为了更好地使用类型定义，建议在 `tsconfig.json` 中配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["@ldesign/device"]
  }
}
```

## 类型守卫

### 设备类型守卫

```typescript
import type { DeviceType, DeviceInfo } from '@ldesign/device'

function isMobileDevice(device: DeviceInfo): device is DeviceInfo & { type: 'mobile' } {
  return device.type === 'mobile'
}

function isTabletDevice(device: DeviceInfo): device is DeviceInfo & { type: 'tablet' } {
  return device.type === 'tablet'
}

function isDesktopDevice(device: DeviceInfo): device is DeviceInfo & { type: 'desktop' } {
  return device.type === 'desktop'
}

// 使用
const info: DeviceInfo = detector.getDeviceInfo()

if (isMobileDevice(info)) {
  // TypeScript 知道这里 info.type === 'mobile'
  console.log('移动设备')
}
```

### 网络状态守卫

```typescript
import type { NetworkInfo, NetworkStatus } from '@ldesign/device'

function isOnline(network: NetworkInfo): network is NetworkInfo & { status: 'online' } {
  return network.status === 'online'
}

function isOffline(network: NetworkInfo): network is NetworkInfo & { status: 'offline' } {
  return network.status === 'offline'
}

// 使用
const network: NetworkInfo = networkModule.getData()

if (isOnline(network)) {
  // TypeScript 知道这里 network.status === 'online'
  console.log('在线')
}
```
