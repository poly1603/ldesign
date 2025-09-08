# 状态查询

本页面详细介绍 @ldesign/git 的状态查询功能。

## 基础状态查询

### 获取仓库状态

```typescript
import { Git } from '@ldesign/git'

const git = Git.create('./my-project')

// 获取完整状态信息
const status = await git.getStatus()
if (status.success) {
  console.log('当前分支:', status.data.current)
  console.log('跟踪分支:', status.data.tracking)
  console.log('领先提交:', status.data.ahead)
  console.log('落后提交:', status.data.behind)
  console.log('暂存文件:', status.data.staged)
  console.log('未暂存文件:', status.data.not_added)
  console.log('已修改文件:', status.data.modified)
}
```

### 检查工作目录状态

```typescript
// 检查工作目录是否干净
const isClean = await git.status.isClean()
if (isClean) {
  console.log('✅ 工作目录干净')
} else {
  console.log('⚠️ 工作目录有未提交的更改')
}

// 检查是否有暂存的文件
const hasStaged = await git.status.hasStaged()
if (hasStaged) {
  console.log('📦 有文件在暂存区')
}

// 检查是否有未跟踪的文件
const hasUntracked = await git.status.hasUntracked()
if (hasUntracked) {
  console.log('📝 有未跟踪的文件')
}
```

## 提交历史查询

### 获取提交日志

```typescript
// 获取最近 10 条提交
const log = await git.getLog(10)
if (log.success) {
  log.data.forEach((commit, index) => {
    console.log(`${index + 1}. ${commit.hash.substring(0, 8)} - ${commit.message}`)
    console.log(`   作者: ${commit.author_name} <${commit.author_email}>`)
    console.log(`   时间: ${commit.date}`)
  })
}

// 获取所有提交
const allLog = await git.getLog()
console.log(`总提交数: ${allLog.data?.length}`)
```

### 获取特定提交信息

```typescript
// 获取最新提交
const latestCommit = await git.getLog(1)
if (latestCommit.success && latestCommit.data.length > 0) {
  const commit = latestCommit.data[0]
  console.log('最新提交:', commit.message)
  console.log('提交哈希:', commit.hash)
  console.log('作者:', commit.author_name)
}

// 显示提交详情
const commitDetails = await git.status.show(commit.hash)
if (commitDetails.success) {
  console.log('提交详情:', commitDetails.data)
}
```

### 文件历史查询

```typescript
// 获取特定文件的提交历史
const fileHistory = await git.status.getFileHistory('README.md')
if (fileHistory.success) {
  console.log(`README.md 的提交历史 (${fileHistory.data.length} 条):`)
  fileHistory.data.forEach(commit => {
    console.log(`- ${commit.hash.substring(0, 8)}: ${commit.message}`)
  })
}

// 获取文件在特定提交中的内容
const fileContent = await git.status.getFileAtCommit('README.md', 'abc123')
if (fileContent.success) {
  console.log('文件内容:', fileContent.data)
}
```

## 差异比较

### 查看文件差异

```typescript
// 查看工作目录与暂存区的差异
const workingDiff = await git.getDiff()
if (workingDiff.success) {
  console.log('工作目录差异:', workingDiff.data)
}

// 查看暂存区与最新提交的差异
const stagedDiff = await git.getDiff({ staged: true })
if (stagedDiff.success) {
  console.log('暂存区差异:', stagedDiff.data)
}

// 查看特定文件的差异
const fileDiff = await git.getDiff({ files: ['README.md'] })
if (fileDiff.success) {
  console.log('README.md 差异:', fileDiff.data)
}
```

### 比较提交

```typescript
// 比较两个提交
const commitDiff = await git.getDiff({
  from: 'abc123',
  to: 'def456'
})
if (commitDiff.success) {
  console.log('提交差异:', commitDiff.data)
}

// 比较分支
const branchDiff = await git.getDiff({
  from: 'main',
  to: 'develop'
})
if (branchDiff.success) {
  console.log('分支差异:', branchDiff.data)
}
```

## 状态监控

### 实时状态监控

```typescript
class GitStatusMonitor {
  private git: Git
  private interval: NodeJS.Timeout | null = null
  
  constructor(git: Git) {
    this.git = git
  }
  
  async startMonitoring(intervalMs = 5000): Promise<void> {
    console.log('🔍 开始监控 Git 状态...')
    
    this.interval = setInterval(async () => {
      try {
        await this.checkStatus()
      } catch (error) {
        console.error('状态检查失败:', error.message)
      }
    }, intervalMs)
    
    // 立即执行一次
    await this.checkStatus()
  }
  
  stopMonitoring(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
      console.log('⏹️ 停止监控 Git 状态')
    }
  }
  
  private async checkStatus(): Promise<void> {
    const status = await this.git.getStatus()
    
    if (status.success) {
      const { data } = status
      const hasChanges = data.staged.length > 0 || 
                        data.not_added.length > 0 || 
                        data.modified.length > 0
      
      if (hasChanges) {
        console.log('📊 状态更新:')
        console.log(`  分支: ${data.current}`)
        console.log(`  暂存: ${data.staged.length}`)
        console.log(`  修改: ${data.modified.length}`)
        console.log(`  未跟踪: ${data.not_added.length}`)
      }
    }
  }
}

// 使用示例
const monitor = new GitStatusMonitor(git)
await monitor.startMonitoring(3000) // 每 3 秒检查一次

// 在需要时停止监控
// monitor.stopMonitoring()
```

### 状态变化通知

```typescript
class GitStatusNotifier {
  private git: Git
  private lastStatus: any = null
  
  constructor(git: Git) {
    this.git = git
  }
  
  async checkForChanges(): Promise<void> {
    const currentStatus = await this.git.getStatus()
    
    if (!currentStatus.success) return
    
    if (this.lastStatus) {
      await this.compareAndNotify(this.lastStatus, currentStatus.data)
    }
    
    this.lastStatus = currentStatus.data
  }
  
  private async compareAndNotify(oldStatus: any, newStatus: any): Promise<void> {
    // 检查分支变化
    if (oldStatus.current !== newStatus.current) {
      console.log(`🌿 分支切换: ${oldStatus.current} → ${newStatus.current}`)
    }
    
    // 检查文件状态变化
    const oldStaged = oldStatus.staged.length
    const newStaged = newStatus.staged.length
    if (oldStaged !== newStaged) {
      console.log(`📦 暂存文件变化: ${oldStaged} → ${newStaged}`)
    }
    
    const oldModified = oldStatus.modified.length
    const newModified = newStatus.modified.length
    if (oldModified !== newModified) {
      console.log(`✏️ 修改文件变化: ${oldModified} → ${newModified}`)
    }
    
    // 检查远程同步状态
    if (oldStatus.ahead !== newStatus.ahead) {
      console.log(`📤 领先提交变化: ${oldStatus.ahead} → ${newStatus.ahead}`)
    }
    
    if (oldStatus.behind !== newStatus.behind) {
      console.log(`📥 落后提交变化: ${oldStatus.behind} → ${newStatus.behind}`)
    }
  }
}
```

## 状态报告

### 生成状态报告

```typescript
class GitStatusReporter {
  private git: Git
  
  constructor(git: Git) {
    this.git = git
  }
  
  async generateReport(): Promise<string> {
    const report = ['# Git 状态报告', '']
    
    try {
      // 基本信息
      const status = await this.git.getStatus()
      if (status.success) {
        report.push('## 基本信息')
        report.push(`- 当前分支: ${status.data.current}`)
        report.push(`- 跟踪分支: ${status.data.tracking || '无'}`)
        report.push(`- 领先提交: ${status.data.ahead}`)
        report.push(`- 落后提交: ${status.data.behind}`)
        report.push('')
      }
      
      // 文件状态
      if (status.success) {
        report.push('## 文件状态')
        report.push(`- 暂存文件: ${status.data.staged.length}`)
        report.push(`- 修改文件: ${status.data.modified.length}`)
        report.push(`- 未跟踪文件: ${status.data.not_added.length}`)
        report.push(`- 删除文件: ${status.data.deleted.length}`)
        
        if (status.data.staged.length > 0) {
          report.push('')
          report.push('### 暂存文件列表')
          status.data.staged.forEach(file => {
            report.push(`- ${file}`)
          })
        }
        
        if (status.data.modified.length > 0) {
          report.push('')
          report.push('### 修改文件列表')
          status.data.modified.forEach(file => {
            report.push(`- ${file}`)
          })
        }
        
        report.push('')
      }
      
      // 最近提交
      const log = await this.git.getLog(5)
      if (log.success && log.data.length > 0) {
        report.push('## 最近提交')
        log.data.forEach((commit, index) => {
          report.push(`${index + 1}. **${commit.hash.substring(0, 8)}** - ${commit.message}`)
          report.push(`   - 作者: ${commit.author_name}`)
          report.push(`   - 时间: ${commit.date}`)
          report.push('')
        })
      }
      
      // 分支信息
      const branches = await this.git.listBranches()
      if (branches.success) {
        report.push('## 分支信息')
        report.push(`- 本地分支数: ${branches.data.length}`)
        
        const currentBranch = branches.data.find(b => b.current)
        if (currentBranch) {
          report.push(`- 当前分支: ${currentBranch.name}`)
        }
        
        report.push('')
        report.push('### 分支列表')
        branches.data.forEach(branch => {
          const marker = branch.current ? '* ' : '  '
          report.push(`${marker}${branch.name}`)
        })
        report.push('')
      }
      
      // 远程仓库
      const remotes = await this.git.listRemotes()
      if (remotes.success && remotes.data.length > 0) {
        report.push('## 远程仓库')
        remotes.data.forEach(remote => {
          report.push(`- **${remote.name}**: ${remote.refs.fetch}`)
        })
        report.push('')
      }
      
    } catch (error) {
      report.push('## 错误')
      report.push(`生成报告时发生错误: ${error.message}`)
    }
    
    report.push(`---`)
    report.push(`报告生成时间: ${new Date().toISOString()}`)
    
    return report.join('\n')
  }
  
  async saveReport(filename?: string): Promise<void> {
    const report = await this.generateReport()
    const filepath = filename || `git-status-${Date.now()}.md`
    
    await require('fs/promises').writeFile(filepath, report)
    console.log(`✅ 状态报告已保存到: ${filepath}`)
  }
}

// 使用示例
const reporter = new GitStatusReporter(git)
const report = await reporter.generateReport()
console.log(report)

// 或保存到文件
await reporter.saveReport('git-status.md')
```

## 状态分析

### 工作目录分析

```typescript
class GitWorkspaceAnalyzer {
  private git: Git
  
  constructor(git: Git) {
    this.git = git
  }
  
  async analyzeWorkspace(): Promise<any> {
    const status = await this.git.getStatus()
    const log = await this.git.getLog(100) // 分析最近 100 次提交
    
    if (!status.success || !log.success) {
      throw new Error('无法获取仓库信息')
    }
    
    const analysis = {
      workspace: this.analyzeWorkspaceStatus(status.data),
      commits: this.analyzeCommitHistory(log.data),
      recommendations: []
    }
    
    // 生成建议
    analysis.recommendations = this.generateRecommendations(analysis)
    
    return analysis
  }
  
  private analyzeWorkspaceStatus(status: any): any {
    return {
      isClean: status.staged.length === 0 && 
               status.modified.length === 0 && 
               status.not_added.length === 0,
      totalFiles: status.staged.length + 
                  status.modified.length + 
                  status.not_added.length,
      syncStatus: {
        ahead: status.ahead,
        behind: status.behind,
        inSync: status.ahead === 0 && status.behind === 0
      }
    }
  }
  
  private analyzeCommitHistory(commits: any[]): any {
    const authors = new Map<string, number>()
    const commitsByDay = new Map<string, number>()
    
    commits.forEach(commit => {
      // 统计作者
      const author = commit.author_name
      authors.set(author, (authors.get(author) || 0) + 1)
      
      // 统计每日提交
      const date = commit.date.split('T')[0]
      commitsByDay.set(date, (commitsByDay.get(date) || 0) + 1)
    })
    
    return {
      totalCommits: commits.length,
      authors: Array.from(authors.entries()).map(([name, count]) => ({ name, count })),
      dailyActivity: Array.from(commitsByDay.entries()).map(([date, count]) => ({ date, count })),
      averageCommitsPerDay: commits.length / Math.max(commitsByDay.size, 1)
    }
  }
  
  private generateRecommendations(analysis: any): string[] {
    const recommendations = []
    
    if (!analysis.workspace.isClean) {
      recommendations.push('工作目录不干净，建议提交或暂存更改')
    }
    
    if (analysis.workspace.syncStatus.behind > 0) {
      recommendations.push('本地分支落后远程，建议执行 pull 操作')
    }
    
    if (analysis.workspace.syncStatus.ahead > 5) {
      recommendations.push('本地分支领先远程较多，建议执行 push 操作')
    }
    
    if (analysis.commits.averageCommitsPerDay < 1) {
      recommendations.push('提交频率较低，建议更频繁地提交代码')
    }
    
    return recommendations
  }
}
```

## 下一步

- 了解 [远程仓库](/cli/remote) 管理远程状态
- 学习 [事件系统](/guide/events) 监听状态变化事件
- 查看 [错误处理](/guide/error-handling) 处理状态查询错误
