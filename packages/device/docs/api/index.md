# API 参考总览

欢迎查阅 @ldesign/device 的 API 参考。本节提供核心类与工具的概览：

- DeviceDetector — 核心设备检测器
- EventEmitter — 事件系统基类
- ModuleLoader — 扩展模块加载器

更多详细内容请查看左侧侧边栏的对应页面。

## DeviceDetector

设备检测器是库的核心类，提供设备信息检测和事件监听功能。

### 构造函数

```typescript
new DeviceDetector(options?: DeviceDetectorOptions)
```

#### 参数

- `options` - 可选的配置选项

```typescript
interface DeviceDetectorOptions {
  /** 是否启用窗口大小变化监听 */
  enableResize?: boolean
  /** 是否启用屏幕方向变化监听 */
  enableOrientation?: boolean
  /** 防抖延迟时间（毫秒） */
  debounceDelay?: number
  /** 自定义断点配置 */
  breakpoints?: {
    mobile: number
    tablet: number
    desktop: number
  }
}
```

### 实例方法

#### getDeviceInfo()

获取当前设备信息。

```typescript
getDeviceInfo(): DeviceInfo
```

**返回值：**

```typescript
interface DeviceInfo {
  /** 设备类型 */
  type: 'mobile' | 'tablet' | 'desktop'
  /** 屏幕方向 */
  orientation: 'portrait' | 'landscape'
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
    name: string
    version: string
  }
  /** 浏览器信息 */
  browser: {
    name: string
    version: string
  }
}
```

#### isMobile()

检测是否为移动设备。

```typescript
isMobile(): boolean
```

#### isTablet()

检测是否为平板设备。

```typescript
isTablet(): boolean
```

#### isDesktop()

检测是否为桌面设备。

```typescript
isDesktop(): boolean
```

#### getOrientation()

获取当前屏幕方向。

```typescript
getOrientation(): 'portrait' | 'landscape'
```

#### refresh()

手动刷新设备信息。

```typescript
refresh(): void
```

#### loadModule()

加载扩展模块。

```typescript
loadModule<T = unknown>(name: string): Promise<T>
```

#### unloadModule()

卸载扩展模块。

```typescript
unloadModule(name: string): void
```

#### getLoadedModules()

获取已加载的模块列表。

```typescript
getLoadedModules(): string[]
```

#### destroy()

销毁检测器实例，清理所有资源。

```typescript
destroy(): Promise<void>
```

### 事件监听

DeviceDetector 继承自 EventEmitter，支持以下事件：

#### deviceChange

设备信息发生变化时触发。

```typescript
detector.on('deviceChange', (deviceInfo: DeviceInfo) => {
  console.log('设备信息变化:', deviceInfo)
})
```

#### orientationChange

屏幕方向发生变化时触发。

```typescript
detector.on('orientationChange', (orientation: 'portrait' | 'landscape') => {
  console.log('屏幕方向变化:', orientation)
})
```

#### resize

窗口大小发生变化时触发。

```typescript
detector.on('resize', ({ width, height }: { width: number, height: number }) => {
  console.log('窗口大小变化:', width, height)
})
```

#### networkChange

网络状态发生变化时触发（需要加载网络模块）。

```typescript
detector.on('networkChange', (networkInfo: NetworkInfo) => {
  console.log('网络状态变化:', networkInfo)
})
```

#### batteryChange

电池状态发生变化时触发（需要加载电池模块）。

```typescript
detector.on('batteryChange', (batteryInfo: BatteryInfo) => {
  console.log('电池状态变化:', batteryInfo)
})
```

## 扩展模块

### NetworkModule

网络状态检测模块。

#### 方法

```typescript
interface NetworkModule {
  /** 获取网络信息 */
  getData: () => NetworkInfo
  /** 检测是否在线 */
  isOnline: () => boolean
  /** 获取连接类型 */
  getConnectionType: () => string
}
```

#### NetworkInfo

```typescript
interface NetworkInfo {
  /** 网络状态 */
  status: 'online' | 'offline'
  /** 连接类型 */
  type: string
  /** 下载速度（Mbps） */
  downlink?: number
  /** 往返时间（毫秒） */
  rtt?: number
  /** 是否启用数据节省模式 */
  saveData?: boolean
}
```

### BatteryModule

电池状态检测模块。

#### 方法

```typescript
interface BatteryModule {
  /** 获取电池信息 */
  getData: () => BatteryInfo
  /** 获取电池电量 */
  getLevel: () => number
  /** 检测是否正在充电 */
  isCharging: () => boolean
  /** 获取电池状态描述 */
  getBatteryStatus: () => string
}
```

#### BatteryInfo

```typescript
interface BatteryInfo {
  /** 电池电量（0-1） */
  level: number
  /** 是否正在充电 */
  charging: boolean
  /** 充电时间（秒） */
  chargingTime: number
  /** 放电时间（秒） */
  dischargingTime: number
}
```

### GeolocationModule

地理位置检测模块。

#### 方法

```typescript
interface GeolocationModule {
  /** 获取位置信息 */
  getData: () => GeolocationInfo | null
  /** 检测是否支持地理位置 */
  isSupported: () => boolean
  /** 获取当前位置 */
  getCurrentPosition: () => Promise<GeolocationInfo>
  /** 开始监听位置变化 */
  startWatching: (callback: (position: GeolocationInfo) => void) => Promise<number>
  /** 停止监听位置变化 */
  stopWatching: (watchId: number) => void
}
```

#### GeolocationInfo

```typescript
interface GeolocationInfo {
  /** 纬度 */
  latitude: number
  /** 经度 */
  longitude: number
  /** 精度（米） */
  accuracy: number
  /** 海拔（米） */
  altitude?: number
  /** 海拔精度（米） */
  altitudeAccuracy?: number
  /** 方向（度） */
  heading?: number
  /** 速度（米/秒） */
  speed?: number
  /** 时间戳 */
  timestamp: number
}
```

## 工具函数

### 设备检测工具

```typescript
/** 检测是否为移动设备 */
function isMobileDevice(userAgent?: string): boolean

/** 检测是否为触摸设备 */
function isTouchDevice(): boolean

/** 根据宽度判断设备类型 */
function getDeviceTypeByWidth(width: number, breakpoints?: Breakpoints): DeviceType

/** 获取屏幕方向 */
function getScreenOrientation(width?: number, height?: number): Orientation

/** 获取设备像素比 */
function getPixelRatio(): number
```

### 系统信息工具

```typescript
/** 解析操作系统信息 */
function parseOS(userAgent: string): { name: string, version: string }

/** 解析浏览器信息 */
function parseBrowser(userAgent: string): { name: string, version: string }
```

### 通用工具

```typescript
/** 防抖函数 */
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void

/** 节流函数 */
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options?: { leading?: boolean, trailing?: boolean }
): (...args: Parameters<T>) => void

/** 安全访问 navigator API */
function safeNavigatorAccess<T>(accessor: (navigator: Navigator) => T, fallback: T): T

/** 检测 API 支持 */
function isAPISupported(api: string): boolean

/** 格式化字节数 */
function formatBytes(bytes: number, decimals?: number): string

/** 生成唯一 ID */
function generateId(prefix?: string): string
```
