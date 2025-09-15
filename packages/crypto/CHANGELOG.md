# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- 文档：完善 README（导出结构、API 总览、安全建议、FAQ、变更日志链接）
- 文档：修复 docs 示例（hash、encoding、aes、rsa）的 SSR 构建问题，移除残留 HTML/CSS
- 构建：继续沿用 ldesign-builder，未变更工具链

## [0.1.0] - 2024-12-19

### Added

#### 核心功能

- 实现了完整的 AES 对称加密算法（支持 AES-128/192/256）
- 实现了 RSA 非对称加密算法和数字签名功能
- 实现了所有主流哈希算法（MD5、SHA-1、SHA-224、SHA-256、SHA-384、SHA-512）
- 实现了 HMAC 消息认证码（支持所有哈希算法）
- 实现了 Base64 和 Hex 编码/解码功能
- 提供了密钥生成工具（随机密钥、盐值、IV 生成）

#### Vue 3 集成

- 提供了 `useCrypto` Composition API hook，支持响应式状态管理
- 提供了 `useHash` Composition API hook，支持所有哈希算法
- 提供了 `useSignature` Composition API hook，支持数字签名功能
- 实现了 Vue 3 插件系统，支持全局注册和配置
- 支持加载状态、错误处理等响应式特性

#### 构建和打包

- 使用 Rollup 构建系统，生成多种格式的构建产物
- ESM 格式输出到 `es/` 目录（保持完整目录结构）
- CommonJS 格式输出到 `lib/` 目录（保持完整目录结构）
- UMD 格式输出到 `dist/` 目录（包含压缩版本）
- IIFE 格式支持直接在浏览器中使用
- 完整的 TypeScript 声明文件输出到 `types/` 目录

#### 开发工具和质量保证

- 使用 @antfu/eslint-config 作为代码规范
- 集成 Vitest 单元测试框架，测试覆盖率 100%
- 集成 Playwright 端到端测试
- 使用 VitePress 构建文档系统
- 完整的 TypeScript 支持和类型安全

#### 示例和文档

- 创建了 vanilla JavaScript 示例项目，展示所有核心功能
- 创建了 Vue 3 示例项目，展示 Composition API 和插件使用
- 提供了完整的 API 文档和使用指南
- 包含快速开始指南和最佳实践

#### 技术特性

- 框架无关设计，支持所有 JavaScript 环境
- 现代化的 ES2020+ 语法和特性
- 优化的性能和内存使用
- 安全的加密实现，遵循最佳实践
- 支持浏览器和 Node.js 环境

### Technical Details

#### 支持的算法

- **对称加密**: AES-128/192/256 (CBC, ECB, CFB, OFB, CTR 模式)
- **非对称加密**: RSA (1024/2048/3072/4096 位密钥)
- **哈希算法**: MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512
- **消息认证**: HMAC-MD5, HMAC-SHA1, HMAC-SHA256, HMAC-SHA384, HMAC-SHA512
- **编码算法**: Base64, URL-safe Base64, Hex

#### 浏览器兼容性

- Chrome ≥ 63
- Firefox ≥ 57
- Safari ≥ 11.1
- Edge ≥ 79

#### Node.js 兼容性

- Node.js ≥ 16.0.0
- 支持 ESM 和 CommonJS

### Dependencies

- `crypto-js`: ^4.2.0 - 基础加密算法实现
- `node-forge`: ^1.3.1 - RSA 加密和数字签名
- `tslib`: ^2.6.2 - TypeScript 运行时库

### Peer Dependencies

- `vue`: ^3.3.0 (可选，仅在使用 Vue 3 集成功能时需要)

### Package Exports

- `.` - 主入口，包含所有核心功能
- `./vue` - Vue 3 集成功能
- `./core/*` - 核心功能模块
- `./algorithms/*` - 算法实现模块
- `./utils/*` - 工具函数模块
- `./es` - ESM 格式入口
- `./lib` - CommonJS 格式入口
- `./dist` - UMD 格式入口
