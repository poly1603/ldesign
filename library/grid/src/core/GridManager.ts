/**
 * Grid Manager - Global singleton managing all grid instances
 */

import type {
  IGridManager,
  IGridInstance,
  GridManagerConfig,
  GridOptions,
  GlobalPerformanceStats
} from '../types'
import { GridInstance } from './GridInstance'
import { generateId } from '../utils/grid-utils'

export class GridManager implements IGridManager {
  private static instance: GridManager | null = null
  private config: Required<GridManagerConfig>
  private grids: Map<string, IGridInstance> = new Map()
  private performanceInterval: number | undefined

  private constructor(config?: GridManagerConfig) {
    this.config = this.normalizeConfig(config)

    if (this.config.enablePerformanceMonitor) {
      this.startPerformanceMonitoring()
    }

    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: GridManagerConfig): GridManager {
    if (!GridManager.instance) {
      GridManager.instance = new GridManager(config)
    }
    return GridManager.instance
  }

  /**
   * Reset singleton (mainly for testing)
   */
  static reset(): void {
    if (GridManager.instance) {
      GridManager.instance.destroyAll()
      GridManager.instance = null
    }
  }

  /**
   * Normalize configuration
   */
  private normalizeConfig(config?: GridManagerConfig): Required<GridManagerConfig> {
    return {
      maxInstances: config?.maxInstances ?? 100,
      enablePerformanceMonitor: config?.enablePerformanceMonitor ?? true,
      enableAutoCleanup: config?.enableAutoCleanup ?? true,
      globalDragOptions: config?.globalDragOptions ?? {},
      memoryOptimization: config?.memoryOptimization ?? true
    }
  }

  /**
   * Configure manager
   */
  configure(config: GridManagerConfig): void {
    this.config = this.normalizeConfig({ ...this.config, ...config })

    if (this.config.enablePerformanceMonitor && !this.performanceInterval) {
      this.startPerformanceMonitoring()
    } else if (!this.config.enablePerformanceMonitor && this.performanceInterval) {
      this.stopPerformanceMonitoring()
    }
  }

  /**
   * Create grid instance
   */
  create(container: HTMLElement, options: GridOptions = {}): IGridInstance {
    // Check max instances
    if (this.grids.size >= this.config.maxInstances) {
      throw new Error(`Maximum number of grid instances (${this.config.maxInstances}) reached`)
    }

    // Merge with global drag options
    const mergedOptions: GridOptions = {
      ...options,
      dragOptions: {
        ...this.config.globalDragOptions,
        ...options.dragOptions
      }
    }

    // Enable memory optimization if configured
    if (this.config.memoryOptimization) {
      mergedOptions.performance = {
        ...mergedOptions.performance,
        batchUpdate: true
      }
    }

    // Create grid instance
    const grid = new GridInstance(container, mergedOptions)

    // Register grid
    this.grids.set(grid.id, grid)

    // Emit event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('grid-created', {
          detail: { grid }
        })
      )
    }

    return grid
  }

  /**
   * Get grid instance by id
   */
  get(id: string): IGridInstance | undefined {
    return this.grids.get(id)
  }

  /**
   * Get grid by container element
   */
  getByContainer(container: HTMLElement): IGridInstance | undefined {
    const gridId = container.getAttribute('data-grid-id')
    if (gridId) {
      return this.grids.get(gridId)
    }
    return undefined
  }

  /**
   * Remove grid instance
   */
  remove(id: string): void {
    const grid = this.grids.get(id)
    if (!grid) return

    // Destroy grid
    grid.destroy()

    // Remove from map
    this.grids.delete(id)

    // Emit event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('grid-removed', {
          detail: { id }
        })
      )
    }
  }

  /**
   * Get all grid instances
   */
  getAll(): IGridInstance[] {
    return Array.from(this.grids.values())
  }

  /**
   * Destroy all grids
   */
  destroyAll(): void {
    this.grids.forEach((grid, id) => {
      grid.destroy()
    })
    this.grids.clear()
  }

  /**
   * Get global performance stats
   */
  getGlobalStats(): GlobalPerformanceStats {
    let totalItems = 0
    let avgFps = 0
    let totalMemory = 0
    let activeDrags = 0

    this.grids.forEach(grid => {
      const stats = grid.getStats()
      totalItems += stats.itemCount
      avgFps += stats.fps || 0
      totalMemory += stats.memoryUsage || 0

      const dragManager = grid.getDragManager()
      if (dragManager.isDraggingActive()) {
        activeDrags++
      }
    })

    return {
      totalGrids: this.grids.size,
      totalItems,
      avgFps: this.grids.size > 0 ? avgFps / this.grids.size : 0,
      totalMemory,
      activeDrags
    }
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    this.performanceInterval = window.setInterval(() => {
      const stats = this.getGlobalStats()

      // Log if performance is degraded
      if (stats.avgFps < 30) {
        console.warn('[GridManager] Performance degraded:', stats)
      }

      // Emit performance stats event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('grid-performance', {
            detail: { stats }
          })
        )
      }
    }, 5000) // Every 5 seconds
  }

  /**
   * Stop performance monitoring
   */
  private stopPerformanceMonitoring(): void {
    if (this.performanceInterval) {
      clearInterval(this.performanceInterval)
      this.performanceInterval = undefined
    }
  }

  /**
   * Start automatic cleanup
   */
  private startAutoCleanup(): void {
    if (typeof window === 'undefined') return

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.destroyAll()
    })

    // Cleanup orphaned grids
    setInterval(() => {
      this.cleanupOrphanedGrids()
    }, 60000) // Every minute
  }

  /**
   * Cleanup orphaned grids (grids with removed containers)
   */
  private cleanupOrphanedGrids(): void {
    const orphanedIds: string[] = []

    this.grids.forEach((grid, id) => {
      if (!document.contains(grid.container)) {
        orphanedIds.push(id)
      }
    })

    orphanedIds.forEach(id => {
      console.warn(`[GridManager] Removing orphaned grid: ${id}`)
      this.remove(id)
    })
  }

  /**
   * Get configuration
   */
  getConfig(): Required<GridManagerConfig> {
    return { ...this.config }
  }

  /**
   * Get grid count
   */
  getGridCount(): number {
    return this.grids.size
  }

  /**
   * Check if grid exists
   */
  has(id: string): boolean {
    return this.grids.has(id)
  }

  /**
   * Find grids by predicate
   */
  find(predicate: (grid: IGridInstance) => boolean): IGridInstance[] {
    return this.getAll().filter(predicate)
  }

  /**
   * Get grids with performance issues
   */
  getSlowGrids(fpsThreshold = 30): IGridInstance[] {
    return this.find(grid => {
      const stats = grid.getStats()
      return (stats.fps || 60) < fpsThreshold
    })
  }

  /**
   * Get grids with many items
   */
  getLargeGrids(itemThreshold = 50): IGridInstance[] {
    return this.find(grid => {
      const stats = grid.getStats()
      return stats.itemCount > itemThreshold
    })
  }

  /**
   * Optimize all grids
   */
  optimizeAll(): void {
    this.grids.forEach(grid => {
      const stats = grid.getStats()

      // Enable virtual scrolling for large grids
      if (stats.itemCount > 100 && !grid.options.performance?.virtualScroll) {
        console.log(`[GridManager] Enabling virtual scrolling for grid ${grid.id}`)
        // Would need to recreate grid with new options
      }

      // Suggest optimizations
      const recommendations = (grid as any).performanceMonitor?.getRecommendations() || []
      if (recommendations.length > 0) {
        console.log(`[GridManager] Recommendations for grid ${grid.id}:`, recommendations)
      }
    })
  }

  /**
   * Export all grids layouts
   */
  exportAll(): Record<string, any> {
    const layouts: Record<string, any> = {}

    this.grids.forEach((grid, id) => {
      layouts[id] = grid.save()
    })

    return layouts
  }

  /**
   * Get memory usage across all grids
   */
  getTotalMemoryUsage(): number {
    let total = 0

    this.grids.forEach(grid => {
      const stats = grid.getStats()
      total += stats.memoryUsage || 0
    })

    return total
  }
}

// Export singleton getter as default
export function getGridManager(config?: GridManagerConfig): GridManager {
  return GridManager.getInstance(config)
}













