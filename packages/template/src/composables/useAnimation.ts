/**
 * 模板动画组合式函数
 */

import type { Ref} from 'vue';
import type {
  AnimationConfig,
  AnimationState,
  GestureConfig,
  ParallaxConfig,
  ScrollAnimationConfig} from '../core/animation';
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import {
  Animation,
  animationController,
  GestureController,
  parallaxController
} from '../core/animation'

/**
 * 使用动画
 */
export function useAnimation(
  elementRef: Ref<HTMLElement | null>,
  config: AnimationConfig | Ref<AnimationConfig>
) {
  const animation = ref<Animation | null>(null)
  const state = ref<AnimationState>({
    playing: false,
    paused: false,
    progress: 0,
    iteration: 0,
    finished: false
  })
  
  const animationId = `animation-${Date.now()}-${Math.random()}`
  
  // 获取配置
  const getConfig = () => {
    return 'value' in config ? config.value : config
  }
  
  // 初始化动画
  const init = () => {
    if (!elementRef.value) return
    
    const currentConfig = getConfig()
    animation.value = animationController.create(
      animationId,
      elementRef.value,
      currentConfig
    )
    
    // 同步状态
    watchEffect(() => {
      if (animation.value) {
        Object.assign(state.value, animation.value.getState())
      }
    })
  }
  
  // 播放
  const play = () => {
    animationController.play(animationId)
  }
  
  // 暂停
  const pause = () => {
    animationController.pause(animationId)
  }
  
  // 停止
  const stop = () => {
    animationController.stop(animationId)
  }
  
  // 重置
  const reset = () => {
    animationController.reset(animationId)
  }
  
  // 反转
  const reverse = () => {
    animation.value?.reverse()
  }
  
  // 设置速度
  const setSpeed = (rate: number) => {
    animation.value?.setPlaybackRate(rate)
  }
  
  // 跳转
  const seek = (time: number) => {
    animation.value?.seek(time)
  }
  
  // 挂载时初始化
  onMounted(() => {
    init()
  })
  
  // 卸载时清理
  onUnmounted(() => {
    animationController.destroy(animationId)
  })
  
  return {
    animation,
    state,
    play,
    pause,
    stop,
    reset,
    reverse,
    setSpeed,
    seek
  }
}

/**
 * 使用视差效果
 */
export function useParallax(
  elementRef: Ref<HTMLElement | null>,
  config: ParallaxConfig = {}
) {
  const isActive = ref(false)
  
  // 添加视差
  const enable = () => {
    if (!elementRef.value) return
    
    parallaxController.add(elementRef.value, config)
    isActive.value = true
  }
  
  // 移除视差
  const disable = () => {
    if (!elementRef.value) return
    
    parallaxController.remove(elementRef.value)
    isActive.value = false
  }
  
  // 更新配置
  const updateConfig = (newConfig: Partial<ParallaxConfig>) => {
    if (!elementRef.value) return
    
    disable()
    Object.assign(config, newConfig)
    enable()
  }
  
  // 挂载时启用
  onMounted(() => {
    enable()
  })
  
  // 卸载时禁用
  onUnmounted(() => {
    disable()
  })
  
  return {
    isActive,
    enable,
    disable,
    updateConfig
  }
}

/**
 * 使用手势
 */
export function useGesture(
  elementRef: Ref<HTMLElement | null>,
  config: GestureConfig = {}
) {
  const controller = ref<GestureController | null>(null)
  const isDragging = ref(false)
  const position = ref({ x: 0, y: 0 })
  const velocity = ref({ x: 0, y: 0 })
  const swipeDirection = ref<'up' | 'down' | 'left' | 'right' | null>(null)
  
  // 初始化
  const init = () => {
    if (!elementRef.value) return
    
    controller.value = new GestureController(elementRef.value, config)
    
    // 监听滑动事件
    elementRef.value.addEventListener('swipe', (e: Event) => {
      const customEvent = e as CustomEvent
      swipeDirection.value = customEvent.detail.direction
      
    // 自动重置
    const timer = setTimeout(() => {
      swipeDirection.value = null
    }, 500)
    
    // 确保清理定时器
    onUnmounted(() => clearTimeout(timer))
    })
  }
  
  // 销毁
  const destroy = () => {
    controller.value?.destroy()
    controller.value = null
  }
  
  // 挂载时初始化
  onMounted(() => {
    init()
  })
  
  // 卸载时销毁
  onUnmounted(() => {
    destroy()
  })
  
  return {
    controller,
    isDragging,
    position,
    velocity,
    swipeDirection
  }
}

/**
 * 使用滚动动画
 */
export function useScrollAnimation(
  elementRef: Ref<HTMLElement | null>,
  config: ScrollAnimationConfig = {}
) {
  const isInView = ref(false)
  const progress = ref(0)
  const hasEntered = ref(false)
  const observer = ref<IntersectionObserver | null>(null)
  
  // 计算触发位置
  const getTriggerPosition = () => {
    switch (config.trigger) {
      case 'top':
        return 0
      case 'bottom':
        return 1
      case 'center':
      default:
        return 0.5
    }
  }
  
  // 初始化
  const init = () => {
    if (!elementRef.value) return
    
    const threshold = getTriggerPosition()
    const rootMargin = `${config.offset || 0}px`
    
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const wasInView = isInView.value
          isInView.value = entry.isIntersecting
          
          // 计算进度
          if (entry.isIntersecting) {
            const { top, height } = entry.boundingClientRect
            const windowHeight = window.innerHeight
            const elementProgress = 1 - (top / (windowHeight - height))
            progress.value = Math.min(Math.max(0, elementProgress), 1)
            
            if (config.onProgress) {
              config.onProgress(progress.value)
            }
          }
          
          // 处理进入/离开动画
          if (!wasInView && isInView.value) {
            // 进入视口
            if (!hasEntered.value || !config.once) {
              hasEntered.value = true
              if (config.enter && elementRef.value) {
                const animation = new Animation(elementRef.value, config.enter)
                animation.play()
              }
            }
          } else if (wasInView && !isInView.value) {
            // 离开视口
            if (config.leave && elementRef.value) {
              const animation = new Animation(elementRef.value, config.leave)
              animation.play()
            }
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )
    
    observer.value.observe(elementRef.value)
  }
  
  // 重置
  const reset = () => {
    hasEntered.value = false
    progress.value = 0
  }
  
  // 销毁
  const destroy = () => {
    observer.value?.disconnect()
    observer.value = null
  }
  
  // 挂载时初始化
  onMounted(() => {
    init()
  })
  
  // 卸载时销毁
  onUnmounted(() => {
    destroy()
  })
  
  return {
    isInView,
    progress,
    hasEntered,
    reset
  }
}

/**
 * 使用动画组
 */
export function useAnimationGroup(
  animations: Array<{
    element: Ref<HTMLElement | null>
    config: AnimationConfig
  }>
) {
  const animationInstances = ref<Animation[]>([])
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const staggerTimers: ReturnType<typeof setTimeout>[] = []
  
  // 初始化所有动画
  const init = () => {
    animations.forEach(({ element, config }, index) => {
      if (element.value) {
        const id = `group-animation-${index}-${Date.now()}`
        const animation = animationController.create(id, element.value, config)
        animationInstances.value.push(animation)
      }
    })
  }
  
  // 播放所有
  const playAll = (stagger: number = 0) => {
    // 清理之前的定时器
    staggerTimers.forEach(timer => clearTimeout(timer))
    staggerTimers.length = 0
    
    animationInstances.value.forEach((animation, index) => {
      const timer = setTimeout(() => {
        animation.play()
      }, index * stagger)
      staggerTimers.push(timer)
    })
    isPlaying.value = true
    isPaused.value = false
  }
  
  // 暂停所有
  const pauseAll = () => {
    animationInstances.value.forEach(animation => {
      animation.pause()
    })
    isPaused.value = true
  }
  
  // 停止所有
  const stopAll = () => {
    animationInstances.value.forEach(animation => {
      animation.stop()
    })
    isPlaying.value = false
    isPaused.value = false
  }
  
  // 重置所有
  const resetAll = () => {
    animationInstances.value.forEach(animation => {
      animation.reset()
    })
    isPlaying.value = false
    isPaused.value = false
  }
  
  // 销毁所有
  const destroyAll = () => {
    // 清理定时器
    staggerTimers.forEach(timer => clearTimeout(timer))
    staggerTimers.length = 0
    
    animationInstances.value.forEach(animation => {
      animation.destroy()
    })
    animationInstances.value = []
  }
  
  // 挂载时初始化
  onMounted(() => {
    init()
  })
  
  // 卸载时销毁
  onUnmounted(() => {
    destroyAll()
  })
  
  return {
    animationInstances,
    isPlaying,
    isPaused,
    playAll,
    pauseAll,
    stopAll,
    resetAll
  }
}

/**
 * 使用时间线动画
 */
export function useTimeline() {
  interface TimelineItem {
    element: HTMLElement
    animation: Animation
    startTime: number
    duration: number
  }
  
  const timeline = ref<TimelineItem[]>([])
  const currentTime = ref(0)
  const duration = ref(0)
  const isPlaying = ref(false)
  const rafId = ref<number | null>(null)
  const startTimestamp = ref(0)
  const MAX_TIMELINE_ITEMS = 100 // 限制timeline项目数量
  
  // 添加动画到时间线
  const add = (
    element: HTMLElement,
    config: AnimationConfig,
    startTime: number = 0
  ) => {
    const id = `timeline-${Date.now()}-${Math.random()}`
    const animation = animationController.create(id, element, {
      ...config,
      autoPlay: false
    })
    
    const item: TimelineItem = {
      element,
      animation,
      startTime,
      duration: config.duration || 300
    }
    
    timeline.value.push(item)
    
    // 限制timeline数量，防止内存泄漏
    if (timeline.value.length > MAX_TIMELINE_ITEMS) {
      const removed = timeline.value.shift()
      if (removed) {
        removed.animation.destroy()
      }
    }
    
    // 更新总时长
    duration.value = Math.max(
      duration.value,
      startTime + item.duration
    )
    
    return animation
  }
  
  // 播放时间线
  const play = () => {
    if (isPlaying.value) return
    
    isPlaying.value = true
    startTimestamp.value = performance.now() - currentTime.value
    
    const animate = (timestamp: number) => {
      if (!isPlaying.value) return
      
      currentTime.value = timestamp - startTimestamp.value
      
      // 更新每个动画的状态
      timeline.value.forEach(item => {
        const localTime = currentTime.value - item.startTime
        
        if (localTime >= 0 && localTime <= item.duration) {
          // 在时间范围内，更新动画
          item.animation.seek(localTime)
        } else if (localTime > item.duration) {
          // 动画已完成
          item.animation.seek(item.duration)
        } else {
          // 动画尚未开始
          item.animation.seek(0)
        }
      })
      
      if (currentTime.value < duration.value) {
        rafId.value = requestAnimationFrame(animate)
      } else {
        // 时间线完成
        isPlaying.value = false
        currentTime.value = duration.value
      }
    }
    
    rafId.value = requestAnimationFrame(animate)
  }
  
  // 暂停时间线
  const pause = () => {
    isPlaying.value = false
    if (rafId.value) {
      cancelAnimationFrame(rafId.value)
      rafId.value = null
    }
  }
  
  // 停止时间线
  const stop = () => {
    pause()
    currentTime.value = 0
    timeline.value.forEach(item => {
      item.animation.reset()
    })
  }
  
  // 跳转到指定时间
  const seek = (time: number) => {
    currentTime.value = Math.min(Math.max(0, time), duration.value)
    
    timeline.value.forEach(item => {
      const localTime = currentTime.value - item.startTime
      
      if (localTime >= 0 && localTime <= item.duration) {
        item.animation.seek(localTime)
      } else if (localTime > item.duration) {
        item.animation.seek(item.duration)
      } else {
        item.animation.seek(0)
      }
    })
  }
  
  // 清空时间线
  const clear = () => {
    stop()
    timeline.value.forEach(item => {
      item.animation.destroy()
    })
    timeline.value = []
    duration.value = 0
  }
  
  // 获取进度
  const progress = computed(() => {
    return duration.value > 0 ? currentTime.value / duration.value : 0
  })
  
  // 卸载时清理
  onUnmounted(() => {
    clear()
  })
  
  return {
    timeline,
    currentTime,
    duration,
    progress,
    isPlaying,
    add,
    play,
    pause,
    stop,
    seek,
    clear
  }
}