# 尺寸模式详解

尺寸模式是 @ldesign/size 的核心概念，它定义了不同的界面尺寸规格，让你的应用能够适应不同的用户需求和设备环境。

## 🎯 什么是尺寸模式

尺寸模式是一套预定义的界面尺寸规格，包含了字体大小、间距、组件尺寸等各种界面元素的配置。每个模式都经过精心设计，确保在不同场景下都能提供最佳的用户体验。

## 📏 内置尺寸模式

### Small (小尺寸)
- **适用场景**: 移动设备、紧凑界面、信息密集型应用
- **特点**: 节省空间、信息密度高、适合触摸操作
- **字体大小**: 12px - 14px
- **间距**: 紧凑型间距
- **组件高度**: 28px - 32px

```typescript
import { setGlobalSizeMode } from '@ldesign/size'

// 设置为小尺寸模式
setGlobalSizeMode('small')
```

### Medium (中等尺寸) - 默认
- **适用场景**: 桌面应用、平板设备、通用界面
- **特点**: 平衡的视觉效果、适中的信息密度
- **字体大小**: 14px - 16px
- **间距**: 标准间距
- **组件高度**: 32px - 36px

```typescript
// Medium 是默认模式，无需特别设置
// 或者显式设置
setGlobalSizeMode('medium')
```

### Large (大尺寸)
- **适用场景**: 大屏幕、老年用户、可访问性需求
- **特点**: 清晰易读、操作友好、视觉舒适
- **字体大小**: 16px - 18px
- **间距**: 宽松间距
- **组件高度**: 36px - 40px

```typescript
// 设置为大尺寸模式
setGlobalSizeMode('large')
```

### Extra Large (超大尺寸)
- **适用场景**: 超大屏幕、演示模式、特殊可访问性需求
- **特点**: 最大化可读性、最佳可访问性
- **字体大小**: 18px - 20px
- **间距**: 最宽松间距
- **组件高度**: 40px - 44px

```typescript
// 设置为超大尺寸模式
setGlobalSizeMode('extra-large')
```

## 🎨 尺寸模式配置

每个尺寸模式都包含完整的界面配置：

```typescript
interface SizeConfig {
  // 字体配置
  fontSize: string
  fontSizeSmall: string
  fontSizeLarge: string

  // 间距配置
  spacing: string
  spacingSmall: string
  spacingLarge: string

  // 组件配置
  buttonHeight: string
  inputHeight: string

  // 边框配置
  borderRadius: string
  borderWidth: string

  // 阴影配置
  boxShadow: string
}
```

## 🔄 动态切换模式

### 程序化切换

```typescript
import { getGlobalSizeMode, setGlobalSizeMode } from '@ldesign/size'

// 获取当前模式
const currentMode = getGlobalSizeMode() // 'medium'

// 切换到大尺寸
setGlobalSizeMode('large')

// 循环切换
const modes = ['small', 'medium', 'large', 'extra-large']
const currentIndex = modes.indexOf(currentMode)
const nextMode = modes[(currentIndex + 1) % modes.length]
setGlobalSizeMode(nextMode)
```

### 使用 Vue 组件

```vue
<script setup>
import { SizeIndicator, SizeSwitcher } from '@ldesign/size/vue'
</script>

<template>
  <div>
    <!-- 尺寸切换器 -->
    <SizeSwitcher
      :modes="['small', 'medium', 'large']"
      switcher-style="segmented"
      show-icons
      animated
    />

    <!-- 尺寸指示器 -->
    <SizeIndicator
      show-mode
      show-scale
      format="badge"
      position="top-right"
    />
  </div>
</template>
```

## 🎯 智能模式推荐

系统可以根据设备特征自动推荐合适的尺寸模式：

```typescript
import { getRecommendedSizeMode, resetToRecommended } from '@ldesign/size'

// 获取推荐模式
const recommended = getRecommendedSizeMode()
console.log(`推荐使用: ${recommended}`)

// 重置为推荐模式
resetToRecommended()
```

推荐逻辑：
- **移动设备**: 自动推荐 `small` 模式
- **平板设备**: 自动推荐 `medium` 模式
- **桌面设备**: 根据屏幕尺寸推荐 `medium` 或 `large`
- **大屏设备**: 推荐 `large` 或 `extra-large` 模式

## 🔧 自定义尺寸模式

你可以扩展或自定义尺寸模式：

```typescript
import { createSizeManager } from '@ldesign/size'

// 创建自定义配置
const customConfig = {
  'extra-small': {
    fontSize: '11px',
    spacing: '6px',
    buttonHeight: '24px',
    // ... 其他配置
  },
  'huge': {
    fontSize: '22px',
    spacing: '32px',
    buttonHeight: '48px',
    // ... 其他配置
  }
}

// 创建自定义管理器
const sizeManager = createSizeManager({
  customSizes: customConfig,
  defaultMode: 'extra-small'
})
```

## 📱 响应式尺寸

结合响应式设计，实现自适应尺寸：

```typescript
import { createResponsiveSizeWatcher } from '@ldesign/size'

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

// 清理监听器
unwatch()
```

## 🎨 主题集成

尺寸模式可以与主题系统完美集成：

```css
/* 根据尺寸模式调整样式 */
.my-component {
  padding: var(--ls-spacing);
  font-size: var(--ls-font-size);
  border-radius: var(--ls-border-radius);
}

/* 特定模式的样式覆盖 */
[data-size-mode="small"] .my-component {
  /* 小尺寸特定样式 */
}

[data-size-mode="large"] .my-component {
  /* 大尺寸特定样式 */
}
```

## 🚀 最佳实践

### 1. 渐进式采用
从关键组件开始，逐步扩展到整个应用：

```typescript
// 先在关键组件中使用
import { useSize } from '@ldesign/size/vue'

export default {
  setup() {
    const { currentConfig } = useSize()
    return { currentConfig }
  }
}
```

### 2. 用户偏好记忆
保存用户的尺寸偏好：

```typescript
import { onGlobalSizeChange } from '@ldesign/size'

// 监听变化并保存
onGlobalSizeChange((event) => {
  localStorage.setItem('preferred-size', event.currentMode)
})

// 应用启动时恢复
const savedSize = localStorage.getItem('preferred-size')
if (savedSize) {
  setGlobalSizeMode(savedSize)
}
```

### 3. 可访问性考虑
为有特殊需求的用户提供快速切换：

```vue
<script setup>
import { useSize } from '@ldesign/size/vue'

const { currentMode, setMode } = useSize()

function toggleLargeMode() {
  setMode(currentMode.value === 'large' ? 'medium' : 'large')
}
</script>

<template>
  <div>
    <!-- 可访问性快捷按钮 -->
    <button aria-label="切换大字体模式" @click="toggleLargeMode">
      🔍 大字体
    </button>
  </div>
</template>
```

## 🔍 调试和开发

在开发过程中，你可以使用调试工具：

```typescript
// 开发模式下显示尺寸信息
if (process.env.NODE_ENV === 'development') {
  import('@ldesign/size').then(({ SizeDebugger }) => {
    new SizeDebugger().enable()
  })
}
```

通过合理使用尺寸模式，你可以创建出既美观又实用的用户界面，满足不同用户群体的需求。
