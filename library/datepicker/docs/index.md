---
layout: home

hero:
  name: LDesign DatePicker
  text: 现代化日期时间选择器
  tagline: 功能丰富、性能优秀、框架无关
  image:
    src: /logo.svg
    alt: LDesign DatePicker
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 查看
      link: https://github.com/ldesign/datepicker

features:
  - icon: 🎯
    title: 框架无关
    details: 核心逻辑独立，可在任意框架中使用。提供 Vue3、React、Lit/Web Components 封装。
  
  - icon: 🎨
    title: 主题定制
    details: 基于 CSS Variables，轻松定制主题。支持亮色/暗色模式。
  
  - icon: 🌍
    title: 国际化
    details: 内置 20+ 语言包，支持自定义语言配置。完整的本地化支持。
  
  - icon: ♿
    title: 可访问性
    details: 完整的 ARIA 支持和键盘导航。符合 WCAG 2.1 标准。
  
  - icon: 🚀
    title: 高性能
    details: 虚拟滚动、懒加载、Tree-shaking 友好。打包后仅 30KB (gzipped)。
  
  - icon: 📅
    title: 功能丰富
    details: 支持日期、时间、范围、多选等 12+ 种模式。满足各种业务需求。
  
  - icon: 💪
    title: TypeScript
    details: 完整的类型定义，提供出色的开发体验。
  
  - icon: 📖
    title: 文档完善
    details: 详细的文档和交互式示例，快速上手。
  
  - icon: 🧪
    title: 测试覆盖
    details: 单元测试和 E2E 测试，确保代码质量。覆盖率 > 90%。
---

## 快速预览

::: code-group

```vue [Vue 3]
<template>
  <DatePicker v-model="date" type="date" />
</template>

<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const date = ref(new Date());
</script>
```

```tsx [React]
import { useState } from 'react';
import { DatePicker } from '@ldesign/datepicker-react';

function App() {
  const [date, setDate] = useState(new Date());
  
  return <DatePicker value={date} onChange={setDate} />;
}
```

```html [Web Components]
<script type="module">
  import '@ldesign/datepicker-lit';
</script>

<ldate-picker type="date"></ldate-picker>
```

:::

## 为什么选择 LDesign DatePicker？

- ✅ **真正的框架无关**：一套核心代码，适配所有主流框架
- ✅ **现代化设计**：精美的 UI，流畅的动画
- ✅ **开发体验**：完整的 TypeScript 支持，友好的 API 设计
- ✅ **生产就绪**：经过充分测试，可靠稳定
- ✅ **持续维护**：活跃的社区支持

## 支持的框架

<div class="framework-grid">
  <div class="framework-item">
    <img src="https://vuejs.org/images/logo.png" alt="Vue" />
    <span>Vue 3</span>
  </div>
  <div class="framework-item">
    <img src="https://reactjs.org/logo-og.png" alt="React" />
    <span>React</span>
  </div>
  <div class="framework-item">
    <img src="https://lit.dev/images/logo.svg" alt="Lit" />
    <span>Lit</span>
  </div>
  <div class="framework-item">
    <span>Web Components</span>
  </div>
</div>

<style>
.framework-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.framework-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: all 0.3s;
}

.framework-item:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.framework-item img {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

.framework-item span {
  font-weight: 500;
}
</style>





