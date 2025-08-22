# Vue Router 集成

LDesign Engine 与 Vue Router 深度集成，提供了强大的路由管理和导航功能。

## 基础集成

### 安装和配置

```bash
# 安装 Vue Router
pnpm add vue-router@4

# 安装 LDesign Engine 路由插件
pnpm add @ldesign/engine-router
```

### 基础设置

```typescript
import { createEngine } from '@ldesign/engine'
import { routerPlugin } from '@ldesign/engine-router'
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

// 定义路由
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: {
      requiresAuth: true,
      title: '关于我们',
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['user:read'],
    },
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 创建引擎并集成路由
const engine = createEngine({
  plugins: [
    routerPlugin({
      router,
      // 路由配置选项
      options: {
        enableGuards: true,
        enableMetadata: true,
        enableAnalytics: true,
      },
    }),
  ],
})

export { engine, router }
```

### 在 Vue 应用中使用

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { engine, router } from './router'

const app = createApp(App)

// 使用路由和引擎
app.use(router)
app.use(engine)

app.mount('#app')
```

## 路由守卫

### 全局前置守卫

```typescript
// 认证守卫
engine.router.beforeEach(async (to, from) => {
  // 检查是否需要认证
  if (to.meta?.requiresAuth) {
    const isAuthenticated = engine.state.get('user.isAuthenticated')

    if (!isAuthenticated) {
      engine.notifications.warning('请先登录')
      return { name: 'Login', query: { redirect: to.fullPath } }
    }
  }

  // 检查权限
  if (to.meta?.permissions) {
    const userPermissions = engine.state.get('user.permissions') || []
    const requiredPermissions = to.meta.permissions as string[]

    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    )

    if (!hasPermission) {
      engine.notifications.error('权限不足')
      return { name: 'Forbidden' }
    }
  }

  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - ${engine.config.appName}`
  }

  // 发送路由事件
  engine.events.emit('router:beforeEach', { to, from })
})
```

### 全局后置钩子

```typescript
engine.router.afterEach((to, from) => {
  // 页面访问统计
  engine.events.emit('analytics:page-view', {
    path: to.path,
    name: to.name,
    params: to.params,
    query: to.query,
    meta: to.meta,
    timestamp: Date.now(),
  })

  // 更新面包屑
  engine.state.set('ui.breadcrumb', generateBreadcrumb(to))

  // 滚动到顶部
  if (to.meta?.scrollToTop !== false) {
    window.scrollTo(0, 0)
  }

  // 发送路由事件
  engine.events.emit('router:afterEach', { to, from })
})
```

### 路由级守卫

```typescript
// 在路由配置中定义
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: (to, from) => {
      // 管理员权限检查
      const userRole = engine.state.get('user.profile.role')

      if (userRole !== 'admin') {
        engine.notifications.error('需要管理员权限')
        return { name: 'Home' }
      }
    },
    children: [
      {
        path: 'users',
        component: UserManagement,
        meta: {
          title: '用户管理',
          permissions: ['admin:users:read'],
        },
      },
    ],
  },
]
```

## 路由状态管理

### 路由状态同步

```typescript
// 路由状态插件
const routeStatePlugin = {
  name: 'route-state',

  install: (engine) => {
    // 监听路由变化，更新状态
    engine.router.afterEach((to) => {
      engine.state.set('router.current', {
        path: to.path,
        name: to.name,
        params: to.params,
        query: to.query,
        meta: to.meta,
      })
    })

    // 提供路由操作方法
    engine.router.navigate = (to, options = {}) => {
      if (options.replace) {
        return engine.router.replace(to)
      }
      else {
        return engine.router.push(to)
      }
    }

    // 路由历史管理
    engine.router.goBack = () => {
      if (window.history.length > 1) {
        engine.router.back()
      }
      else {
        engine.router.push('/')
      }
    }
  },
}
```

### 路由缓存

```typescript
// 路由缓存插件
const routeCachePlugin = {
  name: 'route-cache',

  install: (engine) => {
    const cache = new Map()

    // 缓存路由数据
    engine.router.beforeEach(async (to) => {
      const cacheKey = `route:${to.path}`

      // 检查缓存
      if (cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey)
        engine.state.set('route.data', cachedData)
        return
      }

      // 加载路由数据
      if (to.meta?.loadData) {
        try {
          const data = await to.meta.loadData(to)
          cache.set(cacheKey, data)
          engine.state.set('route.data', data)
        }
        catch (error) {
          engine.notifications.error('加载页面数据失败')
          throw error
        }
      }
    })

    // 清理缓存
    engine.router.clearCache = (pattern?: string) => {
      if (pattern) {
        for (const key of cache.keys()) {
          if (key.includes(pattern)) {
            cache.delete(key)
          }
        }
      }
      else {
        cache.clear()
      }
    }
  },
}
```

## 动态路由

### 动态添加路由

```typescript
// 动态路由管理
class DynamicRouteManager {
  constructor(private engine: Engine) {}

  // 添加路由
  addRoute(route: RouteRecordRaw) {
    this.engine.router.addRoute(route)

    // 更新路由列表
    const routes = this.engine.state.get('router.routes') || []
    routes.push(route)
    this.engine.state.set('router.routes', routes)

    // 发送事件
    this.engine.events.emit('router:route-added', route)
  }

  // 移除路由
  removeRoute(name: string) {
    this.engine.router.removeRoute(name)

    // 更新路由列表
    const routes = this.engine.state.get('router.routes') || []
    const filtered = routes.filter(route => route.name !== name)
    this.engine.state.set('router.routes', filtered)

    // 发送事件
    this.engine.events.emit('router:route-removed', name)
  }

  // 批量添加路由
  addRoutes(routes: RouteRecordRaw[]) {
    routes.forEach(route => this.addRoute(route))
  }

  // 根据权限动态添加路由
  addRoutesByPermissions(routes: RouteRecordRaw[], permissions: string[]) {
    const allowedRoutes = routes.filter((route) => {
      const requiredPermissions = route.meta?.permissions as string[]

      if (!requiredPermissions)
        return true

      return requiredPermissions.every(permission => permissions.includes(permission))
    })

    this.addRoutes(allowedRoutes)
  }
}

// 使用动态路由管理器
const routeManager = new DynamicRouteManager(engine)

// 根据用户权限动态添加路由
engine.events.on('user:login', (user) => {
  const userPermissions = user.permissions || []

  // 管理员路由
  const adminRoutes = [
    {
      path: '/admin/users',
      name: 'AdminUsers',
      component: () => import('../views/admin/Users.vue'),
      meta: {
        title: '用户管理',
        permissions: ['admin:users:read'],
      },
    },
    {
      path: '/admin/settings',
      name: 'AdminSettings',
      component: () => import('../views/admin/Settings.vue'),
      meta: {
        title: '系统设置',
        permissions: ['admin:settings:read'],
      },
    },
  ]

  routeManager.addRoutesByPermissions(adminRoutes, userPermissions)
})
```

### 路由懒加载

```typescript
// 路由懒加载配置
function createLazyRoute(path: string, component: string, meta = {}) {
  return {
    path,
    component: () => import(`../views/${component}.vue`),
    meta: {
      ...meta,
      lazy: true,
    },
  }
}

// 使用懒加载路由
const routes = [
  createLazyRoute('/', 'Home', { title: '首页' }),
  createLazyRoute('/about', 'About', { title: '关于' }),
  createLazyRoute('/contact', 'Contact', { title: '联系我们' }),

  // 分组懒加载
  {
    path: '/user',
    component: () => import('../layouts/UserLayout.vue'),
    children: [
      createLazyRoute('profile', 'user/Profile', {
        title: '个人资料',
        requiresAuth: true,
      }),
      createLazyRoute('settings', 'user/Settings', {
        title: '用户设置',
        requiresAuth: true,
      }),
    ],
  },
]
```

## 路由分析

### 页面访问统计

```typescript
// 路由分析插件
const routeAnalyticsPlugin = {
  name: 'route-analytics',

  install: (engine) => {
    const analytics = {
      pageViews: new Map(),
      userJourney: [],
      sessionStart: Date.now(),
    }

    // 记录页面访问
    engine.router.afterEach((to, from) => {
      const pageView = {
        path: to.path,
        name: to.name,
        timestamp: Date.now(),
        referrer: from.path,
        duration: 0,
      }

      // 计算上一页停留时间
      if (analytics.userJourney.length > 0) {
        const lastPage = analytics.userJourney[analytics.userJourney.length - 1]
        lastPage.duration = pageView.timestamp - lastPage.timestamp
      }

      // 添加到用户旅程
      analytics.userJourney.push(pageView)

      // 更新页面访问计数
      const count = analytics.pageViews.get(to.path) || 0
      analytics.pageViews.set(to.path, count + 1)

      // 发送分析数据
      engine.events.emit('analytics:page-view', pageView)
    })

    // 获取分析数据
    engine.analytics = {
      getPageViews: () => Object.fromEntries(analytics.pageViews),
      getUserJourney: () => [...analytics.userJourney],
      getSessionDuration: () => Date.now() - analytics.sessionStart,

      // 生成报告
      generateReport: () => ({
        totalPageViews: analytics.userJourney.length,
        uniquePages: analytics.pageViews.size,
        sessionDuration: Date.now() - analytics.sessionStart,
        mostVisitedPages: Array.from(analytics.pageViews.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10),
        userJourney: analytics.userJourney,
      }),
    }
  },
}
```

### 性能监控

```typescript
// 路由性能监控
engine.router.beforeEach((to) => {
  // 开始计时
  engine.performance.mark(`route-start-${to.path}`)
})

engine.router.afterEach((to) => {
  // 结束计时
  engine.performance.mark(`route-end-${to.path}`)

  // 测量路由切换时间
  const duration = engine.performance.measure(
    `route-navigation-${to.path}`,
    `route-start-${to.path}`,
    `route-end-${to.path}`
  )

  // 记录性能数据
  engine.events.emit('performance:route-navigation', {
    path: to.path,
    duration,
    timestamp: Date.now(),
  })

  // 性能警告
  if (duration > 1000) {
    engine.logger.warn(`路由切换耗时过长: ${to.path} (${duration}ms)`)
  }
})
```

## 最佳实践

### 1. 路由设计原则

```typescript
// ✅ 好的路由设计
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      icon: 'home',
      showInMenu: true,
    },
  },
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: UserDetail,
    props: true, // 将路由参数作为 props 传递
    meta: {
      title: '用户详情',
      requiresAuth: true,
      breadcrumb: ['用户管理', '用户详情'],
    },
  },
]

// ❌ 避免的路由设计
const badRoutes = [
  {
    path: '/page1', // 不描述性的路径
    component: SomeComponent, // 没有名称和元数据
  },
]
```

### 2. 错误处理

```typescript
// 路由错误处理
engine.router.onError((error) => {
  engine.logger.error('路由错误:', error)

  // 根据错误类型处理
  if (error.message.includes('Failed to fetch')) {
    engine.notifications.error('页面加载失败，请检查网络连接')
  }
  else {
    engine.notifications.error('页面访问出错')
  }

  // 跳转到错误页面
  engine.router.push('/error')
})

// 404 处理
const routes = [
  // ... 其他路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '页面未找到',
    },
  },
]
```

### 3. SEO 优化

```typescript
// SEO 元数据管理
engine.router.afterEach((to) => {
  // 更新页面标题
  document.title = to.meta?.title
    ? `${to.meta.title} - ${engine.config.appName}`
    : engine.config.appName

  // 更新 meta 标签
  updateMetaTags({
    description: to.meta?.description,
    keywords: to.meta?.keywords,
    ogTitle: to.meta?.ogTitle || to.meta?.title,
    ogDescription: to.meta?.ogDescription || to.meta?.description,
  })
})

function updateMetaTags(meta: Record<string, string>) {
  Object.entries(meta).forEach(([key, value]) => {
    if (value) {
      let element = document.querySelector(`meta[name="${key}"]`)

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', key)
        document.head.appendChild(element)
      }

      element.setAttribute('content', value)
    }
  })
}
```

通过这些集成方式，你可以充分利用 Vue Router 的强大功能，同时享受 LDesign Engine 提供的额外特性。
