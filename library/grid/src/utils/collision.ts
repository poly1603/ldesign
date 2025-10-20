/**
 * Collision detection utilities
 */

import type { GridItem, GridItemOptions, CollisionResult } from '../types'
import { rectsIntersect, getElementRect } from './grid-utils'

/**
 * Check if two grid items collide
 */
export function checkItemCollision(
  item1: GridItemOptions,
  item2: GridItemOptions
): boolean {
  const x1 = item1.x ?? 0
  const y1 = item1.y ?? 0
  const w1 = item1.w ?? 1
  const h1 = item1.h ?? 1

  const x2 = item2.x ?? 0
  const y2 = item2.y ?? 0
  const w2 = item2.w ?? 1
  const h2 = item2.h ?? 1

  return !(
    x1 + w1 <= x2 ||
    x2 + w2 <= x1 ||
    y1 + h1 <= y2 ||
    y2 + h2 <= y1
  )
}

/**
 * Find all colliding items
 */
export function findCollidingItems(
  item: GridItemOptions,
  allItems: GridItem[]
): GridItem[] {
  return allItems.filter(otherItem => {
    if (otherItem.id === item.id) {
      return false
    }
    return checkItemCollision(item, otherItem)
  })
}

/**
 * Check collision with items
 */
export function checkCollision(
  item: GridItemOptions,
  items: GridItem[]
): CollisionResult {
  const collidingItems = findCollidingItems(item, items)

  return {
    hasCollision: collidingItems.length > 0,
    collidingItems
  }
}

/**
 * Find available position for item
 */
export function findAvailablePosition(
  item: GridItemOptions,
  items: GridItem[],
  columns: number,
  maxY = 1000
): { x: number; y: number } | null {
  const w = item.w ?? 1
  const h = item.h ?? 1

  for (let y = 0; y < maxY; y++) {
    for (let x = 0; x <= columns - w; x++) {
      const testItem: GridItemOptions = { ...item, x, y, w, h }
      const collision = checkCollision(testItem, items)

      if (!collision.hasCollision) {
        return { x, y }
      }
    }
  }

  return null
}

/**
 * Compact items vertically
 */
export function compactItems(
  items: GridItem[],
  columns: number
): GridItemOptions[] {
  // Sort items by y position, then x position
  const sortedItems = [...items].sort((a, b) => {
    const yDiff = (a.y ?? 0) - (b.y ?? 0)
    if (yDiff !== 0) return yDiff
    return (a.x ?? 0) - (b.x ?? 0)
  })

  const compacted: GridItemOptions[] = []

  for (const item of sortedItems) {
    const newPosition = findAvailablePosition(
      item,
      compacted as GridItem[],
      columns,
      (item.y ?? 0) + (item.h ?? 1)
    )

    if (newPosition) {
      compacted.push({
        ...item,
        x: newPosition.x,
        y: newPosition.y
      })
    } else {
      compacted.push(item)
    }
  }

  return compacted
}

/**
 * Check if item fits in grid
 */
export function itemFitsInGrid(
  item: GridItemOptions,
  columns: number
): boolean {
  const x = item.x ?? 0
  const w = item.w ?? 1

  return x >= 0 && x + w <= columns
}

/**
 * Adjust item to fit in grid
 */
export function adjustItemToFit(
  item: GridItemOptions,
  columns: number
): GridItemOptions {
  let x = item.x ?? 0
  let w = item.w ?? 1

  // Ensure width doesn't exceed columns
  if (w > columns) {
    w = columns
  }

  // Ensure item doesn't overflow right edge
  if (x + w > columns) {
    x = columns - w
  }

  // Ensure x is not negative
  if (x < 0) {
    x = 0
  }

  return {
    ...item,
    x,
    w
  }
}

/**
 * Get item bounds
 */
export function getItemBounds(item: GridItemOptions): {
  left: number
  right: number
  top: number
  bottom: number
} {
  const x = item.x ?? 0
  const y = item.y ?? 0
  const w = item.w ?? 1
  const h = item.h ?? 1

  return {
    left: x,
    right: x + w,
    top: y,
    bottom: y + h
  }
}

/**
 * Check if items overlap
 */
export function itemsOverlap(
  item1: GridItemOptions,
  item2: GridItemOptions
): boolean {
  const bounds1 = getItemBounds(item1)
  const bounds2 = getItemBounds(item2)

  return !(
    bounds1.right <= bounds2.left ||
    bounds2.right <= bounds1.left ||
    bounds1.bottom <= bounds2.top ||
    bounds2.bottom <= bounds1.top
  )
}

/**
 * Get grid height (max y + h)
 */
export function getGridHeight(items: GridItem[]): number {
  if (items.length === 0) return 0

  return Math.max(
    ...items.map(item => (item.y ?? 0) + (item.h ?? 1))
  )
}

/**
 * Sort items by position
 */
export function sortItemsByPosition(items: GridItem[]): GridItem[] {
  return [...items].sort((a, b) => {
    const yDiff = (a.y ?? 0) - (b.y ?? 0)
    if (yDiff !== 0) return yDiff
    return (a.x ?? 0) - (b.x ?? 0)
  })
}













