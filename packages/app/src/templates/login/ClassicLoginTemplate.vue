<template>
  <div class="classic-login-template">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <img src="/src/assets/logo.svg" alt="LDesign" />
          <h1>LDesign</h1>
        </div>
        <p class="subtitle">{{ $t('auth.login.subtitle') }}</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">{{ $t('auth.login.username') }}</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-control"
            :placeholder="$t('auth.login.username')"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">{{ $t('auth.login.password') }}</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            :placeholder="$t('auth.login.password')"
            required
          />
        </div>
        
        <div class="form-options">
          <label class="checkbox-label">
            <input
              v-model="form.remember"
              type="checkbox"
            />
            <span class="checkmark"></span>
            {{ $t('auth.login.remember') }}
          </label>
          
          <router-link to="/forgot-password" class="forgot-link">
            {{ $t('auth.login.forgotPassword') }}
          </router-link>
        </div>
        
        <button
          type="submit"
          class="btn btn-primary btn-block"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? $t('common.loading') : $t('auth.login.loginButton') }}
        </button>
        
        <div class="register-link">
          {{ $t('auth.login.noAccount') }}
          <router-link to="/register">
            {{ $t('auth.login.registerLink') }}
          </router-link>
        </div>
      </form>
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
    
    // 重定向到仪表板或原来的页面
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
.classic-login-template {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  
  .login-container {
    width: 100%;
    max-width: 400px;
    background: white;
    border-radius: @border-radius-lg;
    box-shadow: @shadow-lg;
    padding: 40px;
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 32px;
    
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
      
      img {
        width: 40px;
        height: 40px;
      }
      
      h1 {
        font-size: @font-size-2xl;
        font-weight: @font-weight-bold;
        color: @primary-color;
        margin: 0;
      }
    }
    
    .subtitle {
      color: @text-secondary;
      font-size: @font-size-base;
      margin: 0;
    }
  }
  
  .login-form {
    .form-group {
      margin-bottom: 20px;
      
      label {
        display: block;
        font-weight: @font-weight-medium;
        color: @text-primary;
        margin-bottom: 8px;
      }
      
      .form-control {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid @border-color;
        border-radius: @border-radius;
        font-size: @font-size-base;
        transition: @transition-base;
        
        &:focus {
          outline: none;
          border-color: @primary-color;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
      }
    }
    
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: @font-size-sm;
        color: @text-secondary;
        cursor: pointer;
        
        input[type="checkbox"] {
          display: none;
        }
        
        .checkmark {
          width: 16px;
          height: 16px;
          border: 1px solid @border-color;
          border-radius: 3px;
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            left: 5px;
            top: 2px;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            opacity: 0;
            transition: @transition-fast;
          }
        }
        
        input:checked + .checkmark {
          background: @primary-color;
          border-color: @primary-color;
          
          &::after {
            opacity: 1;
          }
        }
      }
      
      .forgot-link {
        font-size: @font-size-sm;
        color: @primary-color;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
    
    .btn-block {
      width: 100%;
      padding: 12px;
      font-size: @font-size-base;
      font-weight: @font-weight-medium;
      margin-bottom: 20px;
      
      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
      }
    }
    
    .register-link {
      text-align: center;
      font-size: @font-size-sm;
      color: @text-secondary;
      
      a {
        color: @primary-color;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: @screen-sm) {
  .classic-login-template {
    padding: 16px;
    
    .login-container {
      padding: 24px;
    }
  }
}
</style>
