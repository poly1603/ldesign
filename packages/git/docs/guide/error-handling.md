# 错误处理

@ldesign/git 提供了完善的错误处理机制，帮助您优雅地处理各种 Git 操作中可能出现的问题。

## 错误类型

### GitError 基类

所有 Git 相关的错误都继承自 `GitError` 类：

```typescript
import { GitError, GitErrorType } from '@ldesign/git'

try {
  await git.commit('Test commit')
} catch (error) {
  if (error instanceof GitError) {
    console.log('错误类型:', error.type)
    console.log('错误消息:', error.message)
    console.log('格式化消息:', error.getFormattedMessage())
  }
}
```

### 错误类型枚举

```typescript
enum GitErrorType {
  REPOSITORY_NOT_FOUND = 'REPOSITORY_NOT_FOUND',
  COMMIT_FAILED = 'COMMIT_FAILED',
  PUSH_FAILED = 'PUSH_FAILED',
  PULL_FAILED = 'PULL_FAILED',
  BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND',
  BRANCH_ALREADY_EXISTS = 'BRANCH_ALREADY_EXISTS',
  MERGE_CONFLICT = 'MERGE_CONFLICT',
  REMOTE_NOT_FOUND = 'REMOTE_NOT_FOUND',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_OPERATION = 'INVALID_OPERATION',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}
```

## 错误处理策略

### 1. 基础错误处理

```typescript
import { Git, GitError, GitErrorType } from '@ldesign/git'

async function basicErrorHandling() {
  const git = Git.create('./my-project')
  
  try {
    await git.commit('My commit message')
    console.log('✅ 提交成功')
  } catch (error) {
    if (error instanceof GitError) {
      console.error('❌ Git 操作失败:', error.message)
      console.error('错误类型:', error.type)
    } else {
      console.error('❌ 未知错误:', error.message)
    }
  }
}
```

### 2. 分类错误处理

```typescript
async function categorizedErrorHandling() {
  const git = Git.create('./my-project')
  
  try {
    await git.push('origin', 'main')
  } catch (error) {
    if (error instanceof GitError) {
      switch (error.type) {
        case GitErrorType.AUTHENTICATION_FAILED:
          console.error('🔐 认证失败，请检查凭据')
          // 提示用户重新登录或配置凭据
          break
          
        case GitErrorType.NETWORK_ERROR:
          console.error('🌐 网络错误，请检查网络连接')
          // 可以实现重试机制
          break
          
        case GitErrorType.PUSH_FAILED:
          console.error('📤 推送失败，可能需要先拉取远程更改')
          // 建议用户先执行 pull 操作
          break
          
        case GitErrorType.REMOTE_NOT_FOUND:
          console.error('🔍 远程仓库不存在，请检查配置')
          // 提示用户配置远程仓库
          break
          
        default:
          console.error('❌ 其他错误:', error.message)
      }
    }
  }
}
```

### 3. 操作结果检查

除了异常处理，还可以检查操作结果：

```typescript
async function resultBasedHandling() {
  const git = Git.create('./my-project')
  
  // 检查操作结果
  const result = await git.commit('Test commit')
  
  if (!result.success) {
    console.error('提交失败:', result.error)
    
    // 根据错误信息进行处理
    if (result.error?.includes('nothing to commit')) {
      console.log('没有需要提交的更改')
    } else if (result.error?.includes('not a git repository')) {
      console.log('请先初始化 Git 仓库')
      await git.init()
    }
    
    return
  }
  
  console.log('提交成功:', result.data)
}
```

## 重试机制

### 自动重试

```typescript
class GitRetryHandler {
  private maxRetries: number
  private retryDelay: number

  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries
    this.retryDelay = retryDelay
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    retryableErrors: GitErrorType[] = [
      GitErrorType.NETWORK_ERROR,
      GitErrorType.TIMEOUT
    ]
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (error instanceof GitError && retryableErrors.includes(error.type)) {
          console.log(`尝试 ${attempt}/${this.maxRetries} 失败，${this.retryDelay}ms 后重试...`)
          
          if (attempt < this.maxRetries) {
            await this.delay(this.retryDelay)
            continue
          }
        }
        
        throw error
      }
    }
    
    throw lastError!
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 使用示例
async function retryExample() {
  const git = Git.create('./my-project')
  const retryHandler = new GitRetryHandler(3, 2000)
  
  try {
    await retryHandler.withRetry(async () => {
      return await git.push('origin', 'main')
    })
    console.log('✅ 推送成功')
  } catch (error) {
    console.error('❌ 推送失败，已达到最大重试次数')
  }
}
```

### 指数退避重试

```typescript
class ExponentialBackoffRetry {
  async withExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 5,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (error instanceof GitError && this.isRetryable(error)) {
          const delay = baseDelay * Math.pow(2, attempt - 1)
          console.log(`尝试 ${attempt}/${maxRetries} 失败，${delay}ms 后重试...`)
          
          if (attempt < maxRetries) {
            await this.delay(delay)
            continue
          }
        }
        
        throw error
      }
    }
    
    throw lastError!
  }

  private isRetryable(error: GitError): boolean {
    return [
      GitErrorType.NETWORK_ERROR,
      GitErrorType.TIMEOUT,
      GitErrorType.PUSH_FAILED  // 可能是临时的推送冲突
    ].includes(error.type)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

## 错误恢复

### 自动恢复策略

```typescript
class GitErrorRecovery {
  private git: Git

  constructor(git: Git) {
    this.git = git
  }

  async recoverFromError(error: GitError): Promise<boolean> {
    switch (error.type) {
      case GitErrorType.REPOSITORY_NOT_FOUND:
        return await this.initializeRepository()
        
      case GitErrorType.BRANCH_NOT_FOUND:
        return await this.createMissingBranch()
        
      case GitErrorType.MERGE_CONFLICT:
        return await this.handleMergeConflict()
        
      case GitErrorType.PUSH_FAILED:
        return await this.handlePushFailure()
        
      default:
        return false
    }
  }

  private async initializeRepository(): Promise<boolean> {
    try {
      console.log('🔧 自动初始化 Git 仓库...')
      await this.git.init()
      return true
    } catch (error) {
      console.error('初始化失败:', error)
      return false
    }
  }

  private async createMissingBranch(): Promise<boolean> {
    try {
      console.log('🌿 创建缺失的分支...')
      await this.git.createBranch('main')
      return true
    } catch (error) {
      console.error('创建分支失败:', error)
      return false
    }
  }

  private async handleMergeConflict(): Promise<boolean> {
    try {
      console.log('🔀 处理合并冲突...')
      // 这里可以实现自动解决冲突的逻辑
      // 或者提示用户手动解决
      console.log('请手动解决合并冲突后重试')
      return false
    } catch (error) {
      return false
    }
  }

  private async handlePushFailure(): Promise<boolean> {
    try {
      console.log('📥 尝试先拉取远程更改...')
      await this.git.pull('origin', 'main')
      console.log('📤 重新推送...')
      await this.git.push('origin', 'main')
      return true
    } catch (error) {
      console.error('推送恢复失败:', error)
      return false
    }
  }
}
```

## 错误监控和日志

### 错误日志记录

```typescript
import fs from 'fs/promises'

class GitErrorLogger {
  private logFile: string

  constructor(logFile: string) {
    this.logFile = logFile
  }

  async logError(error: GitError, context?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      type: error.type,
      message: error.message,
      stack: error.stack,
      context
    }

    try {
      const logLine = JSON.stringify(logEntry) + '\n'
      await fs.appendFile(this.logFile, logLine)
    } catch (writeError) {
      console.error('写入错误日志失败:', writeError)
    }
  }

  async getErrorStats(): Promise<Record<string, number>> {
    try {
      const content = await fs.readFile(this.logFile, 'utf-8')
      const lines = content.trim().split('\n').filter(line => line)
      const stats: Record<string, number> = {}

      for (const line of lines) {
        try {
          const entry = JSON.parse(line)
          stats[entry.type] = (stats[entry.type] || 0) + 1
        } catch (parseError) {
          // 忽略解析错误的行
        }
      }

      return stats
    } catch (error) {
      return {}
    }
  }
}
```

### 错误监控集成

```typescript
class GitErrorMonitor {
  private logger: GitErrorLogger
  private alertThreshold: number

  constructor(logFile: string, alertThreshold = 10) {
    this.logger = new GitErrorLogger(logFile)
    this.alertThreshold = alertThreshold
  }

  async monitorOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof GitError) {
        await this.logger.logError(error, { operation: operationName })
        await this.checkAlertThreshold(error.type)
      }
      throw error
    }
  }

  private async checkAlertThreshold(errorType: GitErrorType) {
    const stats = await this.logger.getErrorStats()
    const count = stats[errorType] || 0

    if (count >= this.alertThreshold) {
      await this.sendAlert(errorType, count)
    }
  }

  private async sendAlert(errorType: GitErrorType, count: number) {
    console.warn(`🚨 警告: ${errorType} 错误已发生 ${count} 次`)
    // 这里可以集成外部告警系统
  }
}
```

## 用户友好的错误处理

### 错误消息本地化

```typescript
const errorMessages = {
  [GitErrorType.REPOSITORY_NOT_FOUND]: {
    zh: '未找到 Git 仓库，请先运行 git init 初始化仓库',
    en: 'Git repository not found, please run git init first'
  },
  [GitErrorType.COMMIT_FAILED]: {
    zh: '提交失败，请确保有文件在暂存区',
    en: 'Commit failed, please ensure files are staged'
  },
  [GitErrorType.AUTHENTICATION_FAILED]: {
    zh: '认证失败，请检查用户名和密码',
    en: 'Authentication failed, please check credentials'
  }
}

function getLocalizedErrorMessage(errorType: GitErrorType, locale = 'zh'): string {
  return errorMessages[errorType]?.[locale] || errorMessages[errorType]?.en || '未知错误'
}
```

### 错误处理助手

```typescript
class GitErrorHelper {
  static getHelpMessage(error: GitError): string {
    switch (error.type) {
      case GitErrorType.REPOSITORY_NOT_FOUND:
        return '💡 建议: 运行 `git init` 初始化仓库'
        
      case GitErrorType.COMMIT_FAILED:
        return '💡 建议: 运行 `git add .` 添加文件到暂存区'
        
      case GitErrorType.PUSH_FAILED:
        return '💡 建议: 运行 `git pull` 拉取远程更改后重试'
        
      case GitErrorType.AUTHENTICATION_FAILED:
        return '💡 建议: 检查 Git 凭据配置或使用 SSH 密钥'
        
      case GitErrorType.NETWORK_ERROR:
        return '💡 建议: 检查网络连接和代理设置'
        
      default:
        return '💡 建议: 查看详细错误信息或联系技术支持'
    }
  }

  static getSolutionSteps(error: GitError): string[] {
    switch (error.type) {
      case GitErrorType.REPOSITORY_NOT_FOUND:
        return [
          '1. 确认当前目录是否正确',
          '2. 运行 git init 初始化仓库',
          '3. 或者 cd 到正确的仓库目录'
        ]
        
      case GitErrorType.COMMIT_FAILED:
        return [
          '1. 运行 git status 查看文件状态',
          '2. 运行 git add . 添加所有文件',
          '3. 或者 git add <文件名> 添加特定文件',
          '4. 重新运行 git commit'
        ]
        
      default:
        return ['查看错误详情并根据提示操作']
    }
  }
}
```

## 最佳实践

### 1. 分层错误处理

```typescript
// 底层：记录详细错误
// 中层：分类处理和恢复
// 顶层：用户友好的错误展示

async function layeredErrorHandling() {
  const git = Git.create('./my-project')
  const errorLogger = new GitErrorLogger('./git-errors.log')
  const errorRecovery = new GitErrorRecovery(git)
  
  try {
    await git.commit('Test commit')
  } catch (error) {
    if (error instanceof GitError) {
      // 底层：记录错误
      await errorLogger.logError(error, { operation: 'commit' })
      
      // 中层：尝试恢复
      const recovered = await errorRecovery.recoverFromError(error)
      if (recovered) {
        console.log('✅ 错误已自动恢复')
        return
      }
      
      // 顶层：用户友好的错误展示
      console.error('❌', getLocalizedErrorMessage(error.type))
      console.log(GitErrorHelper.getHelpMessage(error))
      
      const steps = GitErrorHelper.getSolutionSteps(error)
      console.log('解决步骤:')
      steps.forEach(step => console.log(`  ${step}`))
    }
  }
}
```

### 2. 错误边界

```typescript
class GitOperationBoundary {
  async safeExecute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      console.error('操作失败:', error.message)
      
      if (fallback) {
        try {
          return await fallback()
        } catch (fallbackError) {
          console.error('备用操作也失败:', fallbackError.message)
        }
      }
      
      return null
    }
  }
}
```

### 3. 错误聚合

```typescript
class GitErrorAggregator {
  private errors: GitError[] = []

  addError(error: GitError) {
    this.errors.push(error)
  }

  hasErrors(): boolean {
    return this.errors.length > 0
  }

  getErrorSummary(): string {
    if (this.errors.length === 0) return '无错误'
    
    const errorCounts = this.errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(errorCounts)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ')
  }

  clear() {
    this.errors = []
  }
}
```

## 下一步

- 了解 [事件系统](/guide/events) 监听错误事件
- 查看 [配置选项](/guide/configuration) 进行错误相关配置
- 学习 [API 参考](/api/git) 获取详细的错误信息
