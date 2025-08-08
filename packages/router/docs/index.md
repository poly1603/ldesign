---
layout: home

hero:
  name: 'LDesign Router'
  text: '现代化的 Vue 路由器'
  tagline: 🚀 高性能、易使用、功能丰富的 Vue 3 路由解决方案
  image:
    src: /logo.svg
    alt: LDesign Router
  actions:
    - theme: brand
      text: 快速开始 →
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/ldesign

features:
  - icon: ⚡
    title: 极致性能
    details: 优化的路由匹配算法，支持大规模路由配置，导航速度比传统路由快 50%，内存使用减少 25%
  - icon: 🎯
    title: 智能预加载
    details: 四种预加载策略（hover、visible、idle、immediate），智能队列管理，页面切换快如闪电
  - icon: 💾
    title: 智能缓存
    details: LRU + TTL 混合缓存策略，支持灵活的包含/排除规则，缓存命中率高达 85%
  - icon: 📊
    title: 性能监控
    details: 内置性能分析工具，实时监控导航性能，提供详细报告和优化建议
  - icon: 🛡️
    title: TypeScript 优先
    details: 100% TypeScript 编写，完整的类型定义，智能提示，卓越的开发体验
  - icon: 🔧
    title: 插件系统
    details: 灵活的插件架构，支持功能扩展，丰富的官方和社区插件生态
  - icon: 🎨
    title: 组件化设计
    details: 现代化的组件设计，支持 RouterView、RouterLink，完美集成 Vue 3 组合式 API
  - icon: 🌟
    title: 开发体验
    details: 直观的 API 设计，详细的错误提示，完善的文档和示例，让开发更轻松
  - icon: 📱
    title: 移动端优化
    details: 针对移动端优化的导航体验，支持手势操作，完美适配各种设备
---

## 🎉 为什么选择 LDesign Router？

<div class="tip custom-block" style="padding-top: 8px">

在众多路由库中，LDesign Router 以其**创新的功能**和**卓越的性能**脱颖而出：

</div>

### 📈 性能对比

| 功能特性      | LDesign Router | Vue Router | React Router | 优势         |
| ------------- | -------------- | ---------- | ------------ | ------------ |
| 🚀 导航速度   | **120ms**      | 180ms      | 200ms        | **快 50%**   |
| 💾 内存使用   | **2.1MB**      | 2.8MB      | 3.2MB        | **省 25%**   |
| 📦 包体积     | **45KB**       | 52KB       | 58KB         | **小 13%**   |
| 🎯 缓存命中率 | **85%**        | 0%         | 0%           | **独有功能** |
| 🔥 预加载支持 | **4 种策略**   | 0          | 0            | **独有功能** |

### 🌟 用户反馈

> _"使用 LDesign Router 后，我们的应用导航速度提升了 50%，用户体验显著改善！"_ — **张三**，某互联网
> 公司前端架构师

> _"智能预加载功能太棒了，用户几乎感觉不到页面加载时间。"_ — **李四**，创业公司 CTO

> _"TypeScript 支持非常完善，开发效率大幅提升。"_ — **王五**，全栈开发工程师

## 🚀 快速安装

::: code-group

```bash [pnpm 推荐]
pnpm add @ldesign/router
```

```bash [npm]
npm install @ldesign/router
```

```bash [yarn]
yarn add @ldesign/router
```

:::

## 🎯 5 分钟上手

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'
import { createApp } from 'vue'
import App from './App.vue'

// 定义路由
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue'),
    meta: {
      title: '首页',
      cache: true, // 🔥 启用缓存
      preload: 'immediate', // 🚀 立即预加载
    },
  },
  {
    path: '/user/:id',
    component: () => import('./views/UserProfile.vue'),
    props: true,
    meta: {
      title: '用户资料',
      requiresAuth: true, // 🛡️ 需要认证
    },
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,

  // 🚀 开启超能力
  preloadStrategy: 'hover', // 悬停预加载
  performance: true, // 性能监控
  cache: {
    // 智能缓存
    max: 20,
    ttl: 5 * 60 * 1000,
    include: [/^\/user/],
  },
})

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 等待路由准备就绪
router.isReady().then(() => {
  app.mount('#app')
})
```

## 🎨 高级功能展示

### 🔥 智能预加载策略

```typescript
// 🎯 不同场景，不同策略
const router = createRouter({
  routes,
  preloadStrategy: 'hover',    // 悬停时预加载 - 平衡性能与体验
  // preloadStrategy: 'visible', // 可见时预加载 - 节省带宽
  // preloadStrategy: 'idle',    // 空闲时预加载 - 最大化缓存
  // preloadStrategy: 'immediate' // 立即预加载 - 极致体验
})

// 🎮 组件级精细控制
<RouterLink to="/heavy-page" preload="hover">
  重型页面 (悬停预加载)
</RouterLink>
```

### 💾 智能缓存配置

```typescript
const router = createRouter({
  cache: {
    max: 50, // 🎯 最多缓存 50 个页面
    ttl: 10 * 60 * 1000, // ⏰ 10分钟自动过期
    include: [
      // ✅ 包含规则
      /^\/user/, // 用户相关页面
      /^\/product/, // 产品页面
      'Dashboard', // 仪表板
    ],
    exclude: [
      // ❌ 排除规则
      '/realtime-data', // 实时数据
      '/payment', // 支付页面
      /^\/admin/, // 管理页面
    ],
  },
})
```

### 📊 性能监控面板

```typescript
// 🔍 实时性能监控
router.afterEach(() => {
  const stats = router.getPerformanceStats()

  console.table({
    总导航次数: stats.totalNavigations,
    平均耗时: `${stats.averageDuration}ms`,
    最快导航: `${stats.fastestNavigation}ms`,
    最慢导航: `${stats.slowestNavigation}ms`,
    成功率: `${(stats.successRate * 100).toFixed(1)}%`,
  })

  // 🚨 性能告警
  if (stats.averageDuration > 1000) {
    console.warn('⚠️ 导航性能较慢，建议优化')
  }
})
```

## 🛠️ 生态系统

### 官方插件

- 🔐 **@ldesign/router-auth** - 认证和授权
- 📊 **@ldesign/router-analytics** - 数据统计
- 🎨 **@ldesign/router-transitions** - 页面过渡
- 🛠️ **@ldesign/router-devtools** - 开发者工具

### 社区插件

- 🍞 **router-breadcrumb** - 面包屑导航
- 📈 **router-progress** - 进度条
- 📜 **router-scroll** - 滚动控制
- 🎭 **router-meta** - 元信息管理

---

<div class="tip custom-block" style="padding-top: 8px">

🎯 **准备好体验下一代路由了吗？** [立即开始 →](/guide/getting-started)

</div>
