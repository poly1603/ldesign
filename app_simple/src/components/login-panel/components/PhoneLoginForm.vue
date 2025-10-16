<template>
  <form class="phone-login-form" @submit.prevent="handleSubmit">
    <BaseInput
      v-model="formData.phone"
      placeholder="请输入手机号"
      prefix-icon="icon-phone"
      :maxlength="11"
      :error-message="errors.phone"
      :clearable="true"
      @update:model-value="clearError('phone')"
      @enter="handleSubmit"
    />
    
    <SmsCaptcha
      v-model="formData.smsCode"
      :phone="formData.phone"
      :error-message="errors.smsCode"
      @update:model-value="clearError('smsCode')"
      @send="handleSendSmsCode"
      @enter="handleSubmit"
    />
    
    <div class="form-options">
      <RememberCheckbox v-model="formData.remember" />
      <div class="option-links">
        <a href="#" class="option-link" @click.prevent="$emit('switch-to-username')">
          用户名登录
        </a>
        <span class="divider">|</span>
        <a href="#" class="option-link" @click.prevent="$emit('register')">
          立即注册
        </a>
      </div>
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
import { reactive, computed } from 'vue'
import BaseInput from './BaseInput.vue'
import SmsCaptcha from './SmsCaptcha.vue'
import RememberCheckbox from './RememberCheckbox.vue'
import { validatePhone, validateSmsCode } from '../utils/validators'
import type { LoginFormData } from '../types'

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'submit': [data: LoginFormData]
  'send-sms': [phone: string]
  'switch-to-username': []
  'register': []
}>()

const formData = reactive<LoginFormData>({
  phone: '',
  smsCode: '',
  remember: false
})

const errors = reactive({
  phone: '',
  smsCode: ''
})

const isLoading = computed(() => props.loading)

const isFormValid = computed(() => {
  return formData.phone && formData.smsCode
})

const clearError = (field: keyof typeof errors) => {
  errors[field] = ''
}

const validateForm = (): boolean => {
  let isValid = true
  
  // 验证手机号
  if (!formData.phone) {
    errors.phone = '请输入手机号'
    isValid = false
  } else if (!validatePhone(formData.phone)) {
    errors.phone = '请输入正确的手机号'
    isValid = false
  }
  
  // 验证短信验证码
  if (!formData.smsCode) {
    errors.smsCode = '请输入验证码'
    isValid = false
  } else if (!validateSmsCode(formData.smsCode)) {
    errors.smsCode = '请输入6位数字验证码'
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

const handleSendSmsCode = (phone: string) => {
  // 先验证手机号
  if (!validatePhone(phone)) {
    errors.phone = '请输入正确的手机号'
    return
  }
  
  emit('send-sms', phone)
}
</script>

<style scoped>
.phone-login-form {
  width: 100%;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0;
}

.option-links {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.option-link {
  color: #1677ff;
  text-decoration: none;
  transition: opacity 0.3s;
}

.option-link:hover {
  opacity: 0.8;
}

.divider {
  color: #d9d9d9;
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
:deep(.icon-phone)::before {
  content: '📱';
}
</style>