# 事件系统

@ldesign/git 内置了强大的事件系统，允许您监听和响应各种 Git 操作。

## 事件概述

事件系统基于 Node.js 的 EventEmitter，提供了以下功能：

- 监听 Git 操作的生命周期
- 获取操作的详细信息
- 实现自定义的日志记录
- 集成外部系统和工具

## 事件类型

### 仓库事件

#### commit 事件

当提交操作完成时触发。

```typescript
git.repository.on('commit', (event, data) => {
  console.log('提交完成:', data)
})
```

**事件数据：**
```typescript
{
  hash: string        // 提交哈希
  message: string     // 提交消息
  author_name: string // 作者姓名
  author_email: string // 作者邮箱
  date: string        // 提交时间
}
```

#### push 事件

当推送操作完成时触发。

```typescript
git.repository.on('push', (event, data) => {
  console.log('推送完成:', data)
})
```

#### pull 事件

当拉取操作完成时触发。

```typescript
git.repository.on('pull', (event, data) => {
  console.log('拉取完成:', data)
})
```

### 分支事件

#### checkout 事件

当分支切换完成时触发。

```typescript
git.branch.on('checkout', (event, data) => {
  console.log('分支切换:', data)
})
```

**事件数据：**
```typescript
{
  from: string  // 原分支名
  to: string    // 目标分支名
}
```

#### create 事件

当分支创建完成时触发。

```typescript
git.branch.on('create', (event, data) => {
  console.log('分支创建:', data)
})
```

#### delete 事件

当分支删除完成时触发。

```typescript
git.branch.on('delete', (event, data) => {
  console.log('分支删除:', data)
})
```

#### merge 事件

当分支合并完成时触发。

```typescript
git.branch.on('merge', (event, data) => {
  console.log('分支合并:', data)
})
```

### 状态事件

#### status 事件

当状态查询完成时触发。

```typescript
git.status.on('status', (event, data) => {
  console.log('状态查询:', data)
})
```

### 远程事件

#### remote-add 事件

当添加远程仓库时触发。

```typescript
git.remote.on('remote-add', (event, data) => {
  console.log('远程仓库添加:', data)
})
```

#### fetch 事件

当获取远程分支时触发。

```typescript
git.remote.on('fetch', (event, data) => {
  console.log('远程获取:', data)
})
```

### 错误事件

#### error 事件

当操作发生错误时触发。

```typescript
git.repository.on('error', (event, error) => {
  console.error('操作错误:', error)
})
```

## 事件监听

### 基础监听

```typescript
import { Git } from '@ldesign/git'

const git = Git.create('./my-project')

// 监听提交事件
git.repository.on('commit', (event, data) => {
  console.log(`新提交: ${data.hash} - ${data.message}`)
})

// 监听分支切换
git.branch.on('checkout', (event, data) => {
  console.log(`分支切换: ${data.from} -> ${data.to}`)
})

// 监听错误
git.repository.on('error', (event, error) => {
  console.error('Git 操作错误:', error.message)
})
```

### 一次性监听

使用 `once` 方法只监听一次事件：

```typescript
git.repository.once('commit', (event, data) => {
  console.log('第一次提交完成:', data)
})
```

### 移除监听器

```typescript
// 定义监听器函数
const commitListener = (event, data) => {
  console.log('提交:', data)
}

// 添加监听器
git.repository.on('commit', commitListener)

// 移除特定监听器
git.repository.off('commit', commitListener)

// 移除所有监听器
git.repository.removeAllListeners('commit')
```

### 监听所有事件

使用通配符监听所有事件：

```typescript
git.repository.on('*', (event, data) => {
  console.log(`事件: ${event}`, data)
})
```

## 实际应用示例

### 日志记录系统

```typescript
import { Git } from '@ldesign/git'
import fs from 'fs/promises'

class GitLogger {
  private logFile: string

  constructor(logFile: string) {
    this.logFile = logFile
  }

  async log(message: string) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}\n`
    await fs.appendFile(this.logFile, logEntry)
  }

  setupLogging(git: Git) {
    // 监听提交事件
    git.repository.on('commit', async (event, data) => {
      await this.log(`COMMIT: ${data.hash} - ${data.message}`)
    })

    // 监听分支操作
    git.branch.on('checkout', async (event, data) => {
      await this.log(`CHECKOUT: ${data.from} -> ${data.to}`)
    })

    git.branch.on('create', async (event, data) => {
      await this.log(`BRANCH_CREATE: ${data.name}`)
    })

    git.branch.on('delete', async (event, data) => {
      await this.log(`BRANCH_DELETE: ${data.name}`)
    })

    // 监听远程操作
    git.repository.on('push', async (event, data) => {
      await this.log(`PUSH: ${data.remote}/${data.branch}`)
    })

    git.repository.on('pull', async (event, data) => {
      await this.log(`PULL: ${data.remote}/${data.branch}`)
    })

    // 监听错误
    git.repository.on('error', async (event, error) => {
      await this.log(`ERROR: ${error.message}`)
    })
  }
}

// 使用示例
const git = Git.create('./my-project')
const logger = new GitLogger('./git-operations.log')
logger.setupLogging(git)
```

### 通知系统

```typescript
import { Git } from '@ldesign/git'

class GitNotifier {
  private webhookUrl: string

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  async sendNotification(message: string) {
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      })
    } catch (error) {
      console.error('发送通知失败:', error)
    }
  }

  setupNotifications(git: Git) {
    // 提交通知
    git.repository.on('commit', async (event, data) => {
      const message = `🎉 新提交: ${data.message}\n作者: ${data.author_name}\n哈希: ${data.hash}`
      await this.sendNotification(message)
    })

    // 分支操作通知
    git.branch.on('create', async (event, data) => {
      await this.sendNotification(`🌿 创建分支: ${data.name}`)
    })

    git.branch.on('merge', async (event, data) => {
      await this.sendNotification(`🔀 合并分支: ${data.source} -> ${data.target}`)
    })

    // 错误通知
    git.repository.on('error', async (event, error) => {
      await this.sendNotification(`❌ Git 操作错误: ${error.message}`)
    })
  }
}
```

### 统计收集

```typescript
import { Git } from '@ldesign/git'

class GitStatistics {
  private stats = {
    commits: 0,
    branches: { created: 0, deleted: 0, merged: 0 },
    pushes: 0,
    pulls: 0,
    errors: 0
  }

  setupStatistics(git: Git) {
    git.repository.on('commit', () => {
      this.stats.commits++
      this.printStats()
    })

    git.branch.on('create', () => {
      this.stats.branches.created++
      this.printStats()
    })

    git.branch.on('delete', () => {
      this.stats.branches.deleted++
      this.printStats()
    })

    git.branch.on('merge', () => {
      this.stats.branches.merged++
      this.printStats()
    })

    git.repository.on('push', () => {
      this.stats.pushes++
      this.printStats()
    })

    git.repository.on('pull', () => {
      this.stats.pulls++
      this.printStats()
    })

    git.repository.on('error', () => {
      this.stats.errors++
      this.printStats()
    })
  }

  printStats() {
    console.log('📊 Git 操作统计:')
    console.log(`  提交: ${this.stats.commits}`)
    console.log(`  分支创建: ${this.stats.branches.created}`)
    console.log(`  分支删除: ${this.stats.branches.deleted}`)
    console.log(`  分支合并: ${this.stats.branches.merged}`)
    console.log(`  推送: ${this.stats.pushes}`)
    console.log(`  拉取: ${this.stats.pulls}`)
    console.log(`  错误: ${this.stats.errors}`)
  }

  getStats() {
    return { ...this.stats }
  }
}
```

### 自动化工作流

```typescript
import { Git } from '@ldesign/git'

class AutomatedWorkflow {
  private git: Git

  constructor(git: Git) {
    this.git = git
    this.setupWorkflow()
  }

  setupWorkflow() {
    // 自动推送主分支的提交
    this.git.repository.on('commit', async (event, data) => {
      const status = await this.git.getStatus()
      if (status.success && status.data?.current === 'main') {
        console.log('主分支提交，自动推送...')
        await this.git.push('origin', 'main')
      }
    })

    // 自动删除已合并的功能分支
    this.git.branch.on('merge', async (event, data) => {
      if (data.source.startsWith('feature/')) {
        console.log(`删除已合并的功能分支: ${data.source}`)
        await this.git.branch.delete(data.source)
      }
    })

    // 自动创建备份标签
    this.git.repository.on('push', async (event, data) => {
      if (data.branch === 'main') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const tagName = `backup-${timestamp}`
        console.log(`创建备份标签: ${tagName}`)
        // 这里需要标签功能的实现
      }
    })
  }
}
```

## 调试和开发

### 事件调试

```typescript
// 启用事件调试
const git = Git.create('./my-project', { debug: true })

// 监听所有事件进行调试
git.repository.on('*', (event, data) => {
  console.log(`[DEBUG] 事件: ${event}`, data)
})

git.branch.on('*', (event, data) => {
  console.log(`[DEBUG] 分支事件: ${event}`, data)
})

git.status.on('*', (event, data) => {
  console.log(`[DEBUG] 状态事件: ${event}`, data)
})

git.remote.on('*', (event, data) => {
  console.log(`[DEBUG] 远程事件: ${event}`, data)
})
```

### 性能监控

```typescript
class PerformanceMonitor {
  private operations = new Map<string, number>()

  setupMonitoring(git: Git) {
    const startTime = (operation: string) => {
      this.operations.set(operation, Date.now())
    }

    const endTime = (operation: string) => {
      const start = this.operations.get(operation)
      if (start) {
        const duration = Date.now() - start
        console.log(`⏱️ ${operation} 耗时: ${duration}ms`)
        this.operations.delete(operation)
      }
    }

    // 监控提交性能
    git.repository.on('commit-start', () => startTime('commit'))
    git.repository.on('commit', () => endTime('commit'))

    // 监控推送性能
    git.repository.on('push-start', () => startTime('push'))
    git.repository.on('push', () => endTime('push'))
  }
}
```

## 最佳实践

1. **错误处理** - 始终监听错误事件
2. **资源清理** - 在不需要时移除事件监听器
3. **异步操作** - 事件处理器中的异步操作要正确处理
4. **性能考虑** - 避免在事件处理器中执行耗时操作
5. **调试友好** - 使用有意义的日志和调试信息

## 下一步

- 了解 [错误处理](/guide/error-handling) 的最佳实践
- 查看 [配置选项](/guide/configuration) 进行高级配置
- 学习 [API 参考](/api/git) 获取详细接口说明
