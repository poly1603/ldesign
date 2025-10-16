<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template'

// 处理登录
// eslint-disable-next-line ts/no-explicit-any
const handleSubmit = (data: any) => {
  // eslint-disable-next-line no-console
  console.log('登录数据:', data)
  // eslint-disable-next-line no-alert
  alert(`登录成功！\n用户名: ${data.username}`)
}

// 处理注册
const handleRegister = () => {
  // eslint-disable-next-line no-alert
  alert('跳转到注册页面')
}
</script>

<template>
  <div class="app">
    <!-- TemplateRenderer 现在自动处理设备检测和模板加载 -->
    <TemplateRenderer category="login" @submit="handleSubmit" @register="handleRegister" />
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
}
</style>
