<template>
  <div class="template-selector">
    <!-- 触发按钮 -->
    <button 
      @click="openSelector" 
      class="selector-trigger"
      :class="{ active: isOpen }"
      :disabled="disabled"
    >
      <span class="current-template">{{ currentTemplateName }}</span>
      <svg class="dropdown-icon" :class="{ rotated: isOpen }" viewBox="0 0 24 24">
        <path d="M7 10l5 5 5-5z"/>
      </svg>
    </button>

    <!-- 模态对话框 -->
    <teleport to="body">
      <div v-if="isOpen" class="modal-overlay" @click="closeSelector">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>选择模板</h3>
            <button @click="closeSelector" class="close-btn">
              <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- 设备类型和分类信息 -->
            <div class="selector-info">
              <div class="info-item">
                <span class="label">当前设备:</span>
                <span class="value">{{ deviceTypeLabel }}</span>
              </div>
              <div class="info-item">
                <span class="label">模板分类:</span>
                <span class="value">{{ category }}</span>
              </div>
            </div>

            <!-- 搜索框 -->
            <div class="search-box">
              <svg class="search-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索模板..."
                class="search-input"
                @keydown.esc="closeSelector"
                @keydown.enter="selectFirstTemplate"
                ref="searchInput"
              />
            </div>

            <!-- 模板列表 -->
            <div class="template-list" v-if="filteredTemplates.length > 0">
              <div
                v-for="(template, index) in filteredTemplates"
                :key="template.name"
                @click="selectTemplate(template)"
                @keydown.enter="selectTemplate(template)"
                @keydown.space.prevent="selectTemplate(template)"
                class="template-item"
                :class="{ 
                  selected: template.name === currentTemplate,
                  focused: focusedIndex === index
                }"
                :tabindex="0"
                @focus="focusedIndex = index"
              >
                <!-- 模板预览图 -->
                <div class="template-preview">
                  <img 
                    v-if="template.thumbnail" 
                    :src="template.thumbnail" 
                    :alt="template.name"
                    class="template-thumbnail"
                    @error="handleImageError"
                  />
                  <div v-else class="template-placeholder">
                    <svg viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  </div>
                </div>

                <!-- 模板信息 -->
                <div class="template-info">
                  <h4 class="template-name">{{ template.displayName || template.name }}</h4>
                  <p class="template-description">{{ template.description || '暂无描述' }}</p>
                  <div class="template-meta">
                    <span class="template-version" v-if="template.version">v{{ template.version }}</span>
                    <span class="template-tags" v-if="template.tags">
                      <span v-for="tag in template.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
                    </span>
                  </div>
                </div>

                <!-- 选中标识 -->
                <div v-if="template.name === currentTemplate" class="selected-indicator">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-state">
              <svg class="empty-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <h4>没有找到匹配的模板</h4>
              <p>请尝试调整搜索条件或检查模板配置</p>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeSelector" class="cancel-btn">取消</button>
            <button 
              @click="selectCurrentFocused" 
              class="confirm-btn"
              :disabled="!hasValidSelection"
            >
              确认选择
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

export interface TemplateOption {
  name: string
  displayName?: string
  description?: string
  version?: string
  tags?: string[]
  thumbnail?: string
  path?: string
}

interface Props {
  currentTemplate: string
  category: string
  deviceType: string
  availableTemplates?: TemplateOption[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  availableTemplates: () => [],
  disabled: false
})

const emit = defineEmits<{
  templateSelected: [templateName: string]
  selectorOpened: []
  selectorClosed: []
}>()

// 响应式状态
const isOpen = ref(false)
const searchQuery = ref('')
const focusedIndex = ref(0)
const searchInput = ref<HTMLInputElement>()

// 计算属性
const currentTemplateName = computed(() => {
  const template = props.availableTemplates.find(t => t.name === props.currentTemplate)
  return template?.displayName || props.currentTemplate || '选择模板'
})

const deviceTypeLabel = computed(() => {
  const labels = {
    desktop: '桌面端',
    tablet: '平板端',
    mobile: '移动端'
  }
  return labels[props.deviceType as keyof typeof labels] || props.deviceType
})

const filteredTemplates = computed(() => {
  if (!searchQuery.value) {
    return props.availableTemplates
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.availableTemplates.filter(template => 
    template.name.toLowerCase().includes(query) ||
    template.displayName?.toLowerCase().includes(query) ||
    template.description?.toLowerCase().includes(query) ||
    template.tags?.some(tag => tag.toLowerCase().includes(query))
  )
})

const hasValidSelection = computed(() => {
  return filteredTemplates.value.length > 0 && focusedIndex.value >= 0
})

// 方法
const openSelector = () => {
  if (props.disabled) return
  
  isOpen.value = true
  searchQuery.value = ''
  focusedIndex.value = 0
  
  emit('selectorOpened')
  
  // 聚焦搜索框
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const closeSelector = () => {
  isOpen.value = false
  emit('selectorClosed')
}

const selectTemplate = (template: TemplateOption) => {
  emit('templateSelected', template.name)
  closeSelector()
}

const selectFirstTemplate = () => {
  if (filteredTemplates.value.length > 0) {
    selectTemplate(filteredTemplates.value[0])
  }
}

const selectCurrentFocused = () => {
  if (hasValidSelection.value) {
    selectTemplate(filteredTemplates.value[focusedIndex.value])
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 键盘导航
const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) return
  
  switch (event.key) {
    case 'Escape':
      closeSelector()
      break
    case 'ArrowDown':
      event.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, filteredTemplates.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      selectCurrentFocused()
      break
  }
}

// 监听器
watch(() => props.deviceType, () => {
  // 设备类型变化时重置搜索
  searchQuery.value = ''
  focusedIndex.value = 0
})

watch(filteredTemplates, () => {
  // 过滤结果变化时重置焦点
  focusedIndex.value = 0
})

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.template-selector {
  position: relative;
  display: inline-block;
}

.selector-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  min-width: 120px;
}

.selector-trigger:hover:not(:disabled) {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.selector-trigger.active {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.selector-trigger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.current-template {
  flex: 1;
  text-align: left;
  color: #2d3748;
  font-weight: 500;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  fill: #718096;
  transition: transform 0.2s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f7fafc;
}

.close-btn svg {
  width: 20px;
  height: 20px;
  fill: #718096;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.selector-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-item .label {
  color: #718096;
  font-size: 0.875rem;
}

.info-item .value {
  color: #2d3748;
  font-weight: 500;
  font-size: 0.875rem;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  fill: #718096;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.template-list {
  flex: 1;
  overflow-y: auto;
  margin: -0.5rem;
  padding: 0.5rem;
}

.template-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  position: relative;
}

.template-item:hover {
  background: #f7fafc;
  border-color: #e2e8f0;
}

.template-item.focused {
  border-color: #667eea;
  background: #edf2f7;
}

.template-item.selected {
  background: #e6fffa;
  border-color: #38b2ac;
}

.template-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.template-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-placeholder svg {
  width: 24px;
  height: 24px;
  fill: #cbd5e0;
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-name {
  margin: 0 0 0.25rem;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
}

.template-description {
  margin: 0 0 0.5rem;
  color: #718096;
  font-size: 0.875rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.template-version {
  color: #667eea;
  font-size: 0.75rem;
  font-weight: 500;
  background: #edf2f7;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.template-tags {
  display: flex;
  gap: 0.25rem;
}

.tag {
  color: #718096;
  font-size: 0.75rem;
  background: #f7fafc;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.selected-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 20px;
  height: 20px;
  background: #38b2ac;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-indicator svg {
  width: 12px;
  height: 12px;
  fill: white;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
}

.empty-icon {
  width: 48px;
  height: 48px;
  fill: #cbd5e0;
  margin: 0 auto 1rem;
}

.empty-state h4 {
  margin: 0 0 0.5rem;
  color: #4a5568;
  font-size: 1.125rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn,
.confirm-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: white;
  border: 1px solid #e2e8f0;
  color: #4a5568;
}

.cancel-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.confirm-btn {
  background: #667eea;
  border: 1px solid #667eea;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: #5a67d8;
  border-color: #5a67d8;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    margin: 0.5rem;
    max-height: 90vh;
  }
  
  .selector-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .template-item {
    flex-direction: column;
    text-align: center;
  }
  
  .template-preview {
    width: 80px;
    height: 80px;
  }
}
</style>
