# 导航

导航是单页应用的核心功能。LDesign Router 提供了多种导航方式，让你能够灵活地控制页面跳转。

## 🎯 声明式导航

### RouterLink 组件

使用 `RouterLink` 组件创建导航链接：

```vue
<template>
  <!-- 基础链接 -->
  <RouterLink to="/about"> 关于我们 </RouterLink>

  <!-- 命名路由 -->
  <RouterLink :to="{ name: 'UserProfile', params: { id: '123' } }"> 用户资料 </RouterLink>

  <!-- 带查询参数 -->
  <RouterLink :to="{ path: '/search', query: { q: 'vue', page: 1 } }"> 搜索结果 </RouterLink>

  <!-- 带锚点 -->
  <RouterLink :to="{ path: '/docs', hash: '#installation' }"> 安装文档 </RouterLink>
</template>
```

### 智能预加载

LDesign Router 的独特功能 - 智能预加载：

```vue
<template>
  <!-- 悬停时预加载 -->
  <RouterLink to="/products" preload="hover"> 产品列表 </RouterLink>

  <!-- 可见时预加载 -->
  <RouterLink to="/heavy-page" preload="visible"> 重型页面 </RouterLink>

  <!-- 立即预加载 -->
  <RouterLink to="/important" preload="immediate"> 重要页面 </RouterLink>

  <!-- 空闲时预加载 -->
  <RouterLink to="/background" preload="idle"> 后台页面 </RouterLink>
</template>
```

### 自定义样式

控制链接的激活状态样式：

```vue
<template>
  <RouterLink to="/dashboard" active-class="active" exact-active-class="exact-active">
    仪表板
  </RouterLink>
</template>

<style scoped>
.active {
  color: #1890ff;
  font-weight: 500;
}

.exact-active {
  color: #1890ff;
  font-weight: bold;
  background: #f0f8ff;
}
</style>
```

### 自定义渲染

使用 `custom` 属性完全自定义链接渲染：

```vue
<template>
  <RouterLink v-slot="{ href, navigate, isActive }" to="/external" custom>
    <a :href="href" :class="{ active: isActive }" target="_blank" @click="navigate">
      <Icon name="external" />
      外部链接
    </a>
  </RouterLink>
</template>
```

## 🚀 编程式导航

### 基础导航

使用 `useRouter` 进行编程式导航：

```typescript
import { useRouter } from '@ldesign/router'

export default {
  setup() {
    const router = useRouter()

    // 导航到指定路径
    const goToAbout = () => {
      router.push('/about')
    }

    // 导航到命名路由
    const goToUser = (userId: string) => {
      router.push({
        name: 'UserProfile',
        params: { id: userId },
      })
    }

    // 带查询参数导航
    const searchProducts = (keyword: string) => {
      router.push({
        path: '/search',
        query: { q: keyword, category: 'products' },
      })
    }

    return {
      goToAbout,
      goToUser,
      searchProducts,
    }
  },
}
```

### 替换历史记录

使用 `replace` 替换当前历史记录：

```typescript
const router = useRouter()

// 替换当前路由，不会在历史中留下记录
router.replace('/login')

// 对象形式
router.replace({
  name: 'Login',
  query: { redirect: '/dashboard' },
})
```

### 历史导航

控制浏览器历史记录：

```typescript
const router = useRouter()

// 后退一步
router.back()

// 前进一步
router.forward()

// 前进或后退指定步数
router.go(-2) // 后退两步
router.go(1) // 前进一步
```

### 异步导航

处理导航的异步结果：

```typescript
const router = useRouter()

// 导航成功
router.push('/dashboard').then(() => {
  console.log('导航成功')
  // 执行导航后的逻辑
})

// 导航失败
router.push('/protected').catch(error => {
  if (error.name === 'NavigationDuplicated') {
    console.log('重复导航')
  } else {
    console.error('导航失败:', error)
  }
})

// 使用 async/await
async function navigateToUser(userId: string) {
  try {
    await router.push({ name: 'UserProfile', params: { id: userId } })
    console.log('导航到用户页面成功')
  } catch (error) {
    console.error('导航失败:', error)
  }
}
```

## 🎨 高级导航技巧

### 条件导航

根据条件进行导航：

```typescript
const router = useRouter()
const route = useRoute()

function conditionalNavigate() {
  // 检查用户权限
  if (!hasPermission('admin')) {
    router.push('/403')
    return
  }

  // 检查当前路由
  if (route.name === 'Dashboard') {
    router.push('/admin/users')
  } else {
    router.push('/dashboard')
  }
}

// 基于数据导航
async function navigateBasedOnData() {
  const userData = await fetchUserData()

  if (userData.isFirstLogin) {
    router.push('/welcome')
  } else if (userData.hasUnreadMessages) {
    router.push('/messages')
  } else {
    router.push('/dashboard')
  }
}
```

### 导航确认

在导航前进行确认：

```typescript
const router = useRouter()

function navigateWithConfirmation(to: string) {
  if (hasUnsavedChanges()) {
    const confirmed = confirm('有未保存的更改，确定要离开吗？')
    if (confirmed) {
      router.push(to)
    }
  } else {
    router.push(to)
  }
}

// 使用 Promise 的确认
async function navigateWithAsyncConfirmation(to: string) {
  if (hasUnsavedChanges()) {
    const confirmed = await showConfirmDialog({
      title: '确认离开',
      message: '有未保存的更改，确定要离开吗？',
    })

    if (confirmed) {
      router.push(to)
    }
  } else {
    router.push(to)
  }
}
```

### 智能预加载控制

编程式控制预加载：

```typescript
const router = useRouter()

// 预加载指定路由
function preloadRoute(routeName: string, params?: any) {
  router.preloadRoute({ name: routeName, params })
}

// 批量预加载
function preloadImportantRoutes() {
  const importantRoutes = [
    { name: 'Dashboard' },
    { name: 'UserProfile', params: { id: 'current' } },
    { name: 'Settings' },
  ]

  importantRoutes.forEach(route => {
    router.preloadRoute(route)
  })
}

// 清除预加载缓存
function clearPreloadCache() {
  router.clearPreloadCache()
}
```

## 🔗 导航参数处理

### 路径参数

处理动态路由参数：

```typescript
import { useRoute, useRouter } from '@ldesign/router'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()

    // 获取当前参数
    const userId = computed(() => route.params.id)

    // 导航到相关用户
    const goToRelatedUser = (relatedId: string) => {
      router.push({
        name: 'UserProfile',
        params: { id: relatedId },
      })
    }

    // 监听参数变化
    watch(
      () => route.params.id,
      (newId, oldId) => {
        console.log(`用户ID从 ${oldId} 变为 ${newId}`)
        loadUserData(newId)
      }
    )

    return {
      userId,
      goToRelatedUser,
    }
  },
}
```

### 查询参数

处理 URL 查询参数：

```typescript
const route = useRoute()
const router = useRouter()

// 获取查询参数
const searchQuery = computed(() => route.query.q as string)
const currentPage = computed(() => Number(route.query.page) || 1)

// 更新查询参数
function updateSearch(keyword: string) {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      q: keyword,
      page: 1, // 重置页码
    },
  })
}

// 分页导航
function goToPage(page: number) {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      page,
    },
  })
}
```

### 状态传递

在导航时传递状态：

```typescript
const router = useRouter()

// 传递状态到下一个页面
function navigateWithState() {
  router.push({
    name: 'UserEdit',
    params: { id: '123' },
    state: {
      fromPage: 'UserList',
      selectedItems: [1, 2, 3],
      timestamp: Date.now(),
    },
  })
}

// 在目标页面获取状态
const route = useRoute()
const navigationState = computed(() => route.state)
```

## 🎯 导航最佳实践

### 1. 使用命名路由

```typescript
// ✅ 推荐：使用命名路由
router.push({ name: 'UserProfile', params: { id: '123' } })

// ❌ 避免：硬编码路径
router.push('/user/123')
```

### 2. 参数类型安全

```typescript
// ✅ 推荐：类型安全的参数
interface UserRouteParams {
  id: string
}

function goToUser(id: string) {
  router.push({
    name: 'UserProfile',
    params: { id } as UserRouteParams,
  })
}
```

### 3. 错误处理

```typescript
// ✅ 推荐：处理导航错误
async function safeNavigate(to: RouteLocationRaw) {
  try {
    await router.push(to)
  } catch (error) {
    if (error.name !== 'NavigationDuplicated') {
      console.error('导航失败:', error)
      // 显示错误提示
    }
  }
}
```

### 4. 性能优化

```typescript
// ✅ 推荐：合理使用预加载
;<RouterLink to='/heavy-page' preload='hover'>
  重型页面
</RouterLink>

// ✅ 推荐：批量预加载重要页面
onMounted(() => {
  router.preloadRoute({ name: 'Dashboard' })
  router.preloadRoute({ name: 'Profile' })
})
```

通过掌握这些导航技巧，你可以为用户提供流畅、快速的页面切换体验。接下来，让我们学习如何使
用[路由守卫](/guide/guards)来控制访问权限。
