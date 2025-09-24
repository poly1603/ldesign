/**
 * 访问控制器
 * 
 * 负责资源级别的访问控制管理
 */

import { EventEmitter } from 'events'
import type {
  AccessControl as IAccessControl,
  ResourceAccess,
  ResourceType,
  PermissionContext
} from './types'
import { PermissionStorage } from './PermissionStorage'

/**
 * 访问控制器实现
 */
export class AccessControl extends EventEmitter implements IAccessControl {
  private storage: PermissionStorage
  private accessCache: Map<string, ResourceAccess[]> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

  constructor(storage: PermissionStorage) {
    super()
    this.storage = storage
  }

  /**
   * 检查访问权限
   */
  async checkAccess(
    userId: string,
    resource: string,
    action: string,
    context?: PermissionContext
  ): Promise<boolean> {
    try {
      // 获取用户对资源的访问权限
      const resourceId = this.extractResourceId(resource, context)
      const resourceType = this.extractResourceType(resource)
      
      if (!resourceId || !resourceType) {
        return false
      }

      const accessList = await this.getResourceAccess(resourceId, resourceType)
      
      // 查找用户的访问权限
      const userAccess = accessList.find(access => access.userId === userId)
      if (!userAccess) {
        return false
      }

      // 检查权限是否过期
      if (userAccess.expiresAt && userAccess.expiresAt < Date.now()) {
        return false
      }

      // 检查是否有对应的操作权限
      return userAccess.permissions.includes(action) || userAccess.permissions.includes('*')
    } catch (error) {
      console.error('访问权限检查失败:', error)
      return false
    }
  }

  /**
   * 获取资源访问列表
   */
  async getResourceAccess(resourceId: string, resourceType: ResourceType): Promise<ResourceAccess[]> {
    const cacheKey = `${resourceType}:${resourceId}`
    
    // 检查缓存
    if (this.accessCache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey)
      if (expiry && expiry > Date.now()) {
        return this.accessCache.get(cacheKey)!
      }
    }

    // 从存储获取
    const accessList = await this.storage.getResourceAccess(resourceId, resourceType)
    
    // 过滤过期的访问权限
    const validAccessList = accessList.filter(access => 
      !access.expiresAt || access.expiresAt > Date.now()
    )

    // 更新缓存
    this.accessCache.set(cacheKey, validAccessList)
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL)

    return validAccessList
  }

  /**
   * 授予资源访问权限
   */
  async grantAccess(
    resourceId: string,
    resourceType: ResourceType,
    userId: string,
    permissions: string[],
    grantedBy?: string,
    expiresAt?: number
  ): Promise<void> {
    // 检查是否已有访问权限
    const existingAccess = await this.getUserResourceAccess(resourceId, resourceType, userId)
    
    if (existingAccess) {
      // 更新现有权限
      await this.updateAccess(resourceId, resourceType, userId, permissions, expiresAt)
      return
    }

    // 创建新的访问权限
    const resourceAccess: ResourceAccess = {
      resourceId,
      resourceType,
      userId,
      permissions,
      grantedAt: Date.now(),
      grantedBy: grantedBy || 'system',
      expiresAt
    }

    await this.storage.saveResourceAccess(resourceAccess)
    
    // 清理缓存
    this.clearResourceCache(resourceId, resourceType)
    
    // 触发事件
    this.emit('access:granted', resourceId, userId, permissions)
    
    console.log(`用户 ${userId} 被授予资源 ${resourceType}:${resourceId} 的访问权限:`, permissions)
  }

  /**
   * 撤销资源访问权限
   */
  async revokeAccess(resourceId: string, resourceType: ResourceType, userId: string): Promise<void> {
    const existingAccess = await this.getUserResourceAccess(resourceId, resourceType, userId)
    if (!existingAccess) {
      throw new Error(`用户 ${userId} 没有资源 ${resourceType}:${resourceId} 的访问权限`)
    }

    await this.storage.deleteResourceAccess(resourceId, resourceType, userId)
    
    // 清理缓存
    this.clearResourceCache(resourceId, resourceType)
    
    // 触发事件
    this.emit('access:revoked', resourceId, userId)
    
    console.log(`用户 ${userId} 的资源 ${resourceType}:${resourceId} 访问权限已撤销`)
  }

  /**
   * 更新资源访问权限
   */
  async updateAccess(
    resourceId: string,
    resourceType: ResourceType,
    userId: string,
    permissions: string[],
    expiresAt?: number
  ): Promise<void> {
    const existingAccess = await this.getUserResourceAccess(resourceId, resourceType, userId)
    if (!existingAccess) {
      throw new Error(`用户 ${userId} 没有资源 ${resourceType}:${resourceId} 的访问权限`)
    }

    const updatedAccess: ResourceAccess = {
      ...existingAccess,
      permissions,
      expiresAt
    }

    await this.storage.saveResourceAccess(updatedAccess)
    
    // 清理缓存
    this.clearResourceCache(resourceId, resourceType)
    
    console.log(`用户 ${userId} 的资源 ${resourceType}:${resourceId} 访问权限已更新:`, permissions)
  }

  /**
   * 获取用户的资源访问权限
   */
  async getUserResourceAccess(
    resourceId: string,
    resourceType: ResourceType,
    userId: string
  ): Promise<ResourceAccess | null> {
    const accessList = await this.getResourceAccess(resourceId, resourceType)
    return accessList.find(access => access.userId === userId) || null
  }

  /**
   * 获取用户的所有资源访问权限
   */
  async getUserAllResourceAccess(userId: string): Promise<ResourceAccess[]> {
    return await this.storage.getUserResourceAccess(userId)
  }

  /**
   * 批量授予访问权限
   */
  async batchGrantAccess(grants: Array<{
    resourceId: string
    resourceType: ResourceType
    userId: string
    permissions: string[]
    expiresAt?: number
  }>, grantedBy?: string): Promise<void> {
    for (const grant of grants) {
      await this.grantAccess(
        grant.resourceId,
        grant.resourceType,
        grant.userId,
        grant.permissions,
        grantedBy,
        grant.expiresAt
      )
    }
  }

  /**
   * 批量撤销访问权限
   */
  async batchRevokeAccess(revocations: Array<{
    resourceId: string
    resourceType: ResourceType
    userId: string
  }>): Promise<void> {
    for (const revocation of revocations) {
      await this.revokeAccess(
        revocation.resourceId,
        revocation.resourceType,
        revocation.userId
      )
    }
  }

  /**
   * 复制资源访问权限
   */
  async copyResourceAccess(
    sourceResourceId: string,
    targetResourceId: string,
    resourceType: ResourceType,
    copiedBy?: string
  ): Promise<void> {
    const sourceAccessList = await this.getResourceAccess(sourceResourceId, resourceType)
    
    for (const access of sourceAccessList) {
      await this.grantAccess(
        targetResourceId,
        resourceType,
        access.userId,
        access.permissions,
        copiedBy,
        access.expiresAt
      )
    }
    
    console.log(`资源访问权限已复制: ${sourceResourceId} -> ${targetResourceId}`)
  }

  /**
   * 清理过期的访问权限
   */
  async cleanupExpiredAccess(): Promise<number> {
    const allAccess = await this.storage.getAllResourceAccess()
    const now = Date.now()
    let cleanedCount = 0

    for (const access of allAccess) {
      if (access.expiresAt && access.expiresAt < now) {
        await this.storage.deleteResourceAccess(access.resourceId, access.resourceType, access.userId)
        cleanedCount++
      }
    }

    // 清理所有缓存
    this.accessCache.clear()
    this.cacheExpiry.clear()

    console.log(`已清理 ${cleanedCount} 个过期的访问权限`)
    return cleanedCount
  }

  /**
   * 获取资源访问统计
   */
  async getResourceAccessStats(resourceId: string, resourceType: ResourceType): Promise<{
    totalUsers: number
    activeUsers: number
    expiredUsers: number
    permissionDistribution: Record<string, number>
  }> {
    const accessList = await this.getResourceAccess(resourceId, resourceType)
    const now = Date.now()

    const totalUsers = accessList.length
    const activeUsers = accessList.filter(access => !access.expiresAt || access.expiresAt > now).length
    const expiredUsers = totalUsers - activeUsers

    // 统计权限分布
    const permissionDistribution: Record<string, number> = {}
    for (const access of accessList) {
      for (const permission of access.permissions) {
        permissionDistribution[permission] = (permissionDistribution[permission] || 0) + 1
      }
    }

    return {
      totalUsers,
      activeUsers,
      expiredUsers,
      permissionDistribution
    }
  }

  /**
   * 搜索资源访问权限
   */
  async searchResourceAccess(query: {
    resourceType?: ResourceType
    userId?: string
    permission?: string
    grantedBy?: string
    expiredOnly?: boolean
    activeOnly?: boolean
  }): Promise<ResourceAccess[]> {
    const allAccess = await this.storage.getAllResourceAccess()
    const now = Date.now()

    return allAccess.filter(access => {
      // 按资源类型过滤
      if (query.resourceType && access.resourceType !== query.resourceType) {
        return false
      }

      // 按用户ID过滤
      if (query.userId && access.userId !== query.userId) {
        return false
      }

      // 按权限过滤
      if (query.permission && !access.permissions.includes(query.permission)) {
        return false
      }

      // 按授予者过滤
      if (query.grantedBy && access.grantedBy !== query.grantedBy) {
        return false
      }

      // 按过期状态过滤
      const isExpired = access.expiresAt && access.expiresAt < now
      if (query.expiredOnly && !isExpired) {
        return false
      }
      if (query.activeOnly && isExpired) {
        return false
      }

      return true
    })
  }

  /**
   * 验证资源访问权限
   */
  async validateResourceAccess(resourceId: string, resourceType: ResourceType): Promise<{
    valid: boolean
    issues: string[]
  }> {
    const issues: string[] = []
    
    try {
      const accessList = await this.getResourceAccess(resourceId, resourceType)
      
      // 检查重复的用户访问权限
      const userIds = accessList.map(access => access.userId)
      const duplicateUsers = userIds.filter((userId, index) => userIds.indexOf(userId) !== index)
      if (duplicateUsers.length > 0) {
        issues.push(`发现重复的用户访问权限: ${duplicateUsers.join(', ')}`)
      }

      // 检查无效的权限
      const validPermissions = ['read', 'write', 'delete', 'admin', '*']
      for (const access of accessList) {
        const invalidPermissions = access.permissions.filter(p => !validPermissions.includes(p))
        if (invalidPermissions.length > 0) {
          issues.push(`用户 ${access.userId} 有无效权限: ${invalidPermissions.join(', ')}`)
        }
      }

      // 检查过期的访问权限
      const now = Date.now()
      const expiredAccess = accessList.filter(access => access.expiresAt && access.expiresAt < now)
      if (expiredAccess.length > 0) {
        issues.push(`发现 ${expiredAccess.length} 个过期的访问权限`)
      }

    } catch (error) {
      issues.push(`验证过程中发生错误: ${error.message}`)
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }

  /**
   * 提取资源ID
   */
  private extractResourceId(resource: string, context?: PermissionContext): string | null {
    // 从上下文中提取资源ID
    if (context) {
      if (resource === 'flowchart' && context.flowchartId) {
        return context.flowchartId
      }
      if (resource === 'process' && context.processInstanceId) {
        return context.processInstanceId
      }
      if (resource === 'task' && context.taskId) {
        return context.taskId
      }
      if (resource === 'project' && context.projectId) {
        return context.projectId
      }
      if (resource === 'organization' && context.organizationId) {
        return context.organizationId
      }
    }

    // 如果资源字符串包含ID，尝试解析
    const parts = resource.split(':')
    if (parts.length === 2) {
      return parts[1]
    }

    return null
  }

  /**
   * 提取资源类型
   */
  private extractResourceType(resource: string): ResourceType | null {
    const parts = resource.split(':')
    const resourceType = parts[0] as ResourceType
    
    const validTypes: ResourceType[] = [
      'flowchart', 'node', 'edge', 'template', 'version', 'process',
      'task', 'comment', 'user', 'role', 'organization', 'project', 'system'
    ]
    
    return validTypes.includes(resourceType) ? resourceType : null
  }

  /**
   * 清理资源缓存
   */
  private clearResourceCache(resourceId: string, resourceType: ResourceType): void {
    const cacheKey = `${resourceType}:${resourceId}`
    this.accessCache.delete(cacheKey)
    this.cacheExpiry.delete(cacheKey)
  }
}
