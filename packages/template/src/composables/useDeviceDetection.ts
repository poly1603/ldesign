/**
 * 设备检测Hook
 * 
 * 集成 @ldesign/device 包，实现高效的设备类型检测和响应式切换
 */

import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type { DeviceType } from '../types/template'

/**
 * 设备检测选项
 */
interface UseDeviceDetectionOptions {
  /** 初始设备类型 */
  initialDevice?: DeviceType
  /** 是否启用响应式监听 */
  enableResponsive?: boolean
  /** 断点配置 */
  breakpoints?: {
    mobile: number
    tablet: number
    desktop: number
  }
  /** 防抖延迟（毫秒） */
  debounceDelay?: number
}

/**
 * 设备检测返回值
 */
interface UseDeviceDetectionReturn {
  /** 当前设备类型 */
  deviceType: Ref<DeviceType>
  /** 是否为移动设备 */
  isMobile: Ref<boolean>
  /** 是否为平板设备 */
  isTablet: Ref<boolean>
  /** 是否为桌面设备 */
  isDesktop: Ref<boolean>
  /** 当前屏幕宽度 */
  screenWidth: Ref<number>
  /** 当前屏幕高度 */
  screenHeight: Ref<number>
  /** 设备像素比 */
  devicePixelRatio: Ref<number>
  /** 是否为触摸设备 */
  isTouchDevice: Ref<boolean>
  /** 手动设置设备类型 */
  setDeviceType: (device: DeviceType) => void
  /** 刷新设备信息 */
  refresh: () => void
}

/**
 * 默认断点配置
 */
const DEFAULT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
}

/**
 * 设备检测Hook
 */
export function useDeviceDetection(options: UseDeviceDetectionOptions = {}): UseDeviceDetectionReturn {
  const {
    initialDevice,
    enableResponsive = true,
    breakpoints = DEFAULT_BREAKPOINTS,
    debounceDelay = 150
  } = options

  // 响应式状态
  const deviceType = ref<DeviceType>(initialDevice || 'desktop')
  const screenWidth = ref(0)
  const screenHeight = ref(0)
  const devicePixelRatio = ref(1)
  const isTouchDevice = ref(false)

  // 计算属性
  const isMobile = computed(() => deviceType.value === 'mobile')
  const isTablet = computed(() => deviceType.value === 'tablet')
  const isDesktop = computed(() => deviceType.value === 'desktop')

  // 防抖定时器
  let debounceTimer: number | null = null

  /**
   * 检测设备类型
   */
  function detectDeviceType(): DeviceType {
    if (typeof window === 'undefined') {
      return 'desktop' // 服务器端默认返回桌面端
    }

    const width = window.innerWidth

    if (width < breakpoints.mobile) {
      return 'mobile'
    } else if (width < breakpoints.tablet) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  /**
   * 检测是否为触摸设备
   */
  function detectTouchDevice(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false // 服务器端默认返回非触摸设备
    }

    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    )
  }

  /**
   * 更新设备信息
   */
  function updateDeviceInfo(): void {
    if (typeof window === 'undefined') return

    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
    devicePixelRatio.value = window.devicePixelRatio || 1
    isTouchDevice.value = detectTouchDevice()

    // 只有在启用响应式监听时才自动更新设备类型
    if (enableResponsive) {
      const newDeviceType = detectDeviceType()
      if (newDeviceType !== deviceType.value) {
        deviceType.value = newDeviceType
      }
    }
  }

  /**
   * 防抖更新
   */
  function debouncedUpdate(): void {
    if (typeof window === 'undefined') return

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = window.setTimeout(() => {
      updateDeviceInfo()
      debounceTimer = null
    }, debounceDelay)
  }

  /**
   * 手动设置设备类型
   */
  function setDeviceType(device: DeviceType): void {
    deviceType.value = device
  }

  /**
   * 刷新设备信息
   */
  function refresh(): void {
    updateDeviceInfo()
  }

  /**
   * 窗口大小变化处理
   */
  function handleResize(): void {
    if (enableResponsive) {
      debouncedUpdate()
    }
  }

  /**
   * 方向变化处理
   */
  function handleOrientationChange(): void {
    if (enableResponsive) {
      // 延迟更新，等待方向变化完成
      setTimeout(() => {
        debouncedUpdate()
      }, 100)
    }
  }

  // 生命周期钩子
  onMounted(() => {
    if (typeof window !== 'undefined') {
      // 初始化设备信息
      updateDeviceInfo()

      // 如果没有指定初始设备类型，则自动检测
      if (!initialDevice) {
        deviceType.value = detectDeviceType()
      }

      // 添加事件监听器
      if (enableResponsive) {
        window.addEventListener('resize', handleResize, { passive: true })
        window.addEventListener('orientationchange', handleOrientationChange, { passive: true })
      }
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined' && enableResponsive) {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }

    // 清理防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  })

  return {
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
    devicePixelRatio,
    isTouchDevice,
    setDeviceType,
    refresh
  }
}

/**
 * 简化版设备检测Hook（仅检测当前设备类型）
 */
export function useSimpleDeviceDetection(): { deviceType: DeviceType; isMobile: boolean; isTablet: boolean; isDesktop: boolean } {
  const detectDevice = (): DeviceType => {
    if (typeof window === 'undefined') return 'desktop'

    const width = window.innerWidth
    if (width < DEFAULT_BREAKPOINTS.mobile) return 'mobile'
    if (width < DEFAULT_BREAKPOINTS.tablet) return 'tablet'
    return 'desktop'
  }

  const deviceType = detectDevice()

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop'
  }
}

/**
 * 媒体查询Hook
 */
export function useMediaQuery(query: string): Ref<boolean> {
  const matches = ref(false)

  onMounted(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia(query)
      matches.value = mediaQuery.matches

      const handler = (e: MediaQueryListEvent) => {
        matches.value = e.matches
      }

      // 兼容性处理
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler)
      } else {
        // @ts-ignore - 兼容旧版本浏览器
        mediaQuery.addListener(handler)
      }

      onUnmounted(() => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handler)
        } else {
          // @ts-ignore - 兼容旧版本浏览器
          mediaQuery.removeListener(handler)
        }
      })
    }
  })

  return matches
}

/**
 * 预定义的媒体查询Hook
 */
export function useBreakpoints() {
  return {
    isMobile: useMediaQuery(`(max-width: ${DEFAULT_BREAKPOINTS.mobile - 1}px)`),
    isTablet: useMediaQuery(`(min-width: ${DEFAULT_BREAKPOINTS.mobile}px) and (max-width: ${DEFAULT_BREAKPOINTS.tablet - 1}px)`),
    isDesktop: useMediaQuery(`(min-width: ${DEFAULT_BREAKPOINTS.tablet}px)`),
    isSmallScreen: useMediaQuery(`(max-width: ${DEFAULT_BREAKPOINTS.tablet - 1}px)`),
    isLargeScreen: useMediaQuery(`(min-width: ${DEFAULT_BREAKPOINTS.desktop}px)`)
  }
}
