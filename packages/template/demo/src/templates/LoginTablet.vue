<template>
  <div class="login-tablet">
    <div class="login-container">
      <div class="login-header">
        <h1 class="title">{{ title }}</h1>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label class="label">用户名</label>
          <input
            v-model="formData.username"
            type="text"
            class="input"
            required
          >
        </div>
        
        <div class="form-group">
          <label class="label">密码</label>
          <input
            v-model="formData.password"
            type="password"
            class="input"
            required
          >
        </div>
        
        <button type="submit" class="btn-submit">
          登录
        </button>
        
        <div class="actions">
          <button @click.prevent="onRegister" type="button" class="btn-link">注册</button>
          <button @click.prevent="onForgotPassword" type="button" class="btn-link">忘记密码</button>
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
  title: '欢迎回来',
  subtitle: '登录以继续'
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
.login-tablet {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #6a11cb 0%, #2575fc 100%);
  padding: 24px;
}

.login-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
}

.subtitle {
  font-size: 15px;
  color: #666;
  margin: 0;
}

.form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #2575fc;
  box-shadow: 0 0 0 3px rgba(37, 117, 252, 0.1);
}

.btn-submit {
  width: 100%;
  padding: 13px;
  background: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-submit:hover {
  transform: translateY(-1px);
}

.actions {
  display: flex;
  justify-content: space-around;
  margin-top: 24px;
  gap: 16px;
}

.btn-link {
  background: none;
  border: none;
  color: #2575fc;
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
}

.btn-link:hover {
  text-decoration: underline;
}
</style>
