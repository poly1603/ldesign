# LDesign

<p align="center">
  <img src="https://raw.githubusercontent.com/poly1603/ldesign/main/docs/public/logo.svg" width="120" height="120" alt="LDesign Logo">
</p>

<h1 align="center">LDesign</h1>

<p align="center">
  🚀 现代化的 Vue3 组件库和工具集
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@ldesign/core"><img src="https://img.shields.io/npm/v/@ldesign/core.svg" alt="npm version"></a>
  <a href="https://github.com/poly1603/ldesign/blob/main/LICENSE"><img src="https://img.shields.io/github/license/poly1603/ldesign.svg" alt="license"></a>
  <a href="https://github.com/poly1603/ldesign/actions"><img src="https://github.com/poly1603/ldesign/workflows/CI/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/poly1603/ldesign"><img src="https://codecov.io/gh/poly1603/ldesign/branch/main/graph/badge.svg" alt="coverage"></a>
  <a href="https://github.com/poly1603/ldesign/stargazers"><img src="https://img.shields.io/github/stars/poly1603/ldesign.svg" alt="stars"></a>
</p>

## ✨ 特性

- 🚀 **现代化技术栈** - 基于 Vue 3 + TypeScript + Vite
- 🎨 **精美设计** - 遵循现代设计原则，提供一致的视觉体验
- 🛠️ **开发友好** - 完整的 TypeScript 支持和丰富的 API 文档
- 📱 **响应式设计** - 完美适配各种屏幕尺寸
- 🔧 **高度可定制** - 灵活的主题系统和配置选项
- 🌍 **国际化支持** - 内置 i18n 解决方案
- 🧪 **测试覆盖** - 完整的单元测试和 E2E 测试
- 📦 **按需引入** - 支持 Tree Shaking，优化打包体积

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/core

# 使用 npm
npm install @ldesign/core

# 使用 yarn
yarn add @ldesign/core
```

## 🚀 快速开始

```typescript
import { createApp } from 'vue'
import LDesign from '@ldesign/core'
import '@ldesign/core/dist/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(LDesign)
app.mount('#app')
```

```vue
<template>
  <div>
    <l-button type="primary">
      主要按钮
    </l-button>
    <l-button type="success">
      成功按钮
    </l-button>
  </div>
</template>
```

## 📚 文档

- [在线文档](https://poly1603.github.io/ldesign/)
- [快速开始](https://poly1603.github.io/ldesign/guide/getting-started)
- [组件总览](https://poly1603.github.io/ldesign/components/overview)
- [工具集](https://poly1603.github.io/ldesign/utils/overview)

## 🏗️ 项目结构

```
ldesign/
├── packages/                 # 子包目录
│   ├── color/               # 颜色工具
│   ├── crypto/              # 加密工具
│   ├── device/              # 设备检测
│   ├── engine/              # 渲染引擎
│   ├── http/                # HTTP 客户端
│   ├── i18n/                # 国际化
│   ├── size/                # 尺寸工具
│   ├── store/               # 状态管理
│   └── template/            # 模板引擎
├── docs/                    # 文档站点
├── tests/                   # 测试文件
├── scripts/                 # 构建脚本
└── .github/                 # GitHub 配置
```

## 🛠️ 开发

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 快速启动

```bash
# 克隆项目
git clone https://github.com/poly1603/ldesign.git
cd ldesign

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 启动文档服务器
pnpm docs:dev
```

### 使用开发脚本 (Windows)

```powershell
# 启动开发环境
.\scripts\dev.ps1

# 查看帮助
.\scripts\dev.ps1 -Help

# 清理项目
.\scripts\dev.ps1 -Clean

# 运行测试
.\scripts\dev.ps1 -Test

# 启动文档服务器
.\scripts\dev.ps1 -Docs

# Git 管理
.\scripts\dev.ps1 -Commit          # 智能提交代码
.\scripts\dev.ps1 -Update          # 更新项目
.\scripts\dev.ps1 -Init            # 初始化项目
.\scripts\dev.ps1 -Submodule list  # 管理 submodule
```

### 可用命令

```bash
# 开发
pnpm dev                     # 启动开发服务器
pnpm build                   # 构建所有包
pnpm clean                   # 清理构建产物

# 测试
pnpm test                    # 运行单元测试
pnpm test:coverage           # 运行测试并生成覆盖率报告
pnpm test:e2e               # 运行 E2E 测试

# 代码质量
pnpm lint                    # 代码检查
pnpm lint:fix               # 修复代码问题
pnpm format                  # 格式化代码
pnpm typecheck              # 类型检查

# 文档
pnpm docs:dev               # 启动文档开发服务器
pnpm docs:build             # 构建文档
pnpm docs:preview           # 预览构建的文档

# 发布
pnpm release                # 发布新版本

# Git 和 Submodule 管理
pnpm script:commit          # 智能提交代码
pnpm script:update          # 更新项目代码
pnpm script:submodule       # 管理 submodule
pnpm script:init            # 初始化项目
```

## 🛠️ 统一脚本管理系统

LDesign 提供了一个统一的交互式脚本管理系统，让你通过简单的菜单选择来执行各种操作：

### 🚀 一键启动
```bash
# 启动交互式主菜单（推荐）
pnpm script:main

# Windows PowerShell 快捷方式
.\scripts\dev.ps1 -Main
```

### 📋 主要功能
- **🚀 开发相关**: 启动服务器、构建、测试、代码检查
- **📝 Git 管理**: 智能提交、项目更新、分支管理
- **📦 Submodule 管理**: 添加、删除、更新 submodule
- **🌐 部署相关**: GitHub Pages、Vercel 部署
- **🔧 项目管理**: 初始化、清理、健康检查
- **📚 文档相关**: 文档开发、构建、预览
- **🧪 测试相关**: 单元测试、E2E 测试、覆盖率

详细使用说明请查看 [统一脚本使用指南](./MAIN_SCRIPT_GUIDE.md)。

## 🛠️ Git 和 Submodule 管理

除了统一脚本系统，LDesign 还提供了独立的 Git 和 Submodule 管理脚本：

### 智能提交代码
```bash
# 提交当前目录
pnpm script:commit

# 提交指定 submodule
pnpm script:commit packages/color

# 指定提交信息
pnpm script:commit -m "feat: add new feature"
```

### 项目更新
```bash
# 更新当前项目
pnpm script:update

# 更新所有项目（root + submodules）
pnpm script:update --all
```

### Submodule 管理
```bash
# 列出所有 submodule
pnpm script:submodule list

# 添加新 submodule
pnpm script:submodule add <url> <path> [branch]

# 删除 submodule
pnpm script:submodule remove <path>
```

### 项目初始化
```bash
# 完整初始化（适用于新克隆的仓库）
pnpm script:init
```

详细使用说明请查看 [脚本使用指南](./SCRIPTS_USAGE.md)。

## 🧪 测试

我们使用多种测试工具确保代码质量：

- **Vitest** - 单元测试和集成测试
- **Playwright** - E2E 测试
- **@vitest/coverage-v8** - 测试覆盖率

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行 E2E 测试
pnpm test:e2e

# 运行性能基准测试
pnpm test:benchmark
```

## 📋 代码规范

项目使用以下工具确保代码质量：

- **ESLint** - 代码检查 (基于 @antfu/eslint-config)
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查
- **Husky** - Git hooks
- **lint-staged** - 预提交检查

## 🤝 贡献

我们欢迎所有形式的贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解详情。

### 贡献者

感谢所有为 LDesign 做出贡献的开发者！

<a href="https://github.com/poly1603/ldesign/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=poly1603/ldesign" />
</a>

## 📄 许可证

[MIT License](./LICENSE) © 2024 LDesign Team

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [VitePress](https://vitepress.dev/) - 静态站点生成器
- [Vitest](https://vitest.dev/) - 快速的单元测试框架
- [Playwright](https://playwright.dev/) - 现代 E2E 测试框架

## 📞 联系我们

- 📧 Email: [ldesign@example.com](mailto:ldesign@example.com)
- 💬 讨论: [GitHub Discussions](https://github.com/poly1603/ldesign/discussions)
- 🐛 问题反馈: [GitHub Issues](https://github.com/poly1603/ldesign/issues)

---

<p align="center">
  Made with ❤️ by LDesign Team
</p>
