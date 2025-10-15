<template>
  <div class="login-desktop">
    <div class="login-card">
      <h1 class="title">{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
      
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <input
            v-model="formData.username"
            type="text"
            placeholder="用户名"
            class="input"
            required
          >
        </div>
        
        <div class="form-group">
          <input
            v-model="formData.password"
            type="password"
            placeholder="密码"
            class="input"
            required
          >
        </div>
        
        <button type="submit" class="btn-submit">
          登录
        </button>
        
        <div class="actions">
          <a @click.prevent="onRegister" href="#" class="link">注册账号</a>
          <a @click.prevent="onForgotPassword" href="#" class="link">忘记密码？</a>
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
  onLogin?: (data: any) => void
  onRegister?: () => void
  onForgotPassword?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '欢迎登录',
  subtitle: '请输入您的账号信息'
})

const formData = ref({
  username: '',
  password: ''
})

function handleSubmit() {
  props.onLogin?.(formData.value)
}
</script>

<style scoped>
.login-desktop {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333;
  text-align: center;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
  text-align: center;
}

.form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-submit:hover {
  transform: translateY(-2px);
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.link:hover {
  text-decoration: underline;
}
</style>
