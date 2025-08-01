# 🚀 LDesign Vue引擎项目

[![CI](https://github.com/ldesign/ldesign/workflows/CI/badge.svg)](https://github.com/ldesign/ldesign/actions)
[![codecov](https://codecov.io/gh/ldesign/ldesign/branch/main/graph/badge.svg)](https://codecov.io/gh/ldesign/ldesign)
[![npm version](https://badge.fury.io/js/@ldesign%2Fengine.svg)](https://badge.fury.io/js/@ldesign%2Fengine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于Vue3的现代化前端开发引擎，提供完整的插件化架构和跨框架兼容性。

## ✨ 特性

- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🚀 **高性能** - 优化的构建和运行时性能
- 🔌 **插件化** - 灵活的插件系统
- 🌍 **跨框架** - 支持 Vue 3 及原生 JavaScript
- 📦 **模块化** - 按需导入，减少包体积
- 🛠️ **开发友好** - 完善的开发工具和文档
- 🧪 **测试覆盖** - 高质量的单元测试和E2E测试

## 📦 核心包

| 包名 | 版本 | 描述 | 文档 |
|------|------|------|------|
| [@ldesign/engine](./packages/engine) | ![npm](https://img.shields.io/npm/v/@ldesign/engine) | 核心引擎，提供插件系统和基础架构 | [📖](./packages/engine/README.md) |
| [@ldesign/color](./packages/color) | ![npm](https://img.shields.io/npm/v/@ldesign/color) | 颜色处理工具包 | [📖](./packages/color/README.md) |
| [@ldesign/crypto](./packages/crypto) | ![npm](https://img.shields.io/npm/v/@ldesign/crypto) | 加密解密工具包 | [📖](./packages/crypto/README.md) |
| [@ldesign/device](./packages/device) | ![npm](https://img.shields.io/npm/v/@ldesign/device) | 设备检测和适配工具包 | [📖](./packages/device/README.md) |
| [@ldesign/http](./packages/http) | ![npm](https://img.shields.io/npm/v/@ldesign/http) | HTTP请求处理工具包 | [📖](./packages/http/README.md) |
| [@ldesign/i18n](./packages/i18n) | ![npm](https://img.shields.io/npm/v/@ldesign/i18n) | 国际化工具包 | [📖](./packages/i18n/README.md) |
| [@ldesign/router](./packages/router) | ![npm](https://img.shields.io/npm/v/@ldesign/router) | 路由管理工具包 | [📖](./packages/router/README.md) |
| [@ldesign/store](./packages/store) | ![npm](https://img.shields.io/npm/v/@ldesign/store) | 状态管理工具包 | [📖](./packages/store/README.md) |
| [@ldesign/template](./packages/template) | ![npm](https://img.shields.io/npm/v/@ldesign/template) | 模板引擎工具包 | [📖](./packages/template/README.md) |

## 🚀 快速开始

### 📋 环境要求

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

### 📦 安装

选择你需要的包进行安装：

```bash
# 安装核心引擎
npm install @ldesign/engine

# 安装颜色工具
npm install @ldesign/color

# 安装加密工具
npm install @ldesign/crypto

# 或者使用 pnpm
pnpm add @ldesign/engine @ldesign/color @ldesign/crypto
```

### 💡 基础用法

```typescript
// 使用核心引擎
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'

const app = createApp({})
const engine = createEngine({
  config: {
    appName: 'My App',
    version: '1.0.0'
  }
})

app.use(engine)
```

```typescript
// 使用颜色工具
import { ColorManager } from '@ldesign/color'

const colorManager = new ColorManager()
colorManager.setPrimaryColor('#1890ff')
const colors = colorManager.generateColorScale()
```

### 🛠️ 开发

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign.git
cd ldesign

# 安装依赖
pnpm install

# 启动所有包的开发模式
pnpm dev

# 构建所有包
pnpm build

# 运行测试
pnpm test

# 运行E2E测试
pnpm test:e2e

# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 启动文档开发服务器
pnpm docs:dev
```

## 📁 项目结构

```
ldesign/
├── packages/                    # 📦 核心包目录
│   ├── engine/                 # 🚀 引擎核心
│   ├── color/                  # 🎨 颜色管理
│   ├── crypto/                 # 🔐 加密工具
│   ├── device/                 # 📱 设备检测
│   ├── http/                   # 🌐 HTTP客户端
│   ├── i18n/                   # 🌍 国际化
│   ├── router/                 # 🛣️ 路由系统
│   ├── store/                  # 📊 状态管理
│   └── template/               # 📄 模板引擎
├── tools/                      # 🛠️ 开发工具
├── .github/workflows/          # 🔄 CI/CD配置
├── docs/                       # 📚 项目文档
└── e2e/                        # 🧪 全局E2E测试
```

### 包结构

每个包都遵循统一的目录结构：

```
packages/[package-name]/
├── src/                        # 📝 源代码
├── examples/                   # 🎯 示例项目
├── docs/                       # 📖 VitePress文档
├── __tests__/                  # 🧪 单元测试
├── e2e/                        # 🎭 E2E测试
├── dist/                       # 📦 构建产物
└── README.md                  # 📚 包文档
```

## 🛠️ 技术栈

### 核心技术
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Rollup** - 模块打包器
- **pnpm** - 高效的包管理器

### 开发工具
- **ESLint** - 代码质量检查
- **Vitest** - 单元测试框架
- **Playwright** - E2E 测试框架
- **VitePress** - 文档生成器
- **Changesets** - 版本管理和发布

### CI/CD
- **GitHub Actions** - 持续集成和部署
- **Codecov** - 代码覆盖率报告
- **Size Limit** - 包体积监控

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

### 快速开始贡献

1. **Fork 项目并克隆**
2. **创建功能分支**
3. **安装依赖**: `pnpm install`
4. **开发和测试**: `pnpm dev` & `pnpm test`
5. **添加变更集**: `pnpm changeset`
6. **提交并创建 PR**

### 开发规范

- 🎯 遵循 [Conventional Commits](https://conventionalcommits.org/) 规范
- 🧪 确保测试覆盖率 > 85%
- 📝 为新功能编写文档
- 🔍 通过所有 CI 检查

## 📄 许可证

MIT © [LDesign Team](https://github.com/ldesign)

---

<div align="center">
  <sub>Built with ❤️ by the LDesign team</sub>
</div>