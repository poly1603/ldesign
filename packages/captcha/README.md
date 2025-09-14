# @ldesign/captcha

功能完整的网页验证码插件库，支持多种验证方式，提供简洁易用的API接口。

## ✨ 特性

- 🎯 **多种验证方式**：滑动拼图、按顺序点击文字、滑动滑块图片回正、点击验证等
- 🔧 **TypeScript 支持**：完整的类型定义，提供优秀的开发体验
- 🎨 **主题定制**：支持多种主题配置，使用LESS变量系统
- 🌐 **跨框架支持**：支持Vue、React、Angular等主流前端框架
- 📱 **响应式设计**：适配各种屏幕尺寸和设备
- 🛡️ **安全可靠**：内置防暴力破解机制
- ⚡ **高性能**：优化的渲染和交互性能
- 🎛️ **灵活配置**：丰富的配置选项，满足各种使用场景

## 📦 安装

```bash
# 使用 npm
npm install @ldesign/captcha

# 使用 yarn
yarn add @ldesign/captcha

# 使用 pnpm
pnpm add @ldesign/captcha
```

## 🚀 快速开始

### 基础使用

```typescript
import { SlidePuzzleCaptcha } from '@ldesign/captcha'
import '@ldesign/captcha/styles'

// 创建滑动拼图验证码
const captcha = new SlidePuzzleCaptcha({
  container: '#captcha-container',
  width: 320,
  height: 180,
  onSuccess: (result) => {
    console.log('验证成功:', result)
  },
  onFail: (error) => {
    console.log('验证失败:', error)
  }
})

// 初始化验证码
captcha.init()
```

### Vue 3 使用

```vue
<template>
  <div>
    <LCaptcha
      type="slide-puzzle"
      :width="320"
      :height="180"
      @success="handleSuccess"
      @fail="handleFail"
    />
  </div>
</template>

<script setup lang="ts">
import { LCaptcha } from '@ldesign/captcha/vue'

const handleSuccess = (result: any) => {
  console.log('验证成功:', result)
}

const handleFail = (error: any) => {
  console.log('验证失败:', error)
}
</script>
```

### React 使用

```tsx
import React from 'react'
import { LCaptcha } from '@ldesign/captcha/react'

function App() {
  const handleSuccess = (result: any) => {
    console.log('验证成功:', result)
  }

  const handleFail = (error: any) => {
    console.log('验证失败:', error)
  }

  return (
    <LCaptcha
      type="slide-puzzle"
      width={320}
      height={180}
      onSuccess={handleSuccess}
      onFail={handleFail}
    />
  )
}
```

## 🎯 验证方式

### 1. 滑动拼图验证 (SlidePuzzleCaptcha)

用户需要拖拽拼图块到正确位置完成验证。

```typescript
import { SlidePuzzleCaptcha } from '@ldesign/captcha'

const captcha = new SlidePuzzleCaptcha({
  container: '#captcha',
  imageUrl: '/api/captcha/image',
  tolerance: 5, // 容错像素
  onSuccess: (result) => {
    // 验证成功，提交到后端
    fetch('/api/captcha/verify', {
      method: 'POST',
      body: JSON.stringify(result)
    })
  }
})
```

### 2. 按顺序点击文字验证 (ClickTextCaptcha)

用户需要按指定顺序点击文字完成验证。

```typescript
import { ClickTextCaptcha } from '@ldesign/captcha'

const captcha = new ClickTextCaptcha({
  container: '#captcha',
  textCount: 4, // 文字数量
  clickOrder: [2, 1, 4, 3], // 点击顺序
  onSuccess: (result) => {
    console.log('点击顺序正确:', result)
  }
})
```

### 3. 滑动滑块图片回正验证 (RotateSliderCaptcha)

用户需要旋转图片到正确角度完成验证。

```typescript
import { RotateSliderCaptcha } from '@ldesign/captcha'

const captcha = new RotateSliderCaptcha({
  container: '#captcha',
  imageUrl: '/api/captcha/rotate-image',
  targetAngle: 0, // 目标角度
  tolerance: 5, // 角度容错
  onSuccess: (result) => {
    console.log('角度正确:', result)
  }
})
```

### 4. 点击验证 (ClickCaptcha)

用户需要点击图片中的指定区域完成验证。

```typescript
import { ClickCaptcha } from '@ldesign/captcha'

const captcha = new ClickCaptcha({
  container: '#captcha',
  imageUrl: '/api/captcha/click-image',
  targetAreas: [
    { x: 100, y: 50, radius: 20 },
    { x: 200, y: 120, radius: 25 }
  ],
  onSuccess: (result) => {
    console.log('点击区域正确:', result)
  }
})
```

## 🎨 主题配置

```typescript
import { SlidePuzzleCaptcha } from '@ldesign/captcha'

const captcha = new SlidePuzzleCaptcha({
  container: '#captcha',
  theme: {
    primaryColor: 'var(--ldesign-brand-color)',
    borderColor: 'var(--ldesign-border-color)',
    backgroundColor: 'var(--ldesign-bg-color-container)',
    textColor: 'var(--ldesign-text-color-primary)',
    borderRadius: 'var(--ls-border-radius-base)'
  }
})
```

## 📚 API 文档

详细的API文档请查看：[API Reference](./docs/api/index.md)

## 🔧 开发

```bash
# 克隆项目
git clone https://github.com/ldesign/captcha.git

# 安装依赖
pnpm install

# 启动开发
pnpm dev

# 运行测试
pnpm test

# 构建项目
pnpm build
```

## 📄 许可证

MIT License © 2024 LDesign Team
