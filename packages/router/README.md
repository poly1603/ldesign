# @ldesign/router

🚀 **简化的 Vue 路由解决方案** - 专为 LDesign Engine 设计的现代化路由系统

## ✨ 核心特性

- 🎯 **插件化集成**: 一行代码集成到 LDesign Engine
- 🛡️ **类型安全**: 完整的 TypeScript 支持
- 🚀 **简洁 API**: 基于 Vue Router 4 的简化封装
- 📱 **响应式**: 基于 Vue 3 Composition API
- 🔄 **零配置**: 开箱即用，无需复杂配置

## 📦 安装

```bash
pnpm add @ldesign/router
```

## 🚀 快速开始

### 推荐用法（插件方式）

```typescript
import { createApp } from '@ldesign/engine'
import { routerPlugin } from '@ldesign/router'

// 定义路由
const routes = [
  { path: '/', component: () => import('./views/Home.vue') },
  { path: '/about', component: () => import('./views/About.vue') },
]

// 创建应用
const engine = createApp(App)

// 一行代码集成路由
await engine.use(
  routerPlugin({
    routes,
    mode: 'history',
  })
)

engine.mount('#app')
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

## 📖 API 文档

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
const engine = createApp(App, { router: adapter })

// 新方式（简化）
import { routerPlugin } from '@ldesign/router'
const engine = createApp(App)
await engine.use(routerPlugin({ routes }))
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🔗 相关链接

- [LDesign Engine](../engine/README.md)
- [Vue Router 官方文档](https://router.vuejs.org/)
- [Vue 3 文档](https://vuejs.org/)
