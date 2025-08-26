<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEnterpriseStore } from '@/stores/enterprise/EnterpriseStore'

// 使用企业级 Store
const enterpriseStore = useEnterpriseStore()

// 登录表单
const loginForm = ref({
  username: 'admin',
  password: 'password'
})

// 登录状态
const isLoggingIn = ref(false)
const loginError = ref('')

// 模块切换状态
const isTogglingModule = ref(false)

// 日志标签页
const activeLogTab = ref<'error' | 'audit'>('error')

// 处理登录
async function handleLogin() {
  isLoggingIn.value = true
  loginError.value = ''

  try {
    await enterpriseStore.login(loginForm.value.username, loginForm.value.password)
  } catch (error) {
    loginError.value = (error as Error).message
  } finally {
    isLoggingIn.value = false
  }
}

// 切换模块
async function toggleModule(moduleId: string) {
  isTogglingModule.value = true

  try {
    await enterpriseStore.toggleModule(moduleId)
  } catch (error) {
    alert((error as Error).message)
  } finally {
    isTogglingModule.value = false
  }
}

// 模拟错误
function simulateError() {
  enterpriseStore.logError('模拟错误', '这是一个测试错误', {
    action: 'simulate_error',
    timestamp: Date.now()
  })
}

// 模拟审计操作
function simulateAudit() {
  enterpriseStore.logAudit('test.action', 'test', {
    description: '这是一个测试操作',
    timestamp: Date.now()
  })
}

// 获取角色标签
function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    admin: '管理员',
    manager: '经理',
    user: '用户',
    guest: '访客'
  }
  return labels[role] || role
}

// 获取状态标签
function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    suspended: '已暂停'
  }
  return labels[status] || status
}

// 获取健康状态标签
function getHealthLabel(health: string) {
  const labels: Record<string, string> = {
    healthy: '健康',
    warning: '警告',
    critical: '严重'
  }
  return labels[health] || health
}

// 获取模块状态标签
function getModuleStatusLabel(status: string) {
  const labels: Record<string, string> = {
    loaded: '已加载',
    loading: '加载中',
    error: '错误',
    disabled: '已禁用'
  }
  return labels[status] || status
}

// 格式化时间
function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

// 格式化运行时间
function formatUptime(uptime: number) {
  const now = Date.now()
  const diff = now - uptime
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${days}天 ${hours}小时 ${minutes}分钟`
}

// 组件挂载时初始化系统状态
onMounted(() => {
  enterpriseStore.updateSystemStatus()

  // 定期更新系统状态
  setInterval(() => {
    enterpriseStore.updateSystemStatus()
  }, 5000)
})
</script>

<template>
  <div class="enterprise-examples">
    <div class="page-header">
      <h1>企业级功能示例</h1>
      <p>展示模块化、权限管理、错误处理等企业级功能</p>
    </div>

    <!-- 用户认证 -->
    <div v-if="!enterpriseStore.currentUser" class="card">
      <div class="card-header">
        <h2 class="card-title">用户认证</h2>
        <p class="card-description">请先登录以体验企业级功能</p>
      </div>

      <div class="example-content">
        <div class="login-form">
          <div class="form-group">
            <label>用户名:</label>
            <select v-model="loginForm.username" class="form-select">
              <option value="admin">admin (管理员)</option>
              <option value="manager">manager (经理)</option>
              <option value="user">user (普通用户)</option>
            </select>
          </div>

          <div class="form-group">
            <label>密码:</label>
            <input
              v-model="loginForm.password"
              type="password"
              class="form-input"
              placeholder="请输入密码 (默认: password)"
            >
          </div>

          <button
            :disabled="isLoggingIn"
            class="btn btn-primary"
            @click="handleLogin"
          >
            {{ isLoggingIn ? '登录中...' : '登录' }}
          </button>

          <div v-if="loginError" class="error-message">
            {{ loginError }}
          </div>
        </div>
      </div>
    </div>

    <!-- 已登录用户的功能界面 -->
    <div v-if="enterpriseStore.currentUser">
      <!-- 用户信息和系统状态 -->
      <div class="enterprise-grid">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">当前用户信息</h2>
            <p class="card-description">用户身份和权限信息</p>
          </div>

          <div class="example-content">
            <div class="user-info">
              <div class="user-details">
                <div class="detail-item">
                  <span class="detail-label">用户名:</span>
                  <span class="detail-value">{{ enterpriseStore.currentUser.username }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">邮箱:</span>
                  <span class="detail-value">{{ enterpriseStore.currentUser.email }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">角色:</span>
                  <span class="detail-value role" :class="enterpriseStore.currentUser.role">
                    {{ getRoleLabel(enterpriseStore.currentUser.role) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">部门:</span>
                  <span class="detail-value">{{ enterpriseStore.currentUser.department }}</span>
                </div>
              </div>

              <div class="user-permissions">
                <h4>用户权限</h4>
                <div class="permissions-list">
                  <span
                    v-for="permission in enterpriseStore.currentUser.permissions"
                    :key="permission"
                    class="permission-tag"
                    :class="{ 'admin-permission': permission === '*' }"
                  >
                    {{ permission === '*' ? '超级管理员' : permission }}
                  </span>
                </div>
              </div>

              <div class="user-actions">
                <button class="btn btn-secondary" @click="enterpriseStore.logout()">
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">系统状态</h2>
            <p class="card-description">实时系统监控信息</p>
          </div>

          <div class="example-content">
            <div class="system-status">
              <div class="status-header">
                <div class="health-indicator" :class="enterpriseStore.systemHealth">
                  <span class="health-dot" />
                  <span class="health-text">{{ getHealthLabel(enterpriseStore.systemHealth) }}</span>
                </div>
                <button class="btn btn-sm btn-secondary" @click="enterpriseStore.updateSystemStatus()">
                  刷新状态
                </button>
              </div>

              <div class="status-metrics">
                <div class="metric-item">
                  <span class="metric-label">运行时间:</span>
                  <span class="metric-value">{{ formatUptime(enterpriseStore.systemStatus.uptime) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">内存使用:</span>
                  <span class="metric-value">{{ enterpriseStore.systemStatus.memoryUsage.toFixed(1) }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">CPU使用:</span>
                  <span class="metric-value">{{ enterpriseStore.systemStatus.cpuUsage.toFixed(1) }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">活跃用户:</span>
                  <span class="metric-value">{{ enterpriseStore.systemStatus.activeUsers }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模块管理 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">模块管理</h2>
          <p class="card-description">动态启用/禁用系统模块</p>
        </div>

        <div class="example-content">
          <div class="modules-management">
            <div class="modules-grid">
              <div
                v-for="module in enterpriseStore.modules"
                :key="module.id"
                class="module-card"
                :class="{
                  'module-enabled': module.enabled,
                  'module-disabled': !module.enabled,
                  'module-error': module.status === 'error',
                }"
              >
                <div class="module-header">
                  <h4 class="module-name">{{ module.name }}</h4>
                  <span class="module-version">v{{ module.version }}</span>
                </div>

                <div class="module-info">
                  <div class="module-status">
                    <span class="status-label">状态:</span>
                    <span class="status-value" :class="module.status">
                      {{ getModuleStatusLabel(module.status) }}
                    </span>
                  </div>

                  <div v-if="module.dependencies.length > 0" class="module-dependencies">
                    <span class="deps-label">依赖:</span>
                    <div class="deps-list">
                      <span
                        v-for="dep in module.dependencies"
                        :key="dep"
                        class="dep-tag"
                      >
                        {{ dep }}
                      </span>
                    </div>
                  </div>

                  <div v-if="module.enabled" class="module-load-time">
                    <span class="load-label">加载时间:</span>
                    <span class="load-value">{{ module.loadTime }}ms</span>
                  </div>
                </div>

                <div class="module-actions">
                  <button
                    :disabled="isTogglingModule"
                    class="btn btn-sm"
                    :class="module.enabled ? 'btn-warning' : 'btn-success'"
                    @click="toggleModule(module.id)"
                  >
                    {{ module.enabled ? '禁用' : '启用' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 日志管理 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">日志管理</h2>
          <p class="card-description">错误日志和审计日志</p>
        </div>

        <div class="example-content">
          <div class="logs-management">
            <div class="logs-tabs">
              <button
                class="tab-button"
                :class="{ active: activeLogTab === 'error' }"
                @click="activeLogTab = 'error'"
              >
                错误日志 ({{ enterpriseStore.errorLogs.length }})
              </button>
              <button
                class="tab-button"
                :class="{ active: activeLogTab === 'audit' }"
                @click="activeLogTab = 'audit'"
              >
                审计日志 ({{ enterpriseStore.auditLogs.length }})
              </button>
            </div>

            <div class="logs-content">
              <!-- 错误日志 -->
              <div v-if="activeLogTab === 'error'" class="logs-list">
                <div class="logs-header">
                  <h4>错误日志</h4>
                  <button class="btn btn-sm btn-danger" @click="simulateError">
                    模拟错误
                  </button>
                </div>

                <div v-if="enterpriseStore.errorLogs.length === 0" class="empty-logs">
                  暂无错误日志
                </div>

                <div
                  v-for="log in enterpriseStore.recentErrors"
                  :key="log.id"
                  class="log-item error-log"
                >
                  <div class="log-header">
                    <span class="log-level" :class="log.level">{{ log.level.toUpperCase() }}</span>
                    <span class="log-time">{{ formatTime(log.timestamp) }}</span>
                    <span v-if="log.user" class="log-user">{{ log.user }}</span>
                  </div>
                  <div class="log-message">{{ log.message }}</div>
                  <div v-if="log.stack" class="log-stack">{{ log.stack }}</div>
                </div>
              </div>

              <!-- 审计日志 -->
              <div v-if="activeLogTab === 'audit'" class="logs-list">
                <div class="logs-header">
                  <h4>审计日志</h4>
                  <button class="btn btn-sm btn-primary" @click="simulateAudit">
                    模拟操作
                  </button>
                </div>

                <div v-if="enterpriseStore.auditLogs.length === 0" class="empty-logs">
                  暂无审计日志
                </div>

                <div
                  v-for="log in enterpriseStore.recentAudits"
                  :key="log.id"
                  class="log-item audit-log"
                >
                  <div class="log-header">
                    <span class="log-action">{{ log.action }}</span>
                    <span class="log-time">{{ formatTime(log.timestamp) }}</span>
                    <span class="log-user">{{ log.user }}</span>
                  </div>
                  <div class="log-resource">资源: {{ log.resource }}</div>
                  <div v-if="Object.keys(log.details).length > 0" class="log-details">
                    <strong>详情:</strong> {{ JSON.stringify(log.details) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.enterprise-examples {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.page-header p {
  font-size: 1.125rem;
  color: #718096;
  margin: 0;
}

.login-form {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #4a5568;
}

.form-input, .form-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.enterprise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-weight: 500;
  color: #718096;
  font-size: 0.875rem;
}

.detail-value {
  font-weight: 600;
  font-size: 0.875rem;
}

.detail-value.role.admin {
  color: #e53e3e;
}

.detail-value.role.manager {
  color: #f6ad55;
}

.detail-value.role.user {
  color: #3182ce;
}

.detail-value.status.active {
  color: #38a169;
}

.detail-value.status.inactive {
  color: #718096;
}

.detail-value.status.suspended {
  color: #e53e3e;
}

.user-permissions h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #2d3748;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.permission-tag {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.permission-tag.admin-permission {
  background: #fed7d7;
  color: #742a2a;
}

.user-actions {
  display: flex;
  gap: 1rem;
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.health-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.health-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.health-indicator.healthy .health-dot {
  background: #38a169;
}

.health-indicator.warning .health-dot {
  background: #f6ad55;
}

.health-indicator.critical .health-dot {
  background: #e53e3e;
}

.health-text {
  font-weight: 500;
  font-size: 0.875rem;
}

.status-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.875rem;
  color: #718096;
}

.metric-value {
  font-weight: 600;
  font-size: 0.875rem;
}

.metric-bar {
  width: 100px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-left: 1rem;
}

.metric-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.metric-fill.memory {
  background: linear-gradient(90deg, #4299e1, #3182ce);
}

.metric-fill.cpu {
  background: linear-gradient(90deg, #48bb78, #38a169);
}

.modules-management {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.module-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.module-card.module-enabled {
  border-color: #38a169;
  background: #f0fff4;
}

.module-card.module-disabled {
  border-color: #cbd5e0;
  background: #f7fafc;
  opacity: 0.8;
}

.module-card.module-error {
  border-color: #e53e3e;
  background: #fed7d7;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.module-name {
  margin: 0;
  font-size: 1rem;
  color: #2d3748;
}

.module-version {
  font-size: 0.75rem;
  color: #718096;
  background: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.module-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.module-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 0.875rem;
  color: #718096;
}

.status-value {
  font-size: 0.875rem;
  font-weight: 500;
}

.status-value.loaded {
  color: #38a169;
}

.status-value.loading {
  color: #f6ad55;
}

.status-value.error {
  color: #e53e3e;
}

.status-value.disabled {
  color: #718096;
}

.module-dependencies {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.deps-label {
  font-size: 0.75rem;
  color: #718096;
}

.deps-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.dep-tag {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.625rem;
}

.module-load-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.load-label {
  font-size: 0.75rem;
  color: #718096;
}

.load-value {
  font-size: 0.75rem;
  font-weight: 500;
  color: #3182ce;
}

.module-actions {
  display: flex;
  gap: 0.5rem;
}

.logs-management {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.logs-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
}

.tab-button {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #718096;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #4a5568;
}

.tab-button.active {
  color: #3182ce;
  border-bottom-color: #3182ce;
}

.logs-content {
  min-height: 300px;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logs-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #2d3748;
}

.empty-logs {
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
  padding: 2rem;
}

.log-item {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  background: #f7fafc;
}

.log-item.error-log {
  border-color: #fed7d7;
  background: #fffaf0;
}

.log-item.audit-log {
  border-color: #bee3f8;
  background: #ebf8ff;
}

.log-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.log-level {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.log-level.error {
  background: #fed7d7;
  color: #742a2a;
}

.log-level.warning {
  background: #fef5e7;
  color: #744210;
}

.log-level.info {
  background: #ebf8ff;
  color: #2b6cb0;
}

.log-action {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.log-time {
  font-size: 0.75rem;
  color: #718096;
}

.log-user {
  font-size: 0.75rem;
  color: #3182ce;
  font-weight: 500;
}

.log-message {
  font-size: 0.875rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.log-stack {
  font-size: 0.75rem;
  color: #718096;
  font-family: monospace;
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.log-resource {
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.log-details, .log-context {
  font-size: 0.75rem;
  color: #718096;
  font-family: monospace;
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 4px;
}

.log-meta {
  font-size: 0.75rem;
  color: #718096;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2c5aa0;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4a5568;
}

.btn-success {
  background: #38a169;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #2f855a;
}

.btn-warning {
  background: #f6ad55;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #ed8936;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c53030;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .enterprise-grid {
    grid-template-columns: 1fr;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .logs-tabs {
    flex-direction: column;
  }

  .tab-button {
    border-bottom: none;
    border-right: 2px solid transparent;
  }

  .tab-button.active {
    border-bottom-color: transparent;
    border-right-color: #3182ce;
  }
}
</style>
