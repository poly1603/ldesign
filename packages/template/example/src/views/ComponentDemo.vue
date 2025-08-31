<template>
  <div class="demo-page">
    <div class="demo-header">
      <h1>组件方式演示</h1>
      <p>使用 TemplateRenderer 组件渲染模板</p>
    </div>

    <div class="demo-content">
      <!-- 简化的控制面板 -->
      <div class="control-panel">
        <div class="control-group">
          <label>组件方式演示</label>
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

      <!-- 集成模板选择器的渲染器 -->
      <div class="template-container">
        <TemplateRenderer
          category="login"
          :template-name="currentTemplateName"
          :show-selector="showSelector"
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
import { ref, computed } from 'vue'
import { TemplateRenderer } from '@ldesign/template'

// 响应式数据
const showSelector = ref<boolean>(true)
const selectedTemplate = ref<string>('default')

// 计算属性
const currentTemplateName = computed(() => selectedTemplate.value)

// 简化的模板属性
const templateProps = computed(() => ({
  title: '用户登录',
  subtitle: '欢迎回来，请登录您的账户'
}))

// 简化的方法
const handleTemplateChange = (template: any) => {
  console.log('模板变化:', template)
  if (template?.name) {
    selectedTemplate.value = template.name
  }
}

const handleTemplateLoaded = (template: any) => {
  console.log('模板加载成功:', template)
}

const handleError = (error: any) => {
  console.error('模板加载错误:', error)
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
