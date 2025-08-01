# 基础应用示例

这是一个最简单的 LDesign 应用示例，展示了如何使用核心功能创建一个完整的 Vue3 应用。

## 📋 功能特性

- ✅ 基础引擎配置
- ✅ 路由系统
- ✅ HTTP请求
- ✅ 状态管理
- ✅ 错误处理
- ✅ 性能监控

## 🚀 在线演示

[查看在线演示](https://ldesign-basic-demo.netlify.app)

## 📁 项目结构

```
basic-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   └── UserCard.vue
│   ├── views/
│   │   ├── Home.vue
│   │   ├── About.vue
│   │   └── Users.vue
│   ├── stores/
│   │   └── user.ts
│   ├── router/
│   │   └── index.ts
│   ├── api/
│   │   └── users.ts
│   ├── App.vue
│   └── main.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ 安装和运行

### 克隆项目

```bash
git clone https://github.com/ldesign-org/ldesign.git
cd ldesign/examples/basic-app
```

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

## 📝 核心代码

### main.ts - 应用入口

```typescript
import { createEngine } from '@ldesign/engine'
import { createHttpClient } from '@ldesign/http'
import { createRouter } from '@ldesign/router'
import App from './App.vue'
import router from './router'
import './style.css'

// 创建HTTP客户端
const http = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  interceptors: {
    request: [
      (config) => {
        console.log('发送请求:', config.url)
        return config
      }
    ],
    response: [
      (response) => {
        console.log('收到响应:', response.status)
        return response
      },
      (error) => {
        console.error('请求失败:', error.message)
        return Promise.reject(error)
      }
    ]
  }
})

// 创建引擎
const engine = createEngine({
  debug: import.meta.env.DEV,
  performance: {
    enabled: true,
    thresholds: {
      responseTime: 1000,
      fps: 30,
      memory: 50 * 1024 * 1024 // 50MB
    }
  },
  cache: {
    strategy: 'lru',
    maxSize: 50,
    ttl: 5 * 60 * 1000 // 5分钟
  },
  errorHandler: (error, instance, info) => {
    console.error('应用错误:', error)
    console.error('错误信息:', info)
    // 在生产环境中，可以发送错误到监控服务
    if (import.meta.env.PROD) {
      // sendErrorToMonitoring(error, info)
    }
  }
})

// 安装插件
engine.use(router)
engine.use(http)

// 创建应用
const app = engine.createApp(App)

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('LDesign引擎已启动')
  console.log('引擎实例:', engine)

  // 性能监控
  engine.performance.on('violation', (violation) => {
    console.warn('性能警告:', violation)
  })
}
```

### router/index.ts - 路由配置

```typescript
import { createRouter } from '@ldesign/router'
import About from '../views/About.vue'
import Home from '../views/Home.vue'
import Users from '../views/Users.vue'

const router = createRouter({
  history: 'hash',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        title: '首页',
        requiresAuth: false
      }
    },
    {
      path: '/about',
      name: 'About',
      component: About,
      meta: {
        title: '关于我们',
        requiresAuth: false
      }
    },
    {
      path: '/users',
      name: 'Users',
      component: Users,
      meta: {
        title: '用户列表',
        requiresAuth: false
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue'),
      meta: {
        title: '页面未找到'
      }
    }
  ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - LDesign 基础应用`
  }

  // 检查认证（示例）
  if (to.meta?.requiresAuth) {
    const isAuthenticated = localStorage.getItem('token')
    if (!isAuthenticated) {
      next('/login')
      return
    }
  }

  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  console.log(`路由跳转: ${from.path} -> ${to.path}`)
})

export default router
```

### stores/user.ts - 状态管理

```typescript
import { defineStore } from '@ldesign/engine'
import { useHttp } from '@ldesign/http'
import { computed, ref } from 'vue'

export interface User {
  id: number
  name: string
  email: string
  phone: string
  website: string
}

export const useUserStore = defineStore('user', () => {
  const http = useHttp()

  // 状态
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const userCount = computed(() => users.value.length)
  const hasUsers = computed(() => users.value.length > 0)

  // 操作
  const fetchUsers = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await http.get<User[]>('/users')
      users.value = response.data
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户列表失败'
      console.error('获取用户失败:', err)
    }
    finally {
      loading.value = false
    }
  }

  const getUserById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await http.get<User>(`/users/${id}`)
      currentUser.value = response.data
      return response.data
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户详情失败'
      console.error('获取用户详情失败:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    users.value = []
    currentUser.value = null
    loading.value = false
    error.value = null
  }

  return {
    // 状态
    users,
    currentUser,
    loading,
    error,

    // 计算属性
    userCount,
    hasUsers,

    // 操作
    fetchUsers,
    getUserById,
    clearError,
    reset
  }
})
```

### App.vue - 根组件

```vue
<script setup lang="ts">
import { useEngine } from '@ldesign/engine'
import { onErrorCaptured, onMounted, ref } from 'vue'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import PerformancePanel from './components/PerformancePanel.vue'

const engine = useEngine()
const error = ref<string | null>(null)
const isDev = import.meta.env.DEV

// 错误处理
function clearError() {
  error.value = null
}

// 捕获组件错误
onErrorCaptured((err, instance, info) => {
  console.error('组件错误:', err)
  error.value = `组件错误: ${err.message}`
  return false
})

// 监听全局错误
onMounted(() => {
  window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error)
    error.value = `全局错误: ${event.error?.message || '未知错误'}`
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason)
    error.value = `Promise错误: ${event.reason?.message || '未知错误'}`
  })
})
</script>

<template>
  <div id="app">
    <Header />

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <Footer />

    <!-- 错误提示 -->
    <div v-if="error" class="error-toast">
      {{ error }}
      <button @click="clearError">
        ×
      </button>
    </div>

    <!-- 性能监控面板（开发环境） -->
    <PerformancePanel v-if="isDev" />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #ff4d4f;
  color: white;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-toast button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

### views/Home.vue - 首页

```vue
<script setup lang="ts">
import { useEngine } from '@ldesign/engine'
import { onMounted, onUnmounted, ref } from 'vue'

const engine = useEngine()

const engineInfo = ref({
  version: '1.0.0',
  pluginCount: 0
})

const performanceInfo = ref({
  fps: 0,
  memory: 0
})

let performanceTimer: number

// 获取引擎信息
function getEngineInfo() {
  engineInfo.value = {
    version: engine.version || '1.0.0',
    pluginCount: engine.plugins?.size || 0
  }
}

// 获取性能信息
function getPerformanceInfo() {
  if (engine.performance) {
    const metrics = engine.performance.getMetrics()
    performanceInfo.value = {
      fps: Math.round(metrics.fps || 0),
      memory: Math.round((metrics.memory?.used || 0) / 1024 / 1024)
    }
  }
}

onMounted(() => {
  getEngineInfo()
  getPerformanceInfo()

  // 定期更新性能信息
  performanceTimer = setInterval(getPerformanceInfo, 1000)
})

onUnmounted(() => {
  if (performanceTimer) {
    clearInterval(performanceTimer)
  }
})
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>欢迎使用 LDesign</h1>
      <p class="hero-description">
        基于Vue3的现代化前端开发引擎，提供完整的插件化架构和跨框架兼容性
      </p>
      <div class="hero-actions">
        <router-link to="/users" class="btn btn-primary">
          查看用户列表
        </router-link>
        <router-link to="/about" class="btn btn-secondary">
          了解更多
        </router-link>
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">
          🚀
        </div>
        <h3>高性能</h3>
        <p>基于Vue3构建，提供卓越的性能表现和开发体验</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">
          🔧
        </div>
        <h3>插件化</h3>
        <p>完整的插件系统，支持按需加载和热插拔</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">
          📱
        </div>
        <h3>跨平台</h3>
        <p>支持多种平台和设备类型，一套代码多端运行</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">
          🛡️
        </div>
        <h3>安全可靠</h3>
        <p>内置安全防护机制，保障应用和数据安全</p>
      </div>
    </div>

    <div class="stats">
      <div class="stat-item">
        <div class="stat-number">
          {{ engineInfo.version }}
        </div>
        <div class="stat-label">
          引擎版本
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-number">
          {{ engineInfo.pluginCount }}
        </div>
        <div class="stat-label">
          已加载插件
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-number">
          {{ performanceInfo.fps }}
        </div>
        <div class="stat-label">
          当前FPS
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-number">
          {{ performanceInfo.memory }}
        </div>
        <div class="stat-label">
          内存使用(MB)
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
}

.hero {
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 60px;
}

.hero h1 {
  font-size: 3rem;
  margin: 0 0 20px 0;
  font-weight: 700;
}

.hero-description {
  font-size: 1.2rem;
  margin: 0 0 40px 0;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.feature-card {
  padding: 30px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  margin: 0 0 15px 0;
  color: #1890ff;
  font-size: 1.3rem;
}

.feature-card p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  background: #f8f9fa;
  padding: 40px;
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .features {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
```

## 🎯 关键特性说明

### 1. 引擎配置

- **调试模式**: 开发环境自动启用
- **性能监控**: 实时监控FPS、内存等指标
- **缓存策略**: LRU缓存，提升应用性能
- **错误处理**: 全局错误捕获和处理

### 2. 路由系统

- **路由守卫**: 全局前置和后置守卫
- **元信息**: 页面标题、认证要求等
- **懒加载**: 404页面懒加载
- **过渡动画**: 页面切换动画

### 3. HTTP客户端

- **拦截器**: 请求和响应拦截
- **错误处理**: 统一错误处理机制
- **超时设置**: 10秒请求超时
- **基础URL**: 统一API地址配置

### 4. 状态管理

- **响应式状态**: 基于Vue3响应式系统
- **计算属性**: 派生状态自动更新
- **异步操作**: 支持async/await
- **错误处理**: 操作级别的错误处理

## 📊 性能优化

### 1. 代码分割

```typescript
// 路由懒加载
const About = () => import('../views/About.vue')

// 组件懒加载
const LazyComponent = defineAsyncComponent(() => import('./LazyComponent.vue'))
```

### 2. 缓存策略

```typescript
// HTTP缓存
const http = createHttpClient({
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5分钟
    maxSize: 100
  }
})

// 组件缓存
<keep-alive>
  <router-view />
</keep-alive>
```

### 3. 性能监控

```typescript
// 性能阈值设置
const engine = createEngine({
  performance: {
    thresholds: {
      responseTime: 1000, // 1秒
      fps: 30, // 30FPS
      memory: 50 * 1024 * 1024 // 50MB
    }
  }
})
```

## 🔧 开发技巧

### 1. 调试技巧

```typescript
// 开发环境调试
if (import.meta.env.DEV) {
  console.log('调试信息:', engine)

  // 性能监控
  engine.performance.on('violation', console.warn)

  // 错误监控
  engine.errors.on('error', console.error)
}
```

### 2. 环境配置

```typescript
// 环境变量使用
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
```

### 3. 类型安全

```typescript
// 类型定义
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

// 类型化的HTTP请求
const response = await http.get<ApiResponse<User[]>>('/users')
```

## 🚀 部署指南

### 1. 构建生产版本

```bash
pnpm build
```

### 2. 预览构建结果

```bash
pnpm preview
```

### 3. 部署到静态托管

```bash
# 部署到 Netlify
netlify deploy --prod --dir=dist

# 部署到 Vercel
vercel --prod
```

## 📚 扩展阅读

- [路由系统详解](../packages/router/)
- [HTTP客户端使用指南](../packages/http/)
- [状态管理最佳实践](../guide/state)
- [性能优化技巧](../guide/performance)

---

这个基础应用示例展示了 LDesign 的核心功能和最佳实践。您可以基于这个示例快速开始您的项目开发！
