# PNPM 工作空间配置指南

## 概述

本项目使用 PNPM 工作空间（Workspace）来管理 monorepo，提供高效的依赖管理和构建流程。

## 项目结构

```
ldesign/
├── packages/           # 子包目录（30+ 包）
│   ├── builder/       # 构建工具包
│   ├── color/         # 颜色系统包
│   ├── shared/        # 共享组件包
│   ├── component/     # 组件库包
│   ├── form/          # 表单组件包
│   ├── engine/        # 引擎包
│   ├── launcher/      # 启动器包
│   └── ...           # 其他包
├── app/               # 应用目录
├── docs/              # 文档目录
├── pnpm-workspace.yaml # 工作空间配置
└── package.json       # 根包配置
```

## 快速开始

### 核心命令

```bash
# 构建相关
pnpm build                    # 构建所有包
pnpm build:prod              # 生产环境构建
pnpm --filter="@ldesign/color" run build  # 构建特定包

# 开发相关
pnpm dev                     # 启动所有包的开发模式
pnpm --filter="@ldesign/component" run dev  # 启动特定包的开发模式

# 测试相关
pnpm test                    # 运行所有包的测试
pnpm test:run               # 运行所有包的测试（非监听模式）
pnpm --filter="@ldesign/form" run test  # 运行特定包的测试

# 清理相关
pnpm clean                  # 清理所有包的构建产物

# 依赖管理
pnpm install                # 安装所有依赖
pnpm add <package> -w       # 在根目录添加依赖
pnpm --filter="@ldesign/color" add <package>  # 为特定包添加依赖
```

### 包过滤器

PNPM 提供了强大的包过滤功能：

```bash
# 按包名过滤
pnpm --filter="@ldesign/color" run build

# 按路径过滤
pnpm --filter="./packages/color" run build

# 按依赖关系过滤
pnpm --filter="...@ldesign/component" run build  # 构建 component 及其所有依赖
pnpm --filter="@ldesign/shared..." run build     # 构建依赖 shared 的所有包

# 并行执行
pnpm -r --parallel run dev  # 并行启动所有包的开发模式
```

## 工作空间配置

### pnpm-workspace.yaml

```yaml
packages:
  - packages/**
```

### 根目录 package.json

```json
{
  "name": "@ldesign/monorepo",
  "private": true,
  "scripts": {
    "build": "pnpm -r --filter='./packages/*' run build",
    "dev": "pnpm -r --parallel --filter='./packages/*' run dev",
    "test": "pnpm -r --filter='./packages/*' run test"
  }
}
```

## 依赖管理

### 工作空间依赖

在包的 package.json 中使用 `workspace:*` 引用其他工作空间包：

```json
{
  "dependencies": {
    "@ldesign/shared": "workspace:*",
    "@ldesign/color": "workspace:*"
  }
}
```

### 提升依赖

PNPM 会自动将公共依赖提升到根目录的 node_modules，减少重复安装。

## 最佳实践

### 1. 包命名规范

- 所有包使用 `@ldesign/` 前缀
- 包名使用小写字母和连字符
- 避免使用缩写，保持语义清晰

### 2. 版本管理

- 使用 `workspace:*` 引用内部包
- 定期同步更新所有包的版本
- 使用语义化版本控制

### 3. 构建顺序

- 确保依赖包先于被依赖包构建
- 使用 `pnpm -r` 自动处理构建顺序
- 避免循环依赖

### 4. 开发流程

```bash
# 1. 安装依赖
pnpm install

# 2. 构建所有包
pnpm build

# 3. 启动开发模式
pnpm dev

# 4. 运行测试
pnpm test:run
```

## 常用场景

### 开发新包

```bash
# 1. 创建包目录
mkdir packages/new-package
cd packages/new-package

# 2. 初始化 package.json
pnpm init

# 3. 添加依赖
pnpm add typescript -D
pnpm add @ldesign/shared

# 4. 在根目录重新安装
cd ../..
pnpm install
```

### 调试特定包

```bash
# 只构建特定包及其依赖
pnpm --filter="...@ldesign/component" run build

# 启动特定包的开发模式
pnpm --filter="@ldesign/component" run dev

# 运行特定包的测试
pnpm --filter="@ldesign/component" run test
```

### 发布包

```bash
# 构建所有包
pnpm build

# 运行所有测试
pnpm test:run

# 发布特定包
pnpm --filter="@ldesign/color" publish
```

## 性能优化

### 1. 并行构建

```bash
# 并行构建所有包
pnpm -r --parallel run build

# 限制并发数
pnpm -r --parallel --max-concurrency=4 run build
```

### 2. 增量构建

PNPM 会自动跳过未更改的包，实现增量构建。

### 3. 缓存优化

- 使用 `.pnpmfile.cjs` 自定义依赖解析
- 配置 `.npmrc` 优化缓存策略

## 故障排除

### 常见问题

1. **依赖解析失败**
   ```bash
   pnpm install --force
   ```

2. **构建顺序错误**
   ```bash
   pnpm -r --topological-dev run build
   ```

3. **缓存问题**
   ```bash
   pnpm store prune
   pnpm install
   ```

### 调试命令

```bash
# 查看工作空间信息
pnpm list -r --depth=0

# 查看依赖关系
pnpm why <package>

# 检查配置
pnpm config list
```

## 迁移指南

从 Turborepo 迁移到 PNPM 工作空间的主要变化：

1. **配置文件**：删除 `turbo.json`，使用 `pnpm-workspace.yaml`
2. **命令语法**：`turbo run build` → `pnpm -r run build`
3. **过滤器**：`--filter` 语法略有不同
4. **缓存**：依赖 PNPM 内置缓存机制

## 参考资源

- [PNPM 工作空间文档](https://pnpm.io/workspaces)
- [PNPM CLI 参考](https://pnpm.io/cli/add)
- [包过滤器语法](https://pnpm.io/filtering)
