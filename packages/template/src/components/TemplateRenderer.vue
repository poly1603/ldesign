<template>
  <div class="ldesign-template-renderer">
    <!-- 加载中 -->
    <div v-if="loading" class="template-loading">
      <slot name="loading">
        <div class="loading-spinner">加载中...</div>
      </slot>
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="template-error">
      <slot name="error" :error="error">
        <div class="error-message">
          <p>模板加载失败</p>
          <p class="error-detail">{{ error.message }}</p>
          <button @click="handleReload">重新加载</button>
        </div>
      </slot>
    </div>

    <!-- 模板组件 -->
    <component
      v-else-if="component"
      :is="component"
      v-bind="componentProps"
      v-on="$attrs"
    >
      <!-- 传递所有插槽（除了保留插槽） -->
      <template v-for="(slot, name) in availableSlots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps" />
      </template>
    </component>

    <!-- 空状态 -->
    <div v-else class="template-empty">
      <slot name="empty">
        <p>暂无模板</p>
      </slot>
    </div>

    <!-- 模板选择器 -->
    <TemplateSelector
      v-if="showSelector && component"
      :category="category"
      :device="currentDevice"
      :current-template="currentName"
      @select="handleTemplateSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, ref, watch, onMounted, onUnmounted, useSlots, type Component, type VNode } from 'vue'
import { useTemplate } from '../composables/useTemplate'
import type { TemplateLoadOptions, DeviceType, TemplateSlots } from '../types'
import { getManager } from '../core'
import TemplateSelector from './TemplateSelector.vue'

/**
 * 组件属性
 */
const props = withDefaults(
  defineProps<{
    /** 模板分类 */
    category: string
    /** 设备类型（可选，不传则自动检测） */
    device?: string
    /** 模板名称（可选，不传则自动选择默认） */
    name?: string
    /** 是否自动检测设备（当不传device时默认开启） */
    autoDetect?: boolean
    /** 是否自动加载默认模板（当不传name时默认开启） */
    autoLoadDefault?: boolean
    /** 传递给模板组件的属性 */
    componentProps?: Record<string, any>
    /** 加载选项 */
    loadOptions?: TemplateLoadOptions
    /** 是否显示模板选择器 */
    showSelector?: boolean
    /** 插槽内容配置 */
    slots?: TemplateSlots
  }>(),
  {
    device: undefined,
    name: undefined,
    autoDetect: undefined, // 会在下面根据条件设置
    autoLoadDefault: undefined, // 会在下面根据条件设置
    componentProps: () => ({}),
    loadOptions: undefined,
    showSelector: true,
    slots: undefined,
  }
)

/**
 * 事件
 */
const emit = defineEmits<{
  load: [component: any]
  error: [error: Error]
  reload: []
  'template-change': [templateName: string]
  'device-change': [device: string]
  // 转发模板组件的所有事件
  [key: string]: any[]
}>()

const manager = getManager()

// 决定是否自动检测和自动加载
const shouldAutoDetect = computed(() => props.autoDetect ?? !props.device)
const shouldAutoLoadDefault = computed(() => props.autoLoadDefault ?? !props.name)

// 设备类型（自动检测或手动指定）
const currentDevice = ref<string>(props.device || 'desktop')
// 模板名称（自动选择或手动指定）
const currentName = ref<string>(props.name || 'default')

// 检测设备类型
const detectDevice = (): DeviceType => {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// 加载默认模板（或用户偏好模板）
const loadDefaultTemplate = async (dev: string) => {
  if (!shouldAutoLoadDefault.value) return
  
  try {
    // 尝试从插件获取用户偏好
    const templatePlugin = (window as any).__TEMPLATE_PLUGIN__
    
    if (templatePlugin?.getPreferredTemplate) {
      // 使用插件的偏好管理
      const preferred = await templatePlugin.getPreferredTemplate(props.category, dev)
      if (preferred?.name) {
        currentName.value = preferred.name
        emit('template-change', preferred.name)
        return
      }
    }
    
    // 没有插件或偏好，使用默认
    const defaultTemplate = await manager.getDefaultTemplate(props.category, dev as DeviceType)
    if (defaultTemplate?.name) {
      currentName.value = defaultTemplate.name
      emit('template-change', defaultTemplate.name)
    }
  } catch (e) {
    console.error('加载模板失败:', e)
  }
}

// 窗口大小变化处理（防抖）
let resizeTimer: ReturnType<typeof setTimeout> | null = null
const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    if (shouldAutoDetect.value) {
      const newDevice = detectDevice()
      if (currentDevice.value !== newDevice) {
        currentDevice.value = newDevice
        emit('device-change', newDevice)
        loadDefaultTemplate(newDevice)
      }
    }
  }, 150)
}

// 监听外部传入的 device 和 name 变化
watch(() => props.device, (newDevice) => {
  if (newDevice && newDevice !== currentDevice.value) {
    currentDevice.value = newDevice
    if (shouldAutoLoadDefault.value) {
      loadDefaultTemplate(newDevice)
    }
  }
})

watch(() => props.name, (newName) => {
  if (newName && newName !== currentName.value) {
    currentName.value = newName
  }
})

// 生命周期
const isInitialized = ref(false)

onMounted(async () => {
  if (!isInitialized.value) {
    // 初始化管理器
    await manager.initialize()
    
    // 自动检测设备
    if (shouldAutoDetect.value) {
      currentDevice.value = detectDevice()
      emit('device-change', currentDevice.value)
    }
    
    // 自动加载默认模板
    if (shouldAutoLoadDefault.value) {
      await loadDefaultTemplate(currentDevice.value)
    }
    
    isInitialized.value = true
    
    // 监听窗口变化
    if (shouldAutoDetect.value) {
      window.addEventListener('resize', handleResize)
    }
  }
})

onUnmounted(() => {
  if (shouldAutoDetect.value) {
    window.removeEventListener('resize', handleResize)
    if (resizeTimer) clearTimeout(resizeTimer)
  }
})

/**
 * 使用模板
 */
const { category } = toRefs(props)
const { component, loading, error, load, reload } = useTemplate(
  category,
  currentDevice as any,
  currentName as any,
  props.loadOptions
)

/**
 * 处理重新加载
 */
const handleReload = async () => {
  emit('reload')
  await reload()
}

/**
 * 处理事件转发
 */
const handleEvent = (eventName: string, ...args: any[]) => {
  emit(eventName as any, ...args)
}

/**
 * 事件名称列表（用于 v-on）
 */
const eventName = computed(() => {
  // Vue 3 会自动处理事件转发
  return ''
})

/**
 * 处理模板选择
 */
const handleTemplateSelect = (templateName: string) => {
  // 更新当前模板
  currentName.value = templateName
  emit('template-change', templateName)
  
  // 保存用户偏好
  const templatePlugin = (window as any).__TEMPLATE_PLUGIN__
  if (templatePlugin?.savePreference) {
    templatePlugin.savePreference(props.category, currentDevice.value, templateName)
  }
}

/**
 * 获取当前组件的插槽
 */
const slots = useSlots()

/**
 * 计算可用的插槽（排除保留插槽）
 */
const availableSlots = computed(() => {
  const reserved = ['loading', 'error', 'empty']
  const result: Record<string, any> = {}
  
  // 传递所有非保留插槽
  for (const slotName in slots) {
    if (!reserved.includes(slotName)) {
      result[slotName] = slots[slotName]
    }
  }
  
  return result
})
</script>

<style scoped>
.ldesign-template-renderer {
  width: 100%;
  height: 100%;
}

.template-loading,
.template-error,
.template-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 20px;
}

.loading-spinner {
  font-size: 14px;
  color: #666;
}

.error-message {
  text-align: center;
  color: #f56c6c;
}

.error-detail {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.error-message button {
  margin-top: 12px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-message button:hover {
  background: #66b1ff;
}

.template-empty {
  color: #999;
  font-size: 14px;
}
</style>
