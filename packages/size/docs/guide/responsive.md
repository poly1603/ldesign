# 响应式设计指南

@ldesign/size 提供了强大的响应式功能，让你的应用能够智能地适应不同的设备和屏幕尺寸，为用户提供最佳的体验。

## 🎯 响应式设计理念

响应式尺寸设计不仅仅是简单的屏幕适配，而是基于用户行为和设备特征的智能化界面调整：

- **设备感知**: 自动识别移动设备、平板、桌面等不同设备类型
- **屏幕适配**: 根据屏幕尺寸和分辨率选择最佳尺寸模式
- **用户偏好**: 记住用户的个性化设置，提供一致的体验
- **性能优化**: 智能加载和切换，确保流畅的用户体验

## 📱 设备检测与适配

### 自动设备检测

```typescript
import {
  detectPreferredSizeMode,
  getRecommendedSizeMode,
  isLargeScreen,
  isMediumScreen,
  isSmallScreen
} from '@ldesign/size'

// 自动检测推荐的尺寸模式
const recommendedMode = detectPreferredSizeMode()
console.log(`推荐模式: ${recommendedMode}`)

// 检查屏幕尺寸类型
if (isSmallScreen()) {
  console.log('当前是小屏幕设备')
}
else if (isMediumScreen()) {
  console.log('当前是中等屏幕设备')
}
else if (isLargeScreen()) {
  console.log('当前是大屏幕设备')
}
```

### 设备特征判断

```typescript
import { getDeviceInfo } from '@ldesign/size'

const deviceInfo = getDeviceInfo()
console.log('设备信息:', deviceInfo)
// {
//   type: 'mobile' | 'tablet' | 'desktop',
//   screenWidth: number,
//   screenHeight: number,
//   pixelRatio: number,
//   isTouchDevice: boolean,
//   orientation: 'portrait' | 'landscape'
// }
```

## 🔄 响应式监听器

### 创建响应式监听器

```typescript
import { createResponsiveSizeWatcher } from '@ldesign/size'

// 创建响应式监听器
const unwatch = createResponsiveSizeWatcher({
  // 断点配置
  breakpoints: {
    mobile: 768, // 移动设备断点
    tablet: 1024, // 平板设备断点
    desktop: 1440, // 桌面设备断点
    large: 1920 // 大屏设备断点
  },

  // 模式映射
  modes: {
    mobile: 'small',
    tablet: 'medium',
    desktop: 'large',
    large: 'extra-large'
  },

  // 配置选项
  debounce: 300, // 防抖延迟
  immediate: true, // 立即执行

  // 变化回调
  onChange: (mode, deviceInfo) => {
    console.log(`尺寸模式切换到: ${mode}`, deviceInfo)
  }
})

// 清理监听器
unwatch()
```

### Vue 响应式集成

```vue
<script setup>
import { SizeSwitcher, useSizeResponsive } from '@ldesign/size/vue'
import { computed } from 'vue'

// 使用响应式 hook
const {
  isSmall,
  isMedium,
  isLarge,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  isAtLeast,
  isAtMost
} = useSizeResponsive()

// 计算可用模式
const availableModes = computed(() => {
  if (isSmallScreen.value) {
    return ['small', 'medium']
  }
  else if (isMediumScreen.value) {
    return ['small', 'medium', 'large']
  }
  else {
    return ['small', 'medium', 'large', 'extra-large']
  }
})

// 响应式样式类
const responsiveClasses = computed(() => ({
  'content--small': isSmall.value,
  'content--medium': isMedium.value,
  'content--large': isLarge.value,
  'content--mobile': isSmallScreen.value,
  'content--desktop': isLargeScreen.value
}))

// 响应式内容
const title = computed(() => {
  if (isSmallScreen.value) {
    return '移动版标题'
  }
  else if (isLargeScreen.value) {
    return '桌面版详细标题'
  }
  else {
    return '标准标题'
  }
})

const description = computed(() => {
  return isAtLeast('medium')
    ? '这是详细的描述内容，适合中等及以上尺寸显示。'
    : '简化描述'
})
</script>

<template>
  <div class="responsive-container">
    <!-- 响应式组件 -->
    <SizeSwitcher
      v-if="!isSmallScreen"
      :modes="availableModes"
      switcher-style="segmented"
    />

    <!-- 移动端简化版 -->
    <SizeSwitcher
      v-else
      :modes="['small', 'medium']"
      switcher-style="select"
    />

    <!-- 响应式内容 -->
    <div class="content" :class="responsiveClasses">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<style scoped>
.responsive-container {
  padding: var(--ls-spacing);
}

.content {
  transition: all 0.3s ease;
}

.content--small {
  font-size: var(--ls-font-size-small);
}

.content--large {
  font-size: var(--ls-font-size-large);
}

.content--mobile {
  max-width: 100%;
}

.content--desktop {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

## 📐 断点系统

### 默认断点

```typescript
const defaultBreakpoints = {
  xs: 0, // 超小屏幕
  sm: 576, // 小屏幕
  md: 768, // 中等屏幕
  lg: 992, // 大屏幕
  xl: 1200, // 超大屏幕
  xxl: 1400 // 超超大屏幕
}
```

### 自定义断点

```typescript
import { createSizeManager } from '@ldesign/size'

const sizeManager = createSizeManager({
  responsive: {
    breakpoints: {
      mobile: 480,
      tablet: 768,
      laptop: 1024,
      desktop: 1440,
      ultrawide: 2560
    },
    modes: {
      mobile: 'small',
      tablet: 'medium',
      laptop: 'medium',
      desktop: 'large',
      ultrawide: 'extra-large'
    }
  }
})
```

## 🎨 响应式样式

### CSS 媒体查询集成

```css
/* 基础响应式样式 */
.component {
  padding: var(--ls-spacing);
  font-size: var(--ls-font-size);
}

/* 小屏幕优化 */
@media (max-width: 768px) {
  [data-size-mode="medium"] .component,
  [data-size-mode="large"] .component {
    /* 在小屏幕上强制使用紧凑样式 */
    padding: var(--ls-spacing-small);
    font-size: var(--ls-font-size-small);
  }
}

/* 大屏幕优化 */
@media (min-width: 1440px) {
  [data-size-mode="medium"] .component {
    /* 在大屏幕上自动升级样式 */
    padding: var(--ls-spacing-large);
    font-size: var(--ls-font-size-large);
  }
}
```

### 动态样式计算

```typescript
import { useSize } from '@ldesign/size/vue'
import { computed } from 'vue'

export default {
  setup() {
    const { currentMode, currentConfig } = useSize()

    // 响应式样式计算
    const dynamicStyles = computed(() => {
      const baseSize = Number.parseInt(currentConfig.value.fontSize)

      return {
        '--dynamic-font-size': `${baseSize}px`,
        '--dynamic-line-height': `${baseSize * 1.5}px`,
        '--dynamic-padding': `${baseSize * 0.5}px ${baseSize}px`,
        '--dynamic-margin': `${baseSize * 0.75}px`
      }
    })

    return { dynamicStyles }
  }
}
```

## 🔄 方向变化处理

### 屏幕方向监听

```typescript
import { createOrientationWatcher } from '@ldesign/size'

const unwatchOrientation = createOrientationWatcher({
  onChange: (orientation, dimensions) => {
    console.log(`屏幕方向: ${orientation}`, dimensions)

    // 根据方向调整尺寸模式
    if (orientation === 'landscape' && dimensions.width < 1024) {
      // 横屏小设备，使用中等尺寸
      setGlobalSizeMode('medium')
    }
    else if (orientation === 'portrait' && dimensions.width < 768) {
      // 竖屏小设备，使用小尺寸
      setGlobalSizeMode('small')
    }
  }
})
```

### Vue 方向响应

```vue
<script setup>
import { useOrientation } from '@ldesign/size/vue'

const {
  isPortrait,
  isLandscape,
  orientation,
  dimensions
} = useOrientation()

const orientationClasses = computed(() => ({
  'layout--portrait': isPortrait.value,
  'layout--landscape': isLandscape.value
}))
</script>

<template>
  <div :class="orientationClasses">
    <SizeSwitcher
      :layout="isLandscape ? 'horizontal' : 'vertical'"
      :size="isPortrait && isSmallScreen ? 'small' : 'medium'"
    />
  </div>
</template>
```

## 🚀 性能优化

### 懒加载响应式功能

```typescript
// 按需加载响应式功能
async function enableResponsive() {
  const { createResponsiveSizeWatcher } = await import('@ldesign/size/responsive')

  return createResponsiveSizeWatcher({
    // 配置...
  })
}

// 仅在需要时启用
if (window.innerWidth < 1024) {
  enableResponsive()
}
```

### 防抖优化

```typescript
import { debounce } from '@ldesign/size/utils'

// 防抖的尺寸变化处理
const debouncedSizeChange = debounce((newMode) => {
  // 执行尺寸变化逻辑
  console.log('尺寸模式变化:', newMode)
}, 300)

// 监听变化
onGlobalSizeChange(debouncedSizeChange)
```

## 🎯 最佳实践

### 1. 渐进增强策略

```typescript
// 基础功能
setGlobalSizeMode('medium')

// 渐进增强
if ('matchMedia' in window) {
  // 支持媒体查询的设备
  enableResponsiveFeatures()
}

if ('ResizeObserver' in window) {
  // 支持 ResizeObserver 的设备
  enableAdvancedResponsive()
}
```

### 2. 用户偏好优先

```typescript
// 检查用户偏好
const userPreference = getUserSizePreference()
const systemRecommendation = getRecommendedSizeMode()

// 优先使用用户偏好，回退到系统推荐
const finalMode = userPreference || systemRecommendation
setGlobalSizeMode(finalMode)
```

### 3. 平滑过渡

```css
/* 为所有尺寸变化添加过渡效果 */
* {
  transition:
    font-size 0.3s ease,
    padding 0.3s ease,
    margin 0.3s ease,
    border-radius 0.3s ease;
}

/* 减少动画以提升性能 */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
  }
}
```

通过合理使用响应式功能，你可以创建出真正适应各种设备和用户需求的现代化应用界面。
