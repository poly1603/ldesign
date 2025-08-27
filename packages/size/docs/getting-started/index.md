# 快速开始

欢迎使用 **@ldesign/size**！这是一个智能的尺寸控制系统，让你的应用能够适配不同的设备和用户偏好。

## 🎯 什么是 @ldesign/size？

@ldesign/size 是一个专为现代 Web 应用设计的尺寸控制系统。它可以帮助你：

- **提升用户体验** - 让用户根据自己的需求调整界面尺寸
- **支持无障碍访问** - 为视觉障碍用户提供更好的可读性
- **适配多种设备** - 自动适配手机、平板、桌面等不同设备
- **简化开发流程** - 提供简洁的 API 和完整的 Vue 集成

## 🚀 5分钟快速上手

### 第一步：安装

::: code-group

```bash [npm]
npm install @ldesign/size
```

```bash [yarn]
yarn add @ldesign/size
```

```bash [pnpm]
pnpm add @ldesign/size
```

:::

### 第二步：基础使用

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

### 第三步：在 CSS 中使用

```css
.my-component {
  /* 使用自动生成的 CSS 变量 */
  font-size: var(--ls-font-size);
  padding: var(--ls-spacing);
  border-radius: var(--ls-border-radius);
}

.my-button {
  height: var(--ls-button-height);
  padding: var(--ls-button-padding);
}
```

### 第四步：Vue 集成（可选）

如果你使用 Vue，可以享受更丰富的功能：

```vue
<template>
  <div>
    <!-- 尺寸切换器 -->
    <SizeSwitcher />

    <!-- 尺寸指示器 -->
    <SizeIndicator />

    <!-- 你的内容 -->
    <div class="content">
      <h1>标题</h1>
      <p>这里的文字会根据尺寸模式自动调整</p>
    </div>
  </div>
</template>

<script setup>
import { SizeSwitcher, SizeIndicator } from '@ldesign/size/vue'
</script>
```

## 🎨 尺寸模式

@ldesign/size 提供三种预设的尺寸模式：

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| `small` | 小尺寸 | 移动设备、紧凑布局 |
| `medium` | 中等尺寸 | 桌面设备、标准布局 |
| `large` | 大尺寸 | 大屏设备、无障碍访问 |

每种模式都会生成对应的 CSS 变量，你可以在样式中直接使用。

## 🔧 配置选项

你可以通过配置来自定义行为：

```typescript
import { createSizeManager } from '@ldesign/size'

const sizeManager = createSizeManager({
  defaultMode: 'medium',
  enableStorage: true,
  enableTransition: true,
  transitionDuration: '0.3s'
})
```

## 📱 响应式支持

@ldesign/size 支持根据设备特性自动调整尺寸：

```typescript
import { useSmartSize } from '@ldesign/size/vue'

const { currentMode, recommendedMode } = useSmartSize({
  responsive: true, // 启用响应式
  autoDetect: true // 自动检测最佳尺寸
})
```

## 🎬 动画效果

所有尺寸切换都支持平滑的动画过渡：

```css
/* 自动应用过渡动画 */
.my-element {
  transition: all var(--ls-transition-duration) ease-in-out;
}
```

## 💾 持久化存储

用户的尺寸偏好会自动保存到本地存储：

```typescript
// 用户的选择会被记住
Size.set('large') // 下次访问时会自动恢复为 'large'

// 也可以手动控制
Size.storage.clear() // 清除保存的偏好
```

## 🛠️ TypeScript 支持

完整的 TypeScript 类型定义：

```typescript
import type { SizeConfig, SizeMode } from '@ldesign/size'

const mode: SizeMode = 'medium'
const config: SizeConfig = {
  fontSize: '14px',
  spacing: '8px'
}
```

## 🎯 下一步

现在你已经了解了基础用法，可以继续探索：

- [详细配置选项](./configuration) - 了解所有可用的配置选项
- [Vue 集成指南](../guide/vue-plugin) - 深入了解 Vue 集成
- [API 参考](../api/) - 查看完整的 API 文档
- [示例项目](../examples/) - 查看实际使用示例

## ❓ 遇到问题？

如果你在使用过程中遇到任何问题：

1. 查看 [常见问题](../guide/faq)
2. 搜索 [GitHub Issues](https://github.com/ldesign/size/issues)
3. 提交新的 Issue 或讨论

我们很乐意帮助你解决问题！ 🤝
