# RouteLocation API

RouteLocation 对象包含了当前路由的所有信息，是路由系统中最重要的数据结构之一。

## 📋 接口定义

### RouteLocationNormalized

标准化的路由位置对象，包含完整的路由信息：

```typescript
interface RouteLocationNormalized {
  path: string // 当前路径
  name: string | null | undefined // 路由名称
  params: RouteParams // 路径参数
  query: LocationQuery // 查询参数
  hash: string // 锚点
  meta: RouteMeta // 元信息
  matched: RouteRecordNormalized[] // 匹配的路由记录
  redirectedFrom?: RouteLocation // 重定向来源
}
```

### RouteLocationRaw

原始路由位置，可以是字符串或对象：

```typescript
type RouteLocationRaw = string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric

// 字符串形式
'/user/123'
'/user/123?tab=profile#section1'

// 对象形式
{
  path: '/user/123',
  query: { tab: 'profile' },
  hash: '#section1'
}

// 命名路由形式
{
  name: 'UserProfile',
  params: { id: '123' },
  query: { tab: 'profile' }
}
```

## 🎯 属性详解

### path

当前路由的完整路径（不包含查询参数和锚点）。

```typescript
// 路由: /user/123/posts/456
route.path // '/user/123/posts/456'
```

**类型：** `string` **示例：**

```typescript
const route = useRoute()
console.log(route.path) // '/user/123'

// 监听路径变化
watch(
  () => route.path,
  (newPath, oldPath) => {
    console.log(`路径从 ${oldPath} 变为 ${newPath}`)
  }
)
```

### name

路由的名称，如果路由配置中定义了 `name` 属性。

```typescript
// 路由配置
{
  path: '/user/:id',
  name: 'UserProfile',
  component: UserProfile
}

// 访问 /user/123
route.name  // 'UserProfile'
```

**类型：** `string | null | undefined` **示例：**

```typescript
const route = useRoute()

if (route.name === 'UserProfile') {
  console.log('当前在用户资料页面')
}

// 根据路由名称显示不同内容
const pageTitle = computed(() => {
  switch (route.name) {
    case 'Home':
      return '首页'
    case 'UserProfile':
      return '用户资料'
    case 'Settings':
      return '设置'
    default:
      return '未知页面'
  }
})
```

### params

路径参数对象，包含动态路由段的值。

```typescript
// 路由: /user/:id/post/:postId
// URL: /user/123/post/456
route.params // { id: '123', postId: '456' }
```

**类型：** `RouteParams` **示例：**

```typescript
const route = useRoute()

// 获取单个参数
const userId = computed(() => route.params.id)
const postId = computed(() => route.params.postId)

// 监听参数变化
watch(
  () => route.params.id,
  newId => {
    loadUserData(newId)
  }
)

// 类型安全的参数获取
interface UserRouteParams {
  id: string
}

const typedParams = route.params as UserRouteParams
const userId = typedParams.id // 类型为 string
```

### query

查询参数对象，包含 URL 中 `?` 后面的参数。

```typescript
// URL: /search?q=vue&page=2&sort=date
route.query // { q: 'vue', page: '2', sort: 'date' }
```

**类型：** `LocationQuery` **示例：**

```typescript
const route = useRoute()

// 获取查询参数
const searchQuery = computed(() => (route.query.q as string) || '')
const currentPage = computed(() => Number(route.query.page) || 1)
const sortBy = computed(() => (route.query.sort as string) || 'date')

// 处理数组查询参数
// URL: /filter?tags=vue&tags=router&tags=typescript
const tags = computed(() => {
  const tagParam = route.query.tags
  if (Array.isArray(tagParam)) {
    return tagParam
  } else if (typeof tagParam === 'string') {
    return [tagParam]
  } else {
    return []
  }
})

// 监听查询参数变化
watch(
  () => route.query,
  newQuery => {
    updateSearchResults(newQuery)
  },
  { deep: true }
)
```

### hash

URL 中的锚点部分（包含 `#` 符号）。

```typescript
// URL: /docs/guide#installation
route.hash // '#installation'
```

**类型：** `string` **示例：**

```typescript
const route = useRoute()

// 获取锚点
const currentHash = computed(() => route.hash)

// 监听锚点变化
watch(
  () => route.hash,
  newHash => {
    if (newHash) {
      // 滚动到对应元素
      const element = document.querySelector(newHash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
)

// 检查是否有特定锚点
function isAtSection(sectionId: string) {
  return route.hash === `#${sectionId}`
}
```

### meta

路由元信息，包含在路由配置中定义的 `meta` 对象。

```typescript
// 路由配置
{
  path: '/admin',
  component: Admin,
  meta: {
    title: '管理后台',
    requiresAuth: true,
    roles: ['admin'],
    icon: 'admin-icon'
  }
}

// 访问元信息
route.meta  // { title: '管理后台', requiresAuth: true, ... }
```

**类型：** `RouteMeta` **示例：**

```typescript
const route = useRoute()

// 获取页面标题
const pageTitle = computed(() => route.meta.title || '默认标题')

// 检查权限要求
const requiresAuth = computed(() => route.meta.requiresAuth === true)

// 获取用户角色要求
const requiredRoles = computed(() => route.meta.roles || [])

// 动态设置页面标题
watch(
  () => route.meta.title,
  title => {
    if (title) {
      document.title = title
    }
  },
  { immediate: true }
)

// 类型安全的元信息
interface CustomRouteMeta {
  title?: string
  requiresAuth?: boolean
  roles?: string[]
  icon?: string
  cache?: boolean
}

const typedMeta = route.meta as CustomRouteMeta
```

### matched

匹配的路由记录数组，包含当前路由及其所有父路由。

```typescript
// 嵌套路由: /user/123/posts/456
// matched 包含: [UserLayout, UserPosts, PostDetail]
route.matched // RouteRecordNormalized[]
```

**类型：** `RouteRecordNormalized[]` **示例：**

```typescript
const route = useRoute()

// 获取所有匹配的路由
const matchedRoutes = computed(() => route.matched)

// 生成面包屑导航
const breadcrumbs = computed(() => {
  return route.matched
    .filter(record => record.meta?.title)
    .map(record => ({
      title: record.meta.title,
      path: record.path,
      name: record.name,
    }))
})

// 检查是否在特定路由层级下
const isUnderAdmin = computed(() => {
  return route.matched.some(record => record.name === 'Admin')
})

// 获取当前路由的父路由
const parentRoute = computed(() => {
  const matched = route.matched
  return matched.length > 1 ? matched[matched.length - 2] : null
})
```

## 🔧 实用方法

### 路由比较

```typescript
// 比较两个路由是否相同
function isSameRoute(route1: RouteLocation, route2: RouteLocation): boolean {
  return (
    route1.path === route2.path &&
    route1.name === route2.name &&
    JSON.stringify(route1.params) === JSON.stringify(route2.params) &&
    JSON.stringify(route1.query) === JSON.stringify(route2.query) &&
    route1.hash === route2.hash
  )
}

// 检查路由是否匹配模式
function matchesPattern(route: RouteLocation, pattern: string): boolean {
  const regex = new RegExp(pattern.replace(/:\w+/g, '[^/]+'))
  return regex.test(route.path)
}
```

### 路由信息提取

```typescript
// 提取路由的完整 URL
function getFullUrl(route: RouteLocation): string {
  const { path, query, hash } = route
  const queryString = new URLSearchParams(query as Record<string, string>).toString()
  return `${path}${queryString ? `?${queryString}` : ''}${hash}`
}

// 获取路由的显示名称
function getDisplayName(route: RouteLocation): string {
  return route.meta?.title || route.name || route.path
}

// 检查路由是否需要认证
function requiresAuthentication(route: RouteLocation): boolean {
  return route.matched.some(record => record.meta?.requiresAuth)
}
```

## 🎯 使用示例

### 在组件中使用

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()

// 页面标题
const pageTitle = computed(() => route.meta.title || '默认标题')

// 是否需要认证
const requiresAuth = computed(() => route.meta.requiresAuth)

// 面包屑导航
const breadcrumbs = computed(() => {
  return route.matched
    .filter(record => record.meta?.title)
    .map(record => ({
      title: record.meta.title,
      path: record.path,
    }))
})

// 监听路由变化
watch(
  () => route.fullPath,
  newPath => {
    console.log('路由变化:', newPath)
    // 发送页面浏览统计
    analytics.track('page_view', { path: newPath })
  }
)
</script>

<template>
  <div class="page">
    <!-- 显示当前路径 -->
    <div class="current-path">当前路径: {{ route.path }}</div>

    <!-- 面包屑导航 -->
    <nav class="breadcrumb">
      <span v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
        <RouterLink :to="crumb.path">
          {{ crumb.title }}
        </RouterLink>
        <span v-if="index < breadcrumbs.length - 1"> / </span>
      </span>
    </nav>

    <!-- 根据路由显示不同内容 -->
    <div class="content">
      <h1>{{ pageTitle }}</h1>
      <p v-if="requiresAuth">此页面需要登录</p>
    </div>
  </div>
</template>
```

### 在路由守卫中使用

```typescript
router.beforeEach((to, from, next) => {
  // 检查路由元信息
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
    return
  }

  // 检查用户权限
  if (to.meta.roles && !hasAnyRole(to.meta.roles)) {
    next('/403')
    return
  }

  // 记录路由访问
  console.log(`从 ${from.path} 导航到 ${to.path}`)

  next()
})
```

## 🎯 类型定义

### 完整类型定义

```typescript
// 路由参数
interface RouteParams {
  [key: string]: string | string[]
}

// 查询参数
interface LocationQuery {
  [key: string]: string | string[] | null | undefined
}

// 路由元信息
interface RouteMeta {
  [key: string]: any
}

// 标准化路由位置
interface RouteLocationNormalized {
  path: string
  name: string | null | undefined
  params: RouteParams
  query: LocationQuery
  hash: string
  meta: RouteMeta
  matched: RouteRecordNormalized[]
  redirectedFrom?: RouteLocation
}

// 路由位置（联合类型）
type RouteLocation = RouteLocationNormalized | RouteLocationGeneric
```

RouteLocation 是理解和使用 LDesign Router 的基础，掌握它的各个属性和用法将帮助你更好地构建路由应用。
