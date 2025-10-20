/**
 * Vue directive for drag sources
 */

import type { Directive } from 'vue'
import type { DragSourceOptions } from '../../../types'

export const vDragSource: Directive<HTMLElement, DragSourceOptions> = {
  mounted(el, binding) {
    // Get grid instance from context or nearest grid
    const gridElement = binding.arg
      ? document.querySelector(binding.arg)
      : el.closest('.ldesign-grid-vue')

    const gridInstance = (gridElement as any)?.__gridInstance

    if (!gridInstance) {
      console.warn('v-drag-source: Grid instance not found')
      return
    }

    // Get drag manager
    const dragManager = gridInstance.getDragManager()

    // Register drag source
    const cleanup = dragManager.registerDragSource(el, binding.value || {})

      // Store cleanup function
      ; (el as any).__dragSourceCleanup = cleanup
  },

  updated(el, binding) {
    // Clean up old registration
    const cleanup = (el as any).__dragSourceCleanup
    if (cleanup) {
      cleanup()
    }

    // Re-register with new options
    const gridElement = binding.arg
      ? document.querySelector(binding.arg)
      : el.closest('.ldesign-grid-vue')

    const gridInstance = (gridElement as any)?.__gridInstance

    if (!gridInstance) return

    const dragManager = gridInstance.getDragManager()
    const newCleanup = dragManager.registerDragSource(el, binding.value || {})

      ; (el as any).__dragSourceCleanup = newCleanup
  },

  unmounted(el) {
    const cleanup = (el as any).__dragSourceCleanup
    if (cleanup) {
      cleanup()
      delete (el as any).__dragSourceCleanup
    }
  }
}













