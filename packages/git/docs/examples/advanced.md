# 高级用法示例

本页面提供 @ldesign/git 的高级使用示例，展示复杂场景下的最佳实践。

## 复杂工作流管理

### Git Flow 工作流

实现标准的 Git Flow 分支模型：

```typescript
import { Git } from '@ldesign/git'

class GitFlowManager {
  private git: Git
  private mainBranch = 'main'
  private developBranch = 'develop'

  constructor(repoPath: string) {
    this.git = Git.create(repoPath)
  }

  async initializeGitFlow(): Promise<void> {
    console.log('🚀 初始化 Git Flow...')
    
    // 确保主分支存在
    const branches = await this.git.listBranches()
    const branchNames = branches.data?.map(b => b.name) || []
    
    if (!branchNames.includes(this.mainBranch)) {
      await this.git.createBranch(this.mainBranch)
    }
    
    // 创建开发分支
    if (!branchNames.includes(this.developBranch)) {
      await this.git.checkoutBranch(this.mainBranch)
      await this.git.createBranch(this.developBranch)
    }
    
    await this.git.checkoutBranch(this.developBranch)
    console.log('✅ Git Flow 初始化完成')
  }

  async startFeature(featureName: string): Promise<string> {
    const branchName = `feature/${featureName}`
    console.log(`🌿 开始功能开发: ${branchName}`)
    
    // 切换到开发分支并拉取最新代码
    await this.git.checkoutBranch(this.developBranch)
    await this.git.pull('origin', this.developBranch)
    
    // 创建功能分支
    await this.git.createBranch(branchName)
    await this.git.checkoutBranch(branchName)
    
    console.log(`✅ 功能分支 ${branchName} 创建完成`)
    return branchName
  }

  async finishFeature(featureName: string): Promise<void> {
    const branchName = `feature/${featureName}`
    console.log(`🔀 完成功能开发: ${branchName}`)
    
    // 切换到开发分支
    await this.git.checkoutBranch(this.developBranch)
    
    // 拉取最新代码
    await this.git.pull('origin', this.developBranch)
    
    // 合并功能分支
    await this.git.branch.merge(branchName)
    
    // 推送开发分支
    await this.git.push('origin', this.developBranch)
    
    // 删除功能分支
    await this.git.branch.delete(branchName)
    
    console.log(`✅ 功能 ${featureName} 合并完成`)
  }

  async startRelease(version: string): Promise<string> {
    const branchName = `release/${version}`
    console.log(`📦 开始发布准备: ${branchName}`)
    
    // 从开发分支创建发布分支
    await this.git.checkoutBranch(this.developBranch)
    await this.git.pull('origin', this.developBranch)
    await this.git.createBranch(branchName)
    await this.git.checkoutBranch(branchName)
    
    console.log(`✅ 发布分支 ${branchName} 创建完成`)
    return branchName
  }

  async finishRelease(version: string): Promise<void> {
    const branchName = `release/${version}`
    console.log(`🚀 完成发布: ${branchName}`)
    
    // 合并到主分支
    await this.git.checkoutBranch(this.mainBranch)
    await this.git.pull('origin', this.mainBranch)
    await this.git.branch.merge(branchName)
    
    // 创建标签
    // await this.git.tag.create(version) // 需要标签功能
    
    // 推送主分支
    await this.git.push('origin', this.mainBranch)
    
    // 合并回开发分支
    await this.git.checkoutBranch(this.developBranch)
    await this.git.branch.merge(branchName)
    await this.git.push('origin', this.developBranch)
    
    // 删除发布分支
    await this.git.branch.delete(branchName)
    
    console.log(`✅ 版本 ${version} 发布完成`)
  }

  async hotfix(version: string, description: string): Promise<void> {
    const branchName = `hotfix/${version}`
    console.log(`🔥 开始热修复: ${branchName}`)
    
    // 从主分支创建热修复分支
    await this.git.checkoutBranch(this.mainBranch)
    await this.git.pull('origin', this.mainBranch)
    await this.git.createBranch(branchName)
    await this.git.checkoutBranch(branchName)
    
    console.log(`请在 ${branchName} 分支上进行修复...`)
    
    // 这里可以暂停等待用户修复
    // 或者集成自动修复逻辑
    
    // 完成修复后的合并流程
    await this.finishHotfix(version)
  }

  private async finishHotfix(version: string): Promise<void> {
    const branchName = `hotfix/${version}`
    
    // 合并到主分支
    await this.git.checkoutBranch(this.mainBranch)
    await this.git.branch.merge(branchName)
    await this.git.push('origin', this.mainBranch)
    
    // 合并到开发分支
    await this.git.checkoutBranch(this.developBranch)
    await this.git.branch.merge(branchName)
    await this.git.push('origin', this.developBranch)
    
    // 删除热修复分支
    await this.git.branch.delete(branchName)
    
    console.log(`✅ 热修复 ${version} 完成`)
  }
}

// 使用示例
async function gitFlowExample() {
  const gitFlow = new GitFlowManager('./my-project')
  
  // 初始化 Git Flow
  await gitFlow.initializeGitFlow()
  
  // 开发新功能
  await gitFlow.startFeature('user-authentication')
  // ... 开发功能 ...
  await gitFlow.finishFeature('user-authentication')
  
  // 准备发布
  await gitFlow.startRelease('v1.0.0')
  // ... 发布准备工作 ...
  await gitFlow.finishRelease('v1.0.0')
  
  // 紧急修复
  await gitFlow.hotfix('v1.0.1', 'Fix critical security issue')
}
```

## 多仓库管理

### 批量操作多个仓库

```typescript
import { Git } from '@ldesign/git'
import path from 'path'
import fs from 'fs/promises'

class MultiRepoManager {
  private repos: Map<string, Git> = new Map()

  async addRepository(name: string, repoPath: string): Promise<void> {
    const git = Git.create(repoPath)
    
    // 验证是否为有效的 Git 仓库
    const isRepo = await git.isRepo()
    if (!isRepo) {
      throw new Error(`${repoPath} 不是有效的 Git 仓库`)
    }
    
    this.repos.set(name, git)
    console.log(`✅ 添加仓库: ${name} -> ${repoPath}`)
  }

  async discoverRepositories(rootPath: string): Promise<void> {
    console.log(`🔍 搜索 ${rootPath} 下的 Git 仓库...`)
    
    const entries = await fs.readdir(rootPath, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const repoPath = path.join(rootPath, entry.name)
        const gitPath = path.join(repoPath, '.git')
        
        try {
          await fs.access(gitPath)
          await this.addRepository(entry.name, repoPath)
        } catch {
          // 不是 Git 仓库，跳过
        }
      }
    }
  }

  async executeOnAll<T>(
    operation: (git: Git, name: string) => Promise<T>
  ): Promise<Map<string, T | Error>> {
    const results = new Map<string, T | Error>()
    
    for (const [name, git] of this.repos) {
      try {
        console.log(`🔄 执行操作: ${name}`)
        const result = await operation(git, name)
        results.set(name, result)
        console.log(`✅ ${name} 操作成功`)
      } catch (error) {
        console.error(`❌ ${name} 操作失败:`, error.message)
        results.set(name, error as Error)
      }
    }
    
    return results
  }

  async pullAll(): Promise<void> {
    console.log('📥 拉取所有仓库的最新代码...')
    
    await this.executeOnAll(async (git, name) => {
      const status = await git.getStatus()
      const currentBranch = status.data?.current || 'main'
      return await git.pull('origin', currentBranch)
    })
  }

  async statusAll(): Promise<Map<string, any>> {
    console.log('📊 检查所有仓库状态...')
    
    const results = await this.executeOnAll(async (git, name) => {
      const status = await git.getStatus()
      return {
        branch: status.data?.current,
        ahead: status.data?.ahead,
        behind: status.data?.behind,
        staged: status.data?.staged.length,
        modified: status.data?.modified.length,
        untracked: status.data?.not_added.length
      }
    })
    
    // 打印状态摘要
    for (const [name, result] of results) {
      if (result instanceof Error) {
        console.log(`❌ ${name}: ${result.message}`)
      } else {
        const { branch, ahead, behind, staged, modified, untracked } = result
        console.log(`📋 ${name}: ${branch} (+${ahead}/-${behind}) S:${staged} M:${modified} U:${untracked}`)
      }
    }
    
    return results
  }

  async commitAll(message: string): Promise<void> {
    console.log(`💾 提交所有仓库: ${message}`)
    
    await this.executeOnAll(async (git, name) => {
      // 检查是否有更改
      const status = await git.getStatus()
      const hasChanges = (status.data?.modified.length || 0) > 0 || 
                        (status.data?.not_added.length || 0) > 0
      
      if (!hasChanges) {
        console.log(`ℹ️ ${name}: 没有需要提交的更改`)
        return null
      }
      
      // 添加所有更改并提交
      await git.add('.')
      return await git.commit(message)
    })
  }

  async createBranchAll(branchName: string): Promise<void> {
    console.log(`🌿 在所有仓库创建分支: ${branchName}`)
    
    await this.executeOnAll(async (git, name) => {
      // 检查分支是否已存在
      const branches = await git.listBranches()
      const branchExists = branches.data?.some(b => b.name === branchName)
      
      if (branchExists) {
        console.log(`ℹ️ ${name}: 分支 ${branchName} 已存在`)
        return null
      }
      
      return await git.createBranch(branchName)
    })
  }

  async generateReport(): Promise<string> {
    const report = ['# 多仓库状态报告', '']
    
    for (const [name, git] of this.repos) {
      try {
        const status = await git.getStatus()
        const log = await git.getLog(5)
        
        report.push(`## ${name}`)
        report.push(`- 当前分支: ${status.data?.current}`)
        report.push(`- 领先/落后: +${status.data?.ahead}/-${status.data?.behind}`)
        report.push(`- 暂存文件: ${status.data?.staged.length}`)
        report.push(`- 修改文件: ${status.data?.modified.length}`)
        report.push(`- 未跟踪文件: ${status.data?.not_added.length}`)
        
        if (log.data && log.data.length > 0) {
          report.push('- 最近提交:')
          log.data.slice(0, 3).forEach(commit => {
            report.push(`  - ${commit.hash.substring(0, 8)}: ${commit.message}`)
          })
        }
        
        report.push('')
      } catch (error) {
        report.push(`## ${name}`)
        report.push(`❌ 错误: ${error.message}`)
        report.push('')
      }
    }
    
    return report.join('\n')
  }
}

// 使用示例
async function multiRepoExample() {
  const manager = new MultiRepoManager()
  
  // 自动发现仓库
  await manager.discoverRepositories('./projects')
  
  // 或手动添加仓库
  await manager.addRepository('frontend', './projects/frontend')
  await manager.addRepository('backend', './projects/backend')
  await manager.addRepository('mobile', './projects/mobile')
  
  // 批量操作
  await manager.statusAll()
  await manager.pullAll()
  await manager.createBranchAll('feature/new-feature')
  await manager.commitAll('Update all projects')
  
  // 生成报告
  const report = await manager.generateReport()
  console.log(report)
}
```

## 自动化部署流程

### CI/CD 集成

```typescript
import { Git } from '@ldesign/git'

class CICDPipeline {
  private git: Git
  private config: {
    mainBranch: string
    stagingBranch: string
    productionBranch: string
    deploymentBranches: string[]
  }

  constructor(repoPath: string) {
    this.git = Git.create(repoPath)
    this.config = {
      mainBranch: 'main',
      stagingBranch: 'staging',
      productionBranch: 'production',
      deploymentBranches: ['staging', 'production']
    }
  }

  async checkDeploymentReadiness(): Promise<boolean> {
    console.log('🔍 检查部署就绪状态...')
    
    // 检查工作目录是否干净
    const isClean = await this.git.status.isClean()
    if (!isClean) {
      console.error('❌ 工作目录不干净，请先提交或暂存更改')
      return false
    }
    
    // 检查是否在正确的分支上
    const status = await this.git.getStatus()
    const currentBranch = status.data?.current
    
    if (!this.config.deploymentBranches.includes(currentBranch || '')) {
      console.error(`❌ 当前分支 ${currentBranch} 不允许部署`)
      return false
    }
    
    // 检查是否与远程同步
    if ((status.data?.ahead || 0) > 0) {
      console.error('❌ 本地分支领先远程，请先推送')
      return false
    }
    
    if ((status.data?.behind || 0) > 0) {
      console.error('❌ 本地分支落后远程，请先拉取')
      return false
    }
    
    console.log('✅ 部署就绪检查通过')
    return true
  }

  async deployToStaging(): Promise<void> {
    console.log('🚀 部署到测试环境...')
    
    // 切换到主分支并拉取最新代码
    await this.git.checkoutBranch(this.config.mainBranch)
    await this.git.pull('origin', this.config.mainBranch)
    
    // 切换到测试分支并合并主分支
    await this.git.checkoutBranch(this.config.stagingBranch)
    await this.git.pull('origin', this.config.stagingBranch)
    await this.git.branch.merge(this.config.mainBranch)
    
    // 推送测试分支
    await this.git.push('origin', this.config.stagingBranch)
    
    console.log('✅ 测试环境部署完成')
  }

  async deployToProduction(): Promise<void> {
    console.log('🚀 部署到生产环境...')
    
    // 检查部署就绪状态
    const isReady = await this.checkDeploymentReadiness()
    if (!isReady) {
      throw new Error('部署就绪检查失败')
    }
    
    // 从测试分支部署到生产
    await this.git.checkoutBranch(this.config.stagingBranch)
    await this.git.pull('origin', this.config.stagingBranch)
    
    await this.git.checkoutBranch(this.config.productionBranch)
    await this.git.pull('origin', this.config.productionBranch)
    await this.git.branch.merge(this.config.stagingBranch)
    
    // 创建部署标签
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const tagName = `deploy-${timestamp}`
    
    // 推送生产分支
    await this.git.push('origin', this.config.productionBranch)
    
    console.log(`✅ 生产环境部署完成，标签: ${tagName}`)
  }

  async rollback(targetCommit?: string): Promise<void> {
    console.log('🔄 执行回滚操作...')
    
    if (!targetCommit) {
      // 获取最近的部署标签
      // const tags = await this.git.tag.list() // 需要标签功能
      // targetCommit = tags.data?.[0]?.commit
    }
    
    if (!targetCommit) {
      throw new Error('未指定回滚目标')
    }
    
    // 创建回滚分支
    const rollbackBranch = `rollback-${Date.now()}`
    await this.git.createBranch(rollbackBranch, targetCommit)
    await this.git.checkoutBranch(rollbackBranch)
    
    // 合并到生产分支
    await this.git.checkoutBranch(this.config.productionBranch)
    await this.git.branch.merge(rollbackBranch)
    await this.git.push('origin', this.config.productionBranch)
    
    // 清理回滚分支
    await this.git.branch.delete(rollbackBranch)
    
    console.log('✅ 回滚完成')
  }
}
```

## 代码质量检查

### 预提交钩子

```typescript
import { Git } from '@ldesign/git'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

class PreCommitHooks {
  private git: Git

  constructor(repoPath: string) {
    this.git = Git.create(repoPath)
  }

  async runPreCommitChecks(): Promise<boolean> {
    console.log('🔍 运行预提交检查...')
    
    const checks = [
      this.checkLinting.bind(this),
      this.checkTests.bind(this),
      this.checkTypeScript.bind(this),
      this.checkCommitMessage.bind(this)
    ]
    
    for (const check of checks) {
      const passed = await check()
      if (!passed) {
        console.error('❌ 预提交检查失败')
        return false
      }
    }
    
    console.log('✅ 所有预提交检查通过')
    return true
  }

  private async checkLinting(): Promise<boolean> {
    console.log('🧹 检查代码风格...')
    
    try {
      await execAsync('npm run lint')
      console.log('✅ 代码风格检查通过')
      return true
    } catch (error) {
      console.error('❌ 代码风格检查失败:', error.message)
      return false
    }
  }

  private async checkTests(): Promise<boolean> {
    console.log('🧪 运行测试...')
    
    try {
      await execAsync('npm test')
      console.log('✅ 测试通过')
      return true
    } catch (error) {
      console.error('❌ 测试失败:', error.message)
      return false
    }
  }

  private async checkTypeScript(): Promise<boolean> {
    console.log('📝 检查 TypeScript 类型...')
    
    try {
      await execAsync('npx tsc --noEmit')
      console.log('✅ TypeScript 类型检查通过')
      return true
    } catch (error) {
      console.error('❌ TypeScript 类型检查失败:', error.message)
      return false
    }
  }

  private async checkCommitMessage(): Promise<boolean> {
    console.log('📝 检查提交消息格式...')
    
    // 这里可以实现提交消息格式检查
    // 例如：检查是否符合 Conventional Commits 规范
    
    return true
  }

  async setupHooks(): Promise<void> {
    console.log('⚙️ 设置 Git 钩子...')
    
    // 这里可以设置 Git 钩子文件
    // 例如：创建 .git/hooks/pre-commit 文件
    
    console.log('✅ Git 钩子设置完成')
  }
}
```

## 下一步

- 查看 [集成示例](/examples/integration) 了解与其他工具的集成
- 学习 [最佳实践](/examples/best-practices) 获取开发建议
- 阅读 [API 参考](/api/git) 获取详细的方法说明
