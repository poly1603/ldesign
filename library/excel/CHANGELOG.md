# 更新日志

所有重要的项目更改都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2025-01-20

### 新增

#### 核心功能
- ✨ 完整的 Excel 文件解析功能，支持 .xlsx、.xls、.csv 格式
- ✨ 基于 Luckysheet 的高性能渲染引擎
- ✨ 虚拟滚动技术，支持 10 万+ 行大文件
- ✨ Web Worker 支持，提升大文件解析性能
- ✨ 完整保留 Excel 样式（字体、颜色、边框、对齐等）

#### 编辑功能
- ✏️ 单元格编辑和批量编辑
- ✏️ 公式计算（SUM、AVERAGE、IF 等常用函数）
- ✏️ 复制、粘贴、撤销、重做
- ✏️ 行列插入、删除、隐藏

#### 交互功能
- 🔍 强大的搜索、筛选、排序功能
- ❄️ 冻结窗格
- 📊 多工作表切换和管理
- 🖱️ 完整的鼠标和键盘交互

#### 导出功能
- 💾 导出为 Excel (.xlsx)
- 📋 导出为 CSV
- 🌐 导出为 HTML
- 📄 导出为 JSON
- 📸 导出截图 (PNG)

#### 框架支持
- 📦 原生 JavaScript API
- 🎨 Vue 3 组件封装
- ⚛️ React 组件封装（支持 Hooks）
- 🔥 Lit Web Component 封装

#### UI 和主题
- 🎨 亮色和暗色主题支持
- 🌍 国际化支持（中文、英文）
- 📱 响应式设计，支持移动端
- 🎯 可自定义样式

#### 性能优化
- ⚡ 虚拟滚动优化
- 🔧 懒加载和分块加载
- 💪 内存优化和垃圾回收
- 🚀 代码分割和 Tree Shaking

#### 开发体验
- 📝 完整的 TypeScript 类型定义
- 📚 详细的 API 文档
- 📖 使用指南和最佳实践
- 🎯 丰富的示例代码

### 文档
- 📄 完整的 README 文档
- 📘 详细的 API 文档
- 📗 使用指南
- 📙 常见问题解答 (FAQ)
- 📕 贡献指南

### 示例
- 🌐 原生 JavaScript 示例
- 🎨 Vue 3 示例项目
- ⚛️ React 示例项目
- 🔥 Lit Web Component 示例

### 技术栈
- TypeScript 5.3
- Rollup 4.9
- SheetJS (xlsx) 0.18
- Luckysheet 2.1
- Vue 3.4
- React 18.2
- Lit 3.1

---

## [未发布]

### 计划中的功能
- [ ] 图表支持
- [ ] 数据透视表
- [ ] 条件格式高级功能
- [ ] 批注和注释
- [ ] 数据验证高级规则
- [ ] 打印预览和打印功能
- [ ] 协同编辑支持
- [ ] 更多公式函数
- [ ] 插件系统
- [ ] 主题定制器

---

[1.0.0]: https://github.com/ldesign/excel-viewer/releases/tag/v1.0.0


