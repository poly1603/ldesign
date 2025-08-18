<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

// 响应式数据
const username = ref('')
const password = ref('')
const isLoading = ref(false)

// 方法
function handleLogin() {
  isLoading.value = true

  try {
    const success = appStore.login(username.value, password.value)

    if (success) {
      // 登录成功，重定向到目标页面或首页
      const redirect = (route.value.query.redirect as string) || '/home'
      router.push(redirect)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>用户登录</h1>
          <p>登录以访问受保护的页面</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="请输入密码"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg"
            :disabled="isLoading"
          >
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="login-tips">
          <p>测试账号:</p>
          <p>用户名: <code>admin</code></p>
          <p>密码: <code>admin</code></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: var(--bg-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-2xl);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: var(--spacing-sm);
  }

  p {
    color: var(--text-color-secondary);
  }
}

.login-form {
  margin-bottom: var(--spacing-xl);

  .form-group {
    margin-bottom: var(--spacing-lg);
  }

  .btn {
    width: 100%;
  }
}

.login-tips {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--bg-color-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-color-secondary);

  code {
    background: var(--bg-color);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    color: var(--primary-color);
  }
}
</style>
