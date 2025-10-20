/**
 * React hook for grid management
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import type { GridOptions, GridItemOptions, IGridInstance, GridLayout } from '../../../types'
import { GridManager } from '../../../core/GridManager'

export interface UseGridReturn {
  gridRef: React.RefObject<HTMLDivElement>
  gridInstance: IGridInstance | null
  items: GridItemOptions[]
  isReady: boolean
  addItem: (element: HTMLElement, options: GridItemOptions) => void
  removeItem: (id: string) => void
  updateItem: (id: string, options: Partial<GridItemOptions>) => void
  clear: () => void
  save: () => GridLayout | null
  load: (layout: GridLayout) => void
  enableDrag: () => void
  disableDrag: () => void
  enableResize: () => void
  disableResize: () => void
}

export function useGrid(options: GridOptions = {}): UseGridReturn {
  const gridRef = useRef<HTMLDivElement>(null)
  const [gridInstance, setGridInstance] = useState<IGridInstance | null>(null)
  const [items, setItems] = useState<GridItemOptions[]>([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!gridRef.current) return

    const manager = GridManager.getInstance()
    const instance = manager.create(gridRef.current, options)

    // Setup event listeners
    instance.on('change', (changedItems) => {
      setItems(changedItems.map(item => ({
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
        content: item.content,
        data: item.data
      })))
    })

    setGridInstance(instance)
    setIsReady(true)

    return () => {
      instance.destroy()
    }
  }, []) // Only run on mount

  const addItem = useCallback((element: HTMLElement, itemOptions: GridItemOptions) => {
    if (!gridInstance) return
    gridInstance.addItem(element, itemOptions)
  }, [gridInstance])

  const removeItem = useCallback((id: string) => {
    if (!gridInstance) return
    gridInstance.removeItem(id)
  }, [gridInstance])

  const updateItem = useCallback((id: string, itemOptions: Partial<GridItemOptions>) => {
    if (!gridInstance) return
    gridInstance.updateItem(id, itemOptions)
  }, [gridInstance])

  const clear = useCallback(() => {
    if (!gridInstance) return
    gridInstance.clear()
    setItems([])
  }, [gridInstance])

  const save = useCallback((): GridLayout | null => {
    if (!gridInstance) return null
    return gridInstance.save()
  }, [gridInstance])

  const load = useCallback((layout: GridLayout) => {
    if (!gridInstance) return
    gridInstance.load(layout)
  }, [gridInstance])

  const enableDrag = useCallback(() => {
    if (!gridInstance) return
    gridInstance.enableDrag()
  }, [gridInstance])

  const disableDrag = useCallback(() => {
    if (!gridInstance) return
    gridInstance.disableDrag()
  }, [gridInstance])

  const enableResize = useCallback(() => {
    if (!gridInstance) return
    gridInstance.enableResize()
  }, [gridInstance])

  const disableResize = useCallback(() => {
    if (!gridInstance) return
    gridInstance.disableResize()
  }, [gridInstance])

  return {
    gridRef,
    gridInstance,
    items,
    isReady,
    addItem,
    removeItem,
    updateItem,
    clear,
    save,
    load,
    enableDrag,
    disableDrag,
    enableResize,
    disableResize
  }
}













