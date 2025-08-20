<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from '@ldesign/i18n/vue'

// 定义 props
interface LoginPanelProps {
  title?: string
  subtitle?: string
  showRememberMe?: boolean
  showForgotPassword?: boolean
  showThirdPartyLogin?: boolean
  isLoading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<LoginPanelProps>(), {
  title: '用户登录',
  subtitle: '请输入您的账号信息',
  showRememberMe: true,
  showForgotPassword: true,
  showThirdPartyLogin: false,
  isLoading: false,
  error: null,
})

// 定义 emits
const emit = defineEmits<{
  login: [
    data: {
      username: string
      password: string
      rememberMe: boolean
      captcha?: string
      smsCode?: string
    }
  ]
  register: []
  forgotPassword: [data: { username?: string; phone?: string }]
  thirdPartyLogin: [data: { provider: string }]
}>()

const { t } = useI18n()

// 登录方式
const loginMethods = ref<'password' | 'sms'>('password')

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  phone: '',
  smsCode: '',
  captcha: '',
  rememberMe: false,
})

// 验证码相关
const captchaCode = ref('')
const captchaImage = ref('')
const smsCountdown = ref(0)
const smsTimer = ref<NodeJS.Timeout | null>(null)

// 表单验证状态
const validation = reactive({
  username: { valid: true, message: '' },
  password: { valid: true, message: '' },
  phone: { valid: true, message: '' },
  smsCode: { valid: true, message: '' },
  captcha: { valid: true, message: '' },
})

// 计算属性
const canSubmit = computed(() => {
  if (loginMethods.value === 'password') {
    return (
      formData.username &&
      formData.password &&
      formData.captcha &&
      !props.isLoading
    )
  } else {
    return (
      formData.phone && formData.smsCode && formData.captcha && !props.isLoading
    )
  }
})

const smsButtonText = computed(() => {
  if (smsCountdown.value > 0) {
    return `${smsCountdown.value}s 后重新发送`
  }
  return '发送验证码'
})

// 生成验证码
function generateCaptcha() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaCode.value = result

  // 生成验证码图片（简化版本，实际应该从后端获取）
  const canvas = document.createElement('canvas')
  canvas.width = 120
  canvas.height = 40
  const ctx = canvas.getContext('2d')!

  // 背景
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, 120, 40)

  // 干扰线
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `hsl(${Math.random() * 360}, 50%, 50%)`
    ctx.beginPath()
    ctx.moveTo(Math.random() * 120, Math.random() * 40)
    ctx.lineTo(Math.random() * 120, Math.random() * 40)
    ctx.stroke()
  }

  // 文字
  ctx.font = '20px Arial'
  ctx.fillStyle = '#333'
  ctx.textAlign = 'center'
  ctx.fillText(result, 60, 25)

  captchaImage.value = canvas.toDataURL()
}

// 发送短信验证码
function sendSmsCode() {
  if (smsCountdown.value > 0 || !formData.phone) return

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(formData.phone)) {
    validation.phone.valid = false
    validation.phone.message = '请输入正确的手机号'
    return
  }

  validation.phone.valid = true
  validation.phone.message = ''

  // 模拟发送短信
  console.log('发送短信验证码到:', formData.phone)

  // 开始倒计时
  smsCountdown.value = 60
  smsTimer.value = setInterval(() => {
    smsCountdown.value--
    if (smsCountdown.value <= 0) {
      clearInterval(smsTimer.value!)
      smsTimer.value = null
    }
  }, 1000)
}

// 验证表单
function validateForm() {
  let isValid = true

  if (loginMethods.value === 'password') {
    // 验证用户名
    if (!formData.username) {
      validation.username.valid = false
      validation.username.message = '请输入用户名'
      isValid = false
    } else {
      validation.username.valid = true
      validation.username.message = ''
    }

    // 验证密码
    if (!formData.password) {
      validation.password.valid = false
      validation.password.message = '请输入密码'
      isValid = false
    } else if (formData.password.length < 6) {
      validation.password.valid = false
      validation.password.message = '密码至少6位'
      isValid = false
    } else {
      validation.password.valid = true
      validation.password.message = ''
    }
  } else {
    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!formData.phone) {
      validation.phone.valid = false
      validation.phone.message = '请输入手机号'
      isValid = false
    } else if (!phoneRegex.test(formData.phone)) {
      validation.phone.valid = false
      validation.phone.message = '请输入正确的手机号'
      isValid = false
    } else {
      validation.phone.valid = true
      validation.phone.message = ''
    }

    // 验证短信验证码
    if (!formData.smsCode) {
      validation.smsCode.valid = false
      validation.smsCode.message = '请输入短信验证码'
      isValid = false
    } else if (formData.smsCode.length !== 6) {
      validation.smsCode.valid = false
      validation.smsCode.message = '验证码为6位数字'
      isValid = false
    } else {
      validation.smsCode.valid = true
      validation.smsCode.message = ''
    }
  }

  // 验证图片验证码
  if (!formData.captcha) {
    validation.captcha.valid = false
    validation.captcha.message = '请输入验证码'
    isValid = false
  } else if (
    formData.captcha.toLowerCase() !== captchaCode.value.toLowerCase()
  ) {
    validation.captcha.valid = false
    validation.captcha.message = '验证码错误'
    isValid = false
  } else {
    validation.captcha.valid = true
    validation.captcha.message = ''
  }

  return isValid
}

// 处理登录
function handleLogin() {
  if (!validateForm()) return

  const loginData = {
    username: formData.username,
    password: formData.password,
    phone: formData.phone,
    smsCode: formData.smsCode,
    captcha: formData.captcha,
    rememberMe: formData.rememberMe,
  }

  emit('login', loginData)
}

// 处理注册
function handleRegister() {
  emit('register')
}

// 处理忘记密码
function handleForgotPassword() {
  const data =
    loginMethods.value === 'password'
      ? { username: formData.username }
      : { phone: formData.phone }
  emit('forgotPassword', data)
}

// 处理第三方登录
function handleThirdPartyLogin(provider: string) {
  emit('thirdPartyLogin', { provider })
}

// 切换登录方式
function switchLoginMethod(method: 'password' | 'sms') {
  loginMethods.value = method
  // 清空验证状态
  Object.keys(validation).forEach(key => {
    validation[key as keyof typeof validation].valid = true
    validation[key as keyof typeof validation].message = ''
  })
}

// 组件挂载时生成验证码
onMounted(() => {
  generateCaptcha()
})
</script>

<template>
  <div class="login-panel">
    <!-- 头部 -->
    <div class="login-header">
      <h1 class="title">{{ props.title }}</h1>
      <p class="subtitle">{{ props.subtitle }}</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="props.error" class="error-message">
      <span class="error-icon">❌</span>
      <span class="error-text">{{ props.error }}</span>
    </div>

    <!-- 登录方式切换 -->
    <div class="login-methods">
      <button
        type="button"
        class="method-btn"
        :class="{ active: loginMethods === 'password' }"
        @click="switchLoginMethod('password')"
      >
        <span class="method-icon">🔐</span>
        <span>密码登录</span>
      </button>
      <button
        type="button"
        class="method-btn"
        :class="{ active: loginMethods === 'sms' }"
        @click="switchLoginMethod('sms')"
      >
        <span class="method-icon">📱</span>
        <span>短信登录</span>
      </button>
    </div>

    <!-- 登录表单 -->
    <form class="login-form" @submit.prevent="handleLogin">
      <!-- 密码登录表单 -->
      <div v-if="loginMethods === 'password'" class="form-section">
        <div class="form-group">
          <label for="username" class="form-label">
            <span class="label-icon">👤</span>
            <span>用户名</span>
          </label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            class="form-input"
            :class="{ error: !validation.username.valid }"
            placeholder="请输入用户名"
            :disabled="props.isLoading"
          />
          <div v-if="!validation.username.valid" class="error-tip">
            {{ validation.username.message }}
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            <span class="label-icon">🔒</span>
            <span>密码</span>
          </label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            class="form-input"
            :class="{ error: !validation.password.valid }"
            placeholder="请输入密码"
            :disabled="props.isLoading"
          />
          <div v-if="!validation.password.valid" class="error-tip">
            {{ validation.password.message }}
          </div>
        </div>
      </div>

      <!-- 短信登录表单 -->
      <div v-else class="form-section">
        <div class="form-group">
          <label for="phone" class="form-label">
            <span class="label-icon">📱</span>
            <span>手机号</span>
          </label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            class="form-input"
            :class="{ error: !validation.phone.valid }"
            placeholder="请输入手机号"
            :disabled="props.isLoading"
          />
          <div v-if="!validation.phone.valid" class="error-tip">
            {{ validation.phone.message }}
          </div>
        </div>

        <div class="form-group">
          <label for="smsCode" class="form-label">
            <span class="label-icon">💬</span>
            <span>短信验证码</span>
          </label>
          <div class="input-group">
            <input
              id="smsCode"
              v-model="formData.smsCode"
              type="text"
              class="form-input"
              :class="{ error: !validation.smsCode.valid }"
              placeholder="请输入验证码"
              maxlength="6"
              :disabled="props.isLoading"
            />
            <button
              type="button"
              class="sms-btn"
              :disabled="smsCountdown > 0 || !formData.phone || props.isLoading"
              @click="sendSmsCode"
            >
              {{ smsButtonText }}
            </button>
          </div>
          <div v-if="!validation.smsCode.valid" class="error-tip">
            {{ validation.smsCode.message }}
          </div>
        </div>
      </div>

      <!-- 图片验证码 -->
      <div class="form-group">
        <label for="captcha" class="form-label">
          <span class="label-icon">🔢</span>
          <span>验证码</span>
        </label>
        <div class="input-group">
          <input
            id="captcha"
            v-model="formData.captcha"
            type="text"
            class="form-input"
            :class="{ error: !validation.captcha.valid }"
            placeholder="请输入验证码"
            maxlength="4"
            :disabled="props.isLoading"
          />
          <div class="captcha-container">
            <img
              :src="captchaImage"
              alt="验证码"
              class="captcha-image"
              @click="generateCaptcha"
              title="点击刷新验证码"
            />
            <button
              type="button"
              class="refresh-btn"
              @click="generateCaptcha"
              title="刷新验证码"
            >
              🔄
            </button>
          </div>
        </div>
        <div v-if="!validation.captcha.valid" class="error-tip">
          {{ validation.captcha.message }}
        </div>
      </div>

      <!-- 记住密码 -->
      <div v-if="props.showRememberMe" class="form-group checkbox-group">
        <label class="checkbox-label">
          <input
            v-model="formData.rememberMe"
            type="checkbox"
            :disabled="props.isLoading"
          />
          <span class="checkbox-text">记住密码</span>
        </label>
      </div>

      <!-- 登录按钮 -->
      <button
        type="submit"
        class="login-btn"
        :disabled="!canSubmit"
        :class="{ loading: props.isLoading }"
      >
        <span v-if="props.isLoading" class="loading-spinner"></span>
        <span>{{ props.isLoading ? '登录中...' : '登录' }}</span>
      </button>
    </form>

    <!-- 底部链接 -->
    <div class="login-footer">
      <div class="footer-links">
        <button
          v-if="props.showForgotPassword"
          type="button"
          class="link-btn"
          @click="handleForgotPassword"
        >
          忘记密码？
        </button>
        <button type="button" class="link-btn" @click="handleRegister">
          还没有账号？立即注册
        </button>
      </div>
    </div>

    <!-- 第三方登录 -->
    <div v-if="props.showThirdPartyLogin" class="third-party-login">
      <div class="divider">
        <span>或</span>
      </div>
      <div class="third-party-buttons">
        <button
          type="button"
          class="third-party-btn wechat"
          @click="handleThirdPartyLogin('wechat')"
        >
          <span class="provider-icon">💬</span>
          <span>微信登录</span>
        </button>
        <button
          type="button"
          class="third-party-btn qq"
          @click="handleThirdPartyLogin('qq')"
        >
          <span class="provider-icon">🐧</span>
          <span>QQ登录</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-panel {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25), 0 12px 32px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .title {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }

  .subtitle {
    font-size: 16px;
    color: #64748b;
    margin: 0;
    font-weight: 400;
    line-height: 1.5;
  }
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: shake 0.5s ease-in-out;

  .error-icon {
    font-size: 18px;
  }

  .error-text {
    color: #dc2626;
    font-size: 14px;
    font-weight: 500;
    flex: 1;
  }
}

.login-methods {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: #f8fafc;
  border-radius: 16px;
  padding: 4px;

  .method-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .method-icon {
      font-size: 16px;
    }

    &:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    &.active {
      background: white;
      color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
      transform: translateY(-1px);
    }
  }
}

.login-form {
  .form-section {
    margin-bottom: 24px;
  }

  .form-group {
    margin-bottom: 20px;

    &.checkbox-group {
      margin-bottom: 24px;
    }
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;

    .label-icon {
      font-size: 16px;
    }
  }

  .form-input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);

    &:hover:not(:disabled) {
      border-color: #d1d5db;
      background: rgba(255, 255, 255, 0.9);
    }

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
      background: white;
      transform: translateY(-1px);
    }

    &:disabled {
      background: #f9fafb;
      border-color: #e5e7eb;
      color: #9ca3af;
      cursor: not-allowed;
    }

    &.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }

    &::placeholder {
      color: #9ca3af;
      font-weight: 400;
    }
  }

  .input-group {
    display: flex;
    gap: 8px;
    align-items: stretch;

    .form-input {
      flex: 1;
    }
  }

  .error-tip {
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    animation: slideDown 0.3s ease;

    &::before {
      content: '⚠️';
      font-size: 12px;
    }
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #64748b;
    cursor: pointer;

    input[type='checkbox'] {
      margin-right: 8px;
      width: 16px;
      height: 16px;
      accent-color: #667eea;
    }

    .checkbox-text {
      user-select: none;
    }
  }
}

.sms-btn {
  padding: 14px 16px;
  border: 2px solid #667eea;
  border-radius: 12px;
  background: transparent;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 120px;

  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
  }
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 8px;

  .captcha-image {
    height: 48px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #667eea;
      transform: scale(1.05);
    }
  }

  .refresh-btn {
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 16px;

    &:hover {
      border-color: #667eea;
      color: #667eea;
      transform: rotate(180deg);
    }
  }
}

.login-btn {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    transition: all 0.1s ease;
  }

  &:disabled {
    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;

    &::before {
      display: none;
    }
  }

  &.loading {
    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

.login-footer {
  .footer-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;

    .link-btn {
      background: none;
      border: none;
      color: #667eea;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s ease;
      text-decoration: none;

      &:hover {
        color: #5a67d8;
        text-decoration: underline;
      }
    }
  }
}

.third-party-login {
  margin: 24px 0;

  .divider {
    text-align: center;
    margin: 20px 0;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e5e7eb;
    }

    span {
      background: rgba(255, 255, 255, 0.95);
      padding: 0 16px;
      color: #9ca3af;
      font-size: 14px;
      position: relative;
      z-index: 1;
    }
  }

  .third-party-buttons {
    display: flex;
    gap: 12px;

    .third-party-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      .provider-icon {
        font-size: 18px;
      }

      &:hover {
        border-color: #667eea;
        color: #667eea;
        background: rgba(102, 126, 234, 0.05);
        transform: translateY(-1px);
      }

      &.wechat:hover {
        border-color: #07c160;
        color: #07c160;
        background: rgba(7, 193, 96, 0.05);
      }

      &.qq:hover {
        border-color: #12b7f5;
        color: #12b7f5;
        background: rgba(18, 183, 245, 0.05);
      }
    }
  }
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

@keyframes slideDown {
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-panel {
    padding: 32px 24px;
    margin: 0 16px;
  }

  .login-header {
    .title {
      font-size: 24px;
    }

    .subtitle {
      font-size: 14px;
    }
  }

  .login-methods {
    .method-btn {
      padding: 10px 12px;
      font-size: 13px;

      .method-icon {
        font-size: 14px;
      }
    }
  }

  .login-form {
    .form-input {
      padding: 12px 14px;
      font-size: 16px; /* 防止 iOS 缩放 */
    }

    .input-group {
      flex-direction: column;
      gap: 8px;

      .sms-btn {
        min-width: auto;
        width: 100%;
      }
    }
  }

  .captcha-container {
    flex-direction: column;
    align-items: stretch;

    .captcha-image {
      width: 100%;
      height: 40px;
    }

    .refresh-btn {
      align-self: center;
      width: 40px;
    }
  }

  .third-party-login {
    .third-party-buttons {
      flex-direction: column;
    }
  }

  .test-account-info {
    padding: 12px;

    h4 {
      font-size: 13px;
    }

    p {
      font-size: 11px;
    }
  }
}

@media (max-width: 480px) {
  .login-panel {
    padding: 24px 20px;
    border-radius: 20px;
  }

  .login-header {
    margin-bottom: 24px;

    .title {
      font-size: 22px;
    }
  }

  .login-methods {
    margin-bottom: 20px;
  }

  .login-form {
    .form-group {
      margin-bottom: 16px;
    }

    .login-btn {
      padding: 14px 20px;
      font-size: 15px;
      margin-bottom: 20px;
    }
  }
}
</style>
