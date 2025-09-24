/**
 * 权限管理插件
 * 
 * 为流程图编辑器提供权限管理功能
 */

import { BasePlugin } from '../BasePlugin'
import type { LogicFlow } from '@logicflow/core'
import { PermissionManager } from '../../permissions/PermissionManager'
import { MemoryPermissionStorage } from '../../permissions/PermissionStorage'
import type {
  PermissionConfig,
  PermissionCheckRequest,
  PermissionCheckResult,
  Role,
  Permission,
  User,
  ResourceAccess,
  PermissionContext
} from '../../permissions/types'

/**
 * 权限插件配置
 */
export interface PermissionPluginConfig {
  /** 是否启用权限检查 */
  enabled?: boolean
  /** 默认权限策略 */
  defaultPolicy?: 'allow' | 'deny'
  /** 超级管理员角色 */
  superAdminRole?: string
  /** 当前用户ID */
  currentUserId?: string
  /** 缓存配置 */
  cache?: {
    enabled?: boolean
    ttl?: number
    maxSize?: number
  }
  /** 审计配置 */
  audit?: {
    enabled?: boolean
    logLevel?: 'basic' | 'detailed' | 'full'
    retentionDays?: number
  }
  /** 是否显示权限管理面板 */
  showPermissionPanel?: boolean
  /** 权限检查失败时的处理方式 */
  onPermissionDenied?: (request: PermissionCheckRequest, result: PermissionCheckResult) => void
}

/**
 * 权限管理插件
 */
export class PermissionPlugin extends BasePlugin {
  static pluginName = 'PermissionPlugin'
  
  private permissionManager: PermissionManager | null = null
  private storage: MemoryPermissionStorage | null = null
  private config: PermissionPluginConfig = {}
  private currentUserId: string = 'anonymous'
  private permissionPanel: HTMLElement | null = null

  constructor() {
    super()
  }

  /**
   * 安装插件
   */
  install(lf: LogicFlow): void {
    super.install(lf)
    console.log('权限管理插件已安装')
  }

  /**
   * 卸载插件
   */
  uninstall(): void {
    this.disablePermission()
    super.uninstall()
    console.log('权限管理插件已卸载')
  }

  /**
   * 启用权限管理
   */
  async enablePermission(config: PermissionPluginConfig = {}): Promise<void> {
    this.config = {
      enabled: true,
      defaultPolicy: 'deny',
      superAdminRole: 'super-admin',
      currentUserId: 'anonymous',
      cache: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5分钟
        maxSize: 1000
      },
      audit: {
        enabled: true,
        logLevel: 'basic',
        retentionDays: 30
      },
      showPermissionPanel: true,
      ...config
    }

    this.currentUserId = this.config.currentUserId || 'anonymous'

    // 创建存储和权限管理器
    this.storage = new MemoryPermissionStorage()
    
    const permissionConfig: PermissionConfig = {
      enabled: this.config.enabled!,
      defaultPolicy: this.config.defaultPolicy!,
      superAdminRole: this.config.superAdminRole!,
      cache: this.config.cache!,
      audit: this.config.audit!
    }

    this.permissionManager = new PermissionManager(permissionConfig, this.storage)
    
    // 初始化权限管理器
    await this.permissionManager.initialize()

    // 设置事件监听器
    this.setupEventListeners()

    // 创建权限管理面板
    if (this.config.showPermissionPanel) {
      this.createPermissionPanel()
    }

    // 拦截LogicFlow操作
    this.interceptLogicFlowOperations()

    console.log('权限管理已启用')
  }

  /**
   * 禁用权限管理
   */
  disablePermission(): void {
    if (this.permissionManager) {
      this.permissionManager.removeAllListeners()
      this.permissionManager = null
    }

    if (this.storage) {
      this.storage = null
    }

    if (this.permissionPanel) {
      this.permissionPanel.remove()
      this.permissionPanel = null
    }

    this.config = {}
    console.log('权限管理已禁用')
  }

  /**
   * 检查权限
   */
  async checkPermission(
    resource: string,
    action: string,
    resourceId?: string,
    context?: PermissionContext
  ): Promise<boolean> {
    if (!this.permissionManager) {
      return this.config.defaultPolicy === 'allow'
    }

    const request: PermissionCheckRequest = {
      userId: this.currentUserId,
      resource: resource as any,
      action: action as any,
      resourceId,
      context
    }

    const result = await this.permissionManager.checkPermission(request)
    
    if (!result.allowed && this.config.onPermissionDenied) {
      this.config.onPermissionDenied(request, result)
    }

    return result.allowed
  }

  /**
   * 设置当前用户
   */
  setCurrentUser(userId: string): void {
    this.currentUserId = userId
    console.log(`当前用户已设置为: ${userId}`)
  }

  /**
   * 获取当前用户角色
   */
  async getCurrentUserRoles(): Promise<Role[]> {
    if (!this.permissionManager) {
      return []
    }

    return await this.permissionManager.getUserRoles(this.currentUserId)
  }

  /**
   * 获取当前用户权限
   */
  async getCurrentUserPermissions(context?: PermissionContext): Promise<Permission[]> {
    if (!this.permissionManager) {
      return []
    }

    return await this.permissionManager.getUserPermissions(this.currentUserId, context)
  }

  /**
   * 分配角色给用户
   */
  async assignRole(userId: string, roleId: string): Promise<void> {
    if (!this.permissionManager) {
      throw new Error('权限管理器未初始化')
    }

    // 检查是否有分配权限的权限
    const canAssign = await this.checkPermission('role', 'assign')
    if (!canAssign) {
      throw new Error('没有分配角色的权限')
    }

    await this.permissionManager.assignRole(userId, roleId, this.currentUserId)
  }

  /**
   * 撤销用户角色
   */
  async revokeRole(userId: string, roleId: string): Promise<void> {
    if (!this.permissionManager) {
      throw new Error('权限管理器未初始化')
    }

    // 检查是否有撤销权限的权限
    const canRevoke = await this.checkPermission('role', 'revoke')
    if (!canRevoke) {
      throw new Error('没有撤销角色的权限')
    }

    await this.permissionManager.revokeRole(userId, roleId, this.currentUserId)
  }

  /**
   * 创建角色
   */
  async createRole(role: Omit<Role, 'id' | 'createdAt'>): Promise<Role> {
    if (!this.permissionManager) {
      throw new Error('权限管理器未初始化')
    }

    // 检查是否有创建角色的权限
    const canCreate = await this.checkPermission('role', 'create')
    if (!canCreate) {
      throw new Error('没有创建角色的权限')
    }

    return await this.permissionManager.createRole({
      ...role,
      createdBy: this.currentUserId
    })
  }

  /**
   * 获取所有角色
   */
  async getRoles(): Promise<Role[]> {
    if (!this.permissionManager) {
      return []
    }

    // 检查是否有查看角色的权限
    const canRead = await this.checkPermission('role', 'read')
    if (!canRead) {
      return []
    }

    return await this.permissionManager.roleManager.getRoles()
  }

  /**
   * 授予资源访问权限
   */
  async grantResourceAccess(
    resourceId: string,
    resourceType: string,
    userId: string,
    permissions: string[]
  ): Promise<void> {
    if (!this.permissionManager) {
      throw new Error('权限管理器未初始化')
    }

    // 检查是否有授予权限的权限
    const canGrant = await this.checkPermission(resourceType, 'manage', resourceId)
    if (!canGrant) {
      throw new Error('没有授予资源访问权限的权限')
    }

    await this.permissionManager.accessControl.grantAccess(
      resourceId,
      resourceType as any,
      userId,
      permissions,
      this.currentUserId
    )
  }

  /**
   * 撤销资源访问权限
   */
  async revokeResourceAccess(
    resourceId: string,
    resourceType: string,
    userId: string
  ): Promise<void> {
    if (!this.permissionManager) {
      throw new Error('权限管理器未初始化')
    }

    // 检查是否有撤销权限的权限
    const canRevoke = await this.checkPermission(resourceType, 'manage', resourceId)
    if (!canRevoke) {
      throw new Error('没有撤销资源访问权限的权限')
    }

    await this.permissionManager.accessControl.revokeAccess(
      resourceId,
      resourceType as any,
      userId
    )
  }

  /**
   * 获取资源访问权限
   */
  async getResourceAccess(resourceId: string, resourceType: string): Promise<ResourceAccess[]> {
    if (!this.permissionManager) {
      return []
    }

    // 检查是否有查看权限的权限
    const canRead = await this.checkPermission(resourceType, 'read', resourceId)
    if (!canRead) {
      return []
    }

    return await this.permissionManager.accessControl.getResourceAccess(
      resourceId,
      resourceType as any
    )
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.permissionManager) {
      return
    }

    // 监听权限检查事件
    this.permissionManager.on('permission:checked', (request, result) => {
      if (this.config.audit?.enabled) {
        console.log('权限检查:', {
          user: request.userId,
          resource: request.resource,
          action: request.action,
          allowed: result.allowed,
          reason: result.reason
        })
      }
    })

    // 监听角色分配事件
    this.permissionManager.on('role:assigned', (userId, roleId, assignedBy) => {
      console.log(`角色分配: 用户 ${userId} 被 ${assignedBy} 分配角色 ${roleId}`)
      this.updatePermissionPanel()
    })

    // 监听角色撤销事件
    this.permissionManager.on('role:revoked', (userId, roleId, revokedBy) => {
      console.log(`角色撤销: 用户 ${userId} 的角色 ${roleId} 被 ${revokedBy} 撤销`)
      this.updatePermissionPanel()
    })

    // 监听访问权限授予事件
    this.permissionManager.on('access:granted', (resourceId, userId, permissions) => {
      console.log(`访问权限授予: 用户 ${userId} 被授予资源 ${resourceId} 的权限:`, permissions)
    })

    // 监听访问权限撤销事件
    this.permissionManager.on('access:revoked', (resourceId, userId) => {
      console.log(`访问权限撤销: 用户 ${userId} 的资源 ${resourceId} 访问权限被撤销`)
    })
  }

  /**
   * 拦截LogicFlow操作
   */
  private interceptLogicFlowOperations(): void {
    if (!this.lf) {
      return
    }

    // 拦截节点创建
    const originalAddNode = this.lf.addNode.bind(this.lf)
    this.lf.addNode = async (nodeConfig: any) => {
      const canCreate = await this.checkPermission('node', 'create')
      if (!canCreate) {
        console.warn('没有创建节点的权限')
        return null
      }
      return originalAddNode(nodeConfig)
    }

    // 拦截节点删除
    const originalDeleteNode = this.lf.deleteNode.bind(this.lf)
    this.lf.deleteNode = async (nodeId: string) => {
      const canDelete = await this.checkPermission('node', 'delete', nodeId)
      if (!canDelete) {
        console.warn('没有删除节点的权限')
        return
      }
      originalDeleteNode(nodeId)
    }

    // 拦截边创建
    const originalAddEdge = this.lf.addEdge.bind(this.lf)
    this.lf.addEdge = async (edgeConfig: any) => {
      const canCreate = await this.checkPermission('edge', 'create')
      if (!canCreate) {
        console.warn('没有创建连线的权限')
        return null
      }
      return originalAddEdge(edgeConfig)
    }

    // 拦截边删除
    const originalDeleteEdge = this.lf.deleteEdge.bind(this.lf)
    this.lf.deleteEdge = async (edgeId: string) => {
      const canDelete = await this.checkPermission('edge', 'delete', edgeId)
      if (!canDelete) {
        console.warn('没有删除连线的权限')
        return
      }
      originalDeleteEdge(edgeId)
    }
  }

  /**
   * 创建权限管理面板
   */
  private createPermissionPanel(): void {
    if (!this.lf?.container) {
      return
    }

    const panel = document.createElement('div')
    panel.className = 'lf-permission-panel'
    panel.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 300px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
      font-size: 12px;
    `

    const header = document.createElement('div')
    header.style.cssText = `
      padding: 8px 12px;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      font-weight: bold;
    `
    header.textContent = '权限管理'

    const content = document.createElement('div')
    content.className = 'permission-content'
    content.style.cssText = `
      padding: 12px;
      max-height: 300px;
      overflow-y: auto;
    `

    panel.appendChild(header)
    panel.appendChild(content)
    
    this.lf.container.appendChild(panel)
    this.permissionPanel = panel

    this.updatePermissionPanel()
  }

  /**
   * 更新权限管理面板
   */
  private async updatePermissionPanel(): Promise<void> {
    if (!this.permissionPanel) {
      return
    }

    const content = this.permissionPanel.querySelector('.permission-content') as HTMLElement
    if (!content) {
      return
    }

    try {
      const roles = await this.getCurrentUserRoles()
      const permissions = await this.getCurrentUserPermissions()

      content.innerHTML = `
        <div style="margin-bottom: 12px;">
          <strong>当前用户:</strong> ${this.currentUserId}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>角色 (${roles.length}):</strong>
          <div style="margin-top: 4px;">
            ${roles.map(role => `
              <div style="padding: 2px 6px; background: #e6f7ff; border: 1px solid #91d5ff; border-radius: 2px; margin: 2px 0; font-size: 11px;">
                ${role.name}
              </div>
            `).join('')}
          </div>
        </div>
        <div>
          <strong>权限 (${permissions.length}):</strong>
          <div style="margin-top: 4px;">
            ${permissions.map(permission => `
              <div style="padding: 2px 6px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 2px; margin: 2px 0; font-size: 11px;">
                ${permission.name}
              </div>
            `).join('')}
          </div>
        </div>
      `
    } catch (error) {
      content.innerHTML = `<div style="color: red;">权限信息加载失败: ${error.message}</div>`
    }
  }
}
