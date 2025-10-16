/**
 * 全屏模式控制 Hook
 * 
 * @description
 * 提供全屏模式的进入、退出、切换功能，支持指定元素全屏，
 * 兼容各种浏览器的全屏 API。
 */

import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 全屏状态
 */
export interface FullscreenState {
  /** 是否支持全屏 */
  isSupported: boolean
  /** 是否处于全屏状态 */
  isFullscreen: boolean
  /** 当前全屏元素 */
  element: Element | null
  /** 是否正在切换 */
  isToggling: boolean
}

/**
 * 全屏配置
 */
export interface FullscreenConfig {
  /** 进入全屏时的回调 */
  onEnter?: (element: Element) => void
  /** 退出全屏时的回调 */
  onExit?: () => void
  /** 全屏状态改变时的回调 */
  onChange?: (isFullscreen: boolean, element: Element | null) => void
  /** 全屏错误时的回调 */
  onError?: (error: Error) => void
}

/**
 * 浏览器兼容的全屏 API
 */
interface FullscreenAPI {
  requestFullscreen: string
  exitFullscreen: string
  fullscreenElement: string
  fullscreenEnabled: string
  fullscreenchange: string
  fullscreenerror: string
}

/**
 * 获取浏览器兼容的全屏 API
 */
const getFullscreenAPI = (): FullscreenAPI | null => {
  if (typeof document === 'undefined') return null

  const apis: FullscreenAPI[] = [
    {
      requestFullscreen: 'requestFullscreen',
      exitFullscreen: 'exitFullscreen',
      fullscreenElement: 'fullscreenElement',
      fullscreenEnabled: 'fullscreenEnabled',
      fullscreenchange: 'fullscreenchange',
      fullscreenerror: 'fullscreenerror',
    },
    {
      requestFullscreen: 'webkitRequestFullscreen',
      exitFullscreen: 'webkitExitFullscreen',
      fullscreenElement: 'webkitFullscreenElement',
      fullscreenEnabled: 'webkitFullscreenEnabled',
      fullscreenchange: 'webkitfullscreenchange',
      fullscreenerror: 'webkitfullscreenerror',
    },
    {
      requestFullscreen: 'mozRequestFullScreen',
      exitFullscreen: 'mozCancelFullScreen',
      fullscreenElement: 'mozFullScreenElement',
      fullscreenEnabled: 'mozFullScreenEnabled',
      fullscreenchange: 'mozfullscreenchange',
      fullscreenerror: 'mozfullscreenerror',
    },
    {
      requestFullscreen: 'msRequestFullscreen',
      exitFullscreen: 'msExitFullscreen',
      fullscreenElement: 'msFullscreenElement',
      fullscreenEnabled: 'msFullscreenEnabled',
      fullscreenchange: 'MSFullscreenChange',
      fullscreenerror: 'MSFullscreenError',
    },
  ]

  for (const api of apis) {
    if (api.requestFullscreen in document.documentElement) {
      return api
    }
  }

  return null
}

/**
 * 全屏模式 Hook
 * 
 * @param target - 目标元素（可选，默认为 document.documentElement）
 * @param config - 配置选项
 * @returns 全屏状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const videoRef = ref<HTMLVideoElement>()
 *     
 *     const { state, enter, exit, toggle } = useFullscreen(videoRef, {
 *       onEnter: (element) => {
 *          *       },
 *       onExit: () => {
 *          *       }
 *     })
 *     
 *     const handleToggleFullscreen = () => {
 *       toggle()
 *     }
 *     
 *     return {
 *       videoRef,
 *       state,
 *       handleToggleFullscreen
 *     }
 *   }
 * })
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <video ref="videoRef" src="video.mp4" controls></video>
 *     <button 
 *       @click="toggle()"
 *       :disabled="!state.isSupported || state.isToggling"
 *     >
 *       {{ state.isFullscreen ? '退出全屏' : '进入全屏' }}
 *     </button>
 *     
 *     <div ref="containerRef" class="fullscreen-container">
 *       <p>这个容器可以全屏</p>
 *       <button @click="enterContainer">容器全屏</button>
 *     </div>
 *   </div>
 * </template>
 * 
 * <script setup>
 * const videoRef = ref()
 * const containerRef = ref()
 * 
 * const { state, toggle } = useFullscreen(videoRef)
 * const { enter: enterContainer } = useFullscreen(containerRef)
 * </script>
 * ```
 */
export function useFullscreen(
  target?: Ref<Element | null> | Element | null,
  config: FullscreenConfig = {}
) {
  const {
    onEnter,
    onExit,
    onChange,
    onError,
  } = config

  // 状态
  const isFullscreen = ref(false)
  const currentElement = ref<Element | null>(null)
  const isToggling = ref(false)

  // 获取全屏 API
  const api = getFullscreenAPI()
  const isSupported = !!api

  /**
   * 获取目标元素
   */
  const getTargetElement = (): Element => {
    if (!target) {
      return document.documentElement
    }
    
    if ('value' in target) {
      return target.value || document.documentElement
    }
    
    return target || document.documentElement
  }

  /**
   * 更新全屏状态
   */
  const updateState = () => {
    if (!api) return

    const fullscreenElement = (document as any)[api.fullscreenElement]
    isFullscreen.value = !!fullscreenElement
    currentElement.value = fullscreenElement || null
  }

  /**
   * 进入全屏
   */
  const enter = async (element?: Element): Promise<boolean> => {
    if (!api || isToggling.value) return false

    const targetElement = element || getTargetElement()
    if (!targetElement) return false

    isToggling.value = true

    try {
      await (targetElement as any)[api.requestFullscreen]()
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 100))
      
      onEnter?.(targetElement)
      onChange?.(true, targetElement)
      
      return true
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('进入全屏失败'))
      return false
    } finally {
      isToggling.value = false
    }
  }

  /**
   * 退出全屏
   */
  const exit = async (): Promise<boolean> => {
    if (!api || !isFullscreen.value || isToggling.value) return false

    isToggling.value = true

    try {
      await (document as any)[api.exitFullscreen]()
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 100))
      
      onExit?.()
      onChange?.(false, null)
      
      return true
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('退出全屏失败'))
      return false
    } finally {
      isToggling.value = false
    }
  }

  /**
   * 切换全屏状态
   */
  const toggle = async (element?: Element): Promise<boolean> => {
    if (isFullscreen.value) {
      return exit()
    } else {
      return enter(element)
    }
  }

  /**
   * 检查指定元素是否处于全屏状态
   */
  const isElementFullscreen = (element: Element): boolean => {
    return currentElement.value === element
  }

  // 监听全屏状态变化
  const handleFullscreenChange = () => {
    updateState()
  }

  const handleFullscreenError = (event: Event) => {
    isToggling.value = false
    onError?.(new Error('全屏操作失败'))
  }

  onMounted(() => {
    if (!api) return

    updateState()

    document.addEventListener(api.fullscreenchange, handleFullscreenChange)
    document.addEventListener(api.fullscreenerror, handleFullscreenError)
  })

  onUnmounted(() => {
    if (!api) return

    document.removeEventListener(api.fullscreenchange, handleFullscreenChange)
    document.removeEventListener(api.fullscreenerror, handleFullscreenError)
  })

  // 计算状态
  const state = computed<FullscreenState>(() => ({
    isSupported,
    isFullscreen: isFullscreen.value,
    element: currentElement.value,
    isToggling: isToggling.value,
  }))

  return {
    state,
    enter,
    exit,
    toggle,
    isElementFullscreen,
  }
}

/**
 * 简化的全屏函数
 * 
 * @param element - 要全屏的元素（可选）
 * @returns 是否成功进入全屏
 * 
 * @example
 * ```typescript
 * // 整个页面全屏
 * const success = await enterFullscreen()
 * 
 * // 指定元素全屏
 * const videoElement = document.querySelector('video')
 * const success = await enterFullscreen(videoElement)
 * ```
 */
export const enterFullscreen = async (element?: Element): Promise<boolean> => {
  const { enter } = useFullscreen()
  return enter(element)
}

/**
 * 退出全屏
 * 
 * @returns 是否成功退出全屏
 * 
 * @example
 * ```typescript
 * const success = await exitFullscreen()
 * ```
 */
export const exitFullscreen = async (): Promise<boolean> => {
  const { exit } = useFullscreen()
  return exit()
}

/**
 * 切换全屏状态
 * 
 * @param element - 要全屏的元素（可选）
 * @returns 是否操作成功
 * 
 * @example
 * ```typescript
 * const success = await toggleFullscreen()
 * ```
 */
export const toggleFullscreen = async (element?: Element): Promise<boolean> => {
  const { toggle } = useFullscreen()
  return toggle(element)
}

/**
 * 检查全屏支持性
 * 
 * @returns 是否支持全屏
 * 
 * @example
 * ```typescript
 * if (isFullscreenSupported()) {
 *   // 显示全屏按钮
 * }
 * ```
 */
export const isFullscreenSupported = (): boolean => {
  return !!getFullscreenAPI()
}

/**
 * 获取当前全屏元素
 * 
 * @returns 当前全屏元素或 null
 * 
 * @example
 * ```typescript
 * const fullscreenElement = getCurrentFullscreenElement()
 * if (fullscreenElement) {
 *    * }
 * ```
 */
export const getCurrentFullscreenElement = (): Element | null => {
  const api = getFullscreenAPI()
  if (!api) return null
  
  return (document as any)[api.fullscreenElement] || null
}

/**
 * 检查是否处于全屏状态
 * 
 * @returns 是否处于全屏状态
 * 
 * @example
 * ```typescript
 * if (isCurrentlyFullscreen()) {
 *    * }
 * ```
 */
export const isCurrentlyFullscreen = (): boolean => {
  return !!getCurrentFullscreenElement()
}
