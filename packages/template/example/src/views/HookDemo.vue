<script setup lang="ts">
import { useTemplate } from '@ldesign/template'
import { computed, ref, watch } from 'vue'

// 响应式数据
const selectedTemplate = ref<string>('default')

// 计算属性
// 简化的模板属性
const templateProps = computed(() => ({
  title: '用户登录',
  subtitle: '欢迎回来，请登录您的账户',
}))

// 简化的模板选择器配置
const selectorConfig = computed(() => ({
  theme: 'default',
  animation: 'scale',
  showSearch: false,   // 隐藏搜索框
  showTags: false,     // 隐藏标签筛选
  showSort: false,     // 隐藏排序选项
}))

// 使用 useTemplate hook
const {
  currentTemplate,
  currentComponent,
  loading,
  error,
} = useTemplate({
  category: 'login',
  autoDetectDevice: true,
  enableCache: true,
  showSelector: true,
  selectorConfig: selectorConfig.value,
})



// 简化的方法
function handleTemplateChange(template: any) {
  console.log('模板变化:', template)
  if (template?.name) {
    selectedTemplate.value = template.name
  }
}

function handleTemplateLoaded(template: any) {
  console.log('模板加载成功:', template)
}

function handleError(error: any) {
  console.error('模板加载错误:', error)
}

// 监听当前模板变化，模拟 template-change 事件
watch(currentTemplate, (newTemplate) => {
  if (newTemplate) {
    handleTemplateChange(newTemplate)
    handleTemplateLoaded(newTemplate)
  }
}, { immediate: true })

// 监听错误状态，模拟 load-error 事件
watch(error, (newError) => {
  if (newError) {
    handleError(newError)
  }
})
</script>

<template>
  <!-- 使用简单的 Transition 包装组件渲染，实现与 ComponentDemo 相同的功能 -->
  <Transition name="template-fade" mode="out-in">
    <div v-if="loading" key="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载模板...</p>
    </div>
    <div v-else-if="error" key="error" class="error-state">
      <p>模板加载失败: {{ error }}</p>
    </div>
    <component
      v-else-if="currentComponent"
      :key="currentTemplate?.name || 'template'"
      :is="currentComponent"
      v-bind="templateProps"
    />
    <div v-else key="empty" class="empty-state">
      <p>没有找到匹配的模板</p>
    </div>
  </Transition>
</template>

<style scoped>
/* 简化的样式，与 ComponentDemo 保持一致 */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  color: #721c24;
}

.empty-state {
  color: #6c757d;
}

/* Transition 动画样式 */
.template-fade-enter-active,
.template-fade-leave-active {
  transition: opacity 0.3s ease;
}

.template-fade-enter-from,
.template-fade-leave-to {
  opacity: 0;
}
</style>
