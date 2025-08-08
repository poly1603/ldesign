# useRoute API

`useRoute` 是 LDesign Router 提供的组合式 API，用于在组件中访问当前路由信息，获取路径参数、查询参数
等数据。

## 📋 基础用法

### 获取当前路由

```vue
<script setup>
import { useRoute } from '@ldesign/router'

const route = useRoute()

// 访问路由信息
console.log('当前路径:', route.path)
console.log('路由名称:', route.name)
console.log('路径参数:', route.params)
console.log('查询参数:', route.query)
</script>
```

### 在 Options API 中使用

```vue
<script>
import { useRoute } from '@ldesign/router'

export default {
  setup() {
    const route = useRoute()

    return {
      route,
    }
  },
}
</script>
```

## 🎯 路由属性

### path

当前路由的路径（不包含查询参数和锚点）。

**类型：** `string` **响应式：** 是

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, watch } from 'vue'

const route = useRoute()

// 响应式地获取路径
const currentPath = computed(() => route.path)

// 监听路径变化
watch(
  () => route.path,
  (newPath, oldPath) => {
    console.log(`路径从 ${oldPath} 变为 ${newPath}`)
    // 路径变化时的逻辑
    updatePageAnalytics(newPath)
  }
)
</script>

<template>
  <div>
    <p>当前路径: {{ route.path }}</p>
    <p>计算属性路径: {{ currentPath }}</p>
  </div>
</template>
```

### name

当前路由的名称。

**类型：** `string | null | undefined` **响应式：** 是

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()

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

// 检查当前路由
const isHomePage = computed(() => route.name === 'Home')
const isUserPage = computed(() => route.name?.startsWith('User'))
</script>

<template>
  <div>
    <h1>{{ pageTitle }}</h1>
    <div v-if="isHomePage" class="home-content">欢迎来到首页</div>
    <div v-if="isUserPage" class="user-content">用户相关内容</div>
  </div>
</template>
```

### params

路径参数对象。

**类型：** `RouteParams` **响应式：** 是

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, watch } from 'vue'

const route = useRoute()

// 获取路径参数
const userId = computed(() => route.params.id)
const postId = computed(() => route.params.postId)

// 监听参数变化
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    console.log(`用户ID从 ${oldId} 变为 ${newId}`)
    loadUserData(newId)
  }
})

// 类型安全的参数获取
interface UserRouteParams {
  id: string
  section?: string
}

const typedParams = computed(() => route.params as UserRouteParams)
const userSection = computed(() => typedParams.value.section || 'profile')

// 参数验证
const isValidUserId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' && /^\d+$/.test(id)
})
</script>

<template>
  <div>
    <div v-if="isValidUserId">
      <h1>用户 {{ userId }} 的{{ userSection }}</h1>
      <p v-if="postId">文章ID: {{ postId }}</p>
    </div>
    <div v-else>
      <p>无效的用户ID</p>
    </div>
  </div>
</template>
```

### query

查询参数对象。

**类型：** `LocationQuery` **响应式：** 是

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, watch } from 'vue'

const route = useRoute()

// 获取查询参数
const searchQuery = computed(() => route.query.q as string || '')
const currentPage = computed(() => Number(route.query.page) || 1)
const sortBy = computed(() => route.query.sort as string || 'date')
const filters = computed(() => {
  const category = route.query.category as string
  const tags = route.query.tags

  return {
    category: category || 'all',
    tags: Array.isArray(tags) ? tags : tags ? [tags] : []
  }
})

// 监听查询参数变化
watch(() => route.query, (newQuery, oldQuery) => {
  console.log('查询参数变化:', { old: oldQuery, new: newQuery })

  // 当搜索参数变化时重新搜索
  if (newQuery.q !== oldQuery.q) {
    performSearch(newQuery.q as string)
  }

  // 当页码变化时加载新数据
  if (newQuery.page !== oldQuery.page) {
    loadPageData(Number(newQuery.page) || 1)
  }
}, { deep: true })

// 布尔查询参数
const showAdvanced = computed(() => route.query.advanced === 'true')
const isDebugMode = computed(() => route.query.debug !== undefined)
</script>

<template>
  <div>
    <div class="search-info">
      <p>搜索关键词: {{ searchQuery }}</p>
      <p>当前页码: {{ currentPage }}</p>
      <p>排序方式: {{ sortBy }}</p>
      <p>分类: {{ filters.category }}</p>
      <p>标签: {{ filters.tags.join(', ') }}</p>
    </div>

    <div v-if="showAdvanced" class="advanced-options">高级搜索选项</div>

    <div v-if="isDebugMode" class="debug-info">调试信息: {{ route.query }}</div>
  </div>
</template>
```

### hash

URL 中的锚点部分。

**类型：** `string` **响应式：** 是

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, nextTick, watch } from 'vue'

const route = useRoute()

// 获取当前锚点
const currentHash = computed(() => route.hash)

// 监听锚点变化
watch(
  () => route.hash,
  newHash => {
    if (newHash) {
      // 滚动到对应元素
      nextTick(() => {
        const element = document.querySelector(newHash)
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
      })
    }
  }
)

// 检查特定锚点
function isAtSection(sectionId: string) {
  return route.hash === `#${sectionId}`
}

const activeSection = computed(() => {
  const hash = route.hash.slice(1) // 移除 # 符号
  return hash || 'top'
})
</script>

<template>
  <div>
    <nav class="table-of-contents">
      <a
        v-for="section in sections"
        :key="section.id"
        :href="`#${section.id}`"
        :class="{ active: activeSection === section.id }"
      >
        {{ section.title }}
      </a>
    </nav>

    <div class="content">
      <section
        v-for="section in sections"
        :id="section.id"
        :key="section.id"
        :class="{ highlighted: isAtSection(section.id) }"
      >
        <h2>{{ section.title }}</h2>
        <p>{{ section.content }}</p>
      </section>
    </div>
  </div>
</template>
```

### meta

路由元信息。

**类型：** `RouteMeta` **响应式：** 是

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, watch } from 'vue'

const route = useRoute()

// 获取元信息
const pageTitle = computed(() => route.meta.title || '默认标题')
const requiresAuth = computed(() => route.meta.requiresAuth === true)
const userRoles = computed(() => route.meta.roles || [])
const pageIcon = computed(() => route.meta.icon)

// 动态设置页面标题
watch(() => route.meta.title, (title) => {
  if (title) {
    document.title = `${title} - My App`
  }
}, { immediate: true })

// 类型安全的元信息
interface CustomRouteMeta {
  title?: string
  requiresAuth?: boolean
  roles?: string[]
  icon?: string
  layout?: string
  cache?: boolean
  transition?: string
}

const typedMeta = computed(() => route.meta as CustomRouteMeta)

// 根据元信息控制显示
const showAuthWarning = computed(() => {
  return typedMeta.value.requiresAuth && !isAuthenticated()
})

const layoutComponent = computed(() => {
  const layout = typedMeta.value.layout
  switch (layout) {
    case 'admin': return 'AdminLayout'
    case 'auth': return 'AuthLayout'
    default: return 'DefaultLayout'
  }
})
</script>

<template>
  <component :is="layoutComponent">
    <div class="page">
      <header class="page-header">
        <Icon v-if="pageIcon" :name="pageIcon" />
        <h1>{{ pageTitle }}</h1>
      </header>

      <div v-if="showAuthWarning" class="auth-warning">此页面需要登录访问</div>

      <main class="page-content">
        <slot />
      </main>
    </div>
  </component>
</template>
```

### matched

匹配的路由记录数组。

**类型：** `RouteRecordNormalized[]` **响应式：** 是

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()

// 生成面包屑导航
const breadcrumbs = computed(() => {
  return route.matched
    .filter(record => record.meta?.title)
    .map((record, index) => ({
      title: record.meta.title,
      path: record.path,
      name: record.name,
      isLast: index === route.matched.length - 1,
    }))
})

// 检查路由层级
const routeDepth = computed(() => route.matched.length)
const isNestedRoute = computed(() => routeDepth.value > 1)

// 获取父路由信息
const parentRoute = computed(() => {
  const matched = route.matched
  return matched.length > 1 ? matched[matched.length - 2] : null
})

// 检查是否在特定路由下
const isUnderAdmin = computed(() => {
  return route.matched.some(record => record.name === 'Admin')
})

const isUnderUser = computed(() => {
  return route.matched.some(record => record.path.startsWith('/user'))
})
</script>

<template>
  <div>
    <!-- 面包屑导航 -->
    <nav v-if="breadcrumbs.length > 1" class="breadcrumb">
      <span v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
        <RouterLink v-if="!crumb.isLast" :to="crumb.path" class="breadcrumb-link">
          {{ crumb.title }}
        </RouterLink>
        <span v-else class="breadcrumb-current">
          {{ crumb.title }}
        </span>
        <span v-if="!crumb.isLast" class="breadcrumb-separator"> / </span>
      </span>
    </nav>

    <!-- 根据路由层级显示不同样式 -->
    <div :class="`route-depth-${routeDepth}`">
      <div v-if="isUnderAdmin" class="admin-indicator">管理员区域</div>
      <div v-if="isUnderUser" class="user-indicator">用户区域</div>
    </div>
  </div>
</template>
```

## 🔧 实用技巧

### 响应式路由数据

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, reactive, watch } from 'vue'

const route = useRoute()

// 创建响应式的路由数据对象
const routeData = reactive({
  path: computed(() => route.path),
  name: computed(() => route.name),
  params: computed(() => route.params),
  query: computed(() => route.query),
  hash: computed(() => route.hash),
  meta: computed(() => route.meta),
})

// 监听整个路由变化
watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    console.log('完整路径变化:', { from: oldPath, to: newPath })

    // 发送页面浏览统计
    analytics.track('page_view', {
      path: newPath,
      referrer: oldPath,
    })
  }
)

// 提取路由信息的工具函数
function getRouteInfo() {
  return {
    path: route.path,
    name: route.name,
    params: { ...route.params },
    query: { ...route.query },
    hash: route.hash,
    meta: { ...route.meta },
    fullPath: route.fullPath,
  }
}
</script>
```

### 条件渲染

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()

// 基于路由的条件渲染
const showSidebar = computed(() => {
  // 在特定路由下显示侧边栏
  return ['Dashboard', 'Settings', 'Profile'].includes(route.name)
})

const showBreadcrumb = computed(() => {
  // 嵌套路由显示面包屑
  return route.matched.length > 1
})

const pageLayout = computed(() => {
  // 根据路由选择布局
  if (route.path.startsWith('/admin')) return 'admin'
  if (route.path.startsWith('/auth')) return 'auth'
  return 'default'
})

const isPublicPage = computed(() => {
  const publicRoutes = ['Home', 'About', 'Contact']
  return publicRoutes.includes(route.name)
})
</script>

<template>
  <div :class="`layout-${pageLayout}`">
    <Sidebar v-if="showSidebar" />

    <main class="main-content">
      <Breadcrumb v-if="showBreadcrumb" />

      <div v-if="!isPublicPage" class="private-content">私有内容区域</div>

      <RouterView />
    </main>
  </div>
</template>
```

### 数据加载

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { onMounted, ref, watch } from 'vue'

const route = useRoute()
const loading = ref(false)
const data = ref(null)
const error = ref(null)

// 基于路由参数加载数据
async function loadData() {
  if (!route.params.id) return

  loading.value = true
  error.value = null

  try {
    const response = await fetch(`/api/users/${route.params.id}`)
    if (!response.ok) throw new Error('加载失败')

    data.value = await response.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 监听路由参数变化
watch(() => route.params.id, loadData, { immediate: true })

// 基于查询参数的搜索
const searchResults = ref([])
const searchLoading = ref(false)

async function performSearch() {
  const query = route.query.q
  if (!query) {
    searchResults.value = []
    return
  }

  searchLoading.value = true

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    searchResults.value = await response.json()
  } catch (err) {
    console.error('搜索失败:', err)
  } finally {
    searchLoading.value = false
  }
}

watch(() => route.query.q, performSearch, { immediate: true })
</script>

<template>
  <div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="error" class="error">错误: {{ error }}</div>

    <div v-else-if="data" class="content">
      <h1>{{ data.name }}</h1>
      <p>{{ data.description }}</p>
    </div>

    <div v-if="route.query.q" class="search-results">
      <h2>搜索结果</h2>
      <div v-if="searchLoading">搜索中...</div>
      <div v-else>
        <div v-for="result in searchResults" :key="result.id">
          {{ result.title }}
        </div>
      </div>
    </div>
  </div>
</template>
```

## 🎯 最佳实践

### 1. 响应式使用

```vue
<script setup>
// ✅ 推荐：使用 computed 获取响应式数据
const userId = computed(() => route.params.id)

// ❌ 避免：直接解构（会失去响应性）
const { params } = route // 不是响应式的
</script>
```

### 2. 类型安全

```typescript
// ✅ 推荐：定义参数类型
interface UserRouteParams {
  id: string
  section?: string
}

const params = computed(() => route.params as UserRouteParams)
const userId = computed(() => params.value.id)

// ✅ 推荐：验证参数
const isValidId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' && /^\d+$/.test(id)
})
```

### 3. 性能优化

```vue
<script setup>
// ✅ 推荐：避免不必要的深度监听
watch(() => route.params.id, loadUserData)

// ❌ 避免：监听整个 route 对象
watch(
  route,
  () => {
    // 这会在任何路由属性变化时触发
  },
  { deep: true }
)
</script>
```

`useRoute` 是获取当前路由信息的主要方式，正确使用它可以让你的组件能够响应路由变化，实现动态的用户界
面。
