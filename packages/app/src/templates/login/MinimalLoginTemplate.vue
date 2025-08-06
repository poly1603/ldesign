<template>
  <div class="minimal-login-template">
    <div class="login-container">
      <div class="login-form">
        <h1 class="title">{{ t('auth.login') }}</h1>
        
        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <input
              v-model="credentials.username"
              type="text"
              :placeholder="t('auth.username')"
              required
            >
          </div>
          
          <div class="input-group">
            <input
              v-model="credentials.password"
              type="password"
              :placeholder="t('auth.password')"
              required
            >
          </div>
          
          <button type="submit" :disabled="loading" class="login-btn">
            {{ loading ? t('auth.loggingIn') : t('auth.login') }}
          </button>
        </form>
        
        <div class="footer">
          <router-link to="/register" class="register-link">
            {{ t('auth.noAccount') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from '@ldesign/router'
import { useI18n } from '@ldesign/i18n/vue'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const credentials = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  
  try {
    // 模拟登录
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/dashboard')
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.minimal-login-template {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.login-container {
  background: white;
  padding: 3rem 2rem;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 320px;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 300;
  color: #333;
}

.input-group {
  margin-bottom: 1rem;
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e1e5e9;
    border-radius: 2px;
    font-size: 0.9rem;
    background: #fff;
    
    &:focus {
      outline: none;
      border-color: #007bff;
    }
    
    &::placeholder {
      color: #6c757d;
    }
  }
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background: #0056b3;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.footer {
  text-align: center;
  margin-top: 1.5rem;
  
  .register-link {
    color: #007bff;
    text-decoration: none;
    font-size: 0.85rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
