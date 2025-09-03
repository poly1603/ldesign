# 基础用法示例

本页面提供 @ldesign/git 的基础使用示例，帮助您快速上手。

## 仓库初始化

### 创建新仓库

```typescript
import { Git } from '@ldesign/git'

async function createNewRepository() {
  const git = Git.create('./my-new-project')
  
  try {
    // 初始化仓库
    const initResult = await git.init()
    if (!initResult.success) {
      throw new Error(`初始化失败: ${initResult.error}`)
    }
    
    console.log('✅ 仓库初始化成功')
    
    // 创建初始文件
    // 这里假设您已经创建了一些文件
    
    // 添加所有文件
    await git.add('.')
    console.log('✅ 文件添加成功')
    
    // 初始提交
    const commitResult = await git.commit('Initial commit')
    if (commitResult.success) {
      console.log(`✅ 初始提交成功: ${commitResult.data?.hash}`)
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message)
  }
}

createNewRepository()
```

### 克隆现有仓库

```typescript
async function cloneRepository() {
  const git = Git.create('.')
  
  try {
    // 克隆仓库
    const cloneResult = await git.clone(
      'https://github.com/user/repository.git',
      './cloned-repo'
    )
    
    if (cloneResult.success) {
      console.log('✅ 仓库克隆成功')
      
      // 切换到克隆的目录
      const clonedGit = Git.create('./cloned-repo')
      
      // 检查仓库状态
      const status = await clonedGit.getStatus()
      console.log('📊 仓库状态:', status.data)
    }
    
  } catch (error) {
    console.error('❌ 克隆失败:', error.message)
  }
}
```

## 基本文件操作

### 添加和提交文件

```typescript
async function addAndCommitFiles() {
  const git = Git.create('.')
  
  try {
    // 检查仓库状态
    const status = await git.getStatus()
    console.log('当前分支:', status.data?.current)
    console.log('未暂存文件:', status.data?.not_added)
    
    // 添加特定文件
    await git.add(['README.md', 'package.json'])
    console.log('✅ 特定文件添加成功')
    
    // 或添加所有文件
    await git.add('.')
    console.log('✅ 所有文件添加成功')
    
    // 提交更改
    const commitResult = await git.commit('Add project files')
    if (commitResult.success) {
      console.log(`✅ 提交成功: ${commitResult.data?.hash}`)
      console.log(`📝 提交信息: ${commitResult.data?.message}`)
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message)
  }
}
```

### 检查文件状态

```typescript
async function checkFileStatus() {
  const git = Git.create('.')
  
  try {
    const status = await git.getStatus()
    
    if (status.success && status.data) {
      const { data } = status
      
      console.log('📊 仓库状态报告:')
      console.log(`当前分支: ${data.current}`)
      console.log(`跟踪分支: ${data.tracking || '无'}`)
      console.log(`领先提交: ${data.ahead}`)
      console.log(`落后提交: ${data.behind}`)
      
      if (data.staged.length > 0) {
        console.log('📦 暂存文件:')
        data.staged.forEach(file => console.log(`  - ${file}`))
      }
      
      if (data.not_added.length > 0) {
        console.log('📝 未暂存文件:')
        data.not_added.forEach(file => console.log(`  - ${file}`))
      }
      
      if (data.modified.length > 0) {
        console.log('✏️ 已修改文件:')
        data.modified.forEach(file => console.log(`  - ${file}`))
      }
      
      // 检查工作目录是否干净
      const isClean = await git.status.isClean()
      console.log(`🧹 工作目录${isClean ? '干净' : '不干净'}`)
    }
    
  } catch (error) {
    console.error('❌ 状态检查失败:', error.message)
  }
}
```

## 分支操作

### 基本分支管理

```typescript
async function branchManagement() {
  const git = Git.create('.')
  
  try {
    // 列出所有分支
    const branches = await git.listBranches()
    console.log('📋 本地分支:')
    branches.data?.forEach(branch => {
      const marker = branch.current ? '* ' : '  '
      console.log(`${marker}${branch.name}`)
    })
    
    // 创建新分支
    const newBranch = 'feature/user-authentication'
    await git.createBranch(newBranch)
    console.log(`✅ 分支 ${newBranch} 创建成功`)
    
    // 切换到新分支
    await git.checkoutBranch(newBranch)
    console.log(`✅ 已切换到分支 ${newBranch}`)
    
    // 在新分支上工作
    await git.add('.')
    await git.commit('Add authentication feature')
    console.log('✅ 在新分支上提交成功')
    
    // 切换回主分支
    await git.checkoutBranch('main')
    console.log('✅ 已切换回主分支')
    
    // 合并功能分支
    const mergeResult = await git.branch.merge(newBranch)
    if (mergeResult.success) {
      console.log(`✅ 分支 ${newBranch} 合并成功`)
    }
    
    // 删除已合并的分支
    await git.branch.delete(newBranch)
    console.log(`✅ 分支 ${newBranch} 删除成功`)
    
  } catch (error) {
    console.error('❌ 分支操作失败:', error.message)
  }
}
```

### 分支比较

```typescript
async function compareBranches() {
  const git = Git.create('.')
  
  try {
    // 比较两个分支
    const comparison = await git.branch.compare('main', 'develop')
    
    if (comparison.success && comparison.data) {
      console.log('🔍 分支比较结果:')
      console.log(`ahead: ${comparison.data.ahead}`)
      console.log(`behind: ${comparison.data.behind}`)
      console.log(`commits: ${comparison.data.commits?.length || 0}`)
    }
    
  } catch (error) {
    console.error('❌ 分支比较失败:', error.message)
  }
}
```

## 远程仓库操作

### 远程仓库管理

```typescript
async function remoteManagement() {
  const git = Git.create('.')
  
  try {
    // 添加远程仓库
    await git.addRemote('origin', 'https://github.com/user/repo.git')
    console.log('✅ 远程仓库 origin 添加成功')
    
    // 列出远程仓库
    const remotes = await git.listRemotes()
    console.log('📋 远程仓库列表:')
    remotes.data?.forEach(remote => {
      console.log(`  ${remote.name}: ${remote.refs.fetch}`)
    })
    
    // 推送到远程仓库
    const pushResult = await git.push('origin', 'main')
    if (pushResult.success) {
      console.log('✅ 推送到远程仓库成功')
    }
    
    // 从远程仓库拉取
    const pullResult = await git.pull('origin', 'main')
    if (pullResult.success) {
      console.log('✅ 从远程仓库拉取成功')
    }
    
  } catch (error) {
    console.error('❌ 远程操作失败:', error.message)
  }
}
```

### 获取远程分支

```typescript
async function fetchRemoteBranches() {
  const git = Git.create('.')
  
  try {
    // 获取远程分支信息
    await git.remote.fetch('origin')
    console.log('✅ 远程分支信息获取成功')
    
    // 列出包含远程分支的所有分支
    const allBranches = await git.listBranches(true)
    console.log('📋 所有分支（包含远程）:')
    allBranches.data?.forEach(branch => {
      const marker = branch.current ? '* ' : '  '
      const remote = branch.name.includes('remotes/') ? '(远程)' : ''
      console.log(`${marker}${branch.name} ${remote}`)
    })
    
  } catch (error) {
    console.error('❌ 获取远程分支失败:', error.message)
  }
}
```

## 提交历史查询

### 查看提交日志

```typescript
async function viewCommitHistory() {
  const git = Git.create('.')
  
  try {
    // 获取最近 10 条提交
    const log = await git.getLog(10)
    
    if (log.success && log.data) {
      console.log('📜 提交历史:')
      log.data.forEach((commit, index) => {
        console.log(`${index + 1}. ${commit.hash.substring(0, 8)} - ${commit.message}`)
        console.log(`   作者: ${commit.author_name} <${commit.author_email}>`)
        console.log(`   时间: ${commit.date}`)
        console.log()
      })
    }
    
  } catch (error) {
    console.error('❌ 获取提交历史失败:', error.message)
  }
}
```

### 查看文件历史

```typescript
async function viewFileHistory() {
  const git = Git.create('.')
  
  try {
    // 查看特定文件的历史
    const fileHistory = await git.status.getFileHistory('README.md')
    
    if (fileHistory.success && fileHistory.data) {
      console.log('📄 README.md 文件历史:')
      fileHistory.data.forEach((commit, index) => {
        console.log(`${index + 1}. ${commit.hash.substring(0, 8)} - ${commit.message}`)
      })
    }
    
  } catch (error) {
    console.error('❌ 获取文件历史失败:', error.message)
  }
}
```

## 完整工作流示例

### 功能开发工作流

```typescript
async function featureDevelopmentWorkflow() {
  const git = Git.create('.')
  
  try {
    console.log('🚀 开始功能开发工作流...')
    
    // 1. 确保在主分支上
    await git.checkoutBranch('main')
    console.log('✅ 切换到主分支')
    
    // 2. 拉取最新代码
    await git.pull('origin', 'main')
    console.log('✅ 拉取最新代码')
    
    // 3. 创建功能分支
    const featureBranch = `feature/new-feature-${Date.now()}`
    await git.createBranch(featureBranch)
    await git.checkoutBranch(featureBranch)
    console.log(`✅ 创建并切换到功能分支: ${featureBranch}`)
    
    // 4. 开发功能（这里模拟添加文件）
    console.log('💻 开发功能中...')
    
    // 5. 添加和提交更改
    await git.add('.')
    await git.commit('Implement new feature')
    console.log('✅ 提交功能代码')
    
    // 6. 推送功能分支
    await git.push('origin', featureBranch)
    console.log('✅ 推送功能分支到远程')
    
    // 7. 切换回主分支
    await git.checkoutBranch('main')
    console.log('✅ 切换回主分支')
    
    // 8. 合并功能分支
    await git.branch.merge(featureBranch)
    console.log('✅ 合并功能分支')
    
    // 9. 推送主分支
    await git.push('origin', 'main')
    console.log('✅ 推送主分支')
    
    // 10. 删除功能分支
    await git.branch.delete(featureBranch)
    console.log('✅ 删除本地功能分支')
    
    console.log('🎉 功能开发工作流完成！')
    
  } catch (error) {
    console.error('❌ 工作流执行失败:', error.message)
  }
}
```

## 错误处理示例

### 优雅的错误处理

```typescript
import { GitError, GitErrorType } from '@ldesign/git'

async function robustGitOperations() {
  const git = Git.create('.')
  
  try {
    // 尝试提交
    const result = await git.commit('Test commit')
    
    if (!result.success) {
      console.log('提交失败，但没有抛出异常')
      console.log('错误信息:', result.error)
      return
    }
    
    console.log('提交成功!')
    
  } catch (error) {
    if (error instanceof GitError) {
      console.log('Git 操作错误:')
      console.log('错误类型:', error.type)
      console.log('错误消息:', error.message)
      console.log('格式化消息:', error.getFormattedMessage())
      
      // 根据错误类型进行不同处理
      switch (error.type) {
        case GitErrorType.REPOSITORY_NOT_FOUND:
          console.log('建议: 请先初始化 Git 仓库')
          break
        case GitErrorType.COMMIT_FAILED:
          console.log('建议: 请检查是否有文件在暂存区')
          break
        default:
          console.log('建议: 请检查 Git 配置和网络连接')
      }
    } else {
      console.error('未知错误:', error.message)
    }
  }
}
```

## 下一步

- 查看 [高级用法](/examples/advanced) 了解更复杂的使用场景
- 学习 [集成示例](/examples/integration) 了解如何与其他工具集成
- 阅读 [最佳实践](/examples/best-practices) 获取开发建议
