<script setup lang="ts">
import type { TemplatePlugin } from '../plugin/createPlugin'
import type { DeviceType, TemplateLoadOptions, TemplateSlots } from '../types'
import { type Component, computed, inject, nextTick, onMounted, onUnmounted, provide, ref, type Ref, type Slot, toRefs, useSlots, watch } from 'vue'
import { useTemplate } from '../composables/useTemplate'
import { useTemplateTheme } from '../composables/useTemplateTheme'
import { getManager } from '../core'
import { getLocale } from '../locales'
import { useTemplatePlugin } from '../plugin/useTemplatePlugin'
import TemplateSelector from './TemplateSelector.vue'
import TemplateSkeleton from './TemplateSkeleton.vue'

/**
 * 组件属性
 */
const props = withDefaults(
  defineProps<{
    /** 模板分类 */
    category: string
    /** 设备类型（可选，不传则自动检测） */
    device?: DeviceType
    /** 模板名称（可选，不传则自动选择默认） */
    name?: string
    /** 是否自动检测设备（当不传device时默认开启） */
    autoDetect?: boolean
    /** 是否自动加载默认模板（当不传name时默认开启） */
    autoLoadDefault?: boolean
    /** 传递给模板组件的属性 */
    componentProps?: Record<string, unknown>
    /** 加载选项 */
    loadOptions?: TemplateLoadOptions
    /** 是否显示模板选择器 */
    showSelector?: boolean
    /** 插槽内容配置 */
    slots?: TemplateSlots
    /** v-model 双向绑定数据 */
    modelValue?: any
    /** 是否显示骨架屏 */
    skeleton?: boolean | 'auto'
    /** 骨架屏类型 */
    skeletonType?: 'default' | 'card' | 'list' | 'article' | 'form'
    /** 自动保存 */
    autoSave?: boolean
    /** 自动保存延迟（毫秒） */
    autoSaveDelay?: number
    /** 重试次数 */
    retryTimes?: number
    /** 重试延迟（毫秒） */
    retryDelay?: number
    /** 降级组件 */
    fallback?: Component
    /** 主题 */
    theme?: string
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
    modelValue: undefined,
    skeleton: 'auto',
    skeletonType: 'default',
    autoSave: false,
    autoSaveDelay: 1000,
    retryTimes: 3,
    retryDelay: 1000,
    fallback: undefined,
    theme: undefined,
  }
)

/**
 * 事件
 */
const emit = defineEmits<{
  load: [component: Component]
  error: [error: Error]
  reload: []
  templateChange: [templateName: string]
  deviceChange: [device: string]
  'update:modelValue': [value: any]
  save: [value: any]
  mounted: [component: Component]
  // 转发模板组件的所有事件
  [key: string]: unknown[]
}>()

const manager = getManager()

// 获取语言配置
const plugin = useTemplatePlugin()
const locale = plugin?.currentLocale || inject<Ref<string>>('locale', ref('zh-CN'))
const messages = computed(() => {
  const localeValue = typeof locale.value === 'string' ? locale.value : 'zh-CN'
  return getLocale(localeValue)
})

// AbortController 用于取消异步操作
const abortController = ref<AbortController | null>(null)

// 自动保存
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

// v-model 支持
const modelData = ref(props.modelValue)
const modelWatcher = watch(() => props.modelValue, (newVal) => {
  modelData.value = newVal
})
// Move scheduleAutoSave before usage
const scheduleAutoSave = () => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    if (!abortController.value?.signal.aborted) {
      emit('save', modelData.value)
    }
  }, props.autoSaveDelay)
}

const dataWatcher = watch(modelData, (newVal) => {
  emit('update:modelValue', newVal)
  if (props.autoSave) {
    scheduleAutoSave()
  }
}, { deep: true })

// 自动保存
// moved above to avoid use-before-define

// 主题支持
const { setTheme, currentTheme } = props.theme ? useTemplateTheme() : { setTheme: () => {}, currentTheme: ref(null) }
if (props.theme) {
  watch(() => props.theme, (newTheme) => {
    if (newTheme) setTheme(newTheme)
  }, { immediate: true })
}

// 重试机制
const retryCount = ref(0)

// 决定是否自动检测和自动加载
const shouldAutoDetect = computed(() => props.autoDetect ?? !props.device)
const shouldAutoLoadDefault = computed(() => props.autoLoadDefault ?? !props.name)

// 设备类型（自动检测或手动指定）
const currentDevice = ref<DeviceType>(props.device as DeviceType || 'desktop')
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
const loadDefaultTemplate = async (dev: DeviceType | string) => {
  if (!shouldAutoLoadDefault.value) return
  
  try {
    // 优先使用注入的插件，如果没有则从 window 获取
    let templatePlugin = plugin
    if (!templatePlugin && typeof window !== 'undefined') {
      templatePlugin = (window as unknown as { __TEMPLATE_PLUGIN__?: TemplatePlugin }).__TEMPLATE_PLUGIN__ || null
    }
    
    if (templatePlugin?.getPreferredTemplate) {
      // 使用插件的偏好管理
      const preferred = await templatePlugin.getPreferredTemplate(props.category, dev as string)
      if (preferred?.name) {
        currentName.value = preferred.name
        emit('templateChange', preferred.name)
        return
      }
    }
    
    // 没有插件或偏好，使用默认
    const defaultTemplate = await manager.getDefaultTemplate(props.category, dev as DeviceType)
    if (defaultTemplate?.name) {
      currentName.value = defaultTemplate.name
      emit('templateChange', defaultTemplate.name)
    }
  } catch (e) {
    console.error(messages.value.messages.loadError, e)
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
        emit('deviceChange', newDevice)
        loadDefaultTemplate(newDevice)
      }
    }
  }, 150)
}

// 监听外部传入的 device 和 name 变化
watch(() => props.device, (newDevice) => {
  if (newDevice && newDevice !== currentDevice.value) {
    currentDevice.value = newDevice as DeviceType
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
    // 创建AbortController
    abortController.value = new AbortController()
    
    try {
      // 初始化管理器
      await manager.initialize()
      
      // 检查是否已被取消
      if (abortController.value.signal.aborted) return
      
      // 自动检测设备
      if (shouldAutoDetect.value) {
        currentDevice.value = detectDevice()
        emit('deviceChange', currentDevice.value)
      }
      
      // 自动加载默认模板
      if (shouldAutoLoadDefault.value) {
        await loadDefaultTemplate(currentDevice.value)
      }
      
      isInitialized.value = true
      
      // 监听窗口变化 - 使用passive优化性能
      if (shouldAutoDetect.value) {
        window.addEventListener('resize', handleResize, { passive: true })
      }
    } catch (error) {
      if (!abortController.value.signal.aborted) {
        console.error('Initialization failed:', error)
      }
    }
  }
})

onUnmounted(() => {
  // 取消所有异步操作
  abortController.value?.abort()
  
  // 清理事件监听器
  if (shouldAutoDetect.value) {
    window.removeEventListener('resize', handleResize)
  }
  
  // 清理所有定时器
  if (resizeTimer) {
    clearTimeout(resizeTimer)
    resizeTimer = null
  }
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  }
  
  // 停止监听器
  modelWatcher()
  dataWatcher()
})

/**
 * 使用模板
 */
const { category } = toRefs(props)
const { component, loading, error, reload: originalReload } = useTemplate(
  category,
  currentDevice,
  currentName,
  props.loadOptions
)

// Define shouldShowSkeleton after loading is available
const shouldShowSkeleton = computed(() => {
  if (props.skeleton === true) return true
  if (props.skeleton === 'auto') return loading.value
  return false
})

// 增强的重载函数（带重试机制）
const reload = async () => {
  if (retryCount.value >= props.retryTimes) {
    retryCount.value = 0
  }
  
  try {
    await originalReload()
    retryCount.value = 0
  } catch (err) {
    if (retryCount.value < props.retryTimes) {
      retryCount.value++
      setTimeout(() => reload(), props.retryDelay * 2**(retryCount.value - 1))
    } else {
      throw err
    }
  }
}

/**
 * 处理重新加载
 */
const handleReload = async () => {
  emit('reload')
  await reload()
}

// 组件挂载事件
watch(component, (newComponent) => {
  if (newComponent) {
    nextTick(() => {
      emit('mounted', newComponent)
    })
  }
})

// 为子组件提供数据模型
if (props.modelValue !== undefined) {
  provide('templateModel', modelData)
}

// 组合 componentProps 和 v-model
const combinedProps = computed(() => {
  const baseProps = { ...props.componentProps }
  if (props.modelValue !== undefined) {
    baseProps.modelValue = modelData.value
    baseProps['onUpdate:modelValue'] = (val: any) => {
      modelData.value = val
    }
  }
  return baseProps
})

/**
 * 处理模板选择
 */
const handleTemplateSelect = (templateName: string) => {
  // 更新当前模板
  currentName.value = templateName
  emit('templateChange', templateName)
  
  // 保存用户偏好
  let templatePlugin = plugin
  if (!templatePlugin && typeof window !== 'undefined') {
    templatePlugin = (window as unknown as { __TEMPLATE_PLUGIN__?: TemplatePlugin }).__TEMPLATE_PLUGIN__ || null
  }
  
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
  const result: Record<string, Slot> = {}
  
  // 传递所有非保留插槽
  for (const slotName in slots) {
    if (!reserved.includes(slotName)) {
      const s = slots[slotName]
      if (s) result[slotName] = s
    }
  }
  
  return result
})
</script>

<template>
  <div class="ldesign-template-renderer" :data-theme="currentTheme">
    <!-- 骨架屏 -->
    <div v-if="shouldShowSkeleton && !component" class="template-skeleton-wrapper">
      <slot name="skeleton">
        <TemplateSkeleton 
          :type="skeletonType"
          animation="wave"
        />
      </slot>
    </div>
    
    <!-- 加载中（不使用骨架屏时） -->
    <div v-else-if="loading && !shouldShowSkeleton" class="template-loading">
      <slot name="loading">
        <div class="loading-spinner">
          {{ messages.messages.loading }}
        </div>
      </slot>
    </div>

    <!-- 错误 -->
    <div v-else-if="error && !fallback" class="template-error">
      <slot name="error" :error="error" :retry="handleReload" :retry-count="retryCount">
        <div class="error-message">
          <p>{{ messages.messages.loadError }}</p>
          <p class="error-detail">
            {{ error.message }}
          </p>
          <p v-if="retryCount > 0" class="retry-info">
            重试次数: {{ retryCount }}/{{ retryTimes }}
          </p>
          <button :disabled="retryCount >= retryTimes" @click="handleReload">
            {{ retryCount >= retryTimes ? '不能重试' : messages.actions.loadMore }}
          </button>
        </div>
      </slot>
    </div>
    
    <!-- 降级组件 -->
    <component
      :is="fallback"
      v-else-if="error && fallback"
      :error="error"
      @retry="handleReload"
    />

    <!-- 模板组件 -->
    <component
      :is="component"
      v-else-if="component"
      v-bind="combinedProps"
      v-on="$attrs"
    >
      <!-- 传递所有插槽（除了保留插槽） -->
      <template v-for="(slot, slotName) in availableSlots" :key="slotName" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>
    </component>

    <!-- 空状态 -->
    <div v-else class="template-empty">
      <slot name="empty">
        <p>{{ messages.messages.noTemplates }}</p>
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
