/**
 * React hook for grid controls
 */

import { useContext, useCallback } from 'react'
import type { GridLayout } from '../../../types'
import { GridContext } from '../context/GridContext'

export interface UseGridControlsReturn {
  clear: () => void
  save: () => GridLayout | null
  load: (layout: GridLayout) => void
  enableDrag: () => void
  disableDrag: () => void
  enableResize: () => void
  disableResize: () => void
}

export function useGridControls(): UseGridControlsReturn {
  const { gridInstance } = useContext(GridContext)

  const clear = useCallback(() => {
    if (!gridInstance) return
    gridInstance.clear()
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
    clear,
    save,
    load,
    enableDrag,
    disableDrag,
    enableResize,
    disableResize
  }
}













