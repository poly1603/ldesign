# Git 版本控制

Git 模块提供了完整的 Git 仓库管理功能，支持分支操作、远程同步和版本控制，帮助自动化 Git 工作流程。

## 导入方式

```typescript
// 完整导入
import { GitManager, GitUtils } from '@ldesign/kit'

// 按需导入
import { GitManager } from '@ldesign/kit/git'

// 单独导入
import { GitManager } from '@ldesign/kit'
```

## GitManager

Git 管理器类，提供完整的 Git 仓库操作功能。

### 创建实例

#### `new GitManager(repoPath?: string, options?: GitOptions)`

创建 Git 管理器实例。

```typescript
// 使用当前目录
const git = new GitManager()

// 指定仓库路径
const git = new GitManager('./my-project')

// 使用配置选项
const git = new GitManager('./my-project', {
  author: {
    name: 'Your Name',
    email: 'your.email@example.com',
  },
  remote: {
    name: 'origin',
    url: 'https://github.com/user/repo.git',
  },
  gpgSign: false,
  verbose: true,
})
```

### 仓库初始化

#### `init(options?: InitOptions): Promise<void>`

初始化 Git 仓库。

```typescript
// 基本初始化
await git.init()

// 使用选项
await git.init({
  bare: false, // 是否为裸仓库
  template: './template', // 模板目录
  initialBranch: 'main', // 初始分支名
})
```

#### `clone(url: string, path?: string, options?: CloneOptions): Promise<void>`

克隆远程仓库。

```typescript
// 基本克隆
await git.clone('https://github.com/user/repo.git')

// 指定路径
await git.clone('https://github.com/user/repo.git', './local-repo')

// 使用选项
await git.clone('https://github.com/user/repo.git', './local-repo', {
  depth: 1, // 浅克隆
  branch: 'develop', // 指定分支
  recursive: true, // 递归克隆子模块
  mirror: false, // 是否镜像
})
```

### 基本操作

#### `add(files: string | string[]): Promise<void>`

添加文件到暂存区。

```typescript
// 添加单个文件
await git.add('README.md')

// 添加多个文件
await git.add(['src/index.ts', 'package.json'])

// 添加所有文件
await git.add('.')

// 添加所有已跟踪文件
await git.add('-u')
```

#### `commit(message: string, options?: CommitOptions): Promise<string>`

提交更改。

```typescript
// 基本提交
const commitHash = await git.commit('feat: add new feature')

// 使用选项
const commitHash = await git.commit('fix: resolve bug', {
  author: {
    name: 'John Doe',
    email: 'john@example.com',
  },
  amend: false, // 是否修改上次提交
  allowEmpty: false, // 是否允许空提交
  gpgSign: true, // 是否 GPG 签名
})
```

#### `push(remote?: string, branch?: string, options?: PushOptions): Promise<void>`

推送到远程仓库。

```typescript
// 推送当前分支
await git.push()

// 推送到指定远程和分支
await git.push('origin', 'main')

// 使用选项
await git.push('origin', 'main', {
  force: false, // 是否强制推送
  setUpstream: true, // 是否设置上游分支
  tags: false, // 是否推送标签
  followTags: true, // 是否跟随标签
})
```

#### `pull(remote?: string, branch?: string, options?: PullOptions): Promise<void>`

从远程仓库拉取。

```typescript
// 拉取当前分支
await git.pull()

// 从指定远程和分支拉取
await git.pull('origin', 'main')

// 使用选项
await git.pull('origin', 'main', {
  rebase: false, // 是否使用 rebase
  ff: 'only', // 快进模式
  strategy: 'recursive', // 合并策略
})
```

#### `fetch(remote?: string, options?: FetchOptions): Promise<void>`

获取远程更新。

```typescript
// 获取所有远程更新
await git.fetch()

// 获取指定远程
await git.fetch('origin')

// 使用选项
await git.fetch('origin', {
  all: false, // 是否获取所有远程
  tags: true, // 是否获取标签
  prune: true, // 是否清理已删除的远程分支
  depth: 10, // 获取深度
})
```

### 分支操作

#### `createBranch(name: string, startPoint?: string): Promise<void>`

创建分支。

```typescript
// 从当前分支创建
await git.createBranch('feature/new-feature')

// 从指定提交创建
await git.createBranch('hotfix/bug-fix', 'v1.0.0')

// 从远程分支创建
await git.createBranch('feature/remote-feature', 'origin/feature/remote-feature')
```

#### `checkout(branch: string, options?: CheckoutOptions): Promise<void>`

切换分支。

```typescript
// 切换到已存在分支
await git.checkout('main')

// 创建并切换到新分支
await git.checkout('feature/new-feature', { create: true })

// 使用选项
await git.checkout('develop', {
  create: false, // 是否创建新分支
  force: false, // 是否强制切换
  track: true, // 是否跟踪远程分支
})
```

#### `deleteBranch(name: string, force?: boolean): Promise<void>`

删除分支。

```typescript
// 删除已合并分支
await git.deleteBranch('feature/completed')

// 强制删除分支
await git.deleteBranch('feature/abandoned', true)
```

#### `listBranches(options?: ListBranchOptions): Promise<BranchInfo[]>`

列出分支。

```typescript
// 列出本地分支
const localBranches = await git.listBranches()

// 列出远程分支
const remoteBranches = await git.listBranches({ remote: true })

// 列出所有分支
const allBranches = await git.listBranches({ all: true })

// 包含详细信息
const detailedBranches = await git.listBranches({
  verbose: true,
  merged: false, // 只显示未合并分支
})
```

#### `merge(branch: string, options?: MergeOptions): Promise<void>`

合并分支。

```typescript
// 基本合并
await git.merge('feature/new-feature')

// 使用选项
await git.merge('feature/new-feature', {
  ff: 'only', // 快进模式
  squash: false, // 是否压缩提交
  strategy: 'recursive', // 合并策略
  message: 'Merge feature branch',
})
```

### 标签操作

#### `createTag(name: string, message?: string, commit?: string): Promise<void>`

创建标签。

```typescript
// 创建轻量标签
await git.createTag('v1.0.0')

// 创建带注释的标签
await git.createTag('v1.0.0', 'Release version 1.0.0')

// 为指定提交创建标签
await git.createTag('v1.0.0', 'Release version 1.0.0', 'abc123')
```

#### `deleteTag(name: string): Promise<void>`

删除标签。

```typescript
await git.deleteTag('v1.0.0-beta')
```

#### `listTags(pattern?: string): Promise<string[]>`

列出标签。

```typescript
// 列出所有标签
const allTags = await git.listTags()

// 按模式过滤
const releaseTags = await git.listTags('v*')
```

#### `pushTags(remote?: string): Promise<void>`

推送标签。

```typescript
// 推送所有标签
await git.pushTags()

// 推送到指定远程
await git.pushTags('origin')
```

### 状态和日志

#### `status(): Promise<GitStatus>`

获取仓库状态。

```typescript
const status = await git.status()

console.log('当前分支:', status.current)
console.log('是否干净:', status.clean)
console.log('已暂存文件:', status.staged)
console.log('已修改文件:', status.modified)
console.log('未跟踪文件:', status.untracked)
console.log('冲突文件:', status.conflicted)
console.log('领先提交数:', status.ahead)
console.log('落后提交数:', status.behind)
```

#### `log(options?: LogOptions): Promise<CommitInfo[]>`

获取提交日志。

```typescript
// 获取最近10条提交
const commits = await git.log({ maxCount: 10 })

// 获取指定范围的提交
const rangeCommits = await git.log({
  from: 'v1.0.0',
  to: 'HEAD',
})

// 获取详细信息
const detailedCommits = await git.log({
  maxCount: 5,
  stat: true, // 包含统计信息
  patch: false, // 包含补丁
  author: 'John Doe', // 按作者过滤
  since: '2024-01-01', // 时间范围
  until: '2024-12-31',
})
```

#### `diff(options?: DiffOptions): Promise<string>`

获取差异。

```typescript
// 工作区与暂存区差异
const workingDiff = await git.diff()

// 暂存区与最新提交差异
const stagedDiff = await git.diff({ staged: true })

// 两个提交之间差异
const commitDiff = await git.diff({
  from: 'v1.0.0',
  to: 'v1.1.0',
})

// 指定文件差异
const fileDiff = await git.diff({
  files: ['src/index.ts', 'package.json'],
})
```

### 远程操作

#### `addRemote(name: string, url: string): Promise<void>`

添加远程仓库。

```typescript
await git.addRemote('origin', 'https://github.com/user/repo.git')
await git.addRemote('upstream', 'https://github.com/original/repo.git')
```

#### `removeRemote(name: string): Promise<void>`

删除远程仓库。

```typescript
await git.removeRemote('old-origin')
```

#### `listRemotes(): Promise<RemoteInfo[]>`

列出远程仓库。

```typescript
const remotes = await git.listRemotes()
remotes.forEach(remote => {
  console.log(`${remote.name}: ${remote.url}`)
})
```

### 配置管理

#### `setConfig(key: string, value: string, global?: boolean): Promise<void>`

设置配置。

```typescript
// 设置本地配置
await git.setConfig('user.name', 'John Doe')
await git.setConfig('user.email', 'john@example.com')

// 设置全局配置
await git.setConfig('user.name', 'John Doe', true)
```

#### `getConfig(key: string, global?: boolean): Promise<string | null>`

获取配置。

```typescript
const userName = await git.getConfig('user.name')
const globalEmail = await git.getConfig('user.email', true)
```

## GitUtils

Git 工具函数类，提供常用的 Git 操作工具。

### 工具方法

#### `isGitRepository(path?: string): Promise<boolean>`

检查是否为 Git 仓库。

```typescript
const isRepo = await GitUtils.isGitRepository('./my-project')
if (isRepo) {
  console.log('这是一个 Git 仓库')
}
```

#### `getRepositoryRoot(path?: string): Promise<string | null>`

获取仓库根目录。

```typescript
const rootPath = await GitUtils.getRepositoryRoot('./src/components')
console.log('仓库根目录:', rootPath)
```

#### `parseCommitMessage(message: string): CommitMessageInfo`

解析提交消息。

```typescript
const parsed = GitUtils.parseCommitMessage(
  'feat(auth): add login functionality\n\nImplement OAuth2 login with Google'
)

console.log('类型:', parsed.type) // 'feat'
console.log('范围:', parsed.scope) // 'auth'
console.log('描述:', parsed.description) // 'add login functionality'
console.log('正文:', parsed.body) // 'Implement OAuth2 login with Google'
```

#### `generateChangelog(commits: CommitInfo[]): string`

生成变更日志。

```typescript
const commits = await git.log({ maxCount: 50 })
const changelog = GitUtils.generateChangelog(commits)
console.log(changelog)
```

## 实际应用示例

### 自动化发布流程

```typescript
class ReleaseManager {
  private git = new GitManager()

  async performRelease(versionType: 'patch' | 'minor' | 'major') {
    try {
      // 1. 检查工作区状态
      const status = await this.git.status()
      if (!status.clean) {
        throw new Error('工作区不干净，请先提交或暂存更改')
      }

      // 2. 切换到主分支并拉取最新代码
      await this.git.checkout('main')
      await this.git.pull('origin', 'main')

      // 3. 运行测试
      console.log('运行测试...')
      // await runTests()

      // 4. 更新版本号
      const newVersion = await this.updateVersion(versionType)
      console.log(`版本更新为: ${newVersion}`)

      // 5. 提交版本更新
      await this.git.add('package.json')
      await this.git.commit(`chore: release v${newVersion}`)

      // 6. 创建标签
      await this.git.createTag(`v${newVersion}`, `Release version ${newVersion}`)

      // 7. 推送到远程
      await this.git.push('origin', 'main')
      await this.git.pushTags('origin')

      console.log(`✅ 版本 v${newVersion} 发布成功`)
    } catch (error) {
      console.error('发布失败:', error.message)
      throw error
    }
  }

  private async updateVersion(type: string): Promise<string> {
    // 实现版本号更新逻辑
    return '1.0.0'
  }
}
```

### Git 工作流自动化

```typescript
class GitWorkflow {
  private git = new GitManager()

  async createFeatureBranch(featureName: string) {
    // 确保在主分支
    await this.git.checkout('main')
    await this.git.pull('origin', 'main')

    // 创建功能分支
    const branchName = `feature/${featureName}`
    await this.git.createBranch(branchName)
    await this.git.checkout(branchName)

    console.log(`功能分支 ${branchName} 已创建`)
  }

  async finishFeature(featureName: string) {
    const branchName = `feature/${featureName}`

    // 切换到功能分支
    await this.git.checkout(branchName)

    // 推送功能分支
    await this.git.push('origin', branchName, { setUpstream: true })

    // 切换到主分支并合并
    await this.git.checkout('main')
    await this.git.pull('origin', 'main')
    await this.git.merge(branchName)

    // 推送合并结果
    await this.git.push('origin', 'main')

    // 删除功能分支
    await this.git.deleteBranch(branchName)

    console.log(`功能 ${featureName} 已完成并合并`)
  }

  async createHotfix(version: string) {
    // 从最新标签创建热修复分支
    const latestTag = await this.getLatestTag()
    const branchName = `hotfix/${version}`

    await this.git.createBranch(branchName, latestTag)
    await this.git.checkout(branchName)

    console.log(`热修复分支 ${branchName} 已创建`)
  }

  private async getLatestTag(): Promise<string> {
    const tags = await this.git.listTags('v*')
    return tags.sort().pop() || 'HEAD'
  }
}
```

### 代码同步工具

```typescript
class CodeSyncTool {
  private git = new GitManager()

  async syncWithUpstream() {
    try {
      // 添加上游仓库（如果不存在）
      const remotes = await this.git.listRemotes()
      const hasUpstream = remotes.some(remote => remote.name === 'upstream')

      if (!hasUpstream) {
        const upstreamUrl = await this.promptForUpstreamUrl()
        await this.git.addRemote('upstream', upstreamUrl)
      }

      // 获取上游更新
      await this.git.fetch('upstream')

      // 切换到主分支
      await this.git.checkout('main')

      // 合并上游更改
      await this.git.merge('upstream/main')

      // 推送到自己的远程仓库
      await this.git.push('origin', 'main')

      console.log('✅ 代码同步完成')
    } catch (error) {
      console.error('同步失败:', error.message)
    }
  }

  async backupBranches() {
    const branches = await this.git.listBranches()

    for (const branch of branches) {
      if (branch.name !== 'main') {
        try {
          await this.git.push('origin', branch.name)
          console.log(`分支 ${branch.name} 已备份`)
        } catch (error) {
          console.warn(`分支 ${branch.name} 备份失败:`, error.message)
        }
      }
    }
  }

  private async promptForUpstreamUrl(): Promise<string> {
    // 实现用户输入逻辑
    return 'https://github.com/original/repo.git'
  }
}
```

## 类型定义

```typescript
interface GitOptions {
  author?: {
    name: string
    email: string
  }
  remote?: {
    name: string
    url: string
  }
  gpgSign?: boolean
  verbose?: boolean
}

interface GitStatus {
  current: string
  clean: boolean
  staged: string[]
  modified: string[]
  untracked: string[]
  conflicted: string[]
  ahead: number
  behind: number
}

interface CommitInfo {
  hash: string
  date: Date
  message: string
  author: {
    name: string
    email: string
  }
  refs: string[]
}

interface BranchInfo {
  name: string
  current: boolean
  remote?: string
  ahead?: number
  behind?: number
}

interface RemoteInfo {
  name: string
  url: string
}
```

## 错误处理

```typescript
try {
  await git.push('origin', 'main')
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('Git 未安装或不在 PATH 中')
  } else if (error.message.includes('rejected')) {
    console.log('推送被拒绝，可能需要先拉取')
  } else {
    console.error('Git 操作失败:', error.message)
  }
}
```

## 最佳实践

1. **状态检查**: 操作前检查仓库状态
2. **错误处理**: 妥善处理 Git 操作可能的错误
3. **原子操作**: 将相关操作组合成原子操作
4. **备份重要分支**: 重要操作前备份分支
5. **使用钩子**: 利用 Git 钩子自动化工作流

## 示例应用

查看 [使用示例](/examples/git-automation) 了解更多 Git 自动化的实际应用场景。
