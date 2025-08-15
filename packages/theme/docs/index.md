---
layout: home

hero:
  name: 'LDesign Theme'
  text: '节日主题系统'
  tagline: '为你的应用带来节日的魅力，支持动态装饰和丰富动画'
  image:
    src: /logo.svg
    alt: LDesign Theme
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/ldesign

features:
  - icon: 🎄
    title: 节日主题
    details: 内置圣诞节、春节、万圣节等节日主题，一键切换节日氛围
  - icon: 🎭
    title: 动态装饰
    details: 雪花飘落、灯笼摆动、烟花绽放等丰富的装饰元素
  - icon: 🎬
    title: 动画系统
    details: 高性能的 CSS 和 JavaScript 动画，支持 GPU 加速
  - icon: 🎯
    title: Vue 集成
    details: 完美支持 Vue 3，提供组件、指令和组合式函数
  - icon: 📱
    title: 响应式设计
    details: 自适应不同屏幕尺寸，移动端友好
  - icon: ⚡
    title: 性能优化
    details: 智能资源管理，按需加载，性能监控
  - icon: 🎨
    title: 高度可定制
    details: 支持自定义主题、装饰和动画，满足个性化需求
  - icon: 🌍
    title: 国际化
    details: 支持多语言和本地化，适配全球用户
---

## 快速体验

::: code-group

```vue [Vue 组件]
<template>
  <ThemeProvider :themes="themes" theme="christmas" :auto-activate="true">
    <div class="app">
      <h1>🎄 圣诞快乐！</h1>
      <ThemeSelector v-model:value="currentTheme" />
      <ThemeButton type="primary" decoration="snowflake"> 点击我看雪花！ </ThemeButton>
    </div>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ThemeProvider, ThemeSelector, ThemeButton } from '@ldesign/theme/vue'
import { christmasTheme, springFestivalTheme } from '@ldesign/theme/themes'

const themes = [christmasTheme, springFestivalTheme]
const currentTheme = ref('christmas')
</script>
```

```typescript [JavaScript API]
import { createThemeManager } from '@ldesign/theme'
import { christmasTheme } from '@ldesign/theme/themes'

// 创建主题管理器
const themeManager = createThemeManager({
  themes: [christmasTheme],
  defaultTheme: 'christmas',
  autoActivate: true,
})

// 初始化
await themeManager.init()

// 切换主题
await themeManager.setTheme('christmas')

// 添加装饰
themeManager.addDecoration({
  id: 'snowflake-1',
  name: '雪花',
  type: 'svg',
  src: '/snowflake.svg',
  position: {
    type: 'fixed',
    position: { x: '50%', y: '10%' },
    anchor: 'top-center',
  },
  style: {
    size: { width: '30px', height: '30px' },
    opacity: 0.8,
    zIndex: 1000,
  },
  animation: 'snowfall',
  interactive: true,
  responsive: true,
})
```

```vue [指令使用]
<template>
  <div class="container">
    <!-- 装饰指令 -->
    <div
      v-theme-decoration="{
        decoration: 'snowflake',
        visible: true,
      }"
      class="content"
    >
      内容区域
    </div>

    <!-- 动画指令 -->
    <div
      v-theme-animation="{
        animation: 'sparkle',
        trigger: 'hover',
        autoplay: false,
      }"
      class="interactive"
    >
      悬停时闪烁
    </div>

    <!-- 修饰符使用 -->
    <div v-theme-decoration.hover="{ decoration: 'lantern' }" class="hover-decoration">
      悬停显示灯笼
    </div>

    <div v-theme-animation.loop.slow="{ animation: 'glow' }" class="glow-effect">慢速循环发光</div>
  </div>
</template>
```

:::

## 主题预览

<div class="theme-preview">
  <div class="theme-card christmas">
    <h3>🎄 圣诞节主题</h3>
    <p>红绿配色，温馨节日氛围</p>
    <div class="features">
      <span>雪花飘落</span>
      <span>圣诞树</span>
      <span>发光效果</span>
    </div>
  </div>
  
  <div class="theme-card spring-festival">
    <h3>🧧 春节主题</h3>
    <p>红金配色，喜庆中国风</p>
    <div class="features">
      <span>灯笼摆动</span>
      <span>烟花绽放</span>
      <span>金币飞舞</span>
    </div>
  </div>
  
  <div class="theme-card halloween">
    <h3>🎃 万圣节主题</h3>
    <p>橙黑配色，神秘恐怖风格</p>
    <div class="features">
      <span>幽灵飘浮</span>
      <span>南瓜发光</span>
      <span>蝙蝠飞舞</span>
    </div>
  </div>
</div>

## 为什么选择 LDesign Theme？

### 🚀 开箱即用

无需复杂配置，安装即可使用。内置多个精美的节日主题，满足不同场景需求。

### 🎨 设计精美

每个主题都经过精心设计，色彩搭配和谐，装饰元素生动有趣，为用户带来愉悦的视觉体验。

### ⚡ 性能卓越

采用 GPU 加速动画，智能资源管理，确保流畅的用户体验。支持性能监控和自动降级。

### 🔧 易于扩展

提供完整的 API 和工具，支持自定义主题、装饰和动画。满足个性化定制需求。

### 📱 移动友好

完全响应式设计，在各种设备上都能完美展示。针对移动设备进行了特别优化。

### 🌍 国际化支持

支持多语言和本地化，适配全球用户。内置中英文支持，可扩展其他语言。

---

<div class="getting-started">
  <h2>立即开始</h2>
  <p>只需几分钟，就能为你的应用添加精美的节日主题！</p>
  <div class="actions">
    <a href="/guide/getting-started" class="action-button primary">
      📖 阅读指南
    </a>
    <a href="/examples/basic" class="action-button">
      🎯 查看示例
    </a>
    <a href="https://github.com/ldesign/ldesign" class="action-button">
      💻 GitHub
    </a>
  </div>
</div>

<style>
.theme-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.theme-card {
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-border);
  transition: all 0.3s ease;
}

.theme-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.theme-card.christmas {
  background: linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%);
  border-color: #dc2626;
}

.theme-card.spring-festival {
  background: linear-gradient(135deg, #fef3c7 0%, #fed7d7 100%);
  border-color: #dc2626;
}

.theme-card.halloween {
  background: linear-gradient(135deg, #fed7aa 0%, #fecaca 100%);
  border-color: #ea580c;
}

.theme-card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.theme-card p {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.features span {
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
}

.getting-started {
  text-align: center;
  padding: 3rem 0;
  border-top: 1px solid var(--vp-c-border);
  margin-top: 3rem;
}

.getting-started h2 {
  margin: 0 0 1rem 0;
}

.getting-started p {
  margin: 0 0 2rem 0;
  color: var(--vp-c-text-2);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.action-button.primary {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button.primary:hover {
  background: var(--vp-c-brand-dark);
}
</style>
