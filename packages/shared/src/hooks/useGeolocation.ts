/**
 * 地理位置 Hook
 * 
 * @description
 * 提供获取和监听用户地理位置的功能，支持实时追踪、错误处理等
 */

import { ref, onUnmounted, type Ref } from 'vue'

/**
 * 地理位置坐标
 */
export interface GeolocationCoordinates {
  /** 纬度 */
  latitude: number
  /** 经度 */
  longitude: number
  /** 精度(米) */
  accuracy: number
  /** 海拔(米) */
  altitude: number | null
  /** 海拔精度(米) */
  altitudeAccuracy: number | null
  /** 方向(度) */
  heading: number | null
  /** 速度(米/秒) */
  speed: number | null
}

/**
 * 地理位置状态
 */
export interface GeolocationState {
  /** 是否支持地理位置 API */
  supported: boolean
  /** 是否正在加载 */
  loading: boolean
  /** 坐标信息 */
  coords: GeolocationCoordinates | null
  /** 时间戳 */
  timestamp: number | null
  /** 错误信息 */
  error: GeolocationPositionError | null
  /** 位置历史记录 */
  history: GeolocationCoordinates[]
}

/**
 * 地理位置配置
 */
export interface GeolocationConfig {
  /** 是否高精度定位 */
  enableHighAccuracy?: boolean
  /** 超时时间(ms) */
  timeout?: number
  /** 最大缓存时间(ms) */
  maximumAge?: number
  /** 是否立即获取位置 */
  immediate?: boolean
  /** 是否监听位置变化 */
  watch?: boolean
  /** 最大历史记录数 */
  maxHistorySize?: number
  /** 位置变化回调 */
  onChange?: (coords: GeolocationCoordinates) => void
  /** 错误回调 */
  onError?: (error: GeolocationPositionError) => void
}

/**
 * useGeolocation Hook
 * 
 * @param config - 配置选项
 * @returns 地理位置状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { state, getCurrentPosition, watchPosition, stopWatch } = useGeolocation({
 *       enableHighAccuracy: true,
 *       immediate: true,
 *       watch: true,
 *       onChange: (coords) => {
 *         
 *       }
 *     })
 *     
 *     const formatCoords = computed(() => {
 *       if (!state.coords) return '未知位置'
 *       return `${state.coords.latitude.toFixed(6)}, ${state.coords.longitude.toFixed(6)}`
 *     })
 *     
 *     return {
 *       state,
 *       formatCoords,
 *       getCurrentPosition,
 *       stopWatch
 *     }
 *   }
 * })
 * ```
 */
export function useGeolocation(config: GeolocationConfig = {}) {
  const {
    enableHighAccuracy = false,
    timeout = 10000,
    maximumAge = 0,
    immediate = true,
    watch = false,
    maxHistorySize = 10,
    onChange,
    onError,
  } = config

  // 状态
  const supported = ref(!!navigator?.geolocation)
  const loading = ref(false)
  const coords = ref<GeolocationCoordinates | null>(null)
  const timestamp = ref<number | null>(null)
  const error = ref<GeolocationPositionError | null>(null)
  const history = ref<GeolocationCoordinates[]>([])

  // 监听器 ID
  let watchId: number | null = null

  /**
   * 处理位置成功
   */
  const handleSuccess = (position: GeolocationPosition): void => {
    const newCoords: GeolocationCoordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
    }

    coords.value = newCoords
    timestamp.value = position.timestamp
    error.value = null
    loading.value = false

    // 添加到历史记录
    history.value.push(newCoords)
    if (history.value.length > maxHistorySize) {
      history.value.shift()
    }

    // 执行回调
    onChange?.(newCoords)
  }

  /**
   * 处理位置错误
   */
  const handleError = (err: GeolocationPositionError): void => {
    error.value = err
    loading.value = false

    // 执行回调
    onError?.(err)

    console.error('Geolocation error:', err.message)
  }

  /**
   * 获取当前位置
   */
  const getCurrentPosition = (): Promise<GeolocationCoordinates> => {
    if (!supported.value) {
      return Promise.reject(new Error('Geolocation is not supported'))
    }

    loading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleSuccess(position)
          resolve(coords.value!)
        },
        (err) => {
          handleError(err)
          reject(err)
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      )
    })
  }

  /**
   * 监听位置变化
   */
  const watchPosition = (): void => {
    if (!supported.value || watchId !== null) return

    loading.value = true
    error.value = null

    watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )
  }

  /**
   * 停止监听位置
   */
  const stopWatch = (): void => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
      loading.value = false
    }
  }

  /**
   * 清除历史记录
   */
  const clearHistory = (): void => {
    history.value = []
  }

  /**
   * 计算两点之间的距离(米)
   * 使用 Haversine 公式
   */
  const calculateDistance = (
    coord1: GeolocationCoordinates,
    coord2: GeolocationCoordinates
  ): number => {
    const R = 6371e3 // 地球半径(米)
    const φ1 = (coord1.latitude * Math.PI) / 180
    const φ2 = (coord2.latitude * Math.PI) / 180
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  /**
   * 获取移动距离(米)
   * 基于历史记录计算总移动距离
   */
  const getTotalDistance = (): number => {
    if (history.value.length < 2) return 0

    let totalDistance = 0
    for (let i = 1; i < history.value.length; i++) {
      totalDistance += calculateDistance(history.value[i - 1], history.value[i])
    }

    return totalDistance
  }

  /**
   * 获取平均速度(米/秒)
   */
  const getAverageSpeed = (): number | null => {
    const speeds = history.value
      .map(coord => coord.speed)
      .filter(speed => speed !== null) as number[]

    if (speeds.length === 0) return null

    return speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
  }

  /**
   * 格式化坐标为字符串
   */
  const formatCoordinates = (
    coords: GeolocationCoordinates,
    precision = 6
  ): string => {
    return `${coords.latitude.toFixed(precision)}, ${coords.longitude.toFixed(precision)}`
  }

  /**
   * 打开地图应用
   */
  const openInMap = (
    mapCoords?: GeolocationCoordinates,
    mapType: 'google' | 'apple' | 'openstreetmap' = 'google'
  ): void => {
    const targetCoords = mapCoords || coords.value
    if (!targetCoords) return

    let url: string
    switch (mapType) {
      case 'google':
        url = `https://www.google.com/maps?q=${targetCoords.latitude},${targetCoords.longitude}`
        break
      case 'apple':
        url = `https://maps.apple.com/?ll=${targetCoords.latitude},${targetCoords.longitude}`
        break
      case 'openstreetmap':
        url = `https://www.openstreetmap.org/?mlat=${targetCoords.latitude}&mlon=${targetCoords.longitude}&zoom=15`
        break
    }

    window.open(url, '_blank')
  }

  // 初始化
  if (immediate) {
    getCurrentPosition()
  }

  if (watch) {
    watchPosition()
  }

  // 清理
  onUnmounted(() => {
    stopWatch()
  })

  // 状态
  const state: Ref<GeolocationState> = ref({
    supported: supported.value,
    loading: loading.value,
    coords: coords.value,
    timestamp: timestamp.value,
    error: error.value,
    history: history.value,
  }) as any

  return {
    state,
    getCurrentPosition,
    watchPosition,
    stopWatch,
    clearHistory,
    calculateDistance,
    getTotalDistance,
    getAverageSpeed,
    formatCoordinates,
    openInMap,
  }
}
