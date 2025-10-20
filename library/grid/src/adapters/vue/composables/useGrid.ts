/**
 * Vue 3 composable for grid management
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import type { GridOptions, GridItemOptions, IGridInstance, GridLayout } from '../../../types'
import { GridManager } from '../../../core/GridManager'

export interface UseGridReturn {
  gridRef: Ref<HTMLElement | undefined>
  gridInstance: Ref<IGridInstance | undefined>
  items: Ref<GridItemOptions[]>
  isReady: Ref<boolean>
  addItem: (element: HTMLElement, options: GridItemOptions) => void
  removeItem: (id: string) => void
  updateItem: (id: string, options: Partial<GridItemOptions>) => void
  clear: () => void
  save: () => GridLayout | undefined
  load: (layout: GridLayout) => void
  enableDrag: () => void
  disableDrag: () => void
  enableResize: () => void
  disableResize: () => void
}

export function useGrid(options: GridOptions = {}): UseGridReturn {
  const gridRef = ref<HTMLElement>()
  const gridInstance = ref<IGridInstance>()
  const items = ref<GridItemOptions[]>([])
  const isReady = ref(false)

  const initGrid = () => {
    if (!gridRef.value) return

    const manager = GridManager.getInstance()
    gridInstance.value = manager.create(gridRef.value, options)

    // Setup event listeners
    gridInstance.value.on('change', (changedItems) => {
      items.value = changedItems.map(item => ({
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
      }))
    })

    isReady.value = true
  }

  const addItem = (element: HTMLElement, itemOptions: GridItemOptions) => {
    if (!gridInstance.value) return
    gridInstance.value.addItem(element, itemOptions)
  }

  const removeItem = (id: string) => {
    if (!gridInstance.value) return
    gridInstance.value.removeItem(id)
  }

  const updateItem = (id: string, itemOptions: Partial<GridItemOptions>) => {
    if (!gridInstance.value) return
    gridInstance.value.updateItem(id, itemOptions)
  }

  const clear = () => {
    if (!gridInstance.value) return
    gridInstance.value.clear()
    items.value = []
  }

  const save = (): GridLayout | undefined => {
    if (!gridInstance.value) return
    return gridInstance.value.save()
  }

  const load = (layout: GridLayout) => {
    if (!gridInstance.value) return
    gridInstance.value.load(layout)
  }

  const enableDrag = () => {
    if (!gridInstance.value) return
    gridInstance.value.enableDrag()
  }

  const disableDrag = () => {
    if (!gridInstance.value) return
    gridInstance.value.disableDrag()
  }

  const enableResize = () => {
    if (!gridInstance.value) return
    gridInstance.value.enableResize()
  }

  const disableResize = () => {
    if (!gridInstance.value) return
    gridInstance.value.disableResize()
  }

  onMounted(() => {
    initGrid()
  })

  onUnmounted(() => {
    if (gridInstance.value) {
      gridInstance.value.destroy()
    }
  })

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













