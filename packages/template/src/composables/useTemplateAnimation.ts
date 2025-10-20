import { computed, onBeforeUnmount, onMounted, ref, type Ref, watch } from 'vue'

/**
 * 动画缓动函数类型
 */
export type EasingFunction = (t: number) => number

/**
 * 预设缓动函数
 */
export const EASING_FUNCTIONS: Record<string, EasingFunction> = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
  easeInElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : -(2**(10 * t - 10)) * Math.sin((t * 10 - 10.75) * c4)
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : 2**(-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },
  easeInBack: (t: number) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return c3 * t * t * t - c1 * t * t
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * (t - 1)**3 + c1 * (t - 1)**2
  },
  easeInBounce: (t: number) => 1 - EASING_FUNCTIONS.easeOutBounce(1 - t),
  easeOutBounce: (t: number) => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  },
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  duration?: number // 动画持续时间（毫秒）
  delay?: number // 延迟时间（毫秒）
  easing?: string | EasingFunction // 缓动函数
  loop?: boolean | number // 是否循环或循环次数
  yoyo?: boolean // 是否往返播放
  onStart?: () => void
  onUpdate?: (progress: number) => void
  onComplete?: () => void
}

/**
 * 视差滚动配置
 */
export interface ParallaxConfig {
  speed?: number // 滚动速度倍率 (0-1 慢速, >1 快速)
  direction?: 'vertical' | 'horizontal' | 'both'
  reverse?: boolean // 反向滚动
  offset?: number // 偏移量
  threshold?: [number, number] // 可见区域阈值 [start, end]
}

/**
 * 手势动画配置
 */
export interface GestureConfig {
  type?: 'drag' | 'swipe' | 'pinch' | 'rotate'
  threshold?: number // 手势触发阈值
  onGestureStart?: (event: TouchEvent | MouseEvent) => void
  onGestureMove?: (delta: { x: number; y: number }, event: TouchEvent | MouseEvent) => void
  onGestureEnd?: (velocity: { x: number; y: number }, event: TouchEvent | MouseEvent) => void
}

/**
 * 序列动画步骤
 */
export interface SequenceStep {
  target: string | HTMLElement // CSS选择器或元素
  properties: Record<string, any> // 动画属性
  config?: AnimationConfig
}

/**
 * 使用模板动画
 */
export function useTemplateAnimation(options: AnimationConfig = {}) {
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const progress = ref(0)
  const currentLoop = ref(0)

  let animationId: number | null = null
  let startTime: number | null = null
  let pauseTime: number | null = null

  const {
    duration = 1000,
    delay = 0,
    easing = 'easeInOutQuad',
    loop = false,
    yoyo = false,
    onStart,
    onUpdate,
    onComplete,
  } = options

  const easingFn = typeof easing === 'string' ? EASING_FUNCTIONS[easing] || EASING_FUNCTIONS.linear : easing

  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp + delay
    if (timestamp < startTime) {
      animationId = requestAnimationFrame(animate)
      return
    }

    const elapsed = pauseTime || timestamp - startTime
    const rawProgress = Math.min(elapsed / duration, 1)
    let adjustedProgress = easingFn(rawProgress)

    if (yoyo && currentLoop.value % 2 === 1) {
      adjustedProgress = 1 - adjustedProgress
    }

    progress.value = adjustedProgress
    onUpdate?.(adjustedProgress)

    if (rawProgress < 1) {
      animationId = requestAnimationFrame(animate)
    } else {
      if (loop) {
        const maxLoops = typeof loop === 'number' ? loop : Infinity
        currentLoop.value++
        if (currentLoop.value < maxLoops) {
          startTime = timestamp
          animationId = requestAnimationFrame(animate)
        } else {
          isPlaying.value = false
          onComplete?.()
        }
      } else {
        isPlaying.value = false
        onComplete?.()
      }
    }
  }

  const play = () => {
    if (isPlaying.value) return

    isPlaying.value = true
    isPaused.value = false
    startTime = null
    pauseTime = null
    currentLoop.value = 0
    onStart?.()
    animationId = requestAnimationFrame(animate)
  }

  const pause = () => {
    if (!isPlaying.value || isPaused.value) return
    isPaused.value = true
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    pauseTime = progress.value * duration
  }

  const resume = () => {
    if (!isPaused.value) return
    isPaused.value = false
    isPlaying.value = true
    animationId = requestAnimationFrame(animate)
  }

  const stop = () => {
    isPlaying.value = false
    isPaused.value = false
    progress.value = 0
    currentLoop.value = 0
    startTime = null
    pauseTime = null
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  const reset = () => {
    stop()
    progress.value = 0
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    isPlaying,
    isPaused,
    progress,
    currentLoop,
    play,
    pause,
    resume,
    stop,
    reset,
  }
}

/**
 * 使用视差滚动效果
 */
export function useParallax(elementRef: Ref<HTMLElement | null>, config: ParallaxConfig = {}) {
  const {
    speed = 0.5,
    direction = 'vertical',
    reverse = false,
    offset = 0,
    threshold = [0, 1],
  } = config

  const scrollY = ref(0)
  const scrollX = ref(0)
  const transform = computed(() => {
    const element = elementRef.value
    if (!element) return ''

    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    // const viewportWidth = window.innerWidth // Not used currently

    // 计算元素在视口中的位置 (0-1)
    const elementProgress = 1 - (rect.top + rect.height / 2) / viewportHeight
    
    // 应用阈值
    if (elementProgress < threshold[0] || elementProgress > threshold[1]) {
      return ''
    }

    const multiplier = reverse ? -1 : 1
    const movement = (elementProgress - 0.5) * 100 * speed * multiplier

    if (direction === 'vertical') {
      return `translateY(${movement + offset}px)`
    } else if (direction === 'horizontal') {
      return `translateX(${movement + offset}px)`
    } else {
      return `translate(${movement + offset}px, ${movement + offset}px)`
    }
  })

  const handleScroll = () => {
    scrollY.value = window.scrollY
    scrollX.value = window.scrollX
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  watch(transform, (newTransform) => {
    if (elementRef.value && newTransform) {
      elementRef.value.style.transform = newTransform
    }
  })

  return {
    scrollY,
    scrollX,
    transform,
  }
}

/**
 * 使用手势动画
 */
export function useGesture(elementRef: Ref<HTMLElement | null>, config: GestureConfig = {}) {
  const {
    // type = 'drag', // Not used currently
    threshold = 10,
    onGestureStart,
    onGestureMove,
    onGestureEnd,
  } = config

  const isGesturing = ref(false)
  const startPos = ref({ x: 0, y: 0 })
  const currentPos = ref({ x: 0, y: 0 })
  const delta = computed(() => ({
    x: currentPos.value.x - startPos.value.x,
    y: currentPos.value.y - startPos.value.y,
  }))

  let startTime = 0
  let lastPos = { x: 0, y: 0 }
  let lastTime = 0
  // 存储事件处理器引用，方便清理
  let handlers: { element: HTMLElement | Window; event: string; handler: EventListener; options?: any }[] = []

  const getEventPos = (event: TouchEvent | MouseEvent) => {
    if ('touches' in event) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY }
    }
    return { x: event.clientX, y: event.clientY }
  }

  const handleStart = (event: TouchEvent | MouseEvent) => {
    const pos = getEventPos(event)
    startPos.value = pos
    currentPos.value = pos
    lastPos = pos
    startTime = Date.now()
    lastTime = startTime
    isGesturing.value = true
    onGestureStart?.(event)
  }

  const handleMove = (event: TouchEvent | MouseEvent) => {
    if (!isGesturing.value) return

    const pos = getEventPos(event)
    currentPos.value = pos
    
    const currentDelta = {
      x: pos.x - startPos.value.x,
      y: pos.y - startPos.value.y,
    }

    // 检查是否超过阈值
    if (Math.abs(currentDelta.x) > threshold || Math.abs(currentDelta.y) > threshold) {
      onGestureMove?.(currentDelta, event)
      lastPos = pos
      lastTime = Date.now()
    }
  }

  const handleEnd = (event: TouchEvent | MouseEvent) => {
    if (!isGesturing.value) return

    isGesturing.value = false
    
    // 计算速度
    const timeDiff = Date.now() - lastTime
    const velocity = {
      x: timeDiff > 0 ? (currentPos.value.x - lastPos.x) / timeDiff : 0,
      y: timeDiff > 0 ? (currentPos.value.y - lastPos.y) / timeDiff : 0,
    }

    onGestureEnd?.(velocity, event)
  }

  const addEventHandler = (element: HTMLElement | Window, event: string, handler: EventListener, options?: any) => {
    element.addEventListener(event, handler, options)
    handlers.push({ element, event, handler, options })
  }

  const removeAllHandlers = () => {
    for (const { element, event, handler } of handlers) {
      element.removeEventListener(event, handler)
    }
    handlers = []
  }

  onMounted(() => {
    const element = elementRef.value
    if (!element) return

    // 支持触摸和鼠标事件
    addEventHandler(element, 'touchstart', handleStart as EventListener, { passive: true })
    addEventHandler(element, 'touchmove', handleMove as EventListener, { passive: true })
    addEventHandler(element, 'touchend', handleEnd as EventListener, { passive: true })
    addEventHandler(element, 'mousedown', handleStart as EventListener)
    addEventHandler(window, 'mousemove', handleMove as EventListener)
    addEventHandler(window, 'mouseup', handleEnd as EventListener)
  })

  onBeforeUnmount(() => {
    removeAllHandlers()
  })

  return {
    isGesturing,
    delta,
    startPos,
    currentPos,
  }
}

/**
 * 使用序列动画
 */
export function useSequenceAnimation(steps: SequenceStep[]) {
  const currentStep = ref(0)
  const isPlaying = ref(false)
  const completedSteps = ref<number[]>([])

  const playStep = (stepIndex: number): Promise<void> => {
    return new Promise((resolve) => {
      if (stepIndex >= steps.length) {
        resolve()
        return
      }

      const step = steps[stepIndex]
      const element = typeof step.target === 'string' 
        ? document.querySelector(step.target) as HTMLElement
        : step.target

      if (!element) {
        console.warn(`Element not found for step ${stepIndex}`)
        resolve()
        return
      }

      const animation = useTemplateAnimation({
        ...step.config,
        onUpdate: (progress) => {
          // 应用动画属性
          Object.entries(step.properties).forEach(([prop, value]) => {
            if (typeof value === 'number') {
              const startValue = Number.parseFloat(getComputedStyle(element)[prop as any] || '0')
              const currentValue = startValue + (value - startValue) * progress
              element.style[prop as any] = `${currentValue}px`
            } else {
              element.style[prop as any] = value
            }
          })
          step.config?.onUpdate?.(progress)
        },
        onComplete: () => {
          completedSteps.value.push(stepIndex)
          step.config?.onComplete?.()
          resolve()
        },
      })

      animation.play()
    })
  }

  const play = async () => {
    if (isPlaying.value) return

    isPlaying.value = true
    completedSteps.value = []
    
    for (let i = 0; i < steps.length; i++) {
      currentStep.value = i
      await playStep(i)
    }

    isPlaying.value = false
  }

  const playFrom = async (stepIndex: number) => {
    if (isPlaying.value || stepIndex >= steps.length) return

    isPlaying.value = true
    
    for (let i = stepIndex; i < steps.length; i++) {
      currentStep.value = i
      await playStep(i)
    }

    isPlaying.value = false
  }

  const stop = () => {
    isPlaying.value = false
    currentStep.value = 0
    completedSteps.value = []
  }

  return {
    currentStep,
    isPlaying,
    completedSteps,
    play,
    playFrom,
    stop,
  }
}

/**
 * 使用滚动触发动画
 */
export function useScrollAnimation(
  elementRef: Ref<HTMLElement | null>,
  animationConfig: AnimationConfig & {
    triggerOffset?: number // 触发动画的滚动偏移 (0-1)
    once?: boolean // 是否只触发一次
  } = {}
) {
  const { triggerOffset = 0.8, once = true, ...config } = animationConfig
  const hasTriggered = ref(false)
  const animation = useTemplateAnimation(config)
  let scrollHandler: (() => void) | null = null

  const checkVisibility = () => {
    const element = elementRef.value
    if (!element || (hasTriggered.value && once)) return

    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const triggerPoint = viewportHeight * triggerOffset

    if (rect.top < triggerPoint && rect.bottom > 0) {
      if (!hasTriggered.value) {
        hasTriggered.value = true
        animation.play()
      }
    } else if (!once && hasTriggered.value) {
      // 如果不是只触发一次，且元素离开视口，重置动画
      hasTriggered.value = false
      animation.reset()
    }
  }

  // 使用节流优化滚动性能
  const throttledCheckVisibility = () => {
    if (!scrollHandler) {
      scrollHandler = () => {
        checkVisibility()
        scrollHandler = null
      }
      requestAnimationFrame(scrollHandler)
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', throttledCheckVisibility, { passive: true })
    checkVisibility() // 初始检查
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', throttledCheckVisibility)
    animation.stop() // 确保停止动画
  })

  return {
    ...animation,
    hasTriggered,
  }
}
