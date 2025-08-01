# @ldesign/router

[![npm version](https://badge.fury.io/js/%40ldesign%2Frouter.svg)](https://badge.fury.io/js/%40ldesign%2Frouter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

一个功能强大的 Vue 路由库，为 Vue 应用提供简单易用的路由管理功能。

## ✨ 特性

- 🚀 **简单易用** - 提供简洁的 API 和清晰的文档
- ⚡️ **高性能** - 优化的路由匹配算法
- 🛡️ **TypeScript 支持** - 完整的类型定义
- 🔧 **功能丰富** - 支持嵌套路由、动态路由、路由守卫等
- 📱 **现代化** - 基于 Vue 3 Composition API
- 🎨 **灵活配置** - 支持多种路由模式和自定义配置

## 📦 安装

```bash
# npm
npm install @ldesign/router

# yarn
yarn add @ldesign/router

# pnpm
pnpm add @ldesign/router
```

## 🚀 快速开始

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'
import { createApp } from 'vue'
import App from './App.vue'

// 定义路由
const routes = [
  { path: '/', component: () => import('./views/Home.vue') },
  { path: '/about', component: () => import('./views/About.vue') }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')
```

在模板中使用：

```vue
<template>
  <div id="app">
    <nav>
      <RouterLink to="/">
        首页
      </RouterLink>
      <RouterLink to="/about">
        关于
      </RouterLink>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>
```

## 📚 文档

- [完整文档](https://ldesign.github.io/router/)
- [API 参考](https://ldesign.github.io/router/api/)
- [示例代码](https://ldesign.github.io/router/examples/)

## 🎯 核心功能

### 路由配置

```typescript
const routes = [
  {
    path: '/user/:id',
    name: 'User',
    component: UserComponent,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'users', component: Users }
    ]
  }
]
```

### 编程式导航

```typescript
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 导航到不同页面
router.push('/user/123')
router.push({ name: 'User', params: { id: '123' } })
router.replace('/login')
router.go(-1) // 后退
```

### 路由守卫

```typescript
// 全局前置守卫
// 组件内守卫
import { onBeforeRouteEnter, onBeforeRouteUpdate } from '@ldesign/router'

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  }
  else {
    next()
  }
})

onBeforeRouteEnter((to, from, next) => {
  // 进入路由前
  next()
})

onBeforeRouteUpdate((to, from, next) => {
  // 路由更新时
  next()
})
```

### Composition API

```typescript
import { useRoute, useRouter } from '@ldesign/router'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()

    // 获取当前路由信息
    console.log(route.params.id)
    console.log(route.query.tab)

    // 编程式导航
    const goToUser = (id: string) => {
      router.push(`/user/${id}`)
    }

    return { goToUser }
  }
}
```

## 🔧 开发

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

# 测试
pnpm test

# 文档开发
pnpm docs:dev

# 示例开发
pnpm example:dev
```

## 🤝 贡献

我们欢迎所有形式的贡献！请查看 [贡献指南](../../CONTRIBUTING.md) 了解详情。

## 📄 许可证

[MIT](./LICENSE) © LDesign Team

## 🙏 致谢

感谢 Vue Router 团队的优秀工作，为我们提供了很多灵感和参考。
