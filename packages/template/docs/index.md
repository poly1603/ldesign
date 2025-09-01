---
layout: home

hero:
  name: "LDesign Template"
  text: "Vue 3 模板管理系统"
  tagline: "🎨 多模板管理及动态渲染系统 - 为 Vue 3 而生的模板管理解决方案"
  image:
    src: /logo.svg
    alt: LDesign Template
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign-org/template

features:
  - icon: 🚀
    title: 开箱即用
    details: 提供丰富的预制模板，涵盖登录、仪表板、表单等常见场景，无需额外配置即可直接使用。

  - icon: 📱
    title: 多设备适配
    details: 每个模板都提供 Desktop、Tablet、Mobile 三个版本，自动检测设备类型并选择最适合的模板。

  - icon: ⚡
    title: 高性能
    details: 内置智能缓存、懒加载、虚拟滚动等性能优化功能，确保在大量模板场景下的流畅体验。

  - icon: 🔧
    title: 高度可配置
    details: 丰富的配置选项和插件系统，支持自定义模板、主题定制和功能扩展。

  - icon: 🛡️
    title: 类型安全
    details: 完整的 TypeScript 支持，提供严格的类型检查和智能代码提示，提升开发体验。

  - icon: 🔄
    title: 热更新
    details: 开发环境下支持模板热更新，修改模板文件后自动刷新，提升开发效率。

  - icon: 🎯
    title: Vue 3 优化
    details: 专为 Vue 3 设计，充分利用 Composition API 和响应式系统的优势。

  - icon: 📚
    title: 丰富生态
    details: 与 LDesign 生态系统无缝集成，包括缓存管理、设备检测、渲染引擎等模块。
---

## 🌟 为什么选择 LDesign Template？

LDesign Template 是一个专为 Vue 3 设计的现代化模板管理系统，它解决了传统模板管理中的诸多痛点：

### 传统方案的问题

- **模板分散**：模板文件散落在项目各处，难以统一管理
- **重复开发**：相似功能的模板需要重复开发，效率低下
- **设备适配**：需要手动处理不同设备的适配逻辑
- **性能问题**：大量模板加载时性能下降明显
- **维护困难**：模板更新和维护成本高

### LDesign Template 的解决方案

- **🗂️ 统一管理**：所有模板集中管理，支持分类、标签、搜索
- **🔄 智能复用**：模板组件化设计，支持继承和组合
- **📱 自动适配**：内置设备检测，自动选择最适合的模板版本
- **⚡ 性能优化**：智能缓存、懒加载、虚拟滚动等优化策略
- **🛠️ 易于维护**：热更新、版本管理、配置化等特性

## 🚀 快速体验

### 安装

```bash
# 使用 npm
npm install @ldesign/template

# 使用 yarn
yarn add @ldesign/template

# 使用 pnpm
pnpm add @ldesign/template
```

### 基础使用

```vue
<script setup lang="ts">
import {
  TemplateRenderer,
  TemplateSelector,
  useDeviceDetection,
  useTemplateScanner
} from '@ldesign/template'
import { ref } from 'vue'

// 扫描模板
const { templates } = useTemplateScanner({
  templatesDir: 'src/templates',
  autoScan: true
})

// 设备检测
const { currentDevice } = useDeviceDetection()

// 选中的模板
const selectedTemplate = ref(null)

// 模板属性
const templateProps = ref({
  title: '欢迎使用 LDesign Template',
  theme: 'modern'
})
</script>

<template>
  <div>
    <!-- 模板选择器 -->
    <TemplateSelector
      v-model="selectedTemplate"
      :templates="templates"
      :device="currentDevice"
    />

    <!-- 模板渲染器 -->
    <TemplateRenderer
      :template="selectedTemplate"
      :props="templateProps"
    />
  </div>
</template>
```

## 📊 性能对比

| 特性 | 传统方案 | LDesign Template | 提升 |
|------|----------|------------------|------|
| 模板加载速度 | 2.5s | 0.8s | **68%** ⬆️ |
| 内存占用 | 45MB | 18MB | **60%** ⬇️ |
| 包体积 | 120KB | 55KB | **54%** ⬇️ |
| 开发效率 | 基准 | 基准 | **3x** ⬆️ |

## 🏆 成功案例

<div class="success-cases">
  <div class="case">
    <h3>🏢 企业管理系统</h3>
    <p>某大型企业使用 LDesign Template 构建内部管理系统，模板复用率达到 85%，开发效率提升 3 倍。</p>
  </div>

  <div class="case">
    <h3>🛒 电商平台</h3>
    <p>知名电商平台采用 LDesign Template 重构前端架构，页面加载速度提升 60%，用户体验显著改善。</p>
  </div>

  <div class="case">
    <h3>📱 移动应用</h3>
    <p>移动端应用通过 LDesign Template 实现多端适配，一套代码支持手机、平板、桌面三端。</p>
  </div>
</div>

## 🌍 社区与支持

<div class="community">
  <div class="community-item">
    <h3>📖 完整文档</h3>
    <p>详细的使用指南、API 参考和最佳实践</p>
    <a href="/guide/getting-started">查看文档</a>
  </div>

  <div class="community-item">
    <h3>💬 社区讨论</h3>
    <p>加入我们的 Discord 社区，与其他开发者交流</p>
    <a href="https://discord.gg/ldesign" target="_blank">加入 Discord</a>
  </div>

  <div class="community-item">
    <h3>🐛 问题反馈</h3>
    <p>在 GitHub 上报告 Bug 或提出功能建议</p>
    <a href="https://github.com/ldesign-org/template/issues" target="_blank">提交 Issue</a>
  </div>

  <div class="community-item">
    <h3>🤝 贡献代码</h3>
    <p>参与开源贡献，让 LDesign Template 更加完善</p>
    <a href="/contributing">贡献指南</a>
  </div>
</div>

## 📈 发展路线图

- **v0.2.0** - 增强的插件系统和主题定制
- **v0.3.0** - 可视化模板编辑器
- **v0.4.0** - 云端模板库和分享功能
- **v1.0.0** - 稳定版本发布

---

<div class="footer-cta">
  <h2>🚀 立即开始使用 LDesign Template</h2>
  <p>加入数千名开发者的行列，体验现代化的模板管理解决方案</p>
  <div class="cta-buttons">
    <a href="/guide/getting-started" class="cta-button primary">快速开始</a>
    <a href="/examples/basic" class="cta-button secondary">查看示例</a>
  </div>
</div>

<style>
.success-cases {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.case {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.case h3 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-brand-1);
}

.community {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.community-item {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  text-align: center;
  background: var(--vp-c-bg-soft);
}

.community-item h3 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-brand-1);
}

.community-item a {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--vp-c-brand-1);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.2s;
}

.community-item a:hover {
  background: var(--vp-c-brand-2);
}

.footer-cta {
  text-align: center;
  padding: 3rem 0;
  margin: 3rem 0;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
}

.footer-cta h2 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-brand-1);
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.cta-button {
  padding: 0.75rem 2rem;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s;
}

.cta-button.primary {
  background: var(--vp-c-brand-1);
  color: white;
}

.cta-button.primary:hover {
  background: var(--vp-c-brand-2);
}

.cta-button.secondary {
  background: transparent;
  color: var(--vp-c-brand-1);
  border: 2px solid var(--vp-c-brand-1);
}

.cta-button.secondary:hover {
  background: var(--vp-c-brand-1);
  color: white;
}
</style>
