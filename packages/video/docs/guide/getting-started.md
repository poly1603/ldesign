# 快速开始

欢迎使用 LDesign Video Player！这个指南将帮助你在几分钟内开始使用这个强大的视频播放器组件库。

## 安装

首先，你需要安装 LDesign Video Player。我们推荐使用 pnpm，但你也可以使用 npm 或 yarn。

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

## 基础用法

### 原生 JavaScript

创建一个简单的 HTML 文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign Video Player 示例</title>
</head>
<body>
  <div id="player-container" style="width: 800px; height: 450px;"></div>
  
  <script type="module">
    import { VideoPlayer } from '@ldesign/video'
    import '@ldesign/video/style.css'

    const player = new VideoPlayer({
      container: document.getElementById('player-container'),
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      autoplay: false,
      controls: true,
      theme: 'default'
    })

    // 初始化播放器
    await player.initialize()

    // 监听事件
    player.on('ready', () => {
      console.log('播放器就绪')
    })

    player.on('play', () => {
      console.log('开始播放')
    })

    player.on('pause', () => {
      console.log('暂停播放')
    })
  </script>
</body>
</html>
```

### Vue 3

如果你使用 Vue 3，可以直接使用我们提供的 Vue 组件：

```vue
<template>
  <div class="video-container">
    <VideoPlayer 
      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      :autoplay="false"
      :controls="true"
      theme="default"
      @ready="handleReady"
      @play="handlePlay"
      @pause="handlePause"
    />
  </div>
</template>

<script setup>
import { VideoPlayerComponent as VideoPlayer } from '@ldesign/video/vue'
import '@ldesign/video/style.css'

const handleReady = () => {
  console.log('播放器就绪')
}

const handlePlay = () => {
  console.log('开始播放')
}

const handlePause = () => {
  console.log('暂停播放')
}
</script>

<style scoped>
.video-container {
  width: 800px;
  height: 450px;
  margin: 0 auto;
}
</style>
```

### React

React 用户可以使用我们的 React 组件：

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

  const handlePause = () => {
    console.log('暂停播放')
  }

  return (
    <div className="App">
      <div style={{ width: '800px', height: '450px', margin: '0 auto' }}>
        <VideoPlayer 
          ref={playerRef}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          autoplay={false}
          controls={true}
          theme="default"
          onReady={handleReady}
          onPlay={handlePlay}
          onPause={handlePause}
        />
      </div>
    </div>
  )
}

export default App
```

### Angular

Angular 用户需要先导入模块：

```typescript
// app.module.ts
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { VideoPlayerModule } from '@ldesign/video/angular'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    VideoPlayerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

然后在组件中使用：

```html
<!-- app.component.html -->
<div class="video-container">
  <lv-video-player 
    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    [autoplay]="false"
    [controls]="true"
    theme="default"
    (ready)="handleReady()"
    (play)="handlePlay()"
    (pause)="handlePause()"
  ></lv-video-player>
</div>
```

```typescript
// app.component.ts
import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  handleReady() {
    console.log('播放器就绪')
  }

  handlePlay() {
    console.log('开始播放')
  }

  handlePause() {
    console.log('暂停播放')
  }
}
```

```css
/* app.component.css */
.video-container {
  width: 800px;
  height: 450px;
  margin: 0 auto;
}
```

## 配置选项

LDesign Video Player 提供了丰富的配置选项：

```javascript
const player = new VideoPlayer({
  // 容器元素
  container: document.getElementById('player'),
  
  // 视频源
  src: {
    src: 'https://example.com/video.mp4',
    poster: 'https://example.com/poster.jpg',
    qualities: [
      { id: '720p', name: '高清', src: 'https://example.com/video-720p.mp4' },
      { id: '1080p', name: '超清', src: 'https://example.com/video-1080p.mp4' }
    ]
  },
  
  // 播放选项
  autoplay: false,
  muted: false,
  loop: false,
  volume: 0.8,
  playbackRate: 1,
  
  // 控制选项
  controls: true,
  
  // 主题
  theme: 'default',
  
  // 插件
  plugins: [],
  
  // 快捷键
  hotkeys: true,
  
  // 手势控制
  gestures: true,
  
  // 响应式
  responsive: true,
  
  // 自定义类名
  className: 'my-video-player'
})
```

## 基础 API

### 播放控制

```javascript
// 播放
await player.play()

// 暂停
player.pause()

// 切换播放/暂停
player.toggle()

// 跳转到指定时间（秒）
player.seek(30)

// 设置音量（0-1）
player.setVolume(0.8)

// 设置播放速度
player.setPlaybackRate(1.5)

// 全屏切换
await player.toggleFullscreen()

// 画中画切换
await player.togglePip()
```

### 事件监听

```javascript
// 播放器就绪
player.on('ready', () => {
  console.log('播放器就绪')
})

// 播放状态变化
player.on('play', () => console.log('开始播放'))
player.on('pause', () => console.log('暂停播放'))
player.on('ended', () => console.log('播放结束'))

// 时间更新
player.on('timeupdate', (data) => {
  console.log('当前时间:', data.currentTime)
  console.log('总时长:', data.duration)
})

// 音量变化
player.on('volumechange', (data) => {
  console.log('音量:', data.volume)
  console.log('静音:', data.muted)
})

// 错误处理
player.on('error', (error) => {
  console.error('播放器错误:', error)
})
```

### 获取状态

```javascript
// 获取当前状态
const status = player.status
console.log('播放状态:', status.state)
console.log('当前时间:', status.currentTime)
console.log('总时长:', status.duration)
console.log('音量:', status.volume)
console.log('播放速度:', status.playbackRate)
```

## 下一步

恭喜！你已经成功创建了第一个 LDesign Video Player 实例。现在你可以：

- 📖 [了解更多配置选项](/guide/configuration)
- 🔌 [探索插件系统](/plugins/overview)
- 🎨 [自定义主题](/themes/overview)
- 🎯 [查看更多示例](/examples/basic)
- 📚 [阅读 API 文档](/api/player)

如果你遇到任何问题，请查看我们的 [常见问题](/guide/faq) 或在 [GitHub](https://github.com/ldesign-team/video-player/issues) 上提交 issue。
