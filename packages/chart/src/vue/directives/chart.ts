/**
 * v-chart 指令
 * 
 * 提供指令式的图表创建方式
 */

import type { Directive, DirectiveBinding } from 'vue'
import { Chart } from '../../core/Chart'
import type { ChartDirectiveValue, VueChartInstance } from '../types'

/**
 * 存储图表实例的 WeakMap
 */
const chartInstances = new WeakMap<HTMLElement, VueChartInstance>()

/**
 * 创建图表实例
 */
function createChart(el: HTMLElement, binding: DirectiveBinding<ChartDirectiveValue>) {
  const { type, data, config = {}, theme = 'light', listeners = {} } = binding.value

  try {
    // 创建图表实例
    const instance = new Chart(el, {
      type,
      data,
      ...config,
      theme
    }) as VueChartInstance

    // 注册事件监听器
    Object.entries(listeners).forEach(([eventType, handler]) => {
      instance.on(eventType as any, handler)
    })

    // 存储实例
    chartInstances.set(el, instance)

    return instance
  } catch (error) {
    console.error('创建图表失败:', error)
    return null
  }
}

/**
 * 更新图表实例
 */
function updateChart(el: HTMLElement, binding: DirectiveBinding<ChartDirectiveValue>) {
  const instance = chartInstances.get(el)
  if (!instance) return

  const { data, config = {}, theme, listeners = {} } = binding.value
  const oldValue = binding.oldValue

  try {
    // 更新数据
    if (data !== oldValue?.data) {
      instance.updateData(data)
    }

    // 更新配置
    if (config !== oldValue?.config) {
      instance.updateConfig(config)
    }

    // 更新主题
    if (theme !== oldValue?.theme && theme) {
      instance.setTheme(theme)
    }

    // 更新事件监听器
    if (listeners !== oldValue?.listeners) {
      // 移除旧的监听器
      if (oldValue?.listeners) {
        Object.entries(oldValue.listeners).forEach(([eventType, handler]) => {
          instance.off(eventType as any, handler)
        })
      }

      // 添加新的监听器
      Object.entries(listeners).forEach(([eventType, handler]) => {
        instance.on(eventType as any, handler)
      })
    }
  } catch (error) {
    console.error('更新图表失败:', error)
  }
}

/**
 * 销毁图表实例
 */
function destroyChart(el: HTMLElement) {
  const instance = chartInstances.get(el)
  if (instance) {
    try {
      instance.dispose()
      chartInstances.delete(el)
    } catch (error) {
      console.error('销毁图表失败:', error)
    }
  }
}

/**
 * v-chart 指令定义
 */
export const chartDirective: Directive<HTMLElement, ChartDirectiveValue> = {
  /**
   * 指令挂载时
   */
  mounted(el, binding) {
    // 确保元素有合适的样式
    if (!el.style.width) {
      el.style.width = '100%'
    }
    if (!el.style.height) {
      el.style.height = '400px'
    }

    // 创建图表
    createChart(el, binding)
  },

  /**
   * 指令更新时
   */
  updated(el, binding) {
    // 如果值没有变化，跳过更新
    if (binding.value === binding.oldValue) return

    // 如果图表类型变化，需要重新创建
    if (binding.value.type !== binding.oldValue?.type) {
      destroyChart(el)
      createChart(el, binding)
    } else {
      // 否则只更新数据和配置
      updateChart(el, binding)
    }
  },

  /**
   * 指令卸载时
   */
  unmounted(el) {
    destroyChart(el)
  }
}

/**
 * 获取图表实例
 * 
 * @param el - DOM 元素
 * @returns 图表实例
 */
export function getChartInstance(el: HTMLElement): VueChartInstance | undefined {
  return chartInstances.get(el)
}

/**
 * 指令安装函数
 */
export function install(app: any) {
  app.directive('chart', chartDirective)
}

// 默认导出指令
export default chartDirective
