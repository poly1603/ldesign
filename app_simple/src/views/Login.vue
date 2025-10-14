<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">{{ t('login.title') }}</h1>
        <p class="login-subtitle">{{ t('login.subtitle') }}</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">{{ t('login.username') }}</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-input"
            :placeholder="t('login.usernamePlaceholder')"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">{{ t('login.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            :placeholder="t('login.passwordPlaceholder')"
            required
          />
        </div>
        
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="checkbox-input"
            />
            <span>{{ t('login.rememberMe') }}</span>
          </label>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" class="submit-button" :disabled="loading">
          {{ loading ? t('login.submitting') : t('login.submit') }}
        </button>
      </form>
      
      <div class="login-footer">
        <p class="hint">{{ t('login.hint') || '使用 admin/admin 登录' }}</p>
        <router-link to="/" class="back-link">{{ t('common.back') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from '@ldesign/router'
import { useI18n } from '@/i18n'
import { auth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 表单数据
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = auth.isLoading
const error = ref('')

// 处理登录
const handleLogin = async () => {
  error.value = ''
  
  // 使用认证模块登录
  const result = await auth.login({
    username: username.value,
    password: password.value
  })
  
  if (result.success) {
    if (rememberMe.value) {
      // 如果选择记住我，可以设置更长的过期时间
      localStorage.setItem('rememberMe', 'true')
    }
    
    // 触发成功提示
    console.log('✅ 登录成功！')
    
    // 获取重定向地址，如果没有就跳转到首页
    const redirect = (route.query?.redirect as string) || '/'
    
    // 使用 replace 而不是 push，避免历史记录问题
    await router.replace(redirect)
  } else {
    // 登录失败
    error.value = result.error || t('login.errors.invalid')
  }
}

// 组件挂载时检查是否已登录
onMounted(() => {
  if (auth.isLoggedIn.value) {
    // 已登录的用户访问登录页，重定向到首页或查询参数中指定的页面
    const redirect = (route.query?.redirect as string) || '/'
    router.replace(redirect)
  }
})
</script>

<style scoped>
.login-container {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.login-title {
  font-size: 32px;
  margin: 0 0 10px 0;
}

.login-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.login-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #2c3e50;
  font-size: 14px;
}

.checkbox-input {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.error-message {
  background: #fee;
  color: #c00;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  padding: 20px 30px;
  background: #f8f9fa;
  text-align: center;
}

.hint {
  color: #666;
  font-size: 13px;
  margin: 0 0 10px 0;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.3s;
}

.back-link:hover {
  color: #764ba2;
}
</style>