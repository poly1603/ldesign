# 动态路由

动态路由允许你创建灵活的路径模式，处理变化的 URL 参数，是构建数据驱动应用的重要功能。

## 🎯 基础动态路由

### 路径参数

使用冒号 `:` 定义动态路径参数：

```typescript
const routes = [
  // 单个参数
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: UserProfile,
  },

  // 多个参数
  {
    path: '/user/:userId/post/:postId',
    name: 'UserPost',
    component: UserPost,
  },

  // 可选参数
  {
    path: '/product/:id?',
    name: 'Product',
    component: Product,
  },
]
```

### 获取路径参数

在组件中获取动态参数：

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, watch } from 'vue'

const route = useRoute()

// 获取参数
const userId = computed(() => route.params.id)
const postId = computed(() => route.params.postId)

// 监听参数变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    console.log(`用户ID从 ${oldId} 变为 ${newId}`)
    loadUserData(newId)
  }
)

// 加载数据
async function loadUserData(id) {
  try {
    const userData = await fetchUser(id)
    // 处理用户数据
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
}
</script>

<template>
  <div>
    <h1>用户资料 - {{ userId }}</h1>
    <p v-if="postId">文章ID: {{ postId }}</p>
  </div>
</template>
```

## 🔍 参数验证

### 正则表达式验证

使用正则表达式限制参数格式：

```typescript
const routes = [
  {
    // 只匹配数字ID
    path: '/user/:id(\\d+)',
    component: UserProfile,
  },
  {
    // 只匹配字母数字组合的slug
    path: '/article/:slug([a-z0-9-]+)',
    component: Article,
  },
  {
    // 匹配邮箱格式
    path: '/profile/:email([\\w.-]+@[\\w.-]+\\.\\w+)',
    component: ProfileByEmail,
  },
  {
    // 匹配日期格式 YYYY-MM-DD
    path: '/archive/:date(\\d{4}-\\d{2}-\\d{2})',
    component: ArchiveByDate,
  },
]
```

### 自定义参数验证

```typescript
const routes = [
  {
    path: '/user/:id',
    component: UserProfile,
    beforeEnter: (to, from, next) => {
      const id = to.params.id

      // 验证ID格式
      if (!/^\d+$/.test(id)) {
        next('/404')
        return
      }

      // 验证ID范围
      const numId = Number.parseInt(id)
      if (numId < 1 || numId > 999999) {
        next('/404')
        return
      }

      next()
    },
  },
]
```

## 🌟 通配符路由

### 捕获所有路径

```typescript
const routes = [
  // 404 页面 - 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },

  // 捕获特定前缀的所有路径
  {
    path: '/docs/:path(.*)',
    name: 'DocsViewer',
    component: DocsViewer,
  },

  // 文件下载路径
  {
    path: '/files/:filepath(.*)',
    name: 'FileDownload',
    component: FileDownload,
  },
]
```

### 处理通配符参数

```vue
<script setup>
import { useRoute } from '@ldesign/router'

const route = useRoute()

// 获取通配符匹配的路径
const matchedPath = computed(() => route.params.pathMatch)
const filePath = computed(() => route.params.filepath)

// 处理文档路径
function processDocsPath(path) {
  // 将路径转换为文档结构
  const segments = path.split('/').filter(Boolean)
  return segments.join(' > ')
}
</script>

<template>
  <div>
    <h1>文档查看器</h1>
    <nav class="breadcrumb">
      {{ processDocsPath(matchedPath) }}
    </nav>
    <!-- 文档内容 -->
  </div>
</template>
```

## 🔄 动态路由添加

### 运行时添加路由

```typescript
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 添加单个路由
function addUserRoute(userId) {
  router.addRoute({
    path: `/user/${userId}`,
    name: `User${userId}`,
    component: () => import('./UserProfile.vue'),
    props: { userId },
  })
}

// 添加嵌套路由
function addUserSubRoutes(userId) {
  // 先添加父路由
  router.addRoute({
    path: `/user/${userId}`,
    name: `User${userId}`,
    component: UserLayout,
  })

  // 添加子路由
  router.addRoute(`User${userId}`, {
    path: 'profile',
    component: UserProfile,
  })

  router.addRoute(`User${userId}`, {
    path: 'settings',
    component: UserSettings,
  })
}

// 批量添加路由
async function addDynamicRoutes() {
  const routes = await fetchDynamicRoutes()

  routes.forEach(route => {
    router.addRoute({
      path: route.path,
      name: route.name,
      component: () => import(route.component),
      meta: route.meta,
    })
  })
}
```

### 基于权限的动态路由

```typescript
// 根据用户权限动态生成路由
function generateRoutesFromPermissions(permissions) {
  const routes = []

  if (permissions.includes('user:read')) {
    routes.push({
      path: '/users',
      name: 'UserList',
      component: () => import('./UserList.vue'),
    })
  }

  if (permissions.includes('user:write')) {
    routes.push({
      path: '/users/:id/edit',
      name: 'UserEdit',
      component: () => import('./UserEdit.vue'),
    })
  }

  if (permissions.includes('admin')) {
    routes.push({
      path: '/admin/:module',
      name: 'AdminModule',
      component: () => import('./AdminModule.vue'),
    })
  }

  return routes
}

// 用户登录后动态添加路由
async function setupUserRoutes(user) {
  const userRoutes = generateRoutesFromPermissions(user.permissions)

  userRoutes.forEach(route => {
    router.addRoute(route)
  })
}
```

## 🎨 参数处理技巧

### 参数类型转换

```typescript
// 路由配置
{
  path: '/product/:id',
  component: Product,
  props: route => ({
    id: Number(route.params.id),
    category: route.query.category || 'all',
    page: Number(route.query.page) || 1,
    featured: route.query.featured === 'true'
  })
}
```

### 复杂参数解析

```vue
<script setup>
import { useRoute } from '@ldesign/router'

const route = useRoute()

// 解析复合参数
function parseUserPath(path) {
  const match = path.match(/^(\w+)(?:\/(\w+))?(?:\/(\d+))?$/)
  if (!match) return null

  return {
    username: match[1],
    section: match[2] || 'profile',
    itemId: match[3] ? Number(match[3]) : null,
  }
}

// 监听路由变化并解析参数
const routeData = computed(() => {
  return parseUserPath(route.params.path)
})

watch(
  routeData,
  newData => {
    if (newData) {
      loadUserData(newData)
    }
  },
  { immediate: true }
)
</script>
```

### 参数默认值

```typescript
const routes = [
  {
    path: '/search/:query?',
    component: SearchResults,
    props: route => ({
      query: route.params.query || '',
      category: route.query.category || 'all',
      sort: route.query.sort || 'relevance',
      page: Math.max(1, Number(route.query.page) || 1),
    }),
  },
]
```

## 🔗 查询参数处理

### 查询参数获取

```vue
<script setup>
import { useRoute, useRouter } from '@ldesign/router'

const route = useRoute()
const router = useRouter()

// 获取查询参数
const searchQuery = computed(() => route.query.q || '')
const currentPage = computed(() => Number(route.query.page) || 1)
const sortBy = computed(() => route.query.sort || 'date')

// 更新查询参数
function updateQuery(newParams) {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      ...newParams,
    },
  })
}

// 搜索功能
function search(keyword) {
  updateQuery({ q: keyword, page: 1 })
}

// 分页功能
function goToPage(page) {
  updateQuery({ page })
}

// 排序功能
function sortBy(field) {
  updateQuery({ sort: field, page: 1 })
}
</script>

<template>
  <div>
    <input :value="searchQuery" placeholder="搜索..." @input="search($event.target.value)" />

    <select @change="sortBy($event.target.value)">
      <option value="date">按日期</option>
      <option value="name">按名称</option>
      <option value="popularity">按热度</option>
    </select>

    <!-- 分页组件 -->
    <Pagination :current="currentPage" @change="goToPage" />
  </div>
</template>
```

### 查询参数验证

```typescript
function validateQueryParams(query) {
  const validated = {}

  // 验证页码
  if (query.page) {
    const page = Number(query.page)
    validated.page = page > 0 ? page : 1
  }

  // 验证排序字段
  const allowedSorts = ['date', 'name', 'popularity']
  if (query.sort && allowedSorts.includes(query.sort)) {
    validated.sort = query.sort
  }

  // 验证分类
  if (query.category && typeof query.category === 'string') {
    validated.category = query.category.toLowerCase()
  }

  return validated
}
```

## 🎯 动态路由最佳实践

### 1. 参数验证

```typescript
// ✅ 推荐：严格的参数验证
{
  path: '/user/:id(\\d+)',
  beforeEnter: (to, from, next) => {
    const id = Number(to.params.id)
    if (id > 0 && id <= 999999) {
      next()
    } else {
      next('/404')
    }
  }
}

// ❌ 避免：不验证参数
{
  path: '/user/:id',
  component: UserProfile
}
```

### 2. 错误处理

```vue
<script setup>
// ✅ 推荐：完善的错误处理
async function loadUserData(id) {
  try {
    loading.value = true
    const user = await fetchUser(id)

    if (!user) {
      router.push('/404')
      return
    }

    userData.value = user
  } catch (error) {
    if (error.status === 404) {
      router.push('/404')
    } else {
      errorMessage.value = '加载失败，请重试'
    }
  } finally {
    loading.value = false
  }
}
</script>
```

### 3. 性能优化

```typescript
// ✅ 推荐：缓存动态路由组件
const componentCache = new Map()

const getDynamicComponent = (type) => {
  if (!componentCache.has(type)) {
    componentCache.set(type, () => import(`./components/${type}.vue`))
  }
  return componentCache.get(type)
}

// 动态路由配置
{
  path: '/content/:type/:id',
  component: (route) => getDynamicComponent(route.params.type)
}
```

### 4. SEO 友好

```typescript
// ✅ 推荐：SEO 友好的动态路由
{
  path: '/article/:slug',
  component: Article,
  beforeEnter: async (to, from, next) => {
    try {
      const article = await fetchArticleBySlug(to.params.slug)

      // 设置页面标题和描述
      document.title = article.title
      document.querySelector('meta[name="description"]')
        ?.setAttribute('content', article.description)

      next()
    } catch (error) {
      next('/404')
    }
  }
}
```

通过掌握动态路由的各种技巧，你可以构建出灵活、强大的路由系统。接下来，让我们学
习[懒加载](/guide/lazy-loading)来优化应用性能。
