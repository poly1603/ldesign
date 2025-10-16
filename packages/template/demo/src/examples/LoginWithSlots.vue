<template>
  <div class="login-example">
    <h2>使用插槽自定义登录模板</h2>
    
    <!-- 使用 TemplateRenderer 并自定义插槽 -->
    <TemplateRenderer
      category="login"
      device="desktop"
      name="advanced"
      :component-props="{
        title: '系统登录',
        subtitle: '欢迎使用管理系统',
        showSocialLogin: true
      }"
    >
      <!-- 自定义 Logo -->
      <template #logo="{ size }">
        <div class="custom-logo" :class="`logo-${size}`">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="12" fill="url(#gradient)" />
            <path d="M28 16L38 32H18L28 16Z" fill="white" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="56" y2="56">
                <stop stop-color="#667eea" />
                <stop offset="1" stop-color="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
          <span class="logo-text">LDesign</span>
        </div>
      </template>

      <!-- 完全自定义登录面板 -->
      <template #loginPanel="{ onSubmit, loading, error }">
        <div class="custom-login-panel">
          <!-- 登录方式切换 -->
          <div class="login-tabs">
            <button 
              :class="{ active: loginMode === 'password' }"
              @click="loginMode = 'password'">
              密码登录
            </button>
            <button 
              :class="{ active: loginMode === 'sms' }"
              @click="loginMode = 'sms'">
              短信登录
            </button>
            <button 
              :class="{ active: loginMode === 'qrcode' }"
              @click="loginMode = 'qrcode'">
              扫码登录
            </button>
          </div>

          <!-- 密码登录 -->
          <form v-if="loginMode === 'password'" @submit.prevent="handlePasswordLogin(onSubmit)" class="login-form">
            <div class="form-group">
              <input 
                v-model="loginForm.username"
                type="text" 
                placeholder="用户名 / 邮箱 / 手机号"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <input 
                v-model="loginForm.password"
                type="password" 
                placeholder="密码"
                class="form-input"
              />
            </div>
            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" v-model="rememberMe" />
                <span>记住我</span>
              </label>
              <a href="#" class="forgot-link">忘记密码？</a>
            </div>
            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? '登录中...' : '立即登录' }}
            </button>
          </form>

          <!-- 短信登录 -->
          <form v-else-if="loginMode === 'sms'" @submit.prevent="handleSmsLogin(onSubmit)" class="login-form">
            <div class="form-group">
              <input 
                v-model="smsForm.phone"
                type="tel" 
                placeholder="手机号"
                class="form-input"
              />
            </div>
            <div class="form-group sms-group">
              <input 
                v-model="smsForm.code"
                type="text" 
                placeholder="验证码"
                class="form-input"
              />
              <button 
                type="button"
                class="sms-btn"
                :disabled="countdown > 0"
                @click="sendSmsCode">
                {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
              </button>
            </div>
            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? '登录中...' : '立即登录' }}
            </button>
          </form>

          <!-- 扫码登录 -->
          <div v-else-if="loginMode === 'qrcode'" class="qrcode-login">
            <div class="qrcode-container">
              <div class="qrcode-placeholder">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <rect x="10" y="10" width="180" height="180" fill="#f0f0f0" />
                  <text x="100" y="100" text-anchor="middle" fill="#999">二维码区域</text>
                </svg>
              </div>
              <p class="qrcode-tip">请使用手机APP扫码登录</p>
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="error || customError" class="error-message">
            {{ error || customError }}
          </div>
        </div>
      </template>

      <!-- 自定义社交登录 -->
      <template #socialLogin="{ providers }">
        <div class="custom-social-login">
          <div class="divider-text">其他登录方式</div>
          <div class="social-icons">
            <button 
              v-for="provider in customProviders" 
              :key="provider.name"
              @click="handleSocialLogin(provider)"
              class="social-icon-btn"
              :title="provider.label">
              <component :is="provider.icon" />
            </button>
          </div>
        </div>
      </template>

      <!-- 自定义底部 -->
      <template #extra>
        <div class="login-footer">
          <p>还没有账号？<a href="#" @click="showRegister">立即注册</a></p>
          <div class="footer-links">
            <a href="#">服务条款</a>
            <span>|</span>
            <a href="#">隐私政策</a>
            <span>|</span>
            <a href="#">帮助中心</a>
          </div>
        </div>
      </template>
    </TemplateRenderer>

    <!-- 使用 slots 属性方式 -->
    <div class="alternative-example">
      <h3>方式二：通过 slots 属性传递</h3>
      <TemplateRenderer
        category="login"
        device="desktop"
        name="advanced"
        :slots="programmaticSlots"
        :component-props="{
          title: '企业门户',
          subtitle: '安全、高效的企业管理平台'
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { TemplateRenderer } from '@ldesign/template'

// 登录模式
const loginMode = ref<'password' | 'sms' | 'qrcode'>('password')

// 表单数据
const loginForm = ref({
  username: '',
  password: ''
})

const smsForm = ref({
  phone: '',
  code: ''
})

const rememberMe = ref(false)
const countdown = ref(0)
const customError = ref('')

// 自定义社交登录提供商
const customProviders = ref([
  { 
    name: 'wechat', 
    label: '微信',
    icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: '#07C160' }, [
      h('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' })
    ])
  },
  { 
    name: 'qq', 
    label: 'QQ',
    icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: '#1296DB' }, [
      h('circle', { cx: 12, cy: 12, r: 10 })
    ])
  },
  { 
    name: 'github', 
    label: 'GitHub',
    icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: '#333' }, [
      h('path', { d: 'M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z' })
    ])
  }
])

// 处理密码登录
const handlePasswordLogin = async (onSubmit: Function) => {
  customError.value = ''
  if (!loginForm.value.username || !loginForm.value.password) {
    customError.value = '请输入用户名和密码'
    return
  }
  await onSubmit(loginForm.value)
}

// 处理短信登录
const handleSmsLogin = async (onSubmit: Function) => {
  customError.value = ''
  if (!smsForm.value.phone || !smsForm.value.code) {
    customError.value = '请输入手机号和验证码'
    return
  }
  await onSubmit(smsForm.value)
}

// 发送验证码
const sendSmsCode = () => {
  if (!smsForm.value.phone) {
    customError.value = '请输入手机号'
    return
  }
  
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  
  // 模拟发送验证码
  console.log('发送验证码到:', smsForm.value.phone)
}

// 处理社交登录
const handleSocialLogin = (provider: any) => {
  console.log('社交登录:', provider.name)
}

// 显示注册
const showRegister = () => {
  console.log('显示注册页面')
}

// 编程方式定义插槽
const programmaticSlots = {
  loginPanel: h('div', { class: 'simple-login' }, [
    h('input', { type: 'text', placeholder: '用户名', class: 'simple-input' }),
    h('input', { type: 'password', placeholder: '密码', class: 'simple-input' }),
    h('button', { class: 'simple-btn' }, '登录')
  ]),
  extra: h('p', { style: 'text-align: center; color: #999; margin-top: 20px;' }, 
    '© 2024 LDesign. All rights reserved.'
  )
}
</script>

<style scoped>
.login-example {
  padding: 40px;
  background: #f5f5f5;
  min-height: 100vh;
}

.login-example h2 {
  text-align: center;
  margin-bottom: 40px;
  color: #333;
}

/* 自定义 Logo 样式 */
.custom-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 自定义登录面板 */
.custom-login-panel {
  padding: 20px;
}

.login-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #e0e0e0;
}

.login-tabs button {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.login-tabs button.active {
  color: #667eea;
}

.login-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  gap: 12px;
}

.form-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.sms-group {
  display: flex;
  gap: 12px;
}

.sms-btn {
  padding: 12px 24px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
}

.sms-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.sms-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
}

.submit-btn {
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 扫码登录 */
.qrcode-login {
  text-align: center;
  padding: 40px 0;
}

.qrcode-placeholder {
  display: inline-block;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.qrcode-tip {
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

/* 错误提示 */
.error-message {
  margin-top: 12px;
  padding: 8px 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 14px;
}

/* 自定义社交登录 */
.custom-social-login {
  margin-top: 30px;
}

.divider-text {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin-bottom: 20px;
  position: relative;
}

.divider-text::before,
.divider-text::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 80px;
  height: 1px;
  background: #e0e0e0;
}

.divider-text::before {
  left: 20px;
}

.divider-text::after {
  right: 20px;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-icon-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.social-icon-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 自定义底部 */
.login-footer {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
}

.footer-links {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 13px;
}

.footer-links a {
  color: #999;
}

.footer-links span {
  color: #ddd;
}

/* 第二个示例 */
.alternative-example {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 2px dashed #ddd;
}

.alternative-example h3 {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

/* 简单登录样式（用于编程方式） */
:deep(.simple-login) {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

:deep(.simple-input) {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

:deep(.simple-btn) {
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>