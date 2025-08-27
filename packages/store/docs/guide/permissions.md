# 权限管理

@ldesign/store 提供了强大的权限管理功能，帮助您构建安全的企业级应用。

## 🔐 权限系统概述

权限管理是企业级应用的核心功能，包括：
- 用户认证和授权
- 基于角色的访问控制 (RBAC)
- 资源级权限控制
- 动态权限验证
- 权限缓存和优化

## 🏗️ 基础权限 Store

### 认证 Store

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

export interface User {
  id: string
  username: string
  email: string
  roles: string[]
  permissions: string[]
  profile: UserProfile
}

export interface UserProfile {
  name: string
  avatar?: string
  department?: string
  position?: string
}

export class AuthStore extends BaseStore {
  @State
  @Persist({ key: 'auth-user' })
  user: User | null = null

  @State
  @Persist({ key: 'auth-token' })
  token: string | null = null

  @State
  loading = false

  @State
  loginAttempts = 0

  @State
  lastLoginTime: number | null = null

  @Getter
  get isAuthenticated() {
    return !!this.user && !!this.token
  }

  @Getter
  get userRoles() {
    return this.user?.roles || []
  }

  @Getter
  get userPermissions() {
    return this.user?.permissions || []
  }

  @Getter
  get isAdmin() {
    return this.userRoles.includes('admin')
  }

  @Getter
  get canAccess() {
    return (permission: string) => {
      return this.userPermissions.includes(permission) || this.isAdmin
    }
  }

  @Action
  async login(credentials: LoginCredentials) {
    try {
      this.loading = true
      
      const response = await api.login(credentials)
      
      this.user = response.user
      this.token = response.token
      this.lastLoginTime = Date.now()
      this.loginAttempts = 0

      // 设置 API 认证头
      api.setAuthToken(response.token)

      return response
    } catch (error) {
      this.loginAttempts++
      throw error
    } finally {
      this.loading = false
    }
  }

  @Action
  async logout() {
    try {
      if (this.token) {
        await api.logout()
      }
    } finally {
      this.user = null
      this.token = null
      this.lastLoginTime = null
      api.clearAuthToken()
    }
  }

  @Action
  async refreshToken() {
    if (!this.token) return

    try {
      const response = await api.refreshToken(this.token)
      this.token = response.token
      api.setAuthToken(response.token)
    } catch (error) {
      // Token 刷新失败，清除认证状态
      await this.logout()
      throw error
    }
  }

  @Action
  async updateProfile(updates: Partial<UserProfile>) {
    if (!this.user) return

    const updatedUser = await api.updateProfile(updates)
    this.user = { ...this.user, profile: updatedUser.profile }
  }
}
```

### 权限 Store

```typescript
export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
}

export class PermissionStore extends BaseStore {
  @State
  @Cache({ ttl: 300000 }) // 缓存5分钟
  permissions: Permission[] = []

  @State
  @Cache({ ttl: 300000 })
  roles: Role[] = []

  @State
  permissionCache = new Map<string, boolean>()

  @Getter
  get permissionMap() {
    return new Map(this.permissions.map(p => [p.id, p]))
  }

  @Getter
  get roleMap() {
    return new Map(this.roles.map(r => [r.id, r]))
  }

  @Getter
  getRolePermissions() {
    return (roleId: string) => {
      const role = this.roleMap.get(roleId)
      if (!role) return []
      
      return role.permissions
        .map(permId => this.permissionMap.get(permId))
        .filter(Boolean) as Permission[]
    }
  }

  @Action
  async loadPermissions() {
    this.permissions = await api.getPermissions()
  }

  @Action
  async loadRoles() {
    this.roles = await api.getRoles()
  }

  @Action
  async checkPermission(userId: string, permission: string): Promise<boolean> {
    const cacheKey = `${userId}:${permission}`
    
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!
    }

    try {
      const hasPermission = await api.checkPermission(userId, permission)
      this.permissionCache.set(cacheKey, hasPermission)
      return hasPermission
    } catch (error) {
      console.error('权限检查失败:', error)
      return false
    }
  }

  @Action
  clearPermissionCache(userId?: string) {
    if (userId) {
      // 清除特定用户的权限缓存
      for (const key of this.permissionCache.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.permissionCache.delete(key)
        }
      }
    } else {
      // 清除所有权限缓存
      this.permissionCache.clear()
    }
  }
}
```

## 🛡️ 权限装饰器

### 权限验证装饰器

```typescript
import { createDecorator } from '@ldesign/store'

export function RequirePermission(permission: string) {
  return createDecorator({
    name: 'requirePermission',
    before: async (target, propertyKey, descriptor, args) => {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('用户未登录')
      }

      if (!authStore.canAccess(permission)) {
        throw new Error(`权限不足: 需要 ${permission} 权限`)
      }
    }
  })
}

export function RequireRole(role: string) {
  return createDecorator({
    name: 'requireRole',
    before: async (target, propertyKey, descriptor, args) => {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('用户未登录')
      }

      if (!authStore.userRoles.includes(role)) {
        throw new Error(`权限不足: 需要 ${role} 角色`)
      }
    }
  })
}

export function RequireAuth() {
  return createDecorator({
    name: 'requireAuth',
    before: async (target, propertyKey, descriptor, args) => {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('用户未登录')
      }
    }
  })
}
```

### 使用权限装饰器

```typescript
export class UserManagementStore extends BaseStore {
  @State
  users: User[] = []

  @Action
  @RequirePermission('user:read')
  async loadUsers() {
    this.users = await api.getUsers()
  }

  @Action
  @RequirePermission('user:create')
  async createUser(userData: CreateUserData) {
    const user = await api.createUser(userData)
    this.users.push(user)
    return user
  }

  @Action
  @RequirePermission('user:update')
  async updateUser(userId: string, updates: Partial<User>) {
    const updatedUser = await api.updateUser(userId, updates)
    const index = this.users.findIndex(u => u.id === userId)
    if (index !== -1) {
      this.users[index] = updatedUser
    }
    return updatedUser
  }

  @Action
  @RequireRole('admin')
  async deleteUser(userId: string) {
    await api.deleteUser(userId)
    this.users = this.users.filter(u => u.id !== userId)
  }

  @Action
  @RequireAuth()
  async getCurrentUserProfile() {
    const authStore = useAuthStore()
    return api.getUserProfile(authStore.user!.id)
  }
}
```

## 🎯 动态权限控制

### 资源级权限

```typescript
export interface ResourcePermission {
  resourceType: string
  resourceId: string
  action: string
  conditions?: Record<string, any>
}

export class ResourcePermissionStore extends BaseStore {
  @State
  resourcePermissions = new Map<string, ResourcePermission[]>()

  @Action
  async checkResourcePermission(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string
  ): Promise<boolean> {
    const key = `${userId}:${resourceType}:${resourceId}:${action}`
    
    try {
      const hasPermission = await api.checkResourcePermission({
        userId,
        resourceType,
        resourceId,
        action
      })
      
      return hasPermission
    } catch (error) {
      console.error('资源权限检查失败:', error)
      return false
    }
  }

  @Action
  async loadUserResourcePermissions(userId: string) {
    const permissions = await api.getUserResourcePermissions(userId)
    this.resourcePermissions.set(userId, permissions)
  }
}

// 资源权限装饰器
export function RequireResourcePermission(
  resourceType: string,
  action: string,
  resourceIdGetter?: (args: any[]) => string
) {
  return createDecorator({
    name: 'requireResourcePermission',
    before: async (target, propertyKey, descriptor, args) => {
      const authStore = useAuthStore()
      const resourceStore = useResourcePermissionStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('用户未登录')
      }

      const resourceId = resourceIdGetter ? resourceIdGetter(args) : args[0]
      
      const hasPermission = await resourceStore.checkResourcePermission(
        authStore.user!.id,
        resourceType,
        resourceId,
        action
      )

      if (!hasPermission) {
        throw new Error(`权限不足: 无法对资源 ${resourceType}:${resourceId} 执行 ${action} 操作`)
      }
    }
  })
}
```

## 🔄 权限中间件

### 全局权限中间件

```typescript
export const permissionMiddleware = createMiddleware({
  name: 'permission',
  before: async (action, store, args) => {
    const authStore = useAuthStore()
    
    // 检查是否需要认证
    const requiresAuth = action.metadata?.requiresAuth
    if (requiresAuth && !authStore.isAuthenticated) {
      throw new Error('用户未登录')
    }

    // 检查权限要求
    const requiredPermission = action.metadata?.permission
    if (requiredPermission && !authStore.canAccess(requiredPermission)) {
      throw new Error(`权限不足: 需要 ${requiredPermission} 权限`)
    }

    // 检查角色要求
    const requiredRole = action.metadata?.role
    if (requiredRole && !authStore.userRoles.includes(requiredRole)) {
      throw new Error(`权限不足: 需要 ${requiredRole} 角色`)
    }
  }
})
```

## 🎨 Vue 组件权限控制

### 权限指令

```typescript
// directives/permission.ts
import { Directive } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'

export const vPermission: Directive = {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const permission = binding.value
    
    if (!authStore.canAccess(permission)) {
      el.style.display = 'none'
    }
  },
  updated(el, binding) {
    const authStore = useAuthStore()
    const permission = binding.value
    
    if (!authStore.canAccess(permission)) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}

// 使用
app.directive('permission', vPermission)
```

### 权限组件

```vue
<template>
  <div v-if="hasPermission">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'

interface Props {
  permission?: string
  role?: string
  requireAll?: boolean
  permissions?: string[]
  roles?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  requireAll: false
})

const authStore = useAuthStore()

const hasPermission = computed(() => {
  if (!authStore.isAuthenticated) {
    return false
  }

  // 检查单个权限
  if (props.permission) {
    return authStore.canAccess(props.permission)
  }

  // 检查单个角色
  if (props.role) {
    return authStore.userRoles.includes(props.role)
  }

  // 检查多个权限
  if (props.permissions) {
    if (props.requireAll) {
      return props.permissions.every(p => authStore.canAccess(p))
    } else {
      return props.permissions.some(p => authStore.canAccess(p))
    }
  }

  // 检查多个角色
  if (props.roles) {
    if (props.requireAll) {
      return props.roles.every(r => authStore.userRoles.includes(r))
    } else {
      return props.roles.some(r => authStore.userRoles.includes(r))
    }
  }

  return true
})
</script>
```

## 🧪 权限测试

### 权限 Store 测试

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestStore } from '@ldesign/store/testing'
import { AuthStore } from '@/stores/AuthStore'

describe('AuthStore', () => {
  let authStore: AuthStore

  beforeEach(() => {
    authStore = createTestStore(AuthStore)
  })

  describe('权限检查', () => {
    it('应该正确检查用户权限', () => {
      authStore.user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['user:read', 'user:update'],
        profile: { name: 'Test User' }
      }

      expect(authStore.canAccess('user:read')).toBe(true)
      expect(authStore.canAccess('user:delete')).toBe(false)
      expect(authStore.canAccess('admin:manage')).toBe(false)
    })

    it('管理员应该拥有所有权限', () => {
      authStore.user = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        roles: ['admin'],
        permissions: [],
        profile: { name: 'Admin User' }
      }

      expect(authStore.canAccess('user:read')).toBe(true)
      expect(authStore.canAccess('user:delete')).toBe(true)
      expect(authStore.canAccess('admin:manage')).toBe(true)
    })
  })

  describe('登录流程', () => {
    it('应该成功登录并设置用户信息', async () => {
      const mockResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['user'],
          permissions: ['user:read'],
          profile: { name: 'Test User' }
        },
        token: 'mock-token'
      }

      vi.spyOn(api, 'login').mockResolvedValue(mockResponse)

      await authStore.login({ username: 'testuser', password: 'password' })

      expect(authStore.user).toEqual(mockResponse.user)
      expect(authStore.token).toBe(mockResponse.token)
      expect(authStore.isAuthenticated).toBe(true)
    })
  })
})
```

## 🎯 最佳实践

### 1. 权限粒度设计

```typescript
// ✅ 细粒度权限设计
const permissions = [
  'user:create',
  'user:read',
  'user:update',
  'user:delete',
  'product:create',
  'product:read',
  'order:manage'
]

// ❌ 过于粗粒度
const permissions = [
  'admin',
  'user'
]
```

### 2. 权限缓存策略

```typescript
// ✅ 合理的缓存策略
@Cache({ ttl: 300000 }) // 5分钟缓存
async checkPermission(permission: string) {
  return await api.checkPermission(permission)
}
```

### 3. 错误处理

```typescript
// ✅ 友好的错误处理
try {
  await protectedAction()
} catch (error) {
  if (error.message.includes('权限不足')) {
    showPermissionDeniedDialog()
  } else {
    showGenericErrorMessage()
  }
}
```

权限管理是企业级应用的核心功能，@ldesign/store 提供了完整的权限管理解决方案，帮助您构建安全可靠的应用程序。
