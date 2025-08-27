# 基础用法

本指南将带你了解 **@ldesign/size** 的基础用法，从最简单的示例开始。

## 🚀 快速开始

### 1. 最简单的例子

```typescript
import { Size } from '@ldesign/size'

// 设置尺寸模式
Size.set('large')

// 获取当前模式
console.log(Size.get()) // 'large'

// 切换到下一个尺寸
Size.next()

// 监听尺寸变化
Size.watch((mode) => {
  console.log('尺寸变更为:', mode)
})
```

### 2. 在CSS中使用

```css
.my-component {
  /* 使用自动生成的CSS变量 */
  font-size: var(--ls-font-size);
  padding: var(--ls-spacing);
  border-radius: var(--ls-border-radius);

  /* 自动过渡动画 */
  transition: all var(--ls-transition-duration) ease-in-out;
}

.my-button {
  height: var(--ls-button-height);
  padding: var(--ls-button-padding);
  font-size: var(--ls-button-font-size);
}
```

## 🎯 核心概念

### 尺寸模式

@ldesign/size 提供三种预设的尺寸模式：

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| `small` | 小尺寸 | 移动设备、紧凑布局 |
| `medium` | 中等尺寸 | 桌面设备、标准布局 |
| `large` | 大尺寸 | 大屏设备、无障碍访问 |

### CSS 变量

每种尺寸模式都会生成对应的CSS变量：

```css
/* small 模式 */
--ls-font-size: 12px;
--ls-spacing: 6px;
--ls-border-radius: 3px;

/* medium 模式 */
--ls-font-size: 14px;
--ls-spacing: 8px;
--ls-border-radius: 4px;

/* large 模式 */
--ls-font-size: 16px;
--ls-spacing: 12px;
--ls-border-radius: 6px;
```

## 🔧 基础API

### Size 便捷对象

```typescript
import { Size } from '@ldesign/size'

// 设置模式
Size.set('large')
Size.setMode('medium')

// 获取模式
const current = Size.get()
const mode = Size.getCurrentMode()

// 切换模式
Size.next() // 切换到下一个
Size.previous() // 切换到上一个
Size.toggle() // 在small和large之间切换

// 智能功能
Size.auto() // 自动检测最佳尺寸
Size.reset() // 重置为推荐尺寸

// 监听变化
const unwatch = Size.watch((mode) => {
  console.log('新尺寸:', mode)
})

// 取消监听
unwatch()
```

### 全局尺寸管理器

```typescript
import { globalSizeManager } from '@ldesign/size'

// 设置模式
globalSizeManager.setMode('large')

// 获取配置
const config = globalSizeManager.getConfig()

// 生成CSS变量
const variables = globalSizeManager.generateCSSVariables()

// 注入CSS
globalSizeManager.injectCSS()

// 监听变化
const unsubscribe = globalSizeManager.onSizeChange((event) => {
  console.log('从', event.previousMode, '变更为', event.currentMode)
})
```

## 🎭 Vue 用法

### 组件使用

```vue
<template>
  <div>
    <!-- 基础切换器 -->
    <SizeSwitcher />

    <!-- 带图标的切换器 -->
    <SizeSwitcher
      :show-icons="true"
      :animated="true"
      theme="auto"
    />

    <!-- 下拉选择器样式 -->
    <SizeSwitcher switcher-style="select" />

    <!-- 滑块样式 -->
    <SizeSwitcher switcher-style="slider" />

    <!-- 尺寸指示器 -->
    <SizeIndicator :show-scale="true" />
  </div>
</template>

<script setup>
import { SizeSwitcher, SizeIndicator } from '@ldesign/size/vue'
</script>
```

### Composition API

```vue
<script setup>
import { useSize, useSizeResponsive } from '@ldesign/size/vue'

// 基础用法
const {
  currentMode,
  setMode,
  nextMode,
  previousMode
} = useSize()

// 响应式检查
const {
  isSmall,
  isMedium,
  isLarge,
  isAtLeast,
  isAtMost
} = useSizeResponsive()

// 切换尺寸
const handleSizeChange = (mode) => {
  setMode(mode)
}
</script>

<template>
  <div>
    <p>当前尺寸: {{ currentMode }}</p>

    <div v-if="isSmall">小屏幕内容</div>
    <div v-else-if="isMedium">中等屏幕内容</div>
    <div v-else-if="isLarge">大屏幕内容</div>

    <button @click="nextMode">下一个尺寸</button>
  </div>
</template>
```

## 📱 响应式设计

### 自动检测

```typescript
import { Size } from '@ldesign/size'

// 启用自动检测
Size.auto()

// 手动检测推荐尺寸
const recommended = Size.getRecommended()
console.log('推荐尺寸:', recommended)
```

### 媒体查询集成

```css
/* 结合媒体查询使用 */
@media (max-width: 768px) {
  :root {
    --ls-font-size: 12px;
    --ls-spacing: 6px;
  }
}

@media (min-width: 1200px) {
  :root {
    --ls-font-size: 18px;
    --ls-spacing: 16px;
  }
}
```

### Vue 响应式监听

```vue
<script setup>
import { useSmartSize } from '@ldesign/size/vue'

const {
  currentMode,
  recommendedMode,
  isUsingRecommended,
  resetToRecommended
} = useSmartSize({
  responsive: true,  // 启用响应式监听
  autoDetect: true   // 自动检测最佳尺寸
})
</script>
```

## 💾 持久化存储

### 自动保存用户偏好

```typescript
import { Size } from '@ldesign/size'

// 用户的选择会自动保存
Size.set('large') // 下次访问时会自动恢复为 'large'

// 检查是否有保存的偏好
if (Size.hasStoredPreference()) {
  console.log('用户之前选择了:', Size.getStoredPreference())
}

// 清除保存的偏好
Size.clearStoredPreference()
```

### Vue 中的记忆功能

```vue
<script setup>
import { useSmartSize } from '@ldesign/size/vue'

const { setMode, userPreferredMode } = useSmartSize({
  remember: true  // 启用记忆功能
})

// 设置并记住用户选择
const handleSizeChange = (mode) => {
  setMode(mode, true) // 第二个参数表示记住这个选择
}
</script>
```

## 🎬 动画效果

### CSS 过渡

```css
.my-element {
  /* 自动应用过渡动画 */
  transition: all var(--ls-transition-duration) ease-in-out;

  /* 或者自定义过渡 */
  transition: font-size 0.3s ease, padding 0.3s ease;
}
```

### Vue 动画 Hook

```vue
<script setup>
import { useSizeAnimation } from '@ldesign/size/vue'

const {
  isAnimating,
  setMode,
  setModeInstant
} = useSizeAnimation({
  duration: '0.5s',
  easing: 'ease-out'
})

// 带动画的切换
const animatedChange = async (mode) => {
  await setMode(mode)
  console.log('动画完成')
}

// 即时切换（无动画）
const instantChange = (mode) => {
  setModeInstant(mode)
}
</script>
```

## 🔍 调试和开发

### 开发模式

```typescript
import { Size } from '@ldesign/size'

// 启用调试模式
Size.debug(true)

// 查看当前状态
console.log(Size.getState())

// 查看生成的CSS变量
console.log(Size.getCSSVariables())
```

### 事件监听

```typescript
// 监听所有尺寸变化
Size.watch((mode, event) => {
  console.log('尺寸变化:', {
    from: event.previousMode,
    to: event.currentMode,
    timestamp: event.timestamp
  })
})

// 监听特定事件
Size.on('size:change', (event) => {
  console.log('尺寸变化事件:', event)
})

Size.on('size:inject', () => {
  console.log('CSS已注入')
})
```

## 🎯 下一步

现在你已经了解了基础用法，可以继续探索：

- [配置选项](./configuration) - 了解所有可用的配置选项
- [Vue 集成指南](../guide/vue-plugin) - 深入了解 Vue 集成
- [响应式设计](../guide/responsive) - 学习响应式设计最佳实践
- [API 参考](../api/) - 查看完整的 API 文档
