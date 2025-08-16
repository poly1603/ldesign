# 多用户权限管理系统 (RBAC)

本示例展示了如何使用 @ldesign/store 实现基于角色的访问控制（Role-Based Access Control, RBAC）系统，
支持用户、角色、权限的三级管理和动态权限验证。

## 系统架构

### RBAC 模型

```
用户 (User) ←→ 角色 (Role) ←→ 权限 (Permission)
     ↓              ↓              ↓
  用户信息        角色定义        权限定义
  角色分配        权限分配        资源控制
```

### Store 架构

```
RBACSystem
├── UserManagementStore    # 用户管理
├── RoleManagementStore    # 角色管理
├── PermissionStore        # 权限管理
├── AuthorizationStore     # 权限验证
├── MenuStore              # 菜单权限
├── TenantStore            # 多租户管理
└── AuditStore             # 操作审计
```

## 核心数据模型

### 类型定义

```typescript
// types/rbac.ts
export interface User {
  id: string
  username: string
  email: string
  name: string
  avatar?: string
  status: 'active' | 'inactive' | 'locked'
  tenantId: string
  roles: Role[]
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface Role {
  id: string
  name: string
  code: string
  description: string
  tenantId: string
  permissions: Permission[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Permission {
  id: string
  name: string
  code: string
  resource: string
  action: string
  description: string
  category: string
  isSystem: boolean
}

export interface Tenant {
  id: string
  name: string
  code: string
  status: 'active' | 'inactive'
  settings: Record<string, any>
  createdAt: Date
}

export interface MenuItem {
  id: string
  name: string
  path: string
  icon?: string
  component?: string
  permissions: string[]
  children?: MenuItem[]
  meta?: Record<string, any>
}
```

## Store 实现

### 1. 用户管理 Store

```typescript
// stores/user-management.ts
import { AsyncAction, BaseStore, CachedGetter, Getter, State } from '@ldesign/store'

export class UserManagementStore extends BaseStore {
  @State({ default: [] })
  users: User[] = []

  @State({ default: null })
  selectedUser: User | null = null

  @State({ default: 1 })
  currentPage: number = 1

  @State({ default: 20 })
  pageSize: number = 20

  @State({ default: 0 })
  totalCount: number = 0

  @State({ default: '' })
  searchQuery: string = ''

  @State({ default: {} })
  filters: {
    status?: User['status']
    roleId?: string
    tenantId?: string
  } = {}

  @AsyncAction()
  async fetchUsers() {
    try {
      const response = await userApi.getUsers({
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchQuery,
        filters: this.filters,
      })

      this.users = response.users
      this.totalCount = response.total
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  }

  @AsyncAction()
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const user = await userApi.createUser(userData)
      this.users.push(user)
      this.totalCount++
      return user
    } catch (error) {
      console.error('创建用户失败:', error)
      throw error
    }
  }

  @AsyncAction()
  async updateUser(userId: string, updates: Partial<User>) {
    try {
      const updatedUser = await userApi.updateUser(userId, updates)
      const index = this.users.findIndex(u => u.id === userId)
      if (index > -1) {
        this.users[index] = updatedUser
      }
      return updatedUser
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  }

  @AsyncAction()
  async deleteUser(userId: string) {
    try {
      await userApi.deleteUser(userId)
      const index = this.users.findIndex(u => u.id === userId)
      if (index > -1) {
        this.users.splice(index, 1)
        this.totalCount--
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    }
  }

  @AsyncAction()
  async assignRoles(userId: string, roleIds: string[]) {
    try {
      const user = await userApi.assignRoles(userId, roleIds)
      const index = this.users.findIndex(u => u.id === userId)
      if (index > -1) {
        this.users[index] = user
      }
      return user
    } catch (error) {
      console.error('分配角色失败:', error)
      throw error
    }
  }

  @AsyncAction()
  async lockUser(userId: string, reason: string) {
    try {
      await userApi.lockUser(userId, reason)
      await this.updateUser(userId, { status: 'locked' })
    } catch (error) {
      console.error('锁定用户失败:', error)
      throw error
    }
  }

  @AsyncAction()
  async unlockUser(userId: string) {
    try {
      await userApi.unlockUser(userId)
      await this.updateUser(userId, { status: 'active' })
    } catch (error) {
      console.error('解锁用户失败:', error)
      throw error
    }
  }

  @CachedGetter(['users'])
  get usersByStatus() {
    return this.users.reduce((acc, user) => {
      if (!acc[user.status]) {
        acc[user.status] = []
      }
      acc[user.status].push(user)
      return acc
    }, {} as Record<User['status'], User[]>)
  }

  @CachedGetter(['users'])
  get usersByRole() {
    return this.users.reduce((acc, user) => {
      user.roles.forEach(role => {
        if (!acc[role.id]) {
          acc[role.id] = []
        }
        acc[role.id].push(user)
      })
      return acc
    }, {} as Record<string, User[]>)
  }

  @Getter()
  get activeUsers() {
    return this.users.filter(user => user.status === 'active')
  }

  @Getter()
  get totalPages() {
    return Math.ceil(this.totalCount / this.pageSize)
  }
}
```

### 2. 权限验证 Store

```typescript
// stores/authorization.ts
import { Action, BaseStore, CachedGetter, Getter, State } from '@ldesign/store'

export class AuthorizationStore extends BaseStore {
  @State({ default: null })
  currentUser: User | null = null

  @State({ default: [] })
  userPermissions: Permission[] = []

  @State({ default: [] })
  userRoles: Role[] = []

  @State({ default: new Map() })
  permissionCache: Map<string, boolean> = new Map()

  @Action()
  setCurrentUser(user: User) {
    this.currentUser = user
    this.userRoles = user.roles
    this.extractUserPermissions()
    this.clearPermissionCache()
  }

  @Action()
  clearCurrentUser() {
    this.currentUser = null
    this.userPermissions = []
    this.userRoles = []
    this.clearPermissionCache()
  }

  private extractUserPermissions() {
    const permissionSet = new Set<Permission>()

    this.userRoles.forEach(role => {
      role.permissions.forEach(permission => {
        permissionSet.add(permission)
      })
    })

    this.userPermissions = Array.from(permissionSet)
  }

  @Action()
  clearPermissionCache() {
    this.permissionCache.clear()
  }

  @Getter()
  get hasPermission() {
    return (permissionCode: string): boolean => {
      // 检查缓存
      if (this.permissionCache.has(permissionCode)) {
        return this.permissionCache.get(permissionCode)!
      }

      // 超级管理员拥有所有权限
      if (this.isSuperAdmin) {
        this.permissionCache.set(permissionCode, true)
        return true
      }

      // 检查用户权限
      const hasPermission = this.userPermissions.some(
        permission => permission.code === permissionCode
      )

      this.permissionCache.set(permissionCode, hasPermission)
      return hasPermission
    }
  }

  @Getter()
  get hasRole() {
    return (roleCode: string): boolean => {
      return this.userRoles.some(role => role.code === roleCode)
    }
  }

  @Getter()
  get hasAnyRole() {
    return (roleCodes: string[]): boolean => {
      return roleCodes.some(roleCode => this.hasRole(roleCode))
    }
  }

  @Getter()
  get hasAllRoles() {
    return (roleCodes: string[]): boolean => {
      return roleCodes.every(roleCode => this.hasRole(roleCode))
    }
  }

  @Getter()
  get canAccessResource() {
    return (resource: string, action: string): boolean => {
      const permissionCode = `${resource}:${action}`
      return this.hasPermission(permissionCode)
    }
  }

  @Getter()
  get isSuperAdmin() {
    return this.hasRole('super_admin')
  }

  @Getter()
  get isAdmin() {
    return this.hasRole('admin') || this.isSuperAdmin
  }

  @CachedGetter(['userPermissions'])
  get permissionsByCategory() {
    return this.userPermissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    }, {} as Record<string, Permission[]>)
  }

  @CachedGetter(['userRoles'])
  get roleHierarchy() {
    // 构建角色层次结构
    const hierarchy = new Map<string, number>()

    const roleWeights = {
      super_admin: 1000,
      admin: 800,
      manager: 600,
      user: 400,
      guest: 200,
    }

    this.userRoles.forEach(role => {
      const weight = roleWeights[role.code] || 0
      hierarchy.set(role.code, weight)
    })

    return hierarchy
  }

  @Getter()
  get highestRole() {
    let highestWeight = 0
    let highestRole: Role | null = null

    this.userRoles.forEach(role => {
      const weight = this.roleHierarchy.get(role.code) || 0
      if (weight > highestWeight) {
        highestWeight = weight
        highestRole = role
      }
    })

    return highestRole
  }
}
```

### 3. 菜单权限 Store

```typescript
// stores/menu.ts
import { Action, BaseStore, CachedGetter, Getter, State } from '@ldesign/store'

export class MenuStore extends BaseStore {
  @State({ default: [] })
  allMenus: MenuItem[] = []

  @State({ default: [] })
  userMenus: MenuItem[] = []

  @State({ default: null })
  activeMenu: string | null = null

  @State({ default: [] })
  breadcrumbs: MenuItem[] = []

  @Action()
  setAllMenus(menus: MenuItem[]) {
    this.allMenus = menus
    this.generateUserMenus()
  }

  @Action()
  setActiveMenu(menuId: string) {
    this.activeMenu = menuId
    this.generateBreadcrumbs(menuId)
  }

  private generateUserMenus() {
    const authStore = new AuthorizationStore('auth')
    this.userMenus = this.filterMenusByPermissions(this.allMenus, authStore)
  }

  private filterMenusByPermissions(menus: MenuItem[], authStore: AuthorizationStore): MenuItem[] {
    return menus.filter(menu => {
      // 检查菜单权限
      const hasPermission =
        menu.permissions.length === 0 ||
        menu.permissions.some(permission => authStore.hasPermission(permission))

      if (!hasPermission) return false

      // 递归过滤子菜单
      if (menu.children) {
        menu.children = this.filterMenusByPermissions(menu.children, authStore)
      }

      return true
    })
  }

  private generateBreadcrumbs(menuId: string) {
    const findMenuPath = (
      menus: MenuItem[],
      targetId: string,
      path: MenuItem[] = []
    ): MenuItem[] | null => {
      for (const menu of menus) {
        const currentPath = [...path, menu]

        if (menu.id === targetId) {
          return currentPath
        }

        if (menu.children) {
          const result = findMenuPath(menu.children, targetId, currentPath)
          if (result) return result
        }
      }
      return null
    }

    this.breadcrumbs = findMenuPath(this.userMenus, menuId) || []
  }

  @CachedGetter(['userMenus'])
  get menuTree() {
    const buildTree = (menus: MenuItem[]): any[] => {
      return menus.map(menu => ({
        ...menu,
        children: menu.children ? buildTree(menu.children) : undefined,
      }))
    }

    return buildTree(this.userMenus)
  }

  @CachedGetter(['userMenus'])
  get flatMenus() {
    const flatten = (menus: MenuItem[]): MenuItem[] => {
      let result: MenuItem[] = []

      menus.forEach(menu => {
        result.push(menu)
        if (menu.children) {
          result = result.concat(flatten(menu.children))
        }
      })

      return result
    }

    return flatten(this.userMenus)
  }

  @Getter()
  get menuRoutes() {
    return this.flatMenus.map(menu => ({
      path: menu.path,
      name: menu.id,
      component: menu.component,
      meta: {
        title: menu.name,
        icon: menu.icon,
        permissions: menu.permissions,
        ...menu.meta,
      },
    }))
  }

  @Getter()
  get currentMenu() {
    return this.flatMenus.find(menu => menu.id === this.activeMenu)
  }
}
```

## 权限装饰器

### 权限验证装饰器

```typescript
// decorators/permission.ts
import { AuthorizationStore } from '@/stores/authorization'

export function RequirePermission(permission: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const authStore = new AuthorizationStore('auth')

      if (!authStore.hasPermission(permission)) {
        throw new Error(`权限不足: 需要 ${permission} 权限`)
      }

      return originalMethod.apply(this, args)
    }
  }
}

export function RequireRole(role: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const authStore = new AuthorizationStore('auth')

      if (!authStore.hasRole(role)) {
        throw new Error(`权限不足: 需要 ${role} 角色`)
      }

      return originalMethod.apply(this, args)
    }
  }
}

export function RequireAnyRole(roles: string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const authStore = new AuthorizationStore('auth')

      if (!authStore.hasAnyRole(roles)) {
        throw new Error(`权限不足: 需要以下角色之一: ${roles.join(', ')}`)
      }

      return originalMethod.apply(this, args)
    }
  }
}
```

### 在 Store 中使用权限装饰器

```typescript
// stores/admin.ts
export class AdminStore extends BaseStore {
  @RequirePermission('user:create')
  @AsyncAction()
  async createUser(userData: any) {
    return await userApi.createUser(userData)
  }

  @RequirePermission('user:delete')
  @AsyncAction()
  async deleteUser(userId: string) {
    return await userApi.deleteUser(userId)
  }

  @RequireRole('admin')
  @AsyncAction()
  async getSystemStats() {
    return await adminApi.getSystemStats()
  }

  @RequireAnyRole(['admin', 'manager'])
  @AsyncAction()
  async exportUserData() {
    return await adminApi.exportUserData()
  }
}
```

## Vue 组件集成

### 权限指令

```typescript
// directives/permission.ts
import { Directive } from 'vue'
import { AuthorizationStore } from '@/stores/authorization'

export const vPermission: Directive = {
  mounted(el, binding) {
    const authStore = new AuthorizationStore('auth')
    const { value } = binding

    if (value && !authStore.hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  },

  updated(el, binding) {
    const authStore = new AuthorizationStore('auth')
    const { value, oldValue } = binding

    if (value !== oldValue) {
      if (value && !authStore.hasPermission(value)) {
        el.style.display = 'none'
      } else {
        el.style.display = ''
      }
    }
  },
}

export const vRole: Directive = {
  mounted(el, binding) {
    const authStore = new AuthorizationStore('auth')
    const { value } = binding

    if (value && !authStore.hasRole(value)) {
      el.parentNode?.removeChild(el)
    }
  },
}
```

### 权限组件

```vue
<!-- components/PermissionGuard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { AuthorizationStore } from '@/stores/authorization'

interface Props {
  permission?: string
  role?: string
  anyRole?: string[]
  allRoles?: string[]
  showFallback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showFallback: true,
})

const authStore = new AuthorizationStore('auth')

const hasAccess = computed(() => {
  if (props.permission) {
    return authStore.hasPermission(props.permission)
  }

  if (props.role) {
    return authStore.hasRole(props.role)
  }

  if (props.anyRole) {
    return authStore.hasAnyRole(props.anyRole)
  }

  if (props.allRoles) {
    return authStore.hasAllRoles(props.allRoles)
  }

  return true
})
</script>

<template>
  <slot v-if="hasAccess" />
  <div v-else-if="showFallback" class="permission-denied">
    <slot name="fallback">
      <div class="text-center p-4">
        <Icon name="lock" class="text-4xl text-gray-400 mb-2" />
        <p class="text-gray-600">您没有访问此内容的权限</p>
      </div>
    </slot>
  </div>
</template>
```

### 使用示例

```vue
<script setup lang="ts">
import { AuthorizationStore } from '@/stores/authorization'
import { UserManagementStore } from '@/stores/user-management'

const userStore = new UserManagementStore('user')
const authStore = new AuthorizationStore('auth')

async function createUser() {
  try {
    await userStore.createUser({
      username: 'newuser',
      email: 'newuser@example.com',
      name: 'New User',
      status: 'active',
      tenantId: 'tenant1',
      roles: [],
    })
  } catch (error) {
    console.error('创建用户失败:', error)
  }
}

function requestAccess() {
  // 申请权限逻辑
}
</script>

<template>
  <div class="admin-panel">
    <!-- 使用权限指令 -->
    <button v-permission="'user:create'" @click="createUser">创建用户</button>

    <!-- 使用权限组件 -->
    <PermissionGuard permission="user:list">
      <UserList />
    </PermissionGuard>

    <!-- 使用角色权限 -->
    <PermissionGuard :any-role="['admin', 'manager']">
      <AdminTools />
    </PermissionGuard>

    <!-- 自定义无权限提示 -->
    <PermissionGuard permission="system:settings">
      <SystemSettings />
      <template #fallback>
        <div class="upgrade-prompt">
          <p>此功能需要管理员权限</p>
          <button @click="requestAccess">申请权限</button>
        </div>
      </template>
    </PermissionGuard>
  </div>
</template>
```

## 最佳实践

### 1. 权限粒度设计

```typescript
// 推荐的权限命名规范
const PERMISSIONS = {
  // 用户管理
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_ASSIGN_ROLE: 'user:assign_role',

  // 角色管理
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  // 系统管理
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_MONITOR: 'system:monitor',
  SYSTEM_BACKUP: 'system:backup',
}
```

### 2. 权限缓存优化

```typescript
export class PermissionCacheStore extends BaseStore {
  @State({ default: new Map() })
  cache: Map<string, { result: boolean; expiry: number }> = new Map()

  @Action()
  cachePermission(permission: string, result: boolean, ttl: number = 300000) {
    this.cache.set(permission, {
      result,
      expiry: Date.now() + ttl,
    })
  }

  @Action()
  getCachedPermission(permission: string): boolean | null {
    const cached = this.cache.get(permission)
    if (!cached) return null

    if (Date.now() > cached.expiry) {
      this.cache.delete(permission)
      return null
    }

    return cached.result
  }

  @Action()
  clearExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key)
      }
    }
  }
}
```

### 3. 多租户权限隔离

```typescript
export class TenantAwareStore extends BaseStore {
  @Getter()
  get currentTenantId() {
    const authStore = new AuthorizationStore('auth')
    return authStore.currentUser?.tenantId
  }

  @Action()
  filterByTenant<T extends { tenantId: string }>(items: T[]): T[] {
    const tenantId = this.currentTenantId
    if (!tenantId) return []

    return items.filter(item => item.tenantId === tenantId)
  }

  @AsyncAction()
  async fetchTenantData<T>(apiCall: (tenantId: string) => Promise<T>): Promise<T> {
    const tenantId = this.currentTenantId
    if (!tenantId) {
      throw new Error('未找到租户信息')
    }

    return await apiCall(tenantId)
  }
}
```

## 总结

这个 RBAC 系统示例展示了：

1. **完整的权限模型**：用户-角色-权限三级管理
2. **动态权限验证**：实时权限检查和缓存优化
3. **Vue 集成**：权限指令、组件和路由守卫
4. **多租户支持**：租户级别的权限隔离
5. **性能优化**：权限缓存和批量验证

通过这种设计，你可以构建出安全、灵活、高性能的权限管理系统。
