# Changelog

## [1.0.0] - 2024-01-10

### Added
- ✨ 完整的富文本编辑器核心功能
- ✨ 插件系统支持
- ✨ 内置图标系统（移除 lucide 依赖）
- ✨ Vue 3 适配器
- ✨ React 18 适配器
- ✨ 完整的工具栏组件
- ✨ 20+ 内置插件
- ✨ 完整的文档系统（VitePress）
- ✨ Vite + TypeScript 示例项目

### Features

#### 核心功能
- Editor 核心类
- Document 文档模型
- Selection 选区管理
- Command 命令系统
- Plugin 插件系统
- Schema 文档结构
- EventEmitter 事件系统

#### 内置插件
- 基础格式化：Bold, Italic, Underline, Strike, Code
- 标题：Heading (H1-H6)
- 列表：BulletList, OrderedList, TaskList
- 块级元素：Blockquote, CodeBlock
- 媒体：Link, Image
- 表格：Table（创建、编辑、删除）
- 历史记录：Undo, Redo
- 对齐：AlignLeft, AlignCenter, AlignRight, AlignJustify
- 清除格式：ClearFormat

#### UI 组件
- Toolbar 工具栏组件
- 内置 SVG 图标系统（18 个图标）
- 亮色/暗色主题支持
- 响应式设计

#### 框架支持
- 原生 JavaScript/TypeScript
- Vue 3 组件和 Composition API
- React 18 组件和 Hooks

#### 示例项目
- 基础示例（原生 JS）
- Vue 3 示例（Composition API）
- React 示例（Hooks）
- 高级功能示例（表格、自定义插件、主题）

#### 文档
- 完整的 VitePress 文档站点
- 快速开始指南
- API 参考文档
- 插件开发指南
- 示例和最佳实践

### Changed
- 🔧 使用内置 SVG 图标替代 lucide 依赖
- 🔧 优化工具栏图标渲染性能
- 🔧 改进插件系统架构

### Technical Details
- TypeScript 5.7
- Vite 6.0
- Vue 3.5
- React 18.3
- 无外部图标库依赖

### Documentation
- 📚 完整的中文文档
- 📚 API 参考
- 📚 使用指南
- 📚 插件开发教程
- 📚 示例代码

### Performance
- ⚡ 优化的渲染机制
- ⚡ 懒加载支持
- ⚡ Tree-shaking 友好
- ⚡ 轻量级打包

### Developer Experience
- 🎯 完整的 TypeScript 类型
- 🎯 清晰的代码注释
- 🎯 丰富的示例
- 🎯 详细的文档

## 文件统计

- 总文件数：60+
- 代码行数：8000+
- 文档页面：20+
- 示例数量：4 个
- 插件数量：20+

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## License

MIT
