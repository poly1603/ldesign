<script setup lang="ts">
import type { DeviceType, TemplateMetadata } from '../../types'
import { computed, onMounted, ref, watch } from 'vue'
import { useTemplateScanner } from '../composables/useTemplateScanner'

interface Props {
  /** 是否显示选择器 */
  visible?: boolean
  /** 当前选中的模板名称 */
  currentTemplate?: string
  /** 限制类别 */
  category?: string
  /** 限制设备 */
  device?: DeviceType
  /** 是否显示预览 */
  showPreview?: boolean
  /** 是否可搜索 */
  searchable?: boolean
}

interface Emits {
  /** 选择模板事件 */
  (e: 'select', templateName: string, template: TemplateMetadata): void
  /** 关闭事件 */
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  currentTemplate: '',
  category: '',
  device: undefined,
  showPreview: true,
  searchable: true,
})

const emit = defineEmits<Emits>()

// 使用扫描器
const {
  templates,
  loading,
  error,
  categories,
  scan: loadTemplates,
  searchTemplates,
} = useTemplateScanner({ autoScan: false })

// 搜索和过滤状态
const searchQuery = ref('')
const selectedCategory = ref(props.category || '')
const selectedDevice = ref<DeviceType | ''>(props.device || '')

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  let result = templates.value

  // 应用搜索
  if (searchQuery.value) {
    result = searchTemplates(searchQuery.value)
  }

  // 按类别过滤
  if (selectedCategory.value) {
    result = result.filter(t => t.category === selectedCategory.value)
  }

  // 按设备过滤
  if (selectedDevice.value) {
    result = result.filter(t => t.device === selectedDevice.value)
  }

  return result
})

// 设备标签映射
function deviceLabel(device: DeviceType): string {
  const labels: Record<DeviceType, string> = {
    desktop: '桌面',
    tablet: '平板',
    mobile: '移动',
  }
  return labels[device] || device
}

// 处理选择
function handleSelect(template: TemplateMetadata) {
  emit('select', template.name, template)
}

// 处理关闭
function handleClose() {
  emit('close')
}

// 监听显示状态变化，加载模板
watch(() => props.visible, (newVal) => {
  if (newVal && templates.value.length === 0) {
    loadTemplates()
  }
})

// 监听 category 和 device props 变化
watch(() => props.category, (newVal) => {
  selectedCategory.value = newVal || ''
})

watch(() => props.device, (newVal) => {
  selectedDevice.value = newVal || ''
})

// 初始加载
onMounted(() => {
  if (props.visible) {
    loadTemplates()
  }
})
</script>

<template>
  <div v-if="visible" class="ldesign-template-selector" @click.self="handleClose">
    <div class="selector-modal">
      <div class="selector-header">
        <h3>选择模板</h3>
        <button class="close-btn" aria-label="关闭" @click="handleClose">
          ×
        </button>
      </div>

      <!-- 搜索栏 -->
      <div v-if="searchable" class="selector-search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索模板..."
          class="search-input"
        >
      </div>

      <!-- 过滤器 -->
      <div class="selector-filters">
        <div class="filter-group">
          <label>类别:</label>
          <select v-model="selectedCategory" class="filter-select">
            <option value="">
              全部
            </option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>设备:</label>
          <select v-model="selectedDevice" class="filter-select">
            <option value="">
              全部
            </option>
            <option value="desktop">
              桌面
            </option>
            <option value="tablet">
              平板
            </option>
            <option value="mobile">
              移动
            </option>
          </select>
        </div>
      </div>

      <!-- 模板列表 -->
      <div class="selector-body">
        <div v-if="loading" class="selector-loading">
          <div class="loading-spinner" />
          <p>加载中...</p>
        </div>

        <div v-else-if="error" class="selector-error">
          <p>{{ error.message }}</p>
          <button class="retry-btn" @click="loadTemplates">
            重试
          </button>
        </div>

        <div v-else-if="filteredTemplates.length === 0" class="selector-empty">
          <p>没有找到匹配的模板</p>
        </div>

        <div v-else class="template-grid">
          <div
            v-for="template in filteredTemplates"
            :key="`${template.category}-${template.device}-${template.name}`"
            class="template-card"
            :class="{
              active: template.name === currentTemplate,
              default: template.isDefault,
            }"
            @click="handleSelect(template)"
          >
            <div class="card-header">
              <h4 class="card-title">
                {{ template.displayName || template.name }}
              </h4>
              <span v-if="template.isDefault" class="default-badge">默认</span>
            </div>

            <p class="card-description">
              {{ template.description || '暂无描述' }}
            </p>

            <div class="card-meta">
              <span class="meta-item">
                <span class="meta-label">类别:</span>
                <span class="meta-value">{{ template.category }}</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">设备:</span>
                <span class="meta-value">{{ deviceLabel(template.device) }}</span>
              </span>
              <span v-if="template.version" class="meta-item">
                <span class="meta-label">版本:</span>
                <span class="meta-value">{{ template.version }}</span>
              </span>
            </div>

            <div v-if="template.tags && template.tags.length > 0" class="card-tags">
              <span
                v-for="tag in template.tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>

            <div v-if="template.author" class="card-author">
              作者: {{ template.author }}
            </div>

            <button
              class="select-btn"
              :class="{ active: template.name === currentTemplate }"
              @click.stop="handleSelect(template)"
            >
              {{ template.name === currentTemplate ? '已选择' : '选择' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ldesign-template-selector {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.selector-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.selector-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.selector-search {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.selector-filters {
  display: flex;
  gap: 15px;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
}

.selector-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.selector-loading,
.selector-error,
.selector-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.selector-error p {
  color: #dc3545;
  margin-bottom: 15px;
}

.retry-btn {
  padding: 8px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #0056b3;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.template-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  transform: translateY(-2px);
}

.template-card.active {
  border-color: #28a745;
  background: #f0f8f0;
}

.template-card.default {
  border-color: #ffc107;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  color: #333;
  flex: 1;
}

.default-badge {
  background: #ffc107;
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.card-description {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 12px 0;
  flex: 1;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 12px;
}

.meta-item {
  display: flex;
  gap: 6px;
}

.meta-label {
  color: #999;
  font-weight: 500;
}

.meta-value {
  color: #666;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.tag {
  background: #e9ecef;
  color: #495057;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.card-author {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.select-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  margin-top: auto;
}

.select-btn:hover {
  background: #0056b3;
}

.select-btn.active {
  background: #28a745;
}

.select-btn.active:hover {
  background: #1e7e34;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .template-grid {
    grid-template-columns: 1fr;
  }

  .selector-filters {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }
}
</style>
