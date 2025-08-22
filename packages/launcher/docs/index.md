---
layout: home

hero:
  name: "Vite Launcher"
  text: "⚡ 极速前端项目启动器"
  tagline: 让创建和管理前端项目变得简单有趣！支持 Vue、React、TypeScript 等多种技术栈 🚀
  image:
    src: /logo.svg
    alt: Vite Launcher
  actions:
    - theme: brand
      text: 快速开始 🎯
      link: /guide/getting-started
    - theme: alt
      text: 查看示例 💡
      link: /examples/basic
    - theme: alt
      text: GitHub 仓库 📦
      link: https://github.com/ldesign/packages/tree/main/packages/launcher

features:
  - icon: 🚀
    title: 极速创建项目
    details: 一条命令即可创建 Vue、React、TypeScript 等多种类型的前端项目，告别繁琐的项目初始化过程
  
  - icon: 🎯
    title: 智能项目检测
    details: 自动识别现有项目的框架类型和配置，无需手动指定，让你专注于代码开发
  
  - icon: 🛠️
    title: 开箱即用
    details: 内置开发服务器、构建工具、预览功能，提供完整的开发工作流，零配置即可开始开发
  
  - icon: 📊
    title: 构建分析
    details: 详细的构建产物分析和优化建议，帮助你了解项目性能并提供改进方案
  
  - icon: 🔧
    title: 高度可配置
    details: 灵活的配置系统和插件架构，满足各种项目需求，支持自定义扩展
  
  - icon: 💯
    title: TypeScript 优先
    details: 完整的 TypeScript 类型定义和智能提示，提供最佳的开发体验和代码安全性
---

## 🎉 为什么选择 Vite Launcher？

::: tip 💡 开发效率提升神器
Vite Launcher 不仅仅是一个项目脚手架，更是你前端开发路上的得力助手！无论你是初学者还是资深开发者，都能从中获得极致的开发体验。
:::

### 🚦 快如闪电的开发体验

```bash
# 🚀 一条命令创建项目
npm create @ldesign/launcher my-awesome-app --template vue3

# ⚡ 瞬间启动开发服务器
cd my-awesome-app
npm run dev

# 🎯 智能构建优化
npm run build
```

### 🎨 支持多种技术栈

<div class="tech-stack-grid">

**🟢 Vue 生态系统**
- Vue 3 + Composition API
- Vue 2 兼容模式  
- Pinia 状态管理
- Vue Router 路由

**⚛️ React 生态系统**
- React 18 + Hooks
- Next.js 全栈框架
- React Router 路由
- Zustand 状态管理

**🔷 TypeScript 原生**
- 严格类型检查
- 智能代码提示
- 现代 ES 语法
- 模块化开发

**🌟 更多选择**
- Lit Web Components
- Svelte 轻量框架
- Vanilla JavaScript
- 渐进式增强

</div>

### 📈 数据说话

::: info 🏆 性能表现卓越
- **⚡ 构建速度**: 比传统工具快 **10-100 倍**
- **📦 包体积**: 平均减少 **40%** 的构建产物
- **🔄 热重载**: **< 100ms** 的极速更新
- **💾 内存占用**: 降低 **60%** 的开发时内存使用
:::

## 🎯 快速体验

想要立即体验 Vite Launcher 的强大功能？选择你喜欢的方式开始吧：

::: code-group

```bash [NPM]
# 🎯 全局安装（推荐）
npm install -g @ldesign/launcher

# 🚀 创建新项目
vite-launcher create my-project --template vue3
```

```bash [Yarn]
# 🎯 全局安装
yarn global add @ldesign/launcher

# 🚀 创建新项目  
vite-launcher create my-project --template react
```

```bash [PNPM]
# 🎯 全局安装
pnpm add -g @ldesign/launcher

# 🚀 创建新项目
vite-launcher create my-project --template vanilla-ts
```

```javascript [编程方式]
// 🛠️ 在代码中使用
import { createProject, startDev } from '@ldesign/launcher'

// 🎨 创建项目
await createProject('./my-app', 'vue3', { 
  force: true 
})

// ⚡ 启动开发服务器
const server = await startDev('./my-app', { 
  port: 3000,
  open: true 
})
```

:::

## 🏆 成功案例

::: details 🌟 听听开发者们怎么说

> **"Vite Launcher 彻底改变了我的开发工作流！"** 🎉  
> *—— 张三，某互联网公司前端架构师*
> 
> 以前搭建一个新项目需要半天时间配置各种工具，现在只需要一条命令，项目就能跑起来。特别是那个构建分析功能，帮我优化了很多性能问题。

> **"新手友好，专家也爱用"** 💯  
> *—— 李四，独立开发者*
> 
> 作为一个前端新手，我最怕的就是配置各种复杂的构建工具。Vite Launcher 让我能专注于学习 Vue 和 React，而不用担心环境问题。

> **"团队开发的利器"** 🚀  
> *—— 王五，创业公司技术总监*
> 
> 我们团队从 Webpack 迁移到 Vite Launcher 后，开发效率提升了至少 50%。特别是热重载速度，让我们的开发体验提升了好几个档次。

:::

## 🎊 加入我们的社区

::: tip 🤝 一起让前端开发变得更美好！
Vite Launcher 是一个开源项目，我们欢迎所有形式的贡献！无论是报告 Bug、提出功能建议，还是直接贡献代码，都能让这个工具变得更好。
:::

<div class="community-links">

**🐛 遇到问题？**
- [GitHub Issues](https://github.com/ldesign/packages/issues) - 报告 Bug 和功能请求
- [讨论区](https://github.com/ldesign/packages/discussions) - 技术交流和问答

**📚 学习资源**
- [完整文档](/guide/) - 从入门到精通的完整教程
- [API 参考](/api/) - 详细的 API 文档
- [示例项目](/examples/) - 真实可运行的示例代码

**🤝 参与贡献**
- [贡献指南](https://github.com/ldesign/packages/blob/main/CONTRIBUTING.md) - 如何参与项目开发
- [开发文档](https://github.com/ldesign/packages/blob/main/DEVELOPMENT.md) - 本地开发环境搭建

</div>

---

<div class="footer-cta">

### 🎯 准备好开始你的前端开发之旅了吗？

<div class="cta-buttons">
  <a href="/guide/getting-started" class="cta-button primary">🚀 立即开始</a>
  <a href="/examples/" class="cta-button secondary">💡 查看示例</a>
  <a href="https://github.com/ldesign/packages/tree/main/packages/launcher" class="cta-button github">⭐ Star on GitHub</a>
</div>

</div>

<style>
.tech-stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.tech-stack-grid > div {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.community-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.footer-cta {
  text-align: center;
  padding: 3rem 0;
  margin: 3rem 0;
  background: linear-gradient(135deg, var(--vp-c-brand-soft) 0%, var(--vp-c-brand-lighter) 100%);
  border-radius: 16px;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cta-button.primary {
  background: var(--vp-c-brand);
  color: white;
}

.cta-button.secondary {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-border);
}

.cta-button.github {
  background: #24292e;
  color: white;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}
</style>