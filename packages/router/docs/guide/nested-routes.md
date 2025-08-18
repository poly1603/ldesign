# 嵌套路由

嵌套路由是构建复杂应用程序的重要功能，它允许你创建多层级的路由结构，每个层级都可以有自己的组件和子路
由。

## 🎯 什么是嵌套路由

嵌套路由允许你在一个路由组件内部定义子路由，形成树状的路由结构。这对于构建具有多层导航的应用程序非常
有用，比如：

- 管理后台的多级菜单
- 电商网站的分类页面
- 博客的文章分类系统

## 📝 基础配置

### 定义嵌套路由

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const routes = [
  {
    path: '/user',
    name: 'User',
    component: () => import('./views/User.vue'),
    children: [
      {
        // 空路径表示默认子路由
        path: '',
        name: 'UserProfile',
        component: () => import('./views/user/Profile.vue'),
      },
      {
        path: 'posts',
        name: 'UserPosts',
        component: () => import('./views/user/Posts.vue'),
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('./views/user/Settings.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

### 父组件模板

在父组件中，你需要使用 `<RouterView>` 来渲染子路由：

```vue
<!-- User.vue -->
<template>
  <div class="user-layout">
    <header class="user-header">
      <h1>用户中心</h1>
      <nav class="user-nav">
        <RouterLink to="/user">个人资料</RouterLink>
        <RouterLink to="/user/posts">我的文章</RouterLink>
        <RouterLink to="/user/settings">设置</RouterLink>
      </nav>
    </header>

    <main class="user-content">
      <!-- 子路由将在这里渲染 -->
      <RouterView />
    </main>
  </div>
</template>
```

## 🔄 多层嵌套

你可以创建多层嵌套的路由结构：

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: 'users',
        component: UsersLayout,
        children: [
          {
            path: '',
            component: UsersList,
          },
          {
            path: ':id',
            component: UserDetail,
            children: [
              {
                path: '',
                component: UserProfile,
              },
              {
                path: 'edit',
                component: UserEdit,
              },
            ],
          },
        ],
      },
    ],
  },
]
```

这将创建以下路由结构：

- `/admin/users` - 用户列表
- `/admin/users/123` - 用户详情
- `/admin/users/123/edit` - 编辑用户

## 🎨 增强的 RouterView

@ldesign/router 提供了增强的 `RouterView` 组件，支持动画过渡和更多功能：

```vue
<template>
  <div class="nested-container">
    <!-- 带动画的嵌套路由 -->
    <RouterView
      :transition="{
        name: 'nested-fade',
        mode: 'out-in',
        duration: 300,
      }"
      v-slot="{ Component, route }"
    >
      <transition name="nested-fade" mode="out-in">
        <component :is="Component" :key="route.path" :route-info="route" />
      </transition>
    </RouterView>
  </div>
</template>

<style>
.nested-fade-enter-active,
.nested-fade-leave-active {
  transition: opacity 0.3s ease;
}

.nested-fade-enter-from,
.nested-fade-leave-to {
  opacity: 0;
}
</style>
```

## 📊 路由信息获取

在嵌套路由中，你可以获取完整的路由匹配信息：

```vue
<script setup>
import { useRoute, useMatched } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()
const matched = useMatched()

// 获取当前路由深度
const routeDepth = computed(() => {
  return route.value.path.split('/').filter(Boolean).length
})

// 获取所有匹配的路由记录
const matchedRoutes = computed(() => matched.value)

// 生成面包屑导航
const breadcrumbs = computed(() => {
  const crumbs = []
  const pathSegments = route.value.path.split('/').filter(Boolean)

  crumbs.push({ name: '首页', path: '/' })

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    crumbs.push({
      name: segment,
      path: currentPath,
    })
  })

  return crumbs
})
</script>

<template>
  <div class="route-info">
    <div class="breadcrumbs">
      <RouterLink
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        :to="crumb.path"
        class="breadcrumb-item"
      >
        {{ crumb.name }}
      </RouterLink>
    </div>

    <div class="route-details">
      <p>当前路径: {{ route.value.path }}</p>
      <p>路由深度: {{ routeDepth }}</p>
      <p>匹配的路由: {{ matchedRoutes.length }} 层</p>
    </div>
  </div>
</template>
```

## 🔗 命名视图

在嵌套路由中使用命名视图：

```typescript
const routes = [
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        components: {
          default: DashboardHome,
          sidebar: DashboardSidebar,
          header: DashboardHeader,
        },
      },
    ],
  },
]
```

```vue
<!-- DashboardLayout.vue -->
<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <RouterView name="header" />
    </header>

    <aside class="dashboard-sidebar">
      <RouterView name="sidebar" />
    </aside>

    <main class="dashboard-main">
      <RouterView />
    </main>
  </div>
</template>
```

## ⚡ 性能优化

### 懒加载嵌套路由

```typescript
const routes = [
  {
    path: '/admin',
    component: () => import('./layouts/AdminLayout.vue'),
    children: [
      {
        path: 'users',
        component: () => import('./views/admin/Users.vue'),
      },
      {
        path: 'products',
        component: () => import('./views/admin/Products.vue'),
      },
    ],
  },
]
```

### 预加载策略

```typescript
import { createPreloadPlugin } from '@ldesign/router'

const preloadPlugin = createPreloadPlugin({
  strategy: 'hover', // 鼠标悬停时预加载
  delay: 200,
  maxConcurrent: 3,
})

router.use(preloadPlugin)
```

## 🛡️ 路由守卫

嵌套路由中的守卫执行顺序：

1. 全局前置守卫
2. 路由独享守卫（从外到内）
3. 组件内守卫（从外到内）

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: (to, from, next) => {
      // 管理员权限检查
      if (!isAdmin()) {
        next('/login')
      } else {
        next()
      }
    },
    children: [
      {
        path: 'users',
        component: UsersView,
        beforeEnter: (to, from, next) => {
          // 用户管理权限检查
          if (!hasUserPermission()) {
            next('/admin')
          } else {
            next()
          }
        },
      },
    ],
  },
]
```

## 🎯 最佳实践

### 1. 合理的路由层级

```typescript
// ✅ 好的做法 - 清晰的层级结构
const routes = [
  {
    path: '/blog',
    component: BlogLayout,
    children: [
      { path: '', component: BlogHome },
      { path: 'category/:category', component: CategoryView },
      { path: 'post/:id', component: PostView },
    ],
  },
]

// ❌ 避免过深的嵌套
const routes = [
  {
    path: '/a',
    children: [
      {
        path: 'b',
        children: [
          {
            path: 'c',
            children: [{ path: 'd', component: TooDeep }],
          },
        ],
      },
    ],
  },
]
```

### 2. 使用布局组件

```vue
<!-- BlogLayout.vue -->
<template>
  <div class="blog-layout">
    <BlogHeader />
    <div class="blog-content">
      <BlogSidebar />
      <main class="blog-main">
        <RouterView />
      </main>
    </div>
    <BlogFooter />
  </div>
</template>
```

### 3. 错误处理

```vue
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((error, instance, info) => {
  console.error('嵌套路由组件错误:', error)
  // 可以显示错误页面或回退到父路由
  return false
})
</script>

<template>
  <div class="nested-route-container">
    <Suspense>
      <template #default>
        <RouterView />
      </template>
      <template #fallback>
        <div class="loading">加载中...</div>
      </template>
    </Suspense>
  </div>
</template>
```

## 🔍 调试技巧

### 路由调试信息

```vue
<script setup>
import { useRoute, useMatched } from '@ldesign/router'
import { watch } from 'vue'

const route = useRoute()
const matched = useMatched()

// 监听路由变化
watch(
  route,
  newRoute => {
    console.log('路由变化:', {
      path: newRoute.path,
      name: newRoute.name,
      params: newRoute.params,
      query: newRoute.query,
      matched: matched.value.map(r => r.name),
    })
  },
  { immediate: true }
)
</script>
```

### 开发工具

在开发环境中启用路由调试：

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  // 开发环境启用调试
  debug: process.env.NODE_ENV === 'development',
})
```

## 📚 相关文档

- [动态路由](./dynamic-routes.md) - 了解如何使用参数化路由
- [路由守卫](./route-guards.md) - 学习路由权限控制
- [增强的 RouterView](./enhanced-router-view.md) - 探索更多 RouterView 功能
- [性能监控](./performance-monitoring.md) - 监控嵌套路由的性能
