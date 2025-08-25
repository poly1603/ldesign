<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Props {
  title?: string
}

defineProps<Props>()

const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
  remember: false,
})

async function handleSubmit() {
  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('登录成功:', form)
    alert('登录成功！')
  }
  catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请重试')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-form-tablet">
    <div class="login-container">
      <div class="login-header">
        <h2>{{ title || '用户登录' }}</h2>
        <p>欢迎回来，请输入您的账户信息</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
          >
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            required
          >
        </div>

        <div class="form-options">
          <label class="checkbox">
            <input v-model="form.remember" type="checkbox">
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-link">忘记密码？</a>
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="login-footer">
        <p>还没有账户？ <a href="#" class="register-link">立即注册</a></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-form-tablet {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.login-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  margin: 0 0 0.5rem;
  color: #2d3748;
  font-size: 2rem;
}

.login-header p {
  margin: 0;
  color: #718096;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #4a5568;
  font-size: 1rem;
}

.form-group input {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1.125rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: #4a5568;
}

.checkbox input {
  margin: 0;
  transform: scale(1.2);
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 1rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover:not(:disabled) {
  background: #5a67d8;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.login-footer p {
  margin: 0;
  color: #718096;
  font-size: 1rem;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-link:hover {
  text-decoration: underline;
}

/* 平板端特定样式 */
@media (orientation: landscape) {
  .login-container {
    max-width: 500px;
  }
}

@media (orientation: portrait) {
  .login-container {
    max-width: 400px;
  }

  .login-header h2 {
    font-size: 1.75rem;
  }
}
</style>
