# 智能同步功能使用示例

本文档展示了 @ldesign/git 智能同步功能的实际使用场景和示例。

## 场景一：日常开发工作流

### 开发者 A 的工作流程

```bash
# 1. 开始新功能开发
git checkout -b feature/user-auth
echo "新的用户认证功能" > auth.js

# 2. 使用智能同步提交
ldesign-git sync-commit "feat: 添加用户认证功能"
```

**执行过程：**
```
🚀 开始智能同步提交...
✅ 安全检查 - 检查仓库状态和分支保护
✅ 检查工作目录 - 发现未提交的更改
📦 暂存本地更改 - 使用 git stash 保存本地更改
📥 拉取远程更改 - 从远程仓库拉取最新代码
📤 恢复本地更改 - 恢复之前暂存的本地更改
📋 添加文件 - 添加文件到暂存区
💾 执行提交 - 提交: a1b2c3d4
🚀 推送到远程 - 推送完成

✅ 智能同步提交成功!
📝 智能同步提交完成

执行步骤:
  ✅ 安全检查通过
  ✅ 发现未提交的更改
  📦 本地更改已暂存
  📥 远程更改已拉取
  📤 本地更改已恢复
  📋 文件已添加到暂存区
  💾 提交已完成
  🚀 更改已推送到远程
```

## 场景二：多人协作冲突处理

### 开发者 B 同时修改了相同文件

```bash
# 开发者 B 也修改了 auth.js
echo "另一种认证实现" > auth.js

# 尝试智能同步
ldesign-git sync-commit "feat: 改进用户认证"
```

**遇到冲突时的处理：**
```
🚀 开始智能同步提交...
✅ 安全检查 - 检查仓库状态和分支保护
✅ 检查工作目录 - 发现未提交的更改
📦 暂存本地更改 - 使用 git stash 保存本地更改
📥 拉取远程更改 - 从远程仓库拉取最新代码
⚠️ 恢复本地更改 - 恢复时发生冲突

❌ 智能同步提交失败!
📝 恢复本地更改时发生冲突

🔀 检测到合并冲突:
🔍 检测到以下冲突文件:
  - auth.js (both_modified)

💡 解决建议:
1. 手动编辑冲突文件，解决冲突标记 (<<<<<<<, =======, >>>>>>>)
2. 或使用以下策略自动解决:
   - 保留本地更改: ldesign-git resolve --ours
   - 保留远程更改: ldesign-git resolve --theirs
3. 解决后使用: ldesign-git add <文件> 标记为已解决
4. 最后执行: ldesign-git commit 完成合并

💡 可以使用以下命令回滚:
   ldesign-git rollback stash@{0}
```

### 解决冲突的三种方式

#### 方式1：手动解决
```bash
# 编辑冲突文件
vim auth.js

# 解决冲突后继续
git add auth.js
git commit -m "feat: 改进用户认证"
git push origin feature/user-auth
```

#### 方式2：保留本地更改
```bash
ldesign-git resolve --ours
```

```
🔧 使用策略 "ours" 自动解决冲突...
✅ 冲突已自动解决!
💡 请运行 git commit 完成合并
```

#### 方式3：保留远程更改
```bash
ldesign-git resolve --theirs
```

```
🔧 使用策略 "theirs" 自动解决冲突...
✅ 冲突已自动解决!
💡 请运行 git commit 完成合并
```

## 场景三：紧急修复工作流

### 生产环境紧急修复

```bash
# 切换到主分支
git checkout main

# 创建紧急修复分支
git checkout -b hotfix/critical-bug

# 修复代码
echo "修复关键bug" > fix.js

# 使用自动冲突解决策略
ldesign-git sync-commit "hotfix: 修复关键安全漏洞" --theirs --no-confirm
```

**配置说明：**
- `--theirs`: 自动保留远程更改（确保与生产环境一致）
- `--no-confirm`: 跳过确认步骤（紧急情况下快速执行）

## 场景四：团队协作最佳实践

### 功能分支开发

```typescript
// 使用编程接口进行精细控制
import { Git } from '@ldesign/git'

const git = Git.create('./my-project')

// 功能分支配置
const featureBranchConfig = {
  remote: 'origin',
  branch: 'feature/new-feature',
  autoResolveConflicts: true,
  conflictStrategy: 'ours' as const, // 功能分支优先本地更改
  showProgress: true,
  protectedBranches: ['main', 'master', 'develop'],
  includeUntracked: true
}

try {
  const result = await git.syncCommit(
    'feat: 实现新的用户界面组件',
    ['src/components/', 'src/styles/'],
    featureBranchConfig
  )

  if (result.success) {
    console.log('✅ 功能开发完成并同步')
    console.log('执行步骤:', result.steps)
  } else {
    console.log('❌ 同步失败:', result.message)
    
    if (result.rollbackAvailable) {
      console.log('🔄 执行回滚...')
      await git.rollbackSync(result.stashId)
    }
  }
} catch (error) {
  console.error('操作失败:', error.message)
}
```

### 主分支合并

```typescript
// 主分支合并配置
const mainBranchConfig = {
  remote: 'origin',
  branch: 'main',
  autoResolveConflicts: false, // 主分支手动处理冲突
  conflictStrategy: 'manual' as const,
  showProgress: true,
  confirmBeforeAction: true, // 需要确认
  protectedBranches: ['main', 'master']
}

const result = await git.syncCommit(
  'merge: 合并用户界面改进',
  [],
  mainBranchConfig
)
```

## 场景五：CI/CD 集成

### GitHub Actions 工作流

```yaml
name: 智能同步部署

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: 设置 Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: 安装依赖
      run: npm install -g @ldesign/git
      
    - name: 智能同步部署
      run: |
        ldesign-git sync-commit "ci: 自动部署 ${{ github.sha }}" \
          --theirs \
          --no-confirm \
          --auto-resolve
      env:
        GIT_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 自动化脚本

```bash
#!/bin/bash
# deploy.sh - 自动化部署脚本

set -e

echo "🚀 开始自动化部署..."

# 检查环境
if ! command -v ldesign-git &> /dev/null; then
    echo "❌ ldesign-git 未安装"
    exit 1
fi

# 获取版本信息
VERSION=$(node -p "require('./package.json').version")
COMMIT_MSG="deploy: 发布版本 v${VERSION}"

echo "📦 准备发布版本: v${VERSION}"

# 执行智能同步
if ldesign-git sync-commit "${COMMIT_MSG}" --theirs --auto-resolve; then
    echo "✅ 部署成功!"
    echo "🎉 版本 v${VERSION} 已发布"
else
    echo "❌ 部署失败"
    echo "🔄 执行回滚..."
    ldesign-git rollback
    exit 1
fi
```

## 场景六：错误恢复和故障排除

### 网络中断恢复

```bash
# 网络中断导致同步失败
ldesign-git sync-commit "feat: 新功能"
```

```
🚀 开始智能同步提交...
✅ 安全检查 - 检查仓库状态和分支保护
✅ 检查工作目录 - 发现未提交的更改
📦 暂存本地更改 - 使用 git stash 保存本地更改
❌ 拉取远程更改 - 网络连接超时

❌ 智能同步失败!
📝 智能同步失败
🔍 错误详情: 网络连接超时

💡 可以使用以下命令回滚:
   ldesign-git rollback stash@{0}
```

**恢复步骤：**
```bash
# 1. 检查网络连接
ping github.com

# 2. 回滚到安全状态
ldesign-git rollback

# 3. 重新尝试
ldesign-git sync-commit "feat: 新功能"
```

### 权限问题处理

```bash
# 权限不足
ldesign-git sync-commit "update: 更新文档"
```

```
❌ 智能同步失败!
📝 权限不足，无法推送到远程仓库
🔍 错误详情: Permission denied (publickey)

💡 解决建议:
1. 检查 SSH 密钥配置: ssh -T git@github.com
2. 更新 Git 凭据: git config --global credential.helper store
3. 验证仓库权限: 确保有推送权限
```

**解决步骤：**
```bash
# 1. 检查 SSH 连接
ssh -T git@github.com

# 2. 重新配置凭据
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 3. 回滚并重试
ldesign-git rollback
ldesign-git sync-commit "update: 更新文档"
```

## 高级用法技巧

### 1. 批量文件处理

```bash
# 只提交特定类型的文件
ldesign-git sync-commit "docs: 更新文档" docs/ README.md CHANGELOG.md

# 排除某些文件（使用 .gitignore）
echo "temp/" >> .gitignore
ldesign-git sync-commit "chore: 更新忽略规则"
```

### 2. 分支策略配置

```typescript
// 不同分支使用不同策略
const branchConfigs = {
  'main': {
    conflictStrategy: 'manual',
    confirmBeforeAction: true,
    autoResolveConflicts: false
  },
  'develop': {
    conflictStrategy: 'theirs',
    confirmBeforeAction: false,
    autoResolveConflicts: true
  },
  'feature/*': {
    conflictStrategy: 'ours',
    confirmBeforeAction: false,
    autoResolveConflicts: true
  }
}

// 根据当前分支选择配置
const currentBranch = await git.status.getCurrentBranch()
const config = branchConfigs[currentBranch] || branchConfigs['feature/*']

await git.syncCommit('自适应配置提交', [], config)
```

### 3. 自定义钩子

```typescript
// 添加自定义验证
class CustomGitWorkflow {
  private git: Git

  constructor(git: Git) {
    this.git = git
  }

  async smartCommit(message: string, files?: string[]) {
    // 预提交检查
    await this.preCommitChecks()
    
    // 执行智能同步
    const result = await this.git.syncCommit(message, files, {
      showProgress: true,
      autoResolveConflicts: true,
      conflictStrategy: 'manual'
    })
    
    // 后提交处理
    if (result.success) {
      await this.postCommitActions(result)
    }
    
    return result
  }

  private async preCommitChecks() {
    // 代码质量检查
    console.log('🔍 执行代码质量检查...')
    
    // 测试运行
    console.log('🧪 运行测试套件...')
    
    // 安全扫描
    console.log('🛡️ 执行安全扫描...')
  }

  private async postCommitActions(result: any) {
    // 发送通知
    console.log('📧 发送提交通知...')
    
    // 更新文档
    console.log('📚 更新项目文档...')
    
    // 触发部署
    console.log('🚀 触发自动部署...')
  }
}
```

## 总结

智能同步功能通过自动化常见的 Git 操作流程，显著提高了开发效率和代码质量：

- **简化操作**：一个命令完成复杂的 Git 工作流
- **减少错误**：自动处理常见的合并冲突场景
- **提高效率**：减少手动操作和重复性工作
- **增强安全**：提供完整的回滚和恢复机制
- **改善体验**：清晰的进度显示和错误提示

无论是个人开发、团队协作还是 CI/CD 集成，智能同步功能都能提供稳定可靠的 Git 操作体验。
