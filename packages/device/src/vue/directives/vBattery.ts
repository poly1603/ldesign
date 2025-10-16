import type { Directive, DirectiveBinding } from 'vue'
import type { BatteryInfo, BatteryModule } from '../../types'
import { DeviceDetector } from '../../core/DeviceDetector'

interface ElementWithBatteryData extends HTMLElement {
  __batteryChangeHandler?: (batteryInfo: BatteryInfo) => void
  __deviceDetector?: DeviceDetector
  __lastBatteryState?: string
  __isVisible?: boolean
  __directiveBinding?: DirectiveBinding<BatteryCondition | BatteryDirectiveValue>
}

type BatteryCondition = 'charging' | 'low' | 'critical' | 'full'

interface BatteryDirectiveValue {
  condition: BatteryCondition | BatteryCondition[]
  threshold?: number // 用于 low/critical 条件的阈值
  inverse?: boolean
  callback?: (batteryInfo: BatteryInfo) => void
}

// 全局设备检测器实例
let globalDetector: DeviceDetector | null = null
let elementCount = 0

// 性能优化：批量更新队列
const updateQueue: Set<ElementWithBatteryData> = new Set()
let isUpdateScheduled = false

/**
 * 获取全局设备检测器实例
 */
function getGlobalDetector(): DeviceDetector {
  if (!globalDetector) {
    globalDetector = new DeviceDetector({
      modules: ['battery'],
    })

    // 初始化电池模块
    globalDetector.loadModule<import('../../types').BatteryModule>('battery').catch((error) => {
      console.warn('Failed to load battery module:', error)
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
          const batteryModule = await detector.loadModule<BatteryModule>('battery')
          if (batteryModule && typeof batteryModule.getData === 'function') {
            const batteryInfo = batteryModule.getData()
            updateElementVisibility(element, element.__directiveBinding, batteryInfo)
          }
        }
        catch (error) {
          console.warn('Failed to get battery info:', error)
        }
      }
    })
  })
}

/**
 * 解析指令绑定值
 */
function parseDirectiveValue(value: BatteryCondition | BatteryDirectiveValue): {
  conditions: BatteryCondition[]
  threshold: number
  inverse: boolean
  callback?: (batteryInfo: BatteryInfo) => void
} {
  if (typeof value === 'string') {
    return {
      conditions: [value],
      threshold: 0.2, // 默认低电量阈值 20%
      inverse: false,
    }
  }

  if (typeof value === 'object' && value !== null) {
    const conditions = Array.isArray(value.condition) ? value.condition : [value.condition]
    return {
      conditions,
      threshold: value.threshold || 0.2,
      inverse: value.inverse || false,
      callback: value.callback,
    }
  }

  return {
    conditions: [],
    threshold: 0.2,
    inverse: false,
  }
}

/**
 * 检查电池条件是否满足
 */
function checkBatteryCondition(
  batteryInfo: BatteryInfo,
  condition: BatteryCondition,
  threshold: number,
): boolean {
  switch (condition) {
    case 'charging':
      return batteryInfo.charging
    case 'low':
      return batteryInfo.level <= threshold && batteryInfo.level > 0.1
    case 'critical':
      return batteryInfo.level <= 0.1
    case 'full':
      return batteryInfo.level >= 0.95
    default:
      return false
  }
}

/**
 * 检查是否应该显示元素
 */
function shouldShowElement(
  batteryInfo: BatteryInfo,
  conditions: BatteryCondition[],
  threshold: number,
  inverse: boolean,
): boolean {
  const matches = conditions.some(condition =>
    checkBatteryCondition(batteryInfo, condition, threshold),
  )
  return inverse ? !matches : matches
}

/**
 * 获取电池状态字符串
 */
function getBatteryState(batteryInfo: BatteryInfo, threshold: number): string {
  const states = []
  if (batteryInfo.charging)
    states.push('charging')
  if (batteryInfo.level <= 0.1)
    states.push('critical')
  else if (batteryInfo.level <= threshold)
    states.push('low')
  if (batteryInfo.level >= 0.95)
    states.push('full')
  return states.join('-') || 'normal'
}

/**
 * 更新元素显示状态
 */
function updateElementVisibility(
  el: ElementWithBatteryData,
  binding: DirectiveBinding<BatteryCondition | BatteryDirectiveValue>,
  batteryInfo: BatteryInfo,
) {
  const { conditions, threshold, inverse, callback } = parseDirectiveValue(binding.value)
  const currentState = getBatteryState(batteryInfo, threshold)

  // 性能优化：避免重复计算
  if (el.__lastBatteryState === currentState) {
    return
  }

  el.__lastBatteryState = currentState
  const shouldShow = shouldShowElement(batteryInfo, conditions, threshold, inverse)

  // 执行回调函数
  if (callback && typeof callback === 'function') {
    callback(batteryInfo)
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
      el.classList.add('battery-visible')
      el.classList.remove('battery-hidden')
    }
    else {
      // 隐藏元素
      if (!el.dataset.originalDisplay) {
        el.dataset.originalDisplay = el.style.display || ''
      }
      el.style.display = 'none'
      el.setAttribute('hidden', '')
      el.classList.add('battery-hidden')
      el.classList.remove('battery-visible')
    }

    // 添加电池状态相关的 CSS 类
    el.classList.remove('battery-charging', 'battery-low', 'battery-critical', 'battery-full', 'battery-normal')
    currentState.split('-').forEach((state) => {
      el.classList.add(`battery-${state}`)
    })

    // 添加电量百分比相关的 CSS 类
    const levelClass = `battery-level-${Math.floor(batteryInfo.level * 10) * 10}`
    el.classList.remove(...Array.from(el.classList).filter(cls => cls.startsWith('battery-level-')))
    el.classList.add(levelClass)
  }
}

/**
 * v-battery 指令实现
 *
 * 根据电池状态控制元素的显示和隐藏
 *
 * @example
 * ```vue
 * <!-- 充电时显示 -->
 * <div v-battery="'charging'">正在充电</div>
 *
 * <!-- 低电量时显示 -->
 * <div v-battery="'low'">电量不足</div>
 *
 * <!-- 自定义低电量阈值 -->
 * <div v-battery="{ condition: 'low', threshold: 0.3 }">
 *   电量低于30%
 * </div>
 *
 * <!-- 带回调函数 -->
 * <div v-battery="{
 *   condition: 'charging',
 *   callback: (battery) => 
 * }">
 *   充电中
 * </div>
 * ```
 */
export const vBattery: Directive<HTMLElement, BatteryCondition | BatteryDirectiveValue> = {
  async mounted(el, binding) {
    const detector = getGlobalDetector()
    const elementWithData = el as ElementWithBatteryData

    // 增加元素计数
    elementCount++

    // 初始化元素状态
    elementWithData.__lastBatteryState = undefined
    elementWithData.__isVisible = undefined
    elementWithData.__directiveBinding = binding

    try {
      // 加载电池模块并获取初始状态
      const batteryModule = await detector.loadModule<BatteryModule>('battery')
      if (batteryModule && typeof batteryModule.getData === 'function') {
        const batteryInfo = batteryModule.getData()
        updateElementVisibility(elementWithData, binding, batteryInfo)

        // 监听电池变化
        const handleBatteryChange = () => {
          updateQueue.add(elementWithData)
          scheduleUpdate()
        }

        // 如果电池模块支持事件监听
        const maybeOn = (batteryModule as any).on as ((...args: any[]) => any) | undefined
        if (typeof maybeOn === 'function') {
          maybeOn.call(batteryModule, 'batteryChange', handleBatteryChange)
          elementWithData.__batteryChangeHandler = handleBatteryChange
        }

        elementWithData.__deviceDetector = detector
      }
    }
    catch (error) {
      console.warn('Failed to initialize battery directive:', error)
    }
  },

  updated(el, binding) {
    const elementWithData = el as ElementWithBatteryData
    const detector = elementWithData.__deviceDetector

    // 更新 binding 引用
    elementWithData.__directiveBinding = binding

    if (detector) {
      detector.loadModule('battery').then((batteryModule) => {
        if (batteryModule && typeof batteryModule.getData === 'function') {
          const batteryInfo = batteryModule.getData() as BatteryInfo
          if (batteryInfo) {
            updateElementVisibility(elementWithData, binding, batteryInfo)
          }
        }
      }).catch((error) => {
        console.warn('Failed to update battery directive:', error)
      })
    }
  },

  unmounted(el) {
    const elementWithData = el as ElementWithBatteryData
    const detector = elementWithData.__deviceDetector
    const handler = elementWithData.__batteryChangeHandler

    // 减少元素计数
    elementCount--

    // 从更新队列中移除
    updateQueue.delete(elementWithData)

    if (detector && handler) {
      // 如果电池模块支持事件移除
      detector.loadModule<BatteryModule>('battery').then((batteryModule) => {
        const maybeOff = (batteryModule as any).off as ((...args: any[]) => any) | undefined
        if (batteryModule && typeof maybeOff === 'function' && handler) {
          maybeOff.call(batteryModule, 'batteryChange', handler)
        }
      }).catch(() => {
        // 忽略错误
      })
    }

    // 清理引用
    delete elementWithData.__batteryChangeHandler
    delete elementWithData.__deviceDetector
    delete elementWithData.__lastBatteryState
    delete elementWithData.__isVisible
    delete elementWithData.__directiveBinding

    // 恢复原始显示状态
    if (el.dataset.originalDisplay) {
      el.style.display = el.dataset.originalDisplay
      delete el.dataset.originalDisplay
    }
    el.removeAttribute('hidden')
    el.classList.remove(
      'battery-visible',
      'battery-hidden',
      'battery-charging',
      'battery-low',
      'battery-critical',
      'battery-full',
      'battery-normal',
      ...Array.from(el.classList).filter(cls => cls.startsWith('battery-level-')),
    )

    // 如果没有元素使用检测器了，清理全局检测器
    if (elementCount === 0 && globalDetector) {
      globalDetector.destroy()
      globalDetector = null
    }
  },
}

/**
 * 充电状态指令
 *
 * @example
 * ```vue
 * <div v-battery-charging>充电时显示</div>
 * ```
 */
export const vBatteryCharging: Directive<HTMLElement> = {
  mounted(el) {
    const binding = {
      value: 'charging' as const,
      modifiers: {},
      arg: undefined,
      dir: vBattery,
      instance: null,
      oldValue: null,
    }
    vBattery.mounted!(el, binding, null as any, null as any)
  },
  updated(el) {
    const binding = {
      value: 'charging' as const,
      modifiers: {},
      arg: undefined,
      dir: vBattery,
      instance: null,
      oldValue: null,
    }
    vBattery.updated!(el, binding, null as any, null as any)
  },
  unmounted: vBattery.unmounted,
}

/**
 * 低电量状态指令
 *
 * @example
 * ```vue
 * <div v-battery-low>低电量时显示</div>
 * ```
 */
export const vBatteryLow: Directive<HTMLElement> = {
  mounted(el) {
    const binding = {
      value: 'low' as const,
      modifiers: {},
      arg: undefined,
      dir: vBattery,
      instance: null,
      oldValue: null,
    }
    vBattery.mounted!(el, binding, null as any, null as any)
  },
  updated(el) {
    const binding = {
      value: 'low' as const,
      modifiers: {},
      arg: undefined,
      dir: vBattery,
      instance: null,
      oldValue: null,
    }
    vBattery.updated!(el, binding, null as any, null as any)
  },
  unmounted: vBattery.unmounted,
}
