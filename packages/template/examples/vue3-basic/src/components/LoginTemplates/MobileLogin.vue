<template>
  <div class="mobile-login-template">
    <div class="login-container">
      <div class="login-header">
        <h2>{{ title || '移动端登录' }}</h2>
        <p>{{ subtitle || '请输入您的账号信息' }}</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <input
            id="main-mobile-username"
            v-model="form.username"
            type="text"
            placeholder="用户名"
            required
          />
        </div>

        <div class="form-group">
          <input
            id="main-mobile-password"
            v-model="form.password"
            type="password"
            placeholder="密码"
            required
          />
        </div>
        
        <div class="form-options" v-if="showRememberMe">
          <label class="checkbox-label">
            <input v-model="form.rememberMe" type="checkbox" />
            记住我
          </label>
        </div>
        
        <button type="submit" class="login-button">登录</button>
        
        <div class="forgot-section" v-if="showForgotPassword">
          <a href="#" class="forgot-link">忘记密码？</a>
        </div>
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
  title: '移动端登录',
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
  console.log('移动端登录提交:', form.value)
  alert('这是移动端登录模板演示')
}
</script>

<style scoped>
.mobile-login-template {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  background: white;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 320px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.login-header p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-options {
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 0.5rem;
}

.login-button:hover {
  transform: translateY(-1px);
}

.login-button:active {
  transform: translateY(0);
}

.forgot-section {
  text-align: center;
  margin-top: 1.5rem;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-link:hover {
  text-decoration: underline;
}
</style>
