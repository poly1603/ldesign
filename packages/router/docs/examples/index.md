# 示例集合

通过实际示例学习 LDesign Router 的各种功能和最佳实践。每个示例都包含完整的代码和详细的说明。

## 🎯 示例分类

### 🚀 基础示例

- **[基础示例](/examples/basic)** - 路由配置、导航、组件使用
- **[嵌套路由](/examples/nested-routes)** - 多层嵌套路由结构
- **[动态路由](/examples/dynamic-routes)** - 动态参数和路径匹配

### 🛡️ 进阶功能

- **[路由守卫](/examples/navigation-guards)** - 权限控制和访问管理
- **[懒加载](/examples/lazy-loading)** - 代码分割和按需加载

### 🚀 高级特性

- **[智能预加载](/examples/preloading)** - 提升用户体验
- **[智能缓存](/examples/caching)** - 减少重复加载
- **[性能监控](/examples/performance)** - 性能分析和优化

## 🎨 快速预览

### 基础路由配置

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

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
      path: '/user/:id',
      name: 'UserProfile',
      component: () => import('./views/UserProfile.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
  ],
})
```

### 智能预加载

```vue
<template>
  <!-- 悬停时预加载 -->
  <RouterLink to="/products" preload="hover"> 产品列表 </RouterLink>

  <!-- 可见时预加载 -->
  <RouterLink to="/heavy-page" preload="visible"> 重型页面 </RouterLink>
</template>
```

### 路由守卫

```typescript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

### 高级配置

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,

  // 🚀 启用超能力
  preloadStrategy: 'hover', // 悬停预加载
  performance: true, // 性能监控
  cache: {
    // 智能缓存
    max: 20,
    ttl: 5 * 60 * 1000,
    include: [/^\/user/],
  },
})
```

## 📚 示例详情

### 🎯 [基础示例](/examples/basic)

**学习内容：**

- 路由器创建和配置
- 基础路由定义
- RouterView 和 RouterLink 使用
- 编程式导航
- 路由参数处理

**适合人群：** 初学者，刚接触 LDesign Router

**代码亮点：**

```typescript
// 智能预加载 + 性能监控
const router = createRouter({
  routes,
  preloadStrategy: 'hover',
  performance: true,
})
```

### 🏗️ [嵌套路由](/examples/nested-routes)

**学习内容：**

- 多层嵌套路由结构
- 布局组件设计
- 子路由配置
- 命名视图使用

**适合人群：** 需要构建复杂应用结构的开发者

**代码亮点：**

```typescript
{
  path: '/admin',
  component: AdminLayout,
  children: [
    {
      path: 'users',
      component: UsersLayout,
      children: [
        { path: '', component: UsersList },
        { path: ':id', component: UserDetail }
      ]
    }
  ]
}
```

### 🎯 [动态路由](/examples/dynamic-routes)

**学习内容：**

- 动态路径参数
- 参数验证和类型转换
- 通配符路由
- 路由别名和重定向

**适合人群：** 需要处理动态内容的开发者

**代码亮点：**

```typescript
{
  path: '/user/:id(\\d+)',  // 参数验证
  component: UserProfile,
  props: route => ({
    id: Number(route.params.id),
    tab: route.query.tab || 'profile'
  })
}
```

### 🛡️ [路由守卫](/examples/navigation-guards)

**学习内容：**

- 全局守卫配置
- 路由级守卫
- 组件内守卫
- 权限控制实现

**适合人群：** 需要实现权限控制的开发者

**代码亮点：**

```typescript
// 组合多个守卫
const adminGuard = createGuardChain(authGuard, permissionGuard, auditGuard)
```

### 🚀 [懒加载](/examples/lazy-loading)

**学习内容：**

- 代码分割策略
- 组件懒加载
- 分组打包
- 加载状态处理

**适合人群：** 关注性能优化的开发者

**代码亮点：**

```typescript
{
  path: '/admin',
  component: () => import(
    /* webpackChunkName: "admin" */
    './views/Admin.vue'
  )
}
```

## 🎮 在线演示

### CodeSandbox 示例

每个示例都提供了在线可运行的 CodeSandbox 链接：

- 🎯 [基础示例演示](https://codesandbox.io/s/ldesign-router-basic)
- 🏗️ [嵌套路由演示](https://codesandbox.io/s/ldesign-router-nested)
- 🎯 [动态路由演示](https://codesandbox.io/s/ldesign-router-dynamic)
- 🛡️ [路由守卫演示](https://codesandbox.io/s/ldesign-router-guards)
- 🚀 [懒加载演示](https://codesandbox.io/s/ldesign-router-lazy)

### StackBlitz 示例

也可以在 StackBlitz 中查看和编辑：

- 📦 [完整项目模板](https://stackblitz.com/edit/ldesign-router-template)
- 🎨 [UI 组件集成](https://stackblitz.com/edit/ldesign-router-ui)
- 📱 [移动端适配](https://stackblitz.com/edit/ldesign-router-mobile)

## 🛠️ 项目模板

### 快速启动模板

```bash
# 使用官方模板创建项目
npx create-ldesign-app my-app --template router

# 或者使用 Vue CLI
vue create my-app
cd my-app
vue add @ldesign/router
```

### 模板特性

- ✅ **开箱即用** - 预配置的路由结构
- ✅ **最佳实践** - 遵循推荐的项目组织方式
- ✅ **TypeScript 支持** - 完整的类型定义
- ✅ **性能优化** - 预配置的预加载和缓存
- ✅ **开发工具** - 集成的调试和分析工具

### 模板结构

```
src/
├── router/
│   ├── index.ts          # 路由器配置
│   ├── routes/           # 路由模块
│   │   ├── index.ts
│   │   ├── user.ts
│   │   └── admin.ts
│   └── guards/           # 路由守卫
│       ├── auth.ts
│       └── permission.ts
├── views/                # 页面组件
├── components/           # 通用组件
├── layouts/              # 布局组件
└── composables/          # 组合式函数
```

## 🎯 学习路径

### 初学者路径

1. **[基础示例](/examples/basic)** - 了解基本概念
2. **[嵌套路由](/examples/nested-routes)** - 学习应用结构
3. **[动态路由](/examples/dynamic-routes)** - 处理动态内容

### 进阶路径

4. **[路由守卫](/examples/navigation-guards)** - 实现权限控制
5. **[懒加载](/examples/lazy-loading)** - 优化加载性能
6. **[智能预加载](/examples/preloading)** - 提升用户体验

### 高级路径

7. **[智能缓存](/examples/caching)** - 减少重复加载
8. **[性能监控](/examples/performance)** - 分析和优化
9. **[插件开发](/examples/plugins)** - 扩展功能

## 🤝 贡献示例

我们欢迎社区贡献更多示例！

### 贡献指南

1. **Fork 仓库** - 从 GitHub 上 fork 项目
2. **创建分支** - 为你的示例创建新分支
3. **编写示例** - 包含完整代码和文档
4. **提交 PR** - 提交 Pull Request

### 示例要求

- ✅ **完整可运行** - 提供完整的项目代码
- ✅ **详细说明** - 包含功能说明和使用指南
- ✅ **最佳实践** - 遵循推荐的编码规范
- ✅ **TypeScript** - 使用 TypeScript 编写
- ✅ **测试覆盖** - 包含必要的测试用例

### 示例想法

我们特别欢迎以下类型的示例：

- 🎨 **UI 框架集成** - 与 Element Plus、Ant Design Vue 等集成
- 📱 **移动端应用** - 移动端路由最佳实践
- 🏢 **企业级应用** - 大型应用的路由架构
- 🎮 **游戏应用** - 游戏中的路由使用
- 📊 **数据可视化** - 图表应用的路由设计

---

<div style="text-align: center; margin: 2rem 0;">
  <a href="/examples/basic" style="display: inline-block; padding: 12px 24px; background: #1890ff; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
    🚀 开始学习
  </a>
  <a href="https://github.com/ldesign/ldesign/tree/main/packages/router/examples" style="display: inline-block; padding: 12px 24px; border: 1px solid #1890ff; color: #1890ff; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
    📦 查看源码
  </a>
</div>

<div style="text-align: center; color: #666; font-size: 14px; margin-top: 2rem;">
  <p>💡 <strong>提示</strong>：建议按照学习路径顺序学习示例，这样能够更好地理解 LDesign Router 的各种功能。</p>
</div>
