<template>
  <div class="forgot-password-view">
    <div class="forgot-password-container">
      <div class="forgot-password-form">
        <h2>{{ t('auth.forgotPasswordTitle') }}</h2>
        <p class="subtitle">{{ t('auth.forgotPasswordSubtitle') }}</p>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="email">{{ t('auth.email') }}</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              :placeholder="t('auth.emailPlaceholder')"
            >
          </div>
          
          <button type="submit" :disabled="loading" class="submit-btn">
            {{ loading ? t('common.sending') : t('auth.sendButton') }}
          </button>
        </form>
        
        <div class="back-link">
          <router-link to="/login">{{ t('auth.backToLogin') }}</router-link>
        </div>
        
        <div v-if="message" class="message" :class="messageType">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@ldesign/i18n/vue'

const { t } = useI18n()

const email = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const handleSubmit = async () => {
  loading.value = true
  message.value = ''
  
  try {
    // 模拟发送重置邮件
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    message.value = t('auth.emailSent')
    messageType.value = 'success'
    email.value = ''
  } catch (error) {
    message.value = t('auth.emailNotFound')
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.forgot-password-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forgot-password-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.forgot-password-form {
  h2 {
    text-align: center;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 2rem;
    font-size: 0.9rem;
    line-height: 1.4;
  }
}

.form-group {
  margin-bottom: 1.5rem;
  
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

.submit-btn {
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

.back-link {
  text-align: center;
  margin-top: 1.5rem;
  
  a {
    color: #667eea;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
  
  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
}
</style>
