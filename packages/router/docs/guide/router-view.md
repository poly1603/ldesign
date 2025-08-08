# RouterView 组件

RouterView 是路由系统的核心组件，负责渲染匹配的路由组件。它提供了强大的自定义能力和丰富的功能特性。

## 🎯 基础用法

### 简单使用

```vue
<template>
  <div id="app">
    <!-- 渲染匹配的路由组件 -->
    <RouterView />
  </div>
</template>
```

### 命名视图

当你需要在同一个路由中渲染多个组件时：

```vue
<template>
  <div class="layout">
    <!-- 主要内容区域 -->
    <main class="main">
      <RouterView />
    </main>

    <!-- 侧边栏 -->
    <aside class="sidebar">
      <RouterView name="sidebar" />
    </aside>

    <!-- 头部 -->
    <header class="header">
      <RouterView name="header" />
    </header>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-areas:
    'header header'
    'sidebar main';
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
}

.header {
  grid-area: header;
}
.sidebar {
  grid-area: sidebar;
}
.main {
  grid-area: main;
}
</style>
```

对应的路由配置：

```typescript
const routes = [
  {
    path: '/dashboard',
    components: {
      default: Dashboard,
      sidebar: DashboardSidebar,
      header: DashboardHeader,
    },
  },
]
```

## 🎨 自定义渲染

### 使用插槽

RouterView 提供了强大的插槽功能，让你完全控制组件的渲染：

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <div class="page-wrapper">
      <!-- 页面标题 -->
      <h1 class="page-title">
        {{ route.meta.title || '页面' }}
      </h1>

      <!-- 面包屑导航 -->
      <nav v-if="route.matched.length > 1" class="breadcrumb">
        <span v-for="(match, index) in route.matched" :key="index">
          {{ match.meta.title }}
          <span v-if="index < route.matched.length - 1"> / </span>
        </span>
      </nav>

      <!-- 渲染组件 -->
      <component :is="Component" v-if="Component" :key="route.path" class="page-component" />

      <!-- 404 提示 -->
      <div v-else class="not-found">
        <h2>页面不存在</h2>
        <p>请检查URL是否正确</p>
      </div>
    </div>
  </RouterView>
</template>

<style scoped>
.page-wrapper {
  padding: 2rem;
}

.page-title {
  margin: 0 0 1rem 0;
  color: #333;
}

.breadcrumb {
  margin-bottom: 2rem;
  color: #666;
  font-size: 0.9rem;
}

.page-component {
  animation: fadeIn 0.3s ease-in;
}

.not-found {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
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
</style>
```

### 条件渲染

根据路由信息进行条件渲染：

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 检查认证状态
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

// 检查权限
function hasPermission(requiredRoles) {
  const userRoles = getUserRoles()
  return requiredRoles.some(role => userRoles.includes(role))
}

// 跳转到登录页
function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <!-- 需要认证的页面 -->
    <div v-if="route.meta.requiresAuth && !isAuthenticated" class="auth-required">
      <h2>需要登录</h2>
      <p>请先登录后访问此页面</p>
      <button @click="goToLogin">去登录</button>
    </div>

    <!-- 权限不足 -->
    <div v-else-if="route.meta.roles && !hasPermission(route.meta.roles)" class="permission-denied">
      <h2>权限不足</h2>
      <p>您没有权限访问此页面</p>
    </div>

    <!-- 正常渲染 -->
    <component :is="Component" v-else :key="route.path" />
  </RouterView>
</template>
```

## 🎬 过渡动画

### 基础过渡

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </RouterView>
</template>

<style>
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

### 动态过渡

根据路由元信息选择不同的过渡效果：

```vue
<script setup>
// 根据路由选择过渡动画
function getTransitionName(route) {
  // 优先使用路由元信息中的过渡
  if (route.meta.transition) {
    return route.meta.transition
  }

  // 根据路由深度选择过渡
  const depth = route.matched.length
  if (depth > 2) return 'slide-up'
  if (depth > 1) return 'slide-right'
  return 'fade'
}
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <transition :name="getTransitionName(route)" mode="out-in" appear>
      <component :is="Component" :key="route.path" />
    </transition>
  </RouterView>
</template>

<style>
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 右滑 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from {
  transform: translateX(100%);
}
.slide-right-leave-to {
  transform: translateX(-100%);
}

/* 上滑 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from {
  transform: translateY(100%);
}
.slide-up-leave-to {
  transform: translateY(-100%);
}
</style>
```

### 复杂过渡控制

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, ref } from 'vue'

const route = useRoute()

// 过渡配置
const transitionName = computed(() => route.meta.transition || 'fade')
const transitionMode = computed(() => route.meta.transitionMode || 'out-in')
const shouldAppear = computed(() => route.meta.transitionAppear !== false)

// 组件key策略
function getComponentKey(route) {
  // 某些路由使用完整路径作为key
  if (route.meta.useFullPathAsKey) {
    return route.fullPath
  }
  return route.path
}

// 过渡钩子
function onBeforeEnter(el) {
  console.log('页面即将进入')
  // 可以在这里设置进入前的状态
}

function onEnter(el, done) {
  console.log('页面进入中')
  // 执行进入动画
  done()
}

function onLeave(el, done) {
  console.log('页面离开中')
  // 执行离开动画
  done()
}
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <transition
      :name="transitionName"
      :mode="transitionMode"
      :appear="shouldAppear"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
    >
      <component :is="Component" :key="getComponentKey(route)" />
    </transition>
  </RouterView>
</template>
```

## 🔄 KeepAlive 集成

### 基础缓存

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <KeepAlive>
      <component :is="Component" :key="route.path" />
    </KeepAlive>
  </RouterView>
</template>
```

### 条件缓存

根据路由元信息决定是否缓存：

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()

// 缓存配置
const maxCacheSize = 10
const cacheInclude = computed(() => route.meta.cacheInclude)
const cacheExclude = computed(() => route.meta.cacheExclude)

// 判断是否应该缓存
function shouldCache(route) {
  // 明确禁用缓存
  if (route.meta.cache === false) return false

  // 明确启用缓存
  if (route.meta.cache === true) return true

  // 默认缓存策略
  return route.name && !route.meta.noCache
}

// 获取缓存key
function getCacheKey(route) {
  return route.meta.cacheKey || route.name || route.path
}
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <!-- 需要缓存的组件 -->
    <KeepAlive
      v-if="shouldCache(route)"
      :include="cacheInclude"
      :exclude="cacheExclude"
      :max="maxCacheSize"
    >
      <component :is="Component" :key="getCacheKey(route)" />
    </KeepAlive>

    <!-- 不需要缓存的组件 -->
    <component :is="Component" v-else :key="route.path" />
  </RouterView>
</template>
```

## 🛡️ 错误处理

### 错误边界

```vue
<script setup>
import ErrorBoundary from '@/components/ErrorBoundary.vue'
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <ErrorBoundary>
      <Suspense>
        <template #default>
          <component :is="Component" :key="route.path" />
        </template>
        <template #fallback>
          <div class="loading">
            <div class="spinner" />
            <p>页面加载中...</p>
          </div>
        </template>
      </Suspense>
    </ErrorBoundary>
  </RouterView>
</template>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
```

### 加载状态

```vue
<script setup>
import { ref } from 'vue'

const isLoading = ref(false)
const loadingProgress = ref(0)

// 获取加载信息
function getLoadingMessage(route) {
  if (route.meta.loadingMessage) {
    return route.meta.loadingMessage
  }

  if (route.path.startsWith('/admin')) {
    return '管理页面加载中...'
  }

  return '页面加载中...'
}

// 加载状态处理
function onPending() {
  isLoading.value = true
  loadingProgress.value = 0

  // 模拟加载进度
  const interval = setInterval(() => {
    loadingProgress.value += 10
    if (loadingProgress.value >= 90) {
      clearInterval(interval)
    }
  }, 100)
}

function onResolve() {
  loadingProgress.value = 100
  setTimeout(() => {
    isLoading.value = false
    loadingProgress.value = 0
  }, 200)
}
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <div class="page-container">
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="loading-bar">
        <div class="progress" :style="{ width: `${loadingProgress}%` }" />
      </div>

      <!-- 页面内容 -->
      <Suspense @pending="onPending" @resolve="onResolve">
        <template #default>
          <component :is="Component" :key="route.path" />
        </template>
        <template #fallback>
          <div class="page-loading">
            <div class="loading-spinner" />
            <p>{{ getLoadingMessage(route) }}</p>
          </div>
        </template>
      </Suspense>
    </div>
  </RouterView>
</template>

<style scoped>
.page-container {
  position: relative;
}

.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f0f0f0;
  z-index: 9999;
}

.progress {
  height: 100%;
  background: #1890ff;
  transition: width 0.2s ease;
}

.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
</style>
```

## 🎯 最佳实践

### 1. 性能优化

```vue
<!-- ✅ 推荐：使用key确保组件正确更新 -->
<RouterView v-slot="{ Component, route }">
  <component
    :is="Component"
    :key="route.path"
  />
</RouterView>

<!-- ❌ 避免：不使用key可能导致组件复用问题 -->
<RouterView v-slot="{ Component }">
  <component :is="Component" />
</RouterView>
```

### 2. 错误处理

```vue
<!-- ✅ 推荐：添加错误边界和加载状态 -->
<RouterView v-slot="{ Component, route }">
  <ErrorBoundary>
    <Suspense>
      <component :is="Component" :key="route.path" />
      <template #fallback>
        <LoadingSpinner />
      </template>
    </Suspense>
  </ErrorBoundary>
</RouterView>
```

### 3. 可访问性

```vue
<!-- ✅ 推荐：添加适当的ARIA属性 -->
<RouterView v-slot="{ Component, route }">
  <main
    role="main"
    :aria-label="route.meta.title || '主要内容'"
  >
    <component :is="Component" :key="route.path" />
  </main>
</RouterView>
```

RouterView 是构建路由应用的核心，通过合理使用其各种功能，你可以创建出功能丰富、用户体验优秀的应用界
面。
