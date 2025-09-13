---
layout: home

hero:
  name: "LDesign Video Player"
  text: "现代化视频播放器"
  tagline: 跨设备、跨框架的视频播放器组件库
  image:
    src: /logo.svg
    alt: LDesign Video Player
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign-team/video-player

features:
  - icon: 🎬
    title: 完整播放功能
    details: 播放控制、进度条、音量调节、倍速播放、全屏、画中画等完整功能
  - icon: 🔌
    title: 强大插件系统
    details: 弹幕、字幕、截图等丰富插件，支持自定义插件开发
  - icon: 🎨
    title: 丰富主题系统
    details: 多套预设主题，支持完全自定义主题和响应式设计
  - icon: 📱
    title: 跨设备兼容
    details: 完美适配桌面端、移动端、平板等所有主流设备
  - icon: 🚀
    title: 跨框架支持
    details: 原生 JavaScript、Vue 3、React、Angular 全面支持
  - icon: ⚡
    title: 高性能优化
    details: 内存管理、懒加载、GPU 加速等多重性能优化
  - icon: 🛡️
    title: TypeScript
    details: 完整的 TypeScript 类型定义，开发体验极佳
  - icon: ⌨️
    title: 快捷键支持
    details: 丰富的键盘快捷键，提升用户体验
  - icon: 👆
    title: 手势控制
    details: 移动端触摸手势操作，直观便捷
  - icon: 🌙
    title: 暗色模式
    details: 内置暗色主题，护眼舒适
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #722ED1 30%, #9254DE);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #722ED1 50%, #9254DE 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>

## 快速开始

### 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/video
```

```bash [npm]
npm install @ldesign/video
```

```bash [yarn]
yarn add @ldesign/video
```

:::

### 基础用法

```javascript
import { VideoPlayer } from '@ldesign/video'
import '@ldesign/video/style.css'

const player = new VideoPlayer({
  container: document.getElementById('player'),
  src: 'https://example.com/video.mp4',
  autoplay: false,
  controls: true,
  theme: 'default'
})

await player.initialize()
```

### Vue 3 集成

```vue
<template>
  <VideoPlayer 
    src="https://example.com/video.mp4"
    :autoplay="false"
    :controls="true"
    theme="default"
    @ready="onReady"
    @play="onPlay"
  />
</template>

<script setup>
import { VideoPlayerComponent as VideoPlayer } from '@ldesign/video/vue'
import '@ldesign/video/style.css'

const onReady = () => console.log('播放器就绪')
const onPlay = () => console.log('开始播放')
</script>
```

### React 集成

```jsx
import React from 'react'
import VideoPlayer from '@ldesign/video/react'
import '@ldesign/video/style.css'

function App() {
  return (
    <VideoPlayer 
      src="https://example.com/video.mp4"
      autoplay={false}
      controls={true}
      theme="default"
      onReady={() => console.log('播放器就绪')}
      onPlay={() => console.log('开始播放')}
    />
  )
}
```

## 为什么选择 LDesign Video Player？

### 🎯 专业级功能

LDesign Video Player 不仅仅是一个简单的视频播放器，它是一个完整的视频播放解决方案。从基础的播放控制到高级的弹幕系统，从简单的主题切换到复杂的插件开发，我们提供了专业级的功能和灵活性。

### 🔧 开发者友好

- **完整的 TypeScript 支持** - 享受类型安全和智能提示
- **丰富的 API 文档** - 详细的文档和示例代码
- **插件化架构** - 轻松扩展和定制功能
- **跨框架兼容** - 一次学习，到处使用

### 🚀 生产就绪

- **高性能优化** - 针对大文件和长时间播放进行优化
- **内存管理** - 智能的内存管理和垃圾回收
- **错误处理** - 完善的错误处理和恢复机制
- **无障碍支持** - 遵循 WCAG 标准的无障碍设计

### 🌟 社区驱动

LDesign Video Player 是一个开源项目，我们欢迎社区的贡献和反馈。无论是 bug 报告、功能请求还是代码贡献，我们都非常欢迎。

## 立即开始

准备好开始使用 LDesign Video Player 了吗？

- [快速开始指南](/guide/getting-started) - 5分钟快速上手
- [在线示例](/examples/basic) - 查看实际效果
- [API 文档](/api/player) - 详细的 API 参考
- [插件开发](/plugins/development) - 创建自定义插件

---

<div class="tip custom-block" style="padding-top: 8px">

想要了解更多？加入我们的社区：

- 在 [GitHub](https://github.com/ldesign-team/video-player) 上给我们一个 ⭐️
- 关注我们的 [官方网站](https://ldesign.dev)
- 查看更多 [LDesign 组件](https://ldesign.dev/components)

</div>
