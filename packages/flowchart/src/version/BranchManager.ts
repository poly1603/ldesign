/**
 * 分支管理器
 * 
 * 管理流程图的分支创建、切换、合并和删除
 */

import type {
  BranchManager as IBranchManager,
  Branch,
  MergeOptions,
  MergeResult,
  CreateBranchOptions,
  Conflict,
  ConflictResolutionStrategy
} from './types'
import { VersionManager } from './VersionManager'
import { DiffEngine } from './DiffEngine'
import { VersionStorage } from './VersionStorage'
import { EventEmitter } from 'events'

/**
 * 分支管理器类
 */
export class BranchManager extends EventEmitter implements IBranchManager {
  private versionManager: VersionManager
  private diffEngine: DiffEngine
  private storage: VersionStorage
  private currentBranch?: Branch

  constructor(versionManager: VersionManager) {
    super()
    
    this.versionManager = versionManager
    this.diffEngine = new DiffEngine()
    this.storage = new VersionStorage()
    
    this.initializeDefaultBranch()
  }

  /**
   * 创建分支
   */
  async createBranch(name: string, baseVersionId: string, options?: CreateBranchOptions): Promise<Branch> {
    try {
      // 检查分支是否已存在
      const existingBranch = await this.getBranch(name)
      if (existingBranch) {
        throw new Error(`分支 ${name} 已存在`)
      }
      
      // 验证基础版本
      const baseVersion = await this.versionManager.getVersion(baseVersionId)
      if (!baseVersion) {
        throw new Error(`基础版本 ${baseVersionId} 不存在`)
      }
      
      // 创建分支对象
      const branch: Branch = {
        name,
        description: options?.description,
        createdAt: Date.now(),
        author: options?.author || 'unknown',
        baseVersionId,
        latestVersionId: baseVersionId,
        status: 'active',
        isMain: false,
        tags: options?.tags || []
      }
      
      // 保存分支
      await this.storage.saveBranch(branch)
      
      // 触发事件
      this.emit('branch:created', branch)
      
      return branch
    } catch (error) {
      throw new Error(`创建分支失败: ${error}`)
    }
  }

  /**
   * 获取分支
   */
  async getBranch(name: string): Promise<Branch | null> {
    try {
      return await this.storage.loadBranch(name)
    } catch (error) {
      console.error('获取分支失败:', error)
      return null
    }
  }

  /**
   * 获取所有分支
   */
  async getBranches(): Promise<Branch[]> {
    try {
      return await this.storage.getAllBranches()
    } catch (error) {
      console.error('获取分支列表失败:', error)
      return []
    }
  }

  /**
   * 切换分支
   */
  async switchBranch(name: string): Promise<Branch> {
    try {
      const branch = await this.getBranch(name)
      if (!branch) {
        throw new Error(`分支 ${name} 不存在`)
      }
      
      // 设置当前分支
      this.currentBranch = branch
      
      // 切换到分支的最新版本
      await this.versionManager.setCurrentVersion(branch.latestVersionId)
      
      // 触发事件
      this.emit('branch:switched', branch)
      
      return branch
    } catch (error) {
      throw new Error(`切换分支失败: ${error}`)
    }
  }

  /**
   * 合并分支
   */
  async mergeBranch(options: MergeOptions): Promise<MergeResult> {
    try {
      const sourceBranch = await this.getBranch(options.sourceBranch)
      const targetBranch = await this.getBranch(options.targetBranch)
      
      if (!sourceBranch || !targetBranch) {
        throw new Error('源分支或目标分支不存在')
      }
      
      // 获取分支的最新版本
      const sourceVersion = await this.versionManager.getVersion(sourceBranch.latestVersionId)
      const targetVersion = await this.versionManager.getVersion(targetBranch.latestVersionId)
      
      if (!sourceVersion || !targetVersion) {
        throw new Error('无法获取分支版本')
      }
      
      // 计算差异
      const differences = await this.diffEngine.calculateDiff(
        targetVersion.data,
        sourceVersion.data
      )
      
      // 检测冲突
      const conflicts = await this.diffEngine.detectConflicts(differences)
      
      // 如果有冲突且策略不是自动解决，返回冲突信息
      if (conflicts.length > 0 && options.strategy === 'manual') {
        return {
          success: false,
          conflicts,
          error: '存在合并冲突，需要手动解决',
          stats: {
            mergedChanges: 0,
            conflicts: conflicts.length,
            autoResolvedConflicts: 0,
            manualResolvedConflicts: 0
          }
        }
      }
      
      // 解决冲突
      let resolvedDifferences = differences
      let autoResolvedConflicts = 0
      
      if (conflicts.length > 0) {
        const resolvedConflictDiffs = await this.diffEngine.resolveConflicts(
          conflicts,
          options.conflictResolution
        )
        
        // 替换冲突的差异
        resolvedDifferences = this.replaceConflictedDifferences(differences, resolvedConflictDiffs)
        autoResolvedConflicts = conflicts.length
      }
      
      // 应用合并
      const mergedData = await this.diffEngine.applyDiff(targetVersion.data, resolvedDifferences)
      
      // 创建合并版本
      const mergeMessage = options.message || `合并分支 ${options.sourceBranch} 到 ${options.targetBranch}`
      
      const mergedVersion = await this.versionManager.createVersion(mergedData, {
        name: `Merge ${options.sourceBranch}`,
        description: mergeMessage,
        author: 'system',
        branch: options.targetBranch,
        isMajor: true,
        tags: ['merge'],
        metadata: {
          mergeFrom: options.sourceBranch,
          mergeTo: options.targetBranch,
          sourceVersionId: sourceVersion.id,
          targetVersionId: targetVersion.id
        }
      })
      
      // 更新目标分支的最新版本
      targetBranch.latestVersionId = mergedVersion.id
      await this.storage.saveBranch(targetBranch)
      
      // 如果是快进合并，可以考虑归档源分支
      if (options.fastForward) {
        sourceBranch.status = 'merged'
        await this.storage.saveBranch(sourceBranch)
      }
      
      const result: MergeResult = {
        success: true,
        mergedVersion,
        conflicts: [],
        stats: {
          mergedChanges: resolvedDifferences.length,
          conflicts: conflicts.length,
          autoResolvedConflicts,
          manualResolvedConflicts: 0
        }
      }
      
      // 触发事件
      this.emit('branch:merged', result)
      
      return result
    } catch (error) {
      return {
        success: false,
        conflicts: [],
        error: `合并分支失败: ${error}`,
        stats: {
          mergedChanges: 0,
          conflicts: 0,
          autoResolvedConflicts: 0,
          manualResolvedConflicts: 0
        }
      }
    }
  }

  /**
   * 删除分支
   */
  async deleteBranch(name: string): Promise<void> {
    try {
      const branch = await this.getBranch(name)
      if (!branch) {
        throw new Error(`分支 ${name} 不存在`)
      }
      
      // 不能删除主分支
      if (branch.isMain) {
        throw new Error('不能删除主分支')
      }
      
      // 不能删除当前分支
      if (this.currentBranch?.name === name) {
        throw new Error('不能删除当前分支')
      }
      
      // 删除分支
      await this.storage.deleteBranch(name)
      
      // 触发事件
      this.emit('branch:deleted', name)
    } catch (error) {
      throw new Error(`删除分支失败: ${error}`)
    }
  }

  /**
   * 获取当前分支
   */
  getCurrentBranch(): Branch | undefined {
    return this.currentBranch
  }

  /**
   * 更新分支信息
   */
  async updateBranch(name: string, updates: Partial<Branch>): Promise<Branch> {
    try {
      const branch = await this.getBranch(name)
      if (!branch) {
        throw new Error(`分支 ${name} 不存在`)
      }
      
      // 更新分支信息
      const updatedBranch = { ...branch, ...updates }
      
      // 保存更新
      await this.storage.saveBranch(updatedBranch)
      
      // 如果是当前分支，更新引用
      if (this.currentBranch?.name === name) {
        this.currentBranch = updatedBranch
      }
      
      return updatedBranch
    } catch (error) {
      throw new Error(`更新分支失败: ${error}`)
    }
  }

  /**
   * 获取分支的版本历史
   */
  async getBranchHistory(branchName: string): Promise<any[]> {
    try {
      return await this.versionManager.getVersionHistory({
        branch: branchName,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
    } catch (error) {
      console.error('获取分支历史失败:', error)
      return []
    }
  }

  /**
   * 比较分支
   */
  async compareBranches(sourceBranch: string, targetBranch: string): Promise<any> {
    try {
      const source = await this.getBranch(sourceBranch)
      const target = await this.getBranch(targetBranch)
      
      if (!source || !target) {
        throw new Error('分支不存在')
      }
      
      return await this.versionManager.compareVersions(
        source.latestVersionId,
        target.latestVersionId
      )
    } catch (error) {
      throw new Error(`比较分支失败: ${error}`)
    }
  }

  /**
   * 初始化默认分支
   */
  private async initializeDefaultBranch(): Promise<void> {
    try {
      const mainBranch = await this.getBranch('main')
      if (!mainBranch) {
        // 创建主分支
        const defaultBranch: Branch = {
          name: 'main',
          description: '主分支',
          createdAt: Date.now(),
          author: 'system',
          baseVersionId: '',
          latestVersionId: '',
          status: 'active',
          isMain: true,
          tags: ['main']
        }
        
        await this.storage.saveBranch(defaultBranch)
        this.currentBranch = defaultBranch
      } else {
        this.currentBranch = mainBranch
      }
    } catch (error) {
      console.error('初始化默认分支失败:', error)
    }
  }

  /**
   * 替换冲突的差异
   */
  private replaceConflictedDifferences(
    originalDifferences: any[],
    resolvedDifferences: any[]
  ): any[] {
    const result = [...originalDifferences]
    
    // 简化实现：直接添加解决的差异
    result.push(...resolvedDifferences)
    
    return result
  }
}
