import type { Ref } from 'vue'
import type {
  DeviceDetectorOptions,
  DeviceInfo,
  DeviceType,
  NetworkInfo,
  NetworkModule,
  NetworkType,
  Orientation,
  UseDeviceReturn,
} from '../../types'
import { computed, onMounted, onUnmounted, readonly, ref } from 'vue'
import { DeviceDetector } from '../../core/DeviceDetector'

/**
 * Vue3 设备检测 Composition API - 优化版本
 *
 * 提供响应式的设备信息检测功能，包括设备类型、屏幕方向、触摸支持等
 *
 * @param options 设备检测器配置选项
 * @returns 设备信息相关的响应式数据和方法
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDevice } from '@ldesign/device/vue'
 *
 * const {
 *   deviceType,
 *   orientation,
 *   deviceInfo,
 *   isMobile,
 *   isTablet,
 *   isDesktop,
 *   isTouchDevice,
 *   refresh
 * } = useDevice({
 *   enableResize: true,
 *   enableOrientation: true
 * })
 * </script>
 *
 * <template>
 *   <div>
 *     <p>设备类型: {{ deviceType }}</p>
 *     <p>屏幕方向: {{ orientation }}</p>
 *     <p>是否移动设备: {{ isMobile }}</p>
 *     <p>是否支持触摸: {{ isTouchDevice }}</p>
 *     <button @click="refresh">刷新设备信息</button>
 *   </div>
 * </template>
 * ```
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
  const isTouchDevice = readonly(computed(() => deviceInfo.value?.features?.touch ?? false))

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
      const currentInfo = detector.getDeviceInfo()
      updateDeviceInfo(currentInfo)
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
 * 网络状态检测 Composition API
 *
 * 提供网络连接状态、连接类型、网络速度等信息的响应式监听
 *
 * @returns 网络状态相关的响应式数据和方法
 *
 * @example
 * ```vue
 * <script setup>
 * import { useNetwork } from '@ldesign/device/vue'
 *
 * const {
 *   networkInfo,
 *   isOnline,
 *   connectionType,
 *   isLoaded,
 *   loadModule,
 *   unloadModule
 * } = useNetwork()
 *
 * // 加载网络模块
 * onMounted(() => {
 *   loadModule()
 * })
 * </script>
 *
 * <template>
 *   <div v-if="isLoaded">
 *     <p>网络状态: {{ isOnline ? '在线' : '离线' }}</p>
 *     <p>连接类型: {{ connectionType }}</p>
 *     <p v-if="networkInfo">
 *       下载速度: {{ networkInfo.downlink }}Mbps
 *     </p>
 *   </div>
 * </template>
 * ```
 */
export function useNetwork() {
  const networkInfo = ref<NetworkInfo | null>(null)
  const isOnline = ref(true)
  const connectionType = ref<NetworkType>('unknown')
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
        isOnline.value = networkInfo.value?.status === 'online'
        connectionType.value = networkInfo.value?.type || 'unknown'
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

// 为测试兼容性导出其他组合式 API（从此文件重导出）
export { useBattery } from './useBattery'
export { useGeolocation } from './useGeolocation'
