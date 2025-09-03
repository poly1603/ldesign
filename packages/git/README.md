# @ldesign/git

一个功能完整的 Git 操作封装库，提供面向对象的 API 接口，支持基础 Git 操作、分支管理、状态查询、远程仓库操作等功能。

## 特性

- 🚀 **完整的 Git 功能** - 支持所有常用的 Git 操作
- 🎯 **面向对象设计** - 清晰的类结构和 API 接口
- 📝 **TypeScript 支持** - 完整的类型定义，提供优秀的开发体验
- 🛡️ **错误处理** - 统一的错误处理机制和详细的错误信息
- 🎪 **事件系统** - 支持事件监听，便于集成和调试
- 📦 **ESM 支持** - 使用现代 ES 模块语法
- ⚡ **CLI 工具** - 提供命令行接口，支持直接使用
- 🔧 **tsup 构建** - 使用 tsup 进行快速构建和打包
- ✅ **完整测试** - 96/97 测试通过，确保代码质量

## 安装

```bash
pnpm add @ldesign/git
```

## CLI 工具

安装后可以使用 `ldesign-git` 命令行工具：

```bash
# 查看帮助
ldesign-git --help

# 初始化仓库
ldesign-git init

# 添加文件
ldesign-git add .

# 提交更改
ldesign-git commit "Initial commit"

# 创建分支
ldesign-git branch create feature/new-feature

# 切换分支
ldesign-git branch checkout feature/new-feature

# 推送到远程
ldesign-git push origin main
```

## 快速开始

### 基础用法

```typescript
import { Git } from '@ldesign/git'

// 创建 Git 实例
const git = new Git('/path/to/repository')

// 或者使用静态工厂方法
const git = Git.create('/path/to/repository')

// 初始化仓库
await git.init()

// 添加文件
await git.add('.')

// 提交更改
await git.commit('Initial commit')

// 推送到远程仓库
await git.push()
```

### 高级用法

```typescript
import { Git, GitRepository, GitBranch } from '@ldesign/git'

// 使用具体的类
const repository = new GitRepository('/path/to/repo')
const branch = new GitBranch(git, '/path/to/repo')

// 配置选项
const git = new Git('/path/to/repo', {
  timeout: 30000,
  debug: true,
  maxConcurrentProcesses: 5
})
```

## API 文档

### Git 主类

`Git` 类是主要的入口点，整合了所有 Git 操作功能。

#### 构造函数

```typescript
constructor(baseDir?: string, options?: GitRepositoryOptions)
```

- `baseDir`: 仓库路径，默认为当前工作目录
- `options`: 配置选项

#### 静态方法

```typescript
// 创建 Git 实例
Git.create(baseDir?: string, options?: GitRepositoryOptions): Git
```

#### 实例属性

- `repository`: GitRepository 实例，用于基础 Git 操作
- `branch`: GitBranch 实例，用于分支管理
- `status`: GitStatus 实例，用于状态查询
- `remote`: GitRemote 实例，用于远程仓库操作

#### 快速操作方法

```typescript
// 基础操作
await git.init(bare?: boolean)
await git.clone(repoUrl: string, targetDir?: string)
await git.add(files: string | string[])
await git.commit(message: string, files?: string[])
await git.push(remote?: string, branch?: string)
await git.pull(remote?: string, branch?: string)

// 状态查询
await git.getStatus()
await git.getLog(maxCount?: number)

// 分支操作
await git.createBranch(branchName: string)
await git.checkoutBranch(branchName: string)
await git.listBranches(includeRemote?: boolean)

// 远程仓库操作
await git.addRemote(name: string, url: string)
await git.listRemotes()

// 工具方法
await git.isRepo(): Promise<boolean>
git.getBaseDir(): string
git.getOptions(): GitRepositoryOptions
```

### GitRepository 类

处理基础的 Git 仓库操作。

```typescript
import { GitRepository } from '@ldesign/git'

const repo = new GitRepository('/path/to/repo')

// 初始化仓库
await repo.init(bare?: boolean)

// 克隆仓库
await repo.clone(repoUrl: string, options?: GitCloneOptions)

// 添加文件到暂存区
await repo.add(files: string | string[])

// 提交更改
await repo.commit(message: string, files?: string[])

// 推送到远程仓库
await repo.push(options?: GitPushOptions)

// 从远程仓库拉取
await repo.pull(options?: GitPullOptions)

// 获取仓库状态
await repo.status()

// 获取提交日志
await repo.log(options?: GitLogOptions)

// 检查是否为 Git 仓库
await repo.isRepo()
```

### GitBranch 类

处理分支相关操作。

```typescript
import { GitBranch } from '@ldesign/git'

// 创建分支
await branch.create(branchName: string, startPoint?: string)

// 切换分支
await branch.checkout(branchName: string)

// 删除分支
await branch.delete(branchName: string, force?: boolean)

// 列出分支
await branch.list(includeRemote?: boolean)

// 获取当前分支
await branch.current()

// 重命名分支
await branch.rename(oldName: string, newName: string)

// 合并分支
await branch.merge(branchName: string, options?: MergeOptions)

// 检查分支是否存在
await branch.exists(branchName: string, includeRemote?: boolean)

// 获取分支最后提交
await branch.getLastCommit(branchName: string)

// 比较分支
await branch.compare(baseBranch: string, compareBranch: string)
```

### GitStatus 类

处理状态查询和日志操作。

```typescript
import { GitStatus } from '@ldesign/git'

// 获取仓库状态
await status.getStatus()

// 获取提交日志
await status.getLog(options?: GitLogOptions)

// 获取文件差异
await status.getDiff(file?: string, cached?: boolean)

// 比较两个提交之间的差异
await status.getDiffBetweenCommits(fromCommit: string, toCommit: string, file?: string)

// 显示提交详情
await status.show(commitHash: string)

// 获取文件的提交历史
await status.getFileHistory(filePath: string, maxCount?: number)

// 获取统计信息
await status.getStats(fromCommit?: string, toCommit?: string)

// 检查工作目录是否干净
await status.isClean()

// 获取当前 HEAD 指向的提交
await status.getHead()
```

### GitRemote 类

处理远程仓库操作。

```typescript
import { GitRemote } from '@ldesign/git'

// 添加远程仓库
await remote.add(name: string, url: string)

// 删除远程仓库
await remote.remove(name: string)

// 列出远程仓库
await remote.list(verbose?: boolean)

// 获取远程仓库 URL
await remote.getUrl(name: string)

// 设置远程仓库 URL
await remote.setUrl(name: string, url: string)

// 推送到远程仓库
await remote.push(options?: GitPushOptions)

// 从远程仓库拉取
await remote.pull(options?: GitPullOptions)

// 获取远程分支
await remote.fetch(remoteName?: string)

// 检查远程仓库是否存在
await remote.exists(name: string)

// 重命名远程仓库
await remote.rename(oldName: string, newName: string)
```

## 类型定义

### 配置选项

```typescript
interface GitRepositoryOptions {
  baseDir?: string              // 仓库路径
  binary?: string              // Git 可执行文件路径
  maxConcurrentProcesses?: number  // 最大并发数
  timeout?: number             // 超时时间（毫秒）
  debug?: boolean              // 是否启用调试模式
}
```

### 操作结果

```typescript
interface GitOperationResult<T = any> {
  success: boolean    // 操作是否成功
  data?: T           // 返回数据
  error?: string     // 错误信息
  output?: string    // 命令输出
}
```

### 提交信息

```typescript
interface GitCommitInfo {
  hash: string           // 提交哈希
  date: string          // 提交日期
  message: string       // 提交消息
  author_name: string   // 作者名称
  author_email: string  // 作者邮箱
  files?: string[]      // 修改的文件列表
}
```

### 分支信息

```typescript
interface GitBranchInfo {
  name: string      // 分支名称
  current: boolean  // 是否为当前分支
  remote: boolean   // 是否为远程分支
  commit?: string   // 最后提交哈希
  label?: string    // 最后提交消息
}
```

### 状态信息

```typescript
interface GitStatusInfo {
  current: string | null    // 当前分支
  tracking: string | null   // 跟踪的分支
  ahead: number            // 领先的提交数
  behind: number           // 落后的提交数
  staged: string[]         // 已暂存的文件
  not_added: string[]      // 未暂存的文件
  modified: string[]       // 已修改的文件
  deleted: string[]        // 已删除的文件
  conflicted: string[]     // 冲突的文件
  created: string[]        // 新增的文件
}
```

## 错误处理

库提供了统一的错误处理机制：

```typescript
import { GitError, GitErrorType } from '@ldesign/git'

try {
  await git.commit('Test commit')
} catch (error) {
  if (error instanceof GitError) {
    console.log('错误类型:', error.type)
    console.log('错误消息:', error.message)
    console.log('格式化消息:', error.getFormattedMessage())
    console.log('JSON 格式:', error.toJSON())
  }
}
```

### 错误类型

- `REPOSITORY_NOT_FOUND` - 仓库不存在
- `REPOSITORY_EXISTS` - 仓库已存在
- `BRANCH_NOT_FOUND` - 分支不存在
- `BRANCH_EXISTS` - 分支已存在
- `REMOTE_NOT_FOUND` - 远程仓库不存在
- `COMMIT_FAILED` - 提交失败
- `PUSH_FAILED` - 推送失败
- `PULL_FAILED` - 拉取失败
- `MERGE_CONFLICT` - 合并冲突
- `PERMISSION_DENIED` - 权限不足
- `NETWORK_ERROR` - 网络错误
- `INVALID_ARGUMENT` - 参数无效
- `TIMEOUT` - 操作超时

## 事件系统

所有类都支持事件监听：

```typescript
// 监听仓库操作事件
git.repository.on('commit', (event, data) => {
  console.log('提交事件:', data)
})

// 监听分支操作事件
git.branch.on('checkout', (event, data) => {
  console.log('分支切换:', data)
})

// 监听错误事件
git.repository.on('error', (event, error) => {
  console.error('操作错误:', error)
})

// 移除事件监听器
const listener = (event, data) => console.log(data)
git.repository.on('commit', listener)
git.repository.off('commit', listener)
```

## 完整示例

```typescript
import { Git } from '@ldesign/git'

async function gitWorkflow() {
  const git = Git.create('./my-project')
  
  try {
    // 初始化仓库
    await git.init()
    console.log('仓库初始化成功')
    
    // 添加远程仓库
    await git.addRemote('origin', 'https://github.com/user/repo.git')
    
    // 创建文件
    // ... 创建项目文件 ...
    
    // 添加所有文件
    await git.add('.')
    
    // 提交更改
    await git.commit('Initial commit')
    
    // 创建功能分支
    await git.createBranch('feature/new-feature')
    await git.checkoutBranch('feature/new-feature')
    
    // 在功能分支上工作
    // ... 修改文件 ...
    
    await git.add('.')
    await git.commit('Add new feature')
    
    // 切换回主分支并合并
    await git.checkoutBranch('main')
    await git.branch.merge('feature/new-feature')
    
    // 推送到远程仓库
    await git.push('origin', 'main')
    
    console.log('Git 工作流完成')
    
  } catch (error) {
    console.error('操作失败:', error.message)
  }
}

gitWorkflow()
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
