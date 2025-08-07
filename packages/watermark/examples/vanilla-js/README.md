# 🌊 LDesign Watermark - 原生 JavaScript 示例

这是一个使用 **Vite + 原生 JavaScript** 构建的 LDesign Watermark 水印组件完整示例项目。通过这个示例
，你可以学习如何在原生 JavaScript 项目中使用水印组件的各种功能。

## ✨ 功能特性

- 🎯 **基础文字水印** - 简单易用的文字水印
- 🖼️ **图片水印** - 支持各种图片格式的水印
- 🎨 **Canvas 渲染** - 高性能的 Canvas 渲染模式
- 🎭 **动画效果** - 丰富的水印动画效果
- 📱 **响应式设计** - 自适应不同屏幕尺寸
- 🔒 **安全防护** - 防止水印被恶意删除或修改
- 🎛️ **实时控制** - 交互式控制面板，实时调整水印参数

## 🚀 快速开始

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 启动开发服务器

```bash
# 启动开发服务器
pnpm dev

# 或
npm run dev
```

访问 [http://localhost:3001](http://localhost:3001) 查看示例。

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📖 使用指南

### 基础用法

```javascript
import { createWatermark } from '@ldesign/watermark'

// 创建简单的文字水印
const watermark = await createWatermark('#container', {
  content: '我的水印',
  style: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.15)',
    opacity: 0.8,
  },
})
```

### 高级配置

```javascript
// 创建具有完整配置的水印
const watermark = await createWatermark('#container', {
  content: '高级水印',
  style: {
    fontSize: 18,
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    opacity: 0.2,
    rotate: -22,
  },
  layout: {
    gapX: 100,
    gapY: 80,
    offsetX: 50,
    offsetY: 30,
  },
  animation: {
    type: 'fade',
    duration: 2000,
    iteration: 'infinite',
  },
  security: {
    level: 'high',
    mutationObserver: true,
    styleProtection: true,
  },
  responsive: {
    enabled: true,
    autoResize: true,
  },
})
```

### 图片水印

```javascript
// 使用图片作为水印
const imageWatermark = await createWatermark('#container', {
  content: {
    src: '/path/to/logo.png',
    width: 60,
    height: 30,
    opacity: 0.3,
  },
  layout: {
    gapX: 120,
    gapY: 100,
  },
})
```

### Canvas 渲染模式

```javascript
// 使用 Canvas 渲染获得更好的性能
const canvasWatermark = await createWatermark('#container', {
  content: 'Canvas 水印',
  renderMode: 'canvas',
  style: {
    fontSize: 16,
    color: '#4CAF50',
  },
})
```

## 🎛️ 控制面板功能

示例项目包含一个交互式控制面板，你可以：

- **实时调整水印文字**
- **动态修改字体大小**（12px - 48px）
- **调节透明度**（0 - 1）
- **设置旋转角度**（-90° - 90°）
- **选择文字颜色**
- **切换渲染模式**（DOM / Canvas / SVG）
- **应用/切换/清除水印**

## 📁 项目结构

```
vanilla-js/
├── src/
│   └── main.js          # 主要逻辑和示例代码
├── index.html           # 主页面
├── vite.config.js       # Vite 配置
├── package.json         # 项目配置
└── README.md           # 项目文档
```

## 🔧 配置说明

### Vite 配置

项目使用 Vite 作为构建工具，配置文件 `vite.config.js` 包含：

- 开发服务器端口：3001
- 自动打开浏览器
- 源码映射支持
- 路径别名配置

### 依赖说明

- **@ldesign/watermark**: 水印组件核心库
- **vite**: 现代化的前端构建工具
- **rimraf**: 用于清理构建目录

## 🎨 示例展示

### 1. 基础文字水印

展示最简单的文字水印用法，适合快速上手。

### 2. 图片水印

演示如何使用图片作为水印，支持 PNG、JPG、SVG 等格式。

### 3. Canvas 水印

使用 Canvas 渲染模式，提供更好的性能和更丰富的效果。

### 4. 动画水印

展示各种动画效果，包括淡入淡出、旋转、缩放等。

### 5. 响应式水印

演示水印如何根据容器大小自动调整布局和样式。

### 6. 安全防护水印

展示安全防护功能，防止水印被恶意删除或修改。

## 🔍 调试技巧

1. **开启调试模式**：在配置中设置 `debug: true`
2. **查看控制台**：所有操作都会在控制台输出详细日志
3. **检查元素**：可以在开发者工具中查看水印元素结构
4. **性能监控**：使用浏览器性能工具监控渲染性能

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个示例项目！

## 📄 许可证

MIT License

---

**享受使用 LDesign Watermark！** 🎉
