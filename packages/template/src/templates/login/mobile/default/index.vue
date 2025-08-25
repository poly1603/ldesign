<template>
  <div class="mobile-default-login-template">
    <div class="login-container">
      <div class="login-panel">
        <div class="login-header">
          <h2 class="login-title">{{ title }}</h2>
          <p class="login-subtitle">{{ subtitle }}</p>
        </div>
        
        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <input
              id="mobile-username"
              v-model="form.username"
              type="text"
              placeholder="用户名"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <input
              id="mobile-password"
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
  title: '移动端登录',
  subtitle: '请输入您的账号信息',
  showRememberMe: false,
  showForgotPassword: true
})

const form = ref({
  username: '',
  password: '',
  rememberMe: false
})

const handleSubmit = () => {
  console.log('移动端登录提交:', form.value)
  alert('这是一个演示模板，登录功能仅供展示')
}
</script>

<style scoped>
.mobile-default-login-template {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 360px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.login-panel {
  padding: 2rem 1.5rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f7fafc;
  -webkit-appearance: none;
  appearance: none;
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
  margin: -0.25rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
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
  font-size: 0.8rem;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-appearance: none;
  appearance: none;
  touch-action: manipulation;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

/* 移动端特定样式 */
@media (max-width: 480px) {
  .mobile-default-login-template {
    padding: 0.5rem;
  }
  
  .login-container {
    max-width: 100%;
    border-radius: 16px;
  }
  
  .login-panel {
    padding: 1.5rem 1.25rem;
  }
  
  .login-title {
    font-size: 1.375rem;
  }
  
  .form-input {
    padding: 1.125rem;
    font-size: 16px; /* 防止 iOS Safari 缩放 */
  }
  
  .login-button {
    padding: 1.125rem;
    font-size: 1rem;
  }
  
  .form-options {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .form-input {
    padding: 1.25rem;
  }
  
  .login-button {
    padding: 1.375rem;
  }
  
  .checkbox-label {
    padding: 0.5rem;
    margin: -0.5rem;
  }
  
  .forgot-link {
    padding: 0.5rem;
    margin: -0.5rem;
  }
}
</style>
