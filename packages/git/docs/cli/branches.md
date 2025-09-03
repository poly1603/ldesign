# 分支管理

本页面详细介绍 `ldesign-git` CLI 工具的分支管理命令。

## 分支列表

### branch list - 列出分支

列出本地分支或包含远程分支的所有分支。

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

**输出示例（本地分支）：**
```json
[
  {
    "name": "main",
    "current": true,
    "commit": "a1b2c3d4"
  },
  {
    "name": "develop",
    "current": false,
    "commit": "e5f6g7h8"
  },
  {
    "name": "feature/user-auth",
    "current": false,
    "commit": "i9j0k1l2"
  }
]
```

**输出示例（包含远程）：**
```json
[
  {
    "name": "main",
    "current": true,
    "commit": "a1b2c3d4"
  },
  {
    "name": "remotes/origin/main",
    "current": false,
    "commit": "a1b2c3d4"
  },
  {
    "name": "remotes/origin/develop",
    "current": false,
    "commit": "e5f6g7h8"
  }
]
```

## 分支创建

### branch create - 创建分支

创建新的分支。

```bash
ldesign-git branch create <name> [start-point]
```

**参数：**
- `name` - 分支名称（必需）
- `start-point` - 起始点，可以是分支名、提交哈希或标签（可选）

**示例：**

```bash
# 从当前分支创建新分支
ldesign-git branch create feature/new-feature

# 从指定分支创建新分支
ldesign-git branch create hotfix/bug-fix main

# 从指定提交创建新分支
ldesign-git branch create release/v1.0 a1b2c3d4

# 从标签创建新分支
ldesign-git branch create maintenance/v1.x v1.0.0
```

**输出示例：**
```
✅ 操作成功
```

## 分支切换

### branch checkout - 切换分支

切换到指定分支。

```bash
ldesign-git branch checkout <name>
```

**参数：**
- `name` - 要切换到的分支名称

**示例：**

```bash
# 切换到主分支
ldesign-git branch checkout main

# 切换到开发分支
ldesign-git branch checkout develop

# 切换到功能分支
ldesign-git branch checkout feature/user-authentication

# 切换到远程分支（会创建本地跟踪分支）
ldesign-git branch checkout origin/feature/remote-feature
```

**输出示例：**
```
✅ 操作成功
```

## 分支删除

### branch delete - 删除分支

删除指定分支。

```bash
ldesign-git branch delete <name> [options]
```

**参数：**
- `name` - 要删除的分支名称

**选项：**
- `--force` - 强制删除分支

**示例：**

```bash
# 删除已合并的分支
ldesign-git branch delete feature/completed-feature

# 强制删除分支（即使未合并）
ldesign-git branch delete feature/abandoned-feature --force

# 删除多个分支（需要多次调用）
ldesign-git branch delete feature/old-feature-1
ldesign-git branch delete feature/old-feature-2
```

**输出示例：**
```
✅ 操作成功
```

**注意事项：**
- 不能删除当前所在的分支
- 删除未合并的分支需要使用 `--force` 选项
- 删除操作不可逆，请谨慎使用

## 当前分支

### branch current - 显示当前分支

显示当前所在的分支名称。

```bash
ldesign-git branch current
```

**示例：**

```bash
# 显示当前分支
ldesign-git branch current
```

**输出示例：**
```
main
```

## 分支工作流示例

### 功能开发工作流

```bash
# 1. 确保在主分支上
ldesign-git branch checkout main

# 2. 创建功能分支
ldesign-git branch create feature/user-profile

# 3. 切换到功能分支
ldesign-git branch checkout feature/user-profile

# 4. 开发功能...
# （编辑文件）

# 5. 提交更改
ldesign-git add .
ldesign-git commit "Add user profile functionality"

# 6. 推送功能分支
ldesign-git push origin feature/user-profile

# 7. 切换回主分支
ldesign-git branch checkout main

# 8. 合并功能分支（需要使用 API，CLI 暂不支持 merge）
# 或者通过 Pull Request 进行合并

# 9. 删除本地功能分支
ldesign-git branch delete feature/user-profile
```

### 热修复工作流

```bash
# 1. 从主分支创建热修复分支
ldesign-git branch create hotfix/critical-bug main

# 2. 切换到热修复分支
ldesign-git branch checkout hotfix/critical-bug

# 3. 修复问题
# （编辑文件）

# 4. 提交修复
ldesign-git add .
ldesign-git commit "Fix critical security vulnerability"

# 5. 推送热修复分支
ldesign-git push origin hotfix/critical-bug

# 6. 切换回主分支进行合并
ldesign-git branch checkout main

# 7. 删除热修复分支
ldesign-git branch delete hotfix/critical-bug
```

### 发布分支工作流

```bash
# 1. 从开发分支创建发布分支
ldesign-git branch create release/v1.2.0 develop

# 2. 切换到发布分支
ldesign-git branch checkout release/v1.2.0

# 3. 进行发布准备（版本号更新、文档等）
# （编辑文件）

# 4. 提交发布准备
ldesign-git add .
ldesign-git commit "Prepare for v1.2.0 release"

# 5. 推送发布分支
ldesign-git push origin release/v1.2.0

# 6. 合并到主分支和开发分支后删除
# （通过 Pull Request 或其他方式）
```

## 分支命名规范

### 推荐的分支命名约定

```bash
# 功能分支
ldesign-git branch create feature/user-authentication
ldesign-git branch create feature/payment-integration
ldesign-git branch create feature/admin-dashboard

# 修复分支
ldesign-git branch create bugfix/login-error
ldesign-git branch create bugfix/memory-leak
ldesign-git branch create hotfix/security-patch

# 发布分支
ldesign-git branch create release/v1.0.0
ldesign-git branch create release/v2.1.0

# 实验分支
ldesign-git branch create experiment/new-algorithm
ldesign-git branch create poc/microservices

# 文档分支
ldesign-git branch create docs/api-documentation
ldesign-git branch create docs/user-guide
```

## 批量分支操作

### 清理已合并的分支

```bash
#!/bin/bash

# 获取所有本地分支
BRANCHES=$(ldesign-git branch list | jq -r '.[].name' | grep -v '^main$' | grep -v '^develop$')

echo "准备清理以下分支："
echo "$BRANCHES"

# 确认删除
read -p "确认删除这些分支？(y/N): " confirm
if [[ $confirm == [yY] ]]; then
    for branch in $BRANCHES; do
        echo "删除分支: $branch"
        ldesign-git branch delete "$branch"
    done
    echo "✅ 分支清理完成"
else
    echo "❌ 操作已取消"
fi
```

### 批量创建分支

```bash
#!/bin/bash

# 定义要创建的分支列表
FEATURES=(
    "feature/user-management"
    "feature/product-catalog"
    "feature/order-processing"
    "feature/payment-gateway"
)

echo "创建功能分支..."

for feature in "${FEATURES[@]}"; do
    echo "创建分支: $feature"
    ldesign-git branch create "$feature"
done

echo "✅ 所有功能分支创建完成"

# 显示分支列表
echo "当前分支列表："
ldesign-git branch list
```

## PowerShell 脚本示例

### 分支管理脚本

```powershell
# 分支管理脚本
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("list", "create", "delete", "cleanup")]
    [string]$Action,
    
    [string]$BranchName,
    [switch]$Force
)

switch ($Action) {
    "list" {
        Write-Host "📋 分支列表："
        $branches = ldesign-git branch list | ConvertFrom-Json
        foreach ($branch in $branches) {
            $marker = if ($branch.current) { "* " } else { "  " }
            Write-Host "$marker$($branch.name)"
        }
    }
    
    "create" {
        if (-not $BranchName) {
            Write-Error "请指定分支名称"
            exit 1
        }
        Write-Host "创建分支: $BranchName"
        ldesign-git branch create $BranchName
    }
    
    "delete" {
        if (-not $BranchName) {
            Write-Error "请指定分支名称"
            exit 1
        }
        $forceFlag = if ($Force) { "--force" } else { "" }
        Write-Host "删除分支: $BranchName"
        ldesign-git branch delete $BranchName $forceFlag
    }
    
    "cleanup" {
        Write-Host "🧹 清理已合并的分支..."
        $branches = ldesign-git branch list | ConvertFrom-Json
        $toDelete = $branches | Where-Object { 
            -not $_.current -and 
            $_.name -ne "main" -and 
            $_.name -ne "develop" 
        }
        
        if ($toDelete.Count -eq 0) {
            Write-Host "没有需要清理的分支"
        } else {
            Write-Host "将删除以下分支："
            $toDelete | ForEach-Object { Write-Host "  - $($_.name)" }
            
            $confirm = Read-Host "确认删除？(y/N)"
            if ($confirm -eq "y" -or $confirm -eq "Y") {
                $toDelete | ForEach-Object {
                    Write-Host "删除分支: $($_.name)"
                    ldesign-git branch delete $_.name
                }
                Write-Host "✅ 分支清理完成"
            } else {
                Write-Host "❌ 操作已取消"
            }
        }
    }
}
```

**使用示例：**
```powershell
# 列出分支
.\branch-manager.ps1 -Action list

# 创建分支
.\branch-manager.ps1 -Action create -BranchName "feature/new-feature"

# 删除分支
.\branch-manager.ps1 -Action delete -BranchName "feature/old-feature"

# 强制删除分支
.\branch-manager.ps1 -Action delete -BranchName "feature/old-feature" -Force

# 清理分支
.\branch-manager.ps1 -Action cleanup
```

## 故障排除

### 常见问题和解决方案

1. **分支已存在**
   ```bash
   # 错误信息
   ❌ 分支已存在
   
   # 解决方案：使用不同的分支名或删除现有分支
   ldesign-git branch delete existing-branch
   ldesign-git branch create new-branch-name
   ```

2. **无法删除当前分支**
   ```bash
   # 错误信息
   ❌ 无法删除当前分支
   
   # 解决方案：先切换到其他分支
   ldesign-git branch checkout main
   ldesign-git branch delete target-branch
   ```

3. **分支未合并**
   ```bash
   # 错误信息
   ❌ 分支包含未合并的更改
   
   # 解决方案：使用强制删除或先合并分支
   ldesign-git branch delete branch-name --force
   ```

## 下一步

- 了解 [远程仓库](/cli/remote) 操作
- 查看 [配置选项](/cli/options) 进行高级配置
- 学习 [基础操作](/cli/basic) 命令
