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
  <div class="login-form-mobile">
    <div class="login-container">
      <div class="login-header">
        <h2>{{ title || '登录' }}</h2>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <input
            v-model="form.username"
            type="text"
            placeholder="用户名"
            required
          >
        </div>

        <div class="form-group">
          <input
            v-model="form.password"
            type="password"
            placeholder="密码"
            required
          >
        </div>

        <div class="form-options">
          <label class="checkbox">
            <input v-model="form.remember" type="checkbox">
            <span>记住我</span>
          </label>
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <a href="#" class="forgot-link">忘记密码？</a>
      </form>

      <div class="login-footer">
        <a href="#" class="register-link">还没有账户？立即注册</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-form-mobile {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  display: flex;
  align-items: center;
}

.login-container {
  background: white;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.75rem;
  font-weight: 700;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-options {
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4a5568;
}

.login-button {
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  background: #5a67d8;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.forgot-link {
  text-align: center;
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  margin-top: 1rem;
  display: block;
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
