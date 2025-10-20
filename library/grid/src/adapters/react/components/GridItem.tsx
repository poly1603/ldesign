/**
 * React GridItem component
 */

import React, { useRef, useEffect, useContext } from 'react'
import type { GridItemProps } from '../types'
import { GridContext } from '../context/GridContext'

export const GridItem: React.FC<GridItemProps> = (props) => {
  const { id, children, className = '', style, ...itemOptions } = props
  const itemRef = useRef<HTMLDivElement>(null)
  const { gridInstance } = useContext(GridContext)

  useEffect(() => {
    if (!itemRef.current || !gridInstance) return

    // Add item to grid
    const item = gridInstance.addItem(itemRef.current, {
      id,
      ...itemOptions
    })

    return () => {
      // Remove item from grid
      if (item && gridInstance) {
        gridInstance.removeItem(item.id!)
      }
    }
  }, [gridInstance])

  // Update item when props change
  useEffect(() => {
    if (!gridInstance) return

    gridInstance.updateItem(id, itemOptions)
  }, [gridInstance, id, itemOptions])

  return (
    <div ref={itemRef} className={`grid-stack-item ${className}`} style={style}>
      <div className="grid-stack-item-content">
        {children}
      </div>
    </div>
  )
}

GridItem.displayName = 'GridItem'

export default GridItem













