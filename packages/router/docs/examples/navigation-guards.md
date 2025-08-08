# 导航守卫示例

展示如何使用 LDesign Router 的导航守卫实现权限控制、数据预加载和用户体验优化。

## 🎯 示例概述

构建一个完整的权限控制系统，包含：

- 用户认证检查
- 角色权限验证
- 数据预加载
- 页面访问日志

## 🛡️ 权限系统设计

```typescript
// types/auth.ts
export interface User {
  id: string
  username: string
  email: string
  roles: string[]
  permissions: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// 权限定义
export const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  ADMIN_ACCESS: 'admin:access',
  CONTENT_MANAGE: 'content:manage',
} as const

export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
} as const
```

## 🔧 守卫实现

### 认证守卫

```typescript
// guards/auth.ts
import { NavigationGuard } from '@ldesign/router'
import { useAuthStore } from '@/stores/auth'

export const authGuard: NavigationGuard = async (to, from, next) => {
  const authStore = useAuthStore()

  // 检查是否需要认证
  if (!to.meta.requiresAuth) {
    return next()
  }

  // 检查是否已登录
  if (!authStore.isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  // 验证 token 有效性
  try {
    const isValid = await authStore.validateToken()
    if (!isValid) {
      authStore.logout()
      return next({
        path: '/login',
        query: { redirect: to.fullPath, reason: 'token_expired' },
      })
    }
  } catch (error) {
    console.error('Token 验证失败:', error)
    return next('/login')
  }

  next()
}

// 权限守卫
export const permissionGuard: NavigationGuard = (to, from, next) => {
  const authStore = useAuthStore()

  // 检查角色权限
  const requiredRoles = to.meta.roles as string[]
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = authStore.user?.roles || []
    const hasRole = requiredRoles.some(role => userRoles.includes(role))

    if (!hasRole) {
      return next({
        name: 'Forbidden',
        params: { message: '您没有访问此页面的权限' },
      })
    }
  }

  // 检查具体权限
  const requiredPermissions = to.meta.permissions as string[]
  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPermissions = authStore.user?.permissions || []
    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    )

    if (!hasPermission) {
      return next({
        name: 'Forbidden',
        params: { message: '权限不足，无法访问此页面' },
      })
    }
  }

  next()
}
```

### 数据预加载守卫

```typescript
// guards/preload.ts
export const preloadGuard: NavigationGuard = async (to, from, next) => {
  const preloadData = to.meta.preloadData

  if (!preloadData) {
    return next()
  }

  try {
    // 显示全局加载状态
    showGlobalLoading()

    // 并行加载多个数据源
    const dataPromises = Object.entries(preloadData).map(async ([key, loader]) => {
      const data = await (loader as Function)(to)
      return [key, data]
    })

    const results = await Promise.all(dataPromises)
    const preloadedData = Object.fromEntries(results)

    // 将预加载的数据存储到路由元信息中
    to.meta.preloadedData = preloadedData

    next()
  } catch (error) {
    console.error('数据预加载失败:', error)

    // 根据错误类型决定处理方式
    if (error.status === 404) {
      next('/404')
    } else if (error.status === 403) {
      next('/403')
    } else {
      // 允许继续导航，但在组件中处理错误
      to.meta.preloadError = error
      next()
    }
  } finally {
    hideGlobalLoading()
  }
}

// 数据加载器
export const dataLoaders = {
  user: async (route: RouteLocationNormalized) => {
    const response = await fetch(`/api/users/${route.params.id}`)
    if (!response.ok) throw new Error('用户不存在')
    return response.json()
  },

  posts: async (route: RouteLocationNormalized) => {
    const page = route.query.page || 1
    const response = await fetch(`/api/posts?page=${page}`)
    return response.json()
  },

  categories: async () => {
    const response = await fetch('/api/categories')
    return response.json()
  },
}
```

### 访问日志守卫

```typescript
// guards/analytics.ts
export const analyticsGuard: NavigationGuard = (to, from, next) => {
  // 记录页面访问
  const accessLog = {
    path: to.path,
    name: to.name,
    params: to.params,
    query: to.query,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    referrer: from.fullPath,
  }

  // 发送到分析服务
  analytics.track('page_view', accessLog)

  // 记录到本地存储（用于离线分析）
  const logs = JSON.parse(localStorage.getItem('access_logs') || '[]')
  logs.push(accessLog)

  // 限制日志数量
  if (logs.length > 100) {
    logs.shift()
  }

  localStorage.setItem('access_logs', JSON.stringify(logs))

  next()
}

// 性能监控守卫
export const performanceGuard: NavigationGuard = (to, from, next) => {
  const startTime = performance.now()

  next()

  // 在下一个事件循环中记录性能
  setTimeout(() => {
    const endTime = performance.now()
    const duration = endTime - startTime

    // 记录导航性能
    analytics.track('navigation_performance', {
      from: from.path,
      to: to.path,
      duration,
      timestamp: Date.now(),
    })

    // 性能告警
    if (duration > 1000) {
      console.warn(`慢导航检测: ${from.path} -> ${to.path} (${duration}ms)`)
    }
  }, 0)
}
```

## 🎯 路由配置

```typescript
// router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router'
import { analyticsGuard, performanceGuard } from './guards/analytics'
import { authGuard, permissionGuard } from './guards/auth'
import { dataLoaders, preloadGuard } from './guards/preload'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录',
      guest: true, // 只允许未登录用户访问
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      title: '仪表板',
      requiresAuth: true,
      roles: ['user', 'admin'],
      preloadData: {
        user: dataLoaders.user,
        stats: async () => {
          const response = await fetch('/api/dashboard/stats')
          return response.json()
        },
      },
    },
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permissions: ['admin:access'],
    },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '管理后台' },
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('../views/admin/UserManagement.vue'),
        meta: {
          title: '用户管理',
          permissions: ['user:read'],
          preloadData: {
            users: dataLoaders.posts,
            roles: async () => {
              const response = await fetch('/api/roles')
              return response.json()
            },
          },
        },
      },
      {
        path: 'users/:id/edit',
        name: 'UserEdit',
        component: () => import('../views/admin/UserEdit.vue'),
        props: true,
        meta: {
          title: '编辑用户',
          permissions: ['user:write'],
          preloadData: {
            user: dataLoaders.user,
          },
        },
      },
    ],
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      title: '个人资料',
      requiresAuth: true,
      preloadData: {
        user: async () => {
          const response = await fetch('/api/user/profile')
          return response.json()
        },
      },
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  // 启用高级功能
  preloadStrategy: 'hover',
  cache: { max: 20, ttl: 5 * 60 * 1000 },
  performance: true,
})

// 全局守卫链
router.beforeEach(analyticsGuard)
router.beforeEach(performanceGuard)
router.beforeEach(authGuard)
router.beforeEach(permissionGuard)
router.beforeEach(preloadGuard)

// 游客页面守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 如果是游客页面且用户已登录，重定向到首页
  if (to.meta.guest && authStore.isAuthenticated) {
    return next('/')
  }

  next()
})

// 页面标题更新
router.afterEach(to => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 我的应用`
  }
})

// 错误处理
router.onError((error, to, from) => {
  console.error('路由错误:', error)

  // 发送错误报告
  analytics.track('router_error', {
    error: error.message,
    to: to.path,
    from: from.path,
    timestamp: Date.now(),
  })
})

export default router
```

## 🎨 组件内守卫

```vue
<!-- views/admin/UserEdit.vue -->
<script setup>
import { onBeforeRouteLeave, useRoute, useRouter } from '@ldesign/router'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  id: String,
})

const route = useRoute()
const router = useRouter()

const form = ref({
  username: '',
  email: '',
})

const originalData = ref({})
const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalData.value)
})

// 从预加载数据中获取用户信息
function loadUserData() {
  const preloadedData = route.meta.preloadedData
  if (preloadedData?.user) {
    form.value = { ...preloadedData.user }
    originalData.value = { ...preloadedData.user }
  }
}

// 保存用户
async function saveUser() {
  try {
    await fetch(`/api/users/${props.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })

    // 更新原始数据
    originalData.value = { ...form.value }

    // 显示成功消息
    showSuccessMessage('用户信息已保存')
  } catch (error) {
    showErrorMessage('保存失败，请重试')
  }
}

// 取消编辑
function cancel() {
  if (hasChanges.value) {
    if (confirm('有未保存的更改，确定要离开吗？')) {
      router.back()
    }
  } else {
    router.back()
  }
}

// 离开守卫
onBeforeRouteLeave((to, from, next) => {
  if (hasChanges.value) {
    const answer = confirm('有未保存的更改，确定要离开吗？')
    next(answer)
  } else {
    next()
  }
})

// 监听路由变化
watch(() => route.meta.preloadedData, loadUserData, { immediate: true })
</script>

<template>
  <div class="user-edit">
    <form @submit.prevent="saveUser">
      <div class="form-group">
        <label>用户名</label>
        <input v-model="form.username" required />
      </div>

      <div class="form-group">
        <label>邮箱</label>
        <input v-model="form.email" type="email" required />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="!hasChanges">保存</button>
        <button type="button" @click="cancel">取消</button>
      </div>
    </form>
  </div>
</template>
```

## 🎯 关键特性

### 1. 分层权限控制

- 认证检查 → 角色验证 → 权限验证
- 支持细粒度权限控制
- 友好的错误提示

### 2. 智能数据预加载

- 并行加载多个数据源
- 错误处理和降级策略
- 全局加载状态管理

### 3. 完整的访问日志

- 页面访问统计
- 性能监控
- 错误追踪

### 4. 用户体验优化

- 离开确认对话框
- 表单数据保护
- 智能重定向

这个示例展示了如何构建一个完整的权限控制系统，充分利用 LDesign Router 的导航守卫功能。
