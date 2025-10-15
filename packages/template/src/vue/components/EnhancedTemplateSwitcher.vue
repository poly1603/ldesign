<script setup lang="ts">
import type { TemplateManager } from '../../runtime/manager'
import { computed, inject, ref, watch } from 'vue'
import { useDevice } from '../composables'

export interface SwitcherConfig {
  // 显示配置
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom'
  style?: 'minimal' | 'card' | 'floating' | 'embedded'
  selectorType?: 'dropdown' | 'buttons' | 'cards'

  // 功能配置
  collapsible?: boolean
  autoHide?: boolean
  autoHideDelay?: number

  // 内容配置
  showTitle?: boolean
  showLabel?: boolean
  showDevice?: boolean
  showInfo?: boolean
  showIcon?: boolean
  title?: string
  label?: string

  // 动画配置
  animation?: 'fade' | 'slide' | 'scale' | 'none'
  animationMode?: 'in-out' | 'out-in' | 'default'
  animationDuration?: number

  // 排序配置
  sortBy?: 'name' | 'displayName' | 'default' | 'custom'
  sortOrder?: 'asc' | 'desc'
}

interface Props {
  category: string
  currentTemplate?: string
  config?: SwitcherConfig
  visible?: boolean
}

interface Emits {
  (e: 'change', templateName: string): void
  (e: 'device-change', device: string): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  config: () => ({}),
})

const emit = defineEmits<Emits>()

// 默认配置
const defaultConfig: Required<SwitcherConfig> = {
  position: 'top-right',
  style: 'floating',
  selectorType: 'dropdown',
  collapsible: true,
  autoHide: false,
  autoHideDelay: 3000,
  showTitle: false,
  showLabel: true,
  showDevice: true,
  showInfo: false,
  showIcon: false,
  title: '模板选择',
  label: '模板:',
  animation: 'fade',
  animationMode: 'out-in',
  animationDuration: 300,
  sortBy: 'default',
  sortOrder: 'asc',
}

// 合并配置
const config = computed(() => ({
  ...defaultConfig,
  ...props.config,
}))

// 状态
const isCollapsed = ref(false)
const isHovered = ref(false)

// 获取管理器和设备
const manager = inject<TemplateManager>('templateManager')
const { device } = useDevice()

// 获取模板列表
const templates = computed(() => {
  if (!manager)
return []
  const currentDevice = device.value
  const results = manager.query({
    category: props.category,
    device: currentDevice,
  })
  return results.map(r => r.metadata)
})

// 排序后的模板列表
const sortedTemplates = computed(() => {
  const list = [...templates.value]
  const { sortBy, sortOrder } = config.value

  list.sort((a, b) => {
    let result = 0

    switch (sortBy) {
      case 'name':
        result = a.name.localeCompare(b.name)
        break
      case 'displayName':
        result = (a.displayName || a.name).localeCompare(b.displayName || b.name)
        break
      case 'default':
        // 默认模板优先
        if (a.isDefault && !b.isDefault)
return -1
        if (!a.isDefault && b.isDefault)
return 1
        result = a.name.localeCompare(b.name)
        break
      default:
        result = 0
    }

    return sortOrder === 'desc' ? -result : result
  })

  return list
})

// 获取默认模板
const defaultTemplate = computed(() => {
  const defaultTpl = templates.value.find(t => t.isDefault)
  return defaultTpl?.name || templates.value[0]?.name || ''
})

// 获取当前选中的模板
const selectedTemplate = computed(() => {
  const name = props.currentTemplate || defaultTemplate.value
  return templates.value.find(t => t.name === name)
})

// 设备标签
const deviceLabel = computed(() => {
  const labels = {
    desktop: '桌面',
    tablet: '平板',
    mobile: '移动',
  }
  return labels[device.value as keyof typeof labels] || device.value
})

// 处理选择变化
function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('change', target.value)
}

// 处理选择
function handleSelect(templateName: string) {
  emit('change', templateName)
}

// 监听设备变化
watch(device, (newDevice) => {
  emit('device-change', newDevice)
})

// 自动隐藏功能
let hideTimeout: NodeJS.Timeout | null = null

function startAutoHide() {
  if (config.value.autoHide && !isHovered.value) {
    hideTimeout = setTimeout(() => {
      isCollapsed.value = true
    }, config.value.autoHideDelay)
  }
}

function cancelAutoHide() {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

watch(isHovered, (hovered) => {
  if (hovered) {
    cancelAutoHide()
    isCollapsed.value = false
  }
 else {
    startAutoHide()
  }
})
</script>

<template>
  <transition :name="config.animation" :mode="config.animationMode">
    <div
      v-if="visible && templates.length > 1"
      class="enhanced-template-switcher"
      :class="[
        `position-${config.position}`,
        `style-${config.style}`,
        { 'is-collapsed': isCollapsed },
      ]"
    >
      <!-- 折叠按钮 -->
      <button
        v-if="config.collapsible"
        class="collapse-btn"
        :aria-label="isCollapsed ? '展开' : '折叠'"
        @click="isCollapsed = !isCollapsed"
      >
        <span class="collapse-icon">{{ isCollapsed ? '◀' : '▶' }}</span>
      </button>

      <!-- 主内容区 -->
      <div v-show="!isCollapsed" class="switcher-content">
        <!-- 标题 -->
        <div v-if="config.showTitle" class="switcher-header">
          <span v-if="config.showIcon" class="switcher-icon">🎨</span>
          <span class="switcher-title">{{ config.title }}</span>
        </div>

        <!-- 当前设备信息 -->
        <div v-if="config.showDevice" class="device-info">
          <span class="device-label">设备:</span>
          <span class="device-value">{{ deviceLabel }}</span>
        </div>

        <!-- 模板选择器 -->
        <div class="template-selector">
          <label v-if="config.showLabel" class="selector-label">
            {{ config.label }}
          </label>

          <!-- 下拉选择 -->
          <select
            v-if="config.selectorType === 'dropdown'"
            :value="currentTemplate || defaultTemplate"
            class="selector-dropdown"
            @change="handleChange"
          >
            <option
              v-for="template in sortedTemplates"
              :key="template.name"
              :value="template.name"
            >
              {{ template.displayName || template.name }}
              {{ template.isDefault ? ' ⭐' : '' }}
            </option>
          </select>

          <!-- 按钮组选择 -->
          <div v-else-if="config.selectorType === 'buttons'" class="selector-buttons">
            <button
              v-for="template in sortedTemplates"
              :key="template.name"
              :class="{ active: (currentTemplate || defaultTemplate) === template.name }"
              class="selector-button"
              @click="handleSelect(template.name)"
            >
              {{ template.displayName || template.name }}
            </button>
          </div>

          <!-- 卡片选择 -->
          <div v-else-if="config.selectorType === 'cards'" class="selector-cards">
            <div
              v-for="template in sortedTemplates"
              :key="template.name"
              :class="{ active: (currentTemplate || defaultTemplate) === template.name }"
              class="selector-card"
              @click="handleSelect(template.name)"
            >
              <div class="card-name">
                {{ template.displayName || template.name }}
              </div>
              <div v-if="template.description" class="card-desc">
                {{ template.description }}
              </div>
              <div v-if="template.tags?.length" class="card-tags">
                <span v-for="tag in template.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 额外信息 -->
        <div v-if="config.showInfo && selectedTemplate" class="template-info">
          <div v-if="selectedTemplate.author" class="info-item">
            <span class="info-label">作者:</span>
            <span class="info-value">{{ selectedTemplate.author }}</span>
          </div>
          <div v-if="selectedTemplate.version" class="info-item">
            <span class="info-label">版本:</span>
            <span class="info-value">{{ selectedTemplate.version }}</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity v-bind('`${config.animationDuration}ms`');
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform v-bind('`${config.animationDuration}ms`');
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(-20px);
}

.scale-enter-active,
.scale-leave-active {
  transition: transform v-bind('`${config.animationDuration}ms`');
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.9);
}

/* 基础样式 */
.enhanced-template-switcher {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
  z-index: 1000;
}

/* 位置样式 */
.position-top-left {
  position: fixed;
  top: 20px;
  left: 20px;
}

.position-top-right {
  position: fixed;
  top: 20px;
  right: 20px;
}

.position-bottom-left {
  position: fixed;
  bottom: 20px;
  left: 20px;
}

.position-bottom-right {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

/* 风格样式 */
.style-minimal {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.style-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 250px;
}

.style-floating {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.style-embedded {
  background: transparent;
  padding: 0;
}

/* 折叠状态 */
.is-collapsed .switcher-content {
  display: none !important;
}

.is-collapsed {
  min-width: auto !important;
  padding: 8px !important;
}

/* 折叠按钮 */
.collapse-btn {
  position: absolute;
  top: 50%;
  right: -20px;
  transform: translateY(-50%);
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1;
}

.collapse-btn:hover {
  background: #f5f5f5;
  transform: translateY(-50%) scale(1.1);
}

.collapse-icon {
  font-size: 10px;
  color: #666;
}

.is-collapsed .collapse-btn {
  right: auto;
  left: 100%;
  margin-left: 4px;
}

.is-collapsed .collapse-icon {
  transform: rotate(180deg);
}

/* 内容区域 */
.switcher-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 头部 */
.switcher-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.switcher-icon {
  font-size: 18px;
}

.switcher-title {
  font-size: 15px;
  color: #1a1a1a;
}

/* 设备信息 */
.device-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 6px;
  font-size: 13px;
}

.device-label {
  color: #666;
  font-weight: 500;
}

.device-value {
  color: #667eea;
  font-weight: 600;
}

/* 选择器区域 */
.template-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selector-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

/* 下拉选择器 */
.selector-dropdown {
  padding: 8px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;
}

.selector-dropdown:hover {
  border-color: #667eea;
}

.selector-dropdown:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 按钮组 */
.selector-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.selector-button {
  padding: 6px 14px;
  background: white;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.selector-button:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.selector-button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 卡片选择 */
.selector-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.selector-card {
  padding: 12px;
  background: white;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.selector-card:hover {
  border-color: #667eea;
  transform: translateX(4px);
}

.selector-card.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.card-name {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
}

/* 模板信息 */
.template-info {
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.info-label {
  color: #999;
}

.info-value {
  color: #666;
}

/* 响应式 */
@media (max-width: 768px) {
  .position-top-left,
  .position-top-right {
    top: 10px;
    left: 10px;
    right: 10px;
    max-width: calc(100vw - 20px);
  }

  .style-card {
    min-width: auto;
  }

  .selector-cards {
    max-height: 200px;
  }
}
</style>
