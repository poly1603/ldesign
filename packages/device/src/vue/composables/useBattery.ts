import type { Ref } from 'vue'
import type { BatteryInfo, BatteryModule } from '../../types'
import process from 'node:process'
import { computed, onUnmounted, readonly, ref } from 'vue'
import { DeviceDetector } from '../../core/DeviceDetector'

/**
 * 电池状态检测 Composition API
 *
 * 提供设备电池电量、充电状态、电池健康等信息的响应式监听
 *
 * @returns 电池状态相关的响应式数据和方法
 *
 * @example
 * ```vue
 * <script setup>
 * import { useBattery } from '@ldesign/device/vue'
 *
 * const {
 *   batteryInfo,
 *   batteryLevel,
 *   isCharging,
 *   batteryStatus,
 *   isLoaded,
 *   loadModule,
 *   unloadModule
 * } = useBattery()
 *
 * // 加载电池模块
 * onMounted(async () => {
 *   try {
 *     await loadModule()
 *   } catch (error) {
 *     console.warn('设备不支持电池 API')
 *   }
 * })
 * </script>
 *
 * <template>
 *   <div v-if="isLoaded">
 *     <div class="battery-indicator">
 *       <div class="battery-level" :style="{ width: `${batteryLevel * 100}%` }"></div>
 *     </div>
 *     <p>电量: {{ Math.round(batteryLevel * 100) }}%</p>
 *     <p>充电状态: {{ isCharging ? '充电中' : '未充电' }}</p>
 *     <p>电池状态: {{ batteryStatus }}</p>
 *   </div>
 *   <div v-else>
 *     <p>电池信息不可用</p>
 *   </div>
 * </template>
 * ```
 */
export function useBattery() {
  const batteryInfo = ref<BatteryInfo | null>(null) as Ref<BatteryInfo | null>
  const batteryLevel = ref(1)
  const isCharging = ref(false)
  const batteryStatus = ref('unknown')
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  let detector: DeviceDetector | null = null
  let batteryModule: BatteryModule | null = null
  let cleanupFunctions: Array<() => void> = []

  /**
   * 更新电池信息
   */
  const updateBatteryInfo = (info: BatteryInfo) => {
    batteryInfo.value = info
    batteryLevel.value = info.level
    isCharging.value = info.charging
    batteryStatus.value = info.chargingTime > 0
      ? 'charging'
      : info.dischargingTime > 0 ? 'discharging' : 'unknown'
  }

  /**
   * 加载电池模块
   */
  const loadModule = async () => {
    if (!detector) {
      detector = new DeviceDetector()
    }

    try {
      batteryModule = await detector.loadModule<BatteryModule>('battery')
      if (batteryModule && typeof batteryModule.getData === 'function') {
        const info = batteryModule.getData()
        updateBatteryInfo(info)
        isLoaded.value = true
        error.value = null

        // 监听电池状态变化（如模块支持事件）
        const maybeOn = (batteryModule as any).on as ((...args: any[]) => any) | undefined
        const maybeOff = (batteryModule as any).off as ((...args: any[]) => any) | undefined
        if (typeof maybeOn === 'function' && typeof maybeOff === 'function') {
          const batteryChangeHandler = (newInfo: BatteryInfo) => {
            updateBatteryInfo(newInfo)
          }
          maybeOn.call(batteryModule, 'batteryChange', batteryChangeHandler)
          // 保存清理函数
          cleanupFunctions.push(
            () => maybeOff.call(batteryModule, 'batteryChange', batteryChangeHandler),
          )
        }
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load battery module'
      // 只在开发模式下输出错误日志
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        console.warn('Failed to load battery module:', err)
      }
      throw err
    }
  }

  /**
   * 卸载电池模块
   */
  const unloadModule = async () => {
    // 清理事件监听器
    cleanupFunctions.forEach(cleanup => cleanup())
    cleanupFunctions = []

    if (detector) {
      await detector.unloadModule('battery')
      batteryModule = null
      batteryInfo.value = null
      batteryLevel.value = 1
      isCharging.value = false
      batteryStatus.value = 'unknown'
      isLoaded.value = false
      error.value = null
    }
  }

  /**
   * 销毁电池检测器
   */
  const destroyBattery = async () => {
    await unloadModule()
    if (detector) {
      await detector.destroy()
      detector = null
    }
  }

  /**
   * 刷新电池信息
   */
  const refresh = async () => {
    if (batteryModule && isLoaded.value) {
      try {
        const info = batteryModule.getData()
        updateBatteryInfo(info)
      }
      catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to refresh battery info'
      }
    }
  }

  // 计算属性
  const batteryPercentage = readonly(computed(() => Math.round(batteryLevel.value * 100)))
  const isLowBattery = readonly(computed(() => batteryLevel.value < 0.2))
  const isCriticalBattery = readonly(computed(() => batteryLevel.value < 0.1))

  onUnmounted(() => {
    destroyBattery()
  })

  return {
    batteryInfo: readonly(batteryInfo),
    batteryLevel: readonly(batteryLevel),
    isCharging: readonly(isCharging),
    batteryStatus: readonly(batteryStatus),
    isLoaded: readonly(isLoaded),
    error: readonly(error),
    batteryPercentage,
    isLowBattery,
    isCriticalBattery,
    loadModule,
    unloadModule,
    refresh,
  }
}
