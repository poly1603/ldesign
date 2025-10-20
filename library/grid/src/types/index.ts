/**
 * Core types for @ldesign/grid
 */

import type { GridStack as GridStackNative, GridStackOptions, GridStackNode, GridStackWidget } from 'gridstack'

/**
 * Grid Manager configuration
 */
export interface GridManagerConfig {
  /** Maximum number of grid instances */
  maxInstances?: number
  /** Enable global performance monitoring */
  enablePerformanceMonitor?: boolean
  /** Enable automatic cleanup of unused instances */
  enableAutoCleanup?: boolean
  /** Global drag options */
  globalDragOptions?: DragOptions
  /** Enable memory optimization */
  memoryOptimization?: boolean
}

/**
 * Grid options extending GridStack native options
 */
export interface GridOptions extends GridStackOptions {
  /** Accept widgets from outside */
  acceptWidgets?: boolean | string
  /** Enable nested grids */
  nested?: {
    enabled: boolean
    maxDepth?: number
  }
  /** Performance optimization options */
  performance?: {
    virtualScroll?: boolean
    batchUpdate?: boolean
    lazyRender?: boolean
  }
  /** Custom drag and drop options */
  dragOptions?: DragOptions
}

/**
 * Grid item options
 */
export interface GridItemOptions extends Partial<GridStackNode> {
  /** Unique identifier */
  id?: string
  /** Grid x position */
  x?: number
  /** Grid y position */
  y?: number
  /** Width in grid units */
  w?: number
  /** Height in grid units */
  h?: number
  /** Minimum width */
  minW?: number
  /** Maximum width */
  maxW?: number
  /** Minimum height */
  minH?: number
  /** Maximum height */
  maxH?: number
  /** Is item locked */
  locked?: boolean
  /** Disable resize */
  noResize?: boolean
  /** Disable move */
  noMove?: boolean
  /** HTML content or element */
  content?: string | HTMLElement
  /** Auto position */
  autoPosition?: boolean
  /** Custom data */
  data?: any
}

/**
 * Drag options
 */
export interface DragOptions {
  /** Accept elements from selector */
  acceptFrom?: string
  /** Draggable handle selector */
  handle?: string
  /** Elements that should not trigger drag */
  cancel?: string
  /** Show helper while dragging */
  helper?: 'clone' | 'original'
  /** Revert position if not dropped */
  revert?: boolean
  /** Scroll container while dragging */
  scroll?: boolean
  /** Append helper to element */
  appendTo?: string | HTMLElement
  /** Z-index for dragging element */
  zIndex?: number
}

/**
 * Drag source options
 */
export interface DragSourceOptions {
  /** Data to pass when dropped */
  data?: any
  /** Default grid item options */
  itemOptions?: GridItemOptions
  /** Custom drag preview */
  preview?: string | HTMLElement
  /** Helper type */
  helper?: 'clone' | 'original'
  /** Revert if not dropped */
  revert?: boolean
}

/**
 * Grid layout for serialization
 */
export interface GridLayout {
  /** Grid options */
  options?: GridOptions
  /** Grid items */
  items: GridItemOptions[]
  /** Nested grids */
  children?: Record<string, GridLayout>
}

/**
 * Grid item state
 */
export interface GridItem extends GridItemOptions {
  /** DOM element */
  element: HTMLElement
  /** Grid instance reference */
  grid: IGridInstance
  /** Is nested grid */
  isNested?: boolean
  /** Nested grid instance */
  nestedGrid?: IGridInstance
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  /** Number of items */
  itemCount: number
  /** Number of visible items (if virtual scrolling) */
  visibleItemCount?: number
  /** Average render time (ms) */
  avgRenderTime: number
  /** Memory usage (bytes) */
  memoryUsage?: number
  /** FPS */
  fps?: number
  /** Last update timestamp */
  lastUpdate: number
}

/**
 * Grid instance interface
 */
export interface IGridInstance {
  /** Instance ID */
  id: string
  /** Container element */
  container: HTMLElement
  /** Grid options */
  options: GridOptions
  /** Native GridStack instance */
  native: GridStackNative
  /** Grid items */
  items: Map<string, GridItem>
  /** Parent grid (if nested) */
  parent?: IGridInstance
  /** Nested depth */
  depth: number

  /** Initialize grid */
  init(): void
  /** Add item to grid */
  addItem(element: HTMLElement, options: GridItemOptions): GridItem
  /** Remove item from grid */
  removeItem(id: string): void
  /** Update item */
  updateItem(id: string, options: Partial<GridItemOptions>): void
  /** Get item by id */
  getItem(id: string): GridItem | undefined
  /** Get all items */
  getAllItems(): GridItem[]
  /** Save layout */
  save(): GridLayout
  /** Load layout */
  load(layout: GridLayout): void
  /** Clear all items */
  clear(): void
  /** Enable drag */
  enableDrag(): void
  /** Disable drag */
  disableDrag(): void
  /** Enable resize */
  enableResize(): void
  /** Disable resize */
  disableResize(): void
  /** Destroy grid */
  destroy(): void
  /** Get performance stats */
  getStats(): PerformanceStats
}

/**
 * Grid Manager interface
 */
export interface IGridManager {
  /** Get manager instance */
  getInstance(): IGridManager
  /** Configure manager */
  configure(config: GridManagerConfig): void
  /** Create grid instance */
  create(container: HTMLElement, options: GridOptions): IGridInstance
  /** Get grid instance by id */
  get(id: string): IGridInstance | undefined
  /** Remove grid instance */
  remove(id: string): void
  /** Get all grid instances */
  getAll(): IGridInstance[]
  /** Destroy all grids */
  destroyAll(): void
  /** Get global performance stats */
  getGlobalStats(): GlobalPerformanceStats
}

/**
 * Global performance statistics
 */
export interface GlobalPerformanceStats {
  /** Total number of grids */
  totalGrids: number
  /** Total number of items */
  totalItems: number
  /** Average FPS across all grids */
  avgFps: number
  /** Total memory usage */
  totalMemory: number
  /** Active drag operations */
  activeDrags: number
}

/**
 * Drag event data
 */
export interface DragEventData {
  /** Source element */
  source: HTMLElement
  /** Source data */
  data?: any
  /** Grid item options */
  itemOptions?: GridItemOptions
  /** Event */
  event: DragEvent
}

/**
 * Grid events
 */
export interface GridEvents {
  /** Item added */
  added: (item: GridItem) => void
  /** Item removed */
  removed: (item: GridItem) => void
  /** Item updated */
  updated: (item: GridItem) => void
  /** Item drag started */
  dragstart: (item: GridItem) => void
  /** Item drag stopped */
  dragstop: (item: GridItem) => void
  /** Item resize started */
  resizestart: (item: GridItem) => void
  /** Item resize stopped */
  resizestop: (item: GridItem) => void
  /** Layout changed */
  change: (items: GridItem[]) => void
  /** External item dropped */
  dropped: (item: GridItem, data: DragEventData) => void
}

/**
 * Viewport rectangle
 */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Collision detection result
 */
export interface CollisionResult {
  hasCollision: boolean
  collidingItems: GridItem[]
}

/**
 * Batch operation
 */
export interface BatchOperation {
  type: 'add' | 'remove' | 'update'
  id?: string
  element?: HTMLElement
  options?: GridItemOptions
}

/**
 * Memory pool stats
 */
export interface PoolStats {
  size: number
  used: number
  available: number
}

export type { GridStackNative, GridStackOptions, GridStackNode, GridStackWidget }













