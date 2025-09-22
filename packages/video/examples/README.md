# LDesign Video Player 示例项目

本目录包含了 LDesign Video Player 的完整功能演示。

## 📁 目录结构

```
examples/
└── basic/                  # 完整功能演示
    ├── index.html         # 主页面
    ├── src/
    │   └── main.js       # 配置文件（无功能代码）
    ├── package.json      # 项目配置
    ├── vite.config.js    # Vite 配置
    └── README.md         # 使用说明
```

## 🚀 快速开始

```bash
cd basic
pnpm install
pnpm dev
```

## ✨ 功能演示

示例项目展示了播放器的所有功能，通过配置文件控制，无需编写任何功能代码：

### 🎮 基础功能
- **播放控制**：播放、暂停、进度控制
- **音量控制**：音量调节、静音切换
- **全屏播放**：全屏模式切换
- **画中画**：Picture-in-Picture 模式
- **播放速度**：0.25x - 4x 速度调节
- **截图功能**：视频截图保存

### ⌨️ 交互控制
- **键盘快捷键**：
  - `空格` - 播放/暂停
  - `←/→` - 快退/快进 10 秒
  - `↑/↓` - 音量增减
  - `M` - 静音切换
  - `F` - 全屏切换
  - `0-9` - 跳转到指定百分比
  - `?` - 显示快捷键帮助

- **触摸手势**（移动设备）：
  - 单击 - 显示/隐藏控制栏
  - 双击 - 播放/暂停
  - 长按 - 快进播放
  - 左滑 - 后退 10 秒
  - 右滑 - 前进 10 秒
  - 上滑 - 增加音量
  - 下滑 - 减少音量

### 🎨 高级功能
- **迷你播放器**：浮动窗口播放
- **弹幕系统**：实时弹幕显示
- **字幕支持**：多语言字幕切换
- **播放列表**：多视频连续播放
- **画质切换**：多分辨率自动/手动切换
- **视频录制**：录制播放片段
- **视频滤镜**：实时视频效果

### 🔧 插件系统
- **插件管理**：动态加载/卸载插件
- **依赖管理**：插件依赖关系处理
- **生命周期**：完整的插件生命周期钩子
- **性能监控**：插件性能统计

### 🎭 主题系统
- **多主题**：内置多种主题风格
- **自定义主题**：支持完全自定义
- **响应式设计**：适配各种屏幕尺寸
- **暗色模式**：支持明暗主题切换

## 📖 使用说明

### 基础用法

```javascript
import { Player } from '@ldesign/video';

// 创建播放器实例
const player = new Player(container, {
  src: 'https://example.com/video.mp4',
  poster: 'https://example.com/poster.jpg',
  width: '100%',
  height: '400px'
});

// 初始化播放器
await player.init();
```

### 插件配置

```javascript
import {
  Player,
  KeyboardShortcuts,
  GestureControl,
  MiniPlayer,
  setupBasicPlayer
} from '@ldesign/video';

const player = new Player(container, config);

// 方式1：手动添加插件
player.use(KeyboardShortcuts, {
  enableDefaultShortcuts: true,
  showHelp: true
});

player.use(GestureControl, {
  enableDefaultGestures: true,
  showFeedback: true
});

// 方式2：使用插件工厂
const factory = await setupBasicPlayer(player, {
  keyboardShortcuts: { showHelp: true },
  gestureControl: { showFeedback: true },
  miniPlayer: { autoEnter: true }
});

await player.init();
```

### 事件监听

```javascript
// 播放器事件
player.on('player:ready', () => {
  console.log('播放器就绪');
});

player.on('media:play', () => {
  console.log('开始播放');
});

player.on('media:pause', () => {
  console.log('暂停播放');
});

// 插件事件
player.on('shortcut:executed', (data) => {
  console.log('快捷键执行:', data);
});

player.on('gesture:executed', (data) => {
  console.log('手势执行:', data);
});
```

### 主题配置

```javascript
import { ThemeManager } from '@ldesign/video';

const themeManager = new ThemeManager();

// 应用主题
themeManager.applyTheme('dark');

// 自定义主题
themeManager.registerTheme('custom', {
  name: 'Custom Theme',
  colors: {
    primary: '#722ED1',
    background: '#000000',
    text: '#ffffff'
  }
});
```

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test
```

### 自定义配置

所有功能都可以通过配置文件 `src/main.js` 进行控制：

```javascript
// 播放器基础配置
const playerConfig = {
  src: 'video-url',
  poster: 'poster-url',
  autoplay: false,
  muted: false,
  loop: false,
  preload: 'metadata'
};

// 插件配置
const pluginConfig = {
  keyboardShortcuts: {
    enableDefaultShortcuts: true,
    showHelp: true,
    globalShortcuts: false
  },
  gestureControl: {
    enableDefaultGestures: true,
    showFeedback: true
  },
  miniPlayer: {
    autoEnter: true,
    draggable: true
  }
};
```

## 📚 相关文档

- [API 文档](../docs/api.md)
- [插件开发指南](../docs/plugin-development.md)
- [主题定制指南](../docs/theming.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进示例项目。

## 📄 许可证

MIT License
