/**
 * React hook for grid item management
 */

import { useRef, useEffect, useState, useContext } from 'react'
import type { GridItemOptions, GridItem } from '../../../types'
import { GridContext } from '../context/GridContext'

export interface UseGridItemReturn {
  itemRef: React.RefObject<HTMLDivElement>
  gridItem: GridItem | null
}

export function useGridItem(options: GridItemOptions): UseGridItemReturn {
  const itemRef = useRef<HTMLDivElement>(null)
  const [gridItem, setGridItem] = useState<GridItem | null>(null)
  const { gridInstance } = useContext(GridContext)

  useEffect(() => {
    if (!itemRef.current || !gridInstance) return

    // Add item to grid
    const item = gridInstance.addItem(itemRef.current, options)
    setGridItem(item)

    return () => {
      // Remove item from grid
      if (item && gridInstance) {
        gridInstance.removeItem(item.id!)
      }
    }
  }, [gridInstance])

  return {
    itemRef,
    gridItem
  }
}













