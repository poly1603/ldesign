<template>
  <div class="login-mobile-default">
    <div class="login-header">
      <h1>{{ title }}</h1>
    </div>

    <form class="login-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <input
          v-model="form.username"
          type="text"
          placeholder="手机号/用户名"
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

      <button type="submit" class="btn-login">
        登录
      </button>
    </form>

    <div class="login-footer">
      <a href="#" @click.prevent="handleRegister">注册账号</a>
      <span class="divider">|</span>
      <a href="#" @click.prevent="handleForgot">忘记密码</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '登录',
})

const emit = defineEmits<{
  submit: [data: { username: string; password: string }]
  register: []
  forgot: []
}>()

const form = reactive({
  username: '',
  password: '',
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
.login-mobile-default {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-header {
  text-align: center;
  margin-bottom: 60px;
  padding-top: 40px;
}

.login-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: white;
}

.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group input {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  color: #333;
  background: white;
  border: none;
  border-radius: 8px;
  box-sizing: border-box;
}

.form-group input::placeholder {
  color: #999;
}

.btn-login {
  width: 100%;
  padding: 16px;
  margin-top: 24px;
  font-size: 18px;
  font-weight: 500;
  color: #667eea;
  background: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-login:active {
  transform: scale(0.98);
}

.login-footer {
  text-align: center;
  font-size: 14px;
  color: white;
}

.login-footer a {
  color: white;
  text-decoration: none;
}

.divider {
  margin: 0 12px;
}
</style>
