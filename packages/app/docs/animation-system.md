# ✨ 动画系统设计

## 📖 概述

LDesign App 集成了完整的动画系统，通过 CSS 动画和过渡效果提升用户体验。动画系统遵循现代 Web 设计原则
，注重性能和可访问性。

## 🎯 设计原则

### 1. 性能优先

- 使用 CSS 动画而非 JavaScript 动画
- 优先使用 `transform` 和 `opacity` 属性
- 避免触发重排和重绘的属性

### 2. 用户体验

- 动画时长适中（200-800ms）
- 缓动函数自然（ease-out, ease-in-out）
- 提供动画禁用选项

### 3. 一致性

- 统一的动画时长和缓动函数
- 一致的动画方向和效果
- 符合品牌调性的动画风格

## 🎭 动画类型

### 1. 页面加载动画

#### 渐入效果 (Fade In)

```less
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-section {
  animation: fadeInUp 0.8s ease-out;
}
```

#### 滑入效果 (Slide In)

```less
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-grid > * {
  animation: slideInUp 0.6s ease-out both;

  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
}
```

### 2. 交互动画

#### 悬停效果 (Hover Effects)

```less
.user-card {
  transition: all @transition-duration ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: @shadow-lg;

    .user-avatar {
      transform: scale(1.05) rotate(5deg);
    }
  }
}
```

#### 点击效果 (Click Effects)

```less
.post-card {
  &:active {
    transform: translateY(0);
  }
}
```

### 3. 背景动画

#### 渐变动画 (Gradient Animation)

```less
.home-page {
  background: linear-gradient(
    135deg,
    lighten(@primary-color, 48%) 0%,
    lighten(@primary-color, 50%) 50%,
    lighten(@secondary-color, 48%) 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```

## ⚙️ 动画配置

### 1. 时长变量

```less
// 动画时长
@transition-duration: 0.3s;
@animation-duration-fast: 0.2s;
@animation-duration-normal: 0.3s;
@animation-duration-slow: 0.5s;
```

### 2. 缓动函数

```less
// 缓动函数
@ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
@ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);
@ease-back: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 3. 延迟配置

```less
// 动画延迟
.stagger-animation {
  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
  &:nth-child(4) {
    animation-delay: 0.4s;
  }
}
```

## 🎪 实际应用

### 1. 首页动画序列

1. **页面背景**: 渐变动画持续播放
2. **页面头部**: 从上方滑入 (0s)
3. **欢迎区域**: 渐入上升 (0.2s)
4. **信息面板**: 依次滑入 (0.4s + 错开)
5. **演示区域**: 从左侧滑入 (0.6s)
6. **数据区域**: 从下方滑入 (0.8s)
7. **页面底部**: 从下方滑入 (1.0s)

### 2. 组件交互动画

#### 用户卡片

- **悬停**: 上升 + 阴影增强 + 头像缩放旋转
- **点击**: 轻微下压反馈

#### 文章卡片

- **悬停**: 上升 + 标题右移 + 颜色变化
- **点击**: 下压反馈

#### 按钮

- **悬停**: 颜色渐变 + 轻微缩放
- **点击**: 下压 + 涟漪效果

## 🔧 性能优化

### 1. 硬件加速

```less
.animated-element {
  // 启用硬件加速
  transform: translateZ(0);
  will-change: transform, opacity;
}
```

### 2. 动画完成后清理

```less
.animation-element {
  animation: slideIn 0.5s ease-out forwards;

  // 动画完成后移除 will-change
  &.animation-complete {
    will-change: auto;
  }
}
```

### 3. 减少重绘

```less
// 优先使用 transform 和 opacity
.hover-effect {
  transition: transform 0.3s ease, opacity 0.3s ease;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    opacity: 0.9;
  }
}
```

## 🎛️ 动画控制

### 1. 动画开关

```typescript
// 用户偏好设置
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

if (prefersReducedMotion.matches) {
  document.documentElement.classList.add('reduce-motion')
}
```

```less
// CSS 响应用户偏好
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2. 动画状态管理

```typescript
// 动画状态 Hook
const useAnimation = () => {
  const isAnimating = ref(false)

  const startAnimation = () => {
    isAnimating.value = true
  }

  const endAnimation = () => {
    isAnimating.value = false
  }

  return { isAnimating, startAnimation, endAnimation }
}
```

## 📱 响应式动画

### 1. 设备适配

```less
// 移动端简化动画
@media (max-width: @mobile-breakpoint) {
  .complex-animation {
    animation: simpleSlideIn 0.3s ease-out;
  }
}

// 桌面端完整动画
@media (min-width: @desktop-breakpoint) {
  .complex-animation {
    animation: complexSlideIn 0.6s ease-out;
  }
}
```

### 2. 性能考虑

```less
// 低性能设备简化动画
@media (max-width: @mobile-breakpoint) and (max-resolution: 150dpi) {
  .performance-heavy-animation {
    animation: none;
    transition: none;
  }
}
```

## 🎨 动画库集成

### 1. 自定义动画工具

```typescript
// 动画工具函数
export const animationUtils = {
  // 错开动画
  stagger: (elements: NodeList, delay = 100) => {
    elements.forEach((el, index) => {
      ;(el as HTMLElement).style.animationDelay = `${index * delay}ms`
    })
  },

  // 滚动触发动画
  onScroll: (element: HTMLElement, animation: string) => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animation)
        }
      })
    })
    observer.observe(element)
  },
}
```

### 2. 动画组合

```less
// 动画组合类
.entrance-animation {
  animation: fadeInUp 0.6s ease-out, scaleIn 0.4s ease-out 0.2s both;
}

.exit-animation {
  animation: fadeOut 0.3s ease-in, scaleOut 0.3s ease-in;
}
```

## 🧪 测试动画

### 1. 动画测试

```typescript
// 测试动画是否正确应用
it('should apply entrance animation', async () => {
  const wrapper = mount(UserCard, { props: { user } })

  expect(wrapper.classes()).toContain('entrance-animation')
})
```

### 2. 性能测试

```typescript
// 测试动画性能
it('should complete animation within expected time', async () => {
  const start = performance.now()

  // 触发动画
  await wrapper.trigger('mouseenter')

  // 等待动画完成
  await new Promise(resolve => setTimeout(resolve, 600))

  const duration = performance.now() - start
  expect(duration).toBeLessThan(700)
})
```

---

通过这套完整的动画系统，LDesign App 提供了流畅、自然的用户体验，同时保持了良好的性能表现。
