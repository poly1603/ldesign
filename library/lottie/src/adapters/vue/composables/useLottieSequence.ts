/**
 * useLottieSequence Composable
 * Lottie 动画序列播放
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { AnimationSequence } from '../../../core/AnimationSequence'
import type { UseLottieSequenceOptions } from '../types'

/**
 * 使用 Lottie 动画序列
 */
export function useLottieSequence(options: UseLottieSequenceOptions) {
  const sequence = ref<AnimationSequence | null>(null)
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  const isPaused = ref(false)

  // 计算属性
  const totalCount = computed(() => options.items.length)
  const progress = computed(() => 
    totalCount.value > 0 ? (currentIndex.value / totalCount.value) * 100 : 0
  )

  // 初始化序列
  const init = () => {
    sequence.value = new AnimationSequence(
      options.items.map(item => ({
        config: item.config,
        delay: item.delay,
        duration: item.duration
      }))
    )

    // 如果自动播放
    if (options.autoplay) {
      play()
    }
  }

  // 控制方法
  const play = async () => {
    if (!sequence.value) return

    isPlaying.value = true
    isPaused.value = false

    try {
      await sequence.value.play()
      
      // 如果循环，重新播放
      if (options.loop) {
        currentIndex.value = 0
        play()
      } else {
        isPlaying.value = false
      }
    } catch (error) {
      console.error('[useLottieSequence] Play error:', error)
      isPlaying.value = false
    }
  }

  const pause = () => {
    sequence.value?.pause()
    isPaused.value = true
  }

  const resume = () => {
    sequence.value?.resume()
    isPaused.value = false
  }

  const stop = () => {
    sequence.value?.stop()
    isPlaying.value = false
    isPaused.value = false
    currentIndex.value = 0
  }

  const goTo = async (index: number) => {
    if (!sequence.value) return
    if (index < 0 || index >= totalCount.value) return

    try {
      await sequence.value.goTo(index)
      currentIndex.value = index
    } catch (error) {
      console.error('[useLottieSequence] GoTo error:', error)
    }
  }

  const destroy = () => {
    sequence.value?.destroy()
    sequence.value = null
    isPlaying.value = false
    isPaused.value = false
    currentIndex.value = 0
  }

  // 生命周期
  onMounted(() => {
    init()
  })

  onBeforeUnmount(() => {
    destroy()
  })

  return {
    sequence,
    currentIndex,
    totalCount,
    progress,
    isPlaying,
    isPaused,
    play,
    pause,
    resume,
    stop,
    goTo,
    destroy
  }
}


