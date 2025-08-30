<template>
  <div class="basic-example">
    <div class="container">
      <h1 class="page-title">🎯 基础示例</h1>
      <p class="page-description">
        了解如何使用 TemplateRenderer 组件渲染模板
      </p>
      
      <div class="example-section">
        <h2>简单渲染</h2>
        <p>最基本的模板渲染示例：</p>
        
        <div class="demo-container">
          <div class="demo-preview">
            <!-- 真正的模板渲染 -->
            <div class="template-render-area">
              <h3>登录模板渲染</h3>
              <p>当前设备: <strong>{{ currentDevice }}</strong></p>

              <!-- 这里渲染真正的登录模板 -->
              <div class="template-container">
                <TemplateRenderer
                  category="login"
                  :show-selector="true"
                  @template-change="handleTemplateChange"
                  @error="handleError"
                />
              </div>

              <!-- 如果没有找到模板，显示手动创建的登录组件 -->
              <div v-if="!hasTemplates" class="fallback-template">
                <h4>📝 手动登录模板演示</h4>
                <ManualLoginTemplate />
              </div>
            </div>
          </div>

          <div class="demo-code">
            <pre><code>&lt;TemplateRenderer
  category="login"
  :show-selector="true"
  @template-change="handleTemplateChange"
/&gt;</code></pre>
          </div>
        </div>

        <!-- 状态信息 -->
        <div class="status-info">
          <h4>📊 状态信息</h4>
          <p><strong>当前设备:</strong> {{ currentDevice }}</p>
          <p><strong>可用模板:</strong> {{ availableTemplates.length }} 个</p>
          <p><strong>当前模板:</strong> {{ currentTemplate?.name || '无' }}</p>
          <p><strong>加载状态:</strong> {{ loading ? '加载中...' : '已完成' }}</p>
          <p v-if="error" class="error"><strong>错误:</strong> {{ error.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { TemplateRenderer, useTemplate } from '@ldesign/template'
import type { TemplateInfo } from '@ldesign/template'
import ManualLoginTemplate from '../components/ManualLoginTemplate.vue'

// 使用模板管理器
const {
  currentDevice,
  currentTemplate,
  loading,
  error,
  availableTemplates,
  scanTemplates,
  getTemplates,
} = useTemplate()

// 计算属性
const hasTemplates = computed(() => {
  const loginTemplates = getTemplates('login')
  return loginTemplates.length > 0
})

// 事件处理
const handleTemplateChange = (template: TemplateInfo) => {
  console.log('模板切换:', template)
}

const handleError = (err: Error) => {
  console.error('模板加载错误:', err)
}

// 组件挂载时扫描模板
onMounted(async () => {
  try {
    const result = await scanTemplates()
    console.log('扫描结果:', result)
  } catch (err) {
    console.error('扫描失败:', err)
  }
})
</script>

<style scoped>
.basic-example {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: white;
}

.page-description {
  font-size: 1.25rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
}

.example-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.example-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.demo-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

.demo-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 2rem;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  text-align: center;
  color: #666;
}

.status-info {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 2rem;
  border: 1px solid #e9ecef;
}

.status-info p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

.status-info .error {
  color: #dc3545;
  font-weight: 500;
}

.demo-code {
  background: #2d3748;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}

.demo-code pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .demo-container {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
}
</style>
