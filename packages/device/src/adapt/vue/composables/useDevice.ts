import type { Ref } from 'vue'
import type {
  BatteryInfo,
  BatteryModule,
  DeviceDetectorOptions,
  DeviceInfo,
  DeviceType,
  GeolocationInfo,
  GeolocationModule,
  NetworkInfo,
  NetworkModule,
  Orientation,
  UseDeviceReturn,
} from '../../../types'
import { computed, onMounted, onUnmounted, readonly, ref } from 'vue'
import { DeviceDetector } from '../../../core/DeviceDetector'

/**
 * Vue3 设备检测 Composition API - 优化版本
 */
export function useDevice(
  options: DeviceDetectorOptions = {},
): UseDeviceReturn {
  // 响应式状态 - 使用 shallowRef 优化性能
  const deviceInfo = ref<DeviceInfo>() as Ref<DeviceInfo>
  const deviceType = ref<DeviceType>('desktop') as Ref<DeviceType>
  const orientation = ref<Orientation>('landscape') as Ref<Orientation>

  // 设备检测器实例
  let detector: DeviceDetector | null = null
  let isInitialized = false
  let cleanupFunctions: Array<() => void> = []

  // 计算属性 - 使用 readonly 包装以防止外部修改
  const isMobile = readonly(computed(() => deviceType.value === 'mobile'))
  const isTablet = readonly(computed(() => deviceType.value === 'tablet'))
  const isDesktop = readonly(computed(() => deviceType.value === 'desktop'))
  const isTouchDevice = readonly(computed(() => deviceInfo.value?.isTouchDevice ?? false))

  /**
   * 更新设备信息 - 优化版本，减少不必要的更新
   */
  const updateDeviceInfo = (info: DeviceInfo) => {
    // 批量更新以减少响应式触发次数
    if (deviceInfo.value?.type !== info.type) {
      deviceType.value = info.type
    }
    if (deviceInfo.value?.orientation !== info.orientation) {
      orientation.value = info.orientation
    }
    deviceInfo.value = info
  }

  /**
   * 刷新设备信息
   */
  const refresh = () => {
    if (detector && isInitialized) {
      detector.refresh()
    }
  }

  /**
   * 初始化设备检测器 - 优化版本
   */
  const initDetector = () => {
    if (detector || isInitialized) {
      return
    }

    try {
      detector = new DeviceDetector(options)
      isInitialized = true

      // 获取初始设备信息
      updateDeviceInfo(detector.getDeviceInfo())

      // 监听设备变化 - 使用更精确的事件处理
      const deviceChangeHandler = (info: DeviceInfo) => {
        updateDeviceInfo(info)
      }

      const orientationChangeHandler = (newOrientation: Orientation) => {
        if (orientation.value !== newOrientation) {
          orientation.value = newOrientation
        }
      }

      detector.on('deviceChange', deviceChangeHandler)
      detector.on('orientationChange', orientationChangeHandler)

      // 保存清理函数
      cleanupFunctions.push(
        () => detector?.off('deviceChange', deviceChangeHandler),
        () => detector?.off('orientationChange', orientationChangeHandler),
      )
    }
    catch (error) {
      console.error('Failed to initialize device detector:', error)
      isInitialized = false
    }
  }

  /**
   * 销毁设备检测器 - 优化版本
   */
  const destroyDetector = async () => {
    try {
      // 清理事件监听器
      cleanupFunctions.forEach(cleanup => cleanup())
      cleanupFunctions = []

      // 销毁检测器
      if (detector) {
        await detector.destroy()
        detector = null
      }

      isInitialized = false
    }
    catch (error) {
      console.error('Failed to destroy device detector:', error)
    }
  }

  // 生命周期钩子
  onMounted(() => {
    initDetector()
  })

  onUnmounted(() => {
    destroyDetector()
  })

  return {
    deviceType: readonly(deviceType),
    orientation: readonly(orientation),
    deviceInfo: readonly(deviceInfo),
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    refresh,
  }
}

/**
 * 使用网络信息
 */
export function useNetwork() {
  const networkInfo = ref<NetworkInfo | null>(null)
  const isOnline = ref(true)
  const connectionType = ref<string>('unknown')
  const isLoaded = ref(false)

  let detector: DeviceDetector | null = null
  let networkModule: NetworkModule | null = null

  const loadModule = async () => {
    if (!detector) {
      detector = new DeviceDetector()
    }

    try {
      networkModule = await detector.loadModule<NetworkModule>('network')
      if (networkModule && typeof networkModule.getData === 'function') {
        networkInfo.value = networkModule.getData()
        isOnline.value = networkModule.isOnline()
        connectionType.value = networkModule.getConnectionType()
        isLoaded.value = true
      }
    }
    catch (error) {
      console.warn('Failed to load network module:', error)
      throw error
    }
  }

  const unloadModule = async () => {
    if (detector) {
      await detector.unloadModule('network')
      networkModule = null
      networkInfo.value = null
      isLoaded.value = false
    }
  }

  const destroyNetwork = async () => {
    if (detector) {
      await detector.destroy()
      detector = null
      networkModule = null
    }
  }

  onUnmounted(() => {
    destroyNetwork()
  })

  return {
    networkInfo: readonly(networkInfo),
    isOnline: readonly(isOnline),
    connectionType: readonly(connectionType),
    isLoaded: readonly(isLoaded),
    loadModule,
    unloadModule,
  }
}

/**
 * 使用电池信息
 */
export function useBattery() {
  const batteryInfo = ref<BatteryInfo | null>(null)
  const batteryLevel = ref(1)
  const isCharging = ref(false)
  const batteryStatus = ref('unknown')
  const isLoaded = ref(false)

  let detector: DeviceDetector | null = null
  let batteryModule: BatteryModule | null = null

  const loadModule = async () => {
    if (!detector) {
      detector = new DeviceDetector()
    }

    try {
      batteryModule = await detector.loadModule<BatteryModule>('battery')
      if (batteryModule && typeof batteryModule.getData === 'function') {
        batteryInfo.value = batteryModule.getData()
        batteryLevel.value = batteryModule.getLevel()
        isCharging.value = batteryModule.isCharging()
        batteryStatus.value = batteryModule.getBatteryStatus()
        isLoaded.value = true
      }
    }
    catch (error) {
      console.warn('Failed to load battery module:', error)
      throw error
    }
  }

  const unloadModule = async () => {
    if (detector) {
      await detector.unloadModule('battery')
      batteryModule = null
      batteryInfo.value = null
      isLoaded.value = false
    }
  }

  const destroyBattery = async () => {
    if (detector) {
      await detector.destroy()
      detector = null
      batteryModule = null
    }
  }

  onUnmounted(() => {
    destroyBattery()
  })

  return {
    batteryInfo: readonly(batteryInfo),
    batteryLevel: readonly(batteryLevel),
    isCharging: readonly(isCharging),
    batteryStatus: readonly(batteryStatus),
    isLoaded: readonly(isLoaded),
    loadModule,
    unloadModule,
  }
}

/**
 * 使用地理位置信息
 */
export function useGeolocation() {
  const position = ref<GeolocationInfo | null>(null)
  const latitude = ref<number | null>(null)
  const longitude = ref<number | null>(null)
  const accuracy = ref<number | null>(null)
  const error = ref<string | null>(null)
  const isSupported = ref(false)
  const isLoaded = ref(false)

  let detector: DeviceDetector | null = null
  let geolocationModule: GeolocationModule | null = null

  const loadModule = async () => {
    if (!detector) {
      detector = new DeviceDetector()
    }

    try {
      geolocationModule = await detector.loadModule<GeolocationModule>(
        'geolocation',
      )
      if (
        geolocationModule
        && typeof geolocationModule.isSupported === 'function'
      ) {
        isSupported.value = geolocationModule.isSupported()
        isLoaded.value = true
        error.value = null
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.warn('Failed to load geolocation module:', err)
      throw err
    }
  }

  const unloadModule = async () => {
    if (detector) {
      await detector.unloadModule('geolocation')
      geolocationModule = null
      position.value = null
      latitude.value = null
      longitude.value = null
      accuracy.value = null
      isLoaded.value = false
      error.value = null
    }
  }

  const getCurrentPosition = async () => {
    if (!geolocationModule) {
      await loadModule()
    }

    try {
      if (
        geolocationModule
        && typeof geolocationModule.getCurrentPosition === 'function'
      ) {
        const pos = await geolocationModule.getCurrentPosition()
        position.value = pos
        latitude.value = pos.latitude
        longitude.value = pos.longitude
        accuracy.value = pos.accuracy
        error.value = null
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    }
  }

  const isWatching = ref(false)

  const startWatching = async () => {
    if (!geolocationModule || isWatching.value) {
      if (!geolocationModule) {
        await loadModule()
      }
      if (isWatching.value)
        return
    }

    try {
      if (
        geolocationModule
        && typeof geolocationModule.startWatching === 'function'
      ) {
        geolocationModule.startWatching((pos: GeolocationInfo) => {
          position.value = pos
          latitude.value = pos.latitude
          longitude.value = pos.longitude
          accuracy.value = pos.accuracy
        })
        isWatching.value = true
        error.value = null
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    }
  }

  const stopWatching = async () => {
    if (!geolocationModule || !isWatching.value)
      return
    try {
      if (
        geolocationModule
        && typeof geolocationModule.stopWatching === 'function'
      ) {
        geolocationModule.stopWatching()
        isWatching.value = false
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    }
  }

  const destroyGeolocation = async () => {
    if (isWatching.value) {
      await stopWatching()
    }
    if (detector) {
      await detector.destroy()
      detector = null
      geolocationModule = null
    }
  }

  onUnmounted(() => {
    destroyGeolocation()
  })

  return {
    position: readonly(position),
    latitude: readonly(latitude),
    longitude: readonly(longitude),
    accuracy: readonly(accuracy),
    error: readonly(error),
    isSupported: readonly(isSupported),
    isWatching: readonly(isWatching),
    isLoaded: readonly(isLoaded),
    loadModule,
    unloadModule,
    getCurrentPosition,
    startWatching,
    stopWatching,
  }
}
