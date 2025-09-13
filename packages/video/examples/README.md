# @ldesign/video 示例项目

这个目录包含了 @ldesign/video 视频播放器组件库的各种使用示例。

## 📁 项目结构

```
examples/
├── README.md                 # 本文件
├── vanilla/                  # 原生 JavaScript 示例
│   ├── basic/               # 基础使用示例
│   ├── plugins/             # 插件使用示例
│   ├── themes/              # 主题使用示例
│   └── advanced/            # 高级功能示例
├── react/                   # React 框架示例
├── vue/                     # Vue 框架示例
└── shared/                  # 共享资源
    ├── assets/              # 示例视频文件
    └── styles/              # 共享样式
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd examples/vanilla
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

### 3. 访问示例

打开浏览器访问 `http://localhost:5173`，选择不同的示例页面。

## 📖 示例说明

### 基础示例 (Basic)

- **basic.html** - 最简单的播放器使用
- **controls.html** - 自定义控制栏
- **events.html** - 事件处理示例

### 插件示例 (Plugins)

- **danmaku.html** - 弹幕插件使用
- **subtitle.html** - 字幕插件使用
- **screenshot.html** - 截图插件使用
- **pip.html** - 画中画插件使用
- **multiple-plugins.html** - 多插件协作

### 主题示例 (Themes)

- **default-theme.html** - 默认主题
- **dark-theme.html** - 深色主题
- **custom-theme.html** - 自定义主题

### 高级示例 (Advanced)

- **custom-plugin.html** - 自定义插件开发
- **performance.html** - 性能优化示例
- **responsive.html** - 响应式设计

## 🛠️ 开发指南

### 添加新示例

1. 在对应的分类目录下创建 HTML 文件
2. 按照现有示例的结构编写代码
3. 在主页面添加链接
4. 更新相关文档

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 添加详细的注释说明
- 提供完整的错误处理

## 📚 相关文档

- [API 文档](../docs/api.md)
- [插件开发指南](../docs/plugin-development.md)
- [主题定制指南](../docs/theme-customization.md)
- [最佳实践](../docs/best-practices.md)

## 🤝 贡献

欢迎提交新的示例或改进现有示例！请确保：

1. 代码质量高，注释详细
2. 示例具有教育意义
3. 遵循项目的代码规范
4. 更新相关文档

## 📄 许可证

MIT License
