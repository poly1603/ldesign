<script setup lang="ts">
import type { DeviceType } from '@ldesign/template'
import { useTemplateSystem } from '@ldesign/template/vue'
import { computed, onMounted, ref, watch } from 'vue'

// 环境信息
const environment = ref(__TEMPLATE_ENV__ || 'unknown')

// 模板系统
const {
  availableCategories,
  availableDevices,
  availableTemplates,
  currentTemplate,
  loading,
  error,
  switchTemplate,
  refreshTemplates,
} = useTemplateSystem()

// 选择状态
const selectedCategory = ref('')
const selectedDevice = ref<DeviceType | ''>('')
const selectedTemplate = ref('')

// 模板组件
const currentTemplateComponent = ref(null)

// 模板属性
const templateProps = ref({})

// 调试信息
const debugInfo = computed(() => ({
  environment: environment.value,
  selectedCategory: selectedCategory.value,
  selectedDevice: selectedDevice.value,
  selectedTemplate: selectedTemplate.value,
  currentTemplate: currentTemplate.value?.id,
  availableCategories: availableCategories.value,
  availableDevices: availableDevices.value.length,
  availableTemplates: availableTemplates.value.length,
  loading: loading.value,
  error: error.value,
}))

// 事件处理
function onCategoryChange() {
  selectedDevice.value = ''
  selectedTemplate.value = ''
  currentTemplateComponent.value = null
}

function onDeviceChange() {
  selectedTemplate.value = ''
  currentTemplateComponent.value = null
}

async function onTemplateChange() {
  if (!selectedCategory.value || !selectedDevice.value || !selectedTemplate.value) {
    currentTemplateComponent.value = null
    return
  }

  try {
    const template = await switchTemplate(
      selectedCategory.value,
      selectedDevice.value as DeviceType,
      selectedTemplate.value,
    )

    if (template) {
      currentTemplateComponent.value = template.component
      templateProps.value = template.config || {}
    }
  }
  catch (err) {
    console.error('Failed to load template:', err)
  }
}

// 监听设备类型变化
watch(selectedDevice, (newDevice) => {
  if (newDevice) {
    // 设置全局设备类型用于测试
    ;(window as any).__TEMPLATE_DEVICE_TYPE__ = newDevice
  }
})

// 初始化
onMounted(async () => {
  await refreshTemplates()

  // 自动检测设备类型
  const width = window.innerWidth
  if (width >= 1024) {
    selectedDevice.value = 'desktop'
  }
  else if (width >= 768) {
    selectedDevice.value = 'tablet'
  }
  else {
    selectedDevice.value = 'mobile'
  }

  // 设置全局设备类型
  ;(window as any).__TEMPLATE_DEVICE_TYPE__ = selectedDevice.value
})
</script>

<template>
  <div id="app">
    <header class="app-header">
      <h1>Template Package Test App</h1>
      <div class="env-indicator">
        Environment: <strong>{{ environment }}</strong>
      </div>
    </header>

    <main class="app-main">
      <div class="controls">
        <div class="control-group">
          <label for="category-select">分类:</label>
          <select
            id="category-select"
            v-model="selectedCategory"
            data-testid="category-select"
            @change="onCategoryChange"
          >
            <option value="">
              请选择分类
            </option>
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label for="device-select">设备类型:</label>
          <select id="device-select" v-model="selectedDevice" data-testid="device-select" @change="onDeviceChange">
            <option value="">
              请选择设备
            </option>
            <option v-for="device in availableDevices" :key="device" :value="device">
              {{ device }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label for="template-select">模板:</label>
          <select
            id="template-select"
            v-model="selectedTemplate"
            data-testid="template-select"
            @change="onTemplateChange"
          >
            <option value="">
              请选择模板
            </option>
            <option v-for="template in availableTemplates" :key="template.template" :value="template.template">
              {{ template.config.name }}
            </option>
          </select>
        </div>

        <button class="refresh-btn" :disabled="loading" @click="refreshTemplates">
          {{ loading ? '加载中...' : '刷新模板' }}
        </button>
      </div>

      <div class="template-container">
        <div v-if="loading" class="loading">
          加载模板中...
        </div>

        <div v-else-if="error" class="error">
          错误: {{ error }}
        </div>

        <div
          v-else-if="currentTemplateComponent"
          class="template-wrapper"
          :data-template="selectedTemplate"
          :data-category="selectedCategory"
          :data-device="selectedDevice"
        >
          <component :is="currentTemplateComponent" v-bind="templateProps" />
        </div>

        <div v-else class="placeholder">
          请选择一个模板进行预览
        </div>
      </div>

      <div class="debug-info">
        <h3>调试信息</h3>
        <pre>{{ debugInfo }}</pre>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-header {
  background: #f5f5f5;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

.env-indicator {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.app-main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 500;
  font-size: 0.9rem;
}

.control-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  height: fit-content;
}

.refresh-btn:hover {
  background: #0056b3;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.template-container {
  min-height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.loading,
.error,
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 1.1rem;
}

.error {
  color: #dc3545;
}

.placeholder {
  color: #666;
}

.template-wrapper {
  width: 100%;
  height: 100%;
}

.debug-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 2rem;
}

.debug-info h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.debug-info pre {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group select {
    min-width: auto;
  }
}
</style>
