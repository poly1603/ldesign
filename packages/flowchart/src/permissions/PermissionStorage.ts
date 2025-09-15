/**
 * 权限存储接口和实现
 * 
 * 提供权限数据的持久化存储
 */

import type {
  User,
  Role,
  Permission,
  UserRole,
  ResourceAccess,
  ResourceType,
  Organization,
  Project
} from './types'

/**
 * 权限存储接口
 */
export abstract class PermissionStorage {
  /** 初始化存储 */
  abstract initialize(): Promise<void>

  /** 用户管理 */
  abstract saveUser(user: User): Promise<void>
  abstract getUser(userId: string): Promise<User | null>
  abstract getUsers(): Promise<User[]>
  abstract deleteUser(userId: string): Promise<void>

  /** 角色管理 */
  abstract saveRole(role: Role): Promise<void>
  abstract getRole(roleId: string): Promise<Role | null>
  abstract getRoles(): Promise<Role[]>
  abstract deleteRole(roleId: string): Promise<void>
  abstract getRolesByPermission(permissionId: string): Promise<Role[]>

  /** 权限管理 */
  abstract savePermission(permission: Permission): Promise<void>
  abstract getPermission(permissionId: string): Promise<Permission | null>
  abstract getPermissions(): Promise<Permission[]>
  abstract deletePermission(permissionId: string): Promise<void>

  /** 用户角色关联 */
  abstract saveUserRole(userRole: UserRole): Promise<void>
  abstract getUserRoles(userId: string): Promise<UserRole[]>
  abstract deleteUserRole(userId: string, roleId: string): Promise<void>
  abstract getUsersByRole(roleId: string): Promise<string[]>

  /** 资源访问控制 */
  abstract saveResourceAccess(access: ResourceAccess): Promise<void>
  abstract getResourceAccess(resourceId: string, resourceType: ResourceType): Promise<ResourceAccess[]>
  abstract deleteResourceAccess(resourceId: string, resourceType: ResourceType, userId: string): Promise<void>
  abstract getUserResourceAccess(userId: string): Promise<ResourceAccess[]>
  abstract getAllResourceAccess(): Promise<ResourceAccess[]>

  /** 组织管理 */
  abstract saveOrganization(organization: Organization): Promise<void>
  abstract getOrganization(organizationId: string): Promise<Organization | null>
  abstract getOrganizations(): Promise<Organization[]>
  abstract deleteOrganization(organizationId: string): Promise<void>

  /** 项目管理 */
  abstract saveProject(project: Project): Promise<void>
  abstract getProject(projectId: string): Promise<Project | null>
  abstract getProjects(): Promise<Project[]>
  abstract deleteProject(projectId: string): Promise<void>
}

/**
 * 内存权限存储实现
 */
export class MemoryPermissionStorage extends PermissionStorage {
  private users: Map<string, User> = new Map()
  private roles: Map<string, Role> = new Map()
  private permissions: Map<string, Permission> = new Map()
  private userRoles: Map<string, UserRole[]> = new Map()
  private resourceAccess: Map<string, ResourceAccess[]> = new Map()
  private organizations: Map<string, Organization> = new Map()
  private projects: Map<string, Project> = new Map()
  private isInitialized: boolean = false

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    // 清空所有数据
    this.users.clear()
    this.roles.clear()
    this.permissions.clear()
    this.userRoles.clear()
    this.resourceAccess.clear()
    this.organizations.clear()
    this.projects.clear()

    this.isInitialized = true
    console.log('内存权限存储初始化完成')
  }

  // 用户管理
  async saveUser(user: User): Promise<void> {
    this.users.set(user.id, { ...user })
  }

  async getUser(userId: string): Promise<User | null> {
    const user = this.users.get(userId)
    return user ? { ...user } : null
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values()).map(user => ({ ...user }))
  }

  async deleteUser(userId: string): Promise<void> {
    this.users.delete(userId)
    this.userRoles.delete(userId)
    
    // 删除用户的资源访问权限
    for (const [key, accessList] of this.resourceAccess.entries()) {
      const filteredList = accessList.filter(access => access.userId !== userId)
      if (filteredList.length === 0) {
        this.resourceAccess.delete(key)
      } else {
        this.resourceAccess.set(key, filteredList)
      }
    }
  }

  // 角色管理
  async saveRole(role: Role): Promise<void> {
    this.roles.set(role.id, { ...role })
  }

  async getRole(roleId: string): Promise<Role | null> {
    const role = this.roles.get(roleId)
    return role ? { ...role } : null
  }

  async getRoles(): Promise<Role[]> {
    return Array.from(this.roles.values()).map(role => ({ ...role }))
  }

  async deleteRole(roleId: string): Promise<void> {
    this.roles.delete(roleId)
    
    // 删除用户的该角色关联
    for (const [userId, userRoleList] of this.userRoles.entries()) {
      const filteredList = userRoleList.filter(ur => ur.roleId !== roleId)
      if (filteredList.length === 0) {
        this.userRoles.delete(userId)
      } else {
        this.userRoles.set(userId, filteredList)
      }
    }
  }

  async getRolesByPermission(permissionId: string): Promise<Role[]> {
    const roles = Array.from(this.roles.values())
    return roles.filter(role => 
      role.permissions.some(permission => permission.id === permissionId)
    )
  }

  // 权限管理
  async savePermission(permission: Permission): Promise<void> {
    this.permissions.set(permission.id, { ...permission })
  }

  async getPermission(permissionId: string): Promise<Permission | null> {
    const permission = this.permissions.get(permissionId)
    return permission ? { ...permission } : null
  }

  async getPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values()).map(permission => ({ ...permission }))
  }

  async deletePermission(permissionId: string): Promise<void> {
    this.permissions.delete(permissionId)
    
    // 从角色中移除该权限
    for (const role of this.roles.values()) {
      role.permissions = role.permissions.filter(p => p.id !== permissionId)
    }
  }

  // 用户角色关联
  async saveUserRole(userRole: UserRole): Promise<void> {
    const userRoleList = this.userRoles.get(userRole.userId) || []
    
    // 移除现有的相同角色关联
    const filteredList = userRoleList.filter(ur => ur.roleId !== userRole.roleId)
    filteredList.push({ ...userRole })
    
    this.userRoles.set(userRole.userId, filteredList)
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const userRoleList = this.userRoles.get(userId) || []
    return userRoleList.map(ur => ({ ...ur }))
  }

  async deleteUserRole(userId: string, roleId: string): Promise<void> {
    const userRoleList = this.userRoles.get(userId) || []
    const filteredList = userRoleList.filter(ur => ur.roleId !== roleId)
    
    if (filteredList.length === 0) {
      this.userRoles.delete(userId)
    } else {
      this.userRoles.set(userId, filteredList)
    }
  }

  async getUsersByRole(roleId: string): Promise<string[]> {
    const userIds: string[] = []
    
    for (const [userId, userRoleList] of this.userRoles.entries()) {
      if (userRoleList.some(ur => ur.roleId === roleId)) {
        userIds.push(userId)
      }
    }
    
    return userIds
  }

  // 资源访问控制
  async saveResourceAccess(access: ResourceAccess): Promise<void> {
    const key = `${access.resourceType}:${access.resourceId}`
    const accessList = this.resourceAccess.get(key) || []
    
    // 移除现有的相同用户访问权限
    const filteredList = accessList.filter(a => a.userId !== access.userId)
    filteredList.push({ ...access })
    
    this.resourceAccess.set(key, filteredList)
  }

  async getResourceAccess(resourceId: string, resourceType: ResourceType): Promise<ResourceAccess[]> {
    const key = `${resourceType}:${resourceId}`
    const accessList = this.resourceAccess.get(key) || []
    return accessList.map(access => ({ ...access }))
  }

  async deleteResourceAccess(resourceId: string, resourceType: ResourceType, userId: string): Promise<void> {
    const key = `${resourceType}:${resourceId}`
    const accessList = this.resourceAccess.get(key) || []
    const filteredList = accessList.filter(access => access.userId !== userId)
    
    if (filteredList.length === 0) {
      this.resourceAccess.delete(key)
    } else {
      this.resourceAccess.set(key, filteredList)
    }
  }

  async getUserResourceAccess(userId: string): Promise<ResourceAccess[]> {
    const userAccess: ResourceAccess[] = []
    
    for (const accessList of this.resourceAccess.values()) {
      for (const access of accessList) {
        if (access.userId === userId) {
          userAccess.push({ ...access })
        }
      }
    }
    
    return userAccess
  }

  async getAllResourceAccess(): Promise<ResourceAccess[]> {
    const allAccess: ResourceAccess[] = []
    
    for (const accessList of this.resourceAccess.values()) {
      for (const access of accessList) {
        allAccess.push({ ...access })
      }
    }
    
    return allAccess
  }

  // 组织管理
  async saveOrganization(organization: Organization): Promise<void> {
    this.organizations.set(organization.id, { ...organization })
  }

  async getOrganization(organizationId: string): Promise<Organization | null> {
    const organization = this.organizations.get(organizationId)
    return organization ? { ...organization } : null
  }

  async getOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values()).map(org => ({ ...org }))
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    this.organizations.delete(organizationId)
  }

  // 项目管理
  async saveProject(project: Project): Promise<void> {
    this.projects.set(project.id, { ...project })
  }

  async getProject(projectId: string): Promise<Project | null> {
    const project = this.projects.get(projectId)
    return project ? { ...project } : null
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).map(project => ({ ...project }))
  }

  async deleteProject(projectId: string): Promise<void> {
    this.projects.delete(projectId)
  }

  // 数据统计
  async getStats(): Promise<{
    userCount: number
    roleCount: number
    permissionCount: number
    userRoleCount: number
    resourceAccessCount: number
    organizationCount: number
    projectCount: number
  }> {
    let userRoleCount = 0
    for (const userRoleList of this.userRoles.values()) {
      userRoleCount += userRoleList.length
    }

    let resourceAccessCount = 0
    for (const accessList of this.resourceAccess.values()) {
      resourceAccessCount += accessList.length
    }

    return {
      userCount: this.users.size,
      roleCount: this.roles.size,
      permissionCount: this.permissions.size,
      userRoleCount,
      resourceAccessCount,
      organizationCount: this.organizations.size,
      projectCount: this.projects.size
    }
  }

  // 数据导出
  async exportData(): Promise<{
    users: User[]
    roles: Role[]
    permissions: Permission[]
    userRoles: { userId: string; roles: UserRole[] }[]
    resourceAccess: { key: string; access: ResourceAccess[] }[]
    organizations: Organization[]
    projects: Project[]
  }> {
    const userRoles: { userId: string; roles: UserRole[] }[] = []
    for (const [userId, roles] of this.userRoles.entries()) {
      userRoles.push({ userId, roles: [...roles] })
    }

    const resourceAccess: { key: string; access: ResourceAccess[] }[] = []
    for (const [key, access] of this.resourceAccess.entries()) {
      resourceAccess.push({ key, access: [...access] })
    }

    return {
      users: await this.getUsers(),
      roles: await this.getRoles(),
      permissions: await this.getPermissions(),
      userRoles,
      resourceAccess,
      organizations: await this.getOrganizations(),
      projects: await this.getProjects()
    }
  }

  // 数据导入
  async importData(data: {
    users?: User[]
    roles?: Role[]
    permissions?: Permission[]
    userRoles?: { userId: string; roles: UserRole[] }[]
    resourceAccess?: { key: string; access: ResourceAccess[] }[]
    organizations?: Organization[]
    projects?: Project[]
  }): Promise<void> {
    // 导入用户
    if (data.users) {
      for (const user of data.users) {
        await this.saveUser(user)
      }
    }

    // 导入权限
    if (data.permissions) {
      for (const permission of data.permissions) {
        await this.savePermission(permission)
      }
    }

    // 导入角色
    if (data.roles) {
      for (const role of data.roles) {
        await this.saveRole(role)
      }
    }

    // 导入用户角色关联
    if (data.userRoles) {
      for (const { userId, roles } of data.userRoles) {
        for (const userRole of roles) {
          await this.saveUserRole(userRole)
        }
      }
    }

    // 导入资源访问权限
    if (data.resourceAccess) {
      for (const { key, access } of data.resourceAccess) {
        for (const resourceAccess of access) {
          await this.saveResourceAccess(resourceAccess)
        }
      }
    }

    // 导入组织
    if (data.organizations) {
      for (const organization of data.organizations) {
        await this.saveOrganization(organization)
      }
    }

    // 导入项目
    if (data.projects) {
      for (const project of data.projects) {
        await this.saveProject(project)
      }
    }
  }

  // 清空所有数据
  async clearAll(): Promise<void> {
    this.users.clear()
    this.roles.clear()
    this.permissions.clear()
    this.userRoles.clear()
    this.resourceAccess.clear()
    this.organizations.clear()
    this.projects.clear()
  }
}
