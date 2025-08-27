/**
 * 重新导出优化后的 useDevice composable
 *
 * 这个文件保持向后兼容性，同时使用优化后的实现
 */
export {
  useDevice,
  useNetwork,
  useBattery,
  useGeolocation,
} from '../../adapt/vue/composables/useDevice'

import type { DeviceInfo } from '../../types'
import { computed } from 'vue'
import { useDevice } from '../../adapt/vue/composables/useDevice'

/**
 * 设备检测组合式函数（简化版）
 * 保持向后兼容性
 */
export function useDeviceDetection() {
  const { deviceInfo, isMobile, isTablet, isDesktop, isTouchDevice } = useDevice()

  return {
    deviceInfo: computed(() => deviceInfo.value),
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
  }
}
