// useAdvancedLayout Composition API Hook

import type { FormItemConfig } from '../types/field'
import type { LayoutConfig } from '../types/layout'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  type Ref,
  watch,
} from 'vue'

/**
 * 节流函数
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastExecTime = 0

  return (...args: Parameters<T>) => {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    }
    else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

/**
 * useAdvancedLayout Hook 选项
 */
export interface UseAdvancedLayoutOptions {
  /** 字段配置 */
  fields: FormItemConfig[]

  /** 布局配置 */
  config?: LayoutConfig

  /** 容器元素引用 */
  containerRef?: Ref<HTMLElement | null> | (() => HTMLElement | null)

  /** 表单数据（用于条件显示） */
  formData?: Record<string, any>

  /** 布局计算延迟时间 */
  calculateDelay?: number

  /** 是否监听窗口大小变化 */
  watchResize?: boolean
}

/**
 * useAdvancedLayout Hook 返回值
 */
export interface UseAdvancedLayoutReturn {
  // 响应式状态
  calculatedColumns: Ref<number>
  calculatedLabelWidths: Ref<Record<number, number>>
  isExpanded: Ref<boolean>
  containerSize: { width: number, height: number }

  // 计算方法
  calculateOptimalColumns: () => void
  calculateLabelWidths: (formData?: Record<string, any>) => void
  calculateVisibleFields: (formData?: Record<string, any>) => FormItemConfig[]

  // 切换方法
  toggleAutoColumns: () => void
  toggleUnifiedSpacing: () => void
  toggleAutoLabelWidth: () => void
  toggleExpandMode: () => void
  toggleExpand: () => void

  // 设置方法
  setManualLabelWidth: (column: number, width: number) => void
  updateLayout: (key: string, value: any) => void

  // 工具方法
  shouldShowField: (
    field: FormItemConfig,
    formData?: Record<string, any>
  ) => boolean
  getLabelWidth: (field: FormItemConfig, index: number) => string | number
  getFieldsInColumn: (column: number) => FormItemConfig[]

  // 状态查询
  hasHiddenFields: Ref<boolean>
  needsExpandButton: Ref<boolean>
  visibleFieldsCount: Ref<number>
  hiddenFieldsCount: Ref<number>
}

/**
 * 文本宽度测量缓存
 */
const textWidthCache = new Map<string, number>()

/**
 * 使用 Canvas 精确测量文本宽度
 */
function measureTextWidth(
  text: string,
  font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
): number {
  const cacheKey = `${text}-${font}`

  if (textWidthCache.has(cacheKey)) {
    return textWidthCache.get(cacheKey)!
  }

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  context.font = font

  const width = context.measureText(text).width
  textWidthCache.set(cacheKey, width)

  return width
}

/**
 * useAdvancedLayout Hook
 */
export function useAdvancedLayout(
  options: UseAdvancedLayoutOptions,
): UseAdvancedLayoutReturn {
  const {
    fields,
    config = {},
    containerRef,
    formData = {},
    calculateDelay = 100,
    watchResize = true,
  } = options

  // 响应式状态
  const calculatedColumns = ref(config.columns || 2)
  const calculatedLabelWidths = ref<Record<number, number>>({})
  const isExpanded = ref(false)
  const containerSize = reactive({ width: 0, height: 0 })

  // 当前布局配置（响应式）
  const currentLayout = reactive<LayoutConfig>({
    columns: 2,
    fieldMinWidth: 200,
    autoColumns: false,
    unifiedSpacing: true,
    horizontalGap: 16,
    verticalGap: 16,
    defaultRows: 0,
    expandMode: 'inline',
    showExpandButton: true,
    label: {
      position: 'top',
      width: 'auto',
      align: 'left',
      showColon: false,
      gap: 8,
      autoWidth: false,
      widthMode: 'auto',
      widthByColumn: {},
    },
    button: {
      position: 'newline',
      align: 'left',
    },
    ...config,
  })

  // 计算属性
  const hasHiddenFields = computed(() => {
    const defaultRows = currentLayout.defaultRows || 0
    if (defaultRows <= 0)
      return false

    const allVisibleFields = calculateVisibleFields(formData)
    const columns = calculatedColumns.value
    const maxFields = defaultRows * columns

    return allVisibleFields.length > maxFields
  })

  const needsExpandButton = computed(() => {
    return currentLayout.showExpandButton && hasHiddenFields.value
  })

  const visibleFieldsCount = computed(() => {
    const allVisible = calculateVisibleFields(formData)
    const defaultRows = currentLayout.defaultRows || 0

    if (defaultRows > 0 && !isExpanded.value) {
      const maxFields = defaultRows * calculatedColumns.value
      return Math.min(allVisible.length, maxFields)
    }

    return allVisible.length
  })

  const hiddenFieldsCount = computed(() => {
    const allVisible = calculateVisibleFields(formData)
    return Math.max(0, allVisible.length - visibleFieldsCount.value)
  })

  // 检查字段是否应该显示（基于条件配置）
  const shouldShowField = (field: FormItemConfig, data = formData): boolean => {
    if (!field.showWhen)
      return true

    const {
      field: dependentField,
      value: expectedValue,
      operator = 'equals',
    } = field.showWhen
    const actualValue = data[dependentField]

    switch (operator) {
      case 'equals':
        return actualValue === expectedValue
      case 'not-equals':
        return actualValue !== expectedValue
      case 'includes':
        return Array.isArray(actualValue)
          ? actualValue.includes(expectedValue)
          : false
      case 'not-includes':
        return Array.isArray(actualValue)
          ? !actualValue.includes(expectedValue)
          : true
      case 'greater':
        return Number(actualValue) > Number(expectedValue)
      case 'less':
        return Number(actualValue) < Number(expectedValue)
      default:
        return true
    }
  }

  // 计算可见字段
  const calculateVisibleFields = (data = formData): FormItemConfig[] => {
    return fields.filter(field => shouldShowField(field, data))
  }

  // 计算最佳列数
  const calculateOptimalColumns = (): void => {
    if (!currentLayout.autoColumns)
      return

    const container
      = typeof containerRef === 'function' ? containerRef() : containerRef?.value
    if (!container)
      return

    const containerWidth = container.offsetWidth || container.clientWidth
    const availableWidth = containerWidth - 32 // 减去容器内边距
    const fieldMinWidth = currentLayout.fieldMinWidth || 200
    const optimalColumns = Math.max(
      1,
      Math.min(4, Math.floor(availableWidth / fieldMinWidth)),
    )

    calculatedColumns.value = optimalColumns
    if (currentLayout.autoColumns) {
      currentLayout.columns = optimalColumns
    }
  }

  // 计算标签宽度
  const calculateLabelWidths = (data = formData): void => {
    if (
      !currentLayout.label?.autoWidth
      || currentLayout.label?.position === 'top'
    ) {
      return
    }

    const columns = calculatedColumns.value
    const labelWidths: Record<number, number> = {}
    const visibleFields = calculateVisibleFields(data)

    if (currentLayout.label?.widthMode === 'auto') {
      // 自动计算模式：每列使用该列中最宽标签的宽度
      for (let col = 0; col < columns; col++) {
        let maxWidth = 0
        const fieldsInColumn = visibleFields.filter(
          (_, index) => index % columns === col,
        )

        fieldsInColumn.forEach((field) => {
          const labelText = field.title || ''
          if (labelText) {
            // 使用Canvas精确测量文本宽度
            const textWidth = measureTextWidth(labelText)
            // 加上必要的空间：必填星号(8px) + 冒号(8px) + 余量(16px)
            const totalWidth
              = textWidth
                + (field.required ? 8 : 0)
                + (currentLayout.label?.showColon ? 8 : 0)
                + 16
            maxWidth = Math.max(maxWidth, totalWidth)
          }
        })

        labelWidths[col] = Math.max(80, Math.min(300, maxWidth))
      }
    }
    else {
      // 手动设置模式：使用配置的宽度
      for (let col = 0; col < columns; col++) {
        labelWidths[col]
          = currentLayout.label?.widthByColumn?.[col]
            || currentLayout.label?.width
            || 100
      }
    }

    calculatedLabelWidths.value = labelWidths
    if (currentLayout.label) {
      currentLayout.label.widthByColumn = labelWidths
    }
  }

  // 获取字段所在列的字段列表
  const getFieldsInColumn = (column: number): FormItemConfig[] => {
    const visibleFields = calculateVisibleFields(formData)
    const columns = calculatedColumns.value
    return visibleFields.filter((_, index) => index % columns === column)
  }

  // 获取标签宽度
  const getLabelWidth = (
    field: FormItemConfig,
    index: number,
  ): string | number => {
    const labelConfig = currentLayout.label

    if (labelConfig?.position === 'top') {
      return 'auto'
    }

    if (labelConfig?.autoWidth && labelConfig?.widthByColumn) {
      const columns = calculatedColumns.value
      const columnIndex = index % columns
      return (
        labelConfig.widthByColumn[columnIndex] || labelConfig.width || 'auto'
      )
    }

    return labelConfig?.width || 'auto'
  }

  // 节流的计算函数
  const throttledCalculateColumns = throttle(
    calculateOptimalColumns,
    calculateDelay,
  )
  const throttledCalculateLabelWidths = throttle(
    () => calculateLabelWidths(),
    calculateDelay,
  )

  // 更新容器尺寸
  const updateContainerSize = () => {
    const container
      = typeof containerRef === 'function' ? containerRef() : containerRef?.value
    if (container) {
      containerSize.width = container.offsetWidth || container.clientWidth
      containerSize.height = container.offsetHeight || container.clientHeight
    }
  }

  // 窗口大小变化处理
  const handleResize = throttle(() => {
    updateContainerSize()
    if (currentLayout.autoColumns) {
      calculateOptimalColumns()
    }
    if (currentLayout.label?.autoWidth) {
      calculateLabelWidths()
    }
  }, calculateDelay)

  // 监听窗口大小变化
  if (watchResize) {
    onMounted(() => {
      window.addEventListener('resize', handleResize)
      // 初始计算
      nextTick(() => {
        updateContainerSize()
        if (currentLayout.autoColumns) {
          calculateOptimalColumns()
        }
        if (currentLayout.label?.autoWidth) {
          calculateLabelWidths()
        }
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
  }

  // 监听表单数据变化，重新计算标签宽度
  watch(
    () => formData,
    () => {
      if (currentLayout.label?.autoWidth) {
        throttledCalculateLabelWidths()
      }
    },
    { deep: true },
  )

  // 监听字段变化，重新计算
  watch(
    () => fields,
    () => {
      if (currentLayout.autoColumns) {
        throttledCalculateColumns()
      }
      if (currentLayout.label?.autoWidth) {
        throttledCalculateLabelWidths()
      }
    },
    { deep: true },
  )

  return {
    // 响应式状态
    calculatedColumns,
    calculatedLabelWidths,
    isExpanded,
    containerSize,

    // 计算方法
    calculateOptimalColumns,
    calculateLabelWidths,
    calculateVisibleFields,

    // 切换方法
    toggleAutoColumns: () => {
      currentLayout.autoColumns = !currentLayout.autoColumns
      if (currentLayout.autoColumns) {
        calculateOptimalColumns()
      }
    },
    toggleUnifiedSpacing: () => {
      currentLayout.unifiedSpacing = !currentLayout.unifiedSpacing
      if (currentLayout.unifiedSpacing) {
        currentLayout.verticalGap = currentLayout.horizontalGap
      }
    },
    toggleAutoLabelWidth: () => {
      if (currentLayout.label) {
        currentLayout.label.autoWidth = !currentLayout.label.autoWidth
        if (currentLayout.label.autoWidth) {
          calculateLabelWidths()
        }
      }
    },
    toggleExpandMode: () => {
      currentLayout.expandMode
        = currentLayout.expandMode === 'inline' ? 'popup' : 'inline'
    },
    toggleExpand: () => {
      isExpanded.value = !isExpanded.value
    },

    // 设置方法
    setManualLabelWidth: (column: number, width: number) => {
      if (currentLayout.label) {
        if (!currentLayout.label.widthByColumn) {
          currentLayout.label.widthByColumn = {}
        }
        currentLayout.label.widthByColumn[column] = width
      }
    },
    updateLayout: (key: string, value: any) => {
      ;(currentLayout as any)[key] = value
    },

    // 工具方法
    shouldShowField,
    getLabelWidth,
    getFieldsInColumn,

    // 状态查询
    hasHiddenFields,
    needsExpandButton,
    visibleFieldsCount,
    hiddenFieldsCount,
  }
}
