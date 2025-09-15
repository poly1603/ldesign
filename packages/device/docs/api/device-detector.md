# DeviceDetector

核心设备检测器，提供设备类型、屏幕方向、像素比、触摸支持、浏览器与操作系统信息等能力，并在窗口尺寸或方向变化时发出事件。

## 构造函数

```ts
const detector = new DeviceDetector(options?: DeviceDetectorOptions)
```

- enableResize?: boolean = true — 监听窗口大小变化
- enableOrientation?: boolean = true — 监听屏幕方向变化
- breakpoints?: { mobile: number; tablet: number } — 自定义断点
- debounceDelay?: number = 100 — 事件防抖时间（毫秒）
- modules?: string[] — 需要按需加载的模块名

## 实例方法

- `getDeviceInfo(): DeviceInfo` — 获取当前设备信息（返回副本）
- `getDeviceType(): DeviceType` — 获取设备类型
- `getOrientation(): Orientation` — 获取屏幕方向
- `getPerformanceMetrics(): { detectionCount: number; averageDetectionTime: number; lastDetectionDuration: number }`
- `isMobile(): boolean` — 是否移动设备
- `isTablet(): boolean` — 是否平板设备
- `isDesktop(): boolean` — 是否桌面设备
- `isTouchDevice(): boolean` — 是否触摸设备
- `refresh(): void` — 强制刷新设备信息并派发事件（忽略频率限制）
- `loadModule<T extends DeviceModule = DeviceModule>(name: string): Promise<T>` — 动态加载扩展模块
- `unloadModule(name: string): Promise<void>` — 卸载扩展模块
- `isModuleLoaded(name: string): boolean` — 指定模块是否已加载
- `getLoadedModules(): string[]` — 已加载模块列表
- `destroy(): Promise<void>` — 销毁实例，移除监听器并卸载模块

## 事件

使用 on(event, listener) 订阅：

- `deviceChange: DeviceInfo` — 设备信息整体变化
- `orientationChange: Orientation` — 屏幕方向变化
- `resize: { width: number; height: number }` — 视口尺寸变化
- `networkChange: NetworkInfo` — 来自 network 模块（桥接）
- `batteryChange: BatteryInfo` — 来自 battery 模块（桥接）
- `positionChange: GeolocationInfo` — 来自 geolocation 模块（桥接）
- `error: { message: string; count: number; lastError: unknown }` — 连续错误过多时触发

```ts
const detector = new DeviceDetector()

// 监听设备变化
const handler = (info: DeviceInfo) => {
  console.log('设备信息更新', info)
}

detector.on('deviceChange', handler)

// 清理
// detector.off('deviceChange', handler)
```

