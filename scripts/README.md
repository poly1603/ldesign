# LDesign 脚本工具集

这是一套完整的 Git 和 Submodule 管理脚本系统，专为 LDesign 项目设计。

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- Git 2.0+

### 安装依赖

```bash
pnpm install
```

## 📋 可用命令

### 1. Git 提交管理 (`script:commit`)

智能提交代码到 GitHub，支持自动 stash、pull、恢复更改等操作。

```bash
# 提交当前目录
pnpm script:commit

# 提交指定路径
pnpm script:commit packages/color

# 指定提交信息
pnpm script:commit -m "feat: add new feature"

# 预览模式（不执行实际操作）
pnpm script:commit --dry-run

# 强制提交（即使没有更改）
pnpm script:commit --force
```

**执行流程：**
1. 执行 `git stash` 保存本地更改
2. 执行 `git pull origin <current-branch>` 拉取最新代码
3. 执行 `git stash pop` 恢复本地更改
4. 执行 `git stash clear` 清理 stash
5. 交互式输入提交信息
6. 执行 `git add .` && `git commit` && `git push`

### 2. 项目更新 (`script:update`)

更新项目到最新代码，支持单个项目或所有项目。

```bash
# 更新当前目录
pnpm script:update

# 更新指定路径
pnpm script:update packages/color

# 更新到指定分支
pnpm script:update --branch develop

# 更新所有项目（root + submodules）
pnpm script:update --all

# 预览模式
pnpm script:update --dry-run

# 强制更新（跳过确认）
pnpm script:update --force
```

### 3. Submodule 管理 (`script:submodule`)

完整的 submodule 管理功能。

#### 添加 Submodule

```bash
# 添加新的 submodule
pnpm script:submodule add <url> <path> [branch]

# 示例
pnpm script:submodule add https://github.com/user/repo.git packages/new-module main
```

#### 删除 Submodule

```bash
# 删除 submodule
pnpm script:submodule remove <path>

# 示例
pnpm script:submodule remove packages/old-module
```

#### 列出所有 Submodule

```bash
# 显示所有 submodule 的状态信息
pnpm script:submodule list
```

#### 修改 Submodule 配置

```bash
# 修改 submodule 的 URL 或分支
pnpm script:submodule modify <path>

# 示例
pnpm script:submodule modify packages/color
```

### 4. 项目初始化 (`script:init`)

一键初始化整个项目，适用于新克隆的仓库。

```bash
# 完整初始化
pnpm script:init

# 跳过依赖安装
pnpm script:init --skip-deps

# 跳过 submodule 初始化
pnpm script:init --skip-submodules

# 预览模式
pnpm script:init --dry-run

# 强制执行（跳过确认）
pnpm script:init --force
```

**执行流程：**
1. 执行 `git submodule update --init --recursive`
2. 为每个 submodule 切换到指定分支
3. 拉取每个 submodule 的最新代码
4. 安装项目依赖 `pnpm install`
5. 运行初始化检查

## 🔧 配置文件

脚本系统支持通过 `scripts/config.json` 进行配置：

```json
{
  "git": {
    "defaultBranch": "main",
    "autoStash": true,
    "autoPush": true,
    "commitMessageTemplate": "feat: {message}",
    "requireCommitMessage": true
  },
  "submodules": {
    "defaultBranch": "main",
    "autoCheckout": true,
    "autoUpdate": true,
    "trackRemoteBranch": true
  },
  "project": {
    "autoInstallDeps": true,
    "runChecksAfterInit": true,
    "showProjectInfo": true
  }
}
```

## 🛠️ 高级用法

### 批量操作

```bash
# 更新所有 submodule
pnpm script:update --all

# 检查所有 submodule 状态
pnpm script:submodule list
```

### 错误处理

所有脚本都包含完善的错误处理：

- **合并冲突**: 自动检测并提示用户手动解决
- **网络错误**: 重试机制和友好的错误提示
- **权限问题**: 清晰的错误信息和解决建议

### 预览模式

使用 `--dry-run` 参数可以预览操作而不执行：

```bash
pnpm script:commit --dry-run
pnpm script:update --all --dry-run
pnpm script:submodule add <url> <path> --dry-run
```

## 📝 日志和调试

脚本提供详细的日志输出：

- 🔵 **信息**: 一般信息
- 🟢 **成功**: 操作成功
- 🟡 **警告**: 需要注意的问题
- 🔴 **错误**: 操作失败
- 🔷 **步骤**: 当前执行的步骤

## 🔒 安全特性

- **确认提示**: 危险操作前会要求用户确认
- **备份机制**: 自动 stash 保护本地更改
- **回滚支持**: 操作失败时自动恢复
- **权限检查**: 验证 Git 仓库权限

## 🚨 故障排除

### 常见问题

1. **权限错误**
   ```bash
   # 检查 SSH 密钥配置
   ssh -T git@github.com
   ```

2. **合并冲突**
   ```bash
   # 手动解决冲突后
   git add .
   git commit -m "resolve conflicts"
   ```

3. **Submodule 问题**
   ```bash
   # 重新初始化 submodule
   git submodule deinit --all
   git submodule update --init --recursive
   ```

### 调试模式

设置环境变量启用详细日志：

```bash
DEBUG=1 pnpm script:commit
```

## 📚 API 参考

### 通用选项

所有脚本都支持以下选项：

- `-d, --dry-run`: 预览模式，不执行实际操作
- `-f, --force`: 强制执行，跳过确认提示
- `-h, --help`: 显示帮助信息

### 环境变量

- `DEBUG`: 启用调试模式
- `NO_COLOR`: 禁用彩色输出
- `CI`: CI 环境下自动启用非交互模式

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进脚本系统！

### 开发指南

1. 所有脚本使用 TypeScript + ESM 语法
2. 使用 `tsx` 作为运行时
3. 遵循现有的代码风格和错误处理模式
4. 添加适当的日志和用户提示

### 测试

```bash
# 运行所有脚本的预览模式
pnpm script:commit --dry-run
pnpm script:update --all --dry-run
pnpm script:submodule list
pnpm script:init --dry-run
```

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件。
