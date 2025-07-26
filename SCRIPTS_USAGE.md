# LDesign Git 和 Submodule 管理脚本使用指南

## 🎯 概述

LDesign 项目现在配备了一套完整的 Git 和 Submodule 管理脚本系统，支持智能提交、项目更新、submodule 管理和项目初始化等功能。

## 🚀 快速开始

### 环境检查

确保你的环境满足以下要求：

- Node.js 18+
- pnpm 8+
- Git 2.0+

### 查看帮助

```bash
# 查看所有可用命令
pnpm script:help

# 查看特定命令帮助
pnpm script:commit --help
pnpm script:update --help
pnpm script:submodule --help
pnpm script:init --help
```

## 📋 核心功能

### 1. 智能提交代码 🚀

**基本用法：**

```bash
# 提交当前目录的更改
pnpm script:commit

# 提交指定 submodule
pnpm script:commit packages/color

# 指定提交信息
pnpm script:commit -m "feat: add new color utilities"

# 预览模式（查看将要执行的操作）
pnpm script:commit --dry-run
```

**执行流程：**

1. 自动 stash 本地更改
2. 拉取最新代码
3. 恢复本地更改
4. 交互式输入提交信息
5. 提交并推送代码

### 2. 项目更新 🔄

**基本用法：**

```bash
# 更新当前项目
pnpm script:update

# 更新所有项目（root + submodules）
pnpm script:update --all

# 更新到指定分支
pnpm script:update --branch develop

# 更新指定 submodule
pnpm script:update packages/color
```

### 3. Submodule 管理 📦

**列出所有 submodule：**

```bash
pnpm script:submodule list
```

**添加新 submodule：**

```bash
pnpm script:submodule add https://github.com/user/repo.git packages/new-module main
```

**删除 submodule：**

```bash
pnpm script:submodule remove packages/old-module
```

**修改 submodule 配置：**

```bash
pnpm script:submodule modify packages/color
```

### 4. 项目初始化 🏗️

**完整初始化（推荐用于新克隆的仓库）：**

```bash
pnpm script:init
```

**自定义初始化：**

```bash
# 跳过依赖安装
pnpm script:init --skip-deps

# 跳过 submodule 初始化
pnpm script:init --skip-submodules

# 预览模式
pnpm script:init --dry-run
```

## 🖥️ Windows PowerShell 快捷方式

对于 Windows 用户，可以使用增强的 PowerShell 脚本：

```powershell
# 基本开发命令
.\scripts\dev.ps1                    # 启动开发服务器
.\scripts\dev.ps1 -Mode build        # 构建项目
.\scripts\dev.ps1 -Clean             # 清理项目
.\scripts\dev.ps1 -Docs              # 启动文档服务器

# Git 管理命令
.\scripts\dev.ps1 -Commit            # 提交代码
.\scripts\dev.ps1 -Update            # 更新代码
.\scripts\dev.ps1 -Init              # 初始化项目

# Submodule 管理
.\scripts\dev.ps1 -Submodule list    # 列出 submodule

# 带参数的命令
.\scripts\dev.ps1 -Commit -Message "feat: new feature" -Path packages/color
.\scripts\dev.ps1 -Update -Path packages/color
```

## 🔧 高级用法

### 预览模式

所有脚本都支持 `--dry-run` 参数，可以预览操作而不执行：

```bash
pnpm script:commit --dry-run
pnpm script:update --all --dry-run
pnpm script:submodule add <url> <path> --dry-run
pnpm script:init --dry-run
```

### 强制模式

使用 `--force` 参数跳过确认提示：

```bash
pnpm script:commit --force
pnpm script:update --all --force
pnpm script:init --force
```

### 批量操作

```bash
# 更新所有项目
pnpm script:update --all

# 检查所有 submodule 状态
pnpm script:submodule list

# 完整项目初始化
pnpm script:init
```

## 🛡️ 安全特性

### 自动备份

- 所有操作前自动 stash 本地更改
- 操作失败时自动恢复
- 支持手动回滚

### 冲突处理

- 自动检测合并冲突
- 提供清晰的解决指导
- 保护本地更改不丢失

### 权限验证

- 检查 Git 仓库权限
- 验证远程仓库连接
- 确保操作安全性

## 🚨 故障排除

### 常见问题

**1. 权限错误**

```bash
# 检查 SSH 配置
ssh -T git@github.com

# 重新配置 Git 凭据
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**2. 合并冲突**

```bash
# 查看冲突文件
git status

# 手动解决冲突后
git add .
pnpm script:commit -m "resolve conflicts"
```

**3. Submodule 问题**

```bash
# 重新初始化所有 submodule
pnpm script:init --skip-deps

# 或者手动重置
git submodule deinit --all
git submodule update --init --recursive
```

**4. 网络问题**

```bash
# 检查网络连接
ping github.com

# 使用 HTTPS 替代 SSH
git config --global url."https://github.com/".insteadOf git@github.com:
```

### 调试模式

设置环境变量启用详细日志：

```bash
# Windows PowerShell
$env:DEBUG = "1"
pnpm script:commit

# Linux/macOS
DEBUG=1 pnpm script:commit
```

## 📊 脚本状态监控

### 查看项目状态

```bash
# 查看所有 submodule 状态
pnpm script:submodule list

# 查看 Git 状态
git status
git submodule status
```

### 性能监控

```bash
# 测量脚本执行时间
time pnpm script:update --all

# 查看网络使用情况
git config --get-regexp url
```

## 🎯 最佳实践

### 日常开发流程

1. **开始工作前**

   ```bash
   pnpm script:update --all
   ```

2. **开发过程中**

   ```bash
   # 定期提交
   pnpm script:commit -m "feat: implement feature X"
   ```

3. **完成功能后**

   ```bash
   # 最终提交
   pnpm script:commit -m "feat: complete feature X implementation"

   # 更新到最新
   pnpm script:update --all
   ```

### 团队协作

1. **新成员加入**

   ```bash
   git clone <repository>
   cd ldesign
   pnpm script:init
   ```

2. **添加新模块**

   ```bash
   pnpm script:submodule add <url> <path> <branch>
   ```

3. **同步更改**
   ```bash
   pnpm script:update --all
   ```

## 📚 相关文档

- [脚本详细文档](./scripts/README.md)
- [项目贡献指南](./CONTRIBUTING.md)
- [开发环境设置](./README.md#开发)

## 🤝 获取帮助

如果遇到问题：

1. 查看脚本帮助：`pnpm script:help`
2. 查看详细文档：`./scripts/README.md`
3. 提交 Issue：[GitHub Issues](https://github.com/poly1603/ldesign/issues)
4. 参与讨论：[GitHub Discussions](https://github.com/poly1603/ldesign/discussions)

---

🎉 现在你已经掌握了 LDesign 项目的完整脚本系统！开始高效的开发之旅吧！
