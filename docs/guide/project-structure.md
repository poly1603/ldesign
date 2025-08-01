# 项目结构

LDesign 采用 monorepo 架构，使用 pnpm workspace 管理多个包。以下是详细的项目结构说明。

## 根目录结构

```
ldesign/
├── README.md                 # 项目主要说明文档
├── CHANGELOG.md             # 变更日志
├── CONTRIBUTING.md          # 贡献指南
├── LICENSE                  # 开源协议
├── package.json             # 根包配置
├── pnpm-workspace.yaml      # pnpm 工作空间配置
├── tsconfig.json            # TypeScript 配置
├── vitest.config.ts         # 测试配置
├── eslint.config.js         # ESLint 配置
├── playwright.config.ts     # E2E 测试配置
├── Dockerfile               # Docker 配置
├── docker-compose.yml       # Docker Compose 配置
├── .gitignore              # Git 忽略文件
├── .dockerignore           # Docker 忽略文件
├── packages/               # 子包目录
├── docs/                   # 文档目录
├── tools/                  # 工具脚本目录
├── e2e/                    # E2E 测试
└── docker/                 # Docker 配置文件
```

## 包目录结构 (packages/)

每个包都遵循统一的结构：

```
packages/[package-name]/
├── package.json            # 包配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 构建配置
├── vitest.config.ts       # 测试配置
├── README.md              # 包说明文档
├── src/                   # 源代码
│   ├── index.ts          # 主入口文件
│   ├── types/            # 类型定义
│   ├── utils/            # 工具函数
│   └── components/       # 组件 (如果适用)
├── __tests__/            # 测试文件
├── docs/                 # 包文档
└── dist/                 # 构建输出 (git ignored)
```

## 文档目录结构 (docs/)

```
docs/
├── .vitepress/           # VitePress 配置
│   └── config.ts        # VitePress 配置文件
├── package.json         # 文档包配置
├── Dockerfile           # 文档 Docker 配置
├── index.md             # 文档首页
├── guide/               # 指南文档
│   ├── getting-started.md
│   ├── DEVELOPMENT.md
│   ├── DEPLOYMENT.md
│   └── project-structure.md
├── api/                 # API 文档
├── examples/            # 示例文档
├── best-practices/      # 最佳实践
├── contributing/        # 贡献指南
├── reports/             # 项目报告
│   ├── BUILD_REPORT.json
│   ├── BUILD_STATUS_REPORT.md
│   ├── PROJECT_STATUS_REPORT.md
│   ├── STANDARDIZATION_REPORT.md
│   └── VERIFICATION_REPORT.md
└── README.en.md         # 英文说明文档
```

## 工具目录结构 (tools/)

```
tools/
├── README.md            # 工具说明文档
├── scripts/             # 可执行脚本
│   ├── build/          # 构建相关脚本
│   │   ├── build-manager.ts
│   │   └── version-manager.ts
│   ├── deploy/         # 部署相关脚本
│   │   ├── deploy-manager.ts
│   │   ├── package-deployer.ts
│   │   ├── publish-manager.ts
│   │   └── verify-deployment.ts
│   ├── package/        # 包管理脚本
│   │   ├── create-package.ts
│   │   └── standardize-packages.ts
│   ├── release/        # 发布管理脚本
│   │   └── version-manager.ts
│   ├── test/           # 测试脚本
│   │   ├── test-all-builds.js
│   │   ├── test-create-package.js
│   │   └── verify-standardization.js
│   └── git-commit.ts   # Git 提交工具
├── configs/            # 配置文件
│   ├── build/          # 构建配置
│   │   ├── rollup.config.base.js
│   │   ├── rollup.config.base.ts
│   │   └── tsconfig.base.json
│   ├── test/           # 测试配置
│   │   ├── playwright.config.base.js
│   │   ├── playwright.config.base.ts
│   │   ├── vitest.config.base.js
│   │   └── vitest.config.base.ts
│   ├── templates/      # 模板文件
│   │   └── package-template.json
│   └── publish.config.ts # 发布配置
└── __tests__/          # 工具测试
    └── git-commit.test.ts
```

## Docker 配置

### 主项目 Docker 支持

- `Dockerfile`: 多阶段构建，支持开发和生产环境
- `docker-compose.yml`: 完整的服务编排
- `docker-compose.dev.yml`: 开发环境专用配置

### 文档 Docker 支持

- `docs/Dockerfile`: 文档专用 Docker 配置
- `docs/docker/nginx.conf`: 文档服务器配置

## 构建系统

### 统一构建管理器

- `tools/scripts/build/build-manager.ts`: 统一的构建管理器
  - 支持构建所有包、文档、示例
  - 生成构建报告和日志
  - 支持版本管理
  - 支持 TypeScript 类型检查

### 版本管理

- `tools/scripts/build/version-manager.ts`: 版本管理器
  - 支持批量版本更新
  - 支持单包版本更新
  - 自动更新内部依赖
  - Git 标签管理

## 发布系统

### 发布管理器

- `tools/scripts/deploy/publish-manager.ts`: 发布管理器
  - 支持多仓库发布 (npm, 私有仓库, 本地测试)
  - 发布前检查 (构建、测试、代码规范)
  - 发布后操作 (Git 标签、推送)
  - 生成发布报告

### 支持的仓库

1. **NPM 官方仓库**: `https://registry.npmjs.org/`
2. **私有仓库**: `http://npm.longrise.cn:6286/`
3. **本地测试仓库**: `http://localhost:4873/` (Verdaccio)

## 开发工作流

### 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 代码检查
pnpm lint
```

### Docker 开发

```bash
# 启动开发环境
pnpm docker:dev

# 启动文档开发
pnpm docker:docs

# 构建生产镜像
pnpm docker:build
```

### 发布流程

```bash
# 更新版本
pnpm version:bump:patch

# 本地测试发布
pnpm publish:local

# 发布到私有仓库
pnpm publish:private

# 发布到 NPM
pnpm publish:npm
```

## 配置文件说明

### 主要配置文件

- `package.json`: 根包配置，包含所有脚本命令
- `pnpm-workspace.yaml`: 定义工作空间包
- `tsconfig.json`: TypeScript 全局配置
- `tools/configs/publish.config.ts`: 发布配置

### 构建配置

- `tools/configs/build/`: 构建相关配置
- `vite.config.ts`: Vite 构建配置
- `rollup.config.js`: Rollup 构建配置

### 测试配置

- `vitest.config.ts`: 单元测试配置
- `playwright.config.ts`: E2E 测试配置
- `tools/configs/test/`: 测试基础配置

这个项目结构设计旨在提供：

1. **清晰的组织结构**: 每个目录都有明确的职责
2. **统一的构建流程**: 通过构建管理器统一管理
3. **完善的发布系统**: 支持多种发布目标
4. **Docker 支持**: 便于部署和开发
5. **完整的文档系统**: 使用 VitePress 构建
6. **自动化工具**: 减少手动操作，提高效率
