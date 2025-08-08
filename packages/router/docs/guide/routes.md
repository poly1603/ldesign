# 路由配置

路由配置是 LDesign Router 的核心，它定义了 URL 与组件之间的映射关系。本指南将详细介绍如何配置和组织
路由。

## 🎯 基础路由配置

### 简单路由

最基本的路由配置包含路径和组件：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue'),
  },
  {
    path: '/about',
    component: () => import('./views/About.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

### 命名路由

为路由指定名称，便于编程式导航：

```typescript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue'),
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('./views/UserProfile.vue'),
  },
]

// 使用命名路由导航
router.push({ name: 'UserProfile', params: { id: '123' } })
```

### 路由元信息

通过 `meta` 字段添加路由的额外信息：

```typescript
const routes = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('./views/Admin.vue'),
    meta: {
      title: '管理后台',
      requiresAuth: true,
      roles: ['admin'],
      icon: 'admin-icon',
      cache: true,
      transition: 'slide-left',
    },
  },
]
```

## 🔗 动态路由

### 路径参数

使用冒号 `:` 定义动态路径参数：

```typescript
const routes = [
  // 单个参数
  {
    path: '/user/:id',
    component: UserProfile,
  },

  // 多个参数
  {
    path: '/user/:id/post/:postId',
    component: UserPost,
  },

  // 可选参数
  {
    path: '/product/:id?',
    component: Product,
  },
]
```

### 参数验证

通过正则表达式验证参数格式：

```typescript
const routes = [
  {
    path: '/user/:id(\\d+)', // 只匹配数字
    component: UserProfile,
  },
  {
    path: '/article/:slug([a-z0-9-]+)', // 只匹配小写字母、数字和连字符
    component: Article,
  },
]
```

### 通配符路由

使用 `*` 匹配任意路径：

```typescript
const routes = [
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./views/NotFound.vue'),
  },

  // 匹配特定前缀
  {
    path: '/docs/:path(.*)',
    component: DocsViewer,
  },
]
```

## 🏗️ 嵌套路由

### 基础嵌套

通过 `children` 配置子路由：

```typescript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      {
        path: '', // 空路径表示默认子路由
        component: UserHome,
      },
      {
        path: 'profile', // 匹配 /user/profile
        component: UserProfile,
      },
      {
        path: 'settings', // 匹配 /user/settings
        component: UserSettings,
      },
    ],
  },
]
```

### 深层嵌套

支持多层嵌套路由：

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

### 命名视图

在同一级路由中渲染多个组件：

```typescript
const routes = [
  {
    path: '/dashboard',
    components: {
      default: Dashboard,
      sidebar: Sidebar,
      header: Header,
    },
  },
]
```

```vue
<!-- 在模板中使用 -->
<template>
  <div class="layout">
    <RouterView name="header" />
    <div class="main">
      <RouterView name="sidebar" />
      <RouterView />
      <!-- 默认视图 -->
    </div>
  </div>
</template>
```

## 🎛️ 路由属性

### props 传递

将路由参数作为 props 传递给组件：

```typescript
const routes = [
  {
    path: '/user/:id',
    component: UserProfile,
    props: true, // 将 params 作为 props
  },

  // 对象模式
  {
    path: '/promotion',
    component: Promotion,
    props: { newsletter: false },
  },

  // 函数模式
  {
    path: '/search',
    component: SearchResults,
    props: route => ({
      query: route.query.q,
      page: Number(route.query.page) || 1,
    }),
  },
]
```

### 重定向

配置路由重定向：

```typescript
const routes = [
  // 字符串重定向
  {
    path: '/home',
    redirect: '/',
  },

  // 对象重定向
  {
    path: '/user/:id',
    redirect: to => ({
      name: 'UserProfile',
      params: { id: to.params.id },
    }),
  },

  // 函数重定向
  {
    path: '/old-path/:id',
    redirect: to => {
      return `/new-path/${to.params.id}`
    },
  },
]
```

### 别名

为路由设置别名：

```typescript
const routes = [
  {
    path: '/users',
    component: Users,
    alias: ['/people', '/members'], // 多个别名
  },

  {
    path: '/user/:id',
    component: UserProfile,
    alias: '/profile/:id', // 参数别名
  },
]
```

## 🚀 高级配置

### 懒加载

使用动态导入实现路由懒加载：

```typescript
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue'),
  },

  // 分组懒加载
  {
    path: '/admin',
    component: () =>
      import(
        /* webpackChunkName: "admin" */
        './views/Admin.vue'
      ),
  },
]
```

### 预加载配置

配置路由级别的预加载策略：

```typescript
const routes = [
  {
    path: '/products',
    component: () => import('./views/Products.vue'),
    meta: {
      preload: 'hover', // 悬停预加载
      cache: true, // 启用缓存
    },
  },

  {
    path: '/heavy-page',
    component: () => import('./views/HeavyPage.vue'),
    meta: {
      preload: 'visible', // 可见时预加载
      cacheTTL: 10 * 60 * 1000, // 10分钟缓存
    },
  },
]
```

### 路由守卫

在路由配置中添加守卫：

```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      if (!isAdmin()) {
        next('/403')
      } else {
        next()
      }
    },
  },

  // 多个守卫
  {
    path: '/sensitive',
    component: Sensitive,
    beforeEnter: [checkAuth, checkPermission, logAccess],
  },
]
```

## 📁 路由组织

### 模块化配置

将路由按功能模块组织：

```typescript
import { adminRoutes } from './admin'
// routes/user.ts
// routes/index.ts
import { userRoutes } from './user'

export const userRoutes = [
  {
    path: '/user',
    component: () => import('../layouts/UserLayout.vue'),
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('../views/user/Profile.vue'),
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('../views/user/Settings.vue'),
      },
    ],
  },
]

// routes/admin.ts
export const adminRoutes = [
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
      },
    ],
  },
]

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  ...userRoutes,
  ...adminRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
]
```

### 动态路由

运行时动态添加路由：

```typescript
// 动态添加单个路由
router.addRoute({
  path: '/dynamic',
  name: 'Dynamic',
  component: () => import('./views/Dynamic.vue'),
})

// 动态添加子路由
router.addRoute('Parent', {
  path: 'child',
  name: 'Child',
  component: ChildComponent,
})

// 批量添加路由
const dynamicRoutes = await fetchRoutesFromAPI()
dynamicRoutes.forEach(route => {
  router.addRoute(route)
})
```

## 🎯 最佳实践

### 1. 路由命名规范

```typescript
// ✅ 推荐：使用 PascalCase
{
  name: 'UserProfile',
  path: '/user/:id'
}

// ❌ 避免：使用 kebab-case 或 camelCase
{
  name: 'user-profile',  // 不推荐
  path: '/user/:id'
}
```

### 2. 路径设计

```typescript
// ✅ 推荐：语义化路径
{
  path: '/user/:id/posts/:postId',
  name: 'UserPost'
}

// ❌ 避免：无意义的路径
{
  path: '/page1/item/:id',
  name: 'Item'
}
```

### 3. 元信息使用

```typescript
// ✅ 推荐：结构化元信息
{
  meta: {
    title: '用户资料',
    breadcrumb: ['首页', '用户', '资料'],
    permissions: ['user:read'],
    cache: {
      enabled: true,
      ttl: 5 * 60 * 1000
    }
  }
}
```

### 4. 组件懒加载

```typescript
// ✅ 推荐：按页面懒加载
{
  path: '/dashboard',
  component: () => import('./views/Dashboard.vue')
}

// ✅ 推荐：按模块分组
{
  path: '/admin/users',
  component: () => import(
    /* webpackChunkName: "admin" */
    './views/admin/Users.vue'
  )
}
```

通过合理的路由配置，你可以构建出结构清晰、性能优秀的单页应用。下一步，让我们学习如何在应用中进
行[导航](/guide/navigation)。
