<template>
  <form class="username-login-form" @submit.prevent="handleSubmit">
    <BaseInput
      v-model="formData.username"
      placeholder="请输入用户名"
      prefix-icon="icon-user"
      :error-message="errors.username"
      :clearable="true"
      @update:model-value="clearError('username')"
      @enter="handleSubmit"
    />
    
    <BaseInput
      v-model="formData.password"
      type="password"
      placeholder="请输入密码"
      prefix-icon="icon-lock"
      :error-message="errors.password"
      @update:model-value="clearError('password')"
      @enter="handleSubmit"
    />
    
    <ImageCaptcha
      v-model="formData.captcha"
      :image-url="captchaUrl"
      :error-message="errors.captcha"
      @update:model-value="clearError('captcha')"
      @refresh="handleRefreshCaptcha"
      @enter="handleSubmit"
    />
    
    <div class="form-options">
      <RememberCheckbox v-model="formData.remember" />
      <a href="#" class="forgot-password" @click.prevent="$emit('forgot-password')">
        忘记密码？
      </a>
    </div>
    
    <button
      type="submit"
      class="login-button"
      :disabled="isLoading || !isFormValid"
      :class="{ loading: isLoading }"
    >
      <span v-if="isLoading" class="button-loading"></span>
      <span v-else>登录</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import BaseInput from './BaseInput.vue'
import ImageCaptcha from './ImageCaptcha.vue'
import RememberCheckbox from './RememberCheckbox.vue'
import { validateUsername, validatePassword, validateCaptcha } from '../utils/validators'
import type { LoginFormData } from '../types'

interface Props {
  captchaUrl?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'submit': [data: LoginFormData]
  'refresh-captcha': []
  'forgot-password': []
}>()

const formData = reactive<LoginFormData>({
  username: '',
  password: '',
  captcha: '',
  remember: false
})

const errors = reactive({
  username: '',
  password: '',
  captcha: ''
})

const isLoading = computed(() => props.loading)

const isFormValid = computed(() => {
  return formData.username && formData.password && formData.captcha
})

const clearError = (field: keyof typeof errors) => {
  errors[field] = ''
}

const validateForm = (): boolean => {
  let isValid = true
  
  // 验证用户名
  if (!formData.username) {
    errors.username = '请输入用户名'
    isValid = false
  } else if (!validateUsername(formData.username)) {
    errors.username = '用户名格式不正确'
    isValid = false
  }
  
  // 验证密码
  if (!formData.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (!validatePassword(formData.password)) {
    errors.password = '密码格式不正确'
    isValid = false
  }
  
  // 验证验证码
  if (!formData.captcha) {
    errors.captcha = '请输入验证码'
    isValid = false
  } else if (!validateCaptcha(formData.captcha)) {
    errors.captcha = '验证码格式不正确'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = () => {
  if (isLoading.value) return
  
  if (validateForm()) {
    emit('submit', { ...formData })
  }
}

const handleRefreshCaptcha = () => {
  formData.captcha = ''
  emit('refresh-captcha')
}
</script>

<style scoped>
.username-login-form {
  width: 100%;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0;
}

.forgot-password {
  color: #1677ff;
  font-size: 14px;
  text-decoration: none;
  transition: opacity 0.3s;
}

.forgot-password:hover {
  opacity: 0.8;
}

.login-button {
  width: 100%;
  height: 44px;
  margin-top: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-button:hover:not(:disabled)::before {
  left: 100%;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.login-button.loading {
  pointer-events: none;
}

.button-loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 图标样式 */
:deep(.icon-user)::before {
  content: '👤';
}

:deep(.icon-lock)::before {
  content: '🔒';
}
</style>