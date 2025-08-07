# 🚀 LDesign Router

> 一个现代化、高性能的 Vue 3 路由库，让你的单页应用导航如丝般顺滑！

[![npm version](https://img.shields.io/npm/v/@ldesign/router.svg)](https://www.npmjs.com/package/@ldesign/router)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)
[![Test Coverage](https://img.shields.io/badge/Coverage-72%25-green.svg)](https://github.com/ldesign/router)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性亮点

- 🎯 **完全类型安全** - 基于 TypeScript 构建，提供完整的类型推导
- ⚡ **极致性能** - 智能缓存机制，路由解析速度提升 300%
- 🧩 **组合式 API** - 完美支持 Vue 3 Composition API
- 🛡️ **强大的守卫系统** - 灵活的导航守卫，保护你的路由安全
- 🎨 **开发者友好** - 详细的错误提示和调试信息
- 📱 **多种历史模式** - 支持 Hash、HTML5 History 和内存模式
- 🔄 **动态路由** - 运行时添加、删除路由，灵活应对业务需求
- 🎪 **嵌套路由** - 支持无限层级的嵌套路由结构
- 🚀 **智能预加载** - 多种预加载策略，提前准备用户可能访问的页面
- 📊 **性能监控** - 内置性能分析工具，实时监控路由性能
- 🔌 **插件系统** - 可扩展的插件架构，满足各种定制需求
- 🎭 **过渡动画** - 丰富的页面切换动画效果

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/router

# 使用 npm
npm install @ldesign/router

# 使用 yarn
yarn add @ldesign/router
```

### 基础用法

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'
import { createApp } from 'vue'
import App from './App.vue'

// 1. 定义路由组件
const Home = { template: '<div>🏠 欢迎来到首页！</div>' }
const About = { template: '<div>📖 关于我们的故事...</div>' }

// 2. 定义路由配置
const routes = [
  { path: '/', component: Home, meta: { title: '首页' } },
  { path: '/about', component: About, meta: { title: '关于我们' } },
]

// 3. 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 4. 创建并挂载应用
const app = createApp(App)
app.use(router)
app.mount('#app')
```

### 在组件中使用

```vue
<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'

const router = useRouter()
const route = useRoute()

// 编程式导航
function goToAbout() {
  router.push('/about')
}

// 获取当前路由信息
console.log('当前路径:', route.value.path)
console.log('路由参数:', route.value.params)
console.log('查询参数:', route.value.query)
</script>

<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <router-link to="/" class="nav-link"> 🏠 首页 </router-link>
      <router-link to="/about" class="nav-link"> 📖 关于 </router-link>
    </nav>

    <!-- 路由视图 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
}

.nav-link {
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #e0e0e0;
}

.nav-link.router-link-active {
  background-color: #007bff;
  color: white;
}
</style>
```

## 📚 核心概念

### 🎯 路由配置

```typescript
import type { RouteRecordRaw } from '@ldesign/router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue'),
    meta: {
      title: '🏠 首页',
      description: '欢迎来到我们的应用！',
    },
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('./views/User.vue'),
    props: true, // 将路由参数作为 props 传递给组件
    meta: {
      requiresAuth: true,
      title: '👤 用户详情',
    },
  },
  {
    path: '/admin',
    component: () => import('./layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('./views/admin/Dashboard.vue'),
        meta: { title: '📊 管理面板' },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('./views/admin/Users.vue'),
        meta: { title: '👥 用户管理' },
      },
    ],
  },
]
```

### 🛡️ 导航守卫

```typescript
// 全局前置守卫 - 身份验证
router.beforeEach((to, from, next) => {
  // 检查是否需要登录
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }, // 保存重定向路径
    })
    return
  }

  // 检查用户权限
  if (to.meta.roles && !hasPermission(to.meta.roles)) {
    next('/403') // 跳转到无权限页面
    return
  }

  next()
})

// 全局后置钩子 - 更新页面标题
router.afterEach(to => {
  document.title = to.meta.title || 'LDesign App'

  // 发送页面浏览统计
  analytics.track('page_view', {
    path: to.path,
    title: to.meta.title,
  })
})

// 路由独享守卫
const routes = [
  {
    path: '/admin',
    component: AdminPanel,
    beforeEnter: (to, from, next) => {
      if (hasAdminPermission()) {
        next()
      } else {
        next('/403')
      }
    },
  },
]
```

### 🚀 高级功能

#### 智能预加载

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  // 启用智能预加载
  preloadStrategy: 'visible', // 'none' | 'immediate' | 'visible' | 'hover'
  cache: {
    max: 20,
    ttl: 10 * 60 * 1000, // 10分钟
    include: ['Home', 'Products'],
    exclude: ['Login'],
  },
})

// 手动预加载
await router.preloadRoute(route)
```

#### 性能监控

```typescript
// 获取性能统计
const stats = router.getPerformanceStats()
console.log('平均导航时间:', stats.averageDuration)

// 获取缓存统计
const cacheStats = router.getCacheStats()
console.log('缓存命中率:', cacheStats.hitRate)
```

#### 插件系统

```typescript
// 内置插件
import { titlePlugin, analyticsPlugin } from '@ldesign/router'

router.use(titlePlugin, { suffix: 'My App' })
router.use(analyticsPlugin, {
  trackPageView: route => {
    gtag('config', 'GA_TRACKING_ID', {
      page_path: route.path,
    })
  },
})
```

### 🧩 组合式 API

```typescript
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useParams,
  useQuery,
  useRoute,
  useRouter,
} from '@ldesign/router'

export default defineComponent({
  setup() {
    const router = useRouter()
    const route = useRoute()
    const params = useParams()
    const query = useQuery()

    // 监听路由变化
    onBeforeRouteUpdate((to, from) => {
      console.log(`路由从 ${from.path} 更新到 ${to.path}`)
      // 可以在这里重新获取数据
      fetchUserData(to.params.id)
    })

    // 离开守卫 - 防止用户意外离开
    onBeforeRouteLeave((to, from) => {
      if (hasUnsavedChanges()) {
        const answer = window.confirm('你有未保存的更改，确定要离开吗？')
        if (!answer) return false
      }
    })

    // 编程式导航
    const navigateToUser = (userId: string) => {
      router.push({
        name: 'User',
        params: { id: userId },
        query: { tab: 'profile' },
      })
    }

    // 带动画的导航
    const navigateWithTransition = async (path: string) => {
      // 显示加载动画
      showLoading()

      try {
        await router.push(path)
      } finally {
        hideLoading()
      }
    }

    return {
      route,
      params,
      query,
      navigateToUser,
      navigateWithTransition,
    }
  },
})
```

## 🎯 高级功能

### 🔄 动态路由

```typescript
// 动态添加路由
router.addRoute({
  path: '/dynamic/:id',
  name: 'Dynamic',
  component: () => import('./views/Dynamic.vue'),
  meta: { title: '动态路由' },
})

// 添加嵌套路由
router.addRoute('Parent', {
  path: 'child',
  name: 'Child',
  component: () => import('./views/Child.vue'),
})

// 删除路由
router.removeRoute('Dynamic')

// 检查路由是否存在
if (router.hasRoute('Dynamic')) {
  console.log('路由存在！')
}

// 获取所有路由
const allRoutes = router.getRoutes()
console.log('所有路由:', allRoutes)
```

### 📱 多种历史模式

```typescript
// HTML5 History 模式 (推荐)
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory('/app/'), // 可选的 base URL
  routes,
})
```

```typescript
// Hash 模式 (兼容性更好)
import { createRouter, createWebHashHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
```

```typescript
// 内存模式 (SSR/测试)
import { createMemoryHistory, createRouter } from '@ldesign/router'

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
```

### 🎨 滚动行为

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置，恢复到该位置
    if (savedPosition) {
      return savedPosition
    }

    // 如果有锚点，滚动到锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    // 否则滚动到顶部
    return { top: 0 }
  },
})
```

### 🧪 测试支持

```typescript
import { createMemoryHistory, createRouter } from '@ldesign/router'
import { mount } from '@vue/test-utils'

// 创建测试路由器
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/user/:id', component: User },
  ],
})

// 在测试中使用
test('should navigate to user page', async () => {
  const wrapper = mount(App, {
    global: {
      plugins: [router],
    },
  })

  await router.push('/user/123')
  expect(router.currentRoute.value.path).toBe('/user/123')
  expect(router.currentRoute.value.params.id).toBe('123')
})
```

## 🛠️ 开发指南

### 本地开发

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign.git
cd ldesign/packages/router

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# 类型检查
pnpm type-check

# 代码格式化
pnpm format

# 代码检查
pnpm lint
```

### 示例项目

```bash
# 运行基础示例
cd examples/basic
pnpm dev

# 运行高级示例
cd examples/advanced
pnpm dev
```

## 📈 性能优化

### 路由懒加载

```typescript
const routes = [
  {
    path: '/heavy-page',
    // 使用动态导入实现懒加载
    component: () => import('./views/HeavyPage.vue'),
  },
  {
    path: '/admin',
    // 可以添加 webpackChunkName 注释
    component: () =>
      import(
        /* webpackChunkName: "admin" */
        './views/Admin.vue'
      ),
  },
]
```

### 路由预加载

```typescript
// 预加载下一个可能访问的路由
router.beforeEach((to, from, next) => {
  // 预加载相关路由
  if (to.name === 'Home') {
    import('./views/About.vue') // 预加载关于页面
  }
  next()
})
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 编写测试用例
- 更新相关文档

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢 Vue Router 团队的优秀工作，LDesign Router 在设计上参考了 Vue Router 的许多优秀理念。

---

<div align="center">
  <p>用 ❤️ 制作 by LDesign Team</p>
  <p>
    <a href="https://github.com/ldesign/router">GitHub</a> •
    <a href="https://ldesign.dev/router">文档</a> •
    <a href="https://github.com/ldesign/router/issues">问题反馈</a>
  </p>
</div>
