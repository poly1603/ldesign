<template>
  <div ref="containerRef" class="advanced-watermark">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { createWatermark, destroyWatermark, type WatermarkInstance } from '../../mock/watermark'

// Props 定义
interface Props {
  content: string
  theme?: 'default' | 'security' | 'brand' | 'warning'
  density?: 'low' | 'medium' | 'high'
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'default',
  density: 'medium',
  enabled: true
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

// 主题配置
const themeConfigs = {
  default: {
    style: {
      fontSize: 16,
      color: 'rgba(0, 0, 0, 0.15)',
      opacity: 1
    }
  },
  security: {
    style: {
      fontSize: 18,
      color: '#F44336',
      opacity: 0.2,
      fontWeight: 'bold'
    },
    security: {
      level: 'high' as const,
      mutationObserver: true,
      styleProtection: true
    }
  },
  brand: {
    style: {
      fontSize: 20,
      color: '#2196F3',
      opacity: 0.25,
      fontWeight: '500'
    }
  },
  warning: {
    style: {
      fontSize: 16,
      color: '#FF9800',
      opacity: 0.3,
      textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
    }
  }
}

// 密度配置
const densityConfigs = {
  low: {
    layout: {
      gapX: 200,
      gapY: 150
    }
  },
  medium: {
    layout: {
      gapX: 120,
      gapY: 100
    }
  },
  high: {
    layout: {
      gapX: 80,
      gapY: 60
    }
  }
}

// 计算最终配置
const watermarkConfig = computed(() => {
  const themeConfig = themeConfigs[props.theme]
  const densityConfig = densityConfigs[props.density]
  
  return {
    content: props.content,
    ...themeConfig,
    layout: {
      ...densityConfig.layout
    }
  }
})

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
    console.error('Failed to create advanced watermark:', error)
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
      console.error('Failed to destroy advanced watermark:', error)
      emit('error', error as Error)
    }
  }
}

// 监听配置变化
watch(
  () => [props.content, props.theme, props.density, props.enabled],
  () => {
    if (props.enabled) {
      createWatermarkInstance()
    } else {
      destroyWatermarkInstance()
    }
  }
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
  getInstance: () => watermarkInstance.value,
  getConfig: () => watermarkConfig.value
})
</script>

<style lang="less" scoped>
.advanced-watermark {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
