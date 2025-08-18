<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from '@ldesign/router'
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()

const form = ref({
  username: '',
  password: '',
  remember: false,
})

const loading = ref(false)

async function handleLogin() {
  loading.value = true

  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 验证凭据
    const validCredentials = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'user', password: 'user123', role: 'user' },
      { username: 'guest', password: 'guest123', role: 'guest' },
    ]

    const user = validCredentials.find(
      cred =>
        cred.username === form.value.username &&
        cred.password === form.value.password
    )

    if (user) {
      // 设置登录状态
      localStorage.setItem('token', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify(user))

      // 显示成功消息
      console.warn(
        `登录成功！欢迎 ${
          user.role === 'admin'
            ? '管理员'
            : user.role === 'user'
            ? '用户'
            : '访客'
        } ${user.username}`
      )

      // 重定向到目标页面或首页
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      console.warn('用户名或密码错误，请检查后重试')
    }
  } catch (error) {
    console.error('Login error:', error)
    console.warn('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="login-container">
      <div class="login-header">
        <h1>用户登录</h1>
        <p data-testid="redirect-message">请输入您的凭据以访问受保护的页面</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="input"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="input"
            placeholder="请输入密码"
            required
          />
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="form.remember" type="checkbox" class="checkbox" />
            记住我
          </label>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary btn-lg login-btn"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="login-tips">
        <h3>演示账户</h3>
        <div class="tip-item"><strong>管理员:</strong> admin / admin123</div>
        <div class="tip-item"><strong>普通用户:</strong> user / user123</div>
        <div class="tip-item"><strong>访客:</strong> guest / guest123</div>
      </div>

      <div class="login-actions">
        <RouterLink to="/" class="back-link"> ← 返回首页 </RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, @primary-color 0%, @secondary-color 100%);
  padding: @spacing-md;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: @border-radius-xl;
  box-shadow: @shadow-xl;
  padding: @spacing-2xl;
}

.login-header {
  text-align: center;
  margin-bottom: @spacing-xl;

  h1 {
    color: @gray-800;
    margin-bottom: @spacing-sm;
    font-size: @font-size-2xl;
  }

  p {
    color: @gray-600;
    font-size: @font-size-base;
  }
}

.login-form {
  margin-bottom: @spacing-xl;

  .form-group {
    margin-bottom: @spacing-lg;

    label {
      display: block;
      margin-bottom: @spacing-xs;
      font-weight: 500;
      color: @gray-700;
    }

    .input {
      width: 100%;
    }
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: @spacing-xs;
    cursor: pointer;
    font-weight: normal;

    .checkbox {
      width: auto;
      margin: 0;
    }
  }

  .login-btn {
    width: 100%;
    margin-top: @spacing-md;
  }
}

.login-tips {
  background: @gray-50;
  padding: @spacing-md;
  border-radius: @border-radius-md;
  margin-bottom: @spacing-lg;

  h3 {
    color: @gray-800;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }

  .tip-item {
    margin-bottom: @spacing-sm;
    font-size: @font-size-sm;
    color: @gray-600;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: @gray-800;
    }
  }
}

.login-actions {
  text-align: center;

  .back-link {
    color: @primary-color;
    text-decoration: none;
    font-weight: 500;
    transition: color @transition-base;

    &:hover {
      color: @secondary-color;
      text-decoration: underline;
    }
  }
}

@media (max-width: 480px) {
  .login {
    padding: @spacing-sm;
  }

  .login-container {
    padding: @spacing-lg;
  }

  .login-header h1 {
    font-size: @font-size-xl;
  }
}
</style>
