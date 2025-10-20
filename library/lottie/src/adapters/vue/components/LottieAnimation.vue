<template>
  <div 
    ref="containerRef" 
    class="lottie-animation"
    :style="containerStyle"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { lottieManager } from '../../../core/LottieManager'
import type { ILottieInstance } from '../../../types'
import type { LottieAnimationProps } from '../types'

// Props
const props = withDefaults(defineProps<LottieAnimationProps>(), {
  loop: true,
  autoplay: true,
  renderer: 'svg',
  speed: 1,
  width: '100%',
  height: 'auto'
})

// Emits
const emit = defineEmits<{
  ready: []
  complete: []
  loopComplete: []
  enterFrame: [frame: number]
  error: [error: Error]
}>()

// Refs
const containerRef = ref<HTMLElement | null>(null)
const instance = ref<ILottieInstance | null>(null)

// Computed
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

// Methods
const init = async () => {
  if (!containerRef.value) return

  try {
    // 销毁旧实例
    if (instance.value) {
      instance.value.destroy()
    }

    // 创建新实例
    instance.value = lottieManager.create({
      container: containerRef.value,
      path: props.path,
      animationData: props.animationData,
      loop: props.loop,
      autoplay: props.autoplay,
      renderer: props.renderer,
      speed: props.speed,
      ...props.config,
      events: {
        data_ready: () => emit('ready'),
        complete: () => emit('complete'),
        loopComplete: () => emit('loopComplete'),
        enterFrame: (e: any) => emit('enterFrame', e.currentTime),
        data_failed: (error: Error) => emit('error', error),
        ...props.config?.events
      }
    })

    await instance.value.load()
  } catch (error) {
    emit('error', error as Error)
  }
}

// 公开方法
const play = () => instance.value?.play()
const pause = () => instance.value?.pause()
const stop = () => instance.value?.stop()
const reset = () => instance.value?.reset()
const setSpeed = (speed: number) => instance.value?.setSpeed(speed)
const setDirection = (direction: 1 | -1) => instance.value?.setDirection(direction)
const goToFrame = (frame: number, play = false) => {
  if (play) {
    instance.value?.goToAndPlay(frame, true)
  } else {
    instance.value?.goToAndStop(frame, true)
  }
}

// 导出方法供父组件使用
defineExpose({
  instance,
  play,
  pause,
  stop,
  reset,
  setSpeed,
  setDirection,
  goToFrame
})

// 生命周期
onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  instance.value?.destroy()
})

// 监听路径变化
watch(() => props.path, () => {
  init()
})

// 监听数据变化
watch(() => props.animationData, () => {
  init()
})
</script>

<style scoped>
.lottie-animation {
  display: inline-block;
  overflow: hidden;
}
</style>


