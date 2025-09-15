/**
 * 版本管理器
 * 
 * 管理流程图的版本创建、查询、比较和回滚
 */

import type {
  VersionManager as IVersionManager,
  Version,
  VersionHistoryOptions,
  VersionComparison,
  CreateVersionOptions,
  ChangeSummary,
  Change,
  VersionControlConfig
} from './types'
import type { FlowchartData } from '../types'
import { DiffEngine } from './DiffEngine'
import { VersionStorage } from './VersionStorage'
import { EventEmitter } from 'events'

/**
 * 版本管理器类
 */
export class VersionManager extends EventEmitter implements IVersionManager {
  private diffEngine: DiffEngine
  private storage: VersionStorage
  private config: VersionControlConfig
  private currentVersion?: Version

  constructor(config?: Partial<VersionControlConfig>) {
    super()
    
    this.config = {
      autoVersioning: false,
      autoVersionInterval: 300000, // 5分钟
      maxVersionHistory: 100,
      enableCompression: true,
      defaultBranch: 'main',
      versionNamingStrategy: 'semantic',
      enableVersionTags: true,
      ...config
    }
    
    this.diffEngine = new DiffEngine()
    this.storage = new VersionStorage()
  }

  /**
   * 创建版本
   */
  async createVersion(data: FlowchartData, options: CreateVersionOptions): Promise<Version> {
    try {
      // 生成版本ID和版本号
      const versionId = this.generateVersionId()
      const versionNumber = await this.generateVersionNumber(options.branch)
      
      // 计算变更摘要
      const changeSummary = await this.calculateChangeSummary(data)
      
      // 创建版本对象
      const version: Version = {
        id: versionId,
        version: versionNumber,
        name: options.name || `Version ${versionNumber}`,
        description: options.description,
        createdAt: Date.now(),
        author: options.author,
        parentId: this.currentVersion?.id,
        branch: options.branch || this.config.defaultBranch,
        tags: options.tags || [],
        data: this.cloneData(data),
        changeSummary,
        isMajor: options.isMajor || false,
        status: 'draft',
        metadata: options.metadata || {}
      }
      
      // 保存版本
      await this.storage.saveVersion(version)
      
      // 更新当前版本
      this.currentVersion = version
      
      // 清理旧版本（如果超过限制）
      await this.cleanupOldVersions()
      
      // 触发事件
      this.emit('version:created', version)
      
      return version
    } catch (error) {
      throw new Error(`创建版本失败: ${error}`)
    }
  }

  /**
   * 获取版本
   */
  async getVersion(versionId: string): Promise<Version | null> {
    try {
      return await this.storage.loadVersion(versionId)
    } catch (error) {
      console.error('获取版本失败:', error)
      return null
    }
  }

  /**
   * 获取版本历史
   */
  async getVersionHistory(options?: VersionHistoryOptions): Promise<Version[]> {
    try {
      const queryOptions = {
        branch: this.config.defaultBranch,
        limit: 50,
        offset: 0,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
        ...options
      }
      
      return await this.storage.queryVersions(queryOptions)
    } catch (error) {
      console.error('获取版本历史失败:', error)
      return []
    }
  }

  /**
   * 比较版本
   */
  async compareVersions(sourceId: string, targetId: string): Promise<VersionComparison> {
    try {
      const sourceVersion = await this.getVersion(sourceId)
      const targetVersion = await this.getVersion(targetId)
      
      if (!sourceVersion || !targetVersion) {
        throw new Error('版本不存在')
      }
      
      // 计算差异
      const differences = await this.diffEngine.calculateDiff(
        sourceVersion.data,
        targetVersion.data
      )
      
      // 检测冲突
      const conflicts = await this.diffEngine.detectConflicts(differences)
      
      // 生成差异摘要
      const summary = this.generateDiffSummary(differences)
      
      return {
        sourceVersion,
        targetVersion,
        summary,
        differences,
        conflicts
      }
    } catch (error) {
      throw new Error(`版本比较失败: ${error}`)
    }
  }

  /**
   * 回滚到指定版本
   */
  async rollbackToVersion(versionId: string): Promise<Version> {
    try {
      const targetVersion = await this.getVersion(versionId)
      if (!targetVersion) {
        throw new Error('目标版本不存在')
      }
      
      // 创建回滚版本
      const rollbackOptions: CreateVersionOptions = {
        name: `Rollback to ${targetVersion.version}`,
        description: `回滚到版本 ${targetVersion.version}`,
        author: 'system',
        branch: targetVersion.branch,
        isMajor: false,
        tags: ['rollback'],
        metadata: {
          rollbackFrom: this.currentVersion?.id,
          rollbackTo: versionId
        }
      }
      
      const rollbackVersion = await this.createVersion(targetVersion.data, rollbackOptions)
      
      return rollbackVersion
    } catch (error) {
      throw new Error(`版本回滚失败: ${error}`)
    }
  }

  /**
   * 删除版本
   */
  async deleteVersion(versionId: string): Promise<void> {
    try {
      await this.storage.deleteVersion(versionId)
      
      // 如果删除的是当前版本，需要重新设置当前版本
      if (this.currentVersion?.id === versionId) {
        const history = await this.getVersionHistory({ limit: 1 })
        this.currentVersion = history[0] || undefined
      }
      
      this.emit('version:deleted', versionId)
    } catch (error) {
      throw new Error(`删除版本失败: ${error}`)
    }
  }

  /**
   * 标记版本
   */
  async tagVersion(versionId: string, tag: string): Promise<void> {
    try {
      const version = await this.getVersion(versionId)
      if (!version) {
        throw new Error('版本不存在')
      }
      
      if (!version.tags.includes(tag)) {
        version.tags.push(tag)
        await this.storage.saveVersion(version)
        
        this.emit('version:updated', version)
      }
    } catch (error) {
      throw new Error(`标记版本失败: ${error}`)
    }
  }

  /**
   * 获取当前版本
   */
  getCurrentVersion(): Version | undefined {
    return this.currentVersion
  }

  /**
   * 设置当前版本
   */
  async setCurrentVersion(versionId: string): Promise<void> {
    const version = await this.getVersion(versionId)
    if (version) {
      this.currentVersion = version
    }
  }

  /**
   * 发布版本
   */
  async publishVersion(versionId: string): Promise<Version> {
    try {
      const version = await this.getVersion(versionId)
      if (!version) {
        throw new Error('版本不存在')
      }
      
      version.status = 'published'
      await this.storage.saveVersion(version)
      
      this.emit('version:updated', version)
      return version
    } catch (error) {
      throw new Error(`发布版本失败: ${error}`)
    }
  }

  /**
   * 归档版本
   */
  async archiveVersion(versionId: string): Promise<Version> {
    try {
      const version = await this.getVersion(versionId)
      if (!version) {
        throw new Error('版本不存在')
      }
      
      version.status = 'archived'
      await this.storage.saveVersion(version)
      
      this.emit('version:updated', version)
      return version
    } catch (error) {
      throw new Error(`归档版本失败: ${error}`)
    }
  }

  /**
   * 生成版本ID
   */
  private generateVersionId(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成版本号
   */
  private async generateVersionNumber(branch?: string): Promise<string> {
    const branchName = branch || this.config.defaultBranch
    const history = await this.getVersionHistory({ branch: branchName, limit: 1 })
    
    switch (this.config.versionNamingStrategy) {
      case 'semantic':
        return this.generateSemanticVersion(history[0])
      case 'timestamp':
        return this.generateTimestampVersion()
      case 'sequential':
        return this.generateSequentialVersion(history[0])
      default:
        return this.generateSequentialVersion(history[0])
    }
  }

  /**
   * 生成语义化版本号
   */
  private generateSemanticVersion(lastVersion?: Version): string {
    if (!lastVersion) {
      return '1.0.0'
    }
    
    const parts = lastVersion.version.split('.').map(Number)
    if (parts.length !== 3) {
      return '1.0.0'
    }
    
    // 简单递增补丁版本
    parts[2]++
    return parts.join('.')
  }

  /**
   * 生成时间戳版本号
   */
  private generateTimestampVersion(): string {
    const now = new Date()
    return `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`
  }

  /**
   * 生成序列版本号
   */
  private generateSequentialVersion(lastVersion?: Version): string {
    if (!lastVersion) {
      return '1'
    }
    
    const lastNumber = parseInt(lastVersion.version) || 0
    return (lastNumber + 1).toString()
  }

  /**
   * 计算变更摘要
   */
  private async calculateChangeSummary(data: FlowchartData): Promise<ChangeSummary> {
    if (!this.currentVersion) {
      // 第一个版本
      return {
        nodesAdded: data.nodes.length,
        nodesRemoved: 0,
        nodesModified: 0,
        edgesAdded: data.edges.length,
        edgesRemoved: 0,
        edgesModified: 0,
        changes: []
      }
    }
    
    // 计算与当前版本的差异
    const differences = await this.diffEngine.calculateDiff(this.currentVersion.data, data)
    
    let nodesAdded = 0
    let nodesRemoved = 0
    let nodesModified = 0
    let edgesAdded = 0
    let edgesRemoved = 0
    let edgesModified = 0
    
    const changes: Change[] = []
    
    for (const diff of differences) {
      const change: Change = {
        id: this.generateChangeId(),
        type: this.mapDifferenceTypeToChangeType(diff.type),
        targetType: diff.targetType,
        targetId: diff.targetId,
        oldValue: diff.sourceValue,
        newValue: diff.targetValue,
        path: diff.path,
        timestamp: Date.now(),
        description: diff.description
      }
      
      changes.push(change)
      
      // 统计变更
      if (diff.targetType === 'node') {
        switch (diff.type) {
          case 'added':
            nodesAdded++
            break
          case 'removed':
            nodesRemoved++
            break
          case 'modified':
            nodesModified++
            break
        }
      } else if (diff.targetType === 'edge') {
        switch (diff.type) {
          case 'added':
            edgesAdded++
            break
          case 'removed':
            edgesRemoved++
            break
          case 'modified':
            edgesModified++
            break
        }
      }
    }
    
    return {
      nodesAdded,
      nodesRemoved,
      nodesModified,
      edgesAdded,
      edgesRemoved,
      edgesModified,
      changes
    }
  }

  /**
   * 生成差异摘要
   */
  private generateDiffSummary(differences: any[]): any {
    let nodeChanges = 0
    let edgeChanges = 0
    let propertyChanges = 0
    
    for (const diff of differences) {
      if (diff.targetType === 'node') {
        nodeChanges++
      } else if (diff.targetType === 'edge') {
        edgeChanges++
      } else if (diff.targetType === 'property') {
        propertyChanges++
      }
    }
    
    const totalChanges = differences.length
    const compatibilityScore = this.calculateCompatibilityScore(differences)
    
    return {
      totalChanges,
      nodeChanges,
      edgeChanges,
      propertyChanges,
      compatibilityScore
    }
  }

  /**
   * 计算兼容性分数
   */
  private calculateCompatibilityScore(differences: any[]): number {
    if (differences.length === 0) return 1.0
    
    let score = 1.0
    
    for (const diff of differences) {
      switch (diff.severity) {
        case 'high':
          score -= 0.3
          break
        case 'medium':
          score -= 0.1
          break
        case 'low':
          score -= 0.05
          break
      }
    }
    
    return Math.max(0, score)
  }

  /**
   * 清理旧版本
   */
  private async cleanupOldVersions(): Promise<void> {
    if (!this.config.maxVersionHistory) return
    
    const history = await this.getVersionHistory({
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    
    if (history.length > this.config.maxVersionHistory) {
      const versionsToDelete = history.slice(this.config.maxVersionHistory)
      
      for (const version of versionsToDelete) {
        if (version.status !== 'published') {
          await this.storage.deleteVersion(version.id)
        }
      }
    }
  }

  /**
   * 克隆数据
   */
  private cloneData(data: FlowchartData): FlowchartData {
    return JSON.parse(JSON.stringify(data))
  }

  /**
   * 生成变更ID
   */
  private generateChangeId(): string {
    return `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 映射差异类型到变更类型
   */
  private mapDifferenceTypeToChangeType(diffType: string): any {
    switch (diffType) {
      case 'added':
        return 'add'
      case 'removed':
        return 'remove'
      case 'modified':
        return 'modify'
      case 'moved':
        return 'move'
      case 'renamed':
        return 'rename'
      default:
        return 'modify'
    }
  }
}
