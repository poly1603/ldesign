/**
 * 角色管理器
 * 
 * 负责角色的创建、更新、删除和权限管理
 */

import { EventEmitter } from 'events'
import type {
  RoleManager as IRoleManager,
  Role,
  Permission
} from './types'
import { PermissionStorage } from './PermissionStorage'

/**
 * 角色管理器实现
 */
export class RoleManager extends EventEmitter implements IRoleManager {
  private storage: PermissionStorage
  private roleCache: Map<string, Role> = new Map()

  constructor(storage: PermissionStorage) {
    super()
    this.storage = storage
  }

  /**
   * 创建角色
   */
  async createRole(role: Omit<Role, 'id' | 'createdAt'>): Promise<Role> {
    // 验证角色名称唯一性
    const existingRoles = await this.storage.getRoles()
    const nameExists = existingRoles.some(r => r.name === role.name)
    if (nameExists) {
      throw new Error(`角色名称已存在: ${role.name}`)
    }

    // 验证权限是否存在
    for (const permission of role.permissions) {
      const existingPermission = await this.storage.getPermission(permission.id)
      if (!existingPermission) {
        throw new Error(`权限不存在: ${permission.id}`)
      }
    }

    const newRole: Role = {
      ...role,
      id: this.generateRoleId(),
      createdAt: Date.now()
    }

    await this.storage.saveRole(newRole)
    
    // 更新缓存
    this.roleCache.set(newRole.id, newRole)
    
    // 触发事件
    this.emit('role:created', newRole)
    
    console.log(`角色已创建: ${newRole.name} (${newRole.id})`)
    
    return newRole
  }

  /**
   * 获取角色
   */
  async getRole(roleId: string): Promise<Role | null> {
    // 检查缓存
    if (this.roleCache.has(roleId)) {
      return this.roleCache.get(roleId)!
    }

    const role = await this.storage.getRole(roleId)
    
    // 更新缓存
    if (role) {
      this.roleCache.set(roleId, role)
    }
    
    return role
  }

  /**
   * 获取所有角色
   */
  async getRoles(): Promise<Role[]> {
    const roles = await this.storage.getRoles()
    
    // 更新缓存
    for (const role of roles) {
      this.roleCache.set(role.id, role)
    }
    
    return roles
  }

  /**
   * 更新角色
   */
  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    const existingRole = await this.getRole(roleId)
    if (!existingRole) {
      throw new Error(`角色不存在: ${roleId}`)
    }

    // 检查内置角色
    if (existingRole.builtin && !this.isAllowedBuiltinUpdate(updates)) {
      throw new Error('不能修改内置角色的核心属性')
    }

    // 验证角色名称唯一性（如果更新了名称）
    if (updates.name && updates.name !== existingRole.name) {
      const existingRoles = await this.storage.getRoles()
      const nameExists = existingRoles.some(r => r.id !== roleId && r.name === updates.name)
      if (nameExists) {
        throw new Error(`角色名称已存在: ${updates.name}`)
      }
    }

    // 验证权限是否存在（如果更新了权限）
    if (updates.permissions) {
      for (const permission of updates.permissions) {
        const existingPermission = await this.storage.getPermission(permission.id)
        if (!existingPermission) {
          throw new Error(`权限不存在: ${permission.id}`)
        }
      }
    }

    const updatedRole: Role = {
      ...existingRole,
      ...updates,
      id: roleId, // 确保ID不被修改
      createdAt: existingRole.createdAt // 确保创建时间不被修改
    }

    await this.storage.saveRole(updatedRole)
    
    // 更新缓存
    this.roleCache.set(roleId, updatedRole)
    
    // 触发事件
    this.emit('role:updated', updatedRole)
    
    console.log(`角色已更新: ${updatedRole.name} (${roleId})`)
    
    return updatedRole
  }

  /**
   * 删除角色
   */
  async deleteRole(roleId: string): Promise<void> {
    const role = await this.getRole(roleId)
    if (!role) {
      throw new Error(`角色不存在: ${roleId}`)
    }

    // 检查内置角色
    if (role.builtin) {
      throw new Error('不能删除内置角色')
    }

    // 检查是否有用户使用该角色
    const usersWithRole = await this.storage.getUsersByRole(roleId)
    if (usersWithRole.length > 0) {
      throw new Error(`角色正在被 ${usersWithRole.length} 个用户使用，无法删除`)
    }

    await this.storage.deleteRole(roleId)
    
    // 清理缓存
    this.roleCache.delete(roleId)
    
    // 触发事件
    this.emit('role:deleted', roleId)
    
    console.log(`角色已删除: ${role.name} (${roleId})`)
  }

  /**
   * 添加权限到角色
   */
  async addPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    const role = await this.getRole(roleId)
    if (!role) {
      throw new Error(`角色不存在: ${roleId}`)
    }

    const permission = await this.storage.getPermission(permissionId)
    if (!permission) {
      throw new Error(`权限不存在: ${permissionId}`)
    }

    // 检查权限是否已存在
    const hasPermission = role.permissions.some(p => p.id === permissionId)
    if (hasPermission) {
      throw new Error(`角色已拥有该权限: ${permissionId}`)
    }

    const updatedPermissions = [...role.permissions, permission]
    await this.updateRole(roleId, { permissions: updatedPermissions })
    
    console.log(`权限 ${permissionId} 已添加到角色 ${roleId}`)
  }

  /**
   * 从角色移除权限
   */
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    const role = await this.getRole(roleId)
    if (!role) {
      throw new Error(`角色不存在: ${roleId}`)
    }

    // 检查权限是否存在
    const hasPermission = role.permissions.some(p => p.id === permissionId)
    if (!hasPermission) {
      throw new Error(`角色未拥有该权限: ${permissionId}`)
    }

    const updatedPermissions = role.permissions.filter(p => p.id !== permissionId)
    await this.updateRole(roleId, { permissions: updatedPermissions })
    
    console.log(`权限 ${permissionId} 已从角色 ${roleId} 移除`)
  }

  /**
   * 获取角色权限
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.getRole(roleId)
    if (!role) {
      throw new Error(`角色不存在: ${roleId}`)
    }

    return role.permissions
  }

  /**
   * 复制角色
   */
  async cloneRole(sourceRoleId: string, newRoleName: string, createdBy: string): Promise<Role> {
    const sourceRole = await this.getRole(sourceRoleId)
    if (!sourceRole) {
      throw new Error(`源角色不存在: ${sourceRoleId}`)
    }

    const clonedRole = await this.createRole({
      name: newRoleName,
      description: `复制自 ${sourceRole.name}`,
      type: sourceRole.type,
      permissions: [...sourceRole.permissions],
      builtin: false,
      createdBy,
      attributes: { ...sourceRole.attributes }
    })

    console.log(`角色已复制: ${sourceRole.name} -> ${newRoleName}`)
    
    return clonedRole
  }

  /**
   * 获取角色统计信息
   */
  async getRoleStats(roleId: string): Promise<{
    userCount: number
    permissionCount: number
    lastUsed?: number
  }> {
    const role = await this.getRole(roleId)
    if (!role) {
      throw new Error(`角色不存在: ${roleId}`)
    }

    const usersWithRole = await this.storage.getUsersByRole(roleId)
    const userCount = usersWithRole.length
    const permissionCount = role.permissions.length

    // 获取最后使用时间
    let lastUsed: number | undefined
    if (usersWithRole.length > 0) {
      const userRoles = await Promise.all(
        usersWithRole.map(userId => this.storage.getUserRoles(userId))
      )
      
      for (const userRoleList of userRoles) {
        for (const userRole of userRoleList) {
          if (userRole.roleId === roleId) {
            if (!lastUsed || userRole.assignedAt > lastUsed) {
              lastUsed = userRole.assignedAt
            }
          }
        }
      }
    }

    return {
      userCount,
      permissionCount,
      lastUsed
    }
  }

  /**
   * 搜索角色
   */
  async searchRoles(query: {
    name?: string
    type?: string
    builtin?: boolean
    hasPermission?: string
  }): Promise<Role[]> {
    const allRoles = await this.getRoles()
    
    return allRoles.filter(role => {
      // 按名称搜索
      if (query.name && !role.name.toLowerCase().includes(query.name.toLowerCase())) {
        return false
      }
      
      // 按类型搜索
      if (query.type && role.type !== query.type) {
        return false
      }
      
      // 按内置状态搜索
      if (query.builtin !== undefined && role.builtin !== query.builtin) {
        return false
      }
      
      // 按权限搜索
      if (query.hasPermission && !role.permissions.some(p => p.id === query.hasPermission)) {
        return false
      }
      
      return true
    })
  }

  /**
   * 验证角色权限
   */
  async validateRolePermissions(roleId: string): Promise<{
    valid: boolean
    invalidPermissions: string[]
    missingPermissions: string[]
  }> {
    const role = await this.getRole(roleId)
    if (!role) {
      throw new Error(`角色不存在: ${roleId}`)
    }

    const invalidPermissions: string[] = []
    const missingPermissions: string[] = []

    // 检查权限是否存在
    for (const permission of role.permissions) {
      const existingPermission = await this.storage.getPermission(permission.id)
      if (!existingPermission) {
        missingPermissions.push(permission.id)
      }
    }

    // 检查权限是否有效
    const allPermissions = await this.storage.getPermissions()
    for (const permission of role.permissions) {
      const currentPermission = allPermissions.find(p => p.id === permission.id)
      if (currentPermission) {
        // 检查权限内容是否一致
        if (JSON.stringify(permission) !== JSON.stringify(currentPermission)) {
          invalidPermissions.push(permission.id)
        }
      }
    }

    return {
      valid: invalidPermissions.length === 0 && missingPermissions.length === 0,
      invalidPermissions,
      missingPermissions
    }
  }

  /**
   * 修复角色权限
   */
  async repairRolePermissions(roleId: string): Promise<void> {
    const validation = await this.validateRolePermissions(roleId)
    if (validation.valid) {
      return
    }

    const role = await this.getRole(roleId)
    if (!role) {
      throw new Error(`角色不存在: ${roleId}`)
    }

    // 移除无效和缺失的权限
    const validPermissions = role.permissions.filter(permission => 
      !validation.invalidPermissions.includes(permission.id) &&
      !validation.missingPermissions.includes(permission.id)
    )

    // 更新有效权限的内容
    const allPermissions = await this.storage.getPermissions()
    const updatedPermissions = validPermissions.map(permission => {
      const currentPermission = allPermissions.find(p => p.id === permission.id)
      return currentPermission || permission
    })

    await this.updateRole(roleId, { permissions: updatedPermissions })
    
    console.log(`角色权限已修复: ${roleId}`)
  }

  /**
   * 生成角色ID
   */
  private generateRoleId(): string {
    return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 检查是否允许更新内置角色
   */
  private isAllowedBuiltinUpdate(updates: Partial<Role>): boolean {
    // 内置角色只允许更新描述和属性
    const allowedFields = ['description', 'attributes']
    const updateFields = Object.keys(updates)
    
    return updateFields.every(field => allowedFields.includes(field))
  }
}
