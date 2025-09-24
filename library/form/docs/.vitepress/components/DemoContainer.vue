<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  title: String,
  description: String,
  code: {
    type: Object,
    default: () => ({}),
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:data', 'config-change'])

// 状态管理
const showCode = ref(false)
const showConfig = ref(false)
const showData = ref(true)
const activeTab = ref('vue')
const demoFormData = ref({ ...props.initialData })

// 代码标签页
const codeTabs = computed(() => {
  const tabs = []
  if (props.code.vue)
    tabs.push({ key: 'vue', label: 'Vue' })
  if (props.code.js)
    tabs.push({ key: 'js', label: 'JavaScript' })
  if (props.code.ts)
    tabs.push({ key: 'ts', label: 'TypeScript' })
  if (props.code.html)
    tabs.push({ key: 'html', label: 'HTML' })
  return tabs
})

// 当前代码内容
const currentCode = computed(() => {
  return props.code[activeTab.value] || ''
})

// 高亮代码（简单实现，实际项目中可以使用 Prism.js 或 highlight.js）
const highlightedCode = computed(() => {
  // 这里可以集成代码高亮库
  return currentCode.value
})

// 方法
function toggleCode() {
  showCode.value = !showCode.value
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(currentCode.value)
    // 可以添加复制成功的提示
  }
  catch (err) {
    console.error('复制失败:', err)
  }
}

function resetDemo() {
  demoFormData.value = { ...props.initialData }
  resetDemoData()
}

function resetDemoData() {
  emit('update:data', { ...props.initialData })
}

function updateConfig(config) {
  emit('config-change', config)
}

// 监听数据变化
watch(
  demoFormData,
  (newData) => {
    emit('update:data', newData)
  },
  { deep: true },
)

// 初始化
onMounted(() => {
  if (codeTabs.value.length > 0) {
    activeTab.value = codeTabs.value[0].key
  }
})
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h3 v-if="title" class="demo-title">
        {{ title }}
      </h3>
      <p v-if="description" class="demo-description">
        {{ description }}
      </p>
    </div>

    <div class="demo-content">
      <!-- 演示区域 -->
      <div class="demo-preview">
        <div class="demo-preview-header">
          <span class="demo-preview-title">预览</span>
          <div class="demo-actions">
            <button
              class="demo-action-btn"
              :class="{ active: showCode }"
              title="查看代码"
              @click="toggleCode"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
                />
              </svg>
            </button>
            <button class="demo-action-btn" title="复制代码" @click="copyCode">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                />
              </svg>
            </button>
            <button class="demo-action-btn" title="重置演示" @click="resetDemo">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="demo-preview-content">
          <slot
            name="demo"
            :form-data="demoFormData"
            :reset-data="resetDemoData"
          />
        </div>
      </div>

      <!-- 代码区域 -->
      <div v-show="showCode" class="demo-code">
        <div class="demo-code-header">
          <div class="demo-code-tabs">
            <button
              v-for="tab in codeTabs"
              :key="tab.key"
              class="demo-code-tab"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        <div class="demo-code-content">
          <pre><code v-html="highlightedCode" /></pre>
        </div>
      </div>
    </div>

    <!-- 配置面板 -->
    <div v-if="$slots.config" class="demo-config">
      <div class="demo-config-header">
        <span class="demo-config-title">配置</span>
        <button
          class="demo-action-btn"
          :class="{ active: showConfig }"
          @click="showConfig = !showConfig"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
            />
          </svg>
        </button>
      </div>
      <div v-show="showConfig" class="demo-config-content">
        <slot name="config" :update-config="updateConfig" />
      </div>
    </div>

    <!-- 数据展示 -->
    <div v-if="showData" class="demo-data">
      <div class="demo-data-header">
        <span class="demo-data-title">表单数据</span>
        <button class="demo-action-btn" @click="showData = !showData">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        </button>
      </div>
      <div class="demo-data-content">
        <pre><code>{{ JSON.stringify(demoFormData, null, 2) }}</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}

.demo-header {
  padding: 16px;
  border-bottom: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
}

.demo-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.demo-description {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.5;
}

.demo-content {
  background: var(--vp-c-bg);
}

.demo-preview {
  border-bottom: 1px solid var(--vp-c-border);
}

.demo-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-border);
}

.demo-preview-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.demo-actions {
  display: flex;
  gap: 8px;
}

.demo-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.demo-action-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand);
}

.demo-action-btn.active {
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
  background: var(--vp-c-brand-soft);
}

.demo-preview-content {
  padding: 24px;
}

.demo-code {
  border-bottom: 1px solid var(--vp-c-border);
}

.demo-code-header {
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-border);
}

.demo-code-tabs {
  display: flex;
}

.demo-code-tab {
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.demo-code-tab:hover {
  color: var(--vp-c-text-1);
}

.demo-code-tab.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}

.demo-code-content {
  background: var(--vp-c-bg-alt);
  overflow-x: auto;
}

.demo-code-content pre {
  margin: 0;
  padding: 16px;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

.demo-config,
.demo-data {
  border-bottom: 1px solid var(--vp-c-border);
}

.demo-config:last-child,
.demo-data:last-child {
  border-bottom: none;
}

.demo-config-header,
.demo-data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-border);
}

.demo-config-title,
.demo-data-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.demo-config-content,
.demo-data-content {
  padding: 16px;
}

.demo-data-content pre {
  margin: 0;
  padding: 12px;
  background: var(--vp-c-bg-alt);
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  overflow-x: auto;
}
</style>
