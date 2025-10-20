/**
 * React hook for drag source management
 */

import { useRef, useEffect, useState, useContext } from 'react'
import type { DragSourceOptions } from '../../../types'
import { GridContext } from '../context/GridContext'

export interface UseGridDragReturn {
  dragSourceRef: React.RefObject<HTMLDivElement>
  isDragging: boolean
}

export function useGridDrag(options: DragSourceOptions = {}): UseGridDragReturn {
  const dragSourceRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { gridInstance } = useContext(GridContext)

  useEffect(() => {
    if (!dragSourceRef.current || !gridInstance) return

    const dragManager = gridInstance.getDragManager()
    const element = dragSourceRef.current

    // Register drag source
    const cleanup = dragManager.registerDragSource(element, options)

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
  }, [gridInstance, options])

  return {
    dragSourceRef,
    isDragging
  }
}













