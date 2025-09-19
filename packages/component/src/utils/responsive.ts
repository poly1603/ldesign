/**
 * 响应式工具函数
 * 
 * 提供跨设备支持的响应式断点、媒体查询和设备检测功能
 */

import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 标准响应式断点配置
 * 基于 TDesign 设计规范
 */
export const BREAKPOINTS = {
  xs: 0,      // 超小屏幕 (手机竖屏)
  sm: 576,    // 小屏幕 (手机横屏)
  md: 768,    // 中等屏幕 (平板竖屏)
  lg: 992,    // 大屏幕 (平板横屏/小桌面)
  xl: 1200,   // 超大屏幕 (桌面)
  xxl: 1400   // 超超大屏幕 (大桌面)
} as const

/**
 * 断点类型
 */
export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * 响应式值类型
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

/**
 * 设备类型
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * 屏幕方向
 */
export type Orientation = 'portrait' | 'landscape'

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  /** 设备类型 */
  type: DeviceType
  /** 屏幕宽度 */
  width: number
  /** 屏幕高度 */
  height: number
  /** 当前断点 */
  breakpoint: Breakpoint
  /** 屏幕方向 */
  orientation: Orientation
  /** 是否为触摸设备 */
  isTouchDevice: boolean
  /** 是否为移动设备 */
  isMobile: boolean
  /** 是否为平板设备 */
  isTablet: boolean
  /** 是否为桌面设备 */
  isDesktop: boolean
  /** 设备像素比 */
  pixelRatio: number
}

/**
 * 媒体查询工具类
 */
export class MediaQueryManager {
  private queries = new Map<string, MediaQueryList>()
  private listeners = new Map<string, (event: MediaQueryListEvent) => void>()

  /**
   * 添加媒体查询监听
   */
  addQuery(name: string, query: string, callback: (matches: boolean) => void): void {
    const mediaQuery = window.matchMedia(query)
    const listener = (event: MediaQueryListEvent) => callback(event.matches)

    this.queries.set(name, mediaQuery)
    this.listeners.set(name, listener)

    mediaQuery.addEventListener('change', listener)

    // 立即执行一次回调
    callback(mediaQuery.matches)
  }

  /**
   * 移除媒体查询监听
   */
  removeQuery(name: string): void {
    const mediaQuery = this.queries.get(name)
    const listener = this.listeners.get(name)

    if (mediaQuery && listener) {
      mediaQuery.removeEventListener('change', listener)
      this.queries.delete(name)
      this.listeners.delete(name)
    }
  }

  /**
   * 检查媒体查询是否匹配
   */
  matches(query: string): boolean {
    return window.matchMedia(query).matches
  }

  /**
   * 清理所有监听器
   */
  cleanup(): void {
    this.queries.forEach((mediaQuery, name) => {
      const listener = this.listeners.get(name)
      if (listener) {
        mediaQuery.removeEventListener('change', listener)
      }
    })
    this.queries.clear()
    this.listeners.clear()
  }
}

/**
 * 获取当前断点
 */
export function getCurrentBreakpoint(width: number): Breakpoint {
  const breakpoints = Object.entries(BREAKPOINTS)
    .sort(([, a], [, b]) => b - a) // 从大到小排序

  for (const [name, minWidth] of breakpoints) {
    if (width >= minWidth) {
      return name as Breakpoint
    }
  }

  return 'xs'
}

/**
 * 获取设备类型
 */
export function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.md) return 'mobile'
  if (width < BREAKPOINTS.xl) return 'tablet'
  return 'desktop'
}

/**
 * 检测是否为触摸设备（响应式版本）
 */
export function detectTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 获取屏幕方向
 */
export function getOrientation(): Orientation {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
}

/**
 * 获取设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth
  const height = window.innerHeight
  const breakpoint = getCurrentBreakpoint(width)
  const deviceType = getDeviceType(width)

  return {
    type: deviceType,
    width,
    height,
    breakpoint,
    orientation: getOrientation(),
    isTouchDevice: detectTouchDevice(),
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    pixelRatio: window.devicePixelRatio || 1
  }
}

/**
 * 响应式断点 Composable
 */
export function useBreakpoints() {
  const width = ref(0)
  const height = ref(0)
  const deviceInfo = ref<DeviceInfo>(getDeviceInfo())

  const mediaQueryManager = new MediaQueryManager()

  // 响应式计算属性
  const current = computed(() => deviceInfo.value.breakpoint)
  const deviceType = computed(() => deviceInfo.value.type)
  const orientation = computed(() => deviceInfo.value.orientation)
  const isTouchDevice = computed(() => deviceInfo.value.isTouchDevice)
  const isMobile = computed(() => deviceInfo.value.isMobile)
  const isTablet = computed(() => deviceInfo.value.isTablet)
  const isDesktop = computed(() => deviceInfo.value.isDesktop)

  // 断点检查函数
  const isBreakpoint = (breakpoint: Breakpoint) => computed(() =>
    current.value === breakpoint
  )

  const greaterThan = (breakpoint: Breakpoint) => computed(() =>
    width.value >= BREAKPOINTS[breakpoint]
  )

  const lessThan = (breakpoint: Breakpoint) => computed(() =>
    width.value < BREAKPOINTS[breakpoint]
  )

  const between = (min: Breakpoint, max: Breakpoint) => computed(() =>
    width.value >= BREAKPOINTS[min] && width.value < BREAKPOINTS[max]
  )

  // 更新设备信息
  const updateDeviceInfo = () => {
    const newInfo = getDeviceInfo()
    width.value = newInfo.width
    height.value = newInfo.height
    deviceInfo.value = newInfo
  }

  // 监听窗口大小变化
  const handleResize = () => {
    updateDeviceInfo()
  }

  // 监听方向变化
  const handleOrientationChange = () => {
    // 延迟更新，等待浏览器完成方向切换
    setTimeout(updateDeviceInfo, 100)
  }

  onMounted(() => {
    updateDeviceInfo()

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    // 设置断点媒体查询
    Object.entries(BREAKPOINTS).forEach(([name, minWidth]) => {
      if (name !== 'xs') {
        mediaQueryManager.addQuery(
          name,
          `(min-width: ${minWidth}px)`,
          () => updateDeviceInfo()
        )
      }
    })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleOrientationChange)
    mediaQueryManager.cleanup()
  })

  return {
    // 基础数据
    width: width as Ref<number>,
    height: height as Ref<number>,
    deviceInfo: deviceInfo as Ref<DeviceInfo>,

    // 计算属性
    current,
    deviceType,
    orientation,
    isTouchDevice,
    isMobile,
    isTablet,
    isDesktop,

    // 断点检查函数
    isBreakpoint,
    greaterThan,
    lessThan,
    between,

    // 工具函数
    updateDeviceInfo,

    // 常量
    BREAKPOINTS
  }
}

/**
 * 媒体查询 Composable
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mediaQuery: MediaQueryList | null = null
  let listener: ((event: MediaQueryListEvent) => void) | null = null

  const updateMatches = (event?: MediaQueryListEvent) => {
    matches.value = event ? event.matches : mediaQuery?.matches || false
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    listener = updateMatches

    mediaQuery.addEventListener('change', listener)
    updateMatches()
  })

  onUnmounted(() => {
    if (mediaQuery && listener) {
      mediaQuery.removeEventListener('change', listener)
    }
  })

  return matches
}

/**
 * 响应式值解析器
 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T>,
  currentBreakpoint: Breakpoint
): T {
  if (typeof value !== 'object' || value === null) {
    return value as T
  }

  const responsiveValue = value as Partial<Record<Breakpoint, T>>

  // 按优先级查找匹配的值
  const breakpointOrder: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)

  // 从当前断点开始向下查找
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (responsiveValue[bp] !== undefined) {
      return responsiveValue[bp] as T
    }
  }

  // 如果没找到，返回第一个可用值
  for (const bp of breakpointOrder) {
    if (responsiveValue[bp] !== undefined) {
      return responsiveValue[bp] as T
    }
  }

  // 如果都没有，返回默认值
  return undefined as T
}
