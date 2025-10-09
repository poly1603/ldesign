<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFormValidation, validators, useLoginState } from '@ldesign/template/composables'
import { checkPasswordStrength, type PasswordStrengthResult } from '@ldesign/template/utils'

/**
 * Props
 */
interface Props {
  /** 是否显示记住密码 */
  showRemember?: boolean
  /** 是否显示密码强度 */
  showPasswordStrength?: boolean
  /** 是否自动聚焦 */
  autoFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRemember: true,
  showPasswordStrength: true,
  autoFocus: true,
})

/**
 * Emits
 */
const emit = defineEmits<{
  success: [user: any]
  error: [error: Error]
}>()

/**
 * 登录状态管理
 */
const {
  loading,
  error: loginError,
  isLocked,
  remainingLockTime,
  rememberedUsername,
  login,
  clearError,
} = useLoginState({
  enableRemember: props.showRemember,
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15分钟
})

/**
 * 表单验证
 */
const {
  values,
  errors,
  touched,
  isValid,
  validateField,
  validateForm,
  setFieldValue,
  setFieldTouched,
  handleSubmit,
} = useFormValidation({
  fields: {
    username: {
      initialValue: rememberedUsername.value || '',
      rules: [
        validators.required('请输入用户名'),
        validators.minLength(3, '用户名至少3个字符'),
        validators.maxLength(20, '用户名最多20个字符'),
      ],
    },
    password: {
      initialValue: '',
      rules: [
        validators.required('请输入密码'),
        validators.minLength(6, '密码至少6个字符'),
      ],
    },
    remember: {
      initialValue: false,
      rules: [],
    },
  },
  validateOnChange: true,
  debounceDelay: 300,
})

/**
 * 密码可见性
 */
const showPassword = ref(false)

/**
 * 密码强度
 */
const passwordStrength = ref<PasswordStrengthResult | null>(null)

/**
 * 监听密码变化，计算强度
 */
watch(() => values.password, (newPassword) => {
  if (props.showPasswordStrength && newPassword) {
    passwordStrength.value = checkPasswordStrength(newPassword, {
      minLength: 6,
      requireLowerCase: false,
      requireUpperCase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    })
  } else {
    passwordStrength.value = null
  }
})

/**
 * 锁定提示
 */
const lockoutMessage = computed(() => {
  if (!isLocked.value) return ''
  const minutes = Math.ceil(remainingLockTime.value / 60)
  return `账户已被锁定，请在 ${minutes} 分钟后重试`
})

/**
 * 提交表单
 */
const onSubmit = async () => {
  try {
    clearError()
    
    const user = await login({
      username: values.username,
      password: values.password,
      remember: values.remember,
    })
    
    emit('success', user)
  } catch (err: any) {
    emit('error', err)
  }
}

/**
 * 切换密码可见性
 */
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

/**
 * 字段失焦处理
 */
const handleBlur = (field: 'username' | 'password' | 'remember') => {
  setFieldTouched(field, true)
  validateField(field)
}
</script>

<template>
  <div class="enhanced-login-form">
    <!-- 锁定提示 -->
    <div v-if="isLocked" class="lock-message">
      <span class="lock-icon">🔒</span>
      <p>{{ lockoutMessage }}</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="loginError && !isLocked" class="error-message">
      <span class="error-icon">⚠️</span>
      <p>{{ loginError }}</p>
    </div>

    <!-- 表单 -->
    <form @submit.prevent="handleSubmit(onSubmit)" class="login-form">
      <!-- 用户名 -->
      <div class="form-group">
        <label for="username" class="form-label">
          用户名
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <input
            id="username"
            :value="values.username"
            @input="setFieldValue('username', ($event.target as HTMLInputElement).value)"
            @blur="handleBlur('username')"
            type="text"
            class="form-input"
            :class="{ 'has-error': touched.username && errors.username }"
            placeholder="请输入用户名"
            :disabled="loading || isLocked"
            :autofocus="autoFocus"
            autocomplete="username"
          >
          <span class="input-icon">👤</span>
        </div>
        <div v-if="touched.username && errors.username" class="field-error">
          {{ errors.username }}
        </div>
      </div>

      <!-- 密码 -->
      <div class="form-group">
        <label for="password" class="form-label">
          密码
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <input
            id="password"
            :value="values.password"
            @input="setFieldValue('password', ($event.target as HTMLInputElement).value)"
            @blur="handleBlur('password')"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'has-error': touched.password && errors.password }"
            placeholder="请输入密码"
            :disabled="loading || isLocked"
            autocomplete="current-password"
          >
          <button
            type="button"
            class="password-toggle"
            @click="togglePasswordVisibility"
            :disabled="loading || isLocked"
            :aria-label="showPassword ? '隐藏密码' : '显示密码'"
          >
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
        <div v-if="touched.password && errors.password" class="field-error">
          {{ errors.password }}
        </div>

        <!-- 密码强度指示器 -->
        <div v-if="showPasswordStrength && passwordStrength && values.password" class="password-strength">
          <div class="strength-bar">
            <div
              class="strength-fill"
              :style="{
                width: `${passwordStrength.score}%`,
                backgroundColor: passwordStrength.color,
              }"
            ></div>
          </div>
          <div class="strength-label" :style="{ color: passwordStrength.color }">
            {{ passwordStrength.label }}
          </div>
        </div>
      </div>

      <!-- 记住密码 -->
      <div v-if="showRemember" class="form-group checkbox-group">
        <label class="checkbox-label">
          <input
            :checked="values.remember"
            @change="setFieldValue('remember', ($event.target as HTMLInputElement).checked)"
            type="checkbox"
            class="checkbox-input"
            :disabled="loading || isLocked"
          >
          <span class="checkbox-text">记住我</span>
        </label>
      </div>

      <!-- 提交按钮 -->
      <button
        type="submit"
        class="submit-button"
        :disabled="!isValid || loading || isLocked"
        :class="{ 'is-loading': loading }"
      >
        <span v-if="loading" class="loading-spinner">⏳</span>
        <span v-else>登录</span>
      </button>
    </form>

    <!-- 提示信息 -->
    <div class="form-footer">
      <p class="hint-text">
        测试账号: admin / admin123
      </p>
    </div>
  </div>
</template>

<style lang="less" scoped>
.enhanced-login-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.lock-message,
.error-message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease;
}

.lock-message {
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f44336;
  color: #721c24;
}

.lock-icon,
.error-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #f44336;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &.has-error {
    border-color: #f44336;

    &:focus {
      box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
    }
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
}

.input-icon {
  position: absolute;
  right: 12px;
  font-size: 18px;
  pointer-events: none;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: scale(1.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.field-error {
  font-size: 12px;
  color: #f44336;
  animation: slideIn 0.3s ease;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-label {
  font-size: 12px;
  font-weight: 500;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
}

.checkbox-text {
  font-size: 14px;
  color: #666;
}

.submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &.is-loading {
    pointer-events: none;
  }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

.form-footer {
  margin-top: 16px;
  text-align: center;
}

.hint-text {
  font-size: 12px;
  color: #999;
  margin: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

