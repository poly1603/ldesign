# 嵌套路由示例

这个示例展示了如何使用 LDesign Router 构建复杂的嵌套路由结构，包括多层布局和智能预加载。

## 🎯 示例概述

我们将构建一个包含以下结构的应用：

- 主布局（Header + Sidebar + Main）
- 用户管理模块（用户列表、用户详情、用户编辑）
- 产品管理模块（产品列表、产品详情、产品分类）

## 🏗️ 路由配置

```typescript
// router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '管理后台', icon: 'dashboard' },
      },
      {
        path: 'users',
        component: () => import('../layouts/UsersLayout.vue'),
        meta: { title: '用户管理', icon: 'users' },
        children: [
          {
            path: '',
            name: 'UsersList',
            component: () => import('../views/admin/users/UsersList.vue'),
            meta: { title: '用户列表' },
          },
          {
            path: ':id',
            component: () => import('../layouts/UserDetailLayout.vue'),
            props: true,
            children: [
              {
                path: '',
                name: 'UserDetail',
                component: () => import('../views/admin/users/UserDetail.vue'),
                meta: { title: '用户详情' },
              },
              {
                path: 'edit',
                name: 'UserEdit',
                component: () => import('../views/admin/users/UserEdit.vue'),
                meta: { title: '编辑用户' },
              },
              {
                path: 'permissions',
                name: 'UserPermissions',
                component: () => import('../views/admin/users/UserPermissions.vue'),
                meta: { title: '用户权限' },
              },
            ],
          },
        ],
      },
      {
        path: 'products',
        component: () => import('../layouts/ProductsLayout.vue'),
        meta: { title: '产品管理', icon: 'box' },
        children: [
          {
            path: '',
            name: 'ProductsList',
            component: () => import('../views/admin/products/ProductsList.vue'),
            meta: { title: '产品列表' },
          },
          {
            path: 'categories',
            name: 'ProductCategories',
            component: () => import('../views/admin/products/ProductCategories.vue'),
            meta: { title: '产品分类' },
          },
          {
            path: ':id',
            name: 'ProductDetail',
            component: () => import('../views/admin/products/ProductDetail.vue'),
            props: true,
            meta: { title: '产品详情' },
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  // 启用智能预加载和缓存
  preloadStrategy: 'hover',
  cache: {
    max: 20,
    ttl: 10 * 60 * 1000,
    include: [/^Admin/, 'UsersList', 'ProductsList'],
  },
  performance: true,
})

export default router
```

## 🎨 布局组件

### 主管理布局

```vue
<!-- layouts/AdminLayout.vue -->
<script setup>
import { useRoute, useRouter } from '@ldesign/router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

// 导航菜单
const navItems = [
  { path: '/admin', title: '仪表板', icon: 'dashboard' },
  { path: '/admin/users', title: '用户管理', icon: 'users' },
  { path: '/admin/products', title: '产品管理', icon: 'box' },
  { path: '/admin/settings', title: '系统设置', icon: 'settings' },
]

// 面包屑导航
const breadcrumbs = computed(() => {
  return route.matched
    .filter(record => record.meta?.title)
    .map(record => ({
      title: record.meta.title,
      path: record.path === route.path ? null : record.path,
    }))
})

// 退出登录
async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-layout">
    <!-- 顶部导航 -->
    <header class="admin-header">
      <div class="header-left">
        <h1 class="logo">管理后台</h1>
      </div>
      <div class="header-right">
        <span class="user-info">{{ user.name }}</span>
        <button class="logout-btn" @click="logout">退出</button>
      </div>
    </header>

    <div class="admin-body">
      <!-- 侧边栏导航 -->
      <aside class="admin-sidebar">
        <nav class="sidebar-nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            active-class="nav-item--active"
            preload="hover"
          >
            <Icon :name="item.icon" />
            <span>{{ item.title }}</span>
          </RouterLink>
        </nav>
      </aside>

      <!-- 主要内容区域 -->
      <main class="admin-main">
        <!-- 面包屑导航 -->
        <nav class="breadcrumb">
          <span v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
            <RouterLink v-if="crumb.path && index < breadcrumbs.length - 1" :to="crumb.path">
              {{ crumb.title }}
            </RouterLink>
            <span v-else>{{ crumb.title }}</span>
            <Icon v-if="index < breadcrumbs.length - 1" name="chevron-right" />
          </span>
        </nav>

        <!-- 子路由渲染区域 -->
        <div class="content-wrapper">
          <RouterView v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 60px;
  background: #001529;
  color: white;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.admin-body {
  display: flex;
  flex: 1;
}

.admin-sidebar {
  width: 200px;
  background: #f0f2f5;
  border-right: 1px solid #d9d9d9;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: #e6f7ff;
  color: #1890ff;
}

.nav-item--active {
  background: #1890ff;
  color: white;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #d9d9d9;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.content-wrapper {
  flex: 1;
  padding: 2rem;
  background: #f0f2f5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 用户管理布局

```vue
<!-- layouts/UsersLayout.vue -->
<template>
  <div class="users-layout">
    <div class="users-header">
      <h2>用户管理</h2>
      <div class="users-actions">
        <RouterLink to="/admin/users" class="btn btn-secondary" exact-active-class="btn--active">
          用户列表
        </RouterLink>
        <RouterLink to="/admin/users/new" class="btn btn-primary" preload="hover">
          新增用户
        </RouterLink>
      </div>
    </div>

    <div class="users-content">
      <RouterView v-slot="{ Component, route }">
        <transition name="slide-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </RouterView>
    </div>
  </div>
</template>

<style scoped>
.users-layout {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #d9d9d9;
}

.users-header h2 {
  margin: 0;
  color: #333;
}

.users-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: white;
  color: #333;
}

.btn-primary {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.btn:hover {
  opacity: 0.8;
}

.btn--active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.users-content {
  padding: 2rem;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}
</style>
```

## 📄 页面组件

### 用户列表页面

```vue
<!-- views/admin/users/UsersList.vue -->
<script setup>
import { useRoute, useRouter } from '@ldesign/router'
import { computed, onMounted, ref, watch } from 'vue'

const route = useRoute()
const router = useRouter()

const users = ref([])
const totalUsers = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value))

// 加载用户数据
async function loadUsers() {
  try {
    const response = await fetch(
      `/api/users?page=${currentPage.value}&size=${pageSize.value}&search=${searchQuery.value}`
    )
    const data = await response.json()

    users.value = data.users
    totalUsers.value = data.total
  } catch (error) {
    console.error('加载用户失败:', error)
  }
}

// 搜索用户
function search() {
  currentPage.value = 1
  loadUsers()
}

// 分页操作
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadUsers()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadUsers()
  }
}

// 删除用户
async function deleteUser(userId) {
  if (confirm('确定要删除这个用户吗？')) {
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      loadUsers() // 重新加载列表
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }
}

// 监听路由查询参数
watch(
  () => route.query,
  newQuery => {
    currentPage.value = Number(newQuery.page) || 1
    searchQuery.value = newQuery.search || ''
    loadUsers()
  },
  { immediate: true }
)

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="users-list">
    <div class="list-header">
      <div class="search-bar">
        <input v-model="searchQuery" placeholder="搜索用户..." class="search-input" />
        <button class="search-btn" @click="search">搜索</button>
      </div>

      <div class="list-stats">
        <span>共 {{ totalUsers }} 个用户</span>
      </div>
    </div>

    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span :class="`status status--${user.status}`">
                {{ user.status }}
              </span>
            </td>
            <td>
              <div class="actions">
                <RouterLink
                  :to="`/admin/users/${user.id}`"
                  class="action-btn action-btn--view"
                  preload="hover"
                >
                  查看
                </RouterLink>
                <RouterLink
                  :to="`/admin/users/${user.id}/edit`"
                  class="action-btn action-btn--edit"
                  preload="visible"
                >
                  编辑
                </RouterLink>
                <button class="action-btn action-btn--delete" @click="deleteUser(user.id)">
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button :disabled="currentPage === 1" class="page-btn" @click="prevPage">上一页</button>
      <span class="page-info"> 第 {{ currentPage }} 页，共 {{ totalPages }} 页 </span>
      <button :disabled="currentPage === totalPages" class="page-btn" @click="nextPage">
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.users-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #d9d9d9;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  width: 200px;
}

.search-btn {
  padding: 0.5rem 1rem;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.users-table {
  overflow-x: auto;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.users-table th {
  background: #fafafa;
  font-weight: 600;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status--active {
  background: #f6ffed;
  color: #52c41a;
}

.status--inactive {
  background: #fff2e8;
  color: #fa8c16;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.8rem;
  cursor: pointer;
}

.action-btn--view {
  background: #e6f7ff;
  color: #1890ff;
}

.action-btn--edit {
  background: #fff7e6;
  color: #fa8c16;
}

.action-btn--delete {
  background: #fff2f0;
  color: #f5222d;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #d9d9d9;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}
</style>
```

## 🎯 关键特性

### 1. 智能预加载

- 导航链接使用 `preload="hover"` 实现悬停预加载
- 重要操作使用 `preload="visible"` 实现可见预加载

### 2. 缓存策略

- 列表页面启用缓存，提升返回时的加载速度
- 编辑页面不缓存，确保数据实时性

### 3. 过渡动画

- 不同层级使用不同的过渡效果
- 提供流畅的用户体验

### 4. 面包屑导航

- 自动生成基于路由层级的面包屑
- 支持点击跳转到上级页面

这个示例展示了如何使用 LDesign Router 构建复杂的嵌套路由应用，充分利用了智能预加载、缓存和性能监控等
特性。
