<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEnterpriseStore } from '../stores/enterpriseStore'

const store = useEnterpriseStore()

// 响应式数据
const formData = ref({
  username: '',
  email: '',
  age: 0,
})

const actionResult = ref<{ type: 'success' | 'error', message: string } | null>(
  null,
)

// 计算属性
const currentUser = computed(() => store.currentUser)
const validationErrors = computed(() => store.validationErrors)
const errorLog = computed(() => store.errorLog)

const usernameValid = computed(() => {
  const username = formData.value.username
  return username.length >= 3 && username.length <= 20
})

const emailValid = computed(() => {
  const email = formData.value.email
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
  return emailRegex.test(email)
})

const ageValid = computed(() => {
  const age = formData.value.age
  return age >= 18 && age <= 100
})

const isFormValid = computed(() => {
  return usernameValid.value && emailValid.value && ageValid.value
})

// 方法
function hasPermission(permission: string) {
  return store.hasPermission(permission)
}

function login(role: 'admin' | 'user') {
  store.login(role)
  actionResult.value = {
    type: 'success',
    message: `已以${role === 'admin' ? '管理员' : '普通用户'}身份登录`,
  }
  setTimeout(() => {
    actionResult.value = null
  }, 3000)
}

function logout() {
  store.logout()
  actionResult.value = { type: 'success', message: '已退出登录' }
  setTimeout(() => {
    actionResult.value = null
  }, 3000)
}

function viewUsers() {
  try {
    store.viewUsers()
    actionResult.value = { type: 'success', message: '用户列表加载成功' }
  }
  catch (error) {
    actionResult.value = { type: 'error', message: (error as Error).message }
  }
  setTimeout(() => {
    actionResult.value = null
  }, 3000)
}

function createUser() {
  try {
    store.createUser()
    actionResult.value = { type: 'success', message: '用户创建成功' }
  }
  catch (error) {
    actionResult.value = { type: 'error', message: (error as Error).message }
  }
  setTimeout(() => {
    actionResult.value = null
  }, 3000)
}

function deleteUser() {
  try {
    store.deleteUser()
    actionResult.value = { type: 'success', message: '用户删除成功' }
  }
  catch (error) {
    actionResult.value = { type: 'error', message: (error as Error).message }
  }
  setTimeout(() => {
    actionResult.value = null
  }, 3000)
}

function viewSystemSettings() {
  try {
    store.viewSystemSettings()
    actionResult.value = { type: 'success', message: '系统设置加载成功' }
  }
  catch (error) {
    actionResult.value = { type: 'error', message: (error as Error).message }
  }
  setTimeout(() => {
    actionResult.value = null
  }, 3000)
}

function submitForm() {
  store.validateForm(formData.value)
  if (isFormValid.value) {
    actionResult.value = { type: 'success', message: '表单提交成功' }
    setTimeout(() => {
      actionResult.value = null
    }, 3000)
  }
}

function triggerNetworkError() {
  store.simulateNetworkError()
}

function triggerValidationError() {
  store.simulateValidationError()
}

function triggerPermissionError() {
  store.simulatePermissionError()
}

function triggerUnknownError() {
  store.simulateUnknownError()
}

function clearErrorLog() {
  store.clearErrorLog()
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<template>
  <div class="enterprise-demo">
    <div class="page-header">
      <h1>企业级功能示例</h1>
      <p>展示权限管理、数据验证、错误处理等企业级应用必备功能</p>
    </div>

    <div class="demo-section">
      <h2>用户权限管理</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>当前用户信息</h3>
          <div v-if="currentUser" class="user-info">
            <p><strong>用户名:</strong> {{ currentUser.username }}</p>
            <p><strong>角色:</strong> {{ currentUser.role }}</p>
            <p><strong>权限:</strong></p>
            <ul class="permissions-list">
              <li
                v-for="permission in currentUser.permissions"
                :key="permission"
              >
                {{ permission }}
              </li>
            </ul>
          </div>
          <div v-else class="alert alert-warning">
            请先登录
          </div>

          <div class="actions">
            <button
              v-if="!currentUser"
              class="btn btn-primary"
              @click="login('admin')"
            >
              管理员登录
            </button>
            <button
              v-if="!currentUser"
              class="btn btn-secondary"
              @click="login('user')"
            >
              普通用户登录
            </button>
            <button v-if="currentUser" class="btn btn-danger" @click="logout">
              退出登录
            </button>
          </div>
        </div>

        <div class="card">
          <h3>权限控制示例</h3>
          <div class="permission-actions">
            <button
              class="btn btn-primary"
              :disabled="!hasPermission('users:read')"
              @click="viewUsers"
            >
              查看用户列表
            </button>
            <button
              class="btn btn-primary"
              :disabled="!hasPermission('users:create')"
              @click="createUser"
            >
              创建用户
            </button>
            <button
              class="btn btn-danger"
              :disabled="!hasPermission('users:delete')"
              @click="deleteUser"
            >
              删除用户
            </button>
            <button
              class="btn btn-secondary"
              :disabled="!hasPermission('system:admin')"
              @click="viewSystemSettings"
            >
              系统设置
            </button>
          </div>

          <div v-if="actionResult" class="action-result">
            <div
              class="alert"
              :class="[
                actionResult.type === 'success'
                  ? 'alert-success'
                  : 'alert-warning',
              ]"
            >
              {{ actionResult.message }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>数据验证</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>表单验证示例</h3>
          <form class="form" @submit.prevent="submitForm">
            <div class="form-group">
              <label>用户名:</label>
              <input
                v-model="formData.username"
                type="text"
                class="form-input"
                :class="{ error: validationErrors.username }"
              >
              <div v-if="validationErrors.username" class="error-message">
                {{ validationErrors.username }}
              </div>
            </div>

            <div class="form-group">
              <label>邮箱:</label>
              <input
                v-model="formData.email"
                type="email"
                class="form-input"
                :class="{ error: validationErrors.email }"
              >
              <div v-if="validationErrors.email" class="error-message">
                {{ validationErrors.email }}
              </div>
            </div>

            <div class="form-group">
              <label>年龄:</label>
              <input
                v-model.number="formData.age"
                type="number"
                class="form-input"
                :class="{ error: validationErrors.age }"
              >
              <div v-if="validationErrors.age" class="error-message">
                {{ validationErrors.age }}
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!isFormValid"
            >
              提交表单
            </button>
          </form>
        </div>

        <div class="card">
          <h3>业务规则验证</h3>
          <div class="business-rules">
            <div class="rule-item">
              <span class="rule-name">用户名长度:</span>
              <span
                class="rule-status"
                :class="[usernameValid ? 'valid' : 'invalid']"
              >
                {{ usernameValid ? '✓' : '✗' }} 3-20个字符
              </span>
            </div>
            <div class="rule-item">
              <span class="rule-name">邮箱格式:</span>
              <span
                class="rule-status"
                :class="[emailValid ? 'valid' : 'invalid']"
              >
                {{ emailValid ? '✓' : '✗' }} 有效邮箱地址
              </span>
            </div>
            <div class="rule-item">
              <span class="rule-name">年龄范围:</span>
              <span
                class="rule-status"
                :class="[ageValid ? 'valid' : 'invalid']"
              >
                {{ ageValid ? '✓' : '✗' }} 18-100岁
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>错误处理</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>错误模拟</h3>
          <div class="actions">
            <button class="btn btn-danger" @click="triggerNetworkError">
              网络错误
            </button>
            <button class="btn btn-danger" @click="triggerValidationError">
              验证错误
            </button>
            <button class="btn btn-danger" @click="triggerPermissionError">
              权限错误
            </button>
            <button class="btn btn-danger" @click="triggerUnknownError">
              未知错误
            </button>
          </div>
        </div>

        <div class="card">
          <h3>错误日志</h3>
          <div class="error-log">
            <div v-for="error in errorLog" :key="error.id" class="error-item">
              <div class="error-header">
                <span class="error-type">{{ error.type }}</span>
                <span class="error-time">{{
                  formatTime(error.timestamp)
                }}</span>
              </div>
              <div class="error-message">
                {{ error.message }}
              </div>
              <div v-if="error.details" class="error-details">
                {{ error.details }}
              </div>
            </div>

            <div v-if="errorLog.length === 0" class="no-errors">
              暂无错误记录
            </div>
          </div>

          <button class="btn btn-secondary" @click="clearErrorLog">
            清空日志
          </button>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>代码示例</h2>
      <div class="card">
        <h3>权限管理装饰器</h3>
        <div class="code-block">
          <pre>
import { RequirePermission, RequireRole } from '@ldesign/store'

class UserManagementStore extends BaseStore {
  @RequirePermission('users:read')
  @Action()
  async getUserList() {
    // 只有具有 users:read 权限的用户才能执行
    return await userApi.getUsers()
  }

  @RequireRole('admin')
  @Action()
  async deleteUser(userId: string) {
    // 只有管理员角色才能执行
    return await userApi.deleteUser(userId)
  }
}</pre>
        </div>

        <h3>数据验证装饰器</h3>
        <div class="code-block">
          <pre>
import { Validate, ValidateSchema } from '@ldesign/store'

class FormStore extends BaseStore {
  @ValidateSchema({
    username: { required: true, minLength: 3, maxLength: 20 },
    email: { required: true, email: true },
    age: { required: true, min: 18, max: 100 }
  })
  @Action()
  submitUserForm(data: UserFormData) {
    // 数据会自动验证，验证失败会抛出错误
    return this.saveUser(data)
  }
}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.enterprise-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2d3748;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section h2 {
  margin-bottom: 1.5rem;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.user-info {
  margin-bottom: 1.5rem;
}

.permissions-list {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.permission-actions {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.action-result {
  margin-top: 1rem;
}

.form {
  display: grid;
  gap: 1rem;
}

.form-group {
  display: grid;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #4a5568;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.form-input.error {
  border-color: #e53e3e;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
}

.business-rules {
  display: grid;
  gap: 1rem;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
}

.rule-name {
  font-weight: 500;
}

.rule-status.valid {
  color: #38a169;
}

.rule-status.invalid {
  color: #e53e3e;
}

.error-log {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.error-item {
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 6px;
}

.error-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.error-type {
  font-weight: 600;
  color: #c53030;
}

.error-time {
  font-size: 0.875rem;
  color: #718096;
}

.error-message {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.error-details {
  font-size: 0.875rem;
  color: #718096;
}

.no-errors {
  text-align: center;
  color: #718096;
  padding: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
