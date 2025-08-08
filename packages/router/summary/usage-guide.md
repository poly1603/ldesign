# LDesign Router 使用指南

## 🚀 快速上手

### 基础安装和配置

```bash
# 安装
pnpm add @ldesign/router

# 或使用其他包管理器
npm install @ldesign/router
yarn add @ldesign/router
```

### 最简配置

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/about', component: () => import('./views/About.vue') },
  ],
})

const app = createApp(App)
app.use(router)
app.mount('#app')
```

## 📋 核心功能使用

### 1. 路由配置

#### 基础路由

```typescript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('./views/User.vue'),
    props: true, // 将参数作为 props 传递
    meta: { requiresAuth: true },
  },
]
```

#### 嵌套路由

```typescript
{
  path: '/admin',
  component: () => import('./layouts/AdminLayout.vue'),
  children: [
    {
      path: 'dashboard',
      name: 'AdminDashboard',
      component: () => import('./views/admin/Dashboard.vue')
    },
    {
      path: 'users',
      name: 'AdminUsers',
      component: () => import('./views/admin/Users.vue')
    }
  ]
}
```

#### 动态路由

```typescript
// 运行时添加路由
router.addRoute({
  path: '/dynamic/:id',
  name: 'Dynamic',
  component: () => import('./views/Dynamic.vue'),
})

// 添加子路由
router.addRoute('Parent', {
  path: 'child',
  name: 'Child',
  component: ChildComponent,
})
```

### 2. 导航方式

#### 声明式导航

```vue
<template>
  <!-- 基础链接 -->
  <RouterLink to="/about"> 关于我们 </RouterLink>

  <!-- 命名路由 -->
  <RouterLink :to="{ name: 'User', params: { id: '123' } }"> 用户资料 </RouterLink>

  <!-- 带查询参数 -->
  <RouterLink :to="{ path: '/search', query: { q: 'vue' } }"> 搜索 </RouterLink>

  <!-- 智能预加载 -->
  <RouterLink to="/products" preload="hover"> 产品列表 </RouterLink>
</template>
```

#### 编程式导航

```typescript
const router = useRouter()

// 导航到指定路径
router.push('/about')

// 导航到命名路由
router.push({ name: 'User', params: { id: '123' } })

// 替换当前路由
router.replace('/login')

// 历史导航
router.go(-1) // 后退
router.back() // 后退
router.forward() // 前进
```

### 3. 路由信息获取

```typescript
const route = useRoute()

// 当前路径
const currentPath = computed(() => route.path)

// 路由参数
const userId = computed(() => route.params.id)

// 查询参数
const searchQuery = computed(() => route.query.q)

// 路由元信息
const pageTitle = computed(() => route.meta.title)

// 监听路由变化
watch(
  () => route.params.id,
  newId => {
    loadUserData(newId)
  }
)
```

## 🎯 高级功能使用

### 1. 智能预加载

#### 配置预加载策略

```typescript
const router = createRouter({
  routes,
  preloadStrategy: 'hover', // hover | visible | idle | immediate
})
```

#### 组件级预加载控制

```vue
<template>
  <!-- 悬停预加载 -->
  <RouterLink to="/heavy-page" preload="hover"> 重型页面 </RouterLink>

  <!-- 可见时预加载 -->
  <RouterLink to="/products" preload="visible"> 产品列表 </RouterLink>

  <!-- 立即预加载 -->
  <RouterLink to="/important" preload="immediate"> 重要页面 </RouterLink>
</template>
```

#### 编程式预加载

```typescript
// 预加载指定路由
router.preloadRoute('/user/123')
router.preloadRoute({ name: 'ProductDetail', params: { id: '456' } })

// 清除预加载缓存
router.clearPreloadCache()
router.clearPreloadCache('/user/123')
```

### 2. 智能缓存

#### 缓存配置

```typescript
const router = createRouter({
  routes,
  cache: {
    max: 20, // 最大缓存数量
    ttl: 10 * 60 * 1000, // 10分钟过期
    include: [
      // 包含规则
      'Home', // 路由名称
      /^User/, // 正则匹配
      '/products', // 路径匹配
    ],
    exclude: [
      // 排除规则
      '/realtime-data', // 实时数据页面
      'Payment', // 支付页面
    ],
  },
})
```

#### 缓存控制

```typescript
// 获取缓存统计
const cacheStats = router.getCacheStats()
console.log('缓存命中率:', cacheStats.hitRate)

// 清除缓存
router.clearRouteCache() // 清除所有缓存
router.clearRouteCache('/user/123') // 清除指定路由缓存
```

#### 路由级缓存控制

```typescript
{
  path: '/user/:id',
  component: UserComponent,
  meta: {
    cache: true,              // 启用缓存
    cacheTTL: 5 * 60 * 1000  // 自定义过期时间
  }
}
```

### 3. 性能监控

#### 启用性能监控

```typescript
const router = createRouter({
  routes,
  performance: true,
})
```

#### 获取性能统计

```typescript
// 获取性能统计
const stats = router.getPerformanceStats()
console.log('性能统计:', {
  totalNavigations: stats.totalNavigations,
  averageDuration: stats.averageDuration,
  successRate: stats.successRate,
  fastestNavigation: stats.fastestNavigation,
  slowestNavigation: stats.slowestNavigation,
})
```

#### 性能监控钩子

```typescript
router.afterEach((to, from) => {
  const stats = router.getPerformanceStats()

  // 性能告警
  if (stats.averageDuration > 1000) {
    console.warn('⚠️ 导航性能较慢，建议优化')
  }

  // 发送性能数据到分析服务
  analytics.track('navigation_performance', {
    from: from.path,
    to: to.path,
    duration: stats.averageDuration,
  })
})
```

### 4. 导航守卫

#### 全局守卫

```typescript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 身份验证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
    return
  }

  // 权限检查
  if (to.meta.roles && !hasPermission(to.meta.roles)) {
    next('/403')
    return
  }

  next()
})

// 全局解析守卫
router.beforeResolve((to, from, next) => {
  // 在导航被确认之前调用
  console.log('即将导航到:', to.path)
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 更新页面标题
  document.title = to.meta.title || 'My App'

  // 发送页面浏览统计
  analytics.track('page_view', {
    path: to.path,
    name: to.name,
  })
})
```

#### 路由级守卫

```typescript
{
  path: '/admin',
  beforeEnter: (to, from, next) => {
    if (!isAdmin()) {
      next('/403')
    } else {
      next()
    }
  }
}
```

#### 组件内守卫

```typescript
export default defineComponent({
  beforeRouteEnter(to, from, next) {
    // 进入路由前
    next(vm => {
      // 通过 vm 访问组件实例
    })
  },

  beforeRouteUpdate(to, from, next) {
    // 路由更新时（参数变化）
    this.loadData(to.params.id)
    next()
  },

  beforeRouteLeave(to, from, next) {
    // 离开路由前
    if (this.hasUnsavedChanges) {
      const answer = confirm('有未保存的更改，确定要离开吗？')
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  },
})
```

## 🎨 组件使用

### RouterView 组件

#### 基础用法

```vue
<template>
  <!-- 基础路由视图 -->
  <RouterView />

  <!-- 命名视图 -->
  <RouterView name="sidebar" />
  <RouterView name="main" />
</template>
```

#### 带过渡动画

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in" appear>
      <component :is="Component" :key="route.path" />
    </transition>
  </RouterView>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### RouterLink 组件

#### 高级用法

```vue
<template>
  <!-- 自定义激活样式 -->
  <RouterLink to="/about" active-class="active" exact-active-class="exact-active">
    关于我们
  </RouterLink>

  <!-- 自定义标签 -->
  <RouterLink v-slot="{ href, navigate }" to="/external" custom>
    <a :href="href" target="_blank" @click="navigate"> 外部链接 </a>
  </RouterLink>

  <!-- 条件渲染 -->
  <RouterLink v-if="showLink" :to="dynamicRoute" :preload="preloadStrategy"> 动态链接 </RouterLink>
</template>
```

## 🔧 最佳实践

### 1. 路由组织

```typescript
// 按功能模块组织路由
const userRoutes = [
  {
    path: '/user',
    component: () => import('./layouts/UserLayout.vue'),
    children: [
      { path: 'profile', component: () => import('./views/user/Profile.vue') },
      { path: 'settings', component: () => import('./views/user/Settings.vue') },
    ],
  },
]

const adminRoutes = [
  {
    path: '/admin',
    component: () => import('./layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: 'dashboard', component: () => import('./views/admin/Dashboard.vue') },
      { path: 'users', component: () => import('./views/admin/Users.vue') },
    ],
  },
]

const routes = [
  ...userRoutes,
  ...adminRoutes,
  // 其他路由...
]
```

### 2. 性能优化

```typescript
// 合理配置预加载和缓存
const router = createRouter({
  routes,
  preloadStrategy: 'hover', // 平衡性能与体验
  cache: {
    max: 20, // 根据应用规模调整
    ttl: 5 * 60 * 1000, // 根据数据更新频率调整
    include: [/^\/user/, 'Home'], // 缓存重要页面
    exclude: ['/realtime'], // 排除实时数据页面
  },
  performance: true, // 生产环境可关闭
})
```

### 3. 错误处理

```typescript
// 统一错误处理
router.onError((error, to, from) => {
  console.error('路由错误:', error)

  // 发送错误报告
  errorReporting.captureException(error, {
    tags: { section: 'router' },
    extra: { from: from.path, to: to.path },
  })

  // 用户友好的错误提示
  if (error.message.includes('Loading chunk')) {
    message.error('页面加载失败，请刷新重试')
  }
})
```

### 4. 类型安全

```typescript
// 定义路由参数类型
interface UserRouteParams {
  id: string
}

// 类型安全的路由使用
const route = useRoute<UserRouteParams>()
const userId = computed(() => route.params.id) // 类型为 string

// 类型安全的导航
router.push({
  name: 'User',
  params: { id: '123' } as UserRouteParams,
})
```

这个使用指南涵盖了 LDesign Router 的所有主要功能和最佳实践，帮助开发者快速上手并充分利用路由库的强大
功能。
