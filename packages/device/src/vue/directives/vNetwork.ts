import type { Directive, DirectiveBinding } from 'vue'
import type { NetworkInfo, NetworkStatus } from '../../types'
import { DeviceDetector } from '../../core/DeviceDetector'

interface ElementWithNetworkData extends HTMLElement {
  __networkChangeHandler?: (networkInfo: NetworkInfo) => void
  __deviceChangeHandler?: () => void
  __deviceDetector?: DeviceDetector
  __lastNetworkStatus?: NetworkStatus
  __isVisible?: boolean
  __directiveBinding?: DirectiveBinding<NetworkStatus | NetworkStatus[] | NetworkDirectiveValue>
}

interface NetworkDirectiveValue {
  status: NetworkStatus | NetworkStatus[]
  inverse?: boolean
  callback?: (networkInfo: NetworkInfo) => void
}

// 全局设备检测器实例
let globalDetector: DeviceDetector | null = null
let elementCount = 0

// 性能优化：批量更新队列
const updateQueue: Set<ElementWithNetworkData> = new Set()
let isUpdateScheduled = false

/**
 * 获取全局设备检测器实例
 */
function getGlobalDetector(): DeviceDetector {
  if (!globalDetector) {
    globalDetector = new DeviceDetector({
      modules: ['network'],
    })

    // 初始化网络模块
    globalDetector.loadModule('network').catch((error) => {
      console.warn('Failed to load network module:', error)
    })
  }
  return globalDetector
}

/**
 * 调度批量更新
 */
function scheduleUpdate(): void {
  if (isUpdateScheduled || updateQueue.size === 0) {
    return
  }

  isUpdateScheduled = true
  requestAnimationFrame(() => {
    const elementsToUpdate = Array.from(updateQueue)
    updateQueue.clear()
    isUpdateScheduled = false

    elementsToUpdate.forEach(async (element) => {
      if (element.isConnected && element.__directiveBinding) {
        const detector = getGlobalDetector()
        try {
          const networkModule = await detector.loadModule<import('../../types').NetworkModule>('network')
          if (networkModule && typeof networkModule.getData === 'function') {
            const networkInfo = networkModule.getData()
            updateElementVisibility(element, element.__directiveBinding, networkInfo)
          }
        }
        catch (error) {
          console.warn('Failed to get network info:', error)
        }
      }
    })
  })
}

/**
 * 解析指令绑定值
 */
function parseDirectiveValue(value: NetworkStatus | NetworkStatus[] | NetworkDirectiveValue): {
  statuses: NetworkStatus[]
  inverse: boolean
  callback?: (networkInfo: NetworkInfo) => void
} {
  if (typeof value === 'string') {
    return {
      statuses: [value],
      inverse: false,
    }
  }

  if (Array.isArray(value)) {
    return {
      statuses: value,
      inverse: false,
    }
  }

  if (typeof value === 'object' && value !== null) {
    const statuses = Array.isArray(value.status) ? value.status : [value.status]
    return {
      statuses,
      inverse: value.inverse || false,
      callback: value.callback,
    }
  }

  return {
    statuses: [],
    inverse: false,
  }
}

/**
 * 检查是否应该显示元素
 */
function shouldShowElement(
  currentStatus: NetworkStatus,
  targetStatuses: NetworkStatus[],
  inverse: boolean,
): boolean {
  const matches = targetStatuses.includes(currentStatus)
  return inverse ? !matches : matches
}

/**
 * 更新元素显示状态
 */
function updateElementVisibility(
  el: ElementWithNetworkData,
  binding: DirectiveBinding<NetworkStatus | NetworkStatus[] | NetworkDirectiveValue>,
  networkInfo: NetworkInfo,
) {
  const currentStatus = networkInfo.status

  // 性能优化：避免重复计算
  if (el.__lastNetworkStatus === currentStatus) {
    return
  }

  el.__lastNetworkStatus = currentStatus
  const { statuses, inverse, callback } = parseDirectiveValue(binding.value)
  const shouldShow = shouldShowElement(currentStatus, statuses, inverse)

  // 执行回调函数
  if (callback && typeof callback === 'function') {
    callback(networkInfo)
  }

  // 性能优化：只在可见性真正改变时更新 DOM
  if (el.__isVisible !== shouldShow) {
    el.__isVisible = shouldShow

    if (shouldShow) {
      // 显示元素
      if (el.style.display === 'none') {
        el.style.display = el.dataset.originalDisplay || ''
      }
      el.removeAttribute('hidden')
      el.classList.add('network-visible')
      el.classList.remove('network-hidden')
    }
    else {
      // 隐藏元素
      if (!el.dataset.originalDisplay) {
        el.dataset.originalDisplay = el.style.display || ''
      }
      el.style.display = 'none'
      el.setAttribute('hidden', '')
      el.classList.add('network-hidden')
      el.classList.remove('network-visible')
    }

    // 添加网络状态相关的 CSS 类
    el.classList.remove('network-online', 'network-offline')
    el.classList.add(`network-${currentStatus}`)

    // 添加连接类型相关的 CSS 类
    if (networkInfo.type) {
      el.classList.remove('network-wifi', 'network-cellular', 'network-ethernet', 'network-unknown')
      el.classList.add(`network-${networkInfo.type}`)
    }
  }
}

/**
 * v-network 指令实现
 *
 * 根据网络状态控制元素的显示和隐藏
 *
 * @example
 * ```vue
 * <!-- 只在在线时显示 -->
 * <div v-network="'online'">在线内容</div>
 *
 * <!-- 只在离线时显示 -->
 * <div v-network="'offline'">离线提示</div>
 *
 * <!-- 带回调函数 -->
 * <div v-network="{
 *   status: 'online',
 *   callback: (networkInfo) => 
 * }">
 *   在线内容
 * </div>
 *
 * <!-- 反向匹配：除了在线都显示 -->
 * <div v-network="{ status: 'online', inverse: true }">
 *   离线或网络异常提示
 * </div>
 * ```
 */
export const vNetwork: Directive<HTMLElement, NetworkStatus | NetworkStatus[] | NetworkDirectiveValue> = {
  async mounted(el, binding) {
    const detector = getGlobalDetector()
    const elementWithData = el as ElementWithNetworkData

    // 增加元素计数
    elementCount++

    // 初始化元素状态
    elementWithData.__lastNetworkStatus = undefined
    elementWithData.__isVisible = undefined
    elementWithData.__directiveBinding = binding

    try {
      // 加载网络模块并获取初始状态
      const networkModule = await detector.loadModule<import('../../types').NetworkModule>('network')
      if (networkModule && typeof networkModule.getData === 'function') {
        const networkInfo = networkModule.getData()
        updateElementVisibility(elementWithData, binding, networkInfo)

        // 监听网络变化
        const handleNetworkChange = () => {
          updateQueue.add(elementWithData)
          scheduleUpdate()
        }

        // 如果网络模块支持事件监听
        const maybeOn2 = (networkModule as any).on as ((...args: any[]) => any) | undefined
        if (typeof maybeOn2 === 'function') {
          maybeOn2.call(networkModule, 'networkChange', handleNetworkChange)
        }

        // 监听全局设备变化（可能包含网络信息）
        const handleDeviceChange = () => {
          updateQueue.add(elementWithData)
          scheduleUpdate()
        }

        detector.on('deviceChange', handleDeviceChange)

        // 将事件处理器存储到元素上
        elementWithData.__networkChangeHandler = handleNetworkChange
        elementWithData.__deviceChangeHandler = handleDeviceChange
        elementWithData.__deviceDetector = detector
      }
    }
    catch (error) {
      console.warn('Failed to initialize network directive:', error)
    }
  },

  updated(el, binding) {
    const elementWithData = el as ElementWithNetworkData
    const detector = elementWithData.__deviceDetector

    // 更新 binding 引用
    elementWithData.__directiveBinding = binding

    if (detector) {
      detector.loadModule('network').then((networkModule) => {
        if (networkModule && typeof networkModule.getData === 'function') {
          const networkInfo = networkModule.getData() as NetworkInfo
          if (networkInfo) {
            updateElementVisibility(elementWithData, binding, networkInfo)
          }
        }
      }).catch((error) => {
        console.warn('Failed to update network directive:', error)
      })
    }
  },

  unmounted(el) {
    const elementWithData = el as ElementWithNetworkData
    const detector = elementWithData.__deviceDetector
    const networkHandler = elementWithData.__networkChangeHandler
    const deviceHandler = elementWithData.__deviceChangeHandler

    // 减少元素计数
    elementCount--

    // 从更新队列中移除
    updateQueue.delete(elementWithData)

    if (detector) {
      if (deviceHandler) {
        detector.off('deviceChange', deviceHandler)
      }
      if (networkHandler) {
        detector.loadModule<import('../../types').NetworkModule>('network').then((networkModule) => {
          if (networkModule && typeof (networkModule as any).off === 'function') {
            (networkModule as any).off('networkChange', networkHandler)
          }
        }).catch(() => {
          // 忽略错误
        })
      }
    }

    // 清理引用
    delete elementWithData.__networkChangeHandler
    delete elementWithData.__deviceChangeHandler
    delete elementWithData.__deviceDetector
    delete elementWithData.__lastNetworkStatus
    delete elementWithData.__isVisible
    delete elementWithData.__directiveBinding

    // 恢复原始显示状态
    if (el.dataset.originalDisplay) {
      el.style.display = el.dataset.originalDisplay
      delete el.dataset.originalDisplay
    }
    el.removeAttribute('hidden')
    el.classList.remove(
      'network-visible',
      'network-hidden',
      'network-online',
      'network-offline',
      'network-wifi',
      'network-cellular',
      'network-ethernet',
      'network-unknown',
    )

    // 如果没有元素使用检测器了，清理全局检测器
    if (elementCount === 0 && globalDetector) {
      globalDetector.destroy()
      globalDetector = null
    }
  },
}

/**
 * 在线状态指令
 *
 * @example
 * ```vue
 * <div v-network-online>在线时显示</div>
 * ```
 */
export const vNetworkOnline: Directive<HTMLElement> = {
  mounted(el) {
    const binding = {
      value: 'online' as const,
      modifiers: {},
      arg: undefined,
      dir: vNetwork,
      instance: null,
      oldValue: null,
    }
    vNetwork.mounted!(el, binding, null as any, null as any)
  },
  updated(el) {
    const binding = {
      value: 'online' as const,
      modifiers: {},
      arg: undefined,
      dir: vNetwork,
      instance: null,
      oldValue: null,
    }
    vNetwork.updated!(el, binding, null as any, null as any)
  },
  unmounted: vNetwork.unmounted,
}

/**
 * 离线状态指令
 *
 * @example
 * ```vue
 * <div v-network-offline>离线时显示</div>
 * ```
 */
export const vNetworkOffline: Directive<HTMLElement> = {
  mounted(el) {
    const binding = {
      value: 'offline' as const,
      modifiers: {},
      arg: undefined,
      dir: vNetwork,
      instance: null,
      oldValue: null,
    }
    vNetwork.mounted!(el, binding, null as any, null as any)
  },
  updated(el) {
    const binding = {
      value: 'offline' as const,
      modifiers: {},
      arg: undefined,
      dir: vNetwork,
      instance: null,
      oldValue: null,
    }
    vNetwork.updated!(el, binding, null as any, null as any)
  },
  unmounted: vNetwork.unmounted,
}

/**
 * 慢速网络指令（基于网络类型和速度判断）
 *
 * @example
 * ```vue
 * <div v-network-slow>网络较慢时显示的提示</div>
 * ```
 */
export const vNetworkSlow: Directive<HTMLElement> = {
  mounted(el) {
    // 这里可以根据实际需求定义"慢速"的标准
    // 暂时使用离线状态作为示例
    const binding = {
      value: 'offline' as const,
      modifiers: {},
      arg: undefined,
      dir: vNetwork,
      instance: null,
      oldValue: null,
    }
    vNetwork.mounted!(el, binding, null as any, null as any)
  },
  updated(el) {
    const binding = {
      value: 'offline' as const,
      modifiers: {},
      arg: undefined,
      dir: vNetwork,
      instance: null,
      oldValue: null,
    }
    vNetwork.updated!(el, binding, null as any, null as any)
  },
  unmounted: vNetwork.unmounted,
}
