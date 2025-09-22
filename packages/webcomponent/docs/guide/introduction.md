# 介绍

LDesign WebComponent 是一个基于 [Stencil](https://stenciljs.com/) 构建的高质量 Web Components 组件库。它提供了一套完整的 UI 组件，可以在任何前端框架中使用，包括 React、Vue、Angular 或原生 HTML。

## 特性

### 🚀 高性能
- 基于 Stencil 编译器，生成优化的原生 Web Components
- 运行时开销极小，按需加载
- 支持 Tree Shaking，只打包使用的组件

### 🎨 完整的设计系统
- 基于现代设计理念，参考 TDesign 设计规范
- 完整的设计令牌系统（颜色、字体、间距等）
- 支持主题定制和暗色模式

### 🔧 框架无关
- 可在任何前端框架中使用
- 提供 React、Vue、Angular 的类型定义
- 支持服务端渲染 (SSR)

### 📱 响应式设计
- 移动端优先的设计理念
- 完美适配各种屏幕尺寸
- 支持触摸交互

### ♿ 无障碍支持
- 遵循 WCAG 2.1 AA 标准
- 完整的键盘导航支持
- 屏幕阅读器友好
- 高对比度支持

### 🌍 国际化
- 内置国际化支持
- 支持 RTL 布局
- 可扩展的语言包

## 技术栈

- **编译器**: [Stencil](https://stenciljs.com/) - 生成标准 Web Components
- **样式**: Less + CSS Variables - 支持主题定制
- **类型**: TypeScript - 完整的类型支持
- **测试**: Jest + Stencil Testing - 完整的测试覆盖
- **文档**: VitePress - 现代化的文档系统

## 浏览器支持

LDesign WebComponent 支持所有现代浏览器：

| ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) |
| --- | --- | --- | --- |
| Chrome ≥ 60 | Firefox ≥ 63 | Safari ≥ 11 | Edge ≥ 79 |

对于不支持 Web Components 的旧版浏览器，我们提供了 polyfill 支持。

## 设计原则

### 一致性 Consistency
- 统一的视觉风格和交互行为
- 遵循既定的设计规范和模式

### 反馈 Feedback
- 及时响应用户操作
- 清晰的状态变化提示

### 效率 Efficiency
- 简化用户操作流程
- 提供快捷操作方式

### 可控 Controllability
- 用户可以自由控制界面
- 支持撤销和重做操作

## 开源协议

LDesign WebComponent 基于 [MIT](https://opensource.org/licenses/MIT) 协议开源，你可以自由地使用、修改和分发。

## 贡献

我们欢迎社区贡献！如果你想为 LDesign WebComponent 做出贡献，请查看我们的[贡献指南](https://github.com/ldesign/webcomponent/blob/main/CONTRIBUTING.md)。

## 支持

如果你在使用过程中遇到问题，可以通过以下方式获取帮助：

- [GitHub Issues](https://github.com/ldesign/webcomponent/issues) - 报告 Bug 或提出功能请求
- [GitHub Discussions](https://github.com/ldesign/webcomponent/discussions) - 社区讨论
- [官方文档](/) - 查看详细的使用文档

## 下一步

- [快速开始](/guide/getting-started) - 了解如何在项目中使用 LDesign WebComponent
- [安装指南](/guide/installation) - 详细的安装说明
- [组件总览](/components/button) - 查看所有可用组件
