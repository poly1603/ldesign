import { GitStash } from './GitStash.js'
import { ConflictResolver, ConflictResolutionResult } from '../utils/ConflictResolver.js'
import { ProgressIndicator } from '../utils/ProgressIndicator.js'
import { GitOperationResult } from '../types/index.js'

// 前向声明 Git 类型，避免循环依赖
interface Git {
  getBaseDir(): string
  getOptions(): any
  isRepo(): Promise<boolean>
  getStatus(): Promise<any>
  listRemotes(): Promise<any>
  pull(remote?: string, branch?: string): Promise<any>
  add(files: string | string[]): Promise<any>
  commit(message: string): Promise<any>
  push(remote?: string, branch?: string): Promise<any>
  status: {
    isClean(): Promise<boolean>
  }
  repository: {
    executeGitCommand(args: string[]): Promise<any>
  }
}

/**
 * 智能同步选项
 */
export interface SmartSyncOptions {
  /** 远程仓库名称 */
  remote?: string
  /** 分支名称 */
  branch?: string
  /** 是否自动解决冲突 */
  autoResolveConflicts?: boolean
  /** 冲突解决策略 */
  conflictStrategy?: 'ours' | 'theirs' | 'manual'
  /** 是否显示进度 */
  showProgress?: boolean
  /** 是否在操作前确认 */
  confirmBeforeAction?: boolean
  /** 保护的分支列表 */
  protectedBranches?: string[]
  /** 是否包含未跟踪文件到 stash */
  includeUntracked?: boolean
}

/**
 * 智能同步结果
 */
export interface SmartSyncResult {
  success: boolean
  message: string
  steps: string[]
  conflicts?: ConflictResolutionResult
  stashCreated?: boolean
  stashId?: string
  rollbackAvailable?: boolean
  error?: string
}

/**
 * 智能同步类
 * 提供智能的 Git 同步功能，避免多人开发冲突
 */
export class SmartSync {
  private git: Git
  private stash: GitStash
  private conflictResolver: ConflictResolver
  private progress: ProgressIndicator
  private options: SmartSyncOptions

  constructor(git: Git, options: SmartSyncOptions = {}) {
    this.git = git
    this.stash = new GitStash(git.getBaseDir(), git.getOptions())
    this.conflictResolver = new ConflictResolver(git)
    this.progress = new ProgressIndicator({
      showDuration: true,
      showSpinner: true
    })

    this.options = {
      remote: 'origin',
      autoResolveConflicts: false,
      conflictStrategy: 'manual',
      showProgress: true,
      confirmBeforeAction: false,
      protectedBranches: ['main', 'master', 'develop'],
      includeUntracked: true,
      ...options
    }
  }

  /**
   * 执行智能同步提交
   * @param commitMessage - 提交消息
   * @param files - 要提交的文件列表
   * @returns 同步结果
   */
  async syncCommit(commitMessage: string, files?: string[]): Promise<SmartSyncResult> {
    const steps: string[] = []
    let stashCreated = false
    let stashId: string | undefined

    try {
      // 设置进度步骤
      if (this.options.showProgress) {
        this.setupProgressSteps()
      }

      // 1. 安全检查
      await this.performSafetyChecks()
      steps.push('✅ 安全检查通过')

      // 2. 检查工作目录状态
      const hasChanges = await this.checkWorkingDirectory()

      if (hasChanges) {
        // 3. 暂存本地更改
        const stashResult = await this.stashLocalChanges()
        if (stashResult.success && stashResult.data) {
          stashCreated = true
          stashId = stashResult.data.hash
          steps.push('📦 本地更改已暂存')
        }
      } else {
        this.progress?.skipStep('stash', '没有本地更改需要暂存')
        steps.push('ℹ️ 没有本地更改需要暂存')
      }

      // 4. 拉取远程更改
      await this.pullRemoteChanges()
      steps.push('📥 远程更改已拉取')

      // 5. 恢复本地更改
      if (stashCreated) {
        const popResult = await this.popStashedChanges()
        if (!popResult.success) {
          // 可能有冲突
          const conflicts = await this.handleStashConflicts()
          if (!conflicts.resolved) {
            return {
              success: false,
              message: '恢复本地更改时发生冲突',
              steps,
              conflicts,
              stashCreated,
              stashId,
              rollbackAvailable: true,
              error: '需要手动解决冲突'
            }
          }
        }
        steps.push('📤 本地更改已恢复')
      }

      // 6. 添加文件到暂存区
      await this.addFilesToStaging(files)
      steps.push('📋 文件已添加到暂存区')

      // 7. 执行提交
      await this.performCommit(commitMessage)
      steps.push('💾 提交已完成')

      // 8. 推送到远程
      await this.pushToRemote()
      steps.push('🚀 更改已推送到远程')

      if (this.options.showProgress) {
        this.progress.showSummary()
        this.progress.cleanup()
      }

      return {
        success: true,
        message: '智能同步提交完成',
        steps,
        stashCreated,
        stashId,
        rollbackAvailable: false
      }

    } catch (error: any) {
      if (this.options.showProgress) {
        this.progress.showSummary()
        this.progress.cleanup()
      }

      return {
        success: false,
        message: '智能同步失败',
        steps,
        stashCreated,
        stashId,
        rollbackAvailable: stashCreated,
        error: error?.message || error
      }
    }
  }

  /**
   * 设置进度步骤
   */
  private setupProgressSteps(): void {
    this.progress.addSteps([
      {
        id: 'safety-check',
        name: '安全检查',
        description: '检查仓库状态和分支保护'
      },
      {
        id: 'check-working-dir',
        name: '检查工作目录',
        description: '检查是否有未提交的更改'
      },
      {
        id: 'stash',
        name: '暂存本地更改',
        description: '使用 git stash 保存本地更改'
      },
      {
        id: 'pull',
        name: '拉取远程更改',
        description: '从远程仓库拉取最新代码'
      },
      {
        id: 'pop-stash',
        name: '恢复本地更改',
        description: '恢复之前暂存的本地更改'
      },
      {
        id: 'add-files',
        name: '添加文件',
        description: '添加文件到暂存区'
      },
      {
        id: 'commit',
        name: '执行提交',
        description: '提交暂存的更改'
      },
      {
        id: 'push',
        name: '推送到远程',
        description: '推送提交到远程仓库'
      }
    ])
  }

  /**
   * 执行安全检查
   */
  private async performSafetyChecks(): Promise<void> {
    this.progress?.startStep('safety-check')

    try {
      // 检查是否为 Git 仓库
      const isRepo = await this.git.isRepo()
      if (!isRepo) {
        throw new Error('当前目录不是 Git 仓库')
      }

      // 检查当前分支是否受保护
      const status = await this.git.getStatus()
      const currentBranch = status.data?.current

      if (currentBranch && this.options.protectedBranches?.includes(currentBranch)) {
        if (this.options.confirmBeforeAction) {
          // 在实际应用中，这里应该有用户确认逻辑
          console.warn(`⚠️ 警告: 正在操作受保护的分支 ${currentBranch}`)
        }
      }

      // 检查是否有远程仓库
      const remotes = await this.git.listRemotes()
      if (!remotes.success || !remotes.data?.length) {
        throw new Error('没有配置远程仓库')
      }

      this.progress?.completeStep('safety-check')
    } catch (error: any) {
      this.progress?.failStep('safety-check', error?.message || error)
      throw error
    }
  }

  /**
   * 检查工作目录状态
   */
  private async checkWorkingDirectory(): Promise<boolean> {
    this.progress?.startStep('check-working-dir')

    try {
      const isClean = await this.git.status.isClean()

      if (isClean) {
        this.progress?.completeStep('check-working-dir', '工作目录干净')
        return false
      } else {
        this.progress?.completeStep('check-working-dir', '发现未提交的更改')
        return true
      }
    } catch (error: any) {
      this.progress?.failStep('check-working-dir', error?.message || error)
      throw error
    }
  }

  /**
   * 暂存本地更改
   */
  private async stashLocalChanges(): Promise<GitOperationResult<any>> {
    this.progress?.startStep('stash')

    try {
      const stashMessage = `Smart sync stash - ${new Date().toISOString()}`
      const result = await this.stash.save(stashMessage, this.options.includeUntracked)

      if (result.success) {
        this.progress?.completeStep('stash', '本地更改已暂存')
      } else {
        this.progress?.failStep('stash', result.error || '暂存失败')
      }

      return result
    } catch (error: any) {
      this.progress?.failStep('stash', error?.message || error)
      throw error
    }
  }

  /**
   * 拉取远程更改
   */
  private async pullRemoteChanges(): Promise<void> {
    this.progress?.startStep('pull')

    try {
      const status = await this.git.getStatus()
      const currentBranch = status.data?.current || this.options.branch || 'main'

      const result = await this.git.pull(this.options.remote, currentBranch)

      if (result.success) {
        this.progress?.completeStep('pull', '远程更改已拉取')
      } else {
        this.progress?.failStep('pull', result.error || '拉取失败')
        throw new Error(result.error || '拉取远程更改失败')
      }
    } catch (error: any) {
      this.progress?.failStep('pull', error?.message || error)
      throw error
    }
  }

  /**
   * 恢复暂存的更改
   */
  private async popStashedChanges(): Promise<GitOperationResult<void>> {
    this.progress?.startStep('pop-stash')

    try {
      const result = await this.stash.pop()

      if (result.success) {
        this.progress?.completeStep('pop-stash', '本地更改已恢复')
      } else {
        this.progress?.updateStep('pop-stash', '恢复时发生冲突')
      }

      return result
    } catch (error: any) {
      this.progress?.failStep('pop-stash', error?.message || error)
      throw error
    }
  }

  /**
   * 处理 stash 冲突
   */
  private async handleStashConflicts(): Promise<ConflictResolutionResult> {
    const conflicts = await this.conflictResolver.resolveConflicts({
      strategy: this.options.conflictStrategy,
      autoResolve: this.options.autoResolveConflicts
    })

    if (conflicts.resolved) {
      this.progress?.completeStep('pop-stash', '冲突已自动解决')
    } else {
      this.progress?.failStep('pop-stash', '存在未解决的冲突')
    }

    return conflicts
  }

  /**
   * 添加文件到暂存区
   */
  private async addFilesToStaging(files?: string[]): Promise<void> {
    this.progress?.startStep('add-files')

    try {
      if (files && files.length > 0) {
        await this.git.add(files)
      } else {
        await this.git.add('.')
      }

      this.progress?.completeStep('add-files')
    } catch (error: any) {
      this.progress?.failStep('add-files', error?.message || error)
      throw error
    }
  }

  /**
   * 执行提交
   */
  private async performCommit(message: string): Promise<void> {
    this.progress?.startStep('commit')

    try {
      const result = await this.git.commit(message)

      if (result.success) {
        this.progress?.completeStep('commit', `提交: ${result.data?.hash?.substring(0, 8)}`)
      } else {
        this.progress?.failStep('commit', result.error || '提交失败')
        throw new Error(result.error || '提交失败')
      }
    } catch (error: any) {
      this.progress?.failStep('commit', error?.message || error)
      throw error
    }
  }

  /**
   * 推送到远程
   */
  private async pushToRemote(): Promise<void> {
    this.progress?.startStep('push')

    try {
      const status = await this.git.getStatus()
      const currentBranch = status.data?.current || this.options.branch || 'main'

      const result = await this.git.push(this.options.remote, currentBranch)

      if (result.success) {
        this.progress?.completeStep('push', '推送完成')
      } else {
        this.progress?.failStep('push', result.error || '推送失败')
        throw new Error(result.error || '推送失败')
      }
    } catch (error: any) {
      this.progress?.failStep('push', error?.message || error)
      throw error
    }
  }

  /**
   * 回滚操作
   * @param stashId - stash ID
   * @returns 回滚结果
   */
  async rollback(stashId?: string): Promise<SmartSyncResult> {
    try {
      const steps: string[] = []

      // 重置到上一个提交
      await this.git.repository.executeGitCommand(['reset', '--hard', 'HEAD~1'])
      steps.push('↩️ 已重置到上一个提交')

      // 如果有 stash，恢复它
      if (stashId) {
        const hasStash = await this.stash.hasStash()
        if (hasStash) {
          await this.stash.pop()
          steps.push('📤 已恢复暂存的更改')
        }
      }

      return {
        success: true,
        message: '回滚完成',
        steps,
        rollbackAvailable: false
      }
    } catch (error: any) {
      return {
        success: false,
        message: '回滚失败',
        steps: [],
        error: error?.message || error
      }
    }
  }
}
