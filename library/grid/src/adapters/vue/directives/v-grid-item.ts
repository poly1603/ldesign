/**
 * Vue directive for grid items
 */

import type { Directive } from 'vue'
import type { GridItemOptions } from '../../../types'

export const vGridItem: Directive<HTMLElement, GridItemOptions> = {
  mounted(el, binding) {
    // Get grid instance from parent context
    const gridInstance = (el.closest('.ldesign-grid-vue') as any)?.__gridInstance

    if (!gridInstance) {
      console.warn('v-grid-item: Grid instance not found')
      return
    }

    // Add item to grid
    const item = gridInstance.addItem(el, binding.value)

      // Store item reference on element
      ; (el as any).__gridItem = item
  },

  updated(el, binding) {
    const item = (el as any).__gridItem

    if (!item) return

    // Get grid instance
    const gridInstance = (el.closest('.ldesign-grid-vue') as any)?.__gridInstance

    if (!gridInstance) return

    // Update item
    gridInstance.updateItem(item.id, binding.value)
  },

  unmounted(el) {
    const item = (el as any).__gridItem

    if (!item) return

    // Get grid instance
    const gridInstance = (el.closest('.ldesign-grid-vue') as any)?.__gridInstance

    if (!gridInstance) return

    // Remove item
    gridInstance.removeItem(item.id)

    // Clean up reference
    delete (el as any).__gridItem
  }
}













