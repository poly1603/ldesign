/**
 * useLottie Composable
 * Vue 3 Composition API for Lottie animations
 */

import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'
import { lottieManager } from '../../../core/LottieManager'
import type { LottieConfig, ILottieInstance } from '../../../types'
import type { UseLottieReturn } from '../types'

/**
 * 使用 Lottie 动画
 */
export function useLottie(config: LottieConfig | Ref<LottieConfig>): UseLottieReturn {
  const containerRef = ref<HTMLElement | null>(null)
  const instance = ref<ILottieInstance | null>(null)
  const state = ref<ILottieInstance['state']>('idle')

  // 计算属性
  const isPlaying = computed(() => state.value === 'playing')
  const isLoaded = computed(() => state.value !== 'idle' && state.value !== 'loading')

  // 获取配置（支持 ref 和普通对象）
  const getConfig = (): LottieConfig => {
    return 'value' in config ? config.value : config
  }

  // 初始化动画
  const init = async () => {
    if (!containerRef.value) {
      console.warn('[useLottie] Container ref not ready')
      return
    }

    // 销毁旧实例
    if (instance.value) {
      instance.value.destroy()
    }

    try {
      // 创建新实例
      const currentConfig = getConfig()
      instance.value = lottieManager.create({
        ...currentConfig,
        container: containerRef.value
      })

      // 监听状态变化
      instance.value.on('stateChange', (newState) => {
        state.value = newState
      })

      // 加载动画
      await instance.value.load()
    } catch (error) {
      console.error('[useLottie] Failed to initialize:', error)
      state.value = 'error'
    }
  }

  // 控制方法
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

  const destroy = () => {
    if (instance.value) {
      instance.value.destroy()
      instance.value = null
      state.value = 'idle'
    }
  }

  // 生命周期
  onMounted(() => {
    init()
  })

  onBeforeUnmount(() => {
    destroy()
  })

  // 监听配置变化（如果是 ref）
  if ('value' in config) {
    watch(config, () => {
      init()
    }, { deep: true })
  }

  return {
    containerRef,
    instance,
    state,
    isPlaying,
    isLoaded,
    play,
    pause,
    stop,
    reset,
    setSpeed,
    setDirection,
    goToFrame,
    destroy
  }
}


