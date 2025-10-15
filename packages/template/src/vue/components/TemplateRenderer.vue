<script setup lang="ts">
import type { DeviceType } from '../../types'
import { computed, watch } from 'vue'
import { useTemplate } from '../composables'

interface Props {
  category: string
  device?: DeviceType
  templateName?: string
  responsive?: boolean
  props?: Record<string, any>
}

interface Emits {
  (e: 'template-change', templateName: string): void
  (e: 'device-change', device: DeviceType): void
  (e: 'load-error', error: Error): void
}

const props = withDefaults(defineProps<Props>(), {
  device: undefined,
  templateName: undefined,
  responsive: false,
  props: () => ({}),
})

const emit = defineEmits<Emits>()

// 模板属性
const templateProps = computed(() => props.props || {})

// 包装组件，确保正确渲染
const renderComponent = computed(() => {
  if (!component.value)
return null
  // 如果组件是对象且没有 render 或 template，可能需要特殊处理
  return component.value
})

// 使用 useTemplate hook
const {
  component,
  loading,
  error,
  metadata: currentTemplate,
  device: currentDevice,
  switchTemplate,
} = useTemplate({
  category: props.category,
  device: props.responsive ? undefined : props.device,
  name: props.templateName,
  autoDeviceSwitch: props.responsive,
})

// 记录当前实际加载的模板名称
let currentLoadedTemplate: string | undefined = undefined

// 监听 templateName 变化
watch(() => props.templateName, async (newName, oldName) => {
  // 只在有明确的模板名称且与当前加载的不同时切换
  if (newName && newName !== oldName && newName !== currentLoadedTemplate) {
    console.log('[TemplateRenderer] Switching to template:', newName)
    currentLoadedTemplate = newName
    await switchTemplate(newName)
  }
}, { immediate: false })

// 监听组件变化
watch(component, (newComp) => {
  console.log('[TemplateRenderer] Component changed:', newComp)
})

// 监听模板变化
watch(currentTemplate, (newTemplate) => {
  if (newTemplate) {
    currentLoadedTemplate = newTemplate.name
    // 只在模板名称真正变化时发出事件
    if (newTemplate.name !== props.templateName) {
      emit('template-change', newTemplate.name)
    }
  }
})

// 记录上次发出的设备类型
let lastEmittedDevice: DeviceType | null = null

// 监听设备变化
watch(currentDevice, (newDevice) => {
  if (newDevice && newDevice !== lastEmittedDevice) {
    lastEmittedDevice = newDevice
    emit('device-change', newDevice)
  }
})

// 监听错误
watch(error, (newError) => {
  if (newError) {
    emit('load-error', newError)
  }
})
</script>

<template>
  <div v-if="loading" class="template-loading">
    <slot name="loading">
      Loading...
    </slot>
  </div>
  <div v-else-if="error" class="template-error">
    <slot name="error" :error="error">
      <p>Error: {{ error.message }}</p>
    </slot>
  </div>
  <component :is="renderComponent" v-else-if="renderComponent" v-bind="templateProps">
    <!-- 传递所有插槽到子组件 -->
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </component>
</template>

<style scoped>
.template-loading,
.template-error {
  padding: 16px;
  text-align: center;
}

.template-error {
  color: #f56c6c;
}
</style>
