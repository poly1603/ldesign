<template>
  <div class="template-switcher" v-if="templates.length > 1">
    <label class="switcher-label">模板:</label>
    <select 
      :value="currentTemplate || defaultTemplate" 
      @change="handleChange"
      class="switcher-select"
    >
      <option 
        v-for="template in templates" 
        :key="template.name"
        :value="template.name"
      >
        {{ template.displayName || template.name }}
        {{ template.isDefault ? ' (默认)' : '' }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import type { TemplateManager } from '../../runtime/manager'
import { useDevice } from '../composables'

interface Props {
  category: string
  currentTemplate?: string
}

interface Emits {
  (e: 'change', templateName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 获取管理器和当前设备
const manager = inject<TemplateManager>('templateManager')
const { device } = useDevice()

// 获取当前设备的模板列表
const templates = computed(() => {
  if (!manager) return []
  const currentDevice = device.value
  console.log('[TemplateSwitcher] Current device:', currentDevice)
  const results = manager.query({
    category: props.category,
    device: currentDevice
  })
  console.log('[TemplateSwitcher] Templates found:', results.length, results.map(r => r.metadata.name))
  return results.map(r => r.metadata)
})

// 获取默认模板
const defaultTemplate = computed(() => {
  const defaultTpl = templates.value.find(t => t.isDefault)
  return defaultTpl?.name || templates.value[0]?.name || ''
})

// 处理切换
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('change', target.value)
}
</script>

<style scoped>
.template-switcher {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.switcher-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.switcher-select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.switcher-select:hover {
  border-color: #667eea;
}

.switcher-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
</style>
