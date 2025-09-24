# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 新增性能监控工具函数模块 (`utils/performance.ts`)
- 新增性能监控 Hook (`hooks/usePerformance.ts`)
- 新增 EditorConfig 配置文件
- 新增 Prettier 代码格式化配置
- 新增贡献指南 (CONTRIBUTING.md)

### Changed
- 优化字符串工具函数性能，预定义常量避免重复创建
- 优化数组工具函数 `uniqueBy`，支持函数参数并提升性能
- 优化 `generateId` 函数，使用 `substring` 替代已废弃的 `substr`
- 改进 TypeScript 配置，添加更严格的类型检查
- 改进 ESLint 配置，启用 Vue 支持并添加更多规则
- 改进 Vitest 配置，提升测试覆盖率要求和报告功能
- 简化 package.json 脚本，移除冗余的构建脚本

### Fixed
- 修复 package.json 中的模板占位符问题
- 移除类型定义中重复的内置类型 (Pick, Omit)

### Removed
- 移除冗余的构建脚本文件

## [0.1.0] - 2024-01-01

### Added
- 初始版本发布
- 基础工具函数模块
- Vue 3 Composition API hooks
- TypeScript 类型定义
- UI 组件 (LSelect, LPopup, LDialog, LButton)
- 完整的测试配置
- 文档和构建配置

### Features
- 🎯 完整的 TypeScript 类型定义
- 🧪 100% 测试覆盖率目标
- 📦 支持 ESM/CJS 双格式输出
- 🔧 Vue 3 Composition API 优化
- 🎨 精美的 UI 组件
- 🌈 丰富的动画效果
- 📚 完整的 API 文档
- 🌐 跨平台支持

### Modules
- **Utils**: 字符串、数组、日期、通用工具等
- **Hooks**: 本地存储、网络状态、防抖节流等
- **Types**: 通用类型定义和实用类型
- **Components**: Select、Popup、Dialog、Button 组件

[Unreleased]: https://github.com/ldesign/ldesign/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ldesign/ldesign/releases/tag/v0.1.0
