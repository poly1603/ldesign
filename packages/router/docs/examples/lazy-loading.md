# 懒加载示例

展示如何使用 LDesign Router 实现高效的代码分割和懒加载策略，优化应用性能。

## 🎯 示例概述

构建一个大型电商应用，包含：

- 按功能模块分割代码
- 智能加载策略
- 加载状态处理
- 错误边界处理

## 📦 代码分割策略

```typescript
// router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router'

const routes = [
  // 首页 - 立即加载（关键路径）
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },

  // 产品模块 - 按模块分组
  {
    path: '/products',
    component: () =>
      import(
        /* webpackChunkName: "products" */
        '../layouts/ProductsLayout.vue'
      ),
    children: [
      {
        path: '',
        name: 'ProductList',
        component: () =>
          import(
            /* webpackChunkName: "products" */
            '../views/products/ProductList.vue'
          ),
        meta: { preload: 'visible' },
      },
      {
        path: ':id',
        name: 'ProductDetail',
        component: () =>
          import(
            /* webpackChunkName: "products" */
            '../views/products/ProductDetail.vue'
          ),
        props: true,
        meta: { preload: 'hover' },
      },
      {
        path: 'compare',
        name: 'ProductCompare',
        component: () =>
          import(
            /* webpackChunkName: "products-advanced" */
            '../views/products/ProductCompare.vue'
          ),
        meta: { preload: 'idle' },
      },
    ],
  },

  // 用户中心 - 认证后加载
  {
    path: '/account',
    component: () =>
      import(
        /* webpackChunkName: "account" */
        /* webpackPreload: true */
        '../layouts/AccountLayout.vue'
      ),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AccountDashboard',
        component: () =>
          import(
            /* webpackChunkName: "account" */
            '../views/account/Dashboard.vue'
          ),
      },
      {
        path: 'orders',
        name: 'OrderHistory',
        component: () =>
          import(
            /* webpackChunkName: "account" */
            '../views/account/OrderHistory.vue'
          ),
      },
      {
        path: 'profile',
        name: 'ProfileSettings',
        component: () =>
          import(
            /* webpackChunkName: "account" */
            '../views/account/ProfileSettings.vue'
          ),
      },
    ],
  },

  // 购物车和结算 - 高优先级预加载
  {
    path: '/cart',
    name: 'ShoppingCart',
    component: () =>
      import(
        /* webpackChunkName: "checkout" */
        /* webpackPreload: true */
        '../views/cart/ShoppingCart.vue'
      ),
    meta: { preload: 'immediate' },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () =>
      import(
        /* webpackChunkName: "checkout" */
        '../views/cart/Checkout.vue'
      ),
    meta: { requiresAuth: true, preload: 'immediate' },
  },

  // 管理后台 - 按权限懒加载
  {
    path: '/admin',
    component: () =>
      import(
        /* webpackChunkName: "admin" */
        '../layouts/AdminLayout.vue'
      ),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () =>
          import(
            /* webpackChunkName: "admin-core" */
            '../views/admin/Dashboard.vue'
          ),
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () =>
          import(
            /* webpackChunkName: "admin-products" */
            '../views/admin/ProductManagement.vue'
          ),
      },
      {
        path: 'analytics',
        name: 'AdminAnalytics',
        component: () =>
          import(
            /* webpackChunkName: "admin-analytics" */
            '../views/admin/Analytics.vue'
          ),
      },
    ],
  },

  // 帮助中心 - 低优先级
  {
    path: '/help',
    component: () =>
      import(
        /* webpackChunkName: "help" */
        '../layouts/HelpLayout.vue'
      ),
    children: [
      {
        path: '',
        name: 'HelpCenter',
        component: () =>
          import(
            /* webpackChunkName: "help" */
            '../views/help/HelpCenter.vue'
          ),
      },
      {
        path: 'faq',
        name: 'FAQ',
        component: () =>
          import(
            /* webpackChunkName: "help" */
            '../views/help/FAQ.vue'
          ),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  // 智能预加载配置
  preloadStrategy: 'hover',
  cache: {
    max: 25,
    ttl: 10 * 60 * 1000,
    include: ['ProductList', 'ProductDetail', /^Account/],
  },
})

export default router
```

## 🎨 加载状态处理

### 全局加载组件

```vue
<!-- components/LoadingBoundary.vue -->
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, onMounted, ref } from 'vue'

const route = useRoute()
const progress = ref(0)

// 根据路由生成加载信息
const loadingTitle = computed(() => {
  const routeName = route.name as string
  const titles = {
    ProductList: '产品列表',
    ProductDetail: '产品详情',
    ShoppingCart: '购物车',
    Checkout: '结算页面',
    AdminDashboard: '管理后台',
    HelpCenter: '帮助中心'
  }
  return titles[routeName] || '页面'
})

const loadingMessage = computed(() => {
  const messages = [
    '正在加载组件...',
    '准备页面数据...',
    '渲染用户界面...',
    '即将完成...'
  ]

  const index = Math.floor(progress.value / 25)
  return messages[Math.min(index, messages.length - 1)]
})

// 模拟加载进度
onMounted(() => {
  const interval = setInterval(() => {
    progress.value += Math.random() * 15
    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(interval)
    }
  }, 200)
})
</script>

<template>
  <div class="loading-boundary">
    <Suspense>
      <template #default>
        <slot />
      </template>
      <template #fallback>
        <div class="loading-container">
          <div class="loading-content">
            <div class="loading-spinner">
              <div class="spinner" />
            </div>
            <h3 class="loading-title">
              {{ loadingTitle }}
            </h3>
            <p class="loading-message">
              {{ loadingMessage }}
            </p>
            <div class="loading-progress">
              <div class="progress-bar" :style="{ width: `${progress}%` }" />
            </div>
          </div>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.loading-content {
  text-align: center;
  max-width: 300px;
}

.loading-spinner {
  margin-bottom: 1.5rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-title {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
}

.loading-message {
  margin: 0 0 1.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.loading-progress {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>
```

### 智能加载策略

```vue
<!-- layouts/ProductsLayout.vue -->
<script setup>
import { useRouter } from '@ldesign/router'
import { onMounted, ref } from 'vue'
import LoadingBoundary from '@/components/LoadingBoundary.vue'

const router = useRouter()
const categories = ref([])

// 获取产品分类
async function loadCategories() {
  try {
    const response = await fetch('/api/categories')
    categories.value = await response.json()

    // 预加载热门分类
    categories.value
      .filter(cat => cat.popular)
      .forEach(cat => {
        router.preloadRoute(`/products?category=${cat.slug}`)
      })
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 过渡动画选择
function getTransitionName(route) {
  if (route.query.category) {
    return 'slide-left'
  }
  return 'fade'
}

// 过渡钩子
function onBeforeEnter() {
  // 页面进入前的准备工作
  document.body.style.overflow = 'hidden'
}

function onAfterEnter() {
  // 页面进入后的清理工作
  document.body.style.overflow = 'auto'

  // 预加载相关页面
  router.preloadRoute('/cart')
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="products-layout">
    <header class="products-header">
      <nav class="products-nav">
        <RouterLink
          to="/products"
          exact
          class="nav-item"
          active-class="nav-item--active"
          preload="immediate"
        >
          所有产品
        </RouterLink>
        <RouterLink
          v-for="category in categories"
          :key="category.id"
          :to="`/products?category=${category.slug}`"
          class="nav-item"
          active-class="nav-item--active"
          :preload="category.popular ? 'hover' : 'visible'"
        >
          {{ category.name }}
        </RouterLink>
      </nav>
    </header>

    <main class="products-main">
      <LoadingBoundary>
        <RouterView v-slot="{ Component, route }">
          <transition
            :name="getTransitionName(route)"
            mode="out-in"
            @before-enter="onBeforeEnter"
            @after-enter="onAfterEnter"
          >
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </RouterView>
      </LoadingBoundary>
    </main>
  </div>
</template>

<style scoped>
.products-layout {
  min-height: 100vh;
}

.products-header {
  background: white;
  border-bottom: 1px solid #d9d9d9;
  padding: 1rem 2rem;
}

.products-nav {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
}

.nav-item {
  white-space: nowrap;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: #f0f8ff;
  color: #1890ff;
}

.nav-item--active {
  background: #1890ff;
  color: white;
}

.products-main {
  padding: 2rem;
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

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(30px);
}

.slide-left-leave-to {
  transform: translateX(-30px);
}
</style>
```

## 🔧 错误边界处理

```vue
<!-- components/ErrorBoundary.vue -->
<script setup>
import { useRouter } from '@ldesign/router'
import { onErrorCaptured, ref } from 'vue'

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')

// 捕获错误
onErrorCaptured((error, instance, info) => {
  hasError.value = true
  errorMessage.value = getErrorMessage(error)
  errorDetails.value = `${error.stack}\n\nComponent: ${info}`

  // 发送错误报告
  reportError(error, info)

  return false // 阻止错误继续传播
})

// 获取用户友好的错误信息
function getErrorMessage(error) {
  if (error.message.includes('Loading chunk')) {
    return '网络连接不稳定，请检查网络后重试'
  }
  if (error.message.includes('Failed to fetch')) {
    return '无法连接到服务器，请稍后重试'
  }
  return '页面加载时发生了未知错误'
}

// 重试加载
function retry() {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''

  // 刷新当前页面
  router.go(0)
}

// 错误报告
function reportError(error, info) {
  // 发送到错误监控服务
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, {
      tags: { section: 'router-lazy-loading' },
      extra: { componentInfo: info },
    })
  }

  // 本地日志
  console.error('组件加载错误:', error, info)
}
</script>

<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-container">
      <div class="error-content">
        <div class="error-icon">
          <Icon name="alert-circle" size="48" />
        </div>
        <h2 class="error-title">页面加载失败</h2>
        <p class="error-message">
          {{ errorMessage }}
        </p>
        <div class="error-actions">
          <button class="retry-btn" @click="retry">重新加载</button>
          <RouterLink to="/" class="home-btn"> 返回首页 </RouterLink>
        </div>
        <details class="error-details">
          <summary>错误详情</summary>
          <pre>{{ errorDetails }}</pre>
        </details>
      </div>
    </div>
    <slot v-else />
  </div>
</template>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  color: #f5222d;
  margin-bottom: 1rem;
}

.error-title {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.error-message {
  margin: 0 0 2rem 0;
  color: #666;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.retry-btn,
.home-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn {
  background: #1890ff;
  color: white;
}

.retry-btn:hover {
  background: #40a9ff;
}

.home-btn {
  background: #f5f5f5;
  color: #333;
}

.home-btn:hover {
  background: #e6e6e6;
}

.error-details {
  text-align: left;
  margin-top: 2rem;
}

.error-details summary {
  cursor: pointer;
  color: #666;
  margin-bottom: 1rem;
}

.error-details pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
  color: #333;
}
</style>
```

## 🎯 性能优化技巧

### 1. 条件懒加载

```typescript
// 根据设备性能决定加载策略
function getLoadingStrategy() {
  const connection = navigator.connection
  const isSlowNetwork = connection && connection.effectiveType.includes('2g')
  const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4

  if (isSlowNetwork || isLowMemory) {
    return 'conservative' // 保守加载策略
  }

  return 'aggressive' // 积极加载策略
}

// 动态调整预加载策略
function adjustPreloadStrategy() {
  const strategy = getLoadingStrategy()

  if (strategy === 'conservative') {
    // 只预加载关键页面
    router.preloadRoute('/cart')
  } else {
    // 预加载更多页面
    router.preloadRoute('/cart')
    router.preloadRoute('/account')
    router.preloadRoute('/products')
  }
}
```

### 2. 智能缓存

```typescript
// 根据用户行为调整缓存策略
function optimizeCacheStrategy() {
  const userBehavior = analyzeUserBehavior()

  if (userBehavior.isFrequentShopper) {
    // 增加购物相关页面的缓存
    router.updateCacheConfig({
      include: [/^Product/, /^Cart/, /^Checkout/],
      max: 30,
    })
  } else if (userBehavior.isBrowser) {
    // 增加浏览相关页面的缓存
    router.updateCacheConfig({
      include: [/^Product/, /^Category/],
      max: 20,
    })
  }
}
```

## 🎯 关键特性

### 1. 智能分组

- 按功能模块分组代码
- 根据使用频率调整加载优先级
- 支持预加载和延迟加载

### 2. 加载状态管理

- 全局加载组件
- 进度指示器
- 用户友好的加载信息

### 3. 错误处理

- 组件级错误边界
- 网络错误重试机制
- 详细的错误报告

### 4. 性能监控

- 加载时间统计
- 网络状况检测
- 自适应加载策略

这个示例展示了如何构建一个高性能的懒加载系统，充分利用 LDesign Router 的智能预加载和缓存功能。
