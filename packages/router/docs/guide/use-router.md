# useRouter 指南

`useRouter` 是 LDesign Router 提供的组合式 API，让你在组件中轻松进行编程式导航和路由控制。

## 🎯 基础用法

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

<template>
  <button @click="navigateToHome">回到首页</button>
</template>
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
      goHome: () => router.push('/'),
    }
  },
}
</script>
```

## 🧭 编程式导航

### push() - 导航到新路由

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

// 处理导航结果
async function navigateWithErrorHandling() {
  try {
    await router.push('/protected-page')
    console.log('导航成功')
  } catch (error) {
    console.error('导航失败:', error)
    // 显示错误提示
    showErrorMessage('页面访问失败，请重试')
  }
}
</script>

<template>
  <div class="navigation-buttons">
    <button @click="goToAbout">关于我们</button>
    <button @click="goToUser('123')">用户123</button>
    <button @click="goToUserProfile('456')">用户资料</button>
    <button @click="searchProducts('vue')">搜索Vue</button>
    <button @click="navigateWithErrorHandling">安全导航</button>
  </div>
</template>
```

### replace() - 替换当前路由

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 替换当前路由（不会在历史记录中留下记录）
function replaceWithLogin() {
  router.replace('/login')
}

// 登录成功后重定向
function handleLoginSuccess() {
  const redirectPath = route.query.redirect || '/dashboard'
  router.replace(redirectPath)
}

// 错误页面重定向
function handleError(errorType) {
  switch (errorType) {
    case '404':
      router.replace('/not-found')
      break
    case '403':
      router.replace('/forbidden')
      break
    default:
      router.replace('/error')
  }
}
</script>

<template>
  <div class="auth-actions">
    <button @click="replaceWithLogin">去登录</button>
    <button @click="handleLoginSuccess">登录成功</button>
    <button @click="handleError('404')">模拟404</button>
  </div>
</template>
```

### 历史导航

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 后退
function goBack() {
  router.back()
}

// 前进
function goForward() {
  router.forward()
}

// 指定步数
function goBackTwoSteps() {
  router.go(-2)
}

// 智能后退（如果没有历史记录则回到首页）
function smartGoBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="history-controls">
    <button @click="goBack">后退</button>
    <button @click="goForward">前进</button>
    <button @click="goBackTwoSteps">后退两步</button>
    <button @click="smartGoBack">智能后退</button>
  </div>
</template>
```

## 🚀 智能预加载

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

// 条件预加载
function conditionalPreload(userType) {
  if (userType === 'premium') {
    // 高级用户预加载更多页面
    router.preloadRoute('/premium-features')
    router.preloadRoute('/advanced-settings')
  } else {
    // 普通用户只预加载基础页面
    router.preloadRoute('/basic-features')
  }
}

// 清除预加载缓存
function clearPreloadCache() {
  router.clearPreloadCache()
}
</script>

<template>
  <div class="preload-controls">
    <button @click="preloadUserPage('123')">预加载用户页</button>
    <button @click="preloadImportantPages">预加载重要页面</button>
    <button @click="conditionalPreload('premium')">条件预加载</button>
    <button @click="clearPreloadCache">清除预加载缓存</button>
  </div>
</template>
```

## 💾 缓存管理

```vue
<script setup>
import { useRouter } from '@ldesign/router'
import { onMounted, ref } from 'vue'

const router = useRouter()
const cacheStats = ref({})

// 获取缓存统计
function updateCacheStats() {
  cacheStats.value = router.getCacheStats()
}

// 清除所有缓存
function clearAllCache() {
  router.clearRouteCache()
  updateCacheStats()
}

// 清除特定路由缓存
function clearUserCache(userId) {
  router.clearRouteCache(`/user/${userId}`)
  updateCacheStats()
}

// 清除过期缓存
function clearExpiredCache() {
  // LDesign Router 会自动清除过期缓存
  // 这里可以手动触发清理
  router.clearRouteCache(/.*/, { onlyExpired: true })
  updateCacheStats()
}

onMounted(() => {
  updateCacheStats()

  // 定期更新缓存统计
  setInterval(updateCacheStats, 5000)
})
</script>

<template>
  <div class="cache-management">
    <div class="cache-stats">
      <h3>缓存统计</h3>
      <p>缓存大小: {{ cacheStats.size }}</p>
      <p>命中率: {{ cacheStats.hitRate }}%</p>
      <p>总命中: {{ cacheStats.totalHits }}</p>
    </div>

    <div class="cache-controls">
      <button @click="clearAllCache">清除所有缓存</button>
      <button @click="clearUserCache('123')">清除用户缓存</button>
      <button @click="clearExpiredCache">清除过期缓存</button>
    </div>
  </div>
</template>
```

## 📊 性能监控

```vue
<script setup>
import { useRouter } from '@ldesign/router'
import { onMounted, ref } from 'vue'

const router = useRouter()
const performanceStats = ref({})

// 获取性能统计
function updatePerformanceStats() {
  performanceStats.value = router.getPerformanceStats()
}

// 监控导航性能
function setupPerformanceMonitoring() {
  router.afterEach(() => {
    const stats = router.getPerformanceStats()

    // 性能告警
    if (stats.averageDuration > 1000) {
      console.warn('⚠️ 导航性能较慢:', `${stats.averageDuration}ms`)
      showPerformanceWarning()
    }

    // 更新统计
    updatePerformanceStats()
  })
}

// 性能优化建议
function getPerformanceRecommendations() {
  const stats = performanceStats.value
  const recommendations = []

  if (stats.averageDuration > 1000) {
    recommendations.push('考虑启用更多预加载策略')
  }

  if (stats.successRate < 0.95) {
    recommendations.push('检查路由配置和错误处理')
  }

  return recommendations
}

onMounted(() => {
  setupPerformanceMonitoring()
  updatePerformanceStats()
})
</script>

<template>
  <div class="performance-monitor">
    <div class="performance-stats">
      <h3>性能统计</h3>
      <p>总导航次数: {{ performanceStats.totalNavigations }}</p>
      <p>平均时间: {{ performanceStats.averageDuration }}ms</p>
      <p>成功率: {{ performanceStats.successRate }}%</p>
    </div>

    <div class="recommendations">
      <h4>优化建议</h4>
      <ul>
        <li v-for="rec in getPerformanceRecommendations()" :key="rec">
          {{ rec }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

## 🛡️ 路由守卫

```vue
<script setup>
import { useRouter } from '@ldesign/router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 设置全局守卫
function setupGlobalGuards() {
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    console.log('导航到:', to.path)

    // 检查认证
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next('/login')
      return
    }

    // 检查权限
    if (to.meta.roles && !hasAnyRole(to.meta.roles)) {
      next('/403')
      return
    }

    next()
  })

  // 全局后置钩子
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
}

// 检查用户角色
function hasAnyRole(requiredRoles) {
  const userRoles = authStore.user?.roles || []
  return requiredRoles.some(role => userRoles.includes(role))
}

onMounted(() => {
  setupGlobalGuards()
})
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

    // 预加载用户相关页面
    router.preloadRoute('/profile')
    router.preloadRoute('/settings')
  } catch (error) {
    console.error('登录失败:', error)
    showErrorMessage('登录失败，请检查用户名和密码')
  }
}

// 登出
async function logout() {
  await authStore.logout()

  // 清除用户相关缓存
  router.clearRouteCache(/^\/user/)
  router.clearRouteCache(/^\/profile/)

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

// 快速搜索
function quickSearch(keyword) {
  searchQuery.value = keyword
}
</script>

<template>
  <div class="search-interface">
    <div class="search-controls">
      <input v-model="searchQuery" placeholder="搜索..." class="search-input" />

      <select v-model="category" class="category-select">
        <option value="all">所有分类</option>
        <option value="products">产品</option>
        <option value="articles">文章</option>
      </select>

      <select v-model="sortBy" class="sort-select">
        <option value="date">按日期</option>
        <option value="name">按名称</option>
        <option value="popularity">按热度</option>
      </select>

      <button @click="resetSearch">重置</button>
    </div>

    <div class="quick-search">
      <button @click="quickSearch('vue')">Vue</button>
      <button @click="quickSearch('react')">React</button>
      <button @click="quickSearch('angular')">Angular</button>
    </div>
  </div>
</template>
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
      showErrorMessage('页面跳转失败，请重试')
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
