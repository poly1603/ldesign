import type { Directive, DirectiveBinding } from 'vue'
import type { DeviceInfo, Orientation } from '../../types'
import { DeviceDetector } from '../../core/DeviceDetector'

interface ElementWithOrientationData extends HTMLElement {
  __orientationChangeHandler?: (deviceInfo: DeviceInfo) => void
  __deviceDetector?: DeviceDetector
  __lastOrientation?: Orientation
  __isVisible?: boolean
  __directiveBinding?: DirectiveBinding<Orientation | Orientation[] | OrientationDirectiveValue>
}

interface OrientationDirectiveValue {
  orientation: Orientation | Orientation[]
  inverse?: boolean
  callback?: (orientation: Orientation) => void
}

// 全局设备检测器实例
let globalDetector: DeviceDetector | null = null
let elementCount = 0

// 性能优化：批量更新队列
const updateQueue: Set<ElementWithOrientationData> = new Set()
let isUpdateScheduled = false

/**
 * 获取全局设备检测器实例
 */
function getGlobalDetector(): DeviceDetector {
  if (!globalDetector) {
    globalDetector = new DeviceDetector({
      enableOrientation: true,
      enableResize: true,
    })

    // 全局方向变化处理器
    globalDetector.on('deviceChange', () => {
      scheduleUpdate()
    })

    globalDetector.on('orientationChange', () => {
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

    elementsToUpdate.forEach((element) => {
      if (element.isConnected && element.__directiveBinding) {
        const detector = getGlobalDetector()
        const currentOrientation = detector.getDeviceInfo().orientation
        updateElementVisibility(element, element.__directiveBinding, currentOrientation)
      }
    })
  })
}

/**
 * 解析指令绑定值
 */
function parseDirectiveValue(value: Orientation | Orientation[] | OrientationDirectiveValue): {
  orientations: Orientation[]
  inverse: boolean
  callback?: (orientation: Orientation) => void
} {
  if (typeof value === 'string') {
    return {
      orientations: [value],
      inverse: false,
    }
  }

  if (Array.isArray(value)) {
    return {
      orientations: value,
      inverse: false,
    }
  }

  if (typeof value === 'object' && value !== null) {
    const orientations = Array.isArray(value.orientation) ? value.orientation : [value.orientation]
    return {
      orientations,
      inverse: value.inverse || false,
      callback: value.callback,
    }
  }

  return {
    orientations: [],
    inverse: false,
  }
}

/**
 * 检查是否应该显示元素
 */
function shouldShowElement(
  currentOrientation: Orientation,
  targetOrientations: Orientation[],
  inverse: boolean,
): boolean {
  const matches = targetOrientations.includes(currentOrientation)
  return inverse ? !matches : matches
}

/**
 * 更新元素显示状态
 */
function updateElementVisibility(
  el: ElementWithOrientationData,
  binding: DirectiveBinding<Orientation | Orientation[] | OrientationDirectiveValue>,
  currentOrientation: Orientation,
) {
  // 性能优化：避免重复计算
  if (el.__lastOrientation === currentOrientation) {
    return
  }

  el.__lastOrientation = currentOrientation
  const { orientations, inverse, callback } = parseDirectiveValue(binding.value)
  const shouldShow = shouldShowElement(currentOrientation, orientations, inverse)

  // 执行回调函数
  if (callback && typeof callback === 'function') {
    callback(currentOrientation)
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
      el.classList.add('orientation-visible')
      el.classList.remove('orientation-hidden')
    }
    else {
      // 隐藏元素
      if (!el.dataset.originalDisplay) {
        el.dataset.originalDisplay = el.style.display || ''
      }
      el.style.display = 'none'
      el.setAttribute('hidden', '')
      el.classList.add('orientation-hidden')
      el.classList.remove('orientation-visible')
    }

    // 添加方向相关的 CSS 类
    el.classList.remove('orientation-portrait', 'orientation-landscape')
    el.classList.add(`orientation-${currentOrientation}`)
  }
}

/**
 * v-orientation 指令实现
 *
 * 根据屏幕方向控制元素的显示和隐藏
 *
 * @example
 * ```vue
 * <!-- 只在竖屏时显示 -->
 * <div v-orientation="'portrait'">竖屏内容</div>
 *
 * <!-- 只在横屏时显示 -->
 * <div v-orientation="'landscape'">横屏内容</div>
 *
 * <!-- 带回调函数 -->
 * <div v-orientation="{
 *   orientation: 'portrait',
 *   callback: (orientation) => 
 * }">
 *   竖屏内容
 * </div>
 *
 * <!-- 反向匹配：除了竖屏都显示 -->
 * <div v-orientation="{ orientation: 'portrait', inverse: true }">
 *   横屏内容
 * </div>
 * ```
 */
export const vOrientation: Directive<HTMLElement, Orientation | Orientation[] | OrientationDirectiveValue> = {
  mounted(el, binding) {
    const detector = getGlobalDetector()
    const elementWithData = el as ElementWithOrientationData
    const currentOrientation = detector.getDeviceInfo().orientation

    // 增加元素计数
    elementCount++

    // 初始化元素状态
    elementWithData.__lastOrientation = undefined
    elementWithData.__isVisible = undefined
    elementWithData.__directiveBinding = binding

    // 初始化显示状态
    updateElementVisibility(elementWithData, binding, currentOrientation)

    // 监听方向变化
    const handleDeviceChange = () => {
      updateQueue.add(elementWithData)
      scheduleUpdate()
    }
    const handleOrientation = (_o: Orientation) => {
      updateQueue.add(elementWithData)
      scheduleUpdate()
    }

    detector.on('deviceChange', handleDeviceChange)
    detector.on('orientationChange', handleOrientation)

    // 存储其中一个处理器，便于解绑 deviceChange；orientationChange 的处理器不存储避免签名不匹配
    elementWithData.__orientationChangeHandler = handleDeviceChange
    elementWithData.__deviceDetector = detector
  },

  updated(el, binding) {
    const elementWithData = el as ElementWithOrientationData
    const detector = elementWithData.__deviceDetector

    // 更新 binding 引用
    elementWithData.__directiveBinding = binding

    if (detector) {
      const currentOrientation = detector.getDeviceInfo().orientation
      updateElementVisibility(elementWithData, binding, currentOrientation)
    }
  },

  unmounted(el) {
    const elementWithData = el as ElementWithOrientationData
    const detector = elementWithData.__deviceDetector
    const handler = elementWithData.__orientationChangeHandler

    // 减少元素计数
    elementCount--

    // 从更新队列中移除
    updateQueue.delete(elementWithData)

    if (detector && handler) {
      detector.off('deviceChange', handler)
    }

    // 清理引用
    delete elementWithData.__orientationChangeHandler
    delete elementWithData.__deviceDetector
    delete elementWithData.__lastOrientation
    delete elementWithData.__isVisible
    delete elementWithData.__directiveBinding

    // 恢复原始显示状态
    if (el.dataset.originalDisplay) {
      el.style.display = el.dataset.originalDisplay
      delete el.dataset.originalDisplay
    }
    el.removeAttribute('hidden')
    el.classList.remove('orientation-visible', 'orientation-hidden', 'orientation-portrait', 'orientation-landscape')

    // 如果没有元素使用检测器了，清理全局检测器
    if (elementCount === 0 && globalDetector) {
      globalDetector.destroy()
      globalDetector = null
    }
  },
}

/**
 * 竖屏方向指令
 *
 * @example
 * ```vue
 * <div v-orientation-portrait>只在竖屏显示</div>
 * ```
 */
export const vOrientationPortrait: Directive<HTMLElement> = {
  mounted(el) {
    const binding = {
      value: 'portrait' as const,
      modifiers: {},
      arg: undefined,
      dir: vOrientation,
      instance: null,
      oldValue: null,
    }
    vOrientation.mounted!(el, binding, null as any, null as any)
  },
  updated(el) {
    const binding = {
      value: 'portrait' as const,
      modifiers: {},
      arg: undefined,
      dir: vOrientation,
      instance: null,
      oldValue: null,
    }
    vOrientation.updated!(el, binding, null as any, null as any)
  },
  unmounted: vOrientation.unmounted,
}

/**
 * 横屏方向指令
 *
 * @example
 * ```vue
 * <div v-orientation-landscape>只在横屏显示</div>
 * ```
 */
export const vOrientationLandscape: Directive<HTMLElement> = {
  mounted(el) {
    const binding = {
      value: 'landscape' as const,
      modifiers: {},
      arg: undefined,
      dir: vOrientation,
      instance: null,
      oldValue: null,
    }
    vOrientation.mounted!(el, binding, null as any, null as any)
  },
  updated(el) {
    const binding = {
      value: 'landscape' as const,
      modifiers: {},
      arg: undefined,
      dir: vOrientation,
      instance: null,
      oldValue: null,
    }
    vOrientation.updated!(el, binding, null as any, null as any)
  },
  unmounted: vOrientation.unmounted,
}
