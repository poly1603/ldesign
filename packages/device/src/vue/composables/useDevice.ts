import { ref, computed, onMounted, onUnmounted } from 'vue'
import { DeviceDetector } from '../../core/DeviceDetector'
import type { DeviceInfo, DeviceType, Orientation } from '../../types'

/**
 * 设备检测组合式函数
 */
export function useDevice() {
  const detector = new DeviceDetector()
  const deviceInfo = ref<DeviceInfo | null>(null)

  // 计算属性
  const isMobile = computed(() => deviceInfo.value?.type === 'mobile')
  const isTablet = computed(() => deviceInfo.value?.type === 'tablet')
  const isDesktop = computed(() => deviceInfo.value?.type === 'desktop')
  const isTouchDevice = computed(() => deviceInfo.value?.isTouchDevice || false)
  const orientation = computed(() => deviceInfo.value?.orientation || 'portrait')

  // 检测设备信息
  const detect = () => {
    deviceInfo.value = detector.getDeviceInfo()
  }

  // 监听设备变化
  const handleDeviceChange = (info: DeviceInfo) => {
    deviceInfo.value = info
  }

  onMounted(() => {
    detect()
    detector.on('deviceChange', handleDeviceChange)
  })

  onUnmounted(() => {
    detector.off('deviceChange', handleDeviceChange)
    detector.destroy()
  })

  return {
    deviceInfo,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    orientation,
    detect
  }
}

/**
 * 设备检测组合式函数（简化版）
 */
export function useDeviceDetection() {
  const { deviceInfo, isMobile, isTablet, isDesktop, isTouchDevice } = useDevice()
  
  return {
    deviceInfo,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice
  }
}
