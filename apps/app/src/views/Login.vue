<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { ref } from 'vue'
import { useAppStore } from '../stores/app'
import { useI18n } from '@ldesign/i18n/vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const { t, locale, changeLanguage } = useI18n()

// 响应式数据
const username = ref('')
const password = ref('')
const isLoading = ref(false)

// 方法
// 切换语言
async function toggleLanguage() {
  const newLocale = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
  console.log('🌍 开始切换语言到:', newLocale)

  try {
    await changeLanguage(newLocale)
    console.log('✅ 语言切换成功:', locale.value)
  } catch (error) {
    console.error('❌ 语言切换失败:', error)
  }
}

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
          <div class="header-top">
            <div class="header-content">
              <h1>{{ t('auth.login.title') }}</h1>
              <p>{{ t('auth.login.subtitle') }}</p>
            </div>
            <button
              type="button"
              class="language-toggle"
              @click="toggleLanguage"
              :title="locale === 'zh-CN' ? 'Switch to English' : '切换到中文'"
            >
              {{ locale === 'zh-CN' ? 'EN' : '中文' }}
            </button>
          </div>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">{{ t('auth.login.username') }}</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              :placeholder="t('auth.login.username')"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">{{ t('auth.login.password') }}</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              :placeholder="t('auth.login.password')"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg"
            :disabled="isLoading"
          >
            {{ isLoading ? t('common.loading') : t('auth.login.loginButton') }}
          </button>
        </form>

        <div class="login-tips">
          <p>{{ t('auth.login.testAccount') }}</p>
          <p>{{ t('auth.login.usernameLabel') }} <code>admin</code></p>
          <p>{{ t('auth.login.passwordLabel') }} <code>admin</code></p>
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
  margin-bottom: var(--spacing-xl);

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
  }

  .header-content {
    text-align: center;
    flex: 1;
  }

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: var(--spacing-sm);
  }

  p {
    color: var(--text-color-secondary);
  }

  .language-toggle {
    background: var(--bg-color-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 50px;

    &:hover {
      background: var(--bg-color-hover);
      border-color: var(--primary-color);
    }

    &:active {
      transform: translateY(1px);
    }
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
