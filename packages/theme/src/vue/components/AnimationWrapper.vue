<template>
  <div
    class="ldesign-animation-wrapper"
    :class="props.class"
    :style="props.style"
    ref="wrapperRef"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * @file AnimationWrapper 组件
 * @description 动画包装器组件，为子元素提供动画效果
 */

import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { AnimationWrapperProps } from '../types'
import { useAnimations } from '../composables/useAnimations'

// 组件属性
const props = withDefaults(defineProps<AnimationWrapperProps>(), {
  autoplay: false,
  trigger: 'load'
})

// 组件引用
const wrapperRef = ref<HTMLElement>()

// 使用动画
const { playAnimation, stopAnimation, pauseAnimation, resumeAnimation } = useAnimations()

// 动画状态
const isPlaying = ref(false)
const isPaused = ref(false)

// 播放动画
const play = async () => {
  if (!wrapperRef.value || !props.animation || isPlaying.value) return
  
  isPlaying.value = true
  isPaused.value = false
  
  try {
    await playAnimation(wrapperRef.value, props.animation)
  } catch (error) {
    console.error('Animation failed:', error)
  } finally {
    isPlaying.value = false
  }
}

// 停止动画
const stop = () => {
  if (!wrapperRef.value || !isPlaying.value) return
  
  stopAnimation(wrapperRef.value)
  isPlaying.value = false
  isPaused.value = false
}

// 暂停动画
const pause = () => {
  if (!wrapperRef.value || !isPlaying.value || isPaused.value) return
  
  pauseAnimation(wrapperRef.value)
  isPaused.value = true
}

// 恢复动画
const resume = () => {
  if (!wrapperRef.value || !isPlaying.value || !isPaused.value) return
  
  resumeAnimation(wrapperRef.value)
  isPaused.value = false
}

// 事件处理
const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    play()
  }
}

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    stop()
  }
}

const handleClick = () => {
  if (props.trigger === 'click') {
    if (isPlaying.value) {
      stop()
    } else {
      play()
    }
  }
}

// 滚动事件处理
const handleScroll = () => {
  if (props.trigger !== 'scroll' || !wrapperRef.value) return
  
  const rect = wrapperRef.value.getBoundingClientRect()
  const isVisible = rect.top < window.innerHeight && rect.bottom > 0
  
  if (isVisible && !isPlaying.value) {
    play()
  } else if (!isVisible && isPlaying.value) {
    stop()
  }
}

// 监听动画配置变化
watch(() => props.animation, () => {
  if (isPlaying.value) {
    stop()
  }
  if (props.autoplay) {
    play()
  }
})

// 生命周期
onMounted(() => {
  // 根据触发条件设置事件监听
  if (props.trigger === 'scroll') {
    window.addEventListener('scroll', handleScroll, { passive: true })
    // 初始检查
    handleScroll()
  }
  
  // 自动播放
  if (props.autoplay && props.trigger === 'load') {
    play()
  }
})

onUnmounted(() => {
  if (props.trigger === 'scroll') {
    window.removeEventListener('scroll', handleScroll)
  }
  
  // 停止所有动画
  stop()
})

// 暴露方法给父组件
defineExpose({
  play,
  stop,
  pause,
  resume,
  isPlaying,
  isPaused
})
</script>

<style scoped>
.ldesign-animation-wrapper {
  display: inline-block;
  transition: all 0.3s ease;
}

.ldesign-animation-wrapper[data-trigger="hover"] {
  cursor: pointer;
}

.ldesign-animation-wrapper[data-trigger="click"] {
  cursor: pointer;
}
</style>
