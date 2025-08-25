<template>
  <div class="default-login-template">
    <div class="login-container">
      <div class="login-header">
        <h2>{{ title || '用户登录' }}</h2>
        <p>{{ subtitle || '请输入您的账号信息' }}</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="desktop-username">用户名</label>
          <input
            id="desktop-username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="form-group">
          <label for="desktop-password">密码</label>
          <input
            id="desktop-password"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        
        <div class="form-options" v-if="showRememberMe || showForgotPassword">
          <label v-if="showRememberMe" class="checkbox-label">
            <input v-model="form.rememberMe" type="checkbox" />
            记住我
          </label>
          <a v-if="showForgotPassword" href="#" class="forgot-link">忘记密码？</a>
        </div>
        
        <button type="submit" class="login-button">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  showRememberMe?: boolean
  showForgotPassword?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '用户登录',
  subtitle: '请输入您的账号信息',
  showRememberMe: true,
  showForgotPassword: true
})

const form = ref({
  username: '',
  password: '',
  rememberMe: false
})

const handleSubmit = () => {
  console.log('登录提交:', form.value)
  alert('这是一个演示模板，登录功能仅供展示')
}
</script>

<style scoped>
.default-login-template {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.login-header p {
  color: #666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-button:hover {
  transform: translateY(-1px);
}

.login-button:active {
  transform: translateY(0);
}
</style>
