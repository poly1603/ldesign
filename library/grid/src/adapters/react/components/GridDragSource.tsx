/**
 * React GridDragSource component
 */

import React, { useRef, useEffect, useState, useContext } from 'react'
import type { GridDragSourceProps } from '../types'
import { GridContext } from '../context/GridContext'

export const GridDragSource: React.FC<GridDragSourceProps> = (props) => {
  const {
    data,
    itemOptions,
    preview,
    helper = 'clone',
    revert = false,
    children,
    className = '',
    style
  } = props

  const dragSourceRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { gridInstance } = useContext(GridContext)

  useEffect(() => {
    if (!dragSourceRef.current || !gridInstance) return

    const dragManager = gridInstance.getDragManager()
    const element = dragSourceRef.current

    // Register drag source
    const cleanup = dragManager.registerDragSource(element, {
      data,
      itemOptions,
      preview,
      helper,
      revert
    })

    // Add drag event listeners
    const handleDragStart = () => {
      setIsDragging(true)
    }

    const handleDragEnd = () => {
      setIsDragging(false)
    }

    element.addEventListener('dragstart', handleDragStart)
    element.addEventListener('dragend', handleDragEnd)

    return () => {
      cleanup()
      element.removeEventListener('dragstart', handleDragStart)
      element.removeEventListener('dragend', handleDragEnd)
    }
  }, [gridInstance, data, itemOptions, preview, helper, revert])

  return (
    <div
      ref={dragSourceRef}
      className={`grid-drag-source ${isDragging ? 'is-dragging' : ''} ${className}`}
      style={{
        cursor: 'move',
        userSelect: 'none',
        ...style
      }}
      draggable
    >
      {children}
    </div>
  )
}

GridDragSource.displayName = 'GridDragSource'

export default GridDragSource













