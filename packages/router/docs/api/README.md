# API 参考

欢迎来到 LDesign Router 的 API 参考文档！这里包含了所有可用的 API、类型定义和使用示例。

## 🎯 核心 API

### Router 实例

- [`createRouter()`](./router.md#createrouter) - 创建路由器实例
- [`router.push()`](./router.md#router-push) - 编程式导航
- [`router.replace()`](./router.md#router-replace) - 替换当前路由
- [`router.go()`](./router.md#router-go) - 历史记录导航
- [`router.back()`](./router.md#router-back) - 后退
- [`router.forward()`](./router.md#router-forward) - 前进

### 路由配置

- [`RouteRecordRaw`](./types.md#routerecordraw) - 路由记录配置
- [`RouteLocationRaw`](./types.md#routelocationraw) - 路由位置配置
- [`NavigationGuard`](./types.md#navigationguard) - 导航守卫类型

### 组件

- [`<RouterView>`](./components.md#routerview) - 路由视图组件
- [`<RouterLink>`](./components.md#routerlink) - 路由链接组件

### 组合式 API

- [`useRouter()`](./composables.md#userouter) - 获取路由器实例
- [`useRoute()`](./composables.md#useroute) - 获取当前路由
- [`useDeviceRoute()`](./composables.md#usedeviceroute) - 设备路由功能
- [`useDeviceComponent()`](./composables.md#usedevicecomponent) - 设备组件解析

## 🔧 插件 API

### 动画插件

- [`createAnimationPlugin()`](./plugins.md#createanimationplugin) - 创建动画插件
- [`AnimationManager`](./plugins.md#animationmanager) - 动画管理器

### 缓存插件

- [`createCachePlugin()`](./plugins.md#createcacheplugin) - 创建缓存插件
- [`CacheManager`](./plugins.md#cachemanager) - 缓存管理器

### 性能插件

- [`createPerformancePlugin()`](./plugins.md#createperformanceplugin) - 创建性能插件
- [`PerformanceManager`](./plugins.md#performancemanager) - 性能管理器

### 预加载插件

- [`createPreloadPlugin()`](./plugins.md#createpreloadplugin) - 创建预加载插件
- [`PreloadManager`](./plugins.md#preloadmanager) - 预加载管理器

## 📱 设备适配 API

### 设备检测

- [`DeviceType`](./types.md#devicetype) - 设备类型枚举
- [`DeviceInfo`](./types.md#deviceinfo) - 设备信息接口
- [`checkDeviceSupport()`](./device.md#checkdevicesupport) - 检查设备支持

### 设备组件

- [`DeviceComponentResolution`](./types.md#devicecomponentresolution) - 设备组件解析结果
- [`DeviceGuardOptions`](./types.md#deviceguardoptions) - 设备守卫选项

## 🛡️ 类型定义

### 核心类型

```typescript
// 路由记录
interface RouteRecordRaw {
  path: string
  name?: string | symbol
  component?: RouteComponent
  components?: Record<string, RouteComponent>
  redirect?: RouteLocationRaw
  alias?: string | string[]
  children?: RouteRecordRaw[]
  meta?: RouteMeta
  props?: RoutePropsFunction | Record<string, any> | boolean
  beforeEnter?: NavigationGuardWithThis<undefined> | NavigationGuardWithThis<undefined>[]
  // 设备适配
  deviceComponents?: Record<DeviceType, RouteComponent>
  supportedDevices?: DeviceType[]
}

// 路由位置
interface RouteLocationNormalized {
  path: string
  name: string | symbol | null | undefined
  params: RouteParams
  query: RouteQuery
  hash: string
  fullPath: string
  matched: RouteRecordNormalized[]
  meta: RouteMeta
  redirectedFrom?: RouteLocation
}
```

### 导航守卫类型

```typescript
// 导航守卫
type NavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => NavigationGuardReturn | Promise<NavigationGuardReturn>

// 导航守卫返回值
type NavigationGuardReturn = 
  | void 
  | Error 
  | RouteLocationRaw 
  | boolean 
  | NavigationFailure
```

### 设备相关类型

```typescript
// 设备类型
type DeviceType = 'mobile' | 'tablet' | 'desktop'

// 设备信息
interface DeviceInfo {
  type: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  userAgent: string
  screenWidth: number
  screenHeight: number
}
```

## 🎨 样式和主题

### CSS 类名

LDesign Router 提供了一系列 CSS 类名用于样式定制：

```css
/* RouterLink 组件 */
.router-link {}
.router-link--active {}
.router-link--exact-active {}
.router-link--disabled {}
.router-link--loading {}

/* RouterView 组件 */
.router-view {}
.router-view--loading {}
.router-view--error {}

/* 动画类名 */
.route-enter-active {}
.route-leave-active {}
.route-enter-from {}
.route-enter-to {}
.route-leave-from {}
.route-leave-to {}
```

### 自定义主题

```typescript
// 在创建路由器时配置主题
const router = createRouter({
  // ... 其他配置
  theme: {
    primaryColor: '#1890ff',
    linkActiveClass: 'my-active-link',
    linkExactActiveClass: 'my-exact-active-link'
  }
})
```

## 🔍 调试和开发工具

### 开发模式

```typescript
const router = createRouter({
  // ... 其他配置
  development: {
    enabled: true,
    logLevel: 'debug',
    showPerformanceWarnings: true
  }
})
```

### 性能监控

```typescript
// 获取性能指标
const metrics = router.getPerformanceMetrics()
console.log('平均导航时间:', metrics.averageNavigationTime)
console.log('组件加载时间:', metrics.componentLoadTime)
console.log('内存使用情况:', metrics.memoryUsage)
```

## 📚 更多资源

- [完整示例](../examples/) - 查看实际使用示例
- [最佳实践](../best-practices/) - 学习最佳实践
- [迁移指南](../guide/migration.md) - 从其他路由器迁移
- [故障排除](../guide/troubleshooting.md) - 常见问题解决方案

---

> 💡 **提示**: 所有 API 都提供了完整的 TypeScript 类型定义，在支持 TypeScript 的编辑器中可以获得完整的智能提示和类型检查。
