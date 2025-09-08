# 基础概念

本页面介绍 @ldesign/git 的核心概念和设计理念。

## 核心架构

@ldesign/git 采用模块化设计，将 Git 功能分解为几个核心模块：

### Git 主类

`Git` 类是整个库的入口点，它整合了所有子模块的功能：

```typescript
import { Git } from '@ldesign/git'

const git = Git.create('./my-project')
```

### 核心模块

#### GitRepository
负责基础的 Git 仓库操作：
- 仓库初始化和克隆
- 文件添加和提交
- 推送和拉取操作

#### GitBranch
专门处理分支相关操作：
- 分支创建、删除、重命名
- 分支切换和合并
- 分支比较和历史查询

#### GitStatus
提供状态查询功能：
- 仓库状态检查
- 提交历史查询
- 文件差异比较

#### GitRemote
管理远程仓库：
- 远程仓库添加和删除
- URL 管理
- 远程分支操作

## 设计原则

### 1. 面向对象设计

每个模块都是独立的类，具有清晰的职责分工：

```typescript
// 通过主类访问各个模块
git.repository.init()     // 仓库操作
git.branch.create('dev')  // 分支操作
git.status.getStatus()    // 状态查询
git.remote.add('origin', 'url')  // 远程操作
```

### 2. 统一的返回格式

所有操作都返回统一的 `GitOperationResult` 格式：

```typescript
interface GitOperationResult<T = any> {
  success: boolean    // 操作是否成功
  data?: T           // 返回数据
  error?: string     // 错误信息
  output?: string    // 命令输出
}
```

### 3. 类型安全

完整的 TypeScript 类型定义，确保编译时类型检查：

```typescript
// 类型安全的操作
const result: GitOperationResult<GitStatusInfo> = await git.getStatus()
if (result.success) {
  console.log(result.data.current)  // TypeScript 知道这是 string
}
```

### 4. 错误处理

统一的错误处理机制，所有错误都继承自 `GitError`：

```typescript
try {
  await git.commit('message')
} catch (error) {
  if (error instanceof GitError) {
    console.log(error.type)  // 错误类型
    console.log(error.getFormattedMessage())  // 格式化消息
  }
}
```

## 事件系统

@ldesign/git 内置事件系统，支持监听各种操作：

```typescript
// 监听提交事件
git.repository.on('commit', (event, data) => {
  console.log('提交完成:', data)
})

// 监听分支切换
git.branch.on('checkout', (event, data) => {
  console.log('分支切换:', data)
})

// 监听错误
git.repository.on('error', (event, error) => {
  console.error('操作错误:', error)
})
```

## 配置系统

灵活的配置选项，支持全局和局部配置：

```typescript
// 全局配置
const git = new Git('.', {
  timeout: 30000,           // 超时时间
  debug: true,              // 调试模式
  maxConcurrentProcesses: 5, // 最大并发数
  binary: '/usr/bin/git'    // Git 可执行文件路径
})

// 运行时配置
git.setOptions({
  timeout: 60000
})
```

## 异步操作

所有 Git 操作都是异步的，支持 Promise 和 async/await：

```typescript
// Promise 方式
git.init()
  .then(result => {
    if (result.success) {
      console.log('初始化成功')
    }
  })
  .catch(error => {
    console.error('初始化失败:', error)
  })

// async/await 方式
async function initRepo() {
  try {
    const result = await git.init()
    if (result.success) {
      console.log('初始化成功')
    }
  } catch (error) {
    console.error('初始化失败:', error)
  }
}
```

## 链式调用

支持链式调用，提高代码可读性：

```typescript
// 链式操作
await git
  .init()
  .then(() => git.add('.'))
  .then(() => git.commit('Initial commit'))
  .then(() => git.addRemote('origin', 'url'))
  .then(() => git.push('origin', 'main'))
```

## 工作流模式

### 基础工作流

```typescript
// 1. 初始化或克隆
await git.init()
// 或
await git.clone('https://github.com/user/repo.git')

// 2. 添加文件
await git.add('.')

// 3. 提交更改
await git.commit('Initial commit')

// 4. 推送到远程
await git.push('origin', 'main')
```

### 分支工作流

```typescript
// 1. 创建功能分支
await git.createBranch('feature/new-feature')

// 2. 切换到功能分支
await git.checkoutBranch('feature/new-feature')

// 3. 开发和提交
await git.add('.')
await git.commit('Add new feature')

// 4. 切换回主分支
await git.checkoutBranch('main')

// 5. 合并功能分支
await git.branch.merge('feature/new-feature')

// 6. 删除功能分支
await git.branch.delete('feature/new-feature')
```

## 最佳实践

### 1. 错误处理

始终处理可能的错误：

```typescript
const result = await git.commit('message')
if (!result.success) {
  console.error('提交失败:', result.error)
  return
}
```

### 2. 状态检查

在执行操作前检查仓库状态：

```typescript
const isRepo = await git.isRepo()
if (!isRepo) {
  await git.init()
}

const isClean = await git.status.isClean()
if (!isClean) {
  console.log('工作目录不干净，请先提交更改')
}
```

### 3. 配置管理

根据环境配置不同的选项：

```typescript
const git = new Git('.', {
  timeout: process.env.NODE_ENV === 'production' ? 60000 : 30000,
  debug: process.env.NODE_ENV === 'development'
})
```

### 4. 事件监听

使用事件监听器进行日志记录和调试：

```typescript
if (process.env.NODE_ENV === 'development') {
  git.repository.on('*', (event, data) => {
    console.log(`Git 事件: ${event}`, data)
  })
}
```

## 下一步

- 了解 [仓库操作](/guide/repository) 的详细用法
- 学习 [分支管理](/guide/branches) 的最佳实践
- 查看 [状态查询](/guide/status) 的各种方法
- 掌握 [远程仓库](/cli/remote) 的管理技巧
