# 企业级应用示例

企业级应用示例展示了 @ldesign/store 在大型企业应用中的使用，包括用户认证、权限管理、模块系统、监控日志等高级功能。

## 功能特性

### 🔐 用户认证系统
- 用户登录/登出
- 会话管理
- 自动登录
- 登录状态持久化

### 👥 权限管理系统
- 基于角色的访问控制 (RBAC)
- 动态权限检查
- 权限装饰器
- 权限路由守卫

### 🏗️ 模块管理系统
- 动态模块加载/卸载
- 模块依赖管理
- 模块状态监控
- 模块权限控制

### 📊 系统监控
- 性能监控
- 错误日志收集
- 操作审计日志
- 系统健康检查

### 👤 用户管理
- 用户增删改查
- 用户状态管理
- 用户角色分配
- 用户活动追踪

## 核心实现

### 用户认证 Store

```typescript
@Store('auth')
export class AuthStore {
  @State currentUser: User | null = null
  @State isAuthenticated = false
  @State loginAttempts = 0
  
  @Action
  async login(username: string, password: string): Promise<boolean> {
    try {
      const user = await authService.login(username, password)
      this.currentUser = user
      this.isAuthenticated = true
      this.loginAttempts = 0
      
      // 记录审计日志
      this.logAudit('用户登录', { username })
      
      return true
    } catch (error) {
      this.loginAttempts++
      this.logError('登录失败', error)
      return false
    }
  }
  
  @Action
  logout() {
    this.logAudit('用户登出', { 
      username: this.currentUser?.username 
    })
    
    this.currentUser = null
    this.isAuthenticated = false
  }
  
  @Getter
  get userPermissions(): string[] {
    return this.currentUser?.permissions || []
  }
}
```

### 权限管理系统

```typescript
// 权限装饰器
export function RequirePermission(permission: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function(...args: any[]) {
      const authStore = useAuthStore()
      
      if (!authStore.hasPermission(permission)) {
        throw new Error(`权限不足: ${permission}`)
      }
      
      return originalMethod.apply(this, args)
    }
  }
}

// 使用示例
@Store('user')
export class UserStore {
  @Action
  @RequirePermission('user:read')
  async getUsers() {
    return await userService.getUsers()
  }
  
  @Action
  @RequirePermission('user:write')
  async createUser(user: User) {
    return await userService.createUser(user)
  }
  
  @Action
  @RequirePermission('user:delete')
  async deleteUser(id: string) {
    return await userService.deleteUser(id)
  }
}
```

### 模块管理系统

```typescript
@Store('module')
export class ModuleStore {
  @State modules: Module[] = []
  @State loadedModules: Set<string> = new Set()
  
  @Action
  async loadModule(moduleId: string) {
    const module = this.modules.find(m => m.id === moduleId)
    if (!module) {
      throw new Error(`模块不存在: ${moduleId}`)
    }
    
    // 检查权限
    if (!this.hasModulePermission(moduleId)) {
      throw new Error(`无权限加载模块: ${moduleId}`)
    }
    
    // 加载依赖
    for (const depId of module.dependencies) {
      if (!this.loadedModules.has(depId)) {
        await this.loadModule(depId)
      }
    }
    
    // 加载模块
    await module.load()
    this.loadedModules.add(moduleId)
    
    this.logAudit('模块加载', { moduleId })
  }
  
  @Action
  async unloadModule(moduleId: string) {
    // 检查依赖
    const dependents = this.modules.filter(m => 
      m.dependencies.includes(moduleId) && 
      this.loadedModules.has(m.id)
    )
    
    if (dependents.length > 0) {
      throw new Error(`无法卸载模块，存在依赖: ${dependents.map(m => m.id).join(', ')}`)
    }
    
    const module = this.modules.find(m => m.id === moduleId)
    if (module) {
      await module.unload()
      this.loadedModules.delete(moduleId)
      this.logAudit('模块卸载', { moduleId })
    }
  }
}
```

### 系统监控 Store

```typescript
@Store('monitoring')
export class MonitoringStore {
  @State systemStatus: SystemStatus = {
    status: 'healthy',
    uptime: 0,
    memory: 0,
    cpu: 0,
    connections: 0
  }
  
  @State errorLogs: ErrorLog[] = []
  @State auditLogs: AuditLog[] = []
  @State performanceMetrics: PerformanceMetric[] = []
  
  @Action
  @Throttled(5000) // 每5秒最多执行一次
  updateSystemStatus() {
    this.systemStatus = {
      status: this.calculateSystemHealth(),
      uptime: Date.now() - this.startTime,
      memory: this.getMemoryUsage(),
      cpu: this.getCpuUsage(),
      connections: this.getConnectionCount()
    }
  }
  
  @Action
  logError(message: string, error: Error, context?: any) {
    const errorLog: ErrorLog = {
      id: generateId(),
      message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      level: 'error'
    }
    
    this.errorLogs.unshift(errorLog)
    
    // 限制日志数量
    if (this.errorLogs.length > 1000) {
      this.errorLogs = this.errorLogs.slice(0, 1000)
    }
    
    // 发送到监控服务
    this.sendToMonitoringService(errorLog)
  }
  
  @Action
  logAudit(action: string, details?: any) {
    const authStore = useAuthStore()
    
    const auditLog: AuditLog = {
      id: generateId(),
      action,
      userId: authStore.currentUser?.id,
      username: authStore.currentUser?.username,
      details,
      timestamp: Date.now(),
      ip: this.getClientIP(),
      userAgent: navigator.userAgent
    }
    
    this.auditLogs.unshift(auditLog)
    
    // 限制日志数量
    if (this.auditLogs.length > 5000) {
      this.auditLogs = this.auditLogs.slice(0, 5000)
    }
  }
  
  @Getter
  get systemHealth(): 'healthy' | 'warning' | 'error' {
    if (this.systemStatus.cpu > 90 || this.systemStatus.memory > 90) {
      return 'error'
    }
    if (this.systemStatus.cpu > 70 || this.systemStatus.memory > 70) {
      return 'warning'
    }
    return 'healthy'
  }
  
  @Getter
  get recentErrors(): ErrorLog[] {
    return this.errorLogs.slice(0, 10)
  }
  
  @Getter
  get recentAudits(): AuditLog[] {
    return this.auditLogs.slice(0, 20)
  }
}
```

## 使用示例

### 在组件中使用

```vue
<template>
  <div class="enterprise-dashboard">
    <!-- 用户信息 -->
    <div v-if="authStore.isAuthenticated" class="user-info">
      <h3>欢迎，{{ authStore.currentUser?.name }}</h3>
      <p>角色：{{ authStore.currentUser?.role }}</p>
    </div>
    
    <!-- 系统状态 -->
    <div class="system-status">
      <h3>系统状态</h3>
      <div :class="`status-${monitoringStore.systemHealth}`">
        {{ monitoringStore.systemStatus.status }}
      </div>
      <p>运行时间：{{ formatUptime(monitoringStore.systemStatus.uptime) }}</p>
      <p>CPU 使用率：{{ monitoringStore.systemStatus.cpu }}%</p>
      <p>内存使用率：{{ monitoringStore.systemStatus.memory }}%</p>
    </div>
    
    <!-- 模块管理 -->
    <div class="module-management">
      <h3>模块管理</h3>
      <div v-for="module in moduleStore.modules" :key="module.id">
        <span>{{ module.name }}</span>
        <button 
          v-if="!moduleStore.loadedModules.has(module.id)"
          @click="moduleStore.loadModule(module.id)"
        >
          加载
        </button>
        <button 
          v-else
          @click="moduleStore.unloadModule(module.id)"
        >
          卸载
        </button>
      </div>
    </div>
    
    <!-- 错误日志 -->
    <div class="error-logs">
      <h3>最近错误</h3>
      <div v-for="error in monitoringStore.recentErrors" :key="error.id">
        <span class="error-time">{{ formatTime(error.timestamp) }}</span>
        <span class="error-message">{{ error.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/enterprise/AuthStore'
import { useModuleStore } from '@/stores/enterprise/ModuleStore'
import { useMonitoringStore } from '@/stores/enterprise/MonitoringStore'

const authStore = useAuthStore()
const moduleStore = useModuleStore()
const monitoringStore = useMonitoringStore()

// 定期更新系统状态
setInterval(() => {
  monitoringStore.updateSystemStatus()
}, 10000)
</script>
```

## 最佳实践

### 1. 权限控制
- 使用装饰器进行权限检查
- 在路由层面进行权限验证
- 实现细粒度的权限控制

### 2. 错误处理
- 全局错误处理机制
- 错误日志收集和分析
- 用户友好的错误提示

### 3. 性能监控
- 实时性能指标收集
- 异常情况自动告警
- 性能瓶颈分析和优化

### 4. 安全性
- 敏感数据加密存储
- 操作审计日志记录
- 会话安全管理

### 5. 可维护性
- 模块化架构设计
- 完善的文档和注释
- 自动化测试覆盖

## 部署建议

### 生产环境配置
- 启用错误监控
- 配置日志收集
- 设置性能告警
- 启用安全审计

### 监控指标
- 用户活跃度
- 系统性能指标
- 错误率和响应时间
- 安全事件统计

这个企业级示例展示了如何使用 @ldesign/store 构建大型、复杂的企业应用，包含了完整的用户管理、权限控制、系统监控等功能。
