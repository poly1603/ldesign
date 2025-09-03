# 智能同步功能

@ldesign/git 的智能同步功能是一个强大的工具，旨在简化多人开发环境中的 Git 操作，自动处理常见的冲突场景。

## 功能特点

### 🚀 自动化流程
- **自动 stash**: 在拉取前自动暂存本地未提交的更改
- **智能拉取**: 从远程仓库获取最新代码
- **自动恢复**: 拉取完成后自动恢复本地更改
- **冲突检测**: 智能检测和处理合并冲突
- **一键提交**: 完成所有步骤后自动提交和推送

### 🛡️ 安全机制
- **分支保护**: 防止意外修改重要分支
- **操作确认**: 危险操作前的用户确认
- **回滚支持**: 提供完整的操作回滚功能
- **状态检查**: 执行前的全面安全检查

### 🎯 用户体验
- **进度显示**: 实时显示操作进度和状态
- **清晰提示**: 详细的错误信息和解决建议
- **简化命令**: 一个命令完成复杂的 Git 工作流

## 快速开始

### CLI 使用

```bash
# 基础智能同步提交
ldesign-git sync-commit "feat: 添加新功能"

# 提交指定文件
ldesign-git sync-commit "fix: 修复bug" src/main.js src/utils.js

# 自动解决冲突（保留本地更改）
ldesign-git sync-commit "update: 更新代码" --ours

# 自动解决冲突（保留远程更改）
ldesign-git sync-commit "merge: 合并更新" --theirs

# 回滚操作
ldesign-git rollback

# 手动解决冲突
ldesign-git resolve --ours    # 保留本地更改
ldesign-git resolve --theirs  # 保留远程更改
ldesign-git resolve           # 显示解决建议
```

### 编程接口

```typescript
import { Git } from '@ldesign/git'

const git = Git.create('./my-project')

// 基础智能同步
const result = await git.syncCommit('feat: 新功能开发完成')

if (result.success) {
  console.log('✅ 同步成功!')
  console.log('执行步骤:', result.steps)
} else {
  console.log('❌ 同步失败:', result.message)
  
  // 处理冲突
  if (result.conflicts) {
    console.log('冲突文件:', result.conflicts.conflictFiles)
  }
  
  // 回滚选项
  if (result.rollbackAvailable) {
    await git.rollbackSync(result.stashId)
  }
}
```

### 高级配置

```typescript
const result = await git.syncCommit('feat: 新功能', ['src/'], {
  // 远程仓库配置
  remote: 'origin',
  branch: 'main',
  
  // 冲突处理
  autoResolveConflicts: true,
  conflictStrategy: 'ours', // 'ours' | 'theirs' | 'manual'
  
  // 用户体验
  showProgress: true,
  confirmBeforeAction: false,
  
  // 安全设置
  protectedBranches: ['main', 'master', 'develop'],
  includeUntracked: true
})
```

## 工作流程详解

智能同步执行以下步骤：

### 1. 安全检查 🔍
- 验证当前目录是否为 Git 仓库
- 检查分支保护设置
- 验证远程仓库配置
- 确认网络连接

### 2. 状态检查 📊
- 检查工作目录是否有未提交的更改
- 分析文件状态（已修改、未跟踪等）
- 评估同步风险

### 3. 暂存本地更改 📦
```
git stash push -u -m "Smart sync stash - 2024-01-01T10:00:00Z"
```
- 自动暂存所有本地更改
- 包含未跟踪的文件（可配置）
- 生成带时间戳的 stash 消息

### 4. 拉取远程更改 📥
```
git pull origin main
```
- 从指定远程仓库拉取最新代码
- 自动处理快进合并
- 检测潜在冲突

### 5. 恢复本地更改 📤
```
git stash pop
```
- 恢复之前暂存的本地更改
- 智能检测恢复冲突
- 提供冲突解决选项

### 6. 冲突处理 🔀
如果检测到冲突，系统会：
- 分析冲突类型和文件
- 提供自动解决选项
- 显示手动解决指导
- 支持策略性解决（ours/theirs）

### 7. 提交更改 💾
```
git add .
git commit -m "用户提供的提交消息"
```
- 添加所有更改到暂存区
- 执行提交操作
- 生成提交哈希

### 8. 推送到远程 🚀
```
git push origin main
```
- 推送提交到远程仓库
- 处理推送冲突
- 确认推送成功

## 冲突处理策略

### 自动解决策略

#### `ours` 策略
```bash
ldesign-git sync-commit "保留本地更改" --ours
```
- 在冲突时保留本地版本
- 适用于确信本地更改正确的场景
- 自动解决所有冲突文件

#### `theirs` 策略
```bash
ldesign-git sync-commit "接受远程更改" --theirs
```
- 在冲突时保留远程版本
- 适用于需要与远程保持一致的场景
- 自动覆盖本地冲突更改

#### `manual` 策略（默认）
```bash
ldesign-git sync-commit "手动处理冲突"
```
- 暂停流程，等待用户手动解决
- 提供详细的冲突信息和解决建议
- 支持逐文件处理

### 冲突解决工具

```typescript
import { ConflictResolver } from '@ldesign/git'

const resolver = new ConflictResolver(git)

// 检查冲突
const hasConflicts = await resolver.hasConflicts()

// 获取冲突文件
const conflictFiles = await resolver.getConflictFiles()

// 自动解决
const result = await resolver.resolveConflicts({
  strategy: 'ours',
  autoResolve: true
})

// 获取解决建议
const suggestions = resolver.getResolutionSuggestions(conflictFiles.data)
```

## 错误处理和恢复

### 常见错误场景

#### 网络连接问题
```
❌ 智能同步失败: 网络连接超时
💡 建议: 检查网络连接后重试
🔄 可以回滚: ldesign-git rollback stash-id
```

#### 权限问题
```
❌ 智能同步失败: 权限不足
💡 建议: 检查 Git 凭据配置
🔄 可以回滚: ldesign-git rollback stash-id
```

#### 合并冲突
```
❌ 智能同步失败: 检测到合并冲突
🔀 冲突文件:
  - src/main.js (both_modified)
  - README.md (both_modified)

💡 解决建议:
1. 手动编辑冲突文件
2. 使用 ldesign-git resolve --ours 保留本地更改
3. 使用 ldesign-git resolve --theirs 保留远程更改
```

### 回滚机制

智能同步支持完整的回滚功能：

```bash
# 自动回滚（如果有 stash）
ldesign-git rollback

# 指定 stash ID 回滚
ldesign-git rollback stash@{0}
```

回滚操作会：
1. 重置到上一个提交状态
2. 恢复暂存的本地更改
3. 清理临时状态

## 最佳实践

### 1. 提交前检查
```bash
# 检查状态
ldesign-git status

# 查看差异
git diff

# 执行智能同步
ldesign-git sync-commit "描述性的提交消息"
```

### 2. 分支策略
```typescript
// 为不同分支配置不同策略
const mainBranchSync = await git.syncCommit('hotfix: 紧急修复', [], {
  conflictStrategy: 'theirs', // 主分支优先远程
  confirmBeforeAction: true   // 需要确认
})

const featureBranchSync = await git.syncCommit('feat: 新功能', [], {
  conflictStrategy: 'ours',   // 功能分支优先本地
  autoResolveConflicts: true  // 自动解决
})
```

### 3. 团队协作
```typescript
// 团队协作配置
const teamConfig = {
  protectedBranches: ['main', 'master', 'release/*'],
  confirmBeforeAction: true,
  showProgress: true,
  conflictStrategy: 'manual' // 团队环境建议手动处理冲突
}

await git.syncCommit('团队协作提交', [], teamConfig)
```

### 4. CI/CD 集成
```typescript
// CI 环境配置
const ciConfig = {
  showProgress: false,        // 减少日志输出
  confirmBeforeAction: false, // 自动执行
  autoResolveConflicts: true, // 自动解决冲突
  conflictStrategy: 'theirs'  // CI 环境优先远程
}

await git.syncCommit('CI: 自动部署', [], ciConfig)
```

## 故障排除

### 常见问题

**Q: 智能同步卡在某个步骤？**
A: 检查网络连接和 Git 配置，使用 `Ctrl+C` 中断后执行回滚。

**Q: 自动冲突解决不符合预期？**
A: 使用 `manual` 策略手动处理，或调整 `ours`/`theirs` 策略。

**Q: 回滚后丢失了本地更改？**
A: 检查 stash 列表：`git stash list`，手动恢复：`git stash pop`。

**Q: 在保护分支上操作被阻止？**
A: 检查 `protectedBranches` 配置，或使用 `confirmBeforeAction: false`。

### 调试模式

```typescript
// 启用详细日志
const git = Git.create('./project', { debug: true })

// 查看详细执行步骤
const result = await git.syncCommit('debug test', [], {
  showProgress: true
})

// 检查执行步骤
console.log('执行步骤:', result.steps)
```

## 下一步

- 查看 [API 参考文档](./api/smart-sync.md)
- 了解 [配置选项](./guide/configuration.md)
- 学习 [最佳实践](./examples/best-practices.md)
- 参与 [社区讨论](https://github.com/ldesign/git/discussions)
