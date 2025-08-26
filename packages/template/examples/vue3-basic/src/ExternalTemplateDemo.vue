<script setup lang="ts">
import type { DeviceType, ExternalTemplate } from '@ldesign/template'
import { createExternalTemplate } from '@ldesign/template'
import { onMounted, onUnmounted, ref } from 'vue'
import TemplateRenderer from '../../../src/vue/components/TemplateRenderer.vue'
import { customLoginConfig } from './external-templates/custom-login-config'
import CustomLogin from './external-templates/CustomLogin.vue'

// 响应式状态
const currentTemplate = ref('login')
const currentCategory = ref('login')
const currentDeviceType = ref<DeviceType>('desktop')
const isAutoDetecting = ref(true) // 是否启用自动检测
const windowWidth = ref(window.innerWidth) // 当前窗口宽度

// 创建外部模板
const externalTemplates: ExternalTemplate[] = [
  createExternalTemplate(customLoginConfig, CustomLogin),
]

// 扩展选项
const extensionOptions = {
  overrideDefaults: false,
  mergeConflicts: true,
  priorityStrategy: 'external' as const,
}

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
      }
    }
  }, 150)
}

// 手动设备类型切换
function handleDeviceChange() {
  // 当用户手动切换设备类型时，暂时禁用自动检测
  isAutoDetecting.value = false

  // 5秒后重新启用自动检测
  setTimeout(() => {
    isAutoDetecting.value = true
    updateDeviceType()
  }, 5000)
}

// 事件处理
function handleCategoryChange() {
  // 根据分类设置默认模板
  if (currentCategory.value === 'login') {
    currentTemplate.value = 'login'
  }
  else if (currentCategory.value === 'dashboard') {
    currentTemplate.value = 'dashboard'
  }
}

function handleTemplateLoaded(component: any) {
  console.log('模板加载成功:', component)
}

function handleTemplateError(error: Error) {
  console.error('模板加载失败:', error)
}

function handleTemplateSelected(templateName: string) {
  console.log('模板已选择:', templateName)
  currentTemplate.value = templateName
}

// 生命周期钩子
onMounted(() => {
  // 初始化设备类型检测
  updateDeviceType()

  // 添加窗口大小变化监听器
  window.addEventListener('resize', handleResize)
  console.log('外部模板演示：响应式设备检测已启用')
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
  <div class="external-template-demo">
    <div class="demo-header">
      <h1>外部模板扩展演示</h1>
      <p>演示如何使用外部模板扩展默认模板系统</p>
    </div>

    <div class="demo-controls">
      <div class="control-group">
        <label>模板分类:</label>
        <select v-model="currentCategory" @change="handleCategoryChange">
          <option value="login">
            登录模板
          </option>
          <option value="dashboard">
            仪表板模板
          </option>
        </select>
      </div>

      <div class="control-group">
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

    <div class="demo-content">
      <TemplateRenderer
        :template="currentTemplate"
        :category="currentCategory"
        :device-type="currentDeviceType"
        :external-templates="externalTemplates"
        :extension-options="extensionOptions"
        :show-selector="true"
        :selector-config="{ layout: 'header' }"
        @template-loaded="handleTemplateLoaded"
        @template-error="handleTemplateError"
        @template-selected="handleTemplateSelected"
      />
    </div>

    <div class="demo-info">
      <h3>扩展信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>外部模板数量:</strong>
          <span>{{ externalTemplates.length }}</span>
        </div>
        <div class="info-item">
          <strong>当前模板:</strong>
          <span>{{ currentTemplate }}</span>
        </div>
        <div class="info-item">
          <strong>扩展策略:</strong>
          <span>{{ extensionOptions.priorityStrategy }}</span>
        </div>
        <div class="info-item">
          <strong>合并冲突:</strong>
          <span>{{ extensionOptions.mergeConflicts ? '是' : '否' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.external-template-demo {
  min-height: 100vh;
  background: #f5f5f5;
}

.demo-header {
  background: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-header h1 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 2rem;
}

.demo-header p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.demo-controls {
  background: white;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 600;
  color: #333;
}

.control-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #f0f0f0;
  color: #666;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #e3f2fd;
  color: #1976d2;
}

.window-size {
  font-size: 0.875rem;
  color: #666;
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.demo-content {
  flex: 1;
}

.demo-info {
  background: white;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
}

.demo-info h3 {
  margin: 0 0 1rem;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.info-item strong {
  color: #333;
}

.info-item span {
  color: #666;
}
</style>
