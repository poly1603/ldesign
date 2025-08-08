# 懒加载

懒加载是现代前端应用的重要优化技术，它可以将代码分割成多个块，按需加载，显著提升应用的初始加载速度。

## 🎯 什么是懒加载？

懒加载（Lazy Loading）是指在需要时才加载资源，而不是在应用启动时一次性加载所有资源。在路由中，这意味
着只有当用户访问某个页面时，才加载对应的组件代码。

### 传统加载 vs 懒加载

```typescript
import About from './views/About.vue'
import Contact from './views/Contact.vue'
// ❌ 传统加载：所有组件都会被打包到一个文件中
import Home from './views/Home.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: Contact },
]

// ✅ 懒加载：每个组件都是独立的代码块
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue'),
  },
  {
    path: '/about',
    component: () => import('./views/About.vue'),
  },
  {
    path: '/contact',
    component: () => import('./views/Contact.vue'),
  },
]
```

## 🚀 基础懒加载

### 动态导入语法

使用 ES2020 的动态导入语法实现懒加载：

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
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./views/Dashboard.vue'),
  },
]
```

### 错误处理

为懒加载添加错误处理：

```typescript
const routes = [
  {
    path: '/dashboard',
    component: () =>
      import('./views/Dashboard.vue').catch(error => {
        console.error('加载 Dashboard 组件失败:', error)
        // 返回错误组件
        return import('./views/ErrorPage.vue')
      }),
  },
]
```

## 📦 代码分组

### Webpack 魔法注释

使用 Webpack 的魔法注释对代码进行分组：

```typescript
const routes = [
  // 用户相关页面分组
  {
    path: '/user/profile',
    component: () =>
      import(
        /* webpackChunkName: "user" */
        './views/user/Profile.vue'
      ),
  },
  {
    path: '/user/settings',
    component: () =>
      import(
        /* webpackChunkName: "user" */
        './views/user/Settings.vue'
      ),
  },

  // 管理员页面分组
  {
    path: '/admin/dashboard',
    component: () =>
      import(
        /* webpackChunkName: "admin" */
        './views/admin/Dashboard.vue'
      ),
  },
  {
    path: '/admin/users',
    component: () =>
      import(
        /* webpackChunkName: "admin" */
        './views/admin/Users.vue'
      ),
  },

  // 预加载重要页面
  {
    path: '/important',
    component: () =>
      import(
        /* webpackChunkName: "important" */
        /* webpackPreload: true */
        './views/Important.vue'
      ),
  },
]
```

### 按功能模块分组

```typescript
// 电商应用的路由分组示例
const routes = [
  // 首页和基础页面
  {
    path: '/',
    component: () =>
      import(
        /* webpackChunkName: "home" */
        './views/Home.vue'
      ),
  },

  // 产品相关页面
  {
    path: '/products',
    component: () =>
      import(
        /* webpackChunkName: "products" */
        './views/ProductList.vue'
      ),
  },
  {
    path: '/product/:id',
    component: () =>
      import(
        /* webpackChunkName: "products" */
        './views/ProductDetail.vue'
      ),
  },

  // 购物车和结算
  {
    path: '/cart',
    component: () =>
      import(
        /* webpackChunkName: "checkout" */
        './views/Cart.vue'
      ),
  },
  {
    path: '/checkout',
    component: () =>
      import(
        /* webpackChunkName: "checkout" */
        './views/Checkout.vue'
      ),
  },

  // 用户中心
  {
    path: '/account',
    component: () =>
      import(
        /* webpackChunkName: "account" */
        './views/Account.vue'
      ),
  },
]
```

## 🎨 加载状态处理

### 全局加载组件

创建一个全局的加载组件：

```vue
<!-- LoadingComponent.vue -->
<template>
  <div class="loading-container">
    <div class="loading-spinner">
      <div class="spinner" />
      <p>页面加载中...</p>
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
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

### 使用 Suspense

Vue 3 的 Suspense 组件可以优雅地处理异步组件：

```vue
<!-- App.vue -->
<script setup>
import LoadingComponent from './components/LoadingComponent.vue'
</script>

<template>
  <div id="app">
    <Suspense>
      <template #default>
        <RouterView />
      </template>
      <template #fallback>
        <LoadingComponent />
      </template>
    </Suspense>
  </div>
</template>
```

### 自定义加载处理

```vue
<!-- 在布局组件中处理加载状态 -->
<script setup>
import { useRoute } from '@ldesign/router'
import { ref, watch } from 'vue'

const route = useRoute()
const loadingMessage = ref('页面加载中...')

// 根据路由显示不同的加载信息
watch(
  () => route.path,
  newPath => {
    if (newPath.startsWith('/admin')) {
      loadingMessage.value = '管理页面加载中...'
    } else if (newPath.startsWith('/user')) {
      loadingMessage.value = '用户页面加载中...'
    } else {
      loadingMessage.value = '页面加载中...'
    }
  }
)
</script>

<template>
  <div class="layout">
    <header class="header">
      <Navigation />
    </header>

    <main class="main">
      <Transition name="page" mode="out-in">
        <Suspense>
          <template #default>
            <RouterView />
          </template>
          <template #fallback>
            <div class="page-loading">
              <LoadingSpinner />
              <p>{{ loadingMessage }}</p>
            </div>
          </template>
        </Suspense>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
```

## 🔧 高级懒加载技巧

### 条件懒加载

根据条件决定是否懒加载：

```typescript
// 根据环境决定是否懒加载
const isDevelopment = process.env.NODE_ENV === 'development'

const routes = [
  {
    path: '/admin',
    component: isDevelopment
      ? () => import('./views/Admin.vue') // 开发环境懒加载
      : require('./views/Admin.vue').default, // 生产环境直接加载
  },
]

// 根据用户权限懒加载
function createAdminRoutes(userRole) {
  if (userRole !== 'admin') {
    return []
  }

  return [
    {
      path: '/admin/dashboard',
      component: () => import('./views/admin/Dashboard.vue'),
    },
    {
      path: '/admin/users',
      component: () => import('./views/admin/Users.vue'),
    },
  ]
}
```

### 预加载策略

结合 LDesign Router 的预加载功能：

```typescript
const routes = [
  {
    path: '/products',
    component: () => import('./views/ProductList.vue'),
    meta: {
      preload: 'hover', // 悬停时预加载
      cache: true, // 启用缓存
    },
  },
  {
    path: '/product/:id',
    component: () => import('./views/ProductDetail.vue'),
    meta: {
      preload: 'visible', // 可见时预加载
      cacheTTL: 10 * 60 * 1000, // 10分钟缓存
    },
  },
]
```

### 动态懒加载

运行时动态创建懒加载路由：

```typescript
// 动态创建懒加载路由
function createDynamicRoute(moduleName, componentPath) {
  return {
    path: `/${moduleName}`,
    component: () =>
      import(
        /* webpackChunkName: "[request]" */
        `./views/${componentPath}.vue`
      ),
  }
}

// 批量创建路由
const moduleRoutes = ['dashboard', 'analytics', 'reports', 'settings'].map(module =>
  createDynamicRoute(module, `admin/${module}`)
)

// 添加到路由器
moduleRoutes.forEach(route => {
  router.addRoute(route)
})
```

## 📊 性能优化

### 分析包大小

使用 webpack-bundle-analyzer 分析代码分割效果：

```bash
# 安装分析工具
npm install --save-dev webpack-bundle-analyzer

# 构建并分析
npm run build
npx webpack-bundle-analyzer dist/static/js/*.js
```

### 优化分割策略

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 相关库分离
          vue: ['vue', 'vue-router'],

          // 将 UI 库分离
          ui: ['element-plus', 'ant-design-vue'],

          // 将工具库分离
          utils: ['lodash', 'dayjs', 'axios'],

          // 将图表库分离
          charts: ['echarts', 'chart.js'],
        },
      },
    },
  },
}
```

### 预加载关键资源

```typescript
// 预加载关键页面
function preloadCriticalRoutes() {
  const criticalRoutes = ['/dashboard', '/profile', '/settings']

  criticalRoutes.forEach(path => {
    router.preloadRoute(path)
  })
}

// 在应用启动后预加载
onMounted(() => {
  // 延迟预加载，避免影响初始加载
  setTimeout(preloadCriticalRoutes, 2000)
})
```

## 🎯 懒加载最佳实践

### 1. 合理的分组策略

```typescript
// ✅ 推荐：按功能模块分组
const routes = [
  // 用户相关功能
  {
    path: '/user/profile',
    component: () =>
      import(
        /* webpackChunkName: "user" */
        './views/user/Profile.vue'
      ),
  },

  // 管理功能
  {
    path: '/admin/dashboard',
    component: () =>
      import(
        /* webpackChunkName: "admin" */
        './views/admin/Dashboard.vue'
      ),
  },
]

// ❌ 避免：过度分割
const routes = [
  {
    path: '/tiny-component',
    component: () => import('./TinyComponent.vue'), // 组件太小，不值得分割
  },
]
```

### 2. 错误边界

```vue
<script setup>
import { onErrorCaptured, ref } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured(error => {
  hasError.value = true
  errorMessage.value = error.message

  // 记录错误
  console.error('组件加载错误:', error)

  return false // 阻止错误继续传播
})
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <h2>页面加载失败</h2>
    <p>{{ errorMessage }}</p>
    <button @click="$router.go(0)">重新加载</button>
  </div>
  <RouterView v-else />
</template>
```

### 3. 加载性能监控

```typescript
// 监控懒加载性能
function monitorLazyLoading() {
  const observer = new PerformanceObserver(list => {
    list.getEntries().forEach(entry => {
      if (entry.name.includes('chunk')) {
        console.log(`代码块加载时间: ${entry.duration}ms`)

        // 发送性能数据
        analytics.track('chunk_load_time', {
          chunk: entry.name,
          duration: entry.duration,
        })
      }
    })
  })

  observer.observe({ entryTypes: ['resource'] })
}
```

### 4. 渐进式加载

```typescript
// 渐进式加载策略
function createProgressiveRoutes() {
  return [
    // 第一优先级：立即加载
    {
      path: '/',
      component: () => import('./views/Home.vue'),
    },

    // 第二优先级：预加载
    {
      path: '/dashboard',
      component: () =>
        import(
          /* webpackPreload: true */
          './views/Dashboard.vue'
        ),
    },

    // 第三优先级：懒加载
    {
      path: '/reports',
      component: () => import('./views/Reports.vue'),
    },
  ]
}
```

通过合理使用懒加载，你可以显著提升应用的加载性能和用户体验。接下来，让我们学习 LDesign Router
的[智能缓存](/guide/caching)功能。
