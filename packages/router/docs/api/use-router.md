# useRouter API

`useRouter` 是 LDesign Router 提供的组合式 API，用于在组件中访问路由器实例，进行编程式导航和路由控制
。

## 📋 基础用法

### 获取路由器实例

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 现在可以使用 router 的所有方法
function navigateToHome() {
  router.push('/')
}
</script>
```

### 在 Options API 中使用

```vue
<script>
import { useRouter } from '@ldesign/router'

export default {
  setup() {
    const router = useRouter()

    return {
      router,
      navigateToHome: () => router.push('/'),
    }
  },
}
</script>
```

## 🧭 导航方法

### push()

导航到新的路由位置。

**签名：** `push(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>`

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 字符串路径
function goToAbout() {
  router.push('/about')
}

// 对象形式
function goToUser(userId) {
  router.push({
    path: `/user/${userId}`,
  })
}

// 命名路由
function goToUserProfile(userId) {
  router.push({
    name: 'UserProfile',
    params: { id: userId },
  })
}

// 带查询参数
function searchProducts(keyword) {
  router.push({
    path: '/search',
    query: { q: keyword, category: 'products' },
  })
}

// 带锚点
function goToSection() {
  router.push({
    path: '/docs',
    hash: '#installation',
  })
}

// 处理导航结果
async function navigateWithErrorHandling() {
  try {
    await router.push('/protected-page')
    console.log('导航成功')
  } catch (error) {
    console.error('导航失败:', error)
  }
}
</script>
```

### replace()

替换当前路由，不会在历史记录中留下记录。

**签名：** `replace(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>`

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 替换当前路由
function replaceWithLogin() {
  router.replace('/login')
}

// 登录成功后重定向
function handleLoginSuccess() {
  const redirectPath = route.query.redirect || '/dashboard'
  router.replace(redirectPath)
}
</script>
```

### go()

在历史记录中前进或后退指定步数。

**签名：** `go(delta: number): void`

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 后退一步
function goBack() {
  router.go(-1)
}

// 前进一步
function goForward() {
  router.go(1)
}

// 后退两步
function goBackTwoSteps() {
  router.go(-2)
}
</script>
```

### back()

后退一步，等同于 `go(-1)`。

**签名：** `back(): void`

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>
```

### forward()

前进一步，等同于 `go(1)`。

**签名：** `forward(): void`

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

function goForward() {
  router.forward()
}
</script>
```

## 🎯 路由解析

### resolve()

解析路由位置，返回标准化的路由对象。

**签名：** `resolve(to: RouteLocationRaw): RouteLocationResolved`

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 解析路由
function resolveUserRoute(userId) {
  const resolved = router.resolve({
    name: 'UserProfile',
    params: { id: userId },
  })

  console.log('解析结果:', {
    path: resolved.path,
    fullPath: resolved.fullPath,
    href: resolved.href,
    name: resolved.name,
    params: resolved.params,
  })

  return resolved
}

// 生成链接
function generateUserLink(userId) {
  const resolved = router.resolve({
    name: 'UserProfile',
    params: { id: userId },
  })
  return resolved.href
}

// 检查路由是否存在
function checkRouteExists(routeName) {
  try {
    const resolved = router.resolve({ name: routeName })
    return resolved.matched.length > 0
  } catch {
    return false
  }
}
</script>
```

## 🚀 高级功能

### 智能预加载

LDesign Router 的独特功能：

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 预加载指定路由
function preloadUserPage(userId) {
  router.preloadRoute({
    name: 'UserProfile',
    params: { id: userId },
  })
}

// 批量预加载重要页面
function preloadImportantPages() {
  const importantRoutes = ['/dashboard', '/user/profile', '/settings']

  importantRoutes.forEach(route => {
    router.preloadRoute(route)
  })
}

// 清除预加载缓存
function clearPreloadCache() {
  router.clearPreloadCache()
}

// 清除特定路由的预加载缓存
function clearUserPreloadCache(userId) {
  router.clearPreloadCache(`/user/${userId}`)
}
</script>
```

### 缓存管理

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 获取缓存统计
function getCacheInfo() {
  const stats = router.getCacheStats()
  console.log('缓存统计:', {
    size: stats.size,
    hitRate: stats.hitRate,
    totalHits: stats.totalHits,
  })
  return stats
}

// 清除所有缓存
function clearAllCache() {
  router.clearRouteCache()
}

// 清除特定路由缓存
function clearUserCache(userId) {
  router.clearRouteCache(`/user/${userId}`)
}
</script>
```

### 性能监控

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 获取性能统计
function getPerformanceStats() {
  const stats = router.getPerformanceStats()
  console.log('性能统计:', {
    totalNavigations: stats.totalNavigations,
    averageDuration: stats.averageDuration,
    successRate: stats.successRate,
  })
  return stats
}

// 监控导航性能
function monitorNavigation() {
  router.afterEach(() => {
    const stats = router.getPerformanceStats()

    if (stats.averageDuration > 1000) {
      console.warn('导航性能较慢:', `${stats.averageDuration}ms`)
    }
  })
}
</script>
```

## 🛡️ 路由守卫

### 添加全局守卫

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('导航到:', to.path)

  // 检查认证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

// 添加全局后置钩子
router.afterEach((to, from) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 发送页面浏览统计
  analytics.track('page_view', {
    path: to.path,
    name: to.name,
  })
})

// 错误处理
router.onError((error, to, from) => {
  console.error('路由错误:', error)

  // 发送错误报告
  errorReporting.captureException(error, {
    tags: { section: 'router' },
    extra: { to: to.path, from: from.path },
  })
})
</script>
```

## 🔧 路由管理

### 动态路由

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 添加路由
function addUserRoute(userId) {
  router.addRoute({
    path: `/user/${userId}`,
    name: `User${userId}`,
    component: () => import('./UserProfile.vue'),
    meta: { userId },
  })
}

// 移除路由
function removeUserRoute(userId) {
  router.removeRoute(`User${userId}`)
}

// 检查路由是否存在
function hasRoute(routeName) {
  return router.hasRoute(routeName)
}

// 获取所有路由
function getAllRoutes() {
  return router.getRoutes()
}
</script>
```

### 路由状态

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 检查路由器是否准备就绪
async function checkRouterReady() {
  await router.isReady()
  console.log('路由器已准备就绪')
}

// 获取当前路由
function getCurrentRoute() {
  return router.currentRoute.value
}

// 监听路由变化
watch(
  () => router.currentRoute.value,
  (newRoute, oldRoute) => {
    console.log('路由变化:', oldRoute.path, '->', newRoute.path)
  }
)
</script>
```

## 🎯 实际应用示例

### 用户认证流程

```vue
<script setup>
import { useRouter } from '@ldesign/router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 登录
async function login(credentials) {
  try {
    await authStore.login(credentials)

    // 登录成功后重定向
    const redirectPath = router.currentRoute.value.query.redirect || '/dashboard'
    router.replace(redirectPath)
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 登出
async function logout() {
  await authStore.logout()
  router.push('/login')
}

// 检查认证状态
function checkAuth() {
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath },
    })
  }
}
</script>
```

### 面包屑导航

```vue
<script setup>
import { useRoute, useRouter } from '@ldesign/router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

// 生成面包屑
const breadcrumbs = computed(() => {
  return route.matched
    .filter(record => record.meta?.title)
    .map(record => ({
      title: record.meta.title,
      path: record.path,
      name: record.name,
    }))
})

// 面包屑导航
function navigateToBreadcrumb(breadcrumb) {
  if (breadcrumb.name) {
    router.push({ name: breadcrumb.name })
  } else {
    router.push(breadcrumb.path)
  }
}
</script>

<template>
  <nav class="breadcrumb">
    <span v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
      <button class="breadcrumb-link" @click="navigateToBreadcrumb(crumb)">
        {{ crumb.title }}
      </button>
      <span v-if="index < breadcrumbs.length - 1" class="separator"> / </span>
    </span>
  </nav>
</template>
```

### 搜索和过滤

```vue
<script setup>
import { useRoute, useRouter } from '@ldesign/router'
import { ref, watch } from 'vue'

const router = useRouter()
const route = useRoute()

const searchQuery = ref(route.query.q || '')
const category = ref(route.query.category || 'all')
const sortBy = ref(route.query.sort || 'date')

// 更新 URL 查询参数
function updateQuery() {
  router.push({
    path: route.path,
    query: {
      q: searchQuery.value || undefined,
      category: category.value !== 'all' ? category.value : undefined,
      sort: sortBy.value !== 'date' ? sortBy.value : undefined,
    },
  })
}

// 监听查询参数变化
watch([searchQuery, category, sortBy], updateQuery)

// 重置搜索
function resetSearch() {
  searchQuery.value = ''
  category.value = 'all'
  sortBy.value = 'date'
}
</script>
```

## 🎯 最佳实践

### 1. 错误处理

```vue
<script setup>
// ✅ 推荐：处理导航错误
async function safeNavigate(to) {
  try {
    await router.push(to)
  } catch (error) {
    if (error.name !== 'NavigationDuplicated') {
      console.error('导航失败:', error)
      // 显示错误提示
    }
  }
}

// ❌ 避免：忽略导航错误
function unsafeNavigate(to) {
  router.push(to) // 可能抛出未处理的错误
}
</script>
```

### 2. 性能优化

```vue
<script setup>
// ✅ 推荐：合理使用预加载
function preloadImportantPages() {
  // 只预加载重要页面
  router.preloadRoute('/dashboard')
  router.preloadRoute('/profile')
}

// ✅ 推荐：监控性能
function monitorPerformance() {
  router.afterEach(() => {
    const stats = router.getPerformanceStats()
    if (stats.averageDuration > 1000) {
      console.warn('导航性能需要优化')
    }
  })
}
</script>
```

### 3. 类型安全

```typescript
// ✅ 推荐：使用类型安全的导航
interface UserRouteParams {
  id: string
}

function navigateToUser(id: string) {
  router.push({
    name: 'User',
    params: { id } as UserRouteParams,
  })
}

// ✅ 推荐：定义路由名称常量
const ROUTE_NAMES = {
  HOME: 'Home',
  USER_PROFILE: 'UserProfile',
  SETTINGS: 'Settings',
} as const

function goToSettings() {
  router.push({ name: ROUTE_NAMES.SETTINGS })
}
```

`useRouter` 是在组件中进行路由操作的主要接口，掌握其各种方法和最佳实践将帮助你构建出功能强大、用户体
验优秀的应用。
