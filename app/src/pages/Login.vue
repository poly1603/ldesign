<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <header class="login-header">
          <h1>用户登录</h1>
          <p class="subtitle">欢迎使用 LDesign Demo 系统</p>
        </header>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              placeholder="请输入用户名"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="loginForm.rememberMe"
                type="checkbox"
              />
              记住我
            </label>
          </div>
          
          <button type="submit" class="login-button" :disabled="isLoading">
            <span v-if="isLoading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>
        
        <div class="login-footer">
          <router-link to="/" class="back-link">
            ← 返回首页
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from '@ldesign/router'

/**
 * 登录页面组件
 * 展示基本的登录表单功能和路由导航
 */

// 获取路由器实例
const router = useRouter()

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 加载状态
const isLoading = ref(false)

/**
 * 处理登录提交
 */
const handleLogin = async () => {
  isLoading.value = true

  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('登录信息:', loginForm)

    // 模拟登录成功
    alert(`登录成功！欢迎 ${loginForm.username}`)

    // 登录成功后跳转到首页
    console.log('🎉 登录成功，跳转到首页')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.subtitle {
  color: #666;
  font-size: 0.9rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 0.5rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #764ba2;
}

@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
  }
  
  .login-card {
    padding: 1.5rem;
  }
  
  .login-header h1 {
    font-size: 1.5rem;
  }
}
</style>
