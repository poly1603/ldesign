# LDesign

<p align="center">
  <strong>现代化企业级设计系统 - Monorepo + Git Submodule 架构</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.7+-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vue-3.3+-42b883?logo=vue.js" alt="Vue">
  <img src="https://img.shields.io/badge/React-18+-61dafb?logo=react" alt="React">
  <img src="https://img.shields.io/badge/pnpm-9.15+-F69220?logo=pnpm" alt="pnpm">
  <img src="https://img.shields.io/badge/Node-18+-339933?logo=node.js" alt="Node">
</p>

---

## 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/poly1603/ldesign.git
cd ldesign

# 2. 初始化所有 submodule（并行拉取，自动切换远程分支）
pnpm init

# 3. 安装依赖
pnpm install

# 4. 开始开发
pnpm dev
```

> **环境要求**: Node.js >= 18.0.0, pnpm >= 8.0.0

---

## 常用命令

### 项目管理

| 命令 | 说明 |
|------|------|
| `pnpm init` | 初始化所有 submodule |
| `pnpm install` | 安装依赖 |
| `pnpm install:fast` | 快速安装（跳过可选依赖） |
| `pnpm clean` | 清理 node_modules + dist |
| `pnpm clean:dist` | 仅清理构建产物 |

### Submodule 管理

| 命令 | 说明 |
|------|------|
| `pnpm sub:status` | 查看所有 submodule 状态 |
| `pnpm sub:update` | 更新所有 submodule |
| `pnpm sub:sync` | 同步 submodule 配置 |

### 开发构建

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建所有包 |
| `pnpm build:clean` | 清理后重新构建 |
| `pnpm lint` | 代码检查 |
| `pnpm lint:fix` | 自动修复 lint 问题 |

### 单包开发

```bash
# 进入子包目录开发
cd libraries/chart/examples/vite-demo
pnpm install
pnpm dev

# 或使用 filter
pnpm --filter @ldesign/chart-core dev
pnpm --filter "@ldesign/chart*" build
```

---

## 项目结构

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

## 模块分类

### 核心基础包 (packages/)

提供底层通用能力，跨框架复用：

- **工具类**: `shared`, `color`, `size`, `crypto`, `device`
- **框架类**: `engine`, `router`, `store`, `i18n`, `template`
- **服务类**: `http`, `cache`, `logger`, `tracker`, `notification`
- **安全类**: `auth`, `permission`, `error`

### 功能库 (libraries/)

面向业务场景的高级组件，支持多框架：

- **数据展示**: `chart`, `table`, `grid`, `gantt`, `timeline`
- **编辑器**: `editor`, `code-editor`, `markdown`
- **文档处理**: `excel`, `pdf`, `word`, `office-document`
- **输入组件**: `form`, `datepicker`, `calendar`, `upload`, `signature`
- **绘图工具**: `flowchart`, `mindmap`, `3d-viewer`
- **媒体组件**: `video`, `player`, `lottie`, `cropper`
- **工具组件**: `qrcode`, `barcode`, `map`, `tree`, `progress`
- **平台类**: `lowcode`, `webcomponent`

### 开发工具 (tools/)

提升开发效率的工具链：

- **构建工具**: `builder`, `launcher`, `server`
- **代码工具**: `cli`, `generator`, `formatter`, `translator`
- **质量工具**: `testing`, `benchmark`, `monitor`, `performance`, `security`
- **发布工具**: `deployer`, `publisher`, `changelog`, `docs-generator`
- **管理工具**: `git`, `submodule`, `deps`, `node-manager`, `project-manager`
- **配置工具**: `configmate`, `env`, `mock`

---

## 架构说明

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

## 贡献

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

## 许可证

MIT License

---

## 相关资源

- **GitHub**: [poly1603/ldesign](https://github.com/poly1603/ldesign)
- **Issues**: [问题追踪](https://github.com/poly1603/ldesign/issues)
- **Discussions**: [社区讨论](https://github.com/poly1603/ldesign/discussions)
- **文档**: 🚧 正在建设中...
- **Playground**: 🚧 正在建设中...

---

## 问题排查

### Submodule 未初始化

```bash
pnpm init
# 或
node scripts/init-submodules.js --parallel
```

### 依赖安装失败

```bash
pnpm clean           # 清理 node_modules
pnpm install         # 重新安装
```

### 构建失败

```bash
pnpm clean:dist      # 清理构建产物
pnpm build           # 重新构建
```

### 查看 Submodule 状态

```bash
pnpm sub:status
```

---

## FAQ

**为什么选择 Monorepo + Submodule 架构？**

- **Monorepo** 提供统一的开发体验和依赖管理
- **Submodule** 提供独立的版本控制和权限管理

**支持哪些框架？**

Vue 3.3+ / React 18+ / Lit 3+ / Web Components

**如何贡献代码？**

请阅读 [贡献指南](#贡献) 章节。

---

<p align="center">
  Made with ❤️ by LDesign Team
</p>

