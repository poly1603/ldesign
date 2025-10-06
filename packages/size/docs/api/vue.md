# Vue API 文档

本文档详细介绍了 @ldesign/size 的 Vue 集成 API。

## 📚 导入方式

```typescript
import {
  createSizeApp,
  createVueSizePlugin,
  // 工具函数
  installSizePlugin,
  installWithPreset,
  registerSizeComponents,
  SizeControlPanel,
  SizeIndicator,
  // 组件
  SizeSwitcher,

  useGlobalSize,
  // Composition API
  useSize,
  useSizeAnimation,

  // 类型
  type UseSizeOptions,
  useSizeResponsive,

  type UseSizeReturn,
  useSizeState,
  useSizeSwitcher,
  useSizeWatcher,

  useSmartSize,
  // 插件
  VueSizePlugin,
} from '@ldesign/size/vue'
```

## 🎯 Composition API

### useSize

基础的尺寸管理 Hook，提供完整的尺寸管理功能。

```typescript
function useSize(options?: UseSizeOptions): UseSizeReturn

interface UseSizeOptions {
  /** 是否使用全局管理器 */
  global?: boolean
  /** 初始尺寸模式 */
  initialMode?: SizeMode
  /** 是否自动注入CSS */
  autoInject?: boolean
}

interface UseSizeReturn {
  /** 当前尺寸模式 */
  currentMode: Ref<SizeMode>
  /** 当前配置 */
  currentConfig: ComputedRef<SizeConfig>
  /** 当前模式显示名称 */
  currentModeDisplayName: ComputedRef<string>
  /** 设置尺寸模式 */
  setMode: (mode: SizeMode) => Promise<void>
  /** 切换到下一个模式 */
  nextMode: () => Promise<void>
  /** 切换到上一个模式 */
  previousMode: () => Promise<void>
  /** 获取配置 */
  getConfig: (mode?: SizeMode) => SizeConfig
  /** 生成CSS变量 */
  generateCSSVariables: (mode?: SizeMode) => Record<string, string>
  /** 注入CSS */
  injectCSS: (mode?: SizeMode) => void
  /** 移除CSS */
  removeCSS: () => void
  /** 尺寸管理器实例 */
  sizeManager: SizeManager
}
```

**使用示例：**

```vue
<script setup>
import { useSize } from '@ldesign/size/vue'

const {
  currentMode,
  setMode,
  nextMode,
  currentModeDisplayName
} = useSize()

// 设置尺寸模式
const handleSetLarge = () => setMode('large')

// 切换到下一个模式
const handleNext = () => nextMode()
</script>

<template>
  <div>
    <p>当前模式: {{ currentModeDisplayName }}</p>
    <button @click="handleSetLarge">
      设置为大尺寸
    </button>
    <button @click="handleNext">
      下一个模式
    </button>
  </div>
</template>
```

### useGlobalSize

专门用于全局尺寸管理的 Hook。

```typescript
function useGlobalSize(): UseSizeReturn
```

**使用示例：**

```vue
<script setup>
import { useGlobalSize } from '@ldesign/size/vue'

const { currentMode, setMode } = useGlobalSize()
</script>
```

### useSizeResponsive

提供响应式尺寸检查的 Hook。

```typescript
function useSizeResponsive(): {
  currentMode: Ref<SizeMode>
  isSmall: ComputedRef<boolean>
  isMedium: ComputedRef<boolean>
  isLarge: ComputedRef<boolean>
  isExtraLarge: ComputedRef<boolean>
  isAtLeast: (mode: SizeMode) => boolean
  isAtMost: (mode: SizeMode) => boolean
}
```

**使用示例：**

```vue
<script setup>
import { useSizeResponsive } from '@ldesign/size/vue'

const {
  isSmall,
  isMedium,
  isLarge,
  isAtLeast
} = useSizeResponsive()
</script>

<template>
  <div>
    <div v-if="isSmall">
      小尺寸布局
    </div>
    <div v-else-if="isMedium">
      中等尺寸布局
    </div>
    <div v-else-if="isLarge">
      大尺寸布局
    </div>

    <div v-if="isAtLeast('medium')">
      中等尺寸及以上显示的内容
    </div>
  </div>
</template>
```

### useSizeSwitcher

提供尺寸切换功能的 Hook。

```typescript
function useSizeSwitcher(): {
  currentMode: Ref<SizeMode>
  availableModes: ComputedRef<SizeMode[]>
  switchTo: (mode: SizeMode) => Promise<void>
  next: () => Promise<void>
  previous: () => Promise<void>
  toggle: () => Promise<void>
}
```

### useSizeWatcher

监听尺寸变化的 Hook。

```typescript
function useSizeWatcher(
  callback: (event: SizeChangeEvent) => void,
  options?: { immediate?: boolean }
): void
```

## 🧩 组件

### SizeSwitcher

尺寸切换器组件，提供多种切换样式。

```vue
<template>
  <SizeSwitcher
    v-model:mode="currentMode"
    :modes="['small', 'medium', 'large']"
    switcher-style="segmented"
    :animated="true"
    :show-labels="true"
    :show-icons="true"
  />
</template>
```

**Props：**

- `mode?: SizeMode` - 当前模式
- `modes?: SizeMode[]` - 可选的尺寸模式列表
- `switcherStyle?: 'button' | 'select' | 'radio' | 'slider' | 'segmented'` - 切换器样式
- `showLabels?: boolean` - 是否显示标签
- `showIcons?: boolean` - 是否显示图标
- `showDescriptions?: boolean` - 是否显示描述
- `disabled?: boolean` - 是否禁用
- `size?: 'small' | 'medium' | 'large'` - 组件尺寸
- `animated?: boolean` - 是否启用动画

### SizeIndicator

尺寸指示器组件，显示当前尺寸信息。

```vue
<template>
  <SizeIndicator
    :show-mode="true"
    :show-scale="true"
    :show-icon="true"
    theme="auto"
  />
</template>
```

**Props：**

- `showMode?: boolean` - 是否显示模式名称
- `showScale?: boolean` - 是否显示比例信息
- `showIcon?: boolean` - 是否显示图标
- `size?: 'small' | 'medium' | 'large'` - 组件尺寸
- `theme?: 'light' | 'dark' | 'auto'` - 主题

### SizeControlPanel

综合控制面板组件，整合指示器和切换器。

```vue
<template>
  <SizeControlPanel
    :show-indicator="true"
    :show-switcher="true"
    :collapsible="true"
    position="top"
  />
</template>
```

**Props：**

- `mode?: SizeMode` - 当前模式
- `modes?: SizeMode[]` - 可选的尺寸模式列表
- `showIndicator?: boolean` - 是否显示指示器
- `showSwitcher?: boolean` - 是否显示切换器
- `switcherStyle?: string` - 切换器样式
- `showTitle?: boolean` - 是否显示标题
- `position?: 'top' | 'bottom' | 'left' | 'right' | 'inline'` - 面板位置
- `collapsible?: boolean` - 是否可折叠

## 🔌 插件系统

### VueSizePlugin

Vue 插件，提供全局尺寸管理功能。

```typescript
import { VueSizePlugin } from '@ldesign/size/vue'
import { createApp } from 'vue'

const app = createApp(App)

app.use(VueSizePlugin, {
  defaultMode: 'medium',
  autoInject: true,
  enableStorage: true,
})
```

**插件选项：**

```typescript
interface VueSizePluginOptions {
  /** 默认尺寸模式 */
  defaultMode?: SizeMode
  /** CSS变量前缀 */
  prefix?: string
  /** 是否自动注入CSS */
  autoInject?: boolean
  /** 是否启用本地存储 */
  enableStorage?: boolean
  /** 存储类型 */
  storageType?: 'localStorage' | 'sessionStorage' | 'memory'
}
```

### 便捷安装函数

```typescript
import { installSizePlugin, installWithPreset } from '@ldesign/size/vue'

// 使用默认配置
installSizePlugin(app)

// 使用预设配置
installWithPreset(app, 'responsive') // 响应式
installWithPreset(app, 'mobile') // 移动端优先
installWithPreset(app, 'desktop') // 桌面端优先
```

## 🎯 最佳实践

### 1. 全局配置

在应用入口文件中配置插件：

```typescript
import { VueSizePlugin } from '@ldesign/size/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(VueSizePlugin, {
  defaultMode: 'medium',
  autoInject: true,
  enableStorage: true,
})

app.mount('#app')
```

### 2. 组件中使用

```vue
<script setup>
import { SizeSwitcher, useSize, useSizeResponsive } from '@ldesign/size/vue'

const { currentMode, setMode } = useSize()
const { isSmall, isMedium } = useSizeResponsive()
</script>

<template>
  <div class="app">
    <!-- 尺寸切换器 -->
    <SizeSwitcher v-model:mode="currentMode" />

    <!-- 响应式内容 -->
    <div v-if="isSmall" class="mobile-layout">
      移动端布局
    </div>
    <div v-else class="desktop-layout">
      桌面端布局
    </div>
  </div>
</template>

<style>
.app {
  font-size: var(--ls-font-size-base);
  padding: var(--ls-spacing-base);
}
</style>
```

### 3. 类型安全

充分利用 TypeScript 类型定义：

```typescript
import type { SizeMode, UseSizeReturn } from '@ldesign/size/vue'

function handleSizeChange(mode: SizeMode) {
  console.log('尺寸变化:', mode)
}

const sizeApi: UseSizeReturn = useSize()
```

## 🔗 相关链接

- [核心 API 文档](./core.md)
- [类型定义](./types.md)
- [使用指南](../getting-started/vue-integration.md)
- [最佳实践](../best-practices/vue-best-practices.md)
