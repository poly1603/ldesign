/**
 * Vue 网络状态 Composable
 *
 * 响应式的网络状态监听
 */

import type { Ref } from 'vue'
import { computed, onUnmounted, ref } from 'vue'
import {
  ConnectionType,
  createNetworkMonitor,
  type NetworkInfo,
  type NetworkMonitorConfig,
  type NetworkStatus,
} from '../utils/network'


/**
 * 网络状态 Composable 返回值
 */
export interface UseNetworkStatusReturn {
 /** 是否在线 */
 isOnline: Ref<boolean>
 /** 是否离线 */
 isOffline: Ref<boolean>
 /** 网络状态 */
 status: Ref<NetworkStatus>
 /** 网络信息 */
 networkInfo: Ref<NetworkInfo>
 /** 是否适合大文件传输 */
 isSuitableForLargeTransfer: Ref<boolean>
 /** 是否是WiFi */
 isWifi: Ref<boolean>
 /** 是否是移动网络 */
 isCellular: Ref<boolean>
 /** 是否按流量计费 */
 isMetered: Ref<boolean>
 /** 刷新网络信息 */
 refresh: () => void
}

/**
 * 网络状态 Hook
 *
 * 响应式监听网络状态变化
 *
 * @example
 * ```vue
 * <script setup>
 * import { useNetworkStatus } from '@ldesign/http'
 *
 * const { isOnline, isOffline, networkInfo, isSuitableForLargeTransfer } = useNetworkStatus()
 * </script>
 *
 * <template>
 *  <div v-if="isOffline" class="offline-banner">
 *   您当前处于离线状态
 *  </div>
 *  <div v-if="!isSuitableForLargeTransfer">
 *   当前网络状况不佳，建议稍后上传文件
 *  </div>
 * </template>
 * ```
 */
export function useNetworkStatus(config?: NetworkMonitorConfig): UseNetworkStatusReturn {
 const monitor = createNetworkMonitor(config)

 const isOnlineRef = ref(monitor.isOnline())
 const statusRef = ref(monitor.getStatus())
 const networkInfoRef = ref(monitor.getNetworkInfo())

 // 更新所有状态
 const updateStatus = () => {
  isOnlineRef.value = monitor.isOnline()
  statusRef.value = monitor.getStatus()
  networkInfoRef.value = monitor.getNetworkInfo()
 }

 // 配置状态变化监听
 const monitorConfig: NetworkMonitorConfig = {
  ...config,
  onStatusChange: (status, info) => {
   updateStatus()
   config?.onStatusChange?.(status, info)
  },
 }

 // 重新创建带回调的监听器
 const monitorWithCallback = createNetworkMonitor(monitorConfig)
 monitorWithCallback.start()

 // 计算属性
 const isOffline = computed(() => !isOnlineRef.value)
 const isSuitableForLargeTransfer = computed(() => monitorWithCallback.isSuitableForLargeTransfer())
 const isWifi = computed(() => networkInfoRef.value.connectionType === ConnectionType.WIFI)
 const isCellular = computed(() => {
  const type = networkInfoRef.value.connectionType
  return (
   type === ConnectionType.CELLULAR_2G
   || type === ConnectionType.CELLULAR_3G
   || type === ConnectionType.CELLULAR_4G
  )
 })
 const isMetered = computed(() => networkInfoRef.value.metered)

 // 组件卸载时停止监听
 onUnmounted(() => {
  monitorWithCallback.destroy()
 })

 return {
  isOnline: isOnlineRef,
  isOffline,
  status: statusRef,
  networkInfo: networkInfoRef,
  isSuitableForLargeTransfer,
  isWifi,
  isCellular,
  isMetered,
  refresh: updateStatus,
 }
}
