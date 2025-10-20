/**
 * Layout serialization and deserialization
 */

import type { GridLayout, GridItemOptions, GridOptions, IGridInstance } from '../types'
import { deepClone } from '../utils/grid-utils'

export class LayoutSerializer {
  /**
   * Serialize grid layout
   */
  static serialize(grid: IGridInstance): GridLayout {
    const items: GridItemOptions[] = []
    const children: Record<string, GridLayout> = {}

    // Serialize items
    grid.getAllItems().forEach(item => {
      const itemData: GridItemOptions = {
        id: item.id,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW,
        maxW: item.maxW,
        minH: item.minH,
        maxH: item.maxH,
        locked: item.locked,
        noResize: item.noResize,
        noMove: item.noMove,
        content: typeof item.content === 'string' ? item.content : undefined,
        data: item.data
      }

      items.push(itemData)

      // Serialize nested grids
      if (item.nestedGrid) {
        children[item.id!] = LayoutSerializer.serialize(item.nestedGrid)
      }
    })

    return {
      options: deepClone(grid.options),
      items,
      children: Object.keys(children).length > 0 ? children : undefined
    }
  }

  /**
   * Deserialize grid layout
   */
  static deserialize(layout: GridLayout): GridLayout {
    return deepClone(layout)
  }

  /**
   * Export layout to JSON string
   */
  static toJSON(grid: IGridInstance, pretty = false): string {
    const layout = LayoutSerializer.serialize(grid)
    return JSON.stringify(layout, null, pretty ? 2 : 0)
  }

  /**
   * Import layout from JSON string
   */
  static fromJSON(json: string): GridLayout {
    try {
      const layout = JSON.parse(json)
      return LayoutSerializer.deserialize(layout)
    } catch (error) {
      throw new Error(`Failed to parse layout JSON: ${error}`)
    }
  }

  /**
   * Export layout to local storage
   */
  static saveToLocalStorage(key: string, grid: IGridInstance): void {
    try {
      const json = LayoutSerializer.toJSON(grid)
      localStorage.setItem(key, json)
    } catch (error) {
      console.error('Failed to save layout to local storage:', error)
    }
  }

  /**
   * Import layout from local storage
   */
  static loadFromLocalStorage(key: string): GridLayout | null {
    try {
      const json = localStorage.getItem(key)
      if (!json) return null
      return LayoutSerializer.fromJSON(json)
    } catch (error) {
      console.error('Failed to load layout from local storage:', error)
      return null
    }
  }

  /**
   * Clear layout from local storage
   */
  static clearLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to clear layout from local storage:', error)
    }
  }

  /**
   * Validate layout structure
   */
  static validate(layout: any): boolean {
    if (!layout || typeof layout !== 'object') {
      return false
    }

    if (!Array.isArray(layout.items)) {
      return false
    }

    // Validate each item
    for (const item of layout.items) {
      if (typeof item !== 'object') {
        return false
      }

      // Check required properties
      if (typeof item.x !== 'number' || typeof item.y !== 'number') {
        return false
      }

      if (typeof item.w !== 'number' || typeof item.h !== 'number') {
        return false
      }
    }

    return true
  }

  /**
   * Merge layouts
   */
  static merge(layout1: GridLayout, layout2: GridLayout): GridLayout {
    return {
      options: { ...layout1.options, ...layout2.options },
      items: [...layout1.items, ...layout2.items],
      children: { ...layout1.children, ...layout2.children }
    }
  }

  /**
   * Diff two layouts
   */
  static diff(layout1: GridLayout, layout2: GridLayout): {
    added: GridItemOptions[]
    removed: GridItemOptions[]
    modified: GridItemOptions[]
  } {
    const added: GridItemOptions[] = []
    const removed: GridItemOptions[] = []
    const modified: GridItemOptions[] = []

    const items1Map = new Map(layout1.items.map(item => [item.id, item]))
    const items2Map = new Map(layout2.items.map(item => [item.id, item]))

    // Find added and modified
    layout2.items.forEach(item2 => {
      const item1 = items1Map.get(item2.id)
      if (!item1) {
        added.push(item2)
      } else if (JSON.stringify(item1) !== JSON.stringify(item2)) {
        modified.push(item2)
      }
    })

    // Find removed
    layout1.items.forEach(item1 => {
      if (!items2Map.has(item1.id)) {
        removed.push(item1)
      }
    })

    return { added, removed, modified }
  }

  /**
   * Clone layout
   */
  static clone(layout: GridLayout): GridLayout {
    return deepClone(layout)
  }

  /**
   * Export layout to data URL
   */
  static toDataURL(grid: IGridInstance): string {
    const json = LayoutSerializer.toJSON(grid)
    const blob = new Blob([json], { type: 'application/json' })
    return URL.createObjectURL(blob)
  }

  /**
   * Import layout from file
   */
  static async fromFile(file: File): Promise<GridLayout> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const json = e.target?.result as string
          const layout = LayoutSerializer.fromJSON(json)
          resolve(layout)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
}













