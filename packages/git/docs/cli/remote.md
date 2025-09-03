# 远程仓库管理

本页面详细介绍 `ldesign-git` CLI 工具的远程仓库管理命令。

## 远程仓库列表

### remote list - 列出远程仓库

列出所有配置的远程仓库。

```bash
ldesign-git remote list
```

**示例：**

```bash
# 列出所有远程仓库
ldesign-git remote list

# 在指定目录列出远程仓库
ldesign-git remote list --cwd /path/to/repository
```

**输出示例：**
```json
[
  {
    "name": "origin",
    "refs": {
      "fetch": "https://github.com/user/repo.git",
      "push": "https://github.com/user/repo.git"
    }
  },
  {
    "name": "upstream",
    "refs": {
      "fetch": "https://github.com/original/repo.git",
      "push": "https://github.com/original/repo.git"
    }
  }
]
```

## 添加远程仓库

### remote add - 添加远程仓库

添加一个新的远程仓库。

```bash
ldesign-git remote add <name> <url>
```

**参数：**
- `name` - 远程仓库名称（必需）
- `url` - 远程仓库 URL（必需）

**示例：**

```bash
# 添加 origin 远程仓库
ldesign-git remote add origin https://github.com/user/repo.git

# 添加 upstream 远程仓库
ldesign-git remote add upstream https://github.com/original/repo.git

# 添加使用 SSH 的远程仓库
ldesign-git remote add origin git@github.com:user/repo.git

# 添加企业 Git 服务器
ldesign-git remote add company https://git.company.com/project/repo.git
```

**输出示例：**
```
✅ 操作成功
```

## 删除远程仓库

### remote remove - 删除远程仓库

删除指定的远程仓库配置。

```bash
ldesign-git remote remove <name>
```

**参数：**
- `name` - 要删除的远程仓库名称（必需）

**示例：**

```bash
# 删除 origin 远程仓库
ldesign-git remote remove origin

# 删除 upstream 远程仓库
ldesign-git remote remove upstream

# 删除自定义远程仓库
ldesign-git remote remove backup
```

**输出示例：**
```
✅ 操作成功
```

## 常用工作流

### 设置 Fork 工作流

当您 fork 了一个项目并想要贡献代码时：

```bash
# 1. 克隆您的 fork
ldesign-git clone https://github.com/yourusername/project.git
cd project

# 2. 添加原始仓库作为 upstream
ldesign-git remote add upstream https://github.com/original/project.git

# 3. 验证远程仓库配置
ldesign-git remote list

# 4. 从 upstream 获取最新更改
ldesign-git pull upstream main

# 5. 推送到您的 fork
ldesign-git push origin main
```

### 多远程仓库管理

管理多个远程仓库（如备份、镜像等）：

```bash
# 添加主要远程仓库
ldesign-git remote add origin https://github.com/user/repo.git

# 添加备份远程仓库
ldesign-git remote add backup https://gitlab.com/user/repo.git

# 添加镜像远程仓库
ldesign-git remote add mirror https://bitbucket.org/user/repo.git

# 查看所有远程仓库
ldesign-git remote list

# 推送到不同的远程仓库
ldesign-git push origin main
ldesign-git push backup main
ldesign-git push mirror main
```

### 更换远程仓库 URL

当远程仓库 URL 发生变化时：

```bash
# 1. 查看当前远程仓库
ldesign-git remote list

# 2. 删除旧的远程仓库
ldesign-git remote remove origin

# 3. 添加新的远程仓库
ldesign-git remote add origin https://new-server.com/user/repo.git

# 4. 验证更改
ldesign-git remote list
```

## 脚本示例

### Bash 脚本：批量管理远程仓库

```bash
#!/bin/bash

# 远程仓库管理脚本
PROJECT_DIR="/path/to/project"
REMOTES=(
    "origin:https://github.com/user/repo.git"
    "backup:https://gitlab.com/user/repo.git"
    "mirror:https://bitbucket.org/user/repo.git"
)

echo "🔧 配置远程仓库..."

cd "$PROJECT_DIR"

# 清除现有远程仓库
echo "清除现有远程仓库..."
EXISTING_REMOTES=$(ldesign-git remote list | jq -r '.[].name')
for remote in $EXISTING_REMOTES; do
    echo "删除远程仓库: $remote"
    ldesign-git remote remove "$remote"
done

# 添加新的远程仓库
echo "添加远程仓库..."
for remote_config in "${REMOTES[@]}"; do
    IFS=':' read -r name url <<< "$remote_config"
    echo "添加远程仓库: $name -> $url"
    ldesign-git remote add "$name" "$url"
done

# 验证配置
echo "✅ 远程仓库配置完成："
ldesign-git remote list
```

### PowerShell 脚本：远程仓库同步

```powershell
# 远程仓库同步脚本
param(
    [string]$ProjectPath = ".",
    [string]$Branch = "main"
)

$Remotes = @(
    @{Name="origin"; Url="https://github.com/user/repo.git"},
    @{Name="backup"; Url="https://gitlab.com/user/repo.git"}
)

Write-Host "🔄 开始远程仓库同步..." -ForegroundColor Cyan

# 检查当前远程仓库
Write-Host "📋 当前远程仓库："
$currentRemotes = ldesign-git remote list --cwd $ProjectPath | ConvertFrom-Json
$currentRemotes | ForEach-Object {
    Write-Host "  $($_.name): $($_.refs.fetch)" -ForegroundColor Yellow
}

# 确保所有远程仓库都已配置
Write-Host "🔧 检查远程仓库配置..."
foreach ($remote in $Remotes) {
    $exists = $currentRemotes | Where-Object { $_.name -eq $remote.Name }
    if (-not $exists) {
        Write-Host "添加远程仓库: $($remote.Name)" -ForegroundColor Green
        ldesign-git remote add $remote.Name $remote.Url --cwd $ProjectPath
    }
}

# 推送到所有远程仓库
Write-Host "🚀 推送到所有远程仓库..."
$updatedRemotes = ldesign-git remote list --cwd $ProjectPath | ConvertFrom-Json
foreach ($remote in $updatedRemotes) {
    Write-Host "推送到 $($remote.name)..." -ForegroundColor Blue
    try {
        ldesign-git push $remote.name $Branch --cwd $ProjectPath
        Write-Host "✅ $($remote.name) 推送成功" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($remote.name) 推送失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🎉 远程仓库同步完成！" -ForegroundColor Cyan
```

## 故障排除

### 常见问题和解决方案

1. **远程仓库已存在**
   ```bash
   # 错误信息
   ❌ 远程仓库已存在
   
   # 解决方案：先删除再添加
   ldesign-git remote remove origin
   ldesign-git remote add origin https://new-url.git
   ```

2. **远程仓库不存在**
   ```bash
   # 错误信息
   ❌ 远程仓库不存在
   
   # 解决方案：检查名称是否正确
   ldesign-git remote list
   ```

3. **URL 格式错误**
   ```bash
   # 错误信息
   ❌ 无效的 URL 格式
   
   # 解决方案：使用正确的 URL 格式
   # HTTPS: https://github.com/user/repo.git
   # SSH: git@github.com:user/repo.git
   ```

### 调试技巧

```bash
# 检查远程仓库连接
git ls-remote origin

# 验证 SSH 连接（如果使用 SSH）
ssh -T git@github.com

# 检查网络连接
ping github.com
```

## 安全注意事项

### 1. 凭据管理

```bash
# 避免在 URL 中包含密码
# ❌ 不安全
ldesign-git remote add origin https://user:password@github.com/repo.git

# ✅ 安全
ldesign-git remote add origin https://github.com/user/repo.git
# 使用 Git 凭据管理器或 SSH 密钥
```

### 2. SSH 密钥

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your.email@example.com"

# 添加到 SSH 代理
ssh-add ~/.ssh/id_ed25519

# 使用 SSH URL
ldesign-git remote add origin git@github.com:user/repo.git
```

### 3. 访问令牌

```bash
# 使用个人访问令牌（GitHub）
ldesign-git remote add origin https://token@github.com/user/repo.git

# 或配置 Git 凭据管理器
git config --global credential.helper store
```

## 最佳实践

1. **命名约定** - 使用标准的远程仓库名称（origin, upstream, fork）
2. **URL 格式** - 根据需要选择 HTTPS 或 SSH
3. **安全性** - 不要在 URL 中包含明文密码
4. **备份** - 配置多个远程仓库进行备份
5. **文档** - 记录远程仓库的用途和配置

## 下一步

- 了解 [配置选项](/cli/options) 进行高级配置
- 学习 [基础操作](/cli/basic) 命令
- 查看 [分支管理](/cli/branches) 进行分支操作
