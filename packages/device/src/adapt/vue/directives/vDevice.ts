import type { Directive, DirectiveBinding } from 'vue'
import type { DeviceDirectiveValue, DeviceInfo, DeviceType } from '../../../types'
import { DeviceDetector } from '../../../core/DeviceDetector'

interface ElementWithDeviceData extends HTMLElement {
  __deviceChangeHandler?: (deviceInfo: DeviceInfo) => void
  __deviceDetector?: DeviceDetector
}

// 全局设备检测器实例
let globalDetector: DeviceDetector | null = null

/**
 * 获取全局设备检测器实例
 */
function getGlobalDetector(): DeviceDetector {
  if (!globalDetector) {
    globalDetector = new DeviceDetector()
  }
  return globalDetector
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
function shouldShowElement(currentType: DeviceType, targetTypes: DeviceType[], inverse: boolean): boolean {
  const matches = targetTypes.includes(currentType)
  return inverse ? !matches : matches
}

/**
 * 更新元素显示状态
 */
function updateElementVisibility(
  el: HTMLElement,
  binding: DirectiveBinding<DeviceDirectiveValue>,
  currentType: DeviceType,
) {
  const { types, inverse } = parseDirectiveValue(binding.value)
  const shouldShow = shouldShowElement(currentType, types, inverse)

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

/**
 * v-device 指令实现
 */
export const vDevice: Directive<HTMLElement, DeviceDirectiveValue> = {
  mounted(el, binding) {
    const detector = getGlobalDetector()
    const currentType = detector.getDeviceType()

    // 初始化显示状态
    updateElementVisibility(el, binding, currentType)

    // 监听设备变化
    const handleDeviceChange = (deviceInfo: DeviceInfo) => {
      updateElementVisibility(el, binding, deviceInfo.type)
    }

    detector.on('deviceChange', handleDeviceChange)

    // 将事件处理器存储到元素上，以便在卸载时移除
    const elementWithData = el as ElementWithDeviceData
    elementWithData.__deviceChangeHandler = handleDeviceChange
    elementWithData.__deviceDetector = detector
  },

  updated(el, binding) {
    const elementWithData = el as ElementWithDeviceData
    const detector = elementWithData.__deviceDetector
    if (detector) {
      const currentType = detector.getDeviceType()
      updateElementVisibility(el, binding, currentType)
    }
  },

  unmounted(el) {
    const elementWithData = el as ElementWithDeviceData
    const detector = elementWithData.__deviceDetector
    const handler = elementWithData.__deviceChangeHandler

    if (detector && handler) {
      detector.off('deviceChange', handler)
    }

    // 清理引用
    delete elementWithData.__deviceChangeHandler
    delete elementWithData.__deviceDetector

    // 恢复原始显示状态
    if (el.dataset.originalDisplay) {
      el.style.display = el.dataset.originalDisplay
      delete el.dataset.originalDisplay
    }
    el.removeAttribute('hidden')
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
