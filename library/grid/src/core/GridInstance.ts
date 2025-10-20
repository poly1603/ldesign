/**
 * Grid Instance - Core grid functionality wrapper
 */

import { GridStack } from 'gridstack'
import type {
  IGridInstance,
  GridOptions,
  GridItemOptions,
  GridItem,
  GridLayout,
  PerformanceStats,
  GridStackNative
} from '../types'
import { EventBus } from '../utils/event-bus'
import { generateId, normalizeItemOptions } from '../utils/grid-utils'
import { PerformanceMonitor } from './PerformanceMonitor'
import { MemoryManager } from './MemoryManager'
import { DragManager } from './DragManager'
import { NestedGridManager } from './NestedGridManager'
import { LayoutSerializer } from './LayoutSerializer'
import { ResponsiveManager } from './ResponsiveManager'

export class GridInstance implements IGridInstance {
  id: string
  container: HTMLElement
  options: GridOptions
  native: GridStackNative
  items: Map<string, GridItem> = new Map()
  parent?: IGridInstance
  depth: number = 0

  private eventBus: EventBus
  private performanceMonitor: PerformanceMonitor
  private memoryManager: MemoryManager
  private dragManager: DragManager
  private nestedGridManager?: NestedGridManager
  private responsiveManager?: ResponsiveManager
  private isInitialized = false

  constructor(container: HTMLElement, options: GridOptions = {}) {
    this.id = generateId('grid')
    this.container = container
    this.options = this.normalizeOptions(options)

    // Initialize utilities
    this.eventBus = new EventBus()
    this.performanceMonitor = new PerformanceMonitor()
    this.memoryManager = new MemoryManager(options.performance?.batchUpdate !== false)

    // Initialize grid
    this.native = GridStack.init(this.options, container) as GridStackNative

    // Initialize managers
    this.dragManager = new DragManager(this)

    if (this.options.nested?.enabled) {
      this.nestedGridManager = new NestedGridManager(
        this,
        this.options.nested.maxDepth || 3
      )
    }

    if (this.options.cellHeight && this.options.column) {
      this.responsiveManager = new ResponsiveManager(this)
    }

    this.init()
  }

  /**
   * Normalize grid options
   */
  private normalizeOptions(options: GridOptions): GridOptions {
    return {
      column: 12,
      cellHeight: 70,
      acceptWidgets: true,
      float: true,
      animate: true,
      ...options,
      nested: options.nested || { enabled: false },
      performance: {
        virtualScroll: false,
        batchUpdate: true,
        lazyRender: false,
        ...options.performance
      }
    }
  }

  /**
   * Initialize grid
   */
  init(): void {
    if (this.isInitialized) return

    this.setupEventListeners()
    this.isInitialized = true

    // Mark container
    this.container.classList.add('ldesign-grid')
    this.container.setAttribute('data-grid-id', this.id)
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // GridStack events
    this.native.on('added', (event: any, items: any[]) => {
      items.forEach(item => {
        const gridItem = this.items.get(item.id)
        if (gridItem) {
          this.eventBus.emit('added', gridItem)
        }
      })
      this.performanceMonitor.updateItemCount(this.items.size)
    })

    this.native.on('removed', (event: any, items: any[]) => {
      items.forEach(item => {
        const gridItem = this.items.get(item.id)
        if (gridItem) {
          this.eventBus.emit('removed', gridItem)
          this.items.delete(item.id)
        }
      })
      this.performanceMonitor.updateItemCount(this.items.size)
    })

    this.native.on('change', (event: any, items: any[]) => {
      const gridItems: GridItem[] = []
      items.forEach(item => {
        const gridItem = this.items.get(item.id)
        if (gridItem) {
          // Update item properties
          gridItem.x = item.x
          gridItem.y = item.y
          gridItem.w = item.w
          gridItem.h = item.h
          gridItems.push(gridItem)
          this.eventBus.emit('updated', gridItem)
        }
      })
      this.eventBus.emit('change', gridItems)
    })

    this.native.on('dragstart', (event: any, el: HTMLElement) => {
      const item = this.getItemByElement(el)
      if (item) {
        this.eventBus.emit('dragstart', item)
      }
    })

    this.native.on('dragstop', (event: any, el: HTMLElement) => {
      const item = this.getItemByElement(el)
      if (item) {
        this.eventBus.emit('dragstop', item)
      }
    })

    this.native.on('resizestart', (event: any, el: HTMLElement) => {
      const item = this.getItemByElement(el)
      if (item) {
        this.eventBus.emit('resizestart', item)
      }
    })

    this.native.on('resizestop', (event: any, el: HTMLElement) => {
      const item = this.getItemByElement(el)
      if (item) {
        this.eventBus.emit('resizestop', item)
      }
    })

    // Custom events
    this.container.addEventListener('item-dropped', ((e: CustomEvent) => {
      this.eventBus.emit('dropped', e.detail.item, e.detail.data)
    }) as EventListener)
  }

  /**
   * Add item to grid
   */
  addItem(element: HTMLElement, options: GridItemOptions): GridItem {
    const startTime = performance.now()

    // Normalize options
    const normalizedOptions = normalizeItemOptions(options)
    const id = normalizedOptions.id!

    // Add to GridStack
    this.native.addWidget(element, {
      ...normalizedOptions,
      id
    })

    // Create grid item
    const gridItem: GridItem = {
      ...normalizedOptions,
      element,
      grid: this
    }

    // Store item
    this.items.set(id, gridItem)

    // Store in memory manager
    this.memoryManager.setData(element, gridItem)

    // Optimize item
    if (this.options.performance?.lazyRender) {
      this.memoryManager.optimizeItem(gridItem)
    }

    // Record performance
    this.performanceMonitor.recordRender(startTime)
    this.performanceMonitor.updateItemCount(this.items.size)

    return gridItem
  }

  /**
   * Remove item from grid
   */
  removeItem(id: string): void {
    const item = this.items.get(id)
    if (!item) return

    // Remove nested grid if exists
    if (item.nestedGrid && this.nestedGridManager) {
      this.nestedGridManager.removeNestedGrid(id)
    }

    // Remove from GridStack
    this.native.removeWidget(item.element, true)

    // Remove from items
    this.items.delete(id)

    // Cleanup
    this.memoryManager.registerCleanup(() => {
      // Element is already removed by GridStack
    })
  }

  /**
   * Update item
   */
  updateItem(id: string, options: Partial<GridItemOptions>): void {
    const item = this.items.get(id)
    if (!item) return

    // Update GridStack item
    this.native.update(item.element, options)

    // Update item properties
    Object.assign(item, options)
  }

  /**
   * Get item by id
   */
  getItem(id: string): GridItem | undefined {
    return this.items.get(id)
  }

  /**
   * Get item by element
   */
  private getItemByElement(element: HTMLElement): GridItem | undefined {
    return this.memoryManager.getData(element)
  }

  /**
   * Get all items
   */
  getAllItems(): GridItem[] {
    return Array.from(this.items.values())
  }

  /**
   * Save layout
   */
  save(): GridLayout {
    return LayoutSerializer.serialize(this)
  }

  /**
   * Load layout
   */
  load(layout: GridLayout): void {
    // Clear existing items
    this.clear()

    // Update options if provided
    if (layout.options) {
      this.options = { ...this.options, ...layout.options }
    }

    // Add items
    layout.items.forEach(itemOptions => {
      const element = this.createItemElement(itemOptions)
      this.addItem(element, itemOptions)
    })

    // Load nested grids
    if (layout.children && this.nestedGridManager) {
      this.nestedGridManager.deserialize(layout.children)
    }
  }

  /**
   * Create item element
   */
  private createItemElement(options: GridItemOptions): HTMLElement {
    const element = document.createElement('div')
    element.className = 'grid-stack-item'

    const content = document.createElement('div')
    content.className = 'grid-stack-item-content'

    if (options.content) {
      if (typeof options.content === 'string') {
        content.innerHTML = options.content
      } else {
        content.appendChild(options.content)
      }
    }

    element.appendChild(content)
    return element
  }

  /**
   * Clear all items
   */
  clear(): void {
    // Remove all items
    this.items.forEach((item, id) => {
      this.removeItem(id)
    })

    // Alternative: use GridStack's removeAll
    this.native.removeAll()
    this.items.clear()
  }

  /**
   * Enable drag
   */
  enableDrag(): void {
    this.native.enableMove(true)
  }

  /**
   * Disable drag
   */
  disableDrag(): void {
    this.native.enableMove(false)
  }

  /**
   * Enable resize
   */
  enableResize(): void {
    this.native.enableResize(true)
  }

  /**
   * Disable resize
   */
  disableResize(): void {
    this.native.enableResize(false)
  }

  /**
   * Get performance stats
   */
  getStats(): PerformanceStats {
    return this.performanceMonitor.getStats()
  }

  /**
   * Get event bus
   */
  on(event: string, callback: (...args: any[]) => void): () => void {
    return this.eventBus.on(event, callback)
  }

  /**
   * Emit event
   */
  emit(event: string, ...args: any[]): void {
    this.eventBus.emit(event, ...args)
  }

  /**
   * Get drag manager
   */
  getDragManager(): DragManager {
    return this.dragManager
  }

  /**
   * Get nested grid manager
   */
  getNestedGridManager(): NestedGridManager | undefined {
    return this.nestedGridManager
  }

  /**
   * Get responsive manager
   */
  getResponsiveManager(): ResponsiveManager | undefined {
    return this.responsiveManager
  }

  /**
   * Destroy grid
   */
  destroy(): void {
    // Destroy nested grids
    if (this.nestedGridManager) {
      this.nestedGridManager.destroy()
    }

    // Destroy managers
    this.dragManager.destroy()
    this.responsiveManager?.destroy()
    this.performanceMonitor.destroy()
    this.memoryManager.destroy()

    // Clear event bus
    this.eventBus.clear()

    // Destroy GridStack
    this.native.destroy(false)

    // Clear items
    this.items.clear()

    // Remove container markers
    this.container.classList.remove('ldesign-grid')
    this.container.removeAttribute('data-grid-id')

    this.isInitialized = false
  }
}













