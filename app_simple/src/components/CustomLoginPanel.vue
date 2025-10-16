<template>
  <div class="custom-login-panel">
    <!-- 登录方式切换 -->
    <div class="login-tabs">
      <button 
        :class="{ active: loginMode === 'password' }"
        @click="switchMode('password')">
        <i class="icon-password"></i>
        {{ t('login.modes.password') }}
      </button>
      <button 
        :class="{ active: loginMode === 'sms' }"
        @click="switchMode('sms')">
        <i class="icon-sms"></i>
        {{ t('login.modes.sms') }}
      </button>
      <button 
        :class="{ active: loginMode === 'qrcode' }"
        @click="switchMode('qrcode')">
        <i class="icon-qrcode"></i>
        {{ t('login.modes.qrcode') }}
      </button>
    </div>

    <!-- 密码登录 -->
    <form v-if="loginMode === 'password'" @submit.prevent="handlePasswordLogin" class="login-form">
      <div class="form-group">
        <div class="input-wrapper">
          <i class="icon-user"></i>
          <input 
            v-model="passwordForm.username"
            type="text" 
            :placeholder="t('login.placeholders.username')"
            class="form-input"
            required
          />
        </div>
      </div>
      
      <div class="form-group">
        <div class="input-wrapper">
          <i class="icon-lock"></i>
          <input 
            v-model="passwordForm.password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('login.placeholders.password')"
            class="form-input"
            required
          />
          <button 
            type="button"
            class="toggle-password"
            @click="showPassword = !showPassword">
            <i :class="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
          </button>
        </div>
      </div>
      
      <div class="form-options">
        <label class="remember-me">
          <input type="checkbox" v-model="rememberMe" />
          <span>{{ t('login.rememberMe') }}</span>
        </label>
        <a href="#" class="forgot-link" @click.prevent="handleForgotPassword">
          {{ t('login.forgotPassword') }}
        </a>
      </div>
      
      <button type="submit" class="submit-btn" :disabled="loading">
        <span v-if="!loading">{{ t('login.submit') }}</span>
        <span v-else class="loading-spinner">
          <i class="icon-spinner"></i>
          {{ t('login.submitting') }}
        </span>
      </button>
    </form>

    <!-- 短信登录 -->
    <form v-else-if="loginMode === 'sms'" @submit.prevent="handleSmsLogin" class="login-form">
      <div class="form-group">
        <div class="input-wrapper">
          <i class="icon-phone"></i>
          <input 
            v-model="smsForm.phone"
            type="tel" 
            :placeholder="t('login.placeholders.phone')"
            class="form-input"
            pattern="[0-9]{11}"
            required
          />
        </div>
      </div>
      
      <div class="form-group">
        <div class="input-wrapper with-button">
          <i class="icon-message"></i>
          <input 
            v-model="smsForm.code"
            type="text" 
            :placeholder="t('login.placeholders.smsCode')"
            class="form-input"
            maxlength="6"
            required
          />
          <button 
            type="button"
            class="sms-btn"
            :disabled="countdown > 0 || !smsForm.phone"
            @click="sendSmsCode">
            {{ countdown > 0 ? t('login.resendIn', { seconds: countdown }) : t('login.sendCode') }}
          </button>
        </div>
      </div>
      
      <button type="submit" class="submit-btn" :disabled="loading">
        <span v-if="!loading">{{ t('login.submit') }}</span>
        <span v-else class="loading-spinner">
          <i class="icon-spinner"></i>
          {{ t('login.submitting') }}
        </span>
      </button>
    </form>

    <!-- 扫码登录 -->
    <div v-else-if="loginMode === 'qrcode'" class="qrcode-login">
      <div class="qrcode-container">
        <div v-if="!qrcodeUrl" class="qrcode-loading">
          <i class="icon-spinner"></i>
          <p>{{ t('login.qrcode.loading') }}</p>
        </div>
        <div v-else class="qrcode-wrapper">
          <!-- 实际项目中这里应该是二维码组件 -->
          <div class="qrcode-placeholder">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <rect width="200" height="200" fill="#f0f0f0" rx="8" />
              <text x="100" y="100" text-anchor="middle" fill="#999" font-size="14">
                QR Code
              </text>
            </svg>
          </div>
          <p class="qrcode-tip">{{ t('login.qrcode.tip') }}</p>
          <button class="refresh-btn" @click="refreshQrcode">
            <i class="icon-refresh"></i>
            {{ t('login.qrcode.refresh') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <Transition name="error">
      <div v-if="errorMessage" class="error-message">
        <i class="icon-alert"></i>
        {{ errorMessage }}
      </div>
    </Transition>

    <!-- 成功提示 -->
    <Transition name="success">
      <div v-if="successMessage" class="success-message">
        <i class="icon-check"></i>
        {{ successMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/i18n'

interface Props {
  onSubmit?: (data: any) => Promise<void>
  loading?: boolean
  error?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  forgotPassword: []
  switchMode: [mode: string]
}>()

const { t } = useI18n()

// 登录模式
const loginMode = ref<'password' | 'sms' | 'qrcode'>('password')

// 表单数据
const passwordForm = reactive({
  username: '',
  password: ''
})

const smsForm = reactive({
  phone: '',
  code: ''
})

// UI 状态
const rememberMe = ref(false)
const showPassword = ref(false)
const countdown = ref(0)
const qrcodeUrl = ref('')
const errorMessage = ref('')
const successMessage = ref('')

let countdownTimer: ReturnType<typeof setInterval> | null = null
let qrcodeTimer: ReturnType<typeof setTimeout> | null = null

// 切换登录模式
const switchMode = (mode: 'password' | 'sms' | 'qrcode') => {
  loginMode.value = mode
  errorMessage.value = ''
  successMessage.value = ''
  emit('switchMode', mode)
  
  if (mode === 'qrcode') {
    loadQrcode()
  }
}

// 密码登录
const handlePasswordLogin = async () => {
  if (!passwordForm.username || !passwordForm.password) {
    errorMessage.value = t('login.errors.required')
    return
  }
  
  errorMessage.value = ''
  
  try {
    await props.onSubmit?.({
      type: 'password',
      username: passwordForm.username,
      password: passwordForm.password,
      rememberMe: rememberMe.value
    })
    successMessage.value = t('login.success')
  } catch (error: any) {
    errorMessage.value = error.message || t('login.errors.failed')
  }
}

// 短信登录
const handleSmsLogin = async () => {
  if (!smsForm.phone || !smsForm.code) {
    errorMessage.value = t('login.errors.required')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(smsForm.phone)) {
    errorMessage.value = t('login.errors.invalidPhone')
    return
  }
  
  if (!/^\d{6}$/.test(smsForm.code)) {
    errorMessage.value = t('login.errors.invalidCode')
    return
  }
  
  errorMessage.value = ''
  
  try {
    await props.onSubmit?.({
      type: 'sms',
      phone: smsForm.phone,
      code: smsForm.code
    })
    successMessage.value = t('login.success')
  } catch (error: any) {
    errorMessage.value = error.message || t('login.errors.failed')
  }
}

// 发送验证码
const sendSmsCode = async () => {
  if (!smsForm.phone) {
    errorMessage.value = t('login.errors.phoneRequired')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(smsForm.phone)) {
    errorMessage.value = t('login.errors.invalidPhone')
    return
  }
  
  // 模拟发送验证码
  try {
    // 这里应该调用实际的API
    console.log('Sending SMS code to:', smsForm.phone)
    
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }
    }, 1000)
    
    successMessage.value = t('login.codeSent')
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    errorMessage.value = t('login.errors.sendCodeFailed')
  }
}

// 加载二维码
const loadQrcode = async () => {
  qrcodeUrl.value = ''
  
  // 模拟加载二维码
  qrcodeTimer = setTimeout(() => {
    qrcodeUrl.value = 'mock-qrcode-url'
    // 实际项目中应该轮询检查扫码状态
  }, 1000)
}

// 刷新二维码
const refreshQrcode = () => {
  loadQrcode()
}

// 忘记密码
const handleForgotPassword = () => {
  emit('forgotPassword')
}

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  if (qrcodeTimer) {
    clearTimeout(qrcodeTimer)
  }
})

// 监听外部错误
import { watch } from 'vue'
watch(() => props.error, (newError) => {
  if (newError) {
    errorMessage.value = newError
  }
})
</script>

<style scoped>
.custom-login-panel {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

/* 登录方式切换 */
.login-tabs {
  display: flex;
  margin-bottom: 32px;
  border-bottom: 2px solid #e0e0e0;
}

.login-tabs button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.login-tabs button:hover {
  color: #333;
}

.login-tabs button.active {
  color: var(--color-primary-default, #667eea);
  font-weight: 500;
}

.login-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary-default, #667eea);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* 表单样式 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i:first-child {
  position: absolute;
  left: 16px;
  color: #999;
  font-size: 18px;
}

.form-input {
  flex: 1;
  padding: 14px 16px 14px 48px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-default, #667eea);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #999;
}

/* 密码切换按钮 */
.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  transition: color 0.3s;
}

.toggle-password:hover {
  color: var(--color-primary-default, #667eea);
}

/* 带按钮的输入框 */
.input-wrapper.with-button .form-input {
  padding-right: 120px;
}

.sms-btn {
  position: absolute;
  right: 8px;
  padding: 8px 16px;
  background: var(--color-primary-default, #667eea);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.sms-btn:hover:not(:disabled) {
  background: var(--color-primary-active, #764ba2);
}

.sms-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
}

.remember-me input {
  cursor: pointer;
}

.forgot-link {
  color: var(--color-primary-default, #667eea);
  text-decoration: none;
  transition: opacity 0.3s;
}

.forgot-link:hover {
  opacity: 0.8;
}

/* 提交按钮 */
.submit-btn {
  padding: 14px;
  background: linear-gradient(135deg, var(--color-primary-default, #667eea) 0%, var(--color-primary-active, #764ba2) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.submit-btn:hover:not(:disabled)::before {
  width: 300px;
  height: 300px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #ccc;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-spinner i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 扫码登录 */
.qrcode-login {
  text-align: center;
  padding: 20px 0;
}

.qrcode-container {
  display: inline-block;
}

.qrcode-loading {
  padding: 40px;
  color: #666;
}

.qrcode-loading i {
  font-size: 32px;
  animation: spin 1s linear infinite;
}

.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.qrcode-placeholder {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qrcode-tip {
  color: #666;
  font-size: 14px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover {
  border-color: var(--color-primary-default, #667eea);
  color: var(--color-primary-default, #667eea);
}

/* 消息提示 */
.error-message,
.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  margin-top: 16px;
  animation: slideUp 0.3s ease;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.success-message {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 过渡动画 */
.error-enter-active,
.error-leave-active,
.success-enter-active,
.success-leave-active {
  transition: all 0.3s ease;
}

.error-enter-from,
.error-leave-to,
.success-enter-from,
.success-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 图标样式（模拟） */
[class^="icon-"] {
  display: inline-block;
  width: 1em;
  height: 1em;
}

.icon-user::before { content: '👤'; }
.icon-lock::before { content: '🔒'; }
.icon-eye::before { content: '👁'; }
.icon-eye-off::before { content: '🙈'; }
.icon-phone::before { content: '📱'; }
.icon-message::before { content: '💬'; }
.icon-qrcode::before { content: '▦'; }
.icon-spinner::before { content: '⟳'; }
.icon-alert::before { content: '⚠'; }
.icon-check::before { content: '✓'; }
.icon-refresh::before { content: '↻'; }
.icon-password::before { content: '🔑'; }
.icon-sms::before { content: '📨'; }
</style>