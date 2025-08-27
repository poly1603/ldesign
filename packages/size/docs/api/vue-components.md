# Vue 组件 API

本文档详细介绍了 **@ldesign/size** 提供的 Vue 组件。

## 🎛️ SizeSwitcher

尺寸切换器组件，提供多种样式的尺寸切换界面。

### 基础用法

```vue
<template>
  <SizeSwitcher />
</template>

<script setup>
import { SizeSwitcher } from '@ldesign/size/vue'
</script>
```

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `switcherStyle` | `SwitcherStyle` | `'button'` | 切换器样式 |
| `showIcons` | `boolean` | `false` | 是否显示图标 |
| `showLabels` | `boolean` | `true` | 是否显示标签 |
| `showDescriptions` | `boolean` | `false` | 是否显示描述 |
| `animated` | `boolean` | `true` | 是否启用动画 |
| `theme` | `Theme` | `'auto'` | 主题模式 |
| `size` | `ComponentSize` | `'medium'` | 组件尺寸 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `responsive` | `boolean` | `false` | 是否响应式 |

### SwitcherStyle 类型

```typescript
type SwitcherStyle =
  | 'button' // 按钮组样式
  | 'select' // 下拉选择器样式
  | 'radio' // 单选按钮样式
  | 'slider' // 滑块样式
  | 'segmented' // 分段控制器样式
```

### 样式示例

#### 按钮组样式

```vue
<SizeSwitcher
  switcher-style="button"
  :show-icons="true"
  :animated="true"
/>
```

#### 下拉选择器样式

```vue
<SizeSwitcher
  switcher-style="select"
  :show-descriptions="true"
/>
```

#### 滑块样式

```vue
<SizeSwitcher
  switcher-style="slider"
  :show-labels="false"
  :show-icons="true"
/>
```

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `change` | `(mode: SizeMode, event: SizeChangeEvent)` | 尺寸变化时触发 |
| `before-change` | `(mode: SizeMode)` | 尺寸变化前触发，返回 false 可阻止变化 |

### Slots

| 插槽 | 参数 | 说明 |
|------|------|------|
| `default` | `{ mode, isActive, onClick }` | 自定义切换器内容 |
| `icon` | `{ mode, isActive }` | 自定义图标 |
| `label` | `{ mode, isActive }` | 自定义标签 |
| `description` | `{ mode, isActive }` | 自定义描述 |

### 自定义示例

```vue
<template>
  <SizeSwitcher>
    <template #default="{ mode, isActive, onClick }">
      <button
        :class="{ active: isActive }"
        @click="onClick"
      >
        {{ getModeDisplayName(mode) }}
      </button>
    </template>
  </SizeSwitcher>
</template>
```

## 📊 SizeIndicator

尺寸指示器组件，显示当前尺寸状态。

### 基础用法

```vue
<template>
  <SizeIndicator />
</template>

<script setup>
import { SizeIndicator } from '@ldesign/size/vue'
</script>
```

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showMode` | `boolean` | `true` | 是否显示模式名称 |
| `showScale` | `boolean` | `false` | 是否显示缩放比例 |
| `showIcon` | `boolean` | `true` | 是否显示图标 |
| `format` | `IndicatorFormat` | `'text'` | 显示格式 |
| `position` | `Position` | `'top-right'` | 显示位置 |
| `theme` | `Theme` | `'auto'` | 主题模式 |
| `size` | `ComponentSize` | `'small'` | 组件尺寸 |

### IndicatorFormat 类型

```typescript
type IndicatorFormat =
  | 'text' // 纯文本
  | 'badge' // 徽章样式
  | 'chip' // 芯片样式
  | 'minimal' // 最小化样式
```

### Position 类型

```typescript
type Position =
  | 'top-left' | 'top-right' | 'top-center'
  | 'bottom-left' | 'bottom-right' | 'bottom-center'
  | 'center-left' | 'center-right'
  | 'static' // 静态定位
```

### 样式示例

```vue
<!-- 徽章样式 -->
<SizeIndicator
  format="badge"
  position="top-right"
  :show-scale="true"
/>

<!-- 最小化样式 -->
<SizeIndicator
  format="minimal"
  :show-mode="false"
  :show-icon="true"
/>
```

### Slots

| 插槽 | 参数 | 说明 |
|------|------|------|
| `default` | `{ mode, scale, config }` | 自定义指示器内容 |
| `icon` | `{ mode }` | 自定义图标 |
| `text` | `{ mode, scale }` | 自定义文本 |

## 🎛️ SizeControlPanel

尺寸控制面板组件，提供完整的尺寸控制界面。

### 基础用法

```vue
<template>
  <SizeControlPanel />
</template>

<script setup>
import { SizeControlPanel } from '@ldesign/size/vue'
</script>
```

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showSwitcher` | `boolean` | `true` | 是否显示切换器 |
| `showIndicator` | `boolean` | `true` | 是否显示指示器 |
| `showPreview` | `boolean` | `true` | 是否显示预览 |
| `showRecommendation` | `boolean` | `true` | 是否显示推荐 |
| `layout` | `PanelLayout` | `'vertical'` | 布局方向 |
| `collapsible` | `boolean` | `false` | 是否可折叠 |
| `defaultCollapsed` | `boolean` | `false` | 默认是否折叠 |

### PanelLayout 类型

```typescript
type PanelLayout = 'vertical' | 'horizontal' | 'grid'
```

### 完整示例

```vue
<template>
  <SizeControlPanel
    layout="grid"
    :collapsible="true"
    :show-recommendation="true"
    @size-change="handleSizeChange"
  >
    <template #header>
      <h3>尺寸设置</h3>
    </template>

    <template #footer>
      <button @click="resetToDefault">重置</button>
    </template>
  </SizeControlPanel>
</template>

<script setup>
const handleSizeChange = (mode) => {
  console.log('尺寸变更为:', mode)
}

const resetToDefault = () => {
  // 重置逻辑
}
</script>
```

## 🎨 主题和样式

### Theme 类型

```typescript
type Theme = 'light' | 'dark' | 'auto'
```

### ComponentSize 类型

```typescript
type ComponentSize = 'small' | 'medium' | 'large'
```

### CSS 变量

所有组件都支持通过CSS变量进行样式定制：

```css
.size-switcher {
  --size-switcher-bg: #ffffff;
  --size-switcher-border: #e0e0e0;
  --size-switcher-text: #333333;
  --size-switcher-active-bg: #1890ff;
  --size-switcher-active-text: #ffffff;
  --size-switcher-border-radius: 6px;
  --size-switcher-padding: 8px 12px;
  --size-switcher-transition: all 0.3s ease;
}

.size-indicator {
  --size-indicator-bg: rgba(0, 0, 0, 0.8);
  --size-indicator-text: #ffffff;
  --size-indicator-border-radius: 4px;
  --size-indicator-padding: 4px 8px;
  --size-indicator-font-size: 12px;
}
```

## 🔧 全局配置

### 注册组件

```typescript
import { VueSizePlugin } from '@ldesign/size/vue'
// main.ts
import { createApp } from 'vue'

const app = createApp(App)

app.use(VueSizePlugin, {
  // 全局组件配置
  globalComponents: true,
  componentPrefix: 'Ls',

  // 默认属性
  defaultProps: {
    SizeSwitcher: {
      animated: true,
      theme: 'auto'
    },
    SizeIndicator: {
      position: 'top-right',
      format: 'badge'
    }
  }
})
```

### 按需导入

```vue
<script setup>
// 按需导入组件
import { SizeSwitcher } from '@ldesign/size/vue'

// 或者导入所有组件
import * as SizeComponents from '@ldesign/size/vue'
</script>
```

## 🎯 最佳实践

### 1. 组件组合

```vue
<template>
  <div class="size-controls">
    <!-- 主要控制器 -->
    <SizeSwitcher
      switcher-style="segmented"
      :animated="true"
      @change="handleSizeChange"
    />

    <!-- 状态指示器 -->
    <SizeIndicator
      format="chip"
      :show-scale="true"
    />
  </div>
</template>
```

### 2. 响应式设计

```vue
<template>
  <SizeSwitcher
    :switcher-style="switcherStyle"
    :responsive="true"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints({
  mobile: 768,
  tablet: 1024
})

const switcherStyle = computed(() => {
  if (breakpoints.mobile.value) return 'select'
  if (breakpoints.tablet.value) return 'button'
  return 'segmented'
})
</script>
```

### 3. 自定义样式

```vue
<template>
  <SizeSwitcher class="custom-switcher" />
</template>

<style scoped>
.custom-switcher {
  --size-switcher-bg: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  --size-switcher-border-radius: 20px;
  --size-switcher-active-bg: rgba(255, 255, 255, 0.2);
}
</style>
```

## 🔗 相关链接

- [Vue Composables API](./vue-composables) - Vue Composition API 文档
- [核心 API](./core) - 核心功能 API
- [Vue 插件](../guide/vue-plugin) - Vue 插件使用指南
- [主题定制](../guide/theming) - 主题和样式定制
