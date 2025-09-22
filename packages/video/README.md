# @ldesign/video

<div align="center">
  <img src="https://img.shields.io/npm/v/@ldesign/video" alt="npm version">
  <img src="https://img.shields.io/npm/dm/@ldesign/video" alt="npm downloads">
  <img src="https://img.shields.io/github/license/ldesign-team/video-player" alt="license">
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue" alt="TypeScript">
</div>

<div align="center">
  <h3>🎬 LDesign Video Player</h3>
  <p>跨设备、跨框架的现代化视频播放器组件库</p>
</div>

## ✨ 特性

- 🎬 **完整播放功能** - 播放控制、进度条、音量调节、倍速播放、全屏、画中画
- 🔌 **强大插件系统** - 弹幕、字幕、截图等丰富插件，支持自定义插件开发
- 🎨 **丰富主题系统** - 多套预设主题，支持完全自定义主题和响应式设计
- 📱 **跨设备兼容** - 完美适配桌面端、移动端、平板等所有主流设备
- 🚀 **跨框架支持** - 原生 JavaScript、Vue 3、React、Angular 全面支持
- ⚡ **高性能优化** - 内存管理、懒加载、GPU 加速等多重性能优化
- 🛡️ **TypeScript** - 完整的 TypeScript 类型定义，开发体验极佳
- ⌨️ **快捷键支持** - 丰富的键盘快捷键，提升用户体验
- 👆 **手势控制** - 移动端触摸手势操作，直观便捷
- 🌙 **暗色模式** - 内置暗色主题，护眼舒适

## 📦 安装

```bash
# npm
npm install @ldesign/video

# pnpm (推荐)
pnpm add @ldesign/video

# yarn
yarn add @ldesign/video
```

## 🚀 快速开始

### 原生 JavaScript

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

// 播放控制
await player.play()
player.pause()
player.seek(30)
player.setVolume(0.8)
```

### Vue 3

```vue
<template>
  <VideoPlayer
    src="https://example.com/video.mp4"
    :autoplay="false"
    :controls="true"
    theme="default"
    @ready="onReady"
    @play="onPlay"
    @pause="onPause"
  />
</template>

<script setup>
import { VideoPlayerComponent as VideoPlayer } from '@ldesign/video/vue'
import '@ldesign/video/style.css'

const onReady = () => console.log('播放器就绪')
const onPlay = () => console.log('开始播放')
const onPause = () => console.log('暂停播放')
</script>
```

### React

```jsx
import React, { useRef } from 'react'
import VideoPlayer from '@ldesign/video/react'
import '@ldesign/video/style.css'

function App() {
  const playerRef = useRef()

  const handleReady = () => {
    console.log('播放器就绪')
  }

  const handlePlay = () => {
    console.log('开始播放')
  }

  return (
    <VideoPlayer
      ref={playerRef}
      src="https://example.com/video.mp4"
      autoplay={false}
      controls={true}
      theme="default"
      onReady={handleReady}
      onPlay={handlePlay}
    />
  )
}

export default App
```

### Angular

```typescript
// app.module.ts
import { VideoPlayerModule } from '@ldesign/video/angular'

@NgModule({
  imports: [VideoPlayerModule],
  // ...
})
export class AppModule {}
```

```html
<!-- app.component.html -->
<lv-video-player
  src="https://example.com/video.mp4"
  [autoplay]="false"
  [controls]="true"
  theme="default"
  (ready)="onReady()"
  (play)="onPlay()"
  (pause)="onPause()"
></lv-video-player>
```

```typescript
// app.component.ts
export class AppComponent {
  onReady() {
    console.log('播放器就绪')
  }

  onPlay() {
    console.log('开始播放')
  }

  onPause() {
    console.log('暂停播放')
  }
}
```

## 🔌 插件系统

### 内置插件

```javascript
import {
  DanmakuPlugin,
  SubtitlePlugin,
  ScreenshotPlugin,
  PipPlugin
} from '@ldesign/video/plugins'

const player = new VideoPlayer({
  container: document.getElementById('player'),
  src: 'video.mp4',
  plugins: [
    // 弹幕插件
    new DanmakuPlugin({
      enabled: true,
      opacity: 0.8,
      fontSize: 16,
      speed: 5
    }),
    // 字幕插件
    new SubtitlePlugin({
      enabled: true,
      fontSize: 18,
      color: '#ffffff'
    }),
    // 截图插件
    new ScreenshotPlugin({
      enabled: true,
      format: 'png',
      quality: 0.9
    }),
    // 画中画插件
    new PipPlugin({
      enabled: true,
      autoEnter: false
    })
  ]
})

await player.initialize()

// 插件控制
const danmakuPlugin = player.getPlugin('danmaku')
danmakuPlugin.send('这是一条弹幕', 'scroll')

const screenshotPlugin = player.getPlugin('screenshot')
const dataUrl = await screenshotPlugin.capture()
```

### 自定义插件

```javascript
import { BasePlugin } from '@ldesign/video/plugins'

class CustomPlugin extends BasePlugin {
  constructor(options = {}) {
    super({
      name: 'custom',
      version: '1.0.0',
      description: '自定义插件'
    }, options)
  }

  async onInstall(context) {
    console.log('插件安装:', context.player)
  }

  async onUninstall(context) {
    console.log('插件卸载')
  }
}

// 使用自定义插件
const player = new VideoPlayer({
  plugins: [new CustomPlugin()]
})
```

## 🎨 主题系统

### 预设主题

```javascript
import { defaultTheme, darkTheme, lightTheme } from '@ldesign/video/themes'

// 使用预设主题
const player = new VideoPlayer({
  container: document.getElementById('player'),
  src: 'video.mp4',
  theme: darkTheme // 或 'dark'
})

// 动态切换主题
const themeManager = player.getThemeManager()
themeManager.setTheme('light')
themeManager.setTheme(darkTheme)
```

### 自定义主题

```javascript
const customTheme = {
  name: 'custom',
  colors: {
    primary: '#ff6b6b',
    background: '#2c3e50',
    text: '#ecf0f1',
    control: '#34495e'
  },
  responsive: {
    mobile: {
      fontSize: '14px',
      controlHeight: '40px'
    },
    tablet: {
      fontSize: '16px',
      controlHeight: '44px'
    },
    desktop: {
      fontSize: '18px',
      controlHeight: '48px'
    }
  },
  css: `
    .lv-player-container {
      border-radius: 12px;
      overflow: hidden;
    }
  `
}

const player = new VideoPlayer({
  theme: customTheme
})
```

## ⚡ 高级功能

### 快捷键支持

```javascript
import { HotkeyManager } from '@ldesign/video'

const player = new VideoPlayer({
  container: document.getElementById('player'),
  src: 'video.mp4'
})

const hotkeyManager = new HotkeyManager(player, {
  enabled: true,
  bindings: {
    'Space': {
      description: '播放/暂停',
      handler: () => player.toggle()
    },
    'Ctrl+KeyS': {
      description: '截图',
      handler: () => player.screenshot()
    }
  }
})
```

### 手势控制

```javascript
import { GestureManager } from '@ldesign/video'

const gestureManager = new GestureManager(player, {
  enabled: true,
  bindings: {
    tap: () => player.toggle(),
    doubleTap: () => player.toggleFullscreen(),
    swipeLeft: () => player.seek(-10, true),
    swipeRight: () => player.seek(10, true)
  }
})
```

### 性能监控

```javascript
const player = new VideoPlayer({
  container: document.getElementById('player'),
  src: 'video.mp4',
  performance: {
    enabled: true,
    monitor: ['fps', 'memory', 'cpu', 'network'],
    onStats: (stats) => {
      console.log('性能统计:', stats)
    }
  }
})

// 获取性能统计
const stats = player.getPerformanceStats()
console.log('当前性能:', stats)

// 内存优化
player.optimizeMemory()
```

## 📚 文档和示例

- 📖 [完整文档](./docs/README.md) - 详细的使用指南和API文档
- 🎯 [在线示例](./examples/vanilla/index.html) - 交互式功能演示
- 🔧 [插件开发指南](./docs/guide/plugins.md) - 自定义插件开发
- 🎨 [主题定制指南](./docs/guide/themes.md) - 主题系统详解
- 🚀 [跨框架集成](./docs/guide/frameworks.md) - Vue/React/Angular集成

## 🤝 贡献

我们欢迎所有形式的贡献！

### 开发环境

```bash
# 克隆项目
git clone https://github.com/ldesign-team/video-player.git

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建项目
pnpm build
```

### 提交规范

请遵循 [Conventional Commits](https://conventionalcommits.org/) 规范：

```bash
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

## 📄 许可证

[MIT License](./LICENSE) © 2024 LDesign Team

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

<div align="center">
  <p>如果这个项目对你有帮助，请给我们一个 ⭐️</p>
  <p>
    <a href="https://github.com/ldesign-team/video-player">GitHub</a> •
    <a href="https://ldesign.dev/video">文档</a> •
    <a href="https://ldesign.dev">官网</a>
  </p>
</div>
new VideoPlayer(options: PlayerOptions)
```

#### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `options` | `PlayerOptions` | 播放器配置选项 |
| `status` | `PlayerStatus` | 播放器当前状态 |
| `videoElement` | `HTMLVideoElement` | 原生视频元素 |
| `container` | `HTMLElement` | 播放器容器元素 |

#### 方法

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `initialize()` | - | `Promise<void>` | 初始化播放器 |
| `destroy()` | - | `void` | 销毁播放器 |
| `play()` | - | `Promise<void>` | 播放视频 |
| `pause()` | - | `void` | 暂停视频 |
| `toggle()` | - | `void` | 切换播放/暂停 |
| `seek(time)` | `number` | `void` | 跳转到指定时间 |
| `setVolume(volume)` | `number` | `void` | 设置音量 (0-1) |
| `setPlaybackRate(rate)` | `number` | `void` | 设置播放速度 |
| `toggleFullscreen()` | - | `Promise<void>` | 切换全屏 |
| `togglePip()` | - | `Promise<void>` | 切换画中画 |
| `setSrc(src)` | `VideoSource \| string` | `Promise<void>` | 设置视频源 |
| `setQuality(quality)` | `VideoQuality` | `void` | 切换视频质量 |

#### 事件

```javascript
// 监听播放器事件
player.on('ready', () => {
  console.log('播放器准备就绪')
})

player.on('play', () => {
  console.log('开始播放')
})

player.on('pause', () => {
  console.log('暂停播放')
})

player.on('timeupdate', (data) => {
  console.log('时间更新:', data.currentTime, data.duration)
})

player.on('error', (error) => {
  console.error('播放器错误:', error)
})
```

### 配置选项

```typescript
interface PlayerOptions {
  container: HTMLElement | string          // 容器元素或选择器
  src: VideoSource | string               // 视频源
  autoplay?: boolean                      // 是否自动播放
  muted?: boolean                         // 是否静音
  loop?: boolean                          // 是否循环播放
  controls?: boolean                      // 是否显示控制栏
  volume?: number                         // 初始音量 (0-1)
  playbackRate?: number                   // 初始播放速度
  preload?: 'none' | 'metadata' | 'auto' // 是否预加载
  crossOrigin?: 'anonymous' | 'use-credentials' // 跨域设置
  pip?: boolean                           // 是否启用画中画
  fullscreen?: boolean                    // 是否启用全屏
  theme?: string | object                 // 主题配置
  plugins?: PluginConfig[]                // 插件配置
  hotkeys?: boolean | HotkeyConfig        // 快捷键配置
  gestures?: boolean | GestureConfig      // 手势配置
  responsive?: boolean | ResponsiveConfig // 响应式配置
  className?: string                      // 自定义CSS类名
  language?: string                       // 语言设置
}
```

## 🎨 主题定制

### 使用预设主题

```javascript
const player = new VideoPlayer({
  container: '#video-container',
  src: 'video.mp4',
  theme: 'dark' // 使用暗色主题
})
```

### 自定义主题

```javascript
const customTheme = {
  colors: {
    primary: '#ff6b6b',
    background: 'rgba(0, 0, 0, 0.8)'
  },
  controlBar: {
    height: '60px',
    background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.9))'
  }
}

const player = new VideoPlayer({
  container: '#video-container',
  src: 'video.mp4',
  theme: customTheme
})
```

## 🔌 插件系统

### 使用内置插件

```javascript
const player = new VideoPlayer({
  container: '#video-container',
  src: 'video.mp4',
  plugins: [
    {
      name: 'danmaku',
      options: {
        enabled: true,
        opacity: 0.8,
        speed: 1,
        fontSize: 16
      }
    },
    {
      name: 'subtitle',
      options: {
        enabled: true,
        fontSize: 18,
        color: '#ffffff'
      }
    }
  ]
})
```

### 开发自定义插件

```javascript
class CustomPlugin {
  constructor(options = {}) {
    this.options = options
  }
  
  install(context) {
    const { player } = context
    
    // 插件初始化逻辑
    console.log('自定义插件已安装')
    
    // 监听播放器事件
    player.on('play', () => {
      console.log('播放开始 - 来自自定义插件')
    })
  }
  
  uninstall(context) {
    // 插件清理逻辑
    console.log('自定义插件已卸载')
  }
}

// 注册插件
player.pluginManager.register(CustomPlugin, { enabled: true })
```

## 📱 响应式支持

播放器自动适配不同设备和屏幕尺寸：

```javascript
const player = new VideoPlayer({
  container: '#video-container',
  src: 'video.mp4',
  responsive: {
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    },
    mobile: {
      controls: true,
      gestures: true,
      autoHideDelay: 2000
    },
    desktop: {
      controls: true,
      hotkeys: true,
      autoHideDelay: 3000
    }
  }
})
```

## ⌨️ 快捷键

默认快捷键：

| 快捷键 | 功能 |
|--------|------|
| `Space` | 播放/暂停 |
| `↑` | 音量增加 |
| `↓` | 音量减少 |
| `M` | 静音切换 |
| `F` | 全屏切换 |
| `←` | 快退10秒 |
| `→` | 快进10秒 |

自定义快捷键：

```javascript
const player = new VideoPlayer({
  container: '#video-container',
  src: 'video.mp4',
  hotkeys: {
    playPause: ['Space', 'K'],
    volumeUp: ['ArrowUp'],
    volumeDown: ['ArrowDown'],
    mute: ['M'],
    fullscreen: ['F'],
    forward: ['ArrowRight', 'L'],
    backward: ['ArrowLeft', 'J'],
    custom: {
      'Digit1': () => player.setPlaybackRate(1),
      'Digit2': () => player.setPlaybackRate(2)
    }
  }
})
```

## 📖 更多文档

- [完整API文档](./docs/api.md)
- [插件开发指南](./docs/plugin-development.md)
- [主题定制指南](./docs/theme-customization.md)
- [示例代码](./examples/)

## 🧪 开发和测试

### 构建项目

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 监听模式构建
pnpm dev

# 测试构建结果
pnpm test:build
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式测试
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

### 开发服务器

```bash
# 启动开发服务器
pnpm serve

# 构建并启动服务器
pnpm dev:test
```

访问 `http://localhost:3000/test-browser.html` 查看浏览器测试页面。

### 示例项目

```bash
# 基础HTML示例
pnpm example:basic

# Vue示例
pnpm example:vue

# React示例
pnpm example:react

# Angular示例
pnpm example:angular
```

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md)。

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情。
