/**
 * @fileoverview useFormLayout Composition API hook
 * @author LDesign Team
 */

import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type {
  LayoutConfig,
  UseFormLayoutReturn,
  BreakpointType,
  DeviceType,
} from '../types'
import { LayoutCalculator } from '../core/LayoutCalculator'

/**
 * Use form layout composition hook
 * Provides reactive layout state and responsive calculations
 */
export function useFormLayout(
  containerRef: Ref<HTMLElement | null>,
  config: LayoutConfig = {},
  fieldCount = 0
): UseFormLayoutReturn {
  // Initialize layout calculator
  const layoutCalculator = new LayoutCalculator(config)

  // Reactive state
  const containerSize = ref({ width: 0, height: 0 })
  const deviceType = ref<DeviceType>('desktop')
  const breakpoint = ref<BreakpointType>('xl')
  const expanded = ref(false)

  // ResizeObserver for container size changes
  let resizeObserver: ResizeObserver | null = null

  // Computed properties
  const columns = computed(() => {
    return layoutCalculator.calculateColumns(containerSize.value.width)
  })

  const gaps = computed(() => {
    return layoutCalculator.calculateGaps(containerSize.value.width)
  })

  const visibleRows = computed(() => {
    const layout = layoutCalculator.calculateGridLayout(
      containerSize.value.width,
      fieldCount
    )
    return expanded.value ? layout.totalRows : layout.visibleRows
  })

  const gridLayout = computed(() => {
    return layoutCalculator.calculateGridLayout(
      containerSize.value.width,
      fieldCount
    )
  })

  const gridTemplate = computed(() => {
    return layoutCalculator.generateGridTemplate(
      containerSize.value.width,
      fieldCount
    )
  })

  const containerPadding = computed(() => {
    return layoutCalculator.getContainerPadding(containerSize.value.width)
  })

  // Update container size and derived values
  const updateSize = (width: number, height: number) => {
    containerSize.value = { width, height }
    deviceType.value = layoutCalculator.getDeviceType(width)
    breakpoint.value = layoutCalculator.getCurrentBreakpoint(width)
  }

  // Handle resize events
  const handleResize = (entries: ResizeObserverEntry[]) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      updateSize(width, height)
    }
  }

  // Toggle expanded state
  const toggleExpanded = () => {
    expanded.value = !expanded.value
  }

  // Setup resize observer
  const setupResizeObserver = () => {
    if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
      resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(containerRef.value)

      // Initial size calculation
      const rect = containerRef.value.getBoundingClientRect()
      updateSize(rect.width, rect.height)
    }
  }

  // Cleanup resize observer
  const cleanupResizeObserver = () => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }

  // Calculate field span based on responsive config
  const calculateFieldSpan = (
    span: number | string | any | undefined
  ): number => {
    return layoutCalculator.calculateFieldSpan(
      span,
      containerSize.value.width,
      columns.value
    )
  }

  // Calculate label width
  const calculateLabelWidth = (
    labelConfig: { width?: any },
    columnIndex?: number
  ): 'auto' | number => {
    return layoutCalculator.calculateLabelWidth(
      labelConfig,
      containerSize.value.width,
      columnIndex
    )
  }

  // Update layout configuration
  const updateConfig = (newConfig: Partial<LayoutConfig>) => {
    layoutCalculator.updateConfig(newConfig)
  }

  // Get layout styles for container
  const getContainerStyles = () => {
    return {
      display: 'grid',
      ...gridTemplate.value,
      padding: `${containerPadding.value.top}px ${containerPadding.value.right}px ${containerPadding.value.bottom}px ${containerPadding.value.left}px`,
    }
  }

  // Get field styles
  const getFieldStyles = (
    span?: number | string | any,
    rowStart?: number,
    columnStart?: number
  ) => {
    const calculatedSpan = calculateFieldSpan(span)

    return {
      gridColumn: columnStart
        ? `${columnStart} / span ${calculatedSpan}`
        : `span ${calculatedSpan}`,
      gridRow: rowStart ? `${rowStart}` : undefined,
    }
  }

  // Lifecycle hooks
  onMounted(() => {
    setupResizeObserver()
  })

  onUnmounted(() => {
    cleanupResizeObserver()
  })

  // Manual setup/cleanup methods for non-Vue usage
  const setup = () => {
    setupResizeObserver()
  }

  const cleanup = () => {
    cleanupResizeObserver()
  }

  return {
    columns,
    gaps,
    deviceType,
    breakpoint,
    containerSize,
    expanded,
    visibleRows,
    toggleExpanded,
    calculateFieldSpan,
    calculateLabelWidth,
    updateConfig,
    getContainerStyles,
    getFieldStyles,
    gridLayout,
    gridTemplate,
    containerPadding,
    setup,
    cleanup,
  }
}