/**
 * 网络状态检测 Hook
 * 
 * @description
 * 提供网络连接状态检测功能，包括在线/离线状态、网络类型、连接速度等信息。
 * 支持实时监听网络状态变化。
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 网络连接类型
 */
export type NetworkType = 
  | 'bluetooth' 
  | 'cellular' 
  | 'ethernet' 
  | 'none' 
  | 'wifi' 
  | 'wimax' 
  | 'other' 
  | 'unknown'

/**
 * 网络有效连接类型
 */
export type EffectiveType = 'slow-2g' | '2g' | '3g' | '4g'

/**
 * 网络状态信息
 */
export interface NetworkState {
  /** 是否在线 */
  isOnline: boolean
  /** 网络连接类型 */
  type: NetworkType
  /** 有效连接类型 */
  effectiveType: EffectiveType
  /** 下行链路速度（Mbps） */
  downlink: number
  /** 往返时间（毫秒） */
  rtt: number
  /** 是否启用数据保护模式 */
  saveData: boolean
  /** 上次更新时间 */
  since: Date
}

/**
 * 网络连接信息接口（扩展 Navigator）
 */
interface NetworkInformation extends EventTarget {
  readonly type: NetworkType
  readonly effectiveType: EffectiveType
  readonly downlink: number
  readonly rtt: number
  readonly saveData: boolean
  onchange: ((this: NetworkInformation, ev: Event) => any) | null
}

/**
 * 扩展的 Navigator 接口
 */
interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation
  mozConnection?: NetworkInformation
  webkitConnection?: NetworkInformation
}

/**
 * 获取网络连接对象
 */
function getConnection(): NetworkInformation | undefined {
  const nav = navigator as NavigatorWithConnection
  return nav.connection || nav.mozConnection || nav.webkitConnection
}

/**
 * 网络状态检测 Hook
 * 
 * @returns 网络状态信息和相关方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const {
 *       isOnline,
 *       type,
 *       effectiveType,
 *       downlink,
 *       rtt,
 *       saveData,
 *       since,
 *       refresh
 *     } = useNetwork()
 *     
 *     // 监听网络状态变化
 *     watch(isOnline, (online) => {
 *       if (online) {
 *          *         // 重新加载数据
 *         loadData()
 *       } else {
 *          *         // 显示离线提示
 *         showOfflineMessage()
 *       }
 *     })
 *     
 *     // 根据网络类型调整行为
 *     watch([type, effectiveType], ([networkType, effective]) => {
 *       if (effective === 'slow-2g' || effective === '2g') {
 *         // 低速网络，减少数据传输
 *         enableLowDataMode()
 *       }
 *     })
 *     
 *     return {
 *       isOnline,
 *       type,
 *       effectiveType,
 *       downlink,
 *       rtt,
 *       saveData,
 *       since,
 *       refresh
 *     }
 *   }
 * })
 * ```
 */
export function useNetwork() {
  const isOnline = ref(true)
  const type = ref<NetworkType>('unknown')
  const effectiveType = ref<EffectiveType>('4g')
  const downlink = ref(0)
  const rtt = ref(0)
  const saveData = ref(false)
  const since = ref<Date>(new Date())

  /**
   * 更新网络状态
   */
  const updateNetworkState = () => {
    isOnline.value = navigator.onLine
    since.value = new Date()

    const connection = getConnection()
    if (connection) {
      type.value = connection.type || 'unknown'
      effectiveType.value = connection.effectiveType || '4g'
      downlink.value = connection.downlink || 0
      rtt.value = connection.rtt || 0
      saveData.value = connection.saveData || false
    }
  }

  /**
   * 手动刷新网络状态
   */
  const refresh = () => {
    updateNetworkState()
  }

  /**
   * 在线状态变化处理器
   */
  const handleOnlineChange = () => {
    updateNetworkState()
  }

  /**
   * 网络连接变化处理器
   */
  const handleConnectionChange = () => {
    updateNetworkState()
  }

  onMounted(() => {
    // 初始化网络状态
    updateNetworkState()

    // 监听在线/离线状态变化
    window.addEventListener('online', handleOnlineChange)
    window.addEventListener('offline', handleOnlineChange)

    // 监听网络连接变化
    const connection = getConnection()
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }
  })

  onUnmounted(() => {
    // 清理事件监听器
    window.removeEventListener('online', handleOnlineChange)
    window.removeEventListener('offline', handleOnlineChange)

    const connection = getConnection()
    if (connection) {
      connection.removeEventListener('change', handleConnectionChange)
    }
  })

  return {
    isOnline: isOnline as Ref<boolean>,
    type: type as Ref<NetworkType>,
    effectiveType: effectiveType as Ref<EffectiveType>,
    downlink: downlink as Ref<number>,
    rtt: rtt as Ref<number>,
    saveData: saveData as Ref<boolean>,
    since: since as Ref<Date>,
    refresh,
  }
}

/**
 * 简化的在线状态检测 Hook
 * 
 * @returns 是否在线的响应式引用
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const isOnline = useOnline()
 *     
 *     return {
 *       isOnline
 *     }
 *   }
 * })
 * ```
 */
export function useOnline(): Ref<boolean> {
  const { isOnline } = useNetwork()
  return isOnline
}

/**
 * 网络质量检测 Hook
 * 
 * @returns 网络质量信息
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { quality, isSlow, isFast } = useNetworkQuality()
 *     
 *     // 根据网络质量调整应用行为
 *     watch(quality, (newQuality) => {
 *       switch (newQuality) {
 *         case 'poor':
 *           enableLowDataMode()
 *           break
 *         case 'good':
 *           enableNormalMode()
 *           break
 *         case 'excellent':
 *           enableHighQualityMode()
 *           break
 *       }
 *     })
 *     
 *     return {
 *       quality,
 *       isSlow,
 *       isFast
 *     }
 *   }
 * })
 * ```
 */
export function useNetworkQuality() {
  const { effectiveType, downlink, rtt } = useNetwork()
  
  const quality = ref<'poor' | 'good' | 'excellent'>('good')
  const isSlow = ref(false)
  const isFast = ref(false)

  const updateQuality = () => {
    const effective = effectiveType.value
    const speed = downlink.value
    const latency = rtt.value

    // 根据有效连接类型和网络指标判断质量
    if (effective === 'slow-2g' || effective === '2g' || speed < 0.5 || latency > 2000) {
      quality.value = 'poor'
      isSlow.value = true
      isFast.value = false
    } else if (effective === '4g' && speed > 5 && latency < 100) {
      quality.value = 'excellent'
      isSlow.value = false
      isFast.value = true
    } else {
      quality.value = 'good'
      isSlow.value = false
      isFast.value = false
    }
  }

  // 监听网络状态变化
  onMounted(() => {
    updateQuality()
  })

  // 实时更新质量评估
  const stopWatchers = [
    effectiveType,
    downlink,
    rtt,
  ].map(ref => 
    ref && typeof ref === 'object' && 'value' in ref
      ? (ref as any).__v_isRef 
        ? ref
        : null
      : null
  ).filter(Boolean)

  if (stopWatchers.length > 0) {
    import('vue').then(({ watch }) => {
      watch(
        [effectiveType, downlink, rtt],
        updateQuality,
        { immediate: true }
      )
    })
  }

  return {
    quality: quality as Ref<'poor' | 'good' | 'excellent'>,
    isSlow: isSlow as Ref<boolean>,
    isFast: isFast as Ref<boolean>,
  }
}
