<script setup lang="ts">
import type { DeviceType } from '@ldesign/template'
import { onMounted, onUnmounted, ref } from 'vue'
import TemplateRenderer from '../../../src/vue/components/TemplateRenderer.vue'

// 响应式状态
const currentTemplate = ref('login-default')
const currentCategory = ref('login')
const currentDeviceType = ref<DeviceType>('desktop')
const isAutoDetecting = ref(true) // 是否启用自动检测
const windowWidth = ref(window.innerWidth) // 当前窗口宽度

// 设备类型对应的默认模板映射
const deviceTemplateMap = {
  desktop: 'login-default',
  tablet: 'login-tablet-default',
  mobile: 'login-mobile-default',
}

// 模板属性
const templateProps = ref({
  title: '用户登录',
  subtitle: '请输入您的账号信息',
  showRememberMe: true,
  showForgotPassword: true,
})

// 根据窗口宽度检测设备类型
function detectDeviceType(): DeviceType {
  const width = window.innerWidth
  if (width >= 1024) {
    return 'desktop'
  }
  else if (width >= 768) {
    return 'tablet'
  }
  else {
    return 'mobile'
  }
}

// 更新设备类型
function updateDeviceType() {
  // 更新窗口宽度
  windowWidth.value = window.innerWidth

  if (!isAutoDetecting.value)
    return

  const newDeviceType = detectDeviceType()
  if (newDeviceType !== currentDeviceType.value) {
    currentDeviceType.value = newDeviceType
    // 更新对应的模板
    currentTemplate.value = deviceTemplateMap[newDeviceType]
  }
}

// 窗口大小变化监听器
let resizeTimeout: number | null = null
function handleResize() {
  // 立即更新窗口宽度显示
  windowWidth.value = window.innerWidth

  // 防抖处理设备类型切换，避免频繁触发
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  resizeTimeout = window.setTimeout(() => {
    if (isAutoDetecting.value) {
      const newDeviceType = detectDeviceType()
      if (newDeviceType !== currentDeviceType.value) {
        currentDeviceType.value = newDeviceType
        // 更新对应的模板
        currentTemplate.value = deviceTemplateMap[newDeviceType]
      }
    }
  }, 150)
}

// 手动设备类型切换
function handleDeviceChange() {
  // 当用户手动切换设备类型时，暂时禁用自动检测
  isAutoDetecting.value = false
  // 更新对应的模板
  currentTemplate.value = deviceTemplateMap[currentDeviceType.value]

  // 5秒后重新启用自动检测
  setTimeout(() => {
    isAutoDetecting.value = true
    updateDeviceType()
  }, 5000)
}

// 事件处理器
function handleTemplateChanged(_oldTemplate: string, newTemplate: string) {
  currentTemplate.value = newTemplate
}

function handleTemplateSelected(templateName: string) {
  currentTemplate.value = templateName
}

// 生命周期钩子
onMounted(() => {
  // 初始化设备类型检测
  updateDeviceType()

  // 添加窗口大小变化监听器
  window.addEventListener('resize', handleResize)
  console.log('响应式设备检测已启用')
})

onUnmounted(() => {
  // 清理监听器
  window.removeEventListener('resize', handleResize)
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
})
</script>

<template>
  <div class="template-demo">
    <!-- 演示头部 -->
    <div class="demo-header">
      <h1>@ldesign/template 模板系统演示</h1>
      <p>体验不同风格的登录模板，支持多设备适配</p>
    </div>

    <!-- 设备类型切换 -->
    <div class="device-selector">
      <div class="device-controls">
        <label>设备类型:</label>
        <select v-model="currentDeviceType" @change="handleDeviceChange">
          <option value="desktop">
            桌面端
          </option>
          <option value="tablet">
            平板端
          </option>
          <option value="mobile">
            移动端
          </option>
        </select>
      </div>
      <div class="device-status">
        <span class="status-indicator" :class="{ active: isAutoDetecting }">
          {{ isAutoDetecting ? '🔄 自动检测' : '🔒 手动模式' }}
        </span>
        <span class="window-size">窗口: {{ Math.round(windowWidth) }}px</span>
      </div>
    </div>

    <!-- 模板渲染区域 -->
    <div class="template-section">
      <!-- 模板选择器 -->
      <div class="template-selector">
        <TemplateRenderer
          :key="`${currentTemplate}-${currentDeviceType}`"
          :template="currentTemplate"
          :category="currentCategory"
          :device-type="currentDeviceType"
          :template-props="templateProps"
          :show-selector="true"
          :selector-config="{ layout: 'header' }"
          @template-changed="handleTemplateChanged"
          @template-selected="handleTemplateSelected"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.demo-header h1 {
  color: #1a202c;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  font-weight: 700;
}

.demo-header p {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
}

.device-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.device-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.device-controls label {
  font-weight: 600;
  color: #4a5568;
}

.device-controls select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.status-indicator.active {
  background: #e6fffa;
  color: #065f46;
  border-color: #10b981;
}

.window-size {
  color: #718096;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.template-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.template-container {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.template-selector {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .template-demo {
    padding: 1rem;
  }

  .device-selector {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .device-controls {
    justify-content: center;
  }

  .device-status {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .status-indicator,
  .window-size {
    font-size: 0.75rem;
  }
}
</style>
