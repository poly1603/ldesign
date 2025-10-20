<script setup lang="ts">
import type { DeviceType } from '../types'
import { computed, inject, ref, type Ref, watch } from 'vue'
import { useTemplateList } from '../composables'
import { getLocale } from '../locales'
import { useTemplatePlugin } from '../plugin/useTemplatePlugin'

interface Props {
  category: string
  device: DeviceType
  currentTemplate: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [templateName: string]
}>()

// 状态
const expanded = ref(false)

// 获取语言配置
const plugin = useTemplatePlugin()
const locale = plugin?.currentLocale || inject<Ref<string>>('locale', ref('zh-CN'))
const messages = computed(() => {
  const localeValue = typeof locale.value === 'string' ? locale.value : 'zh-CN'
  return getLocale(localeValue)
})

// 获取当前分类和设备下的所有模板
const { templates: allTemplates } = useTemplateList()

const templates = computed(() => {
  return allTemplates.value.filter(
    t => t.category === props.category && t.device === props.device
  )
})

const deviceLabel = computed(() => {
  return messages.value.device[props.device] || props.device
})

// 切换展开状态
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

// 选择模板
const selectTemplate = (templateName: string) => {
  emit('select', templateName)
  expanded.value = false
}

// 设备切换时自动收起
watch(() => props.device, () => {
  expanded.value = false
})
</script>

<template>
  <div class="template-selector" :class="{ expanded }">
    <!-- 切换按钮 -->
    <button class="toggle-btn" :title="expanded ? messages.actions.clearCache : messages.actions.selectTemplate" @click="toggleExpanded">
      <svg v-if="!expanded" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M4 6h16M4 12h16M4 18h16" stroke-width="2" stroke-linecap="round" />
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>

    <!-- 选择器面板 -->
    <div v-if="expanded" class="selector-panel">
      <div class="panel-header">
        <h3>{{ messages.actions.selectTemplate }}</h3>
        <div class="current-info">
          <span class="badge">{{ deviceLabel }}</span>
          <span class="badge">{{ messages.category[category] || category }}</span>
        </div>
      </div>

      <div class="template-list">
        <div
          v-for="template in templates"
          :key="template.name"
          class="template-item"
          :class="{ active: template.name === currentTemplate }"
          @click="selectTemplate(template.name)"
        >
          <div class="template-name">
            {{ template.displayName }}
            <span v-if="template.isDefault" class="default-badge">{{ messages.device.desktop === '桌面端' ? '默认' : 'Default' }}</span>
          </div>
          <div v-if="template.description" class="template-desc">
            {{ template.description }}
          </div>
        </div>

        <div v-if="templates.length === 0" class="empty-state">
          {{ messages.messages.noTemplates }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-selector {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.toggle-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.95);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.toggle-btn:hover {
  background: rgba(102, 126, 234, 1);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.template-selector.expanded .toggle-btn {
  background: #f56c6c;
}

.selector-panel {
  position: absolute;
  top: 60px;
  right: 0;
  width: 320px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.panel-header h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.current-info {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 12px;
}

.template-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.template-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-item:hover {
  border-color: #667eea;
  background: #f5f7ff;
}

.template-item.active {
  border-color: #667eea;
  background: #e8ecff;
}

.template-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.default-badge {
  padding: 2px 6px;
  background: #67c23a;
  color: white;
  border-radius: 10px;
  font-size: 11px;
}

.template-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 滚动条样式 */
.template-list::-webkit-scrollbar {
  width: 6px;
}

.template-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.template-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.template-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
