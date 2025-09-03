# 仓库操作

本页面详细介绍 @ldesign/git 的仓库操作功能。

## 仓库初始化

### 创建新仓库

```typescript
import { Git } from '@ldesign/git'

const git = Git.create('./my-project')

// 初始化普通仓库
await git.init()

// 初始化裸仓库
await git.init(true)
```

### 检查仓库状态

```typescript
// 检查是否为 Git 仓库
const isRepo = await git.isRepo()
if (!isRepo) {
  console.log('当前目录不是 Git 仓库')
  await git.init()
}
```

## 克隆仓库

### 基础克隆

```typescript
// 克隆到当前目录
await git.clone('https://github.com/user/repo.git')

// 克隆到指定目录
await git.clone('https://github.com/user/repo.git', './target-dir')
```

### 克隆选项

```typescript
// 浅克隆（只获取最新提交）
await git.clone('https://github.com/user/repo.git', './shallow-repo', {
  depth: 1
})

// 克隆特定分支
await git.clone('https://github.com/user/repo.git', './branch-repo', {
  branch: 'develop'
})
```

## 文件操作

### 添加文件

```typescript
// 添加单个文件
await git.add('README.md')

// 添加多个文件
await git.add(['file1.js', 'file2.js'])

// 添加所有文件
await git.add('.')

// 添加目录
await git.add('src/')
```

### 提交更改

```typescript
// 基础提交
await git.commit('Initial commit')

// 提交指定文件
await git.commit('Update documentation', ['README.md', 'docs/'])

// 空提交（用于触发 CI）
await git.commit('Trigger CI', [], { allowEmpty: true })
```

## 远程操作

### 推送更改

```typescript
// 推送到默认远程和分支
await git.push()

// 推送到指定远程和分支
await git.push('origin', 'main')

// 强制推送
await git.push('origin', 'main', { force: true })

// 推送标签
await git.push('origin', 'main', { tags: true })
```

### 拉取更改

```typescript
// 从默认远程拉取
await git.pull()

// 从指定远程和分支拉取
await git.pull('origin', 'main')

// 变基拉取
await git.pull('origin', 'main', { rebase: true })
```

## 完整示例

### 新项目工作流

```typescript
import { Git } from '@ldesign/git'
import fs from 'fs/promises'

async function createNewProject() {
  const projectPath = './my-new-project'
  const git = Git.create(projectPath)
  
  try {
    // 1. 创建项目目录
    await fs.mkdir(projectPath, { recursive: true })
    
    // 2. 初始化 Git 仓库
    await git.init()
    console.log('✅ Git 仓库初始化成功')
    
    // 3. 创建初始文件
    await fs.writeFile(`${projectPath}/README.md`, '# My New Project\n\nProject description here.')
    await fs.writeFile(`${projectPath}/.gitignore`, 'node_modules/\n.env\n')
    
    // 4. 添加文件到暂存区
    await git.add('.')
    console.log('✅ 文件添加成功')
    
    // 5. 初始提交
    const commitResult = await git.commit('Initial commit')
    if (commitResult.success) {
      console.log(`✅ 初始提交成功: ${commitResult.data?.hash}`)
    }
    
    // 6. 添加远程仓库
    await git.addRemote('origin', 'https://github.com/user/my-new-project.git')
    console.log('✅ 远程仓库添加成功')
    
    // 7. 推送到远程
    await git.push('origin', 'main')
    console.log('✅ 推送成功')
    
  } catch (error) {
    console.error('❌ 项目创建失败:', error.message)
  }
}
```

### 现有项目工作流

```typescript
async function workWithExistingProject() {
  const git = Git.create('./existing-project')
  
  try {
    // 1. 检查仓库状态
    const isRepo = await git.isRepo()
    if (!isRepo) {
      throw new Error('当前目录不是 Git 仓库')
    }
    
    // 2. 获取最新代码
    await git.pull('origin', 'main')
    console.log('✅ 代码更新成功')
    
    // 3. 检查工作目录状态
    const status = await git.getStatus()
    console.log(`当前分支: ${status.data?.current}`)
    console.log(`未暂存文件: ${status.data?.not_added.length}`)
    console.log(`已修改文件: ${status.data?.modified.length}`)
    
    // 4. 如果有更改，提交它们
    const hasChanges = (status.data?.not_added.length || 0) > 0 || 
                      (status.data?.modified.length || 0) > 0
    
    if (hasChanges) {
      await git.add('.')
      await git.commit('Update project files')
      await git.push('origin', 'main')
      console.log('✅ 更改已提交并推送')
    } else {
      console.log('ℹ️ 没有需要提交的更改')
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message)
  }
}
```

## 下一步

- 了解 [分支管理](/guide/branches) 进行分支操作
- 学习 [状态查询](/guide/status) 获取仓库信息
- 查看 [远程仓库](/guide/remote) 管理远程仓库
