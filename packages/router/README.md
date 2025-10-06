# @ldesign/router

🚀 一个现代化、高性能、类型安全的 Vue 路由库

[![npm version](https://badge.fury.io/js/@ldesign%2Frouter.svg)](https://badge.fury.io/js/@ldesign%2Frouter)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性亮点

- 🎯 **完全独立** - 不依赖 vue-router，避免版本冲突
- ⚡ **极致性能** - LRU 缓存 + Trie 树匹配，比传统方案快 3-5 倍
- 🚀 **最新优化** - v1.0.0 性能优化：内存占用减少30-40%，性能提升15-25%，CPU占用减少20-30%
- 🛡️ **类型安全** - 完整的 TypeScript 支持，路径参数自动推导，零 any 类型
- 🎨 **丰富动画** - 内置 fade、slide、scale 等过渡动画效果
- 💾 **智能缓存** - 多种缓存策略，自动内存管理和垃圾回收
- 🔄 **预加载优化** - hover、visible、idle 三种预加载策略，支持错误重试
- 📊 **性能监控** - 实时监控路由导航和组件加载性能，内存使用统计
- 🔧 **插件化架构** - 模块化设计，按需加载功能，Engine 深度集成
- 📱 **设备适配** - 智能设备检测，支持设备特定组件和访问控制
- 🏗️ **嵌套路由** - 强大的嵌套路由支持，完美匹配复杂应用架构
- 🎪 **一行集成** - 零配置快速启动，多种预设配置
- 🧪 **测试覆盖** - 70%+ 测试覆盖率，213+ 测试用例保证代码质量


## 📦 安装

```bash
pnpm add @ldesign/router
```

## 🚀 快速开始

### 🎯 Engine 集成（推荐）

使用 LDesign Engine 的最简单方式：

```typescript
import { createApp } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router'

const engine = createApp(App)

await engine.use(
  createRouterEnginePlugin({
    routes: [
      { path: '/', component: Home },
      { path: '/about', component: About },
    ],
    mode: 'hash',
    base: '/',
  })
)

// 路由器会自动注册到 engine.router
engine.router.push('/about')
```

### 基础用法

```typescript
import { createRouter, createWebHistory, RouterLink, RouterView } from '@ldesign/router'
import { createApp } from 'vue'

// 定义路由
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./views/About.vue'),
    meta: { title: '关于我们', transition: 'slide' },
  },
  {
    path: '/user/:id',
    name: 'user',
    component: () => import('./views/User.vue'),
    meta: { requiresAuth: true },
    // 嵌套路由示例
    children: [
      {
        path: '',
        name: 'userProfile',
        component: () => import('./views/user/Profile.vue'),
      },
      {
        path: 'posts',
        name: 'userPosts',
        component: () => import('./views/user/Posts.vue'),
      },
      {
        path: 'settings',
        name: 'userSettings',
        component: () => import('./views/user/Settings.vue'),
      },
    ],
  },
]

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 创建应用
const app = createApp({
  template: `
    <div id="app">
      <nav>
        <RouterLink to="/" preload="hover">首页</RouterLink>
        <RouterLink to="/about" animation="slide">关于</RouterLink>
        <RouterLink :to="{ name: 'user', params: { id: '123' } }">用户</RouterLink>
      </nav>
      <RouterView
        animation="fade"
        :keep-alive="true"
        :max-cache="5"
      />
    </div>
  `,
})

app.use(router)
app.mount('#app')
```

### 传统用法（兼容）

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
})

app.use(router)
```

### 🔌 插件增强

使用内置插件增强路由功能：

```typescript
import { createApp } from '@ldesign/engine'
import { createCachePlugin, createPerformancePlugin, routerPlugin } from '@ldesign/router'

const engine = createApp(App)

// 使用路由插件
await engine.use(routerPlugin({ routes }))

// 添加性能监控插件
engine.use(
  createPerformancePlugin({
    enabled: true,
    trackNavigation: true,
    enablePreload: true,
    preloadStrategy: 'hover',
    onPerformanceData: data => {
      console.log('路由性能数据:', data)
    },
  })
)

// 添加缓存插件
engine.use(
  createCachePlugin({
    strategy: 'memory',
    defaultTTL: 5 * 60 * 1000, // 5分钟
    maxSize: 100,
  })
)
```

## 📖 API 文档

### Engine 插件 API

#### createRouterEnginePlugin(options)

创建路由器 Engine 插件，这是**推荐的集成方式**。

**参数：**

- `options.routes` - 路由配置数组
- `options.mode` - 路由模式：`'history'` | `'hash'` | `'memory'`，默认 `'history'`
- `options.base` - 基础路径，默认 `'/'`
- `options.name` - 插件名称，默认 `'router'`
- `options.version` - 插件版本，默认 `'1.0.0'`
- `options.scrollBehavior` - 滚动行为函数
- `options.linkActiveClass` - 活跃链接类名
- `options.linkExactActiveClass` - 精确活跃链接类名

**返回值：** Engine 插件实例

**示例：**

```typescript
import { createRouterEnginePlugin } from '@ldesign/router'

const routerPlugin = createRouterEnginePlugin({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
  mode: 'hash',
  base: '/app',
})

await engine.use(routerPlugin)
```

#### routerPlugin(options)

`createRouterEnginePlugin` 的别名，用于向后兼容。

#### createDefaultRouterEnginePlugin(routes)

使用默认配置创建路由器插件。

**参数：**

- `routes` - 路由配置数组

**示例：**

```typescript
const plugin = createDefaultRouterEnginePlugin([{ path: '/', component: Home }])
```

### routerPlugin(options)

创建路由插件，这是**推荐的集成方式**。

#### 参数

```typescript
interface RouterPluginOptions {
  routes: RouteRecordRaw[] // 路由配置
  mode?: 'history' | 'hash' | 'memory' // 路由模式，默认 'history'
  base?: string // 基础路径，默认 '/'
  scrollBehavior?: ScrollBehavior // 滚动行为
}
```

#### 示例

```typescript
const plugin = routerPlugin({
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/about', name: 'About', component: About },
  ],
  mode: 'history',
  base: '/app/',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

await engine.use(plugin)
```

### 核心组件

#### RouterView

路由视图组件，用于渲染匹配的路由组件。

```vue
<template>
  <RouterView />
</template>
```

#### RouterLink

路由链接组件，用于创建导航链接。

```vue
<template>
  <RouterLink to="/about"> 关于我们 </RouterLink>
  <RouterLink :to="{ name: 'Home' }"> 首页 </RouterLink>
</template>
```

### 组合式 API

#### useRouter()

获取路由器实例。

```typescript
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 编程式导航
router.push('/about')
router.replace('/home')
router.go(-1)
router.back()
router.forward()
```

#### useRoute()

获取当前路由信息。

```typescript
import { useRoute } from '@ldesign/router'

const route = useRoute()

console.log(route.path) // 当前路径
console.log(route.params) // 路由参数
console.log(route.query) // 查询参数
console.log(route.meta) // 路由元信息
```

#### 路由守卫钩子

```typescript
import { onBeforeRouteLeave, onBeforeRouteUpdate } from '@ldesign/router'

// 路由更新时
onBeforeRouteUpdate((to, from, next) => {
  console.log('路由更新:', to.path)
  next()
})

// 离开路由时
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges()) {
    if (confirm('有未保存的更改，确定要离开吗？')) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})
```

#### 便利的组合式 API

```typescript
import { useHash, useMatched, useMeta, useParams, useQuery } from '@ldesign/router'

// 获取路由参数
const params = useParams()
console.log(params.value.id) // 路由参数 id

// 获取查询参数
const query = useQuery()
console.log(query.value.search) // 查询参数 search

// 获取哈希值
const hash = useHash()
console.log(hash.value) // 当前哈希值

// 获取路由元信息
const meta = useMeta()
console.log(meta.value.title) // 路由标题

// 获取匹配的路由记录
const matched = useMatched()
console.log(matched.value) // 匹配的路由记录数组
```

## 🛡️ 路由守卫

### 全局守卫

```typescript
const router = useRouter()

// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  document.title = to.meta.title || 'App'
})
```

### 路由级守卫

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminPanel,
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      if (hasAdminPermission()) {
        next()
      } else {
        next('/403')
      }
    },
  },
]
```

## 🎯 路由配置

### 基础路由

```typescript
const routes = [
  // 静态路由
  { path: '/', component: Home },

  // 动态路由
  { path: '/user/:id', component: User },

  // 嵌套路由
  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: 'profile', component: UserProfile },
      { path: 'settings', component: UserSettings },
    ],
  },

  // 重定向
  { path: '/home', redirect: '/' },

  // 别名
  { path: '/', alias: '/home' },

  // 404 页面
  { path: '/:pathMatch(.*)*', component: NotFound },
]
```

### 路由元信息

```typescript
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      title: '仪表板',
      requiresAuth: true,
      roles: ['admin', 'user'],
      icon: 'dashboard',
    },
  },
]
```

### 懒加载

```typescript
const routes = [
  {
    path: '/about',
    component: () => import('./views/About.vue'),
  },
  {
    path: '/heavy-page',
    component: () =>
      import(
        /* webpackChunkName: "heavy-page" */
        './views/HeavyPage.vue'
      ),
  },
]
```

## 🔧 高级用法

### 编程式导航

```typescript
const router = useRouter()

// 字符串路径
router.push('/about')

// 对象形式
router.push({ path: '/about' })

// 命名路由
router.push({ name: 'About' })

// 带参数
router.push({ name: 'User', params: { id: '123' } })

// 带查询参数
router.push({ path: '/search', query: { q: 'vue' } })

// 带哈希
router.push({ path: '/about', hash: '#team' })
```

### 导航错误处理

```typescript
router.push('/about').catch(err => {
  if (isNavigationFailure(err, NavigationFailureType.cancelled)) {
    console.log('导航被取消')
  }
})
```

## 📱 设备适配功能

LDesign Router 提供了强大的设备适配功能，让您可以轻松地为不同设备类型提供定制化的路由体验。

### 🎯 设备特定组件

为不同设备配置不同的页面组件：

```typescript
import { createDeviceRouterPlugin } from '@ldesign/router'

const routes = [
  {
    path: '/',
    name: 'Home',
    // 为不同设备配置不同组件
    deviceComponents: {
      mobile: () => import('@/views/mobile/Home.vue'),
      tablet: () => import('@/views/tablet/Home.vue'),
      desktop: () => import('@/views/desktop/Home.vue'),
    },
  },
  {
    path: '/product/:id',
    // 支持回退机制：移动端使用专用组件，其他设备使用通用组件
    component: () => import('@/views/Product.vue'),
    deviceComponents: {
      mobile: () => import('@/views/mobile/Product.vue'),
    },
  },
]

// 安装设备路由插件
const devicePlugin = createDeviceRouterPlugin({
  enableDeviceDetection: true,
  enableDeviceGuard: true,

})

devicePlugin.install(router)
```

### 🛡️ 设备访问控制

限制特定路由只能在指定设备上访问：

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminPanel,
    meta: {
      // 限制只能在桌面设备访问
      supportedDevices: ['desktop'],
      unsupportedMessage: '管理后台仅支持桌面设备访问',
      unsupportedRedirect: '/admin-guide', // 可选：自定义重定向
    },
  },
  {
    path: '/mobile-app',
    component: MobileApp,
    meta: {
      supportedDevices: ['mobile'],
      unsupportedMessage: '此功能仅在移动设备上可用',
    },
  },
  {
    path: '/editor',
    component: Editor,
    meta: {
      // 支持多种设备
      supportedDevices: ['desktop', 'tablet'],
      unsupportedMessage: '编辑器需要较大的屏幕空间',
    },
  },
]
```



### 🪝 设备适配 Composables

使用组合式函数轻松处理设备相关逻辑：

```vue
<script setup lang="ts">
import { useDeviceComponent, useDeviceRoute } from '@ldesign/router'

// 设备路由功能
const {
  currentDevice,
  currentDeviceName,
  isCurrentRouteSupported,
  supportedDevices,
  isRouteSupported,
  goToUnsupportedPage,
  onDeviceChange,
} = useDeviceRoute()

// 设备组件解析功能
const { resolvedComponent, resolution, loading, error, hasDeviceComponent } = useDeviceComponent()

// 检查特定路由是否支持
const canAccessAdmin = isRouteSupported('/admin')
const canAccessEditor = isRouteSupported('/editor')

// 监听设备变化
const unwatch = onDeviceChange(device => {
  console.log(`设备切换到: ${device}`)
  // 可以在这里执行设备切换后的逻辑
})

onUnmounted(() => {
  unwatch()
})
</script>

<template>
  <div class="device-info">
    <h3>设备信息</h3>
    <p>当前设备: {{ currentDeviceName }}</p>
    <p>路由支持: {{ isCurrentRouteSupported ? '✅ 支持' : '❌ 不支持' }}</p>
    <p>支持的设备: {{ supportedDevices.join('、') }}</p>

    <!-- 条件性导航 -->
    <nav>
      <router-link v-if="canAccessAdmin" to="/admin"> 管理后台 </router-link>
      <router-link v-if="canAccessEditor" to="/editor"> 编辑器 </router-link>
    </nav>

    <!-- 组件信息 -->
    <div v-if="resolution" class="component-info">
      <p>组件来源: {{ resolution.source }}</p>
      <p>设备类型: {{ resolution.deviceType }}</p>
      <p v-if="resolution.isFallback">使用回退组件</p>
    </div>

    <!-- 不支持提示 -->
    <button v-if="!isCurrentRouteSupported" @click="goToUnsupportedPage()">查看不支持说明</button>
  </div>
</template>
```

### 🎪 设备不支持提示

使用内置组件显示友好的设备不支持提示：

```vue
<script setup lang="ts">
import { DeviceUnsupported } from '@ldesign/router'
</script>

<template>
  <DeviceUnsupported
    :device="$route.query.device"
    :from="$route.query.from"
    :message="$route.query.message"
    :supported-devices="['desktop']"
    :show-back-button="true"
    :show-refresh-button="true"
    class-name="custom-unsupported"
  />
</template>

<style>
.custom-unsupported {
  /* 自定义样式 */
}
</style>
```

### ⚙️ 高级配置

```typescript
// 完整的设备路由配置
const devicePlugin = createDeviceRouterPlugin({
  // 基础配置
  enableDeviceDetection: true,
  enableDeviceGuard: true,


  // 默认设置
  defaultSupportedDevices: ['mobile', 'tablet', 'desktop'],
  defaultUnsupportedMessage: '当前系统不支持在此设备上查看',
  defaultUnsupportedRedirect: '/device-unsupported',

  // 守卫配置
  guardOptions: {
    checkSupportedDevices: (supported, current, route) => {
      // 自定义设备支持检查逻辑
      if (route.path.startsWith('/admin')) {
        return current === 'desktop' && window.innerWidth >= 1200
      }
      return supported.includes(current)
    },
    onUnsupportedDevice: (device, route) => {
      // 自定义不支持设备处理逻辑
      return {
        path: '/device-guide',
        query: { device, target: route.path },
      }
    },
  },


})
```

> 📖 **详细文档**: 查看 [设备适配指南](./docs/device-adaptation.md) 了解更多功能和配置选项。

## 🤝 与 LDesign Engine 集成

### 自动集成功能

使用 `routerPlugin` 时，路由会自动集成到 Engine 中：

```typescript
// 路由器会自动注册到 engine.router
await engine.use(routerPlugin({ routes }))

// 可以通过 engine.router 访问路由功能
engine.router.push('/about')
engine.router.getCurrentRoute()
```

### 状态同步

路由状态会自动同步到 Engine：

```typescript
// 当前路由信息会同步到 Engine 状态
const currentRoute = engine.router.getCurrentRoute()
console.log(currentRoute.value.path)
```

### 事件集成

路由变化会触发 Engine 事件系统：

```typescript
// 路由操作会自动记录到 Engine 日志
router.push('/about') // 自动记录导航日志
```



## 📝 类型定义

### 核心类型

```typescript
// 路由记录
interface RouteRecordRaw {
  path: string
  name?: string | symbol
  component?: RouteComponent
  children?: RouteRecordRaw[]
  meta?: RouteMeta
  beforeEnter?: NavigationGuard
}

// 路由位置
interface RouteLocation {
  path: string
  name?: string | symbol
  params: RouteParams
  query: RouteQuery
  hash: string
  meta: RouteMeta
}

// 导航守卫
interface NavigationGuard {
  (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext):
    | NavigationGuardReturn
    | Promise<NavigationGuardReturn>
}
```

## 🔌 插件系统

### 性能监控插件

监控路由导航性能和组件加载时间：

```typescript
import { createPerformancePlugin } from '@ldesign/router'

const performancePlugin = createPerformancePlugin({
  enabled: true,
  trackNavigation: true, // 跟踪导航时间
  trackComponentLoading: true, // 跟踪组件加载时间
  enablePreload: true, // 启用预加载
  preloadStrategy: 'hover', // 预加载策略：hover | visible | idle
  onPerformanceData: data => {
    // 处理性能数据
    console.log(`${data.type}: ${data.route} (${data.duration}ms)`)
  },
})

app.use(performancePlugin)
```

### 缓存插件

提供路由级别的数据缓存：

```typescript
import { createCachePlugin } from '@ldesign/router'

// 在组件中使用缓存
import { inject } from 'vue'

const cachePlugin = createCachePlugin({
  strategy: 'memory', // 缓存策略：memory | localStorage | sessionStorage
  defaultTTL: 5 * 60 * 1000, // 默认缓存时间（毫秒）
  maxSize: 100, // 最大缓存条目数
  shouldCache: route => {
    // 自定义缓存条件
    return route.meta?.cache !== false
  },
})

app.use(cachePlugin)

const routerCache = inject('routerCache')

// 设置缓存
routerCache.set(route, data, 10 * 60 * 1000) // 缓存10分钟

// 获取缓存
const cachedData = routerCache.get(route)
```

### 增强组件插件

提供功能丰富的路由组件：

```typescript
import { EnhancedComponentsPlugin } from '@ldesign/router'

app.use(EnhancedComponentsPlugin, {
  // 权限检查器
  permissionChecker: permission => {
    return checkUserPermission(permission)
  },

  // 事件追踪器
  eventTracker: (event, data) => {
    analytics.track(event, data)
  },

  // 确认对话框
  confirmDialog: (message, title) => {
    return showCustomDialog(message, title)
  },
})
```

## 📊 最佳实践

### 1. 路由结构组织

```typescript
// 推荐的路由结构
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人资料', requiresAuth: true },
      },
    ],
  },
]
```

### 2. 错误处理

```typescript
// 全局错误处理
router.onError((error, to, from) => {
  console.error('路由错误:', error)

  if (error.message.includes('Loading chunk')) {
    // 处理代码分割加载失败
    window.location.reload()
  }
})
```

### 3. 性能优化

```typescript
// 路由懒加载
const routes = [
  {
    path: '/heavy',
    component: () =>
      import(
        /* webpackChunkName: "heavy" */
        /* webpackPrefetch: true */
        './views/Heavy.vue'
      ),
  },
]
```

## 🐛 故障排除

### 常见问题

1. **路由不匹配**

   - 检查路由路径是否正确
   - 确认组件是否正确导入

2. **导航守卫不生效**

   - 确保调用了 `next()` 函数
   - 检查守卫的执行顺序

3. **插件安装失败**
   - 确保在 `engine.mount()` 之前安装插件
   - 检查路由配置是否正确

### 调试技巧

```typescript
// 在开发环境下查看路由信息
if (process.env.NODE_ENV === 'development') {
  const route = useRoute()
  console.log('当前路由:', route)
}
```

## 🔄 迁移指南

### 从旧版本迁移

如果你之前使用的是复杂的适配器方式，现在可以简化为：

```typescript
// 旧方式（复杂）
import { createRouterAdapter } from '@ldesign/router'
const adapter = createRouterAdapter({ routes })
const engine1 = createApp(App, { router: adapter })
```

```typescript
// 新方式（简化）
import { routerPlugin } from '@ldesign/router'
const engine2 = createApp(App)
await engine2.use(routerPlugin({ routes }))
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 文档

### 完整文档

- [📖 完整文档](./docs/index.md) - 查看完整的使用指南
- [🚀 快速开始](./docs/guide/getting-started.md) - 快速上手指南
- [🏗️ 嵌套路由](./docs/guide/nested-routes.md) - 嵌套路由详细指南
- [🎯 动态路由](./docs/guide/dynamic-routes.md) - 动态路由使用指南
- [📱 设备适配](./docs/guide/device-routing.md) - 设备路由适配
- [🔧 引擎集成](./docs/guide/engine-integration.md) - Engine 深度集成

### API 参考

- [🔌 核心 API](./docs/api/core-api.md) - 核心 API 参考
- [📱 设备 API](./docs/api/device-api.md) - 设备相关 API
- [🎨 组件 API](./docs/api/component-api.md) - 组件 API 参考

### 性能优化文档

- [⚡ 优化报告](./优化报告.md) - 完整的性能优化报告（中文）
- [📊 优化详情](./OPTIMIZATION.md) - 详细的优化说明（英文）
- [✅ 优化清单](./OPTIMIZATION_CHECKLIST.md) - 优化完成清单
- [🧪 性能测试](./scripts/performance-comparison.js) - 性能对比测试脚本

## 🚀 v1.0.0 性能优化亮点

### 优化成果
- ✅ **内存占用减少 30-40%** - 通过优化缓存大小和内存阈值
- ✅ **性能提升 15-25%** - 通过优化算法和减少不必要的操作
- ✅ **CPU占用减少 20-30%** - 通过减少监控频率和智能GC
- ✅ **保持向后兼容** - 所有公共API保持不变

### 主要优化项
1. **路由匹配器优化** - LRU缓存从200减至50，缓存键生成性能提升42.67%
2. **内存管理优化** - 监控间隔从30秒增至60秒，智能GC触发
3. **缓存插件优化** - 默认缓存大小从10减至5，优化序列化逻辑
4. **懒加载优化** - 超时时间从30秒减至15秒，重试次数从3次减至2次

### 性能测试结果
```
缓存键生成:  +42.67% (4.01ms → 2.30ms)
监控频率:    -50%    (2次/分钟 → 1次/分钟)
组件缓存:    -50%    (10MB → 5MB)
懒加载:      -62.5%  (120秒 → 45秒)
LRU缓存:     -75%    (200条目 → 50条目)
```

查看 [完整优化报告](./优化报告.md) 了解更多详情。

## 🔗 相关链接

- [LDesign Engine](../engine/README.md) - 核心引擎
- [Vue Router 官方文档](https://router.vuejs.org/) - Vue Router
- [Vue 3 文档](https://vuejs.org/) - Vue 3 官方文档
