/**
 * 权限管理系统类型定义
 */

/**
 * 用户信息
 */
export interface User {
  /** 用户ID */
  id: string
  /** 用户名 */
  username: string
  /** 显示名称 */
  displayName: string
  /** 邮箱 */
  email: string
  /** 头像URL */
  avatar?: string
  /** 用户状态 */
  status: UserStatus
  /** 创建时间 */
  createdAt: number
  /** 最后登录时间 */
  lastLoginAt?: number
  /** 用户属性 */
  attributes: Record<string, any>
}

/**
 * 用户状态
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted'

/**
 * 角色定义
 */
export interface Role {
  /** 角色ID */
  id: string
  /** 角色名称 */
  name: string
  /** 角色描述 */
  description?: string
  /** 角色类型 */
  type: RoleType
  /** 角色权限 */
  permissions: Permission[]
  /** 是否内置角色 */
  builtin: boolean
  /** 创建时间 */
  createdAt: number
  /** 创建者 */
  createdBy: string
  /** 角色属性 */
  attributes: Record<string, any>
}

/**
 * 角色类型
 */
export type RoleType = 'system' | 'organization' | 'project' | 'custom'

/**
 * 权限定义
 */
export interface Permission {
  /** 权限ID */
  id: string
  /** 权限名称 */
  name: string
  /** 权限描述 */
  description?: string
  /** 资源类型 */
  resource: ResourceType
  /** 操作类型 */
  action: ActionType
  /** 权限范围 */
  scope: PermissionScope
  /** 权限条件 */
  conditions?: PermissionCondition[]
  /** 是否内置权限 */
  builtin: boolean
}

/**
 * 资源类型
 */
export type ResourceType = 
  | 'flowchart'      // 流程图
  | 'node'           // 节点
  | 'edge'           // 连线
  | 'template'       // 模板
  | 'version'        // 版本
  | 'process'        // 流程实例
  | 'task'           // 任务
  | 'comment'        // 评论
  | 'user'           // 用户
  | 'role'           // 角色
  | 'organization'   // 组织
  | 'project'        // 项目
  | 'system'         // 系统

/**
 * 操作类型
 */
export type ActionType = 
  | 'create'         // 创建
  | 'read'           // 读取
  | 'update'         // 更新
  | 'delete'         // 删除
  | 'execute'        // 执行
  | 'approve'        // 审批
  | 'reject'         // 拒绝
  | 'assign'         // 分配
  | 'share'          // 分享
  | 'export'         // 导出
  | 'import'         // 导入
  | 'manage'         // 管理
  | 'admin'          // 管理员操作

/**
 * 权限范围
 */
export interface PermissionScope {
  /** 范围类型 */
  type: ScopeType
  /** 范围值 */
  value?: string | string[]
  /** 是否继承 */
  inherit?: boolean
}

/**
 * 范围类型
 */
export type ScopeType = 
  | 'global'         // 全局
  | 'organization'   // 组织
  | 'project'        // 项目
  | 'owner'          // 所有者
  | 'assigned'       // 分配给自己的
  | 'custom'         // 自定义

/**
 * 权限条件
 */
export interface PermissionCondition {
  /** 条件类型 */
  type: ConditionType
  /** 条件字段 */
  field: string
  /** 条件操作符 */
  operator: ConditionOperator
  /** 条件值 */
  value: any
}

/**
 * 条件类型
 */
export type ConditionType = 'attribute' | 'time' | 'location' | 'custom'

/**
 * 条件操作符
 */
export type ConditionOperator = 
  | 'eq'             // 等于
  | 'ne'             // 不等于
  | 'gt'             // 大于
  | 'gte'            // 大于等于
  | 'lt'             // 小于
  | 'lte'            // 小于等于
  | 'in'             // 包含
  | 'nin'            // 不包含
  | 'contains'       // 字符串包含
  | 'startsWith'     // 字符串开始
  | 'endsWith'       // 字符串结束
  | 'regex'          // 正则表达式

/**
 * 用户角色关联
 */
export interface UserRole {
  /** 用户ID */
  userId: string
  /** 角色ID */
  roleId: string
  /** 分配时间 */
  assignedAt: number
  /** 分配者 */
  assignedBy: string
  /** 过期时间 */
  expiresAt?: number
  /** 关联范围 */
  scope?: PermissionScope
}

/**
 * 权限检查请求
 */
export interface PermissionCheckRequest {
  /** 用户ID */
  userId: string
  /** 资源类型 */
  resource: ResourceType
  /** 操作类型 */
  action: ActionType
  /** 资源ID */
  resourceId?: string
  /** 上下文信息 */
  context?: PermissionContext
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  /** 是否允许 */
  allowed: boolean
  /** 拒绝原因 */
  reason?: string
  /** 匹配的权限 */
  matchedPermissions?: Permission[]
  /** 检查时间 */
  checkedAt: number
}

/**
 * 权限上下文
 */
export interface PermissionContext {
  /** 组织ID */
  organizationId?: string
  /** 项目ID */
  projectId?: string
  /** 流程图ID */
  flowchartId?: string
  /** 流程实例ID */
  processInstanceId?: string
  /** 任务ID */
  taskId?: string
  /** 请求IP */
  ip?: string
  /** 用户代理 */
  userAgent?: string
  /** 时间戳 */
  timestamp?: number
  /** 自定义属性 */
  attributes?: Record<string, any>
}

/**
 * 组织结构
 */
export interface Organization {
  /** 组织ID */
  id: string
  /** 组织名称 */
  name: string
  /** 组织描述 */
  description?: string
  /** 父组织ID */
  parentId?: string
  /** 组织类型 */
  type: OrganizationType
  /** 组织层级 */
  level: number
  /** 组织路径 */
  path: string
  /** 组织状态 */
  status: OrganizationStatus
  /** 创建时间 */
  createdAt: number
  /** 创建者 */
  createdBy: string
  /** 组织属性 */
  attributes: Record<string, any>
}

/**
 * 组织类型
 */
export type OrganizationType = 'company' | 'department' | 'team' | 'group' | 'custom'

/**
 * 组织状态
 */
export type OrganizationStatus = 'active' | 'inactive' | 'suspended' | 'deleted'

/**
 * 用户组织关联
 */
export interface UserOrganization {
  /** 用户ID */
  userId: string
  /** 组织ID */
  organizationId: string
  /** 职位 */
  position?: string
  /** 加入时间 */
  joinedAt: number
  /** 离开时间 */
  leftAt?: number
  /** 是否主要组织 */
  primary: boolean
}

/**
 * 项目信息
 */
export interface Project {
  /** 项目ID */
  id: string
  /** 项目名称 */
  name: string
  /** 项目描述 */
  description?: string
  /** 所属组织ID */
  organizationId: string
  /** 项目状态 */
  status: ProjectStatus
  /** 项目类型 */
  type: ProjectType
  /** 创建时间 */
  createdAt: number
  /** 创建者 */
  createdBy: string
  /** 项目成员 */
  members: ProjectMember[]
  /** 项目属性 */
  attributes: Record<string, any>
}

/**
 * 项目状态
 */
export type ProjectStatus = 'active' | 'inactive' | 'completed' | 'cancelled' | 'archived'

/**
 * 项目类型
 */
export type ProjectType = 'workflow' | 'process' | 'template' | 'custom'

/**
 * 项目成员
 */
export interface ProjectMember {
  /** 用户ID */
  userId: string
  /** 角色ID */
  roleId: string
  /** 加入时间 */
  joinedAt: number
  /** 加入者 */
  addedBy: string
  /** 离开时间 */
  leftAt?: number
}

/**
 * 权限管理器接口
 */
export interface PermissionManager {
  /** 检查权限 */
  checkPermission(request: PermissionCheckRequest): Promise<PermissionCheckResult>
  
  /** 批量检查权限 */
  checkPermissions(requests: PermissionCheckRequest[]): Promise<PermissionCheckResult[]>
  
  /** 获取用户权限 */
  getUserPermissions(userId: string, context?: PermissionContext): Promise<Permission[]>
  
  /** 获取用户角色 */
  getUserRoles(userId: string): Promise<Role[]>
  
  /** 分配角色 */
  assignRole(userId: string, roleId: string, assignedBy: string, scope?: PermissionScope): Promise<void>
  
  /** 撤销角色 */
  revokeRole(userId: string, roleId: string, revokedBy: string): Promise<void>
  
  /** 创建角色 */
  createRole(role: Omit<Role, 'id' | 'createdAt'>): Promise<Role>
  
  /** 更新角色 */
  updateRole(roleId: string, updates: Partial<Role>): Promise<Role>
  
  /** 删除角色 */
  deleteRole(roleId: string): Promise<void>
  
  /** 创建权限 */
  createPermission(permission: Omit<Permission, 'id'>): Promise<Permission>
  
  /** 更新权限 */
  updatePermission(permissionId: string, updates: Partial<Permission>): Promise<Permission>
  
  /** 删除权限 */
  deletePermission(permissionId: string): Promise<void>
}

/**
 * 角色管理器接口
 */
export interface RoleManager {
  /** 创建角色 */
  createRole(role: Omit<Role, 'id' | 'createdAt'>): Promise<Role>
  
  /** 获取角色 */
  getRole(roleId: string): Promise<Role | null>
  
  /** 获取所有角色 */
  getRoles(): Promise<Role[]>
  
  /** 更新角色 */
  updateRole(roleId: string, updates: Partial<Role>): Promise<Role>
  
  /** 删除角色 */
  deleteRole(roleId: string): Promise<void>
  
  /** 添加权限到角色 */
  addPermissionToRole(roleId: string, permissionId: string): Promise<void>
  
  /** 从角色移除权限 */
  removePermissionFromRole(roleId: string, permissionId: string): Promise<void>
  
  /** 获取角色权限 */
  getRolePermissions(roleId: string): Promise<Permission[]>
}

/**
 * 访问控制接口
 */
export interface AccessControl {
  /** 检查访问权限 */
  checkAccess(userId: string, resource: string, action: string, context?: PermissionContext): Promise<boolean>
  
  /** 获取资源访问列表 */
  getResourceAccess(resourceId: string, resourceType: ResourceType): Promise<ResourceAccess[]>
  
  /** 授予资源访问权限 */
  grantAccess(resourceId: string, resourceType: ResourceType, userId: string, permissions: string[]): Promise<void>
  
  /** 撤销资源访问权限 */
  revokeAccess(resourceId: string, resourceType: ResourceType, userId: string): Promise<void>
  
  /** 更新资源访问权限 */
  updateAccess(resourceId: string, resourceType: ResourceType, userId: string, permissions: string[]): Promise<void>
}

/**
 * 资源访问信息
 */
export interface ResourceAccess {
  /** 资源ID */
  resourceId: string
  /** 资源类型 */
  resourceType: ResourceType
  /** 用户ID */
  userId: string
  /** 权限列表 */
  permissions: string[]
  /** 授予时间 */
  grantedAt: number
  /** 授予者 */
  grantedBy: string
  /** 过期时间 */
  expiresAt?: number
}

/**
 * 权限配置
 */
export interface PermissionConfig {
  /** 是否启用权限检查 */
  enabled: boolean
  /** 默认权限策略 */
  defaultPolicy: 'allow' | 'deny'
  /** 超级管理员角色 */
  superAdminRole: string
  /** 缓存配置 */
  cache: {
    enabled: boolean
    ttl: number
    maxSize: number
  }
  /** 审计配置 */
  audit: {
    enabled: boolean
    logLevel: 'basic' | 'detailed' | 'full'
    retentionDays: number
  }
}

/**
 * 权限事件
 */
export interface PermissionEvents {
  'permission:checked': (request: PermissionCheckRequest, result: PermissionCheckResult) => void
  'role:assigned': (userId: string, roleId: string, assignedBy: string) => void
  'role:revoked': (userId: string, roleId: string, revokedBy: string) => void
  'role:created': (role: Role) => void
  'role:updated': (role: Role) => void
  'role:deleted': (roleId: string) => void
  'permission:created': (permission: Permission) => void
  'permission:updated': (permission: Permission) => void
  'permission:deleted': (permissionId: string) => void
  'access:granted': (resourceId: string, userId: string, permissions: string[]) => void
  'access:revoked': (resourceId: string, userId: string) => void
}
