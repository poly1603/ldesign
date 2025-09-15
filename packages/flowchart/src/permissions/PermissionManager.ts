/**
 * 权限管理器
 * 
 * 负责权限检查、角色管理和访问控制
 */

import { EventEmitter } from 'events'
import type {
  PermissionManager as IPermissionManager,
  PermissionCheckRequest,
  PermissionCheckResult,
  Permission,
  Role,
  User,
  UserRole,
  PermissionContext,
  PermissionScope,
  PermissionConfig,
  PermissionEvents
} from './types'
import { RoleManager } from './RoleManager'
import { AccessControl } from './AccessControl'
import { PermissionStorage } from './PermissionStorage'

/**
 * 权限管理器实现
 */
export class PermissionManager extends EventEmitter implements IPermissionManager {
  private config: PermissionConfig
  private roleManager: RoleManager
  private accessControl: AccessControl
  private storage: PermissionStorage
  private permissionCache: Map<string, PermissionCheckResult> = new Map()
  private userRolesCache: Map<string, Role[]> = new Map()
  private isInitialized: boolean = false

  constructor(config: PermissionConfig, storage: PermissionStorage) {
    super()
    this.config = config
    this.storage = storage
    this.roleManager = new RoleManager(storage)
    this.accessControl = new AccessControl(storage)
    
    this.setupEventListeners()
  }

  /**
   * 初始化权限管理器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // 初始化存储
      await this.storage.initialize()
      
      // 初始化内置角色和权限
      await this.initializeBuiltinRolesAndPermissions()
      
      this.isInitialized = true
      
      console.log('权限管理器初始化完成')
    } catch (error) {
      console.error('权限管理器初始化失败:', error)
      throw error
    }
  }

  /**
   * 检查权限
   */
  async checkPermission(request: PermissionCheckRequest): Promise<PermissionCheckResult> {
    if (!this.isInitialized) {
      throw new Error('权限管理器未初始化')
    }

    if (!this.config.enabled) {
      return {
        allowed: this.config.defaultPolicy === 'allow',
        reason: '权限检查已禁用',
        checkedAt: Date.now()
      }
    }

    try {
      // 检查缓存
      const cacheKey = this.generateCacheKey(request)
      if (this.config.cache.enabled) {
        const cached = this.permissionCache.get(cacheKey)
        if (cached && Date.now() - cached.checkedAt < this.config.cache.ttl) {
          return cached
        }
      }

      // 执行权限检查
      const result = await this.doCheckPermission(request)
      
      // 缓存结果
      if (this.config.cache.enabled) {
        this.permissionCache.set(cacheKey, result)
        
        // 清理过期缓存
        if (this.permissionCache.size > this.config.cache.maxSize) {
          this.cleanupCache()
        }
      }
      
      // 触发权限检查事件
      this.emit('permission:checked', request, result)
      
      return result
    } catch (error) {
      console.error('权限检查失败:', error)
      return {
        allowed: false,
        reason: '权限检查失败',
        checkedAt: Date.now()
      }
    }
  }

  /**
   * 批量检查权限
   */
  async checkPermissions(requests: PermissionCheckRequest[]): Promise<PermissionCheckResult[]> {
    const results = await Promise.all(
      requests.map(request => this.checkPermission(request))
    )
    return results
  }

  /**
   * 获取用户权限
   */
  async getUserPermissions(userId: string, context?: PermissionContext): Promise<Permission[]> {
    const userRoles = await this.getUserRoles(userId)
    const permissions: Permission[] = []
    
    for (const role of userRoles) {
      for (const permission of role.permissions) {
        // 检查权限范围
        if (this.isPermissionInScope(permission, context)) {
          permissions.push(permission)
        }
      }
    }
    
    // 去重
    const uniquePermissions = permissions.filter((permission, index, array) => 
      array.findIndex(p => p.id === permission.id) === index
    )
    
    return uniquePermissions
  }

  /**
   * 获取用户角色
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    // 检查缓存
    if (this.config.cache.enabled) {
      const cached = this.userRolesCache.get(userId)
      if (cached) {
        return cached
      }
    }

    const userRoles = await this.storage.getUserRoles(userId)
    const roles: Role[] = []
    
    for (const userRole of userRoles) {
      // 检查角色是否过期
      if (userRole.expiresAt && userRole.expiresAt < Date.now()) {
        continue
      }
      
      const role = await this.roleManager.getRole(userRole.roleId)
      if (role) {
        roles.push(role)
      }
    }
    
    // 缓存结果
    if (this.config.cache.enabled) {
      this.userRolesCache.set(userId, roles)
    }
    
    return roles
  }

  /**
   * 分配角色
   */
  async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    scope?: PermissionScope
  ): Promise<void> {
    // 检查角色是否存在
    const role = await this.roleManager.getRole(roleId)
    if (!role) {
      throw new Error(`角色不存在: ${roleId}`)
    }

    // 检查是否已分配
    const existingRoles = await this.storage.getUserRoles(userId)
    const existing = existingRoles.find(ur => ur.roleId === roleId)
    if (existing) {
      throw new Error(`用户已拥有该角色: ${roleId}`)
    }

    const userRole: UserRole = {
      userId,
      roleId,
      assignedAt: Date.now(),
      assignedBy,
      scope
    }

    await this.storage.saveUserRole(userRole)
    
    // 清理缓存
    this.userRolesCache.delete(userId)
    this.clearUserPermissionCache(userId)
    
    // 触发角色分配事件
    this.emit('role:assigned', userId, roleId, assignedBy)
    
    console.log(`用户 ${userId} 被分配角色 ${roleId}`)
  }

  /**
   * 撤销角色
   */
  async revokeRole(userId: string, roleId: string, revokedBy: string): Promise<void> {
    const userRoles = await this.storage.getUserRoles(userId)
    const userRole = userRoles.find(ur => ur.roleId === roleId)
    
    if (!userRole) {
      throw new Error(`用户未拥有该角色: ${roleId}`)
    }

    await this.storage.deleteUserRole(userId, roleId)
    
    // 清理缓存
    this.userRolesCache.delete(userId)
    this.clearUserPermissionCache(userId)
    
    // 触发角色撤销事件
    this.emit('role:revoked', userId, roleId, revokedBy)
    
    console.log(`用户 ${userId} 的角色 ${roleId} 被撤销`)
  }

  /**
   * 创建角色
   */
  async createRole(role: Omit<Role, 'id' | 'createdAt'>): Promise<Role> {
    const newRole = await this.roleManager.createRole(role)
    
    // 触发角色创建事件
    this.emit('role:created', newRole)
    
    return newRole
  }

  /**
   * 更新角色
   */
  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    const updatedRole = await this.roleManager.updateRole(roleId, updates)
    
    // 清理相关缓存
    this.clearRoleRelatedCache(roleId)
    
    // 触发角色更新事件
    this.emit('role:updated', updatedRole)
    
    return updatedRole
  }

  /**
   * 删除角色
   */
  async deleteRole(roleId: string): Promise<void> {
    // 检查是否有用户使用该角色
    const usersWithRole = await this.storage.getUsersByRole(roleId)
    if (usersWithRole.length > 0) {
      throw new Error(`角色正在被 ${usersWithRole.length} 个用户使用，无法删除`)
    }

    await this.roleManager.deleteRole(roleId)
    
    // 清理相关缓存
    this.clearRoleRelatedCache(roleId)
    
    // 触发角色删除事件
    this.emit('role:deleted', roleId)
  }

  /**
   * 创建权限
   */
  async createPermission(permission: Omit<Permission, 'id'>): Promise<Permission> {
    const newPermission: Permission = {
      ...permission,
      id: this.generatePermissionId()
    }

    await this.storage.savePermission(newPermission)
    
    // 触发权限创建事件
    this.emit('permission:created', newPermission)
    
    return newPermission
  }

  /**
   * 更新权限
   */
  async updatePermission(permissionId: string, updates: Partial<Permission>): Promise<Permission> {
    const permission = await this.storage.getPermission(permissionId)
    if (!permission) {
      throw new Error(`权限不存在: ${permissionId}`)
    }

    const updatedPermission = { ...permission, ...updates }
    await this.storage.savePermission(updatedPermission)
    
    // 清理相关缓存
    this.clearPermissionRelatedCache(permissionId)
    
    // 触发权限更新事件
    this.emit('permission:updated', updatedPermission)
    
    return updatedPermission
  }

  /**
   * 删除权限
   */
  async deletePermission(permissionId: string): Promise<void> {
    // 检查是否有角色使用该权限
    const rolesWithPermission = await this.storage.getRolesByPermission(permissionId)
    if (rolesWithPermission.length > 0) {
      throw new Error(`权限正在被 ${rolesWithPermission.length} 个角色使用，无法删除`)
    }

    await this.storage.deletePermission(permissionId)
    
    // 清理相关缓存
    this.clearPermissionRelatedCache(permissionId)
    
    // 触发权限删除事件
    this.emit('permission:deleted', permissionId)
  }

  /**
   * 执行权限检查
   */
  private async doCheckPermission(request: PermissionCheckRequest): Promise<PermissionCheckResult> {
    const { userId, resource, action, resourceId, context } = request

    // 检查超级管理员
    if (await this.isSuperAdmin(userId)) {
      return {
        allowed: true,
        reason: '超级管理员权限',
        checkedAt: Date.now()
      }
    }

    // 获取用户权限
    const userPermissions = await this.getUserPermissions(userId, context)
    
    // 查找匹配的权限
    const matchedPermissions = userPermissions.filter(permission => 
      this.isPermissionMatched(permission, resource, action, context)
    )

    if (matchedPermissions.length === 0) {
      return {
        allowed: false,
        reason: '没有匹配的权限',
        checkedAt: Date.now()
      }
    }

    // 检查权限条件
    for (const permission of matchedPermissions) {
      if (await this.checkPermissionConditions(permission, context)) {
        return {
          allowed: true,
          matchedPermissions: [permission],
          checkedAt: Date.now()
        }
      }
    }

    return {
      allowed: false,
      reason: '权限条件不满足',
      matchedPermissions,
      checkedAt: Date.now()
    }
  }

  /**
   * 检查是否为超级管理员
   */
  private async isSuperAdmin(userId: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId)
    return userRoles.some(role => role.id === this.config.superAdminRole)
  }

  /**
   * 检查权限是否匹配
   */
  private isPermissionMatched(
    permission: Permission,
    resource: string,
    action: string,
    context?: PermissionContext
  ): boolean {
    // 检查资源类型
    if (permission.resource !== resource && permission.resource !== '*') {
      return false
    }

    // 检查操作类型
    if (permission.action !== action && permission.action !== '*') {
      return false
    }

    return true
  }

  /**
   * 检查权限是否在范围内
   */
  private isPermissionInScope(permission: Permission, context?: PermissionContext): boolean {
    if (!permission.scope) {
      return true
    }

    const { type, value } = permission.scope

    switch (type) {
      case 'global':
        return true
      case 'organization':
        return context?.organizationId === value
      case 'project':
        return context?.projectId === value
      default:
        return true
    }
  }

  /**
   * 检查权限条件
   */
  private async checkPermissionConditions(
    permission: Permission,
    context?: PermissionContext
  ): Promise<boolean> {
    if (!permission.conditions || permission.conditions.length === 0) {
      return true
    }

    for (const condition of permission.conditions) {
      if (!await this.checkCondition(condition, context)) {
        return false
      }
    }

    return true
  }

  /**
   * 检查单个条件
   */
  private async checkCondition(condition: any, context?: PermissionContext): Promise<boolean> {
    // TODO: 实现条件检查逻辑
    return true
  }

  /**
   * 初始化内置角色和权限
   */
  private async initializeBuiltinRolesAndPermissions(): Promise<void> {
    // 创建内置权限
    const builtinPermissions = this.getBuiltinPermissions()
    for (const permission of builtinPermissions) {
      const existing = await this.storage.getPermission(permission.id)
      if (!existing) {
        await this.storage.savePermission(permission)
      }
    }

    // 创建内置角色
    const builtinRoles = this.getBuiltinRoles()
    for (const role of builtinRoles) {
      const existing = await this.roleManager.getRole(role.id)
      if (!existing) {
        await this.storage.saveRole(role)
      }
    }
  }

  /**
   * 获取内置权限
   */
  private getBuiltinPermissions(): Permission[] {
    return [
      {
        id: 'flowchart:read',
        name: '查看流程图',
        resource: 'flowchart',
        action: 'read',
        scope: { type: 'global' },
        builtin: true
      },
      {
        id: 'flowchart:create',
        name: '创建流程图',
        resource: 'flowchart',
        action: 'create',
        scope: { type: 'global' },
        builtin: true
      },
      {
        id: 'flowchart:update',
        name: '编辑流程图',
        resource: 'flowchart',
        action: 'update',
        scope: { type: 'global' },
        builtin: true
      },
      {
        id: 'flowchart:delete',
        name: '删除流程图',
        resource: 'flowchart',
        action: 'delete',
        scope: { type: 'global' },
        builtin: true
      },
      {
        id: 'process:execute',
        name: '执行流程',
        resource: 'process',
        action: 'execute',
        scope: { type: 'global' },
        builtin: true
      },
      {
        id: 'task:approve',
        name: '审批任务',
        resource: 'task',
        action: 'approve',
        scope: { type: 'global' },
        builtin: true
      },
      {
        id: 'system:admin',
        name: '系统管理',
        resource: 'system',
        action: 'admin',
        scope: { type: 'global' },
        builtin: true
      }
    ]
  }

  /**
   * 获取内置角色
   */
  private getBuiltinRoles(): Role[] {
    const permissions = this.getBuiltinPermissions()
    
    return [
      {
        id: 'super-admin',
        name: '超级管理员',
        description: '拥有所有权限的超级管理员',
        type: 'system',
        permissions: permissions,
        builtin: true,
        createdAt: Date.now(),
        createdBy: 'system',
        attributes: {}
      },
      {
        id: 'admin',
        name: '管理员',
        description: '系统管理员',
        type: 'system',
        permissions: permissions.filter(p => p.id !== 'system:admin'),
        builtin: true,
        createdAt: Date.now(),
        createdBy: 'system',
        attributes: {}
      },
      {
        id: 'editor',
        name: '编辑者',
        description: '可以创建和编辑流程图',
        type: 'organization',
        permissions: permissions.filter(p => 
          ['flowchart:read', 'flowchart:create', 'flowchart:update'].includes(p.id)
        ),
        builtin: true,
        createdAt: Date.now(),
        createdBy: 'system',
        attributes: {}
      },
      {
        id: 'viewer',
        name: '查看者',
        description: '只能查看流程图',
        type: 'organization',
        permissions: permissions.filter(p => p.id === 'flowchart:read'),
        builtin: true,
        createdAt: Date.now(),
        createdBy: 'system',
        attributes: {}
      },
      {
        id: 'approver',
        name: '审批者',
        description: '可以审批任务',
        type: 'project',
        permissions: permissions.filter(p => 
          ['flowchart:read', 'task:approve'].includes(p.id)
        ),
        builtin: true,
        createdAt: Date.now(),
        createdBy: 'system',
        attributes: {}
      }
    ]
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(request: PermissionCheckRequest): string {
    const { userId, resource, action, resourceId, context } = request
    const contextStr = context ? JSON.stringify(context) : ''
    return `${userId}:${resource}:${action}:${resourceId || ''}:${contextStr}`
  }

  /**
   * 生成权限ID
   */
  private generatePermissionId(): string {
    return `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 清理缓存
   */
  private cleanupCache(): void {
    const now = Date.now()
    const ttl = this.config.cache.ttl
    
    for (const [key, result] of this.permissionCache.entries()) {
      if (now - result.checkedAt > ttl) {
        this.permissionCache.delete(key)
      }
    }
  }

  /**
   * 清理用户权限缓存
   */
  private clearUserPermissionCache(userId: string): void {
    for (const key of this.permissionCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.permissionCache.delete(key)
      }
    }
  }

  /**
   * 清理角色相关缓存
   */
  private clearRoleRelatedCache(roleId: string): void {
    this.userRolesCache.clear()
    this.permissionCache.clear()
  }

  /**
   * 清理权限相关缓存
   */
  private clearPermissionRelatedCache(permissionId: string): void {
    this.userRolesCache.clear()
    this.permissionCache.clear()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听角色管理器事件
    this.roleManager.on('role:created', (role: Role) => {
      this.emit('role:created', role)
    })

    this.roleManager.on('role:updated', (role: Role) => {
      this.emit('role:updated', role)
      this.clearRoleRelatedCache(role.id)
    })

    this.roleManager.on('role:deleted', (roleId: string) => {
      this.emit('role:deleted', roleId)
      this.clearRoleRelatedCache(roleId)
    })

    // 监听访问控制事件
    this.accessControl.on('access:granted', (resourceId: string, userId: string, permissions: string[]) => {
      this.emit('access:granted', resourceId, userId, permissions)
      this.clearUserPermissionCache(userId)
    })

    this.accessControl.on('access:revoked', (resourceId: string, userId: string) => {
      this.emit('access:revoked', resourceId, userId)
      this.clearUserPermissionCache(userId)
    })
  }
}
