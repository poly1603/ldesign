<template>
  <div class="demo-page">
    <div class="demo-header">
      <h1>Hook 方式演示</h1>
      <p>使用 useTemplate Composition API 管理和渲染模板</p>
    </div>

    <div class="demo-content">
      <!-- 简化的控制面板 -->
      <div class="control-panel">
        <div class="control-group">
          <label>Hook 方式演示</label>
        </div>

        <div class="control-actions">
          <button
            @click="showSelector = !showSelector"
            class="btn"
          >
            {{ showSelector ? '隐藏选择器' : '显示选择器' }}
          </button>
        </div>
      </div>

      <!-- Hook 渲染区域 -->
      <div class="template-container">
        <div v-if="isLoading" class="loading-state">
          <p>正在加载模板...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>加载失败: {{ error || '未知错误' }}</p>
          <button @click="refreshTemplates" class="btn">重试</button>
        </div>

        <div v-else-if="currentComponent" class="template-render-area">
          <!-- 模板选择器（当启用时） -->
          <div v-if="showSelector" class="hook-template-selector">
            <button
              class="template-selector-trigger"
              @click="showSelectorModal = !showSelectorModal"
            >
              <span>🎨</span>
              <span>{{ currentTemplateName }}</span>
              <span>▼</span>
            </button>

            <div v-if="showSelectorModal" class="selector-dropdown">
              <div class="selector-option"
                   v-for="template in ['default', 'modern', 'creative']"
                   :key="template"
                   @click="handleTemplateSelect(template)">
                {{ template }}
              </div>
            </div>
          </div>

          <!-- Hook 组件渲染 -->
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
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTemplate } from '@ldesign/template'

// 使用 useTemplate hook
const {
  currentTemplate,
  currentComponent,
  loading: isLoading,
  error,
  switchTemplate: switchTemplateHook,
  refreshTemplates
} = useTemplate({
  category: 'login',
  enableCache: true
})

// 响应式数据
const showSelector = ref<boolean>(true)
const showSelectorModal = ref<boolean>(false)
const selectedTemplate = ref<string>('default')

// 计算属性
const currentTemplateName = computed(() => {
  return currentTemplate.value?.displayName || selectedTemplate.value
})

// 简化的模板属性
const templateProps = computed(() => ({
  title: '用户登录',
  subtitle: '欢迎回来，请登录您的账户'
}))

// 简化的方法
const handleTemplateSelect = async (templateName: string) => {
  console.log('Hook方式选择模板:', templateName)
  selectedTemplate.value = templateName
  showSelectorModal.value = false

  // 使用Hook方式切换模板
  try {
    if (typeof switchTemplateHook === 'function') {
      await switchTemplateHook(templateName)
      console.log('Hook模板切换成功:', templateName)
    }
  } catch (error) {
    console.error('Hook模板切换失败:', error)
  }
}

const handleLogin = (data: any) => {
  console.log('登录数据:', data)
}


</script>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-header {
  text-align: center;
  margin-bottom: 2rem;
}

.demo-header h1 {
  color: #495057;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.demo-header p {
  color: #6c757d;
  font-size: 1rem;
}

/* 简化的控制面板 */
.control-panel {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.control-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.control-group label {
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
}

.control-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* 简化的模板选择器 */
.template-selector {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

/* 简化的模板容器 */
.template-container {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 2rem;
  min-height: 400px;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.template-render-area {
  width: 100%;
  min-height: 300px;
}

/* Hook 模板选择器样式 */
.hook-template-selector {
  position: relative;
  margin-bottom: 1rem;
}

.template-selector-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #495057;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.template-selector-trigger:hover {
  border-color: #007bff;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.15);
}

.selector-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  margin-top: 4px;
}

.selector-option {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f1f3f4;
}

.selector-option:last-child {
  border-bottom: none;
}

.selector-option:hover {
  background-color: #f8f9fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-page {
    padding: 1rem;
  }

  .control-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .control-group {
    justify-content: center;
  }

  .control-actions {
    justify-content: center;
  }

  .template-container {
    padding: 1rem;
  }
}




</style>
