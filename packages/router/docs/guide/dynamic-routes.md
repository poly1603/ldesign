# 动态路由

动态路由允许你使用参数来匹配多个路径，这对于创建灵活的路由结构非常有用，比如用户详情页、文章页面等。

## 🎯 基础概念

动态路由使用冒号 `:` 来定义路径参数，这些参数会被捕获并存储在 `$route.params` 中。

### 简单参数

```typescript
const routes = [
  // 动态路径参数以冒号开头
  { path: '/user/:id', component: User },
  { path: '/post/:slug', component: Post },
  { path: '/category/:name', component: Category },
]
```

当匹配到路由时，参数值会设置到 `route.params`：

| 模式              | 匹配路径            | route.params              |
| ----------------- | ------------------- | ------------------------- |
| `/user/:id`       | `/user/123`         | `{ id: '123' }`           |
| `/post/:slug`     | `/post/hello-world` | `{ slug: 'hello-world' }` |
| `/category/:name` | `/category/tech`    | `{ name: 'tech' }`        |

## 📝 在组件中使用参数

### 使用 Composition API

```vue
<script setup>
import { useRoute, useRouter } from '@ldesign/router'
import { computed, watch } from 'vue'

const route = useRoute()
const router = useRouter()

// 获取路由参数
const userId = computed(() => route.value.params.id)
const postSlug = computed(() => route.value.params.slug)

// 监听参数变化
watch(
  () => route.value.params.id,
  (newId, oldId) => {
    console.log(`用户ID从 ${oldId} 变为 ${newId}`)
    // 重新获取用户数据
    fetchUserData(newId)
  }
)

// 编程式导航
function goToUser(id) {
  router.push(`/user/${id}`)
}

function goToPost(slug) {
  router.push({ name: 'Post', params: { slug } })
}
</script>

<template>
  <div class="user-profile">
    <h1>用户 {{ userId }}</h1>
    <button @click="goToUser('456')">切换到用户 456</button>
  </div>
</template>
```

### 使用 Props

你可以将路由参数作为 props 传递给组件：

```typescript
const routes = [
  {
    path: '/user/:id',
    component: User,
    props: true, // 将 params 作为 props 传递
  },
  {
    path: '/post/:slug',
    component: Post,
    props: route => ({
      slug: route.params.slug,
      version: route.query.version,
    }),
  },
]
```

```vue
<!-- User.vue -->
<script setup>
interface Props {
  id: string
}

const props = defineProps<Props>()

// 直接使用 props.id，无需访问 route.params
console.log('用户ID:', props.id)
</script>

<template>
  <div class="user">
    <h1>用户 {{ id }}</h1>
  </div>
</template>
```

## 🔄 多个参数

一个路由可以包含多个参数：

```typescript
const routes = [
  {
    path: '/user/:userId/post/:postId',
    component: UserPost,
  },
  {
    path: '/category/:category/tag/:tag',
    component: CategoryTag,
  },
]
```

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()

const userId = computed(() => route.value.params.userId)
const postId = computed(() => route.value.params.postId)
</script>

<template>
  <div class="user-post">
    <h1>用户 {{ userId }} 的文章 {{ postId }}</h1>
  </div>
</template>
```

## ⭐ 可选参数

使用问号 `?` 来定义可选参数：

```typescript
const routes = [
  {
    path: '/user/:id/:tab?',
    component: UserProfile,
  },
]
```

这将匹配：

- `/user/123` - `{ id: '123', tab: undefined }`
- `/user/123/posts` - `{ id: '123', tab: 'posts' }`

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()

const userId = computed(() => route.value.params.id)
const activeTab = computed(() => route.value.params.tab || 'profile')
</script>

<template>
  <div class="user-profile">
    <h1>用户 {{ userId }}</h1>

    <nav class="tabs">
      <RouterLink :to="`/user/${userId}`">个人资料</RouterLink>
      <RouterLink :to="`/user/${userId}/posts`">文章</RouterLink>
      <RouterLink :to="`/user/${userId}/settings`">设置</RouterLink>
    </nav>

    <div class="tab-content">
      <UserProfileTab v-if="activeTab === 'profile'" />
      <UserPostsTab v-else-if="activeTab === 'posts'" />
      <UserSettingsTab v-else-if="activeTab === 'settings'" />
    </div>
  </div>
</template>
```

## 🌟 通配符路由

使用星号 `*` 来匹配任意路径：

```typescript
const routes = [
  // 匹配所有路径
  { path: '/:pathMatch(.*)*', component: NotFound },

  // 匹配特定前缀下的所有路径
  { path: '/docs/:pathMatch(.*)*', component: DocsHandler },
]
```

```vue
<!-- NotFound.vue -->
<script setup>
import { useRoute } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()

const notFoundPath = computed(() => route.value.params.pathMatch)
</script>

<template>
  <div class="not-found">
    <h1>404 - 页面未找到</h1>
    <p>路径 "{{ notFoundPath }}" 不存在</p>
    <RouterLink to="/">返回首页</RouterLink>
  </div>
</template>
```

## 🎨 参数验证

你可以使用正则表达式来验证参数格式：

```typescript
const routes = [
  // 只匹配数字ID
  { path: '/user/:id(\\d+)', component: User },

  // 匹配特定格式的slug
  { path: '/post/:slug([a-z0-9-]+)', component: Post },

  // 匹配年月日格式
  { path: '/archive/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})', component: Archive },
]
```

## 🔄 参数变化响应

当路由参数发生变化时，组件实例会被复用。你需要监听参数变化：

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { watch, ref, onMounted } from 'vue'

const route = useRoute()
const userData = ref(null)
const loading = ref(false)

// 获取用户数据
async function fetchUser(id) {
  loading.value = true
  try {
    const response = await fetch(`/api/users/${id}`)
    userData.value = await response.json()
  } catch (error) {
    console.error('获取用户数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听路由参数变化
watch(
  () => route.value.params.id,
  newId => {
    if (newId) {
      fetchUser(newId)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="user-detail">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="userData" class="user-info">
      <h1>{{ userData.name }}</h1>
      <p>{{ userData.email }}</p>
    </div>

    <div v-else class="error">用户不存在</div>
  </div>
</template>
```

## 🚀 高级用法

### 嵌套动态路由

```typescript
const routes = [
  {
    path: '/user/:userId',
    component: UserLayout,
    children: [
      { path: '', component: UserProfile },
      { path: 'post/:postId', component: UserPost },
      { path: 'post/:postId/edit', component: EditPost },
    ],
  },
]
```

### 命名路由与参数

```typescript
const routes = [
  {
    path: '/user/:id',
    name: 'User',
    component: User,
  },
  {
    path: '/post/:slug',
    name: 'Post',
    component: Post,
  },
]

// 使用命名路由导航
router.push({ name: 'User', params: { id: '123' } })
router.push({ name: 'Post', params: { slug: 'hello-world' } })
```

### 查询参数与动态路由

```vue
<script setup>
import { useRoute, useRouter } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const userId = computed(() => route.value.params.id)
const page = computed(() => route.value.query.page || '1')
const sort = computed(() => route.value.query.sort || 'name')

function updateQuery(newQuery) {
  router.push({
    params: route.value.params,
    query: { ...route.value.query, ...newQuery },
  })
}
</script>

<template>
  <div class="user-posts">
    <h1>用户 {{ userId }} 的文章</h1>

    <div class="controls">
      <select @change="updateQuery({ sort: $event.target.value })">
        <option value="name">按名称排序</option>
        <option value="date">按日期排序</option>
      </select>

      <button @click="updateQuery({ page: parseInt(page) + 1 })">下一页</button>
    </div>
  </div>
</template>
```

## 🛡️ 类型安全

使用 TypeScript 获得更好的类型安全：

```typescript
// 定义路由参数类型
interface UserParams {
  id: string
}

interface PostParams {
  slug: string
}

// 在组件中使用
import { useRoute } from '@ldesign/router'

const route = useRoute<UserParams>()
// route.value.params.id 现在有正确的类型
```

## 🎯 最佳实践

### 1. 参数验证

```vue
<script setup>
import { useRoute, useRouter } from '@ldesign/router'
import { computed, watch } from 'vue'

const route = useRoute()
const router = useRouter()

const userId = computed(() => {
  const id = route.value.params.id
  // 验证ID格式
  if (!/^\d+$/.test(id)) {
    router.replace('/404')
    return null
  }
  return id
})

watch(
  userId,
  newId => {
    if (newId) {
      fetchUserData(newId)
    }
  },
  { immediate: true }
)
</script>
```

### 2. 错误处理

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { ref, watch } from 'vue'

const route = useRoute()
const error = ref(null)
const loading = ref(false)

async function loadData(params) {
  loading.value = true
  error.value = null

  try {
    // 加载数据
    await fetchData(params)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch(() => route.value.params, loadData, { immediate: true })
</script>

<template>
  <div class="dynamic-route">
    <div v-if="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- 正常内容 -->
    </div>
  </div>
</template>
```

### 3. 性能优化

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { ref, watch, nextTick } from 'vue'

const route = useRoute()
const cache = new Map()

watch(
  () => route.value.params.id,
  async newId => {
    // 使用缓存避免重复请求
    if (cache.has(newId)) {
      userData.value = cache.get(newId)
      return
    }

    const data = await fetchUserData(newId)
    cache.set(newId, data)
    userData.value = data
  },
  { immediate: true }
)
</script>
```

## 📚 相关文档

- [嵌套路由](./nested-routes.md) - 了解如何组合动态路由和嵌套路由
- [路由守卫](./route-guards.md) - 学习如何保护动态路由
- [导航](./navigation.md) - 掌握编程式导航技巧
- [类型安全](../api/type-definitions.md) - 获得更好的 TypeScript 支持
