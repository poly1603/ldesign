<template>
  <div
    ref="dragSourceRef"
    class="grid-drag-source"
    :class="{ 'is-dragging': isDragging }"
    draggable="true"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, type Ref } from 'vue'
import type { IGridInstance } from '../../../types'
import type { GridDragSourceProps } from '../types'

const props = withDefaults(defineProps<GridDragSourceProps>(), {
  helper: 'clone',
  revert: false
})

const dragSourceRef = ref<HTMLElement>()
const isDragging = ref(false)
// GridInstance is optional - when used outside GridStack, will drag to any accepting grid
const gridInstance = inject<Ref<IGridInstance> | undefined>('grid-instance', undefined)
let cleanup: (() => void) | undefined

onMounted(() => {
  if (!dragSourceRef.value) return

  const element = dragSourceRef.value

  // If inside a GridStack, register with its drag manager
  if (gridInstance?.value) {
    const dragManager = gridInstance.value.getDragManager()
    
    // Register drag source
    cleanup = dragManager.registerDragSource(element, {
      data: props.data,
      itemOptions: props.itemOptions,
      preview: props.preview,
      helper: props.helper,
      revert: props.revert
    })
  } else {
    // For external drag sources, set data attributes for GridStack to pick up
    if (props.data) {
      element.setAttribute('data-drag-source', JSON.stringify({
        data: props.data,
        itemOptions: props.itemOptions || {}
      }))
    }
  }

  // Add drag event listeners
  const handleDragStart = (e: DragEvent) => {
    isDragging.value = true
    
    // For external drag sources, set drag data
    if (!gridInstance?.value && e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy'
      e.dataTransfer.setData('application/json', JSON.stringify({
        data: props.data,
        itemOptions: props.itemOptions || {}
      }))
    }
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

defineExpose({
  dragSourceRef,
  isDragging
})
</script>

<style>
.grid-drag-source {
  cursor: move;
  user-select: none;
}

.grid-drag-source.is-dragging {
  opacity: 0.5;
}

.grid-drag-source:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>













