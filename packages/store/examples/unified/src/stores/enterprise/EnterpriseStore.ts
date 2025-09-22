import { defineStore } from 'pinia'

export interface User {
  id: string | number
  username: string
  email: string
  role: 'admin' | 'manager' | 'user' | 'guest' | 'editor' | 'viewer'
  permissions: string[]
  department: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: number
  createdAt: number
}

export interface Module {
  id: string
  name: string
  version: string
  enabled: boolean
  dependencies: string[]
  config: Record<string, any>
  loadTime: number
  status: 'loaded' | 'loading' | 'error' | 'disabled'
}

export interface ErrorLog {
  id: string
  timestamp: number
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  user?: string
  module?: string
  component?: string
  context: Record<string, any>
}

export interface AuditLog {
  id: string
  timestamp: number
  user: string
  userId?: string
  username?: string
  action: string
  resource: string
  details: Record<string, any>
  ip: string
  userAgent: string
}

/**
 * 企业级功能示例 Store
 *
 * 展示模块化、权限管理、错误处理等企业级功能
 */
export const useEnterpriseStore = defineStore('enterprise', {
  state: () => ({
    // 当前用户
    currentUser: null as User | null,

    // 用户列表
    users: [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['user.read', 'user.create', 'user.update', 'user.delete', 'role.manage', 'system.admin'],
        department: 'IT',
        status: 'active',
        lastLogin: Date.now() - 3600000,
        createdAt: Date.now() - 86400000 * 30
      },
      {
        id: '2',
        username: 'manager',
        email: 'manager@example.com',
        role: 'manager',
        permissions: ['user.read', 'user.create', 'user.update', 'report.read'],
        department: 'Sales',
        status: 'active',
        lastLogin: Date.now() - 7200000,
        createdAt: Date.now() - 86400000 * 15
      },
      {
        id: '3',
        username: 'editor',
        email: 'editor@example.com',
        role: 'editor',
        permissions: ['read', 'write', 'user.read', 'user.create', 'user.update'],
        department: 'Content',
        status: 'active',
        lastLogin: Date.now() - 1800000,
        createdAt: Date.now() - 86400000 * 7
      },
      {
        id: '4',
        username: 'viewer',
        email: 'viewer@example.com',
        role: 'viewer',
        permissions: ['read'],
        department: 'Support',
        status: 'active',
        lastLogin: Date.now() - 3600000,
        createdAt: Date.now() - 86400000 * 3
      }
    ] as User[],

    // 角色定义
    roles: [
      {
        id: 'admin',
        name: '管理员',
        permissions: ['user.read', 'user.create', 'user.update', 'user.delete', 'role.manage', 'system.admin']
      },
      {
        id: 'editor',
        name: '编辑者',
        permissions: ['read', 'write', 'user.read', 'user.create', 'user.update']
      },
      {
        id: 'viewer',
        name: '查看者',
        permissions: ['read']
      }
    ],

    // 模块系统
    modules: [
      {
        id: 'auth',
        name: '认证模块',
        version: '1.2.0',
        enabled: true,
        dependencies: [],
        config: { sessionTimeout: 3600, maxLoginAttempts: 5 },
        loadTime: 150,
        status: 'loaded'
      },
      {
        id: 'user-management',
        name: '用户管理',
        version: '1.1.0',
        enabled: true,
        dependencies: ['auth'],
        config: { pageSize: 20, enableBulkOperations: true },
        loadTime: 200,
        status: 'loaded'
      },
      {
        id: 'reporting',
        name: '报表系统',
        version: '2.0.0',
        enabled: false,
        dependencies: ['auth', 'user-management'],
        config: { cacheTimeout: 300, maxExportRows: 10000 },
        loadTime: 0,
        status: 'disabled'
      },
      {
        id: 'notifications',
        name: '通知系统',
        version: '1.0.0',
        enabled: true,
        dependencies: ['auth'],
        config: { realTime: true, batchSize: 100 },
        loadTime: 100,
        status: 'loaded'
      },
      {
        id: 'analytics',
        name: '数据分析',
        version: '1.3.0',
        enabled: false,
        dependencies: ['auth', 'user-management'],
        config: { dataRetention: 365, enableRealTime: false },
        loadTime: 0,
        status: 'disabled'
      }
    ] as Module[],

    // 错误日志
    errorLogs: [] as ErrorLog[],

    // 审计日志
    auditLogs: [] as AuditLog[],

    // 系统状态
    systemStatus: {
      uptime: Date.now() - 86400000,
      memoryUsage: 0,
      cpuUsage: 0,
      activeUsers: 0,
      totalRequests: 0,
      errorRate: 0,
      lastHealthCheck: Date.now()
    },

    // 权限定义
    permissions: [
      { id: 'user.read', name: '查看用户', category: '用户管理' },
      { id: 'user.create', name: '创建用户', category: '用户管理' },
      { id: 'user.update', name: '更新用户', category: '用户管理' },
      { id: 'user.delete', name: '删除用户', category: '用户管理' },
      { id: 'role.manage', name: '角色管理', category: '权限管理' },
      { id: 'permission.manage', name: '权限管理', category: '权限管理' },
      { id: 'report.read', name: '查看报表', category: '报表系统' },
      { id: 'report.create', name: '创建报表', category: '报表系统' },
      { id: 'system.admin', name: '系统管理', category: '系统管理' },
      { id: 'audit.read', name: '查看审计日志', category: '审计管理' },
      { id: 'profile.read', name: '查看个人资料', category: '个人中心' },
      { id: 'profile.update', name: '更新个人资料', category: '个人中心' }
    ]
  }),

  actions: {
    // 用户登录
    async login(username: string, password: string) {
      try {
        // 模拟登录验证
        await new Promise(resolve => setTimeout(resolve, 1000))

        const user = this.users.find(u => u.username === username)
        if (!user) {
          this.logError('登录失败', 'AuthComponent', { username, detail: `用户 ${username} 不存在` })
          return false
        }

        if (user.status !== 'active') {
          this.logError('登录失败', 'AuthComponent', { username, detail: `用户 ${username} 账户已被禁用` })
          return false
        }

        // 模拟密码验证（实际应用中应该使用安全的密码验证）
        if (password !== 'password') {
          this.logError('登录失败', 'AuthComponent', { username, detail: `用户 ${username} 密码错误` })
          return false
        }

        // 更新用户最后登录时间
        user.lastLogin = Date.now()
        this.currentUser = user

        // 记录审计日志
        this.logAudit('user.login', 'auth', { userId: user.id, username })

        return true
      } catch (error) {
        this.logError('登录异常', 'AuthComponent', { username, detail: (error as Error).message })
        return false
      }
    },

    // 用户登出
    logout() {
      if (this.currentUser) {
        this.logAudit('user.logout', 'auth', { userId: this.currentUser.id })
        this.currentUser = null
      }
    },

    // 检查权限
    hasPermission(permission: string): boolean {
      if (!this.currentUser) return false

      // 管理员拥有所有权限
      if (this.currentUser.role === 'admin') return true
      if (this.currentUser.permissions.includes('*')) return true

      return this.currentUser.permissions.includes(permission)
    },

    // 检查多个权限（需要全部拥有）
    hasAllPermissions(permissions: string[]): boolean {
      return permissions.every(permission => this.hasPermission(permission))
    },

    // 检查多个权限（拥有其中一个即可）
    hasAnyPermission(permissions: string[]): boolean {
      return permissions.some(permission => this.hasPermission(permission))
    },

    // 模块管理
    async toggleModule(moduleId: string) {
      const module = this.modules.find(m => m.id === moduleId)
      if (!module) return

      try {
        if (module.enabled) {
          // 禁用模块
          module.status = 'disabled'
          module.enabled = false
          module.loadTime = 0

          this.logAudit('module.disable', 'system', { moduleId, moduleName: module.name })
        } else {
          // 启用模块
          module.status = 'loading'

          // 检查依赖
          const missingDeps = module.dependencies.filter(dep => {
            const depModule = this.modules.find(m => m.id === dep)
            return !depModule || !depModule.enabled
          })

          if (missingDeps.length > 0) {
            throw new Error(`缺少依赖模块: ${missingDeps.join(', ')}`)
          }

          // 模拟加载时间
          const loadTime = Math.random() * 500 + 100
          await new Promise(resolve => setTimeout(resolve, loadTime))

          module.status = 'loaded'
          module.enabled = true
          module.loadTime = Math.round(loadTime)

          this.logAudit('module.enable', 'system', { moduleId, moduleName: module.name })
        }
      } catch (error) {
        module.status = 'error'
        this.logError('模块操作失败', 'ModuleManager', { moduleId, detail: (error as Error).message })
        throw error
      }
    },

    // 更新模块配置
    updateModuleConfig(moduleId: string, config: Record<string, any>) {
      const module = this.modules.find(m => m.id === moduleId)
      if (!module) return

      const oldConfig = { ...module.config }
      module.config = { ...module.config, ...config }

      this.logAudit('module.config.update', 'system', {
        moduleId,
        oldConfig,
        newConfig: module.config
      })
    },

    // 记录错误日志
    logError(message: string, component?: string, details?: Record<string, any>) {
      const errorLog: ErrorLog = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        level: 'error',
        message,
        stack: component,
        user: this.currentUser?.username,
        module: component,
        component,
        context: details || {}
      }

      this.errorLogs.unshift(errorLog)

      // 限制日志数量
      if (this.errorLogs.length > 1000) {
        this.errorLogs = this.errorLogs.slice(0, 1000)
      }
    },

    // 记录审计日志
    logAudit(action: string, resource: string, details: Record<string, any> = {}) {
      const auditLog: AuditLog = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        user: this.currentUser?.username || 'anonymous',
        userId: this.currentUser?.id,
        username: this.currentUser?.username,
        action,
        resource,
        details,
        ip: '127.0.0.1', // 实际应用中应该获取真实IP
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'test-agent'
      }

      this.auditLogs.unshift(auditLog)

      // 限制日志数量
      if (this.auditLogs.length > 1000) {
        this.auditLogs = this.auditLogs.slice(0, 1000)
      }
    },

    // 更新系统状态
    updateSystemStatus(status?: Partial<typeof this.systemStatus>) {
      if (status) {
        Object.assign(this.systemStatus, status, { lastHealthCheck: Date.now() })
      } else {
        this.systemStatus = {
          uptime: Date.now() - 86400000,
          memoryUsage: Math.random() * 80 + 10,
          cpuUsage: Math.random() * 60 + 5,
          activeUsers: Math.floor(Math.random() * 100) + 10,
          totalRequests: Math.floor(Math.random() * 10000) + 1000,
          errorRate: Math.random() * 5,
          lastHealthCheck: Date.now()
        }
      }
    },

    // 创建用户
    createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) {
      if (!this.hasPermission('user.create')) {
        throw new Error('没有创建用户的权限')
      }

      const maxId = Math.max(...this.users.map(u => typeof u.id === 'string' ? Number.parseInt(u.id) : u.id))
      const newUser: User = {
        ...userData,
        id: String(maxId + 1),
        createdAt: Date.now(),
        lastLogin: 0
      }

      this.users.push(newUser)
      this.logAudit('user.create', 'user', { userId: newUser.id, username: newUser.username })

      return newUser
    },

    // 更新用户
    updateUser(userId: string | number, updates: Partial<User>) {
      if (!this.hasPermission('user.update')) {
        throw new Error('没有更新用户的权限')
      }

      const user = this.users.find(u => u.id === userId)
      if (!user) {
        return // 静默处理不存在的用户
      }

      const oldData = { ...user }
      Object.assign(user, updates)

      this.logAudit('user.update', 'user', {
        userId,
        oldData,
        newData: updates
      })
    },

    // 删除用户
    deleteUser(userId: string | number) {
      if (!this.hasPermission('user.delete')) {
        throw new Error('没有删除用户的权限')
      }

      const index = this.users.findIndex(u => u.id === userId)
      if (index === -1) {
        return // 静默处理不存在的用户
      }

      const user = this.users[index]
      this.users.splice(index, 1)

      this.logAudit('user.delete', 'user', {
        userId,
        username: user.username
      })
    },

    // 添加用户（别名）
    addUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) {
      return this.createUser(userData)
    },

    // 清空错误日志
    clearErrorLogs() {
      this.errorLogs = []
    },

    // 清空审计日志
    clearAuditLogs() {
      this.auditLogs = []
    }
  },

  getters: {
    // 当前用户是否已认证
    isAuthenticated: (state) => {
      return state.currentUser !== null
    },

    // 当前用户是否为管理员
    isAdmin: (state) => {
      return state.currentUser?.role === 'admin'
    },

    // 当前用户角色
    currentUserRole: (state) => {
      return state.currentUser?.role || null
    },

    // 当前用户权限
    currentUserPermissions: (state) => {
      return state.currentUser?.permissions || []
    },

    // 活跃用户
    activeUsers: (state) => {
      return state.users.filter(u => u.status === 'active')
    },

    // 已启用的模块
    enabledModules: (state) => {
      return state.modules.filter(m => m.enabled)
    },

    // 模块依赖图
    moduleDependencies: (state) => {
      const deps: Record<string, string[]> = {}
      state.modules.forEach(module => {
        deps[module.id] = module.dependencies
      })
      return deps
    },

    // 最近的错误日志
    recentErrorLogs: (state) => {
      return state.errorLogs.slice(0, 10)
    },

    // 最近的审计日志
    recentAuditLogs: (state) => {
      return state.auditLogs.slice(0, 10)
    },

    // 最近的错误日志（别名）
    recentErrors: (state) => {
      return state.errorLogs.slice(0, 10)
    },

    // 最近的审计日志（别名）
    recentAudits: (state) => {
      return state.auditLogs.slice(0, 10)
    },

    // 按角色分组的用户
    usersByRole: (state) => {
      const groups: Record<string, User[]> = {}
      state.users.forEach(user => {
        if (!groups[user.role]) {
          groups[user.role] = []
        }
        groups[user.role].push(user)
      })
      return groups
    },

    // 系统健康状态
    systemHealth: (state) => {
      const { memoryUsage, cpuUsage, errorRate } = state.systemStatus

      if (memoryUsage > 90 || cpuUsage > 90 || errorRate > 10) {
        return 'critical'
      } else if (memoryUsage > 70 || cpuUsage > 70 || errorRate > 5) {
        return 'warning'
      } else {
        return 'healthy'
      }
    },

    // 权限分类
    permissionsByCategory: (state) => {
      const categories: Record<string, typeof state.permissions> = {}
      state.permissions.forEach(permission => {
        if (!categories[permission.category]) {
          categories[permission.category] = []
        }
        categories[permission.category].push(permission)
      })
      return categories
    }
  }
})
