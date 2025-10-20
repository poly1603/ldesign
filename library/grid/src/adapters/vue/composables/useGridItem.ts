/**
 * Vue 3 composable for grid item management
 */

import { ref, inject, onMounted, onUnmounted, type Ref } from 'vue'
import type { GridItemOptions, IGridInstance, GridItem } from '../../../types'

export interface UseGridItemReturn {
  itemRef: Ref<HTMLElement | undefined>
  gridItem: Ref<GridItem | undefined>
}

export function useGridItem(options: GridItemOptions): UseGridItemReturn {
  const itemRef = ref<HTMLElement>()
  const gridItem = ref<GridItem>()
  const gridInstance = inject<Ref<IGridInstance>>('grid-instance')

  onMounted(() => {
    if (!itemRef.value || !gridInstance?.value) return

    // Add item to grid
    gridItem.value = gridInstance.value.addItem(itemRef.value, options)
  })

  onUnmounted(() => {
    if (!gridItem.value || !gridInstance?.value) return

    // Remove item from grid
    gridInstance.value.removeItem(gridItem.value.id!)
  })

  return {
    itemRef,
    gridItem
  }
}













