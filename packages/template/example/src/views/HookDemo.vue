<template>
  <div class="demo-page">
    <div class="demo-header">
      <h1>⚡ Hook 方式演示</h1>
      <p>使用 useTemplate Composition API 管理和渲染内置 login 模板，支持响应式设备检测和自动模板切换</p>
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
              <select v-model="selectedTemplate" @change="switchTemplate">
                <option value="default">默认模板</option>
                <option value="modern">现代模板</option>
                <option value="creative">创意模板</option>
              </select>
            </div>

            <div class="control-group">
              <label>设备类型：</label>
              <select v-model="selectedDevice" @change="switchTemplate">
                <option value="desktop">🖥️ 桌面端</option>
                <option value="tablet">📱 平板端</option>
                <option value="mobile">📱 移动端</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Hook 渲染区域 -->
      <div class="template-container">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在加载模板...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <h4>❌ 加载失败</h4>
          <p>{{ error || '未知错误' }}</p>
          <button @click="refreshTemplates" class="btn btn-danger">重试</button>
        </div>

        <div v-else-if="currentComponent" class="template-render-area">
          <!-- 使用 Hook 方式渲染模板组件 -->
          <component
            :is="currentComponent"
            v-bind="templateProps"
            @login="handleLogin"
          />
        </div>

        <div v-else class="empty-state">
          <p>没有找到匹配的模板</p>
        </div>
      </div>

      <!-- 模板信息显示区域 -->
      <div class="template-info" v-if="currentTemplate">
        <div class="template-card">
          <h3>{{ currentTemplate.displayName }}</h3>
          <p>{{ currentTemplate.description }}</p>
          <div class="template-meta">
            <span class="meta-item">版本: {{ currentTemplate.version }}</span>
            <span class="meta-item">作者: {{ currentTemplate.author }}</span>
            <span class="meta-item">设备: {{ currentTemplate.device }}</span>
            <span class="meta-item">渲染方式: Hook</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTemplate, TemplateSelector, useDeviceDetection } from '@ldesign/template'

// 设备检测
const { deviceType, screenWidth } = useDeviceDetection({
  enableResponsive: true
})

// 使用 useTemplate hook - 使用响应式设备类型
const {
  currentTemplate,
  currentComponent,
  availableTemplates,
  loading: isLoading,
  error,
  switchTemplate: switchTemplateHook,
  refreshTemplates
} = useTemplate({
  category: 'login',
  device: deviceType.value,  // 使用初始设备类型值
  autoDetectDevice: true,
  enableCache: true
})

// 响应式数据
const selectedTemplate = ref<string>('default')
const selectedDevice = ref<string>('desktop')
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
    screenWidth: screenWidth.value,
    renderMode: 'Hook'
  }
}))

// 监听设备类型变化并自动切换模板
watch([deviceType, isResponsive], async ([newDevice, responsive], [oldDevice]) => {
  if (responsive && newDevice !== oldDevice && oldDevice !== undefined) {
    console.log(`设备类型变化: ${oldDevice} -> ${newDevice}`)

    // 获取新设备类型的默认模板
    const newTemplate = defaultTemplates.value[newDevice] || 'default'
    console.log(`自动切换到模板: ${newTemplate}`)

    try {
      // 刷新模板列表以获取新设备类型的模板
      await refreshTemplates()

      // 等待模板列表更新
      await new Promise(resolve => setTimeout(resolve, 200))

      // 使用 Hook 方式切换模板
      await switchTemplateHook(newTemplate)
      console.log(`Hook 方式切换模板成功: ${newTemplate}`)
    } catch (error) {
      console.error('Hook 方式切换模板失败:', error)
    }
  }
}, { immediate: false })

// 监听模板名称变化，确保在响应式模式下自动切换
watch(currentTemplateName, async (newTemplate, oldTemplate) => {
  if (isResponsive.value && newTemplate !== oldTemplate && availableTemplates.value.length > 0) {
    console.log(`响应式模式下模板变化: ${oldTemplate} -> ${newTemplate}`)

    try {
      await switchTemplateHook(newTemplate)
      console.log(`响应式切换模板成功: ${newTemplate}`)
    } catch (error) {
      console.error('响应式切换模板失败:', error)
    }
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

// 手动切换模板
const switchTemplate = async () => {
  if (!isResponsive.value) {
    console.log(`手动切换模板: ${selectedTemplate.value}, 设备: ${selectedDevice.value}`)
    try {
      await switchTemplateHook(selectedTemplate.value)
      console.log(`手动切换模板成功: ${selectedTemplate.value}`)
    } catch (error) {
      console.error('手动切换模板失败:', error)
    }
  }
}

// 处理模板选择器选择
const handleTemplateSelect = async (templateName: string) => {
  console.log(`通过选择器选择模板: ${templateName}`)

  try {
    if (isResponsive.value) {
      // 在响应式模式下，更新当前设备类型的默认模板
      defaultTemplates.value[currentDevice.value] = templateName
      await switchTemplateHook(templateName)
    } else {
      // 在手动模式下，直接更新选择的模板
      selectedTemplate.value = templateName
      await switchTemplateHook(templateName)
    }
    console.log(`选择器切换模板成功: ${templateName}`)

    // 选择模板后自动隐藏选择器
    showTemplateSelector.value = false
  } catch (error) {
    console.error('选择器切换模板失败:', error)
    // 即使出错也隐藏选择器，避免界面卡住
    showTemplateSelector.value = false
  }
}

// 处理登录事件
const handleLogin = (data: any) => {
  console.log('Hook 方式登录数据:', data)
}

// 生命周期
onMounted(() => {
  console.log('HookDemo 组件已挂载')
  console.log('初始设备类型:', deviceType.value)
  console.log('初始屏幕宽度:', screenWidth.value)
  console.log('可用模板数量:', availableTemplates.value.length)
})

onUnmounted(() => {
  console.log('HookDemo 组件已卸载')
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
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.2);
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
  border: 2px solid #764ba2;
  border-radius: 6px;
  background: white;
  color: #764ba2;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.toggle-btn:hover, .selector-btn:hover {
  background: #764ba2;
  color: white;
}

.toggle-btn.active {
  background: #764ba2;
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
  border-color: #764ba2;
  box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
}

/* 模板容器样式 */
.template-container {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  min-height: 500px;
  margin-bottom: 2rem;
}

.template-render-area {
  width: 100%;
  min-height: 400px;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #764ba2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state h4 {
  color: #dc3545;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-1px);
}

/* 模板信息卡片样式 */
.template-info {
  margin-bottom: 2rem;
}

.template-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.template-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.template-card p {
  color: #6c757d;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.template-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.meta-item {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
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

  .template-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .selector-controls {
    flex-direction: column;
  }

  .toggle-btn, .selector-btn {
    width: 100%;
  }

  .meta-item {
    text-align: center;
  }
}
</style>
