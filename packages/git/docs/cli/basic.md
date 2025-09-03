# 基础操作

本页面详细介绍 `ldesign-git` CLI 工具的基础操作命令。

## 仓库初始化

### init - 初始化仓库

初始化一个新的 Git 仓库。

```bash
ldesign-git init [options]
```

**选项：**
- `--bare` - 创建裸仓库

**示例：**

```bash
# 在当前目录初始化仓库
ldesign-git init

# 创建裸仓库
ldesign-git init --bare

# 在指定目录初始化
ldesign-git init --cwd /path/to/project
```

**输出示例：**
```
✅ 操作成功
```

## 文件管理

### add - 添加文件

将文件添加到暂存区。

```bash
ldesign-git add <files...>
```

**参数：**
- `files` - 要添加的文件路径，支持多个文件

**示例：**

```bash
# 添加单个文件
ldesign-git add README.md

# 添加多个文件
ldesign-git add src/index.js src/utils.js

# 添加所有文件
ldesign-git add .

# 添加特定类型的文件
ldesign-git add "*.js"

# 添加目录下所有文件
ldesign-git add src/
```

**输出示例：**
```
✅ 操作成功
```

### commit - 提交更改

提交暂存区的更改。

```bash
ldesign-git commit <message> [files...]
```

**参数：**
- `message` - 提交消息（必需）
- `files` - 可选，指定要提交的文件

**示例：**

```bash
# 提交所有暂存的更改
ldesign-git commit "Initial commit"

# 提交指定文件
ldesign-git commit "Update documentation" README.md docs/

# 包含特殊字符的提交消息
ldesign-git commit "Fix: resolve issue #123"

# 多行提交消息
ldesign-git commit "Feature: add user authentication

- Add login functionality
- Add password validation
- Add session management"
```

**输出示例：**
```json
{
  "hash": "a1b2c3d4",
  "message": "Initial commit",
  "author_name": "John Doe",
  "author_email": "john@example.com",
  "date": "2024-01-01T12:00:00Z"
}
```

## 状态查询

### status - 查看状态

显示工作目录和暂存区的状态。

```bash
ldesign-git status
```

**示例：**

```bash
# 查看当前状态
ldesign-git status

# 在指定目录查看状态
ldesign-git status --cwd /path/to/repo
```

**输出示例：**
```json
{
  "current": "main",
  "tracking": "origin/main",
  "ahead": 0,
  "behind": 0,
  "staged": ["src/index.js"],
  "not_added": ["README.md"],
  "modified": ["package.json"],
  "deleted": [],
  "conflicted": [],
  "created": ["src/new-file.js"]
}
```

**字段说明：**
- `current` - 当前分支名
- `tracking` - 跟踪的远程分支
- `ahead` - 领先远程分支的提交数
- `behind` - 落后远程分支的提交数
- `staged` - 已暂存的文件
- `not_added` - 未暂存的新文件
- `modified` - 已修改但未暂存的文件
- `deleted` - 已删除的文件
- `conflicted` - 有冲突的文件
- `created` - 新创建的文件

### log - 查看提交日志

显示提交历史记录。

```bash
ldesign-git log [options]
```

**选项：**
- `--max-count=<n>` - 限制显示的提交数量

**示例：**

```bash
# 显示所有提交
ldesign-git log

# 显示最近 5 条提交
ldesign-git log --max-count=5

# 显示最近 10 条提交
ldesign-git log --max-count=10
```

**输出示例：**
```json
[
  {
    "hash": "a1b2c3d4e5f6",
    "message": "Add new feature",
    "author_name": "John Doe",
    "author_email": "john@example.com",
    "date": "2024-01-01T12:00:00Z"
  },
  {
    "hash": "f6e5d4c3b2a1",
    "message": "Fix bug in authentication",
    "author_name": "Jane Smith",
    "author_email": "jane@example.com",
    "date": "2024-01-01T11:00:00Z"
  }
]
```

## 远程操作

### clone - 克隆仓库

从远程仓库克隆代码到本地。

```bash
ldesign-git clone <url> [directory]
```

**参数：**
- `url` - 远程仓库 URL（必需）
- `directory` - 目标目录（可选）

**示例：**

```bash
# 克隆到当前目录
ldesign-git clone https://github.com/user/repo.git

# 克隆到指定目录
ldesign-git clone https://github.com/user/repo.git my-project

# 克隆到指定父目录
ldesign-git clone https://github.com/user/repo.git --cwd /path/to/parent

# 克隆私有仓库（需要认证）
ldesign-git clone https://username:token@github.com/user/private-repo.git
```

**输出示例：**
```
✅ 操作成功
```

### push - 推送更改

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

# 推送到指定远程的当前分支
ldesign-git push origin

# 推送到不同的远程仓库
ldesign-git push upstream main
```

**输出示例：**
```
✅ 操作成功
```

### pull - 拉取更改

从远程仓库拉取更改到本地。

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

# 从指定远程拉取当前分支
ldesign-git pull origin

# 从上游仓库拉取
ldesign-git pull upstream main
```

**输出示例：**
```
✅ 操作成功
```

## 实用技巧

### 1. 批量操作

```bash
# 添加多个特定文件
ldesign-git add file1.js file2.js file3.js

# 添加所有 JavaScript 文件
ldesign-git add "*.js"

# 添加所有源代码文件
ldesign-git add "src/**/*"
```

### 2. 工作目录切换

```bash
# 在不同项目间切换
ldesign-git status --cwd /path/to/project1
ldesign-git status --cwd /path/to/project2

# 在脚本中使用
for project in project1 project2 project3; do
  echo "检查 $project 状态:"
  ldesign-git status --cwd "/path/to/$project"
done
```

### 3. 条件执行

```bash
# 检查状态后决定是否提交
if ldesign-git status | grep -q '"staged":\s*\['; then
  ldesign-git commit "Auto commit: $(date)"
else
  echo "没有文件需要提交"
fi
```

### 4. 管道操作

```bash
# 提取特定信息
ldesign-git status | jq -r '.current'  # 获取当前分支
ldesign-git log --max-count=1 | jq -r '.[0].hash'  # 获取最新提交哈希
```

## 错误处理

### 常见错误和解决方案

1. **仓库不存在**
   ```bash
   # 错误信息
   ❌ 请先初始化 Git 仓库
   
   # 解决方案
   ldesign-git init
   ```

2. **没有文件可提交**
   ```bash
   # 错误信息
   ❌ 请指定要添加的文件
   
   # 解决方案
   ldesign-git add .
   ldesign-git commit "Your message"
   ```

3. **远程仓库不存在**
   ```bash
   # 错误信息
   ❌ 远程仓库不存在
   
   # 解决方案
   ldesign-git remote add origin <url>
   ```

### 调试技巧

```bash
# 使用 --cwd 指定正确的目录
ldesign-git status --cwd /correct/path

# 检查当前工作目录
pwd
ls -la

# 验证 Git 仓库
ls -la .git
```

## 脚本集成

### Bash 脚本示例

```bash
#!/bin/bash

# 自动化提交脚本
PROJECT_DIR="/path/to/project"

echo "开始自动提交流程..."

# 切换到项目目录并检查状态
cd "$PROJECT_DIR"
STATUS=$(ldesign-git status)

# 检查是否有未暂存的文件
if echo "$STATUS" | grep -q '"not_added":\s*\[.*\]' || echo "$STATUS" | grep -q '"modified":\s*\[.*\]'; then
  echo "发现未暂存的文件，开始添加..."
  ldesign-git add .
  
  echo "提交更改..."
  ldesign-git commit "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
  
  echo "推送到远程仓库..."
  ldesign-git push origin main
  
  echo "✅ 自动提交完成"
else
  echo "没有需要提交的更改"
fi
```

### PowerShell 脚本示例

```powershell
# 自动化提交脚本
$ProjectDir = "C:\path\to\project"

Write-Host "开始自动提交流程..."

# 检查状态
$Status = ldesign-git status --cwd $ProjectDir | ConvertFrom-Json

# 检查是否有未暂存的文件
if ($Status.not_added.Count -gt 0 -or $Status.modified.Count -gt 0) {
    Write-Host "发现未暂存的文件，开始添加..."
    ldesign-git add . --cwd $ProjectDir
    
    Write-Host "提交更改..."
    $CommitMessage = "Auto commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    ldesign-git commit $CommitMessage --cwd $ProjectDir
    
    Write-Host "推送到远程仓库..."
    ldesign-git push origin main --cwd $ProjectDir
    
    Write-Host "✅ 自动提交完成"
} else {
    Write-Host "没有需要提交的更改"
}
```

## 下一步

- 学习 [分支管理](/cli/branches) 命令
- 了解 [远程仓库](/cli/remote) 操作
- 查看 [配置选项](/cli/options) 进行高级配置
