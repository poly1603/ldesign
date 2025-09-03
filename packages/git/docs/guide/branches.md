# 分支管理

本页面详细介绍 @ldesign/git 的分支管理功能。

## 分支基础操作

### 创建分支

```typescript
import { Git } from '@ldesign/git'

const git = Git.create('./my-project')

// 从当前分支创建新分支
await git.createBranch('feature/new-feature')

// 从指定分支创建新分支
await git.createBranch('hotfix/bug-fix', 'main')

// 从指定提交创建新分支
await git.createBranch('release/v1.0', 'abc123')
```

### 切换分支

```typescript
// 切换到指定分支
await git.checkoutBranch('feature/new-feature')

// 创建并切换到新分支
await git.createBranch('feature/another-feature')
await git.checkoutBranch('feature/another-feature')
```

### 列出分支

```typescript
// 列出本地分支
const localBranches = await git.listBranches()
console.log('本地分支:', localBranches.data)

// 列出所有分支（包含远程）
const allBranches = await git.listBranches(true)
console.log('所有分支:', allBranches.data)
```

### 删除分支

```typescript
// 删除已合并的分支
await git.branch.delete('feature/completed-feature')

// 强制删除分支
await git.branch.delete('feature/abandoned-feature', true)
```

## 高级分支操作

### 分支合并

```typescript
// 合并指定分支到当前分支
await git.branch.merge('feature/new-feature')

// 快进合并
await git.branch.merge('feature/new-feature', { fastForward: true })

// 创建合并提交
await git.branch.merge('feature/new-feature', { noFastForward: true })
```

### 分支重命名

```typescript
// 重命名当前分支
await git.branch.rename('new-branch-name')

// 重命名指定分支
await git.branch.rename('old-name', 'new-name')
```

### 分支比较

```typescript
// 比较两个分支
const comparison = await git.branch.compare('main', 'develop')
if (comparison.success) {
  console.log(`ahead: ${comparison.data.ahead}`)
  console.log(`behind: ${comparison.data.behind}`)
  console.log(`commits: ${comparison.data.commits?.length}`)
}
```

## 分支工作流

### Feature Branch 工作流

```typescript
async function featureBranchWorkflow() {
  const git = Git.create('./my-project')
  
  try {
    // 1. 确保在主分支上
    await git.checkoutBranch('main')
    
    // 2. 拉取最新代码
    await git.pull('origin', 'main')
    
    // 3. 创建功能分支
    const featureName = 'user-authentication'
    await git.createBranch(`feature/${featureName}`)
    await git.checkoutBranch(`feature/${featureName}`)
    
    console.log(`✅ 功能分支 feature/${featureName} 创建完成`)
    
    // 4. 开发功能...
    // (这里是您的开发工作)
    
    // 5. 提交更改
    await git.add('.')
    await git.commit(`Add ${featureName} feature`)
    
    // 6. 推送功能分支
    await git.push('origin', `feature/${featureName}`)
    
    // 7. 切换回主分支
    await git.checkoutBranch('main')
    
    // 8. 合并功能分支
    await git.branch.merge(`feature/${featureName}`)
    
    // 9. 推送主分支
    await git.push('origin', 'main')
    
    // 10. 删除功能分支
    await git.branch.delete(`feature/${featureName}`)
    
    console.log(`✅ 功能 ${featureName} 开发完成`)
    
  } catch (error) {
    console.error('❌ 功能开发失败:', error.message)
  }
}
```

### Git Flow 工作流

```typescript
class GitFlowManager {
  private git: Git
  
  constructor(repoPath: string) {
    this.git = Git.create(repoPath)
  }
  
  async startFeature(featureName: string): Promise<void> {
    // 从 develop 分支创建功能分支
    await this.git.checkoutBranch('develop')
    await this.git.pull('origin', 'develop')
    await this.git.createBranch(`feature/${featureName}`)
    await this.git.checkoutBranch(`feature/${featureName}`)
    
    console.log(`✅ 功能分支 feature/${featureName} 已创建`)
  }
  
  async finishFeature(featureName: string): Promise<void> {
    const branchName = `feature/${featureName}`
    
    // 切换到 develop 分支
    await this.git.checkoutBranch('develop')
    await this.git.pull('origin', 'develop')
    
    // 合并功能分支
    await this.git.branch.merge(branchName)
    
    // 推送 develop 分支
    await this.git.push('origin', 'develop')
    
    // 删除功能分支
    await this.git.branch.delete(branchName)
    
    console.log(`✅ 功能 ${featureName} 已完成`)
  }
  
  async startRelease(version: string): Promise<void> {
    // 从 develop 分支创建发布分支
    await this.git.checkoutBranch('develop')
    await this.git.pull('origin', 'develop')
    await this.git.createBranch(`release/${version}`)
    await this.git.checkoutBranch(`release/${version}`)
    
    console.log(`✅ 发布分支 release/${version} 已创建`)
  }
  
  async finishRelease(version: string): Promise<void> {
    const branchName = `release/${version}`
    
    // 合并到 main 分支
    await this.git.checkoutBranch('main')
    await this.git.pull('origin', 'main')
    await this.git.branch.merge(branchName)
    await this.git.push('origin', 'main')
    
    // 合并到 develop 分支
    await this.git.checkoutBranch('develop')
    await this.git.branch.merge(branchName)
    await this.git.push('origin', 'develop')
    
    // 删除发布分支
    await this.git.branch.delete(branchName)
    
    console.log(`✅ 版本 ${version} 发布完成`)
  }
}
```

## 分支策略

### 分支命名规范

```typescript
class BranchNamingValidator {
  private static readonly PATTERNS = {
    feature: /^feature\/[a-z0-9-]+$/,
    bugfix: /^bugfix\/[a-z0-9-]+$/,
    hotfix: /^hotfix\/[a-z0-9-]+$/,
    release: /^release\/v?\d+\.\d+(\.\d+)?$/,
    support: /^support\/[a-z0-9-]+$/
  }
  
  static validate(branchName: string): boolean {
    return Object.values(this.PATTERNS).some(pattern => 
      pattern.test(branchName)
    )
  }
  
  static getBranchType(branchName: string): string | null {
    for (const [type, pattern] of Object.entries(this.PATTERNS)) {
      if (pattern.test(branchName)) {
        return type
      }
    }
    return null
  }
  
  static suggest(type: string, name: string): string {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    return `${type}/${sanitized}`
  }
}

// 使用示例
const branchName = BranchNamingValidator.suggest('feature', 'User Authentication')
console.log(branchName) // feature/user-authentication

const isValid = BranchNamingValidator.validate('feature/user-auth')
console.log(isValid) // true
```

### 分支保护

```typescript
class BranchProtection {
  private git: Git
  private protectedBranches = ['main', 'master', 'develop']
  
  constructor(git: Git) {
    this.git = git
  }
  
  async checkProtection(branchName: string): Promise<boolean> {
    return this.protectedBranches.includes(branchName)
  }
  
  async safeDelete(branchName: string, force = false): Promise<void> {
    const isProtected = await this.checkProtection(branchName)
    if (isProtected && !force) {
      throw new Error(`分支 ${branchName} 受保护，无法删除`)
    }
    
    const status = await this.git.getStatus()
    if (status.data?.current === branchName) {
      throw new Error('无法删除当前分支')
    }
    
    await this.git.branch.delete(branchName, force)
  }
  
  async safeMerge(sourceBranch: string, targetBranch: string): Promise<void> {
    const isProtected = await this.checkProtection(targetBranch)
    if (isProtected) {
      // 对于受保护的分支，执行额外检查
      const isClean = await this.git.status.isClean()
      if (!isClean) {
        throw new Error('工作目录不干净，无法合并到受保护分支')
      }
    }
    
    await this.git.checkoutBranch(targetBranch)
    await this.git.branch.merge(sourceBranch)
  }
}
```

## 分支清理

### 自动清理已合并分支

```typescript
async function cleanupMergedBranches() {
  const git = Git.create('./my-project')
  
  try {
    // 获取所有本地分支
    const branches = await git.listBranches()
    const protectedBranches = ['main', 'master', 'develop']
    
    for (const branch of branches.data || []) {
      // 跳过当前分支和受保护分支
      if (branch.current || protectedBranches.includes(branch.name)) {
        continue
      }
      
      // 检查分支是否已合并
      const comparison = await git.branch.compare('main', branch.name)
      if (comparison.success && comparison.data.behind === 0) {
        console.log(`删除已合并分支: ${branch.name}`)
        await git.branch.delete(branch.name)
      }
    }
    
    console.log('✅ 分支清理完成')
    
  } catch (error) {
    console.error('❌ 分支清理失败:', error.message)
  }
}
```

### 批量分支操作

```typescript
class BatchBranchOperations {
  private git: Git
  
  constructor(git: Git) {
    this.git = git
  }
  
  async createMultipleBranches(branches: string[]): Promise<void> {
    for (const branchName of branches) {
      try {
        await this.git.createBranch(branchName)
        console.log(`✅ 创建分支: ${branchName}`)
      } catch (error) {
        console.error(`❌ 创建分支失败 ${branchName}:`, error.message)
      }
    }
  }
  
  async deleteMultipleBranches(branches: string[], force = false): Promise<void> {
    for (const branchName of branches) {
      try {
        await this.git.branch.delete(branchName, force)
        console.log(`✅ 删除分支: ${branchName}`)
      } catch (error) {
        console.error(`❌ 删除分支失败 ${branchName}:`, error.message)
      }
    }
  }
  
  async syncAllBranches(): Promise<void> {
    const branches = await this.git.listBranches()
    
    for (const branch of branches.data || []) {
      if (!branch.current) {
        try {
          await this.git.checkoutBranch(branch.name)
          await this.git.pull('origin', branch.name)
          console.log(`✅ 同步分支: ${branch.name}`)
        } catch (error) {
          console.error(`❌ 同步分支失败 ${branch.name}:`, error.message)
        }
      }
    }
  }
}
```

## 下一步

- 了解 [状态查询](/guide/status) 获取分支状态信息
- 学习 [远程仓库](/guide/remote) 管理远程分支
- 查看 [事件系统](/guide/events) 监听分支操作事件
