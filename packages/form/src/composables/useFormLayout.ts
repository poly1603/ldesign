// useFormLayout Composition API Hook

import type { FormItemConfig } from '../types/field'
import type { FieldLayout, LayoutConfig, LayoutResult } from '../types/layout'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { LayoutCalculator } from '../core/LayoutCalculator'
import { throttle } from '../utils/throttle'

/**
 * useFormLayout Hook 选项
 */
export interface UseFormLayoutOptions {
  /** 字段配置 */
  fields: FormItemConfig[]

  /** 布局配置 */
  config?: LayoutConfig

  /** 容器元素引用 */
  containerRef?: HTMLElement | (() => HTMLElement | null)

  /** 是否自动计算布局 */
  autoCalculate?: boolean

  /** 布局计算延迟时间 */
  calculateDelay?: number

  /** 是否监听窗口大小变化 */
  watchResize?: boolean
}

/**
 * useFormLayout Hook 返回值
 */
export interface UseFormLayoutReturn {
  /** 布局计算器实例 */
  layoutCalculator: LayoutCalculator

  /** 布局结果 */
  layout: LayoutResult | null

  /** 容器尺寸 */
  containerSize: {
    width: number
    height: number
  }

  /** 当前断点 */
  currentBreakpoint: string

  /** 是否需要展开按钮 */
  needsExpand: boolean

  /** 展开状态 */
  expanded: boolean

  /** 可见字段 */
  visibleFields: FormItemConfig[]

  /** 隐藏字段 */
  hiddenFields: FormItemConfig[]

  /** 计算布局 */
  calculateLayout: (
    containerWidth?: number,
    containerHeight?: number
  ) => LayoutResult | null

  /** 重新计算布局 */
  recalculateLayout: () => void

  /** 切换展开状态 */
  toggleExpand: () => void

  /** 设置展开状态 */
  setExpanded: (expanded: boolean) => void

  /** 获取字段布局 */
  getFieldLayout: (fieldName: string) => FieldLayout | null

  /** 获取字段样式 */
  getFieldStyle: (fieldName: string) => Record<string, any>

  /** 获取容器样式 */
  getContainerStyle: () => Record<string, any>

  /** 获取布局统计信息 */
  getLayoutStats: () => {
    totalRows: number
    visibleRows: number
    hiddenRows: number
    averageSpan: number
    utilization: number
  }

  /** 更新布局配置 */
  updateConfig: (config: Partial<LayoutConfig>) => void
}

/**
 * useFormLayout Hook
 */
export function useFormLayout(
  options: UseFormLayoutOptions
): UseFormLayoutReturn {
  const {
    fields,
    config = {},
    containerRef,
    autoCalculate = true,
    calculateDelay = 100,
    watchResize = true,
  } = options

  // 创建布局计算器
  const layoutCalculator = new LayoutCalculator(config)

  // 响应式状态
  const layout = ref<LayoutResult | null>(null)
  const containerSize = reactive({ width: 0, height: 0 })
  const currentBreakpoint = ref('lg')
  const expanded = ref(false)

  // 计算属性
  const needsExpand = computed(() => {
    return layout.value?.needsExpand || false
  })

  const visibleFields = computed(() => {
    if (!layout.value) return fields

    return layout.value.fields
      .filter(fieldLayout => expanded.value || fieldLayout.visible)
      .map(fieldLayout => fields.find(f => f.name === fieldLayout.name)!)
      .filter(Boolean)
  })

  const hiddenFields = computed(() => {
    if (!layout.value) return []

    return layout.value.fields
      .filter(fieldLayout => !expanded.value && !fieldLayout.visible)
      .map(fieldLayout => fields.find(f => f.name === fieldLayout.name)!)
      .filter(Boolean)
  })

  // 获取容器元素
  const getContainer = (): HTMLElement | null => {
    if (typeof containerRef === 'function') {
      return containerRef()
    }
    return containerRef || null
  }

  // 计算布局
  const calculateLayout = (
    containerWidth?: number,
    containerHeight?: number
  ): LayoutResult | null => {
    const container = getContainer()

    const width = containerWidth ?? container?.offsetWidth ?? 800
    const height = containerHeight ?? container?.offsetHeight ?? 0

    containerSize.width = width
    containerSize.height = height

    const result = layoutCalculator.calculateLayout(fields, width, height)
    layout.value = result
    currentBreakpoint.value = layoutCalculator.getCurrentBreakpoint()

    return result
  }

  // 防抖的重新计算布局
  const debouncedCalculateLayout = throttle(() => {
    if (autoCalculate) {
      calculateLayout()
    }
  }, calculateDelay)

  // 重新计算布局
  const recalculateLayout = () => {
    nextTick(() => {
      calculateLayout()
    })
  }

  // 切换展开状态
  const toggleExpand = () => {
    expanded.value = !expanded.value
  }

  // 设置展开状态
  const setExpanded = (isExpanded: boolean) => {
    expanded.value = isExpanded
  }

  // 获取字段布局
  const getFieldLayout = (fieldName: string): FieldLayout | null => {
    if (!layout.value) return null
    return layout.value.fields.find(field => field.name === fieldName) || null
  }

  // 获取字段样式
  const getFieldStyle = (fieldName: string): Record<string, any> => {
    const fieldLayout = getFieldLayout(fieldName)
    if (!fieldLayout) return {}

    return {
      gridColumn: `span ${fieldLayout.span}`,
      width: fieldLayout.width ? `${fieldLayout.width}px` : undefined,
      height: fieldLayout.height ? `${fieldLayout.height}px` : undefined,
      display: fieldLayout.visible ? undefined : 'none',
    }
  }

  // 获取容器样式
  const getContainerStyle = (): Record<string, any> => {
    if (!layout.value) return {}

    const layoutConfig = layoutCalculator.getConfig()

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${layout.value.columns}, 1fr)`,
      gap: `${layoutConfig.verticalGap || 16}px ${
        layoutConfig.horizontalGap || 16
      }px`,
      width: '100%',
    }
  }

  // 获取布局统计信息
  const getLayoutStats = () => {
    if (!layout.value) {
      return {
        totalRows: 0,
        visibleRows: 0,
        hiddenRows: 0,
        averageSpan: 0,
        utilization: 0,
      }
    }

    return layoutCalculator.getLayoutStats(layout.value)
  }

  // 更新布局配置
  const updateConfig = (newConfig: Partial<LayoutConfig>) => {
    layoutCalculator.updateConfig(newConfig)
    recalculateLayout()
  }

  // 窗口大小变化处理
  const handleResize = () => {
    debouncedCalculateLayout()
  }

  // 监听字段变化
  watch(
    () => fields,
    () => {
      recalculateLayout()
    },
    { deep: true }
  )

  // 监听展开状态变化
  watch(expanded, () => {
    // 展开状态变化时可能需要重新计算布局
    if (layout.value?.needsExpand) {
      recalculateLayout()
    }
  })

  // 生命周期
  onMounted(() => {
    // 初始计算布局
    if (autoCalculate) {
      nextTick(() => {
        calculateLayout()
      })
    }

    // 监听窗口大小变化
    if (watchResize) {
      window.addEventListener('resize', handleResize)
    }
  })

  onUnmounted(() => {
    // 清理事件监听器
    if (watchResize) {
      window.removeEventListener('resize', handleResize)
    }

    // 销毁布局计算器
    layoutCalculator.destroy()
  })

  return {
    layoutCalculator,
    layout: layout.value,
    containerSize,
    currentBreakpoint,
    needsExpand,
    expanded,
    visibleFields,
    hiddenFields,
    calculateLayout,
    recalculateLayout,
    toggleExpand,
    setExpanded,
    getFieldLayout,
    getFieldStyle,
    getContainerStyle,
    getLayoutStats,
    updateConfig,
  }
}
