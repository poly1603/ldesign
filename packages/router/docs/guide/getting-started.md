# 快速开始

5 分钟快速上手 LDesign Router，体验下一代路由的强大功能！

## 🚀 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/router

# 使用 npm
npm install @ldesign/router

# 使用 yarn
yarn add @ldesign/router
```

## 🎯 基础配置

### 1. 创建路由器

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router'
import About from '../views/About.vue'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('../views/User.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

### 2. 安装路由器

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.mount('#app')
```

### 3. 添加路由视图

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <nav>
      <RouterLink to="/"> 首页 </RouterLink>
      <RouterLink to="/about"> 关于 </RouterLink>
      <RouterLink to="/user/123"> 用户 </RouterLink>
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
nav {
  padding: 1rem;
  background: #f5f5f5;
}

nav a {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 4px;
}

nav a.router-link-active {
  background: #1890ff;
  color: white;
}

main {
  padding: 2rem;
}
</style>
```

## 🌟 启用超能力

LDesign Router 的独特功能让你的应用性能飞跃：

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,

  // 🚀 启用智能预加载
  preloadStrategy: 'hover', // 悬停时预加载

  // 💾 启用智能缓存
  cache: {
    max: 20, // 最大缓存20个页面
    ttl: 5 * 60 * 1000, // 5分钟过期
  },

  // 📊 启用性能监控
  performance: true,
})
```

## 🎨 创建页面组件

### 首页组件

```vue
<!-- src/views/Home.vue -->
<template>
  <div class="home">
    <h1>🏠 欢迎来到首页</h1>
    <p>这是使用 LDesign Router 构建的应用</p>

    <div class="features">
      <div class="feature">
        <h3>⚡ 极速导航</h3>
        <p>比传统路由快50%</p>
      </div>
      <div class="feature">
        <h3>🎯 智能预加载</h3>
        <p>悬停即预加载，体验如丝般顺滑</p>
      </div>
      <div class="feature">
        <h3>💾 智能缓存</h3>
        <p>85%缓存命中率，减少重复加载</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature {
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
}

.feature h3 {
  margin: 0 0 1rem 0;
  color: #1890ff;
}
</style>
```

### 用户页面组件

```vue
<!-- src/views/User.vue -->
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, ref, watch } from 'vue'

const route = useRoute()
const loading = ref(false)
const user = ref(null)

// 获取用户ID
const userId = computed(() => route.params.id)

// 模拟加载用户数据
async function loadUser(id) {
  loading.value = true

  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 500))

  user.value = {
    id,
    name: `用户${id}`,
    email: `user${id}@example.com`,
  }

  loading.value = false
}

// 监听用户ID变化
watch(userId, loadUser, { immediate: true })
</script>

<template>
  <div class="user">
    <h1>👤 用户资料</h1>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="user" class="user-info">
      <h2>用户 {{ userId }}</h2>
      <p>这是用户 {{ userId }} 的资料页面</p>
      <p>当前路径：{{ route.path }}</p>
      <p>查询参数：{{ JSON.stringify(route.query) }}</p>
    </div>
  </div>
</template>

<style scoped>
.user {
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.user-info {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>
```

## 🎯 智能预加载体验

在导航链接上添加预加载功能：

```vue
<template>
  <nav>
    <!-- 悬停时预加载 -->
    <RouterLink to="/products" preload="hover"> 产品列表 </RouterLink>

    <!-- 可见时预加载 -->
    <RouterLink to="/heavy-page" preload="visible"> 重型页面 </RouterLink>

    <!-- 立即预加载重要页面 -->
    <RouterLink to="/dashboard" preload="immediate"> 仪表板 </RouterLink>
  </nav>
</template>
```

## 🔧 编程式导航

在组件中使用编程式导航：

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 导航到用户页面
function goToUser(userId) {
  router.push({ name: 'User', params: { id: userId } })
}

// 带查询参数的导航
function searchProducts(keyword) {
  router.push({
    path: '/products',
    query: { search: keyword, page: 1 },
  })
}

// 替换当前路由
function replaceWithLogin() {
  router.replace('/login')
}
</script>

<template>
  <div>
    <button @click="goToUser('456')">查看用户456</button>

    <button @click="searchProducts('vue')">搜索Vue产品</button>

    <button @click="replaceWithLogin">去登录</button>
  </div>
</template>
```

## 📊 性能监控

查看应用的路由性能：

```vue
<script setup>
import { useRouter } from '@ldesign/router'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  // 获取性能统计
  const stats = router.getPerformanceStats()
  console.log('路由性能统计:', {
    totalNavigations: stats.totalNavigations,
    averageDuration: stats.averageDuration,
    successRate: stats.successRate,
  })

  // 获取缓存统计
  const cacheStats = router.getCacheStats()
  console.log('缓存统计:', {
    hitRate: cacheStats.hitRate,
    size: cacheStats.size,
  })
})
</script>
```

## 🎉 完整示例

这是一个完整的工作示例：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('./views/About.vue'),
      meta: { title: '关于我们' },
    },
    {
      path: '/user/:id',
      name: 'User',
      component: () => import('./views/User.vue'),
      meta: { title: '用户资料' },
    },
  ],

  // 启用所有超能力
  preloadStrategy: 'hover',
  cache: { max: 20, ttl: 5 * 60 * 1000 },
  performance: true,
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

const app = createApp(App)
app.use(router)
app.mount('#app')
```

## 🎯 下一步

恭喜！你已经成功创建了第一个 LDesign Router 应用。接下来可以：

1. **[学习核心概念](/guide/concepts)** - 深入理解路由系统
2. **[探索高级功能](/guide/preloading)** - 智能预加载和缓存
3. **[查看完整示例](/examples/)** - 更多实际应用场景
4. **[阅读 API 文档](/api/)** - 详细的 API 参考

---

<div style="text-align: center; margin: 2rem 0;">
  <a href="/guide/concepts" style="display: inline-block; padding: 12px 24px; background: #1890ff; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
    📚 学习概念
  </a>
  <a href="/examples/" style="display: inline-block; padding: 12px 24px; border: 1px solid #1890ff; color: #1890ff; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
    🎨 查看示例
  </a>
</div>

<div style="text-align: center; color: #666; font-size: 14px; margin-top: 2rem;">
  <p>💡 <strong>提示</strong>：LDesign Router 完全兼容 Vue Router 4 的 API，迁移非常简单！</p>
</div>
