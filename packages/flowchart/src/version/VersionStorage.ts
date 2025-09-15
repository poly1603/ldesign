/**
 * 版本存储
 * 
 * 管理版本和分支数据的持久化存储
 */

import type {
  VersionStorage as IVersionStorage,
  Version,
  Branch,
  VersionHistoryOptions
} from './types'

/**
 * 版本存储类
 */
export class VersionStorage implements IVersionStorage {
  private versions: Map<string, Version> = new Map()
  private branches: Map<string, Branch> = new Map()
  private storageKey = 'flowchart_versions'
  private branchStorageKey = 'flowchart_branches'

  constructor() {
    this.loadFromLocalStorage()
  }

  /**
   * 保存版本
   */
  async saveVersion(version: Version): Promise<void> {
    try {
      this.versions.set(version.id, version)
      await this.saveToLocalStorage()
    } catch (error) {
      throw new Error(`保存版本失败: ${error}`)
    }
  }

  /**
   * 加载版本
   */
  async loadVersion(versionId: string): Promise<Version | null> {
    try {
      return this.versions.get(versionId) || null
    } catch (error) {
      console.error('加载版本失败:', error)
      return null
    }
  }

  /**
   * 删除版本
   */
  async deleteVersion(versionId: string): Promise<void> {
    try {
      this.versions.delete(versionId)
      await this.saveToLocalStorage()
    } catch (error) {
      throw new Error(`删除版本失败: ${error}`)
    }
  }

  /**
   * 查询版本
   */
  async queryVersions(options: VersionHistoryOptions): Promise<Version[]> {
    try {
      let versions = Array.from(this.versions.values())
      
      // 应用过滤条件
      if (options.branch) {
        versions = versions.filter(v => v.branch === options.branch)
      }
      
      if (options.author) {
        versions = versions.filter(v => v.author === options.author)
      }
      
      if (options.startDate) {
        const startTime = options.startDate.getTime()
        versions = versions.filter(v => v.createdAt >= startTime)
      }
      
      if (options.endDate) {
        const endTime = options.endDate.getTime()
        versions = versions.filter(v => v.createdAt <= endTime)
      }
      
      if (options.tags && options.tags.length > 0) {
        versions = versions.filter(v => 
          options.tags!.some(tag => v.tags.includes(tag))
        )
      }
      
      // 排序
      const sortBy = options.sortBy || 'createdAt'
      const sortOrder = options.sortOrder || 'desc'
      
      versions.sort((a, b) => {
        let comparison = 0
        
        switch (sortBy) {
          case 'createdAt':
            comparison = a.createdAt - b.createdAt
            break
          case 'version':
            comparison = a.version.localeCompare(b.version)
            break
          case 'author':
            comparison = a.author.localeCompare(b.author)
            break
          default:
            comparison = a.createdAt - b.createdAt
        }
        
        return sortOrder === 'desc' ? -comparison : comparison
      })
      
      // 应用分页
      const offset = options.offset || 0
      const limit = options.limit || 50
      
      return versions.slice(offset, offset + limit)
    } catch (error) {
      console.error('查询版本失败:', error)
      return []
    }
  }

  /**
   * 保存分支
   */
  async saveBranch(branch: Branch): Promise<void> {
    try {
      this.branches.set(branch.name, branch)
      await this.saveBranchesToLocalStorage()
    } catch (error) {
      throw new Error(`保存分支失败: ${error}`)
    }
  }

  /**
   * 加载分支
   */
  async loadBranch(name: string): Promise<Branch | null> {
    try {
      return this.branches.get(name) || null
    } catch (error) {
      console.error('加载分支失败:', error)
      return null
    }
  }

  /**
   * 删除分支
   */
  async deleteBranch(name: string): Promise<void> {
    try {
      this.branches.delete(name)
      await this.saveBranchesToLocalStorage()
    } catch (error) {
      throw new Error(`删除分支失败: ${error}`)
    }
  }

  /**
   * 获取所有分支
   */
  async getAllBranches(): Promise<Branch[]> {
    try {
      return Array.from(this.branches.values())
    } catch (error) {
      console.error('获取分支列表失败:', error)
      return []
    }
  }

  /**
   * 获取版本统计信息
   */
  async getVersionStats(): Promise<{
    totalVersions: number
    totalBranches: number
    versionsByBranch: Record<string, number>
    versionsByAuthor: Record<string, number>
  }> {
    const versions = Array.from(this.versions.values())
    const branches = Array.from(this.branches.values())
    
    const versionsByBranch: Record<string, number> = {}
    const versionsByAuthor: Record<string, number> = {}
    
    for (const version of versions) {
      // 按分支统计
      versionsByBranch[version.branch] = (versionsByBranch[version.branch] || 0) + 1
      
      // 按作者统计
      versionsByAuthor[version.author] = (versionsByAuthor[version.author] || 0) + 1
    }
    
    return {
      totalVersions: versions.length,
      totalBranches: branches.length,
      versionsByBranch,
      versionsByAuthor
    }
  }

  /**
   * 清空所有数据
   */
  async clearAll(): Promise<void> {
    try {
      this.versions.clear()
      this.branches.clear()
      await this.saveToLocalStorage()
      await this.saveBranchesToLocalStorage()
    } catch (error) {
      throw new Error(`清空数据失败: ${error}`)
    }
  }

  /**
   * 导出数据
   */
  async exportData(): Promise<{
    versions: Version[]
    branches: Branch[]
    exportedAt: number
  }> {
    return {
      versions: Array.from(this.versions.values()),
      branches: Array.from(this.branches.values()),
      exportedAt: Date.now()
    }
  }

  /**
   * 导入数据
   */
  async importData(data: {
    versions: Version[]
    branches: Branch[]
  }): Promise<void> {
    try {
      // 清空现有数据
      this.versions.clear()
      this.branches.clear()
      
      // 导入版本
      for (const version of data.versions) {
        this.versions.set(version.id, version)
      }
      
      // 导入分支
      for (const branch of data.branches) {
        this.branches.set(branch.name, branch)
      }
      
      // 保存到本地存储
      await this.saveToLocalStorage()
      await this.saveBranchesToLocalStorage()
    } catch (error) {
      throw new Error(`导入数据失败: ${error}`)
    }
  }

  /**
   * 从本地存储加载数据
   */
  private loadFromLocalStorage(): void {
    try {
      // 加载版本数据
      const versionsData = localStorage.getItem(this.storageKey)
      if (versionsData) {
        const versions: Version[] = JSON.parse(versionsData)
        for (const version of versions) {
          this.versions.set(version.id, version)
        }
      }
      
      // 加载分支数据
      const branchesData = localStorage.getItem(this.branchStorageKey)
      if (branchesData) {
        const branches: Branch[] = JSON.parse(branchesData)
        for (const branch of branches) {
          this.branches.set(branch.name, branch)
        }
      }
    } catch (error) {
      console.error('从本地存储加载数据失败:', error)
    }
  }

  /**
   * 保存版本数据到本地存储
   */
  private async saveToLocalStorage(): Promise<void> {
    try {
      const versions = Array.from(this.versions.values())
      localStorage.setItem(this.storageKey, JSON.stringify(versions))
    } catch (error) {
      throw new Error(`保存到本地存储失败: ${error}`)
    }
  }

  /**
   * 保存分支数据到本地存储
   */
  private async saveBranchesToLocalStorage(): Promise<void> {
    try {
      const branches = Array.from(this.branches.values())
      localStorage.setItem(this.branchStorageKey, JSON.stringify(branches))
    } catch (error) {
      throw new Error(`保存分支到本地存储失败: ${error}`)
    }
  }

  /**
   * 压缩版本数据
   */
  private compressVersionData(version: Version): Version {
    // 简化实现：移除一些不必要的数据以节省存储空间
    const compressed = { ...version }
    
    // 可以在这里实现数据压缩逻辑
    // 例如：压缩流程图数据、移除冗余信息等
    
    return compressed
  }

  /**
   * 解压版本数据
   */
  private decompressVersionData(compressed: Version): Version {
    // 简化实现：恢复压缩的数据
    return compressed
  }

  /**
   * 验证版本数据完整性
   */
  private validateVersionData(version: Version): boolean {
    // 检查必需字段
    if (!version.id || !version.version || !version.author || !version.data) {
      return false
    }
    
    // 检查数据结构
    if (!version.data.nodes || !version.data.edges) {
      return false
    }
    
    // 检查时间戳
    if (!version.createdAt || version.createdAt <= 0) {
      return false
    }
    
    return true
  }

  /**
   * 验证分支数据完整性
   */
  private validateBranchData(branch: Branch): boolean {
    // 检查必需字段
    if (!branch.name || !branch.author || !branch.baseVersionId) {
      return false
    }
    
    // 检查时间戳
    if (!branch.createdAt || branch.createdAt <= 0) {
      return false
    }
    
    return true
  }
}
