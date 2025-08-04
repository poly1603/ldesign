<template>
  <div ref="containerRef" class="animated-watermark">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { createWatermark, destroyWatermark, type WatermarkInstance } from '../../mock/watermark'

// Props 定义
interface Props {
  content: string
  animation?: 'fade' | 'slide' | 'rotate' | 'pulse' | 'none'
  duration?: number
  playing?: boolean
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  animation: 'fade',
  duration: 2000,
  playing: true,
  enabled: true
})

// Emits 定义
const emit = defineEmits<{
  created: [instance: WatermarkInstance]
  destroyed: []
  error: [error: Error]
  animationStart: []
  animationEnd: []
}>()

// 模板引用
const containerRef = ref<HTMLElement>()

// 水印实例
const watermarkInstance = ref<WatermarkInstance | null>(null)

// 动画配置
const animationConfigs = {
  fade: {
    type: 'fade' as const,
    duration: props.duration,
    easing: 'ease-in-out' as const,
    iteration: 'infinite' as const
  },
  slide: {
    type: 'slide' as const,
    duration: props.duration,
    easing: 'ease-in-out' as const,
    iteration: 'infinite' as const
  },
  rotate: {
    type: 'rotate' as const,
    duration: props.duration,
    easing: 'linear' as const,
    iteration: 'infinite' as const
  },
  pulse: {
    type: 'scale' as const,
    duration: props.duration,
    easing: 'ease-in-out' as const,
    iteration: 'infinite' as const
  },
  none: {
    type: 'none' as const,
    duration: 0,
    easing: 'ease' as const,
    iteration: 1 as const
  }
}

// 水印配置
const watermarkConfig = computed(() => {
  const animationConfig = animationConfigs[props.animation]
  
  return {
    content: props.content,
    style: {
      fontSize: 18,
      color: '#FF6B6B',
      opacity: 0.3
    },
    layout: {
      gapX: 100,
      gapY: 70
    },
    animation: props.playing ? {
      ...animationConfig,
      duration: props.duration
    } : {
      type: 'none' as const,
      duration: 0,
      easing: 'ease' as const,
      iteration: 1 as const
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
    
    // 如果有动画且正在播放，触发动画开始事件
    if (props.animation !== 'none' && props.playing) {
      emit('animationStart')
    }
    
  } catch (error) {
    console.error('Failed to create animated watermark:', error)
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
      console.error('Failed to destroy animated watermark:', error)
      emit('error', error as Error)
    }
  }
}

// 播放动画
const playAnimation = async () => {
  if (watermarkInstance.value && props.animation !== 'none') {
    // 重新创建水印以应用动画
    await createWatermarkInstance()
    emit('animationStart')
  }
}

// 暂停动画
const pauseAnimation = async () => {
  if (watermarkInstance.value) {
    // 重新创建无动画的水印
    const staticConfig = {
      ...watermarkConfig.value,
      animation: {
        type: 'none' as const,
        duration: 0,
        easing: 'ease' as const,
        iteration: 1 as const
      }
    }
    
    await destroyWatermark(watermarkInstance.value)
    watermarkInstance.value = await createWatermark(containerRef.value!, staticConfig)
    emit('animationEnd')
  }
}

// 监听配置变化
watch(
  () => [props.content, props.animation, props.duration, props.playing, props.enabled],
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
  playAnimation,
  pauseAnimation,
  getInstance: () => watermarkInstance.value,
  getConfig: () => watermarkConfig.value
})
</script>

<style lang="less" scoped>
.animated-watermark {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
