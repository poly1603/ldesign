/**
 * 布局引擎实现
 * 
 * 负责表单的布局计算、响应式处理、分区管理等功能
 */

import type {
  LayoutConfig,
  LayoutEngine as ILayoutEngine,
  LayoutResult,
  FieldPosition,
  SectionResult,
  ActionPositionResult,
  ResponsiveConfig,
  BreakpointType,
  FormFieldItem,
  FormFieldConfig,
  EventBus,
  AnyObject
} from '../types'

/**
 * 布局计算上下文
 */
interface LayoutContext {
  containerWidth: number
  containerHeight: number
  columns: number
  rows: number
  columnWidth: number
  rowHeight: number
  gap: { horizontal: number; vertical: number }
  breakpoint: BreakpointType
}

/**
 * 字段布局信息
 */
interface FieldLayoutInfo {
  field: FormFieldConfig
  span: number
  row: number
  column: number
  gridArea: string
  visible: boolean
}

/**
 * 布局引擎实现类
 */
export class LayoutEngine implements ILayoutEngine {
  // 布局配置
  private config: LayoutConfig = {}
  
  // 事件总线
  private eventBus: EventBus
  
  // 当前布局上下文
  private context: LayoutContext | null = null
  
  // 字段布局信息缓存
  private fieldLayoutCache = new Map<string, FieldLayoutInfo>()
  
  // 响应式监听器
  private resizeObserver: ResizeObserver | null = null
  private mediaQueryListeners = new Map<string, MediaQueryList>()
  
  // 内部状态
  private initialized = false
  private destroyed = false
  private containerElement: HTMLElement | null = null
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }
  
  /**
   * 初始化布局引擎
   */
  public initialize(config: LayoutConfig): void {
    if (this.initialized) {
      return
    }
    
    this.initialized = true
    this.config = this.normalizeConfig(config)
    
    // 设置响应式监听
    this.setupResponsiveListeners()
  }
  
  /**
   * 标准化配置
   */
  private normalizeConfig(config: LayoutConfig): LayoutConfig {
    return {
      type: 'grid',
      responsive: {
        enabled: true,
        breakpoints: {
          xs: { value: 0, name: 'xs', columns: 1 },
          sm: { value: 576, name: 'sm', columns: 2 },
          md: { value: 768, name: 'md', columns: 3 },
          lg: { value: 992, name: 'lg', columns: 4 },
          xl: { value: 1200, name: 'xl', columns: 5 }
        },
        defaultBreakpoint: 'md',
        detection: 'container',
        debounce: 100,
        ...config.responsive
      },
      calculation: {
        autoCalculate: true,
        minColumnWidth: 300,
        maxColumns: 6,
        minColumns: 1,
        defaultColumns: 3,
        containerPadding: 16,
        includeScrollbar: true,
        scrollbarWidth: 17,
        precision: 1,
        cache: true,
        cacheTTL: 60000,
        ...config.calculation
      },
      section: {
        defaultRows: 1,
        expandMode: 'dropdown',
        expandAnimation: {
          enabled: true,
          duration: 300,
          easing: 'ease-in-out'
        },
        ...config.section
      },
      grid: {
        gap: 16,
        justifyContent: 'start',
        alignContent: 'start',
        justifyItems: 'stretch',
        alignItems: 'stretch',
        ...config.grid
      },
      label: {
        position: 'left',
        widthStrategy: 'uniform',
        width: 'auto',
        align: 'right',
        showColon: true,
        ...config.label
      },
      ...config
    }
  }
  
  /**
   * 设置响应式监听
   */
  private setupResponsiveListeners(): void {
    if (!this.config.responsive?.enabled) {
      return
    }
    
    const breakpoints = this.config.responsive.breakpoints || {}
    
    // 设置媒体查询监听
    for (const [name, breakpoint] of Object.entries(breakpoints)) {
      if (breakpoint.value > 0) {
        const mediaQuery = window.matchMedia(`(min-width: ${breakpoint.value}px)`)
        this.mediaQueryListeners.set(name, mediaQuery)
        
        mediaQuery.addEventListener('change', () => {
          this.handleResponsiveChange()
        })
      }
    }
    
    // 设置容器尺寸监听
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === this.containerElement) {
            this.handleContainerResize(entry.contentRect.width, entry.contentRect.height)
          }
        }
      })
    }
  }
  
  /**
   * 处理响应式变化
   */
  private handleResponsiveChange(): void {
    if (!this.containerElement || !this.context) {
      return
    }
    
    const newBreakpoint = this.calculateResponsive(
      this.config.responsive!,
      this.containerElement.offsetWidth
    )
    
    if (newBreakpoint !== this.context.breakpoint) {
      const oldBreakpoint = this.context.breakpoint
      this.context.breakpoint = newBreakpoint
      
      // 重新计算布局
      this.recalculateLayout()
      
      // 触发响应式变化事件
      this.eventBus.emit('layout:responsive', {
        type: 'layout:responsive',
        timestamp: Date.now(),
        id: `responsive_${Date.now()}`,
        layoutConfig: this.config,
        responsiveChange: {
          from: oldBreakpoint,
          to: newBreakpoint
        }
      })
    }
  }
  
  /**
   * 处理容器尺寸变化
   */
  private handleContainerResize(width: number, height: number): void {
    if (!this.context) {
      return
    }
    
    const debounce = this.config.responsive?.debounce || 100
    
    // 防抖处理
    clearTimeout(this.resizeTimeout)
    this.resizeTimeout = setTimeout(() => {
      this.context!.containerWidth = width
      this.context!.containerHeight = height
      
      // 重新计算布局
      this.recalculateLayout()
    }, debounce)
  }
  
  private resizeTimeout: NodeJS.Timeout | null = null
  
  /**
   * 重新计算布局
   */
  private recalculateLayout(): void {
    if (!this.context || !this.containerElement) {
      return
    }
    
    const result = this.calculate(this.config, this.context.containerWidth)
    
    // 更新上下文
    this.context = {
      ...this.context,
      ...result
    }
    
    // 触发布局更新事件
    this.eventBus.emit('layout:updated', {
      type: 'layout:updated',
      timestamp: Date.now(),
      id: `updated_${Date.now()}`,
      layoutConfig: this.config,
      layoutResult: result
    })
  }
  
  /**
   * 计算布局
   */
  public calculate(config: LayoutConfig, containerWidth: number): LayoutResult {
    const startTime = performance.now()
    
    // 计算响应式断点
    const breakpoint = this.calculateResponsive(config.responsive!, containerWidth)
    
    // 计算列数
    const columns = this.calculateColumns(config, containerWidth)
    
    // 计算容器尺寸
    const padding = config.calculation?.containerPadding || 16
    const scrollbarWidth = config.calculation?.includeScrollbar 
      ? (config.calculation?.scrollbarWidth || 17) 
      : 0
    
    const availableWidth = containerWidth - padding * 2 - scrollbarWidth
    const columnWidth = availableWidth / columns
    
    // 计算间距
    const gap = this.calculateGap(config.grid?.gap || 16)
    
    // 计算行高（暂时使用固定值，后续可以根据内容动态计算）
    const rowHeight = 60
    
    const result: LayoutResult = {
      columns,
      rows: 0, // 将在计算字段位置时确定
      containerSize: { width: containerWidth, height: 0 },
      availableSize: { width: availableWidth, height: 0 },
      columnWidth,
      rowHeight,
      gap,
      labelWidth: this.calculateLabelWidth([], config.label?.widthStrategy || 'uniform'),
      breakpoint,
      styles: this.generateStyles(config, columns, gap),
      variables: this.generateCSSVariables(config, columns, gap, columnWidth, rowHeight)
    }
    
    // 触发布局计算事件
    this.eventBus.emit('layout:calculated', {
      type: 'layout:calculated',
      timestamp: Date.now(),
      id: `calculated_${Date.now()}`,
      layoutConfig: config,
      layoutResult: result,
      duration: performance.now() - startTime
    })
    
    return result
  }
  
  /**
   * 计算列数
   */
  public calculateColumns(config: LayoutConfig, containerWidth: number): number {
    const calculation = config.calculation
    
    if (!calculation?.autoCalculate && config.columns) {
      return typeof config.columns === 'number' ? config.columns : 3
    }
    
    const minColumnWidth = calculation?.minColumnWidth || 300
    const maxColumns = calculation?.maxColumns || 6
    const minColumns = calculation?.minColumns || 1
    
    // 考虑容器内边距和滚动条
    const padding = calculation?.containerPadding || 16
    const scrollbarWidth = calculation?.includeScrollbar 
      ? (calculation?.scrollbarWidth || 17) 
      : 0
    
    const availableWidth = containerWidth - padding * 2 - scrollbarWidth
    const calculatedColumns = Math.floor(availableWidth / minColumnWidth)
    
    return Math.max(minColumns, Math.min(maxColumns, calculatedColumns))
  }
  
  /**
   * 计算字段位置
   */
  public calculateFieldPositions(fields: FormFieldItem[], columns: number): FieldPosition[] {
    const positions: FieldPosition[] = []
    let currentRow = 1
    let currentColumn = 1
    
    for (const field of fields) {
      if (field.type === 'group' && 'fields' in field) {
        // 递归处理分组字段
        const groupPositions = this.calculateFieldPositions(field.fields, columns)
        positions.push(...groupPositions)
        continue
      }
      
      if (field.type === 'actions' || !('name' in field)) {
        continue
      }
      
      const fieldConfig = field as FormFieldConfig
      const span = this.getFieldSpan(fieldConfig, columns)
      
      // 检查当前行是否有足够空间
      if (currentColumn + span - 1 > columns) {
        currentRow++
        currentColumn = 1
      }
      
      const position: FieldPosition = {
        field: fieldConfig,
        row: currentRow,
        column: currentColumn,
        span,
        gridArea: `${currentRow} / ${currentColumn} / ${currentRow + 1} / ${currentColumn + span}`,
        position: {
          x: (currentColumn - 1) * (100 / columns),
          y: (currentRow - 1) * 60, // 假设行高为60px
          width: (span / columns) * 100,
          height: 60
        },
        visible: true,
        inDefaultSection: currentRow <= (this.config.section?.defaultRows || 1)
      }
      
      positions.push(position)
      currentColumn += span
    }
    
    return positions
  }
  
  /**
   * 获取字段占用列数
   */
  private getFieldSpan(field: FormFieldConfig, totalColumns: number): number {
    if (field.gridColumn) {
      if (typeof field.gridColumn === 'number') {
        return Math.min(field.gridColumn, totalColumns)
      }
      if (typeof field.gridColumn === 'string' && field.gridColumn.startsWith('span ')) {
        const span = parseInt(field.gridColumn.replace('span ', ''))
        return Math.min(span, totalColumns)
      }
    }
    
    if (field.span) {
      if (typeof field.span === 'number') {
        return Math.min(field.span, totalColumns)
      }
      if (typeof field.span === 'string' && field.span.endsWith('%')) {
        const percentage = parseInt(field.span.replace('%', ''))
        return Math.round((percentage / 100) * totalColumns)
      }
    }
    
    return 1 // 默认占用1列
  }
  
  /**
   * 计算分区
   */
  public calculateSections(
    fields: FormFieldItem[],
    columns: number,
    defaultRows: number
  ): SectionResult {
    const positions = this.calculateFieldPositions(fields, columns)
    
    const defaultSection: FormFieldItem[] = []
    const expandedSection: FormFieldItem[] = []
    
    for (const position of positions) {
      if (position.row <= defaultRows) {
        defaultSection.push(position.field)
      } else {
        expandedSection.push(position.field)
      }
    }
    
    const totalRows = Math.max(...positions.map(p => p.row))
    
    return {
      defaultSection,
      expandedSection,
      needsExpand: expandedSection.length > 0,
      defaultRows,
      expandedRows: totalRows - defaultRows,
      totalRows
    }
  }
  
  /**
   * 计算标题宽度
   */
  public calculateLabelWidth(fields: FormFieldItem[], strategy: string): number | number[] {
    // 简化实现，返回固定值
    // 实际实现中应该根据字段标题长度和策略计算
    switch (strategy) {
      case 'uniform':
        return 120 // 统一宽度
      case 'auto':
        return 'auto' as any
      case 'fixed':
        return 100
      default:
        return 120
    }
  }
  
  /**
   * 计算按钮组位置
   */
  public calculateActionPosition(config: any, context: any): ActionPositionResult {
    // 简化实现
    return {
      row: 1,
      column: 1,
      span: 1,
      isNewLine: false,
      isFixed: false,
      styles: {}
    }
  }
  
  /**
   * 计算响应式断点
   */
  public calculateResponsive(config: ResponsiveConfig, containerWidth: number): BreakpointType {
    if (!config.enabled || !config.breakpoints) {
      return config.defaultBreakpoint || 'md'
    }
    
    const breakpoints = Object.entries(config.breakpoints)
      .sort(([, a], [, b]) => b.value - a.value) // 从大到小排序
    
    for (const [name, breakpoint] of breakpoints) {
      if (containerWidth >= breakpoint.value) {
        return name as BreakpointType
      }
    }
    
    return config.defaultBreakpoint || 'xs'
  }
  
  /**
   * 计算间距
   */
  private calculateGap(gap: number | string | { horizontal: number; vertical: number }): { horizontal: number; vertical: number } {
    if (typeof gap === 'number') {
      return { horizontal: gap, vertical: gap }
    }
    
    if (typeof gap === 'string') {
      const numericGap = parseInt(gap)
      return { horizontal: numericGap, vertical: numericGap }
    }
    
    return gap
  }
  
  /**
   * 生成样式
   */
  private generateStyles(config: LayoutConfig, columns: number, gap: { horizontal: number; vertical: number }): AnyObject {
    const styles: AnyObject = {}
    
    if (config.type === 'grid') {
      styles.display = 'grid'
      styles.gridTemplateColumns = `repeat(${columns}, 1fr)`
      styles.gridGap = `${gap.vertical}px ${gap.horizontal}px`
      styles.gridAutoRows = 'min-content'
    }
    
    return styles
  }
  
  /**
   * 生成CSS变量
   */
  private generateCSSVariables(
    config: LayoutConfig,
    columns: number,
    gap: { horizontal: number; vertical: number },
    columnWidth: number,
    rowHeight: number
  ): Record<string, string | number> {
    return {
      '--form-columns': columns,
      '--form-column-width': `${columnWidth}px`,
      '--form-row-height': `${rowHeight}px`,
      '--form-gap-horizontal': `${gap.horizontal}px`,
      '--form-gap-vertical': `${gap.vertical}px`,
      '--form-label-width': typeof this.config.label?.width === 'number' 
        ? `${this.config.label.width}px` 
        : this.config.label?.width || 'auto'
    }
  }
  
  /**
   * 设置容器元素
   */
  public setContainer(element: HTMLElement): void {
    if (this.containerElement === element) {
      return
    }
    
    // 移除旧的监听
    if (this.containerElement && this.resizeObserver) {
      this.resizeObserver.unobserve(this.containerElement)
    }
    
    this.containerElement = element
    
    // 添加新的监听
    if (this.resizeObserver && element) {
      this.resizeObserver.observe(element)
    }
    
    // 初始计算
    if (element) {
      this.handleContainerResize(element.offsetWidth, element.offsetHeight)
    }
  }
  
  /**
   * 更新布局
   */
  public updateLayout(config: LayoutConfig): void {
    this.config = this.normalizeConfig(config)
    this.recalculateLayout()
  }
  
  /**
   * 重置布局
   */
  public resetLayout(): void {
    this.fieldLayoutCache.clear()
    this.context = null
  }
  
  /**
   * 获取调试信息
   */
  public getDebugInfo(): AnyObject {
    return {
      initialized: this.initialized,
      destroyed: this.destroyed,
      config: this.config,
      context: this.context,
      cacheSize: this.fieldLayoutCache.size,
      hasContainer: !!this.containerElement,
      mediaQueryCount: this.mediaQueryListeners.size
    }
  }
  
  /**
   * 销毁布局引擎
   */
  public destroyLayout(): void {
    this.destroy()
  }
  
  /**
   * 销毁布局引擎
   */
  public destroy(): void {
    if (this.destroyed) {
      return
    }
    
    this.destroyed = true
    
    // 清理监听器
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    
    for (const mediaQuery of this.mediaQueryListeners.values()) {
      mediaQuery.removeEventListener('change', this.handleResponsiveChange)
    }
    this.mediaQueryListeners.clear()
    
    // 清理缓存
    this.fieldLayoutCache.clear()
    
    // 清理状态
    this.context = null
    this.containerElement = null
    this.config = {}
  }
}
