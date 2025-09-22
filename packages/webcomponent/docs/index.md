---
layout: home

hero:
  name: "LDesign WebComponent"
  text: "高质量 Web Components 组件库"
  tagline: "基于 Stencil 构建，支持所有前端框架"
  image:
    src: /logo.svg
    alt: LDesign WebComponent
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看组件
      link: /components/button
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/webcomponent

features:
  - icon: 🚀
    title: 高性能
    details: 基于 Stencil 编译器，生成优化的原生 Web Components，运行时开销极小
  - icon: 🎨
    title: 设计系统
    details: 完整的设计令牌系统，支持主题定制，遵循现代设计规范
  - icon: 🔧
    title: 框架无关
    details: 可在 React、Vue、Angular、原生 HTML 等任何环境中使用
  - icon: 📱
    title: 响应式
    details: 移动端优先设计，完美适配各种屏幕尺寸
  - icon: ♿
    title: 无障碍
    details: 遵循 WCAG 2.1 标准，提供完整的键盘导航和屏幕阅读器支持
  - icon: 🌍
    title: 国际化
    details: 内置国际化支持，轻松适配多语言环境
  - icon: 🧪
    title: 测试友好
    details: 完整的测试覆盖，提供测试工具和最佳实践
  - icon: 📚
    title: 完整文档
    details: 详细的 API 文档、使用示例和设计指南
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #722ED1 30%, #a67fdb);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #722ED1 50%, #a67fdb 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
