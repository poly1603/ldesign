# CLI 开发模式使用指南

## 🎯 概述

这个开发模式允许你在 `app` 目录中直接使用 `packages/cli` 的源码进行调试，无需每次修改后重新打包 CLI。

## 🚀 快速开始

### 1. 启动 Web UI（开发模式）

```bash
# 使用 CLI 源码启动 Web UI
pnpm ui:dev
```

### 2. 启动开发服务器（开发模式）

```bash
# 开发环境
pnpm dev:cli

# 生产环境
pnpm dev:prod:cli

# 测试环境
pnpm dev:test:cli

# 预发布环境
pnpm dev:staging:cli
```

### 3. 构建项目（开发模式）

```bash
# 生产构建
pnpm build:cli

# 开发构建
pnpm build:dev:cli

# 测试构建
pnpm build:test:cli

# 预发布构建
pnpm build:staging:cli
```

### 4. 预览构建结果（开发模式）

```bash
# 预览生产构建
pnpm preview:cli

# 预览开发构建
pnpm preview:dev:cli

# 预览测试构建
pnpm preview:test:cli

# 预览预发布构建
pnpm preview:staging:cli
```

## 🔧 工作原理

### 开发脚本

- **脚本位置**: `app/scripts/ldesign-dev.js`
- **工作原理**: 使用 `jiti` 直接加载 CLI 的 TypeScript 源码
- **源码路径**: `packages/cli/src/index.ts`

### 实时调试

1. **修改 CLI 源码**: 直接编辑 `packages/cli/src/` 下的任何文件
2. **重启命令**: 停止当前运行的命令并重新启动
3. **立即生效**: 修改会立即反映在新启动的进程中

### 示例工作流

```bash
# 1. 启动 Web UI 开发模式
pnpm ui:dev

# 2. 在另一个终端修改 CLI 源码
# 编辑 packages/cli/src/commands/ui.ts

# 3. 停止并重启 Web UI
# Ctrl+C 停止
pnpm ui:dev  # 重新启动，修改立即生效
```

## 📁 目录结构

```
app/
├── scripts/
│   └── ldesign-dev.js          # 开发模式启动脚本
├── package.json                # 包含所有 :cli 开发脚本
└── CLI-DEV-MODE.md            # 本文档

packages/cli/
├── src/                       # CLI 源码（直接调试这里）
│   ├── commands/              # 命令实现
│   ├── web/                   # Web UI 后端
│   └── index.ts              # 主入口
└── dist/                      # 打包后的文件（开发模式不使用）
```

## 🎨 开发技巧

### 1. 快速测试修改

```bash
# 测试 CLI 帮助信息
node scripts/ldesign-dev.js --help

# 测试特定命令
node scripts/ldesign-dev.js ui --help
node scripts/ldesign-dev.js dev --help
```

### 2. 调试日志

在 CLI 源码中添加调试日志：

```typescript
// packages/cli/src/commands/ui.ts
context.logger.info('🔧 [调试] 这是一个调试信息');
```

### 3. 错误排查

如果遇到错误：

1. 检查 TypeScript 语法错误
2. 确保所有依赖都已安装
3. 查看终端输出的详细错误信息

## 🆚 对比模式

| 功能 | 普通模式 | 开发模式 |
|------|----------|----------|
| 启动 Web UI | `pnpm ui` | `pnpm ui:dev` |
| 启动开发服务器 | `pnpm dev` | `pnpm dev:cli` |
| 修改 CLI 后 | 需要重新打包 | 直接重启即可 |
| 调试体验 | 较慢 | 快速 |
| 适用场景 | 生产使用 | 开发调试 |

## 🎯 注意事项

1. **开发模式仅用于调试**: 生产环境请使用普通模式
2. **重启生效**: 修改 CLI 源码后需要重启命令才能生效
3. **依赖管理**: 确保 `jiti` 依赖已正确安装
4. **TypeScript 支持**: 开发脚本自动支持 TypeScript 源码

## 🚀 开始调试

现在你可以：

1. 运行 `pnpm ui:dev` 启动 Web UI
2. 修改 `packages/cli/src/` 下的任何文件
3. 重启命令查看效果
4. 享受快速的开发调试体验！

Happy Coding! 🎉
