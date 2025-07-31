import { computed, onMounted, onUnmounted, readonly, ref } from 'vue'
import type { Ref } from 'vue'
import { DeviceDetector } from '../../core/DeviceDetector'
import type {
  DeviceDetectorOptions,
  DeviceInfo,
  DeviceType,
  Orientation,
  UseDeviceReturn,
} from '../../types'

/**
 * Vue3 设备检测 Composition API
 */
export function useDevice(options: DeviceDetectorOptions = {}): UseDeviceReturn {
  // 响应式状态
  const deviceInfo = ref<DeviceInfo>() as Ref<DeviceInfo>
  const deviceType = ref<DeviceType>('desktop') as Ref<DeviceType>
  const orientation = ref<Orientation>('landscape') as Ref<Orientation>

  // 设备检测器实例
  let detector: DeviceDetector | null = null

  // 计算属性
  const isMobile = computed(() => deviceType.value === 'mobile')
  const isTablet = computed(() => deviceType.value === 'tablet')
  const isDesktop = computed(() => deviceType.value === 'desktop')
  const isTouchDevice = computed(() => deviceInfo.value?.isTouchDevice ?? false)

  /**
   * 更新设备信息
   */
  const updateDeviceInfo = (info: DeviceInfo) => {
    deviceInfo.value = info
    deviceType.value = info.type
    orientation.value = info.orientation
  }

  /**
   * 刷新设备信息
   */
  const refresh = () => {
    if (detector) {
      detector.refresh()
    }
  }

  /**
   * 初始化设备检测器
   */
  const initDetector = () => {
    if (detector) {
      return
    }

    detector = new DeviceDetector(options)

    // 获取初始设备信息
    updateDeviceInfo(detector.getDeviceInfo())

    // 监听设备变化
    detector.on('deviceChange', updateDeviceInfo)
    detector.on('orientationChange', (newOrientation) => {
      orientation.value = newOrientation
    })
  }

  /**
   * 销毁设备检测器
   */
  const destroyDetector = async () => {
    if (detector) {
      await detector.destroy()
      detector = null
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
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop),
    isTouchDevice: readonly(isTouchDevice),
    refresh,
  }
}

/**
 * 使用网络信息
 */
export function useNetwork() {
  const networkInfo = ref<any>(null)
  const isOnline = ref(true)
  const connectionType = ref<string>('unknown')

  let detector: DeviceDetector | null = null

  const initNetwork = async () => {
    detector = new DeviceDetector()
    try {
      const network = await detector.loadModule('network')
      networkInfo.value = network.getData()
      isOnline.value = network.isOnline()
      connectionType.value = network.getConnectionType()
    }
    catch (error) {
      console.warn('Failed to load network module:', error)
    }
  }

  const destroyNetwork = async () => {
    if (detector) {
      await detector.destroy()
      detector = null
    }
  }

  onMounted(() => {
    initNetwork()
  })

  onUnmounted(() => {
    destroyNetwork()
  })

  return {
    networkInfo: readonly(networkInfo),
    isOnline: readonly(isOnline),
    connectionType: readonly(connectionType),
  }
}

/**
 * 使用电池信息
 */
export function useBattery() {
  const batteryInfo = ref<any>(null)
  const batteryLevel = ref(1)
  const isCharging = ref(false)
  const batteryStatus = ref('unknown')

  let detector: DeviceDetector | null = null

  const initBattery = async () => {
    detector = new DeviceDetector()
    try {
      const battery = await detector.loadModule('battery')
      batteryInfo.value = battery.getData()
      batteryLevel.value = battery.getLevel()
      isCharging.value = battery.isCharging()
      batteryStatus.value = battery.getBatteryStatus()
    }
    catch (error) {
      console.warn('Failed to load battery module:', error)
    }
  }

  const destroyBattery = async () => {
    if (detector) {
      await detector.destroy()
      detector = null
    }
  }

  onMounted(() => {
    initBattery()
  })

  onUnmounted(() => {
    destroyBattery()
  })

  return {
    batteryInfo: readonly(batteryInfo),
    batteryLevel: readonly(batteryLevel),
    isCharging: readonly(isCharging),
    batteryStatus: readonly(batteryStatus),
  }
}

/**
 * 使用地理位置信息
 */
export function useGeolocation() {
  const position = ref<any>(null)
  const latitude = ref<number | null>(null)
  const longitude = ref<number | null>(null)
  const accuracy = ref<number | null>(null)
  const error = ref<string | null>(null)
  const isSupported = ref(false)

  let detector: DeviceDetector | null = null

  const initGeolocation = async () => {
    detector = new DeviceDetector()
    try {
      const geo = await detector.loadModule('geolocation')
      isSupported.value = geo.isSupported()

      if (isSupported.value) {
        const pos = await geo.getCurrentPosition()
        position.value = pos
        latitude.value = pos.latitude
        longitude.value = pos.longitude
        accuracy.value = pos.accuracy
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.warn('Failed to load geolocation module:', err)
    }
  }

  const destroyGeolocation = async () => {
    if (detector) {
      await detector.destroy()
      detector = null
    }
  }

  onMounted(() => {
    initGeolocation()
  })

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
  }
}
