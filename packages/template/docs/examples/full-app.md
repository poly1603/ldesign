# 完整应用示例

本示例展示一个完整的应用，演示如何在实际项目中组织和使用模板系统。

## 项目结构

```
src/
├── main.ts                 # 应用入口
├── App.vue                 # 根组件
├── router/                 # 路由配置
├── stores/                 # 状态管理
├── templates/              # 模板目录
│   ├── layout/
│   │   ├── desktop/
│   │   │   ├── admin/
│   │   │   └── public/
│   │   └── mobile/
│   ├── auth/
│   └── dashboard/
├── components/             # 通用组件
└── utils/                  # 工具函数
```

## 应用入口配置

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import TemplatePlugin from '@ldesign/template'
import App from './App.vue'
import routes from './router'

const app = createApp(App)

// 状态管理
const pinia = createPinia()
app.use(pinia)

// 路由
const router = createRouter({
  history: createWebHistory(),
  routes
})
app.use(router)

// 模板系统
app.use(TemplatePlugin, {
  autoScan: true,
  autoDetectDevice: true,
  cacheEnabled: true,
  cacheSize: 50,
  cacheTTL: 10 * 60 * 1000, // 10分钟
  preloadEnabled: true
})

app.mount('#app')
```

## 根组件

```vue
<!-- App.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user'
import { useTemplateStore } from './stores/template'

const router = useRouter()
const userStore = useUserStore()
const templateStore = useTemplateStore()

// 计算属性
const user = computed(() => userStore.currentUser)

const layoutTemplate = computed(() => {
  if (!user.value) 
    return 'public'
  return user.value.role === 'admin' ? 'admin' : 'user'
})

const layoutProps = computed(() => ({
  title: 'LDesign Template 示例应用',
  user: user.value,
  menuItems: getMenuItems(),
  onMenuClick: handleMenuClick
}))

// 方法
function getMenuItems() {
  if (!user.value) {
    return [
      { id: 'home', title: '首页', path: '/' },
      { id: 'about', title: '关于', path: '/about' }
    ]
  }
  
  const baseItems = [
    { id: 'dashboard', title: '仪表板', path: '/dashboard' },
    { id: 'profile', title: '个人资料', path: '/profile' }
  ]
  
  if (user.value.role === 'admin') {
    baseItems.push(
      { id: 'users', title: '用户管理', path: '/admin/users' },
      { id: 'settings', title: '系统设置', path: '/admin/settings' }
    )
  }
  
  return baseItems
}

function handleMenuClick(item: any) {
  router.push(item.path)
}

function logout() {
  userStore.logout()
  router.push('/')
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div id="app">
    <!-- 根据用户状态选择不同的布局模板 -->
    <LTemplateRenderer
      category="layout"
      :template="layoutTemplate"
      :template-props="layoutProps"
    >
      <!-- 主要内容插槽 -->
      <template #default>
        <router-view />
      </template>
      
      <!-- 用户信息插槽 -->
      <template #user-info>
        <div class="user-info">
          <span>{{ user?.name || '游客' }}</span>
          <button v-if="user" @click="logout">
            退出
          </button>
          <button v-else @click="goToLogin">
            登录
          </button>
        </div>
      </template>
    </LTemplateRenderer>
  </div>
</template>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  height: 100vh;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

## 状态管理

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function login(credentials: { email: string, password: string }) {
    isLoading.value = true
    error.value = null
    
    try {
      // 模拟登录API调用
      const response = await mockLogin(credentials)
      currentUser.value = response.user
      
      // 保存到本地存储
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('token', response.token)
      
      return response
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  function initializeFromStorage() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      currentUser.value = JSON.parse(savedUser)
    }
  }

  return {
    currentUser,
    isLoading,
    error,
    login,
    logout,
    initializeFromStorage
  }
})

// 模拟登录API
async function mockLogin(credentials: { email: string, password: string }) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (credentials.email === 'admin@example.com' && credentials.password === 'admin') {
    return {
      user: {
        id: '1',
        name: '管理员',
        email: 'admin@example.com',
        role: 'admin' as const
      },
      token: 'mock-admin-token'
    }
  }
  
  if (credentials.email === 'user@example.com' && credentials.password === 'user') {
    return {
      user: {
        id: '2',
        name: '普通用户',
        email: 'user@example.com',
        role: 'user' as const
      },
      token: 'mock-user-token'
    }
  }
  
  throw new Error('用户名或密码错误')
}
```

```typescript
// stores/template.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTemplate } from '@ldesign/template'

export const useTemplateStore = defineStore('template', () => {
  const currentTheme = ref('default')
  const deviceOverride = ref<string | null>(null)
  
  const { preload, clearCache } = useTemplate()

  async function setTheme(theme: string) {
    currentTheme.value = theme
    
    // 预加载新主题的模板
    await preload([
      { category: 'layout', template: theme },
      { category: 'dashboard', template: theme }
    ])
  }

  function setDeviceOverride(device: string | null) {
    deviceOverride.value = device
  }

  function clearTemplateCache() {
    clearCache()
  }

  return {
    currentTheme,
    deviceOverride,
    setTheme,
    setDeviceOverride,
    clearTemplateCache
  }
})
```

## 路由配置

```typescript
// router/index.ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    children: [
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/Settings.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  }
]

export default routes
```

## 页面组件

```vue
<!-- views/Login.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginProps = ref({
  title: '用户登录',
  loading: userStore.isLoading,
  error: userStore.error,
  onLogin: handleLogin
})

async function handleLogin(credentials: { email: string, password: string }) {
  try {
    await userStore.login(credentials)
    router.push('/dashboard')
  }
  catch (error) {
    console.error('登录失败:', error)
  }
}
</script>

<template>
  <div class="login-page">
    <LTemplateRenderer
      category="auth"
      template="login"
      :template-props="loginProps"
      @login="handleLogin"
    />
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
```

```vue
<!-- views/Dashboard.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const dashboardTemplate = computed(() => {
  const user = userStore.currentUser
  return user?.role === 'admin' ? 'admin' : 'user'
})

const stats = ref([
  {
    id: 1,
    title: '总用户数',
    value: '1,234',
    change: '+12%',
    changeType: 'positive'
  },
  {
    id: 2,
    title: '活跃用户',
    value: '856',
    change: '+5%',
    changeType: 'positive'
  },
  {
    id: 3,
    title: '收入',
    value: '¥12,345',
    change: '-2%',
    changeType: 'negative'
  }
])

const dashboardProps = computed(() => ({
  title: '仪表板',
  user: userStore.currentUser,
  stats: stats.value
}))
</script>

<template>
  <div class="dashboard-page">
    <LTemplateRenderer
      category="dashboard"
      :template="dashboardTemplate"
      :template-props="dashboardProps"
    >
      <!-- 自定义内容区域 -->
      <template #content>
        <div class="dashboard-content">
          <div class="stats-grid">
            <div v-for="stat in stats" :key="stat.id" class="stat-card">
              <h3>{{ stat.title }}</h3>
              <div class="stat-value">
                {{ stat.value }}
              </div>
              <div class="stat-change" :class="stat.changeType">
                {{ stat.change }}
              </div>
            </div>
          </div>
          
          <div class="charts-section">
            <h2>数据图表</h2>
            <!-- 这里可以放置图表组件 -->
            <div class="chart-placeholder">
              图表区域
            </div>
          </div>
        </div>
      </template>
    </LTemplateRenderer>
  </div>
</template>

<style scoped>
.dashboard-content {
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #28a745;
}

.stat-change.negative {
  color: #dc3545;
}

.charts-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-placeholder {
  height: 300px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 1.1rem;
  margin-top: 1rem;
}
</style>
```

## 布局模板

```vue
<!-- src/templates/layout/desktop/admin/index.vue -->
<script setup lang="ts">
interface MenuItem {
  id: string
  title: string
  path: string
}

interface Props {
  title?: string
  menuItems?: MenuItem[]
  onMenuClick?: (item: MenuItem) => void
}

withDefaults(defineProps<Props>(), {
  title: '管理后台',
  menuItems: () => []
})
</script>

<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="header-left">
        <h1>{{ title }}</h1>
      </div>
      <div class="header-right">
        <slot name="user-info" />
      </div>
    </header>
    
    <div class="admin-body">
      <aside class="admin-sidebar">
        <nav class="admin-nav">
          <div 
            v-for="item in menuItems" 
            :key="item.id"
            class="nav-item"
            @click="onMenuClick?.(item)"
          >
            {{ item.title }}
          </div>
        </nav>
      </aside>
      
      <main class="admin-main">
        <slot name="default" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-header {
  height: 60px;
  background: #2c3e50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-body {
  flex: 1;
  display: flex;
}

.admin-sidebar {
  width: 250px;
  background: #34495e;
  color: white;
}

.admin-nav {
  padding: 1rem 0;
}

.nav-item {
  padding: 1rem 2rem;
  cursor: pointer;
  transition: background 0.3s;
}

.nav-item:hover {
  background: #2c3e50;
}

.admin-main {
  flex: 1;
  background: #f8f9fa;
  overflow-y: auto;
}
</style>
```

这个完整应用示例展示了如何在实际项目中使用 LDesign Template，包括状态管理、路由配置、用户认证和权限控制等功能。
