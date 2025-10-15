<template>
  <div class="login-tablet-default">
    <div class="container">
      <h1>{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>

      <form @submit.prevent="handleSubmit">
        <input v-model="form.username" type="text" placeholder="用户名" required />
        <input v-model="form.password" type="password" placeholder="密码" required />
        <button type="submit">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface Props {
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '登录',
  subtitle: 'Tablet 登录页面',
})

const emit = defineEmits<{
  submit: [data: { username: string; password: string }]
}>()

const form = reactive({
  username: '',
  password: '',
})

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>

<style scoped>
.login-tablet-default {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 500px;
  padding: 48px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

h1 {
  margin: 0 0 8px;
  font-size: 28px;
  text-align: center;
  color: #333;
}

.subtitle {
  margin: 0 0 32px;
  text-align: center;
  color: #666;
}

form input {
  width: 100%;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

form button {
  width: 100%;
  padding: 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
}
</style>
