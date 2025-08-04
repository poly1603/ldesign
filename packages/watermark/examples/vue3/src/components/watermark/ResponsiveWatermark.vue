<template>
  <div ref="containerRef" class="responsive-watermark">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { createWatermark, destroyWatermark, type WatermarkInstance } from '../../mock/watermark'

// Props 定义
interface Props {
  content: string
  autoResize?: boolean
  breakpoint?: 'mobile' | 'tablet' | 'desktop'
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoResize: true,
  breakpoint: 'desktop',
  enabled: true
})

// Emits 定义
const emit = defineEmits<{
  created: [instance: WatermarkInstance]
  destroyed: []
  error: [error: Error]
  breakpointChanged: [breakpoint: string]
}>()

// 模板引用
const containerRef = ref<HTMLElement>()

// 水印实例
const watermarkInstance = ref<WatermarkInstance | null>(null)

// 响应式状态
const containerWidth = ref(0)
const containerHeight = ref(0)

// 断点配置
const breakpointConfigs = {
  mobile: {
    maxWidth: 768,
    style: {
      fontSize: 12,
      color: 'rgba(156, 39, 176, 0.2)',
      opacity: 1
    },
    layout: {
      gapX: 60,
      gapY: 40
    }
  },
  tablet: {
    maxWidth: 1024,
    style: {
      fontSize: 14,
      color: 'rgba(33, 150, 243, 0.2)',
      opacity: 1
    },
    layout: {
      gapX: 80,
      gapY: 60
    }
  },
  desktop: {
    maxWidth: Infinity,
    style: {
      fontSize: 16,
      color: 'rgba(76, 175, 80, 0.2)',
      opacity: 1
    },
    layout: {
      gapX: 120,
      gapY: 80
    }
  }
}

// 当前断点
const currentBreakpoint = computed(() => {
  if (containerWidth.value <= 768) return 'mobile'
  if (containerWidth.value <= 1024) return 'tablet'
  return 'desktop'
})

// 水印配置
const watermarkConfig = computed(() => {
  const config = breakpointConfigs[props.breakpoint]
  
  // 如果启用自动调整，使用当前断点配置
  const finalConfig = props.autoResize 
    ? breakpointConfigs[currentBreakpoint.value]
    : config
  
  return {
    content: props.content,
    ...finalConfig,
    responsive: {
      enabled: props.autoResize,
      autoResize: props.autoResize,
      breakpoints: props.autoResize ? {
        mobile: {
          ...breakpointConfigs.mobile
        },
        tablet: {
          ...breakpointConfigs.tablet
        }
      } : undefined
    }
  }
})

// 更新容器尺寸
const updateContainerSize = () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    containerWidth.value = rect.width
    containerHeight.value = rect.height
  }
}

// 创建水印
const createWatermarkInstance = async () => {
  if (!containerRef.value || !props.enabled) return
  
  try {
    // 如果已存在实例，先销毁
    if (watermarkInstance.value) {
      await destroyWatermark(watermarkInstance.value)
    }
    
    watermarkInstance.value = await createWatermark(containerRef.value, watermarkConfig.value)
    emit('created', watermarkInstance.value)
    
  } catch (error) {
    console.error('Failed to create responsive watermark:', error)
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
      console.error('Failed to destroy responsive watermark:', error)
      emit('error', error as Error)
    }
  }
}

// ResizeObserver
let resizeObserver: ResizeObserver | null = null

// 监听配置变化
watch(
  () => [props.content, props.breakpoint, props.enabled],
  () => {
    if (props.enabled) {
      createWatermarkInstance()
    } else {
      destroyWatermarkInstance()
    }
  }
)

// 监听断点变化
watch(currentBreakpoint, (newBreakpoint, oldBreakpoint) => {
  if (newBreakpoint !== oldBreakpoint && props.autoResize) {
    emit('breakpointChanged', newBreakpoint)
    createWatermarkInstance()
  }
})

// 生命周期
onMounted(() => {
  // 初始化容器尺寸
  updateContainerSize()
  
  // 设置 ResizeObserver
  if (props.autoResize && containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        containerWidth.value = width
        containerHeight.value = height
      }
    })
    
    resizeObserver.observe(containerRef.value)
  }
  
  // 创建水印
  if (props.enabled) {
    createWatermarkInstance()
  }
})

onUnmounted(() => {
  // 清理 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  
  // 销毁水印
  destroyWatermarkInstance()
})

// 暴露方法给父组件
defineExpose({
  createWatermark: createWatermarkInstance,
  destroyWatermark: destroyWatermarkInstance,
  getInstance: () => watermarkInstance.value,
  getConfig: () => watermarkConfig.value,
  getCurrentBreakpoint: () => currentBreakpoint.value,
  getContainerSize: () => ({ width: containerWidth.value, height: containerHeight.value })
})
</script>

<style lang="less" scoped>
.responsive-watermark {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
