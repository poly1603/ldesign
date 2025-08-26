<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

const redirectMessage = computed(() => {
  if (route.value.query?.redirect) {
    return `请先登录以访问 ${route.value.query.redirect}`
  }
  return null
})

async function handleLogin() {
  loading.value = true

  // 模拟登录请求
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 简单的登录验证（演示用）
  if (username.value && password.value) {
    userStore.login(username.value)

    // 登录成功后重定向
    const redirect = (route.value.query?.redirect as string) || '/'
    router.push(redirect)
  }
  else {
    console.error('请输入用户名和密码')
  }

  loading.value = false
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div style="max-width: 400px; margin: 50px auto; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <h2 style="text-align: center; margin-bottom: 30px;">
      🔐 用户登录
    </h2>

    <div v-if="redirectMessage" style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
      <p style="margin: 0; color: #856404;">
        {{ redirectMessage }}
      </p>
    </div>

    <form style="display: flex; flex-direction: column; gap: 20px;" @submit.prevent="handleLogin">
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">用户名:</label>
        <input
          v-model="username"
          type="text"
          required
          placeholder="请输入用户名"
          style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;"
        >
      </div>

      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">密码:</label>
        <input
          v-model="password"
          type="password"
          required
          placeholder="请输入密码"
          style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;"
        >
      </div>

      <button
        type="submit"
        :disabled="loading"
        style="padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;"
        :style="{ opacity: loading ? 0.6 : 1 }"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>

    <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 6px;">
      <h4>演示账号</h4>
      <p style="margin: 5px 0;">
        <strong>用户名:</strong> admin
      </p>
      <p style="margin: 5px 0;">
        <strong>密码:</strong> 123456
      </p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
        或者输入任意用户名和密码进行演示
      </p>
    </div>

    <div style="margin-top: 20px; text-align: center;">
      <button style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" @click="goHome">
        返回首页
      </button>
    </div>
  </div>
</template>
