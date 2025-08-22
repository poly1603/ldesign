/**
 * @fileoverview Layout calculator for responsive form layouts
 * @author LDesign Team
 */

import type {
  LayoutConfig,
  ResponsiveConfig,
  ResponsiveBreakpoints,
  BreakpointType,
  DeviceType,
} from '../types'

/**
 * Layout calculator for form responsive design
 */
export class LayoutCalculator {
  private defaultBreakpoints: ResponsiveBreakpoints = {
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1400,
  }

  constructor(private config: LayoutConfig = {}) {
    this.config = {
      defaultRows: 3,
      minColumnWidth: 300,
      autoCalculate: true,
      horizontalGap: 16,
      verticalGap: 16,
      breakpoints: this.defaultBreakpoints,
      ...config,
    }
  }

  /**
   * Get current breakpoint based on container width
   */
  getCurrentBreakpoint(containerWidth: number): BreakpointType {
    const breakpoints = this.config.breakpoints || this.defaultBreakpoints

    if (containerWidth < (breakpoints.xs || 576)) return 'xs'
    if (containerWidth < (breakpoints.sm || 768)) return 'sm'
    if (containerWidth < (breakpoints.md || 992)) return 'md'
    if (containerWidth < (breakpoints.lg || 1200)) return 'lg'
    return 'xl'
  }

  /**
   * Get device type based on container width
   */
  getDeviceType(containerWidth: number): DeviceType {
    const breakpoint = this.getCurrentBreakpoint(containerWidth)

    switch (breakpoint) {
      case 'xs':
      case 'sm':
        return 'mobile'
      case 'md':
        return 'tablet'
      default:
        return 'desktop'
    }
  }

  /**
   * Calculate optimal number of columns based on container width
   */
  calculateColumns(containerWidth: number): number {
    if (!this.config.autoCalculate && this.config.columns) {
      return this.resolveResponsiveValue(this.config.columns, containerWidth)
    }

    const minWidth = this.resolveResponsiveValue(
      this.config.minColumnWidth || 300,
      containerWidth
    )

    const horizontalGap = this.resolveResponsiveValue(
      this.config.horizontalGap || 16,
      containerWidth
    )

    // Calculate how many columns can fit
    const availableWidth = containerWidth - horizontalGap
    const columnWidth = minWidth + horizontalGap
    const calculatedColumns = Math.floor(availableWidth / columnWidth)

    // Ensure at least 1 column, maximum 6 columns for usability
    return Math.max(1, Math.min(calculatedColumns, 6))
  }

  /**
   * Calculate grid layout for form fields
   */
  calculateGridLayout(
    containerWidth: number,
    fieldCount: number
  ): {
    columns: number
    rows: number
    totalRows: number
    visibleRows: number
    showExpand: boolean
  } {
    const columns = this.calculateColumns(containerWidth)
    const totalRows = Math.ceil(fieldCount / columns)
    const defaultRows = this.config.defaultRows || 3
    const visibleRows = Math.min(totalRows, defaultRows)
    const showExpand = totalRows > defaultRows

    return {
      columns,
      rows: totalRows,
      totalRows,
      visibleRows,
      showExpand,
    }
  }

  /**
   * Calculate field span based on responsive configuration
   */
  calculateFieldSpan(
    span: number | string | ResponsiveConfig<number | string> | undefined,
    containerWidth: number,
    totalColumns: number
  ): number {
    if (!span) return 1

    const resolvedSpan = this.resolveResponsiveValue(span, containerWidth)

    if (typeof resolvedSpan === 'string') {
      // Handle percentage values
      if (resolvedSpan.endsWith('%')) {
        const percentage = parseFloat(resolvedSpan) / 100
        return Math.max(1, Math.floor(totalColumns * percentage))
      }
      return 1
    }

    return Math.max(1, Math.min(resolvedSpan, totalColumns))
  }

  /**
   * Calculate gaps based on responsive configuration
   */
  calculateGaps(containerWidth: number): {
    horizontal: number
    vertical: number
  } {
    return {
      horizontal: this.resolveResponsiveValue(
        this.config.horizontalGap || 16,
        containerWidth
      ),
      vertical: this.resolveResponsiveValue(
        this.config.verticalGap || 16,
        containerWidth
      ),
    }
  }

  /**
   * Resolve responsive value based on current breakpoint
   */
  private resolveResponsiveValue<T>(
    value: T | ResponsiveConfig<T>,
    containerWidth: number
  ): T {
    if (typeof value !== 'object' || value === null) {
      return value
    }

    const responsiveConfig = value as ResponsiveConfig<T>

    // If it's not a responsive config, return as is
    if (!this.isResponsiveConfig(responsiveConfig)) {
      return value
    }

    const breakpoint = this.getCurrentBreakpoint(containerWidth)

    // Try to find value for current breakpoint
    if (responsiveConfig[breakpoint] !== undefined) {
      return responsiveConfig[breakpoint]!
    }

    // Fallback to smaller breakpoints
    const breakpoints: BreakpointType[] = ['xl', 'lg', 'md', 'sm', 'xs']
    const currentIndex = breakpoints.indexOf(breakpoint)

    for (let i = currentIndex + 1; i < breakpoints.length; i++) {
      const fallbackBreakpoint = breakpoints[i]
      if (responsiveConfig[fallbackBreakpoint] !== undefined) {
        return responsiveConfig[fallbackBreakpoint]!
      }
    }

    // If no responsive value found, return the first available value
    for (const bp of breakpoints) {
      if (responsiveConfig[bp] !== undefined) {
        return responsiveConfig[bp]!
      }
    }

    // This should not happen, but return default value
    return value as T
  }

  /**
   * Check if value is a responsive configuration object
   */
  private isResponsiveConfig<T>(value: any): value is ResponsiveConfig<T> {
    if (typeof value !== 'object' || value === null) {
      return false
    }

    const keys = Object.keys(value)
    const breakpointKeys = ['xs', 'sm', 'md', 'lg', 'xl']

    return keys.some(key => breakpointKeys.includes(key))
  }

  /**
   * Get container padding based on device type
   */
  getContainerPadding(containerWidth: number): {
    top: number
    right: number
    bottom: number
    left: number
  } {
    const deviceType = this.getDeviceType(containerWidth)

    switch (deviceType) {
      case 'mobile':
        return { top: 12, right: 16, bottom: 12, left: 16 }
      case 'tablet':
        return { top: 16, right: 24, bottom: 16, left: 24 }
      default:
        return { top: 24, right: 32, bottom: 24, left: 32 }
    }
  }

  /**
   * Update layout configuration
   */
  updateConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current layout configuration
   */
  getConfig(): LayoutConfig {
    return { ...this.config }
  }

  /**
   * Calculate label width based on configuration
   */
  calculateLabelWidth(
    labelConfig: { width?: 'auto' | number | number[] | ResponsiveConfig<'auto' | number | number[]> },
    containerWidth: number,
    columnIndex?: number
  ): 'auto' | number {
    if (!labelConfig.width) return 'auto'

    const resolvedWidth = this.resolveResponsiveValue(labelConfig.width, containerWidth)

    if (resolvedWidth === 'auto') return 'auto'

    if (Array.isArray(resolvedWidth)) {
      return resolvedWidth[columnIndex || 0] || resolvedWidth[0] || 'auto'
    }

    return resolvedWidth
  }

  /**
   * Generate CSS Grid template
   */
  generateGridTemplate(
    containerWidth: number,
    fieldCount: number
  ): {
    gridTemplateColumns: string
    gridTemplateRows: string
    gap: string
  } {
    const layout = this.calculateGridLayout(containerWidth, fieldCount)
    const gaps = this.calculateGaps(containerWidth)

    return {
      gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
      gridTemplateRows: `repeat(${layout.visibleRows}, auto)`,
      gap: `${gaps.vertical}px ${gaps.horizontal}px`,
    }
  }
}