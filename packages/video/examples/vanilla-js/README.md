# LDesign Video Player - Vanilla JS 示例

这是一个使用 Vite + 原生 JavaScript 的 LDesign Video Player 示例项目。

## 功能特性

- 🎥 **基础播放器** - 展示基本的视频播放功能
- 📱 **响应式播放器** - 自适应不同屏幕尺寸的播放器
- 🎨 **自定义主题播放器** - 展示主题定制功能

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 示例说明

### 基础播放器

展示了 LDesign Video Player 的基本功能：
- 视频播放/暂停
- 音量控制
- 进度条控制
- 全屏模式
- 事件监听

### 响应式播放器

展示了播放器的响应式特性：
- 自适应容器尺寸
- 16:9 宽高比保持
- 移动设备优化
- 屏幕方向变化处理

### 自定义主题播放器

展示了播放器的主题定制功能：
- 深色主题
- 快捷键支持
- 右键菜单
- 自定义控件扩展

## 配置选项

播放器支持丰富的配置选项：

```javascript
const player = new LVideoPlayer(container, {
  src: 'video-url.mp4',           // 视频源
  poster: 'poster-image.jpg',     // 封面图
  width: '100%',                  // 宽度
  height: '400px',                // 高度
  aspectRatio: '16:9',            // 宽高比
  controls: true,                 // 显示控制栏
  autoplay: false,                // 自动播放
  muted: false,                   // 静音
  loop: false,                    // 循环播放
  preload: 'metadata',            // 预加载
  responsive: true,               // 响应式
  fluid: true,                    // 流体布局
  theme: 'dark',                  // 主题
  hotkeys: true,                  // 快捷键
  contextMenu: true               // 右键菜单
})
```

## 事件监听

播放器提供了丰富的事件监听：

```javascript
player.on('ready', () => {
  console.log('播放器已准备就绪')
})

player.on('play', () => {
  console.log('开始播放')
})

player.on('pause', () => {
  console.log('暂停播放')
})

player.on('resize', (data) => {
  console.log('播放器尺寸变化:', data)
})

player.on('orientationchange', (data) => {
  console.log('屏幕方向变化:', data)
})
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## 技术栈

- [Vite](https://vitejs.dev/) - 构建工具
- [LDesign Video Player](../../) - 视频播放器组件
- 原生 JavaScript - 无框架依赖

## 许可证

MIT License