# 设备检测和HTML渲染器优化

## 📱 概述

这个更新添加了强大的设备检测功能和HTML渲染器修复，确保Lottie动画在所有设备（PC、平板、手机）上都能以最佳性能和质量运行。

## ✨ 新功能

### 1. 自动设备检测

插件现在可以自动检测：
- **设备类型**：桌面、平板或移动设备
- **性能等级**：高、中、低
- **硬件信息**：CPU核心数、内存大小、设备像素比
- **功能支持**：WebGL、触摸屏、屏幕尺寸

### 2. HTML渲染器修复

修复了HTML渲染器的多个问题：
- 元素缩放和定位问题
- 透明度和变换性能
- 移动设备上的渲染卡顿
- 响应式布局适配

### 3. 智能优化

根据设备自动优化：
- **推荐渲染器**：根据设备性能选择最佳渲染器
- **自动降级**：低性能设备自动降低质量
- **响应式处理**：窗口大小变化时智能暂停/恢复
- **性能监控**：移动设备自动启用监控

## 🚀 使用方法

### 获取设备信息

```typescript
import { getDeviceInfo, getRecommendedConfig } from '@ldesign/lottie'

// 获取设备信息
const deviceInfo = getDeviceInfo()
console.log(deviceInfo)
// {
//   type: 'desktop' | 'tablet' | 'mobile',
//   performanceTier: 'high' | 'medium' | 'low',
//   isMobile: boolean,
//   isTablet: boolean,
//   isDesktop: boolean,
//   isTouch: boolean,
//   screenWidth: number,
//   screenHeight: number,
//   devicePixelRatio: number,
//   supportsWebGL: boolean,
//   hardwareConcurrency: number,
//   memory?: number
// }

// 获取推荐配置
const recommended = getRecommendedConfig()
console.log(recommended)
// {
//   renderer: 'svg' | 'canvas' | 'html',
//   quality: 'low' | 'medium' | 'high',
//   enableMonitoring: boolean,
//   targetFPS: number
// }
```

### 自动优化配置

```typescript
import { lottieManager } from '@ldesign/lottie'

// LottieManager 现在会自动检测设备并应用推荐配置
const instance = lottieManager.create({
  container: '#container',
  path: 'animation.json',
  // 如果不指定 renderer，将自动使用推荐的渲染器
  // 移动设备自动启用性能监控
})

// 手动获取设备信息
const deviceInfo = lottieManager.getDeviceInfo()

// 自动优化所有实例
const result = lottieManager.autoOptimize()
console.log(`优化了 ${result.optimized} 个实例，降级了 ${result.downgraded} 个实例`)
```

### 使用HTML渲染器（已修复）

```typescript
// HTML 渲染器现在包含自动修复
const instance = lottieManager.create({
  container: '#container',
  path: 'animation.json',
  renderer: 'html',
  rendererSettings: {
    className: 'lottie-html', // 自动应用修复样式
    hideOnTransparent: true
  }
})
```

在HTML中添加修复样式：

```html
<link rel="stylesheet" href="@ldesign/lottie/dist/styles/html-renderer-fix.css">

<div class="lottie-html-container">
  <div class="lottie-html" id="my-animation"></div>
</div>
```

### 响应式容器

```html
<!-- 1:1 正方形 -->
<div class="lottie-responsive">
  <div class="lottie-html" id="animation-1"></div>
</div>

<!-- 16:9 宽屏 -->
<div class="lottie-responsive lottie-responsive-16-9">
  <div class="lottie-html" id="animation-2"></div>
</div>

<!-- 4:3 标准 -->
<div class="lottie-responsive lottie-responsive-4-3">
  <div class="lottie-html" id="animation-3"></div>
</div>
```

### 高级设备检测

```typescript
import { DeviceDetector, ResponsiveObserver } from '@ldesign/lottie'

// 使用设备检测器
const detector = DeviceDetector.getInstance()
const info = detector.getInfo()

// 获取推荐设置
const renderer = detector.getRecommendedRenderer()
const quality = detector.getRecommendedQuality()
const fps = detector.getRecommendedFPS()

// 监听容器大小变化
const observer = new ResponsiveObserver()
observer.observe(container, ({ width, height }) => {
  console.log(`容器大小变化: ${width} x ${height}`)
  // 根据大小调整动画
})

// 停止监听
observer.unobserve(container)
```

## 🎨 CSS 类和样式

### 基础类

- `.lottie-html` - HTML渲染器容器基础类
- `.lottie-html-container` - flexbox布局容器
- `.lottie-responsive` - 响应式容器（1:1）
- `.lottie-responsive-16-9` - 响应式容器（16:9）
- `.lottie-responsive-4-3` - 响应式容器（4:3）

### 状态类

- `.lottie-loading` - 加载中状态（带动画）
- `.lottie-error` - 错误状态

## 🔧 渲染器推荐

### 桌面设备（高性能）
- **推荐**: SVG
- **原因**: 最高质量，可缩放，适合大屏幕

### 平板设备（中等性能）
- **推荐**: Canvas
- **原因**: 平衡性能和质量

### 移动设备（性能优先）
- **高性能手机**: Canvas
- **低性能手机**: HTML
- **原因**: Canvas性能好，HTML占用资源少

## 📊 性能优化建议

### 移动设备

1. **自动启用性能监控**
```typescript
const instance = lottieManager.create({
  container: '#container',
  path: 'animation.json',
  advanced: {
    enablePerformanceMonitor: true,
    targetFPS: 30 // 移动设备降低目标帧率
  }
})
```

2. **使用推荐渲染器**
```typescript
import { getRecommendedConfig } from '@ldesign/lottie'

const config = getRecommendedConfig()
const instance = lottieManager.create({
  container: '#container',
  path: 'animation.json',
  renderer: config.renderer // 自动选择最佳渲染器
})
```

3. **监听窗口变化**
- LottieManager 现在自动监听窗口大小变化
- 低性能设备在 resize 时自动暂停动画

### 低性能设备

1. **自动降级**
```typescript
// 自动优化所有实例
lottieManager.autoOptimize()
```

2. **降低质量**
```typescript
const instance = lottieManager.create({
  container: '#container',
  path: 'animation.json',
  rendererSettings: {
    progressiveLoad: false // 禁用渐进加载
  }
})
```

## 🎯 完整示例

查看 `examples/vanilla/device-responsive.html` 获取完整示例，包括：

- 设备信息展示
- 三种渲染器性能对比
- 实时性能监控
- 响应式容器示例
- 自动优化功能

## 🔍 调试和监控

### 查看设备信息

```typescript
const deviceInfo = lottieManager.getDeviceInfo()
console.log('设备类型:', deviceInfo.type)
console.log('性能等级:', deviceInfo.performanceTier)
console.log('推荐渲染器:', lottieManager.getRecommendedConfig().renderer)
```

### 监控性能

```typescript
// 所有移动设备自动启用性能监控
const instance = lottieManager.create({...})

// 获取性能指标
const metrics = instance.getMetrics()
console.log('FPS:', metrics.fps)
console.log('内存:', metrics.memory)

// 全局统计
const stats = lottieManager.getGlobalStats()
console.log('平均 FPS:', stats.averageFps)
console.log('总内存:', stats.totalMemory)
```

## 📱 媒体查询支持

CSS 文件包含针对不同设备的优化：

```css
/* 移动设备 */
@media (max-width: 768px) {
  .lottie-html {
    /* 性能优化 */
  }
}

/* 平板设备 */
@media (min-width: 769px) and (max-width: 1024px) {
  .lottie-html {
    /* 平衡质量和性能 */
  }
}

/* 桌面设备 */
@media (min-width: 1025px) {
  .lottie-html {
    /* 最高质量 */
  }
}

/* 触摸设备 */
@media (hover: none) and (pointer: coarse) {
  .lottie-html {
    /* 触摸优化 */
  }
}

/* 低动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .lottie-html {
    /* 禁用动画 */
  }
}
```

## 🚨 注意事项

1. **HTML 渲染器限制**
   - 不支持所有 After Effects 特性
   - 某些复杂动画可能显示不正确
   - 建议先测试，如有问题切换到 Canvas 或 SVG

2. **性能监控开销**
   - 监控本身会消耗少量性能
   - 低性能设备自动启用以便及时降级
   - 可以手动禁用：`enablePerformanceMonitor: false`

3. **自动优化**
   - `autoOptimize()` 会清理空闲实例
   - 低性能设备会自动降级渲染器
   - 建议在性能问题时手动调用

## 🎉 总结

新的设备检测和HTML渲染器修复功能让 Lottie 插件能够：

✅ 自动检测设备类型和性能
✅ 智能选择最佳渲染器
✅ 修复 HTML 渲染器的常见问题
✅ 提供响应式容器支持
✅ 自动优化低性能设备
✅ 实时性能监控和降级

现在你的 Lottie 动画可以在任何设备上完美运行！🚀
