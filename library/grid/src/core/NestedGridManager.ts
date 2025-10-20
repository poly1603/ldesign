/**
 * Nested Grid Manager - Manages nested grid hierarchies
 */

import type { IGridInstance, GridItem, GridOptions, GridLayout } from '../types'

export class NestedGridManager {
  private parentGrid: IGridInstance
  private nestedGrids = new Map<string, IGridInstance>()
  private maxDepth: number
  private currentDepth: number

  constructor(parentGrid: IGridInstance, maxDepth = 3) {
    this.parentGrid = parentGrid
    this.maxDepth = maxDepth
    this.currentDepth = parentGrid.depth
  }

  /**
   * Create nested grid in item
   */
  createNestedGrid(item: GridItem, options: GridOptions): IGridInstance | null {
    // Check depth limit
    if (this.currentDepth >= this.maxDepth) {
      console.warn(`Max nesting depth (${this.maxDepth}) reached`)
      return null
    }

    // Check if item already has nested grid
    if (this.nestedGrids.has(item.id!)) {
      console.warn(`Item ${item.id} already has a nested grid`)
      return null
    }

    // Create nested container
    const nestedContainer = this.createNestedContainer(item.element)

    // Import GridManager dynamically to avoid circular dependency
    const { GridManager } = require('./GridManager')
    const manager = GridManager.getInstance()

    // Create nested grid with increased depth
    const nestedGrid = manager.create(nestedContainer, {
      ...options,
      nested: {
        enabled: true,
        maxDepth: this.maxDepth
      }
    })

    // Set parent and depth
    nestedGrid.parent = this.parentGrid
    nestedGrid.depth = this.currentDepth + 1

    // Store nested grid reference
    this.nestedGrids.set(item.id!, nestedGrid)
    item.nestedGrid = nestedGrid
    item.isNested = true

    // Mark element as nested
    item.element.classList.add('has-nested-grid')

    // Emit event
    this.parentGrid.container.dispatchEvent(
      new CustomEvent('nested-grid-created', {
        detail: { item, nestedGrid }
      })
    )

    return nestedGrid
  }

  /**
   * Remove nested grid from item
   */
  removeNestedGrid(itemId: string): void {
    const nestedGrid = this.nestedGrids.get(itemId)
    if (!nestedGrid) return

    // Destroy nested grid
    nestedGrid.destroy()

    // Remove from map
    this.nestedGrids.delete(itemId)

    // Update item
    const item = this.parentGrid.getItem(itemId)
    if (item) {
      item.nestedGrid = undefined
      item.isNested = false
      item.element.classList.remove('has-nested-grid')
    }

    // Emit event
    this.parentGrid.container.dispatchEvent(
      new CustomEvent('nested-grid-removed', {
        detail: { itemId }
      })
    )
  }

  /**
   * Get nested grid for item
   */
  getNestedGrid(itemId: string): IGridInstance | undefined {
    return this.nestedGrids.get(itemId)
  }

  /**
   * Get all nested grids
   */
  getAllNestedGrids(): IGridInstance[] {
    return Array.from(this.nestedGrids.values())
  }

  /**
   * Check if item has nested grid
   */
  hasNestedGrid(itemId: string): boolean {
    return this.nestedGrids.has(itemId)
  }

  /**
   * Get nesting depth
   */
  getDepth(): number {
    return this.currentDepth
  }

  /**
   * Get max depth
   */
  getMaxDepth(): number {
    return this.maxDepth
  }

  /**
   * Set max depth
   */
  setMaxDepth(depth: number): void {
    this.maxDepth = depth
  }

  /**
   * Can create nested grid (check depth limit)
   */
  canNest(): boolean {
    return this.currentDepth < this.maxDepth
  }

  /**
   * Create nested container element
   */
  private createNestedContainer(parentElement: HTMLElement): HTMLElement {
    // Find or create content element
    let contentElement = parentElement.querySelector('.grid-stack-item-content') as HTMLElement

    if (!contentElement) {
      contentElement = document.createElement('div')
      contentElement.className = 'grid-stack-item-content'
      parentElement.appendChild(contentElement)
    }

    // Create nested grid container
    const nestedContainer = document.createElement('div')
    nestedContainer.className = 'grid-stack nested-grid'
    nestedContainer.setAttribute('data-nested-depth', String(this.currentDepth + 1))

    // Clear existing content and add nested container
    contentElement.innerHTML = ''
    contentElement.appendChild(nestedContainer)

    return nestedContainer
  }

  /**
   * Serialize nested grids
   */
  serialize(): Record<string, GridLayout> {
    const serialized: Record<string, GridLayout> = {}

    this.nestedGrids.forEach((nestedGrid, itemId) => {
      // Import LayoutSerializer dynamically
      const { LayoutSerializer } = require('./LayoutSerializer')
      serialized[itemId] = LayoutSerializer.serialize(nestedGrid)
    })

    return serialized
  }

  /**
   * Deserialize and create nested grids
   */
  deserialize(layouts: Record<string, GridLayout>): void {
    Object.entries(layouts).forEach(([itemId, layout]) => {
      const item = this.parentGrid.getItem(itemId)
      if (!item) return

      // Create nested grid with layout options
      const nestedGrid = this.createNestedGrid(item, layout.options || {})
      if (!nestedGrid) return

      // Load layout into nested grid
      nestedGrid.load(layout)
    })
  }

  /**
   * Get grid hierarchy
   */
  getHierarchy(): any {
    const hierarchy: any = {
      id: this.parentGrid.id,
      depth: this.currentDepth,
      itemCount: this.parentGrid.items.size,
      children: {}
    }

    this.nestedGrids.forEach((nestedGrid, itemId) => {
      const nestedManager = nestedGrid.native as any
      if (nestedManager.nestedGridManager) {
        hierarchy.children[itemId] = nestedManager.nestedGridManager.getHierarchy()
      } else {
        hierarchy.children[itemId] = {
          id: nestedGrid.id,
          depth: nestedGrid.depth,
          itemCount: nestedGrid.items.size
        }
      }
    })

    return hierarchy
  }

  /**
   * Destroy all nested grids
   */
  destroy(): void {
    this.nestedGrids.forEach((nestedGrid) => {
      nestedGrid.destroy()
    })
    this.nestedGrids.clear()
  }
}













