/**
 * Git 分支管理类
 * 提供分支的创建、切换、删除、列出等功能
 */

import { SimpleGit } from 'simple-git'
import {
  wrapGitOperation,
  handleSimpleGitError,
  parseGitBranches
} from '../utils/index.js'
import {
  validateBranchName
} from '../utils/validation.js'
import type {
  GitOperationResult,
  GitBranchInfo,
  GitEventType,
  GitEventListener
} from '../types/index.js'

/**
 * Git 分支管理类
 */
export class GitBranch {
  /** Simple Git 实例 */
  private git: SimpleGit
  /** 事件监听器 */
  private eventListeners: Map<GitEventType, GitEventListener[]> = new Map()

  /**
   * 构造函数
   * @param git Simple Git 实例
   * @param baseDir 仓库路径
   */
  constructor(git: SimpleGit, _baseDir: string) {
    this.git = git
  }

  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  public on(event: GitEventType, listener: GitEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  public off(event: GitEventType, listener: GitEventListener): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   * @param event 事件类型
   * @param data 事件数据
   */
  private emit(event: GitEventType, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event, data)
        } catch (error) {
          console.error('Event listener error:', error)
        }
      })
    }
  }

  /**
   * 创建新分支
   * @param branchName 分支名称
   * @param startPoint 起始点（可选）
   * @returns 操作结果
   */
  public async create(branchName: string, startPoint?: string): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(branchName)

        this.emit('branch', { action: 'create', branchName, startPoint })

        if (startPoint) {
          await this.git.checkoutBranch(branchName, startPoint)
        } else {
          await this.git.checkoutLocalBranch(branchName)
        }

        this.emit('branch', {
          action: 'create',
          success: true,
          branchName,
          startPoint
        })
      } catch (error) {
        this.emit('error', { operation: 'branch-create', error })
        throw handleSimpleGitError(error, 'branch-create')
      }
    })
  }

  /**
   * 切换分支
   * @param branchName 分支名称
   * @returns 操作结果
   */
  public async checkout(branchName: string): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(branchName)

        this.emit('checkout', { branchName })

        await this.git.checkout(branchName)

        this.emit('checkout', { success: true, branchName })
      } catch (error) {
        this.emit('error', { operation: 'checkout', error })
        throw handleSimpleGitError(error, 'checkout')
      }
    })
  }

  /**
   * 删除分支
   * @param branchName 分支名称
   * @param force 是否强制删除
   * @returns 操作结果
   */
  public async delete(branchName: string, force: boolean = false): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(branchName)

        this.emit('branch', { action: 'delete', branchName, force })

        if (force) {
          await this.git.deleteLocalBranch(branchName, true)
        } else {
          await this.git.deleteLocalBranch(branchName)
        }

        this.emit('branch', {
          action: 'delete',
          success: true,
          branchName,
          force
        })
      } catch (error) {
        this.emit('error', { operation: 'branch-delete', error })
        throw handleSimpleGitError(error, 'branch-delete')
      }
    })
  }

  /**
   * 列出所有分支
   * @param includeRemote 是否包含远程分支
   * @returns 操作结果
   */
  public async list(includeRemote: boolean = false): Promise<GitOperationResult<GitBranchInfo[]>> {
    return wrapGitOperation(async () => {
      try {
        this.emit('branch', { action: 'list', includeRemote })

        const branchResult = includeRemote
          ? await this.git.branch(['-a'])
          : await this.git.branchLocal()

        const branches = parseGitBranches(branchResult)

        this.emit('branch', {
          action: 'list',
          success: true,
          branches,
          includeRemote
        })

        return branches
      } catch (error) {
        this.emit('error', { operation: 'branch-list', error })
        throw handleSimpleGitError(error, 'branch-list')
      }
    })
  }

  /**
   * 获取当前分支
   * @returns 操作结果
   */
  public async current(): Promise<GitOperationResult<string>> {
    return wrapGitOperation(async () => {
      try {
        this.emit('branch', { action: 'current' })

        const currentBranch = await this.git.revparse(['--abbrev-ref', 'HEAD'])

        this.emit('branch', {
          action: 'current',
          success: true,
          currentBranch
        })

        return currentBranch.trim()
      } catch (error) {
        this.emit('error', { operation: 'branch-current', error })
        throw handleSimpleGitError(error, 'branch-current')
      }
    })
  }

  /**
   * 重命名分支
   * @param oldName 旧分支名
   * @param newName 新分支名
   * @returns 操作结果
   */
  public async rename(oldName: string, newName: string): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(oldName)
        validateBranchName(newName)

        this.emit('branch', { action: 'rename', oldName, newName })

        await this.git.branch(['-m', oldName, newName])

        this.emit('branch', {
          action: 'rename',
          success: true,
          oldName,
          newName
        })
      } catch (error) {
        this.emit('error', { operation: 'branch-rename', error })
        throw handleSimpleGitError(error, 'branch-rename')
      }
    })
  }

  /**
   * 合并分支
   * @param branchName 要合并的分支名
   * @param options 合并选项
   * @returns 操作结果
   */
  public async merge(
    branchName: string,
    options: { noFf?: boolean; squash?: boolean } = {}
  ): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(branchName)

        this.emit('merge', { branchName, options })

        const mergeOptions: string[] = []

        if (options.noFf) {
          mergeOptions.push('--no-ff')
        }

        if (options.squash) {
          mergeOptions.push('--squash')
        }

        await this.git.merge([branchName, ...mergeOptions])

        this.emit('merge', {
          success: true,
          branchName,
          options
        })
      } catch (error) {
        this.emit('error', { operation: 'merge', error })
        throw handleSimpleGitError(error, 'merge')
      }
    })
  }

  /**
   * 检查分支是否存在
   * @param branchName 分支名称
   * @param includeRemote 是否包含远程分支
   * @returns 分支是否存在
   */
  public async exists(branchName: string, includeRemote: boolean = false): Promise<boolean> {
    try {
      const branchesResult = await this.list(includeRemote)

      if (!branchesResult.success || !branchesResult.data) {
        return false
      }

      return branchesResult.data.some(branch =>
        branch.name === branchName ||
        branch.name.endsWith(`/${branchName}`)
      )
    } catch {
      return false
    }
  }

  /**
   * 获取分支的最后提交信息
   * @param branchName 分支名称
   * @returns 操作结果
   */
  public async getLastCommit(branchName: string): Promise<GitOperationResult<string>> {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(branchName)

        const commitHash = await this.git.revparse([branchName])

        return commitHash.trim()
      } catch (error) {
        throw handleSimpleGitError(error, 'branch-last-commit')
      }
    })
  }

  /**
   * 比较两个分支
   * @param baseBranch 基础分支
   * @param compareBranch 比较分支
   * @returns 操作结果
   */
  public async compare(baseBranch: string, compareBranch: string): Promise<GitOperationResult<any>> {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(baseBranch)
        validateBranchName(compareBranch)

        this.emit('diff', { baseBranch, compareBranch })

        const diffResult = await this.git.diff([`${baseBranch}...${compareBranch}`])

        this.emit('diff', {
          success: true,
          baseBranch,
          compareBranch,
          diff: diffResult
        })

        return {
          baseBranch,
          compareBranch,
          diff: diffResult,
          hasChanges: diffResult.length > 0
        }
      } catch (error) {
        this.emit('error', { operation: 'branch-compare', error })
        throw handleSimpleGitError(error, 'branch-compare')
      }
    })
  }
}
