<template>
  <div ref="gridRef" class="grid-stack ldesign-grid-vue">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted, watch } from 'vue'
import { GridManager } from '../../../core/GridManager'
import type { IGridInstance } from '../../../types'
import type { GridStackProps, GridStackEmits } from '../types'

const props = withDefaults(defineProps<GridStackProps>(), {
  options: () => ({})
})

const emit = defineEmits<GridStackEmits>()

const gridRef = ref<HTMLElement>()
const gridInstance = ref<IGridInstance>()

// Provide grid instance for child components (must be at setup top level)
provide('grid-instance', gridInstance)

onMounted(() => {
  if (!gridRef.value) return

  const manager = GridManager.getInstance()
  gridInstance.value = manager.create(gridRef.value, props.options)

  // Setup event listeners
  gridInstance.value.on('added', (item) => {
    emit('added', item)
  })

  gridInstance.value.on('removed', (item) => {
    emit('removed', item)
  })

  gridInstance.value.on('change', (items) => {
    emit('change', items)
    emit('update:modelValue', items)
  })

  gridInstance.value.on('dragstart', (item) => {
    emit('dragstart', item)
  })

  gridInstance.value.on('dragstop', (item) => {
    emit('dragstop', item)
  })

  gridInstance.value.on('resizestart', (item) => {
    emit('resizestart', item)
  })

  gridInstance.value.on('resizestop', (item) => {
    emit('resizestop', item)
  })

  gridInstance.value.on('dropped', (item, data) => {
    emit('dropped', data)
  })
})

onUnmounted(() => {
  if (gridInstance.value) {
    gridInstance.value.destroy()
  }
})

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (!newValue || !gridInstance.value) return
  
  // Load layout from modelValue
  gridInstance.value.load({
    items: newValue
  })
}, { deep: true })

// Expose methods for template refs
defineExpose({
  gridInstance,
  addItem: (element: HTMLElement, options: any) => gridInstance.value?.addItem(element, options),
  removeItem: (id: string) => gridInstance.value?.removeItem(id),
  clear: () => gridInstance.value?.clear(),
  save: () => gridInstance.value?.save(),
  load: (layout: any) => gridInstance.value?.load(layout)
})
</script>

<style>
.ldesign-grid-vue {
  width: 100%;
  height: 100%;
}
</style>













