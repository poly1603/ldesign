<template>
  <div class="app-container">
    <!-- 模板渲染器 -->
    <TemplateRenderer
      v-if="currentDevice"
      :category="category"
      :device="currentDevice"
      :name="templateName"
      @submit="handleSubmit"
      @register="handleRegister"
    />

    <!-- 模板选择器 -->
    <TemplateSelector
      v-if="currentDevice"
      :category="category"
      :device="currentDevice"
      :current-template="templateName"
      @select="handleTemplateSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { TemplateRenderer, getManager } from '@ldesign/template'
import type { DeviceType } from '@ldesign/template'
import TemplateSelector from './components/TemplateSelector.vue'

// 状态
const category = ref('login')
const currentDevice = ref<DeviceType>('desktop')
const templateName = ref('default')

/**
 * 根据窗口宽度判断设备类型
 */
function detectDevice(): DeviceType {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * 切换到当前设备的默认模板
 */
async function switchToDefaultTemplate(device: DeviceType) {
  const manager = getManager()
  const defaultTemplate = await manager.getDefaultTemplate(category.value, device)
  
  if (defaultTemplate) {
    currentDevice.value = device
    templateName.value = defaultTemplate.name
    console.log(`切换到 ${device} 设备的默认模板: ${defaultTemplate.displayName}`)
  } else {
    // 如果没有默认模板，尝试使用第一个模板
    const templates = await manager.queryTemplates({
      category: category.value,
      device,
    })
    
    if (templates.length > 0) {
      currentDevice.value = device
      templateName.value = templates[0].name
      console.log(`切换到 ${device} 设备的模板: ${templates[0].displayName}`)
    }
  }
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
  const newDevice = detectDevice()
  
  // 设备类型改变时才切换
  if (newDevice !== currentDevice.value) {
    switchToDefaultTemplate(newDevice)
  }
}

// 初始化模板系统
onMounted(async () => {
  const manager = getManager()
  await manager.initialize()
  console.log('模板系统就绪')
  
  // 检测初始设备类型
  const initialDevice = detectDevice()
  await switchToDefaultTemplate(initialDevice)
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 清理
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

// 处理模板选择
const handleTemplateSelect = (name: string) => {
  templateName.value = name
  console.log(`手动切换模板: ${name}`)
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
