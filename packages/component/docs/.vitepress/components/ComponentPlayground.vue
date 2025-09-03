<template>
  <div class="component-playground">
    <div class="playground-header">
      <h3 class="playground-title">{{ title }}</h3>
      <div class="playground-actions">
        <button 
          class="playground-reset-btn"
          @click="resetProps"
        >
          重置配置
        </button>
      </div>
    </div>
    
    <div class="playground-content">
      <!-- 组件预览区 -->
      <div class="playground-preview">
        <div class="preview-label">组件预览</div>
        <div class="preview-area">
          <slot name="preview" :props="currentProps" />
        </div>
      </div>
      
      <!-- 属性配置区 -->
      <div class="playground-controls">
        <div class="controls-label">属性配置</div>
        <div class="controls-grid">
          <slot name="controls" :props="currentProps" :updateProp="updateProp" />
        </div>
      </div>
    </div>
    
    <!-- 生成的代码 -->
    <div class="playground-code">
      <div class="code-header">
        <div class="code-title">生成的代码</div>
        <button 
          class="code-copy-btn"
          @click="copyGeneratedCode"
          :class="{ copied: codeCopied }"
        >
          {{ codeCopied ? '已复制' : '复制代码' }}
        </button>
      </div>
      <pre><code v-html="highlightedGeneratedCode"></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface Props {
  title: string
  defaultProps: Record<string, any>
  component: string
}

const props = defineProps<Props>()

const currentProps = reactive({ ...props.defaultProps })
const codeCopied = ref(false)

const updateProp = (key: string, value: any) => {
  currentProps[key] = value
}

const resetProps = () => {
  Object.assign(currentProps, props.defaultProps)
}

const generatedCode = computed(() => {
  const attrs = Object.entries(currentProps)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? key : ''
      }
      return `${key}="${value}"`
    })
    .filter(Boolean)
    .join(' ')
  
  const tag = props.component
  if (attrs) {
    return `<${tag} ${attrs}>组件内容</${tag}>`
  }
  return `<${tag}>组件内容</${tag}>`
})

const highlightedGeneratedCode = computed(() => {
  return generatedCode.value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;(\/?[\w-]+)/g, '&lt;<span class="token tag">$1</span>')
    .replace(/(\w+)=/g, '<span class="token attr-name">$1</span>=')
    .replace(/="([^"]*)"/g, '="<span class="token attr-value">$1</span>"')
})

const copyGeneratedCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    codeCopied.value = true
    setTimeout(() => {
      codeCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}
</script>

<style scoped>
.component-playground {
  margin: 32px 0;
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.playground-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.playground-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.playground-reset-btn {
  padding: 6px 12px;
  font-size: 13px;
  background: transparent;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.playground-reset-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.playground-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 0;
  min-height: 200px;
}

.playground-preview {
  padding: 24px;
  border-right: 1px solid var(--vp-c-divider);
}

.playground-controls {
  padding: 24px;
  background: var(--vp-c-bg-soft);
}

.preview-label,
.controls-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 16px;
}

.preview-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 20px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
}

.controls-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.playground-code {
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-code-bg);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.code-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.code-copy-btn {
  padding: 4px 8px;
  font-size: 12px;
  background: transparent;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.code-copy-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.code-copy-btn.copied {
  background: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
  color: white;
}

pre {
  margin: 0;
  padding: 20px 24px;
  overflow-x: auto;
  background: transparent;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
}

code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
  color: var(--vp-code-color);
}

:deep(.token.tag) {
  color: #e06c75;
}

:deep(.token.attr-name) {
  color: #d19a66;
}

:deep(.token.attr-value) {
  color: #98c379;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playground-content {
    grid-template-columns: 1fr;
  }
  
  .playground-preview {
    border-right: none;
    border-bottom: 1px solid var(--vp-c-divider);
  }
  
  .playground-header {
    padding: 12px 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .playground-preview,
  .playground-controls {
    padding: 16px;
  }
  
  .code-header {
    padding: 8px 16px;
  }
  
  pre {
    padding: 12px 16px;
  }
}
</style>
