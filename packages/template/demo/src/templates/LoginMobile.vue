<template>
  <div class="login-mobile">
    <div class="header">
      <h1 class="title">{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="form">
      <div class="input-group">
        <input
          v-model="formData.username"
          type="text"
          placeholder="手机号 / 邮箱"
          class="input"
          required
        >
      </div>
      
      <div class="input-group">
        <input
          v-model="formData.password"
          type="password"
          placeholder="密码"
          class="input"
          required
        >
      </div>
      
      <button type="submit" class="btn-login">
        登录
      </button>
      
      <div class="links">
        <a @click.prevent="onRegister" href="#" class="link">新用户注册</a>
        <span class="divider">|</span>
        <a @click.prevent="onForgotPassword" href="#" class="link">找回密码</a>
      </div>
    </form>
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
  title: '登录',
  subtitle: '欢迎使用'
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
.login-mobile {
  min-height: 100vh;
  background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
  padding: 60px 24px 24px;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 48px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.form {
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.input-group {
  margin-bottom: 16px;
}

.input {
  width: 100%;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #4facfe;
}

.btn-login {
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.btn-login:active {
  transform: scale(0.98);
}

.links {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  gap: 12px;
}

.link {
  color: #4facfe;
  text-decoration: none;
  font-size: 14px;
}

.link:active {
  opacity: 0.7;
}

.divider {
  color: #ccc;
}
</style>
