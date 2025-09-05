# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 初始版本发布
- 双打包核心支持 (Rollup & Rolldown)
- 多库类型自动检测和支持
- 智能配置生成
- 性能监控和分析
- 完整的 CLI 工具
- TypeScript 优先支持
- 插件系统架构

### Features
- **核心功能**
  - LibraryBuilder 主控制器类
  - ConfigManager 配置管理器
  - StrategyManager 策略管理器
  - PluginManager 插件管理器
  - LibraryDetector 库类型检测器
  - PerformanceMonitor 性能监控器

- **适配器系统**
  - RollupAdapter Rollup 适配器
  - RolldownAdapter Rolldown 适配器
  - BundlerAdapterFactory 适配器工厂

- **策略系统**
  - TypeScriptStrategy TypeScript 库策略
  - Vue2Strategy Vue2 组件库策略
  - Vue3Strategy Vue3 组件库策略
  - StyleStrategy 样式库策略
  - MixedStrategy 混合库策略

- **CLI 工具**
  - `builder build` 构建命令
  - `builder watch` 监听命令
  - `builder init` 初始化命令
  - `builder analyze` 分析命令
  - `builder clean` 清理命令

- **配置系统**
  - 支持 TypeScript/JavaScript/JSON 配置文件
  - 函数式配置支持
  - 环境特定配置
  - 配置验证和合并

- **类型系统**
  - 完整的 TypeScript 类型定义
  - 严格的类型检查
  - 智能类型推导

### Technical Details
- **架构设计**
  - 事件驱动的构建流程
  - 依赖注入模式
  - 插件化架构
  - 策略模式

- **性能优化**
  - 智能缓存机制
  - 增量构建支持
  - 并行处理
  - 内存优化

- **开发体验**
  - 详细的错误信息和建议
  - 进度显示和日志
  - 热重载支持
  - 调试模式

### Dependencies
- **核心依赖**
  - chalk: 终端颜色输出
  - commander: CLI 框架
  - fast-glob: 文件匹配
  - jiti: 动态导入支持
  - picocolors: 轻量级颜色库
  - chokidar: 文件监听

- **对等依赖**
  - rollup: Rollup 打包器 (可选)
  - rolldown: Rolldown 打包器 (可选)

### Development
- **开发工具**
  - TypeScript 5.0+
  - Vitest 测试框架
  - ESLint 代码检查
  - Prettier 代码格式化

- **构建工具**
  - 使用自身进行构建 (自举)
  - 支持多种输出格式
  - 类型声明生成

### Documentation
- 完整的 README 文档
- API 文档和类型定义
- 使用示例和最佳实践
- CLI 命令参考

## [1.0.0] - 2024-01-XX

### Added
- 初始版本发布

[Unreleased]: https://github.com/ldesign-org/ldesign/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ldesign-org/ldesign/releases/tag/v1.0.0
