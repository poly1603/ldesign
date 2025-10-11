import { ref, onMounted, onBeforeUnmount, watch, computed, type Ref } from 'vue'
import { lottieManager } from '../core/LottieManager'
import type { LottieConfig, ILottieInstance, AnimationState, PerformanceMetrics } from '../types'

/**
 * Vue Composable - useLottie
 */
export function useLottie(config: Ref<LottieConfig> | LottieConfig) {
  const instance = ref<ILottieInstance | null>(null)
  const state = ref<AnimationState>('idle')
  const isLoaded = ref(false)
  const isPlaying = ref(false)
  const error = ref<Error | null>(null)
  const metrics = ref<PerformanceMetrics | null>(null)

  // 初始化实例
  const init = async () => {
    try {
      const cfg = typeof config === 'object' && 'value' in config ? config.value : config
      instance.value = lottieManager.create(cfg)

      // 监听状态变化
      instance.value.on('stateChange', (newState) => {
        state.value = newState
        isPlaying.value = newState === 'playing'
        isLoaded.value = newState === 'loaded' || newState === 'playing' || newState === 'paused'
      })

      // 监听错误
      instance.value.on('data_failed', (err) => {
        error.value = err
      })

      // 监听性能指标
      instance.value.on('performanceWarning', (m) => {
        metrics.value = m
      })

      // 加载动画
      await instance.value.load()
    } catch (err) {
      error.value = err as Error
      console.error('[useLottie] Failed to initialize:', err)
    }
  }

  // 播放
  const play = () => {
    instance.value?.play()
  }

  // 暂停
  const pause = () => {
    instance.value?.pause()
  }

  // 停止
  const stop = () => {
    instance.value?.stop()
  }

  // 重置
  const reset = () => {
    instance.value?.reset()
  }

  // 销毁
  const destroy = () => {
    if (instance.value) {
      lottieManager.destroy(instance.value.id)
      instance.value = null
    }
  }

  // 设置速度
  const setSpeed = (speed: number) => {
    instance.value?.setSpeed(speed)
  }

  // 跳转到指定帧
  const goToAndStop = (frame: number, isFrame = true) => {
    instance.value?.goToAndStop(frame, isFrame)
  }

  // 跳转并播放
  const goToAndPlay = (frame: number, isFrame = true) => {
    instance.value?.goToAndPlay(frame, isFrame)
  }

  // 生命周期
  onMounted(() => {
    init()
  })

  onBeforeUnmount(() => {
    destroy()
  })

  // 监听配置变化
  if (typeof config === 'object' && 'value' in config) {
    watch(config, () => {
      destroy()
      init()
    }, { deep: true })
  }

  return {
    instance: computed(() => instance.value),
    state: computed(() => state.value),
    isLoaded: computed(() => isLoaded.value),
    isPlaying: computed(() => isPlaying.value),
    error: computed(() => error.value),
    metrics: computed(() => metrics.value),
    play,
    pause,
    stop,
    reset,
    destroy,
    setSpeed,
    goToAndStop,
    goToAndPlay,
  }
}

/**
 * Vue 指令 - v-lottie
 */
export const vLottie = {
  mounted(el: HTMLElement, binding: any) {
    const config: LottieConfig = {
      container: el,
      ...(typeof binding.value === 'string' ? { path: binding.value } : binding.value),
    }

    const instance = lottieManager.create(config)
    ;(el as any).__lottie__ = instance

    instance.load().catch(err => {
      console.error('[v-lottie] Failed to load:', err)
    })
  },

  updated(el: HTMLElement, binding: any) {
    const instance = (el as any).__lottie__ as ILottieInstance
    if (!instance) return

    // 如果配置发生变化，重新创建实例
    if (JSON.stringify(binding.value) !== JSON.stringify(binding.oldValue)) {
      lottieManager.destroy(instance.id)
      vLottie.mounted(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    const instance = (el as any).__lottie__ as ILottieInstance
    if (instance) {
      lottieManager.destroy(instance.id)
      delete (el as any).__lottie__
    }
  },
}

/**
 * Vue 插件
 */
export default {
  install(app: any) {
    app.directive('lottie', vLottie)

    // 提供全局 lottie manager
    app.provide('lottieManager', lottieManager)

    // 全局属性
    app.config.globalProperties.$lottie = {
      manager: lottieManager,
      create: (config: LottieConfig) => lottieManager.create(config),
    }
  },
}
