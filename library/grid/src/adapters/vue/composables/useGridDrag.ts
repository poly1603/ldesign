/**
 * Vue 3 composable for drag source management
 */

import { ref, inject, onMounted, onUnmounted, type Ref } from 'vue'
import type { DragSourceOptions, IGridInstance } from '../../../types'

export interface UseGridDragReturn {
  dragSourceRef: Ref<HTMLElement | undefined>
  isDragging: Ref<boolean>
}

export function useGridDrag(options: DragSourceOptions = {}): UseGridDragReturn {
  const dragSourceRef = ref<HTMLElement>()
  const isDragging = ref(false)
  const gridInstance = inject<Ref<IGridInstance>>('grid-instance')
  let cleanup: (() => void) | undefined

  onMounted(() => {
    if (!dragSourceRef.value || !gridInstance?.value) return

    const dragManager = gridInstance.value.getDragManager()

    // Register drag source
    cleanup = dragManager.registerDragSource(dragSourceRef.value, options)

    // Add drag event listeners
    const element = dragSourceRef.value

    const handleDragStart = () => {
      isDragging.value = true
    }

    const handleDragEnd = () => {
      isDragging.value = false
    }

    element.addEventListener('dragstart', handleDragStart)
    element.addEventListener('dragend', handleDragEnd)

    // Store cleanup for event listeners
    const originalCleanup = cleanup
    cleanup = () => {
      originalCleanup?.()
      element.removeEventListener('dragstart', handleDragStart)
      element.removeEventListener('dragend', handleDragEnd)
    }
  })

  onUnmounted(() => {
    cleanup?.()
  })

  return {
    dragSourceRef,
    isDragging
  }
}













