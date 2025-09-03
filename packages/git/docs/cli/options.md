# 配置选项

本页面详细介绍 `ldesign-git` CLI 工具的配置选项和高级用法。

## 全局选项

所有 `ldesign-git` 命令都支持以下全局选项：

### --help, -h

显示命令的帮助信息。

```bash
# 显示主帮助
ldesign-git --help
ldesign-git -h

# 显示特定命令的帮助
ldesign-git init --help
ldesign-git branch --help
```

### --version, -v

显示版本信息。

```bash
ldesign-git --version
ldesign-git -v
```

**输出示例：**
```
@ldesign/git v0.1.0
```

### --cwd \<path\>

指定命令执行的工作目录。

```bash
# 在指定目录执行命令
ldesign-git status --cwd /path/to/repository

# 在不同项目间切换
ldesign-git status --cwd /path/to/project1
ldesign-git status --cwd /path/to/project2
```

**使用场景：**
- 管理多个 Git 仓库
- 在脚本中操作不同目录
- 避免频繁切换工作目录

## 命令特定选项

### init 命令选项

#### --bare

创建裸仓库（没有工作目录的仓库）。

```bash
# 创建普通仓库
ldesign-git init

# 创建裸仓库
ldesign-git init --bare
```

**裸仓库用途：**
- 作为中央仓库接收推送
- 服务器端仓库
- 备份仓库

### log 命令选项

#### --max-count=\<n\>

限制显示的提交数量。

```bash
# 显示最近 5 条提交
ldesign-git log --max-count=5

# 显示最近 10 条提交
ldesign-git log --max-count=10

# 显示最近 1 条提交
ldesign-git log --max-count=1
```

### branch 命令选项

#### --remote

在列出分支时包含远程分支。

```bash
# 只显示本地分支
ldesign-git branch list

# 显示所有分支（包含远程）
ldesign-git branch list --remote
```

#### --force

强制删除分支，即使分支包含未合并的更改。

```bash
# 普通删除（只能删除已合并的分支）
ldesign-git branch delete feature-branch

# 强制删除（可以删除未合并的分支）
ldesign-git branch delete feature-branch --force
```

## 环境变量

可以通过环境变量配置 CLI 工具的行为：

### LDESIGN_GIT_DEBUG

启用调试模式，显示详细的执行信息。

```bash
# Linux/macOS
export LDESIGN_GIT_DEBUG=true
ldesign-git status

# Windows PowerShell
$env:LDESIGN_GIT_DEBUG = "true"
ldesign-git status

# Windows CMD
set LDESIGN_GIT_DEBUG=true
ldesign-git status
```

### LDESIGN_GIT_TIMEOUT

设置命令超时时间（毫秒）。

```bash
# 设置 60 秒超时
export LDESIGN_GIT_TIMEOUT=60000
ldesign-git clone https://github.com/large/repository.git
```

### LDESIGN_GIT_BINARY

指定 Git 可执行文件的路径。

```bash
# 使用自定义 Git 路径
export LDESIGN_GIT_BINARY=/usr/local/bin/git
ldesign-git status
```

## 配置文件

### 项目级配置

在项目根目录创建 `.ldesign-git.json` 配置文件：

```json
{
  "timeout": 30000,
  "debug": false,
  "maxConcurrentProcesses": 5,
  "binary": "git"
}
```

### 全局配置

在用户主目录创建 `.ldesign-git-global.json` 配置文件：

```json
{
  "timeout": 60000,
  "debug": true,
  "defaultRemote": "origin",
  "defaultBranch": "main"
}
```

## 输出格式

### JSON 输出

大多数命令默认输出 JSON 格式，便于脚本处理：

```bash
# 获取状态信息
STATUS=$(ldesign-git status)
echo $STATUS | jq '.current'  # 提取当前分支

# 获取分支列表
BRANCHES=$(ldesign-git branch list)
echo $BRANCHES | jq '.[].name'  # 提取所有分支名
```

### 纯文本输出

某些命令提供纯文本输出：

```bash
# 获取当前分支名（纯文本）
ldesign-git branch current

# 获取版本信息（纯文本）
ldesign-git --version
```

## 脚本集成

### Bash 脚本示例

```bash
#!/bin/bash

# 配置脚本
set -e  # 遇到错误时退出

# 设置环境变量
export LDESIGN_GIT_DEBUG=false
export LDESIGN_GIT_TIMEOUT=30000

# 项目配置
PROJECT_DIR="/path/to/project"
REMOTE_NAME="origin"
MAIN_BRANCH="main"

# 函数：检查命令是否成功
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 成功"
    else
        echo "❌ $1 失败"
        exit 1
    fi
}

# 主流程
echo "🚀 开始自动化 Git 操作..."

# 切换到项目目录
cd "$PROJECT_DIR"

# 检查仓库状态
echo "📊 检查仓库状态..."
ldesign-git status --cwd "$PROJECT_DIR"
check_success "状态检查"

# 添加所有更改
echo "📦 添加文件..."
ldesign-git add . --cwd "$PROJECT_DIR"
check_success "文件添加"

# 提交更改
echo "💾 提交更改..."
COMMIT_MSG="Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
ldesign-git commit "$COMMIT_MSG" --cwd "$PROJECT_DIR"
check_success "提交"

# 推送到远程
echo "🚀 推送到远程..."
ldesign-git push "$REMOTE_NAME" "$MAIN_BRANCH" --cwd "$PROJECT_DIR"
check_success "推送"

echo "🎉 自动化操作完成！"
```

### PowerShell 脚本示例

```powershell
# Git 自动化脚本
param(
    [string]$ProjectPath = ".",
    [string]$Remote = "origin",
    [string]$Branch = "main",
    [switch]$Debug
)

# 设置环境变量
if ($Debug) {
    $env:LDESIGN_GIT_DEBUG = "true"
}

# 函数：检查命令结果
function Test-GitCommand {
    param([string]$Operation)
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $Operation 成功" -ForegroundColor Green
    } else {
        Write-Host "❌ $Operation 失败" -ForegroundColor Red
        exit 1
    }
}

# 主流程
Write-Host "🚀 开始 Git 自动化操作..." -ForegroundColor Cyan

# 检查状态
Write-Host "📊 检查仓库状态..."
$status = ldesign-git status --cwd $ProjectPath | ConvertFrom-Json
Test-GitCommand "状态检查"

# 显示状态信息
Write-Host "当前分支: $($status.current)" -ForegroundColor Yellow
Write-Host "未暂存文件: $($status.not_added.Count)" -ForegroundColor Yellow
Write-Host "已修改文件: $($status.modified.Count)" -ForegroundColor Yellow

# 如果有更改，则提交
if ($status.not_added.Count -gt 0 -or $status.modified.Count -gt 0) {
    Write-Host "📦 添加文件..."
    ldesign-git add . --cwd $ProjectPath
    Test-GitCommand "文件添加"
    
    Write-Host "💾 提交更改..."
    $commitMsg = "Auto commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    ldesign-git commit $commitMsg --cwd $ProjectPath
    Test-GitCommand "提交"
    
    Write-Host "🚀 推送到远程..."
    ldesign-git push $Remote $Branch --cwd $ProjectPath
    Test-GitCommand "推送"
    
    Write-Host "🎉 自动化操作完成！" -ForegroundColor Green
} else {
    Write-Host "ℹ️ 没有需要提交的更改" -ForegroundColor Blue
}
```

## 性能优化

### 并发控制

通过环境变量控制并发进程数：

```bash
# 限制并发数以避免资源竞争
export LDESIGN_GIT_MAX_CONCURRENT=2
ldesign-git status
```

### 超时设置

根据网络环境调整超时时间：

```bash
# 慢网络环境
export LDESIGN_GIT_TIMEOUT=120000  # 2 分钟

# 快速本地操作
export LDESIGN_GIT_TIMEOUT=10000   # 10 秒
```

### 缓存优化

使用本地缓存减少重复操作：

```bash
# 缓存状态信息
STATUS_CACHE="/tmp/git-status-cache"
if [ ! -f "$STATUS_CACHE" ] || [ $(find "$STATUS_CACHE" -mmin +5) ]; then
    ldesign-git status > "$STATUS_CACHE"
fi
cat "$STATUS_CACHE"
```

## 故障排除

### 调试模式

启用调试模式获取详细信息：

```bash
export LDESIGN_GIT_DEBUG=true
ldesign-git status
```

### 日志记录

将输出重定向到日志文件：

```bash
# 记录所有输出
ldesign-git status 2>&1 | tee git-operations.log

# 只记录错误
ldesign-git status 2>git-errors.log
```

### 常见问题

1. **命令超时**
   ```bash
   # 增加超时时间
   export LDESIGN_GIT_TIMEOUT=120000
   ldesign-git clone https://large-repo.git
   ```

2. **权限问题**
   ```bash
   # 检查文件权限
   ls -la .git/
   
   # 修复权限
   chmod -R 755 .git/
   ```

3. **路径问题**
   ```bash
   # 使用绝对路径
   ldesign-git status --cwd /absolute/path/to/repo
   
   # 检查当前目录
   pwd
   ```

## 最佳实践

1. **使用配置文件** - 为不同项目设置不同的配置
2. **环境变量管理** - 使用 `.env` 文件管理环境变量
3. **错误处理** - 在脚本中检查命令执行结果
4. **日志记录** - 记录重要操作的日志
5. **权限控制** - 确保脚本有适当的文件权限
6. **测试验证** - 在生产环境前测试脚本

## 下一步

- 查看 [基础操作](/cli/basic) 了解基本命令
- 学习 [分支管理](/cli/branches) 进行分支操作
- 了解 [远程仓库](/cli/remote) 管理远程仓库
