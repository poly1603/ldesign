<template>
  <div class="login-template-default">
    <div class="login-container">
      <div class="login-header">
        <slot name="header">
          <h1 class="login-title">{{ title }}</h1>
          <p class="login-subtitle">欢迎回来，请登录您的账户</p>
        </slot>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            required
          />
        </div>

        <div class="form-options" v-if="showRemember || showForgot">
          <label v-if="showRemember" class="checkbox-label">
            <input
              v-model="formData.remember"
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-text">记住我</span>
          </label>
          
          <a v-if="showForgot" href="#" class="forgot-link" @click.prevent="handleForgot">
            忘记密码？
          </a>
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <div v-if="showRegister" class="register-section">
          <p class="register-text">
            还没有账户？
            <a href="#" class="register-link" @click.prevent="handleRegister">
              立即注册
            </a>
          </p>
        </div>

        <slot name="extra"></slot>
      </form>

      <div class="login-footer">
        <slot name="footer">
          <p class="footer-text">&copy; 2024 ldesign. All rights reserved.</p>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// Props定义
interface Props {
  title?: string
  showRemember?: boolean
  showRegister?: boolean
  showForgot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '用户登录',
  showRemember: true,
  showRegister: true,
  showForgot: true
})

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  remember: false
})

// 加载状态
const loading = ref(false)

// 事件处理
const handleSubmit = async () => {
  loading.value = true
  
  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('登录数据:', formData)
    alert(`登录成功！用户名: ${formData.username}`)
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleForgot = () => {
  alert('忘记密码功能')
}

const handleRegister = () => {
  alert('注册功能')
}
</script>

<style lang="less" scoped>
.login-template-default {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;

  .login-title {
    font-size: 2rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .login-subtitle {
    color: #7f8c8d;
    font-size: 0.9rem;
  }
}

.login-form {
  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #adb5bd;
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 0.9rem;

    .checkbox-input {
      margin-right: 0.5rem;
    }

    .checkbox-text {
      color: #6c757d;
    }
  }

  .forgot-link {
    color: #667eea;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s ease;

    &:hover {
      color: #5a6fd8;
      text-decoration: underline;
    }
  }

  .login-button {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.875rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  .register-section {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e9ecef;

    .register-text {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .register-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;

      &:hover {
        color: #5a6fd8;
        text-decoration: underline;
      }
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 2rem;

  .footer-text {
    color: #adb5bd;
    font-size: 0.8rem;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 480px) {
  .login-template-default {
    padding: 1rem;
  }

  .login-container {
    padding: 2rem;
  }

  .login-header .login-title {
    font-size: 1.5rem;
  }
}
</style>
