/**
 * 设备检测 Composable
 */

import type { DeviceType } from '../../types'
import { onMounted, onUnmounted, readonly, ref } from 'vue'
import { getDeviceDetector } from '../../core'

export function useDevice() {
  const device = ref<DeviceType>('desktop')
  const detector = getDeviceDetector()

  // 更新设备类型
  const updateDevice = () => {
    device.value = detector.getDevice()
  }

  // 设置设备类型
  const setDevice = (newDevice: DeviceType) => {
    detector.setDevice(newDevice)
  }

  onMounted(() => {
    updateDevice()
    detector.addListener(updateDevice)
  })

  onUnmounted(() => {
    detector.removeListener(updateDevice)
  })

  return {
    device: readonly(device),
    setDevice,
    isMobile: () => device.value === 'mobile',
    isTablet: () => device.value === 'tablet',
    isDesktop: () => device.value === 'desktop',
  }
}
