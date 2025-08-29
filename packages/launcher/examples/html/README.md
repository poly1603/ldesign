# Native HTML Example

这是一个使用 Vite Launcher 创建的原生 HTML 项目示例。

## 特性

- 🌐 纯 HTML/CSS/JavaScript
- ⚡ Vite 开发服务器
- 🔥 热模块替换 (HMR)
- 📦 优化构建
- 📱 响应式设计

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
html-example/
├── src/
│   ├── main.js          # 主 JavaScript 文件
│   └── style.css        # 主样式文件
├── index.html           # HTML 模板
├── package.json         # 项目配置
└── vite.config.js       # Vite 配置
```

## 功能

- **交互式计数器**: 点击按钮增减计数
- **现代 CSS**: 使用 Flexbox 和 CSS Grid
- **响应式设计**: 适配移动设备
- **模块化 JavaScript**: 使用 ES6 模块

## 使用 Vite Launcher

这个项目可以通过 Vite Launcher 创建：

```typescript
import { createProject } from '@ldesign/launcher'

await createProject('./my-html-app', 'html')
```

## 为什么选择原生 HTML？

- 🚀 **快速开始**: 无需学习复杂的框架
- 📚 **易于理解**: 直接的 HTML/CSS/JS
- 🎯 **轻量级**: 没有额外的框架开销
- 🔧 **灵活性**: 完全控制代码结构
- 📖 **学习友好**: 适合初学者和教学
