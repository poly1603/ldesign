# 设备适配 API 参考

本文档详细介绍了 LDesign Router 设备适配功能的所有 API。

## 类型定义

### DeviceType

```typescript
type DeviceType = 'mobile' | 'tablet' | 'desktop'
```

设备类型枚举。

### DeviceRouteConfig

```typescript
interface DeviceRouteConfig {
  /** 默认支持的设备类型 */
  defaultSupportedDevices?: DeviceType[]
  /** 设备不支持时的默认提示信息 */
  defaultUnsupportedMessage?: string
  /** 设备不支持时的默认重定向路由 */
  defaultUnsupportedRedirect?: string
  /** 是否启用设备检测 */
  enableDeviceDetection?: boolean
  /** 是否启用设备访问控制 */
  enableDeviceGuard?: boolean

}
```

设备路由配置接口。

### DeviceComponentResolution

```typescript
interface DeviceComponentResolution {
  /** 解析到的组件 */
  component: RouteComponent
  /** 使用的设备类型 */
  deviceType: DeviceType
  /** 是否为回退组件 */
  isFallback: boolean
  /** 解析来源 */
  source: 'deviceComponents' | 'component'
}
```

设备组件解析结果。

### DeviceGuardOptions

```typescript
interface DeviceGuardOptions {
  /** 支持的设备类型检查函数 */
  checkSupportedDevices?: (
    supportedDevices: DeviceType[],
    currentDevice: DeviceType,
    route: RouteLocationNormalized
  ) => boolean
  /** 不支持设备时的处理函数 */
  onUnsupportedDevice?: (
    currentDevice: DeviceType,
    route: RouteLocationNormalized
  ) => RouteLocationRaw | void
}
```

设备路由守卫选项。



### DeviceRouterPluginOptions

```typescript
interface DeviceRouterPluginOptions extends DeviceRouteConfig {
  /** 设备路由守卫选项 */
  guardOptions?: DeviceGuardOptions

}
```

设备路由插件选项。

## 路由配置扩展

### RouteMeta 扩展

```typescript
interface RouteMeta {
  // 原有字段...

  /** 支持的设备类型，默认支持所有设备 */
  supportedDevices?: DeviceType[]
  /** 不支持设备时的提示信息 */
  unsupportedMessage?: string
  /** 不支持设备时的重定向路由 */
  unsupportedRedirect?: string

}
```

### RouteRecordRaw 扩展

```typescript
interface RouteRecordRaw {
  // 原有字段...

  /** 设备特定组件配置 */
  deviceComponents?: {
    mobile?: RouteComponent
    tablet?: RouteComponent
    desktop?: RouteComponent
  }

}
```

## 核心类

### DeviceRouteGuard

设备路由守卫类，用于控制设备访问权限。

#### 构造函数

```typescript
constructor(
  getCurrentDevice: () => DeviceType,
  options?: DeviceGuardOptions
)
```

**参数：**

- `getCurrentDevice`: 获取当前设备类型的函数
- `options`: 守卫选项

#### 方法

##### createGuard()

```typescript
createGuard(): NavigationGuard
```

创建导航守卫函数。

**返回值：** `NavigationGuard` - 可用于路由器的守卫函数

### DeviceComponentResolver

设备组件解析器类，用于解析设备特定组件。

#### 构造函数

```typescript
constructor(getCurrentDevice: () => DeviceType)
```

**参数：**

- `getCurrentDevice`: 获取当前设备类型的函数

#### 方法

##### resolveComponent()

```typescript
resolveComponent(
  record: RouteRecordNormalized,
  viewName?: string
): DeviceComponentResolution | null
```

解析路由记录的组件。

**参数：**

- `record`: 路由记录
- `viewName`: 视图名称，默认为 'default'

**返回值：** `DeviceComponentResolution | null` - 组件解析结果

##### isComponentSupportedOnDevice()

```typescript
isComponentSupportedOnDevice(
  record: RouteRecordNormalized,
  device: DeviceType
): boolean
```

检查组件是否支持指定设备。



## 插件

### createDeviceRouterPlugin()

```typescript
function createDeviceRouterPlugin(options?: DeviceRouterPluginOptions): {
  install: (router: Router) => DeviceRouterPlugin
}
```

创建设备路由插件。

**参数：**

- `options`: 插件配置选项

**返回值：** 插件对象，包含 `install` 方法

## Composition API

### useDeviceRoute()

```typescript
function useDeviceRoute(options?: UseDeviceRouteOptions): UseDeviceRouteReturn
```

使用设备路由功能的组合式函数。

#### 选项

```typescript
interface UseDeviceRouteOptions {
  /** 是否自动检测设备变化 */
  autoDetect?: boolean
  /** 设备变化时是否自动重新检查路由支持 */
  autoRecheck?: boolean
}
```

#### 返回值

```typescript
interface UseDeviceRouteReturn {
  /** 当前设备类型 */
  currentDevice: Ref<DeviceType>
  /** 当前设备友好名称 */
  currentDeviceName: ComputedRef<string>
  /** 当前路由是否支持当前设备 */
  isCurrentRouteSupported: ComputedRef<boolean>
  /** 当前路由支持的设备类型 */
  supportedDevices: ComputedRef<DeviceType[]>
  /** 检查指定路由是否支持当前设备 */
  isRouteSupported: (path: string) => boolean
  /** 检查指定路由是否支持指定设备 */
  isRouteSupportedOnDevice: (path: string, device: DeviceType) => boolean
  /** 获取设备信息 */
  getDeviceInfo: () => any
  /** 监听设备变化 */
  onDeviceChange: (callback: (device: DeviceType) => void) => () => void
  /** 跳转到设备不支持页面 */
  goToUnsupportedPage: (message?: string) => void
}
```

### useDeviceComponent()

```typescript
function useDeviceComponent(options?: UseDeviceComponentOptions): UseDeviceComponentReturn
```

使用设备组件解析功能的组合式函数。

#### 选项

```typescript
interface UseDeviceComponentOptions {
  /** 视图名称 */
  viewName?: string
  /** 是否启用自动解析 */
  autoResolve?: boolean
  /** 回退组件 */
  fallbackComponent?: RouteComponent
}
```

#### 返回值

```typescript
interface UseDeviceComponentReturn {
  /** 当前解析的组件 */
  resolvedComponent: ComputedRef<RouteComponent | null>
  /** 组件解析结果 */
  resolution: ComputedRef<DeviceComponentResolution | null>
  /** 是否正在加载 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 手动解析组件 */
  resolveComponent: () => Promise<RouteComponent | null>
  /** 检查是否有设备特定组件 */
  hasDeviceComponent: (device: DeviceType) => boolean
  /** 获取设备特定组件 */
  getDeviceComponent: (device: DeviceType) => RouteComponent | null
}
```

## 组件

### DeviceUnsupported

设备不支持提示组件。

#### Props

```typescript
interface DeviceUnsupportedProps {
  /** 当前设备类型 */
  device?: DeviceType
  /** 来源路由 */
  from?: string
  /** 自定义提示信息 */
  message?: string
  /** 支持的设备类型 */
  supportedDevices?: DeviceType[]
  /** 是否显示返回按钮 */
  showBackButton?: boolean
  /** 是否显示刷新按钮 */
  showRefreshButton?: boolean
  /** 自定义样式类名 */
  className?: string
}
```

## 工具函数

### checkDeviceSupport()

```typescript
function checkDeviceSupport(route: RouteLocationNormalized, currentDevice: DeviceType): boolean
```

检查设备是否被路由支持。

### resolveDeviceComponent()

```typescript
function resolveDeviceComponent(
  deviceComponents: Record<DeviceType, RouteComponent>,
  currentDevice: DeviceType
): DeviceComponentResolution | null
```

解析设备特定组件。

### createUnsupportedDeviceRoute()

```typescript
function createUnsupportedDeviceRoute(
  originalRoute: RouteLocationNormalized,
  currentDevice: DeviceType,
  customMessage?: string
): RouteLocationRaw
```

创建设备不支持的路由。
