# Changelog

所有重要的更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2024-01-20

### 新增
- ✨ 核心 WordViewer 类，支持文档查看和编辑
- 📄 支持 .docx 和 .doc 格式文档
- 🎨 支持浅色/深色主题
- 🔍 文本搜索和高亮功能
- ✏️ 文档编辑功能（文本、格式、图片）
- 📤 多格式导出（PDF、HTML、DOCX、TXT）
- 🔄 缩放和分页功能
- ⚡ Vue 3 组件封装
- ⚛️ React 组件封装
- 🔥 Lit Web Component 封装
- 📦 ESM、CJS、UMD 多种打包格式
- 📝 完整的 TypeScript 类型定义
- 🎯 事件系统（loaded、error、changed 等）
- 🔌 可插拔的渲染引擎（docx-preview、mammoth）
- 📱 响应式设计，支持移动端
- 🌍 国际化支持（中文/英文）

### 特性
- 支持从 File、Blob、URL、ArrayBuffer 加载文档
- 撤销/重做功能
- 文档信息提取
- 自定义工具栏
- 打印友好
- Tree-shaking 支持

### 文档
- README 使用文档
- API 文档
- 示例项目（Vanilla JS、Vue、React）
- TypeScript 类型声明

## [未来计划]

### 计划中
- [ ] 表格编辑支持
- [ ] 批注和修订跟踪
- [ ] 更多导出格式（Markdown、纯文本）
- [ ] 打印预览
- [ ] 协同编辑
- [ ] 移动端优化
- [ ] 更多主题选项
- [ ] 插件系统
- [ ] 性能优化
- [ ] 单元测试
- [ ] E2E 测试

### 考虑中
- [ ] Angular 组件封装
- [ ] Svelte 组件封装
- [ ] 离线缓存
- [ ] WebAssembly 加速
- [ ] 云存储集成



