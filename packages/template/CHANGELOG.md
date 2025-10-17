# 更新日志

所有重要的项目变更都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.1.1] - 2024-09-23

### 🔧 优化改进

#### 代码质量提升
- **代码清理**: 清理调试信息、测试注释，修复版本号不一致问题
- **重复代码消除**: 通过工厂函数消除重复代码，提升可维护性
- **类型安全**: 完善 TypeScript 类型定义，确保类型安全

#### 工厂函数系统
- **新增工厂函数**: 创建 `createTemplateScanner()`, `createSimpleTemplateScanner()`, `createCacheConfig()`, `createDeviceConfig()` 等工厂函数
- **配置简化**: 将 24 行重复的 TemplateScanner 配置简化为 2 行
- **类型定义**: 新增 `src/types/factory.ts` 工厂函数类型定义

#### 性能大幅优化
- **智能预加载**: 实现 `IntelligentPreloader` 类，支持交叉观察器、重试机制、指数退避
- **内存监控**: 添加自动内存监控功能，在内存使用率过高时主动清理缓存
- **缓存优化**: 增强 `AdvancedCache` 类，支持激进清理策略
- **性能监控**: 实现 `PerformanceMonitor` 类，支持指标记录和统计

#### 构建配置优化
- **Package.json 简化**: 将复杂的 exports 字段从 120+ 行简化到 ~25 行
- **构建配置**: 创建 `ldesign.config.ts` 构建配置文件
- **大小监控**: 更新 `.size-limit.json`，添加新模块的大小限制
- **构建验证**: 创建 `scripts/validate-build.ts` 构建验证脚本

#### 测试完善
- **工厂函数测试**: 创建 `tests/utils/factory.test.ts` 工厂函数测试
- **性能功能测试**: 创建 `tests/utils/performance.test.ts` 性能功能测试
- **测试工具**: 创建 `src/test-utils/setup.ts` 测试工具设置
- **内存监控测试**: 为缓存系统的内存监控功能添加测试

#### 文档更新
- **README 更新**: 添加工厂函数使用示例和性能优化相关文档
- **API 文档**: 更新 API 文档，包含新的类型定义
- **使用指南**: 添加性能优化相关的使用指南

### 🐛 修复
- **类型导出冲突**: 修复 `StrictCacheStats` 重复导出问题
- **控制台输出**: 优化控制台输出，只在调试模式下显示
- **Vue 模板语法**: 修复 Vue 模板中的 Less 注释语法问题

## [0.3.0] - 2025-10-17

### 🆕 新增功能

#### Vue 指令系统

- **v-template 指令**: 新增 Vue 指令快速渲染模板
  - 基本语法: `v-template="{ category, device, name }"`
  - 简洁语法: `v-template:login.desktop.default`
  - 动态配置: `v-template:login="{ device, name }"`
  - 自定义加载、错误处理和过渡动画
  - 自动样式注入

#### 高级 Hooks 系统

- **useTemplateLifecycle**: 完整的模板生命周期管理
  - onBeforeLoad - 加载前钩子
  - onLoaded - 加载完成钩子
  - onBeforeUnload - 卸载前钩子
  - onError - 错误处理钩子
  - onRetry - 重试钩子
  - onTransition - 切换过渡钩子

- **useTemplatePrefetch**: 智能预加载系统
  - 多种预加载策略: eager, lazy, smart, idle
  - 批量预加载支持
  - 并发控制和延迟配置
  - 相关模板预加载

- **useTemplateNavigation**: 模板导航历史管理
  - 前进/后退导航
  - 历史记录管理
  - 导航状态跟踪

- **useTemplatePerformance**: 性能监控
  - 加载时间测量
  - 平均加载时间统计
  - 性能指标收集

#### 增强的错误处理

- **TemplateError 类**: 详细的错误信息
  - 错误类型分类
  - 用户友好的错误消息
  - 恢复建议
  - 错误上下文信息

- **ErrorRecoveryManager**: 自动错误恢复
  - 可配置的恢复策略
  - 重试机制（带指数退避）
  - 网络错误自动重试
  - 降级到默认模板

- **Error Boundaries**: 错误边界组件
  - 自动错误捕获
  - 自定义错误 UI
  - 恢复操作支持

### 🔧 改进

- **代码清理**: 
  - 移除冗余的文档文件
  - 清理调试用的 console.log 语句
  - 优化导入语句
  - 改进 TypeScript 类型定义

- **构建优化**:
  - 减小打包体积
  - 优化树摇（Tree-shaking）
  - 改进代码分割

- **开发体验**:
  - 更好的类型推导
  - 更清晰的错误提示
  - 更完善的文档

### 🐛 修复

- 修复了设备检测在 SSR 环境下的问题
- 修复了模板缓存清理不完全的问题
- 修复了并发加载时的竞态条件

## [0.2.0] - 2024-09-30

### 🆕 新增功能

#### 性能优化系统

- **智能预加载**: 新增 `preloadTemplate()` 和 `preloadCommonTemplates()` 方法
- **性能监控**: 新增 `getPerformanceMetrics()` 方法，支持缓存命中率、加载时间等指标监控
- **懒加载组件**: 新增 `LazyTemplate` 组件，基于 Intersection Observer API 实现智能懒加载
- **性能监控组件**: 新增 `PerformanceMonitor` 组件，实时显示 FPS、内存使用、缓存统计等性能指标

#### 虚拟滚动系统

- **虚拟滚动 Hook**: 新增 `useVirtualScroll` Composable，支持大量数据的高效渲染
- **简化虚拟滚动**: 新增 `useSimpleVirtualScroll` Composable，适用于简单列表场景
- **搜索和过滤**: 虚拟滚动支持实时搜索、过滤、跳转等功能
- **性能统计**: 提供渲染比例、可见范围等性能统计信息

#### 增强的 TemplateRenderer

- **懒加载支持**: 新增 `lazy` 属性，支持按需加载模板
- **预加载支持**: 新增 `preload` 属性，支持预加载常用模板
- **性能监控**: 新增 `enablePerformanceMonitor` 属性，支持实时性能监控
- **加载事件**: 新增 `load-start`、`load-end`、`performance-update` 事件

### 🔧 改进

#### 核心架构优化

- **模块化重构**: 将核心功能拆分为独立模块（cache、device、scanner）
- **类型系统完善**: 新增 `ResponsiveBreakpoints`、`PerformanceMetrics` 等类型定义
- **错误处理增强**: 改进错误处理机制，提供更详细的错误信息

#### 缓存系统优化

- **LRU 缓存**: 优化 LRU 缓存算法，提升缓存效率
- **缓存统计**: 新增缓存命中率、缓存大小等统计信息
- **自动清理**: 支持自动清理过期缓存项

#### 设备检测优化

- **断点配置**: 新增 `xs` 断点，完善响应式断点系统
- **检测精度**: 提升设备类型检测的准确性
- **性能优化**: 优化设备检测的性能开销

### 📚 文档更新

#### API 文档

- **Vue 组件 API**: 新增完整的 Vue 组件 API 文档
- **Vue Composables API**: 新增 Vue Composables API 文档
- **性能优化指南**: 更新性能优化指南，包含新功能使用说明

#### 示例项目

- **性能演示页面**: 新增性能优化功能演示页面
- **虚拟滚动演示**: 新增虚拟滚动技术演示页面
- **交互式示例**: 增强现有示例页面，添加性能监控面板

### 🧪 测试覆盖

#### 新增测试

- **LazyTemplate 组件测试**: 完整的懒加载组件测试套件
- **PerformanceMonitor 组件测试**: 性能监控组件测试套件
- **useVirtualScroll 测试**: 虚拟滚动 Hook 测试套件
- **性能优化功能测试**: 预加载、性能监控等功能的单元测试

#### 测试覆盖率

- **组件测试覆盖率**: 90%+
- **Composables 测试覆盖率**: 85%+
- **核心功能测试覆盖率**: 95%+

### 🐛 修复

- 修复 TemplateManager 中设备监听器的内存泄漏问题
- 修复缓存清理方法的返回值类型问题
- 修复设备检测中可能出现的 undefined 错误
- 修复模板扫描器中的路径解析问题

### ⚠️ 破坏性变更

- `ResponsiveBreakpoints` 接口新增 `xs` 属性（向后兼容）
- `TemplateManager.cleanupCache()` 方法不再返回清理统计信息
- 部分内部 API 重构，不影响公共 API

### 📦 依赖更新

- 更新 Vue 相关依赖到最新稳定版本
- 更新开发工具依赖
- 优化打包配置，减小包体积

## [0.1.0] - 2024-01-XX

### 🎉 首次发布

#### 核心功能

- **TemplateManager**: 模板管理核心类
- **TemplateRenderer**: Vue 模板渲染组件
- **useTemplate**: Vue Composable Hook
- **响应式设计**: 自动设备检测和适配
- **智能缓存**: LRU 缓存机制
- **TypeScript 支持**: 完整的类型定义

#### 模板系统

- **多设备支持**: 桌面、平板、移动端适配
- **动态加载**: 按需加载模板资源
- **模板扫描**: 自动扫描和注册模板
- **事件系统**: 完整的事件监听和处理

#### 开发体验

- **零配置**: 开箱即用的默认配置
- **灵活配置**: 支持自定义配置选项
- **完整文档**: 详细的 API 文档和使用指南
- **示例项目**: 完整的示例和演示

---

## 版本说明

- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

## 贡献指南

欢迎提交 Issue 和 Pull Request！请查看 [贡献指南](./CONTRIBUTING.md) 了解详细信息。

## 许可证

[MIT License](./LICENSE)
