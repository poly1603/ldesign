/**
 * Responsive layout management
 */

import type { GridOptions, IGridInstance } from '../types'
import { debounce } from '../utils/grid-utils'

export interface Breakpoint {
  name: string
  minWidth: number
  columns: number
  cellHeight?: number
}

export interface ResponsiveOptions {
  breakpoints?: Breakpoint[]
  debounceDelay?: number
  onBreakpointChange?: (breakpoint: Breakpoint) => void
}

const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { name: 'xs', minWidth: 0, columns: 1 },
  { name: 'sm', minWidth: 576, columns: 2 },
  { name: 'md', minWidth: 768, columns: 4 },
  { name: 'lg', minWidth: 992, columns: 6 },
  { name: 'xl', minWidth: 1200, columns: 12 },
  { name: 'xxl', minWidth: 1400, columns: 12 }
]

export class ResponsiveManager {
  private grid: IGridInstance
  private breakpoints: Breakpoint[]
  private currentBreakpoint: Breakpoint
  private resizeObserver: ResizeObserver | null = null
  private options: ResponsiveOptions
  private handleResizeDebounced: () => void

  constructor(grid: IGridInstance, options: ResponsiveOptions = {}) {
    this.grid = grid
    this.options = options
    this.breakpoints = options.breakpoints || DEFAULT_BREAKPOINTS
    this.currentBreakpoint = this.getCurrentBreakpoint()
    
    // Create debounced resize handler after options is set
    this.handleResizeDebounced = debounce(this.handleResize, this.options.debounceDelay || 150)

    this.init()
  }

  /**
   * Initialize responsive manager
   */
  private init(): void {
    // Use ResizeObserver if available
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(
        debounce(() => {
          this.handleResize()
        }, this.options.debounceDelay || 150)
      )
      this.resizeObserver.observe(this.grid.container)
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', this.handleResizeDebounced)
    }

    // Apply initial breakpoint
    this.applyBreakpoint(this.currentBreakpoint)
  }

  /**
   * Get current breakpoint based on container width
   */
  private getCurrentBreakpoint(): Breakpoint {
    const width = this.grid.container.clientWidth

    // Find the largest breakpoint that fits
    for (let i = this.breakpoints.length - 1; i >= 0; i--) {
      if (width >= this.breakpoints[i].minWidth) {
        return this.breakpoints[i]
      }
    }

    return this.breakpoints[0]
  }

  /**
   * Handle resize event
   */
  private handleResize = (): void => {
    const newBreakpoint = this.getCurrentBreakpoint()

    if (newBreakpoint.name !== this.currentBreakpoint.name) {
      this.currentBreakpoint = newBreakpoint
      this.applyBreakpoint(newBreakpoint)

      // Call callback
      if (this.options.onBreakpointChange) {
        this.options.onBreakpointChange(newBreakpoint)
      }
    }
  }


  /**
   * Apply breakpoint settings
   */
  private applyBreakpoint(breakpoint: Breakpoint): void {
    const options: Partial<GridOptions> = {
      column: breakpoint.columns
    }

    if (breakpoint.cellHeight) {
      options.cellHeight = breakpoint.cellHeight
    }

    // Update grid options
    this.grid.native.column(breakpoint.columns)

    // Emit event
    this.grid.container.dispatchEvent(
      new CustomEvent('breakpoint-change', {
        detail: { breakpoint }
      })
    )
  }

  /**
   * Get current breakpoint
   */
  getBreakpoint(): Breakpoint {
    return this.currentBreakpoint
  }

  /**
   * Get all breakpoints
   */
  getBreakpoints(): Breakpoint[] {
    return this.breakpoints
  }

  /**
   * Set breakpoints
   */
  setBreakpoints(breakpoints: Breakpoint[]): void {
    this.breakpoints = breakpoints
    this.handleResize()
  }

  /**
   * Add breakpoint
   */
  addBreakpoint(breakpoint: Breakpoint): void {
    this.breakpoints.push(breakpoint)
    this.breakpoints.sort((a, b) => a.minWidth - b.minWidth)
    this.handleResize()
  }

  /**
   * Remove breakpoint
   */
  removeBreakpoint(name: string): void {
    this.breakpoints = this.breakpoints.filter(bp => bp.name !== name)
    this.handleResize()
  }

  /**
   * Force update
   */
  update(): void {
    this.handleResize()
  }

  /**
   * Destroy responsive manager
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    } else {
      window.removeEventListener('resize', this.handleResizeDebounced)
    }
  }
}













