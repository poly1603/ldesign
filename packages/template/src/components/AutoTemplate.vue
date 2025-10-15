<template>
  <TemplateRenderer
    v-if="ready && currentDevice && currentTemplate"
    :category="category"
    :device="currentDevice"
    :name="currentTemplate"
    :show-selector="showSelector"
    v-bind="$attrs"
    @template-change="handleTemplateChange"
  />
  
  <div v-else-if="error" class="auto-template-error">
    <p>模板系统加载失败</p>
    <p>{{ error.message }}</p>
  </div>
  
  <div v-else class="auto-template-loading">
    <div class="spinner"></div>
    <p>初始化模板系统...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getManager } from '../core/manager'
import type { DeviceType } from '../types'
import TemplateRenderer from './TemplateRenderer.vue'

/**
 * 组件属性
 */
interface Props {
  /** 模板分类 */
  category: string
  /** 初始设备类型（可选，默认自动检测） */
  initialDevice?: DeviceType
  /** 初始模板名称（可选，默认使用该设备的默认模板） */
  initialTemplate?: string
  /** 是否显示模板选择器 */
  showSelector?: boolean
  /** 是否启用响应式设备切换 */
  responsive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSelector: true,
  responsive: true,
})

/**
 * 事件
 */
const emit = defineEmits<{
  ready: []
  'device-change': [device: DeviceType]
  'template-change': [template: string]
}>()

// 状态
const ready = ref(false)
const error = ref<Error | null>(null)
const currentDevice = ref<DeviceType | null>(null)
const currentTemplate = ref<string | null>(null)

/**
 * 根据窗口宽度检测设备类型
 */
function detectDevice(): DeviceType {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * 加载设备的默认模板
 */
async function loadDefaultTemplate(device: DeviceType) {
  const manager = getManager()
  
  // 如果指定了初始模板，优先使用
  if (props.initialTemplate && !currentTemplate.value) {
    currentTemplate.value = props.initialTemplate
    return
  }
  
  // 获取默认模板
  const defaultTemplate = await manager.getDefaultTemplate(props.category, device)
  
  if (defaultTemplate) {
    currentTemplate.value = defaultTemplate.name
    console.log(`[AutoTemplate] 加载 ${device} 设备的默认模板: ${defaultTemplate.displayName}`)
  } else {
    // 如果没有默认模板，使用第一个可用模板
    const templates = await manager.queryTemplates({
      category: props.category,
      device,
    })
    
    if (templates.length > 0) {
      currentTemplate.value = templates[0].name
      console.log(`[AutoTemplate] 加载 ${device} 设备的第一个模板: ${templates[0].displayName}`)
    } else {
      throw new Error(`未找到 ${props.category}/${device} 的任何模板`)
    }
  }
}

/**
 * 切换设备
 */
async function switchDevice(device: DeviceType) {
  if (device === currentDevice.value) return
  
  const oldDevice = currentDevice.value
  currentDevice.value = device
  
  try {
    await loadDefaultTemplate(device)
    emit('device-change', device)
    console.log(`[AutoTemplate] 设备切换: ${oldDevice} → ${device}`)
  } catch (err) {
    error.value = err as Error
    console.error('[AutoTemplate] 切换设备失败:', err)
  }
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
  if (!props.responsive) return
  
  const newDevice = detectDevice()
  if (newDevice !== currentDevice.value) {
    switchDevice(newDevice)
  }
}

/**
 * 处理模板切换
 */
function handleTemplateChange(templateName: string) {
  currentTemplate.value = templateName
  emit('template-change', templateName)
  console.log(`[AutoTemplate] 模板切换: ${templateName}`)
}

/**
 * 初始化
 */
async function initialize() {
  try {
    // 1. 初始化模板系统
    const manager = getManager()
    const scanResult = await manager.initialize()
    console.log(`[AutoTemplate] 扫描到 ${scanResult.total} 个模板`)
    
    // 2. 检测或使用初始设备
    const device = props.initialDevice || detectDevice()
    currentDevice.value = device
    
    // 3. 加载默认模板
    await loadDefaultTemplate(device)
    
    // 4. 监听窗口大小变化（如果启用响应式）
    if (props.responsive) {
      window.addEventListener('resize', handleResize)
    }
    
    // 5. 标记准备完成
    ready.value = true
    emit('ready')
    console.log('[AutoTemplate] 初始化完成')
  } catch (err) {
    error.value = err as Error
    console.error('[AutoTemplate] 初始化失败:', err)
  }
}

// 生命周期
onMounted(() => {
  initialize()
})

onUnmounted(() => {
  if (props.responsive) {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style scoped>
.auto-template-loading,
.auto-template-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px;
  text-align: center;
}

.auto-template-loading {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auto-template-loading p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.auto-template-error {
  background: #f5f5f5;
  color: #f56c6c;
}

.auto-template-error p {
  margin: 8px 0;
}

.auto-template-error p:first-child {
  font-size: 20px;
  font-weight: 600;
}

.auto-template-error p:last-child {
  font-size: 14px;
  opacity: 0.8;
}
</style>
