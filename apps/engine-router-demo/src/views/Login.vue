<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@ldesign/router'

// 登录表单数据
const form = ref({
  username: '',
  password: '',
  rememberMe: false,
})

// 登录状态
const isLoading = ref(false)
const errorMessage = ref('')

const router = useRouter()

// 处理登录提交
async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 模拟登录API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟登录成功
    if (form.value.username === 'admin' && form.value.password === 'admin') {
      alert('登录成功！')
      // 跳转到首页
      router.push('/')
    } else {
      errorMessage.value = '用户名或密码错误'
    }
  } catch (error) {
    errorMessage.value = '登录失败，请重试'
  } finally {
    isLoading.value = false
  }
}

// 处理忘记密码
function handleForgotPassword() {
  alert('忘记密码功能演示')
}

onMounted(() => {
  console.log('登录页面已加载，展示Template插件的登录模板')
})
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>用户登录</h1>
        <p>Engine Router Demo - Template插件登录模板演示</p>
      </div>

      <!-- 登录模板容器 -->
      <div class="template-container">
        <!-- 使用Template包中的默认登录模板样式 -->
        <div class="default-login-template">
          <div class="login-container">
            <div class="login-header">
              <h2>用户登录</h2>
              <p>请输入您的账号信息</p>
            </div>

            <form class="login-form" @submit.prevent="handleLogin">
              <!-- 错误提示 -->
              <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>

              <div class="form-group">
                <label for="username">用户名</label>
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  placeholder="请输入用户名 (演示: admin)"
                  required
                  :disabled="isLoading"
                >
              </div>

              <div class="form-group">
                <label for="password">密码</label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  placeholder="请输入密码 (演示: admin)"
                  required
                  :disabled="isLoading"
                >
              </div>

              <div class="form-options">
                <label class="checkbox-label">
                  <input 
                    v-model="form.rememberMe" 
                    type="checkbox"
                    :disabled="isLoading"
                  >
                  记住我
                </label>
                <a href="#" class="forgot-link" @click.prevent="handleForgotPassword">
                  忘记密码？
                </a>
              </div>

              <button 
                type="submit" 
                class="login-button"
                :disabled="isLoading"
              >
                {{ isLoading ? '登录中...' : '登录' }}
              </button>
            </form>

            <!-- 演示说明 -->
            <div class="demo-info">
              <h3>演示说明</h3>
              <ul>
                <li>用户名: admin</li>
                <li>密码: admin</li>
                <li>此页面展示了Template插件的登录模板集成</li>
                <li>样式来自 @ldesign/template 包的默认登录模板</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 返回首页链接 -->
      <div class="back-link">
        <router-link to="/">← 返回首页</router-link>
      </div>
    </div>
  </div>
</template>

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
  max-width: 500px;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.page-header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.template-container {
  margin-bottom: 2rem;
}

/* 复用Template包中的登录模板样式 */
.default-login-template {
  display: flex;
  align-items: center;
  justify-content: center;
}

.default-login-template .login-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.login-header p {
  color: #666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #fcc;
  text-align: center;
  font-size: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.demo-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.demo-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
}

.demo-info ul {
  margin: 0;
  padding-left: 1.2rem;
  color: #666;
  font-size: 0.9rem;
}

.demo-info li {
  margin-bottom: 0.25rem;
}

.back-link {
  text-align: center;
}

.back-link a {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}

.back-link a:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
