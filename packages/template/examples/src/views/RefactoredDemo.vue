<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template/vue'
import { ref } from 'vue'

// 简单的登录面板组件
const LoginPanel = {
  name: 'LoginPanel',
  emits: ['login', 'register', 'forgot-password', 'third-party-login'],
  setup(props: any, { emit }: any) {
    const formData = ref({
      username: '',
      password: '',
      rememberMe: false,
    })

    const handleSubmit = () => {
      emit('login', formData.value)
    }

    return () => (
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
        <h2>登录</h2>
        <div style={{ marginBottom: '15px' }}>
          <input
            v-model={formData.value.username}
            placeholder="用户名"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <input
            v-model={formData.value.password}
            type="password"
            placeholder="密码"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
        </div>
        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '12px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          登录
        </button>
      </div>
    )
  },
}

// 事件处理
function handleLogin(data: any) {
  console.log('登录:', data)
  alert(`登录成功: ${data.username}`)
}

function handleRegister() {
  console.log('注册')
  alert('跳转到注册页面')
}

function handleForgotPassword() {
  console.log('忘记密码')
  alert('跳转到忘记密码页面')
}

function handleThirdPartyLogin(data: any) {
  console.log('第三方登录:', data)
  alert(`使用 ${data.provider} 登录`)
}
</script>

<template>
  <div class="refactored-demo">
    <div class="demo-header">
      <h1>重构后的模板系统演示</h1>
      <p>现在模板选择器已自动内置到所有登录模板中，无需手动配置</p>
    </div>

    <!-- 只需要使用 TemplateRenderer，模板选择器会自动出现 -->
    <TemplateRenderer
      category="login"
      device="desktop"
      template="adaptive"
      :template-props="{ loginPanel: LoginPanel }"
      :transition="true"
      transition-type="fade"
      @login="handleLogin"
      @register="handleRegister"
      @forgot-password="handleForgotPassword"
      @third-party-login="handleThirdPartyLogin"
    />
  </div>
</template>

<style lang="less" scoped>
.refactored-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.demo-header {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 999;
  max-width: 300px;

  h1 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    position: relative;
    top: auto;
    left: auto;
    margin: 20px;
    max-width: none;
  }
}
</style>
