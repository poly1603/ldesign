<template>
  <div ref="gridRef" class="grid-stack">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue'
import { GridStackCore } from '../core'
import type { GridStackOptions, GridItemOptions } from '../types'

export interface GridStackProps {
  /** 网格配��选项 */
  options?: GridStackOptions
  /** 网格项列表 */
  items?: GridItemOptions[]
  /** 列数 */
  column?: number
  /** 单元格高度 */
  cellHeight?: number | string
  /** 是否启用动画 */
  animate?: boolean
  /** 是否浮动布局 */
  float?: boolean
  /** 是否静态网格 */
  staticGrid?: boolean
}

const props = withDefaults(defineProps<GridStackProps>(), {
  options: () => ({}),
  items: () => [],
  column: 12,
  cellHeight: 70,
  animate: true,
  float: false,
  staticGrid: false
})

const emit = defineEmits<{
  ready: [instance: GridStackCore]
  change: [items: GridItemOptions[]]
  added: [items: GridItemOptions[]]
  removed: [items: GridItemOptions[]]
  dragstart: [item: GridItemOptions]
  drag: [item: GridItemOptions]
  dragstop: [item: GridItemOptions]
  resizestart: [item: GridItemOptions]
  resize: [item: GridItemOptions]
  resizestop: [item: GridItemOptions]
}>()

const gridRef = ref<HTMLElement | null>(null)
const gridInstance = shallowRef<GridStackCore | null>(null)

// 提供给子组件
provide('gridInstance', gridInstance)

// 合并配置
const getOptions = (): GridStackOptions => {
  return {
    column: props.column,
    cellHeight: props.cellHeight,
    animate: props.animate,
    float: props.float,
    staticGrid: props.staticGrid,
    ...props.options
  }
}

// 初始化
const init = () => {
  if (!gridRef.value) return

  try {
    gridInstance.value = new GridStackCore(gridRef.value, getOptions())

    // 绑定事件
    setupEvents()

    // 加载初始项
    if (props.items && props.items.length > 0) {
      gridInstance.value.load(props.items)
    }

    emit('ready', gridInstance.value)
  } catch (error) {
    console.error('GridStack initialization error:', error)
  }
}

// 设置事件监听
const setupEvents = () => {
  if (!gridInstance.value) return

  gridInstance.value.on('change', (event, items) => {
    const gridItems = gridInstance.value?.save() ?? []
    emit('change', gridItems)
  })

  gridInstance.value.on('added', (event, items) => {
    emit('added', items as GridItemOptions[])
  })

  gridInstance.value.on('removed', (event, items) => {
    emit('removed', items as GridItemOptions[])
  })

  gridInstance.value.on('dragstart', (event, item) => {
    emit('dragstart', item as GridItemOptions)
  })

  gridInstance.value.on('drag', (event, item) => {
    emit('drag', item as GridItemOptions)
  })

  gridInstance.value.on('dragstop', (event, item) => {
    emit('dragstop', item as GridItemOptions)
  })

  gridInstance.value.on('resizestart', (event, item) => {
    emit('resizestart', item as GridItemOptions)
  })

  gridInstance.value.on('resize', (event, item) => {
    emit('resize', item as GridItemOptions)
  })

  gridInstance.value.on('resizestop', (event, item) => {
    emit('resizestop', item as GridItemOptions)
  })
}

// 监听 items 变化
watch(() => props.items, (newItems) => {
  if (gridInstance.value && newItems) {
    gridInstance.value.load(newItems, true)
  }
}, { deep: true })

// 监听配置变化
watch(() => props.column, (newColumn) => {
  if (gridInstance.value && newColumn) {
    gridInstance.value.column(newColumn)
  }
})

watch(() => props.staticGrid, (newStatic) => {
  if (gridInstance.value) {
    gridInstance.value.setStatic(newStatic)
  }
})

watch(() => props.animate, (newAnimate) => {
  if (gridInstance.value) {
    gridInstance.value.setAnimation(newAnimate)
  }
})

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  if (gridInstance.value) {
    gridInstance.value.destroy()
    gridInstance.value = null
  }
})

// 暴露方法给父组件
defineExpose({
  instance: gridInstance,
  addWidget: (options: GridItemOptions) => gridInstance.value?.addWidget(options),
  removeWidget: (el: HTMLElement | string) => gridInstance.value?.removeWidget(el),
  update: (el: HTMLElement, options: Partial<GridItemOptions>) => gridInstance.value?.update(el, options),
  save: () => gridInstance.value?.save(),
  load: (items: GridItemOptions[]) => gridInstance.value?.load(items),
  compact: () => gridInstance.value?.compact(),
  enable: () => gridInstance.value?.enable(),
  disable: () => gridInstance.value?.disable()
})
</script>

<style>
/* 基础样式会从 gridstack.min.css 导入 */
.grid-stack {
  position: relative;
}
</style>
