<template>
  <div class="demo-page">
    <div class="demo-header">
      <h1>🎨 组件方式演示</h1>
      <p>使用 TemplateRenderer 组件渲染内置 login 模板，支持响应式设备检测和自动模板切换</p>
    </div>

    <div class="demo-content">
      <!-- 设备检测信息 -->
      <div class="device-info">
        <div class="info-card">
          <h3>📱 设备检测信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">当前设备类型：</span>
              <span class="info-value" :class="`device-${currentDevice}`">
                {{ deviceTypeLabels[currentDevice] }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">屏幕宽度：</span>
              <span class="info-value">{{ screenWidth }}px</span>
            </div>
            <div class="info-item">
              <span class="info-label">响应式模式：</span>
              <span class="info-value" :class="{ 'enabled': isResponsive }">
                {{ isResponsive ? '已启用' : '已禁用' }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">当前模板：</span>
              <span class="info-value">{{ currentTemplateName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 模板选择器 -->
      <div class="template-selector-container">
        <div class="selector-header">
          <h3>🎨 模板选择器</h3>
          <div class="selector-controls">
            <button
              @click="toggleResponsive"
              :class="['toggle-btn', { 'active': isResponsive }]"
            >
              {{ isResponsive ? '禁用响应式' : '启用响应式' }}
            </button>
            <button
              @click="showTemplateSelector = !showTemplateSelector"
              class="selector-btn"
            >
              {{ showTemplateSelector ? '隐藏选择器' : '显示选择器' }}
            </button>
          </div>
        </div>

        <div v-if="showTemplateSelector" class="selector-content">
          <TemplateSelector
            category="login"
            :device="currentDevice"
            :current-template="currentTemplateName"
            :visible="showTemplateSelector"
            :show-preview="true"
            :searchable="true"
            @select="handleTemplateSelect"
          />
        </div>
      </div>

      <!-- 手动控制面板（仅在禁用响应式时显示） -->
      <div v-if="!isResponsive" class="manual-controls">
        <div class="control-card">
          <h3>🎛️ 手动控制</h3>
          <div class="control-grid">
            <div class="control-group">
              <label>选择模板：</label>
              <select v-model="selectedTemplate" @change="updateTemplate">
                <option value="default">默认模板</option>
                <option value="modern">现代模板</option>
                <option value="creative">创意模板</option>
              </select>
            </div>

            <div class="control-group">
              <label>设备类型：</label>
              <select v-model="selectedDevice" @change="updateTemplate">
                <option value="desktop">🖥️ 桌面端</option>
                <option value="tablet">📱 平板端</option>
                <option value="mobile">📱 移动端</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 模板渲染区域 -->
      <div class="template-container">
        <TemplateRenderer
          category="login"
          :device="currentDevice"
          :template-name="currentTemplateName"
          :responsive="isResponsive"
          :props="templateProps"
          @template-change="handleTemplateChange"
          @load-success="handleTemplateLoaded"
          @load-error="handleError"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { TemplateRenderer, TemplateSelector, useDeviceDetection } from '@ldesign/template'

// 设备检测
const { deviceType, screenWidth } = useDeviceDetection({
  enableResponsive: true
})

// 响应式数据
const selectedTemplate = ref<string>('default')
const selectedDevice = ref<string>('desktop')
const currentTemplate = ref<string>('')
const isResponsive = ref<boolean>(true)
const showTemplateSelector = ref<boolean>(true)

// 设备类型标签映射
const deviceTypeLabels = {
  desktop: '🖥️ 桌面端',
  tablet: '📱 平板端',
  mobile: '📱 移动端'
}

// 默认模板映射（每种设备类型的默认模板）- 使用 ref 使其响应式
const defaultTemplates = ref({
  desktop: 'default',
  tablet: 'default',
  mobile: 'default'
})

// 计算属性
const currentDevice = computed(() => {
  return isResponsive.value ? deviceType.value : selectedDevice.value
})

const currentTemplateName = computed(() => {
  if (isResponsive.value) {
    // 响应式模式下，根据设备类型自动选择默认模板
    return defaultTemplates.value[currentDevice.value] || 'default'
  } else {
    // 手动模式下，使用用户选择的模板
    return selectedTemplate.value
  }
})

// 模板属性
const templateProps = computed(() => ({
  title: '用户登录',
  subtitle: '欢迎回来，请登录您的账户',
  showRememberMe: true,
  showForgotPassword: true,
  showRegisterLink: true,
  // 添加调试信息
  debugInfo: {
    deviceType: currentDevice.value,
    templateName: currentTemplateName.value,
    isResponsive: isResponsive.value,
    screenWidth: screenWidth.value
  }
}))

// 监听设备类型变化并自动切换模板
watch([deviceType, isResponsive], ([newDevice, responsive], [oldDevice]) => {
  if (responsive && newDevice !== oldDevice && oldDevice !== undefined) {
    console.log(`设备类型变化: ${oldDevice} -> ${newDevice}`)
    // 自动切换到新设备类型的默认模板
    const newTemplate = defaultTemplates.value[newDevice] || 'default'
    console.log(`自动切换到模板: ${newTemplate}`)

    // 强制触发模板重新渲染
    currentTemplate.value = newTemplate
  }
}, { immediate: true })

// 监听当前模板名称变化，确保模板选择器状态同步
watch(currentTemplateName, (newTemplate, oldTemplate) => {
  if (newTemplate !== oldTemplate) {
    console.log(`当前模板变化: ${oldTemplate} -> ${newTemplate}`)
  }
})

// 切换响应式模式
const toggleResponsive = () => {
  isResponsive.value = !isResponsive.value
  console.log(`响应式模式: ${isResponsive.value ? '已启用' : '已禁用'}`)

  if (!isResponsive.value) {
    // 禁用响应式时，同步当前设备类型到手动选择
    selectedDevice.value = deviceType.value
    selectedTemplate.value = currentTemplateName.value
  }
}

// 手动更新模板
const updateTemplate = () => {
  if (!isResponsive.value) {
    console.log(`手动切换模板: ${selectedTemplate.value}, 设备: ${selectedDevice.value}`)
  }
}

// 处理模板选择器选择
const handleTemplateSelect = (templateName: string) => {
  console.log(`通过选择器选择模板: ${templateName}`)
  if (isResponsive.value) {
    // 在响应式模式下，更新当前设备类型的默认模板
    defaultTemplates.value[currentDevice.value] = templateName
    // 强制触发重新渲染
    currentTemplate.value = templateName
  } else {
    // 在手动模式下，直接更新选择的模板
    selectedTemplate.value = templateName
  }
}

// 处理模板变化
const handleTemplateChange = (template: any) => {
  console.log('模板变化事件:', template)
  if (template) {
    currentTemplate.value = template.displayName || template.name || currentTemplateName.value
  }
}

// 处理模板加载成功
const handleTemplateLoaded = (template: any) => {
  console.log('模板加载成功:', template)
  if (template) {
    currentTemplate.value = template.displayName || template.name || currentTemplateName.value
  }
}

// 处理模板加载错误
const handleError = (error: Error) => {
  console.error('模板加载错误:', error)
}

// 生命周期
onMounted(() => {
  console.log('ComponentDemo 组件已挂载')
  console.log('初始设备类型:', deviceType.value)
  console.log('初始屏幕宽度:', screenWidth.value)
})

onUnmounted(() => {
  console.log('ComponentDemo 组件已卸载')
})
</script>

<style scoped>
.demo-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.demo-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* 设备检测信息样式 */
.device-info {
  margin-bottom: 2rem;
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.info-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.info-value {
  font-weight: 600;
  font-size: 1.1rem;
}

.info-value.device-desktop {
  color: #4CAF50;
}

.info-value.device-tablet {
  color: #FF9800;
}

.info-value.device-mobile {
  color: #2196F3;
}

.info-value.enabled {
  color: #4CAF50;
}

/* 模板选择器样式 */
.template-selector-container {
  margin-bottom: 2rem;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.selector-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.selector-controls {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn, .selector-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #667eea;
  border-radius: 6px;
  background: white;
  color: #667eea;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.toggle-btn:hover, .selector-btn:hover {
  background: #667eea;
  color: white;
}

.toggle-btn.active {
  background: #667eea;
  color: white;
}

.selector-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

/* 手动控制面板样式 */
.manual-controls {
  margin-bottom: 2rem;
}

.control-card {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1.5rem;
}

.control-card h3 {
  margin: 0 0 1rem 0;
  color: #856404;
  font-size: 1.1rem;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.control-group select {
  padding: 0.75rem;
  border: 2px solid #ced4da;
  border-radius: 6px;
  background: white;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.control-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 模板容器样式 */
.template-container {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  min-height: 500px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-page {
    padding: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .control-grid {
    grid-template-columns: 1fr;
  }

  .selector-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .selector-controls {
    justify-content: center;
  }

  .template-container {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .selector-controls {
    flex-direction: column;
  }

  .toggle-btn, .selector-btn {
    width: 100%;
  }
}
</style>
