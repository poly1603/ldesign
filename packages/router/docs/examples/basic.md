# 基础示例

这个示例展示了如何使用 LDesign Router 创建一个基本的单页应用。

## 🎯 功能特性

- ✅ 基础路由配置
- ✅ 声明式导航
- ✅ 编程式导航
- ✅ 动态路由参数
- ✅ 查询参数处理
- ✅ 路由元信息
- ✅ 智能预加载
- ✅ 性能监控

## 📁 项目结构

```
src/
├── router/
│   └── index.ts          # 路由配置
├── views/
│   ├── Home.vue          # 首页
│   ├── About.vue         # 关于页面
│   ├── Contact.vue       # 联系页面
│   └── User.vue          # 用户页面
├── components/
│   └── Navigation.vue    # 导航组件
├── App.vue               # 根组件
└── main.ts               # 入口文件
```

## 🚀 完整代码

### 路由配置

```typescript
import type { RouteRecordRaw } from '@ldesign/router'
// src/router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      description: '欢迎来到我们的网站',
      cache: true,
      preload: 'immediate',
    },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: {
      title: '关于我们',
      description: '了解我们的故事',
      cache: true,
    },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue'),
    meta: {
      title: '联系我们',
      description: '与我们取得联系',
    },
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('../views/User.vue'),
    props: true,
    meta: {
      title: '用户资料',
      description: '查看用户详细信息',
      requiresAuth: true,
      cache: true,
    },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue'),
    meta: {
      title: '搜索结果',
      cache: false, // 搜索结果不缓存
    },
  },
  {
    // 404 页面
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '页面未找到',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  // 🚀 启用高级功能
  preloadStrategy: 'hover', // 悬停预加载
  performance: true, // 性能监控
  cache: {
    max: 20, // 最多缓存 20 个页面
    ttl: 10 * 60 * 1000, // 10分钟过期
    include: [
      // 包含规则
      'Home', // 首页
      'About', // 关于页面
      /^User/, // 用户相关页面
    ],
    exclude: [
      // 排除规则
      'Search', // 搜索页面
      'Contact', // 联系页面
    ],
  },
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - My App`
  }

  // 检查认证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
    return
  }

  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 发送页面浏览统计
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: to.meta.title,
      page_location: window.location.href,
      page_path: to.path,
    })
  }

  // 打印性能统计
  const stats = router.getPerformanceStats()
  console.log('导航性能:', {
    duration: `${stats.averageDuration}ms`,
    total: stats.totalNavigations,
    success: `${(stats.successRate * 100).toFixed(1)}%`,
  })
})

// 简单的认证检查函数
function isAuthenticated(): boolean {
  return localStorage.getItem('token') !== null
}

export default router
```

### 主应用文件

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册路由器
app.use(router)

// 等待路由器准备就绪
router.isReady().then(() => {
  app.mount('#app')
  console.log('🚀 应用启动成功！')
})
```

### 根组件

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import Navigation from './components/Navigation.vue'
</script>

<template>
  <div id="app">
    <!-- 导航栏 -->
    <Navigation />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <RouterView v-slot="{ Component, route }">
        <!-- 页面过渡动画 -->
        <transition :name="route.meta.transition || 'fade'" mode="out-in" appear>
          <component :is="Component" :key="route.path" class="page" />
        </transition>
      </RouterView>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <p>&copy; 2024 My App. All rights reserved.</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.page {
  animation: fadeIn 0.3s ease-in-out;
}

.footer {
  background: #f8f9fa;
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}
</style>
```

### 导航组件

```vue
<!-- src/components/Navigation.vue -->
<script setup lang="ts">
import { useRouter } from '@ldesign/router'
import { ref } from 'vue'

const router = useRouter()
const isMenuOpen = ref(false)
const searchQuery = ref('')

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'Search',
      query: { q: searchQuery.value.trim() },
    })
    closeMenu()
  }
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <RouterLink to="/" class="logo" preload="immediate"> 🚀 My App </RouterLink>

      <!-- 导航菜单 -->
      <div class="nav-menu" :class="{ active: isMenuOpen }">
        <RouterLink to="/" class="nav-link" preload="hover" @click="closeMenu">
          🏠 首页
        </RouterLink>

        <RouterLink to="/about" class="nav-link" preload="visible" @click="closeMenu">
          ℹ️ 关于
        </RouterLink>

        <RouterLink to="/contact" class="nav-link" preload="hover" @click="closeMenu">
          📞 联系
        </RouterLink>

        <!-- 用户菜单 -->
        <div class="nav-dropdown">
          <button class="nav-link dropdown-toggle">👤 用户</button>
          <div class="dropdown-menu">
            <RouterLink to="/user/123" class="dropdown-item" preload="hover" @click="closeMenu">
              我的资料
            </RouterLink>
            <RouterLink to="/user/456" class="dropdown-item" preload="hover" @click="closeMenu">
              其他用户
            </RouterLink>
          </div>
        </div>

        <!-- 搜索框 -->
        <form class="search-form" @submit.prevent="handleSearch">
          <input v-model="searchQuery" type="text" placeholder="搜索..." class="search-input" />
          <button type="submit" class="search-btn">🔍</button>
        </form>
      </div>

      <!-- 移动端菜单按钮 -->
      <button class="menu-toggle" aria-label="切换菜单" @click="toggleMenu">
        <span />
        <span />
        <span />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #1890ff;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.nav-link:hover {
  background: #f0f0f0;
  color: #1890ff;
}

.nav-link.router-link-active {
  background: #1890ff;
  color: white;
}

/* 下拉菜单 */
.nav-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s;
  min-width: 150px;
}

.nav-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item:last-child {
  border-bottom: none;
}

/* 搜索表单 */
.search-form {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.search-btn {
  padding: 0.5rem;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 移动端菜单按钮 */
.menu-toggle {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.menu-toggle span {
  width: 25px;
  height: 3px;
  background: #333;
  margin: 3px 0;
  transition: 0.3s;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
  }

  .nav-menu.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .menu-toggle {
    display: flex;
  }

  .search-input {
    width: 100%;
  }

  .nav-dropdown:hover .dropdown-menu {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    border: none;
  }
}
</style>
```

## 🎨 页面组件

### 首页

```vue
<!-- src/views/Home.vue -->
<script setup lang="ts">
import { useRouter } from '@ldesign/router'
import { onMounted, ref } from 'vue'

const router = useRouter()
const stats = ref({
  totalNavigations: 0,
  averageDuration: 0,
  successRate: 1,
})
const cacheStats = ref({
  hitRate: 0,
})

onMounted(() => {
  // 获取性能统计
  const performanceStats = router.getPerformanceStats()
  stats.value = performanceStats

  // 获取缓存统计
  const cache = router.getCacheStats()
  cacheStats.value = cache
})
</script>

<template>
  <div class="home">
    <section class="hero">
      <h1>🚀 欢迎使用 LDesign Router</h1>
      <p>现代化、高性能的 Vue 3 路由解决方案</p>
      <div class="hero-actions">
        <RouterLink to="/about" class="btn btn-primary" preload="hover"> 了解更多 </RouterLink>
        <RouterLink to="/contact" class="btn btn-secondary" preload="visible">
          联系我们
        </RouterLink>
      </div>
    </section>

    <section class="features">
      <h2>✨ 核心特性</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>⚡ 高性能</h3>
          <p>优化的路由匹配算法，导航速度提升 50%</p>
        </div>
        <div class="feature-card">
          <h3>🎯 智能预加载</h3>
          <p>多种预加载策略，提升用户体验</p>
        </div>
        <div class="feature-card">
          <h3>💾 智能缓存</h3>
          <p>LRU + TTL 混合缓存策略</p>
        </div>
        <div class="feature-card">
          <h3>📊 性能监控</h3>
          <p>实时监控导航性能</p>
        </div>
      </div>
    </section>

    <section class="stats">
      <h2>📈 实时统计</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">
            {{ stats.totalNavigations }}
          </div>
          <div class="stat-label">总导航次数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.averageDuration }}ms</div>
          <div class="stat-label">平均耗时</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ (stats.successRate * 100).toFixed(1) }}%</div>
          <div class="stat-label">成功率</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ cacheStats.hitRate }}%</div>
          <div class="stat-label">缓存命中率</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 4rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.features {
  margin-bottom: 4rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.stats h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 200px;
  }
}
</style>
```

这个基础示例展示了 LDesign Router 的核心功能，包括路由配置、导航、预加载、缓存和性能监控。你可以基于
这个示例继续扩展更多功能。
