<template>
  <div
    ref="itemRef"
    class="grid-stack-item"
    :gs-id="id"
    :gs-x="x"
    :gs-y="y"
    :gs-w="w"
    :gs-h="h"
    :gs-min-w="minW"
    :gs-max-w="maxW"
    :gs-min-h="minH"
    :gs-max-h="maxH"
    :gs-no-resize="noResize"
    :gs-no-move="noMove"
    :gs-locked="locked"
    :gs-auto-position="autoPosition"
  >
    <div class="grid-stack-item-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, type Ref } from 'vue'
import type { GridStackCore } from '../core'
import type { GridItemOptions } from '../types'

export interface GridStackItemProps extends GridItemOptions {
  id?: string | number
  x?: number
  y?: number
  w?: number
  h?: number
  minW?: number
  maxW?: number
  minH?: number
  maxH?: number
  noResize?: boolean
  noMove?: boolean
  locked?: boolean
  autoPosition?: boolean
}

withDefaults(defineProps<GridStackItemProps>(), {
  w: 1,
  h: 1,
  noResize: false,
  noMove: false,
  locked: false,
  autoPosition: false
})

const itemRef = ref<HTMLElement | null>(null)
const gridInstance = inject<Ref<GridStackCore | null>>('gridInstance')

onMounted(() => {
  // 组件挂载时，GridStack 会自动识别具有 grid-stack-item 类的元素
  // 如果需要手动添加，可以调用 makeWidget
  if (gridInstance?.value && itemRef.value) {
    // GridStack 会自动处理带有 gs-* 属性的元素
    // 但我们可以确保它被正确初始化
    try {
      gridInstance.value.makeWidget(itemRef.value)
    } catch (error) {
      // 如果已经是 widget，会抛出错误，忽略即可
    }
  }
})

onBeforeUnmount(() => {
  // 组件卸载时自动移除
  if (gridInstance?.value && itemRef.value) {
    try {
      gridInstance.value.removeWidget(itemRef.value, true)
    } catch (error) {
      // 忽略错误
    }
  }
})

defineExpose({
  itemRef,
  update: (options: Partial<GridItemOptions>) => {
    if (gridInstance?.value && itemRef.value) {
      gridInstance.value.update(itemRef.value, options)
    }
  },
  lock: () => {
    if (gridInstance?.value && itemRef.value) {
      gridInstance.value.lock(itemRef.value)
    }
  },
  unlock: () => {
    if (gridInstance?.value && itemRef.value) {
      gridInstance.value.unlock(itemRef.value)
    }
  }
})
</script>

<style scoped>
.grid-stack-item-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}
</style>
