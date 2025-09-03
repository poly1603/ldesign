# 集成示例

本页面展示如何将 @ldesign/git 与其他工具和框架集成。

## 与构建工具集成

### Webpack 集成

```typescript
import { Git } from '@ldesign/git'
import webpack from 'webpack'

class GitWebpackPlugin {
  private git: Git

  constructor(options: { repoPath?: string } = {}) {
    this.git = Git.create(options.repoPath || process.cwd())
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.beforeCompile.tapAsync('GitWebpackPlugin', async (params, callback) => {
      try {
        // 获取 Git 信息
        const status = await this.git.getStatus()
        const log = await this.git.getLog(1)
        
        const gitInfo = {
          branch: status.data?.current,
          commit: log.data?.[0]?.hash,
          isDirty: !(await this.git.status.isClean())
        }
        
        // 将 Git 信息注入到构建中
        compiler.options.plugins?.push(
          new webpack.DefinePlugin({
            __GIT_INFO__: JSON.stringify(gitInfo)
          })
        )
        
        callback()
      } catch (error) {
        callback(error)
      }
    })
  }
}

// webpack.config.js
module.exports = {
  // ... 其他配置
  plugins: [
    new GitWebpackPlugin({ repoPath: './' })
  ]
}
```

### Vite 集成

```typescript
import { Git } from '@ldesign/git'
import { Plugin } from 'vite'

function gitInfoPlugin(): Plugin {
  return {
    name: 'git-info',
    async configResolved() {
      const git = Git.create(process.cwd())
      
      try {
        const status = await git.getStatus()
        const log = await git.getLog(1)
        
        const gitInfo = {
          branch: status.data?.current,
          commit: log.data?.[0]?.hash?.substring(0, 8),
          timestamp: new Date().toISOString()
        }
        
        // 注入环境变量
        process.env.VITE_GIT_BRANCH = gitInfo.branch || 'unknown'
        process.env.VITE_GIT_COMMIT = gitInfo.commit || 'unknown'
        process.env.VITE_BUILD_TIME = gitInfo.timestamp
        
      } catch (error) {
        console.warn('获取 Git 信息失败:', error.message)
      }
    }
  }
}

// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    gitInfoPlugin()
  ]
})
```

## 与 CI/CD 平台集成

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run Git operations
      run: |
        node -e "
        const { Git } = require('@ldesign/git');
        
        async function deploy() {
          const git = Git.create('.');
          
          // 检查部署条件
          const status = await git.getStatus();
          console.log('Current branch:', status.data?.current);
          
          // 创建部署标签
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          console.log('Deploy timestamp:', timestamp);
          
          // 其他部署逻辑...
        }
        
        deploy().catch(console.error);
        "
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - deploy

variables:
  NODE_VERSION: "18"

before_script:
  - npm install -g pnpm
  - pnpm install

test:
  stage: test
  script:
    - pnpm test
    - node scripts/git-checks.js

deploy:
  stage: deploy
  script:
    - node scripts/deploy.js
  only:
    - main
```

```typescript
// scripts/deploy.js
import { Git } from '@ldesign/git'

async function deploy() {
  const git = Git.create('.')
  
  // 验证部署条件
  const isClean = await git.status.isClean()
  if (!isClean) {
    throw new Error('工作目录不干净，无法部署')
  }
  
  const status = await git.getStatus()
  console.log(`部署分支: ${status.data?.current}`)
  
  // 创建部署记录
  const log = await git.getLog(1)
  const deployInfo = {
    commit: log.data?.[0]?.hash,
    message: log.data?.[0]?.message,
    author: log.data?.[0]?.author_name,
    timestamp: new Date().toISOString()
  }
  
  console.log('部署信息:', deployInfo)
  
  // 执行部署逻辑...
}

deploy().catch(error => {
  console.error('部署失败:', error)
  process.exit(1)
})
```

## 与测试框架集成

### Jest 集成

```typescript
// jest.setup.js
import { Git } from '@ldesign/git'

// 全局 Git 实例
global.git = Git.create(process.cwd())

// 测试前的 Git 状态检查
beforeAll(async () => {
  const isRepo = await global.git.isRepo()
  if (!isRepo) {
    console.warn('当前目录不是 Git 仓库，某些测试可能会失败')
  }
})
```

```typescript
// __tests__/git.test.ts
describe('Git 操作测试', () => {
  test('应该能够获取仓库状态', async () => {
    const status = await global.git.getStatus()
    expect(status.success).toBe(true)
    expect(status.data).toHaveProperty('current')
  })
  
  test('应该能够获取提交历史', async () => {
    const log = await global.git.getLog(5)
    expect(log.success).toBe(true)
    expect(Array.isArray(log.data)).toBe(true)
  })
})
```

### Vitest 集成

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { Git } from '@ldesign/git'

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.ts'],
    globals: true
  }
})
```

```typescript
// test/setup.ts
import { Git } from '@ldesign/git'

declare global {
  var git: Git
}

global.git = Git.create(process.cwd())

// 测试环境的 Git 配置
beforeAll(async () => {
  const git = global.git
  
  // 确保测试环境有基本的 Git 配置
  try {
    await git.getStatus()
  } catch (error) {
    console.warn('Git 仓库未初始化，某些测试可能会跳过')
  }
})
```

## 与监控工具集成

### Sentry 集成

```typescript
import * as Sentry from '@sentry/node'
import { Git } from '@ldesign/git'

class GitSentryIntegration {
  private git: Git

  constructor(repoPath: string) {
    this.git = Git.create(repoPath)
  }

  async setupSentry(): Promise<void> {
    try {
      // 获取 Git 信息
      const status = await this.git.getStatus()
      const log = await this.git.getLog(1)
      
      const gitInfo = {
        branch: status.data?.current,
        commit: log.data?.[0]?.hash,
        author: log.data?.[0]?.author_name
      }
      
      // 配置 Sentry
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        release: gitInfo.commit,
        initialScope: {
          tags: {
            git_branch: gitInfo.branch,
            git_commit: gitInfo.commit?.substring(0, 8)
          },
          user: {
            username: gitInfo.author
          }
        }
      })
      
      console.log('Sentry 已配置 Git 信息:', gitInfo)
      
    } catch (error) {
      console.warn('配置 Sentry Git 信息失败:', error.message)
    }
  }

  async captureDeployment(): Promise<void> {
    try {
      const status = await this.git.getStatus()
      const log = await this.git.getLog(1)
      
      // 创建部署事件
      Sentry.addBreadcrumb({
        message: 'Deployment started',
        category: 'deployment',
        data: {
          branch: status.data?.current,
          commit: log.data?.[0]?.hash,
          timestamp: new Date().toISOString()
        }
      })
      
    } catch (error) {
      Sentry.captureException(error)
    }
  }
}
```

### Prometheus 集成

```typescript
import { Git } from '@ldesign/git'
import { register, Gauge, Counter } from 'prom-client'

class GitMetrics {
  private git: Git
  private commitGauge: Gauge<string>
  private deploymentCounter: Counter<string>

  constructor(repoPath: string) {
    this.git = Git.create(repoPath)
    
    this.commitGauge = new Gauge({
      name: 'git_commits_behind_total',
      help: 'Number of commits behind remote',
      labelNames: ['branch', 'remote']
    })
    
    this.deploymentCounter = new Counter({
      name: 'git_deployments_total',
      help: 'Total number of deployments',
      labelNames: ['branch', 'environment']
    })
    
    register.registerMetric(this.commitGauge)
    register.registerMetric(this.deploymentCounter)
  }

  async updateMetrics(): Promise<void> {
    try {
      const status = await this.git.getStatus()
      
      if (status.data) {
        this.commitGauge.set(
          { branch: status.data.current, remote: 'origin' },
          status.data.behind
        )
      }
      
    } catch (error) {
      console.error('更新 Git 指标失败:', error)
    }
  }

  recordDeployment(branch: string, environment: string): void {
    this.deploymentCounter.inc({ branch, environment })
  }

  async startMetricsCollection(): Promise<void> {
    // 每分钟更新一次指标
    setInterval(() => {
      this.updateMetrics()
    }, 60000)
    
    // 立即更新一次
    await this.updateMetrics()
  }
}
```

## 与 Web 框架集成

### Express.js 集成

```typescript
import express from 'express'
import { Git } from '@ldesign/git'

const app = express()
const git = Git.create(process.cwd())

// Git 信息中间件
app.use(async (req, res, next) => {
  try {
    const status = await git.getStatus()
    const log = await git.getLog(1)
    
    req.gitInfo = {
      branch: status.data?.current,
      commit: log.data?.[0]?.hash?.substring(0, 8),
      isDirty: !(await git.status.isClean())
    }
    
    next()
  } catch (error) {
    req.gitInfo = { error: error.message }
    next()
  }
})

// API 端点
app.get('/api/version', (req, res) => {
  res.json({
    version: process.env.npm_package_version,
    git: req.gitInfo,
    timestamp: new Date().toISOString()
  })
})

app.get('/api/health', async (req, res) => {
  try {
    const isRepo = await git.isRepo()
    const status = await git.getStatus()
    
    res.json({
      status: 'healthy',
      git: {
        isRepository: isRepo,
        branch: status.data?.current,
        clean: await git.status.isClean()
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    })
  }
})

app.listen(3000, () => {
  console.log('服务器启动在端口 3000')
})
```

### Next.js 集成

```typescript
// next.config.js
const { Git } = require('@ldesign/git')

module.exports = async (phase) => {
  const git = Git.create(process.cwd())
  
  let gitInfo = {}
  try {
    const status = await git.getStatus()
    const log = await git.getLog(1)
    
    gitInfo = {
      branch: status.data?.current || 'unknown',
      commit: log.data?.[0]?.hash?.substring(0, 8) || 'unknown',
      buildTime: new Date().toISOString()
    }
  } catch (error) {
    console.warn('获取 Git 信息失败:', error.message)
  }
  
  return {
    env: {
      GIT_BRANCH: gitInfo.branch,
      GIT_COMMIT: gitInfo.commit,
      BUILD_TIME: gitInfo.buildTime
    },
    
    async headers() {
      return [
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'X-Git-Branch',
              value: gitInfo.branch
            },
            {
              key: 'X-Git-Commit',
              value: gitInfo.commit
            }
          ]
        }
      ]
    }
  }
}
```

```typescript
// pages/api/version.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    version: process.env.npm_package_version,
    git: {
      branch: process.env.GIT_BRANCH,
      commit: process.env.GIT_COMMIT,
      buildTime: process.env.BUILD_TIME
    }
  })
}
```

## 与数据库集成

### 数据库迁移跟踪

```typescript
import { Git } from '@ldesign/git'
import { Pool } from 'pg'

class GitMigrationTracker {
  private git: Git
  private db: Pool

  constructor(repoPath: string, dbConfig: any) {
    this.git = Git.create(repoPath)
    this.db = new Pool(dbConfig)
  }

  async trackMigration(migrationName: string): Promise<void> {
    try {
      const status = await this.git.getStatus()
      const log = await this.git.getLog(1)
      
      await this.db.query(`
        INSERT INTO migration_history (
          migration_name,
          git_branch,
          git_commit,
          applied_at
        ) VALUES ($1, $2, $3, NOW())
      `, [
        migrationName,
        status.data?.current,
        log.data?.[0]?.hash
      ])
      
      console.log(`迁移 ${migrationName} 已记录`)
      
    } catch (error) {
      console.error('记录迁移失败:', error)
    }
  }

  async getMigrationHistory(): Promise<any[]> {
    const result = await this.db.query(`
      SELECT * FROM migration_history 
      ORDER BY applied_at DESC 
      LIMIT 10
    `)
    
    return result.rows
  }
}
```

## 下一步

- 学习 [最佳实践](/examples/best-practices) 获取开发建议
- 查看 [API 参考](/api/git) 获取详细的方法说明
- 了解 [配置选项](/guide/configuration) 进行高级配置
