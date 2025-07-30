# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-XX

### Added

#### 核心功能
- ✅ 完整的 I18n 核心实现
- ✅ 异步初始化和语言切换
- ✅ 插值和复数处理支持
- ✅ 事件系统和错误处理
- ✅ 批量翻译和缓存优化
- ✅ 嵌套键访问支持

#### 工具函数
- ✅ 路径工具：嵌套对象访问、深度合并、扁平化
- ✅ 插值工具：字符串插值、HTML转义、参数验证
- ✅ 复数工具：多语言复数规则、ICU语法支持

#### 组件系统
- ✅ 语言检测器：浏览器语言自动检测
- ✅ 存储管理：localStorage、sessionStorage、Cookie、内存存储
- ✅ LRU缓存：高性能缓存机制
- ✅ 加载器：静态、动态、HTTP加载器

#### 内置语言包
- ✅ 英语 (en)：完整的翻译内容
- ✅ 中文简体 (zh-CN)：完整的翻译内容  
- ✅ 日语 (ja)：完整的翻译内容
- ✅ 每种语言包含：common、validation、menu、date 四个模块

#### Vue 3 集成
- ✅ Vue 插件：完整的插件系统
- ✅ 组合式 API：useI18n、useLanguageSwitcher 等
- ✅ 指令支持：v-t 指令用于模板翻译
- ✅ 类型定义：完整的 Vue 相关类型

#### 构建系统
- ✅ 多格式输出：ESM、CommonJS、UMD
- ✅ TypeScript 支持：完整的类型定义
- ✅ Tree-shaking 支持：按需导入
- ✅ 压缩版本：生产环境优化

#### 文档和示例
- ✅ VitePress 文档系统
- ✅ 完整的 API 参考文档
- ✅ Vanilla JavaScript 示例
- ✅ Vue 3 示例
- ✅ 最佳实践指南

#### 测试
- ✅ 单元测试：核心功能和工具函数
- ✅ Vitest 测试框架
- ✅ 测试覆盖率报告

### Features

- **🌍 Framework Agnostic**: Works in any JavaScript environment
- **🎯 Vue 3 Integration**: Complete plugin and composables API
- **🔒 TypeScript Support**: Full type definitions and type safety
- **⚡ High Performance**: Built-in LRU cache mechanism
- **🔄 Dynamic Loading**: Lazy loading and preloading strategies
- **🌐 Auto Detection**: Smart browser language preference detection
- **💾 Persistent Storage**: Multiple storage options support
- **🔤 Interpolation**: Powerful string interpolation with HTML escaping
- **📊 Pluralization**: Multi-language plural rules and ICU syntax
- **🎨 Nested Keys**: Dot-separated nested translation keys

### Technical Details

- Built with TypeScript for type safety
- Rollup-based build system with multiple output formats
- Comprehensive test suite with Vitest
- VitePress documentation system
- ESLint configuration for code quality
- Support for modern JavaScript features

### Breaking Changes

None (initial release)

### Migration Guide

This is the initial release, no migration needed.

---

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Documentation

```bash
pnpm docs:dev
```

### Examples

```bash
# Vanilla JavaScript example
pnpm example:vanilla

# Vue 3 example  
pnpm example:vue
```
