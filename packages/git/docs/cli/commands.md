# CLI 命令概览

@ldesign/git 提供了功能完整的命令行工具 `ldesign-git`，支持所有常用的 Git 操作。

## 安装

### 全局安装

```bash
pnpm add -g @ldesign/git
```

### 项目内使用

```bash
# 安装到项目
pnpm add @ldesign/git

# 使用 npx 运行
npx ldesign-git --help
```

## 基本语法

```bash
ldesign-git <command> [options] [arguments]
```

## 全局选项

所有命令都支持以下全局选项：

- `--help, -h` - 显示帮助信息
- `--version, -v` - 显示版本信息
- `--cwd <path>` - 指定工作目录

## 命令分类

### 基础操作

| 命令 | 描述 | 示例 |
|------|------|------|
| `init` | 初始化 Git 仓库 | `ldesign-git init` |
| `clone` | 克隆远程仓库 | `ldesign-git clone <url> [dir]` |
| `add` | 添加文件到暂存区 | `ldesign-git add <files...>` |
| `commit` | 提交更改 | `ldesign-git commit <message>` |
| `push` | 推送到远程仓库 | `ldesign-git push [remote] [branch]` |
| `pull` | 从远程仓库拉取 | `ldesign-git pull [remote] [branch]` |
| `status` | 显示仓库状态 | `ldesign-git status` |
| `log` | 显示提交日志 | `ldesign-git log [--max-count=<n>]` |

### 分支管理

| 命令 | 描述 | 示例 |
|------|------|------|
| `branch list` | 列出分支 | `ldesign-git branch list [--remote]` |
| `branch create` | 创建分支 | `ldesign-git branch create <name> [start]` |
| `branch checkout` | 切换分支 | `ldesign-git branch checkout <name>` |
| `branch delete` | 删除分支 | `ldesign-git branch delete <name> [--force]` |
| `branch current` | 显示当前分支 | `ldesign-git branch current` |

### 远程仓库

| 命令 | 描述 | 示例 |
|------|------|------|
| `remote list` | 列出远程仓库 | `ldesign-git remote list` |
| `remote add` | 添加远程仓库 | `ldesign-git remote add <name> <url>` |
| `remote remove` | 删除远程仓库 | `ldesign-git remote remove <name>` |

## 详细命令说明

### `init` - 初始化仓库

初始化一个新的 Git 仓库。

```bash
ldesign-git init [options]
```

**选项：**
- `--bare` - 创建裸仓库

**示例：**

```bash
# 初始化普通仓库
ldesign-git init

# 初始化裸仓库
ldesign-git init --bare

# 在指定目录初始化
ldesign-git init --cwd /path/to/directory
```

### `clone` - 克隆仓库

从远程仓库克隆代码。

```bash
ldesign-git clone <url> [directory]
```

**参数：**
- `url` - 远程仓库 URL
- `directory` - 目标目录（可选）

**示例：**

```bash
# 克隆到当前目录
ldesign-git clone https://github.com/user/repo.git

# 克隆到指定目录
ldesign-git clone https://github.com/user/repo.git my-repo

# 克隆到指定工作目录
ldesign-git clone https://github.com/user/repo.git --cwd /path/to/parent
```

### `add` - 添加文件

将文件添加到暂存区。

```bash
ldesign-git add <files...>
```

**参数：**
- `files` - 文件路径列表

**示例：**

```bash
# 添加单个文件
ldesign-git add README.md

# 添加多个文件
ldesign-git add file1.txt file2.txt

# 添加所有文件
ldesign-git add .

# 添加所有 .js 文件
ldesign-git add "*.js"
```

### `commit` - 提交更改

提交暂存区的更改。

```bash
ldesign-git commit <message> [files...]
```

**参数：**
- `message` - 提交消息
- `files` - 指定文件列表（可选）

**示例：**

```bash
# 提交所有暂存的更改
ldesign-git commit "Initial commit"

# 提交指定文件
ldesign-git commit "Update docs" README.md docs/

# 使用引号包含特殊字符
ldesign-git commit "Fix: resolve issue #123"
```

### `push` - 推送更改

推送本地更改到远程仓库。

```bash
ldesign-git push [remote] [branch]
```

**参数：**
- `remote` - 远程仓库名称（默认：origin）
- `branch` - 分支名称（默认：当前分支）

**示例：**

```bash
# 推送到默认远程和分支
ldesign-git push

# 推送到指定远程和分支
ldesign-git push origin main

# 推送到指定远程
ldesign-git push upstream
```

### `pull` - 拉取更改

从远程仓库拉取更改。

```bash
ldesign-git pull [remote] [branch]
```

**参数：**
- `remote` - 远程仓库名称（默认：origin）
- `branch` - 分支名称（默认：当前分支）

**示例：**

```bash
# 从默认远程和分支拉取
ldesign-git pull

# 从指定远程和分支拉取
ldesign-git pull origin main

# 从指定远程拉取
ldesign-git pull upstream
```

### `status` - 查看状态

显示工作目录和暂存区的状态。

```bash
ldesign-git status
```

**示例：**

```bash
ldesign-git status
```

**输出示例：**

```json
{
  "current": "main",
  "tracking": "origin/main",
  "ahead": 0,
  "behind": 0,
  "staged": ["file1.txt"],
  "not_added": ["file2.txt"],
  "modified": [],
  "deleted": [],
  "conflicted": [],
  "created": ["file3.txt"]
}
```

### `log` - 查看日志

显示提交历史。

```bash
ldesign-git log [options]
```

**选项：**
- `--max-count=<n>` - 限制显示条数

**示例：**

```bash
# 显示所有提交
ldesign-git log

# 显示最近 5 条提交
ldesign-git log --max-count=5

# 显示最近 10 条提交
ldesign-git log --max-count=10
```

## 分支命令详解

### `branch list` - 列出分支

```bash
ldesign-git branch list [options]
```

**选项：**
- `--remote` - 包含远程分支

**示例：**

```bash
# 列出本地分支
ldesign-git branch list

# 列出所有分支（包含远程）
ldesign-git branch list --remote
```

### `branch create` - 创建分支

```bash
ldesign-git branch create <name> [start-point]
```

**参数：**
- `name` - 分支名称
- `start-point` - 起始点（可选）

**示例：**

```bash
# 从当前分支创建新分支
ldesign-git branch create feature/new-feature

# 从指定分支创建新分支
ldesign-git branch create hotfix/bug-fix main

# 从指定提交创建新分支
ldesign-git branch create release/v1.0 abc123
```

### `branch checkout` - 切换分支

```bash
ldesign-git branch checkout <name>
```

**参数：**
- `name` - 分支名称

**示例：**

```bash
# 切换到指定分支
ldesign-git branch checkout main

# 切换到功能分支
ldesign-git branch checkout feature/new-feature
```

### `branch delete` - 删除分支

```bash
ldesign-git branch delete <name> [options]
```

**参数：**
- `name` - 分支名称

**选项：**
- `--force` - 强制删除

**示例：**

```bash
# 删除分支
ldesign-git branch delete feature/old-feature

# 强制删除分支
ldesign-git branch delete feature/old-feature --force
```

## 远程仓库命令详解

### `remote add` - 添加远程仓库

```bash
ldesign-git remote add <name> <url>
```

**参数：**
- `name` - 远程仓库名称
- `url` - 远程仓库 URL

**示例：**

```bash
# 添加 origin 远程仓库
ldesign-git remote add origin https://github.com/user/repo.git

# 添加 upstream 远程仓库
ldesign-git remote add upstream https://github.com/original/repo.git
```

### `remote list` - 列出远程仓库

```bash
ldesign-git remote list
```

**示例：**

```bash
ldesign-git remote list
```

### `remote remove` - 删除远程仓库

```bash
ldesign-git remote remove <name>
```

**参数：**
- `name` - 远程仓库名称

**示例：**

```bash
# 删除远程仓库
ldesign-git remote remove origin
```

## 使用技巧

### 1. 工作目录切换

```bash
# 在不同目录执行命令
ldesign-git status --cwd /path/to/repo1
ldesign-git status --cwd /path/to/repo2
```

### 2. 批量操作

```bash
# 添加多个文件
ldesign-git add file1.txt file2.txt file3.txt

# 或使用通配符
ldesign-git add "src/**/*.js"
```

### 3. 管道操作

```bash
# 结合其他命令使用
ldesign-git status | jq '.staged[]'
ldesign-git log --max-count=1 | jq '.hash'
```

### 4. 脚本集成

```bash
#!/bin/bash

# 自动化脚本示例
ldesign-git add .
ldesign-git commit "Auto commit: $(date)"
ldesign-git push origin main
```

## 错误处理

CLI 工具会返回适当的退出代码：

- `0` - 成功
- `1` - 失败

**示例：**

```bash
# 检查命令是否成功
if ldesign-git status; then
  echo "状态获取成功"
else
  echo "状态获取失败"
fi
```

## 下一步

- 查看 [基础操作](/cli/basic) 了解详细用法
- 阅读 [分支管理](/cli/branches) 学习分支操作
- 浏览 [配置选项](/cli/options) 了解高级配置
