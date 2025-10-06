# 基础使用示例

这里提供了一些基础的使用示例，帮助你快速上手 @ldesign/size。

## 🚀 快速开始

### 1. 简单的尺寸切换

```typescript
import { getGlobalSizeMode, setGlobalSizeMode } from '@ldesign/size'

// 设置全局尺寸模式
setGlobalSizeMode('large')

// 获取当前模式
const currentMode = getGlobalSizeMode()
console.log(currentMode) // 'large'
```

### 2. Vue 组件中使用

```vue
<script setup>
import { SizeSwitcher, useSize } from '@ldesign/size/vue'

const {
  currentMode,
  currentConfig,
  currentModeDisplayName
} = useSize()
</script>

<template>
  <div class="app">
    <h1>我的应用</h1>

    <!-- 尺寸切换器 -->
    <SizeSwitcher
      :modes="['small', 'medium', 'large']"
      switcher-style="segmented"
      show-icons
    />

    <!-- 内容区域 -->
    <div class="content">
      <p>当前尺寸模式: {{ currentModeDisplayName }}</p>
      <p>字体大小: {{ currentConfig.fontSize }}</p>
    </div>
  </div>
</template>

<style scoped>
.app {
  padding: var(--ls-spacing);
  font-family: var(--ls-font-family);
}

.content {
  margin-top: var(--ls-spacing-large);
  padding: var(--ls-spacing);
  border: 1px solid var(--ls-border-color, #e0e0e0);
  border-radius: var(--ls-border-radius);
  font-size: var(--ls-font-size);
}
</style>
```

## 📱 响应式示例

### 自动适配设备

```typescript
import {
  createResponsiveSizeWatcher,
  detectPreferredSizeMode,
  setGlobalSizeMode
} from '@ldesign/size'

// 自动检测并设置推荐模式
const recommendedMode = detectPreferredSizeMode()
setGlobalSizeMode(recommendedMode)

// 创建响应式监听器
const unwatch = createResponsiveSizeWatcher({
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440
  },
  modes: {
    mobile: 'small',
    tablet: 'medium',
    desktop: 'large'
  }
})
```

### Vue 响应式组件

```vue
<script setup>
import { SizeSwitcher, useSizeResponsive } from '@ldesign/size/vue'
import { computed } from 'vue'

const {
  isSmall,
  isMedium,
  isLarge,
  isSmallScreen,
  isLargeScreen
} = useSizeResponsive()

const title = computed(() => {
  if (isSmallScreen.value)
    return '移动版'
  if (isLargeScreen.value)
    return '桌面版应用'
  return '平板版应用'
})

const description = computed(() => {
  return isSmall.value
    ? '简化版描述'
    : '这是一个完整的应用描述，包含更多详细信息。'
})

const titleClasses = computed(() => ({
  'title--small': isSmall.value,
  'title--medium': isMedium.value,
  'title--large': isLarge.value
}))

const textClasses = computed(() => ({
  'text--compact': isSmallScreen.value,
  'text--comfortable': isLargeScreen.value
}))
</script>

<template>
  <div class="responsive-layout">
    <!-- 桌面版导航 -->
    <nav v-if="isLargeScreen" class="desktop-nav">
      <SizeSwitcher switcher-style="segmented" />
    </nav>

    <!-- 移动版导航 -->
    <nav v-else class="mobile-nav">
      <SizeSwitcher switcher-style="select" size="small" />
    </nav>

    <!-- 主要内容 -->
    <main class="main-content">
      <h1 :class="titleClasses">
        {{ title }}
      </h1>
      <p :class="textClasses">
        {{ description }}
      </p>
    </main>
  </div>
</template>

<style scoped>
.responsive-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.desktop-nav {
  padding: var(--ls-spacing-large);
  border-bottom: 1px solid var(--ls-border-color, #e0e0e0);
}

.mobile-nav {
  padding: var(--ls-spacing);
  border-bottom: 1px solid var(--ls-border-color, #e0e0e0);
}

.main-content {
  flex: 1;
  padding: var(--ls-spacing);
}

.title--small { font-size: 1.5rem; }
.title--medium { font-size: 2rem; }
.title--large { font-size: 2.5rem; }

.text--compact { line-height: 1.4; }
.text--comfortable { line-height: 1.6; }
</style>
```

## 🎨 主题集成示例

### CSS 变量使用

```css
/* 全局样式 */
:root {
  /* 使用 @ldesign/size 提供的 CSS 变量 */
  --app-header-height: calc(var(--ls-button-height) + var(--ls-spacing) * 2);
  --app-sidebar-width: calc(var(--ls-spacing) * 20);
}

.header {
  height: var(--app-header-height);
  padding: var(--ls-spacing);
  font-size: var(--ls-font-size);
  background: var(--ls-background-color, #ffffff);
  border-bottom: var(--ls-border-width) solid var(--ls-border-color, #e0e0e0);
}

.button {
  height: var(--ls-button-height);
  padding: var(--ls-button-padding);
  font-size: var(--ls-button-font-size);
  border-radius: var(--ls-border-radius);
  border: var(--ls-border-width) solid var(--ls-border-color, #d0d0d0);
}

.card {
  padding: var(--ls-spacing);
  margin: var(--ls-spacing-small) 0;
  border-radius: var(--ls-border-radius);
  box-shadow: var(--ls-box-shadow);
}
```

### 动态主题切换

```vue
<script setup>
import { SizeSwitcher } from '@ldesign/size/vue'
import { ref } from 'vue'

const selectedTheme = ref('light')

function applyTheme() {
  document.documentElement.setAttribute('data-theme', selectedTheme.value)
}
</script>

<template>
  <div class="theme-demo">
    <div class="controls">
      <h3>尺寸控制</h3>
      <SizeSwitcher
        :modes="['small', 'medium', 'large']"
        switcher-style="segmented"
        show-icons
        animated
      />

      <h3>主题控制</h3>
      <select v-model="selectedTheme" @change="applyTheme">
        <option value="light">
          浅色主题
        </option>
        <option value="dark">
          深色主题
        </option>
        <option value="auto">
          自动主题
        </option>
      </select>
    </div>

    <div class="preview" :data-theme="selectedTheme">
      <div class="card">
        <h4>预览卡片</h4>
        <p>这是一个示例卡片，展示当前的尺寸和主题效果。</p>
        <button class="btn">
          示例按钮
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-demo {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--ls-spacing-large);
  padding: var(--ls-spacing);
}

.controls {
  padding: var(--ls-spacing);
  border: 1px solid var(--ls-border-color, #e0e0e0);
  border-radius: var(--ls-border-radius);
}

.controls h3 {
  margin: 0 0 var(--ls-spacing) 0;
  font-size: var(--ls-font-size-large);
}

.controls select {
  width: 100%;
  height: var(--ls-button-height);
  padding: var(--ls-spacing-small);
  border: 1px solid var(--ls-border-color, #d0d0d0);
  border-radius: var(--ls-border-radius);
  font-size: var(--ls-font-size);
}

.preview {
  padding: var(--ls-spacing);
}

.card {
  padding: var(--ls-spacing-large);
  border: 1px solid var(--ls-border-color, #e0e0e0);
  border-radius: var(--ls-border-radius);
  box-shadow: var(--ls-box-shadow);
  background: var(--ls-background-color, #ffffff);
}

.card h4 {
  margin: 0 0 var(--ls-spacing) 0;
  font-size: var(--ls-font-size-large);
  color: var(--ls-text-color, #333333);
}

.card p {
  margin: 0 0 var(--ls-spacing-large) 0;
  font-size: var(--ls-font-size);
  line-height: var(--ls-line-height);
  color: var(--ls-text-color-secondary, #666666);
}

.btn {
  height: var(--ls-button-height);
  padding: var(--ls-button-padding);
  font-size: var(--ls-button-font-size);
  border: none;
  border-radius: var(--ls-border-radius);
  background: var(--ls-primary-color, #1890ff);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  background: var(--ls-primary-color-hover, #40a9ff);
}

/* 主题样式 */
[data-theme="light"] {
  --ls-background-color: #ffffff;
  --ls-text-color: #333333;
  --ls-text-color-secondary: #666666;
  --ls-border-color: #e0e0e0;
}

[data-theme="dark"] {
  --ls-background-color: #1f1f1f;
  --ls-text-color: #ffffff;
  --ls-text-color-secondary: #cccccc;
  --ls-border-color: #404040;
}

[data-theme="auto"] {
  @media (prefers-color-scheme: light) {
    --ls-background-color: #ffffff;
    --ls-text-color: #333333;
    --ls-text-color-secondary: #666666;
    --ls-border-color: #e0e0e0;
  }

  @media (prefers-color-scheme: dark) {
    --ls-background-color: #1f1f1f;
    --ls-text-color: #ffffff;
    --ls-text-color-secondary: #cccccc;
    --ls-border-color: #404040;
  }
}
</style>
```

## 🔧 自定义配置示例

### 创建自定义尺寸管理器

```typescript
import { createSizeManager } from '@ldesign/size'

// 自定义尺寸配置
const customSizes = {
  'extra-small': {
    fontSize: '11px',
    fontSizeSmall: '10px',
    fontSizeLarge: '12px',
    spacing: '6px',
    spacingSmall: '4px',
    spacingLarge: '8px',
    buttonHeight: '24px',
    inputHeight: '24px',
    borderRadius: '2px',
    borderWidth: '1px'
  },
  'huge': {
    fontSize: '20px',
    fontSizeSmall: '18px',
    fontSizeLarge: '24px',
    spacing: '24px',
    spacingSmall: '16px',
    spacingLarge: '32px',
    buttonHeight: '48px',
    inputHeight: '48px',
    borderRadius: '8px',
    borderWidth: '2px'
  }
}

// 创建自定义管理器
const sizeManager = createSizeManager({
  customSizes,
  defaultMode: 'extra-small',
  autoInject: true,
  selector: '.my-app'
})

// 使用自定义管理器
sizeManager.setMode('huge')
```

### Vue 插件配置

```typescript
import { VueSizePlugin } from '@ldesign/size/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装插件并配置
app.use(VueSizePlugin, {
  // 全局配置
  global: true,

  // 默认模式
  defaultMode: 'medium',

  // 自动注入 CSS
  autoInject: true,

  // 自定义尺寸
  customSizes: {
    compact: {
      fontSize: '13px',
      spacing: '8px',
      buttonHeight: '28px'
    }
  },

  // 响应式配置
  responsive: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1440
    },
    modes: {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'large'
    }
  }
})

app.mount('#app')
```

这些示例展示了 @ldesign/size 的基础用法，你可以根据自己的需求进行调整和扩展。
