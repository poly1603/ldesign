import { Action, BaseStore, Getter, State } from '@ldesign/store'

interface User {
  id: string
  username: string
  role: 'admin' | 'user' | 'guest'
  permissions: string[]
}

interface FormData {
  username: string
  email: string
  age: number
}

interface ValidationErrors {
  username?: string
  email?: string
  age?: string
}

interface ErrorLogEntry {
  id: string
  type: string
  message: string
  details?: string
  timestamp: number
}

export class EnterpriseStore extends BaseStore {
  @State({ default: null })
  currentUser: User | null = null

  @State({ default: {} })
  validationErrors: ValidationErrors = {}

  @State({ default: [] })
  errorLog: ErrorLogEntry[] = []

  @State({ default: 0 })
  errorCounter: number = 0

  constructor() {
    super('enterprise-store')
  }

  // 权限管理
  @Action()
  login(role: 'admin' | 'user'): void {
    const permissions = this.getPermissionsByRole(role)

    this.currentUser = {
      id: `user-${Date.now()}`,
      username: role === 'admin' ? '管理员' : '普通用户',
      role,
      permissions,
    }
  }

  @Action()
  logout(): void {
    this.currentUser = null
  }

  @Getter()
  get isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  @Action()
  hasPermission(permission: string): boolean {
    if (!this.currentUser)
      return false
    return this.currentUser.permissions.includes(permission)
  }

  @Action()
  requirePermission(permission: string): void {
    if (!this.hasPermission(permission)) {
      throw new Error(`权限不足：需要 ${permission} 权限`)
    }
  }

  // 权限控制的业务方法
  @Action()
  viewUsers(): void {
    this.requirePermission('users:read')
    
  }

  @Action()
  createUser(): void {
    this.requirePermission('users:create')
    
  }

  @Action()
  deleteUser(): void {
    this.requirePermission('users:delete')
    
  }

  @Action()
  viewSystemSettings(): void {
    this.requirePermission('system:admin')
    
  }

  // 数据验证
  @Action()
  validateForm(data: FormData): void {
    const errors: ValidationErrors = {}

    // 用户名验证
    if (!data.username) {
      errors.username = '用户名不能为空'
    }
    else if (data.username.length < 3) {
      errors.username = '用户名至少3个字符'
    }
    else if (data.username.length > 20) {
      errors.username = '用户名不能超过20个字符'
    }

    // 邮箱验证
    if (!data.email) {
      errors.email = '邮箱不能为空'
    }
    else if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(data.email)) {
      errors.email = '邮箱格式不正确'
    }

    // 年龄验证
    if (!data.age) {
      errors.age = '年龄不能为空'
    }
    else if (data.age < 18) {
      errors.age = '年龄不能小于18岁'
    }
    else if (data.age > 100) {
      errors.age = '年龄不能大于100岁'
    }

    this.validationErrors = errors

    if (Object.keys(errors).length > 0) {
      this.logError('VALIDATION_ERROR', '表单验证失败', JSON.stringify(errors))
      throw new Error('表单验证失败')
    }
  }

  // 错误处理
  @Action()
  logError(type: string, message: string, details?: string): void {
    this.errorCounter++

    const error: ErrorLogEntry = {
      id: `error-${this.errorCounter}`,
      type,
      message,
      details,
      timestamp: Date.now(),
    }

    this.errorLog.unshift(error)

    // 保持错误日志不超过50条
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(0, 50)
    }
  }

  @Action()
  clearErrorLog(): void {
    this.errorLog = []
  }

  // 错误模拟方法
  @Action()
  simulateNetworkError(): void {
    this.logError(
      'NETWORK_ERROR',
      '网络连接失败',
      '无法连接到服务器，请检查网络连接',
    )
  }

  @Action()
  simulateValidationError(): void {
    this.logError(
      'VALIDATION_ERROR',
      '数据验证失败',
      '提交的数据不符合业务规则',
    )
  }

  @Action()
  simulatePermissionError(): void {
    this.logError(
      'PERMISSION_ERROR',
      '权限不足',
      '当前用户没有执行此操作的权限',
    )
  }

  @Action()
  simulateUnknownError(): void {
    this.logError(
      'UNKNOWN_ERROR',
      '未知错误',
      '系统发生了未预期的错误，请联系管理员',
    )
  }

  // 辅助方法
  private getPermissionsByRole(role: 'admin' | 'user'): string[] {
    const permissions = {
      admin: [
        'users:read',
        'users:create',
        'users:update',
        'users:delete',
        'system:admin',
        'reports:view',
        'settings:manage',
      ],
      user: ['users:read', 'reports:view'],
    }

    return permissions[role] || []
  }
}

// 导出Hook式用法
export function useEnterpriseStore() {
  return new EnterpriseStore()
}
