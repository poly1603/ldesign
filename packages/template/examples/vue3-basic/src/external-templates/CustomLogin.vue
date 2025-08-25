<template>
  <div class="custom-login">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">{{ title }}</h1>
        <p class="login-subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            id="username"
            v-model="formData.username"
            type="text" 
            placeholder="请输入用户名"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            id="password"
            v-model="formData.password"
            type="password" 
            placeholder="请输入密码"
            class="form-input"
          />
        </div>
        
        <div class="form-actions">
          <button @click="handleLogin" class="login-btn">
            登录
          </button>
        </div>
      </div>
      
      <div class="login-footer">
        <p>这是一个自定义的外部登录模板</p>
        <p>演示模板扩展功能</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props
interface Props {
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '自定义登录',
  subtitle: '外部模板示例'
})

// 表单数据
const formData = ref({
  username: '',
  password: ''
})

// 登录处理
const handleLogin = () => {
  if (!formData.value.username || !formData.value.password) {
    alert('请填写用户名和密码')
    return
  }
  
  alert(`外部模板登录成功！\n用户名: ${formData.value.username}`)
}
</script>

<style scoped>
.custom-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px;
}

.login-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  margin-top: 30px;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.login-footer p {
  font-size: 14px;
  color: #666;
  margin: 4px 0;
}
</style>
