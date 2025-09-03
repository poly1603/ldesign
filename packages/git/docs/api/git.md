# Git 主类

`Git` 类是 @ldesign/git 的主要入口点，整合了所有 Git 操作功能。

## 构造函数

### `new Git(baseDir?, options?)`

创建一个新的 Git 实例。

**参数：**

- `baseDir` (string, 可选) - 仓库路径，默认为当前工作目录
- `options` (GitRepositoryOptions, 可选) - 配置选项

**示例：**

```typescript
import { Git } from '@ldesign/git'

// 使用默认配置
const git = new Git()

// 指定仓库路径
const git = new Git('/path/to/repository')

// 带配置选项
const git = new Git('/path/to/repository', {
  timeout: 30000,
  debug: true,
  maxConcurrentProcesses: 5
})
```

## 静态方法

### `Git.create(baseDir?, options?)`

静态工厂方法，创建 Git 实例。

**参数：**

- `baseDir` (string, 可选) - 仓库路径
- `options` (GitRepositoryOptions, 可选) - 配置选项

**返回值：** `Git` - Git 实例

**示例：**

```typescript
const git = Git.create('/path/to/repository', {
  timeout: 60000
})
```

## 实例属性

### `repository`

`GitRepository` 实例，用于基础 Git 操作。

```typescript
// 访问仓库操作
await git.repository.init()
await git.repository.commit('message')
```

### `branch`

`GitBranch` 实例，用于分支管理。

```typescript
// 访问分支操作
await git.branch.create('feature/new')
await git.branch.checkout('main')
```

### `status`

`GitStatus` 实例，用于状态查询。

```typescript
// 访问状态操作
const status = await git.status.getStatus()
const log = await git.status.getLog()
```

### `remote`

`GitRemote` 实例，用于远程仓库操作。

```typescript
// 访问远程操作
await git.remote.add('origin', 'url')
await git.remote.push()
```

## 实例方法

### 基础操作

#### `init(bare?)`

初始化 Git 仓库。

**参数：**

- `bare` (boolean, 可选) - 是否创建裸仓库，默认 false

**返回值：** `Promise<GitOperationResult<void>>`

**示例：**

```typescript
// 初始化普通仓库
await git.init()

// 初始化裸仓库
await git.init(true)
```

#### `clone(repoUrl, targetDir?)`

克隆远程仓库。

**参数：**

- `repoUrl` (string) - 仓库 URL
- `targetDir` (string, 可选) - 目标目录

**返回值：** `Promise<GitOperationResult<void>>`

**示例：**

```typescript
await git.clone('https://github.com/user/repo.git')
await git.clone('https://github.com/user/repo.git', './my-repo')
```

#### `add(files)`

添加文件到暂存区。

**参数：**

- `files` (string | string[]) - 文件路径

**返回值：** `Promise<GitOperationResult<void>>`

**示例：**

```typescript
await git.add('file.txt')
await git.add(['file1.txt', 'file2.txt'])
await git.add('.')
```

#### `commit(message, files?)`

提交更改。

**参数：**

- `message` (string) - 提交消息
- `files` (string[], 可选) - 指定文件列表

**返回值：** `Promise<GitOperationResult<GitCommitInfo>>`

**示例：**

```typescript
await git.commit('Initial commit')
await git.commit('Update files', ['file1.txt', 'file2.txt'])
```

#### `push(remote?, branch?)`

推送到远程仓库。

**参数：**

- `remote` (string, 可选) - 远程仓库名称，默认 'origin'
- `branch` (string, 可选) - 分支名称

**返回值：** `Promise<GitOperationResult<void>>`

**示例：**

```typescript
await git.push()
await git.push('origin', 'main')
```

#### `pull(remote?, branch?)`

从远程仓库拉取。

**参数：**

- `remote` (string, 可选) - 远程仓库名称，默认 'origin'
- `branch` (string, 可选) - 分支名称

**返回值：** `Promise<GitOperationResult<void>>`

**示例：**

```typescript
await git.pull()
await git.pull('origin', 'main')
```

### 状态查询

#### `getStatus()`

获取仓库状态。

**返回值：** `Promise<GitOperationResult<GitStatusInfo>>`

**示例：**

```typescript
const result = await git.getStatus()
if (result.success) {
  console.log('当前分支:', result.data.current)
  console.log('暂存文件:', result.data.staged)
}
```

#### `getLog(maxCount?)`

获取提交日志。

**参数：**

- `maxCount` (number, 可选) - 最大条数

**返回值：** `Promise<GitOperationResult<GitCommitInfo[]>>`

**示例：**

```typescript
const result = await git.getLog(10)
if (result.success) {
  result.data.forEach(commit => {
    console.log(`${commit.hash}: ${commit.message}`)
  })
}
```

### 分支操作

#### `createBranch(branchName)`

创建分支。

**参数：**

- `branchName` (string) - 分支名称

**返回值：** `Promise<GitOperationResult<void>>`

**示例：**

```typescript
await git.createBranch('feature/new-feature')
```

#### `checkoutBranch(branchName)`

切换分支。

**参数：**

- `branchName` (string) - 分支名称

**返回值：** `Promise<GitOperationResult<void>>`

**示例：**

```typescript
await git.checkoutBranch('main')
```

#### `listBranches(includeRemote?)`

列出分支。

**参数：**

- `includeRemote` (boolean, 可选) - 是否包含远程分支

**返回值：** `Promise<GitOperationResult<GitBranchInfo[]>>`

**示例：**

```typescript
const result = await git.listBranches()
const allBranches = await git.listBranches(true)
```

### 远程仓库操作

#### `addRemote(name, url)`

添加远程仓库。

**参数：**

- `name` (string) - 远程仓库名称
- `url` (string) - 远程仓库 URL

**返回值：** `Promise<GitOperationResult<void>>`

**示例：**

```typescript
await git.addRemote('origin', 'https://github.com/user/repo.git')
```

#### `listRemotes()`

列出远程仓库。

**返回值：** `Promise<GitOperationResult<GitRemoteInfo[]>>`

**示例：**

```typescript
const result = await git.listRemotes()
if (result.success) {
  result.data.forEach(remote => {
    console.log(`${remote.name}: ${remote.refs.fetch}`)
  })
}
```

### 工具方法

#### `isRepo()`

检查是否为 Git 仓库。

**返回值：** `Promise<boolean>`

**示例：**

```typescript
const isRepo = await git.isRepo()
if (!isRepo) {
  await git.init()
}
```

#### `getBaseDir()`

获取仓库路径。

**返回值：** `string`

**示例：**

```typescript
const baseDir = git.getBaseDir()
console.log('仓库路径:', baseDir)
```

#### `getOptions()`

获取配置选项。

**返回值：** `GitRepositoryOptions`

**示例：**

```typescript
const options = git.getOptions()
console.log('超时时间:', options.timeout)
```

## 类型定义

### `GitRepositoryOptions`

```typescript
interface GitRepositoryOptions {
  baseDir?: string              // 仓库路径
  binary?: string              // Git 可执行文件路径
  maxConcurrentProcesses?: number  // 最大并发数
  timeout?: number             // 超时时间（毫秒）
  debug?: boolean              // 是否启用调试模式
}
```

### `GitOperationResult<T>`

```typescript
interface GitOperationResult<T = any> {
  success: boolean    // 操作是否成功
  data?: T           // 返回数据
  error?: string     // 错误信息
  output?: string    // 命令输出
}
```

## 完整示例

```typescript
import { Git } from '@ldesign/git'

async function example() {
  const git = Git.create('./my-project', {
    timeout: 30000,
    debug: true
  })
  
  try {
    // 初始化仓库
    await git.init()
    
    // 添加远程仓库
    await git.addRemote('origin', 'https://github.com/user/repo.git')
    
    // 创建文件并提交
    await git.add('.')
    await git.commit('Initial commit')
    
    // 创建并切换分支
    await git.createBranch('feature/new')
    await git.checkoutBranch('feature/new')
    
    // 推送到远程
    await git.push('origin', 'feature/new')
    
    console.log('操作完成！')
    
  } catch (error) {
    console.error('操作失败:', error.message)
  }
}

example()
```
