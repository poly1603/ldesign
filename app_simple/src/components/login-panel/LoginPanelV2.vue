<template>
  <div class="login-panel">
    <MessageToast ref="messageRef" />
    <div class="login-container">
      <!-- Tab切换 - 支持多种登录方式扩展 -->
      <div class="login-tabs">
        <div class="tabs-track">
          <button v-for="tab in loginTabs" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }"
            @click="switchTab(tab.key)">
            <LucideIcon :name="tab.icon" :size="18" />
            <span>{{ tab.label }}</span>
          </button>
          <div class="tab-indicator" :style="indicatorStyle"></div>
        </div>
      </div>

      <!-- 账号登录表单 -->
      <form v-if="activeTab === 'account'" class="login-form" @submit.prevent="handleAccountLogin">
        <div class="form-item">
          <BaseInput v-model="accountForm.username" placeholder="admin" prefix-icon="user" :clearable="true" />
        </div>

        <div class="form-item">
          <BaseInput v-model="accountForm.password" type="password" placeholder="••••" prefix-icon="lock" />
        </div>

        <div class="form-item">
          <div class="captcha-row">
            <BaseInput v-model="accountForm.captcha" placeholder="请输入验证码" prefix-icon="shield" :maxlength="4" />
            <div class="captcha-image" @click="refreshCaptcha">
              <img :src="captchaUrl" alt="验证码" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkbox-label">记住密码</span>
          </label>
          <a href="#" class="link" @click.prevent="$emit('forgot')">忘记密码？</a>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <LucideIcon v-if="loading" name="loader" :size="20" class="spinning" />
          <span>{{ loading ? '登录中...' : '登录' }}</span>
        </button>
      </form>

      <!-- 手机登录表单 -->
      <form v-else class="login-form" @submit.prevent="handlePhoneLogin">
        <div class="form-item">
          <BaseInput v-model="phoneForm.phone" placeholder="手机号" prefix-icon="phone" :maxlength="11"
            :clearable="true" />
        </div>

        <div class="form-item">
          <div class="sms-row">
            <BaseInput v-model="phoneForm.code" placeholder="验证码" prefix-icon="messageSquare" :maxlength="6" />
            <button type="button" class="sms-btn" :disabled="countdown > 0 || !phoneForm.phone" @click="sendSmsCode">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </div>
        </div>

        <div class="form-item">
          <div class="captcha-row">
            <BaseInput v-model="phoneForm.captcha" placeholder="请输入验证码" prefix-icon="shield" :maxlength="4" />
            <div class="captcha-image" @click="refreshCaptcha">
              <img :src="captchaUrl" alt="验证码" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkbox-label">记住密码</span>
          </label>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <LucideIcon v-if="loading" name="loader" :size="20" class="spinning" />
          <span>{{ loading ? '登录中...' : '登录' }}</span>
        </button>
      </form>

      <!-- 其他登录方式 -->
      <div class="other-login">
        <div class="divider">
          <span>其他登录方式</span>
        </div>
        <div class="social-icons">
          <button class="social-btn wechat" @click="handleSocialLogin('wechat')">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.117-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
            </svg>
          </button>
          <button class="social-btn qq" @click="handleSocialLogin('qq')">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.04 2 11c0 2.52 1.1 4.8 2.84 6.44.15 1.44.7 3.9.96 4.88.06.18.22.31.42.31.11 0 .23-.04.33-.13.72-.67 2.16-2.36 2.77-3.48C9.75 19.36 10.84 19.5 12 19.5s2.25-.14 3.18-.48c.61 1.12 2.05 2.81 2.77 3.48.1.09.22.13.33.13.2 0 .36-.13.42-.31.26-.98.81-3.44.96-4.88C20.9 15.8 22 13.52 22 11c0-4.96-4.48-9-10-9z" />
            </svg>
          </button>
          <button class="social-btn github" @click="handleSocialLogin('github')">
            <LucideIcon name="github" :size="24" />
          </button>
          <button class="social-btn google" @click="handleSocialLogin('google')">
            <LucideIcon name="chrome" :size="24" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, provide, onBeforeUnmount } from 'vue'
import BaseInput from './components/BaseInput.vue'
import MessageToast from './components/MessageToast.vue'
import LucideIcon from './components/LucideIcon.vue'

const emit = defineEmits(['login', 'social-login', 'forgot'])

// Tab配置 - 方便后续扩展
const loginTabs = [
  { key: 'account', label: '账号登录', icon: 'user' },
  { key: 'phone', label: '手机登录', icon: 'phone' },
  // 可以在这里添加更多登录方式
  // { key: 'qrcode', label: '扫码登录', icon: 'qrcode' },
  // { key: 'email', label: '邮箱登录', icon: 'mail' },
]

const activeTab = ref(loginTabs[0].key)
const loading = ref(false)
const rememberMe = ref(false)
const captchaUrl = ref('')
const countdown = ref(0)
let countdownTimer: any = null

// 计算Tab指示器样式
const indicatorStyle = computed(() => {
  const index = loginTabs.findIndex(tab => tab.key === activeTab.value)
  const width = 100 / loginTabs.length
  return {
    width: `${width}%`,
    transform: `translateX(${index * 100}%)`
  }
})

// 切换Tab
const switchTab = (key: string) => {
  activeTab.value = key
}

const accountForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

const phoneForm = reactive({
  phone: '',
  code: '',
  captcha: ''
})

const messageRef = ref<InstanceType<typeof MessageToast>>()

// 提供消息服务
onMounted(() => {
  if (messageRef.value?.message) {
    provide('message', messageRef.value.message)
  }
  refreshCaptcha()
})

// 暴露消息服务
defineExpose({
  message: messageRef.value?.message
})

const refreshCaptcha = () => {
  // 生成模拟验证码
  captchaUrl.value = `data:image/svg+xml;base64,${btoa(`
    <svg width="100" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="40" fill="#f0f0f0"/>
      <text x="50" y="25" text-anchor="middle" fill="#333" font-size="20" font-family="Arial">
        ${Math.random().toString(36).substr(2, 4).toUpperCase()}
      </text>
    </svg>
  `)}`
}

const handleAccountLogin = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    emit('login', {
      type: 'account',
      ...accountForm,
      remember: rememberMe.value
    })
  }, 1500)
}

const handlePhoneLogin = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    emit('login', {
      type: 'phone',
      ...phoneForm,
      remember: rememberMe.value
    })
  }, 1500)
}

const sendSmsCode = () => {
  if (!phoneForm.phone) {
    messageRef.value?.message.error('请输入手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    messageRef.value?.message.error('请输入正确的手机号')
    return
  }

  // 模拟发送验证码
  messageRef.value?.message.success('验证码已发送')

  // 开始倒计时
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

const handleSocialLogin = (type: string) => {
  emit('social-login', type)
}

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.login-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

/* Tab 样式 */
.login-tabs {
  margin-bottom: 32px;
}

.tabs-track {
  position: relative;
  display: flex;
  gap: 4px;
  background: #f7f8fa;
  border-radius: 12px;
  padding: 4px;
}

.tab-item {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
}

.tab-item:hover:not(.active) {
  color: #475569;
}

.tab-item.active {
  color: #6366f1;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  height: calc(100% - 8px);
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

/* 表单样式 */
.login-form {
  display: flex;
  flex-direction: column;
}

.form-item {
  margin-bottom: 20px;
}

.captcha-row,
.sms-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.captcha-row :deep(.base-input-wrapper) {
  flex: 1;
}

.sms-row :deep(.base-input-wrapper) {
  flex: 1;
}

.captcha-image {
  flex-shrink: 0;
  width: 110px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1.5px solid #e5e7eb;
  transition: all 0.2s;
  background: #f9fafb;
}

.captcha-image:hover {
  border-color: #d1d5db;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sms-btn {
  flex-shrink: 0;
  width: 110px;
  height: 48px;
  padding: 0 12px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.sms-btn:hover:not(:disabled) {
  background: #5558e3;
  transform: translateY(-1px);
}

.sms-btn:active:not(:disabled) {
  transform: translateY(0);
}

.sms-btn:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-wrapper input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: #6b7280;
}

.link {
  font-size: 14px;
  color: #6366f1;
  text-decoration: none;
  transition: opacity 0.2s;
}

.link:hover {
  opacity: 0.8;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #5558e3;
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.25);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 其他登录方式 */
.other-login {
  margin-top: 32px;
}

.divider {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  position: relative;
  background: white;
  padding: 0 12px;
  font-size: 13px;
  color: #9ca3af;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-btn svg {
  width: 24px;
  height: 24px;
}

.social-btn.wechat {
  color: #07c160;
}

.social-btn.qq {
  color: #12B7F5;
}

.social-btn.github {
  color: #24292e;
}

.social-btn.google {
  color: #4285f4;
}
</style>