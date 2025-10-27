<template>
  <div class="login-template-default">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">{{ title }}</h1>
        <p class="login-subtitle">{{ subtitle }}</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username" class="form-label">{{ t('username') }}</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            class="form-input"
            :placeholder="t('usernamePlaceholder')"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">{{ t('password') }}</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            class="form-input"
            :placeholder="t('passwordPlaceholder')"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-checkbox">
            <input
              v-model="formData.remember"
              type="checkbox"
            />
            <span>{{ t('rememberMe') }}</span>
          </label>
        </div>
        
        <button
          type="submit"
          class="form-button"
          :disabled="loading"
        >
          {{ loading ? t('loggingIn') : t('login') }}
        </button>
        
        <div class="form-footer">
          <a href="#" @click.prevent="$emit('forgot-password')">
            {{ t('forgotPassword') }}
          </a>
          <a href="#" @click.prevent="$emit('register')">
            {{ t('register') }}
          </a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

/**
 * Props定义
 */
interface Props {
  title?: string
  subtitle?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Welcome Back',
  subtitle: 'Please login to your account',
  loading: false,
})

/**
 * 事件定义
 */
const emit = defineEmits<{
  submit: [data: { username: string; password: string; remember: boolean }]
  'forgot-password': []
  register: []
}>()

/**
 * 表单数据
 */
const formData = reactive({
  username: '',
  password: '',
  remember: false,
})

/**
 * 处理提交
 */
const handleSubmit = () => {
  emit('submit', { ...formData })
}

/**
 * 国际化（简化版）
 */
const t = (key: string) => {
  const messages: Record<string, string> = {
    username: 'Username',
    usernamePlaceholder: 'Enter your username',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    login: 'Login',
    loggingIn: 'Logging in...',
    forgotPassword: 'Forgot password?',
    register: 'Create account',
  }
  return messages[key] || key
}
</script>

<style scoped>
.login-template-default {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.form-checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-button {
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.form-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.form-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.form-footer a {
  font-size: 14px;
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s;
}

.form-footer a:hover {
  color: #764ba2;
}
</style>
