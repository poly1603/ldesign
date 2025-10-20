<template>
  <div ref="itemRef" class="grid-stack-item">
    <div class="grid-stack-item-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, watch, type Ref } from 'vue'
import type { IGridInstance, GridItem } from '../../../types'
import type { GridItemProps } from '../types'

const props = defineProps<GridItemProps>()

const itemRef = ref<HTMLElement>()
const gridItem = ref<GridItem>()
const gridInstance = inject<Ref<IGridInstance> | undefined>('grid-instance', undefined)

onMounted(() => {
  if (!itemRef.value || !gridInstance?.value) return

  // Add item to grid
  gridItem.value = gridInstance.value.addItem(itemRef.value, props)
})

onUnmounted(() => {
  if (!gridItem.value || !gridInstance?.value) return

  // Remove item from grid
  gridInstance.value.removeItem(gridItem.value.id!)
})

// Watch for prop changes
watch(() => props, (newProps) => {
  if (!gridItem.value || !gridInstance?.value) return

  // Update item
  gridInstance.value.updateItem(gridItem.value.id!, newProps)
}, { deep: true })

defineExpose({
  gridItem,
  element: itemRef
})
</script>

<style>
.grid-stack-item {
  position: absolute;
}

.grid-stack-item-content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>













