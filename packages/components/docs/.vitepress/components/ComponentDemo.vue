<script setup lang="ts">
import { computed, ref } from 'vue'

interface CodeTab {
  name: string
  label: string
}

interface Props {
  title?: string
  description?: string
  tabs?: CodeTab[]
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [
    { name: 'vue', label: 'Vue' },
    { name: 'html', label: 'HTML' },
  ],
})

const showCode = ref(false)
const activeTab = ref(props.tabs[0]?.name || 'vue')

const codeTabs = computed(() => props.tabs)

function toggleCode() {
  showCode.value = !showCode.value
}

async function copyCode() {
  try {
    const codeElement = document.querySelector('.demo-code .code-content pre code')
    if (codeElement) {
      await navigator.clipboard.writeText(codeElement.textContent || '')
      // 这里可以添加复制成功的提示
    }
  }
  catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<template>
  <div class="component-demo">
    <div class="demo-header">
      <h3 v-if="title">
        {{ title }}
      </h3>
      <p v-if="description" class="demo-description">
        {{ description }}
      </p>
    </div>

    <div class="demo-preview">
      <div class="demo-content">
        <slot name="demo" />
      </div>

      <div class="demo-actions">
        <button
          class="demo-btn"
          :class="{ active: showCode }"
          @click="toggleCode"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16,18 22,12 16,6" />
            <polyline points="8,6 2,12 8,18" />
          </svg>
          {{ showCode ? '隐藏代码' : '显示代码' }}
        </button>

        <button class="demo-btn" @click="copyCode">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5,15H4a2,2,0,0,1-2-2V4A2,2,0,0,1,4,2H15a2,2,0,0,1,2,2V5" />
          </svg>
          复制代码
        </button>
      </div>
    </div>

    <div v-if="showCode" class="demo-code">
      <div class="code-tabs">
        <button
          v-for="tab in codeTabs"
          :key="tab.name"
          class="code-tab"
          :class="{ active: activeTab === tab.name }"
          @click="activeTab = tab.name"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="code-content">
        <slot :name="`code-${activeTab}`" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.component-demo {
  margin: 24px 0;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
}

.demo-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--vp-c-border);
  background-color: var(--vp-c-bg-soft);
}

.demo-header h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.demo-description {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.demo-preview {
  position: relative;
}

.demo-content {
  padding: 24px;
  background-color: var(--vp-c-bg);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.demo-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.demo-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.demo-btn.active {
  border-color: var(--vp-c-brand);
  background-color: var(--vp-c-brand);
  color: white;
}

.demo-code {
  border-top: 1px solid var(--vp-c-border);
}

.code-tabs {
  display: flex;
  background-color: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-border);
}

.code-tab {
  padding: 8px 16px;
  font-size: 12px;
  border: none;
  background: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.code-tab:hover {
  color: var(--vp-c-text-1);
}

.code-tab.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}

.code-content {
  background-color: var(--vp-code-block-bg);
}

.code-content :deep(pre) {
  margin: 0;
  padding: 16px 20px;
  background: transparent !important;
}

.code-content :deep(code) {
  background: transparent !important;
}
</style>
