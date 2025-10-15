<template>
  <div v-if="loading" class="template-loading">
    <slot name="loading">Loading...</slot>
  </div>
  <div v-else-if="error" class="template-error">
    <slot name="error" :error="error">
      <p>Error: {{ error.message }}</p>
    </slot>
  </div>
  <component v-else-if="component" :is="component" v-bind="props" />
</template>

<script setup lang="ts">
import { watch, computed, type PropType } from 'vue'
import { useTemplate } from '../composables'
import type { DeviceType } from '../../types'

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

// 使用 useTemplate hook
const {
  component,
  loading,
  error,
  metadata: currentTemplate,
  device: currentDevice,
} = useTemplate({
  category: props.category,
  device: props.responsive ? undefined : props.device,
  name: props.templateName,
  autoDeviceSwitch: props.responsive,
})

// 监听模板变化
watch(currentTemplate, (newTemplate) => {
  if (newTemplate) {
    emit('template-change', newTemplate.name)
  }
})

// 监听设备变化
watch(currentDevice, (newDevice) => {
  if (newDevice) {
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
