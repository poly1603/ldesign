# 快速开始

欢迎使用 LDesign Theme！本指南将帮助你在几分钟内为你的应用添加精美的节日主题。

## 安装

首先，安装 `@ldesign/theme` 包：

::: code-group

```bash [pnpm]
pnpm add @ldesign/theme
```

```bash [npm]
npm install @ldesign/theme
```

```bash [yarn]
yarn add @ldesign/theme
```

:::

## Vue 应用集成

### 1. 安装插件

在你的 Vue 应用中安装主题插件：

```typescript
// main.ts
import { createApp } from 'vue'
import { VueThemePlugin } from '@ldesign/theme/vue'
import { christmasTheme, springFestivalTheme, halloweenTheme } from '@ldesign/theme/themes'
import App from './App.vue'

const app = createApp(App)

// 安装主题插件
app.use(VueThemePlugin, {
  themes: [christmasTheme, springFestivalTheme, halloweenTheme],
  defaultTheme: 'christmas',
  autoActivate: true,
  debug: process.env.NODE_ENV === 'development',
})

app.mount('#app')
```

### 2. 使用主题提供者

在你的根组件中使用 `ThemeProvider`：

```vue
<!-- App.vue -->
<template>
  <ThemeProvider :themes="themes" :theme="currentTheme" :auto-activate="true">
    <div id="app">
      <header>
        <h1>我的应用</h1>
        <ThemeSelector
          v-model:value="currentTheme"
          :themes="availableThemes"
          placeholder="选择主题"
        />
      </header>

      <main>
        <router-view />
      </main>
    </div>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ThemeProvider, ThemeSelector } from '@ldesign/theme/vue'
import { christmasTheme, springFestivalTheme, halloweenTheme } from '@ldesign/theme/themes'

const themes = [christmasTheme, springFestivalTheme, halloweenTheme]
const availableThemes = ['christmas', 'spring-festival', 'halloween']
const currentTheme = ref('christmas')
</script>
```

### 3. 使用主题组件

现在你可以在任何组件中使用主题相关的组件：

```vue
<template>
  <div class="page">
    <h2>欢迎页面</h2>

    <!-- 主题按钮 -->
    <ThemeButton
      type="primary"
      size="large"
      decoration="snowflake"
      animation="sparkle"
      @click="handleClick"
    >
      🎄 点击我！
    </ThemeButton>

    <!-- 带装饰的内容区域 -->
    <div
      v-theme-decoration="{
        decoration: 'lantern',
        visible: showDecoration,
      }"
      class="content"
    >
      <p>这里是内容区域</p>
    </div>

    <!-- 带动画的元素 -->
    <div
      v-theme-animation="{
        animation: 'glow',
        trigger: 'hover',
        autoplay: false,
      }"
      class="interactive-element"
    >
      悬停我看效果
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ThemeButton } from '@ldesign/theme/vue'

const showDecoration = ref(true)

const handleClick = () => {
  console.log('按钮被点击了！')
  showDecoration.value = !showDecoration.value
}
</script>

<style scoped>
.page {
  padding: 2rem;
}

.content {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.interactive-element {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.interactive-element:hover {
  background: #e5e5e5;
}
</style>
```

## 使用组合式函数

LDesign Theme 提供了丰富的组合式函数，让你可以在组件中轻松管理主题：

```vue
<script setup lang="ts">
import { useTheme, useThemeDecorations, useThemeAnimations } from '@ldesign/theme/vue'

// 主题管理
const { currentTheme, availableThemes, setTheme, isLoading, error } = useTheme()

// 装饰管理
const { decorations, addDecoration, removeDecoration } = useThemeDecorations()

// 动画管理
const { startAnimation, stopAnimation, isAnimationRunning } = useThemeAnimations()

// 切换到春节主题
const switchToSpringFestival = async () => {
  try {
    await setTheme('spring-festival')
    console.log('主题切换成功！')
  } catch (err) {
    console.error('主题切换失败：', err)
  }
}

// 添加自定义装饰
const addCustomDecoration = () => {
  addDecoration({
    id: 'custom-snowflake',
    name: '自定义雪花',
    type: 'svg',
    src: '/custom-snowflake.svg',
    position: {
      type: 'fixed',
      position: { x: '80%', y: '20%' },
      anchor: 'top-right',
    },
    style: {
      size: { width: '40px', height: '40px' },
      opacity: 0.9,
      zIndex: 1000,
    },
    animation: 'snowfall',
    interactive: true,
    responsive: true,
  })
}

// 开始闪烁动画
const startSparkleAnimation = () => {
  startAnimation('sparkle')
}
</script>
```

## 纯 JavaScript 使用

如果你不使用 Vue，也可以直接使用核心 API：

```typescript
import { createThemeManager } from '@ldesign/theme'
import { christmasTheme, springFestivalTheme } from '@ldesign/theme/themes'

// 创建主题管理器
const themeManager = createThemeManager({
  themes: [christmasTheme, springFestivalTheme],
  defaultTheme: 'christmas',
  autoActivate: true,
  debug: true,
})

// 初始化
await themeManager.init()

// 监听主题变化
themeManager.on('theme-changed', event => {
  console.log('主题已切换到：', event.theme)
})

// 切换主题
await themeManager.setTheme('spring-festival')

// 添加装饰
themeManager.addDecoration({
  id: 'my-decoration',
  name: '我的装饰',
  type: 'icon',
  src: '/my-icon.svg',
  position: {
    type: 'fixed',
    position: { x: '50px', y: '50px' },
    anchor: 'top-left',
  },
  style: {
    size: { width: '30px', height: '30px' },
    opacity: 1,
    zIndex: 1000,
  },
  interactive: false,
  responsive: true,
})

// 开始动画
themeManager.startAnimation('snowfall')
```

## 样式配置

为了确保主题效果正常显示，你需要在你的 CSS 中添加一些基础样式：

```css
/* 确保装饰元素正确定位 */
.theme-decoration {
  pointer-events: none;
  user-select: none;
}

.theme-decoration.interactive {
  pointer-events: auto;
  cursor: pointer;
}

/* 动画性能优化 */
.theme-animation {
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-decoration {
    transform: scale(0.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-animation {
    animation: none !important;
    transition: none !important;
  }
}
```

## 下一步

恭喜！你已经成功集成了 LDesign Theme。现在你可以：

- 📖 [了解主题系统](./themes.md) - 深入了解主题的工作原理
- 🎭 [探索装饰系统](./decorations.md) - 学习如何创建和管理装饰元素
- 🎬 [掌握动画系统](./animations.md) - 了解动画的创建和控制
- 🎯 [查看完整示例](../examples/basic.md) - 浏览更多实际应用示例
- 🔧 [自定义主题](./custom-themes.md) - 创建你自己的主题

如果遇到任何问题，请查看我们的 [常见问题](./faq.md) 或在
[GitHub](https://github.com/ldesign/ldesign) 上提交 issue。
