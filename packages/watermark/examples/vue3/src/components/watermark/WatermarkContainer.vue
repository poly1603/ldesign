<template>
  <div ref="containerRef" class="watermark-container">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { createWatermark, destroyWatermark, type WatermarkInstance, type WatermarkConfig } from '../../mock/watermark'

// Props 定义
interface Props {
  content: string
  enabled?: boolean
  style?: Partial<WatermarkConfig['style']>
  layout?: Partial<WatermarkConfig['layout']>
  renderMode?: 'dom' | 'canvas' | 'svg'
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  renderMode: 'dom',
  zIndex: 1000
})

// Emits 定义
const emit = defineEmits<{
  created: [instance: WatermarkInstance]
  destroyed: []
  error: [error: Error]
}>()

// 模板引用
const containerRef = ref<HTMLElement>()

// 水印实例
const watermarkInstance = ref<WatermarkInstance | null>(null)

// 创建水印
const createWatermarkInstance = async () => {
  if (!containerRef.value || !props.enabled) return
  
  try {
    // 如果已存在实例，先销毁
    if (watermarkInstance.value) {
      await destroyWatermark(watermarkInstance.value)
    }
    
    const config: Partial<WatermarkConfig> = {
      content: props.content,
      renderMode: props.renderMode,
      zIndex: props.zIndex,
      style: {
        fontSize: 16,
        color: 'rgba(0, 0, 0, 0.15)',
        opacity: 1,
        ...props.style
      },
      layout: {
        gapX: 100,
        gapY: 80,
        ...props.layout
      }
    }
    
    watermarkInstance.value = await createWatermark(containerRef.value, config)
    emit('created', watermarkInstance.value)
    
  } catch (error) {
    console.error('Failed to create watermark:', error)
    emit('error', error as Error)
  }
}

// 销毁水印
const destroyWatermarkInstance = async () => {
  if (watermarkInstance.value) {
    try {
      await destroyWatermark(watermarkInstance.value)
      watermarkInstance.value = null
      emit('destroyed')
    } catch (error) {
      console.error('Failed to destroy watermark:', error)
      emit('error', error as Error)
    }
  }
}

// 监听 props 变化
watch(
  () => [props.content, props.enabled, props.style, props.layout, props.renderMode],
  () => {
    if (props.enabled) {
      createWatermarkInstance()
    } else {
      destroyWatermarkInstance()
    }
  },
  { deep: true }
)

// 生命周期
onMounted(() => {
  if (props.enabled) {
    createWatermarkInstance()
  }
})

onUnmounted(() => {
  destroyWatermarkInstance()
})

// 暴露方法给父组件
defineExpose({
  createWatermark: createWatermarkInstance,
  destroyWatermark: destroyWatermarkInstance,
  getInstance: () => watermarkInstance.value
})
</script>

<style lang="less" scoped>
.watermark-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
