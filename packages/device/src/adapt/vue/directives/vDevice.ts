import type { Directive, DirectiveBinding } from 'vue'
import type {
  DeviceDirectiveValue,
  DeviceInfo,
  DeviceType,
} from '../../../types'
import { DeviceDetector } from '../../../core/DeviceDetector'

interface ElementWithDeviceData extends HTMLElement {
  __deviceChangeHandler?: (deviceInfo: DeviceInfo) => void
  __deviceDetector?: DeviceDetector
  __lastDeviceType?: DeviceType
  __isVisible?: boolean
  __directiveBinding?: DirectiveBinding<DeviceDirectiveValue>
}

// 全局设备检测器实例和性能优化
let globalDetector: DeviceDetector | null = null
let elementCount = 0
let lastGlobalDeviceType: DeviceType | null = null

// 性能优化：批量更新队列
let updateQueue: Set<ElementWithDeviceData> = new Set()
let isUpdateScheduled = false

/**
 * 获取全局设备检测器实例 - 优化版本
 */
function getGlobalDetector(): DeviceDetector {
  if (!globalDetector) {
    globalDetector = new DeviceDetector()

    // 全局设备变化处理器
    globalDetector.on('deviceChange', (deviceInfo: DeviceInfo) => {
      lastGlobalDeviceType = deviceInfo.type
      scheduleUpdate()
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

    elementsToUpdate.forEach(element => {
      if (element.isConnected && element.__directiveBinding) {
        const detector = getGlobalDetector()
        const currentType = detector.getDeviceType()
        updateElementVisibility(element, element.__directiveBinding, currentType)
      }
    })
  })
}

/**
 * 解析指令绑定值
 */
function parseDirectiveValue(value: DeviceDirectiveValue): {
  types: DeviceType[]
  inverse: boolean
} {
  if (typeof value === 'string') {
    return {
      types: [value],
      inverse: false,
    }
  }

  if (Array.isArray(value)) {
    return {
      types: value,
      inverse: false,
    }
  }

  if (typeof value === 'object' && value !== null) {
    const types = Array.isArray(value.type) ? value.type : [value.type]
    return {
      types,
      inverse: value.inverse || false,
    }
  }

  return {
    types: [],
    inverse: false,
  }
}

/**
 * 检查是否应该显示元素
 */
function shouldShowElement(
  currentType: DeviceType,
  targetTypes: DeviceType[],
  inverse: boolean,
): boolean {
  const matches = targetTypes.includes(currentType)
  return inverse ? !matches : matches
}

/**
 * 更新元素显示状态 - 优化版本
 */
function updateElementVisibility(
  el: ElementWithDeviceData,
  binding: DirectiveBinding<DeviceDirectiveValue>,
  currentType: DeviceType,
) {
  // 性能优化：避免重复计算
  if (el.__lastDeviceType === currentType) {
    return
  }

  el.__lastDeviceType = currentType
  const { types, inverse } = parseDirectiveValue(binding.value)
  const shouldShow = shouldShowElement(currentType, types, inverse)

  // 性能优化：只在可见性真正改变时更新 DOM
  if (el.__isVisible !== shouldShow) {
    el.__isVisible = shouldShow

    if (shouldShow) {
      // 显示元素
      if (el.style.display === 'none') {
        el.style.display = el.dataset.originalDisplay || ''
      }
      el.removeAttribute('hidden')
    }
    else {
      // 隐藏元素
      if (!el.dataset.originalDisplay) {
        el.dataset.originalDisplay = el.style.display || ''
      }
      el.style.display = 'none'
      el.setAttribute('hidden', '')
    }
  }
}

/**
 * v-device 指令实现
 */
export const vDevice: Directive<HTMLElement, DeviceDirectiveValue> = {
  mounted(el, binding) {
    const detector = getGlobalDetector()
    const elementWithData = el as ElementWithDeviceData
    const currentType = detector.getDeviceType()

    // 增加元素计数
    elementCount++

    // 初始化元素状态
    elementWithData.__lastDeviceType = undefined
    elementWithData.__isVisible = undefined
    elementWithData.__directiveBinding = binding

    // 初始化显示状态
    updateElementVisibility(elementWithData, binding, currentType)

    // 监听设备变化 - 使用批量更新优化性能
    const handleDeviceChange = (deviceInfo: DeviceInfo) => {
      updateQueue.add(elementWithData)
      scheduleUpdate()
    }

    detector.on('deviceChange', handleDeviceChange)

    // 将事件处理器存储到元素上，以便在卸载时移除
    elementWithData.__deviceChangeHandler = handleDeviceChange
    elementWithData.__deviceDetector = detector
  },

  updated(el, binding) {
    const elementWithData = el as ElementWithDeviceData
    const detector = elementWithData.__deviceDetector

    // 更新 binding 引用
    elementWithData.__directiveBinding = binding

    if (detector) {
      const currentType = detector.getDeviceType()
      updateElementVisibility(elementWithData, binding, currentType)
    }
  },

  unmounted(el) {
    const elementWithData = el as ElementWithDeviceData
    const detector = elementWithData.__deviceDetector
    const handler = elementWithData.__deviceChangeHandler

    // 减少元素计数
    elementCount--

    // 从更新队列中移除
    updateQueue.delete(elementWithData)

    if (detector && handler) {
      detector.off('deviceChange', handler)
    }

    // 清理引用
    delete elementWithData.__deviceChangeHandler
    delete elementWithData.__deviceDetector
    delete elementWithData.__lastDeviceType
    delete elementWithData.__isVisible
    delete elementWithData.__directiveBinding

    // 恢复原始显示状态
    if (el.dataset.originalDisplay) {
      el.style.display = el.dataset.originalDisplay
      delete el.dataset.originalDisplay
    }
    el.removeAttribute('hidden')

    // 如果没有元素使用检测器了，清理全局检测器
    if (elementCount === 0 && globalDetector) {
      globalDetector.destroy()
      globalDetector = null
      lastGlobalDeviceType = null
    }
  },
}

/**
 * 设备类型修饰符指令
 */
export const vDeviceMobile: Directive<HTMLElement> = {
  mounted(el) {
    const binding = {
      value: 'mobile' as const,
      modifiers: {},
      arg: undefined,
      dir: vDevice,
      instance: null,
      oldValue: null,
    }
    const detector = getGlobalDetector()
    const currentType = detector.getDeviceType()
    updateElementVisibility(el, binding, currentType)

    const handleDeviceChange = (deviceInfo: DeviceInfo) => {
      updateElementVisibility(el, binding, deviceInfo.type)
    }
    detector.on('deviceChange', handleDeviceChange)
    const elementWithData = el as ElementWithDeviceData
    elementWithData.__deviceChangeHandler = handleDeviceChange
    elementWithData.__deviceDetector = detector
  },
  updated(el) {
    const binding = {
      value: 'mobile' as const,
      modifiers: {},
      arg: undefined,
      dir: vDevice,
      instance: null,
      oldValue: null,
    }
    const detector = (el as ElementWithDeviceData).__deviceDetector
    if (detector) {
      const currentType = detector.getDeviceType()
      updateElementVisibility(el, binding, currentType)
    }
  },
  unmounted: vDevice.unmounted,
}

export const vDeviceTablet: Directive<HTMLElement> = {
  mounted(el) {
    const binding = {
      value: 'tablet' as const,
      modifiers: {},
      arg: undefined,
      dir: vDevice,
      instance: null,
      oldValue: null,
    }
    const detector = getGlobalDetector()
    const currentType = detector.getDeviceType()
    updateElementVisibility(el, binding, currentType)

    const handleDeviceChange = (deviceInfo: DeviceInfo) => {
      updateElementVisibility(el, binding, deviceInfo.type)
    }
    detector.on('deviceChange', handleDeviceChange)
    const elementWithData = el as ElementWithDeviceData
    elementWithData.__deviceChangeHandler = handleDeviceChange
    elementWithData.__deviceDetector = detector
  },
  updated(el) {
    const binding = {
      value: 'tablet' as const,
      modifiers: {},
      arg: undefined,
      dir: vDevice,
      instance: null,
      oldValue: null,
    }
    const detector = (el as ElementWithDeviceData).__deviceDetector
    if (detector) {
      const currentType = detector.getDeviceType()
      updateElementVisibility(el, binding, currentType)
    }
  },
  unmounted: vDevice.unmounted,
}

export const vDeviceDesktop: Directive<HTMLElement> = {
  mounted(el) {
    const binding = {
      value: 'desktop' as const,
      modifiers: {},
      arg: undefined,
      dir: vDevice,
      instance: null,
      oldValue: null,
    }
    const detector = getGlobalDetector()
    const currentType = detector.getDeviceType()
    updateElementVisibility(el, binding, currentType)

    const handleDeviceChange = (deviceInfo: DeviceInfo) => {
      updateElementVisibility(el, binding, deviceInfo.type)
    }
    detector.on('deviceChange', handleDeviceChange)
    const elementWithData = el as ElementWithDeviceData
    elementWithData.__deviceChangeHandler = handleDeviceChange
    elementWithData.__deviceDetector = detector
  },
  updated(el) {
    const binding = {
      value: 'desktop' as const,
      modifiers: {},
      arg: undefined,
      dir: vDevice,
      instance: null,
      oldValue: null,
    }
    const detector = (el as ElementWithDeviceData).__deviceDetector
    if (detector) {
      const currentType = detector.getDeviceType()
      updateElementVisibility(el, binding, currentType)
    }
  },
  unmounted: vDevice.unmounted,
}

/**
 * 清理全局设备检测器
 */
export function cleanupGlobalDetector(): void {
  if (globalDetector) {
    globalDetector.destroy()
    globalDetector = null
  }
}
