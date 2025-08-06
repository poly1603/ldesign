<template>
  <div class="register-view">
    <div class="register-container">
      <div class="register-form">
        <h2>{{ t('auth.register') }}</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="username">{{ t('auth.username') }}</label>
            <input
              id="username"
              v-model="registerForm.username"
              type="text"
              required
              :placeholder="t('auth.usernamePlaceholder')"
            >
          </div>
          
          <div class="form-group">
            <label for="email">{{ t('auth.email') }}</label>
            <input
              id="email"
              v-model="registerForm.email"
              type="email"
              required
              :placeholder="t('auth.emailPlaceholder')"
            >
          </div>
          
          <div class="form-group">
            <label for="password">{{ t('auth.password') }}</label>
            <input
              id="password"
              v-model="registerForm.password"
              type="password"
              required
              :placeholder="t('auth.passwordPlaceholder')"
            >
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">{{ t('auth.confirmPassword') }}</label>
            <input
              id="confirmPassword"
              v-model="registerForm.confirmPassword"
              type="password"
              required
              :placeholder="t('auth.confirmPasswordPlaceholder')"
            >
          </div>
          
          <button type="submit" :disabled="loading" class="register-btn">
            {{ loading ? t('auth.registering') : t('auth.register') }}
          </button>
        </form>
        
        <div class="login-link">
          <p>{{ t('auth.alreadyHaveAccount') }} 
            <router-link to="/login">{{ t('auth.login') }}</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from '@ldesign/router'
import { useI18n } from '@ldesign/i18n/vue'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  if (registerForm.password !== registerForm.confirmPassword) {
    alert(t('auth.passwordMismatch'))
    return
  }
  
  loading.value = true
  
  try {
    // 模拟注册请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 注册成功，跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('Registration failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.register-form {
  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }
}

.form-group {
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }
  }
}

.register-btn {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background: #5a6fd8;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  
  p {
    color: #666;
    
    a {
      color: #667eea;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
