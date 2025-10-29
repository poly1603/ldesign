# LDesign

<p align="center">
  <strong>现代化的设计系统 - 基于 Monorepo + Git Submodule 架构</strong>
</p>

<p align="center">
  <a href="#特性">特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#开发指南">开发指南</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#贡献">贡献</a>
</p>

---

## ✨ 特性

- 🚀 **现代化技术栈**: TypeScript 5.7+ / Vue 3 / React 18
- 📦 **Monorepo 架构**: pnpm workspace 统一管理
- 🎯 **多框架支持**: Vue, React, Lit, Web Components
- ⚡ **高性能构建**: 基于 @ldesign/builder，支持多种构建引擎
- 🔧 **完整工具链**: ESLint, Prettier, Vitest, Playwright
- 📚 **丰富组件库**: 30+ 功能库，20+ 核心包，20+ 开发工具

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone --recursive https://github.com/poly1603/ldesign.git
cd ldesign
```

### 2. 安装依赖

```bash
pnpm install
```

> **注意**: 需要 Node.js >= 18.0.0 和 pnpm >= 8.0.0

### 3. 开发

```bash
# 开发单个包
pnpm --filter @ldesign/color-core dev

# 开发整个功能（包含所有子包）
pnpm --filter "@ldesign/chart*" dev

# 构建所有包
pnpm -r build
```

---

## 📖 开发指南

- **[开发指南](./docs/DEVELOPMENT_GUIDE.md)** - 完整的开发工作流和常用命令
- **[工作空间说明](./docs/WORKSPACE_MIGRATION_COMPLETE.md)** - Monorepo + Submodule 架构详解
- **[清理总结](./docs/CLEANUP_SUMMARY.md)** - 项目清理记录

---

## 📁 项目结构

```
ldesign/
├── packages/          # 核心基础包 (20+ 个)
│   ├── shared/       # 共享工具
│   ├── color/        # 颜色工具
│   ├── engine/       # 核心引擎
│   ├── http/         # HTTP 客户端
│   └── ...
│
├── libraries/        # 功能库 (30+ 个)
│   ├── chart/       # 图表组件
│   ├── table/       # 表格组件
│   ├── editor/      # 富文本编辑器
│   ├── 3d-viewer/   # 3D 查看器
│   └── ...
│
├── tools/           # 开发工具 (20+ 个)
│   ├── builder/     # 构建工具
│   ├── launcher/    # 启动器
│   ├── cli/         # 命令行工具
│   └── ...
│
└── apps/            # 应用示例
    ├── app-vue/     # Vue 示例应用
    └── app-react/   # React 示例应用
```

### 包组织模式

每个主要功能库采用**框架适配器模式**：

```
libraries/chart/
└── packages/
    ├── core/        # @ldesign/chart-core (框架无关)
    ├── react/       # @ldesign/chart-react
    ├── vue/         # @ldesign/chart-vue
    └── lit/         # @ldesign/chart-lit
```

---

## 🔧 常用命令

### 开发

```bash
# 开发单个包
pnpm --filter <package-name> dev

# 开发整个功能
pnpm --filter "@ldesign/chart*" dev

# 开发多个包
pnpm --filter @ldesign/builder --filter "@ldesign/color*" dev
```

### 构建

```bash
# 构建单个包
pnpm --filter @ldesign/builder build

# 构建所有包
pnpm -r build

# 构建特定目录
pnpm --filter "./packages/**" build
```

### 测试

```bash
# 测试单个包
pnpm --filter @ldesign/color-core test

# 测试所有包
pnpm -r test
```

### 清理

```bash
# 清理构建产物
pnpm clean-build

# 清理并重装依赖
.\scripts\clean-and-reinstall.ps1  # Windows
./scripts/clean-and-reinstall.sh   # Linux/Mac
```

---

## 🏗️ 架构说明

### Submodule = Git 边界

本项目采用 **Monorepo + Git Submodule** 混合架构：

- **Git 管理**: 每个包都是独立的 Git 仓库（Submodule），有独立的历史和权限
- **依赖管理**: pnpm workspace 统一管理所有包的依赖
- **开发模式**: 所有开发都在主仓库中进行

### 关键优势

| 优势 | 说明 |
|------|------|
| ⚡ 自动依赖链接 | 修改任何包，依赖它的包自动使用新版本 |
| 🔄 跨包开发流畅 | 一个命令同时开发多个包 |
| 🌳 Git 灵活性 | 每个包独立版本控制，可设置不同权限 |
| 📦 零配置 | 不需要复杂的脚本和配置 |
| 🎯 标准工作流 | 使用标准的 pnpm monorepo 模式 |

---

## 🤝 贡献

欢迎贡献！请查看 [开发指南](./docs/DEVELOPMENT_GUIDE.md) 了解如何开始。

### Git 工作流

```bash
# 1. 创建分支
git checkout -b feat/new-feature

# 2. 进入 submodule 修改代码
cd packages/color
git checkout -b feat/new-feature

# 3. 提交 submodule 修改
git add .
git commit -m "feat: add new feature"
git push origin feat/new-feature

# 4. 回到主仓库，更新 submodule 引用
cd ../..
git add packages/color
git commit -m "chore: update color submodule"
git push
```

---

## 📜 许可证

MIT License

---

## 🆘 问题排查

### 依赖安装失败

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Submodule 未初始化

```bash
git submodule update --init --recursive
```

### 工作空间链接失败

```bash
pnpm install
```

更多问题请查看 [开发指南](./docs/DEVELOPMENT_GUIDE.md)

---

<p align="center">
  Made with ❤️ by LDesign Team
</p>

