<template>
  <div class="app">
    <TemplateRenderer
      category="login"
      :responsive="true"
      :props="templateProps"
    />
  </div>
</template>

<script setup lang="ts">
import { TemplateRenderer } from '../../src/vue/components'

// 模板属性
const templateProps = {
  title: '欢迎登录',
  subtitle: '请输入您的账号和密码',
  onLogin: async (data: any) => {
    console.log('登录数据:', data)
    alert(`登录成功！\n用户名: ${data.username}`)
  },
  onRegister: () => {
    alert('注册功能')
  },
  onForgotPassword: () => {
    alert('忘记密码功能')
  },
}
</script>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
}
</style>
