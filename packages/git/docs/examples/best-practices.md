# 最佳实践

本页面总结了使用 @ldesign/git 的最佳实践和开发建议。

## 代码组织

### 1. 统一的 Git 实例管理

```typescript
// ✅ 推荐：创建单例 Git 管理器
class GitManager {
  private static instance: Git
  
  static getInstance(repoPath?: string): Git {
    if (!GitManager.instance) {
      GitManager.instance = Git.create(repoPath || process.cwd())
    }
    return GitManager.instance
  }
  
  static async initialize(repoPath?: string): Promise<Git> {
    const git = GitManager.getInstance(repoPath)
    
    // 验证仓库
    const isRepo = await git.isRepo()
    if (!isRepo) {
      throw new Error('不是有效的 Git 仓库')
    }
    
    return git
  }
}

// 使用
const git = await GitManager.initialize('./my-project')
```

### 2. 配置管理

```typescript
// ✅ 推荐：集中配置管理
interface GitConfig {
  repoPath: string
  timeout: number
  debug: boolean
  mainBranch: string
  developBranch: string
  remotes: {
    origin: string
    upstream?: string
  }
}

class GitConfigManager {
  private config: GitConfig
  
  constructor(config: Partial<GitConfig> = {}) {
    this.config = {
      repoPath: process.cwd(),
      timeout: 30000,
      debug: process.env.NODE_ENV === 'development',
      mainBranch: 'main',
      developBranch: 'develop',
      remotes: {
        origin: ''
      },
      ...config
    }
  }
  
  createGit(): Git {
    return Git.create(this.config.repoPath, {
      timeout: this.config.timeout,
      debug: this.config.debug
    })
  }
  
  getConfig(): GitConfig {
    return { ...this.config }
  }
}
```

## 错误处理

### 1. 分层错误处理

```typescript
// ✅ 推荐：分层错误处理策略
class GitErrorHandler {
  static async safeExecute<T>(
    operation: () => Promise<T>,
    context: string,
    fallback?: () => Promise<T>
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      // 记录错误
      console.error(`Git 操作失败 [${context}]:`, error.message)
      
      // 尝试恢复
      if (fallback) {
        try {
          console.log(`尝试恢复操作 [${context}]...`)
          return await fallback()
        } catch (fallbackError) {
          console.error(`恢复操作失败 [${context}]:`, fallbackError.message)
        }
      }
      
      // 根据错误类型决定是否重新抛出
      if (error instanceof GitError) {
        switch (error.type) {
          case GitErrorType.NETWORK_ERROR:
          case GitErrorType.TIMEOUT:
            // 网络相关错误可以重试
            throw error
          default:
            // 其他错误返回 null
            return null
        }
      }
      
      throw error
    }
  }
}

// 使用示例
const result = await GitErrorHandler.safeExecute(
  () => git.push('origin', 'main'),
  'push-to-origin',
  () => git.pull('origin', 'main').then(() => git.push('origin', 'main'))
)
```

### 2. 操作验证

```typescript
// ✅ 推荐：操作前验证
class GitValidator {
  static async validateRepository(git: Git): Promise<void> {
    const isRepo = await git.isRepo()
    if (!isRepo) {
      throw new Error('当前目录不是 Git 仓库')
    }
  }
  
  static async validateCleanWorkingDirectory(git: Git): Promise<void> {
    const isClean = await git.status.isClean()
    if (!isClean) {
      throw new Error('工作目录不干净，请先提交或暂存更改')
    }
  }
  
  static async validateBranchExists(git: Git, branchName: string): Promise<void> {
    const branches = await git.listBranches()
    const branchExists = branches.data?.some(b => b.name === branchName)
    if (!branchExists) {
      throw new Error(`分支 ${branchName} 不存在`)
    }
  }
  
  static async validateRemoteExists(git: Git, remoteName: string): Promise<void> {
    const remotes = await git.listRemotes()
    const remoteExists = remotes.data?.some(r => r.name === remoteName)
    if (!remoteExists) {
      throw new Error(`远程仓库 ${remoteName} 不存在`)
    }
  }
}

// 使用示例
async function safePush(git: Git, remote: string, branch: string) {
  await GitValidator.validateRepository(git)
  await GitValidator.validateCleanWorkingDirectory(git)
  await GitValidator.validateRemoteExists(git, remote)
  
  return await git.push(remote, branch)
}
```

## 性能优化

### 1. 批量操作

```typescript
// ✅ 推荐：批量处理多个操作
class GitBatchOperations {
  private git: Git
  private operations: Array<() => Promise<any>> = []
  
  constructor(git: Git) {
    this.git = git
  }
  
  addOperation(operation: () => Promise<any>): this {
    this.operations.push(operation)
    return this
  }
  
  async execute(concurrency = 3): Promise<any[]> {
    const results: any[] = []
    
    // 分批执行，避免过多并发
    for (let i = 0; i < this.operations.length; i += concurrency) {
      const batch = this.operations.slice(i, i + concurrency)
      const batchResults = await Promise.allSettled(
        batch.map(op => op())
      )
      results.push(...batchResults)
    }
    
    return results
  }
  
  clear(): this {
    this.operations = []
    return this
  }
}

// 使用示例
const batch = new GitBatchOperations(git)
  .addOperation(() => git.getStatus())
  .addOperation(() => git.getLog(10))
  .addOperation(() => git.listBranches())

const results = await batch.execute()
```

### 2. 缓存策略

```typescript
// ✅ 推荐：实现智能缓存
class GitCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl = 60000
  ): Promise<T> {
    const cached = this.get(key)
    if (cached) return cached
    
    const data = await factory()
    this.set(key, data, ttl)
    return data
  }
  
  clear(): void {
    this.cache.clear()
  }
}

class CachedGitOperations {
  private git: Git
  private cache = new GitCache()
  
  constructor(git: Git) {
    this.git = git
  }
  
  async getStatus(useCache = true): Promise<any> {
    if (!useCache) {
      return await this.git.getStatus()
    }
    
    return await this.cache.getOrSet(
      'status',
      () => this.git.getStatus(),
      5000 // 5 秒缓存
    )
  }
  
  async getLog(maxCount = 10, useCache = true): Promise<any> {
    if (!useCache) {
      return await this.git.getLog(maxCount)
    }
    
    return await this.cache.getOrSet(
      `log-${maxCount}`,
      () => this.git.getLog(maxCount),
      30000 // 30 秒缓存
    )
  }
}
```

## 安全实践

### 1. 凭据管理

```typescript
// ✅ 推荐：安全的凭据管理
class GitCredentialManager {
  private static readonly CREDENTIAL_SOURCES = [
    'environment',
    'git-credential-helper',
    'ssh-agent'
  ]
  
  static async getCredentials(repoUrl: string): Promise<any> {
    // 优先使用环境变量
    if (process.env.GIT_TOKEN) {
      return {
        type: 'token',
        token: process.env.GIT_TOKEN
      }
    }
    
    // 检查 SSH 密钥
    if (repoUrl.startsWith('git@')) {
      return {
        type: 'ssh',
        keyPath: process.env.SSH_KEY_PATH || '~/.ssh/id_rsa'
      }
    }
    
    // 使用 Git 凭据助手
    return {
      type: 'credential-helper'
    }
  }
  
  static sanitizeUrl(url: string): string {
    // 移除 URL 中的敏感信息
    return url.replace(/:\/\/[^@]+@/, '://')
  }
}
```

### 2. 输入验证

```typescript
// ✅ 推荐：严格的输入验证
class GitInputValidator {
  static validateBranchName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error('分支名称必须是非空字符串')
    }
    
    // Git 分支名称规则
    const invalidChars = /[~^:?*[\]\\]/
    if (invalidChars.test(name)) {
      throw new Error('分支名称包含无效字符')
    }
    
    if (name.startsWith('.') || name.endsWith('.')) {
      throw new Error('分支名称不能以点开头或结尾')
    }
    
    if (name.includes('..')) {
      throw new Error('分支名称不能包含连续的点')
    }
  }
  
  static validateCommitMessage(message: string): void {
    if (!message || typeof message !== 'string') {
      throw new Error('提交消息必须是非空字符串')
    }
    
    if (message.length > 72) {
      console.warn('提交消息过长，建议控制在 72 个字符以内')
    }
    
    // 检查是否符合 Conventional Commits 规范
    const conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+/
    if (!conventionalPattern.test(message)) {
      console.warn('提交消息不符合 Conventional Commits 规范')
    }
  }
  
  static validateRemoteUrl(url: string): void {
    if (!url || typeof url !== 'string') {
      throw new Error('远程 URL 必须是非空字符串')
    }
    
    const validProtocols = ['https://', 'git@', 'ssh://']
    const isValid = validProtocols.some(protocol => url.startsWith(protocol))
    
    if (!isValid) {
      throw new Error('远程 URL 格式无效')
    }
  }
}
```

## 测试策略

### 1. 单元测试

```typescript
// ✅ 推荐：全面的单元测试
describe('GitManager', () => {
  let git: Git
  let tempDir: string
  
  beforeEach(async () => {
    // 创建临时测试目录
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'git-test-'))
    git = Git.create(tempDir)
    
    // 初始化测试仓库
    await git.init()
    
    // 配置测试用户
    await execAsync('git config user.name "Test User"', { cwd: tempDir })
    await execAsync('git config user.email "test@example.com"', { cwd: tempDir })
  })
  
  afterEach(async () => {
    // 清理临时目录
    await fs.rm(tempDir, { recursive: true, force: true })
  })
  
  test('应该能够创建和切换分支', async () => {
    // 创建测试文件
    await fs.writeFile(path.join(tempDir, 'test.txt'), 'test content')
    await git.add('test.txt')
    await git.commit('Initial commit')
    
    // 创建分支
    await git.createBranch('test-branch')
    await git.checkoutBranch('test-branch')
    
    // 验证当前分支
    const status = await git.getStatus()
    expect(status.data?.current).toBe('test-branch')
  })
  
  test('应该正确处理合并冲突', async () => {
    // 设置冲突场景
    // ... 测试代码
  })
})
```

### 2. 集成测试

```typescript
// ✅ 推荐：端到端集成测试
describe('Git 工作流集成测试', () => {
  test('完整的功能开发工作流', async () => {
    const git = Git.create('./test-repo')
    
    // 1. 初始化
    await git.init()
    
    // 2. 创建初始提交
    await fs.writeFile('./test-repo/README.md', '# Test Project')
    await git.add('README.md')
    await git.commit('Initial commit')
    
    // 3. 创建功能分支
    await git.createBranch('feature/test')
    await git.checkoutBranch('feature/test')
    
    // 4. 开发功能
    await fs.writeFile('./test-repo/feature.js', 'console.log("feature")')
    await git.add('feature.js')
    await git.commit('Add feature')
    
    // 5. 合并到主分支
    await git.checkoutBranch('main')
    await git.branch.merge('feature/test')
    
    // 6. 验证结果
    const log = await git.getLog(2)
    expect(log.data).toHaveLength(2)
    expect(log.data?.[0]?.message).toContain('Merge')
  })
})
```

## 监控和日志

### 1. 操作日志

```typescript
// ✅ 推荐：详细的操作日志
class GitLogger {
  private logger: any // 使用您喜欢的日志库
  
  constructor(logger: any) {
    this.logger = logger
  }
  
  logOperation(operation: string, params: any, result: any, duration: number): void {
    this.logger.info('Git 操作', {
      operation,
      params: this.sanitizeParams(params),
      success: result.success,
      duration,
      timestamp: new Date().toISOString()
    })
    
    if (!result.success) {
      this.logger.error('Git 操作失败', {
        operation,
        error: result.error,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  private sanitizeParams(params: any): any {
    // 移除敏感信息
    const sanitized = { ...params }
    if (sanitized.url) {
      sanitized.url = GitCredentialManager.sanitizeUrl(sanitized.url)
    }
    return sanitized
  }
}
```

### 2. 性能监控

```typescript
// ✅ 推荐：性能监控装饰器
function measurePerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value
  
  descriptor.value = async function (...args: any[]) {
    const start = Date.now()
    
    try {
      const result = await method.apply(this, args)
      const duration = Date.now() - start
      
      console.log(`Git 操作 ${propertyName} 耗时: ${duration}ms`)
      
      // 记录到监控系统
      if (duration > 5000) {
        console.warn(`Git 操作 ${propertyName} 耗时过长: ${duration}ms`)
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      console.error(`Git 操作 ${propertyName} 失败 (${duration}ms):`, error.message)
      throw error
    }
  }
}

class MonitoredGit {
  private git: Git
  
  constructor(git: Git) {
    this.git = git
  }
  
  @measurePerformance
  async commit(message: string): Promise<any> {
    return await this.git.commit(message)
  }
  
  @measurePerformance
  async push(remote: string, branch: string): Promise<any> {
    return await this.git.push(remote, branch)
  }
}
```

## 部署和运维

### 1. 健康检查

```typescript
// ✅ 推荐：Git 健康检查
class GitHealthChecker {
  private git: Git
  
  constructor(git: Git) {
    this.git = git
  }
  
  async checkHealth(): Promise<{
    healthy: boolean
    checks: Record<string, boolean>
    details: Record<string, any>
  }> {
    const checks = {
      isRepository: false,
      hasRemotes: false,
      canConnect: false,
      workingDirectoryClean: false
    }
    
    const details: Record<string, any> = {}
    
    try {
      // 检查是否为仓库
      checks.isRepository = await this.git.isRepo()
      
      if (checks.isRepository) {
        // 检查远程仓库
        const remotes = await this.git.listRemotes()
        checks.hasRemotes = (remotes.data?.length || 0) > 0
        details.remotes = remotes.data?.map(r => r.name)
        
        // 检查工作目录
        checks.workingDirectoryClean = await this.git.status.isClean()
        
        // 检查连接性（如果有远程仓库）
        if (checks.hasRemotes) {
          try {
            await this.git.remote.fetch('origin')
            checks.canConnect = true
          } catch {
            checks.canConnect = false
          }
        }
        
        // 获取状态信息
        const status = await this.git.getStatus()
        details.status = {
          branch: status.data?.current,
          ahead: status.data?.ahead,
          behind: status.data?.behind
        }
      }
      
    } catch (error) {
      details.error = error.message
    }
    
    const healthy = Object.values(checks).every(check => check)
    
    return { healthy, checks, details }
  }
}
```

### 2. 配置验证

```typescript
// ✅ 推荐：部署前配置验证
class GitDeploymentValidator {
  static async validateDeploymentEnvironment(): Promise<void> {
    const requiredEnvVars = [
      'GIT_USER_NAME',
      'GIT_USER_EMAIL',
      'GIT_REMOTE_URL'
    ]
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`缺少必需的环境变量: ${envVar}`)
      }
    }
    
    // 验证 Git 配置
    try {
      await execAsync('git --version')
    } catch {
      throw new Error('Git 未安装或不可用')
    }
    
    // 验证网络连接
    if (process.env.GIT_REMOTE_URL) {
      try {
        const url = new URL(process.env.GIT_REMOTE_URL)
        // 可以添加更多连接性检查
      } catch {
        throw new Error('Git 远程 URL 格式无效')
      }
    }
  }
}
```

## 总结

遵循这些最佳实践可以帮助您：

1. **提高代码质量** - 通过验证、错误处理和测试
2. **增强安全性** - 通过凭据管理和输入验证
3. **优化性能** - 通过缓存和批量操作
4. **简化维护** - 通过监控和健康检查
5. **确保可靠性** - 通过全面的测试和错误恢复

记住，最佳实践应该根据您的具体需求进行调整，但这些原则可以作为良好的起点。

## 下一步

- 查看 [API 参考](/api/git) 获取详细的方法说明
- 了解 [配置选项](/guide/configuration) 进行高级配置
- 学习 [错误处理](/guide/error-handling) 的详细策略
