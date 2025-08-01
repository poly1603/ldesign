<script setup lang="ts">
import { computed, ref } from 'vue'
import { UserStore } from '../stores/user'

const store = new UserStore('user')
const email = ref('')
const password = ref('')

const roleClass = computed(() => ({
  admin: store.userRole === 'admin',
  user: store.userRole === 'user',
  guest: store.userRole === 'guest',
}))

async function handleLogin() {
  await store.login(email.value, password.value)
  if (store.isLoggedIn) {
    email.value = ''
    password.value = ''
  }
}

async function handleLogout() {
  await store.logout()
}

function getRoleText(role: string) {
  switch (role) {
    case 'admin':
      return '管理员'
    case 'user':
      return '普通用户'
    default:
      return '游客'
  }
}
</script>

<template>
  <div class="example-card">
    <h2>用户管理示例</h2>
    <p>展示异步操作和持久化存储</p>

    <div v-if="!store.isLoggedIn" class="login-form">
      <h3>登录</h3>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>邮箱:</label>
          <input
            v-model="email"
            type="email"
            placeholder="输入邮箱"
            class="input"
            :disabled="store.loading"
          >
        </div>
        <div class="form-group">
          <label>密码:</label>
          <input
            v-model="password"
            type="password"
            placeholder="输入密码"
            class="input"
            :disabled="store.loading"
          >
        </div>
        <button
          type="submit"
          :disabled="store.loading || !email || !password"
          class="btn btn-primary"
        >
          {{ store.loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="demo-accounts">
        <h4>演示账号:</h4>
        <div class="account-list">
          <div class="account-item">
            <strong>管理员:</strong> admin@example.com / admin
          </div>
          <div class="account-item">
            <strong>用户:</strong> user@example.com / user
          </div>
        </div>
      </div>

      <div v-if="store.error" class="error">
        {{ store.error }}
      </div>
    </div>

    <div v-else class="user-profile">
      <h3>用户信息</h3>
      <div class="profile-card">
        <div class="avatar">
          {{ store.user?.name?.charAt(0) || 'U' }}
        </div>
        <div class="user-info">
          <div class="user-name">
            {{ store.userName }}
          </div>
          <div class="user-email">
            {{ store.user?.email }}
          </div>
          <div class="user-role" :class="roleClass">
            {{ getRoleText(store.userRole) }}
          </div>
        </div>
      </div>

      <div class="user-stats">
        <div class="stat-item">
          <span class="label">登录状态:</span>
          <span class="value success">已登录</span>
        </div>
        <div class="stat-item">
          <span class="label">权限级别:</span>
          <span class="value" :class="roleClass">
            {{ store.isAdmin ? '管理员权限' : '普通权限' }}
          </span>
        </div>
        <div class="stat-item">
          <span class="label">显示名称:</span>
          <span class="value">{{ store.displayName }}</span>
        </div>
      </div>

      <button
        :disabled="store.loading"
        class="btn btn-secondary"
        @click="handleLogout"
      >
        {{ store.loading ? '退出中...' : '退出登录' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.example-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.example-card h2 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.example-card p {
  margin: 0 0 1.5rem 0;
  color: #718096;
}

.login-form h3,
.user-profile h3 {
  margin: 0 0 1rem 0;
  color: #4a5568;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2c5282;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4a5568;
}

.demo-accounts {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.demo-accounts h4 {
  margin: 0 0 0.5rem 0;
  color: #4a5568;
  font-size: 0.875rem;
}

.account-list {
  font-size: 0.875rem;
  color: #718096;
}

.account-item {
  margin-bottom: 0.25rem;
}

.error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fed7d7;
  color: #c53030;
  border-radius: 6px;
  font-size: 0.875rem;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 3rem;
  height: 3rem;
  background: #3182ce;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.125rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.user-email {
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.user-role {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
}

.user-role.admin {
  background: #fed7d7;
  color: #c53030;
}

.user-role.user {
  background: #c6f6d5;
  color: #2f855a;
}

.user-role.guest {
  background: #e2e8f0;
  color: #4a5568;
}

.user-stats {
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #4a5568;
}

.value {
  font-weight: 500;
}

.value.success {
  color: #38a169;
}

.value.admin {
  color: #e53e3e;
}

.value.user {
  color: #38a169;
}

.value.guest {
  color: #718096;
}
</style>
