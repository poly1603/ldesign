<template>
  <div class="app">
    <TemplateRenderer category="login" :device="device" :name="templateName" @submit="handleSubmit"
      @register="handleRegister" @template-change="handleTemplateChange" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { TemplateRenderer, getManager } from '@ldesign/template'
import type { DeviceType } from '@ldesign/template'

const manager = getManager()

// 响应式状态
const device = ref<DeviceType>('desktop')
const templateName = ref('default')

// 检测设备类型
const detectDevice = (): DeviceType => {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// 加载默认模板
const loadDefaultTemplate = async (dev: DeviceType) => {
  try {
    const defaultTemplate = await manager.getDefaultTemplate('login', dev)
    if (defaultTemplate?.name) {
      templateName.value = defaultTemplate.name
      console.log(`设备切换: ${dev}, 默认模板: ${defaultTemplate.name}`)
    }
  } catch (error) {
    console.error('加载默认模板失败:', error)
  }
}

// 窗口大小变化处理
const handleResize = () => {
  device.value = detectDevice()
}

// 监听设备变化，自动加载默认模板
watch(device, (newDevice) => {
  loadDefaultTemplate(newDevice)
})

// 生命周期
onMounted(async () => {
  // 初始化管理器
  await manager.initialize()

  // 检测设备并加载默认模板
  device.value = detectDevice()
  await loadDefaultTemplate(device.value)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 事件处理
const handleSubmit = (data: any) => {
  console.log('登录数据:', data)
  alert(`登录成功\n用户名: ${data.username}`)
}

const handleRegister = () => {
  alert('跳转到注册页面')
}

// 处理模板切换
const handleTemplateChange = (newTemplateName: string) => {
  templateName.value = newTemplateName
  console.log('切换模板:', newTemplateName)
}
</script>

<style scoped>
.app {
  padding: 40px;
}

h1 {
  margin-bottom: 24px;
  color: #333;
}
</style>
