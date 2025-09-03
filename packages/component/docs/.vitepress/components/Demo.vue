<template>
  <div class="demo-block">
    <div class="demo-title" v-if="title">{{ title }}</div>
    <div class="demo-description" v-if="description">{{ description }}</div>
    
    <div class="demo-showcase">
      <div class="demo-content" :class="{ vertical: vertical }">
        <slot />
      </div>
      
      <!-- 交互式控制面板 -->
      <div v-if="interactive" class="demo-controls">
        <div class="demo-controls-title">组件配置</div>
        <slot name="controls" />
      </div>
    </div>
    
    <div class="demo-actions">
      <button 
        class="demo-action-btn" 
        @click="showCode = !showCode"
        :class="{ active: showCode }"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M9.4,16.6L4.8,12l4.6-4.6L8,6L2,12l6,6L9.4,16.6z M14.6,16.6l4.6-4.6l-4.6-4.6L16,6l6,6l-6,6L14.6,16.6z"/>
        </svg>
        {{ showCode ? '隐藏代码' : '显示代码' }}
      </button>
      
      <button 
        v-if="codepen" 
        class="demo-action-btn"
        @click="openCodepen"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M24,8.182l-0.018-0.087l-0.017-0.05c-0.01-0.024-0.018-0.047-0.03-0.068L23.92,8L23.9,7.98c-0.012-0.015-0.022-0.03-0.035-0.044L12.26,0.14c-0.35-0.16-0.76-0.16-1.11,0L0.15,7.936C0.06,7.99,0,8.084,0,8.182v7.636c0,0.097,0.06,0.192,0.15,0.245l10.99,7.796c0.35,0.16,0.76,0.16,1.11,0L23.85,16.063c0.09-0.053,0.15-0.148,0.15-0.245V8.182z M12,10.9L8.69,8.9L12,6.9l3.31,2L12,10.9z M12,12.9l4.2-2.4v4.8L12,12.9z M11,12.9l-4.2,2.4v-4.8L11,12.9z M12,2.74l7.33,5.2L16,10.15L12,7.74V2.74z M5,10.15L1.67,7.94L9,2.74v5L5,10.15z"/>
        </svg>
        在 CodePen 中打开
      </button>
    </div>
    
    <div v-if="showCode" class="demo-code">
      <div class="demo-code-header">
        <div class="demo-code-lang">HTML</div>
        <button 
          class="demo-copy-btn"
          @click="copyCode"
          :class="{ copied: codeCopied }"
        >
          <span v-if="!codeCopied">复制代码</span>
          <span v-else>已复制</span>
        </button>
      </div>
      <pre><code v-html="highlightedCode"></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  title?: string
  description?: string
  code?: string
  vertical?: boolean
  interactive?: boolean
  codepen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  vertical: false,
  interactive: false,
  codepen: false
})

const showCode = ref(false)
const codeCopied = ref(false)

const highlightedCode = computed(() => {
  if (!props.code) return ''
  
  // 简单的 HTML 语法高亮
  return props.code
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;(\/?[\w-]+)/g, '&lt;<span class="token tag">$1</span>')
    .replace(/(\w+)=/g, '<span class="token attr-name">$1</span>=')
    .replace(/="([^"]*)"/g, '="<span class="token attr-value">$1</span>"')
})

const copyCode = async () => {
  if (!props.code) return
  
  try {
    await navigator.clipboard.writeText(props.code)
    codeCopied.value = true
    setTimeout(() => {
      codeCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}

const openCodepen = () => {
  if (!props.code) return
  
  const codepenData = {
    title: props.title || 'LDesign Component Demo',
    html: props.code,
    css: `/* LDesign 组件样式已内置 */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
}`,
    js: `// 组件已经通过 CDN 自动加载`,
    html_pre_processor: 'none',
    css_pre_processor: 'none',
    js_pre_processor: 'none'
  }
  
  const form = document.createElement('form')
  form.action = 'https://codepen.io/pen/define'
  form.method = 'POST'
  form.target = '_blank'
  
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = 'data'
  input.value = JSON.stringify(codepenData)
  
  form.appendChild(input)
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

onMounted(() => {
  // 确保组件加载
  if (typeof window !== 'undefined' && !customElements.get('ld-button')) {
    import('../../../dist/ldesign-component/ldesign-component.esm.js')
      .then(({ defineCustomElements }) => {
        defineCustomElements()
      })
      .catch(console.warn)
  }
})
</script>

<style scoped>
.demo-block {
  margin: 24px 0;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.demo-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  padding: 16px 20px 8px;
}

.demo-description {
  color: var(--vp-c-text-2);
  padding: 0 20px 16px;
  font-size: 14px;
  line-height: 1.6;
}

.demo-showcase {
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg-soft);
}

.demo-content {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  min-height: 80px;
}

.demo-content.vertical {
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

.demo-controls {
  border-top: 1px solid var(--vp-c-divider);
  padding: 16px 24px;
  background: var(--vp-c-bg);
}

.demo-controls-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 12px;
}

.demo-actions {
  border-top: 1px solid var(--vp-c-divider);
  padding: 12px 20px;
  display: flex;
  gap: 8px;
  background: var(--vp-c-bg);
}

.demo-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 13px;
  background: transparent;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.demo-action-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.demo-action-btn.active {
  background: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
  color: white;
}

.demo-code {
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-code-bg);
}

.demo-code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.demo-code-lang {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.demo-copy-btn {
  padding: 4px 8px;
  font-size: 12px;
  background: transparent;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.demo-copy-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.demo-copy-btn.copied {
  background: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
  color: white;
}

pre {
  margin: 0;
  padding: 16px 20px;
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

/* 组件演示区域的样式重置 */
.demo-content :deep(ld-button) {
  margin: 4px;
}

.demo-content :deep(ld-input) {
  margin: 4px;
}

.demo-content :deep(ld-card) {
  margin: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-content {
    padding: 16px;
  }
  
  .demo-controls {
    padding: 12px 16px;
  }
  
  .demo-actions {
    padding: 8px 16px;
    flex-wrap: wrap;
  }
  
  pre {
    padding: 12px 16px;
    font-size: 12px;
  }
}
</style>
