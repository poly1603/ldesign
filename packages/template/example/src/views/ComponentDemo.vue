<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template'
import { computed, ref } from 'vue'

// 响应式数据
const showSelector = ref<boolean>(true)
const selectedTemplate = ref<string>('default')

// 计算属性
const currentTemplateName = computed(() => selectedTemplate.value)

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
</script>

<template>
  <div class="demo-page">
    <div class="demo-header">
      <h1>组件方式演示</h1>
      <p>使用 TemplateRenderer 组件渲染模板</p>
    </div>

    <div class="demo-content">
      <!-- 简化的控制面板 -->
      <div class="card">
        <div class="card__body">
          <div class="flex items-center justify-between gap-4">
            <div class="control-group">
              <span class="label">组件方式演示</span>
              <p class="text-sm text-gray-500">
                使用 TemplateRenderer 组件渲染模板
              </p>
            </div>

            <div class="control-actions">
              <button
                class="btn" :class="[showSelector ? 'btn--primary' : 'btn--secondary']"
                @click="showSelector = !showSelector"
              >
                {{ showSelector ? '隐藏选择器' : '显示选择器' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 集成模板选择器的渲染器 -->
      <div class="card">
        <div class="card__body">
          <TemplateRenderer
            category="login"
            :template-name="currentTemplateName"
            :show-selector="showSelector"
            :props="templateProps"
            :selector-config="selectorConfig"
            @template-change="handleTemplateChange"
            @load-success="handleTemplateLoaded"
            @load-error="handleError"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 使用简化设计系统的样式 */
.demo-page {
  padding: var(--spacing-8);
}

.demo-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.demo-header h1 {
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-2xl);
}

.demo-header p {
  color: var(--color-gray-600);
  font-size: var(--font-size-base);
  margin: 0;
}

/* 控制面板样式 */
.control-group {
  flex: 1;
}

.control-group .label {
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.text-sm {
  font-size: var(--font-size-sm);
}

.text-gray-500 {
  color: var(--color-gray-500);
}

.control-actions {
  flex-shrink: 0;
}

/* 间距工具类 */
.mb-8 {
  margin-bottom: var(--spacing-8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-page {
    padding: var(--spacing-4);
  }

  .demo-header {
    margin-bottom: var(--spacing-6);
  }

  .demo-header h1 {
    font-size: var(--font-size-xl);
  }

  .flex {
    flex-direction: column;
    align-items: stretch !important;
  }

  .control-actions {
    margin-top: var(--spacing-4);
  }
}
</style>
