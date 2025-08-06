<template>
  <div class="creative-login-template">
    <div class="background-animation">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>
    
    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <h1 class="title">{{ t('auth.welcome') }}</h1>
          <p class="subtitle">{{ t('auth.loginToAccount') }}</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <div class="input-wrapper">
              <input
                v-model="credentials.username"
                type="text"
                :placeholder="t('auth.username')"
                required
              >
              <div class="input-border"></div>
            </div>
          </div>
          
          <div class="input-group">
            <div class="input-wrapper">
              <input
                v-model="credentials.password"
                type="password"
                :placeholder="t('auth.password')"
                required
              >
              <div class="input-border"></div>
            </div>
          </div>
          
          <button type="submit" :disabled="loading" class="login-btn">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? t('auth.loggingIn') : t('auth.login') }}
          </button>
        </form>
        
        <div class="card-footer">
          <router-link to="/register" class="register-link">
            {{ t('auth.createAccount') }}
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
    await new Promise(resolve => setTimeout(resolve, 1500))
    router.push('/dashboard')
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.creative-login-template {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-shapes {
  .shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
    
    &.shape-1 {
      width: 80px;
      height: 80px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }
    
    &.shape-2 {
      width: 120px;
      height: 120px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }
    
    &.shape-3 {
      width: 60px;
      height: 60px;
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.login-container {
  z-index: 1;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 3rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
  
  .title {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .subtitle {
    color: #666;
    font-size: 0.9rem;
  }
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
  
  input {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.8);
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      background: rgba(255, 255, 255, 1);
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    
    &::placeholder {
      color: #999;
    }
  }
  
  .input-border {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }
  
  input:focus + .input-border {
    width: 100%;
  }
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 0.5rem;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.card-footer {
  text-align: center;
  margin-top: 2rem;
  
  .register-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
    
    &:hover {
      color: #764ba2;
    }
  }
}
</style>
