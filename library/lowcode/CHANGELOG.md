# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2024-10-21

### 🎉 重大更新

#### 新增功能

- ✨ **主题系统** - 支持 6 种主题色（蓝色、紫色、绿色、橙色、红色、青色）
- 🌙 **暗黑模式** - 完整的暗黑模式支持，使用 CSS Variables 实现
- 🌍 **多语言增强** - 改进的国际化系统，支持中英文切换
- ⌨️ **快捷键系统** - 完整的快捷键支持（Ctrl+S、Ctrl+Z、Ctrl+Y 等）
- 🌳 **组件树面板** - 可视化组件层级关系，支持展开/折叠
- 🗄️ **数据源管理** - 数据源管理面板，支持 REST API 配置
- ⚙️ **设置面板** - 集中管理主题、语言、编辑器配置
- 📱 **响应式预览** - 桌面/平板/手机多设备预览切换

#### UI/UX 改进

- 🎨 **图标系统升级** - 所有 emoji 图标替换为 lucide-vue-next 图标
- 💫 **现代化 UI** - 重新设计的界面，更美观的视觉效果
- 🎯 **改进的布局** - 左右侧边栏支持面板切换
- ✨ **动画效果** - 添加过渡动画，提升交互体验
- 🎨 **优化的样式** - 统一的设计语言，更好的视觉一致性

#### 技术改进

- 📦 **依赖更新** - 添加 lucide-vue-next 图标库
- 🔧 **CSS Variables** - 使用 CSS 变量支持主题动态切换
- 🎨 **Less 样式重构** - 优化样式结构，支持暗黑模式
- 📝 **类型定义增强** - 添加主题、国际化相关类型定义
- 🔌 **Composables 扩展** - 新增 useTheme、useI18n、useShortcuts

#### 组件更新

- 🆕 `Icon.vue` - 图标包装组件
- 🆕 `OutlinePanel.vue` - 组件树面板
- 🆕 `OutlineTreeNode.vue` - 树节点组件
- 🆕 `SettingsPanel.vue` - 设置面板
- 🆕 `DataSourcePanel.vue` - 数据源管理面板
- 🔄 `LowcodeEditor.vue` - 完全重构，集成所有新功能

#### 文档更新

- 📚 更新 README，添加主题和国际化使用说明
- 📖 添加快捷键文档
- ✍️ 更新示例代码

### 🐛 修复

- 修复物料拖拽的一些边界情况
- 优化组件选择逻辑
- 改进画布缩放体验

### ⚠️ 破坏性变更

- 主编辑器组件完全重构，API 基本保持兼容
- 样式变量系统从 Less 变量迁移到 CSS Variables
- 图标系统从 emoji 迁移到 lucide-vue-next

### 📦 依赖

- 新增: `lucide-vue-next@^0.468.0`

## [1.0.0] - 2024-10-21

### Added
- 🎉 初始版本发布
- ✨ Grid/Flex 布局系统
- ✨ 拖拽式页面构建
- ✨ 物料系统（支持自定义组件库）
- ✨ 数据源管理（REST/GraphQL/WebSocket）
- ✨ 代码生成器（Composition API + Options API）
- ✨ 实时预览功能
- ✨ 撤销/重做功能
- ✨ 完整的 TypeScript 支持
- ✨ 中英文国际化

### Features
- Schema 驱动的页面描述
- 12列 Grid 网格系统
- 可视化属性配置
- 数据绑定系统
- 事件处理配置
- 响应式布局支持

### Documentation
- 完整的 API 文档
- 快速开始指南
- 示例项目

### Technical
- Vue 3.5+ 支持
- TypeScript 5.6+
- 基于 @ldesign/builder 构建
- Pinia 状态管理
- Monaco Editor 代码编辑

## [Unreleased]

### Planned
- [ ] 更多内置组件
- [ ] 主题定制
- [ ] 插件系统扩展
- [ ] 协同编辑
- [ ] 版本管理
- [ ] 云端存储


