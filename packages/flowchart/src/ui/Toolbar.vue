<template>
  <div class="ldesign-toolbar">
    <div class="toolbar-left">
      <button 
        v-for="tool in leftTools" 
        :key="tool.name"
        class="toolbar-btn"
        :class="{ 'disabled': tool.disabled }"
        :disabled="tool.disabled"
        @click="handleToolClick(tool.name)"
        :title="tool.title"
      >
        <span v-html="tool.icon"></span>
        <span class="btn-text">{{ tool.label }}</span>
      </button>
    </div>

    <div class="toolbar-right">
      <!-- 主题选择器 -->
      <select 
        v-if="showThemeSelector"
        class="theme-selector" 
        :value="currentTheme" 
        @change="handleThemeChange"
      >
        <option value="default">默认主题</option>
        <option value="dark">暗色主题</option>
        <option value="blue">蓝色主题</option>
      </select>

      <!-- 右侧工具按钮 -->
      <button 
        v-for="tool in rightTools" 
        :key="tool.name"
        class="toolbar-btn"
        :class="{ 'active': tool.active, 'disabled': tool.disabled }"
        :disabled="tool.disabled"
        @click="handleToolClick(tool.name)"
        :title="tool.title"
      >
        <span v-html="tool.icon"></span>
        <span class="btn-text">{{ tool.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ToolbarTool } from '../types'

// Props
interface Props {
  tools?: ToolbarTool[]
  readonly?: boolean
  currentTheme?: string
  showThemeSelector?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tools: () => ['select', 'zoom-fit', 'undo', 'redo'],
  readonly: false,
  currentTheme: 'default',
  showThemeSelector: true
})

// Emits
const emit = defineEmits<{
  'tool:click': [toolName: string]
  'theme:change': [theme: string]
}>()

// 工具配置
const toolConfigs = {
  'select': {
    name: 'select',
    label: '选择',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2L6 14L8 8L14 6L2 2Z"/>
    </svg>`,
    title: '选择工具'
  },
  'pan': {
    name: 'pan',
    label: '平移',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2L8 14M2 8L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    title: '平移画布'
  },
  'zoom-in': {
    name: 'zoom-in',
    label: '放大',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M12 12L15 15M7 4V10M4 7H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    title: '放大画布'
  },
  'zoom-out': {
    name: 'zoom-out',
    label: '缩小',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M12 12L15 15M4 7H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    title: '缩小画布'
  },
  'zoom-fit': {
    name: 'zoom-fit',
    label: '适应',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="2" y="2" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M6 6L10 10M6 10L10 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    title: '适应画布'
  },
  'undo': {
    name: 'undo',
    label: '撤销',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13H6" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M6 10L3 13L6 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    title: '撤销操作'
  },
  'redo': {
    name: 'redo',
    label: '重做',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13 8C13 5.24 10.76 3 8 3C5.24 3 3 5.24 3 8C3 10.76 5.24 13 8 13H10" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M10 10L13 13L10 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    title: '重做操作'
  },
  'delete': {
    name: 'delete',
    label: '删除',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 6L13 6M5 6V14C5 14.5 5.5 15 6 15H10C10.5 15 11 14.5 11 14V6M7 1H9C9.5 1 10 1.5 10 2V3H6V2C6 1.5 6.5 1 7 1Z" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>`,
    title: '删除选中项'
  },
  'copy': {
    name: 'copy',
    label: '复制',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="2" y="2" width="8" height="8" stroke="currentColor" stroke-width="2" fill="none"/>
      <rect x="6" y="6" width="8" height="8" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>`,
    title: '复制选中项'
  },
  'paste': {
    name: 'paste',
    label: '粘贴',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="4" y="4" width="8" height="10" stroke="currentColor" stroke-width="2" fill="none"/>
      <rect x="6" y="2" width="4" height="2" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>`,
    title: '粘贴'
  }
}

// 左侧工具
const leftTools = computed(() => {
  const leftToolNames = ['zoom-fit', 'undo', 'redo']
  return leftToolNames
    .filter(name => props.tools.includes(name as ToolbarTool))
    .map(name => ({
      ...toolConfigs[name as keyof typeof toolConfigs],
      disabled: props.readonly && ['undo', 'redo'].includes(name)
    }))
})

// 右侧工具
const rightTools = computed(() => {
  const rightToolNames = ['select', 'delete', 'copy', 'paste']
  return rightToolNames
    .filter(name => props.tools.includes(name as ToolbarTool))
    .map(name => ({
      ...toolConfigs[name as keyof typeof toolConfigs],
      disabled: props.readonly && ['delete', 'paste'].includes(name),
      active: name === 'select' // 默认选中选择工具
    }))
})

// 处理工具点击
const handleToolClick = (toolName: string) => {
  emit('tool:click', toolName)
}

// 处理主题变更
const handleThemeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('theme:change', target.value)
}
</script>

<style scoped>
.ldesign-toolbar {
  height: 48px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  gap: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: #ffffff;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toolbar-btn:hover:not(.disabled) {
  border-color: #7334cb;
  background: #f8f8f8;
  color: #7334cb;
}

.toolbar-btn.active {
  border-color: #7334cb;
  background: #f1ecf9;
  color: #7334cb;
}

.toolbar-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f8f8;
  color: rgba(0, 0, 0, 0.4);
}

.btn-text {
  font-weight: 500;
}

.theme-selector {
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: #ffffff;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.theme-selector:focus {
  outline: none;
  border-color: #7334cb;
}

.theme-selector:hover {
  border-color: #d9d9d9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .btn-text {
    display: none;
  }
  
  .toolbar-btn {
    padding: 8px;
  }
}
</style>
