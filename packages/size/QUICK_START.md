# @ldesign/size 快速开始

## 🚀 5 分钟上手

### 1. 安装

```bash
pnpm add @ldesign/size
# 或
npm install @ldesign/size
# 或
yarn add @ldesign/size
```

### 2. 基础使用

```typescript
import { globalSizeManager } from '@ldesign/size'

// 设置尺寸模式
globalSizeManager.setMode('large')

// 监听变化
globalSizeManager.onSizeChange((event) => {
  console.log('尺寸变化:', event.currentMode)
})
```

### 3. Vue 项目使用

```typescript
// main.ts
import { createApp } from 'vue'
import { VueSizePlugin } from '@ldesign/size/vue'
import App from './App.vue'

const app = createApp(App)
app.use(VueSizePlugin, {
  defaultMode: 'medium',
  autoInject: true,
})
app.mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { useSize } from '@ldesign/size/vue'

const { currentMode, setMode } = useSize()
</script>

<template>
  <div>
    <p>当前模式: {{ currentMode }}</p>
    <button @click="setMode('small')">小</button>
    <button @click="setMode('medium')">中</button>
    <button @click="setMode('large')">大</button>
  </div>
</template>
```

## 🎨 使用新功能

### 性能监控

```typescript
import { globalPerformanceMonitor } from '@ldesign/size'

// 启用监控
globalPerformanceMonitor.enable()

// 查看报告
globalPerformanceMonitor.printReport()

// 获取指标
const metrics = globalPerformanceMonitor.getMetrics()
console.log('CSS 注入次数:', metrics.cssInjectionCount)
```

### 预设管理

```typescript
import { globalPresetManager } from '@ldesign/size'

// 应用内置预设
globalPresetManager.apply('compact', 'medium')    // 紧凑
globalPresetManager.apply('comfortable', 'large') // 舒适
globalPresetManager.apply('presentation', 'extra-large') // 演示

// 创建自定义预设
globalPresetManager.register({
  name: 'my-preset',
  description: '我的预设',
  config: {
    medium: {
      fontSize: { base: '16px' },
      spacing: { base: '16px' },
    },
  },
})
```

### 动画效果

```typescript
import { globalAnimationManager } from '@ldesign/size'

// 应用动画预设
globalAnimationManager.applyPreset('smooth')  // 平滑
globalAnimationManager.applyPreset('bounce')  // 弹跳
globalAnimationManager.applyPreset('elastic') // 弹性

// 自定义动画
globalAnimationManager.updateOptions({
  duration: 500,
  easing: 'ease-in-out',
})
```

### 响应式适配

```typescript
import { createResponsiveSize } from '@ldesign/size'

// 自动适配设备
const responsive = createResponsiveSize({
  autoApply: true,
  onChange: (mode) => {
    console.log('推荐模式:', mode)
  },
})
```

## 💡 常见场景

### 场景 1: 用户偏好保存

```typescript
import { globalSizeManager } from '@ldesign/size'

// 恢复用户偏好
const savedMode = localStorage.getItem('user-size-mode')
if (savedMode) {
  globalSizeManager.setMode(savedMode as any)
}

// 保存用户选择
globalSizeManager.onSizeChange((event) => {
  localStorage.setItem('user-size-mode', event.currentMode)
})
```

### 场景 2: 移动端适配

```typescript
import { createResponsiveSize, isMobileDevice } from '@ldesign/size'

if (isMobileDevice()) {
  // 移动端使用小尺寸
  globalSizeManager.setMode('small')
} else {
  // 桌面端使用响应式
  createResponsiveSize({ autoApply: true })
}
```

### 场景 3: 主题切换

```typescript
import { globalPresetManager, globalSizeManager } from '@ldesign/size'

function switchTheme(theme: 'light' | 'dark', preset: string) {
  // 应用预设
  globalPresetManager.apply(preset, globalSizeManager.getCurrentMode())
  
  // 切换主题
  document.documentElement.setAttribute('data-theme', theme)
}

// 使用
switchTheme('dark', 'comfortable')
```

### 场景 4: 性能优化

```typescript
import { globalPerformanceMonitor, globalCSSVariableCache } from '@ldesign/size'

// 开发环境监控
if (process.env.NODE_ENV === 'development') {
  globalPerformanceMonitor.enable()
  
  setInterval(() => {
    const stats = globalCSSVariableCache.getStats()
    console.log('缓存命中率:', stats.hitRate)
  }, 5000)
}
```

## 🎯 最佳实践

### 1. 使用全局管理器

```typescript
// ✅ 推荐
import { globalSizeManager } from '@ldesign/size'
globalSizeManager.setMode('large')

// ❌ 不推荐（除非需要多个实例）
import { createSizeManager } from '@ldesign/size'
const manager = createSizeManager()
```

### 2. 启用缓存

```typescript
// ✅ 默认已启用，无需额外配置
import { globalCSSVariableCache } from '@ldesign/size'
console.log('缓存已启用:', globalCSSVariableCache.getStats().enabled)
```

### 3. 使用动画提升体验

```typescript
// ✅ 推荐
import { globalAnimationManager } from '@ldesign/size'
globalAnimationManager.applyPreset('smooth')
```

### 4. 响应式适配

```typescript
// ✅ 推荐
import { createResponsiveSize } from '@ldesign/size'
createResponsiveSize({ autoApply: true })
```

## 📚 更多资源

- [完整文档](./README.md)
- [API 文档](./docs/api/README.md)
- [高级使用](./docs/examples/advanced-usage.md)
- [优化总结](./OPTIMIZATION_SUMMARY.md)
- [最终报告](./FINAL_OPTIMIZATION_REPORT.md)

## 🆘 常见问题

### Q: 如何查看性能？
```typescript
import { globalPerformanceMonitor } from '@ldesign/size'
globalPerformanceMonitor.printReport()
```

### Q: 如何自定义预设？
```typescript
import { globalPresetManager } from '@ldesign/size'
globalPresetManager.register({
  name: 'my-preset',
  config: { /* 配置 */ },
})
```

### Q: 如何禁用动画？
```typescript
import { globalAnimationManager } from '@ldesign/size'
globalAnimationManager.disable()
```

### Q: 如何清空缓存？
```typescript
import { globalCSSVariableCache } from '@ldesign/size'
globalCSSVariableCache.clear()
```

## 🎉 开始使用

现在你已经掌握了基础用法，可以开始在项目中使用 `@ldesign/size` 了！

如果遇到问题，请查看[完整文档](./README.md)或提交 [Issue](https://github.com/ldesign/ldesign/issues)。

