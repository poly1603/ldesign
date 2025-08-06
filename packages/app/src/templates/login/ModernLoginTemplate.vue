<template>
  <div class="modern-login-template">
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    
    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <div class="logo-section">
            <div class="logo-circle">
              <span>L</span>
            </div>
            <h1>LDesign</h1>
          </div>
          <p class="welcome-text">{{ $t('auth.login.subtitle') }}</p>
        </div>
        
        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="input-group">
            <div class="input-wrapper">
              <input
                v-model="form.username"
                type="text"
                class="modern-input"
                :placeholder="$t('auth.login.username')"
                required
              />
              <span class="input-highlight"></span>
            </div>
          </div>
          
          <div class="input-group">
            <div class="input-wrapper">
              <input
                v-model="form.password"
                type="password"
                class="modern-input"
                :placeholder="$t('auth.login.password')"
                required
              />
              <span class="input-highlight"></span>
            </div>
          </div>
          
          <div class="form-extras">
            <label class="modern-checkbox">
              <input v-model="form.remember" type="checkbox" />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">{{ $t('auth.login.remember') }}</span>
            </label>
            
            <router-link to="/forgot-password" class="forgot-password">
              {{ $t('auth.login.forgotPassword') }}
            </router-link>
          </div>
          
          <button
            type="submit"
            class="modern-btn"
            :disabled="loading"
          >
            <span class="btn-content">
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? $t('common.loading') : $t('auth.login.loginButton') }}
            </span>
            <div class="btn-ripple"></div>
          </button>
        </form>
        
        <div class="card-footer">
          <p>
            {{ $t('auth.login.noAccount') }}
            <router-link to="/register" class="register-link">
              {{ $t('auth.login.registerLink') }}
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from '@ldesign/router'
import { useAuthState } from '../../stores/auth'
import { useEngine } from '@ldesign/engine/vue'
import type { LoginCredentials } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthState()
const engine = useEngine()

const loading = ref(false)
const form = reactive<LoginCredentials>({
  username: '',
  password: '',
  remember: false
})

const handleSubmit = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    await authStore.login(form)
    
    engine.notifications.show({
      type: 'success',
      title: '登录成功',
      message: '欢迎回来！'
    })
    
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/dashboard')
    
  } catch (error: any) {
    engine.notifications.show({
      type: 'error',
      title: '登录失败',
      message: error.message || '用户名或密码错误'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.modern-login-template {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  
  .background-shapes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    
    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 6s ease-in-out infinite;
      
      &.shape-1 {
        width: 200px;
        height: 200px;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }
      
      &.shape-2 {
        width: 150px;
        height: 150px;
        top: 60%;
        right: 15%;
        animation-delay: 2s;
      }
      
      &.shape-3 {
        width: 100px;
        height: 100px;
        bottom: 20%;
        left: 20%;
        animation-delay: 4s;
      }
    }
  }
  
  .login-container {
    width: 100%;
    max-width: 420px;
    padding: 20px;
    z-index: 1;
  }
  
  .login-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 48px 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .card-header {
    text-align: center;
    margin-bottom: 40px;
    
    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      
      .logo-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, @primary-color, lighten(@primary-color, 20%));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(0, 123, 255, 0.3);
        
        span {
          font-size: 24px;
          font-weight: bold;
          color: white;
        }
      }
      
      h1 {
        font-size: @font-size-3xl;
        font-weight: 300;
        color: @text-primary;
        margin: 0;
        letter-spacing: 1px;
      }
    }
    
    .welcome-text {
      color: @text-secondary;
      font-size: @font-size-base;
      margin: 0;
      font-weight: 300;
    }
  }
  
  .login-form {
    .input-group {
      margin-bottom: 24px;
      
      .input-wrapper {
        position: relative;
        
        .modern-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid transparent;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.05);
          font-size: @font-size-base;
          transition: all 0.3s ease;
          
          &:focus {
            outline: none;
            background: white;
            border-color: @primary-color;
            box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
          }
          
          &::placeholder {
            color: @text-muted;
            font-weight: 300;
          }
        }
        
        .input-highlight {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: @primary-color;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .modern-input:focus + .input-highlight {
          width: 100%;
        }
      }
    }
    
    .form-extras {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      
      .modern-checkbox {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        font-size: @font-size-sm;
        color: @text-secondary;
        
        input[type="checkbox"] {
          display: none;
        }
        
        .checkbox-custom {
          width: 20px;
          height: 20px;
          border: 2px solid @border-color;
          border-radius: 6px;
          position: relative;
          transition: all 0.3s ease;
          
          &::after {
            content: '';
            position: absolute;
            left: 6px;
            top: 2px;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            opacity: 0;
            transition: all 0.3s ease;
          }
        }
        
        input:checked + .checkbox-custom {
          background: @primary-color;
          border-color: @primary-color;
          
          &::after {
            opacity: 1;
          }
        }
      }
      
      .forgot-password {
        font-size: @font-size-sm;
        color: @primary-color;
        text-decoration: none;
        font-weight: 500;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
    
    .modern-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, @primary-color, lighten(@primary-color, 10%));
      border: none;
      border-radius: 12px;
      color: white;
      font-size: @font-size-base;
      font-weight: 500;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      margin-bottom: 24px;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 123, 255, 0.3);
      }
      
      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      
      .btn-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .btn-ripple {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.1);
        transform: scale(0);
        border-radius: 50%;
        transition: transform 0.6s ease;
      }
      
      &:active .btn-ripple {
        transform: scale(4);
      }
    }
  }
  
  .card-footer {
    text-align: center;
    
    p {
      font-size: @font-size-sm;
      color: @text-secondary;
      margin: 0;
      
      .register-link {
        color: @primary-color;
        text-decoration: none;
        font-weight: 500;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: @screen-sm) {
  .modern-login-template {
    .login-container {
      padding: 16px;
    }
    
    .login-card {
      padding: 32px 24px;
    }
  }
}
</style>
