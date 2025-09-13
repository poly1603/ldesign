# LDesign Video Player - Vanilla JavaScript 示例

这是 LDesign Video Player 的原生 JavaScript 示例项目，展示了播放器的所有功能特性。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看示例。

### 构建项目

```bash
pnpm build
```

## 📁 项目结构

```
examples/vanilla/
├── index.html          # 主页面 - 功能概览
├── basic.html          # 基础播放功能演示
├── plugins.html        # 插件系统演示
├── themes.html         # 主题系统演示
├── advanced.html       # 高级功能演示
├── package.json        # 项目配置
├── vite.config.ts      # Vite 配置
└── README.md          # 说明文档
```

## 🎬 示例页面

### 1. 基础播放功能 (basic.html)

展示播放器的核心功能：

- ✅ 播放/暂停控制
- ✅ 进度条拖拽
- ✅ 音量调节
- ✅ 倍速播放
- ✅ 全屏切换
- ✅ 画中画模式
- ✅ 画质切换

**代码示例：**

```javascript
import { VideoPlayer } from '@ldesign/video'

const player = new VideoPlayer({
  container: document.getElementById('player'),
  src: 'video.mp4',
  autoplay: false,
  controls: true,
  volume: 1,
  theme: 'default'
})

await player.initialize()

// 播放控制
await player.play()
player.pause()
player.seek(30)
player.setVolume(0.8)
player.setPlaybackRate(1.5)
```

### 2. 插件系统 (plugins.html)

演示强大的插件系统：

- 🔌 **弹幕插件** - 支持滚动、顶部、底部弹幕
- 📝 **字幕插件** - 多格式字幕支持
- 📷 **截图插件** - 高质量截图功能
- 🖼️ **画中画插件** - 增强的画中画功能

**代码示例：**

```javascript
import { DanmakuPlugin, SubtitlePlugin, ScreenshotPlugin, PipPlugin } from '@ldesign/video/plugins'

const player = new VideoPlayer({
  container: document.getElementById('player'),
  src: 'video.mp4',
  plugins: [
    new DanmakuPlugin({
      enabled: true,
      opacity: 0.8,
      fontSize: 16
    }),
    new SubtitlePlugin({
      enabled: true,
      fontSize: 18
    }),
    new ScreenshotPlugin({
      enabled: true,
      format: 'png',
      quality: 0.9
    }),
    new PipPlugin({
      enabled: true,
      autoEnter: false
    })
  ]
})

// 插件控制
const danmakuPlugin = player.getPlugin('danmaku')
danmakuPlugin.send('这是一条弹幕', 'scroll')

const screenshotPlugin = player.getPlugin('screenshot')
const dataUrl = await screenshotPlugin.capture()
```

### 3. 主题系统 (themes.html)

展示丰富的主题系统：

- 🎨 **预设主题** - 默认、暗色、亮色主题
- 🎨 **自定义主题** - 完全可定制的主题系统
- 📱 **响应式设计** - 适配不同设备尺寸
- 🌙 **暗色模式** - 护眼的暗色主题

**代码示例：**

```javascript
import { defaultTheme, darkTheme, lightTheme } from '@ldesign/video/themes'

// 使用预设主题
const player = new VideoPlayer({
  container: document.getElementById('player'),
  src: 'video.mp4',
  theme: 'dark'
})

// 使用自定义主题
const customTheme = {
  name: 'custom',
  colors: {
    primary: '#ff6b6b',
    background: '#2c3e50',
    text: '#ecf0f1',
    control: '#34495e'
  },
  responsive: {
    mobile: { fontSize: '14px' },
    tablet: { fontSize: '16px' },
    desktop: { fontSize: '18px' }
  }
}

const player = new VideoPlayer({
  theme: customTheme
})

// 动态切换主题
const themeManager = player.getThemeManager()
themeManager.setTheme('dark')
```

### 4. 高级功能 (advanced.html)

演示高级功能特性：

- ⌨️ **键盘快捷键** - 丰富的快捷键支持
- 👆 **触摸手势** - 移动端手势控制
- 📊 **性能监控** - 实时性能统计
- 🛡️ **错误处理** - 智能错误恢复
- 🧠 **内存管理** - 自动内存优化

**代码示例：**

```javascript
import { HotkeyManager, GestureManager } from '@ldesign/video'

const player = new VideoPlayer({
  container: document.getElementById('player'),
  src: 'video.mp4',
  // 启用快捷键
  hotkeys: {
    enabled: true,
    bindings: {
      'Space': {
        description: '播放/暂停',
        handler: () => player.toggle()
      }
    }
  },
  // 启用手势控制
  gestures: {
    enabled: true,
    bindings: {
      tap: () => player.toggle(),
      doubleTap: () => player.toggleFullscreen()
    }
  },
  // 启用性能监控
  performance: {
    enabled: true,
    monitor: ['fps', 'memory', 'cpu', 'network']
  }
})

// 获取性能统计
const stats = player.getPerformanceStats()
console.log('当前性能:', stats)
```

## 🔧 开发指南

### 本地开发

1. 克隆项目并安装依赖
2. 启动开发服务器：`pnpm dev`
3. 在浏览器中访问示例页面
4. 修改代码并实时查看效果

### 自定义示例

你可以基于现有示例创建自己的演示：

1. 复制现有的 HTML 文件
2. 修改播放器配置
3. 添加自定义功能
4. 更新样式和交互

### 调试技巧

- 打开浏览器开发者工具查看控制台输出
- 使用 `player.status` 查看播放器状态
- 使用 `player.getPlugin('pluginName')` 获取插件实例
- 监听播放器事件：`player.on('eventName', callback)`

## 📚 相关文档

- [播放器 API 文档](../../docs/api/player.md)
- [插件开发指南](../../docs/guide/plugins.md)
- [主题定制指南](../../docs/guide/themes.md)
- [跨框架集成](../../docs/guide/frameworks.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进示例项目！

## 📄 许可证

MIT License
