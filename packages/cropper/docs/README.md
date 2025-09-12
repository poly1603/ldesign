# LDESIGN Cropper 文档

欢迎来到 LDESIGN Cropper 的完整文档！这里包含了你需要了解的所有信息。

## 📚 文档结构

### 🚀 [指南](./guide/)
- [介绍](./guide/index.md) - 了解 LDESIGN Cropper 的核心特性
- [快速开始](./guide/getting-started.md) - 5分钟快速上手
- [安装](./guide/installation.md) - 详细的安装说明
- [基本用法](./guide/basic-usage.md) - 学习基础使用方法
- [裁剪形状](./guide/crop-shapes.md) - 掌握不同的裁剪形状
- [交互操作](./guide/interactions.md) - 了解丰富的交互功能
- [输出配置](./guide/output.md) - 配置输出格式和质量

### 🌐 框架集成
- [Vue 3](./guide/vue.md) - Vue 3 集成指南
- [React](./guide/react.md) - React 集成指南
- [Angular](./guide/angular.md) - Angular 集成指南
- [原生 JavaScript](./guide/vanilla.md) - 原生 JS 使用方法

### 🎨 高级功能
- [主题定制](./guide/theming.md) - 自定义主题和样式
- [国际化](./guide/i18n.md) - 多语言支持
- [性能优化](./guide/performance.md) - 性能优化技巧
- [插件开发](./guide/plugins.md) - 开发自定义插件

### 📖 [API 参考](./api/)
- [概览](./api/index.md) - API 总览
- [Cropper 类](./api/cropper.md) - 核心 Cropper 类
- [配置选项](./api/options.md) - 完整的配置选项
- [事件系统](./api/events.md) - 事件监听和处理
- [类型定义](./api/types.md) - TypeScript 类型定义

### 🔧 框架适配器
- [Vue 适配器](./api/vue-adapter.md) - Vue 组件 API
- [React 适配器](./api/react-adapter.md) - React 组件 API
- [Angular 适配器](./api/angular-adapter.md) - Angular 组件 API

### 🛠️ 工具函数
- [图片工具](./api/image-utils.md) - 图片处理工具
- [几何工具](./api/geometry-utils.md) - 几何计算工具
- [性能工具](./api/performance-utils.md) - 性能监控工具

### 💡 [示例](./examples/)
- [概览](./examples/index.md) - 示例总览
- [基本裁剪](./examples/basic-cropping.md) - 基础裁剪示例
- [形状裁剪](./examples/shape-cropping.md) - 不同形状裁剪
- [比例限制](./examples/aspect-ratio.md) - 宽高比控制

### 🌐 框架示例
- [Vue 3 示例](./examples/vue.md) - Vue 3 完整示例
- [React 示例](./examples/react.md) - React 完整示例
- [Angular 示例](./examples/angular.md) - Angular 完整示例
- [原生 JS 示例](./examples/vanilla.md) - 原生 JavaScript 示例

### 🎨 高级示例
- [自定义主题](./examples/custom-theme.md) - 主题定制示例
- [批量处理](./examples/batch-processing.md) - 批量图片处理
- [移动端适配](./examples/mobile.md) - 移动端优化
- [性能优化](./examples/performance.md) - 性能优化实践

### ⚙️ [配置参考](./config/)
- [概览](./config/index.md) - 配置总览
- [基础配置](./config/basic.md) - 基本配置选项
- [主题配置](./config/theme.md) - 主题系统配置
- [工具栏配置](./config/toolbar.md) - 工具栏定制
- [性能配置](./config/performance.md) - 性能相关配置

## 🚀 快速导航

### 新手入门
1. [安装 LDESIGN Cropper](./guide/installation.md)
2. [5分钟快速上手](./guide/getting-started.md)
3. [查看基础示例](./examples/basic-cropping.md)

### 框架集成
- **Vue 开发者**: [Vue 集成指南](./guide/vue.md) → [Vue 示例](./examples/vue.md)
- **React 开发者**: [React 集成指南](./guide/react.md) → [React 示例](./examples/react.md)
- **Angular 开发者**: [Angular 集成指南](./guide/angular.md) → [Angular 示例](./examples/angular.md)
- **原生 JS**: [原生 JS 指南](./guide/vanilla.md) → [原生 JS 示例](./examples/vanilla.md)

### 高级用法
- [自定义主题](./guide/theming.md) - 打造独特的视觉风格
- [性能优化](./guide/performance.md) - 处理大图片和提升性能
- [插件开发](./guide/plugins.md) - 扩展功能

### API 查询
- [完整 API 参考](./api/cropper.md) - 查找具体方法
- [配置选项](./api/options.md) - 查找配置参数
- [事件列表](./api/events.md) - 查找事件类型

## 🎯 常见使用场景

### 内容管理系统
```javascript
// 用户头像裁剪
const cropper = new Cropper({
  container: '#avatar-cropper',
  aspectRatio: 1, // 正方形头像
  shape: 'circle',
  minCropBoxWidth: 100,
  minCropBoxHeight: 100
})
```

### 电商平台
```javascript
// 商品图片处理
const cropper = new Cropper({
  container: '#product-cropper',
  aspectRatio: 4/3, // 商品展示比例
  maxCropBoxWidth: 800,
  maxCropBoxHeight: 600,
  quality: 0.9
})
```

### 社交应用
```javascript
// 动态图片编辑
const cropper = new Cropper({
  container: '#social-cropper',
  aspectRatio: 16/9, // 社交媒体比例
  toolbar: {
    show: true,
    tools: ['zoom-in', 'zoom-out', 'rotate-left', 'rotate-right']
  }
})
```

## 🆘 获取帮助

### 问题反馈
- [GitHub Issues](https://github.com/ldesign/cropper/issues) - 报告 bug 或功能请求
- [GitHub Discussions](https://github.com/ldesign/cropper/discussions) - 社区讨论

### 社区资源
- [官方文档](https://ldesign-cropper.vercel.app) - 在线文档
- [示例集合](../examples/) - 实际使用示例
- [更新日志](https://github.com/ldesign/cropper/releases) - 版本更新记录

### 贡献指南
- [贡献代码](https://github.com/ldesign/cropper/blob/main/CONTRIBUTING.md)
- [报告问题](https://github.com/ldesign/cropper/issues/new)
- [功能建议](https://github.com/ldesign/cropper/discussions/new)

## 📄 许可证

LDESIGN Cropper 采用 [MIT 许可证](https://github.com/ldesign/cropper/blob/main/LICENSE)。

---

<div align="center">
  <p>Built with ❤️ by LDESIGN Team</p>
  <p>
    <a href="https://github.com/ldesign/cropper">GitHub</a> •
    <a href="https://www.npmjs.com/package/@ldesign/cropper">NPM</a> •
    <a href="https://ldesign.dev">LDESIGN</a>
  </p>
</div>
