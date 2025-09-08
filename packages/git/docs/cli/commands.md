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

## 增强命令（Enhanced）

增强模式提供更多命令与交互能力：

- `interactive`（或 `i`）交互式模式
  - `ldesign-git interactive`
  - 在终端中以 UI 方式查看状态、提交、分析、推荐等。
  - 选项：无（进入交互界面）

- `smart-commit`（或 `sc`）智能提交
  - `ldesign-git smart-commit [message] [-t type] [-s scope] [--emoji] [--all] [--push]`
  - 自动生成规范化提交信息，可选择类型/范围/是否附带 emoji。
  选项：

| 选项 | 说明 |
|------|------|
| -t, --type &lt;type&gt; | 提交类型（feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert） |
| -s, --scope &lt;scope&gt; | 影响范围（如 module、feature 名称） |
| --emoji | 在提交标题中添加对应 emoji |
| -a, --all | 自动添加工作区所有更改 |
| -p, --push | 提交后自动 push |

- `analyze`（或 `an`）仓库分析
  - `ldesign-git analyze [type] [--since &lt;date&gt;] [--until &lt;date&gt;] [--format table|json]`
  - 分析贡献者、热门文件、提交趋势与热力图。
  选项：

| 选项 | 说明 |
|------|------|
| --since &lt;date&gt; | 起始日期（YYYY-MM-DD） |
| --until &lt;date&gt; | 结束日期（YYYY-MM-DD） |
| --format &lt;fmt&gt; | 输出格式（table/json），默认 table |
| [type] | 可选分析类型：contributors/files/branches/trends 等 |

- `batch`（或 `bt`）批量操作
  - `ldesign-git batch <operation> [-c commits...] [-b branches...] [--force]`
  - 支持 batch cherry-pick/revert/branch 等常见批量任务。
  选项：

| 选项 | 说明 |
|------|------|
| -c, --commits &lt;commits...&gt; | 提交列表（哈希或范围） |
| -b, --branches &lt;branches...&gt; | 分支列表 |
| -f, --force | 强制执行（谨慎使用） |

- `resolve-conflicts`（或 `rc`）冲突解决助手
  - `ldesign-git resolve-conflicts [-s strategy] [--visual]`
  - 提供自动/半自动冲突处理建议。
  选项：

| 选项 | 说明 |
|------|------|
| -s, --strategy &lt;strategy&gt; | 解决策略（interactive/ours/theirs/manual），默认 interactive |
| -v, --visual | 以可视化方式辅助解决 |

- `hooks`（或 `hk`）钩子管理
  - `ldesign-git hooks <action> [-n name] [-s script] [--list]`
  - 一键启用/禁用常见 pre-commit / commit-msg 模板。
  选项：

| 选项 | 说明 |
|------|------|
| action | 操作（enable/disable/list/apply 等） |
| -n, --name &lt;name&gt; | 钩子名称（pre-commit/commit-msg 等） |
| -s, --script &lt;script&gt; | 自定义脚本内容 |
| -l, --list | 列出所有模板 |

- `config`（或 `cf`）CLI 配置管理
  - `ldesign-git config <action> [key] [value]`
  - 管理主题、别名、特性开关等。
  选项：

| 选项 | 说明 |
|------|------|
| action | 操作（get/set/unset/list/export/import/reset 等） |
| [key] [value] | 键/值（如 theme.primary、features.colors 等） |

- `workflow`（或 `wf`）工作流
  - `ldesign-git workflow <action> [-n name] [-t type]`
  - 支持 GitFlow/GitHub Flow 等流程上的便捷操作。
  选项：

| 选项 | 说明 |
|------|------|
| action | 操作（start/finish 等） |
| -n, --name &lt;name&gt; | 分支/版本名（如 feature/x、1.0.0） |
| -t, --type &lt;type&gt; | 工作流类型（gitflow/github-flow），默认 gitflow |

---

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
