# 核心概念

在深入使用 LDesign Router 之前，让我们先了解一些核心概念。这些概念将帮助你更好地理解和使用路由系统。

## 🎯 路由器 (Router)

路由器是整个路由系统的核心，负责管理应用的导航状态和路由匹配。

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 路由配置
  ],
  // 高级选项
  preloadStrategy: 'hover',
  performance: true,
  cache: { max: 20 },
})
```

### 路由器的职责

- **路由匹配**：根据当前 URL 找到对应的路由配置
- **导航管理**：处理页面间的跳转和历史记录
- **组件渲染**：决定在 RouterView 中渲染哪个组件
- **守卫执行**：在导航过程中执行各种守卫函数
- **性能优化**：提供预加载、缓存等性能优化功能

## 🗺️ 路由记录 (Route Record)

路由记录定义了 URL 路径与组件之间的映射关系。

```typescript
const route: RouteRecordRaw = {
  path: '/user/:id', // 路径模式
  name: 'UserProfile', // 路由名称
  component: UserProfile, // 组件
  props: true, // 传递参数作为 props
  meta: {
    // 元信息
    title: '用户资料',
    requiresAuth: true,
    cache: true,
  },
  beforeEnter: (to, from) => {
    // 路由级守卫
    // 进入前的逻辑
  },
}
```

### 路由记录的属性

| 属性          | 类型                            | 说明                       |
| ------------- | ------------------------------- | -------------------------- |
| `path`        | `string`                        | URL 路径模式，支持动态参数 |
| `name`        | `string`                        | 路由名称，用于编程式导航   |
| `component`   | `Component`                     | 要渲染的组件               |
| `components`  | `Record<string, Component>`     | 命名视图的组件映射         |
| `redirect`    | `string \| RouteLocation`       | 重定向目标                 |
| `props`       | `boolean \| object \| function` | 传递给组件的 props         |
| `meta`        | `object`                        | 路由元信息                 |
| `beforeEnter` | `NavigationGuard`               | 路由级导航守卫             |
| `children`    | `RouteRecordRaw[]`              | 嵌套路由                   |

## 📍 路由位置 (Route Location)

路由位置描述了当前或目标的路由状态，包含路径、参数、查询等信息。

```typescript
// 当前路由位置
const route = useRoute()

console.log({
  path: route.path, // '/user/123'
  name: route.name, // 'UserProfile'
  params: route.params, // { id: '123' }
  query: route.query, // { tab: 'profile' }
  hash: route.hash, // '#section1'
  meta: route.meta, // { title: '用户资料' }
  matched: route.matched, // 匹配的路由记录数组
})
```

### 路由位置的类型

- **RouteLocationNormalized**：标准化的路由位置，包含完整信息
- **RouteLocationRaw**：原始路由位置，可以是字符串或对象
- **RouteLocationResolved**：解析后的路由位置，用于导航

## 🧭 导航 (Navigation)

导航是从一个路由位置到另一个路由位置的过程。

### 声明式导航

使用 `RouterLink` 组件进行声明式导航：

```vue
<template>
  <!-- 字符串路径 -->
  <RouterLink to="/about"> 关于我们 </RouterLink>

  <!-- 对象形式 -->
  <RouterLink :to="{ name: 'UserProfile', params: { id: '123' } }"> 用户资料 </RouterLink>

  <!-- 带查询参数 -->
  <RouterLink :to="{ path: '/search', query: { q: 'vue' } }"> 搜索 </RouterLink>

  <!-- 智能预加载 -->
  <RouterLink to="/products" preload="hover"> 产品列表 </RouterLink>
</template>
```

### 编程式导航

使用路由器实例进行编程式导航：

```typescript
const router = useRouter()

// 导航到指定路径
router.push('/about')

// 导航到命名路由
router.push({ name: 'UserProfile', params: { id: '123' } })

// 替换当前路由
router.replace('/login')

// 历史导航
router.go(-1) // 后退一步
router.back() // 后退
router.forward() // 前进
```

## 🛡️ 导航守卫 (Navigation Guards)

导航守卫用于控制路由的访问权限和执行导航过程中的逻辑。

### 守卫类型

```typescript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

// 全局解析守卫
router.beforeResolve((to, from, next) => {
  // 在导航被确认之前调用
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 导航完成后调用
  document.title = to.meta.title || 'My App'
})

// 路由级守卫
const route = {
  path: '/admin',
  beforeEnter: (to, from, next) => {
    if (!isAdmin()) {
      next('/403')
    } else {
      next()
    }
  },
}

// 组件内守卫
export default {
  beforeRouteEnter(to, from, next) {
    // 进入路由前
  },
  beforeRouteUpdate(to, from, next) {
    // 路由更新时
  },
  beforeRouteLeave(to, from, next) {
    // 离开路由前
  },
}
```

## 🏗️ 历史模式 (History Mode)

历史模式决定了 URL 的格式和浏览器历史记录的管理方式。

### Web History 模式

```typescript
import { createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  // URL: https://example.com/user/123
})
```

**特点：**

- URL 干净美观，没有 `#` 符号
- 需要服务器配置支持
- 支持 HTML5 History API

### Hash 模式

```typescript
import { createWebHashHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHashHistory(),
  // URL: https://example.com/#/user/123
})
```

**特点：**

- URL 包含 `#` 符号
- 无需服务器配置
- 兼容性更好

### Memory 模式

```typescript
import { createMemoryHistory } from '@ldesign/router'

const router = createRouter({
  history: createMemoryHistory(),
  // 主要用于 SSR 和测试
})
```

**特点：**

- 不依赖浏览器环境
- 主要用于服务端渲染和测试
- 历史记录存储在内存中

## 🎨 组件系统

LDesign Router 提供了两个核心组件用于构建路由应用。

### RouterView

`RouterView` 是路由组件的渲染出口：

```vue
<template>
  <!-- 基础用法 -->
  <RouterView />

  <!-- 命名视图 -->
  <RouterView name="sidebar" />

  <!-- 带过渡动画 -->
  <RouterView v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'">
      <component :is="Component" :key="route.path" />
    </transition>
  </RouterView>
</template>
```

### RouterLink

`RouterLink` 是声明式导航组件：

```vue
<template>
  <!-- 基础链接 -->
  <RouterLink to="/about"> 关于我们 </RouterLink>

  <!-- 自定义样式 -->
  <RouterLink to="/products" active-class="active" exact-active-class="exact-active">
    产品列表
  </RouterLink>

  <!-- 智能预加载 -->
  <RouterLink to="/heavy-page" preload="hover"> 重型页面 </RouterLink>
</template>
```

## 🔧 组合式 API

LDesign Router 提供了丰富的组合式 API 用于在组件中访问路由功能。

### useRouter

获取路由器实例：

```typescript
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 编程式导航
router.push('/about')
router.replace('/login')
router.go(-1)

// 获取性能统计
const stats = router.getPerformanceStats()
```

### useRoute

获取当前路由信息：

```typescript
import { useRoute } from '@ldesign/router'

const route = useRoute()

// 响应式的路由信息
const userId = computed(() => route.params.id)
const searchQuery = computed(() => route.query.q)

// 监听路由变化
watch(
  () => route.params.id,
  newId => {
    loadUserData(newId)
  }
)
```

### useLink

创建自定义链接组件：

```typescript
import { useLink } from '@ldesign/router'

const { href, navigate, isActive, isExactActive } = useLink({
  to: '/about',
})
```

## 📊 元信息 (Meta)

路由元信息用于存储与路由相关的额外数据：

```typescript
const routes = [
  {
    path: '/admin',
    meta: {
      title: '管理后台',
      requiresAuth: true,
      roles: ['admin'],
      cache: false,
      transition: 'slide-left',
    },
  },
]

// 在组件中访问
const route = useRoute()
const title = route.meta.title
const requiresAuth = route.meta.requiresAuth
```

## 🚀 高级特性

### 智能预加载

LDesign Router 提供了多种预加载策略：

```typescript
const router = createRouter({
  preloadStrategy: 'hover', // hover | visible | idle | immediate
})
```

### 智能缓存

内置的路由缓存系统：

```typescript
const router = createRouter({
  cache: {
    max: 20, // 最大缓存数量
    ttl: 5 * 60 * 1000, // 缓存时间
    include: [/^\/user/], // 包含规则
    exclude: ['/login'], // 排除规则
  },
})
```

### 性能监控

实时监控路由性能：

```typescript
const router = createRouter({
  performance: true,
})

// 获取性能统计
const stats = router.getPerformanceStats()
console.log('平均导航时间:', stats.averageDuration)
```

这些核心概念构成了 LDesign Router 的基础。理解了这些概念，你就能更好地使用路由系统构建复杂的单页应用
了。
