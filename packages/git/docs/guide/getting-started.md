# 快速开始

本指南将帮助您快速上手 @ldesign/git，了解基本用法和核心概念。

## 安装

首先，在您的项目中安装 @ldesign/git：

::: code-group

```bash [pnpm]
pnpm add @ldesign/git
```

```bash [npm]
npm install @ldesign/git
```

```bash [yarn]
yarn add @ldesign/git
```

:::

## 基础用法

### 创建 Git 实例

```typescript
import { Git } from '@ldesign/git'

// 使用当前目录
const git = new Git()

// 指定仓库目录
const git = new Git('/path/to/repository')

// 使用静态工厂方法
const git = Git.create('/path/to/repository')

// 带配置选项
const git = new Git('/path/to/repository', {
  timeout: 30000,
  debug: true
})
```

### 初始化仓库

```typescript
// 初始化普通仓库
await git.init()

// 初始化裸仓库
await git.init(true)

// 检查是否为 Git 仓库
const isRepo = await git.isRepo()
console.log('是否为 Git 仓库:', isRepo)
```

### 基本操作

```typescript
// 添加文件到暂存区
await git.add('file.txt')           // 单个文件
await git.add(['file1.txt', 'file2.txt'])  // 多个文件
await git.add('.')                  // 所有文件

// 提交更改
await git.commit('Initial commit')

// 提交指定文件
await git.commit('Update files', ['file1.txt', 'file2.txt'])

// 推送到远程仓库
await git.push()                    // 默认 origin 和当前分支
await git.push('origin', 'main')    // 指定远程和分支

// 从远程仓库拉取
await git.pull()                    // 默认 origin 和当前分支
await git.pull('origin', 'main')    // 指定远程和分支
```

### 状态查询

```typescript
// 获取仓库状态
const status = await git.getStatus()
console.log('当前分支:', status.data?.current)
console.log('暂存文件:', status.data?.staged)
console.log('未暂存文件:', status.data?.not_added)

// 获取提交日志
const log = await git.getLog(10)    // 最近 10 条提交
console.log('提交历史:', log.data)

// 检查工作目录是否干净
const isClean = await git.status.isClean()
console.log('工作目录是否干净:', isClean)
```

## 分支操作

```typescript
// 创建分支
await git.createBranch('feature/new-feature')

// 切换分支
await git.checkoutBranch('feature/new-feature')

// 列出分支
const branches = await git.listBranches()
console.log('本地分支:', branches.data)

// 列出包含远程分支的所有分支
const allBranches = await git.listBranches(true)
console.log('所有分支:', allBranches.data)

// 删除分支
await git.branch.delete('feature/old-feature')

// 强制删除分支
await git.branch.delete('feature/old-feature', true)

// 合并分支
await git.branch.merge('feature/new-feature')
```

## 远程仓库操作

```typescript
// 添加远程仓库
await git.addRemote('origin', 'https://github.com/user/repo.git')

// 列出远程仓库
const remotes = await git.listRemotes()
console.log('远程仓库:', remotes.data)

// 获取远程仓库 URL
const url = await git.remote.getUrl('origin')
console.log('远程 URL:', url.data)

// 设置远程仓库 URL
await git.remote.setUrl('origin', 'https://github.com/user/new-repo.git')

// 获取远程分支
await git.remote.fetch('origin')
```

## 错误处理

@ldesign/git 提供了统一的错误处理机制：

```typescript
import { GitError, GitErrorType } from '@ldesign/git'

try {
  await git.commit('Test commit')
} catch (error) {
  if (error instanceof GitError) {
    console.log('错误类型:', error.type)
    console.log('错误消息:', error.message)
    console.log('格式化消息:', error.getFormattedMessage())
    
    // 根据错误类型处理
    switch (error.type) {
      case GitErrorType.REPOSITORY_NOT_FOUND:
        console.log('仓库不存在，请先初始化')
        break
      case GitErrorType.COMMIT_FAILED:
        console.log('提交失败，请检查暂存区')
        break
      default:
        console.log('其他错误:', error.message)
    }
  }
}
```

## 事件监听

您可以监听 Git 操作的事件：

```typescript
// 监听提交事件
git.repository.on('commit', (event, data) => {
  console.log('提交完成:', data)
})

// 监听分支切换事件
git.branch.on('checkout', (event, data) => {
  console.log('分支切换:', data)
})

// 监听错误事件
git.repository.on('error', (event, error) => {
  console.error('操作错误:', error)
})
```

## 完整示例

以下是一个完整的 Git 工作流示例：

```typescript
import { Git } from '@ldesign/git'

async function gitWorkflow() {
  const git = Git.create('./my-project')
  
  try {
    // 1. 初始化仓库
    await git.init()
    console.log('✅ 仓库初始化成功')
    
    // 2. 添加远程仓库
    await git.addRemote('origin', 'https://github.com/user/repo.git')
    console.log('✅ 远程仓库添加成功')
    
    // 3. 创建并添加文件
    // ... 创建项目文件 ...
    
    // 4. 添加所有文件
    await git.add('.')
    console.log('✅ 文件添加成功')
    
    // 5. 提交更改
    await git.commit('Initial commit')
    console.log('✅ 提交成功')
    
    // 6. 创建功能分支
    await git.createBranch('feature/new-feature')
    await git.checkoutBranch('feature/new-feature')
    console.log('✅ 功能分支创建并切换成功')
    
    // 7. 在功能分支上工作
    // ... 修改文件 ...
    await git.add('.')
    await git.commit('Add new feature')
    console.log('✅ 功能开发完成')
    
    // 8. 切换回主分支并合并
    await git.checkoutBranch('main')
    await git.branch.merge('feature/new-feature')
    console.log('✅ 功能合并成功')
    
    // 9. 推送到远程仓库
    await git.push('origin', 'main')
    console.log('✅ 推送成功')
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message)
  }
}

gitWorkflow()
```

## 下一步

- 了解 [API 参考](/api/git) 获取详细的方法说明
- 查看 [CLI 工具](/cli/commands) 了解命令行用法
- 浏览 [示例](/examples/basic) 学习更多用法
- 阅读 [配置选项](/guide/configuration) 了解高级配置
