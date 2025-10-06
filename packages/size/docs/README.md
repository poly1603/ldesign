---
layout: home

hero:
  name: "@ldesign/size"
  text: "智能尺寸控制系统"
  tagline: "🎯 让你的应用适配每一个屏幕，提供完美的用户体验"
  image:
    src: /logo.svg
    alt: LDesign Size
  actions:
    - theme: brand
      text: 快速开始
      link: /getting-started/
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/size

features:
  - icon: 🎯
    title: 智能尺寸控制
    details: 支持小、中、大三种预设尺寸模式，智能适配不同设备和用户偏好
  - icon: 🎨
    title: CSS变量生成
    details: 自动生成对应的CSS变量，无缝集成到你的样式系统中
  - icon: 🔧
    title: 灵活配置
    details: 支持自定义尺寸配置、CSS变量前缀和各种个性化选项
  - icon: 📱
    title: 响应式支持
    details: 根据设备特性和屏幕尺寸自动调整，提供最佳的视觉体验
  - icon: 🎭
    title: Vue完美集成
    details: 提供完整的Vue组件库和Composition API，开箱即用
  - icon: 💾
    title: 持久化存储
    details: 支持本地存储用户偏好设置，记住用户的选择
  - icon: 🎬
    title: 动画过渡
    details: 平滑的尺寸切换动画效果，提升用户体验
  - icon: ⚡
    title: 轻量高效
    details: 零依赖，体积小巧，性能优异，不影响应用加载速度
  - icon: 🛠️
    title: TypeScript支持
    details: 完整的TypeScript类型定义，提供优秀的开发体验
---

## 🚀 快速体验

<div class="demo-container">
  <div class="demo-card">
    <h3>基础使用</h3>

```typescript
import { Size } from '@ldesign/size'

// 设置尺寸模式
Size.set('large')

// 获取当前模式
const current = Size.get() // 'large'

// 切换到下一个尺寸
Size.next() // 'small'

// 监听变化
Size.watch((mode) => {
  console.log('尺寸变更为:', mode)
})
```
  </div>

  <div class="demo-card">
    <h3>Vue 组件</h3>

```vue
<script setup>
import { SizeIndicator, SizeSwitcher } from '@ldesign/size/vue'
</script>

<template>
  <div>
    <!-- 尺寸切换器 -->
    <SizeSwitcher
      :show-icons="true"
      :animated="true"
      theme="auto"
    />

    <!-- 尺寸指示器 -->
    <SizeIndicator :show-scale="true" />
  </div>
</template>
```
  </div>

  <div class="demo-card">
    <h3>Composition API</h3>

```vue
<script setup>
import { useSmartSize } from '@ldesign/size/vue'

const {
  currentMode,
  setMode,
  isUsingRecommended,
  resetToRecommended
} = useSmartSize({
  responsive: true,
  remember: true
})

// 智能切换
function handleSizeChange(mode) {
  setMode(mode, true) // 记住用户选择
}
</script>
```
  </div>
</div>

## 🎯 快速导航

### 我想要...

**快速开始使用** → [安装指南](./getting-started/installation.md) →
[基础使用](./getting-started/basic-usage.md)

**在 Vue 项目中使用** → [Vue 集成](./getting-started/vue-integration.md) → [Vue API](./api/vue.md)

**了解核心概念** → [尺寸模式](./concepts/size-modes.md) →
[CSS 变量系统](./concepts/css-variables.md)

**查看完整 API** → [核心 API](./api/core.md) → [Vue API](./api/vue.md) → [类型定义](./api/types.md)

**学习最佳实践** → [设计规范](./best-practices/design-guidelines.md) →
[无障碍访问](./best-practices/accessibility.md)

**解决问题** → [常见问题](./troubleshooting/faq.md) → [调试指南](./troubleshooting/debugging.md)

## 📝 文档贡献

我们欢迎对文档的贡献！如果你发现了错误、有改进建议或想要添加新的内容，请：

1. 在 [GitHub Issues](https://github.com/ldesign/ldesign/issues) 中报告问题
2. 提交 Pull Request 来改进文档
3. 参与讨论和反馈

### 文档编写规范

- 使用清晰、简洁的语言
- 提供完整的代码示例
- 包含实际的使用场景
- 保持内容的时效性

## 🔗 相关资源

- [GitHub 仓库](https://github.com/ldesign/ldesign)
- [NPM 包](https://www.npmjs.com/package/@ldesign/size)
- [在线示例](https://ldesign.github.io/size-examples)
- [问题反馈](https://github.com/ldesign/ldesign/issues)

---

<div align="center">
  <p>📖 持续完善中，感谢你的耐心和支持！</p>
  <p>如有疑问，欢迎在 GitHub 上提出 Issue</p>
</div>
