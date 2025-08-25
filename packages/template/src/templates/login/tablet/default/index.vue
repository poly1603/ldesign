<template>
  <div class="tablet-default-login-template">
    <div class="login-container">
      <div class="login-panel">
        <div class="login-header">
          <h2 class="login-title">{{ title }}</h2>
          <p class="login-subtitle">{{ subtitle }}</p>
        </div>
        
        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <input
              id="tablet-username"
              v-model="form.username"
              type="text"
              placeholder="用户名"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <input
              id="tablet-password"
              v-model="form.password"
              type="password"
              placeholder="密码"
              class="form-input"
              required
            />
          </div>
          
          <div v-if="showRememberMe" class="form-options">
            <label class="checkbox-label">
              <input v-model="form.rememberMe" type="checkbox" />
              <span>记住我</span>
            </label>
            <a v-if="showForgotPassword" href="#" class="forgot-link">忘记密码？</a>
          </div>
          
          <button type="submit" class="login-button">登录</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  showRememberMe?: boolean
  showForgotPassword?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '平板端登录',
  subtitle: '请输入您的账号信息',
  showRememberMe: true,
  showForgotPassword: true
})

const form = ref({
  username: '',
  password: '',
  rememberMe: false
})

const handleSubmit = () => {
  console.log('平板端登录提交:', form.value)
  alert('这是一个演示模板，登录功能仅供展示')
}
</script>

<style scoped>
.tablet-default-login-template {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-panel {
  padding: 3rem 2.5rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #718096;
  font-size: 1rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f7fafc;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -0.5rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4a5568;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: #667eea;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

/* 平板端特定样式 */
@media (min-width: 768px) and (max-width: 1024px) {
  .tablet-default-login-template {
    padding: 3rem;
  }
  
  .login-container {
    max-width: 520px;
  }
  
  .login-panel {
    padding: 3.5rem 3rem;
  }
  
  .login-title {
    font-size: 2rem;
  }
  
  .form-input {
    padding: 1.25rem;
    font-size: 1.1rem;
  }
  
  .login-button {
    padding: 1.25rem;
    font-size: 1.1rem;
  }
}
</style>
