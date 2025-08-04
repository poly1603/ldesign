<template>
  <div 
    ref="containerRef" 
    class="watermark-container"
    :class="{
      'watermark-loading': loading,
      'watermark-error': !!error
    }"
  >
    <slot />
    
    <!-- 错误提示 -->
    <div 
      v-if="error && showError" 
      class="watermark-error-message"
      @click="clearError"
    >
      {{ error.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useWatermark } from '../composables/useWatermark'
import type { WatermarkComponentProps, WatermarkComponentEvents, WatermarkProviderContext } from '../types'
import type { WatermarkConfig } from '../../types'

// 组件属性
interface Props extends WatermarkComponentProps {
  /** 是否显示错误信息 */
  showError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  immediate: true,
  security: true,
  responsive: true,
  showError: true
})

// 组件事件
const emit = defineEmits<WatermarkComponentEvents>()

// 模板引用
const containerRef = ref<HTMLElement>()

// 注入Provider上下文
const providerContext = inject<WatermarkProviderContext>('watermarkProvider', null)

// 合并配置
const mergedConfig = computed((): Partial<WatermarkConfig> => {
  const baseConfig: Partial<WatermarkConfig> = {
    content: props.content,
    style: props.style,
    layout: props.layout,
    animation: props.animation,
    ...props.config
  }

  // 如果有Provider上下文，合并全局配置
  if (providerContext) {
    return providerContext.mergeConfig(baseConfig)
  }

  return baseConfig
})

// 安全配置
const securityEnabled = computed(() => {
  if (props.security !== undefined) {
    return props.security
  }
  return providerContext?.globalSecurity.value ?? true
})

// 响应式配置
const responsiveEnabled = computed(() => {
  if (props.responsive !== undefined) {
    return props.responsive
  }
  return providerContext?.globalResponsive.value ?? true
})

// 使用水印Hook
const {
  instance,
  loading,
  error,
  isCreated,
  create,
  update,
  destroy,
  pause,
  resume,
  clearError: clearWatermarkError
} = useWatermark(containerRef, {
  immediate: props.immediate,
  enableSecurity: securityEnabled.value,
  enableResponsive: responsiveEnabled.value
})

// 清除错误
const clearError = () => {
  clearWatermarkError()
  emit('error', error.value!)
}

// 监听配置变化
watch(
  mergedConfig,
  async (newConfig) => {
    if (!containerRef.value) return

    try {
      if (isCreated.value) {
        await update(newConfig)
        if (instance.value) {
          emit('updated', instance.value)
        }
      } else if (props.immediate) {
        await create(newConfig)
        if (instance.value) {
          emit('created', instance.value)
        }
      }
    } catch (err) {
      emit('error', err as Error)
    }
  },
  { deep: true }
)

// 监听实例变化
watch(
  instance,
  (newInstance, oldInstance) => {
    if (newInstance && !oldInstance) {
      emit('created', newInstance)
    } else if (!newInstance && oldInstance) {
      emit('destroyed', oldInstance.id)
    }
  }
)

// 监听错误
watch(
  error,
  (newError) => {
    if (newError) {
      emit('error', newError)
    }
  }
)

// 组件挂载后创建水印
onMounted(async () => {
  if (props.immediate && containerRef.value) {
    try {
      await create(mergedConfig.value)
    } catch (err) {
      emit('error', err as Error)
    }
  }
})

// 暴露方法给父组件
defineExpose({
  instance,
  loading,
  error,
  isCreated,
  create,
  update,
  destroy,
  pause,
  resume,
  clearError
})
</script>

<style scoped>
.watermark-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.watermark-loading {
  pointer-events: none;
}

.watermark-error {
  border: 1px solid #ff4d4f;
  background-color: #fff2f0;
}

.watermark-error-message {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  z-index: 9999;
}

.watermark-error-message:hover {
  background-color: #d9363e;
}
</style>