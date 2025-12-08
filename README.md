# LDesign

<p align="center">
  <strong>现代化的设计系统 - 基于 Monorepo + Git Submodule 架构</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.7+-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vue-3.3+-42b883?logo=vue.js" alt="Vue">
  <img src="https://img.shields.io/badge/React-18+-61dafb?logo=react" alt="React">
  <img src="https://img.shields.io/badge/pnpm-9.15+-F69220?logo=pnpm" alt="pnpm">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
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
- 📦 **Monorepo 架构**: pnpm workspace 统一管理 77 个子模块
- 🎯 **多框架支持**: Vue, React, Lit, Web Components
- ⚡ **高性能构建**: 基于 @ldesign/builder，支持多种构建引擎
- 🔧 **完整工具链**: ESLint, Prettier, Playwright, Commitlint
- 📚 **丰富组件库**: 31 个功能库，18 个核心包，28 个开发工具
- 🔐 **独立版本控制**: 每个包都是独立的 Git Submodule，支持灵活的权限管理

---

## 🚀 快速开始

### 方式一：一键克隆（推荐）

```bash
# 克隆仓库
git clone https://github.com/poly1603/ldesign.git
cd ldesign

# 自动初始化所有 submodules 并切换到配置的远程分支
node scripts/init-submodules.js --parallel
```

### 方式二：传统方式

```bash
git clone --recursive https://github.com/poly1603/ldesign.git
cd ldesign
```

> 💡 **提示**: 方式一更快，因为使用并行拉取，且会自动切换到各 submodule 配置的远程分支。

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

## 📜 开发文档

当前文档正在完善中，建议直接查看：
- **[package.json](./package.json)** - 可用的脚本命令
- **[.gitmodules](./.gitmodules)** - 子模块配置
- **[各包的 README](./packages/)** - 单个包的详细文档

---

## 📁 项目结构

```
ldesign/
├── packages/          # 核心基础包 (18 个)
│   ├── shared/       # 共享工具函数
│   ├── color/        # 颜色处理工具
│   ├── engine/       # 核心引擎
│   ├── http/         # HTTP 客户端
│   ├── router/       # 路由管理
│   ├── store/        # 状态管理
│   ├── i18n/         # 国际化
│   ├── auth/         # 认证授权
│   ├── permission/   # 权限管理
│   ├── cache/        # 缓存管理
│   ├── crypto/       # 加密工具
│   ├── device/       # 设备检测
│   ├── error/        # 错误处理
│   ├── logger/       # 日志系统
│   ├── notification/ # 通知系统
│   ├── size/         # 尺寸工具
│   ├── template/     # 模板引擎
│   └── tracker/      # 埋点追踪
│
├── libraries/        # 功能库 (31 个)
│   ├── chart/        # 图表组件
│   ├── table/        # 表格组件
│   ├── grid/         # 网格布局
│   ├── form/         # 表单组件
│   ├── editor/       # 富文本编辑器
│   ├── code-editor/  # 代码编辑器
│   ├── markdown/     # Markdown 编辑器
│   ├── 3d-viewer/    # 3D 查看器
│   ├── excel/        # Excel 处理
│   ├── pdf/          # PDF 查看器
│   ├── word/         # Word 处理
│   ├── office-document/ # Office 文档处理
│   ├── calendar/     # 日历组件
│   ├── datepicker/   # 日期选择器
│   ├── gantt/        # 甘特图
│   ├── timeline/     # 时间轴
│   ├── flowchart/    # 流程图
│   ├── mindmap/      # 思维导图
│   ├── tree/         # 树形组件
│   ├── map/          # 地图组件
│   ├── video/        # 视频播放器
│   ├── player/       # 媒体播放器
│   ├── cropper/      # 图片裁剪
│   ├── upload/       # 文件上传
│   ├── signature/    # 签名组件
│   ├── qrcode/       # 二维码
│   ├── barcode/      # 条形码
│   ├── lottie/       # Lottie 动画
│   ├── progress/     # 进度条
│   ├── lowcode/      # 低代码平台
│   └── webcomponent/ # Web Components
│
├── tools/            # 开发工具 (28 个)
│   ├── builder/      # 构建工具
│   ├── cli/          # 命令行工具
│   ├── launcher/     # 项目启动器
│   ├── server/       # 开发服务器
│   ├── kit/          # 开发套件
│   ├── testing/      # 测试工具
│   ├── benchmark/    # 性能测试
│   ├── monitor/      # 监控工具
│   ├── deployer/     # 部署工具
│   ├── publisher/    # 发布工具
│   ├── generator/    # 代码生成器
│   ├── formatter/    # 代码格式化
│   ├── translator/   # 翻译工具
│   ├── docs-generator/ # 文档生成器
│   ├── changelog/    # 变更日志生成器
│   ├── git/          # Git 工具
│   ├── submodule/    # Submodule 管理器
│   ├── deps/         # 依赖管理
│   ├── node-manager/ # Node 版本管理
│   ├── project-manager/ # 项目管理
│   ├── configmate/   # 配置管理
│   ├── env/          # 环境变量管理
│   ├── mock/         # Mock 数据
│   ├── performance/  # 性能分析
│   ├── security/     # 安全检查
│   ├── app/          # 应用工具
│   ├── web/          # Web 工具
│   └── shared/       # 工具共享库
│
└── apps/             # 应用示例
    └── app-vue/      # Vue 3 示例应用
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

## 📦 模块分类

### 💡 核心基础包 (packages/)

提供底层通用能力，跨框架复用：

- **工具类**: `shared`, `color`, `size`, `crypto`, `device`
- **框架类**: `engine`, `router`, `store`, `i18n`, `template`
- **服务类**: `http`, `cache`, `logger`, `tracker`, `notification`
- **安全类**: `auth`, `permission`, `error`

### 🏛️ 功能库 (libraries/)

面向业务场景的高级组件，支持多框架：

- **数据展示**: `chart`, `table`, `grid`, `gantt`, `timeline`
- **编辑器**: `editor`, `code-editor`, `markdown`
- **文档处理**: `excel`, `pdf`, `word`, `office-document`
- **输入组件**: `form`, `datepicker`, `calendar`, `upload`, `signature`
- **绘图工具**: `flowchart`, `mindmap`, `3d-viewer`
- **媒体组件**: `video`, `player`, `lottie`, `cropper`
- **工具组件**: `qrcode`, `barcode`, `map`, `tree`, `progress`
- **平台类**: `lowcode`, `webcomponent`

### 🛠️ 开发工具 (tools/)

提升开发效率的工具链：

- **构建工具**: `builder`, `launcher`, `server`
- **代码工具**: `cli`, `generator`, `formatter`, `translator`
- **质量工具**: `testing`, `benchmark`, `monitor`, `performance`, `security`
- **发布工具**: `deployer`, `publisher`, `changelog`, `docs-generator`
- **管理工具**: `git`, `submodule`, `deps`, `node-manager`, `project-manager`
- **配置工具**: `configmate`, `env`, `mock`

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

### 子模块管理

```bash
# 初始化所有子模块
git submodule update --init --recursive

# 更新所有子模块到最新提交
git submodule update --remote --merge

# 同步子模块
pnpm sync

# 创建新的子模块
pnpm create-submodule
```

### Lint 与格式化

```bash
# Lint 当前仓库
pnpm lint

# 修复 Lint 问题
pnpm lint:fix

# Lint 所有包
pnpm lint:all
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

欢迎贡献！我们遵循以下原则：

### 贡献指南

1. **Fork 本仓库**
2. **创建功能分支** (`git checkout -b feat/amazing-feature`)
3. **提交修改** (遵循 [Conventional Commits](https://www.conventionalcommits.org/))
4. **推送到分支** (`git push origin feat/amazing-feature`)
5. **发起 Pull Request**

### 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
feat: 添加新功能
fix: 修复 Bug
docs: 文档变更
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具变动
ci: CI 配置变更
```

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

---

## 📚 相关资源

- **GitHub**: [poly1603/ldesign](https://github.com/poly1603/ldesign)
- **Issues**: [问题追踪](https://github.com/poly1603/ldesign/issues)
- **Discussions**: [社区讨论](https://github.com/poly1603/ldesign/discussions)
- **文档**: 🚧 正在建设中...
- **Playground**: 🚧 正在建设中...

---

## 🆘 问题排查

### 依赖安装失败

```bash
# Windows
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml
pnpm install

# Linux/Mac
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

### 构建失败

```bash
# 清理构建缓存
pnpm clean-build

# 重新构建
pnpm -r build
```

### pnpm 版本不匹配

```bash
# 升级 pnpm
npm install -g pnpm@latest

# 验证版本
pnpm --version
```

---

## ❓ FAQ

### 为什么选择 Monorepo + Submodule 架构？

这种架构结合了两者的优点：
- **Monorepo** 提供优秀的开发体验和依赖管理
- **Submodule** 提供独立的版本控制和权限管理

### 如何添加新的包？

```bash
pnpm create-submodule
```

按照提示输入包名、类型等信息，脚本会自动创建子模块。

### 支持哪些框架？

目前支持：
- Vue 2.6+ / 2.7+ / 3.3+
- React 18+
- Lit 3+
- Web Components (原生)

### 如何贡献代码？

请阅读 [贡献指南](#🤝-贡献) 章节。

---

<p align="center">
  Made with ❤️ by LDesign Team
</p>

