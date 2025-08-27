---
layout: home

hero:
  name: "@ldesign/watermark"
  text: "强大的前端水印解决方案"
  tagline: "轻量、灵活、易用的水印库，支持多种渲染模式和框架集成"
  image:
    src: /logo.svg
    alt: LDesign Watermark
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/watermark

features:
  - icon: 🚀
    title: 开箱即用
    details: 简单的 API 设计，几行代码即可添加水印，支持文字和图片水印
  - icon: 🎨
    title: 多种渲染模式
    details: 支持 DOM、Canvas、SVG 三种渲染模式，满足不同场景需求
  - icon: 🛡️
    title: 安全防护
    details: 内置防篡改机制，支持 DOM 监控、样式保护等多重安全策略
  - icon: 📱
    title: 响应式设计
    details: 自动适配不同屏幕尺寸，支持自定义断点和布局策略
  - icon: ⚡
    title: 高性能
    details: 优化的渲染算法，支持虚拟化和缓存，确保流畅的用户体验
  - icon: 🔧
    title: 高度可定制
    details: 丰富的配置选项，支持自定义渲染器和插件扩展
  - icon: 🎭
    title: 动画支持
    details: 内置多种动画效果，支持自定义动画和过渡效果
  - icon: 🌐
    title: 框架无关
    details: 支持 Vue、React、Angular 等主流框架，也可在原生 JS 中使用
  - icon: 📦
    title: TypeScript 支持
    details: 完整的 TypeScript 类型定义，提供优秀的开发体验
---

## 快速体验

```bash
# 安装
npm install @ldesign/watermark

# 或者使用 yarn
yarn add @ldesign/watermark

# 或者使用 pnpm
pnpm add @ldesign/watermark
```

```javascript
import { createWatermark } from '@ldesign/watermark'

// 创建文字水印
const watermark = await createWatermark('#container', {
  content: '机密文档',
  style: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.15)',
    rotate: -22
  }
})
```

## 为什么选择 @ldesign/watermark？

### 🎯 专业级功能
- **多重安全防护**：防止水印被删除或修改
- **智能布局算法**：自动计算最佳水印位置
- **性能优化**：支持大量水印的高效渲染

### 🛠️ 开发友好
- **零配置启动**：默认配置即可满足大部分需求
- **完整的 TypeScript 支持**：类型安全，智能提示
- **详细的文档和示例**：快速上手，深入学习

### 🌟 生产就绪
- **全面的测试覆盖**：确保代码质量和稳定性
- **持续的维护更新**：及时修复问题，添加新功能
- **活跃的社区支持**：问题反馈，经验分享

## 使用场景

<div class="use-cases">
  <div class="use-case">
    <h3>📄 文档保护</h3>
    <p>为敏感文档添加水印，防止未授权传播</p>
  </div>
  <div class="use-case">
    <h3>🖼️ 图片版权</h3>
    <p>保护图片版权，标识来源和所有者</p>
  </div>
  <div class="use-case">
    <h3>🎥 视频内容</h3>
    <p>为视频内容添加品牌标识或版权信息</p>
  </div>
  <div class="use-case">
    <h3>💼 企业应用</h3>
    <p>在企业系统中标识用户身份和操作记录</p>
  </div>
</div>

## 社区与支持

<div class="community">
  <div class="community-item">
    <h3>🐛 问题反馈</h3>
    <p>在 GitHub Issues 中报告 bug 或提出功能建议</p>
    <a href="https://github.com/ldesign/watermark/issues" target="_blank">提交 Issue</a>
  </div>
  <div class="community-item">
    <h3>💬 讨论交流</h3>
    <p>在 GitHub Discussions 中与社区成员交流</p>
    <a href="https://github.com/ldesign/watermark/discussions" target="_blank">参与讨论</a>
  </div>
  <div class="community-item">
    <h3>📖 贡献代码</h3>
    <p>欢迎提交 Pull Request 来改进项目</p>
    <a href="https://github.com/ldesign/watermark/pulls" target="_blank">贡献代码</a>
  </div>
</div>

<style>
.use-cases {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.use-case {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.use-case h3 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-brand-1);
}

.use-case p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.community {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.community-item {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  text-align: center;
}

.community-item h3 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-brand-1);
}

.community-item p {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
}

.community-item a {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--vp-c-brand-1);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.community-item a:hover {
  background: var(--vp-c-brand-2);
}
</style>
