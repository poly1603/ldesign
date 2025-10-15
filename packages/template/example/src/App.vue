<template>
  <AutoTemplate 
    category="login"
    @submit="handleSubmit"
    @register="handleRegister"
  />
</template>

<script setup lang="ts">
import { AutoTemplate } from '@ldesign/template'

// 事件处理
const handleSubmit = (data: any) => {
  console.log('登录数据:', data)
  alert(`登录成功\n用户名: ${data.username}`)
}

const handleRegister = () => {
  alert('跳转到注册页面')
}
</script>
