/**
 * React GridStack component
 */

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { GridManager } from '../../../core/GridManager'
import type { IGridInstance } from '../../../types'
import type { GridStackProps } from '../types'
import { GridProvider } from '../context/GridContext'

export interface GridStackRef {
  gridInstance: IGridInstance | null
  addItem: (element: HTMLElement, options: any) => void
  removeItem: (id: string) => void
  clear: () => void
  save: () => any
  load: (layout: any) => void
}

export const GridStack = forwardRef<GridStackRef, GridStackProps>((props, ref) => {
  const {
    options = {},
    children,
    onChange,
    onAdded,
    onRemoved,
    onDragStart,
    onDragStop,
    onResizeStart,
    onResizeStop,
    onDropped,
    className = '',
    style
  } = props

  const gridRef = useRef<HTMLDivElement>(null)
  const [gridInstance, setGridInstance] = useState<IGridInstance | null>(null)

  useEffect(() => {
    if (!gridRef.current) return

    const manager = GridManager.getInstance()
    const instance = manager.create(gridRef.current, options)

    // Setup event listeners
    if (onChange) {
      instance.on('change', onChange)
    }

    if (onAdded) {
      instance.on('added', onAdded)
    }

    if (onRemoved) {
      instance.on('removed', onRemoved)
    }

    if (onDragStart) {
      instance.on('dragstart', onDragStart)
    }

    if (onDragStop) {
      instance.on('dragstop', onDragStop)
    }

    if (onResizeStart) {
      instance.on('resizestart', onResizeStart)
    }

    if (onResizeStop) {
      instance.on('resizestop', onResizeStop)
    }

    if (onDropped) {
      instance.on('dropped', onDropped)
    }

    setGridInstance(instance)

    return () => {
      instance.destroy()
    }
  }, []) // Only run on mount

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    gridInstance,
    addItem: (element: HTMLElement, itemOptions: any) => {
      if (gridInstance) {
        gridInstance.addItem(element, itemOptions)
      }
    },
    removeItem: (id: string) => {
      if (gridInstance) {
        gridInstance.removeItem(id)
      }
    },
    clear: () => {
      if (gridInstance) {
        gridInstance.clear()
      }
    },
    save: () => {
      return gridInstance?.save()
    },
    load: (layout: any) => {
      if (gridInstance) {
        gridInstance.load(layout)
      }
    }
  }))

  return (
    <GridProvider gridInstance={gridInstance}>
      <div
        ref={gridRef}
        className={`grid-stack ldesign-grid-react ${className}`}
        style={style}
      >
        {children}
      </div>
    </GridProvider>
  )
})

GridStack.displayName = 'GridStack'

export default GridStack













