# 嵌套路由

嵌套路由是构建复杂应用的重要功能，它允许你创建多层级的路由结构，每一层都有自己的组件和子路由。

## 🎯 基础概念

### 什么是嵌套路由？

嵌套路由允许你在一个路由组件内部渲染子路由组件，形成层级结构：

```
/user/profile          → UserLayout → UserProfile
/user/settings         → UserLayout → UserSettings
/user/posts            → UserLayout → UserPosts
/user/posts/123        → UserLayout → UserPosts → PostDetail
```

### 路由结构

```typescript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
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

## 🏗️ 基础嵌套

### 父路由组件

父路由组件需要包含 `<RouterView>` 来渲染子路由：

```vue
<!-- UserLayout.vue -->
<template>
  <div class="user-layout">
    <!-- 用户导航 -->
    <nav class="user-nav">
      <RouterLink to="/user/profile"> 个人资料 </RouterLink>
      <RouterLink to="/user/settings"> 设置 </RouterLink>
      <RouterLink to="/user/posts"> 我的文章 </RouterLink>
    </nav>

    <!-- 子路由渲染区域 -->
    <main class="user-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.user-layout {
  display: flex;
  min-height: 100vh;
}

.user-nav {
  width: 200px;
  background: #f5f5f5;
  padding: 1rem;
}

.user-nav a {
  display: block;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
}

.user-nav a.router-link-active {
  background: #1890ff;
  color: white;
}

.user-content {
  flex: 1;
  padding: 2rem;
}
</style>
```

### 子路由配置

```typescript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      // 空路径表示默认子路由
      {
        path: '',
        component: UserHome,
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile,
        meta: { title: '个人资料' },
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: UserSettings,
        meta: { title: '设置' },
      },
      {
        path: 'posts',
        name: 'UserPosts',
        component: UserPosts,
        meta: { title: '我的文章' },
      },
    ],
  },
]
```

## 🔗 深层嵌套

### 多级嵌套结构

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
                component: UserOverview,
              },
              {
                path: 'edit',
                component: UserEdit,
              },
              {
                path: 'permissions',
                component: UserPermissions,
              },
            ],
          },
        ],
      },
      {
        path: 'products',
        component: ProductsLayout,
        children: [
          {
            path: '',
            component: ProductsList,
          },
          {
            path: 'categories',
            component: CategoriesManagement,
          },
          {
            path: ':id',
            component: ProductDetail,
          },
        ],
      },
    ],
  },
]
```

### 多级布局组件

```vue
<!-- AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <header class="admin-header">
      <h1>管理后台</h1>
      <nav class="main-nav">
        <RouterLink to="/admin/users"> 用户管理 </RouterLink>
        <RouterLink to="/admin/products"> 产品管理 </RouterLink>
      </nav>
    </header>

    <main class="admin-main">
      <RouterView />
    </main>
  </div>
</template>
```

```vue
<!-- UsersLayout.vue -->
<template>
  <div class="users-layout">
    <aside class="users-sidebar">
      <nav class="sub-nav">
        <RouterLink to="/admin/users"> 用户列表 </RouterLink>
        <RouterLink to="/admin/users/roles"> 角色管理 </RouterLink>
        <RouterLink to="/admin/users/permissions"> 权限管理 </RouterLink>
      </nav>
    </aside>

    <section class="users-content">
      <RouterView />
    </section>
  </div>
</template>
```

## 🎨 命名视图

### 多个视图同时渲染

```typescript
const routes = [
  {
    path: '/dashboard',
    components: {
      default: Dashboard,
      sidebar: Sidebar,
      header: Header,
    },
    children: [
      {
        path: 'analytics',
        components: {
          default: Analytics,
          sidebar: AnalyticsSidebar,
        },
      },
    ],
  },
]
```

### 布局组件使用命名视图

```vue
<!-- DashboardLayout.vue -->
<template>
  <div class="dashboard-layout">
    <!-- 头部视图 -->
    <header class="dashboard-header">
      <RouterView name="header" />
    </header>

    <div class="dashboard-body">
      <!-- 侧边栏视图 -->
      <aside class="dashboard-sidebar">
        <RouterView name="sidebar" />
      </aside>

      <!-- 主要内容视图 -->
      <main class="dashboard-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>
```

## 🎯 动态嵌套

### 基于权限的动态路由

```typescript
// 根据用户权限动态生成嵌套路由
function generateUserRoutes(userPermissions: string[]) {
  const baseRoutes = [
    {
      path: 'profile',
      component: UserProfile,
    },
  ]

  if (userPermissions.includes('user:settings')) {
    baseRoutes.push({
      path: 'settings',
      component: UserSettings,
    })
  }

  if (userPermissions.includes('user:posts')) {
    baseRoutes.push({
      path: 'posts',
      component: UserPosts,
      children: [
        {
          path: ':id',
          component: PostDetail,
        },
      ],
    })
  }

  return {
    path: '/user',
    component: UserLayout,
    children: baseRoutes,
  }
}

// 动态添加路由
const userRoutes = generateUserRoutes(currentUser.permissions)
router.addRoute(userRoutes)
```

### 运行时嵌套路由

```typescript
// 动态添加子路由
function addUserSubRoutes(userId: string) {
  router.addRoute('UserDetail', {
    path: 'timeline',
    name: 'UserTimeline',
    component: () => import('./UserTimeline.vue'),
  })

  router.addRoute('UserDetail', {
    path: 'followers',
    name: 'UserFollowers',
    component: () => import('./UserFollowers.vue'),
  })
}
```

## 🔄 路由传参

### 父子路由参数传递

```typescript
const routes = [
  {
    path: '/user/:userId',
    component: UserLayout,
    props: true, // 将参数传递给父组件
    children: [
      {
        path: 'posts/:postId',
        component: PostDetail,
        props: true, // 将参数传递给子组件
      },
    ],
  },
]
```

### 组件中获取参数

```vue
<!-- UserLayout.vue -->
<script setup>
import { useRoute } from '@ldesign/router'

const route = useRoute()

// 获取用户ID
const userId = computed(() => route.params.userId)

// 监听参数变化
watch(
  () => route.params.userId,
  newUserId => {
    loadUserData(newUserId)
  }
)
</script>
```

```vue
<!-- PostDetail.vue -->
<script setup>
import { useRoute } from '@ldesign/router'

const route = useRoute()

// 获取用户ID和文章ID
const userId = computed(() => route.params.userId)
const postId = computed(() => route.params.postId)

// 加载文章数据
onMounted(() => {
  loadPostData(userId.value, postId.value)
})
</script>
```

## 🛡️ 嵌套路由守卫

### 父子路由守卫执行顺序

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: (to, from, next) => {
      console.log('1. 父路由守卫')
      next()
    },
    children: [
      {
        path: 'users',
        component: UserManagement,
        beforeEnter: (to, from, next) => {
          console.log('2. 子路由守卫')
          next()
        },
      },
    ],
  },
]

// 全局守卫
router.beforeEach((to, from, next) => {
  console.log('0. 全局守卫')
  next()
})
```

### 嵌套权限控制

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin'] },
    beforeEnter: checkAdminPermission,
    children: [
      {
        path: 'users',
        component: UserManagement,
        meta: { permissions: ['user:read'] },
        beforeEnter: checkUserPermission,
      },
      {
        path: 'users/:id/edit',
        component: UserEdit,
        meta: { permissions: ['user:write'] },
        beforeEnter: checkUserEditPermission,
      },
    ],
  },
]

function checkAdminPermission(to, from, next) {
  if (!hasRole('admin')) {
    next('/403')
  } else {
    next()
  }
}

function checkUserPermission(to, from, next) {
  if (!hasPermission('user:read')) {
    next('/403')
  } else {
    next()
  }
}
```

## 🎨 嵌套路由最佳实践

### 1. 布局组件设计

```vue
<!-- 推荐：清晰的布局结构 -->
<template>
  <div class="layout">
    <!-- 固定头部 -->
    <header class="layout-header">
      <slot name="header">
        <DefaultHeader />
      </slot>
    </header>

    <!-- 主要内容区 -->
    <div class="layout-body">
      <!-- 侧边栏 -->
      <aside v-if="showSidebar" class="layout-sidebar">
        <slot name="sidebar">
          <DefaultSidebar />
        </slot>
      </aside>

      <!-- 内容区域 -->
      <main class="layout-main">
        <RouterView />
      </main>
    </div>

    <!-- 固定底部 -->
    <footer class="layout-footer">
      <slot name="footer">
        <DefaultFooter />
      </slot>
    </footer>
  </div>
</template>
```

### 2. 路由组织

```typescript
// 推荐：按功能模块组织
const userRoutes = {
  path: '/user',
  component: UserLayout,
  children: [
    { path: '', component: UserHome },
    { path: 'profile', component: UserProfile },
    { path: 'settings', component: UserSettings },
  ],
}

const adminRoutes = {
  path: '/admin',
  component: AdminLayout,
  meta: { requiresAuth: true, roles: ['admin'] },
  children: [
    { path: '', component: AdminDashboard },
    { path: 'users', component: UserManagement },
    { path: 'settings', component: AdminSettings },
  ],
}
```

### 3. 性能优化

```typescript
// 推荐：懒加载嵌套路由
const routes = [
  {
    path: '/admin',
    component: () => import('./layouts/AdminLayout.vue'),
    children: [
      {
        path: 'users',
        component: () =>
          import(
            /* webpackChunkName: "admin-users" */
            './views/admin/Users.vue'
          ),
      },
      {
        path: 'products',
        component: () =>
          import(
            /* webpackChunkName: "admin-products" */
            './views/admin/Products.vue'
          ),
      },
    ],
  },
]
```

通过合理使用嵌套路由，你可以构建出结构清晰、易于维护的复杂应用。接下来，让我们学
习[动态路由](/guide/dynamic-routes)的使用方法。
