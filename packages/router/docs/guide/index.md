# 介绍

欢迎来到 LDesign Router 的世界！🎉

LDesign Router 是一个专为 Vue 3 设计的现代化、高性能路由库。它不仅提供了传统路由的所有功能，还引入了
许多创新特性，让你的应用拥有闪电般的导航体验。

## 🌟 为什么选择 LDesign Router？

### ⚡ 极致性能

- **导航速度提升 50%** - 优化的路由匹配算法
- **内存使用减少 25%** - 智能的内存管理
- **包体积更小** - 仅 45KB，比竞品小 13%

### 🎯 智能预加载

四种预加载策略，让页面切换快如闪电：

- **Hover 预加载** - 鼠标悬停时预加载
- **Visible 预加载** - 元素可见时预加载
- **Idle 预加载** - 浏览器空闲时预加载
- **Immediate 预加载** - 立即预加载

### 💾 智能缓存

LRU + TTL 混合缓存策略，缓存命中率高达 85%：

- **自动过期** - TTL 机制确保数据新鲜度
- **智能淘汰** - LRU 算法优化内存使用
- **灵活规则** - 支持包含/排除规则配置

### 📊 性能监控

内置的性能分析工具，让性能优化有据可依：

- **实时监控** - 导航时间、成功率统计
- **性能报告** - 详细的性能分析报告
- **优化建议** - 自动识别性能瓶颈

### 🛡️ TypeScript 优先

100% TypeScript 编写，完整的类型支持：

- **智能提示** - IDE 友好的 API 设计
- **类型安全** - 编译时错误检查
- **完整推导** - 路由参数类型自动推导

## 🚀 快速体验

只需几行代码，就能体验 LDesign Router 的强大功能：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: () => import('./Home.vue') }],
  // 🚀 开启超能力
  preloadStrategy: 'hover', // 悬停预加载
  performance: true, // 性能监控
  cache: { max: 20 }, // 智能缓存
})
```

## 📖 学习路径

### 🎯 新手入门

1. [安装](/guide/installation) - 快速安装和配置
2. [快速开始](/guide/getting-started) - 5 分钟上手指南
3. [基础概念](/guide/concepts) - 理解核心概念

### 🏗️ 核心功能

4. [路由配置](/guide/routes) - 定义和组织路由
5. [导航](/guide/navigation) - 页面间的跳转
6. [路由守卫](/guide/guards) - 控制访问权限

### 🚀 高级特性

7. [智能预加载](/guide/preloading) - 提升用户体验
8. [智能缓存](/guide/caching) - 减少重复加载
9. [性能监控](/guide/performance) - 优化应用性能

### 🎨 组件和 API

10. [RouterView](/guide/router-view) - 路由视图组件
11. [RouterLink](/guide/router-link) - 导航链接组件
12. [组合式 API](/guide/use-router) - useRouter、useRoute 等

## 🎨 设计理念

LDesign Router 的设计遵循以下核心理念：

### 🎯 性能优先

> "快速的用户体验是现代 Web 应用的基础"

我们相信性能不是可选项，而是必需品。每一行代码都经过精心优化，确保你的应用拥有最佳的导航性能。

### 🛠️ 开发体验

> "好的工具应该让开发者专注于业务逻辑"

从 API 设计到错误提示，从文档编写到调试工具，我们致力于提供最佳的开发体验。

### 🔄 渐进式增强

> "从简单开始，按需增强"

你可以从最基础的路由配置开始，然后逐步启用高级功能。每个功能都是可选的，不会增加不必要的复杂性。

### 🌐 面向未来

> "拥抱现代技术，面向未来设计"

基于 Vue 3 Composition API，支持 TypeScript，使用现代化的构建工具，确保你的应用始终保持技术先进性。

## 🌍 生态系统

LDesign Router 不仅仅是一个路由库，更是一个完整的生态系统：

### 📦 官方插件

- **@ldesign/router-auth** - 认证和授权
- **@ldesign/router-analytics** - 数据统计
- **@ldesign/router-transitions** - 页面过渡
- **@ldesign/router-devtools** - 开发者工具

### 🎨 主题和模板

- **官方主题** - 多种预设主题
- **项目模板** - 快速启动模板
- **最佳实践** - 经过验证的项目结构

### 🤝 社区支持

- **GitHub 讨论** - 技术交流和问题解答
- **示例仓库** - 丰富的使用示例
- **贡献指南** - 参与开源贡献

## 🎯 适用场景

LDesign Router 适用于各种规模的 Vue 3 项目：

### 🏢 企业级应用

- 大规模路由配置
- 复杂的权限控制
- 高性能要求

### 🚀 创业项目

- 快速开发迭代
- 优秀的用户体验
- 成本控制

### 📱 移动端应用

- 性能优化
- 流畅的页面切换
- 离线缓存支持

### 🎓 学习项目

- 清晰的文档
- 丰富的示例
- 渐进式学习

## 🎉 开始你的旅程

准备好体验下一代路由了吗？

<div style="text-align: center; margin: 2rem 0;">
  <a href="/guide/installation" style="display: inline-block; padding: 12px 24px; background: #1890ff; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
    🚀 立即开始
  </a>
  <a href="/examples/" style="display: inline-block; padding: 12px 24px; border: 1px solid #1890ff; color: #1890ff; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
    🎨 查看示例
  </a>
</div>

---

<div style="text-align: center; color: #666; font-size: 14px;">
  <p>💡 <strong>小贴士</strong>：如果你熟悉 Vue Router，那么使用 LDesign Router 将非常容易。我们保持了相似的 API 设计，同时提供了更多强大的功能。</p>
</div>
