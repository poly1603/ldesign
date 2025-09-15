/**
 * 权限管理模块导出
 */

// 核心类
export { PermissionManager } from './PermissionManager'
export { RoleManager } from './RoleManager'
export { AccessControl } from './AccessControl'

// 存储
export { PermissionStorage, MemoryPermissionStorage } from './PermissionStorage'

// 类型定义
export type {
  // 用户相关
  User,
  UserStatus,
  UserRole,
  UserOrganization,
  
  // 角色相关
  Role,
  RoleType,
  
  // 权限相关
  Permission,
  PermissionScope,
  PermissionCondition,
  PermissionCheckRequest,
  PermissionCheckResult,
  PermissionContext,
  
  // 资源相关
  ResourceType,
  ActionType,
  ResourceAccess,
  
  // 组织相关
  Organization,
  OrganizationType,
  OrganizationStatus,
  
  // 项目相关
  Project,
  ProjectStatus,
  ProjectType,
  ProjectMember,
  
  // 范围和条件
  ScopeType,
  ConditionType,
  ConditionOperator,
  
  // 接口
  PermissionManager as IPermissionManager,
  RoleManager as IRoleManager,
  AccessControl as IAccessControl,
  
  // 配置和事件
  PermissionConfig,
  PermissionEvents
} from './types'

// 插件
export { PermissionPlugin } from '../plugins/builtin/PermissionPlugin'
export type { PermissionPluginConfig } from '../plugins/builtin/PermissionPlugin'
