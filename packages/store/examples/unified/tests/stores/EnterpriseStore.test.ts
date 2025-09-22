import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEnterpriseStore } from '../../src/stores/enterprise/EnterpriseStore'

describe('enterpriseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useEnterpriseStore()

      expect(store.currentUser).toBeNull()
      expect(store.users).toHaveLength(4) // 初始用户数量
      expect(store.roles).toHaveLength(3) // admin, editor, viewer
      expect(store.permissions).toHaveLength(12) // 12个权限
      expect(store.modules).toHaveLength(5) // 5个模块
      expect(store.systemStatus).toMatchObject({
        uptime: expect.any(Number),
        memoryUsage: expect.any(Number),
        cpuUsage: expect.any(Number),
        activeUsers: expect.any(Number),
        totalRequests: expect.any(Number),
        errorRate: expect.any(Number),
        lastHealthCheck: expect.any(Number)
      })
      expect(store.errorLogs).toEqual([])
      expect(store.auditLogs).toEqual([])
    })

    it('应该有正确的初始用户数据', () => {
      const store = useEnterpriseStore()

      const adminUser = store.users.find(u => u.username === 'admin')
      expect(adminUser).toMatchObject({
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active'
      })
    })

    it('应该有正确的角色和权限配置', () => {
      const store = useEnterpriseStore()

      const adminRole = store.roles.find(r => r.id === 'admin')
      expect(adminRole?.permissions).toHaveLength(6) // 管理员有所有权限

      const viewerRole = store.roles.find(r => r.id === 'viewer')
      expect(viewerRole?.permissions).toHaveLength(1) // 查看者只有读取权限
    })
  })

  describe('getters', () => {
    it('isAuthenticated 应该根据当前用户状态返回', () => {
      const store = useEnterpriseStore()

      expect(store.isAuthenticated).toBe(false)

      store.currentUser = store.users[0]
      expect(store.isAuthenticated).toBe(true)
    })

    it('currentUserRole 应该返回当前用户角色', () => {
      const store = useEnterpriseStore()

      expect(store.currentUserRole).toBeNull()

      store.currentUser = store.users[0] // admin用户
      expect(store.currentUserRole).toBe('admin')
    })

    it('currentUserPermissions 应该返回当前用户权限', () => {
      const store = useEnterpriseStore()

      expect(store.currentUserPermissions).toEqual([])

      store.currentUser = store.users[0] // admin用户
      expect(store.currentUserPermissions).toHaveLength(6)
    })

    it('enabledModules 应该返回启用的模块', () => {
      const store = useEnterpriseStore()

      const enabled = store.enabledModules
      expect(enabled.every(m => m.enabled)).toBe(true)
    })

    it('systemHealth 应该根据系统状态返回健康度', () => {
      const store = useEnterpriseStore()

      // 正常状态
      expect(store.systemHealth).toBe('healthy')

      // 设置警告状态
      store.systemStatus.cpuUsage = 85
      expect(store.systemHealth).toBe('warning')

      // 设置错误状态
      store.systemStatus.cpuUsage = 95
      expect(store.systemHealth).toBe('critical')
    })

    it('recentErrorLogs 应该返回最近的错误日志', () => {
      const store = useEnterpriseStore()

      // 添加一些错误日志
      for (let i = 0; i < 15; i++) {
        store.logError(`错误 ${i}`, 'TestComponent', { detail: i })
      }

      expect(store.recentErrorLogs).toHaveLength(10) // 最多返回10条
    })

    it('recentAuditLogs 应该返回最近的审计日志', () => {
      const store = useEnterpriseStore()

      // 添加一些审计日志
      for (let i = 0; i < 15; i++) {
        store.logAudit('测试操作', { detail: i })
      }

      expect(store.recentAuditLogs).toHaveLength(10) // 最多返回10条
    })

    it('activeUsers 应该返回活跃用户', () => {
      const store = useEnterpriseStore()

      const active = store.activeUsers
      expect(active.every(u => u.status === 'active')).toBe(true)
    })

    it('usersByRole 应该按角色分组用户', () => {
      const store = useEnterpriseStore()

      const grouped = store.usersByRole
      expect(grouped).toHaveProperty('admin')
      expect(grouped).toHaveProperty('editor')
      expect(grouped).toHaveProperty('viewer')
      expect(grouped.admin).toHaveLength(1)
    })
  })

  describe('actions', () => {
    it('login 应该成功登录用户', async () => {
      const store = useEnterpriseStore()

      const result = await store.login('admin', 'password')

      expect(result).toBe(true)
      expect(store.currentUser?.username).toBe('admin')
      expect(store.auditLogs).toHaveLength(1)
      expect(store.auditLogs[0].action).toBe('user.login')
    })

    it('login 应该拒绝无效凭据', async () => {
      const store = useEnterpriseStore()

      const result = await store.login('invalid', 'wrong')

      expect(result).toBe(false)
      expect(store.currentUser).toBeNull()
      expect(store.errorLogs).toHaveLength(1)
    })

    it('login 应该拒绝非活跃用户', async () => {
      const store = useEnterpriseStore()

      // 设置用户为非活跃状态
      const user = store.users.find(u => u.username === 'admin')
      if (user) user.status = 'inactive'

      const result = await store.login('admin', 'password')

      expect(result).toBe(false)
      expect(store.currentUser).toBeNull()
    })

    it('logout 应该登出用户', () => {
      const store = useEnterpriseStore()

      store.currentUser = store.users[0]
      store.logout()

      expect(store.currentUser).toBeNull()
      expect(store.auditLogs.some(log => log.action === 'user.logout')).toBe(true)
    })

    it('hasPermission 应该检查用户权限', () => {
      const store = useEnterpriseStore()

      // 未登录用户没有权限
      expect(store.hasPermission('read')).toBe(false)

      // 登录管理员用户
      store.currentUser = store.users[0]
      expect(store.hasPermission('read')).toBe(true)
      expect(store.hasPermission('write')).toBe(true)
      expect(store.hasPermission('delete')).toBe(true)

      // 登录查看者用户
      store.currentUser = store.users.find(u => u.role === 'viewer') || null
      expect(store.hasPermission('read')).toBe(true)
      expect(store.hasPermission('write')).toBe(false)
    })

    it('toggleModule 应该切换模块状态', () => {
      const store = useEnterpriseStore()

      const moduleId = 'user-management'
      const initialState = store.modules.find(m => m.id === moduleId)?.enabled

      store.toggleModule(moduleId)

      const newState = store.modules.find(m => m.id === moduleId)?.enabled
      expect(newState).toBe(!initialState)
      expect(store.auditLogs.some(log => log.action.includes('module.'))).toBe(true)
    })

    it('updateSystemStatus 应该更新系统状态', () => {
      const store = useEnterpriseStore()

      const newStatus = {
        memory: 75,
        cpu: 60,
        connections: 150
      }

      store.updateSystemStatus(newStatus)

      expect(store.systemStatus.memory).toBe(75)
      expect(store.systemStatus.cpu).toBe(60)
      expect(store.systemStatus.connections).toBe(150)
    })

    it('logError 应该记录错误日志', () => {
      const store = useEnterpriseStore()

      store.logError('测试错误', 'TestComponent', { detail: 'test' })

      expect(store.errorLogs).toHaveLength(1)
      expect(store.errorLogs[0]).toMatchObject({
        message: '测试错误',
        component: 'TestComponent',
        timestamp: expect.any(Number),
        level: 'error'
      })
    })

    it('logAudit 应该记录审计日志', () => {
      const store = useEnterpriseStore()

      store.currentUser = store.users[0]
      store.logAudit('测试操作', 'test', { detail: 'test' })

      expect(store.auditLogs).toHaveLength(1)
      expect(store.auditLogs[0]).toMatchObject({
        action: '测试操作',
        userId: '1',
        username: 'admin',
        details: { detail: 'test' },
        timestamp: expect.any(Number)
      })
    })

    it('clearErrorLogs 应该清空错误日志', () => {
      const store = useEnterpriseStore()

      store.logError('测试错误', 'TestComponent')
      expect(store.errorLogs).toHaveLength(1)

      store.clearErrorLogs()
      expect(store.errorLogs).toHaveLength(0)
    })

    it('clearAuditLogs 应该清空审计日志', () => {
      const store = useEnterpriseStore()

      store.logAudit('测试操作', 'test')
      expect(store.auditLogs).toHaveLength(1)

      store.clearAuditLogs()
      expect(store.auditLogs).toHaveLength(0)
    })

    it('addUser 应该添加新用户', () => {
      const store = useEnterpriseStore()
      store.currentUser = store.users[0] // 设置为admin用户
      const initialCount = store.users.length

      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        role: 'editor' as const,
        status: 'active' as const
      }

      store.addUser(newUser)

      expect(store.users).toHaveLength(initialCount + 1)
      expect(store.users[store.users.length - 1].username).toBe('newuser')
      expect(store.auditLogs.some(log => log.action === 'user.create')).toBe(true)
    })

    it('updateUser 应该更新用户信息', () => {
      const store = useEnterpriseStore()
      store.currentUser = store.users[0] // 设置为admin用户

      const updates = {
        email: 'updated@example.com',
        status: 'inactive' as const
      }

      store.updateUser('1', updates)

      const user = store.users.find(u => u.id === '1')
      expect(user?.email).toBe('updated@example.com')
      expect(user?.status).toBe('inactive')
      expect(store.auditLogs.some(log => log.action === 'user.update')).toBe(true)
    })

    it('deleteUser 应该删除用户', () => {
      const store = useEnterpriseStore()
      store.currentUser = store.users[0] // 设置为admin用户
      const initialCount = store.users.length

      store.deleteUser('2')

      expect(store.users).toHaveLength(initialCount - 1)
      expect(store.users.find(u => u.id === '2')).toBeUndefined()
      expect(store.auditLogs.some(log => log.action === 'user.delete')).toBe(true)
    })
  })

  describe('权限控制', () => {
    it('应该正确验证管理员权限', () => {
      const store = useEnterpriseStore()

      store.currentUser = store.users.find(u => u.role === 'admin') || null

      expect(store.hasPermission('read')).toBe(true)
      expect(store.hasPermission('write')).toBe(true)
      expect(store.hasPermission('delete')).toBe(true)
      expect(store.hasPermission('manage_users')).toBe(true)
      expect(store.hasPermission('manage_system')).toBe(true)
      expect(store.hasPermission('audit')).toBe(true)
    })

    it('应该正确验证编辑者权限', () => {
      const store = useEnterpriseStore()

      store.currentUser = store.users.find(u => u.role === 'editor') || null

      expect(store.hasPermission('read')).toBe(true)
      expect(store.hasPermission('write')).toBe(true)
      expect(store.hasPermission('delete')).toBe(false)
      expect(store.hasPermission('manage_users')).toBe(false)
      expect(store.hasPermission('manage_system')).toBe(false)
      expect(store.hasPermission('audit')).toBe(false)
    })

    it('应该正确验证查看者权限', () => {
      const store = useEnterpriseStore()

      store.currentUser = store.users.find(u => u.role === 'viewer') || null

      expect(store.hasPermission('read')).toBe(true)
      expect(store.hasPermission('write')).toBe(false)
      expect(store.hasPermission('delete')).toBe(false)
      expect(store.hasPermission('manage_users')).toBe(false)
      expect(store.hasPermission('manage_system')).toBe(false)
      expect(store.hasPermission('audit')).toBe(false)
    })
  })

  describe('边界情况', () => {
    it('应该处理不存在的用户登录', async () => {
      const store = useEnterpriseStore()

      const result = await store.login('nonexistent', 'password')
      expect(result).toBe(false)
    })

    it('应该处理不存在的模块切换', () => {
      const store = useEnterpriseStore()

      expect(() => store.toggleModule('nonexistent')).not.toThrow()
    })

    it('应该处理不存在的用户更新', () => {
      const store = useEnterpriseStore()
      store.currentUser = store.users[0] // 设置为admin用户

      expect(() => store.updateUser('nonexistent', { email: 'test@example.com' })).not.toThrow()
    })

    it('应该处理不存在的用户删除', () => {
      const store = useEnterpriseStore()
      store.currentUser = store.users[0] // 设置为admin用户

      expect(() => store.deleteUser('nonexistent')).not.toThrow()
    })

    it('应该处理无效的权限检查', () => {
      const store = useEnterpriseStore()

      store.currentUser = store.users[1] // 设置为非admin用户
      expect(store.hasPermission('invalid_permission' as any)).toBe(false)
    })
  })
})
