# 高级使用示例

本文档展示 `@ldesign/size` 的高级功能和最佳实践。

## 📊 性能监控

### 基础监控

```typescript
import { globalPerformanceMonitor } from '@ldesign/size'

// 启用性能监控
globalPerformanceMonitor.enable()

// 获取性能指标
const metrics = globalPerformanceMonitor.getMetrics()
console.log('CSS 注入次数:', metrics.cssInjectionCount)
console.log('模式切换次数:', metrics.modeSwitchCount)
console.log('内存使用:', metrics.estimatedMemoryUsage)

// 获取平均性能
const averages = globalPerformanceMonitor.getAveragePerformance()
console.log('平均 CSS 注入时间:', averages.avgCssInjectionTime, 'ms')
console.log('平均模式切换时间:', averages.avgModeSwitchTime, 'ms')
```

### 性能报告

```typescript
import { globalPerformanceMonitor } from '@ldesign/size'

// 打印完整报告
globalPerformanceMonitor.printReport()

// 导出为 JSON
const json = globalPerformanceMonitor.exportToJSON()
console.log(json)

// 定期监控
setInterval(() => {
  const report = globalPerformanceMonitor.getReport()
  if (report.averages.avgCssInjectionTime > 5) {
    console.warn('CSS 注入性能下降！')
  }
}, 5000)
```

## 💾 缓存管理

### 查看缓存状态

```typescript
import { globalCSSVariableCache, globalConfigCache } from '@ldesign/size'

// CSS 变量缓存统计
const cssStats = globalCSSVariableCache.getStats()
console.log('CSS 缓存大小:', cssStats.size)
console.log('CSS 缓存命中率:', cssStats.hitRate)

// 配置缓存统计
const configStats = globalConfigCache.getStats()
console.log('配置缓存命中率:', configStats.hitRate)
```

### 手动管理缓存

```typescript
import { globalCSSVariableCache } from '@ldesign/size'

// 清空缓存
globalCSSVariableCache.clear()

// 禁用缓存（不推荐）
globalCSSVariableCache.disable()

// 重新启用
globalCSSVariableCache.enable()
```

## 🎨 预设管理

### 使用内置预设

```typescript
import { globalPresetManager, globalSizeManager } from '@ldesign/size'

// 应用紧凑预设
const compactConfig = globalPresetManager.apply('compact', 'medium')
console.log('紧凑模式字体大小:', compactConfig.fontSize.base)

// 应用舒适预设
const comfortableConfig = globalPresetManager.apply('comfortable', 'large')

// 应用演示预设
const presentationConfig = globalPresetManager.apply('presentation', 'extra-large')

// 获取所有预设
const allPresets = globalPresetManager.getAll()
allPresets.forEach(preset => {
  console.log(`预设: ${preset.name} - ${preset.description}`)
})
```

### 创建自定义预设

```typescript
import { globalPresetManager } from '@ldesign/size'

// 注册自定义预设
globalPresetManager.register({
  name: 'my-brand',
  description: '品牌定制预设',
  config: {
    medium: {
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        xxl: '24px',
        h1: '32px',
        h2: '28px',
        h3: '24px',
        h4: '20px',
        h5: '18px',
        h6: '16px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        base: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
    },
    large: {
      fontSize: {
        base: '18px',
        lg: '20px',
        xl: '24px',
      },
    },
  },
  tags: ['custom', 'brand'],
})

// 应用自定义预设
const myConfig = globalPresetManager.apply('my-brand', 'medium')
```

### 根据标签查找预设

```typescript
import { globalPresetManager } from '@ldesign/size'

// 查找所有紧凑型预设
const compactPresets = globalPresetManager.getByTag('compact')

// 查找所有阅读型预设
const readingPresets = globalPresetManager.getByTag('reading')
```

## 🎬 动画效果

### 使用动画预设

```typescript
import { globalAnimationManager, globalSizeManager } from '@ldesign/size'

// 应用平滑动画
globalAnimationManager.applyPreset('smooth')

// 应用弹跳动画
globalAnimationManager.applyPreset('bounce')

// 应用弹性动画
globalAnimationManager.applyPreset('elastic')

// 应用弹簧动画
globalAnimationManager.applyPreset('spring')

// 切换模式时会自动应用动画
await globalSizeManager.setMode('large')
```

### 自定义动画

```typescript
import { globalAnimationManager } from '@ldesign/size'

// 自定义动画参数
globalAnimationManager.updateOptions({
  duration: 600,
  easing: 'cubic-bezier',
  cubicBezier: [0.68, -0.55, 0.265, 1.55],
  delay: 100,
})

// 监听动画进度
const unsubscribe = globalAnimationManager.onProgress((state) => {
  console.log('动画进度:', state.progress)
  console.log('是否正在动画:', state.isAnimating)
})

// 手动开始动画
await globalAnimationManager.start()

// 停止动画
globalAnimationManager.stop()

// 取消监听
unsubscribe()
```

### 生成 CSS 过渡

```typescript
import { globalAnimationManager } from '@ldesign/size'

// 生成 CSS 过渡字符串
const transition = globalAnimationManager.toCSSTransition(['font-size', 'padding'])
console.log(transition)
// 输出: "font-size 300ms ease-in-out 0ms, padding 300ms ease-in-out 0ms"

// 应用到元素
const element = document.querySelector('.my-element')
element.style.transition = transition
```

## 📱 响应式尺寸管理

### 自动响应式

```typescript
import { createResponsiveSize } from '@ldesign/size'

// 创建响应式管理器，自动应用推荐尺寸
const responsive = createResponsiveSize({
  autoApply: true,
  onChange: (mode) => {
    console.log('推荐尺寸模式:', mode)
  },
})

// 获取当前推荐模式
const recommended = responsive.getCurrentRecommended()
console.log('当前推荐:', recommended)

// 停止响应式监听
responsive.unsubscribe()
```

### 手动响应式

```typescript
import { createResponsiveSize, globalSizeManager } from '@ldesign/size'

// 只监听不自动应用
const responsive = createResponsiveSize({
  autoApply: false,
  onChange: (recommendedMode) => {
    // 询问用户是否切换
    if (confirm(`检测到推荐尺寸为 ${recommendedMode}，是否切换？`)) {
      globalSizeManager.setMode(recommendedMode)
    }
  },
})
```

## 🔄 完整示例：智能尺寸系统

```typescript
import {
  createResponsiveSize,
  globalAnimationManager,
  globalPerformanceMonitor,
  globalPresetManager,
  globalSizeManager,
} from '@ldesign/size'

// 1. 启用性能监控（开发环境）
if (process.env.NODE_ENV === 'development') {
  globalPerformanceMonitor.enable()
}

// 2. 应用预设
const userPreset = localStorage.getItem('user-preset') || 'default'
globalPresetManager.apply(userPreset, 'medium')

// 3. 配置动画
globalAnimationManager.applyPreset('smooth')

// 4. 启用响应式
const responsive = createResponsiveSize({
  autoApply: true,
  onChange: (mode) => {
    console.log('自动切换到:', mode)
  },
})

// 5. 监听尺寸变化
globalSizeManager.onSizeChange((event) => {
  console.log('尺寸变化:', event.previousMode, '->', event.currentMode)
  
  // 保存用户偏好
  localStorage.setItem('user-size-mode', event.currentMode)
  
  // 上报分析
  analytics.track('size_changed', {
    from: event.previousMode,
    to: event.currentMode,
  })
})

// 6. 定期检查性能
setInterval(() => {
  const report = globalPerformanceMonitor.getReport()
  
  if (report.averages.avgCssInjectionTime > 10) {
    console.warn('性能警告：CSS 注入时间过长')
  }
  
  if (report.metrics.estimatedMemoryUsage > 500000) {
    console.warn('内存警告：内存使用过高')
  }
}, 30000)

// 7. 初始化
async function initSizeSystem() {
  // 恢复用户偏好
  const savedMode = localStorage.getItem('user-size-mode')
  if (savedMode) {
    await globalSizeManager.setMode(savedMode as any)
  }
  
  // 初始化完成
  console.log('尺寸系统初始化完成')
}

initSizeSystem()
```

## 🎯 Vue 集成示例

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useSize, useSizeAnimation } from '@ldesign/size/vue'
import { globalPresetManager, globalPerformanceMonitor } from '@ldesign/size'

// 使用尺寸管理
const { currentMode, setMode } = useSize({ global: true })

// 使用动画
const { setMode: setModeWithAnimation, isAnimating } = useSizeAnimation({
  duration: '500ms',
  easing: 'ease-in-out',
})

// 应用预设
function applyPreset(presetName: string) {
  globalPresetManager.apply(presetName, currentMode.value)
  // 触发重新注入
  setMode(currentMode.value)
}

// 查看性能
function showPerformance() {
  globalPerformanceMonitor.printReport()
}

onMounted(() => {
  // 启用性能监控
  globalPerformanceMonitor.enable()
})
</script>

<template>
  <div>
    <h2>当前模式: {{ currentMode }}</h2>
    
    <div>
      <button @click="setModeWithAnimation('small')">小</button>
      <button @click="setModeWithAnimation('medium')">中</button>
      <button @click="setModeWithAnimation('large')">大</button>
    </div>
    
    <div v-if="isAnimating">动画中...</div>
    
    <div>
      <button @click="applyPreset('compact')">紧凑预设</button>
      <button @click="applyPreset('comfortable')">舒适预设</button>
      <button @click="applyPreset('presentation')">演示预设</button>
    </div>
    
    <button @click="showPerformance">查看性能</button>
  </div>
</template>
```

## 🔧 最佳实践

### 1. 性能优化

```typescript
// ✅ 推荐：使用缓存（默认启用）
import { globalCSSVariableCache } from '@ldesign/size'
globalCSSVariableCache.enable()

// ✅ 推荐：在开发环境启用性能监控
if (process.env.NODE_ENV === 'development') {
  globalPerformanceMonitor.enable()
}

// ❌ 不推荐：频繁切换模式
// 应该使用防抖或节流
import { debounce } from '@ldesign/size/utils'
const debouncedSetMode = debounce(globalSizeManager.setMode, 300)
```

### 2. 用户体验

```typescript
// ✅ 推荐：使用动画提升体验
globalAnimationManager.applyPreset('smooth')

// ✅ 推荐：保存用户偏好
globalSizeManager.onSizeChange((event) => {
  localStorage.setItem('user-size-mode', event.currentMode)
})

// ✅ 推荐：响应式适配
createResponsiveSize({ autoApply: true })
```

### 3. 错误处理

```typescript
// ✅ 推荐：捕获错误
try {
  await globalSizeManager.setMode('invalid' as any)
} catch (error) {
  console.error('设置尺寸失败:', error)
  // 回退到默认模式
  await globalSizeManager.setMode('medium')
}
```

## 📚 更多资源

- [API 文档](../api/README.md)
- [核心概念](../guide/concepts.md)
- [最佳实践](../best-practices/README.md)
- [性能优化](../guide/performance.md)

