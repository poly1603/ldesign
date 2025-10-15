<template>
  <div class="login-desktop-split">
    <div class="left-panel" :style="{ backgroundImage: `url(${bgImage})` }">
      <div class="overlay">
        <h1 class="brand">{{ brandName }}</h1>
        <p class="slogan">{{ slogan }}</p>
      </div>
    </div>

    <div class="right-panel">
      <div class="login-box">
        <h2>{{ title }}</h2>
        <p class="subtitle">{{ subtitle }}</p>

        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <input
              v-model="form.username"
              type="text"
              placeholder="用户名或邮箱"
              required
            />
          </div>

          <div class="form-group">
            <input
              v-model="form.password"
              type="password"
              placeholder="密码"
              required
            />
          </div>

          <div class="form-options">
            <label class="checkbox">
              <input v-model="form.remember" type="checkbox" />
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-link" @click.prevent="handleForgot">忘记密码？</a>
          </div>

          <button type="submit" class="btn-submit">
            登录
          </button>
        </form>

        <div class="footer-text">
          还没有账号？
          <a href="#" @click.prevent="handleRegister">立即注册</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  brandName?: string
  slogan?: string
  bgImage?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '欢迎回来',
  subtitle: '请输入您的账号信息',
  brandName: 'LDesign',
  slogan: '专业的模板管理系统',
  bgImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
})

const emit = defineEmits<{
  submit: [data: { username: string; password: string; remember: boolean }]
  register: []
  forgot: []
}>()

const form = reactive({
  username: '',
  password: '',
  remember: false,
})

const handleSubmit = () => {
  emit('submit', { ...form })
}

const handleRegister = () => {
  emit('register')
}

const handleForgot = () => {
  emit('forgot')
}
</script>

<style scoped>
.login-desktop-split {
  display: flex;
  height: 100vh;
}

.left-panel {
  flex: 1;
  background-size: cover;
  background-position: center;
  position: relative;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 40px;
}

.brand {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px;
}

.slogan {
  font-size: 20px;
  margin: 0;
  opacity: 0.9;
}

.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 40px;
}

.login-box {
  width: 100%;
  max-width: 400px;
}

.login-box h2 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #333;
}

.subtitle {
  margin: 0 0 32px;
  font-size: 14px;
  color: #666;
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  width: 100%;
  padding: 14px;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  font-size: 14px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
}

.checkbox input {
  cursor: pointer;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-submit:hover {
  transform: translateY(-2px);
}

.btn-submit:active {
  transform: translateY(0);
}

.footer-text {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.footer-text a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.footer-text a:hover {
  text-decoration: underline;
}
</style>
